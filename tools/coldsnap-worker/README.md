# coldsnap.fr worker

`worker.js` is a Cloudflare Worker that serves `https://nathandecastro.com/coldsnap/`
at `https://coldsnap.fr/`. The ColdSnap page stays in this repo (`coldsnap/`); the
worker maps `coldsnap.fr/<path>` to `nathandecastro.com/coldsnap/<path>` and
redirects `www.coldsnap.fr` and `http://` to `https://coldsnap.fr`.

Files in `coldsnap/` reference each other with root paths (`/css/coldsnap.css`,
`/assets/...`): at coldsnap.fr the root is the `coldsnap/` folder, and both the French
page (`/`) and the English page (`/en/`) share them. Shared site files use absolute
`https://nathandecastro.com/...` URLs. On nathandecastro.com the page forwards visitors
to coldsnap.fr. To preview locally, serve the folder as the root:
`python -m http.server 8765 --directory coldsnap`.

The worker also adds the security headers (HSTS, CSP, nosniff, Referrer-Policy),
caches `?v=` files for a year, serves the shared CGV and privacy pages at
`/legal/cgv/` and `/legal/confidentialite/`, shows `coldsnap/404.html` for unknown
pages, and handles the contact form at `POST /api/contact` (mailed through Brevo).

## Deploy

From this folder, with `CLOUDFLARE_API_TOKEN` (permissions: Account / Workers Scripts:
Edit, Account / Account Settings: Read, Zone / DNS: Edit on coldsnap.fr) and
`CLOUDFLARE_ACCOUNT_ID` set:

    npx wrangler@3 deploy
    npx wrangler@3 secret put BREVO_API_KEY    # once, and when the key changes

`CONTACT_TO` (in `wrangler.toml`) must be a sender verified in Brevo. Deploy the
worker before pushing pages that link to `/legal/cgv/` or post to `/api/contact`.

## Setup

1. **Cloudflare**: create a free account, *Add a domain* > `coldsnap.fr`, Free plan.
   Cloudflare imports the existing DNS records. Delete any `A`/`AAAA`/`CNAME`
   records for `coldsnap.fr` and `www` (one.com parking); keep `MX`/`TXT` records
   if one.com hosts email for the domain.
2. **one.com**: *DNS settings* > *Name servers* > use custom name servers and
   enter the two Cloudflare gives you. Turn off any one.com web forwarding.
   Wait until Cloudflare shows the domain as *Active*.
3. **Worker**: *Workers & Pages* > *Create* > *Start with Hello World*, name it
   `coldsnap`, *Deploy*, then *Edit code*, paste `worker.js`, *Deploy*.
4. **Domains**: in the worker, *Settings* > *Domains & Routes* > *Add* >
   *Custom domain*: add `coldsnap.fr`, then `www.coldsnap.fr`. Cloudflare creates
   the DNS records and certificates.
5. **Email** (if one.com does not host it): *Email* > *Email Routing* > enable,
   add a route `contact@coldsnap.fr` to your inbox and confirm the verification
   email. Cloudflare adds the `MX`/SPF records.
6. Check `https://coldsnap.fr/`, then push this repo so nathandecastro.com/coldsnap/
   starts forwarding to it.

To update the worker without wrangler, paste `worker.js` in the dashboard editor and add the `BREVO_API_KEY` secret under Settings > Variables.
