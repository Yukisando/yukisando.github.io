// Cloudflare Worker that serves https://nathandecastro.com/coldsnap/ at https://coldsnap.fr/.
// coldsnap.fr/<path> is fetched from nathandecastro.com/coldsnap/<path>, so the
// ColdSnap page keeps living in this repo. See README.md for deployment.
//
// It also:
// - adds the security headers GitHub Pages cannot send (HSTS, CSP, nosniff...);
// - caches versioned files (?v=...) for a year;
// - serves the shared legal pages (CGV, privacy) under coldsnap.fr/legal/;
// - receives the contact form (POST /api/contact) and mails it through Brevo.

const CANONICAL_HOST = 'coldsnap.fr';
const ORIGIN = 'https://nathandecastro.com';
const ORIGIN_PATH = '/coldsnap';

// coldsnap.fr/legal/<name>/ shows the shared legal page from nathandecastro.com.
const LEGAL_PAGES = {
  '/legal/cgv/': '/apps/generic/cgv/',
  '/legal/confidentialite/': '/apps/generic/privacy/',
};

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

// The pages use inline scripts and onclick handlers, hence 'unsafe-inline'.
// Everything else is limited to this site.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'self' https://*.coldsnap.fr",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

// The legal pages load their styles and scripts from nathandecastro.com.
const LEGAL_CSP = CSP
  .replace("script-src 'self'", `script-src 'self' ${ORIGIN}`)
  .replace("style-src 'self'", `style-src 'self' ${ORIGIN}`)
  .replace("img-src 'self'", `img-src 'self' ${ORIGIN}`)
  .replace("font-src 'self'", `font-src 'self' ${ORIGIN}`);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // www.coldsnap.fr and plain http go to https://coldsnap.fr.
    if (url.hostname !== CANONICAL_HOST || url.protocol !== 'https:') {
      url.hostname = CANONICAL_HOST;
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/api/contact') {
      return withSecurity(await handleContact(request, env, url), CSP);
    }

    // /index.html and /legal/index.html duplicate / and /legal/; send them to the
    // canonical URL so search engines index one address per page.
    if (url.pathname.endsWith('/index.html')) {
      url.pathname = url.pathname.slice(0, -'index.html'.length);
      return Response.redirect(url.toString(), 301);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }

    const legalPath = LEGAL_PAGES[url.pathname] || LEGAL_PAGES[url.pathname + '/'];
    if (legalPath) {
      if (!url.pathname.endsWith('/')) {
        url.pathname += '/';
        return Response.redirect(url.toString(), 301);
      }
      return withSecurity(await fetchLegalPage(request, legalPath, url.search), LEGAL_CSP);
    }

    const upstream = new URL(ORIGIN_PATH + url.pathname + url.search, ORIGIN);
    const response = await fetch(upstream, { method: request.method, redirect: 'manual' });

    // GitHub Pages redirects (e.g. adding a trailing slash) point at nathandecastro.com;
    // rewrite them so the visitor stays on coldsnap.fr.
    const location = response.headers.get('Location');
    if (location) {
      const target = new URL(location, upstream);
      if (target.origin === ORIGIN && target.pathname.startsWith(ORIGIN_PATH + '/')) {
        const headers = new Headers(response.headers);
        const path = target.pathname.slice(ORIGIN_PATH.length);
        headers.set('Location', `https://${CANONICAL_HOST}${path}${target.search}${target.hash}`);
        return withSecurity(new Response(response.body, { status: response.status, headers }), CSP);
      }
    }

    // Unknown pages get the ColdSnap 404 page instead of the GitHub Pages one.
    if (response.status === 404 && (request.headers.get('Accept') || '').includes('text/html')) {
      const page = await fetch(new URL(ORIGIN_PATH + '/404.html', ORIGIN));
      if (page.ok) {
        return withSecurity(new Response(page.body, { status: 404, headers: page.headers }), CSP);
      }
    }

    const result = withSecurity(response, CSP);
    // Files referenced with a ?v= version change URL whenever they change.
    if (response.ok && url.searchParams.has('v')) {
      result.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    return result;
  },
};

function withSecurity(response, csp) {
  const result = new Response(response.body, response);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) result.headers.set(name, value);
  if ((result.headers.get('Content-Type') || '').includes('text/html')) {
    result.headers.set('Content-Security-Policy', csp);
  }
  return result;
}

// Root-relative links in the shared legal pages (/css/..., /apps/...) belong to
// nathandecastro.com, not to coldsnap.fr: make them absolute.
async function fetchLegalPage(request, path, search) {
  const response = await fetch(new URL(path + search, ORIGIN), { method: request.method });
  const absolute = attr => ({
    element(el) {
      const value = el.getAttribute(attr);
      if (value && value.startsWith('/') && !value.startsWith('//')) el.setAttribute(attr, ORIGIN + value);
    },
  });
  return new HTMLRewriter()
    .on('link[href]', absolute('href'))
    .on('a[href]', absolute('href'))
    .on('script[src]', absolute('src'))
    .on('img[src]', absolute('src'))
    .transform(response);
}

// ── Contact form ─────────────────────────────────────────────
// Works with fetch (JSON reply) and as a plain HTML form (redirect back to the page).
// Secret: BREVO_API_KEY. Var: CONTACT_TO (defaults to contact@coldsnap.fr), which must
// be a sender verified in Brevo.

const LIMITS = { name: 120, email: 200, org: 160, audience: 60, reply: 20, phone: 40, slots: 400, message: 5000 };

async function handleContact(request, env, url) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  }
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'fr';
  const reply = (status) => {
    if (wantsJson) {
      const code = { sent: 200, invalid: 400 }[status] || 503;
      return Response.json({ status }, { status: code });
    }
    return Response.redirect(`https://${CANONICAL_HOST}${lang === 'en' ? '/en/' : '/'}?contact=${status}#contact`, 303);
  };

  // Only accept posts from this site.
  const origin = request.headers.get('Origin');
  if (origin && origin !== `https://${CANONICAL_HOST}`) return reply('invalid');

  let data;
  try {
    const type = request.headers.get('Content-Type') || '';
    data = type.includes('application/json')
      ? await request.json()
      : Object.fromEntries(await request.formData());
  } catch (e) {
    return reply('invalid');
  }

  // Bots: the hidden "website" field is filled, or the form came back in under 3 seconds.
  // They get a normal "sent" answer so they do not retry.
  const started = Number(data.started) || 0;
  if (data.website || (started && Date.now() - started < 3000)) return reply('sent');

  const field = (name) => String(data[name] || '').trim().slice(0, LIMITS[name]);
  const form = {
    name: field('name'),
    email: field('email'),
    org: field('org'),
    audience: field('audience'),
    reply: field('reply'),
    phone: field('phone'),
    slots: field('slots'),
    message: field('message'),
  };
  if (!form.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || form.message.length < 10) {
    return reply('invalid');
  }
  if (!env.BREVO_API_KEY) return reply('unavailable');

  const lines = [
    `Nom : ${form.name}`,
    `E-mail : ${form.email}`,
    form.org ? `Structure : ${form.org}` : null,
    form.audience ? `Type : ${form.audience}` : null,
    form.reply ? `Réponse souhaitée : ${form.reply}` : null,
    form.phone ? `Téléphone : ${form.phone}` : null,
    form.slots ? `Créneaux pour un appel : ${form.slots}` : null,
    `Page : ${lang === 'en' ? 'anglaise' : 'française'}`,
    '',
    form.message,
  ].filter(line => line !== null);
  const to = env.CONTACT_TO || 'contact@coldsnap.fr';

  const sent = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Site ColdSnap', email: to },
      to: [{ email: to }],
      replyTo: { email: form.email, name: form.name },
      subject: `Nouveau projet : ${form.name}${form.org ? ' (' + form.org + ')' : ''}`,
      textContent: lines.join('\n'),
    }),
  });
  return reply(sent.ok ? 'sent' : 'unavailable');
}
