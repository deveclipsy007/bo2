import json
W = json.load(open('/home/user/bo2/motion/operon-5-motivos/src/films/eco/words7.json')); VO = 0.8
WS = [(w.lower().strip('.,?'), a + VO) for w, a, _ in W]
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
# gancho: o crachá desce, o carimbo, as etiquetas saindo da cabeça
c(0.25, 'pop_in', -14, -0.6); c(0.3, 'whoosh', -20, 0.2, d=0.6, f0=2200, f1=300); c(0.95, 'click', -16, 0.2, f=1800)
c(w('demissão') - 0.05, 'stamp', -5, 0.15)
for k in range(6): c(w('levar') + k * 0.2, 'blip', -25, 0.3 + k * 0.1, f0=900, f1=1500, d=0.06)
c(w('cabeça') - 0.15, 'blip', -21, -0.6); c(w('cabeça') - 0.05, 'shimmer', -19, 0.1, d=1.0)
# 1935: o crachá gira, o motor, a queda, o fogo
c(8.55, 'flip', -12, 0.0); c(8.9, 'engine', -24, 0.0, d=7.1)
c(15.92, 'boom', -1, 0.0); c(15.95, 'whoosh', -17, 0.0, d=0.45, f0=1200, f1=200); c(16.3, 'fire', -25, 0.0, d=4.6)
# o painel e a trava
c(20.95, 'whoosh', -21, 0.3, d=0.45, f0=400, f1=2600)
for k in range(8): c(21.0 + k * 0.1, 'click', -27, -0.4 + k * 0.1, f=2600)
c(w('trava') - 0.2, 'lever', -11, 0.35); c(w('trava') - 0.1, 'alarm', -23, 0.35)
# a trava voa até o checklist; datilografia; os vistos
c(26.75, 'whoosh', -18, 0.0, d=0.65, f0=500, f1=3200); c(27.4, 'click', -16, -0.3, f=2200)
c(27.0, 'typing', -23, 0.0, d=1.4)
for t in [27.45] + [w('cartão') + 0.15 + i * 0.32 for i in range(1, 6)]: c(t, 'check', -18, -0.2)
# o cartão gira; os B-17 passam; o contador
c(31.9, 'flip', -12, 0.0); c(32.0, 'engine', -19, 0.0, d=4.5, flyby=True); c(w('quase') - 0.1, 'odometer', -16, 0.0)
# o checklist de hoje (avatar)
c(37.6, 'whoosh', -19, 0.0, d=0.45, f0=3000, f1=400); c(37.75, 'pop_in', -14, -0.6)
c(w('agente') - 0.25, 'pen', -23, 0.0, d=0.35); c(w('agente') + 0.05, 'pen', -23, 0.0, d=0.6)
for x in ('atende', 'vende', 'resolve'): c(w(x) - 0.1, 'click', -18, 0.1, f=1500)
c(w('escreve') - 0.1, 'blip', -21, -0.6); c(w('escreve') - 0.1, 'typing', -23, 0.0, d=1.3)
for i in range(3): c(w('passo') + 0.2 + i * 0.24, 'check', -22, -0.2)
# vira um agente: o manual se fecha no ponto
c(47.95, 'whoosh', -16, 0.0, d=0.5, f0=3000, f1=300, rev=True); c(48.45, 'plop', -16, 0.0); c(48.4, 'shimmer', -22, 0.0, d=0.8)
c(w('esquece') - 0.1, 'hit', -13, 0.2); c(w('falta') - 0.1, 'hit', -13, 0.2); c(w('pede') - 0.3, 'hit', -9, 0.2, f=48)
c(w('pede') - 0.2, 'blip', -21, -0.6)
for k in range(6): c(w('conhecimento') - 0.2 + k * 0.14, 'blip', -26, 0.4 - k * 0.15, f0=1500, f1=900, d=0.06)
c(w('empresa', 3) - 0.9, 'pen', -24, 0.0, d=0.9); c(w('fica') - 0.1, 'blip', -21, -0.6)
c(56.7, 'pop_out', -18, -0.6)
# o olho e o logo
c(56.9, 'whoosh', -25, 0.0, d=0.8, f0=200, f1=900); c(w('observa'), 'plop', -24, 0.0)
c(59.6, 'hit', -12, 0.0, f=42, d=1.2)
c(59.95, 'printer', -21, 0.0, d=1.1); c(60.9, 'pen', -21, 0.0, d=1.3); c(62.35, 'shimmer', -21, 0.0, d=1.0)
cfg = {'voice': f'{S}/b17/voz.mp3', 'vo': VO, 'dur': 65.9, 'out': '/home/user/bo2/motion/operon-5-motivos/public/eco7/audio/mix_v2.wav',
       'music': [{'src': f'{S}/mus/classicas.mp3', 'a': 1623.1, 'b': 1639.85, 'at': 0.0, 'fin': 0.6, 'fout': 0.5, 'db': 0},
                 {'src': f'{S}/mus/classicas.mp3', 'a': 3136.0, 'b': 3155.3, 'at': 18.5, 'fin': 1.4, 'fout': 0.6, 'db': 2},
                 {'src': f'{S}/mus/jazz.mp3', 'a': 895.35, 'b': 914.55, 'at': 37.75, 'fin': 0.03, 'fout': 0.25, 'db': -1},
                 {'src': f'{S}/mus/jazz.mp3', 'a': 3435.05, 'b': 3439.9, 'at': 59.6, 'fin': 0.01, 'fout': 0.65, 'db': -3}],
       'sfx': cues, 'duck': {'under': 14, 'gap_cap': 3, 'free': [[15.88, 16.55], [59.55, 60.4]]}}
json.dump(cfg, open(f'{S}/b17/mix_v2.json', 'w'), ensure_ascii=False, indent=1)
print(len(cues), 'efeitos')
