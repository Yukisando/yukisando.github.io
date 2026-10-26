# SEO to-do (needs you)

These steps can't be done from the repo; they need your Cloudflare or Google account.

## Cloudflare

- [ ] **Redeploy the coldsnap.fr worker.** Paste `tools/coldsnap-worker/worker.js` into
      *Workers & Pages* > `coldsnap` > *Edit code* > *Deploy*. Until then,
      `coldsnap.fr/index.html` doesn't redirect to `coldsnap.fr/`.

## Google Search Console

- [ ] Add `coldsnap.fr` as a **Domain** property (verify with the DNS TXT record
      Search Console gives you, added in Cloudflare *DNS*).
- [ ] Submit both sitemaps: `https://coldsnap.fr/sitemap.xml` and
      `https://nathandecastro.com/sitemap.xml`.
- [ ] URL Inspection > *Request indexing* on `https://coldsnap.fr/` and
      `https://nathandecastro.com/`.
- [ ] Ignore the "Page with redirect" report as long as it only lists forwarding
      addresses: `http://` or `www.` variants, `nathandecastro.com/coldsnap/`,
      `nathandecastro.com/Portfolio/`. Those are meant to stay out of the index.

## Optional: real 301 for nathandecastro.com/coldsnap/

GitHub Pages can't send server redirects, so `nathandecastro.com/coldsnap/` forwards
visitors with JavaScript (plus a canonical tag). A 301 is a stronger signal, but it
needs nathandecastro.com's DNS on Cloudflare, plus a worker change so the worker's
own fetches of `/coldsnap/` aren't redirected too. Ask Claude to set it up if you
move the DNS.
