# Fundo "modo retrato" do hook: remove a pessoa por inpainting (só a borda importa, o resto fica atrás dela) e desfoca.
import sys, glob, cv2, numpy as np
src, fg, out = sys.argv[1], sys.argv[2], sys.argv[3]
files = sorted(glob.glob(src + "/*.png"))
k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41))
for i, f in enumerate(files):
    img = cv2.imread(f)
    a = cv2.imread(f"{fg}/{i+1:04d}.png", cv2.IMREAD_UNCHANGED)[:, :, 3]
    m = cv2.dilate((a > 16).astype(np.uint8) * 255, k)
    sm = cv2.resize(img, (270, 480), interpolation=cv2.INTER_AREA); mm = cv2.resize(m, (270, 480), interpolation=cv2.INTER_NEAREST)
    inp = cv2.inpaint(sm, mm, 12, cv2.INPAINT_TELEA)
    up = cv2.resize(inp, (1080, 1920), interpolation=cv2.INTER_CUBIC)
    w = cv2.GaussianBlur(m, (0, 0), 6).astype(np.float32)[..., None] / 255
    plate = (img * (1 - w) + up * w).astype(np.float32)
    blur = cv2.GaussianBlur(plate, (0, 0), 9)
    cv2.imwrite(f"{out}/{i+1:04d}.png", np.clip(blur, 0, 255).astype(np.uint8))
print("ok", len(files))
