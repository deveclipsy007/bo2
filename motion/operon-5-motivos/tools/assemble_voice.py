"""Voz do filme: trata cada nota (cadeia do manual), iguala níveis por bandas, monta o master em cascata de pausas
e grava public/audio/voz.wav + src/films/cinco/data.ts (tempo por palavra, ancorável por T('palavra')).

Uso: python assemble_voice.py <pasta_com_wavs_48k> <words_raw_all.json> <saida_projeto>
Entradas esperadas na pasta: 01_hook.wav 02_m1.wav ... 08_assina.wav (mono, 48 kHz).
"""
import sys, json, wave, subprocess, os, re
import numpy as np

SRC, WORDS_JSON, PROJ = sys.argv[1], sys.argv[2], sys.argv[3]
WORK = os.path.join(SRC, '_work'); os.makedirs(WORK, exist_ok=True)
SR = 48000

# id, wav, chave no JSON de palavras, correções de grafia (o whisper escreve como ouve)
CLIPS = [
    ('hook', '01_hook.wav', 'hook', {'Cinco': 'Cinco'}),
    ('m1', '02_m1.wav', '17.00.37', {'1.': 'Um'}),
    ('m2', '03_m2.wav', '17.01.03', {'2.': 'Dois'}),
    ('m3', '04_m3.wav', '17.01.24', {'3.': 'Três', 'uma': 'numa'}),
    ('m4', '05_m4.wav', '17.02.08', {'Quatro,': 'Quatro', 'numa': 'na'}),
    ('m5', '06_m5.wav', '17.02.39', {'5.': 'Cinco'}),
    ('fecha', '07_fecha.wav', '17.03.27', {}),
    ('assina', '08_assina.wav', '17.03.39', {}),
]
# primeira palavra de cada trecho, em segundos no master (cascata de pausas; o hook é o vídeo e começa em 0)
FIRST_AT = {'m1': 6.35}
GAP = {'m2': 0.95, 'm3': 0.95, 'm4': 0.95, 'm5': 0.95, 'fecha': 1.0, 'assina': 0.9}   # fim da última palavra → 1ª palavra seguinte
LEAD, TAIL, FADE = 0.12, 0.32, 0.04
CHAIN = ('highpass=f=85,lowpass=f=15500,afftdn=nr=9:nf=-50,agate=threshold=0.007:ratio=1.6:attack=15:release=300:range=0.3,'
         'equalizer=f=320:t=q:w=1.1:g=-2.2,equalizer=f=3200:t=q:w=1.2:g=3.0,highshelf=f=9000:g=2.5,deesser=i=0.35:m=0.5:f=0.5,'
         'acompressor=threshold=-21dB:ratio=3.2:attack=6:release=110:makeup=2dB,alimiter=limit=0.9:level=0')
BANDS = [(80, 250, 140), (250, 800, 450), (800, 2500, 1500), (2500, 6000, 4000), (6000, 12000, 8500)]

def run(*a): subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
def read(p):
    with wave.open(p) as w: return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
def write(p, x):
    with wave.open(p, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
def lufs(p):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1])
def band_db(x):
    # energia por banda só nos quadros falados (RMS do quadro acima de -45 dB)
    n = 2048; hop = 1024; win = np.hanning(n); f = np.fft.rfftfreq(n, 1 / SR); acc = np.zeros(len(BANDS)); cnt = 0
    for i in range(0, len(x) - n, hop):
        fr = x[i:i + n]
        if 20 * np.log10(np.sqrt(np.mean(fr ** 2)) + 1e-9) < -42: continue
        sp = np.abs(np.fft.rfft(fr * win)) ** 2
        acc += [sp[(f >= lo) & (f < hi)].sum() for lo, hi, _ in BANDS]; cnt += 1
    db = 10 * np.log10(acc / max(cnt, 1) + 1e-12)
    return db - db.mean()                                         # só o formato espectral; o nível é ajustado depois

# 1) cadeia de polimento por trecho
clean = {}
for cid, wav, _, _ in CLIPS:
    out = os.path.join(WORK, f'{cid}_polish.wav'); run('ffmpeg', '-y', '-i', os.path.join(SRC, wav), '-af', CHAIN, '-ar', str(SR), '-ac', '1', out); clean[cid] = out

# 2) iguala bandas (≤ 2 dB) em relação à mediana dos trechos e leva cada um a -16 LUFS
bd = {cid: band_db(read(p)) for cid, p in clean.items()}
med = np.median(np.stack(list(bd.values())), axis=0)
final = {}
report = {}
for cid, p in clean.items():
    g = np.clip(med - bd[cid], -2.0, 2.0)
    eq = ','.join(f'equalizer=f={c}:t=q:w=0.8:g={g[i]:.2f}' for i, (_, _, c) in enumerate(BANDS))
    q = os.path.join(WORK, f'{cid}_eq.wav'); run('ffmpeg', '-y', '-i', p, '-af', eq, q)
    cur = lufs(q); gain = -16 - cur
    o = os.path.join(WORK, f'{cid}_final.wav'); run('ffmpeg', '-y', '-i', q, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.89:level=0', o)
    final[cid] = o; report[cid] = {'eq_db': [round(float(v), 2) for v in g], 'lufs_antes': round(cur, 1), 'lufs_depois': round(lufs(o), 1)}

# 3) palavras corrigidas + cascata
raw = json.load(open(WORDS_JSON))
master_len = 0.0; placed = []; words_abs = []
prev_last_end = None
for cid, _, key, fix in CLIPS:
    ws = [{'w': fix.get(w['w'], w['w']), 's': w['s'], 'e': w['e']} for w in raw[key]]
    if cid == 'hook':
        ws[0]['s'] = max(ws[0]['s'], 0.88)                      # a voz só começa ~0,85 s (o whisper marca 0,0)
        off, a, b = 0.0, 0.0, 5.375                             # o hook é o vídeo inteiro
    else:
        first, last = ws[0]['s'], ws[-1]['e']
        a, b = max(0.0, first - LEAD), last + TAIL
        at_first = FIRST_AT[cid] if cid in FIRST_AT else prev_last_end + GAP[cid]
        off = at_first - first                                  # soma de off a um tempo do trecho → tempo no master
    for w in ws: words_abs.append((w['w'], round(w['s'] + off, 3)))
    prev_last_end = ws[-1]['e'] + off
    placed.append((cid, off, a, b, ws[0]['s'] + off, prev_last_end))

END = placed[-1][5] + 2.6                                        # respiro do logo no fim
buf = np.zeros(int((END + 0.5) * SR), dtype=np.float32)
for cid, off, a, b, _, _ in placed:
    x = read(final[cid]); seg = x[int(a * SR):int(b * SR)].copy()
    f = int(FADE * SR)
    if cid != 'hook': seg[:f] *= np.linspace(0, 1, f); 
    seg[-f:] *= np.linspace(1, 0, f)
    s0 = int((a + off) * SR); buf[s0:s0 + len(seg)] += seg
os.makedirs(os.path.join(PROJ, 'public/audio'), exist_ok=True); write(os.path.join(PROJ, 'public/audio/voz.wav'), buf)

os.makedirs(os.path.join(PROJ, 'src/films/cinco'), exist_ok=True)
ts = ['// Gerado por tools/assemble_voice.py — palavra e instante (s) no master da voz. Corrija grafia aqui, não na tela.',
      'export const WORDS: [string, number][] = [', *[f"  [{json.dumps(w, ensure_ascii=False)}, {t}]," for w, t in words_abs], '];',
      'export const CLIPS = {', *[f"  {cid}: {{first: {round(fa, 3)}, last: {round(la, 3)}}}," for cid, _, _, _, fa, la in placed], '};',
      f'export const VOICE_END = {round(placed[-1][5], 3)};', f'export const END = {round(END, 3)};']
open(os.path.join(PROJ, 'src/films/cinco/data.ts'), 'w').write('\n'.join(ts) + '\n')
json.dump({'report': report, 'clips': {c: {'first': round(fa, 3), 'last': round(la, 3)} for c, _, _, _, fa, la in placed}, 'END': round(END, 3)}, open(os.path.join(WORK, 'voice_report.json'), 'w'), indent=1)
print(json.dumps({'END': round(END, 2), 'clips': {c: [round(fa, 2), round(la, 2)] for c, _, _, _, fa, la in placed}}))
print(json.dumps(report))
