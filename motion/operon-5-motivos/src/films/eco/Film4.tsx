// "TURING E A ENIGMA" — mesma linguagem da série (ponto laranja, gravura/foto tratada, papel ↔ escuro, olho no fim),
// com variações próprias: palavras que se DECIFRAM, cortina de RELÓGIO (rotor) e o logo Yohann Escher como assinatura.
// Enigma (configuração diária) → 158 quintilhões → Turing e a Bombe → força bruta não basta → silêncio: um detalhe humano →
// a pista da previsão do tempo → só o que fazia sentido → velocidade × contexto → agentes de IA: sem contexto (cinza) ×
// com contexto (papel) → saber o que dizer → o olho → o logo.
import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {useFonts} from '../../lib/fonts';
import {E, P, clamp, lerp} from '../../lib/core';
import {FPS, T} from './time4';
import {C, Cut, Dot, Dust, F, Flash, Grain, IMG, Label, Paper, Reveal, Ring, Thin, Vignette, emWidth, img, usePreload} from './fx';
import {Eye, Net, rng} from './sims';
import DIMS from './img4.json';

Object.assign(IMG, DIMS as unknown as Record<string, [number, number]>);
const ALL = Object.keys(DIMS).filter((k) => !k.startsWith('logo'));
const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const hash = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- cena / câmera (+ cortina de relógio, nova neste episódio) ----------
type Wipe = {kind: 'iris' | 'slit' | 'clock'; x?: number; y?: number; d: number};
const clock = (w: number, x: number, y: number) => { const pts = [`${x}px ${y}px`]; const R = 2400, n = Math.max(2, Math.ceil(w * 64)); for (let k = 0; k <= n; k++) { const a = -Math.PI / 2 + (k / n) * w * Math.PI * 2; pts.push(`${(x + Math.cos(a) * R).toFixed(0)}px ${(y + Math.sin(a) * R).toFixed(0)}px`); } return `polygon(${pts.join(',')})`; };
const Scene: React.FC<{t: number; a: number; b: number; inD?: number; outD?: number; zIn?: number; zOut?: number; children: React.ReactNode; bg?: string; light?: boolean; wipe?: Wipe; hold?: boolean}> = ({t, a, b, inD = 0.18, outD = 0.18, zIn = 1.06, zOut = 1.1, children, bg, light, wipe, hold}) => {
  if (t < a - 0.001 || t > b + outD) return null;
  const q = hold ? 0 : P(t, b, outD, E.in);
  const back = light ? <Paper /> : <div style={{position: 'absolute', inset: 0, background: bg ?? C.ink}} />;
  if (wipe) {
    const w = P(t, a, wipe.d, E.io), x = wipe.x ?? 540, y = wipe.y ?? 960, z = lerp(1.08, 1, P(t, a, wipe.d + 0.3, E.out));
    const clip = w >= 1 ? undefined : wipe.kind === 'iris' ? `circle(${(w * 2300).toFixed(0)}px at ${x}px ${y}px)` : wipe.kind === 'clock' ? clock(w, x, y) : `inset(0 ${((1 - w) * 50).toFixed(2)}% 0 ${((1 - w) * 50).toFixed(2)}%)`;
    return <div style={{position: 'absolute', inset: 0, clipPath: clip, opacity: 1 - q, transform: `scale(${z * lerp(1, zOut, q)})`, filter: q > 0 ? `blur(${(q * 14).toFixed(1)}px)` : undefined}}>{back}{children}</div>;
  }
  const u = inD > 0 ? P(t, a, inD, E.out) : 1;
  return <div style={{position: 'absolute', inset: 0, opacity: Math.min(u * 1.2, 1) * (1 - q), transform: `scale(${lerp(zIn, 1, u) * lerp(1, zOut, q)})`, filter: u < 1 || q > 0 ? `blur(${((1 - u) * 10 + q * 14).toFixed(1)}px)` : undefined}}>{(light || bg) && back}{children}</div>;
};
const Cam: React.FC<{t: number; a: number; b: number; z0?: number; z1?: number; ox?: number; oy?: number; rot?: number; children: React.ReactNode}> = ({t, a, b, z0 = 1, z1 = 1.08, ox = 540, oy = 960, rot = 0, children}) => {
  const u = P(t, a, b - a, E.smooth);
  return <div style={{position: 'absolute', inset: 0, transformOrigin: `${ox}px ${oy}px`, transform: `scale(${lerp(z0, z1, u).toFixed(4)}) rotate(${(rot * u).toFixed(3)}deg)`}}>{children}</div>;
};

// ---------- palavra que se DECIFRA (letras embaralhadas travam da esquerda para a direita) ----------
const Cipher: React.FC<{t: number; at: number; out: number; text: string; size: number; y: number; color?: string; x?: number; glow?: boolean; maxW?: number}> = ({t, at, out, text, size: want, y, color = C.bone, x = 540, glow, maxW = 880}) => {
  if (t < at - 0.05 || t > out + 0.4) return null;
  const size = Math.min(want, maxW / (emWidth(text) - 0.035 * (text.length - 1))), q = P(t, out, 0.3, E.in), tick = Math.floor(t * 24);
  return (
    <div style={{position: 'absolute', left: x - 1400, width: 2800, top: y - size * 0.62, textAlign: 'center', fontFamily: F.head, fontWeight: 900, fontSize: size, lineHeight: 1.1, letterSpacing: '-0.035em', whiteSpace: 'nowrap', opacity: 1 - q, filter: q > 0 ? `blur(${(q * 14).toFixed(1)}px)` : undefined, transform: `scale(${lerp(1, 1.1, q)})`, textShadow: glow ? `0 0 40px ${C.or}aa, 0 0 120px ${C.or}55` : undefined}}>
      {[...text].map((ch, i) => { const lock = at + 0.08 + i * 0.05, on = t >= at + i * 0.018, locked = t >= lock || ch === ' ' || ch === '.';
        const shown = locked ? ch : AZ[Math.floor(hash(tick, i) * 26)];
        return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: on ? (locked ? 1 : 0.55) : 0, color: locked ? color : C.or, transform: locked ? `translateY(${(-0.04 * Math.exp(-(t - lock) / 0.08)).toFixed(3)}em)` : undefined}}>{shown}</span>; })}
    </div>
  );
};

const useCanvas = (draw: (g: CanvasRenderingContext2D) => void, deps: unknown[]) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const c = ref.current; if (!c) return; const g = c.getContext('2d')!; g.clearRect(0, 0, 1080, 1920); draw(g); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
};

// ---------- rotores: colunas de letras girando que travam ----------
const Reels: React.FC<{t: number; stops: number[]; opacity?: number; y?: number}> = ({t, stops, opacity = 1, y = 960}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity}}>
    <defs><linearGradient id="reelFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={1} /><stop offset="0.35" stopColor="#000" stopOpacity={0} /><stop offset="0.65" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={1} /></linearGradient></defs>
    {[300, 540, 780].map((cx, k) => { const st = stops[k], spin = t < st ? (t - 1) * (9 + k * 3) : (st - 1) * (9 + k * 3), off = spin - Math.floor(spin), base = Math.floor(spin), lockU = t >= st ? P(t, st, 0.25, E.settle) : 0; return (
      <g key={k}>
        <clipPath id={`reel${k}`}><rect x={cx - 92} y={y - 330} width={184} height={660} rx={18} /></clipPath>
        <rect x={cx - 92} y={y - 330} width={184} height={660} rx={18} fill="#151517" stroke={C.mid} strokeWidth={2} />
        <g clipPath={`url(#reel${k})`}>
        {Array.from({length: 7}, (_, j) => { const pos = (j - 3 - off) * 108 + (t >= st ? -off * 108 * (1 - lockU) + off * 108 * (1 - lockU) : 0); const ch = AZ[(base + j * 7 + k * 5 + 26 * 9) % 26]; const centre = Math.abs(pos) < 54; return <text key={j} x={cx} y={y + pos + 34} textAnchor="middle" fontFamily={F.head} fontWeight={900} fontSize={96} fill={centre && t >= st ? C.or : C.bone} opacity={0.9} style={centre && t >= st ? {filter: `drop-shadow(0 0 12px ${C.or})`} : undefined}>{ch}</text>; })}
        </g>
        <rect x={cx - 92} y={y - 330} width={184} height={660} rx={18} fill="url(#reelFade)" />
        <rect x={cx - 98} y={y - 62} width={196} height={124} rx={10} fill="none" stroke={t >= st ? C.or : C.mid} strokeWidth={3} />
      </g>); })}
  </svg>
);

// ---------- árvore de combinações (explode em ramos) ----------
const TREE: {x1: number; y1: number; x2: number; y2: number; d: number}[] = [];
(() => { const go = (x: number, y: number, ang: number, len: number, d: number) => { if (d > 9) return; const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len; TREE.push({x1: x, y1: y, x2, y2, d}); go(x2, y2, ang - 0.32, len * 0.8, d + 1); go(x2, y2, ang + 0.32, len * 0.8, d + 1); }; go(540, 1720, -Math.PI / 2, 120, 0); })();
const Tree: React.FC<{t: number; a: number; color: string}> = ({t, a, color}) => {
  const g = P(t, a, 2.2, E.out) * 10;
  return <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>{TREE.map((s, i) => { const u = clamp(g - s.d); return u > 0 && <line key={i} x1={s.x1} y1={s.y1} x2={lerp(s.x1, s.x2, u)} y2={lerp(s.y1, s.y2, u)} stroke={s.d > 7 && i % 37 === 0 ? C.or : color} strokeWidth={Math.max(0.6, 3.2 - s.d * 0.3)} opacity={0.75} />; })}</svg>;
};

// ---------- força bruta: matriz de letras que não para ----------
const Matrix: React.FC<{t: number; frozen?: number; color?: string; opacity?: number; hot?: number}> = ({t, frozen = 999, color = C.bone, opacity = 1, hot = 0}) => {
  const ref = useCanvas((g) => {
    const tt = Math.min(t, frozen), tick = Math.floor(tt * 30), cols = 22, rows = 34, cw = 1080 / cols, ch = 1920 / rows;
    g.font = `500 ${Math.round(cw * 0.62)}px ${F.mono}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const v = hash(tick + c * 3, r * 7 + c), sweep = Math.exp(-Math.pow(((r - (tt * 14) % rows) + rows) % rows, 2) / 6);
      const isHot = hot > 0 && hash(c, r) < 0.012 * hot;
      g.globalAlpha = opacity * (isHot ? 1 : 0.18 + 0.35 * v + 0.45 * sweep); g.fillStyle = isHot ? C.or : color;
      g.fillText(AZ[Math.floor(hash(tick * 0.37 + r, c * 1.3) * 26)], c * cw + cw / 2, r * ch + ch / 2);
    }
    g.globalAlpha = 1;
  }, [t, frozen, color, opacity, hot]);
  return <canvas ref={ref} width={1080} height={1920} style={{position: 'absolute', inset: 0}} />;
};

// ---------- funil: de quintilhões de pontos para os poucos que fazem sentido ----------
const rf = rng(17);
const FUN = Array.from({length: 2600}, () => ({x: 60 + rf() * 960, y: 260 + rf() * 1060, k: rf()}));
const Funnel: React.FC<{t: number}> = ({t}) => {
  const ref = useCanvas((g) => {
    const cut = P(t, T.pista, 1.3, E.io), conv = P(t, T.so - 0.1, 1.2, E.io);
    FUN.forEach((p) => { const keep = p.k < 0.02, a = keep ? 1 : 1 - cut; if (a <= 0.01) return; const x = keep ? lerp(p.x, 540 + (p.x - 540) * 0.12, conv) : p.x, y = keep ? lerp(p.y, 790 + (p.y - 790) * 0.12, conv) : p.y; g.globalAlpha = a * (keep ? 1 : 0.55); g.fillStyle = keep && cut > 0.3 ? C.or : C.bone; const s = keep ? 3 + 3 * cut : 2.2; if (keep && cut > 0.3) { g.shadowColor = C.or; g.shadowBlur = 10; } g.fillRect(x - s / 2, y - s / 2, s, s); g.shadowBlur = 0; });
    g.globalAlpha = 1;
  }, [t]);
  return <canvas ref={ref} width={1080} height={1920} style={{position: 'absolute', inset: 0}} />;
};

// ================================================================== cenas
// 0 · a Enigma: rotores mudando todo dia
const S0: React.FC<{t: number}> = ({t}) => {
  const lift = P(t, T.maquina - 0.3, 0.9, E.out), date = Math.min(30, Math.floor(Math.max(0, t - T.todos) * 14) + 1);
  return (
    <Cam t={t} a={0} b={8.2} z0={1.12} z1={1.0}>
      <Reveal name="rotors" p={P(t, 0.1, 2.2, E.smooth)} x={540} y={960} width={1300} opacity={0.22} edge={0} />
      <div style={{position: 'absolute', inset: 0, transformOrigin: '540px 960px', transform: `scale(${lerp(1, 0.62, lift)}) translateY(${(-lift * 560).toFixed(0)}px)`, opacity: lerp(1, 0.55, lift)}}>
        <Reels t={t} stops={[T.todos, T.todos + 0.28, T.dias]} />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: lift, transform: `translateY(${((1 - lift) * 160).toFixed(0)}px)`}}>
        <Reveal name="enigma" p={P(t, T.maquina - 0.3, 1.1, E.smooth)} x={540} y={1150} width={400} edge={0} />
      </div>
      <Dot x={540} y={960} r={14 * P(t, 0.3, 0.5, E.out) * (1 - lift)} glow={1.4} />
      <Cipher t={t} at={T.enigma - 0.05} out={8.05} text="ENIGMA" size={210} y={300} />
      <Label t={t} at={T.na} out={8.0} text={t > T.todos ? `CONFIGURAÇÃO DO DIA · ${String(date).padStart(2, '0')}.06.1940` : 'FIG. I — A MÁQUINA ENIGMA'} y={230} align="center" />
    </Cam>
  );
};
// 1 · 158 quintilhões (papel)
const S1: React.FC<{t: number}> = ({t}) => {
  const roll = P(t, T.n158 - 0.1, 1.4, E.out), full = '158.962.555.217.826.360.000';
  return (
    <Cam t={t} a={8.2} b={12.35} z0={1.0} z1={1.06} oy={700}>
      <Tree t={t} a={T.quint} color={C.pen} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: F.head, fontWeight: 900, fontSize: 360, letterSpacing: '-0.04em', color: C.pen, lineHeight: 1}}>{roll > 0 && [...'158'].map((d, i) => { const u = P(t, T.n158 - 0.1 + i * 0.08, 0.6, E.settle); return <span key={i} style={{display: 'inline-block', overflow: 'hidden', height: '0.92em', verticalAlign: 'top'}}><span style={{display: 'inline-block', transform: `translateY(${((1 - u) * 1.0).toFixed(3)}em)`}}>{d}</span></span>; })}</div>
      <Cipher t={t} at={T.quint - 0.05} out={12.2} text="QUINTILHÕES" size={130} y={830} color={C.or} />
      <Label t={t} at={T.quint + 0.2} out={12.2} text={full.slice(0, Math.floor(clamp((t - T.quint - 0.2) / 0.8) * full.length))} y={950} align="center" color={C.pen} size={34} />
      <Thin t={t} at={T.comb - 0.05} out={12.2} text="combinações possíveis. todo dia." size={66} y={1060} color={C.pen} />
    </Cam>
  );
};
// 2 · Turing (escuro)
const S2: React.FC<{t: number}> = ({t}) => {
  const scan = P(t, 12.4, 1.2, E.io);
  return (
    <Cam t={t} a={12.3} b={16.95} z0={1.08} z1={1.0} oy={820}>
      <Reveal name="turing" p={P(t, 12.3, 1.0, E.smooth)} x={540} y={830} width={640} edge={0} />
      {scan > 0 && scan < 1 && <div style={{position: 'absolute', left: 220, width: 640, top: 830 - 424 + scan * 848, height: 3, background: C.or, boxShadow: `0 0 18px ${C.or}`, opacity: 0.8}} />}
      <Label t={t} at={T.alan} out={16.8} text="ALAN TURING · FOTO DE 1928" y={230} />
      <Label t={t} at={T.bletchley} out={16.8} text="BLETCHLEY PARK · INGLATERRA" y={275} color={C.or} />
      <Thin t={t} at={T.construiram - 0.1} out={16.85} text="uma máquina para testar combinações." size={70} y={1360} />
    </Cam>
  );
};
// 3 · a Bombe (papel)
const S3: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={16.9} b={18.8} z0={1.0} z1={1.08} oy={800}>
    <Reveal name="bombe" p={P(t, 16.85, 0.8, E.smooth)} x={540} y={790} width={960} edge={0} style={{filter: 'brightness(1.35) contrast(1.1)'}} />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <div key={k} style={{position: 'absolute', left: 190 + k * 92, top: 700 + (k % 2) * 90, width: 12, height: 12, borderRadius: 6, background: C.or, boxShadow: `0 0 12px ${C.or}`, opacity: Math.floor(t * 9 + k * 1.7) % 3 === 0 ? 1 : 0.15}} />)}
    <Cipher t={t} at={T.bombe - 0.08} out={18.65} text="BOMBE" size={250} y={1330} color={C.pen} />
    <Label t={t} at={17.0} out={18.6} text="FIG. II — BOMBE (VERSÃO AMERICANA, 1943)" y={230} color={C.pdim} />
  </Cam>
);
// 4 · força bruta não bastava (escuro)
const S4: React.FC<{t: number}> = ({t}) => {
  const strike = P(t, T.bastava, 0.3, E.out), hands = (t - 18.7) * (2 + Math.pow(Math.max(0, t - T.nenhuma), 2) * 6);
  return (
    <>
      <Matrix t={t} opacity={0.75} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 45% at 50% 50%, rgba(10,10,10,.92) 0%, rgba(10,10,10,.35) 100%)'}} />
      <Cipher t={t} at={T.forca - 0.08} out={22.45} text="FORÇA BRUTA" size={150} y={360} />
      <div style={{position: 'absolute', left: 140, top: 352, width: 800 * strike, height: 12, background: C.or, boxShadow: `0 0 20px ${C.or}`, transform: 'rotate(-3deg)', transformOrigin: '0 50%', opacity: t > 22.45 ? 0 : 1}} />
      {t > T.nenhuma - 0.3 && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: P(t, T.nenhuma - 0.3, 0.4)}}>
        <circle cx={540} cy={900} r={230} fill="none" stroke={C.bone} strokeWidth={3} />
        {Array.from({length: 60}, (_, k) => { const a = (k / 60) * Math.PI * 2, r0 = k % 5 === 0 ? 196 : 212; return <line key={k} x1={540 + Math.cos(a) * r0} y1={900 + Math.sin(a) * r0} x2={540 + Math.cos(a) * 226} y2={900 + Math.sin(a) * 226} stroke={C.bone} strokeWidth={k % 5 === 0 ? 3 : 1} />; })}
        <line x1={540} y1={900} x2={540 + Math.sin(hands) * 150} y2={900 - Math.cos(hands) * 150} stroke={C.bone} strokeWidth={8} strokeLinecap="round" />
        <line x1={540} y1={900} x2={540 + Math.sin(hands * 12) * 200} y2={900 - Math.cos(hands * 12) * 200} stroke={C.or} strokeWidth={4} strokeLinecap="round" />
        <circle cx={540} cy={900} r={10} fill={C.or} />
      </svg>}
      <Label t={t} at={T.mas} out={22.4} text={`TESTADAS: 0,${'0'.repeat(10)}${Math.floor((t - T.mas) * 7) % 10}%`} y={230} align="center" color={C.or} />
      <Thin t={t} at={T.nenhuma - 0.05} out={22.45} text="nenhuma máquina testaria tudo a tempo." size={66} y={1300} />
    </>
  );
};
// 5 · silêncio: um detalhe humano
const S5: React.FC<{t: number}> = ({t}) => (
  <>
    <Matrix t={t} frozen={22.6} opacity={0.3 * (1 - P(t, 22.6, 1.4))} />
    <div style={{position: 'absolute', inset: 0, opacity: P(t, 23.3, 1.3, E.out)}}><Reveal name="valentine" p={P(t, 23.3, 1.4, E.smooth)} x={540} y={800} width={470} edge={0} /></div>
    <Dot x={540} y={1130} r={10 + 4 * Math.sin(t * 3)} glow={1.6} />
    <Thin t={t} at={T.oque - 0.05} out={25.45} text="o que virou o jogo foi" size={84} y={1260} />
    <Thin t={t} at={T.detalhe - 0.2} out={25.45} text="um detalhe humano." size={118} y={1390} color={C.orHi} />
    <Label t={t} at={23.6} out={25.4} text="JEAN VALENTINE · OPERADORA DA BOMBE" y={230} />
  </>
);
// 6 · a pista: a previsão do tempo (papel)
const ROWS = [{d: 'DIA 1 · 06:00', at: T.previsao - 0.1}, {d: 'DIA 2 · 06:00', at: T.manha - 0.1}, {d: 'DIA 3 · 06:00', at: T.mesmas - 0.25}];
const CRIB = 'WETTERVORHERSAGE';
const S6: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={25.5} b={32.9} z0={1.0} z1={1.05} oy={700}>
    <Reveal name="weather" p={P(t, 25.4, 2.0, E.smooth)} x={540} y={610} width={860} light />
    <Label t={t} at={25.7} out={32.7} text="FIG. III — A PISTA: A PREVISÃO DO TEMPO" y={230} color={C.pdim} />
    {ROWS.map((r, i) => { const u = P(t, r.at, 0.4, E.out); if (u <= 0) return null; const dec = P(t, r.at + 0.25, 0.7); const tick = Math.floor(t * 20);
      return <div key={i} style={{position: 'absolute', left: 60, right: 60, top: 1030 + i * 96, fontFamily: F.mono, fontSize: 25, letterSpacing: '0.12em', color: C.pen, opacity: u, transform: `translateX(${((1 - u) * -40).toFixed(0)}px)`, whiteSpace: 'nowrap', overflow: 'hidden'}}>
        <span style={{color: C.pdim}}>{r.d}  </span>
        {Array.from({length: 5}, (_, k) => AZ[Math.floor(hash(i * 9 + k, 3) * 26)]).join('')}{' '}
        <span style={{background: dec > 0.05 ? `rgba(255,90,31,${0.16 * dec})` : undefined, boxShadow: dec > 0.05 ? `0 0 0 2px ${C.or}` : undefined, color: C.or, padding: '2px 4px', borderRadius: 4}}>{[...CRIB].map((c, k) => (k / CRIB.length < dec ? c : AZ[Math.floor(hash(tick + k, i) * 26)])).join('')}</span>{' '}
        {Array.from({length: 6}, (_, k) => AZ[Math.floor(hash(i * 5 + k, 11) * 26)]).join('')}
      </div>; })}
    <Thin t={t} at={T.eles - 0.05} out={T.previsao - 0.2} text="algumas mensagens se repetiam." size={74} y={1380} color={C.pen} />
    <Thin t={t} at={T.manha - 0.05} out={32.75} text="toda manhã, as mesmas palavras." size={74} y={1380} color={C.pen} />
  </Cam>
);
// 7 · só o que fazia sentido (escuro)
const S7: React.FC<{t: number}> = ({t}) => (
  <>
    <Funnel t={t} />
    <Dot x={540} y={790} r={16 * P(t, 36.2, 0.6, E.out)} glow={2} />
    <Thin t={t} at={T.pista - 0.35} out={T.so - 0.2} text="com essa pista, a máquina não testava tudo." size={60} y={1380} />
    <Thin t={t} at={T.so - 0.1} out={37.3} text="só o que fazia" size={84} y={1250} />
    <Cipher t={t} at={T.sentido - 0.1} out={37.3} text="SENTIDO." size={200} y={1380} color={C.or} />
    <Label t={t} at={33.0} out={37.2} text="COM A PISTA, A BUSCA ENCOLHE" y={230} />
  </>
);
// 8 · velocidade × contexto (papel)
const S8: React.FC<{t: number}> = ({t}) => {
  const ppl = P(t, T.pessoas - 0.35, 0.5, E.io);
  return (
    <Cam t={t} a={37.4} b={41.7} z0={1.0} z1={1.06} oy={800}>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - ppl, transform: `translateY(${(-ppl * 80).toFixed(0)}px)`}}>
        <Reveal name="bombe" p={P(t, 37.35, 0.7, E.smooth)} x={540} y={760} width={900} edge={0} style={{filter: 'brightness(1.35) contrast(1.1)'}} />
        <Thin t={t} at={T.maq5 - 0.15} out={T.pessoas - 0.3} text="a máquina dava" size={84} y={1230} color={C.pen} />
        <Cipher t={t} at={T.velocidade - 0.1} out={T.pessoas - 0.3} text="VELOCIDADE" size={170} y={1370} color={C.pen} />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: ppl, transform: `translateY(${((1 - ppl) * 80).toFixed(0)}px)`}}>
        <Reveal name="turing" p={ppl} x={330} y={760} width={400} edge={0} />
        <Reveal name="valentine" p={ppl} x={760} y={770} width={390} edge={0} />
        <Thin t={t} at={T.pessoas - 0.2} out={41.6} text="as pessoas davam o" size={84} y={1230} color={C.pen} />
      </div>
      <Cipher t={t} at={T.contexto - 0.08} out={41.6} text="CONTEXTO" size={200} y={1370} color={C.or} />
      <Ring t={t} at={T.contexto} x={540} y={1370} r1={1100} d={1.2} />
    </Cam>
  );
};
// 9 · agentes de IA: exatamente igual (escuro)
const S9: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={41.6} b={45.1} z0={1.2} z1={1.0} oy={780}>
    <Net t={t} a={41.6} cy={780} r={360} grow={P(t, 41.6, 1.2, E.out)} alive={1} spin={1.4} />
    <Dot x={540} y={780} r={16} glow={2} />
    <Label t={t} at={41.8} out={44.9} text="HOJE · AGENTES DE INTELIGÊNCIA ARTIFICIAL" y={230} color={C.or} />
    <Thin t={t} at={T.agentes - 0.1} out={T.igual - 0.55} text="com agentes de inteligência artificial…" size={66} y={1300} />
    <Cipher t={t} at={T.igual - 0.5} out={44.95} text="É IGUAL." size={190} y={1360} />
  </Cam>
);
// 10 · agente sem contexto: rápido, caro, perdido (cinza)
const S10: React.FC<{t: number}> = ({t}) => {
  const n = Math.floor(Math.pow(Math.max(0, t - 45.0), 2.2) * 41000);
  return (
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 70% at 50% 45%, #262629 0%, ${C.graph} 55%, #101012 100%)`}}>
      <Matrix t={t} color="#8d8a84" opacity={0.55} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 40% at 50% 46%, rgba(27,27,29,.95) 0%, rgba(27,27,29,.2) 100%)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>{Array.from({length: 26}, (_, k) => { const a = hash(Math.floor(t * 8), k) * Math.PI * 2, r = 200 + hash(k, Math.floor(t * 8)) * 500; return <line key={k} x1={540} y1={860} x2={540 + Math.cos(a) * r} y2={860 + Math.sin(a) * r} stroke="#b9b6ae" strokeWidth={1} opacity={0.35} />; })}<circle cx={540} cy={860} r={30} fill="#3a3a3e" stroke="#8d8a84" strokeWidth={3} /></svg>
      <Label t={t} at={45.1} out={51.2} text={`TENTATIVAS: ${n.toLocaleString('pt-BR')}`} y={230} align="center" color="#c9c6bf" />
      <Thin t={t} at={T.um - 0.05} out={T.bombe2 - 0.3} text="um agente sem contexto…" size={80} y={1250} color="#c9c6bf" />
      <Thin t={t} at={T.bombe2 - 0.25} out={T.rapido - 0.2} text="…é a Bombe testando quintilhões." size={66} y={1250} color="#c9c6bf" />
      <Cipher t={t} at={T.rapido - 0.05} out={51.2} text="RÁPIDO." size={150} y={1110} color="#9a978f" />
      <Cipher t={t} at={T.caro - 0.05} out={51.2} text="CARO." size={150} y={1240} color="#9a978f" />
      <Cipher t={t} at={T.perdido - 0.05} out={51.2} text="PERDIDO." size={150} y={1370} color="#c9c6bf" />
    </div>
  );
};
// 11 · agente com contexto: encontra a resposta antes do café (papel)
const PILLS = [{n: 'SEU JEITO DE VENDER', at: T.jeito, x: 300, y: 470}, {n: 'SEUS CLIENTES', at: T.clientes, x: 790, y: 620}, {n: 'SUAS REGRAS', at: T.regras, x: 330, y: 1010}];
const S11: React.FC<{t: number}> = ({t}) => {
  const fed = PILLS.filter((p) => t > p.at).length, ans = P(t, T.encontra, 0.5, E.out), AG = {x: 560, y: 790};
  return (
    <Cam t={t} a={51.3} b={59.5} z0={1.0} z1={1.05} oy={800}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {PILLS.map((p, i) => { const u = P(t, p.at, 0.6, E.io); return u > 0 && <line key={i} x1={p.x} y1={p.y} x2={lerp(p.x, AG.x, u)} y2={lerp(p.y, AG.y, u)} stroke={C.or} strokeWidth={3} strokeDasharray="10 9" strokeDashoffset={-t * 60} />; })}
        <circle cx={AG.x} cy={AG.y} r={70 + fed * 10} fill="none" stroke={C.pen} strokeWidth={2.5} />
        <circle cx={AG.x} cy={AG.y} r={110 + fed * 14} fill="none" stroke={C.or} strokeWidth={1.5} opacity={0.5} />
      </svg>
      <Dot x={AG.x} y={AG.y} r={16 + fed * 5} glow={1.2 + fed * 0.5} />
      <Label t={t} at={51.5} out={59.3} text="AGENTE" x={AG.x - 48} y={AG.y + 140} color={C.pdim} />
      {PILLS.map((p, i) => { const u = P(t, p.at - 0.15, 0.45, E.settle); return u > 0 && <div key={i} style={{position: 'absolute', left: p.x - 210, top: p.y - 32, width: 420, height: 64, borderRadius: 32, background: '#fffaf2', boxShadow: `0 0 0 2px ${C.pen}, 0 12px 30px rgba(0,0,0,.12)`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', boxSizing: 'border-box', fontFamily: F.mono, fontSize: 22, letterSpacing: '0.08em', color: C.pen, opacity: clamp(u * 1.5), transform: `scale(${lerp(0.7, 1, u)})`}}><span style={{width: 26, height: 26, borderRadius: 13, background: C.or, boxShadow: `0 0 10px ${C.or}`}} />{p.n}</div>; })}
      {ans > 0 && <div style={{position: 'absolute', left: 540 - 250, top: 1110, width: 500, height: 96, borderRadius: 18, background: C.pen, color: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, fontFamily: F.mono, fontSize: 30, letterSpacing: '0.14em', opacity: ans, transform: `translateY(${((1 - ans) * 30).toFixed(0)}px)`}}><span style={{color: C.or, fontSize: 36}}>✓</span>RESPOSTA · 00:04</div>}
      {/* a xícara de café, ainda fumegando */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: P(t, T.resposta, 0.5)}}>
        <path d="M800 1180 h150 v60 a75 60 0 0 1 -150 0 z" fill="none" stroke={C.pen} strokeWidth={4} />
        <path d="M950 1195 a26 24 0 0 1 0 48" fill="none" stroke={C.pen} strokeWidth={4} />
        {[0, 1, 2].map((k) => <path key={k} d={`M${840 + k * 36} 1165 q${12 * Math.sin(t * 3 + k)} -30 0 -60 q${-12 * Math.sin(t * 3 + k)} -30 0 -60`} fill="none" stroke={C.pen} strokeWidth={2.5} opacity={0.5} />)}
      </svg>
      <Thin t={t} at={T.conhece - 0.6} out={T.jeito - 0.2} text="um agente que conhece o seu negócio" size={70} y={1380} color={C.pen} />
      <Thin t={t} at={T.encontra - 0.05} out={59.3} text="antes de você terminar o café." size={74} y={1380} color={C.pen} />
    </Cam>
  );
};
// 12 · saber o que dizer (escuro)
const S12: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={59.4} b={63.7} z0={1.0} z1={1.1} oy={760}>
    <Reveal name="enigma" p={P(t, 59.35, 0.9, E.smooth)} x={540} y={720} width={380} edge={0} />
    <Thin t={t} at={T.diferencial - 0.15} out={T.saber - 0.25} text="o diferencial nunca foi ter a máquina." size={64} y={1300} />
    <Thin t={t} at={T.saber - 0.15} out={63.6} text="é saber" size={84} y={1230} />
    <Cipher t={t} at={T.dizer - 0.25} out={63.6} text="O QUE DIZER" size={170} y={1370} color={C.or} />
  </Cam>
);
// 13 · o olho (fecho da série)
const S13: React.FC<{t: number}> = ({t}) => {
  const open = t < T.sting ? P(t, T.por - 0.05, 0.9, E.io) * 0.92 + P(t, T.observa - 0.05, 0.35, E.out) * 0.08 : 1 - P(t, T.sting, 0.18, E.in);
  const pupil = t < T.observa ? 0.35 : lerp(0.35, 1, P(t, T.observa, 0.45, E.out));
  return (
    <>
      {open > 0.01 && <Eye t={t} open={Math.max(0.02, open)} pupil={pupil} cy={800} R={290} grid={0.1} />}
      <Thin t={t} at={T.por - 0.02} out={T.sting - 0.1} text="por enquanto…" size={86} y={1230} color={C.dim} />
      <Thin t={t} at={T.so2 - 0.05} out={T.sting + 0.15} text="só observa." size={136} y={1370} />
    </>
  );
};
// 14 · o logo: Yohann sobe em fatias (como tipo móvel), Escher é escrito à mão com a ponta laranja
const LOGO = {x0: 111, y0: 107, x1: 1345, y1: 739, w: 860};
const lg = (x: number, y: number) => { const s = LOGO.w / (LOGO.x1 - LOGO.x0), cx = (LOGO.x0 + LOGO.x1) / 2, cy = (LOGO.y0 + LOGO.y1) / 2; return {x: 540 + (x - cx) * s, y: 900 + (y - cy) * s, s}; };
const S14: React.FC<{t: number}> = ({t}) => {
  const a = T.sting + 0.35, yo = lg(111, 107), es = lg(202, 339), s = yo.s, YW = 1234 * s, YH = 630 * s, EW = 1008 * s, EH = 400 * s;
  const wr = P(t, a + 0.55, 1.35, E.smooth), shine = P(t, a + 2.1, 1.1, E.io), fade = P(t, 71.9, 0.7, E.in);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - fade}}>
      {Array.from({length: 6}, (_, k) => { const u = P(t, a + k * 0.07, 0.6, E.settle); return (
        <div key={k} style={{position: 'absolute', left: yo.x + (k * YW) / 6, top: yo.y, width: YW / 6 + 1, height: YH, overflow: 'hidden'}}>
          <Img src={img('logo_yohann')} style={{position: 'absolute', left: (-k * YW) / 6, top: (1 - u) * YH * 0.9, width: YW, height: YH, opacity: clamp(u * 3)}} />
        </div>); })}
      <div style={{position: 'absolute', left: es.x, top: es.y, width: EW, height: EH, WebkitMaskImage: `linear-gradient(90deg, #000 ${(wr * 100 - 6).toFixed(1)}%, transparent ${(wr * 100 + 2).toFixed(1)}%)`, maskImage: `linear-gradient(90deg, #000 ${(wr * 100 - 6).toFixed(1)}%, transparent ${(wr * 100 + 2).toFixed(1)}%)`}}>
        <Img src={img('logo_escher')} style={{position: 'absolute', inset: 0, width: EW, height: EH, filter: 'drop-shadow(0 6px 18px rgba(255,90,31,.25))'}} />
        {shine > 0 && shine < 1 && <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `url(${img('logo_escher')})`, maskImage: `url(${img('logo_escher')})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', background: `linear-gradient(100deg, transparent ${(shine * 140 - 30).toFixed(0)}%, rgba(255,255,255,.85) ${(shine * 140 - 15).toFixed(0)}%, transparent ${(shine * 140).toFixed(0)}%)`}} />}
      </div>
      {wr > 0 && wr < 1 && <Dot x={es.x + EW * wr} y={es.y + EH * (0.55 + 0.25 * Math.sin(wr * 18))} r={9} glow={1.6} />}
    </div>
  );
};

const LIGHT: [number, number][] = [[8.2, 12.3], [16.9, 18.75], [25.5, 32.85], [37.4, 41.65], [51.3, 59.45], [T.sting + 0.2, 73]];
export const Turing: React.FC<{audio: 'none' | 'mix'}> = ({audio}) => {
  useFonts(); usePreload(ALL);
  const frame = useCurrentFrame(), t = frame / FPS;
  const lightK = LIGHT.reduce((m, [a, b]) => Math.max(m, P(t, a, 0.4, E.io) * (1 - P(t, b, 0.35, E.io))), 0);
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden', fontFamily: F.head}}>
      <Scene t={t} a={0} b={8.2} inD={0} outD={0.5} hold><S0 t={t} /></Scene>
      <Scene t={t} a={8.2} b={12.3} light wipe={{kind: 'clock', x: 540, y: 600, d: 0.5}} outD={0.4} hold><S1 t={t} /></Scene>
      <Scene t={t} a={12.3} b={16.9} wipe={{kind: 'slit', d: 0.32}} outD={0.4} hold><S2 t={t} /></Scene>
      <Scene t={t} a={16.9} b={18.75} light wipe={{kind: 'iris', x: 540, y: 1360, d: 0.34}} outD={0.35} hold><S3 t={t} /></Scene>
      <Scene t={t} a={18.75} b={22.6} wipe={{kind: 'slit', d: 0.28}} outD={0.4} hold><S4 t={t} /></Scene>
      <Scene t={t} a={22.6} b={25.5} inD={0.4} zIn={1.0} outD={0.35} hold bg={C.ink}><S5 t={t} /></Scene>
      <Scene t={t} a={25.5} b={32.85} light wipe={{kind: 'clock', x: 540, y: 1130, d: 0.38}} outD={0.4} hold><S6 t={t} /></Scene>
      <Scene t={t} a={32.85} b={37.4} wipe={{kind: 'slit', d: 0.3}} outD={0.4} hold><S7 t={t} /></Scene>
      <Scene t={t} a={37.4} b={41.65} light wipe={{kind: 'iris', x: 540, y: 790, d: 0.35}} outD={0.4} hold><S8 t={t} /></Scene>
      <Scene t={t} a={41.65} b={45.05} wipe={{kind: 'clock', x: 540, y: 1370, d: 0.4}} outD={0.4} hold><S9 t={t} /></Scene>
      <Scene t={t} a={45.05} b={51.3} wipe={{kind: 'slit', d: 0.3}} bg={C.graph} outD={0.4} hold><S10 t={t} /></Scene>
      <Scene t={t} a={51.3} b={59.45} light wipe={{kind: 'iris', x: 540, y: 860, d: 0.38}} outD={0.4} hold><S11 t={t} /></Scene>
      <Scene t={t} a={59.45} b={63.65} wipe={{kind: 'clock', x: 540, y: 1370, d: 0.4}} outD={0.45} hold><S12 t={t} /></Scene>
      <Scene t={t} a={63.65} b={T.sting + 0.6} wipe={{kind: 'iris', x: 540, y: 800, d: 0.45}} outD={0.1}><S13 t={t} /></Scene>
      {t > T.sting && <Dot x={540} y={800} r={14 * (1 + 0.6 * Math.exp(-(t - T.sting) / 0.2)) * (1 - P(t, T.sting + 0.45, 0.3))} glow={2} />}
      <Scene t={t} a={T.sting + 0.2} b={74} light wipe={{kind: 'iris', x: 540, y: 800, d: 0.55}}><S14 t={t} /></Scene>
      <Dust t={t} n={55} opacity={(1 - lightK) * (t > 45 && t < 51.3 ? 0.25 : 0.6)} warm={0.08} />
      <Flash t={t} at={0.25} d={0.5} color={C.or} max={0.3} />
      <Flash t={t} at={T.eles} d={0.45} max={0.6} />
      <Flash t={t} at={T.contexto} d={0.5} color={C.or} max={0.45} />
      <Flash t={t} at={T.sting} d={0.6} color={C.or} max={0.5} />
      <Ring t={t} at={T.sting} x={540} y={800} r1={1300} d={1.4} />
      <Vignette strength={lerp(0.8, 0.32, lightK)} />
      <Grain frame={frame} amount={0.07 * (1 - lightK)} />
      <Grain frame={frame} amount={0.1 * lightK} dark />
      {audio === 'mix' && <Audio src={staticFile('eco4/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
