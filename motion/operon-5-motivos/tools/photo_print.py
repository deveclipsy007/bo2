"""Foto de época → "cópia impressa" em tons de cinza com borda esfumada + mapa de revelação (da esquerda para a direita).

uso: python photo_print.py <entrada> <nome> [x0 y0 x1 y1 em fração] [maxlado]
Gera public/eco/img/<nome>.png e <nome>_map.png (o mesmo formato do eco_lineart.py, para usar com <Reveal edge={0}>).
"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
OUT = '/home/user/bo2/motion/operon-5-motivos/public/eco/img/'
src, name = sys.argv[1], sys.argv[2]
crop = [float(v) for v in sys.argv[3:7]] if len(sys.argv) > 6 else None
mx = int(sys.argv[7]) if len(sys.argv) > 7 else 1400
im = Image.open(src).convert('L')
if crop: W, H = im.size; im = im.crop((int(crop[0] * W), int(crop[1] * H), int(crop[2] * W), int(crop[3] * H)))
im.thumbnail((mx, mx), Image.LANCZOS)
a = np.asarray(im).astype(np.float32) / 255; h, w = a.shape
g = np.clip((a - np.percentile(a, 1)) / (np.percentile(a, 99.5) - np.percentile(a, 1)), 0, 1)
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
r = np.maximum(np.abs(xx - w / 2) / (w / 2), np.abs(yy - h / 2) / (h / 2))
n = ndi.gaussian_filter(np.random.default_rng(5).standard_normal((h, w)), 18); n /= n.std()
alpha = np.clip((1.0 - r + 0.05 * n) / 0.12, 0, 1)
Image.fromarray((np.dstack([g * 0.97, g * 0.955, g * 0.93, alpha]) * 255).astype(np.uint8), 'RGBA').save(OUT + name + '.png')
m = np.clip(xx / w * 0.85 + 0.03 * n + 0.1 * np.abs(yy / h - 0.5), 0, 1); m = (m - m.min()) / (m.max() - m.min())
Image.fromarray((m * 255).astype(np.uint8), 'L').save(OUT + name + '_map.png')
print(name, w, h)
