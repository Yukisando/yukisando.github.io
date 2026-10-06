# coldsnap.fr worker

`worker.js` is a Cloudflare Worker that serves `https://nathandecastro.com/coldsnap/`
at `https://coldsnap.fr/`. The ColdSnap page stays in this repo (`coldsnap/`); the
worker maps `coldsnap.fr/<path>` to `nathandecastro.com/coldsnap/<path>` and
redirects `www.coldsnap.fr` and `http://` to `https://coldsnap.fr`.

Because of that mapping, files in `coldsnap/` must reference each other with
relative paths (`css/coldsnap.css`, `assets/...`), and shared site files with
absolute `https://nathandecastro.com/...` URLs. On nathandecastro.com the page
forwards visitors to coldsnap.fr.

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

To update the worker, paste the new `worker.js` in the dashboard editor again.
