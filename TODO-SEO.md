# SEO to-do (needs you)

Audit of 2026-11-06. Everything that could be done from the repo and the Cloudflare API is
done and live (worker redeployed, site pushed). What is left needs your Google account or a
decision.

## Done on 2026-11-06

- Language: the worker picks the page before it is sent (`coldsnap-lang` cookie, else the
  browser's first language). The JavaScript redirect that loaded the French page and then
  the English one is gone. Crawlers are never redirected.
- Pages are kept 10 minutes in Cloudflare's edge cache (faster first byte); images and fonts
  30 days in browsers instead of 4 hours.
- Hero cards move with `transform`: desktop layout shift 0.127 -> 0.004.
- H1 carries "Studio de gamification"; 1200x630 share images (FR and EN); client logos have
  sizes; "Learn More" link renamed; blurred viewer backdrop uses the small copy.
- Lighthouse SEO 92 -> 100 (desktop and mobile).
- `coldsnap.fr/index.html` redirects to `/` (worker deployed).

## Done on 2026-11-09

- No inline scripts, `onclick` or `style=""` left on coldsnap.fr pages (`js/boot.js`,
  `lost.js`, `legal.js`); the worker's CSP no longer allows `'unsafe-inline'` (except on the
  shared CGV/privacy pages from nathandecastro.com).
- The build minifies `coldsnap.css` into `coldsnap.min.css` with a content-hash `?v=`.
- Lighthouse (FR, live): desktop 98/100/100/100, mobile 95/100/100/100.

## Google Search Console (you: signed in to Google)

The Domain property exists (2026-11-09 export: 4 indexed URLs, 64 impressions on the home).

- [ ] *Sitemaps*: submit `https://coldsnap.fr/sitemap.xml` and
      `https://nathandecastro.com/sitemap.xml`.
- [ ] URL Inspection > *Request indexing* on `https://coldsnap.fr/en/`,
      `https://coldsnap.fr/projets/` and `https://coldsnap.fr/en/projects/` (the 46 project
      pages are not indexed yet; the sitemap lists them).
- [x] `seba-admin.coldsnap.fr`: removal requested (2026-11-09). The old subdomain no longer
      resolves and the portal now at `seba.coldsnap.fr/dashboard` is `noindex` since 2026-11-04.
- [ ] Deploy the admin `noindex` committed on 2026-11-09 (Claude is not allowed to deploy to
      production). Then push both repos.
      `cd ~/Documents/Projects/Badalone && firebase deploy --only apphosting --project badalone`
      `cd ~/Documents/Projects/Maya && firebase deploy --only apphosting --project maya-83d82`
      Badalone: whole `/dashboard` portal. Maya: `/login`, `/dashboard`, `/api` only (the
      public pages and the app stay indexable).
- [ ] Exploreum's portal (`exploreum.valbilon.ch/dashboard`) has no `noindex` either: client
      domain, ask Valbilon before changing it.

Legal pages (privacy, terms, CGV, charter, delete-account, mentions légales) are `noindex,
follow` since 2026-11-09 and out of both sitemaps: they stay reachable for the stores.
- [ ] Recheck *Pages* > *Why pages aren't indexed* in a week. "Discovered, currently not
      indexed" is normal for a new site; anything else, show it to Claude.
- [ ] Ignore the "Page with redirect" report as long as it only lists forwarding
      addresses: `http://` or `www.` variants, `?lang=` links, `nathandecastro.com/coldsnap/`,
      `nathandecastro.com/Portfolio/`. Those are meant to stay out of the index.

## Google Business Profile

- [ ] French profile in review (2026-11-09). Once live: website `https://coldsnap.fr/`, same
      name and phone as the site, photos of installations, then send Claude the profile link
      (it goes in the site's Organization `sameAs`). Ask past clients for reviews.

## Left on purpose

- New pages per service ("installation interactive musée", "application communale"...) to
  rank on more searches: needs your text.
- Links from clients' sites and directories (Pages Jaunes, Malt, LinkedIn, store developer
  pages) pointing to coldsnap.fr.

## Optional: real 301 for nathandecastro.com/coldsnap/

GitHub Pages can't send server redirects, so `nathandecastro.com/coldsnap/` forwards
visitors with JavaScript (plus a canonical tag). A 301 is a stronger signal, but it
needs nathandecastro.com's DNS on Cloudflare, plus a worker change so the worker's
own fetches of `/coldsnap/` aren't redirected too. Ask Claude to set it up if you
move the DNS.
