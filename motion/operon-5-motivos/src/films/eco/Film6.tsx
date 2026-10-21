// "O LUGAR ERRADO" — Goldratt e o gargalo. Mesma linguagem da série (ponto laranja, papel ↔ escuro, olho no fim, logo),
// com variações próprias: a AMPULHETA (o gargalo literal) que abre e fecha o vídeo, a FÁBRICA e a EMPRESA como simulações
// de fila de verdade (a fila se forma sozinha antes da máquina lenta e muda de lugar quando cada agente entra), a pergunta
// que vira AREIA, a MIRAGEM que tremula como calor e o logo que se forma com areia.
import React, {useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {useFonts} from '../../lib/fonts';
import {E, P, clamp, lerp} from '../../lib/core';
import {FPS, T} from './time6';
import {C, Dot, Dust, F, Flash, Grain, IMG, Label, Paper, Reveal, Ring, Thin, Vignette, emWidth, img, usePreload} from './fx';
import {Eye, rng} from './sims';
import DIMS from './img6.json';

Object.assign(IMG, DIMS as unknown as Record<string, [number, number]>);
const ALL = Object.keys(DIMS).filter((k) => !k.startsWith('logo'));
const mix = (a: string, b: string, k: number) => { const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16); return `rgb(${[0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), clamp(k)))).join(',')})`; };

// ---------- cena / câmera (cortinas: íris, ampulheta e "escoamento" de cima para baixo) ----------
type Wipe = {kind: 'iris' | 'glass' | 'drain'; x?: number; y?: number; d: number};
const glass = (w: number, x: number, y: number) => { const r = E.io(w) * 2300, n = Math.max(4, r * 0.04); return `polygon(${x - r}px ${y - r}px, ${x + r}px ${y - r}px, ${x + n}px ${y}px, ${x + r}px ${y + r}px, ${x - r}px ${y + r}px, ${x - n}px ${y}px)`; };
const Scene: React.FC<{t: number; a: number; b: number; inD?: number; outD?: number; zIn?: number; zOut?: number; children: React.ReactNode; bg?: string; light?: boolean; wipe?: Wipe; hold?: boolean}> = ({t, a, b, inD = 0.18, outD = 0.18, zIn = 1.06, zOut = 1.1, children, bg, light, wipe, hold}) => {
  if (t < a - 0.001 || t > b + outD) return null;
  const q = hold ? 0 : P(t, b, outD, E.in);
  const back = light ? <Paper /> : <div style={{position: 'absolute', inset: 0, background: bg ?? C.ink}} />;
  if (wipe) {
    const w = P(t, a, wipe.d), x = wipe.x ?? 540, y = wipe.y ?? 960, z = lerp(1.06, 1, P(t, a, wipe.d + 0.3, E.out));
    const clip = w >= 1 ? undefined : wipe.kind === 'iris' ? `circle(${(E.io(w) * 2300).toFixed(0)}px at ${x}px ${y}px)` : wipe.kind === 'glass' ? glass(w, x, y) : `inset(0 0 ${((1 - E.io(w)) * 100).toFixed(2)}% 0)`;
    return <div style={{position: 'absolute', inset: 0, clipPath: clip, opacity: 1 - q, transform: `scale(${z * lerp(1, zOut, q)})`, filter: q > 0 ? `blur(${(q * 14).toFixed(1)}px)` : undefined}}>{back}{children}</div>;
  }
  const u = inD > 0 ? P(t, a, inD, E.out) : 1;
  return <div style={{position: 'absolute', inset: 0, opacity: Math.min(u * 1.2, 1) * (1 - q), transform: `scale(${lerp(zIn, 1, u) * lerp(1, zOut, q)})`, filter: u < 1 || q > 0 ? `blur(${((1 - u) * 10 + q * 14).toFixed(1)}px)` : undefined}}>{(light || bg) && back}{children}</div>;
};
const Cam: React.FC<{t: number; a: number; b: number; z0?: number; z1?: number; ox?: number; oy?: number; children: React.ReactNode}> = ({t, a, b, z0 = 1, z1 = 1.08, ox = 540, oy = 960, children}) => {
  const u = P(t, a, b - a, E.smooth);
  return <div style={{position: 'absolute', inset: 0, transformOrigin: `${ox}px ${oy}px`, transform: `scale(${lerp(z0, z1, u).toFixed(4)})`}}>{children}</div>;
};
const useCanvas = (draw: (g: CanvasRenderingContext2D) => void, deps: unknown[]) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const c = ref.current; if (!c) return; const g = c.getContext('2d')!; g.clearRect(0, 0, 1080, 1920); draw(g); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
};
const Cv: React.FC<{cref: React.RefObject<HTMLCanvasElement>; opacity?: number}> = ({cref, opacity = 1}) => <canvas ref={cref} width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity}} />;

// ---------- tinta fresca (a mesma assinatura tipográfica do episódio anterior) ----------
const fitSize = (text: string, want: number, maxW: number) => Math.min(want, maxW / (emWidth(text) - 0.035 * (text.length - 1)));
export const Ink: React.FC<{t: number; at: number; out: number; text: string; size: number; y: number; color?: string; x?: number; stagger?: number; maxW?: number}> = ({t, at, out, text, size: want, y, color = C.bone, x = 540, stagger = 0.034, maxW = 880}) => {
  if (t < at - 0.05 || t > out + 0.4) return null;
  const size = fitSize(text, want, maxW), q = P(t, out, 0.3, E.in), hot = color === C.or ? C.orHi : C.or;
  return (
    <div style={{position: 'absolute', left: x - 1400, width: 2800, top: y - size * 0.62, textAlign: 'center', fontFamily: F.head, fontWeight: 900, fontSize: size, lineHeight: 1.1, letterSpacing: '-0.035em', whiteSpace: 'nowrap', opacity: 1 - q, filter: q > 0 ? `blur(${(q * 14).toFixed(1)}px)` : undefined, transform: `scale(${lerp(1, 1.1, q)})`}}>
      {[...text].map((ch, i) => { const a0 = at + i * stagger, u = P(t, a0, 0.26, E.out), cool = P(t, a0 + 0.1, 0.6, E.smooth);
        return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: clamp(u * 2.5), color: mix(hot, color, cool), transform: `scale(${lerp(1.32, 1, u).toFixed(3)})`, textShadow: cool < 0.98 ? `0 0 ${(34 * (1 - cool)).toFixed(0)}px ${C.or}` : undefined}}>{ch}</span>; })}
    </div>
  );
};

// ---------- MIRAGEM: a palavra tremula como ar quente e se reflete na água ----------
const Mirage: React.FC<{t: number; frame: number; at: number; out: number; text: string; size: number; y: number; color?: string; id: string}> = ({t, frame, at, out, text, size: want, y, color = C.or, id}) => {
  if (t < at - 0.05 || t > out + 0.4) return null;
  const size = fitSize(text, want, 900), q = P(t, out, 0.3, E.in), u = P(t, at, 0.5, E.out), heat = 4 + 5 * (0.5 + 0.5 * Math.sin(t * 3.1));
  const word = (fid: string) => <div style={{fontFamily: F.head, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: '-0.035em', color, whiteSpace: 'nowrap', textAlign: 'center', filter: `url(#${fid})`}}>{text}</div>;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y - size * 0.62, opacity: clamp(u * 1.4) * (1 - q)}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={`${id}a`} x="-10%" y="-30%" width="120%" height="160%"><feTurbulence type="turbulence" baseFrequency="0.008 0.09" numOctaves={2} seed={Math.floor(frame / 3) % 50} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={heat + (1 - u) * 40} xChannelSelector="R" yChannelSelector="G" /></filter>
        <filter id={`${id}b`} x="-10%" y="-30%" width="120%" height="160%"><feTurbulence type="turbulence" baseFrequency="0.006 0.14" numOctaves={2} seed={(Math.floor(frame / 3) + 17) % 50} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={heat * 3.2 + 8} xChannelSelector="R" yChannelSelector="G" /><feGaussianBlur stdDeviation={1.2} /></filter>
      </svg>
      {word(`${id}a`)}
      <div style={{transform: 'scaleY(-0.8)', transformOrigin: '50% 50%', marginTop: -size * 0.12, opacity: 0.35, WebkitMaskImage: 'linear-gradient(0deg, transparent 10%, #000 100%)', maskImage: 'linear-gradient(0deg, transparent 10%, #000 100%)'}}>{word(`${id}b`)}</div>
    </div>
  );
};

// ---------- AREIA: o texto se desfaz em grãos que caem ----------
const SAND = new Map<string, {x: number; y: number}[]>();
const sandPoints = (text: string, size: number, y: number) => {
  const key = `${text}|${size}|${y}`, hit = SAND.get(key); if (hit) return hit;
  const c = document.createElement('canvas'); c.width = 1080; c.height = Math.ceil(size * 1.6); const g = c.getContext('2d')!;
  g.font = `900 ${size}px ${F.head}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  (g as CanvasRenderingContext2D & {letterSpacing: string}).letterSpacing = `${(-0.035 * size).toFixed(2)}px`;
  g.fillStyle = '#000'; g.fillText(text, 540, size * 1.12);
  const d = g.getImageData(0, 0, c.width, c.height).data, pts: {x: number; y: number}[] = [];
  for (let yy = 0; yy < c.height; yy += 4) for (let xx = 0; xx < 1080; xx += 4) if (d[(yy * 1080 + xx) * 4 + 3] > 120) pts.push({x: xx, y: y - size * 0.62 + yy - size * 0.02});
  SAND.set(key, pts); return pts;
};
const SandText: React.FC<{t: number; at: number; crumble: number; text: string; size: number; y: number; color: string}> = ({t, at, crumble, text, size: want, y, color}) => {
  const size = fitSize(text, want, 880);
  const ref = useCanvas((g) => {
    if (t < crumble - 0.05 || t > crumble + 2.4) return;
    const pts = sandPoints(text, size, y), r = rng(5);
    g.fillStyle = color;
    pts.forEach((p) => { const k1 = r(), k2 = r(), d = crumble + (p.x - 100) / 880 * 0.55 + k1 * 0.25, tau = Math.max(0, t - d), vx = (k2 - 0.5) * 60;
      const x = p.x + vx * tau, yy = p.y + 0.5 * 1500 * tau * tau, a = 1 - P(tau, 0.5, 0.8); if (a <= 0 || yy > 1950) return;
      g.globalAlpha = a; g.fillRect(x, yy, 3, 3); });
    g.globalAlpha = 1;
  }, [t, crumble, text, size, y, color]);
  return (
    <>
      {t < crumble + 0.08 && <Ink t={t} at={at} out={crumble + 0.02} text={text} size={want} y={y} color={color} />}
      <Cv cref={ref} />
    </>
  );
};

// ---------- a AMPULHETA (o gargalo literal) ----------
const HG = {cx: 540, cy: 680, H: 400, B: 230, n: 9};
const halfW = (u: number) => HG.n + (HG.B - HG.n) * Math.sqrt(Math.max(0, Math.sin(Math.min(1, u) * Math.PI * 0.55)));
const rh = rng(41);
const TOPP = Array.from({length: 2600}, () => { const u = rh(), s = rh() * 2 - 1; return {u, x: s * halfW(u) * 0.97, k: rh()}; });
const BOTP = Array.from({length: 2600}, () => { const v = rh(), s = rh() * 2 - 1; return {v, x: s * halfW(v) * 0.97, k: rh()}; });
/** fill: quanto ainda há em cima (0–1); hot: o gargalo aceso em laranja */
const Hourglass: React.FC<{t: number; fill: number; flow: number; hot?: number; fg?: string; opacity?: number}> = ({t, fill, flow, hot = 0, fg = C.bone, opacity = 1}) => {
  const ref = useCanvas((g) => {
    const {cx, cy, H, B, n} = HG, top = 0.08 + 0.74 * fill, bot = 0.06 + 0.62 * (1 - fill);
    g.globalAlpha = opacity;
    // vidro: contorno duplo e hachura de gravura
    const side = (s: number, off: number) => { g.beginPath(); g.moveTo(cx + s * (B * 0.9 + off), cy - H); g.bezierCurveTo(cx + s * (B * 1.12 + off), cy - H * 0.6, cx + s * (n + 26 + off), cy - H * 0.16, cx + s * (n + off), cy); g.bezierCurveTo(cx + s * (n + 26 + off), cy + H * 0.16, cx + s * (B * 1.12 + off), cy + H * 0.6, cx + s * (B * 0.9 + off), cy + H); g.stroke(); };
    g.strokeStyle = fg; g.lineWidth = 2.6; side(1, 6); side(-1, 6); g.lineWidth = 1; g.globalAlpha = opacity * 0.5; side(1, 14); side(-1, 14);
    g.globalAlpha = opacity * 0.18; for (let k = 0; k < 24; k++) { const u = k / 23, y = cy - H + u * H * 2, w = halfW(Math.abs(y - cy) / H) + 4; g.beginPath(); g.moveTo(cx + w, y); g.lineTo(cx + w - 10, y + 12); g.stroke(); }
    // molduras de madeira
    g.globalAlpha = opacity; g.fillStyle = fg; [cy - H - 26, cy + H + 4].forEach((y) => { g.fillRect(cx - B - 40, y, (B + 40) * 2, 22); g.globalAlpha = opacity * 0.5; g.fillRect(cx - B - 52, y + (y < cy ? -10 : 26), (B + 52) * 2, 6); g.globalAlpha = opacity; });
    [-1, 1].forEach((s) => { g.fillRect(cx + s * (B + 30) - 5, cy - H - 4, 10, H * 2 + 8); });
    // areia de cima: abaixo da superfície, com a cratera no centro
    g.fillStyle = fg;
    TOPP.forEach((p) => { const crater = 0.1 * (1 - Math.pow(p.x / B, 2)) * Math.min(1, flow * 3); if (p.u > top - crater) return; g.globalAlpha = opacity * (0.55 + 0.45 * p.k); g.fillRect(cx + p.x, cy - p.u * H, 2.2, 2.2); });
    // areia de baixo: um monte que cresce
    BOTP.forEach((p) => { const mound = bot * (1 - 0.55 * Math.pow(p.x / B, 2)); if (1 - p.v > mound) return; g.globalAlpha = opacity * (0.55 + 0.45 * p.k); g.fillRect(cx + p.x, cy + p.v * H, 2.2, 2.2); });
    // o fio que passa pelo gargalo
    if (flow > 0 && fill > 0.01) { const len = H * (1 - bot) - 6; for (let k = 0; k < 70 * flow; k++) { const ph = (k / 70 + t * 1.7) % 1, y = cy + ph * ph * len; g.globalAlpha = opacity * 0.9; g.fillRect(cx - 1 + Math.sin(k * 7.1) * 1.4, y, 2.2, 2.6); } }
    // o gargalo aceso
    if (hot > 0) { g.globalAlpha = opacity * hot; g.shadowColor = C.or; g.shadowBlur = 22; g.fillStyle = C.or; g.beginPath(); g.ellipse(cx, cy, n + 10, 7, 0, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0; }
    g.globalAlpha = 1;
  }, [t, fill, flow, hot, fg, opacity]);
  return <Cv cref={ref} />;
};

// ---------- FILA DE VERDADE: peças passam por estações; quem demora faz fila ----------
type St = {x: number; y: number; svc: (s: number) => number};
type Sim = {st: St[]; enter: {x: number; y: number}; exit: {x: number; y: number}; speed: number; A: number[][]; S: number[][]; D: number[][]; X: number[]; T0: number[]};
const pathPts = (sim: {st: St[]; enter: {x: number; y: number}; exit: {x: number; y: number}}) => [sim.enter, ...sim.st, sim.exit];
const simulate = (st: St[], enter: {x: number; y: number}, exit: {x: number; y: number}, arrivals: number[], speed: number): Sim => {
  const pts = [enter, ...st, exit], tr = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y) / speed), last = st.map(() => -1e9);
  const A: number[][] = [], S: number[][] = [], D: number[][] = [], X: number[] = [], T0: number[] = [];
  arrivals.forEach((t0) => { let at = t0 + tr[0]; const a: number[] = [], s: number[] = [], d: number[] = [];
    st.forEach((q, i) => { a.push(at); const s0 = Math.max(at, last[i]); s.push(s0); const d0 = s0 + q.svc(s0); d.push(d0); last[i] = d0; at = d0 + tr[i + 1]; });
    A.push(a); S.push(s); D.push(d); X.push(at); T0.push(t0); });
  return {st, enter, exit, speed, A, S, D, X, T0};
};
/** onde está cada peça no instante t, e o tamanho de cada fila */
const simState = (sim: Sim, t: number, gap: number) => {
  const pts = pathPts(sim), m = sim.st.length, queue = sim.st.map(() => 0), out: {x: number; y: number; state: 'move' | 'wait' | 'work'; i: number}[] = [];
  sim.T0.forEach((t0, j) => {
    if (t < t0 || t > sim.X[j]) return;
    const a = sim.A[j], s = sim.S[j], d = sim.D[j];
    for (let i = 0; i <= m; i++) {
      const from = i === 0 ? t0 : d[i - 1], to = i === m ? sim.X[j] : a[i];
      if (t >= from && t < to) { const u = (t - from) / (to - from), p = pts[i], q = pts[i + 1]; out.push({x: lerp(p.x, q.x, u), y: lerp(p.y, q.y, u), state: 'move', i}); return; }
      if (i < m && t >= a[i] && t < s[i]) { const k = queue[i]++, p = pts[i + 1], q = pts[i], L = Math.hypot(p.x - q.x, p.y - q.y) || 1, back = Math.min(gap * (k + 1), L - 10); out.push({x: p.x + ((q.x - p.x) / L) * back, y: p.y + ((q.y - p.y) / L) * back, state: 'wait', i}); return; }
      if (i < m && t >= s[i] && t < d[i]) { const p = pts[i + 1]; out.push({x: p.x, y: p.y, state: 'work', i}); return; }
    }
  });
  return {pieces: out, queue};
};
const every = (a: number, b: number, dt: number) => Array.from({length: Math.floor((b - a) / dt)}, (_, k) => a + k * dt);

// fábrica: 11 máquinas em serpentina; a 7ª é a lenta
const FX = [180, 400, 620, 840];
const FST: {x: number; y: number}[] = [...FX.map((x) => ({x, y: 520})), ...[...FX].reverse().map((x) => ({x, y: 760})), ...FX.slice(0, 3).map((x) => ({x, y: 1000}))];
const SLOW = 6;
const FACT = simulate(FST.map((p, i) => ({...p, svc: (s: number) => (i === SLOW ? 0.85 : s < T.acelerar + 0.2 ? 0.14 : 0.05)})), {x: -40, y: 520}, {x: 1120, y: 1000}, every(9.0, 25.5, 0.34), 520);
const Gear: React.FC<{x: number; y: number; r: number; a: number; color: string; teeth?: number; glow?: boolean}> = ({x, y, r, a, color, teeth = 12, glow}) => {
  const d = Array.from({length: teeth * 2}, (_, k) => { const rr = k % 2 ? r * 0.8 : r, an = a + (k / (teeth * 2)) * Math.PI * 2; return `${(x + Math.cos(an) * rr).toFixed(1)},${(y + Math.sin(an) * rr).toFixed(1)}`; }).join(' ');
  return <g style={glow ? {filter: `drop-shadow(0 0 10px ${C.or})`} : undefined}><polygon points={d} fill="none" stroke={color} strokeWidth={2.4} strokeLinejoin="round" /><circle cx={x} cy={y} r={r * 0.32} fill="none" stroke={color} strokeWidth={2} /><line x1={x - r * 0.55} y1={y} x2={x + r * 0.55} y2={y} stroke={color} strokeWidth={1.4} transform={`rotate(${(a * 57.3).toFixed(1)} ${x} ${y})`} /></g>;
};
const Factory: React.FC<{t: number; draw: number}> = ({t, draw}) => {
  const {pieces, queue} = simState(FACT, t, 17), speed = t < T.acelerar ? 1 : lerp(1, 2.6, P(t, T.acelerar, 0.8, E.io)), pts = pathPts(FACT);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={C.bone} strokeWidth={1.5} strokeDasharray="4 10" opacity={0.35 * draw} />
      {FST.map((p, i) => { const slow = i === SLOW, u = P(draw, i / 14, 0.3); return u > 0 && <g key={i} opacity={u}><Gear x={p.x} y={p.y} r={slow ? 50 : 40} a={(t - 14) * (slow ? 0.7 : 5.5 * speed) * (i % 2 ? -1 : 1)} color={slow ? C.or : C.bone} glow={slow} /></g>; })}
      {pieces.map((p, k) => <rect key={k} x={p.x - 6} y={p.y - 6} width={12} height={12} rx={2} fill={p.state === 'wait' ? C.orHi : C.bone} opacity={p.state === 'wait' ? 0.95 : 0.85} />)}
      {queue[SLOW] > 2 && <text x={FST[SLOW].x} y={FST[SLOW].y + 92} textAnchor="middle" fontFamily={F.mono} fontSize={20} letterSpacing="0.14em" fill={C.or}>{`FILA: ${queue[SLOW]}`}</text>}
    </svg>
  );
};

// a empresa: seis etapas na vertical (as mesmas posições nas cenas 4, 5 e 6)
const STAGES = ['LEAD', 'ATENDIMENTO', 'PROPOSTA', 'FECHAMENTO', 'ENTREGA', 'PÓS-VENDA'];
export const VX = 330, VY = (i: number) => 380 + i * 150;
const VST = STAGES.map((_, i) => ({x: VX, y: VY(i)}));
const svcFix = (v: number) => () => v;
// cena 4: três gargalos ao mesmo tempo
export const CO1 = simulate([svcFix(0.1), svcFix(0.8), svcFix(1.0), svcFix(0.15), svcFix(0.15), svcFix(1.5)].map((svc, i) => ({...VST[i], svc})), {x: VX, y: 230}, {x: VX, y: 1260}, every(27.5, 42.5, 0.5), 520);
// cena 5: cada agente destrava uma etapa, e o gargalo muda de lugar sozinho
const CO2 = simulate([svcFix(0.1), (s: number) => (s < T.destrava ? 1.0 : 0.14), (s: number) => (s < T.segundo + 0.3 ? 0.72 : 0.14), svcFix(0.12), svcFix(0.12), (s: number) => (s < T.terceiro + 0.3 ? 0.85 : 0.14)].map((svc, i) => ({...VST[i], svc})), {x: VX, y: 230}, {x: VX, y: 1260}, every(37.0, 52.0, 0.5), 520);
export const Company: React.FC<{t: number; sim: Sim; fg: string; draw: number; agents?: {i: number; at: number}[]; focus?: number; dim?: string}> = ({t, sim, fg, draw, agents = [], focus = -1, dim = C.dim}) => {
  const {pieces, queue} = simState(sim, t, 15), worst = queue.indexOf(Math.max(...queue));
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <line x1={VX} y1={230} x2={VX} y2={230 + 1030 * draw} stroke={fg} strokeWidth={1.5} strokeDasharray="4 10" opacity={0.4} />
      {STAGES.map((n, i) => { const u = P(draw, i / 8, 0.25), hot = i === focus || (focus === -2 && i === worst && queue[i] > 2); return u > 0 && (
        <g key={i} opacity={u}>
          <circle cx={VX} cy={VY(i)} r={hot ? 34 : 28} fill="none" stroke={hot ? C.or : fg} strokeWidth={hot ? 3.5 : 2.2} style={hot ? {filter: `drop-shadow(0 0 10px ${C.or})`} : undefined} />
          <text x={VX + 60} y={VY(i) + 7} fontFamily={F.mono} fontSize={22} letterSpacing="0.16em" fill={hot ? C.or : fg}>{n}</text>
          {queue[i] > 8 && <text x={VX - 52} y={VY(i) - 80} textAnchor="end" fontFamily={F.mono} fontSize={17} fill={C.or}>{`+${queue[i] - 8}`}</text>}
        </g>); })}
      {pieces.map((p, k) => p.state === 'wait' && p.y < VY(p.i) - 15 * 8.5 ? null : <circle key={k} cx={p.x + (p.state === 'wait' ? Math.sin(k * 3.7) * 3 : 0)} cy={p.y} r={6} fill={p.state === 'wait' ? C.orHi : fg} opacity={p.state === 'wait' ? 1 : 0.8} />)}
      {agents.map((a, k) => { const u = P(t, a.at, 0.55, E.settle); if (u <= 0) return null; const y = lerp(VY(a.i) - 420, VY(a.i), u); return (
        <g key={k} opacity={clamp(u * 2)}>
          <circle cx={VX} cy={y} r={46} fill="none" stroke={C.or} strokeWidth={2} opacity={0.7} />
          <circle cx={VX} cy={y} r={14} fill={C.or} style={{filter: `drop-shadow(0 0 12px ${C.or})`}} />
          <text x={VX - 62} y={y + 7} textAnchor="end" fontFamily={F.mono} fontSize={18} letterSpacing="0.14em" fill={C.or}>{`AGENTE ${k + 1}`}</text>
        </g>); })}
      {focus === -2 && queue[worst] > 2 && <text x={VX + 60} y={VY(worst) + 38} fontFamily={F.mono} fontSize={17} letterSpacing="0.2em" fill={dim}>{'← GARGALO'}</text>}
    </svg>
  );
};

// ---------- logo de areia ----------
const useLogoGrains = () => {
  const [pts, setPts] = useState<{x: number; y: number; k: number}[] | null>(null);
  const [h] = useState(() => delayRender('logo-grains'));
  useLayoutEffect(() => {
    const im = new Image();
    im.onload = () => { const s = LOGO.w / (LOGO.x1 - LOGO.x0), W = Math.round(1234 * s), Hh = Math.round(630 * s), c = document.createElement('canvas'); c.width = W; c.height = Hh; const g = c.getContext('2d')!; g.drawImage(im, 0, 0, W, Hh);
      const d = g.getImageData(0, 0, W, Hh).data, o = lg(111, 107), r = rng(9), out: {x: number; y: number; k: number}[] = [];
      for (let y = 0; y < Hh; y += 4) for (let x = 0; x < W; x += 4) if (d[(y * W + x) * 4 + 3] > 110) out.push({x: o.x + x, y: o.y + y, k: r()});
      out.sort((a, b) => b.y + b.k * 40 - (a.y + a.k * 40)); setPts(out); continueRender(h); };
    im.onerror = () => continueRender(h); im.src = img('logo_yohann');
  }, [h]);
  return pts;
};
const LOGO = {x0: 111, y0: 107, x1: 1345, y1: 739, w: 860};
const lg = (x: number, y: number) => { const s = LOGO.w / (LOGO.x1 - LOGO.x0), cx = (LOGO.x0 + LOGO.x1) / 2, cy = (LOGO.y0 + LOGO.y1) / 2; return {x: 540 + (x - cx) * s, y: 900 + (y - cy) * s, s}; };
const SandLogo: React.FC<{t: number; a: number; pts: {x: number; y: number; k: number}[] | null}> = ({t, a, pts}) => {
  const ref = useCanvas((g) => {
    if (!pts || t < a) return;
    const N = pts.length, fall = 0.42, src = {x: 540, y: 200};
    g.fillStyle = C.pen;
    for (let i = 0; i < N; i++) { const p = pts[i], ti = a + 1.6 * (i / N) + p.k * 0.08, tau = t - ti + fall; if (tau < 0) break;
      let x = p.x, y = p.y; if (tau < fall) { const u = tau / fall; x = lerp(src.x + (p.k - 0.5) * 18, p.x, u * u); y = lerp(src.y, p.y, u * u); }
      g.globalAlpha = tau < fall ? 0.85 : 1; g.fillStyle = p.k < 0.03 ? C.or : C.pen; g.fillRect(x, y, 3.6, 3.6); }
    // o fio de areia caindo do alto
    const pour = 1 - P(t, a + 1.55, 0.3);
    if (pour > 0) { g.fillStyle = C.pen; for (let k = 0; k < 40; k++) { const ph = (k / 40 + t * 2.2) % 1; g.globalAlpha = pour * 0.8; g.fillRect(540 + Math.sin(k * 5.3) * 2, 120 + ph * 160, 2.4, 3); } }
    g.globalAlpha = 1;
  }, [t, a, pts]);
  return <Cv cref={ref} />;
};

// ================================================================== cenas
// 0 · a ampulheta: a maioria usa IA no lugar errado (escuro)
const rI = rng(77);
const IADOTS = Array.from({length: 13}, () => ({a: rI() * Math.PI * 2, r: 0.62 + rI() * 0.5, y: rI(), sp: 0.3 + rI() * 0.5}));
const S0: React.FC<{t: number}> = ({t}) => {
  const lock = P(t, T.errado - 0.1, 0.5, E.out), dim = lerp(1, 0.35, P(t, T.errado + 0.3, 0.6));
  return (
    <Cam t={t} a={0} b={10.5} z0={1.1} z1={1.0} oy={680}>
      <Hourglass t={t} fill={lerp(0.82, 0.74, P(t, 0, 10.4))} flow={P(t, 0.3, 1.2)} hot={lock * (0.6 + 0.4 * Math.sin(t * 6))} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {IADOTS.map((d, i) => { const u = P(t, T.usando - 0.3 + i * 0.06, 0.4, E.pop); if (u <= 0) return null; const an = d.a + t * d.sp, x = HG.cx + Math.cos(an) * HG.B * d.r * 1.25, y = HG.cy - HG.H * 0.15 - d.y * HG.H * 0.95 + Math.sin(an) * 30;
          return <g key={i} opacity={dim}><circle cx={x} cy={y} r={9 * u} fill={C.or} style={{filter: `drop-shadow(0 0 8px ${C.or})`}} /><text x={x + 15} y={y + 5} fontFamily={F.mono} fontSize={14} fill={C.dim}>IA</text></g>; })}
        {lock > 0 && <><circle cx={HG.cx} cy={HG.cy} r={lerp(240, 46, lock)} fill="none" stroke={C.or} strokeWidth={2.5} strokeDasharray="8 8" opacity={lock} /><line x1={HG.cx + 50} y1={HG.cy} x2={HG.cx + 160} y2={HG.cy} stroke={C.or} strokeWidth={2} opacity={lock} /><text x={HG.cx + 172} y={HG.cy + 7} fontFamily={F.mono} fontSize={20} letterSpacing="0.16em" fill={C.or} opacity={lock}>AQUI?</text></>}
      </svg>
      <Label t={t} at={0.3} out={10.3} text="FIG. I — A AMPULHETA" y={230} />
      <Thin t={t} at={T.maioria - 0.25} out={T.fisico - 0.3} text="a maioria das empresas está usando IA" size={60} y={1250} />
      <Ink t={t} at={T.lugar - 0.12} out={T.fisico - 0.3} text="NO LUGAR ERRADO." size={150} y={1380} />
      <Thin t={t} at={T.fisico - 0.15} out={10.35} text="e um físico explicou por quê, em" size={64} y={1250} />
      <Ink t={t} at={T.n1984 - 0.08} out={10.35} text="1984." size={210} y={1385} color={C.or} stagger={0.07} />
    </Cam>
  );
};
// 1 · Goldratt: uma hora ganha fora do gargalo é uma miragem (papel)
const S1: React.FC<{t: number; frame: number}> = ({t, frame}) => (
  <Cam t={t} a={10.4} b={16.1} z0={1.0} z1={1.06} oy={800}>
    <div style={{position: 'absolute', inset: 0, opacity: 0.32 * P(t, T.miragem - 0.6, 0.8)}}><Reveal name="mirage" p={P(t, T.miragem - 0.6, 1.2, E.smooth)} x={540} y={1180} width={980} light edge={0} /></div>
    <Label t={t} at={10.5} out={15.9} text="FIG. II — A META · ELIYAHU M. GOLDRATT, 1984" y={230} color={C.pdim} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: F.head, fontWeight: 900, fontSize: 240, lineHeight: 1, color: C.or, opacity: P(t, 10.5, 0.4), textShadow: `0 0 30px ${C.or}55`}}>“</div>
    <Thin t={t} at={T.eliyahu - 0.1} out={T.hora - 0.25} text="Eliyahu Goldratt escreveu:" size={78} y={640} color={C.pen} />
    <Ink t={t} at={T.hora - 0.1} out={15.9} text="UMA HORA GANHA" size={130} y={620} color={C.pen} />
    <Ink t={t} at={T.fora - 0.08} out={15.9} text="FORA DO GARGALO" size={130} y={770} color={C.pen} />
    <Thin t={t} at={T.gargalo + 0.45} out={15.9} text="é uma" size={84} y={900} color={C.pen} />
    <Mirage t={t} frame={frame} at={T.miragem - 0.05} out={15.9} text="MIRAGEM." size={200} y={1060} id="m1" />
  </Cam>
);
// 2 · a fábrica: dez rápidas, uma lenta (escuro)
const S2: React.FC<{t: number}> = ({t}) => {
  const ford = P(t, 16.0, 1.0, E.smooth), draw = P(t, T.dez - 0.4, 1.4, E.out), spd = Math.round(lerp(100, 260, P(t, T.acelerar, 0.8, E.io)) / 10) * 10;
  const done = FACT.X.filter((x) => x <= t && x > t - 4).length, rate = (done / 4).toFixed(1).replace('.', ',');
  return (
    <Cam t={t} a={16.0} b={25.1} z0={1.04} z1={1.0} oy={760}>
      <div style={{position: 'absolute', inset: 0, opacity: lerp(0.85, 0.14, P(t, T.dez - 0.3, 1.2))}}><Reveal name="ford" p={ford} x={540} y={760} width={1040} edge={0} /></div>
      <Factory t={t} draw={draw} />
      <Label t={t} at={16.1} out={T.dez - 0.3} text="FIG. III — LINHA DE MONTAGEM DA FORD, 1913" y={230} />
      <Label t={t} at={T.dez - 0.2} out={24.9} text={`VELOCIDADE DAS MÁQUINAS · ${spd}%`} y={230} color={t > T.acelerar ? C.bone : C.dim} />
      <Label t={t} at={T.dez + 0.4} out={24.9} text={`SAÍDA DA FÁBRICA · ${rate} PEÇA/S`} y={272} color={C.or} />
      <Thin t={t} at={T.pensa - 0.1} out={T.dez - 0.3} text="pensa numa fábrica." size={86} y={1300} />
      <Ink t={t} at={T.dez - 0.05} out={T.acelerar - 0.3} text="DEZ RÁPIDAS," size={120} y={1240} />
      <Ink t={t} at={T.lenta - 0.08} out={T.acelerar - 0.3} text="UMA LENTA." size={150} y={1380} color={C.or} />
      <Thin t={t} at={T.acelerar - 0.25} out={T.fabrica2 - 0.25} text="você pode acelerar as dez o quanto quiser." size={58} y={1300} />
      <Thin t={t} at={T.fabrica2 - 0.15} out={24.95} text="a fábrica continua no ritmo da" size={66} y={1240} />
      <Ink t={t} at={T.lenta2 - 0.08} out={24.95} text="LENTA." size={200} y={1380} color={C.or} />
    </Cam>
  );
};
// 3 · empresa é igual: a pergunta errada vira areia (papel)
const PL = STAGES.map((n, i) => ({n, x: 140 + i * 160}));
const S3: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={25.0} b={33.7} z0={1.0} z1={1.05} oy={700}>
    <Label t={t} at={25.1} out={33.5} text="FIG. IV — UMA EMPRESA TAMBÉM É UMA LINHA" y={230} color={C.pdim} />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <line x1={80} y1={470} x2={80 + 920 * P(t, 25.1, 0.9, E.io)} y2={470} stroke={C.pen} strokeWidth={1.5} strokeDasharray="4 10" opacity={0.5} />
      {PL.map((p, i) => { const u = P(t, T.empresa - 0.1 + i * 0.09, 0.4, E.pop); return u > 0 && <g key={i}><circle cx={p.x} cy={470} r={22 * u} fill="#fffaf2" stroke={i === 1 ? C.or : C.pen} strokeWidth={2.2} /><text x={p.x} y={540} textAnchor="middle" fontFamily={F.mono} fontSize={13} letterSpacing="0.08em" fill={C.pdim} opacity={u}>{p.n}</text></g>; })}
      {Array.from({length: 14}, (_, k) => { const ph = ((t - 25) * 0.22 + k / 14) % 1, x = 80 + ph * 920, near = Math.abs(x - PL[1].x) < 60; return t > 25.6 && <circle key={k} cx={near ? PL[1].x - 30 - (k % 4) * 13 : x} cy={470 + (near ? -26 : 0)} r={6} fill={near ? C.or : C.pen} opacity={0.75} />; })}
    </svg>
    <Ink t={t} at={T.empresa - 0.05} out={T.fosse - 0.25} text="EMPRESA É IGUAL." size={130} y={800} color={C.pen} />
    <Thin t={t} at={T.fosse - 0.2} out={T.nao - 0.25} text="se eu fosse montar um negócio hoje," size={66} y={800} color={C.pen} />
    <Thin t={t} at={T.nao - 0.2} out={T.onde2 - 0.2} text="eu não começaria perguntando:" size={66} y={800} color={C.pen} />
    <SandText t={t} at={T.onde - 0.08} crumble={T.perguntaria - 0.05} text="ONDE DÁ PRA USAR IA?" size={110} y={1000} color={C.pdim} />
    <Thin t={t} at={T.perguntaria - 0.05} out={33.5} text="eu perguntaria:" size={70} y={1120} color={C.pen} />
    <Ink t={t} at={T.onde2 - 0.06} out={33.5} text="ONDE AS COISAS" size={130} y={1250} color={C.pen} />
    <Ink t={t} at={T.param - 0.06} out={33.5} text="PARAM?" size={190} y={1390} color={C.or} />
  </Cam>
);
// 4 · os três gargalos (escuro)
const CALL = [{i: 1, at: T.cliente, q: 'cliente chegando e ninguém respondendo?', m: 'RESPOSTA · 6 h 40 min', ali: T.gargalo2 - 0.1}, {i: 2, at: T.proposta, q: 'proposta que leva três dias pra sair?', m: 'PROPOSTA · 3 DIAS', ali: T.ali2}, {i: 5, at: T.cliente2, q: 'cliente que some depois da compra?', m: 'PÓS-VENDA · 0 CONTATOS', ali: T.ali3}];
const S4: React.FC<{t: number}> = ({t}) => {
  const cur = CALL.reduce((k, c, i) => (t >= c.at - 0.3 ? i : k), 0), c = CALL[cur];
  return (
    <Cam t={t} a={33.6} b={42.2} z0={1.0} z1={1.04} oy={760}>
      <Company t={t} sim={CO1} fg={C.bone} draw={P(t, 33.6, 1.0, E.out)} focus={c.i} />
      {CALL.map((k, i) => { const u = P(t, k.ali - 0.05, 0.4, E.out), v = i === cur ? 1 : 0.35; return u > 0 && (
        <React.Fragment key={i}>
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: u * v}}><circle cx={VX} cy={VY(k.i)} r={lerp(160, 52, u)} fill="none" stroke={C.or} strokeWidth={2.5} /><line x1={VX - 70} y1={VY(k.i)} x2={VX - 54} y2={VY(k.i)} stroke={C.or} strokeWidth={3} /><line x1={VX + 54} y1={VY(k.i)} x2={VX + 70} y2={VY(k.i)} stroke={C.or} strokeWidth={3} /></svg>
          <div style={{position: 'absolute', left: VX + 60, top: VY(k.i) + 26, fontFamily: F.mono, fontSize: 20, letterSpacing: '0.12em', color: C.or, opacity: u * v}}>{k.m}</div>
        </React.Fragment>); })}
      <Label t={t} at={33.7} out={42.0} text="FIG. V — ONDE AS COISAS PARAM" y={230} />
      {CALL.map((k, i) => <Thin key={i} t={t} at={k.at - 0.25} out={(CALL[i + 1]?.at ?? 42.4) - 0.35} text={k.q} size={58} y={1300} />)}
      {CALL.map((k, i) => <Ink key={`a${i}`} t={t} at={k.ali - 0.05} out={(CALL[i + 1]?.at ?? 42.4) - 0.35} text={i === 0 ? 'O GARGALO É ALI.' : 'ALI.'} size={i === 0 ? 120 : 170} y={1410} color={C.or} />)}
    </Cam>
  );
};
// 5 · o agente segue o gargalo (papel)
const AG = [{i: 1, at: T.agente + 0.9}, {i: 2, at: T.segundo - 0.2}, {i: 5, at: T.terceiro - 0.15}];
const S5: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={42.1} b={51.6} z0={1.0} z1={1.04} oy={760}>
    <Company t={t} sim={CO2} fg={C.pen} draw={1} agents={AG} focus={-2} dim={C.or} />
    <Label t={t} at={42.2} out={51.4} text="FIG. VI — O AGENTE VAI ONDE A FILA ESTÁ" y={230} color={C.pdim} />
    <Thin t={t} at={T.meu - 0.2} out={T.so - 0.3} text="meu primeiro agente iria exatamente" size={60} y={1290} color={C.pen} />
    <Ink t={t} at={T.ponto - 0.15} out={T.so - 0.3} text="NESSE PONTO." size={150} y={1410} color={C.pen} />
    <Ink t={t} at={T.so - 0.06} out={T.quando - 0.1} text="SÓ NELE." size={190} y={1360} color={C.or} />
    <Thin t={t} at={T.quando - 0.05} out={T.sempre - 0.25} text="quando ele destrava, o gargalo muda de lugar." size={52} y={1330} color={C.pen} />
    <Ink t={t} at={T.sempre - 0.06} out={T.segundo - 0.7} text="SEMPRE MUDA." size={150} y={1370} color={C.pen} />
    <Thin t={t} at={T.segundo - 0.65} out={51.45} text="aí entra o segundo agente." size={66} y={1280} color={C.pen} />
    <Thin t={t} at={T.terceiro - 0.1} out={51.45} text="e o terceiro." size={84} y={1390} color={C.or} />
  </Cam>
);
// 6 · é assim que um ecossistema nasce: seguindo o gargalo (escuro)
const rE = rng(91);
const SPROUT = Array.from({length: 22}, (_, k) => { const base = [1, 2, 5][k % 3], an = rE() * Math.PI * 2, d = 120 + rE() * 330; return {from: base, x: VX + 120 + Math.cos(an) * d * 0.9 + 140, y: VY(base) + Math.sin(an) * d * 0.6, k: rE()}; });
const S6: React.FC<{t: number}> = ({t}) => {
  const trail = P(t, T.seguindo - 0.2, 0.9, E.io), grow = P(t, T.nasce - 0.4, 1.6, E.out);
  const AP = [1, 2, 5].map((i) => ({x: VX, y: VY(i)}));
  return (
    <Cam t={t} a={51.5} b={55.8} z0={1.0} z1={1.08} ox={460} oy={800}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {STAGES.map((n, i) => <g key={i} opacity={0.45}><circle cx={VX} cy={VY(i)} r={26} fill="none" stroke={C.bone} strokeWidth={1.6} /><text x={VX - 46} y={VY(i) + 6} textAnchor="end" fontFamily={F.mono} fontSize={16} letterSpacing="0.12em" fill={C.dim}>{n}</text></g>)}
        {SPROUT.map((s, k) => { const u = P(grow, s.k * 0.6, 0.4, E.out); if (u <= 0) return null; const o = AP[[1, 2, 5].indexOf(s.from)]; return <g key={k}><line x1={o.x} y1={o.y} x2={lerp(o.x, s.x, u)} y2={lerp(o.y, s.y, u)} stroke={C.bone} strokeWidth={1} opacity={0.3} />{SPROUT[(k + 3) % SPROUT.length] && u >= 1 && <line x1={s.x} y1={s.y} x2={SPROUT[(k + 3) % SPROUT.length].x} y2={SPROUT[(k + 3) % SPROUT.length].y} stroke={C.or} strokeWidth={0.8} opacity={0.3} />}<circle cx={lerp(o.x, s.x, u)} cy={lerp(o.y, s.y, u)} r={6 + s.k * 4} fill={C.or} opacity={0.85} style={{filter: `drop-shadow(0 0 6px ${C.or})`}} /></g>; })}
        <path d={`M${VX} ${VY(1)} C ${VX + 260} ${VY(1) + 40}, ${VX + 260} ${VY(2) - 40}, ${VX} ${VY(2)} S ${VX + 330} ${VY(4)}, ${VX} ${VY(5)}`} fill="none" stroke={C.or} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - trail} style={{filter: `drop-shadow(0 0 8px ${C.or})`}} />
        {AP.map((p, k) => <circle key={k} cx={p.x} cy={p.y} r={15} fill={C.or} style={{filter: `drop-shadow(0 0 12px ${C.or})`}} />)}
      </svg>
      <Label t={t} at={51.6} out={55.6} text="FIG. VII — COMO UM ECOSSISTEMA NASCE" y={230} />
      <Thin t={t} at={T.ecossistema - 0.6} out={T.naoUma - 0.25} text="é assim que um ecossistema nasce." size={64} y={1300} />
      <Thin t={t} at={T.naoUma - 0.15} out={T.seguindo - 0.25} text="não de uma vez." size={84} y={1300} />
      <Thin t={t} at={T.seguindo - 0.1} out={55.6} text="seguindo o" size={80} y={1250} />
      <Ink t={t} at={T.gargalo4 - 0.06} out={55.6} text="GARGALO." size={190} y={1390} color={C.or} />
    </Cam>
  );
};
// 7 · a miragem dos posts (papel)
const S7: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const posts = Math.round(lerp(3, 30, P(t, T.post - 0.1, 1.4, E.io))), mir = P(t, T.miragem2 - 0.45, 0.3), flat = P(t, T.venda - 0.2, 0.6, E.io);
  return (
    <Cam t={t} a={55.7} b={60.6} z0={1.0} z1={1.05} oy={760}>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - mir}}>
        <Label t={t} at={55.8} out={59.6} text="FIG. VIII — A MIRAGEM" y={230} color={C.pdim} />
        <div style={{position: 'absolute', left: 90, width: 420, top: 380, display: 'grid', gap: 6}}>
          <span style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.18em', color: C.pdim}}>POSTS POR SEMANA</span>
          <span style={{fontFamily: F.head, fontWeight: 900, fontSize: 210, lineHeight: 1, color: C.pen, fontVariantNumeric: 'tabular-nums'}}>{posts}</span>
          <div style={{height: 10, width: `${(posts / 30) * 100}%`, background: C.pen}} />
        </div>
        <div style={{position: 'absolute', left: 570, width: 420, top: 380, display: 'grid', gap: 6, opacity: P(t, T.problema - 0.4, 0.4)}}>
          <span style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.18em', color: C.pdim}}>VENDAS POR SEMANA</span>
          <span style={{fontFamily: F.head, fontWeight: 900, fontSize: 210, lineHeight: 1, color: flat > 0.5 ? C.or : C.pen}}>12</span>
          <svg width={420} height={60}><polyline points={Array.from({length: 12}, (_, k) => `${k * 36},${30 + Math.sin(k * 2.1) * 3}`).join(' ')} fill="none" stroke={flat > 0.5 ? C.or : C.pen} strokeWidth={3} /></svg>
        </div>
        <Thin t={t} at={T.fazer - 0.15} out={T.quando} text="fazer post mais rápido" size={74} y={1250} color={C.pen} />
        <Thin t={t} at={T.problema - 0.45} out={T.miragem2 - 0.5} text="quando o problema é a venda" size={70} y={1250} color={C.pen} />
        <Thin t={t} at={T.acelera - 0.3} out={T.miragem2 - 0.5} text="não acelera nada." size={84} y={1370} color={C.or} />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: mir}}><Reveal name="mirage" p={P(t, T.miragem2 - 0.5, 0.9, E.smooth)} x={540} y={800} width={1000} light edge={0} /></div>
      <Mirage t={t} frame={frame} at={T.miragem2 - 0.05} out={60.4} text="MIRAGEM." size={220} y={1300} id="m2" />
    </Cam>
  );
};
// 8 · onde a sua empresa espera? (escuro) — a ampulheta volta, parada no gargalo
const S8: React.FC<{t: number}> = ({t}) => {
  const z = P(t, T.responde - 0.4, 2.2, E.io);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${HG.cx}px 1000px`, transform: `scale(${lerp(1, 1.28, z).toFixed(4)})`}}>
        <Hourglass t={t} fill={0.66} flow={lerp(0.4, 0.06, z)} hot={P(t, T.onde3 - 0.2, 0.5) * (0.65 + 0.35 * Math.sin(t * 5))} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1060, bottom: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,.92) 30%)'}} />
      <Thin t={t} at={60.75} out={T.responde - 0.3} text="antes de qualquer ferramenta," size={70} y={1290} />
      <Thin t={t} at={T.responde - 0.15} out={T.onde3 - 0.25} text="responde uma pergunta:" size={76} y={1290} />
      <Thin t={t} at={T.onde3 - 0.1} out={64.95} text="onde a sua empresa" size={88} y={1230} />
      <Ink t={t} at={T.espera - 0.06} out={64.95} text="ESPERA?" size={230} y={1380} color={C.or} />
    </>
  );
};
// 9 · o olho, com a ampulheta refletida na íris
const S9: React.FC<{t: number}> = ({t}) => {
  const open = t < T.sting ? P(t, T.por - 0.05, 0.9, E.io) * 0.92 + P(t, T.observa - 0.05, 0.35, E.out) * 0.08 : 1 - P(t, T.sting, 0.18, E.in);
  const pupil = t < T.observa ? 0.35 : lerp(0.35, 1, P(t, T.observa, 0.45, E.out));
  return (
    <>
      {open > 0.01 && <Eye t={t} open={Math.max(0.02, open)} pupil={pupil} cy={800} R={290} hourglass={0.22} />}
      <Thin t={t} at={T.por - 0.02} out={T.sting - 0.1} text="por enquanto…" size={86} y={1230} color={C.dim} />
      <Thin t={t} at={T.so2 - 0.05} out={T.sting + 0.15} text="só observa." size={136} y={1370} />
    </>
  );
};
// 10 · o logo: a areia forma "Yohann"; "Escher" é escrito com a ponta laranja
const S10: React.FC<{t: number; pts: {x: number; y: number; k: number}[] | null}> = ({t, pts}) => {
  const a = T.sting + 0.3, es = lg(202, 339), yo = lg(111, 107), s = yo.s, YW = 1234 * s, YH = 630 * s, EW = 1008 * s, EH = 400 * s;
  const crisp = P(t, a + 1.75, 0.45), wr = P(t, a + 1.55, 1.3, E.smooth), shine = P(t, a + 3.0, 1.1, E.io), fade = P(t, 73.5, 0.7, E.in);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - fade}}>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - crisp}}><SandLogo t={t} a={a} pts={pts} /></div>
      <Img src={img('logo_yohann')} style={{position: 'absolute', left: yo.x, top: yo.y, width: YW, height: YH, opacity: crisp}} />
      <div style={{position: 'absolute', left: es.x, top: es.y, width: EW, height: EH, WebkitMaskImage: `linear-gradient(90deg, #000 ${(wr * 100 - 6).toFixed(1)}%, transparent ${(wr * 100 + 2).toFixed(1)}%)`, maskImage: `linear-gradient(90deg, #000 ${(wr * 100 - 6).toFixed(1)}%, transparent ${(wr * 100 + 2).toFixed(1)}%)`}}>
        <Img src={img('logo_escher')} style={{position: 'absolute', inset: 0, width: EW, height: EH, filter: 'drop-shadow(0 6px 18px rgba(255,90,31,.25))'}} />
        {shine > 0 && shine < 1 && <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `url(${img('logo_escher')})`, maskImage: `url(${img('logo_escher')})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', background: `linear-gradient(100deg, transparent ${(shine * 140 - 30).toFixed(0)}%, rgba(255,255,255,.85) ${(shine * 140 - 15).toFixed(0)}%, transparent ${(shine * 140).toFixed(0)}%)`}} />}
      </div>
      {wr > 0 && wr < 1 && <Dot x={es.x + EW * wr} y={es.y + EH * (0.55 + 0.25 * Math.sin(wr * 18))} r={9} glow={1.6} />}
    </div>
  );
};

const LIGHT: [number, number][] = [[10.4, 16.0], [25.0, 33.6], [42.1, 51.5], [55.7, 60.55], [T.sting + 0.2, 80]];
export const LugarErrado: React.FC<{audio: 'none' | 'mix'}> = ({audio}) => {
  useFonts(); usePreload(ALL);
  const pts = useLogoGrains();
  const frame = useCurrentFrame(), t = frame / FPS;
  const lightK = LIGHT.reduce((m, [a, b]) => Math.max(m, P(t, a, 0.4, E.io) * (1 - P(t, b, 0.35, E.io))), 0);
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden', fontFamily: F.head}}>
      <Scene t={t} a={0} b={10.4} inD={0.6} zIn={1.0} outD={0.5} hold><S0 t={t} /></Scene>
      <Scene t={t} a={10.4} b={16.0} light wipe={{kind: 'glass', x: 540, y: 680, d: 0.55}} outD={0.4} hold><S1 t={t} frame={frame} /></Scene>
      <Scene t={t} a={16.0} b={25.0} wipe={{kind: 'drain', d: 0.45}} outD={0.4} hold><S2 t={t} /></Scene>
      <Scene t={t} a={25.0} b={33.6} light wipe={{kind: 'iris', x: 400, y: 760, d: 0.45}} outD={0.4} hold><S3 t={t} /></Scene>
      <Scene t={t} a={33.6} b={42.1} wipe={{kind: 'drain', d: 0.4}} outD={0.4} hold><S4 t={t} /></Scene>
      <Scene t={t} a={42.1} b={51.5} light wipe={{kind: 'glass', x: VX, y: VY(1), d: 0.45}} outD={0.4} hold><S5 t={t} /></Scene>
      <Scene t={t} a={51.5} b={55.7} wipe={{kind: 'iris', x: VX, y: VY(5), d: 0.45}} outD={0.4} hold><S6 t={t} /></Scene>
      <Scene t={t} a={55.7} b={60.55} light wipe={{kind: 'drain', d: 0.4}} outD={0.4} hold><S7 t={t} frame={frame} /></Scene>
      <Scene t={t} a={60.55} b={65.1} wipe={{kind: 'glass', x: 540, y: 680, d: 0.5}} outD={0.4} hold><S8 t={t} /></Scene>
      <Scene t={t} a={65.1} b={T.sting + 0.6} wipe={{kind: 'iris', x: 540, y: 800, d: 0.45}} outD={0.1}><S9 t={t} /></Scene>
      {t > T.sting && <Dot x={540} y={800} r={14 * (1 + 0.6 * Math.exp(-(t - T.sting) / 0.2)) * (1 - P(t, T.sting + 0.45, 0.3))} glow={2} />}
      <Scene t={t} a={T.sting + 0.2} b={80} light wipe={{kind: 'iris', x: 540, y: 800, d: 0.55}}><S10 t={t} pts={pts} /></Scene>
      <Dust t={t} n={50} opacity={(1 - lightK) * 0.5} warm={0.08} />
      <Flash t={t} at={0.2} d={0.5} color={C.or} max={0.22} />
      <Flash t={t} at={T.jazz + 0.7} d={0.45} max={0.3} />
      <Flash t={t} at={T.drop} d={0.5} color={C.or} max={0.4} />
      <Flash t={t} at={T.sting} d={0.6} color={C.or} max={0.5} />
      <Ring t={t} at={T.drop} x={VX} y={VY(1)} r1={1100} d={1.2} />
      <Ring t={t} at={T.sting} x={540} y={800} r1={1300} d={1.4} />
      <Vignette strength={lerp(0.8, 0.32, lightK)} />
      <Grain frame={frame} amount={0.07 * (1 - lightK)} />
      <Grain frame={frame} amount={0.1 * lightK} dark />
      {audio === 'mix' && <Audio src={staticFile('eco6/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
