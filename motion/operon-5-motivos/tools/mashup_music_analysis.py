"""Análise musical do trecho para o motion: acordes por meio compasso, notas de baixo, espectro por quadro (60 fps),
envelope de onda para a tela de DAW e energia de graves (kick). Uso: python mashup_music_analysis.py <trecho.wav> <beats.json> <saida.json>"""
import sys, json, numpy as np, librosa
wav, beats_p, out = sys.argv[1:4]
y, sr = librosa.load(wav, sr=22050, mono=True)
B = json.load(open(beats_p))["beats"]
yh = librosa.effects.harmonic(y, margin=3)
chroma = librosa.feature.chroma_cqt(y=yh, sr=sr, hop_length=512)
tc = librosa.times_like(chroma, sr=sr, hop_length=512)
NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
T = []
for r in range(12):
    for q, iv in (('', (0, 4, 7)), ('m', (0, 3, 7))):
        v = np.zeros(12); [v.__setitem__((r + i) % 12, 1) for i in iv]; T.append((NAMES[r] + q, r, iv, v / np.linalg.norm(v)))
chords = []
edges = B[::2] + [B[-1] + 0.53]
for a, b in zip(edges[:-1], edges[1:]):
    m = (tc >= a) & (tc < b)
    if not m.any(): continue
    c = chroma[:, m].mean(1); c = c / (np.linalg.norm(c) + 1e-9)
    name, root, iv, _ = max(T, key=lambda x: float(np.dot(x[3], c)))
    if chords and chords[-1]["name"] == name: chords[-1]["end"] = round(b, 3)
    else: chords.append({"name": name, "start": round(a, 3), "end": round(b, 3), "root": root, "tones": [(root + i) % 12 for i in iv]})
# espectro por quadro (24 bandas log) e envelope de onda
FPS = 60; hop = sr // FPS
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop)); f = librosa.fft_frequencies(sr=sr, n_fft=2048)
edges_f = np.geomspace(35, 10000, 25)
bands = np.stack([S[(f >= lo) & (f < hi)].mean(0) for lo, hi in zip(edges_f[:-1], edges_f[1:])])
bands = 20 * np.log10(bands + 1e-6); bands = np.clip((bands - np.percentile(bands, 5)) / (np.percentile(bands, 99.5) - np.percentile(bands, 5)), 0, 1)
kick = S[(f >= 35) & (f < 130)].mean(0); kick = kick / np.percentile(kick, 99)
N = 1200; seg = len(y) // N
wave = [[round(float(y[i * seg:(i + 1) * seg].min()), 3), round(float(y[i * seg:(i + 1) * seg].max()), 3)] for i in range(N)]
json.dump({"chords": chords, "spectrum": [[round(float(v), 2) for v in col] for col in bands.T], "kick": [round(float(min(v, 1.5)), 2) for v in kick], "wave": wave, "wave_dur": len(y) / sr},
          open(out, "w"), separators=(",", ":"))
print(len(chords), "acordes:", " ".join(f"{c['name']}@{c['start']}" for c in chords[:40]))
