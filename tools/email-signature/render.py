"""Render the email signatures as picture-only cards and write them into signature.html.

    python tools/email-signature/render.py

Why pictures only: Gmail and Outlook drop web fonts, and dark mode (Outlook mobile, the Gmail apps)
recolours HTML backgrounds and text but never images. So each card is drawn whole by Edge (headless)
from render.html at 2x, then cut into four slices that tile exactly: the top (logo and text) and the
three buttons, each slice its own link. The slices sit in percent-width cells, so on a narrow screen
the whole card shrinks as one piece instead of squeezing the logo.

Writes coldsnap/assets/email/sig-<card>-<slice>.png, then rewrites the tables between the markers in
coldsnap/assets/email/signature.html, with a ?v= taken from the pictures' bytes so mail clients never
show a cached old version.
"""
import hashlib
import json
import pathlib
import re
import subprocess
import time

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "coldsnap" / "assets" / "email"
SIG = OUT / "signature.html"
BASE = "https://coldsnap.fr/assets/email/"
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PAGE = (HERE / "render.html").as_uri()
SCALE = 2
W, H = 640, 640

TAG = "Educational games, mobile &amp; web apps, software you'll enjoy using."
CARDS = {  # card id in render.html -> (markers in signature.html, alt text of the top slice)
    "nathan": ("SIGNATURE", f"Nathan de Castro, Founder &amp; Full-Stack Developer, ColdSnap. {TAG}"),
    "winston": ("WINSTON SIGNATURE", f"Winston, ColdSnap. {TAG}"),
}
BUTTONS = [  # (slice name, link, alt), in the order of the buttons in render.html
    ("phone", "tel:+33627648028", "+33 6 27 64 80 28"),
    ("mail", "mailto:contact@coldsnap.fr", "contact@coldsnap.fr"),
    ("site", "https://coldsnap.fr", "coldsnap.fr"),
]
CELL = "padding:0;font-size:0;line-height:0;"
IMG = "display:block;width:100%;height:auto;border:0;"

common = [EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=4000",
          f"--window-size={W},{H}", f"--force-device-scale-factor={SCALE}", "--allow-file-access-from-files"]
dom = subprocess.run(common + ["--dump-dom", PAGE], capture_output=True, text=True, timeout=60).stdout
rects = json.loads(re.search(r'<pre id="rects"[^>]*>(.*?)</pre>', dom, re.S).group(1).replace("&quot;", '"'))
if not rects.pop("font"):
    raise SystemExit("Cooldown Sans did not load: check the font path in render.html")

shot = HERE / "_shot.png"
shot.unlink(missing_ok=True)
subprocess.run(common + ["--default-background-color=00000000", f"--screenshot={shot}", PAGE], capture_output=True, timeout=60)
for _ in range(20):
    if shot.exists():
        break
    time.sleep(0.5)
img = Image.open(shot).convert("RGBA")
shot.unlink()


def px(v):
    return round(v * SCALE)


def link(href, src, w, h, alt):
    return (f'<a href="{href}" style="text-decoration:none;"><img src="{src}" width="{w}" height="{h}" '
            f'alt="{alt}" style="{IMG}"></a>')


html = SIG.read_text(encoding="utf-8")
for card, (marker, alt) in CARDS.items():
    c, pills = rects[card]["card"], rects[card]["pills"]
    x0, y0 = px(c["x"]), px(c["y"])
    x1, y1 = px(c["x"] + c["w"]), px(c["y"] + c["h"])
    ycut = px(pills[0]["y"])
    # Cut the button row in the middle of each gap, so every slice holds one whole button.
    xs = [x0] + [px((a["x"] + a["w"] + b["x"]) / 2) for a, b in zip(pills, pills[1:])] + [x1]
    pieces = {"top": img.crop((x0, y0, x1, ycut))}
    for i, (name, _, _) in enumerate(BUTTONS):
        pieces[name] = img.crop((xs[i], ycut, xs[i + 1], y1))

    files = {}
    for name, piece in pieces.items():
        path = OUT / f"sig-{card}-{name}.png"
        piece.save(path, optimize=True)
        files[name] = path
    ver = hashlib.sha1(b"".join(p.read_bytes() for p in files.values())).hexdigest()[:8]
    src = {n: f"{BASE}{p.name}?v={ver}" for n, p in files.items()}

    cw, th, bh = (x1 - x0) // SCALE, (ycut - y0) // SCALE, (y1 - ycut) // SCALE
    cells = []
    for i, (name, href, balt) in enumerate(BUTTONS):
        sw = (xs[i + 1] - xs[i]) / SCALE
        pct = f"{100 * (xs[i + 1] - xs[i]) / (x1 - x0):.3f}"
        cells.append(f'    <td width="{pct}%" style="width:{pct}%;{CELL}">'
                     f'{link(href, src[name], round(sw), bh, balt)}</td>')
    table = (
        f'<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{cw}" '
        f'style="width:100%;max-width:{cw}px;border-collapse:collapse;">\n'
        f'  <tr><td style="{CELL}">{link("https://coldsnap.fr", src["top"], cw, th, alt)}</td></tr>\n'
        f'  <tr><td style="{CELL}"><table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" '
        f'style="width:100%;border-collapse:collapse;table-layout:fixed;"><tr>\n'
        + "\n".join(cells) +
        '\n  </tr></table></td></tr>\n</table>'
    )
    pattern = re.compile(rf"(<!-- {marker} START -->\n).*?(\n<!-- {marker} END -->)", re.S)
    html, n = pattern.subn(lambda m: m.group(1) + table + m.group(2), html)
    if n != 1:
        raise SystemExit(f"markers '{marker} START/END' not found once in signature.html")
    print(f"{card}: {cw}x{th + bh} css, v={ver}")

SIG.write_text(html, encoding="utf-8", newline="\n")
