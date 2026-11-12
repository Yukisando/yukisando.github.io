"""
Builds the light copies the ColdSnap project viewer loads.

For every file listed in coldsnap/data/projects.js `media`, writes next to it:
  <name>-view.webp  up to 1400 px, shown in the viewer stage (a video's poster)
  <name>-mini.webp  up to 240 px, shown in the viewer's filmstrip
  <name>-view-sm.webp  half-size copy of -view.webp, which phones pick through srcset
And next to every `thumbnail` (a WebP): <name>-sm.webp, 360 px wide, for the project cards.
  <name>-view.mp4   videos only: 1280 px on the long edge, H.264 + AAC (needs ffmpeg)
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
paths = sorted(set(re.findall(r"'/?(assets/projects/[^'?]+\.(?:jpe?g|png|mp4|webm))(?:\?[^']*)?'", data, re.I)))
thumbs = sorted(set(re.findall(r"thumbnail:\s*'/?(assets/projects/[^'?]+\.webp)(?:\?[^']*)?'", data)))


def write_small(src, edge):
    """Half-size copy for srcset. Rewritten whenever the source is newer."""
    out = src.with_name(f'{src.stem}-sm.webp')
    if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
        return
    with Image.open(src) as im:
        im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
        im.thumbnail((edge, edge * 4), Image.LANCZOS)
        im.save(out, 'WEBP', quality=78, method=6)
    print(f'{out.relative_to(ROOT)}  {out.stat().st_size // 1024} KB')


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
    view = src.with_name(f'{src.stem}-view.webp')
    with Image.open(view) as im:
        half = im.width // 2
    write_small(view, half)


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
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-vf', "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)'",
                        '-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-c:a', 'aac', '-b:a', '128k',
                        '-movflags', '+faststart', str(video)], check=True)
        print(f'{video.relative_to(ROOT)}  {video.stat().st_size // 1024} KB')
    with tempfile.TemporaryDirectory() as tmp:
        frame = Path(tmp) / 'poster.png'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '2', '-i', str(src),
                        '-frames:v', '1', str(frame)], check=True)
        write_webps(src, frame)

for rel in thumbs:
    src = ROOT / unquote(rel)
    if src.exists():
        write_small(src, 360)
    else:
        print('missing', rel)
