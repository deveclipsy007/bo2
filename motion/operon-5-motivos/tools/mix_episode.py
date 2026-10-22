"""Mixagem do episódio guiada pela voz: a trilha abaixa sozinha enquanto o Yohann fala (sempre pelo menos `under` dB
abaixo da voz, com antecipação, para não cobrir o começo das palavras) e volta a respirar nas pausas. Efeitos sonoros
entram por cima, levemente abaixados durante a fala. No fim, um relatório prova a separação voz × trilha.

uso: python mix_episode.py <config.json>
config: {"voice", "vo", "dur", "out", "music": [{"src", "a", "b", "at", "fin", "fout", "db", "tapestop"?}], "sfx": [cues], "duck": {...}}
"""
import json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf
from scipy import signal
sys.path.insert(0, os.path.dirname(__file__))
from sfx import SR, render_cues

cfg = json.load(open(sys.argv[1]))
dur, vo = cfg['dur'], cfg['vo']
N = int(dur * SR)
tmp = tempfile.mkdtemp()
dk = {'under': 14, 'attack': 0.05, 'release': 0.5, 'hold': 0.3, 'look': 0.1, 'gap_cap': 3, 'sfx_under': 6, **cfg.get('duck', {})}


def ff(args):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', *args], check=True)


# ---------------- voz: limpeza, presença, compressão e um de-esser suave
vp = os.path.join(tmp, 'voz.wav')
ff(['-i', cfg['voice'], '-af', 'aresample=48000,highpass=f=75,equalizer=f=250:t=q:w=1:g=-1.5,equalizer=f=3200:t=q:w=1.2:g=2,equalizer=f=6800:t=q:w=2:g=-2,acompressor=threshold=-22dB:ratio=3:attack=6:release=110:makeup=2.5', '-ac', '1', vp])
v, _ = sf.read(vp, dtype='float32')
voice = np.zeros(N, np.float32)
i0 = int(vo * SR)
voice[i0:i0 + len(v)] = v[:max(0, N - i0)]

# ---------------- trilha: cada trecho com fades e um "vão" em 2–4 kHz para a voz caber
music = np.zeros((N, 2), np.float32)
for k, m in enumerate(cfg['music']):
    p = os.path.join(tmp, f'm{k}.wav')
    d = m['b'] - m['a']
    af = f"aresample=48000,highpass=f=35,equalizer=f=2800:t=q:w=1.1:g=-3.5,afade=t=in:d={m.get('fin', 0.05)},afade=t=out:st={d - m.get('fout', 0.3):.3f}:d={m.get('fout', 0.3)},volume={m.get('db', 0)}dB"
    ff(['-ss', str(m['a']), '-t', f'{d:.3f}', '-i', m['src'], '-af', af, '-ac', '2', p])
    x, _ = sf.read(p, dtype='float32')
    if m.get('tapestop'):                             # disco freando: o fim do trecho desacelera até parar (tom e tempo juntos)
        ts = int(m['tapestop'] * SR)
        s = max(0, len(x) - ts // 2)
        pos = s + np.cumsum(np.linspace(1, 0, ts))
        pos = pos[pos < len(x) - 1]
        warped = np.stack([np.interp(pos, np.arange(len(x)), x[:, ch]) for ch in range(2)], 1)
        warped *= np.linspace(1, 0, len(warped))[:, None] ** 0.5
        x = np.concatenate([x[:s], warped.astype(np.float32)])
    j = int(m['at'] * SR)
    L = min(len(x), N - j)
    music[j:j + L] += x[:L]

sfx = render_cues(cfg.get('sfx', []), dur)


# ---------------- níveis (ponderação aproximada do ouvido: corta graves, realça presença), 100 quadros por segundo
def weighted_db(x):
    mono = x if x.ndim == 1 else x.mean(1)
    sos = np.vstack([signal.butter(2, 120, 'highpass', fs=SR, output='sos'), signal.butter(1, [1200, 6000], 'bandpass', fs=SR, output='sos')])
    w = signal.sosfilt(sos[:1], mono) + 0.6 * signal.sosfilt(sos[1:], mono)
    hop = SR // 100
    fr = len(w) // hop
    r = np.sqrt(np.mean(w[:fr * hop].reshape(fr, hop) ** 2, 1) + 1e-12)
    r = np.convolve(r, np.ones(5) / 5, 'same')
    return 20 * np.log10(r + 1e-9)


Lv, Lm, Ls = weighted_db(voice), weighted_db(music), weighted_db(sfx)
F = len(Lv)
speech_lvl = np.percentile(Lv[Lv > Lv.max() - 40], 60)
active = Lv > speech_lvl - 18
# segura a fala ativa nas micro-pausas e antecipa a entrada das palavras
hold, look = int(dk['hold'] * 100), int(dk['look'] * 100)
act = np.convolve(active.astype(float), np.ones(hold), 'full')[:F] > 0
act = np.concatenate([act[look:], np.zeros(look, bool)]) | act
vref = np.where(act, np.maximum(Lv, speech_lvl - 6), speech_lvl)     # referência: a voz (ou o nível típico dela nas pausas)
target = np.where(act, vref - dk['under'] - Lm, speech_lvl - dk['gap_cap'] - Lm)
gdb = np.minimum(0, target)


def smooth(g, att, rel):
    out = np.zeros_like(g)
    a, r = np.exp(-1 / (att * 100)), np.exp(-1 / (rel * 100))
    cur = 0.0
    for k, x in enumerate(g):
        c = a if x < cur else r
        cur = c * cur + (1 - c) * x
        out[k] = cur
    return out


# janelas livres: momentos de impacto em que trilha e efeitos não abaixam (a queda, o golpe da música)
free = np.zeros(F, bool)
for a0, b0 in dk.get('free', []): free[int(a0 * 100):int(b0 * 100)] = True
gdb = np.where(free, 0, gdb)
gdb = smooth(gdb, dk['attack'], dk['release'])
sdb = smooth(np.where(act & ~free, np.minimum(0, vref - dk['sfx_under'] - Ls), 0), 0.02, 0.25)
up = lambda g: np.repeat(10 ** (g / 20), SR // 100)[:N].astype(np.float32)
gm, gs = up(gdb), up(sdb)
gm = np.pad(gm, (0, N - len(gm)), constant_values=gm[-1])
gs = np.pad(gs, (0, N - len(gs)), constant_values=gs[-1])
mix = music * gm[:, None] + sfx * gs[:, None] + voice[:, None] * 1.0

raw = os.path.join(tmp, 'mix_raw.wav')
sf.write(raw, mix, SR, subtype='FLOAT')
meas = subprocess.run(['ffmpeg', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(meas[meas.rindex('{'):])
ff(['-i', raw, '-af', f"loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}", '-ar', '48000', '-c:a', 'pcm_s16le', cfg['out']])

# ---------------- relatório: separação voz × trilha onde há fala
Lm2 = weighted_db(music * gm[:, None])
Ls2 = weighted_db(sfx * gs[:, None])
sp = act & active
from scipy.ndimage import maximum_filter1d
Lvs = maximum_filter1d(Lv, 30)                       # o nível de cada sílaba (pico em 300 ms), como o ouvido percebe
sep = (Lvs - Lm2)[sp]
seps = (Lvs - Ls2)[sp]
rep = {
    'separacao_voz_trilha_mediana_db': round(float(np.median(sep)), 1),
    'separacao_voz_trilha_pior_5pct_db': round(float(np.percentile(sep, 5)), 1),
    'fala_com_trilha_a_menos_de_10db_pct': round(float((sep < 10).mean() * 100), 1),
    'separacao_voz_efeitos_pior_5pct_db': round(float(np.percentile(seps, 5)), 1),
    'trilha_abaixada_media_na_fala_db': round(float(np.mean(gdb[sp])), 1),
    'efeitos': len(cfg.get('sfx', [])),
}
out = subprocess.run(['ffmpeg', '-i', cfg['out'], '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
rep['loudness'] = [l.strip() for l in out.splitlines() if l.strip().startswith(('I:', 'Peak:'))][-2:]
print(json.dumps(rep, ensure_ascii=False))
json.dump(rep, open(cfg['out'] + '.report.json', 'w'), ensure_ascii=False)
