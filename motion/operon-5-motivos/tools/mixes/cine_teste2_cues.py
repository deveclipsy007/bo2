import json
W = json.load(open('/home/user/bo2/motion/operon-5-motivos/src/films/cine/words_teste.json')); VO = 0.5
WS = [(w.lower().strip('.,?…'), a + VO, b + VO) for w, a, b in W]
def w(x, n=1):
    k = 0
    for a, t, _ in WS:
        if a == x:
            k += 1
            if k == n: return t
    raise KeyError(x)
S = '/tmp/claude-0/-home-user-bo2/3ce5473f-28f2-5eab-abdc-5ecde2282813/scratchpad'
cues = []
def c(t, fx, db, pan=0, **k): cues.append({'t': round(t, 3), 'fx': fx, 'db': db, 'pan': pan, **k})
# a caneta escrevendo cada frase, no ritmo da fala
for a, b in [(0, 9), (9, 17), (17, 24), (24, 30)]:
    c(WS[a][1] - 0.04, 'pen', -27, -0.3, d=WS[b - 1][2] - WS[a][1])
# troca de plano na faixa do filme: um sopro curto
for x in [w('mais') - 0.05, w('está', 2) - 0.25, w('ninguém') - 0.1, w('enquanto') - 0.2, w('espera') - 0.1, w('alguém') - 0.15, w('construindo') - 0.1]:
    c(x, 'whoosh', -20, 0.2, d=0.35, f0=1400, f1=400)
c(0.3, 'whoosh', -24, 0, d=0.8, f0=200, f1=900)
c(w('poder') - 0.12, 'hit', -7, 0, f=48, d=1.1)
c(w('mais') - 0.05, 'boom', -6, 0, d=1.4)                                   # a onda explode
for k in range(3): c(w('mais') - 0.04 + k * 0.05, 'hit', -12 - k * 4, (k - 1) * 0.4, f=70, d=0.3)
c(w('alto') + 0.35, 'pen', -14, 0.2, d=0.35)                                # o risco sobre a onda
for k in range(9): c(w('construir') - 0.1 + k * 0.17, 'click', -18, 0.1, f=900 + k * 90, d=0.04)   # os andares
c(w('ninguém') - 0.1, 'blip', -22, -0.3, f0=700, f1=1000, d=0.08)
c(w('ignorar') - 0.15, 'shimmer', -15, 0, d=1.2); c(w('ignorar') + 0.05, 'hit', -12, 0, f=60, d=0.7)
for k in range(7): c(w('espera') + k * 0.42, 'click', -21, 0.4, f=3000, d=0.02)          # o relógio
c(w('momento') - 0.05, 'blip', -17, 0.4, f0=1300, f1=1300, d=0.1)
c(w('alguém') - 0.05, 'blip', -15, -0.2, f0=600, f1=1200, d=0.12)                       # o ponto sai da grade
for k in range(14): c(w('já') + k * ((w('futuro') - w('já') - 0.2) / 14), 'blip', -23, -0.5 + k * 0.07, f0=900 + k * 40, f1=1300 + k * 40, d=0.05)
c(w('construindo') - 0.6, 'riser', -12, 0, d=w('futuro') - w('construindo') + 0.55)
c(w('futuro') - 0.06, 'boom', -2, 0, d=2.2); c(w('futuro'), 'shimmer', -15, 0, d=1.4)
c(17.4, 'hit', -12, 0, f=42, d=1.4); c(17.55, 'shimmer', -22, 0, d=1.2)
cfg = {'voice': '/home/user/bo2/motion/operon-5-motivos/public/cine/audio/voz_teste.mp3', 'vo': VO, 'dur': 19.0,
       'out': '/home/user/bo2/motion/operon-5-motivos/public/cine/audio/mix_teste2.wav',
       'music': [{'src': f'{S}/mus/classicas.mp3', 'a': 1701.0, 'b': 1720.4, 'at': 0.0, 'fin': 0.8, 'fout': 1.6, 'db': 0}],
       'sfx': cues, 'duck': {'under': 14, 'gap_cap': 3, 'free': [[2.95, 3.5], [16.05, 16.8]]}}
json.dump(cfg, open(f'{S}/cine/mix2.json', 'w'), ensure_ascii=False, indent=1)
print(len(cues), 'efeitos')
