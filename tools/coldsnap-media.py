"""
Builds the light copies the ColdSnap project viewer loads.

For every file listed in coldsnap/data/projects.js `media`, writes next to it:
  <name>-view.webp  up to 1400 px, shown in the viewer stage (a video's poster)
  <name>-mini.webp  up to 240 px, shown in the viewer's filmstrip
  <name>-view.mp4   videos only: 1280 px tall, muted, H.264 (needs ffmpeg)
The originals stay untouched and are what the full-screen zoom opens.
Existing copies are skipped, so run it again after adding a project:

  python tools/coldsnap-media.py
"""
import re
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import unquote

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / 'coldsnap'
SIZES = {'view': (1400, 80), 'mini': (240, 70)}

data = (ROOT / 'data' / 'projects.js').read_text(encoding='utf-8')
paths = sorted(set(re.findall(r"'(assets/projects/[^']+\.(?:jpe?g|png|mp4|webm))'", data, re.I)))


def write_webps(src, image_path):
    for suffix, (edge, quality) in SIZES.items():
        out = src.with_name(f'{src.stem}-{suffix}.webp')
        if out.exists():
            continue
        with Image.open(image_path) as im:
            im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
            im.thumbnail((edge, edge), Image.LANCZOS)
            im.save(out, 'WEBP', quality=quality, method=6)
        print(f'{out.relative_to(ROOT)}  {out.stat().st_size // 1024} KB')


for rel in paths:
    src = ROOT / unquote(rel)
    if not src.exists():
        print('missing', rel)
        continue
    if src.suffix.lower() not in ('.mp4', '.webm'):
        write_webps(src, src)
        continue
    video = src.with_name(f'{src.stem}-view.mp4')
    if not video.exists():
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-vf', 'scale=-2:1280',
                        '-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-an',
                        '-movflags', '+faststart', str(video)], check=True)
        print(f'{video.relative_to(ROOT)}  {video.stat().st_size // 1024} KB')
    with tempfile.TemporaryDirectory() as tmp:
        frame = Path(tmp) / 'poster.png'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '2', '-i', str(src),
                        '-frames:v', '1', str(frame)], check=True)
        write_webps(src, frame)
