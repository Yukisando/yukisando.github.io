# Email signature

Nathan's signature lives at https://coldsnap.fr/assets/email/signature.html (source: `coldsnap/assets/email/signature.html`): open it, "Copy the signature", paste into Gmail or Outlook. Claude's `mail.py` and the dashboard's draft sender read it from that URL (between the SIGNATURE markers).

Each card is **pictures only** (2026-11-25): the whole card (cream background, logo, Cooldown text, buttons) is drawn by `render.html` and cut into four slices that tile exactly: the top and the three buttons, each its own link. Why:
- mail clients drop web fonts, so text has to be a picture to show in Cooldown;
- dark mode (Outlook mobile, Gmail apps) recolours HTML backgrounds and text but never pictures, so the card can't turn into dark text on a dark card;
- the slices sit in percent-width cells, so on a narrow screen the whole card shrinks as one piece instead of squeezing the logo.

To change wording, colours or sizes: edit `render.html`, run `python tools/email-signature/render.py` (needs Edge). It writes the `sig-<card>-*.png` slices and rewrites the tables in `signature.html` itself, with a `?v=` taken from the pictures' bytes (Gmail and Outlook cache images by URL). Push to master, then paste the signature again in Gmail/Outlook.

The older `sig-text/phone/mail/site/w-text.png` stay online: emails already sent still point at them.
