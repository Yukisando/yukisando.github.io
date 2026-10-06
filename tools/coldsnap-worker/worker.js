// Cloudflare Worker that serves https://nathandecastro.com/coldsnap/ at https://coldsnap.fr/.
// coldsnap.fr/<path> is fetched from nathandecastro.com/coldsnap/<path>, so the
// ColdSnap page keeps living in this repo. See README.md for deployment.

const CANONICAL_HOST = 'coldsnap.fr';
const ORIGIN = 'https://nathandecastro.com';
const ORIGIN_PATH = '/coldsnap';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // www.coldsnap.fr and plain http go to https://coldsnap.fr.
    if (url.hostname !== CANONICAL_HOST || url.protocol !== 'https:') {
      url.hostname = CANONICAL_HOST;
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
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
        return new Response(response.body, { status: response.status, headers });
      }
    }

    return response;
  },
};
