// "FAZER SEM PENSAR" — mesma linguagem da série (ponto laranja, gravura/foto tratada, papel ↔ escuro, olho no fim, logo),
// com variações próprias: TINTA FRESCA (letras carimbadas em laranja que esfriam), cortinas de HASTES DE ÁBACO e de PAUTA
// de livro-razão, conta escrita à mão, e os times de agentes como páginas de um livro-razão.
// Idade Média: multiplicar era de especialista → romanos + ábaco → 1202, Fibonacci → qualquer um, no papel, sem pensar →
// o comércio explodiu → Whitehead → "sem pensar nelas" → de novo: não a conta, a empresa inteira → marketing, comercial,
// financeiro: agentes → cada área um time → ecossistema → Instagram, 13 pessoas → fundadores + ecossistema →
// quantas decisões só você pode tomar → o olho (com a espiral de Fibonacci) → o logo.
import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {useFonts} from '../../lib/fonts';
import {E, P, clamp, lerp} from '../../lib/core';
import {FPS, T, VO} from './time5';
import {C, Dot, Dust, F, Flash, Grain, IMG, Label, Paper, Reveal, Ring, Thin, Vignette, emWidth, img, usePreload} from './fx';
import {Eye, rng} from './sims';
import DIMS from './img5.json';
import WORDS from './words5.json';

Object.assign(IMG, DIMS as unknown as Record<string, [number, number]>);
const ALL = Object.keys(DIMS).filter((k) => !k.startsWith('logo'));
const hash = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
const mix = (a: string, b: string, k: number) => { const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16); return `rgb(${[0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), clamp(k)))).join(',')})`; };

// ---------- cena / câmera (+ cortinas novas: hastes de ábaco e pauta de livro-razão) ----------
type Wipe = {kind: 'iris' | 'rods' | 'rule'; x?: number; y?: number; d: number};
const stripes = (w: number, n: number, vertical: boolean) => {
  let d = '';
  for (let k = 0; k < n; k++) {
    const u = E.io(clamp(w * 1.7 - (k / (n - 1)) * 0.7));
    if (u <= 0) continue;
    if (vertical) { const cw = 1080 / n, h = u * 1920, y = k % 2 ? 1920 - h : 0; d += `M${(k * cw).toFixed(1)} ${y.toFixed(1)}h${(cw + 1).toFixed(1)}v${h.toFixed(1)}h${(-cw - 1).toFixed(1)}z`; }
    else { const rh = 1920 / n, wd = u * 1080, x = k % 2 ? 1080 - wd : 0; d += `M${x.toFixed(1)} ${(k * rh).toFixed(1)}h${wd.toFixed(1)}v${(rh + 1).toFixed(1)}h${(-wd).toFixed(1)}z`; }
  }
  return d ? `path('${d}')` : 'inset(0 0 100% 0)';
};
const Scene: React.FC<{t: number; a: number; b: number; inD?: number; outD?: number; zIn?: number; zOut?: number; children: React.ReactNode; bg?: string; light?: boolean; wipe?: Wipe; hold?: boolean}> = ({t, a, b, inD = 0.18, outD = 0.18, zIn = 1.06, zOut = 1.1, children, bg, light, wipe, hold}) => {
  if (t < a - 0.001 || t > b + outD) return null;
  const q = hold ? 0 : P(t, b, outD, E.in);
  const back = light ? <Paper /> : <div style={{position: 'absolute', inset: 0, background: bg ?? C.ink}} />;
  if (wipe) {
    const w = P(t, a, wipe.d), x = wipe.x ?? 540, y = wipe.y ?? 960, z = lerp(1.06, 1, P(t, a, wipe.d + 0.3, E.out));
    const clip = w >= 1 ? undefined : wipe.kind === 'iris' ? `circle(${(E.io(w) * 2300).toFixed(0)}px at ${x}px ${y}px)` : stripes(w, wipe.kind === 'rods' ? 9 : 14, wipe.kind === 'rods');
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
/** escurece/clareia a faixa do texto sobre imagens */
const Shade: React.FC<{dark?: boolean; from?: number}> = ({dark = true, from = 1040}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: from, bottom: 0, background: `linear-gradient(180deg, ${dark ? 'rgba(10,10,10,0)' : 'rgba(239,235,227,0)'} 0%, ${dark ? 'rgba(10,10,10,.9)' : 'rgba(236,231,220,.92)'} 38%)`}} />
);

// ---------- TINTA FRESCA: cada letra é carimbada (sem desfoque) em laranja vivo e esfria até a cor final ----------
const Ink: React.FC<{t: number; at: number; out: number; text: string; size: number; y: number; color?: string; x?: number; stagger?: number; maxW?: number}> = ({t, at, out, text, size: want, y, color = C.bone, x = 540, stagger = 0.034, maxW = 880}) => {
  if (t < at - 0.05 || t > out + 0.4) return null;
  const size = Math.min(want, maxW / (emWidth(text) - 0.035 * (text.length - 1))), q = P(t, out, 0.3, E.in), hot = color === C.or ? C.orHi : C.or;
  return (
    <div style={{position: 'absolute', left: x - 1400, width: 2800, top: y - size * 0.62, textAlign: 'center', fontFamily: F.head, fontWeight: 900, fontSize: size, lineHeight: 1.1, letterSpacing: '-0.035em', whiteSpace: 'nowrap', opacity: 1 - q, filter: q > 0 ? `blur(${(q * 14).toFixed(1)}px)` : undefined, transform: `scale(${lerp(1, 1.1, q)})`}}>
      {[...text].map((ch, i) => { const a0 = at + i * stagger, u = P(t, a0, 0.26, E.out), cool = P(t, a0 + 0.1, 0.6, E.smooth);
        return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: clamp(u * 2.5), color: mix(hot, color, cool), transform: `scale(${lerp(1.32, 1, u).toFixed(3)})`, textShadow: cool < 0.98 ? `0 0 ${(34 * (1 - cool)).toFixed(0)}px ${C.or}` : undefined}}>{ch}</span>; })}
    </div>
  );
};
/** texto que troca de forma: as letras de A caem e somem, as de B sobem no lugar (romano → arábico) */
const Morph: React.FC<{t: number; at: number; out: number; a: string; b: string; size: number; y: number; color?: string; colorB?: string}> = ({t, at, out, a, b, size, y, color = C.bone, colorB = C.or}) => {
  if (t > out + 0.4) return null;
  const q = P(t, out, 0.3, E.in), line = (s: string, f: (i: number, n: number) => React.CSSProperties, col: string) => (
    <div style={{position: 'absolute', left: -860, width: 2800, top: y - size * 0.62, textAlign: 'center', fontFamily: F.head, fontWeight: 900, fontSize: size, lineHeight: 1.1, letterSpacing: '-0.035em', whiteSpace: 'nowrap', color: col}}>
      {[...s].map((ch, i) => <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', ...f(i, s.length)}}>{ch}</span>)}
    </div>);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - q}}>
      {line(a, (i) => { const u = P(t, at + i * 0.03, 0.4, E.in), v = P(t, at - 1.4 + i * 0.03, 0.4, E.out); return {opacity: clamp(v * 2) * (1 - u), transform: `translateY(${(u * 0.5).toFixed(3)}em) rotate(${(u * (i % 2 ? 14 : -14)).toFixed(1)}deg)`, filter: u > 0 ? `blur(${(u * 12).toFixed(1)}px)` : undefined}; }, color)}
      {line(b, (i) => { const u = P(t, at + 0.25 + i * 0.05, 0.45, E.settle); return {opacity: clamp(u * 2), transform: `translateY(${((1 - u) * -0.6).toFixed(3)}em)`}; }, colorB)}
    </div>
  );
};

/** pictograma de pessoa (pés em y) */
const Person: React.FC<{x: number; y: number; h: number; color: string; opacity?: number; s?: number}> = ({x, y, h, color, opacity = 1, s = 1}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`} opacity={opacity}>
    <circle cx={0} cy={-h * 0.78} r={h * 0.15} fill={color} />
    <path d={`M${-h * 0.24} 0 v${-h * 0.3} a${h * 0.24} ${h * 0.24} 0 0 1 ${h * 0.48} 0 v${h * 0.3} z`} fill={color} />
  </g>
);

// ---------- tabuleiro de contar (linhas + fichas que andam uma a uma) ----------
const BL = [760, 880, 1000, 1120];
const NJ = 14;
const slot = (j: number, k: number) => { const r = Math.floor(hash(j * 7 + k, 3) * 7), side = hash(k * 3 + j, 9) < 0.5 ? 0 : 1; return {x: (side ? 600 : 160) + 30 + Math.floor(hash(j, k * 5) * 6) * 54, y: 760 + r * 60}; };
const Board: React.FC<{t: number; a: number; fg: string}> = ({t, a, fg}) => {
  const draw = P(t, a, 0.6, E.out), step = Math.max(0, (t - a - 0.8) / 0.17), k = Math.floor(step), f = step - k;
  if (draw <= 0) return null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <rect x={130} y={700} width={820 * draw} height={480} rx={10} fill="none" stroke={fg} strokeWidth={2} opacity={0.5} />
      {BL.map((y, i) => <line key={i} x1={140} x2={140 + 800 * draw} y1={y} y2={y} stroke={fg} strokeWidth={2.5} />)}
      <line x1={540} x2={540} y1={710} y2={710 + 460 * draw} stroke={fg} strokeWidth={2} strokeDasharray="6 9" />
      {[300, 780].map((cx) => <path key={cx} d={`M${cx - 13} ${BL[0] - 13}l26 26m0 -26l-26 26`} stroke={fg} strokeWidth={2.5} opacity={draw} />)}
      {Array.from({length: NJ}, (_, j) => {
        const pop = P(t, a + 0.3 + j * 0.04, 0.3, E.pop); if (pop <= 0) return null;
        const v = k >= j ? Math.floor((k - j) / NJ) + 1 : 0, moving = k >= j && (k - j) % NJ === 0, p0 = slot(j, moving ? v - 1 : v), p1 = slot(j, v), u = moving ? E.settle(clamp(f / 0.8)) : 1;
        const x = lerp(p0.x, p1.x, u), y = lerp(p0.y, p1.y, u) - Math.sin(u * Math.PI) * 14;
        return <circle key={j} cx={x} cy={y} r={22 * pop} fill={j === 0 ? C.or : fg} stroke={j === 0 ? C.or : 'none'} style={j === 0 ? {filter: `drop-shadow(0 0 8px ${C.or})`} : undefined} />;
      })}
    </svg>
  );
};

// ---------- a conta, à mão, no papel (com a ponta laranja da pena) ----------
const CALC: {s?: string; pad?: number; y: number; at: number; rule?: boolean; or?: boolean}[] = [
  {s: '47', y: 430, at: T.repente - 0.15}, {s: '× 23', y: 580, at: T.repente + 0.3}, {rule: true, y: 665, at: T.qualquer - 0.3},
  {s: '141', y: 780, at: T.qualquer - 0.05}, {s: '94', pad: 1, y: 920, at: T.qualquer + 0.4}, {rule: true, y: 1005, at: T.papel - 0.45}, {s: '1081', y: 1120, at: T.papel - 0.15, or: true},
];
const Calc: React.FC<{t: number}> = ({t}) => {
  const R = 790, size = 150;
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {CALC.filter((c) => c.rule).map((c, i) => { const u = P(t, c.at, 0.35, E.io); return u > 0 && <line key={i} x1={R} y1={c.y} x2={R - 420 * u} y2={c.y + 4 * Math.sin(u * 3)} stroke={C.pen} strokeWidth={4} strokeLinecap="round" />; })}
      </svg>
      {CALC.filter((c) => c.s).map((c, i) => {
        const u = P(t, c.at, 0.42, E.smooth); if (u <= 0) return null;
        const wEst = (c.s!.length + (c.pad ?? 0)) * size * 0.46, x0 = R - wEst, xp = x0 + wEst * u - (c.pad ?? 0) * size * 0.46;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', right: 1080 - R, top: c.y - size * 0.78, fontFamily: F.thin, fontStyle: 'italic', fontSize: size, lineHeight: 1, color: c.or ? C.or : C.pen, whiteSpace: 'pre', WebkitMaskImage: `linear-gradient(90deg, #000 ${(u * 100 - 4).toFixed(1)}%, transparent ${(u * 100 + 3).toFixed(1)}%)`, maskImage: `linear-gradient(90deg, #000 ${(u * 100 - 4).toFixed(1)}%, transparent ${(u * 100 + 3).toFixed(1)}%)`, textShadow: c.or ? `0 0 30px ${C.or}55` : undefined}}>
              {c.s}{c.pad ? <span style={{opacity: 0}}>0</span> : null}
            </div>
            {u < 1 && <Dot x={Math.min(xp, R)} y={c.y - size * 0.18 + Math.sin(u * 20) * 18} r={8} glow={1.4} />}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------- explosão de algarismos ----------
const rb = rng(31);
const BURST = Array.from({length: 1300}, () => ({a: rb() * Math.PI * 2, v: 0.15 + Math.pow(rb(), 0.55), z: rb(), d: Math.floor(rb() * 10), hot: rb() < 0.06}));
const Burst: React.FC<{t: number; at: number; gather: number}> = ({t, at, gather}) => {
  const ref = useCanvas((g) => {
    const tau = t - at, pre = P(t, gather, at - gather, E.in);
    if (t < gather) return;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    BURST.forEach((p, i) => {
      let r: number, al: number;
      if (tau < 0) { r = p.v * 70 * (1 - pre * 0.6) + Math.sin(t * 30 + i) * 4 * pre; al = (0.25 + 0.5 * p.z) * P(t, gather, 0.4); if (i % 3) return; }
      else { const k = 1 - Math.exp(-tau * 2.4); r = 30 + p.v * 1050 * k + tau * 60 * p.v; al = (0.3 + 0.7 * p.z) * (1 - P(tau, 0.9, 1.0)); }
      const s = 14 + p.z * p.z * 46;
      g.globalAlpha = al; g.fillStyle = p.hot ? C.or : C.bone; g.font = `900 ${s.toFixed(0)}px ${F.head}`;
      g.fillText(String(p.d), 540 + Math.cos(p.a) * r, 840 + Math.sin(p.a) * r * 0.95);
    });
    g.globalAlpha = 1;
  }, [t, at, gather]);
  return <canvas ref={ref} width={1080} height={1920} style={{position: 'absolute', inset: 0}} />;
};

// ---------- odômetro ----------
const Odo: React.FC<{t: number; at: number; text: string; size: number; y: number; color: string}> = ({t, at, text, size, y, color}) => {
  if (t < at - 0.05) return null;
  const digits = [...text], nd = digits.filter((c) => /\d/.test(c)).length, H = 1.2, fade = 'linear-gradient(180deg, transparent 0%, #000 22%, #000 78%, transparent 100%)'; let di = 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y - size * 0.6, display: 'flex', justifyContent: 'center', fontFamily: F.head, fontWeight: 900, fontSize: size, lineHeight: `${H}em`, letterSpacing: '-0.02em', color, whiteSpace: 'nowrap', opacity: P(t, at - 0.05, 0.15)}}>
      {digits.map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} style={{display: 'block', height: `${H}em`}}>{ch}</span>;
        const pos = nd - 1 - di++, u = P(t, at + (nd - pos) * 0.035, 0.75 + pos * 0.05, E.out), turns = 1 + pos * 0.7, off = +ch + 10 * Math.ceil(turns) - (1 - u) * 10 * turns;
        return <span key={i} style={{display: 'block', height: `${H}em`, overflow: 'hidden', WebkitMaskImage: u < 1 ? fade : undefined, maskImage: u < 1 ? fade : undefined}}><span style={{display: 'block', transform: `translateY(${(-off * H).toFixed(3)}em)`}}>{Array.from({length: 10 * (Math.ceil(turns) + 1)}, (_, k) => <span key={k} style={{display: 'block', height: `${H}em`}}>{k % 10}</span>)}</span></span>;
      })}
    </div>
  );
};

// ================================================================== cenas
// 0 · Idade Média: multiplicar era trabalho de especialista (escuro)
const S0: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={0} b={6.6} z0={1.0} z1={1.1} ox={560} oy={760}>
    <Reveal name="typus" p={P(t, 0.15, 3.6, E.smooth)} x={540} y={830} width={900} />
    <Shade from={1020} />
    <Label t={t} at={0.4} out={6.3} text="FIG. I — TYPUS ARITHMETICAE · 1503" y={230} />
    <Thin t={t} at={T.multiplicar - 0.1} out={6.35} text="multiplicar dois números era" size={66} y={1240} />
    <Ink t={t} at={T.especialista - 0.06} out={6.35} text="ESPECIALISTA." size={150} y={1370} />
  </Cam>
);
// 1 · algarismos romanos e o ábaco (papel)
const S1: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={6.5} b={12.3} z0={1.0} z1={1.05} oy={800}>
    <Label t={t} at={6.7} out={12.1} text={t < T.abaco - 0.2 ? 'FIG. II — UMA CONTA EM ALGARISMOS ROMANOS' : `TABULEIRO DE CONTAR · LANCES: ${String(Math.max(0, Math.floor((t - T.abaco + 0.3) / 0.17))).padStart(2, '0')}`} y={230} color={C.pdim} />
    <Ink t={t} at={T.romanos - 0.4} out={12.1} text="XLVII × XXIII" size={150} y={450} color={C.pen} />
    <Thin t={t} at={T.romanos + 0.4} out={12.1} text="= ?" size={90} y={590} color={C.or} />
    <Board t={t} a={T.abaco - 0.45} fg={C.pen} />
    <Thin t={t} at={T.simples - 0.15} out={T.alguem - 0.25} text="uma conta simples precisava de ábaco." size={60} y={1330} color={C.pen} />
    <Thin t={t} at={T.alguem - 0.15} out={12.1} text="e de alguém treinado para usar." size={68} y={1330} color={C.pen} />
  </Cam>
);
// 2 · 1202: Fibonacci e os algarismos que você usa hoje (escuro)
const S2: React.FC<{t: number}> = ({t}) => {
  const por = P(t, T.fibonacci - 0.25, 0.9, E.smooth);
  return (
    <Cam t={t} a={12.25} b={17.0} z0={1.06} z1={1.0} oy={820}>
      <Reveal name="liber" p={P(t, 12.3, 1.6, E.smooth)} x={540} y={830} width={720} opacity={lerp(0.6, 0.2, por)} edge={0} />
      <div style={{position: 'absolute', inset: 0, opacity: por, transform: `translateY(${((1 - por) * 40).toFixed(0)}px)`}}>
        <Reveal name="fibo" p={por} x={540} y={800} width={420} edge={0} />
      </div>
      <Shade from={1060} />
      <Label t={t} at={12.4} out={16.8} text={t < T.fibonacci - 0.2 ? 'FIG. III — LIBER ABACI · PISA, 1202' : 'LEONARDO DE PISA, O "FIBONACCI"'} y={230} />
      <Ink t={t} at={T.n1202 - 0.08} out={16.85} text="1202" size={250} y={400} stagger={0.07} />
      <Thin t={t} at={T.europa - 0.3} out={T.alg2 - 0.15} text="levou a Europa aos algarismos" size={66} y={1190} />
      <Morph t={t} at={T.alg2 + 0.05} out={16.85} a="XLVII × XXIII" b="47 × 23" size={150} y={1330} color={C.dim} />
      <Label t={t} at={T.hoje - 0.1} out={16.8} text="OS QUE VOCÊ USA HOJE" y={1440} align="center" color={C.or} />
    </Cam>
  );
};
// 3 · qualquer um, no papel. sem pensar. (papel)
const S3: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={16.95} b={20.8} z0={1.0} z1={1.06} ox={620} oy={780}>
    <Label t={t} at={17.1} out={20.6} text="FIG. IV — QUALQUER UM, NO PAPEL" y={230} color={C.pdim} />
    <Calc t={t} />
    <Ink t={t} at={T.sem - 0.05} out={20.65} text="SEM PENSAR." size={170} y={1370} color={C.pen} />
  </Cam>
);
// 4 · e o comércio explodiu (escuro)
const S4: React.FC<{t: number}> = ({t}) => {
  const blow = P(t, T.explodiu, 0.6, E.out);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '540px 840px', transform: `scale(${lerp(1, 1.18, blow)})`, opacity: lerp(0.75, 0.32, blow)}}>
        <Reveal name="money" p={P(t, 20.75, 0.9, E.smooth)} x={540} y={820} width={900} edge={0} />
      </div>
      <Burst t={t} at={T.explodiu} gather={T.comercio - 0.3} />
      <Shade from={1060} />
      <Label t={t} at={20.9} out={22.6} text="FIG. V — O CAMBISTA E SUA MULHER · 1514" y={230} />
      <Thin t={t} at={T.comercio - 0.3} out={22.6} text="e o comércio" size={84} y={1240} />
      <Ink t={t} at={T.explodiu - 0.04} out={22.6} text="EXPLODIU." size={210} y={1380} color={C.or} stagger={0.022} />
    </>
  );
};
// 5 · séculos depois: Whitehead (papel)
const S5: React.FC<{t: number}> = ({t}) => {
  const yr = Math.round(lerp(1202, 1911, P(t, T.seculos - 0.05, 1.5, E.io)));
  return (
    <Cam t={t} a={22.75} b={27.0} z0={1.0} z1={1.07} oy={820}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: F.head, fontWeight: 900, fontSize: 200, letterSpacing: '-0.03em', color: C.pen, opacity: P(t, 22.8, 0.3) * (1 - 0.65 * P(t, T.alfred - 0.3, 0.6)), lineHeight: 1}}>{yr}</div>
      <Reveal name="whitehead" p={P(t, T.matematico - 0.7, 1.3, E.smooth)} x={540} y={810} width={480} edge={0} />
      <Label t={t} at={T.alfred - 0.1} out={26.8} text="ALFRED NORTH WHITEHEAD · 1861–1947" y={230} color={C.pdim} />
      <Thin t={t} at={T.matematico - 0.1} out={26.85} text="o matemático Alfred North" size={64} y={1225} color={C.pen} />
      <Ink t={t} at={T.whitehead - 0.06} out={26.85} text="WHITEHEAD" size={170} y={1360} color={C.pen} />
    </Cam>
  );
};
// 6 · a citação (escuro) — palavra por palavra, no ritmo da voz
const QW = (WORDS as [string, number, number][]).map(([s, a]) => ({s, a: a + VO})).filter((x) => x.a > 27 && x.a < 33.2);
const QL = [[0, 3], [3, 7], [7, 10], [10, 13]];
const S6: React.FC<{t: number}> = ({t}) => {
  const ul = P(t, QW[9].a + 0.15, 0.45, E.io);
  return (
    <Cam t={t} a={26.95} b={33.5} z0={1.04} z1={1.0} ox={300} oy={700}>
      <div style={{position: 'absolute', left: 70, top: 170, fontFamily: F.head, fontWeight: 900, fontSize: 300, lineHeight: 1, color: C.or, opacity: P(t, 27.0, 0.4), transform: `translateY(${((1 - P(t, 27.0, 0.6, E.out)) * 30).toFixed(0)}px)`, textShadow: `0 0 40px ${C.or}66`}}>“</div>
      {QL.map(([i0, i1], li) => (
        <div key={li} style={{position: 'absolute', left: 110, top: 470 + li * 108 - 84 * 0.6, fontFamily: F.thin, fontStyle: 'italic', fontSize: 84, color: C.bone, whiteSpace: 'nowrap'}}>
          {QW.slice(i0, i1).map((x, k) => { const u = P(t, x.a - 0.06, 0.45, E.out), key = i0 + k === 9; return <span key={k} style={{display: 'inline-block', marginRight: '0.24em', position: 'relative', opacity: clamp(u * 1.6), color: key ? C.orHi : C.bone, transform: `translateY(${((1 - u) * 20).toFixed(1)}px)`, filter: u < 0.99 ? `blur(${((1 - u) * 8).toFixed(1)}px)` : undefined}}>{x.s}{key && <svg width={400} height={40} style={{position: 'absolute', left: -6, top: '0.98em', overflow: 'visible'}}><path d="M0 18 C80 8 170 26 260 12 S360 16 392 10" fill="none" stroke={C.or} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ul} /></svg>}</span>; })}
        </div>
      ))}
      <Ink t={t} at={QW[13].a - 0.05} out={33.3} text="SEM PENSAR" size={200} y={1010} color={C.or} />
      <Thin t={t} at={QW[15].a - 0.08} out={33.3} text="nelas." size={104} y={1150} />
      <Label t={t} at={QW[15].a + 0.1} out={33.3} text="— A. N. WHITEHEAD · 1911" y={1260} align="center" />
    </Cam>
  );
};
// 7 · de novo: não é a conta, é a empresa inteira (papel) — zoom para fora de uma célula até o organograma inteiro
const DEPTS = ['MARKETING', 'COMERCIAL', 'FINANCEIRO', 'ATENDIMENTO', 'OPERAÇÃO', 'GESTÃO'];
const DP = DEPTS.map((n, i) => ({n, x: i % 2 ? 780 : 300, y: 560 + Math.floor(i / 2) * 220}));
const CELL = {x: DP[2].x - 112, y: DP[2].y + 22};
const S7: React.FC<{t: number}> = ({t}) => {
  const u = P(t, T.automatica + 0.15, 1.5, E.io), Z = Math.exp(lerp(Math.log(6.5), 0, u)), qx = lerp(CELL.x, 540, u), qy = lerp(CELL.y, 760, u), auto = P(t, T.automatica - 0.1, 0.4, E.out);
  const rest = lerp(0.08, 1, P(u, 0.15, 0.6)), all = (i: number, k: number) => P(t, T.empresa + 0.05 + (i * 3 + k) * 0.035, 0.35, E.pop);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${(540 - qx * Z).toFixed(1)}px, ${(760 - qy * Z).toFixed(1)}px) scale(${Z.toFixed(4)})`}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <g opacity={rest}>
          <rect x={390} y={330} width={300} height={78} rx={6} fill="none" stroke={C.pen} strokeWidth={2} />
          <text x={540} y={378} textAnchor="middle" fontFamily={F.mono} fontSize={22} letterSpacing="0.2em" fill={C.pen}>EMPRESA</text>
          <path d="M540 408 V450 M300 450 H780 M300 450 V465 M780 450 V465" stroke={C.pen} strokeWidth={2} fill="none" />
          <path d="M540 450 V1100" stroke={C.pen} strokeWidth={1.5} strokeDasharray="5 7" fill="none" opacity={0.5} />
          </g>
          {DP.map((d, i) => (
            <g key={i}>
              {i > 1 && <path d={`M${d.x} ${d.y - 125} V${d.y - 95}`} stroke={C.pen} strokeWidth={2} opacity={rest} />}
              <rect x={d.x - 190} y={d.y - 95} width={380} height={190} rx={8} fill="#fffaf2" stroke={C.pen} strokeWidth={2} opacity={i === 2 ? lerp(0.4, 1, rest) : rest} />
              <text x={d.x - 168} y={d.y - 58} fontFamily={F.mono} fontSize={19} letterSpacing="0.16em" fill={C.pdim} opacity={rest}>{d.n}</text>
              {[0, 1, 2].map((k) => { const cx = d.x - 112 + k * 112, cy = d.y + 22, a = all(i, k); return (
                <g key={k}>
                  <rect x={cx - 48} y={cy - 32} width={96} height={64} rx={5} fill="none" stroke={C.pen} strokeWidth={1.4} opacity={i === 2 && k === 0 ? 0.6 : 0.6 * rest} />
                  {i === 2 && k === 0 && <text x={cx} y={cy + 9} textAnchor="middle" fontFamily={F.thin} fontStyle="italic" fontSize={28} fill={C.or}>1081</text>}
                  {i === 2 && k === 0 && <text x={cx} y={cy - 18} textAnchor="middle" fontFamily={F.mono} fontSize={6} letterSpacing="0.2em" fill={C.pdim}>A CONTA</text>}
                  {i === 2 && k === 0 && auto > 0 && <text x={cx} y={cy + 24} textAnchor="middle" fontFamily={F.mono} fontSize={6.5} letterSpacing="0.18em" fill={C.or} opacity={auto}>AUTOMÁTICA ✓</text>}
                  {!(i === 2 && k === 0) && a > 0 && <circle cx={cx} cy={cy} r={11 * a} fill={C.or} style={{filter: `drop-shadow(0 0 6px ${C.or})`}} />}
                </g>); })}
            </g>
          ))}
        </svg>
      </div>
      <Label t={t} at={33.7} out={39.2} text={u < 0.6 ? 'FIG. VII — A CONTA, DE NOVO' : 'FIG. VII — A EMPRESA INTEIRA'} y={230} color={C.pdim} />
      <Thin t={t} at={T.isso - 0.05} out={T.agora - 0.25} text="isso está acontecendo de novo." size={70} y={1320} color={C.pen} />
      <Thin t={t} at={T.agora - 0.15} out={T.empresa - 0.45} text="só que agora não é a conta que fica automática." size={52} y={1320} color={C.pen} />
      <Ink t={t} at={T.empresa - 0.2} out={39.2} text="A EMPRESA" size={160} y={1250} color={C.pen} />
      <Ink t={t} at={T.inteira - 0.05} out={39.2} text="INTEIRA." size={160} y={1400} color={C.or} />
    </>
  );
};
// 8–10 · os times, como páginas de livro-razão: "quem faz?" → AGENTE
type Row = {s: string; at: number};
const Ledger: React.FC<{t: number; a: number; out: number; fig: string; rows: Row[]; hit: number; dark?: boolean}> = ({t, a, out, fig, rows, hit, dark}) => {
  const fg = dark ? C.bone : C.pen, dim = dark ? C.dim : C.pdim, n = rows.length, gap = n > 3 ? 118 : 165, y0 = n > 3 ? 480 : 540, size = n > 3 ? 70 : 76;
  const flow = P(t, hit + 0.15 + n * 0.07, 0.55, E.io), yEnd = y0 + (n - 1) * gap;
  return (
    <>
      <Label t={t} at={a + 0.1} out={out} text={fig} y={230} color={dim} />
      <div style={{position: 'absolute', left: 100, right: 100, top: 352, display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: dim, opacity: P(t, a + 0.15, 0.4)}}><span>TAREFA</span><span>QUEM FAZ</span></div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <line x1={100} y1={392} x2={100 + 880 * P(t, a + 0.15, 0.5, E.io)} y2={392} stroke={fg} strokeWidth={2.5} />
        <line x1={100} y1={398} x2={100 + 880 * P(t, a + 0.25, 0.5, E.io)} y2={398} stroke={fg} strokeWidth={1} opacity={0.6} />
        {rows.map((r, i) => { const y = y0 + i * gap, u = P(t, r.at - 0.1, 0.45, E.io), x1 = 100 + r.s.length * size * 0.4 + 24; return (
          <g key={i}>
            <line x1={100} y1={y + gap * 0.42} x2={100 + 880 * u} y2={y + gap * 0.42} stroke={fg} strokeWidth={1} opacity={0.35} />
            {u > 0 && <line x1={x1} y1={y} x2={lerp(x1, 820, u)} y2={y} stroke={fg} strokeWidth={3} strokeDasharray="1 14" strokeLinecap="round" opacity={0.5} />}
          </g>); })}
        {flow > 0 && <line x1={930} y1={y0} x2={930} y2={lerp(y0, yEnd, flow)} stroke={C.or} strokeWidth={4} style={{filter: `drop-shadow(0 0 6px ${C.or})`}} />}
        {flow >= 1 && [0, 0.5].map((ph) => { const k = ((t - hit) * 0.9 + ph) % 1; return <circle key={ph} cx={930} cy={lerp(y0, yEnd, k)} r={7} fill={C.orHi} />; })}
      </svg>
      {rows.map((r, i) => { const y = y0 + i * gap, u = P(t, r.at - 0.08, 0.5, E.out), h = P(t, hit + i * 0.07, 0.4, E.pop); return (
        <React.Fragment key={i}>
          <div style={{position: 'absolute', left: 100, top: y - size * 0.72, fontFamily: F.thin, fontStyle: 'italic', fontSize: size, color: fg, whiteSpace: 'nowrap', opacity: clamp(u * 1.6), transform: `translateX(${((1 - u) * -30).toFixed(0)}px)`, filter: u < 0.99 ? `blur(${((1 - u) * 8).toFixed(1)}px)` : undefined}}>{r.s}</div>
          {u > 0.3 && h <= 0 && <div style={{position: 'absolute', left: 880, width: 100, top: y - 30, textAlign: 'center', fontFamily: F.head, fontWeight: 900, fontSize: 52, lineHeight: 1, color: dim, opacity: 0.5 + 0.5 * (Math.floor(t * 3 + i) % 2)}}>?</div>}
          {h > 0 && <>
            <Dot x={930} y={y} r={14 * h} glow={1.4} />
            <div style={{position: 'absolute', right: 1080 - 900, top: y - 13, fontFamily: F.mono, fontSize: 21, letterSpacing: '0.16em', color: C.or, opacity: clamp(h)}}>AGENTE</div>
          </>}
        </React.Fragment>); })}
      <Ink t={t} at={hit - 0.04} out={out} text="AGENTES." size={210} y={1330} color={C.or} stagger={0.03} />
      <Ring t={t} at={hit} x={930} y={y0} r1={900} d={1.1} />
    </>
  );
};
const MKT: Row[] = [{s: 'pensa a pauta', at: T.pauta - 0.35}, {s: 'escreve o roteiro', at: T.roteiro - 0.4}, {s: 'grava', at: T.grava}, {s: 'edita', at: T.edita}, {s: 'publica', at: T.publica}];
const COM: Row[] = [{s: 'encontra o cliente', at: T.cliente - 0.5}, {s: 'monta a proposta', at: T.proposta - 0.35}, {s: 'acompanha até fechar', at: T.acompanha}];
const FIN: Row[] = [{s: 'cobra', at: T.cobra}, {s: 'concilia', at: T.concilia}, {s: 'projeta o caixa', at: T.projeta}];
// 11 · cada área com seu próprio time (papel)
const TEAMS = [{k: 5, at: 53.7}, {k: 3, at: 53.8}, {k: 3, at: 53.9}, {k: 4, at: T.atendimento - 0.1}, {k: 4, at: T.operacao - 0.1}, {k: 3, at: T.gestao - 0.1}];
const S11: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={53.6} b={58.0} z0={1.0} z1={1.05} oy={800}>
    <Label t={t} at={53.8} out={57.8} text="FIG. XI — CADA ÁREA, UM TIME" y={230} color={C.pdim} />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {DP.map((d, i) => { const u = P(t, TEAMS[i].at, 0.5, E.settle), k = TEAMS[i].k, cx = d.x + 60, cy = d.y + 18; if (u <= 0) return null; return (
        <g key={i} opacity={clamp(u * 1.5)} transform={`translate(${d.x} ${d.y}) scale(${lerp(0.85, 1, u).toFixed(3)}) translate(${-d.x} ${-d.y})`}>
          <rect x={d.x - 200} y={d.y - 105} width={400} height={210} rx={10} fill="#fffaf2" stroke={C.pen} strokeWidth={2} />
          <text x={d.x - 176} y={d.y - 64} fontFamily={F.mono} fontSize={20} letterSpacing="0.16em" fill={C.pen}>{DEPTS[i]}</text>
          <text x={d.x - 176} y={d.y + 70} fontFamily={F.mono} fontSize={16} letterSpacing="0.16em" fill={C.pdim}>{`${k} AGENTES`}</text>
          <circle cx={cx} cy={cy} r={54} fill="none" stroke={C.pen} strokeWidth={1.2} opacity={0.35} />
          {Array.from({length: k}, (_, j) => { const a1 = (j / k) * Math.PI * 2 + t * 0.6 + i, a2 = ((j + 1) / k) * Math.PI * 2 + t * 0.6 + i; return <line key={j} x1={cx + Math.cos(a1) * 54} y1={cy + Math.sin(a1) * 54} x2={cx + Math.cos(a2) * 54} y2={cy + Math.sin(a2) * 54} stroke={C.or} strokeWidth={1.6} opacity={0.6} />; })}
          {Array.from({length: k}, (_, j) => { const a1 = (j / k) * Math.PI * 2 + t * 0.6 + i, pop = P(t, TEAMS[i].at + 0.15 + j * 0.05, 0.3, E.pop); return <circle key={j} cx={cx + Math.cos(a1) * 54} cy={cy + Math.sin(a1) * 54} r={10 * pop} fill={C.or} style={{filter: `drop-shadow(0 0 5px ${C.or})`}} />; })}
        </g>); })}
    </svg>
    <Thin t={t} at={T.atendimento - 0.1} out={T.cada - 0.3} text="atendimento, operação, gestão." size={70} y={1330} color={C.pen} />
    <Thin t={t} at={T.cada - 0.1} out={57.8} text="cada área com seu próprio time." size={70} y={1330} color={C.pen} />
  </Cam>
);
// 12 · não é um agente. é um ecossistema. (escuro)
const ECO = {x: 540, y: 820, R: 330};
const S12: React.FC<{t: number}> = ({t}) => {
  const g = P(t, T.eco - 0.3, 1.0, E.out), links = P(t, T.eco + 0.1, 0.7, E.io);
  const cl = DEPTS.map((_, i) => { const a = -Math.PI / 2 + (i / 6) * Math.PI * 2 + (t - 58) * 0.08; return {x: ECO.x + Math.cos(a) * ECO.R * g, y: ECO.y + Math.sin(a) * ECO.R * g}; });
  return (
    <Cam t={t} a={57.9} b={60.9} z0={1.0} z1={1.08} oy={820}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {links > 0 && cl.map((p, i) => cl.map((q, j) => { if (j <= i) return null; const far = (j - i) % 3 === 0; return <line key={`${i}-${j}`} x1={p.x} y1={p.y} x2={lerp(p.x, q.x, links)} y2={lerp(p.y, q.y, links)} stroke={C.bone} strokeWidth={far ? 0.8 : 1.4} opacity={far ? 0.2 : 0.35} />; }))}
        {links > 0 && cl.map((p, i) => <line key={`h${i}`} x1={ECO.x} y1={ECO.y} x2={lerp(ECO.x, p.x, links)} y2={lerp(ECO.y, p.y, links)} stroke={C.or} strokeWidth={1.2} opacity={0.45} />)}
        {links >= 1 && cl.map((p, i) => cl.map((q, j) => { if (j <= i || (j - i) % 3 === 0) return null; const k = ((t - T.eco) * (0.7 + 0.13 * ((i + j) % 4)) + i * 0.17) % 1; return <circle key={`p${i}-${j}`} cx={lerp(p.x, q.x, k)} cy={lerp(p.y, q.y, k)} r={4} fill={C.orHi} />; }))}
        {g > 0 && cl.map((p, i) => <g key={`c${i}`}>{Array.from({length: TEAMS[i].k}, (_, j) => { const a = (j / TEAMS[i].k) * Math.PI * 2 + t * 1.1 + i; return <circle key={j} cx={p.x + Math.cos(a) * 40 * g} cy={p.y + Math.sin(a) * 40 * g} r={8} fill={C.or} style={{filter: `drop-shadow(0 0 6px ${C.or})`}} />; })}<circle cx={p.x} cy={p.y} r={4} fill={C.bone} /></g>)}
        {g > 0.3 && cl.map((p, i) => <text key={`t${i}`} x={p.x} y={p.y + (p.y > ECO.y + 10 ? 86 : -66)} textAnchor="middle" fontFamily={F.mono} fontSize={17} letterSpacing="0.16em" fill={C.dim} opacity={clamp((g - 0.3) * 2)}>{DEPTS[i]}</text>)}
      </svg>
      <Dot x={ECO.x} y={ECO.y} r={(t < T.eco - 0.3 ? 18 + 3 * Math.sin(t * 5) : 12) * P(t, 57.95, 0.35, E.pop)} glow={1.8} />
      <Label t={t} at={T.agente - 0.1} out={T.eco - 0.5} text="1 AGENTE" x={ECO.x - 52} y={ECO.y + 60} />
      <Thin t={t} at={T.nao - 0.05} out={T.eco - 0.45} text="não é um agente." size={86} y={1300} />
      <Ink t={t} at={T.eco - 0.04} out={60.7} text="ECOSSISTEMA" size={150} y={1350} color={C.or} maxW={940} stagger={0.028} />
    </Cam>
  );
};
// 13 · Instagram: um bilhão, 13 pessoas (papel)
const S13: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={60.8} b={67.0} z0={1.0} z1={1.05} oy={760}>
    <Label t={t} at={61.0} out={66.8} text="FIG. XII — ABRIL DE 2012" y={230} color={C.pdim} />
    <Ink t={t} at={T.instagram - 0.06} out={66.8} text="INSTAGRAM" size={150} y={420} color={C.pen} />
    <Thin t={t} at={T.vendido - 0.1} out={66.8} text="vendido por" size={66} y={585} color={C.pen} />
    <Odo t={t} at={T.bilhao - 0.2} text="1.000.000.000" size={108} y={730} color={C.pen} />
    <Label t={t} at={T.bilhao + 0.5} out={66.8} text="DÓLARES" y={812} align="center" color={C.or} />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 13}, (_, i) => { const u = P(t, T.n13 - 0.12 + i * 0.04, 0.35, E.pop); return u > 0 && <Person key={i} x={144 + i * 66} y={1020} h={96} color={C.pen} s={u} />; })}
    </svg>
    <Ink t={t} at={T.n13 - 0.02} out={66.8} text="13 PESSOAS" size={140} y={1150} color={C.or} />
    <Thin t={t} at={T.antes - 0.55} out={66.8} text="e isso foi antes dos agentes." size={70} y={1320} color={C.pen} />
  </Cam>
);
// 14 · hoje: os fundadores e um ecossistema trabalhando por eles (escuro) — órbitas
const ORB = {x: 540, y: 820, rot: -0.2};
const AG = Array.from({length: 18}, (_, i) => ({o: i % 3, ph: hash(i, 4) * Math.PI * 2, sp: 0.35 + hash(i, 8) * 0.3 - (i % 3) * 0.08, name: i < 6 ? DEPTS[i] : ''}));
const S14: React.FC<{t: number}> = ({t}) => {
  const draw = P(t, T.empresa3 - 0.3, 1.1, E.io), fz = P(t, T.fundadores - 0.25, 0.4, E.pop), ag = (i: number) => P(t, T.eco2 - 0.2 + i * 0.04, 0.35, E.pop);
  const speed = lerp(1, 2.2, P(t, T.eco2 + 0.6, 1.2, E.io)), cr = Math.cos(ORB.rot), sr = Math.sin(ORB.rot);
  const pos = (a: (typeof AG)[number]) => { const rx = 270 + a.o * 125, ry = rx * 0.38, th = a.ph + (t - 67) * a.sp * speed, x = Math.cos(th) * rx, y = Math.sin(th) * ry; return {x: ORB.x + x * cr - y * sr, y: ORB.y + x * sr + y * cr, front: Math.sin(th) > 0, d: Math.sin(th)}; };
  const dots = (front: boolean) => AG.map((a, i) => { const p = pos(a), u = ag(i); if (u <= 0 || p.front !== front) return null; const s = lerp(0.7, 1.15, (p.d + 1) / 2); return (
    <g key={i}>
      <circle cx={p.x} cy={p.y} r={10 * s * u} fill={C.or} opacity={lerp(0.55, 1, (p.d + 1) / 2)} style={{filter: `drop-shadow(0 0 ${(6 * s).toFixed(0)}px ${C.or})`}} />
      {a.name && <text x={p.x} y={p.y - 20} textAnchor="middle" fontFamily={F.mono} fontSize={15} letterSpacing="0.14em" fill={C.dim} opacity={u * lerp(0.4, 0.9, (p.d + 1) / 2)}>{a.name}</text>}
    </g>); });
  return (
    <Cam t={t} a={66.9} b={72.4} z0={1.08} z1={1.0} oy={820}>
      <Label t={t} at={67.1} out={72.2} text="FIG. XIII — UMA EMPRESA, HOJE" y={230} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {[0, 1, 2].map((o) => { const rx = 270 + o * 125; return <ellipse key={o} cx={ORB.x} cy={ORB.y} rx={rx} ry={rx * 0.38} transform={`rotate(${(ORB.rot * 180) / Math.PI} ${ORB.x} ${ORB.y})`} fill="none" stroke={C.bone} strokeWidth={1.3} opacity={0.4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(draw * 1.3 - o * 0.15)} />; })}
        {dots(false)}
        {fz > 0 && <><Person x={ORB.x - 46} y={ORB.y + 62} h={150} color={C.bone} s={fz} /><Person x={ORB.x + 46} y={ORB.y + 62} h={140} color={C.bone} s={fz} /></>}
        {dots(true)}
      </svg>
      <Label t={t} at={T.fundadores - 0.1} out={72.2} text="FUNDADORES" x={ORB.x - 72} y={ORB.y + 84} color={C.bone} />
      <Thin t={t} at={T.hoje2 - 0.05} out={T.fundadores - 0.25} text="uma empresa inteira pode rodar" size={70} y={1300} />
      <Thin t={t} at={T.fundadores - 0.15} out={T.eco2 - 0.3} text="com os fundadores" size={74} y={1300} />
      <Thin t={t} at={T.eco2 - 0.2} out={72.25} text="e um ecossistema trabalhando por eles." size={58} y={1300} />
    </Cam>
  );
};
// 15 · a pergunta: não quantas pessoas, quantas decisões (papel)
const FIELD = Array.from({length: 40}, (_, i) => ({x: 175 + (i % 8) * 104 + (Math.floor(i / 8) % 2) * 22, y: 470 + Math.floor(i / 8) * 108, keep: [11, 20, 29].includes(i)}));
const S15: React.FC<{t: number}> = ({t}) => {
  const strike = P(t, T.contratar + 0.45, 0.3, E.io), fade = P(t, T.quantas2 - 0.1, 0.5, E.io), dec = P(t, T.decisoes - 0.05, 0.5, E.pop);
  return (
    <Cam t={t} a={72.3} b={78.0} z0={1.0} z1={1.06} oy={800}>
      <Label t={t} at={72.5} out={77.8} text="FIG. XIV — A PERGUNTA" y={230} color={C.pdim} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {FIELD.map((p, i) => { const u = P(t, T.quantas - 0.1 + i * 0.012, 0.3, E.pop); if (u <= 0) return null; if (p.keep && dec > 0) return null; return <Person key={i} x={p.x} y={p.y} h={70} color={C.pen} s={u} opacity={lerp(0.85, 0.12, fade)} />; })}
      </svg>
      {FIELD.filter((p) => p.keep).map((p, i) => dec > 0 && <Dot key={i} x={p.x} y={p.y - 36} r={17 * dec} glow={1.6} />)}
      <Thin t={t} at={T.pergunta - 0.2} out={T.quantas2 - 0.2} text="a pergunta não é mais" size={68} y={1000} color={C.pen} />
      <Ink t={t} at={T.quantas - 0.05} out={77.8} text="QUANTAS" size={150} y={1120} color={C.pen} />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - P(t, T.quantas2 - 0.15, 0.25), transform: `translateX(${(-P(t, T.quantas2 - 0.15, 0.3, E.in) * 120).toFixed(0)}px)`}}>
        <Ink t={t} at={T.pessoas2 - 0.05} out={77.8} text="PESSOAS" size={150} y={1265} color={C.pen} />
        {strike > 0 && <div style={{position: 'absolute', left: 230, top: 1262, width: 620 * strike, height: 11, background: C.or, boxShadow: `0 0 18px ${C.or}`, transform: 'rotate(-2deg)', transformOrigin: '0 50%'}} />}
        <Thin t={t} at={T.contratar - 0.1} out={77.8} text="contratar." size={72} y={1385} color={C.pen} />
      </div>
      <Ink t={t} at={T.decisoes - 0.05} out={77.8} text="DECISÕES" size={150} y={1265} color={C.or} />
      <Thin t={t} at={T.so2 - 0.1} out={77.8} text="só você pode tomar." size={76} y={1390} color={C.pen} />
    </Cam>
  );
};
// 16 · o olho (fecho da série) — com a espiral de Fibonacci refletida na íris
const S16: React.FC<{t: number}> = ({t}) => {
  const open = t < T.sting ? P(t, T.por - 0.05, 0.9, E.io) * 0.92 + P(t, T.observa - 0.05, 0.35, E.out) * 0.08 : 1 - P(t, T.sting, 0.18, E.in);
  const pupil = t < T.observa ? 0.35 : lerp(0.35, 1, P(t, T.observa, 0.45, E.out));
  return (
    <>
      {open > 0.01 && <Eye t={t} open={Math.max(0.02, open)} pupil={pupil} cy={800} R={290} spiral={0.2} />}
      <Thin t={t} at={T.por - 0.02} out={T.sting - 0.1} text="por enquanto…" size={86} y={1230} color={C.dim} />
      <Thin t={t} at={T.so3 - 0.05} out={T.sting + 0.15} text="só observa." size={136} y={1370} />
    </>
  );
};
// 17 · o logo: "Yohann" desce/sobe em hastes alternadas (como as contas de um ábaco), "Escher" é escrito com a ponta laranja
const LOGO = {x0: 111, y0: 107, x1: 1345, y1: 739, w: 860};
const lg = (x: number, y: number) => { const s = LOGO.w / (LOGO.x1 - LOGO.x0), cx = (LOGO.x0 + LOGO.x1) / 2, cy = (LOGO.y0 + LOGO.y1) / 2; return {x: 540 + (x - cx) * s, y: 900 + (y - cy) * s, s}; };
const S17: React.FC<{t: number}> = ({t}) => {
  const a = T.sting + 0.35, yo = lg(111, 107), es = lg(202, 339), s = yo.s, YW = 1234 * s, YH = 630 * s, EW = 1008 * s, EH = 400 * s, N = 8;
  const wr = P(t, a + 0.6, 1.35, E.smooth), shine = P(t, a + 2.15, 1.1, E.io), fade = P(t, 86.0, 0.7, E.in);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - fade}}>
      {Array.from({length: N}, (_, k) => { const u = P(t, a + Math.abs(k - (N - 1) / 2) * 0.06, 0.62, E.settle), dir = k % 2 ? 1 : -1; return (
        <div key={k} style={{position: 'absolute', left: yo.x + (k * YW) / N, top: yo.y, width: YW / N + 1, height: YH, overflow: 'hidden'}}>
          <Img src={img('logo_yohann')} style={{position: 'absolute', left: (-k * YW) / N, top: (1 - u) * YH * 0.9 * dir, width: YW, height: YH, opacity: clamp(u * 3)}} />
        </div>); })}
      <div style={{position: 'absolute', left: es.x, top: es.y, width: EW, height: EH, WebkitMaskImage: `linear-gradient(90deg, #000 ${(wr * 100 - 6).toFixed(1)}%, transparent ${(wr * 100 + 2).toFixed(1)}%)`, maskImage: `linear-gradient(90deg, #000 ${(wr * 100 - 6).toFixed(1)}%, transparent ${(wr * 100 + 2).toFixed(1)}%)`}}>
        <Img src={img('logo_escher')} style={{position: 'absolute', inset: 0, width: EW, height: EH, filter: 'drop-shadow(0 6px 18px rgba(255,90,31,.25))'}} />
        {shine > 0 && shine < 1 && <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `url(${img('logo_escher')})`, maskImage: `url(${img('logo_escher')})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', background: `linear-gradient(100deg, transparent ${(shine * 140 - 30).toFixed(0)}%, rgba(255,255,255,.85) ${(shine * 140 - 15).toFixed(0)}%, transparent ${(shine * 140).toFixed(0)}%)`}} />}
      </div>
      {wr > 0 && wr < 1 && <Dot x={es.x + EW * wr} y={es.y + EH * (0.55 + 0.25 * Math.sin(wr * 18))} r={9} glow={1.6} />}
    </div>
  );
};

const LIGHT: [number, number][] = [[6.5, 12.25], [16.95, 20.75], [22.75, 26.95], [33.45, 39.35], [44.95, 49.65], [53.6, 57.9], [60.8, 66.9], [72.3, 77.9], [T.sting + 0.2, 90]];
export const SemPensar: React.FC<{audio: 'none' | 'mix'}> = ({audio}) => {
  useFonts(); usePreload(ALL);
  const frame = useCurrentFrame(), t = frame / FPS;
  const lightK = LIGHT.reduce((m, [a, b]) => Math.max(m, P(t, a, 0.4, E.io) * (1 - P(t, b, 0.35, E.io))), 0);
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden', fontFamily: F.head}}>
      <Scene t={t} a={0} b={6.5} inD={0} outD={0.5} hold><S0 t={t} /></Scene>
      <Scene t={t} a={6.5} b={12.25} light wipe={{kind: 'rods', d: 0.55}} outD={0.4} hold><S1 t={t} /></Scene>
      <Scene t={t} a={12.25} b={16.95} wipe={{kind: 'iris', x: 540, y: 400, d: 0.4}} outD={0.4} hold><S2 t={t} /></Scene>
      <Scene t={t} a={16.95} b={20.75} light wipe={{kind: 'rule', d: 0.5}} outD={0.4} hold><S3 t={t} /></Scene>
      <Scene t={t} a={20.75} b={22.75} inD={0.25} zIn={1.0} outD={0.35} hold bg={C.ink}><S4 t={t} /></Scene>
      <Scene t={t} a={22.75} b={26.95} light wipe={{kind: 'rods', d: 0.5}} outD={0.4} hold><S5 t={t} /></Scene>
      <Scene t={t} a={26.95} b={33.45} wipe={{kind: 'iris', x: 540, y: 760, d: 0.45}} outD={0.4} hold><S6 t={t} /></Scene>
      <Scene t={t} a={33.45} b={39.35} light wipe={{kind: 'rule', d: 0.45}} outD={0.4} hold><S7 t={t} /></Scene>
      <Scene t={t} a={39.35} b={44.95} wipe={{kind: 'rods', d: 0.45}} outD={0.4} hold><Ledger t={t} a={39.35} out={44.85} fig="FIG. VIII — TIME DE MARKETING" rows={MKT} hit={T.ag1} dark /></Scene>
      <Scene t={t} a={44.95} b={49.65} light wipe={{kind: 'rule', d: 0.4}} outD={0.4} hold><Ledger t={t} a={44.95} out={49.55} fig="FIG. IX — TIME COMERCIAL" rows={COM} hit={T.ag2} /></Scene>
      <Scene t={t} a={49.65} b={53.6} wipe={{kind: 'rods', d: 0.4}} outD={0.4} hold><Ledger t={t} a={49.65} out={53.5} fig="FIG. X — TIME FINANCEIRO" rows={FIN} hit={T.ag3} dark /></Scene>
      <Scene t={t} a={53.6} b={57.9} light wipe={{kind: 'rule', d: 0.4}} outD={0.4} hold><S11 t={t} /></Scene>
      <Scene t={t} a={57.9} b={60.8} wipe={{kind: 'iris', x: 540, y: 820, d: 0.45}} outD={0.4} hold><S12 t={t} /></Scene>
      <Scene t={t} a={60.8} b={66.9} light wipe={{kind: 'rods', d: 0.45}} outD={0.4} hold><S13 t={t} /></Scene>
      <Scene t={t} a={66.9} b={72.3} wipe={{kind: 'iris', x: 540, y: 820, d: 0.45}} outD={0.4} hold><S14 t={t} /></Scene>
      <Scene t={t} a={72.3} b={77.9} light wipe={{kind: 'rule', d: 0.45}} outD={0.4} hold><S15 t={t} /></Scene>
      <Scene t={t} a={77.9} b={T.sting + 0.6} wipe={{kind: 'iris', x: 540, y: 800, d: 0.45}} outD={0.1}><S16 t={t} /></Scene>
      {t > T.sting && <Dot x={540} y={800} r={14 * (1 + 0.6 * Math.exp(-(t - T.sting) / 0.2)) * (1 - P(t, T.sting + 0.45, 0.3))} glow={2} />}
      <Scene t={t} a={T.sting + 0.2} b={90} light wipe={{kind: 'iris', x: 540, y: 800, d: 0.55}}><S17 t={t} /></Scene>
      <Dust t={t} n={55} opacity={(1 - lightK) * 0.55} warm={0.08} />
      <Flash t={t} at={0.25} d={0.5} color={C.or} max={0.25} />
      <Flash t={t} at={T.explodiu} d={0.5} color={C.or} max={0.5} />
      <Flash t={t} at={T.jazz} d={0.4} max={0.25} />
      <Flash t={t} at={T.ag1} d={0.45} max={0.55} />
      <Flash t={t} at={T.ag2} d={0.4} color={C.or} max={0.3} />
      <Flash t={t} at={T.ag3} d={0.4} color={C.or} max={0.35} />
      <Flash t={t} at={T.eco} d={0.5} color={C.or} max={0.35} />
      <Flash t={t} at={T.sting} d={0.6} color={C.or} max={0.5} />
      <Ring t={t} at={T.explodiu} x={540} y={840} r1={1300} d={1.2} />
      <Ring t={t} at={T.eco} x={540} y={820} r1={1100} d={1.2} />
      <Ring t={t} at={T.sting} x={540} y={800} r1={1300} d={1.4} />
      <Vignette strength={lerp(0.8, 0.32, lightK)} />
      <Grain frame={frame} amount={0.07 * (1 - lightK)} />
      <Grain frame={frame} amount={0.1 * lightK} dark />
      {audio === 'mix' && <Audio src={staticFile('eco5/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
