# Email signature

Nathan's signature lives at https://coldsnap.fr/assets/email/signature.html (source: `coldsnap/assets/email/signature.html`): open it, "Copy the signature", paste into Gmail or Outlook. Claude's `mail.py` and the dashboard's draft sender read it from that URL (between the SIGNATURE markers).

Its text and buttons are PNGs drawn in Cooldown Sans, because mail clients drop web fonts. After changing the wording, colours or sizes in `render.html`, run `python tools/email-signature/render.py` (needs Edge), update the image sizes it prints in `signature.html`, and push to master.
