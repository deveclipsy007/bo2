"""Recorte de objeto (carro, iate, pessoa, relógio) quadro a quadro com BiRefNet-lite (rembg) → PNGs RGBA.
Uso: python mashup_cutout.py <video.mp4> <pasta_saida> [lado_max=720] [modelo=isnet-general-use]  → WebP RGBA por quadro"""
import sys, os, subprocess, glob, tempfile, time
import numpy as np
from PIL import Image
from rembg import remove, new_session
src, out = sys.argv[1], sys.argv[2]; side = int(sys.argv[3]) if len(sys.argv) > 3 else 720
os.makedirs(out, exist_ok=True)
tmp = tempfile.mkdtemp()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, f"{tmp}/%04d.png"], check=True)
s = new_session(sys.argv[4] if len(sys.argv) > 4 else "isnet-general-use")
t0 = time.time()
for f in sorted(glob.glob(tmp + "/*.png")):
    im = Image.open(f).convert("RGB"); W, H = im.size
    small = im.resize((int(W * side / H), side)) if H > side else im
    m = remove(small, session=s, only_mask=True).resize((W, H), Image.BILINEAR)
    a = np.asarray(m, dtype=np.float32) / 255; a = np.clip((a - 0.08) / 0.84, 0, 1)
    rgba = np.dstack([np.asarray(im), (a * 255).astype(np.uint8)])
    Image.fromarray(rgba, "RGBA").save(f"{out}/{os.path.basename(f)[:-4]}.webp", quality=90, method=4)
print("ok", src, round(time.time() - t0, 1), "s")
