import json
W = json.load(open('/home/user/bo2/motion/operon-5-motivos/src/films/cine/words_teste.json')); VO = 0.5
WS = [(w.lower().strip('.,?…'), a + VO) for w, a, _ in W]
def w(x, n=1):
    k = 0
    for a, t in WS:
        if a == x:
            k += 1
            if k == n: return t
    raise KeyError(x)
S = '/tmp/claude-0/-home-user-bo2/3ce5473f-28f2-5eab-abdc-5ecde2282813/scratchpad'
cues = []
def c(t, fx, db, pan=0, **k): cues.append({'t': round(t, 3), 'fx': fx, 'db': db, 'pan': pan, **k})
c(0.05, 'whoosh', -22, 0, d=0.9, f0=200, f1=900)
c(w('poder') - 0.12, 'hit', -6, 0, f=48, d=1.2); c(w('poder') - 0.14, 'whoosh', -16, 0, d=0.5, f0=300, f1=2400)
c(w('mais') - 0.05, 'boom', -5, 0, d=1.6)                          # o punch do "mais alto" com eco
for k in range(3): c(w('mais') - 0.04 + k * 0.05, 'hit', -10 - k * 4, (k - 1) * 0.4, f=70, d=0.3)
c(w('alto') + 0.45, 'whoosh', -13, 0.4, d=0.7, f0=2600, f1=250, rev=True)   # o plano vira card e voa
c(w('está', 2) - 0.25, 'whoosh', -15, -0.6, d=0.6, f0=500, f1=2600)         # Michael entra
c(w('está', 2) - 0.07, 'whoosh', -15, 0.6, d=0.6, f0=500, f1=2600)          # Vito entra
c(w('construir') - 0.12, 'hit', -11, 0, f=72, d=0.6); c(w('construir') - 0.05, 'shimmer', -20, 0, d=0.9)
c(w('ninguém') + 0.15, 'whoosh', -12, 0, d=0.9, f0=400, f1=3200)            # atravessa o card
for i in range(7): c(w('ignorar') - 0.12 + i * 0.035, 'click', -18, -0.6 + i * 0.2, f=1600 + i * 120, d=0.03)
c(w('ignorar') + 0.28, 'hit', -9, 0, f=55, d=0.9)
for x in [w('enquanto') - 0.06, w('maioria') - 0.04, w('espera') - 0.04, w('momento') - 0.04]:
    c(x, 'click', -11, 0, f=1100, d=0.05); c(x, 'whoosh', -19, 0, d=0.25, f0=1800, f1=500)
for k in range(5): c(w('certo') + 0.35 + k * 0.38, 'click', -24, 0.3, f=3200, d=0.02)   # o relógio da espera
c(w('alguém') - 0.45, 'whoosh', -15, 0, d=0.6, f0=300, f1=1800); c(w('alguém') - 0.1, 'typing', -19, 0.2, d=1.6)
c(w('construindo') - 0.6, 'riser', -11, 0, d=w('futuro') - w('construindo') + 0.55)
c(w('futuro') - 0.06, 'boom', -2, 0, d=2.2); c(w('futuro'), 'shimmer', -15, 0, d=1.4)
c(17.35, 'hit', -12, 0, f=42, d=1.4); c(17.5, 'shimmer', -22, 0, d=1.2)
CL = f'{S}/mus/classicas.mp3'
cfg = {'voice': '/home/user/bo2/motion/operon-5-motivos/public/cine/audio/voz_teste.mp3', 'vo': VO, 'dur': 19.0,
       'out': '/home/user/bo2/motion/operon-5-motivos/public/cine/audio/mix_teste.wav',
       'music': [{'src': CL, 'a': 1701.0, 'b': 1720.4, 'at': 0.0, 'fin': 0.8, 'fout': 1.6, 'db': 0}],
       'sfx': cues, 'duck': {'under': 14, 'gap_cap': 3, 'free': [[2.95, 3.5], [16.05, 16.8]]}}
json.dump(cfg, open(f'{S}/cine/mix.json', 'w'), ensure_ascii=False, indent=1)
print(len(cues), 'efeitos')
