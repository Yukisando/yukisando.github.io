"""Render the email signature's text and buttons in Cooldown Sans, as 2x PNGs for coldsnap.fr.

    python tools/email-signature/render.py

Why images: Gmail and Outlook drop web fonts, so live text would fall back to Arial. Edge (headless)
lays out render.html with the real font; this script cuts each piece out of a 2x screenshot.
Writes coldsnap/assets/email/sig-*.png and prints their CSS sizes for signature.html.
"""
import json
import pathlib
import re
import subprocess
import time

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "coldsnap" / "assets" / "email"
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PAGE = (HERE / "render.html").as_uri()
SCALE = 2
W, H = 640, 640

common = [EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=4000",
          f"--window-size={W},{H}", f"--force-device-scale-factor={SCALE}", "--allow-file-access-from-files"]
dom = subprocess.run(common + ["--dump-dom", PAGE], capture_output=True, text=True, timeout=60).stdout
rects = json.loads(re.search(r'<pre id="rects"[^>]*>(.*?)</pre>', dom, re.S).group(1).replace("&quot;", '"'))
if not rects.pop("font"):
    raise SystemExit("Cooldown Sans did not load: check the font path in render.html")

shot = HERE / "_shot.png"
subprocess.run(common + ["--default-background-color=00000000", f"--screenshot={shot}", PAGE], capture_output=True, timeout=60)
for _ in range(20):
    if shot.exists():
        break
    time.sleep(0.5)
img = Image.open(shot).convert("RGBA")

OUT.mkdir(parents=True, exist_ok=True)
for name, r in rects.items():
    box = tuple(round(v * SCALE) for v in (r["x"], r["y"], r["x"] + r["w"], r["y"] + r["h"]))
    piece = img.crop(box)
    piece.save(OUT / f"sig-{name}.png", optimize=True)
    print(f"sig-{name}.png  css {round(r['w'])}x{round(r['h'])}  file {piece.size[0]}x{piece.size[1]}")
shot.unlink()
