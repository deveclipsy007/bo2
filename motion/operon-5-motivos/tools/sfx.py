"""Efeitos sonoros sintetizados (48 kHz, estéreo), para sincronizar com o que acontece na tela.

Cada efeito é uma função que devolve um array (n, 2) em float32. `render_cues(cues, dur)` monta a trilha de efeitos de um
episódio a partir de uma lista [{"t": s, "fx": nome, "db": ganho, "pan": -1..1, ...parâmetros}].
Tudo determinístico (semente fixa por cue), para o mesmo vídeo sempre soar igual.
"""
import numpy as np
from scipy import signal

SR = 48000


def _t(d):
    return np.arange(int(d * SR)) / SR


def _env(n, a=0.005, r=0.2, shape=3.0):
    """ataque linear curto e queda exponencial"""
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-3))
    return e


def _bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, min(hi, SR / 2 - 100)], 'bandpass', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def _lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'lowpass', fs=SR, output='sos'), x)


def _hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'highpass', fs=SR, output='sos'), x)


def _norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def _sweep_bp(noise, f0, f1, q=1.2, chunk=256):
    """ruído por um passa-faixa cuja frequência central desliza de f0 a f1 (o "vuuush")"""
    out = np.zeros_like(noise)
    n = len(noise)
    zi = None
    for i in range(0, n, chunk):
        u = i / max(1, n - 1)
        fc = f0 * (f1 / f0) ** u
        lo, hi = fc / (1 + 1 / q), fc * (1 + 1 / q)
        sos = signal.butter(2, [max(20, lo), min(SR / 2 - 200, hi)], 'bandpass', fs=SR, output='sos')
        if zi is None or zi.shape[0] != sos.shape[0]:
            zi = np.zeros((sos.shape[0], 2))
        out[i:i + chunk], zi = signal.sosfilt(sos, noise[i:i + chunk], zi=zi)
    return out


# ------------------------------------------------------------------ efeitos
def whoosh(rng, d=0.45, f0=300, f1=2400, rev=False):
    n = int(d * SR)
    x = _sweep_bp(rng.standard_normal(n), f0, f1)
    u = np.linspace(0, 1, n)
    e = np.sin(np.pi * u) ** 1.6 if not rev else u ** 2.2 * (u < 0.97)
    return _norm(x * e, 0.8)


def flip(rng, d=0.2):
    """cartão de papel girando: vuuush curto e agudo com tremulação"""
    n = int(d * SR)
    x = _sweep_bp(rng.standard_normal(n), 1800, 5000, q=1.6)
    u = np.linspace(0, 1, n)
    trem = 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 38 * u * d))
    return _norm(x * np.sin(np.pi * u) * trem, 0.7)


def click(rng, f=3200, d=0.03):
    n = int(d * SR)
    t = _t(d)
    x = _bp(rng.standard_normal(n), f * 0.6, f * 1.8) * _env(n, 0.0005, 0.006, 4)
    x += 0.5 * np.sin(2 * np.pi * f * t) * _env(n, 0.0005, 0.012, 5)
    return _norm(x, 0.6)


def key(rng):
    """tecla de máquina de escrever: estalo + 'toc' grave"""
    f = 2400 + rng.uniform(-400, 500)
    c = click(rng, f, 0.035)
    t = _t(0.05)
    thock = np.sin(2 * np.pi * (180 + rng.uniform(-20, 20)) * t) * _env(len(t), 0.001, 0.02, 5)
    out = np.zeros(len(t))
    out[:len(c)] += c
    return _norm(out + 0.5 * thock, 0.55)


def typing(rng, d=1.0, rate=14):
    n = int(d * SR)
    out = np.zeros(n)
    t = 0.0
    while t < d - 0.06:
        k = key(rng)
        i = int(t * SR)
        out[i:i + len(k)] += k[:max(0, n - i)] * rng.uniform(0.7, 1.0)
        t += rng.uniform(0.6, 1.4) / rate
    return _norm(out, 0.6)


def check(rng):
    """visto a lápis: dois riscos rápidos"""
    parts = []
    for d, f0, f1 in [(0.07, 2500, 5200), (0.13, 3000, 7000)]:
        n = int(d * SR)
        x = _sweep_bp(rng.standard_normal(n), f0, f1, q=2)
        u = np.linspace(0, 1, n)
        parts.append(x * np.sin(np.pi * u) * (0.7 + 0.3 * np.sin(2 * np.pi * 90 * u * d)))
        parts.append(np.zeros(int(0.025 * SR)))
    return _norm(np.concatenate(parts), 0.55)


def stamp(rng):
    """carimbo: baque grave + tapa no papel"""
    d = 0.5
    t = _t(d)
    n = len(t)
    f = 95 * np.exp(-t * 6) + 45
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(n, 0.002, 0.16, 3)
    slap = _hp(rng.standard_normal(n), 1500) * _env(n, 0.0005, 0.02, 5)
    thump = _lp(rng.standard_normal(n), 600) * _env(n, 0.001, 0.05, 4)
    return _norm(body + 0.45 * slap + 0.6 * thump, 0.95)


def hit(rng, f=60, d=0.8):
    """pancada de texto (impacto curto, sem estrondo)"""
    t = _t(d)
    n = len(t)
    fr = f * 1.8 * np.exp(-t * 14) + f
    body = np.sin(2 * np.pi * np.cumsum(fr) / SR) * _env(n, 0.002, 0.3, 3)
    trans = _bp(rng.standard_normal(n), 800, 4000) * _env(n, 0.0005, 0.015, 5)
    return _norm(body + 0.35 * trans, 0.9)


def boom(rng, d=2.4):
    """queda: sub grave descendo + estrondo de ruído + rangidos metálicos"""
    t = _t(d)
    n = len(t)
    f = 70 * np.exp(-t * 1.4) + 28
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(n, 0.004, 1.0, 2.2)
    crash = _lp(rng.standard_normal(n), 900) * _env(n, 0.002, 0.6, 2.5)
    metal = sum(np.sin(2 * np.pi * fm * t + rng.uniform(0, 6)) * _env(n, 0.002, r, 3) for fm, r in [(310, 0.5), (742, 0.35), (1530, 0.25), (2210, 0.18)])
    grit = _bp(rng.standard_normal(n), 2000, 7000) * _env(n, 0.001, 0.12, 4)
    return _norm(sub * 1.0 + crash * 0.8 + metal * 0.12 + grit * 0.3, 0.98)


def fire(rng, d=4.0):
    """fogo: chiado grave + estalos aleatórios"""
    n = int(d * SR)
    base = _lp(rng.standard_normal(n), 260) * 0.5
    hiss = _bp(rng.standard_normal(n), 1500, 6000) * 0.08
    pops = np.zeros(n)
    for _ in range(int(d * 22)):
        i = rng.integers(0, n - 2000)
        p = _bp(rng.standard_normal(1600), 900, 5000) * _env(1600, 0.0003, 0.008, 5)
        pops[i:i + 1600] += p * rng.uniform(0.2, 1.0)
    u = np.linspace(0, 1, n)
    return _norm((base + hiss + pops * 0.6) * np.minimum(1, u * 6) * np.minimum(1, (1 - u) * 3), 0.7)


def engine(rng, d=6.0, rpm=1.0, flyby=False):
    """motor radial de hélice (4 motores levemente desafinados), com passagem doppler opcional"""
    t = _t(d)
    n = len(t)
    out = np.zeros(n)
    u = np.linspace(0, 1, n)
    dop = (1.08 - 0.16 * (1 / (1 + np.exp(-(u - 0.5) * 10)))) if flyby else np.ones(n)
    for k, df in enumerate([0, 0.6, -0.5, 1.1]):
        f = (21.5 + df) * rpm * dop
        ph = 2 * np.pi * np.cumsum(f) / SR + k
        pulse = (np.sin(ph) > 0.55).astype(float)                                   # explosões do cilindro
        out += _lp(pulse - pulse.mean(), 420 if flyby else 300)
        out += 0.35 * np.sin(ph * 9) * (0.5 + 0.5 * np.sin(ph))                      # zumbido da hélice
    wind = _bp(rng.standard_normal(n), 300, 2500) * 0.25
    amp = (np.exp(-((u - 0.5) / 0.22) ** 2) if flyby else np.minimum(1, u * 2.5) * np.minimum(1, (1 - u) * 4))
    return _norm((out + wind) * amp, 0.75)


def odometer(rng, d=1.3):
    """contador mecânico girando: estalos rápidos que desaceleram + trava final"""
    n = int(d * SR)
    out = np.zeros(n)
    t = 0.0
    while t < d - 0.12:
        c = click(rng, 4200 + rng.uniform(-300, 300), 0.02)
        i = int(t * SR)
        out[i:i + len(c)] += c * 0.5
        t += 0.018 + 0.09 * (t / d) ** 2
    cl = stamp(rng)[:int(0.25 * SR)] * 0.4
    out[n - len(cl):] += cl
    return _norm(out, 0.6)


def blip(rng, f0=660, f1=990, d=0.09):
    """bipe de 8 bits (o avatar: entrada e gestos)"""
    t = _t(d)
    f = f0 + (f1 - f0) * np.minimum(1, t / (d * 0.6))
    sq = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
    return _norm(_lp(sq, 5000) * _env(len(t), 0.002, d * 0.7, 2.5), 0.45)


def pop_in(rng):
    """o avatar sobe: bloop ascendente de 8 bits + respiro de ar"""
    a = blip(rng, 330, 880, 0.14)
    w = whoosh(rng, 0.25, 600, 3000) * 0.25
    out = np.zeros(max(len(a), len(w)))
    out[:len(a)] += a
    out[:len(w)] += w
    return _norm(out, 0.5)


def pop_out(rng):
    a = blip(rng, 880, 330, 0.14)
    return _norm(a, 0.4)


def shimmer(rng, d=1.0):
    t = _t(d)
    n = len(t)
    out = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * _env(n, rng.uniform(0.005, 0.08), d * rng.uniform(0.4, 0.9), 3) for f in rng.uniform(2200, 6400, 7))
    return _norm(out, 0.35)


def lever(rng):
    """trava: estalo metálico com 'clunk'"""
    d = 0.35
    t = _t(d)
    n = len(t)
    body = np.sin(2 * np.pi * 160 * t) * _env(n, 0.001, 0.08, 4) + 0.6 * np.sin(2 * np.pi * 410 * t) * _env(n, 0.001, 0.05, 4)
    c = np.zeros(n)
    k = click(rng, 3600, 0.03)
    c[:len(k)] += k
    return _norm(body + 0.8 * c, 0.8)


def alarm(rng, d=0.7):
    """alerta de cabine: dois toques de 880 Hz"""
    out = np.zeros(int(d * SR))
    for s in (0.0, 0.3):
        t = _t(0.16)
        b = (np.sin(2 * np.pi * 880 * t) + 0.3 * np.sin(2 * np.pi * 1760 * t)) * np.minimum(1, t / 0.005) * np.minimum(1, (0.16 - t) / 0.01)
        i = int(s * SR)
        out[i:i + len(b)] += b
    return _norm(out, 0.4)


def printer(rng, d=1.1):
    """impressão (logo): zumbido da cabeça correndo + chiado"""
    t = _t(d)
    n = len(t)
    buzz = _lp(np.sign(np.sin(2 * np.pi * 118 * t)), 1800) * 0.3
    hiss = _bp(rng.standard_normal(n), 1200, 4200) * 0.25
    gate = 0.6 + 0.4 * (np.sin(2 * np.pi * 9 * t) > 0)
    u = np.linspace(0, 1, n)
    return _norm((buzz + hiss) * gate * np.minimum(1, u * 12) * np.minimum(1, (1 - u) * 12), 0.45)


def pen(rng, d=1.3):
    """caneta escrevendo (Escher): raspado modulado"""
    n = int(d * SR)
    t = _t(d)
    x = _bp(rng.standard_normal(n), 2500, 7500)
    mod = np.abs(np.sin(2 * np.pi * 5.5 * t + 3 * np.sin(2 * np.pi * 1.3 * t))) ** 1.5
    u = np.linspace(0, 1, n)
    return _norm(x * mod * np.minimum(1, u * 8) * np.minimum(1, (1 - u) * 8), 0.35)


def riser(rng, d=1.5):
    n = int(d * SR)
    x = _sweep_bp(rng.standard_normal(n), 200, 6000, q=2.5)
    u = np.linspace(0, 1, n)
    tone = np.sin(2 * np.pi * np.cumsum(120 * (8 ** u)) / SR) * 0.3
    return _norm((x + tone) * u ** 2.4, 0.6)


def plop(rng):
    t = _t(0.12)
    f = 320 * np.exp(-t * 18) + 110
    return _norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(len(t), 0.002, 0.06, 3), 0.6)


FX = {k: v for k, v in globals().items() if callable(v) and not k.startswith('_') and k not in ('render_cues',)}


def render_cues(cues, dur):
    """soma os efeitos numa trilha estéreo de `dur` segundos"""
    n = int(dur * SR)
    out = np.zeros((n, 2), np.float32)
    for k, c in enumerate(cues):
        rng = np.random.default_rng(1000 + k)
        args = {a: b for a, b in c.items() if a not in ('t', 'fx', 'db', 'pan')}
        x = FX[c['fx']](rng, **args).astype(np.float32)
        g = 10 ** (c.get('db', 0) / 20)
        p = c.get('pan', 0.0)
        l, r = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)
        i = int(c['t'] * SR)
        if i >= n:
            continue
        m = min(len(x), n - i)
        out[i:i + m, 0] += x[:m] * g * l * 1.414
        out[i:i + m, 1] += x[:m] * g * r * 1.414
    return out
