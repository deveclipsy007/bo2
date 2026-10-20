// Nº 03 — "OS CENTAUROS". Mesma linguagem do Nº 01: o ponto laranja, gravuras que se desenham, papel ↔ escuro, cortinas.
// 1997 (a máquina vence) → "parecia o fim" → a outra pergunta (o Turco de 1770 tinha um humano dentro) → o torneio de 2005 →
// silêncio: quem venceu? → DOIS AMADORES → não eram os melhores → PROCESSO → centauros → a equação de Kasparov →
// a corrida pela ferramenta mais nova (cinza) → o sistema em volta da máquina → o peão anda: "só observa".
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {useFonts} from '../../lib/fonts';
import {E, P, clamp, lerp} from '../../lib/core';
import {FPS, T, pulse} from './time3';
import {Big as BigBase, C, Cut, Dot, Dust, F, Flash, Grain, IMG, Label, Paper, Reveal, Ring, Thin, Vignette, usePreload} from './fx';
import {Eye, rng} from './sims';
import DIMS from './img3.json';

Object.assign(IMG, DIMS as unknown as Record<string, [number, number]>);
const ALL = Object.keys(DIMS);
const Big: typeof BigBase = (p) => <BigBase {...p} anim="clip" />;

// ---------- cena / câmera (mesmas regras do Nº 01) ----------
type Wipe = {kind: 'iris' | 'slit' | 'checker'; x?: number; y?: number; d: number};
// casas de 135 px que abrem em onda diagonal (a partir de um canto) — clip-path com vários quadrados
const checker = (w: number, dir = 1) => { let d = ''; const n = 135; for (let r = 0; r < 15; r++) for (let c = 0; c < 8; c++) { const k = dir > 0 ? r + c : 14 - r + 7 - c, u = clamp(w * 2.2 - k / 21), h = (n / 2) * u * 1.02; if (h <= 0) continue; const cx = c * n + n / 2, cy = r * n + n / 2 - 22; d += `M${(cx - h).toFixed(1)} ${(cy - h).toFixed(1)}H${(cx + h).toFixed(1)}V${(cy + h).toFixed(1)}H${(cx - h).toFixed(1)}Z`; } return `path('${d || 'M0 0Z'}')`; };
const Scene: React.FC<{t: number; a: number; b: number; inD?: number; outD?: number; zIn?: number; zOut?: number; children: React.ReactNode; bg?: string; light?: boolean; wipe?: Wipe; hold?: boolean}> = ({t, a, b, inD = 0.18, outD = 0.18, zIn = 1.06, zOut = 1.1, children, bg, light, wipe, hold}) => {
  if (t < a - 0.001 || t > b + outD) return null;
  const q = hold ? 0 : P(t, b, outD, E.in);
  const back = light ? <Paper /> : <div style={{position: 'absolute', inset: 0, background: bg ?? C.ink}} />;
  if (wipe) {
    const w = P(t, a, wipe.d, E.io), x = wipe.x ?? 540, y = wipe.y ?? 960, z = lerp(1.08, 1, P(t, a, wipe.d + 0.3, E.out));
    const clip = w >= 1 ? undefined : wipe.kind === 'iris' ? `circle(${(w * 2300).toFixed(0)}px at ${x}px ${y}px)` : wipe.kind === 'checker' ? checker(w, (wipe.x ?? 1) > 540 ? -1 : 1) : `inset(0 ${((1 - w) * 50).toFixed(2)}% 0 ${((1 - w) * 50).toFixed(2)}%)`;
    return <div style={{position: 'absolute', inset: 0, clipPath: clip, opacity: 1 - q, transform: `scale(${z * lerp(1, zOut, q)})`, filter: q > 0 ? `blur(${(q * 14).toFixed(1)}px)` : undefined}}>{back}{children}</div>;
  }
  const u = inD > 0 ? P(t, a, inD, E.out) : 1;
  return <div style={{position: 'absolute', inset: 0, opacity: Math.min(u * 1.2, 1) * (1 - q), transform: `scale(${lerp(zIn, 1, u) * lerp(1, zOut, q)})`, filter: u < 1 || q > 0 ? `blur(${((1 - u) * 10 + q * 14).toFixed(1)}px)` : undefined}}>{(light || bg) && back}{children}</div>;
};
const Cam: React.FC<{t: number; a: number; b: number; z0?: number; z1?: number; ox?: number; oy?: number; rot?: number; x0?: number; y0?: number; x1?: number; y1?: number; children: React.ReactNode}> = ({t, a, b, z0 = 1, z1 = 1.08, ox = 540, oy = 960, rot = 0, x0 = 0, y0 = 0, x1 = 0, y1 = 0, children}) => {
  const u = P(t, a, b - a, E.smooth);
  return <div style={{position: 'absolute', inset: 0, transformOrigin: `${ox}px ${oy}px`, transform: `translate(${lerp(x0, x1, u).toFixed(1)}px, ${lerp(y0, y1, u).toFixed(1)}px) scale(${lerp(z0, z1, u).toFixed(4)}) rotate(${(rot * u).toFixed(3)}deg)`}}>{children}</div>;
};

// ---------- tabuleiro em perspectiva + peças em traço de gravura ----------
const BD = {f: 820, h: 520, y0: 560, z0: 360, sq: 110};
const proj = (u: number, v: number) => { const X = (u - 4) * BD.sq, Z = BD.z0 + (8 - v) * BD.sq; return {x: 540 + (BD.f * X) / Z, y: BD.y0 + (BD.f * BD.h) / Z, k: BD.f / Z}; };
const PIECE: Record<string, string> = {
  pawn: 'M30 100 L70 100 L68 92 L60 88 Q58 72 56 64 Q66 59 66 48 Q66 35 50 34 Q34 35 34 48 Q34 59 44 64 Q42 72 40 88 L32 92 Z',
  king: 'M26 100 L74 100 L72 92 L62 86 Q60 66 58 52 L64 47 L60 41 L54 41 L54 31 L61 31 L61 25 L54 25 L54 16 L46 16 L46 25 L39 25 L39 31 L46 31 L46 41 L40 41 L36 47 L42 52 Q40 66 38 86 L28 92 Z',
  queen: 'M26 100 L74 100 L72 92 L62 86 Q60 66 59 54 L66 34 L58 44 L55 26 L50 42 L45 26 L42 44 L34 34 L41 54 Q40 66 38 86 L28 92 Z',
  rook: 'M28 100 L72 100 L70 92 L63 88 L61 50 L66 46 L66 32 L59 32 L59 38 L54 38 L54 32 L46 32 L46 38 L41 38 L41 32 L34 32 L34 46 L39 50 L37 88 L30 92 Z',
  bishop: 'M30 100 L70 100 L68 92 L60 88 Q58 72 57 62 Q67 54 62 40 Q58 31 50 24 Q42 31 38 40 Q33 54 43 62 Q42 72 40 88 L32 92 Z M47 22 Q50 16 53 22 Z',
  knight: 'M28 100 L72 100 L70 92 L64 88 Q68 66 64 50 Q61 34 50 26 L47 18 L43 27 Q33 32 29 44 L27 52 L36 56 L43 50 L47 54 Q34 66 35 88 L30 92 Z',
};
const Piece: React.FC<{kind: keyof typeof PIECE | string; x: number; y: number; s: number; color: string; fill?: string; rot?: number; glow?: boolean; opacity?: number}> = ({kind, x, y, s, color, fill = 'none', rot = 0, glow, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s / 100}) translate(-50 -100)`} opacity={opacity} style={glow ? {filter: `drop-shadow(0 0 ${12 / (s / 100)}px ${C.or})`} : undefined}>
    <path d={PIECE[kind]} fill={fill} stroke={color} strokeWidth={(3 * 100) / s} strokeLinejoin="round" />
    {fill === 'none' && [0, 1, 2, 3, 4, 5].map((k) => <line key={k} x1={40 + k * 3} y1={60 + k * 4} x2={36 + k * 3} y2={92} stroke={color} strokeWidth={(1.2 * 100) / s} opacity={0.5} />)}
  </g>
);
const Board: React.FC<{t: number; a: number; fg: string; d?: number; children?: React.ReactNode; opacity?: number}> = ({t, a, fg, d = 1.6, children, opacity = 1}) => {
  const g = P(t, a, d, E.io);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity}}>
      <defs><pattern id={`h${fg.slice(1)}`} patternUnits="userSpaceOnUse" width={9} height={9}><path d="M0 9 L9 0" stroke={fg} strokeWidth={1.1} opacity={0.55} /></pattern></defs>
      {Array.from({length: 64}, (_, i) => { const u = i % 8, v = Math.floor(i / 8); if ((u + v) % 2 === 0) return null; const p = [proj(u, v), proj(u + 1, v), proj(u + 1, v + 1), proj(u, v + 1)]; const o = clamp(g * 1.6 - (Math.abs(u - 3.5) + Math.abs(v - 3.5)) * 0.08); return <polygon key={i} points={p.map((q) => `${q.x},${q.y}`).join(' ')} fill={`url(#h${fg.slice(1)})`} opacity={o} />; })}
      {Array.from({length: 9}, (_, k) => { const p0 = proj(k, 0), p1 = proj(k, 8), q0 = proj(0, k), q1 = proj(8, k); return <g key={k}><line x1={p0.x} y1={p0.y} x2={lerp(p0.x, p1.x, g)} y2={lerp(p0.y, p1.y, g)} stroke={fg} strokeWidth={1.6} /><line x1={q0.x} y1={q0.y} x2={lerp(q0.x, q1.x, g)} y2={lerp(q0.y, q1.y, g)} stroke={fg} strokeWidth={1.6} /></g>; })}
      {children}
    </svg>
  );
};
const at = (u: number, v: number) => { const p = proj(u + 0.5, v + 0.5); return {x: p.x, y: p.y, s: 190 * p.k}; };
/** casa do xadrez (coluna a=0…h=7, fileira 1=0…8=7) vista do lado das brancas, peças em escala menor */
const sq = (file: number, rank: number) => { const p = proj(file + 0.5, 7 - rank + 0.5); return {x: p.x, y: p.y, s: 112 * p.k}; };

// ------------------------------------------------------------------ 0–1 · 1997: a máquina vence (posição real da partida 6)
const W6: [string, number, number][] = [['rook', 0, 0], ['king', 6, 0], ['pawn', 1, 1], ['pawn', 5, 1], ['pawn', 6, 1], ['pawn', 7, 1], ['bishop', 6, 2], ['knight', 5, 2], ['queen', 3, 2], ['pawn', 3, 3]];
const B6: [string, number, number][] = [['rook', 0, 7], ['rook', 7, 7], ['pawn', 0, 6], ['knight', 3, 6], ['bishop', 4, 6], ['pawn', 6, 6], ['bishop', 2, 5], ['pawn', 7, 5], ['pawn', 1, 4], ['knight', 3, 4], ['pawn', 5, 4]];
const Open: React.FC<{t: number}> = ({t}) => {
  const born = P(t, T.hit0, 0.5, E.out), k = sq(2, 7);
  const mv = P(t, T.maquina + 0.35, 0.55, E.io), c2 = sq(2, 1), c4 = sq(2, 3), cp = {x: lerp(c2.x, c4.x, mv), y: lerp(c2.y, c4.y, mv), s: lerp(c2.s, c4.s, mv)};
  const fall = P(t, T.xadrez - 0.05, 0.5, E.in), shake = t > T.xadrez + 0.45 && t < T.xadrez + 0.75 ? Math.sin(t * 90) * 5 * (1 - (t - T.xadrez - 0.45) / 0.3) : 0;
  const tower = P(t, T.maquina - 0.45, 1.3, E.out);
  return (
    <Cam t={t} a={0} b={8.9} z0={1.16} z1={1.0} oy={1250}>
      {/* Deep Blue sobe atrás do tabuleiro */}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${((1 - tower) * 160).toFixed(1)}px)`, opacity: tower}}>
        <Reveal name="deepblue" p={P(t, T.maquina - 0.45, 1.1, E.smooth)} x={540} y={655} width={262} edge={0} />
      </div>
      <Board t={t} a={0.8} fg={C.bone} d={2.2}>
        {B6.map(([kd, u, v], i) => { const q = sq(u, v); return <Piece key={`b${i}`} kind={kd} x={q.x} y={q.y} s={q.s * (kd === 'pawn' ? 1 : 1.12)} color={C.bone} fill="#55534e" opacity={P(t, 2.0 + i * 0.05, 0.5)} />; })}
        {W6.map(([kd, u, v], i) => { const q = sq(u, v); return <Piece key={`w${i}`} kind={kd} x={q.x} y={q.y} s={q.s * (kd === 'pawn' ? 1 : 1.12)} color={C.bone} opacity={P(t, 2.3 + i * 0.05, 0.5)} />; })}
        <Piece kind="pawn" x={cp.x} y={cp.y} s={cp.s} color={C.or} glow opacity={P(t, 2.3, 0.5)} />
        <Piece kind="king" x={k.x + fall * 26} y={k.y + shake} s={k.s * 1.2} color={C.bone} fill="#55534e" rot={fall * 88} opacity={P(t, 2.0, 0.5)} />
      </Board>
      <Dot x={c2.x} y={c2.y - c2.s * 0.45} r={15 * born * (1 - P(t, 2.3, 0.4))} glow={1.2} />
      <Ring t={t} at={T.hit0} x={c2.x} y={c2.y - c2.s * 0.45} r1={1100} d={1.6} />
      <Big t={t} at={T.ano - 0.05} out={T.maquina - 0.2} text="1997" size={300} y={360} stagger={0.05} />
      <Thin t={t} at={T.maquina - 0.1} out={T.xadrez - 0.1} text="uma máquina venceu o campeão mundial" size={62} y={318} />
      <Big t={t} at={T.xadrez - 0.04} out={8.75} text="XADREZ" size={150} y={318} color={C.bone} />
      <Label t={t} at={1.2} out={T.maquina - 0.3} text="Nº 03" y={230} />
      <Label t={t} at={T.maquina - 0.1} out={8.7} text="FIG. I — DEEP BLUE × KASPAROV · 1997, PARTIDA 6" y={200} align="center" size={21} />
    </Cam>
  );
};

// ------------------------------------------------------------------ 2 · parecia o fim (papel)
const End: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={8.9} b={11.05} z0={1.0} z1={1.1} oy={900}>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <Piece kind="king" x={560} y={1010} s={420} color={C.pen} rot={88} />
      <line x1={180} y1={1030} x2={900} y2={1030} stroke={C.pen} strokeWidth={2} />
      {Array.from({length: 40}, (_, i) => <line key={i} x1={190 + i * 18} y1={1032} x2={178 + i * 18} y2={1050} stroke={C.pen} strokeWidth={1} opacity={0.4} />)}
    </svg>
    <Thin t={t} at={T.parecia - 0.05} out={10.95} text="parecia o" size={96} y={430} color={C.pen} />
    <Big t={t} at={T.fim - 0.05} out={10.95} text="FIM" size={330} y={640} color={C.pen} stagger={0.06} />
    <Thin t={t} at={T.historia - 0.1} out={10.95} text="da história." size={96} y={1250} color={C.pen} />
  </Cam>
);

// ------------------------------------------------------------------ 3 · a outra pergunta
const Question: React.FC<{t: number}> = ({t}) => {
  const d = P(t, T.outra - 0.2, 0.9, E.io), sx = 0.5, ox = 470, oy = 120;
  return (
    <Cam t={t} a={11.0} b={13.7} z0={1.06} z1={1.0} oy={900}>
      <Reveal name="kasparov" p={P(t, 10.95, 0.85, E.smooth)} x={470} y={1020} width={860} edge={0} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${ox} ${oy}) scale(${sx})`}>
          <path d="M 372 560 C 372 330, 708 330, 708 550 C 708 690, 540 700, 540 870" fill="none" stroke={C.or} strokeWidth={34} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d} style={{filter: `drop-shadow(0 0 18px ${C.or})`}} />
        </g>
      </svg>
      <Dot x={ox + 540 * sx} y={oy + 1000 * sx} r={13 * P(t, T.pergunta - 0.2, 0.4, E.out)} glow={1.4} />
      <Label t={t} at={T.mas} out={13.5} text="GARRY KASPAROV · CAMPEÃO MUNDIAL 1985–2000" y={230} />
      <Thin t={t} at={T.mas - 0.05} out={T.pergunta - 0.15} text="mas o próprio Kasparov…" size={80} y={1360} />
      <Thin t={t} at={T.pergunta - 0.1} out={13.55} text="fez outra pergunta." size={92} y={1360} />
    </Cam>
  );
};
// e se jogassem juntos? (papel) — o segredo do Turco: havia um humano dentro da máquina
const Together: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={13.6} b={16.4} z0={1.04} z1={1.16} oy={760}>
    <Reveal name="turk3" p={P(t, 13.55, 1.7, E.smooth)} x={540} y={760} width={1000} light />
    <Thin t={t} at={T.ese - 0.05} out={T.juntos - 0.15} text="e se humanos e máquinas" size={86} y={1300} color={C.pen} />
    <Big t={t} at={T.juntos - 0.06} out={16.3} text="JUNTOS?" size={230} y={1330} color={C.pen} />
    <Label t={t} at={14.2} out={16.3} text="FIG. II — RACKNITZ, 1789 · HAVIA UM HOMEM DENTRO" y={230} color={C.pdim} />
  </Cam>
);

// ------------------------------------------------------------------ 4 · o torneio (2005)
const LEAF = ['GM + PC', 'SUPER PC', 'GM + PC', 'SUPER PC', 'GM + PC', 'SUPER PC', 'GM + PC', '?'];
const Bracket: React.FC<{t: number; a: number; fg: string; win?: number; children?: React.ReactNode}> = ({t, a, fg, win = 0, children}) => {
  const ys = LEAF.map((_, i) => 470 + i * 112), xs = [210, 430, 640, 840];
  const seg = (k: number) => P(t, a + 0.25 + k * 0.32, 0.5, E.io);
  const lines: React.ReactNode[] = [];
  let cur = ys;
  for (let r = 0; r < 3; r++) {
    const next: number[] = [];
    for (let i = 0; i < cur.length; i += 2) { const y = (cur[i] + cur[i + 1]) / 2, u = seg(r), hot = win > 0 && i + 1 === cur.length - 1; next.push(y);
      lines.push(<path key={`${r}-${i}`} d={`M${xs[r]} ${cur[i]} H${(xs[r] + xs[r + 1]) / 2} V${cur[i + 1]} H${xs[r]} M${(xs[r] + xs[r + 1]) / 2} ${y} H${xs[r + 1]}`} fill="none" stroke={hot ? C.or : fg} strokeWidth={hot ? 4 : 2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - (hot ? Math.max(u, win) : u)} opacity={0.85} style={hot ? {filter: `drop-shadow(0 0 8px ${C.or})`} : undefined} />); }
    cur = next;
  }
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {lines}
      {LEAF.map((n, i) => { const u = P(t, a + i * 0.06, 0.4, E.out), last = i === LEAF.length - 1; return <text key={i} x={xs[0] - 16} y={ys[i] + 8} textAnchor="end" fontFamily={F.mono} fontSize={24} letterSpacing="0.08em" fill={last && win > 0 ? C.or : fg} opacity={u * (last ? 1 : 0.8)}>{last && win > 0 ? '2 + 3' : n}</text>; })}
      {children}
    </svg>
  );
};
const Tournament: React.FC<{t: number}> = ({t}) => {
  return (
    <Cam t={t} a={16.3} b={22.1} z0={1.0} z1={1.07} oy={900}>
      <Reveal name="hercules" p={P(t, 16.3, 2.0, E.smooth)} x={540} y={900} width={1300} opacity={0.12} edge={0} />
      <Bracket t={t} a={T.anos - 0.1} fg={C.bone} />
      <Big t={t} at={T.anos - 0.05} out={T.grandes - 0.1} text="2005" size={250} y={300} stagger={0.05} />
      <Label t={t} at={T.torneio - 0.2} out={22.0} text="FIG. III — TORNEIO FREESTYLE · 2005" y={230} />
      <Thin t={t} at={T.grandes - 0.05} out={T.super - 0.1} text="grandes mestres com computadores." size={70} y={1340} />
      <Thin t={t} at={T.super - 0.05} out={22.0} text="supercomputadores sozinhos." size={70} y={1340} />
    </Cam>
  );
};

// ------------------------------------------------------------------ 5 · silêncio: quem venceu?
const Who: React.FC<{t: number}> = ({t}) => {
  const tremble = Math.sin(t * 50) * 2.5 * P(t, 22.6, 1.2);
  return (
    <Cam t={t} a={22.0} b={24.38} z0={1.0} z1={1.5} ox={840} oy={1010}>
      <Bracket t={t} a={16.28} fg={C.bone} />
      <Dot x={880 + tremble} y={1010} r={12 + 6 * P(t, 23.4, 0.9)} glow={1 + 2 * P(t, 23.4, 0.9)} />
      <Thin t={t} at={T.quem - 0.05} out={24.3} text="quem venceu…" size={96} y={1340} />
    </Cam>
  );
};

// ------------------------------------------------------------------ 6 · DOIS AMADORES (papel, explosão)
const Amateurs: React.FC<{t: number}> = ({t}) => {
  const h = P(t, T.amadores - 0.1, 0.5, E.out);
  const Person = ({x, u}: {x: number; u: number}) => <g transform={`translate(${x} ${640 + (1 - u) * 40})`} opacity={u}><circle cx={0} cy={0} r={46} fill="none" stroke={C.pen} strokeWidth={4} /><path d="M-80 200 Q-80 80 0 80 Q80 80 80 200" fill="none" stroke={C.pen} strokeWidth={4} />{[0, 1, 2, 3, 4, 5, 6].map((k) => <line key={k} x1={-60 + k * 18} y1={120 + Math.abs(k - 3) * 6} x2={-66 + k * 18} y2={196} stroke={C.pen} strokeWidth={1.2} opacity={0.5} />)}</g>;
  const Pc = ({x, u}: {x: number; u: number}) => <g transform={`translate(${x} ${980 + (1 - u) * 40})`} opacity={u}><rect x={-90} y={-70} width={180} height={120} rx={10} fill="none" stroke={C.pen} strokeWidth={4} /><rect x={-74} y={-56} width={148} height={92} fill="none" stroke={C.pen} strokeWidth={1.5} opacity={0.6} /><line x1={0} y1={50} x2={0} y2={80} stroke={C.pen} strokeWidth={4} /><line x1={-50} y1={82} x2={50} y2={82} stroke={C.pen} strokeWidth={4} /><circle cx={0} cy={-10} r={9} fill={C.or} style={{filter: `drop-shadow(0 0 10px ${C.or})`}} /></g>;
  return (
    <Cam t={t} a={T.back} b={27.7} z0={1.12} z1={1.0} oy={800}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <Person x={380} u={h} /><Person x={700} u={P(t, T.amadores, 0.5, E.out)} />
        {[0, 1, 2].map((k) => <Pc key={k} x={260 + k * 280} u={P(t, T.tres - 0.1 + k * 0.12, 0.45, E.out)} />)}
      </svg>
      <Big t={t} at={T.dois - 0.04} out={27.55} text="DOIS AMADORES" size={150} y={360} color={C.pen} stagger={0.025} />
      <Thin t={t} at={T.tres - 0.1} out={27.55} text="com três computadores comuns." size={74} y={1200} color={C.pen} />
      <Label t={t} at={24.6} out={27.5} text="CAMPEÕES · FREESTYLE 2005" y={230} color={C.or} />
    </Cam>
  );
};

// ------------------------------------------------------------------ 7 · não eram os melhores
const Strike: React.FC<{t: number; at: number; y: number; w?: number}> = ({t, at, y, w = 760}) => { const u = P(t, at, 0.3, E.out); return <div style={{position: 'absolute', left: 540 - w / 2, top: y - 5, width: w * u, height: 10, background: C.or, boxShadow: `0 0 18px ${C.or}`, transform: 'rotate(-3deg)', transformOrigin: '0 50%'}} />; };
const NotBest: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={27.6} b={31.4} z0={1.0} z1={1.08} oy={800}>
    <Reveal name="chessplayers" p={P(t, 27.55, 1.4, E.smooth)} x={540} y={720} width={1000} />
    <Thin t={t} at={T.eles - 0.05} out={31.25} text="não eram os melhores jogadores." size={74} y={1230} />
    <Strike t={t} at={T.jogadores + 0.25} y={1240} w={900} />
    <Thin t={t} at={T.naotinham - 0.05} out={31.25} text="nem tinham as melhores máquinas." size={74} y={1350} />
    <Strike t={t} at={T.maquinas2 + 0.25} y={1360} w={940} />
    <Label t={t} at={27.8} out={31.2} text="FIG. IV — JOGADORES DE XADREZ · SÉC. XIX" y={230} />
  </Cam>
);

// ------------------------------------------------------------------ 8 · PROCESSO (papel) — Quíron ensinando Aquiles
const Process: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={31.3} b={33.75} z0={1.0} z1={1.1} oy={760}>
    <Reveal name="chiron" p={P(t, 31.2, 1.6, E.smooth)} x={540} y={760} width={820} light />
    <Thin t={t} at={T.tinham - 0.05} out={33.6} text="tinham o melhor" size={90} y={1230} color={C.pen} />
    <Big t={t} at={T.processo - 0.06} out={33.6} text="PROCESSO" size={220} y={1370} color={C.or} />
    <Label t={t} at={31.5} out={33.5} text="FIG. V — QUÍRON ENSINA AQUILES" y={230} color={C.pdim} />
  </Cam>
);

// ------------------------------------------------------------------ 9 · centauros: ouvir a máquina, confiar em si
const Centaur: React.FC<{t: number}> = ({t}) => {
  const scan = ((t - 33.7) / 1.3) % 1;
  return (
    <Cam t={t} a={33.6} b={37.3} z0={1.12} z1={1.0} oy={800}>
      <Reveal name="centaur" p={P(t, 33.55, 1.6, E.smooth)} x={540} y={800} width={980} />
      {t > 34.6 && <Reveal name="centaur" p={scan} x={540} y={800} width={980} edgeOnly opacity={0.55} />}
      <Thin t={t} at={T.sabiam - 0.05} out={T.confiar - 0.35} text="a hora de ouvir a máquina…" size={82} y={1300} />
      <Thin t={t} at={T.confiar - 0.3} out={37.2} text="e a hora de confiar em si." size={88} y={1300} color={C.orHi} />
      <Label t={t} at={33.8} out={37.1} text="FIG. VI — 'CENTAUROS': HUMANO + MÁQUINA" y={230} />
    </Cam>
  );
};

// ------------------------------------------------------------------ 10 · a conclusão de Kasparov (papel): a equação
const Tok: React.FC<{t: number; at: number; text: string; y: number; size?: number; color?: string; head?: boolean; x?: number}> = ({t, at, text, y, size = 54, color = C.pen, head, x = 540}) => {
  const u = P(t, at, 0.45, E.out); if (u <= 0) return null;
  return <div style={{position: 'absolute', left: x - 600, width: 1200, top: y - size * 0.6, textAlign: 'center', fontFamily: head ? F.head : F.mono, fontWeight: head ? 900 : 500, fontSize: size, letterSpacing: head ? '-0.03em' : '0.1em', color, opacity: u, transform: `translateY(${((1 - u) * 24).toFixed(1)}px)`, filter: u < 0.99 ? `blur(${((1 - u) * 8).toFixed(1)}px)` : undefined, whiteSpace: 'nowrap'}}>{text}</div>;
};
const Equation: React.FC<{t: number}> = ({t}) => {
  const line = P(t, T.venceu3 - 0.1, 0.4, E.io);
  return (
    <Cam t={t} a={37.2} b={46.4} z0={1.0} z1={1.06} oy={820}>
      <Label t={t} at={T.kasparov2} out={46.2} text="KASPAROV, 2010 · A CONCLUSÃO" y={230} color={C.pdim} />
      {(() => { const u = P(t, T.kasparov2 - 0.1, 0.6, E.out); return <div style={{position: 'absolute', left: 840, top: 280, width: 170, height: 170, borderRadius: '50%', overflow: 'hidden', opacity: u, transform: `scale(${lerp(0.8, 1, u)})`, boxShadow: `0 0 0 3px ${C.pen}, 0 0 0 9px ${C.paper}, 0 0 0 10.5px ${C.or}`, background: '#d9d2c3'}}><Cut name="kasparov" x={85} y={135} width={240} style={{filter: 'grayscale(1) contrast(1.1)'}} /></div>; })()}
      <Tok t={t} at={T.gente - 0.05} text="HUMANO COMUM" y={430} size={58} />
      <Tok t={t} at={T.maqC - 0.05} text="+ MÁQUINA" y={530} size={58} />
      <Tok t={t} at={T.processo2 - 0.05} text="+ PROCESSO MELHOR" y={650} size={76} color={C.or} head />
      <div style={{position: 'absolute', left: 140, top: 748, width: 800 * line, height: 3, background: C.pen}} />
      <Tok t={t} at={T.venceu3 - 0.02} text="VENCEU" y={830} size={40} color={C.pdim} />
      <Tok t={t} at={T.maqF - 0.05} text="› A MÁQUINA MAIS FORTE" y={930} size={50} />
      <Tok t={t} at={T.evenceu - 0.05} text="› O GRANDE MESTRE" y={1060} size={50} />
      <Tok t={t} at={T.processo3 - 0.1} text="+ MÁQUINA + PROCESSO PIOR" y={1140} size={40} color={C.pdim} />
      {t > T.pior && <div style={{position: 'absolute', left: 230, top: 1140, width: 620 * P(t, T.pior, 0.3, E.out), height: 6, background: C.or, transform: 'rotate(-2deg)', boxShadow: `0 0 12px ${C.or}`}} />}
      <Dot x={540} y={650 - 92} r={10 + 5 * pulse(t, 0.13)} glow={1.4} opacity={P(t, T.processo2, 0.4)} />
    </Cam>
  );
};

// ------------------------------------------------------------------ 11–12 · a corrida pela ferramenta mais nova (cinza)
const NEWS = ['MODELO 5.0', 'NOVO AGENTE', 'IA PRO', 'BETA', 'PLUGIN', 'v2.1', 'LANÇOU HOJE', 'PROMPT PACK', 'APP NOVO', 'IA TURBO', 'v3 PREVIEW', 'GRÁTIS 7 DIAS', 'NOVO RECURSO', 'ATUALIZOU', 'MODELO 5.1', 'EXTENSÃO'];
const rn = rng(13);
const CARDS = Array.from({length: 46}, (_, i) => ({n: NEWS[i % NEWS.length], x: 110 + rn() * 860, y: 360 + rn() * 900, r: (rn() - 0.5) * 16, t0: 46.6 + Math.pow(i / 46, 0.65) * 5.0, fall: 0.6 + rn() * 0.8}));
const Race: React.FC<{t: number}> = ({t}) => {
  const vis = CARDS.filter((c) => t >= c.t0), last = vis[vis.length - 1], drop = Math.max(0, t - T.quase), empty = P(t, T.construindo - 0.2, 0.8, E.io);
  const cur = last ? {x: last.x + 80, y: last.y + 40} : {x: 540, y: 900};
  return (
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 70% at 50% 45%, #262629 0%, ${C.graph} 55%, #101012 100%)`}}>
      <Label t={t} at={T.agora} out={54.0} text="FIG. VII — A CORRIDA" y={230} />
      {/* planta de processo vazia, aparece quando tudo cai */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: empty * 0.6}}>
        {Array.from({length: 22}, (_, k) => <line key={`v${k}`} x1={60 + k * 46} y1={330} x2={60 + k * 46} y2={1290} stroke="#4a4a50" strokeWidth={1} />)}
        {Array.from({length: 22}, (_, k) => <line key={`h${k}`} x1={60} y1={330 + k * 46} x2={1026} y2={330 + k * 46} stroke="#4a4a50" strokeWidth={1} />)}
      </svg>
      {vis.map((c, i) => { const u = P(t, c.t0, 0.25, E.out), fy = drop > 0 ? 1600 * Math.pow(drop * c.fall * 0.7, 2) : 0; return (
        <div key={i} style={{position: 'absolute', left: c.x - 120, top: c.y - 40 + fy, width: 240, height: 80, borderRadius: 14, background: '#2b2b2f', boxShadow: '0 0 0 1px #3c3c41, 0 18px 40px rgba(0,0,0,.45)', transform: `rotate(${c.r + drop * 60 * (c.fall - 1)}deg) scale(${lerp(0.7, 1, u)})`, opacity: u, fontFamily: F.mono, fontSize: 20, color: '#a3a19b', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', boxSizing: 'border-box', whiteSpace: 'nowrap'}}>
          <span style={{fontSize: 13, padding: '3px 7px', borderRadius: 6, background: '#3a3a40', color: '#d8d5ce'}}>NOVO</span>{c.n}
        </div>); })}
      {drop <= 0 && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><path transform={`translate(${cur.x} ${cur.y}) scale(2.2)`} d="M0 0 L0 17 L4.5 13 L7.5 20 L10.5 18.8 L7.6 12 L14 12 Z" fill="#f2efe8" stroke="#000" strokeWidth={1} /></svg>}
      <Thin t={t} at={T.agora} out={T.todo - 0.15} text="olha a inteligência artificial." size={84} y={1390} color="#c9c6bf" />
      <Thin t={t} at={T.todo - 0.05} out={T.quase - 0.12} text="todo mundo atrás da ferramenta mais nova." size={64} y={1390} color="#c9c6bf" />
      <Thin t={t} at={T.quase - 0.05} out={54.0} text="quase ninguém construindo o" size={74} y={1250} color="#c9c6bf" />
      <Big t={t} at={T.processo4 - 0.06} out={54.0} text="PROCESSO." size={190} y={1390} color="#9a978f" />
    </div>
  );
};

// ------------------------------------------------------------------ 13 · o sistema em volta da máquina (papel)
const System: React.FC<{t: number}> = ({t}) => {
  const rings = [330, 420, 505], g = P(t, T.sistema - 0.2, 1.6, E.io), CY = 760;
  const nodes = Array.from({length: 14}, (_, i) => { const r = rings[i % 3], a = (i / 14) * Math.PI * 2 - Math.PI / 2 + (i % 3) * 0.2; return {x: 540 + Math.cos(a) * r, y: CY + Math.sin(a) * r * 0.92, a}; });
  return (
    <Cam t={t} a={54.0} b={58.9} z0={1.0} z1={1.1} oy={CY}>
      <Reveal name="deepblue" p={P(t, 53.95, 1.2, E.smooth)} x={540} y={CY} width={300} edge={0} style={{filter: 'contrast(1.1)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {rings.map((r, k) => <ellipse key={k} cx={540} cy={CY} rx={r} ry={r * 0.92} fill="none" stroke={C.or} strokeWidth={k === 1 ? 2.5 : 1.5} opacity={0.85} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp(g * 1.3 - k * 0.15)} transform={`rotate(${-90 + k * 30} 540 ${CY})`} />)}
        {nodes.map((n, i) => { const u = clamp(g * 1.6 - 0.4 - i * 0.03); return <g key={i} opacity={u}><line x1={540 + Math.cos(n.a) * 170} y1={CY + Math.sin(n.a) * 160} x2={n.x} y2={n.y} stroke={C.pen} strokeWidth={1} opacity={0.4} /><line x1={n.x} y1={n.y} x2={nodes[(i + 3) % 14].x} y2={nodes[(i + 3) % 14].y} stroke={C.or} strokeWidth={1.2} opacity={0.5} /><circle cx={n.x} cy={n.y} r={9} fill={C.or} style={{filter: `drop-shadow(0 0 8px ${C.or})`}} /></g>; })}
      </svg>
      <Thin t={t} at={T.vantagem - 0.25} out={T.sistema - 0.35} text="a vantagem nunca foi a máquina." size={76} y={1330} color={C.pen} />
      <Big t={t} at={T.sistema - 0.06} out={58.75} text="SISTEMA" size={230} y={1330} color={C.or} />
      <Thin t={t} at={T.desenha - 0.1} out={58.75} text="que você desenha em volta dela." size={70} y={1450} color={C.pen} />
      <Label t={t} at={54.2} out={58.7} text="FIG. VIII — O SISTEMA EM VOLTA" y={230} color={C.pdim} />
    </Cam>
  );
};

// ------------------------------------------------------------------ 14 · por enquanto… só observa — o olho (fecho da série)
const Final: React.FC<{t: number}> = ({t}) => {
  const open = t < T.sting ? P(t, T.por - 0.05, 0.95, E.io) * 0.92 + P(t, T.observa - 0.05, 0.4, E.out) * 0.08 : 1 - P(t, T.sting, 0.18, E.in);
  const pupil = t < T.observa ? 0.35 : t < T.sting ? lerp(0.35, 1, P(t, T.observa, 0.5, E.out)) : 1;
  const close = P(t, T.sting, 0.18, E.in), dotR = t > T.sting ? 14 * (1 + 0.6 * Math.exp(-(t - T.sting) / 0.2)) : 0, fade = P(t, 64.9, 1.0, E.in);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - fade}}>
      {close < 1 && <Eye t={t} open={Math.max(0.02, open)} pupil={pupil} cy={800} R={290} grid={0.13} />}
      {t > T.sting && <Dot x={540} y={800} r={dotR} glow={2} />}
      <Ring t={t} at={T.sting} x={540} y={800} r1={1300} d={1.5} />
      <Thin t={t} at={T.por - 0.02} out={T.sting - 0.1} text="por enquanto…" size={86} y={1230} color={C.dim} />
      <Thin t={t} at={T.so - 0.05} out={64.4} text="só observa." size={136} y={1370} />
      <Label t={t} at={62.0} out={64.6} text="Nº 03" y={1460} align="center" color={C.or} size={26} />
    </div>
  );
};

const LIGHT: [number, number][] = [[8.9, 11.0], [13.6, 16.35], [T.back, 27.6], [31.3, 33.6], [37.2, 46.35], [54.0, 58.8]];

export const Centauros: React.FC<{audio: 'none' | 'mix'}> = ({audio}) => {
  useFonts(); usePreload(ALL);
  const frame = useCurrentFrame(), t = frame / FPS;
  const pu = pulse(t), loud = t > T.back && t < T.cut, shake = loud ? pu * 3 : 0;
  const lightK = LIGHT.reduce((m, [a, b]) => Math.max(m, P(t, a, 0.4, E.io) * (1 - P(t, b, 0.35, E.io))), 0);
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden', fontFamily: F.head}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${(Math.sin(t * 53) * shake).toFixed(1)}px, ${(Math.cos(t * 41) * shake).toFixed(1)}px) scale(${(1 + (loud ? 0.012 : 0.004) * pu).toFixed(4)})`}}>
        <Scene t={t} a={0} b={8.9} inD={0} outD={0.45} hold><Open t={t} /></Scene>
        <Scene t={t} a={8.9} b={11.0} light wipe={{kind: 'checker', x: 0, d: 0.5}} outD={0.5} hold><End t={t} /></Scene>
        <Scene t={t} a={11.0} b={13.6} wipe={{kind: 'checker', x: 1080, d: 0.45}} outD={0.45} hold><Question t={t} /></Scene>
        <Scene t={t} a={13.6} b={16.35} light wipe={{kind: 'iris', x: 540, y: 1000, d: 0.38}} outD={0.4} hold><Together t={t} /></Scene>
        <Scene t={t} a={16.35} b={22.0} wipe={{kind: 'slit', d: 0.32}} outD={0.25}><Tournament t={t} /></Scene>
        <Scene t={t} a={22.0} b={T.back} inD={0.25} zIn={1.0} outD={0.4} hold bg={C.ink}><Who t={t} /></Scene>
        <Scene t={t} a={T.back} b={27.6} light wipe={{kind: 'iris', x: 880, y: 1010, d: 0.3}} outD={0.4} hold><Amateurs t={t} /></Scene>
        <Scene t={t} a={27.6} b={31.3} wipe={{kind: 'checker', x: 1080, d: 0.42}} outD={0.45} hold><NotBest t={t} /></Scene>
        <Scene t={t} a={31.3} b={33.6} light wipe={{kind: 'iris', x: 540, y: 1370, d: 0.32}} outD={0.4} hold><Process t={t} /></Scene>
        <Scene t={t} a={33.6} b={37.2} wipe={{kind: 'slit', d: 0.3}} outD={0.4} hold><Centaur t={t} /></Scene>
        <Scene t={t} a={37.2} b={46.35} light wipe={{kind: 'checker', x: 0, d: 0.45}} outD={0.45} hold><Equation t={t} /></Scene>
        <Scene t={t} a={46.35} b={54.0} wipe={{kind: 'slit', d: 0.3}} bg={C.graph} outD={0.4} hold><Race t={t} /></Scene>
        <Scene t={t} a={54.0} b={58.8} light wipe={{kind: 'checker', x: 1080, d: 0.45}} outD={0.45} hold><System t={t} /></Scene>
        <Scene t={t} a={58.8} b={67} wipe={{kind: 'iris', x: 540, y: 760, d: 0.45}}><Final t={t} /></Scene>
      </div>
      <Dust t={t} n={60} opacity={(1 - lightK) * (t > 46.3 && t < 54 ? 0.25 : 0.7)} warm={0.08} />
      <Flash t={t} at={T.hit0} d={0.5} color={C.or} max={0.35} />
      <Flash t={t} at={T.xadrez + 0.5} d={0.3} max={0.25} />
      <Flash t={t} at={T.back} d={0.5} max={0.85} />
      <Flash t={t} at={T.processo} d={0.35} color={C.or} max={0.35} />
      <Flash t={t} at={T.sistema} d={0.4} color={C.or} max={0.4} />
      <Flash t={t} at={T.sting} d={0.6} color={C.or} max={0.55} />
      <Vignette strength={lerp(0.8, 0.32, lightK)} />
      <Grain frame={frame} amount={0.07 * (1 - lightK)} />
      <Grain frame={frame} amount={0.1 * lightK} dark />
      {audio === 'mix' && <Audio src={staticFile('eco3/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
