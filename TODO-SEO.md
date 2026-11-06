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

## Google Search Console (you: sign in to Google)

- [ ] Add `coldsnap.fr` as a **Domain** property. Search Console gives a DNS TXT record:
      paste its value in a Claude chat and Claude adds it in Cloudflare (the token can edit
      DNS), or add it yourself under Cloudflare *DNS*.
- [ ] Submit both sitemaps: `https://coldsnap.fr/sitemap.xml` and
      `https://nathandecastro.com/sitemap.xml`.
- [ ] URL Inspection > *Request indexing* on `https://coldsnap.fr/` and
      `https://coldsnap.fr/en/`.
- [ ] Ignore the "Page with redirect" report as long as it only lists forwarding
      addresses: `http://` or `www.` variants, `?lang=` links, `nathandecastro.com/coldsnap/`,
      `nathandecastro.com/Portfolio/`. Those are meant to stay out of the index.

## Cloudflare token (optional)

- [ ] Add *Zone / Cache Purge* to the API token in the vault (`claude-skills`), so Claude can
      empty the edge cache right after a push. Without it, a push shows up within 10 minutes.

## Left on purpose (ask Claude if you want them)

- CSP still allows `'unsafe-inline'`: about 12 `onclick` attributes, the inline scripts of
  the pages, 404 and legal page would have to move to files. Low risk today (no user content
  on the site), real work to change.
- CSS not minified: about 4 KB, and Cloudflare already compresses it.
- New pages per service ("installation interactive musée", "application communale"...) to
  rank on more searches: needs your text.

## Optional: real 301 for nathandecastro.com/coldsnap/

GitHub Pages can't send server redirects, so `nathandecastro.com/coldsnap/` forwards
visitors with JavaScript (plus a canonical tag). A 301 is a stronger signal, but it
needs nathandecastro.com's DNS on Cloudflare, plus a worker change so the worker's
own fetches of `/coldsnap/` aren't redirected too. Ask Claude to set it up if you
move the DNS.
