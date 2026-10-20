// "ECOSSISTEMA" — Nº 01 da série. Um ponto laranja (vida/consciência) atravessa a história do pensamento:
// pergunta → Da Vinci → Newton → dupla fenda → Flammarion → partes soltas (silêncio) → floresta → cérebro → revoada →
// não é máquina → ECOSSISTEMA → a empresa comum (cinza, sem vida) → "eu acredito" (o coração volta) → vivo → o olho: "só observa".
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {useFonts} from '../../lib/fonts';
import {E, P, clamp, lerp} from '../../lib/core';
import {BEAT, FPS, T, pulse} from './time';
import {Big, C, Cut, Dot, Dust, F, Flash, Grain, Label, Reveal, Ring, Thin, Vignette, usePreload} from './fx';
import {DoubleSlit, Ecg, Eye, Flock, Forest, Gears, Net, rng} from './sims';

const ALL = ['vitruvian', 'purkinje', 'cajal', 'flammarion', 'mycetozoa', 'newton', 'atlas', 'gears'];

/** janela de cena com entrada/saída curtas (zoom + desfoque) */
const Scene: React.FC<{t: number; a: number; b: number; inD?: number; outD?: number; zIn?: number; zOut?: number; children: React.ReactNode; bg?: string}> = ({t, a, b, inD = 0.18, outD = 0.18, zIn = 1.06, zOut = 1.1, children, bg}) => {
  if (t < a - 0.001 || t > b + outD) return null;
  const u = inD > 0 ? P(t, a, inD, E.out) : 1, q = P(t, b, outD, E.in);
  return <div style={{position: 'absolute', inset: 0, background: bg, opacity: Math.min(u * 1.2, 1) * (1 - q), transform: `scale(${lerp(zIn, 1, u) * lerp(1, zOut, q)})`, filter: u < 1 || q > 0 ? `blur(${((1 - u) * 10 + q * 14).toFixed(1)}px)` : undefined}}>{children}</div>;
};
/** câmera lenta (push-in) dentro da cena */
const Cam: React.FC<{t: number; a: number; b: number; z0?: number; z1?: number; ox?: number; oy?: number; rot?: number; x0?: number; y0?: number; x1?: number; y1?: number; children: React.ReactNode}> = ({t, a, b, z0 = 1, z1 = 1.08, ox = 540, oy = 960, rot = 0, x0 = 0, y0 = 0, x1 = 0, y1 = 0, children}) => {
  const u = P(t, a, b - a, E.smooth);
  return <div style={{position: 'absolute', inset: 0, transformOrigin: `${ox}px ${oy}px`, transform: `translate(${lerp(x0, x1, u).toFixed(1)}px, ${lerp(y0, y1, u).toFixed(1)}px) scale(${lerp(z0, z1, u).toFixed(4)}) rotate(${(rot * u).toFixed(3)}deg)`}}>{children}</div>;
};

// ------------------------------------------------------------------ 0 · a pergunta
const Question: React.FC<{t: number}> = ({t}) => {
  const d = P(t, T.tudo, 1.25, E.io), dotY = 1095, born = P(t, T.hit0, 0.5, E.out);
  const breathe = 1 + 0.08 * Math.sin(t * 3.2), r = 16 * born * breathe * (t > T.tudo ? 1 : 1.25);
  const zoom = P(t, 6.0, 0.4, E.in);
  return (
    <div style={{position: 'absolute', inset: 0, transformOrigin: `540px ${dotY}px`, transform: `scale(${lerp(1, 9, zoom)})`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d="M 372 650 C 372 420, 708 420, 708 640 C 708 780, 540 790, 540 960" fill="none" stroke={C.bone} strokeWidth={44} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d} style={{filter: 'drop-shadow(0 0 20px rgba(242,239,232,.25))'}} />
        {d > 0 && d < 1 && (() => { const pt = qpt(d); return <circle cx={pt.x} cy={pt.y} r={14} fill={C.or} style={{filter: `drop-shadow(0 0 16px ${C.or})`}} />; })()}
      </svg>
      <Dot x={540} y={dotY} r={r} glow={1 + 0.4 * Math.sin(t * 3.2)} />
      <Ring t={t} at={T.hit0} x={540} y={dotY} r1={1100} d={1.6} />
      <Ring t={t} at={T.hit0 + 0.12} x={540} y={dotY} r1={700} d={1.3} color={C.bone} width={1.5} />
    </div>
  );
};
// ponto aproximado ao longo do "?" (para a ponta de tinta laranja)
const qpt = (u: number) => {
  const seg = (p0: number[], p1: number[], p2: number[], p3: number[], s: number) => ({x: (1 - s) ** 3 * p0[0] + 3 * (1 - s) ** 2 * s * p1[0] + 3 * (1 - s) * s * s * p2[0] + s ** 3 * p3[0], y: (1 - s) ** 3 * p0[1] + 3 * (1 - s) ** 2 * s * p1[1] + 3 * (1 - s) * s * s * p2[1] + s ** 3 * p3[1]});
  return u < 0.62 ? seg([372, 650], [372, 420], [708, 420], [708, 640], u / 0.62) : seg([708, 640], [708, 780], [540, 790], [540, 960], (u - 0.62) / 0.38);
};

// ------------------------------------------------------------------ 1 · Da Vinci
const VIT = {x: 540, y: 930, w: 1000};
const vit = (nx: number, ny: number) => ({x: VIT.x - VIT.w / 2 + nx * VIT.w, y: VIT.y - (VIT.w * 2000) / 1440 / 2 + ny * ((VIT.w * 2000) / 1440)});
const DaVinci: React.FC<{t: number}> = ({t}) => {
  const p = P(t, T.davinci - 0.1, 2.9, E.smooth), c = vit(0.5, 0.455), R = 0.4167 * VIT.w * (720 / 720), sq0 = vit(0.118, 0.195), sq1 = vit(0.889, 0.745);
  const dc = P(t, T.corpo - 0.1, 1.1, E.io), ds = P(t, T.corpo + 0.25, 1.0, E.io);
  const beat = t > T.vivo ? Math.exp(-((t - T.vivo) % 0.67) / 0.12) : 0;
  return (
    <Cam t={t} a={6.3} b={10.95} z0={1.02} z1={1.16} oy={c.y} rot={-1.2}>
      <Reveal name="vitruvian" p={p} x={VIT.x} y={VIT.y} width={VIT.w} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={c.x} cy={c.y} r={R} fill="none" stroke={C.or} strokeWidth={2.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dc} transform={`rotate(-90 ${c.x} ${c.y})`} opacity={0.9} />
        <rect x={sq0.x} y={sq0.y} width={sq1.x - sq0.x} height={sq1.y - sq0.y} fill="none" stroke={C.or} strokeWidth={2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ds} opacity={0.75} />
        {dc > 0 && dc < 1 && <line x1={c.x} y1={c.y} x2={c.x + R * Math.cos(dc * 6.283 - 1.5708)} y2={c.y + R * Math.sin(dc * 6.283 - 1.5708)} stroke={C.or} strokeWidth={1.5} opacity={0.8} />}
      </svg>
      <Dot x={c.x} y={c.y + 70} r={13 * (1 + 0.5 * beat)} glow={1 + beat} />
      <Big t={t} at={T.vivo} out={10.75} text="VIVO" size={300} y={1640} glow />
      <Label t={t} at={6.6} out={10.7} text="FIG. I — LEONARDO DA VINCI · c. 1490" y={150} />
    </Cam>
  );
};

// ------------------------------------------------------------------ 2 · Newton
const Newton: React.FC<{t: number}> = ({t}) => {
  const orbits = [[430, 130, 0], [320, 96, 0.5], [210, 64, 1.1]];
  return (
    <Cam t={t} a={10.95} b={13.4} z0={1.0} z1={1.1} oy={700}>
      <Big t={t} at={T.leis - 0.05} out={13.2} text="LEIS" size={420} y={560} color={C.bone} stagger={0.05} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {orbits.map(([rx, ry, d], i) => { const u = P(t, T.newton + 0.15 + d * 0.3, 1.0, E.io); return <ellipse key={i} cx={540} cy={640} rx={rx} ry={ry} fill="none" stroke={i ? C.bone : C.or} strokeOpacity={i ? 0.45 : 0.9} strokeWidth={i ? 1.5 : 2.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - u} transform="rotate(-14 540 640)" />; })}
      </svg>
      <Cut name="newton" x={540} y={1170} width={980} style={{filter: 'contrast(1.15) brightness(0.95)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {orbits.map(([rx, ry], i) => { const a = t * (1.4 - i * 0.3) + i * 2, x = 540 + rx * Math.cos(a), y = 640 + ry * Math.sin(a), th = -14 * Math.PI / 180, X = 540 + (x - 540) * Math.cos(th) - (y - 640) * Math.sin(th), Y = 640 + (x - 540) * Math.sin(th) + (y - 640) * Math.cos(th); const front = Math.sin(a) > 0; return front && t > T.newton + 0.4 && <circle key={i} cx={X} cy={Y} r={i ? 6 : 12} fill={i ? C.bone : C.or} style={{filter: i ? undefined : `drop-shadow(0 0 14px ${C.or})`}} />; })}
      </svg>
      <Label t={t} at={T.newton + 0.6} out={13.2} text="F = G · m₁m₂ / r²" y={1700} align="center" color={C.bone} size={30} />
      <Label t={t} at={11.1} out={13.2} text="FIG. II — ISAAC NEWTON · 1687" y={150} />
    </Cam>
  );
};

// ------------------------------------------------------------------ 3 · dupla fenda
const Quantum: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={13.4} b={15.6} z0={1.55} z1={1.0} oy={520} y0={-80} y1={0}>
    <DoubleSlit t={t} a={13.62} medir={T.medir} />
    <Label t={t} at={13.6} out={18.0} text="FIG. III — DUPLA FENDA" y={150} />
    <Label t={t} at={T.medir + 0.25} out={18.0} text="DETECTOR: LIGADO" x={84} y={200} color={C.or} />
    <Big t={t} at={T.medir} out={17.95} text="MEDIR" size={230} y={1810} glow />
    <Thin t={t} at={T.muda} out={17.95} text="muda o resultado." size={76} y={990} />
  </Cam>
);

// ------------------------------------------------------------------ 4 · desde sempre (Flammarion)
const Always: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={18.2} b={21.5} z0={1.05} z1={1.45} ox={360} oy={1130}>
    <Reveal name="flammarion" p={P(t, 18.1, 2.4, E.smooth)} x={540} y={960} width={1560} />
    <Dot x={330} y={1130} r={9} glow={1.4} opacity={P(t, 19.4, 0.6)} />
    <Label t={t} at={18.3} out={21.3} text="FIG. IV — FLAMMARION · 1888" y={150} />
    <Thin t={t} at={T.mesma - 0.2} out={21.3} text="a mesma coisa." size={96} y={1560} />
  </Cam>
);

// ------------------------------------------------------------------ 5 · partes separadas (o silêncio)
const rp = rng(3);
const PARTS = Array.from({length: 150}, () => ({x: rp() * 1080, y: 200 + rp() * 1520, vx: (rp() - 0.5) * 30, vy: (rp() - 0.5) * 30, s: 3 + rp() * 6, ph: rp() * 6}));
const Parts: React.FC<{t: number}> = ({t}) => {
  const pull = P(t, 22.9, 1.45, E.in), slow = t < T.silence ? t - 21.45 : T.silence - 21.45 + (t - T.silence) * 0.35;
  const pos = PARTS.map((p, i) => { const jit = t > T.silence ? Math.sin(t * 40 + i) * 1.6 * (1 - pull) : 0; const x = p.x + p.vx * slow + jit, y = p.y + p.vy * slow + jit; return {x: lerp(x, 540 + (x - 540) * 0.04, pull), y: lerp(y, 960 + (y - 960) * 0.04, pull), s: p.s}; });
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {pos.map((p, i) => i % 3 === 0 && pos.slice(i + 1, i + 6).map((q, j) => { const d = Math.hypot(p.x - q.x, p.y - q.y); return d < 220 && <line key={`${i}-${j}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={C.bone} strokeWidth={1} opacity={(0.05 + 0.25 * pull) * (0.5 + 0.5 * Math.sin(t * 9 + i + j))} />; }))}
        {pos.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.s * (1 - 0.5 * pull)} fill={C.bone} opacity={0.75} />)}
      </svg>
      <Dot x={lerp(760, 540, pull)} y={lerp(600, 960, pull)} r={11 + 10 * pull} glow={1 + pull * 2} />
      <Thin t={t} at={T.partes - 0.05} out={T.algo - 0.2} text="partes separadas" size={96} y={1560} />
      <Thin t={t} at={T.algo} out={24.25} text="algo vivo." size={110} y={1560} color={C.orHi} />
    </>
  );
};

// ------------------------------------------------------------------ 6 · floresta
const Woods: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={T.back} b={27.0} z0={1.0} z1={1.16} oy={1150} y0={40} y1={-40}>
    <Reveal name="mycetozoa" p={P(t, T.back, 2.0, E.smooth)} x={540} y={1250} width={1000} opacity={0.1} edge={0} />
    <Forest t={t} a={T.back - 0.1} dur={1.7} pulses={P(t, 25.4, 0.5)} />
    <Big t={t} at={T.floresta - 0.08} out={25.85} text="FLORESTA" size={200} y={330} stagger={0.03} />
    <Thin t={t} at={T.raizes - 0.15} out={26.85} text="pelas raízes." size={110} y={360} />
    <Label t={t} at={24.6} out={26.8} text="FIG. V — REDE MICORRÍZICA" y={150} />
  </Cam>
);

// ------------------------------------------------------------------ 7 · cérebro
const Brain: React.FC<{t: number}> = ({t}) => {
  const ap = ((t - 27.6) / 1.1) % 1;
  return (
    <Cam t={t} a={26.95} b={29.6} z0={1.12} z1={1.0} oy={900}>
      <Reveal name="cajal" p={P(t, 26.9, 1.6, E.smooth)} x={150} y={980} width={520} opacity={0.32} edge={0} />
      <Reveal name="cajal" p={P(t, 27.0, 1.6, E.smooth)} x={930} y={980} width={520} opacity={0.32} edge={0} />
      <Reveal name="purkinje" p={P(t, T.cerebro - 0.2, 1.5, E.smooth)} x={540} y={930} width={900} />
      {t > 27.6 && <Reveal name="purkinje" p={ap} x={540} y={930} width={900} edgeOnly />}
      {t > T.conexoes && <Reveal name="purkinje" p={((t - T.conexoes) / 0.75) % 1} x={540} y={930} width={900} edgeOnly />}
      <Big t={t} at={T.conexoes - 0.05} out={29.45} text="CONEXÕES" size={190} y={1690} glow />
      <Thin t={t} at={T.bilhoes - 0.1} out={29.45} text="bilhões de" size={84} y={1540} />
      <Label t={t} at={27.1} out={29.4} text="FIG. VI — SANTIAGO RAMÓN Y CAJAL · 1899" y={150} />
    </Cam>
  );
};

// ------------------------------------------------------------------ 8 · revoada
const Birds: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={29.5} b={34.0} z0={1.0} z1={1.12} oy={900}>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 70% at 50% 40%, ${C.graph} 0%, ${C.ink} 75%)`}} />
    <Flock t={t} a={29.5} cy={880} scale={420} opacity={P(t, 29.5, 0.5)} />
    <Big t={t} at={T.comoum - 0.05} out={33.85} text="COMO UM SÓ" size={170} y={1590} stagger={0.035} />
    <Thin t={t} at={T.sem - 0.05} out={33.85} text="sem ninguém dando ordens." size={78} y={1730} />
    <Label t={t} at={29.7} out={33.8} text="FIG. VII — REVOADA · STURNUS VULGARIS" y={150} />
  </Cam>
);

// ------------------------------------------------------------------ 9 · não é máquina
const Machine: React.FC<{t: number}> = ({t}) => {
  const strike = P(t, T.maquina + 0.3, 0.3, E.out);
  return (
    <Cam t={t} a={33.95} b={36.1} z0={1.0} z1={1.06}>
      <Reveal name="gears" p={P(t, 33.7, 1.2, E.smooth)} x={540} y={900} width={1000} opacity={0.3 * (1 - P(t, 35.3, 0.4))} edge={0} />
      <Gears t={t} a={33.5} stop={T.maquina} shatter={35.35} />
      <Label t={t} at={34.0} out={35.9} text="FIG. VIII — LEONARDO · MÁQUINAS" y={150} />
      <Thin t={t} at={T.nada - 0.05} out={35.9} text="nada disso é uma" size={84} y={1500} />
      <Big t={t} at={T.maquina - 0.05} out={35.9} text="MÁQUINA" size={210} y={1660} color={C.bone} />
      <div style={{position: 'absolute', left: 120, top: 1652, width: 840 * strike, height: 12, background: C.or, boxShadow: `0 0 24px ${C.or}`, transform: 'rotate(-4deg)', transformOrigin: '0 50%', opacity: t > 35.9 ? 0 : 1}} />
    </Cam>
  );
};

// ------------------------------------------------------------------ 10 · ECOSSISTEMA
const Eco: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={36.04} b={37.7} z0={1.25} z1={1.0} oy={880}>
    <Flock t={t} a={36.04} cy={880} scale={420} opacity={0.18} orange={false} />
    <Net t={t} a={36.04} cy={880} r={440} grow={P(t, 36.04, 0.8, E.out)} alive={1} spin={1.6} />
    <Dot x={540} y={880} r={18} glow={2.2} />
    <Big t={t} at={T.ecossistema - 0.08} out={37.5} text="ECOSSISTEMA" size={142} y={1610} stagger={0.022} glow />
  </Cam>
);

// ------------------------------------------------------------------ 11 · a empresa comum (cinza)
const TOOLS = ['CRM', 'PLANILHA_v3_final.xlsx', 'ERP', 'E-MAIL', 'WHATSAPP', 'AGENDA', 'FINANCEIRO', 'DRIVE', 'ESTOQUE', 'SUPORTE', 'RELATÓRIO', 'PEDIDOS'];
const rc = rng(41);
const CARD = TOOLS.map((n, i) => ({n, x: 140 + (i % 3) * 400, y: 560 + Math.floor(i / 3) * 210, dx: (rc() - 0.5) * 520, dy: (rc() - 0.5) * 640, rot: (rc() - 0.5) * 50, fall: 0.6 + rc() * 0.8}));
const Company: React.FC<{t: number}> = ({t}) => {
  const apart = P(t, T.ferramentas, 1.6, E.io), frozen = t > T.dados, fall = Math.max(0, t - T.pecas), gone = P(t, T.pessoas - 0.3, 0.4);
  const glitch = frozen && t < T.pessoas && Math.floor(t * 12) % 5 === 0;
  return (
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 70% at 50% 45%, #262629 0%, ${C.graph} 55%, #101012 100%)`}}>
      <Label t={t} at={T.agora} out={46.6} text="FIG. IX — A EMPRESA COMUM" y={150} />
      <div style={{position: 'absolute', inset: 0, perspective: 1600}}>
        <div style={{position: 'absolute', inset: 0, transform: `rotateX(${lerp(18, 8, P(t, T.agora, 2))}deg) translateY(${lerp(80, 0, P(t, T.agora, 1.2, E.out))}px)`, opacity: 1 - gone * 0.7}}>
          {CARD.map((c, i) => { const u = P(t, T.agora + i * 0.06, 0.5, E.out), fy = fall > 0 ? 1400 * Math.pow(fall * c.fall, 2) : 0; return (
            <div key={i} style={{position: 'absolute', left: c.x + c.dx * apart - 130, top: c.y + c.dy * apart - 70 + fy + (1 - u) * 40, width: 260 + (c.n.length > 10 ? 60 : 0), height: 140, borderRadius: 18, background: '#2b2b2f', boxShadow: '0 0 0 1px #3c3c41, 0 24px 50px rgba(0,0,0,.5)', opacity: u, transform: `rotate(${c.rot * apart + fall * 120 * (c.fall - 1)}deg)`, fontFamily: F.mono, color: '#a3a19b', fontSize: 22, letterSpacing: '0.08em', padding: '22px 24px', boxSizing: 'border-box'}}>
              <div style={{width: 34, height: 6, borderRadius: 3, background: '#55555b', marginBottom: 18}} />{c.n}
              {frozen && t < T.pecas && i % 3 === 1 && <div style={{marginTop: 12, height: 8, borderRadius: 4, background: '#1c1c1f', overflow: 'hidden'}}><div style={{width: '37%', height: '100%', background: '#5a5a60'}} /></div>}
            </div>); })}
        </div>
      </div>
      {glitch && <div style={{position: 'absolute', left: 0, right: 0, top: 640 + (Math.floor(t * 30) % 7) * 90, height: 60, background: 'rgba(255,255,255,.06)', transform: 'translateX(30px)'}} />}
      {/* Atlas: carrega tudo nas costas */}
      {t > T.pessoas - 0.2 && t < T.pecas + 0.8 && (() => { const u = P(t, T.pessoas - 0.2, 0.6, E.out), f = Math.max(0, t - T.pecas); return (
        <div style={{position: 'absolute', inset: 0, opacity: u * (1 - clamp(f / 0.7)), transform: `translateY(${(1 - u) * 60 + f * f * 900}px)`}}>
          <Cut name="atlas" x={540} y={1080} width={760} style={{filter: 'grayscale(1) contrast(1.1) brightness(.8)'}} />
          {[0, 1, 2, 3, 4].map((k) => <div key={k} style={{position: 'absolute', left: 430 + Math.sin(t * 7 + k) * 6 * (1 + k * 0.4), top: 640 - k * 66, width: 220, height: 58, borderRadius: 10, background: '#2b2b2f', boxShadow: '0 0 0 1px #45454b', transform: `rotate(${-8 + Math.sin(t * 5 + k * 1.3) * (2 + k)}deg)`, fontFamily: F.mono, fontSize: 18, color: '#8d8a84', padding: '16px 18px', boxSizing: 'border-box'}}>{TOOLS[(k * 5) % TOOLS.length]}</div>)}
        </div>); })()}
      <Thin t={t} at={T.agora} out={T.ferramentas - 0.15} text="a maioria das empresas." size={84} y={1560} color="#c9c6bf" />
      <Thin t={t} at={T.ferramentas} out={T.dados - 0.12} text="ferramentas soltas." size={92} y={1560} color="#c9c6bf" />
      <Thin t={t} at={T.dados} out={T.pessoas - 0.12} text="dados parados." size={92} y={1560} color="#c9c6bf" />
      <Thin t={t} at={T.pessoas} out={T.pecas - 0.12} text="tudo nas costas." size={92} y={1640} color="#c9c6bf" />
      <Big t={t} at={T.pecas} out={T.nao - 0.1} text="PEÇAS." size={230} y={960} color="#8d8a84" />
      <Big t={t} at={T.nao} out={46.6} text="NÃO VIDA." size={150} y={1400} color="#6e6c67" />
      {t > T.nao - 0.2 && <Ecg t={t} beats={[]} y={960} opacity={P(t, T.nao - 0.2, 0.3)} />}
    </div>
  );
};

// ------------------------------------------------------------------ 12 · eu acredito (o coração volta)
const HB = BEAT.filter((b) => b >= T.eu - 0.02 && b < 50.7);
const ring12 = Array.from({length: 12}, (_, i) => ({a: (i / 12) * Math.PI * 2 - Math.PI / 2, n: TOOLS[i]}));
const Believe: React.FC<{t: number}> = ({t}) => {
  const warm = P(t, T.eu, 1.2, E.io), form = P(t, T.acredito, 1.6, E.io), roots = P(t, 48.0, 1.8, E.io);
  const pos = ring12.map((c) => ({x: 540 + Math.cos(c.a) * 380, y: 960 + Math.sin(c.a) * 380}));
  return (
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,90,31,${0.12 * warm}) 0%, ${C.ink} 70%)`}}>
      <Reveal name="mycetozoa" p={P(t, T.natureza - 0.3, 1.6, E.smooth)} x={540} y={980} width={1100} opacity={0.22} edge={0} />
      <Ecg t={t} beats={HB} y={960} color={C.or} opacity={1 - form * 0.85} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {pos.map((p, i) => { const q = pos[(i + 1) % 12], o = pos[(i + 5) % 12], u = clamp(roots * 1.4 - i * 0.03); const mx = (p.x + q.x) / 2 + (540 - (p.x + q.x) / 2) * 0.35, my = (p.y + q.y) / 2 + (960 - (p.y + q.y) / 2) * 0.35; return <g key={i} opacity={form}>
          <path d={`M${p.x} ${p.y} Q${mx} ${my} ${q.x} ${q.y}`} fill="none" stroke={C.or} strokeWidth={2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - u} style={{filter: `drop-shadow(0 0 6px ${C.or})`}} />
          {i % 2 === 0 && <path d={`M${p.x} ${p.y} Q540 960 ${o.x} ${o.y}`} fill="none" stroke={C.bone} strokeOpacity={0.35} strokeWidth={1} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - u} />}
        </g>; })}
      </svg>
      {ring12.map((c, i) => { const p = pos[i]; return <div key={i} style={{position: 'absolute', left: p.x - 82, top: p.y - 30, width: 164, height: 60, borderRadius: 14, background: '#1f1f22', boxShadow: `0 0 0 1.5px ${roots > i / 14 ? C.or : '#3c3c41'}`, opacity: form, transform: `scale(${lerp(0.6, 1, form)})`, fontFamily: F.mono, fontSize: 15, color: roots > i / 14 ? C.bone : '#8d8a84', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.06em', overflow: 'hidden', whiteSpace: 'nowrap'}}>{c.n.length > 11 ? c.n.slice(0, 9) + '…' : c.n}</div>; })}
      <Dot x={540} y={960} r={14 + 8 * pulse(t, 0.14)} glow={1.5 + pulse(t)} opacity={form} />
      <Thin t={t} at={T.eu} out={T.natureza - 0.25} text="eu acredito" size={110} y={300} />
      <Thin t={t} at={T.natureza - 0.1} out={50.6} text="como a natureza funciona." size={86} y={1560} color={C.orHi} />
    </div>
  );
};

// ------------------------------------------------------------------ 13 · vivo: sentindo, aprendendo, se movendo inteira
const Alive: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={50.7} b={54.15} z0={1.0} z1={1.18} oy={900}>
    <Flock t={t} a={50.0} cy={900} scale={460} opacity={0.35 + 0.25 * P(t, T.movendo, 0.5)} orange={false} speed={1.6} />
    <Net t={t} a={50.7} cy={900} r={420} alive={1} spin={2.2} />
    <Dot x={540} y={900} r={16 + 10 * pulse(t)} glow={2} />
    <Big t={t} at={T.sentindo - 0.04} out={T.aprendendo - 0.12} text="SENTINDO." size={170} y={1620} />
    <Big t={t} at={T.aprendendo - 0.04} out={T.movendo - 0.3} text="APRENDENDO." size={150} y={1620} />
    <Thin t={t} at={T.movendo - 0.15} out={54.0} text="se movendo" size={90} y={1480} />
    <Big t={t} at={T.inteira - 0.05} out={54.0} text="INTEIRA." size={210} y={1640} color={C.or} glow />
  </Cam>
);

// ------------------------------------------------------------------ 14 · não é sobre ter mais tecnologia
const More: React.FC<{t: number}> = ({t}) => {
  const lv = t < 54.6 ? 2 : t < 55.05 ? 4 : t < 55.5 ? 8 : 16, n = lv * Math.ceil(lv * 1.6), cw = 1000 / lv;
  return (
    <div style={{position: 'absolute', inset: 0, background: C.graph}}>
      {Array.from({length: n}, (_, i) => <div key={i} style={{position: 'absolute', left: 40 + (i % lv) * cw + cw * 0.08, top: 160 + Math.floor(i / lv) * cw * 0.62, width: cw * 0.84, height: cw * 0.5, borderRadius: Math.max(3, cw * 0.06), background: '#2b2b2f', boxShadow: '0 0 0 1px #3c3c41', fontFamily: F.mono, fontSize: Math.max(6, cw * 0.09), color: '#77756f', padding: cw * 0.06, boxSizing: 'border-box', overflow: 'hidden', whiteSpace: 'nowrap'}}>{TOOLS[i % TOOLS.length]}</div>)}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(27,27,29,0) 55%, rgba(27,27,29,.95) 78%)'}} />
      <Thin t={t} at={T.naoe} out={56.1} text="não é sobre ter mais" size={86} y={1500} color="#c9c6bf" />
      <Big t={t} at={T.tecnologia - 0.05} out={56.1} text="TECNOLOGIA" size={150} y={1650} color="#9a978f" />
    </div>
  );
};

// ------------------------------------------------------------------ 15 · é sobre dar vida a ela
const GiveLife: React.FC<{t: number}> = ({t}) => {
  const lv = 16, cw = 1000 / lv, wave = (t - T.dar) * 1500;
  return (
    <div style={{position: 'absolute', inset: 0, background: C.ink}}>
      {Array.from({length: lv * 26}, (_, i) => { const x = 40 + (i % lv) * cw + cw * 0.5, y = 160 + Math.floor(i / lv) * cw * 0.62 + cw * 0.25, d = Math.hypot(x - 540, y - 900), lit = wave > d ? Math.exp(-(wave - d) / 700) : 0, on = wave > d; return <div key={i} style={{position: 'absolute', left: x - cw * 0.42, top: y - cw * 0.25, width: cw * 0.84, height: cw * 0.5, borderRadius: 4, background: on ? `rgba(255,90,31,${0.15 + 0.6 * lit})` : '#1f1f22', boxShadow: on ? `0 0 ${10 + 30 * lit}px rgba(255,90,31,${0.5 * lit})` : 'none', transform: `scale(${1 + 0.25 * lit})`}} />; })}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 40}, (_, k) => { const a = (k / 40) * 6.283, r = Math.min(1500, Math.max(0, wave)); return <line key={k} x1={540} y1={900} x2={540 + Math.cos(a) * r * 0.9} y2={900 + Math.sin(a) * r * 0.9} stroke={C.or} strokeOpacity={0.18} strokeWidth={1.5} />; })}
      </svg>
      <Ring t={t} at={T.dar} x={540} y={900} r1={1500} d={1.2} />
      <Ring t={t} at={T.vida2} x={540} y={900} r1={1200} d={1.0} color={C.bone} width={2} />
      <Dot x={540} y={900} r={22 + 14 * pulse(t, 0.15)} glow={2.5} />
      <Thin t={t} at={T.sobre2 - 0.1} out={T.vida2 - 0.1} text="é sobre dar" size={90} y={1450} />
      <Big t={t} at={T.vida2 - 0.06} out={57.95} text="VIDA" size={400} y={1560} color={C.or} glow stagger={0.06} />
      <Thin t={t} at={T.ela - 0.05} out={57.95} text="a ela." size={90} y={1800} />
    </div>
  );
};

// ------------------------------------------------------------------ 16–17 · só o começo · o olho
const Ending: React.FC<{t: number}> = ({t}) => {
  const back = P(t, T.isso, 1.6, E.io);
  const open = t < T.sting ? P(t, T.por - 0.1, 1.0, E.io) * 0.92 + P(t, T.observa - 0.05, 0.4, E.out) * 0.08 : 1 - P(t, T.sting, 0.18, E.in);
  const pupil = t < T.observa ? 0.35 : t < T.sting ? lerp(0.35, 1, P(t, T.observa, 0.5, E.out)) : 1;
  const close = P(t, T.sting, 0.18, E.in), dotR = t > T.sting ? 14 * (1 + 0.6 * Math.exp(-(t - T.sting) / 0.2)) : 0;
  const fade = P(t, 65.2, 1.2, E.in);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - fade}}>
      {t < T.por + 0.3 && <div style={{position: 'absolute', inset: 0, transformOrigin: '540px 900px', transform: `scale(${lerp(1, 0.18, back)})`, opacity: 1 - P(t, T.por - 0.3, 0.5)}}>
        <Net t={t} a={50.7} cy={900} r={420} alive={1} spin={2.2} />
      </div>}
      {t > T.comeco - 0.3 && close < 1 && <Eye t={t} open={Math.max(0.02, open)} pupil={pupil} cy={900} R={300} opacity={P(t, T.comeco - 0.3, 0.8)} />}
      {t > T.sting && <Dot x={540} y={900} r={dotR} glow={2} />}
      <Ring t={t} at={T.sting} x={540} y={900} r1={1300} d={1.5} />
      <Thin t={t} at={T.isso} out={T.por - 0.2} text="isso é só o começo." size={92} y={1500} />
      <Thin t={t} at={T.por} out={T.sting - 0.1} text="por enquanto…" size={86} y={1460} color={C.dim} />
      <Thin t={t} at={T.so - 0.05} out={64.6} text="só observa." size={132} y={1600} />
      <Label t={t} at={62.4} out={65.0} text="Nº 01" y={1760} align="center" color={C.or} size={26} />
    </div>
  );
};

export const Ecossistema: React.FC<{audio: 'none' | 'mix'}> = ({audio}) => {
  useFonts(); usePreload(ALL);
  const frame = useCurrentFrame(), t = frame / FPS;
  const pu = pulse(t), loud = t > T.back && t < T.cut;
  const shake = loud ? pu * 3 : 0;
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden', fontFamily: F.head}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${(Math.sin(t * 53) * shake).toFixed(1)}px, ${(Math.cos(t * 41) * shake).toFixed(1)}px) scale(${(1 + (loud ? 0.012 : 0.004) * pu).toFixed(4)})`}}>
        <Scene t={t} a={0} b={6.35} inD={0} outD={0.1}><Question t={t} /><Thin t={t} at={T.pergunta - 0.1} out={6.15} text="uma pergunta." size={104} y={1480} /><Label t={t} at={1.3} out={6.1} text="Nº 01" y={150} /></Scene>
        <Scene t={t} a={6.35} b={10.95} zIn={1.6} inD={0.35}><DaVinci t={t} /></Scene>
        <Scene t={t} a={10.95} b={13.4}><Newton t={t} /></Scene>
        <Scene t={t} a={13.4} b={18.15}><Quantum t={t} /></Scene>
        <Scene t={t} a={18.15} b={21.45}><Always t={t} /></Scene>
        <Scene t={t} a={21.45} b={T.back - 0.02} outD={0.02}><Parts t={t} /></Scene>
        <Scene t={t} a={T.back} b={26.95} inD={0.1} zIn={1.25}><Woods t={t} /></Scene>
        <Scene t={t} a={26.95} b={29.5}><Brain t={t} /></Scene>
        <Scene t={t} a={29.5} b={33.95}><Birds t={t} /></Scene>
        <Scene t={t} a={33.95} b={36.04} outD={0.08}><Machine t={t} /></Scene>
        <Scene t={t} a={36.04} b={37.62} inD={0.1} zIn={1.3}><Eco t={t} /></Scene>
        <Scene t={t} a={37.62} b={46.72} inD={0.3} zIn={1.0}><Company t={t} /></Scene>
        <Scene t={t} a={46.72} b={50.7} inD={0.4} zIn={1.0}><Believe t={t} /></Scene>
        <Scene t={t} a={50.7} b={54.12} inD={0.1} zIn={1.2}><Alive t={t} /></Scene>
        <Scene t={t} a={54.12} b={56.2} inD={0.08}><More t={t} /></Scene>
        <Scene t={t} a={56.2} b={58.0} inD={0.06}><GiveLife t={t} /></Scene>
        <Scene t={t} a={58.0} b={67} inD={0.2} zIn={1.0}><Ending t={t} /></Scene>
      </div>
      <Dust t={t} n={60} opacity={t > 37.6 && t < 46.7 ? 0.25 : 0.7} warm={t > 46.7 ? 0.3 : 0.06} />
      <Flash t={t} at={T.hit0} d={0.5} color={C.or} max={0.35} />
      <Flash t={t} at={T.back} d={0.5} max={0.85} />
      <Flash t={t} at={T.medir} d={0.3} color={C.or} max={0.4} />
      <Flash t={t} at={36.04} d={0.35} max={0.6} />
      <Flash t={t} at={T.eu} d={0.6} color={C.or} max={0.3} />
      {[T.sentindo, T.aprendendo, T.inteira].map((a) => <Flash key={a} t={t} at={a} d={0.25} max={0.35} />)}
      <Flash t={t} at={T.dar} d={0.4} color={C.or} max={0.5} />
      <Flash t={t} at={T.sting} d={0.6} color={C.or} max={0.55} />
      <Vignette strength={0.8} />
      <Grain frame={frame} amount={0.07} />
      {audio === 'mix' && <Audio src={staticFile('eco/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
