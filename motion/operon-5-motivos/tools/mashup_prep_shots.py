"""Prepara cada plano do material de luxo: corte exato, cor unificada, 60 fps e versão em câmera lenta (0,4×, interpolada).
Uso: python mashup_prep_shots.py <shots.json> <pasta_src> <saida>   (src: v1.mp4, v2.mp4)"""
import json, subprocess, sys, os
from concurrent.futures import ThreadPoolExecutor
shots, src, out = json.load(open(sys.argv[1])), sys.argv[2], sys.argv[3]
GRADE = "eq=contrast=1.07:saturation=1.08:gamma=0.97,colorbalance=rs=-0.02:bs=0.035:rh=0.03:bh=-0.03,scale=1080:1920:flags=lanczos"
MI = "minterpolate=fps={f}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
def job(s):
    a, b, v = s["a"], s["b"], s["src"]
    base = ["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-to", str(b), "-i", f"{src}/{v}.mp4", "-an", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p"]
    norm = (MI.format(f=60) + "," if v == "v1" else "") + GRADE
    subprocess.run(base + ["-vf", norm, "-r", "60", f"{out}/{s['id']}.mp4"], check=True)
    slow = MI.format(f=150) + ",setpts=2.5*PTS,fps=60," + GRADE
    subprocess.run(base + ["-vf", slow, "-r", "60", f"{out}/{s['id']}_slow.mp4"], check=True)
    return s["id"]
with ThreadPoolExecutor(4) as ex:
    for r in ex.map(job, shots): print("ok", r, flush=True)
