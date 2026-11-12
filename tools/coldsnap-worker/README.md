# coldsnap.fr worker

`worker.js` is the Cloudflare Worker behind `https://coldsnap.fr/`. The site's files are the
repo's `coldsnap/` folder, uploaded with the worker as
[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
(`[assets]` in `wrangler.toml`, binding `ASSETS`). Nothing is fetched from GitHub Pages any
more, except the shared legal pages (below). `www.coldsnap.fr` and `http://` redirect to
`https://coldsnap.fr`.

Files in `coldsnap/` reference each other with root paths (`/css/coldsnap.css`,
`/assets/...`): at coldsnap.fr the root is the `coldsnap/` folder, and both the French
page (`/`) and the English page (`/en/`) share them. Shared site files use absolute
`https://nathandecastro.com/...` URLs. To preview locally, serve the folder as the root:
`python -m http.server 8765 --directory coldsnap`.

## What runs the worker

Files under `/assets/`, `/fonts/`, `/css/`, `/js/`, `/data/` and `/vendor/` are served by
Cloudflare straight from the uploaded files, without running the worker (free and
unlimited; `run_worker_first` in `wrangler.toml`). Their headers come from
`coldsnap/_headers`: the security headers, images and fonts for 30 days in browsers
(replace a file in place = bump its `?v=` or rename it), and CSS, JS and data for a year
(`immutable`), because pages only ever link them with a `?v=` version. Change one of those
files = bump its `?v=` (the build does it for the CSS).

Every other request runs the worker first (free plan: 100k a day): pages, `/api/contact`,
`/legal/`, `robots.txt`, `sitemap.xml`, redirects and unknown addresses. For pages it:

- picks the language before the page is sent: a visitor with the `coldsnap-lang` cookie
  (set by the FR/EN switch or a `?lang=fr|en` link) gets that language, a first-time
  visitor gets French if their browser's first language is French and English otherwise.
  Crawlers (no `Accept-Language`, bot user agent) are never redirected and find the twin
  page through hreflang;
- maps `/dir/` to `dir/index.html` and answers `/dir` with a 301 to `/dir/`, as GitHub
  Pages did (`html_handling = "none"`, so `/404.html` and the Google verification file keep
  their exact addresses); `/index.html` gets a 301 to `/`;
- sends 301s for near-miss project addresses (`/projects/maya`, `/en/projets/maya`);
- adds the security headers and the CSP, the Cloudflare Web Analytics beacon, and the
  signed time in the contact form (below);
- sends pages with `Cache-Control: public, max-age=0, must-revalidate` and no edge cache,
  so a deploy shows at once;
- shows `coldsnap/404.html` (status 404) for unknown pages.

The legal pages (`/legal/`, `/legal/cgv/`, `/legal/confidentialite/`) are static files in
`coldsnap/legal/`. It also handles the contact form at `POST /api/contact` (mailed through Brevo).

## Deploy

Pushing to `master` deploys: `.github/workflows/deploy-coldsnap.yml` runs
`npx wrangler@4 deploy` here whenever `coldsnap/` or this folder changes (it can also be run
by hand from the Actions tab). It needs the repo secret `CLOUDFLARE_API_TOKEN` (Settings >
Secrets and variables > Actions; permissions: Account / Workers Scripts: Edit, Account /
Account Settings: Read, Zone / DNS: Edit on coldsnap.fr). The worker's secrets stay on
Cloudflare across deploys.

By hand, from this folder, with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` set:

    npx wrangler@4 deploy                       # coldsnap.fr
    npx wrangler@4 deploy --env next            # test copy: https://coldsnap-next.coldsnap-pro.workers.dev
    npx wrangler@4 secret put BREVO_API_KEY     # once, and when the key changes
    npx wrangler@4 secret put FORM_SECRET       # once: any long random string, e.g. `openssl rand -hex 32`

`CONTACT_TO` (in `wrangler.toml`) must be a sender verified in Brevo. The test copy
(`[env.next]`) has its own secrets; without `BREVO_API_KEY` its form answers "unavailable"
instead of mailing.

Roll back: `npx wrangler@4 rollback` (previous version, files included), or the dashboard:
*Workers & Pages* > `coldsnap` > *Deployments* > pick a version > *Deploy*.

### Contact form spam

The worker writes the time each page is served, signed with `FORM_SECRET`, into the
form's hidden `started` field. A post is dropped (with a normal "sent" answer, so bots
do not retry) when it has no `Origin` header, fills the hidden `website` field, has no
valid signed time, or comes back less than 3 seconds after the page was served. A page
open for more than a day gets "reload the page". Messages with links still arrive, with
`[lien]` in the subject and the linked domains listed: check them before clicking.
Without `FORM_SECRET` the form still works, using the time set by `contact.js`, but
visitors without JavaScript are dropped. Pages served with a signed time drop their
`ETag` and `Last-Modified`, so a browser never keeps an old time through a 304.

Pages and worker now deploy together, so a change to `contact.js` and to the worker can go
in the same push.

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
6. Deploy with wrangler (above): the site's files are uploaded with the worker, so the
   dashboard editor alone cannot deploy it. Then add the `CLOUDFLARE_API_TOKEN` repo secret
   so pushes deploy.

Old `nathandecastro.com/coldsnap/...` links: `coldsnap/` is excluded from the GitHub Pages
site (`_config.yml`); the stub pages in `_coldsnap_redirects/` and the root `404.html`
forward them to the same path on coldsnap.fr.
