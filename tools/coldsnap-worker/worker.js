// Cloudflare Worker that serves https://nathandecastro.com/coldsnap/ at https://coldsnap.fr/.
// coldsnap.fr/<path> is fetched from nathandecastro.com/coldsnap/<path>, so the
// ColdSnap page keeps living in this repo. See README.md for deployment.
//
// It also:
// - adds the security headers GitHub Pages cannot send (HSTS, CSP, nosniff...);
// - sends first-time visitors to the page in their language (Accept-Language), and
//   returning ones to the language they picked (coldsnap-lang cookie);
// - keeps pages in Cloudflare's edge cache, versioned files (?v=...) for a year in
//   browsers, images and fonts for 30 days;
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

// Pages cached at the edge for 10 minutes, like GitHub Pages' own max-age.
const EDGE_TTL = 600;
// Images and fonts without ?v=: 30 days. Replace a file in place = bump its ?v= or rename it.
const STATIC_MAX_AGE = 60 * 60 * 24 * 30;
const STATIC_PATH = /^\/(assets|fonts)\/|^\/favicon\.ico$/;

const LANG_COOKIE = 'coldsnap-lang';
const BOT = /bot|crawl|spider|slurp|lighthouse|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|curl|wget/i;

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

// No inline scripts, handlers or style attributes on coldsnap.fr pages: everything is in
// files (js/boot.js runs first in <head>). Styles set from JavaScript go through the CSSOM
// (element.style), which the CSP allows. Everything is limited to this site.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'self' https://*.coldsnap.fr",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

// The shared legal pages (CGV, privacy) come from nathandecastro.com, load their files from
// there and use inline scripts and styles of their own.
const LEGAL_CSP = CSP
  .replace("script-src 'self'", `script-src 'self' 'unsafe-inline' ${ORIGIN}`)
  .replace("style-src 'self'", `style-src 'self' 'unsafe-inline' ${ORIGIN}`)
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

    // Near-miss project addresses (/projects/, /projet/maya, /en/projets/maya) get a 301 to
    // the real page: English words or /en/ go to /en/projects/, French ones to /projets/.
    const alias = url.pathname.match(/^\/(en\/)?(projets?|projects?)(?:\/(.*))?$/i);
    if (alias) {
      const english = Boolean(alias[1]) || /^projects?$/i.test(alias[2]);
      const rest = (alias[3] || '').replace(/\/+$/, '').toLowerCase();
      const target = (english ? '/en/projects/' : '/projets/') + (rest ? rest + '/' : '');
      if (target !== url.pathname) {
        url.pathname = target;
        return Response.redirect(url.toString(), 301);
      }
    }

    const langRedirect = languageRedirect(request, url);
    if (langRedirect) return langRedirect;

    const upstream = new URL(ORIGIN_PATH + url.pathname + url.search, ORIGIN);
    const response = await fetch(upstream, {
      method: request.method,
      redirect: 'manual',
      cf: { cacheEverything: true, cacheTtl: EDGE_TTL },
    });

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
    } else if (response.ok && STATIC_PATH.test(url.pathname)) {
      result.headers.set('Cache-Control', `public, max-age=${STATIC_MAX_AGE}, stale-while-revalidate=86400`);
    } else if ((result.headers.get('Content-Type') || '').includes('text/html')) {
      // Pages change with every push: browsers keep them 10 minutes, like GitHub Pages
      // (Cloudflare's default browser TTL would make it 4 hours). The language redirect
      // depends on the cookie, so a browser must not reuse a page cached under another choice.
      result.headers.set('Cache-Control', `public, max-age=${EDGE_TTL}`);
      result.headers.append('Vary', 'Cookie');
    }
    return result;
  },
};

// ── Language ─────────────────────────────────────────────────
// Each page exists in French (/, /projets/<id>/) and English (/en/, /en/projects/<id>/).
// Deciding here, before the page is sent, costs one short redirect instead of loading
// the French page and then the English one. Search engines send no Accept-Language
// and no cookie, so they always get the page they asked for and find its twin through
// hreflang.
function pageLang(path) {
  if (path === '/' || path.startsWith('/projets/')) return 'fr';
  if (path === '/en/' || path.startsWith('/en/projects/')) return 'en';
  return null; // legal pages, files: one version only
}

function twinPath(path, lang) {
  if (lang === 'en') return path === '/' ? '/en/' : path.replace(/^\/projets\//, '/en/projects/');
  return path === '/en/' ? '/' : path.replace(/^\/en\/projects\//, '/projets/');
}

function readCookie(request, name) {
  for (const part of (request.headers.get('Cookie') || '').split(';')) {
    const [key, value] = part.trim().split('=');
    if (key === name && (value === 'fr' || value === 'en')) return value;
  }
  return null;
}

// First language of Accept-Language (highest q): French if it is French, otherwise
// English, the site's only other language. No header: no choice.
function browserLang(request) {
  const header = request.headers.get('Accept-Language');
  if (!header) return null;
  const best = header.split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().toLowerCase().split(';');
      const q = params.map(p => p.trim()).find(p => p.startsWith('q='));
      return { tag, q: q ? Number(q.slice(2)) || 0 : 1, i };
    })
    .filter(l => l.tag && l.tag !== '*' && l.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i)[0];
  if (!best) return null;
  return best.tag.startsWith('fr') ? 'fr' : 'en';
}

const langCookie = lang => `${LANG_COOKIE}=${lang}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;

function redirectTo(url, lang, setCookie) {
  const headers = new Headers({ Location: url.toString(), 'Cache-Control': 'private, no-store', Vary: 'Accept-Language, Cookie' });
  if (setCookie) headers.append('Set-Cookie', langCookie(lang));
  return new Response(null, { status: 302, headers });
}

function languageRedirect(request, url) {
  const page = pageLang(url.pathname);
  if (!page || request.method !== 'GET') return null;

  // ?lang=fr|en (links from the apps, the arcade): remember it and show that page.
  const asked = url.searchParams.get('lang');
  if (asked === 'fr' || asked === 'en') {
    const target = new URL(url);
    target.searchParams.delete('lang');
    target.pathname = twinPath(url.pathname, asked);
    return redirectTo(target, asked, true);
  }

  if (BOT.test(request.headers.get('User-Agent') || '')) return null;
  const want = readCookie(request, LANG_COOKIE) || browserLang(request);
  if (!want || want === page) return null;
  const target = new URL(url);
  target.pathname = twinPath(url.pathname, want);
  return redirectTo(target, want, false);
}

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
