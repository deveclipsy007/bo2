"""Recorta as folhas do avatar (pixel art com contorno de adesivo) em quadros alinhados.

uso: python avatar_sprites.py <folha_fala.webp> <folha_poses.webp>
- folha de fala (3x2, mesma pose, bocas diferentes) → talk0..5.png, todos registrados no quadro 0 (a cabeça não "pula" na troca)
- folha de poses (3x2) → pose0..5.png, com a base do busto na mesma linha e o corpo centrado
Gera public/eco/avatar/*.png e src/films/eco/avatar.json (tamanho de cada quadro e a linha da base).
"""
import sys, json, numpy as np
from PIL import Image
from scipy import ndimage as ndi

OUT = '/home/user/bo2/motion/operon-5-motivos/public/eco/avatar/'
JS = '/home/user/bo2/motion/operon-5-motivos/src/films/eco/avatar.json'
W, H = 560, 560   # tela comum de cada quadro; a base do busto fica em BASE
BASE = 540

def comps(a):
    lab, n = ndi.label(a[..., 3] > 40)
    out = []
    for i, sl in enumerate(ndi.find_objects(lab)):
        if (lab[sl] == i + 1).sum() > 20000: out.append(sl)
    return out

def place(cell, dx=0, dy=0):
    """cola o recorte na tela comum: centrado na horizontal, base em BASE"""
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    al = np.asarray(cell)[..., 3] > 40
    ys, xs = np.where(al)
    cx = (xs.min() + xs.max()) / 2
    c.paste(cell, (int(round(W / 2 - cx + dx)), int(round(BASE - ys.max() + dy))), cell)
    return c

def shift_to(ref, img):
    """translação que melhor sobrepõe o contorno escuro (correlação por FFT)"""
    def edge(im):
        a = np.asarray(im).astype(np.float32)
        dark = (a[..., 3] > 128) & (a[..., :3].max(2) < 60)
        return ndi.gaussian_filter(dark.astype(np.float32), 1.5)
    A, B = edge(ref), edge(img)
    F = np.fft.fft2(A) * np.conj(np.fft.fft2(B))
    r = np.fft.ifft2(F).real
    y, x = np.unravel_index(np.argmax(r), r.shape)
    if y > H / 2: y -= H
    if x > W / 2: x -= W
    return int(x), int(y)

talk = Image.open(sys.argv[1]).convert('RGBA'); a = np.asarray(talk)
cols = [(28, 485), (509, 965), (1021, 1477)]; rows = [(0, 515), (515, 1024)]
cells = []
for (y0, y1) in rows:
    for (x0, x1) in cols:
        sub = talk.crop((x0 - 8, y0, x1 + 8, y1)); arr = np.asarray(sub).copy()
        lab, n = ndi.label(arr[..., 3] > 40); big = 1 + int(np.argmax(ndi.sum(np.ones_like(lab), lab, range(1, n + 1))))
        keep = ndi.binary_dilation(lab == big, iterations=2); arr[..., 3] = np.where(keep, arr[..., 3], 0)   # só o boneco: some a borda do quadro vizinho
        sub = Image.fromarray(arr, 'RGBA'); ys, xs = np.where(keep & (arr[..., 3] > 40)); cells.append(sub.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)))
frames = [place(c) for c in cells]
meta = {'W': W, 'H': H, 'base': BASE, 'talk': [], 'pose': []}
for i, f in enumerate(frames):
    dx, dy = (0, 0) if i == 0 else shift_to(frames[0], f)
    g = place(cells[i], dx, dy) if (dx or dy) else f
    g.save(OUT + f'talk{i}.png', optimize=True); meta['talk'].append([dx, dy])

poses = Image.open(sys.argv[2]).convert('RGBA'); pa = np.asarray(poses)
for i, sl in enumerate(sorted(comps(pa), key=lambda s: (s[0].start // 300, s[1].start))):
    cell = poses.crop((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop))
    place(cell).save(OUT + f'pose{i}.png', optimize=True); meta['pose'].append(i)
json.dump(meta, open(JS, 'w'))
print(meta)
