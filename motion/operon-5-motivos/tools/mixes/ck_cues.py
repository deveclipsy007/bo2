import json
W = json.load(open('/home/user/bo2/motion/operon-5-motivos/src/films/eco/words8.json')); VO = 0.5
WS = [(w.lower().strip('.,?'), a + VO) for w, a, _ in W]
def w(x, n=1):
    k = 0
    for a, t in WS:
        if a == x:
            k += 1
            if k == n: return t
    raise KeyError(x)
def h(a, b):
    import math
    x = math.sin(a * 127.1 + b * 311.7) * 43758.5453
    return x - math.floor(x)
S = '/tmp/claude-0/-home-user-bo2/3ce5473f-28f2-5eab-abdc-5ecde2282813/scratchpad'
cues = []
def c(t, fx, db, pan=0, **k): cues.append({'t': round(t, 3), 'fx': fx, 'db': db, 'pan': pan, **k})
gest = lambda t: c(t, 'blip', -22, -0.6)
# gancho: os três diplomas sobem, a planta se desenha, os anos riscados viram 0
c(0.25, 'pop_in', -14, -0.6); c(0.35, 'click', -18, 0.2, f=1800); gest(0.9)
for x, pan in (('arquitetura', -0.5), ('direito', 0.0), ('marketing', 0.5)):
    t0 = w(x)
    c(t0 - 0.2, 'whoosh', -20, pan, d=0.45, f0=500, f1=2600)
    c(t0 + 0.5, 'pen', -22, pan, d=0.35); c(t0 + 0.88, 'blip', -21, pan, f0=1200, f1=1700, d=0.07)
c(w('arquitetura') - 0.05, 'pen', -24, -0.5, d=1.4)
for k in range(5): c(w('revisar') + k * 0.12, 'click', -27, 0.0, f=2400)
for k in range(12): c(w('marketing') + k * 0.07, 'click', -28, 0.3 + (k % 3) * 0.1, f=1500 + (k % 4) * 300)
# o envelope lacrado
c(9.6, 'whoosh', -17, 0.0, d=0.5, f0=2600, f1=300)
c(w('isso') - 0.2, 'whoosh', -21, 0.0, d=0.6, f0=1600, f1=200, rev=True); c(w('isso') + 0.45, 'plop', -16, 0.0)
c(w('assustadora') - 0.07, 'stamp', -5, 0.0); c(w('assustadora') + 0.05, 'shimmer', -24, 0.0, d=0.6)
c(w('já') - 0.1, 'whoosh', -19, 0.6, d=0.7, f0=400, f1=3000); gest(w('já') - 0.1)
# as provas: folhas, carimbos de aprovado, a cola riscada, o disco freia
c(13.75, 'whoosh', -19, 0.0, d=0.5, f0=300, f1=1800); c(14.0, 'click', -20, 0.0, f=1600)
c(w('exame') - 0.6, 'flip', -12, -0.4); c(w('exame') - 0.4, 'pen', -25, -0.4, d=1.1)
c(w('advogados') - 0.12, 'stamp', -4, -0.4)
c(w('passou', 2) - 0.4, 'flip', -12, 0.4); c(w('passou', 2) - 0.2, 'pen', -25, 0.4, d=1.1)
c(w('20') - 0.1, 'odometer', -19, 0.4, d=0.7)
c(w('folga') - 0.17, 'stamp', -4, 0.4)
c(w('não', 2) - 0.25, 'plop', -15, 0.3); c(w('colou') - 0.05, 'pen', -15, 0.3, d=0.22)
c(w('colou') + 0.08, 'hit', -14, 0.0, f=55, d=0.6)
# profissões destravadas
c(24.15, 'flip', -13, 0.0); c(24.3, 'pop_in', -14, -0.6); c(24.3, 'typing', -27, 0.2, d=1.0, rate=30)
for i in range(32):
    if i % 3 == 0: c(w('disponível') - 0.3 + h(i, 4) * 1.2, 'click', -24, -0.2 + (i % 5) * 0.15, f=2800 + (i % 4) * 400, d=0.04)
c(w('disponível') - 0.2, 'shimmer', -23, 0.2, d=1.4); gest(w('qualquer') - 0.1)
c(w('mas') - 0.05, 'hit', -18, 0.0, f=45, d=0.9)
c(w('detalhe') - 0.2, 'whoosh', -22, 0.2, d=0.7, f0=300, f1=1400); c(w('detalhe') + 0.45, 'shimmer', -20, 0.2, d=0.9); gest(w('detalhe') - 0.1)
# cada um na sua caixinha
c(33.05, 'whoosh', -18, 0.0, d=0.5, f0=3000, f1=400, rev=True)
for i in range(6): c(33.3 + i * 0.08, 'click', -22, -0.5 + i * 0.2, f=1300)
for a, b in (('arquiteto', 'engenheiro'), ('advogado', 'vendedor')):
    c(w(a), 'whoosh', -24, 0.0, d=0.6, f0=600, f1=1800)
    c(w(b) - 0.05, 'hit', -15, 0.0, f=70, d=0.4); c(w(b) - 0.05, 'blip', -20, 0.0, f0=520, f1=260, d=0.18)
c(41.65, 'pop_in', -14, -0.6)
for k in range(4): c(w('basicamente') + k * 0.18, 'plop', -19, -0.3 + k * 0.2)
gest(w('normal') - 0.3); c(w('normal') - 0.12, 'stamp', -4, 0.0)
# conecta: as paredes caem, a rede acende, o golpe
c(w('jogo') - 0.2, 'whoosh', -19, 0.0, d=0.8, f0=2000, f1=200)
c(w('muda') - 0.25, 'riser', -14, 0.0, d=w('conecta') - w('muda') + 0.2)
c(w('conecta') - 0.02, 'boom', -2, 0.0); c(w('conecta'), 'shimmer', -16, 0.0, d=1.2); gest(w('conecta') - 0.2)
c(45.9, 'pop_out', -18, -0.6)
# a construtora: cada agente entrega e passa adiante
c(w('pega') - 0.4, 'whoosh', -19, 0.0, d=0.8, f0=400, f1=2400)
c(w('pega'), 'printer', -30, 0.6, d=0.3)
for x, n in (('planta', 1), ('orçamento', 1), ('proposta', 1), ('contrato', 2), ('vídeo', 1)):
    t0 = w(x, n) - 0.3
    c(t0 - 0.5, 'blip', -24, 0.0, f0=700, f1=1050, d=0.08); c(t0, 'whoosh', -22, 0.0, d=0.5, f0=800, f1=2200); c(t0 + 0.08, 'click', -18, 0.0, f=2000)
c(w('planta') - 0.2, 'pen', -21, 0.0, d=1.0)
c(w('orçamento') - 0.1, 'odometer', -17, 0.0, d=1.4)
c(w('proposta') - 0.2, 'typing', -21, 0.0, d=1.2)
c(w('contrato', 2) - 0.1, 'pen', -18, 0.0, d=0.7); c(w('contrato', 2) + 0.5, 'stamp', -10, 0.0)
c(w('vídeo') - 0.25, 'blip', -19, 0.3, f0=1500, f1=1500, d=0.12); c(w('vídeo') - 0.1, 'shimmer', -21, 0.0, d=1.2)
c(w('tudo') - 0.3, 'whoosh', -18, 0.0, d=1.0, f0=2600, f1=300, rev=True)
for k in range(8): c(w('tudo') + 0.6 + k * 0.28, 'blip', -27, -0.4 + k * 0.11, f0=900, f1=1300, d=0.05)
c(w('tarde') - 0.27, 'hit', -9, 0.0, f=48, d=1.0)
# antes × agora
c(60.0, 'whoosh', -17, 0.0, d=0.5, f0=2400, f1=400)
for k in range(5): c(w('cinco') - 0.2 + k * 0.08, 'plop', -20, -0.5 + k * 0.1)
for k in range(20): c(w('antes', 2) + k * 0.15, 'flip', -27, 0.4, d=0.08)
c(w('semanas') - 0.32, 'hit', -12, 0.0, f=52, d=0.8)
c(63.7, 'whoosh', -18, 0.0, d=0.45, f0=300, f1=2600)
# o escritório inteiro: o prédio sobe andar por andar, 36 janelas acendem
for k in range(6): c(w('ecossistema') - 0.6 + k / 7 * 3.0, 'hit', -18, 0.0, f=75 + k * 6, d=0.25)
for i in range(36): c(w('escritório') - 0.3 + i / 36 * 1.6, 'click', -28, -0.4 + (i % 6) * 0.16, f=2200 + (i // 6) * 200, d=0.025)
c(w('escritório') + 1.3, 'shimmer', -20, 0.0, d=1.1)
c(70.65, 'pop_in', -14, -0.6)
c(w('raro') - 0.05, 'pen', -17, 0.2, d=0.3)
gest(w('conectar') - 0.2); c(w('conectar') - 0.05, 'hit', -12, 0.2, f=60, d=0.6)
c(74.5, 'pop_out', -18, -0.6)
c(74.1, 'whoosh', -17, 0.6, d=0.55, f0=2400, f1=300, rev=True)
# o envelope volta e abre
c(74.65, 'whoosh', -16, -0.5, d=0.6, f0=500, f1=2800)
c(w('assustadora', 2) - 0.2, 'flip', -9, 0.0); c(w('assustadora', 2) + 0.4, 'whoosh', -21, 0.0, d=0.6, f0=300, f1=1500)
c(w('concorrente') - 0.4, 'typing', -19, 0.0, d=w('nada') - w('concorrente') + 0.6, rate=16)
c(w('nada') + 0.25, 'click', -15, 0.0, f=1200, d=0.05)
c(w('ele') - 0.4, 'whoosh', -20, 0.0, d=0.5, f0=1800, f1=300)
c(w('ele') - 0.2, 'riser', -15, 0.0, d=w('primeiro') - w('ele') + 0.15)
c(w('conectar', 2) - 0.2, 'shimmer', -18, 0.4, d=1.0)
c(w('primeiro') - 0.02, 'hit', -3, 0.0, f=46, d=1.4)
# o olho e o logo
c(81.85, 'whoosh', -24, 0.0, d=0.8, f0=200, f1=900); c(w('por', 2) - 0.05, 'whoosh', -25, 0.0, d=0.9, f0=300, f1=700)
c(w('observa'), 'plop', -22, 0.0)
c(84.7, 'hit', -10, 0.0, f=42, d=1.2)
for k in range(10): c(85.05 + h(k, 9) * 0.8, 'click', -28, -0.4 + k * 0.08, f=2400, d=0.03)
c(86.0, 'pen', -21, 0.0, d=1.3); c(87.45, 'shimmer', -21, 0.0, d=1.0)
CL, JZ = f'{S}/mus/classicas.mp3', f'{S}/mus/jazz.mp3'
cfg = {'voice': f'{S}/ck/voz.mp3', 'vo': VO, 'dur': 90.3, 'out': '/home/user/bo2/motion/operon-5-motivos/public/eco8/audio/mix.wav',
       'music': [
           # barroca crescendo (m = 1358.0 + v − 0.2), afunda em "isso nem é…" e para seca em "não colou"
           {'src': CL, 'a': 1358.0, 'b': 1368.3, 'at': 0.2, 'fin': 0.6, 'fout': 0.6, 'db': 0},
           {'src': CL, 'a': 1367.7, 'b': 1371.8, 'at': 9.9, 'fin': 0.6, 'fout': 0.6, 'db': -9},
           {'src': CL, 'a': 1371.2, 'b': 1381.915, 'at': 13.4, 'fin': 0.6, 'fout': 0.04, 'db': 0, 'tapestop': 0.55},
           # peça escura do "ou seja" até o jogo mudar
           {'src': CL, 'a': 1701.0, 'b': 1722.15, 'at': 24.3, 'fin': 1.0, 'fout': 0.5, 'db': 0},
           # jazz: o golpe cai em "conecta"
           {'src': JZ, 'a': 3418.45, 'b': 3447.95, 'at': 45.5, 'fin': 0.02, 'fout': 0.6, 'db': -1},
           # tensão no envelope, golpe em "primeiro", acorde final
           {'src': CL, 'a': 1727.6, 'b': 1734.0, 'at': 75.1, 'fin': 0.5, 'fout': 0.12, 'db': -4},
           {'src': JZ, 'a': 3615.55, 'b': 3618.75, 'at': 81.5, 'fin': 0.01, 'fout': 0.8, 'db': -2},
           {'src': JZ, 'a': 3806.8, 'b': 3812.4, 'at': 84.7, 'fin': 0.01, 'fout': 1.4, 'db': -3}],
       'sfx': cues, 'duck': {'under': 14, 'gap_cap': 3, 'free': [[45.45, 46.2], [81.45, 82.0], [84.65, 85.4]]}}
json.dump(cfg, open(f'{S}/ck/mix.json', 'w'), ensure_ascii=False, indent=1)
print(len(cues), 'efeitos')
