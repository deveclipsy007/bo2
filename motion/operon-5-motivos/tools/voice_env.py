"""Envelope da voz para a boca do avatar: um dígito (0–9) por quadro a 60 fps, já deslocado pelo VO do episódio.

uso: python voice_env.py <voz.mp3> <vo_s> <duração_s> <saida.json>
"""
import sys, json, numpy as np, librosa
src, vo, dur, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
y, sr = librosa.load(src, sr=24000, mono=True)
hop = sr // 60
r = librosa.feature.rms(y=y, frame_length=hop * 2, hop_length=hop, center=True)[0]
r = np.convolve(r, np.ones(3) / 3, 'same')                      # tira o tremido de um quadro
ref = np.percentile(r[r > r.max() * 0.05], 92) if (r > r.max() * 0.05).any() else r.max()
lv = np.clip(np.sqrt(r / ref), 0, 1)                             # raiz: a boca abre já em volume médio
n = int(round(dur * 60)); env = np.zeros(n)
off = int(round(vo * 60)); m = min(len(lv), n - off); env[off:off + m] = lv[:m]
s = ''.join(str(int(min(9, v * 10))) for v in env)
json.dump({'fps': 60, 'env': s}, open(out, 'w'))
print(len(s), 'quadros; fala em', round((env > 0.2).mean() * 100), '% do tempo')
