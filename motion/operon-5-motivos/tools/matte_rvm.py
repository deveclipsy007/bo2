# Recorte de pessoa em vídeo (Robust Video Matting, ONNX). Uso: python matte_rvm.py <pasta_quadros_png> <saida_rgba> <downsample 0.5> <rvm_mobilenetv3_fp32.onnx>
import sys, glob, time
import numpy as np, cv2, onnxruntime as ort
src, out, ratio = sys.argv[1], sys.argv[2], float(sys.argv[3])
sess = ort.InferenceSession(f"{sys.argv[4]}", providers=["CPUExecutionProvider"])
files = sorted(glob.glob(src + "/*.png"))
rec = [np.zeros((1, 1, 1, 1), dtype=np.float32) for _ in range(4)]
dr = np.array([ratio], dtype=np.float32)
def run(x):
    global rec
    fgr, pha, *rec = sess.run(None, {"src": x, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": dr})
    return fgr, pha
t0 = time.time()
for i, f in enumerate(files):
    img = cv2.imread(f)[:, :, ::-1]
    x = (img.astype(np.float32) / 255.0).transpose(2, 0, 1)[None]
    if i == 0:
        for _ in range(4): run(x)   # aquece o estado recorrente no 1º quadro
    fgr, pha = run(x)
    a = pha[0, 0]
    a = np.clip((a - 0.06) / 0.88, 0, 1); a = a * a * (3 - 2 * a)          # limpa ruído do contorno
    f3 = np.clip(fgr[0].transpose(1, 2, 0), 0, 1)
    edge = np.clip(1 - np.abs(a * 2 - 1) * 1.0, 0, 1)[..., None]            # só na borda usa o fgr estimado (menos halo)
    rgb = (img.astype(np.float32) / 255.0) * (1 - edge) + f3 * edge
    rgba = np.dstack([np.clip(rgb * 255, 0, 255).astype(np.uint8)[:, :, ::-1], (a * 255).astype(np.uint8)])
    cv2.imwrite(f"{out}/{i+1:04d}.png", rgba)
    if i % 20 == 0: print(i, round(time.time() - t0, 1), flush=True)
print("done", round(time.time() - t0, 1))
