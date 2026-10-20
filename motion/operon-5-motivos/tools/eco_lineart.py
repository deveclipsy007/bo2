"""Gravuras/desenhos → traço branco com alfa (o papel some) + mapa de revelação (ordem em que o traço "se desenha").

uso: python eco_lineart.py <entrada> <nome> <modo> [maxlado] [sx sy] [crop x0 y0 x1 y1 em fração]
modo: ink   = tinta escura sobre papel claro (desenho, gravura)
      light = traço claro sobre fundo escuro (Haeckel)
      cut   = foto/pintura: recorte por rembg (pessoa/estátua), sai em tons de cinza
Gera public/eco/img/<nome>.png e <nome>_map.png (cinza: 0 aparece primeiro, 255 por último).
"""
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

src, name, mode = sys.argv[1], sys.argv[2], sys.argv[3]
mx = int(sys.argv[4]) if len(sys.argv) > 4 else 1800
seed = (float(sys.argv[5]), float(sys.argv[6])) if len(sys.argv) > 6 else (0.5, 0.5)
crop = [float(v) for v in sys.argv[7:11]] if len(sys.argv) > 10 else None
OUT = '/home/user/bo2/motion/operon-5-motivos/public/eco/img/'

im = Image.open(src).convert('RGB')
if crop: W, H = im.size; im = im.crop((int(crop[0] * W), int(crop[1] * H), int(crop[2] * W), int(crop[3] * H)))
im.thumbnail((mx, mx), Image.LANCZOS)
a = np.asarray(im).astype(np.float32) / 255
L = a @ np.array([0.299, 0.587, 0.114], np.float32)

if mode == 'ink':
    # papel estimado por fechamento + desfoque grande → razão tira manchas e amarelado
    paper = ndi.grey_closing(L, size=(25, 25)); paper = ndi.gaussian_filter(paper, 18)
    d = np.clip(1 - L / np.maximum(paper, 1e-3), 0, 1)
    sat = a.max(2) - a.min(2)
    red = (a[..., 0] > a[..., 1] + 0.18) & (sat > 0.25)            # carimbos vermelhos fora
    d[red] = 0
    core = d[int(d.shape[0] * .05):int(d.shape[0] * .95), int(d.shape[1] * .05):int(d.shape[1] * .95)]
    import os
    lo, hi = np.percentile(core, float(os.environ.get('LO', 60))), np.percentile(core, float(os.environ.get('HI', 99.6)))
    alpha = np.clip((d - lo - 0.02) / max(hi - lo, 1e-3), 0, 1) ** float(os.environ.get('GAM', 0.8))
    rgb = np.ones_like(a) * np.array([0.96, 0.95, 0.92], np.float32)
elif mode == 'light':
    lo, hi = np.percentile(L, 40), np.percentile(L, 99.5)
    alpha = np.clip((L - lo) / max(hi - lo, 1e-3), 0, 1) ** 0.9
    rgb = np.ones_like(a) * np.array([0.96, 0.95, 0.92], np.float32)
else:  # cut
    from rembg import remove, new_session
    sess = new_session('isnet-general-use')
    rgba = np.asarray(remove(im, session=sess)).astype(np.float32) / 255
    alpha = rgba[..., 3]
    g = (rgba[..., :3] @ np.array([0.299, 0.587, 0.114], np.float32))
    g = np.clip((g - np.percentile(g[alpha > 0.5], 2)) / (np.percentile(g[alpha > 0.5], 99.5) - np.percentile(g[alpha > 0.5], 2) + 1e-3), 0, 1)
    rgb = np.stack([g * 0.97, g * 0.955, g * 0.93], -1)

# recorta na área útil
ys, xs = np.where(alpha > 0.08)
pad = 12
y0, y1, x0, x1 = max(0, ys.min() - pad), min(alpha.shape[0], ys.max() + pad), max(0, xs.min() - pad), min(alpha.shape[1], xs.max() + pad)
alpha, rgb = alpha[y0:y1, x0:x1], rgb[y0:y1, x0:x1]
Image.fromarray((np.dstack([rgb, alpha]) * 255).astype(np.uint8), 'RGBA').save(OUT + name + '.png', optimize=True)

# mapa de revelação: distância do ponto-semente + ruído de baixa frequência, equalizado nos pixels de traço
h, w = alpha.shape
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
dist = np.hypot((xx / w - seed[0]) * w / max(w, h), (yy / h - seed[1]) * h / max(w, h))
rng = np.random.default_rng(7)
noise = ndi.gaussian_filter(rng.standard_normal((h, w)).astype(np.float32), max(h, w) / 40)
noise = (noise - noise.mean()) / (noise.std() + 1e-6)
fine = ndi.gaussian_filter(rng.standard_normal((h, w)).astype(np.float32), 3); fine /= fine.std() + 1e-6
m = dist / dist.max() + 0.12 * noise + 0.03 * fine
mask = alpha > 0.1
ranks = np.zeros_like(m); order = np.argsort(m[mask]); r = np.empty(order.size, np.float32); r[order] = np.linspace(0, 1, order.size)
ranks[mask] = r
# fora do traço: valor da vizinhança (para o "pincel" não deixar buracos)
filled = ndi.grey_dilation(ranks, size=(5, 5)); ranks[~mask] = np.minimum(filled[~mask] + 0.01, 1)
Image.fromarray((ranks * 255).astype(np.uint8), 'L').save(OUT + name + '_map.png', optimize=True)
print(name, alpha.shape[::-1])
