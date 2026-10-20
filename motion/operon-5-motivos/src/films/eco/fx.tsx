// Linguagem visual da série: preto, cinza escuro, osso (branco quente) e um único laranja — o "ponto" que é vida/consciência.
// Gravuras se desenham sozinhas (mapa de revelação), tipografia editorial (Fraunces 900 + itálica fina) e legendas de figura em mono.
import React, {useLayoutEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {E, P, clamp, lerp} from '../../lib/core';

export const C = {ink: '#0a0a0a', graph: '#1b1b1d', mid: '#3a3a3e', bone: '#f2efe8', dim: '#8d8a84', or: '#ff5a1f', orHi: '#ff9a5c', paper: '#efebe3', pen: '#121110', pdim: '#6f6a60'};
export const F = {
  head: "Fraunces, 'Bodoni Moda', Georgia, serif",
  thin: "'Instrument Serif', 'Fraunces', Georgia, serif",
  mono: "'Plex Mono', ui-monospace, Menlo, monospace",
};

// ---------- imagens: dimensões (px) dos PNG gerados por tools/eco_lineart.py ----------
export const IMG: Record<string, [number, number]> = {
  vitruvian: [1440, 2000], purkinje: [470, 593], cajal: [645, 762], flammarion: [1977, 1652], mycetozoa: [1283, 1800],
  newton: [1240, 1583], atlas: [992, 1480], gears: [763, 953],
};
export const img = (n: string) => staticFile(`eco/img/${n}.png`);
export const map = (n: string) => staticFile(`eco/img/${n}_map.png`);

/** pré-carrega tudo antes do primeiro quadro (feImage do SVG não avisa o Remotion quando termina) */
export const usePreload = (names: string[]) => {
  const [h] = useState(() => delayRender('eco-img'));
  useLayoutEffect(() => {
    const srcs = names.flatMap((n) => [img(n), map(n)]);
    Promise.all(srcs.map((s) => new Promise<void>((ok) => { const i = new Image(); i.onload = () => (i.decode ? i.decode().then(() => ok(), () => ok()) : ok()); i.onerror = () => ok(); i.src = s; }))).then(() => continueRender(h));
  }, [h]);
};

let rid = 0;
/** Gravura que se desenha: p 0→1 percorre o mapa; a frente do traço brilha em laranja (tinta fresca). */
export const Reveal: React.FC<{name: string; p: number; x: number; y: number; width: number; opacity?: number; edge?: number; style?: React.CSSProperties; tint?: string; edgeOnly?: boolean; light?: boolean}> = ({name, p, x, y, width, opacity = 1, edge = 1, style, tint, edgeOnly, light}) => {
  const [id] = useState(() => `rv${rid++}`);
  const [w, h] = IMG[name], k = 14, q = lerp(-0.02, 1 + 1 / k, clamp(p));
  if (p <= 0) return null;
  return (
    <svg width={width} height={(width * h) / w} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: x - width / 2, top: y - (width * h) / w / 2, opacity, overflow: 'visible', filter: light ? 'invert(1)' : tint, ...style}}>
      <defs>
        <filter id={id} x={0} y={0} width={w} height={h} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feImage href={map(name)} x={0} y={0} width={w} height={h} preserveAspectRatio="none" result="m" />
          <feColorMatrix in="m" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${-k} 0 0 0 ${k * q}`} result="a1" />
          <feColorMatrix in="m" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${-k} 0 0 0 ${k * q - 0.9}`} result="a2" />
          <feComposite in="SourceGraphic" in2="a2" operator="in" result="ink" />
          <feComposite in="a1" in2="a2" operator="arithmetic" k1={0} k2={1} k3={-1} k4={0} result="band" />
          <feFlood floodColor={light ? '#00a5e0' : C.or} result="or" />
          <feComposite in="or" in2="band" operator="in" result="orb" />
          <feComposite in="orb" in2="SourceGraphic" operator="in" result="edge" />
          <feGaussianBlur in="edge" stdDeviation={2.2} result="glow" />
          <feMerge>{!edgeOnly && <feMergeNode in="ink" />}{edge > 0 && <feMergeNode in="glow" />}{edge > 0 && <feMergeNode in="edge" />}</feMerge>
        </filter>
      </defs>
      <image href={img(name)} width={w} height={h} filter={`url(#${id})`} />
    </svg>
  );
};

/** imagem recortada, inteira (sem revelação) */
export const Cut: React.FC<{name: string; x: number; y: number; width: number; style?: React.CSSProperties}> = ({name, x, y, width, style}) => {
  const [w, h] = IMG[name];
  return <img src={img(name)} style={{position: 'absolute', left: x - width / 2, top: y - (width * h) / w / 2, width, height: (width * h) / w, ...style}} />;
};

// ---------- tipografia ----------
/** Palavra de impacto (Fraunces 900): letras sobem do desfoque; sai com escala e desfoque. */
// avanço de cada glifo da Fraunces 900 (em; medido do arquivo da fonte) — a palavra nunca vaza da tela
const ADV: Record<string, number> = {A: 0.785, B: 0.772, C: 0.721, D: 0.835, E: 0.691, F: 0.65, G: 0.783, H: 0.9, I: 0.46, J: 0.598, K: 0.863, L: 0.665, M: 0.983, N: 0.77, O: 0.803, P: 0.765, Q: 0.803, R: 0.829, S: 0.647, T: 0.744, U: 0.765, V: 0.756, W: 1.117, X: 0.752, Y: 0.709, Z: 0.66, 'Á': 0.785, 'É': 0.691, 'Í': 0.46, 'Ó': 0.803, 'Ú': 0.765, 'Ã': 0.785, 'Õ': 0.803, 'Ç': 0.721, 'Â': 0.785, 'Ê': 0.691, 'Ô': 0.803, ' ': 0.203, '.': 0.326, ',': 0.339, '…': 1.042};
export const emWidth = (text: string) => [...text].reduce((a, ch) => a + (ADV[ch] ?? 0.75), 0) * 1.06;
export const Big: React.FC<{t: number; at: number; out: number; text: string; size: number; y: number; color?: string; italic?: boolean; x?: number; track?: string; glow?: boolean; stagger?: number; maxW?: number}> = ({t, at, out, text, size: want, y, color = C.bone, italic, x = 540, track = '-0.035em', glow, stagger = 0.028, maxW = 880}) => {
  if (t < at - 0.05 || t > out + 0.4) return null;
  const size = Math.min(want, maxW / (emWidth(text) - 0.035 * (text.length - 1)));
  const q = P(t, out, 0.3, E.in);
  return (
    <div style={{position: 'absolute', left: x - 1400, width: 2800, top: y - size * 0.62, textAlign: 'center', fontFamily: F.head, fontWeight: 900, fontStyle: italic ? 'italic' : 'normal', fontSize: size, lineHeight: 1.1, letterSpacing: track, color, whiteSpace: 'nowrap', opacity: 1 - q, filter: q > 0 ? `blur(${(q * 14).toFixed(1)}px)` : undefined, transform: `scale(${lerp(1, 1.12, q)})`, textShadow: glow ? `0 0 40px ${C.or}aa, 0 0 120px ${C.or}55` : undefined}}>
      {[...text].map((ch, i) => { const u = P(t, at + i * stagger, 0.5, E.out); return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: clamp(u * 1.8), transform: `translateY(${((1 - u) * 0.42).toFixed(3)}em) scale(${lerp(1.3, 1, u).toFixed(3)})`, filter: u < 0.99 ? `blur(${((1 - u) * 16).toFixed(1)}px)` : undefined}}>{ch}</span>; })}
    </div>
  );
};

const isDark = (c: string) => { const h = c.replace('#', ''); if (h.length < 6) return false; const v = (parseInt(h.slice(0, 2), 16) * 299 + parseInt(h.slice(2, 4), 16) * 587 + parseInt(h.slice(4, 6), 16) * 114) / 1000; return v < 110; };
/** Linha fina, itálica (o "resto da frase") */
export const Thin: React.FC<{t: number; at: number; out: number; text: string; size: number; y: number; color?: string; x?: number; italic?: boolean}> = ({t, at, out, text, size, y, color = C.bone, x = 540, italic = true}) => {
  if (t < at - 0.05 || t > out + 0.35) return null;
  const u = P(t, at, 0.7, E.out), q = P(t, out, 0.3, E.in);
  return <div style={{position: 'absolute', left: x - 1000, width: 2000, top: y - size * 0.6, textAlign: 'center', fontFamily: F.thin, fontStyle: italic ? 'italic' : 'normal', fontSize: size, color, opacity: clamp(u * 1.5) * (1 - q), transform: `translateY(${((1 - u) * 26).toFixed(1)}px)`, filter: u < 0.99 || q > 0 ? `blur(${((1 - u) * 10 + q * 10).toFixed(1)}px)` : undefined, letterSpacing: '0.005em', whiteSpace: 'nowrap', textShadow: isDark(color) ? undefined : '0 4px 30px rgba(0,0,0,.8)'}}>{text}</div>;
};

/** Legenda de figura (mono, digitada) — dá o tom de caderno de laboratório */
export const Label: React.FC<{t: number; at: number; out: number; text: string; x?: number; y: number; align?: 'left' | 'center'; color?: string; size?: number}> = ({t, at, out, text, x = 84, y, align = 'left', color = C.dim, size = 24}) => {
  if (t < at || t > out + 0.3) return null;
  const n = Math.floor(clamp((t - at) / 0.55) * text.length), q = P(t, out, 0.3);
  return <div style={{position: 'absolute', left: align === 'center' ? 0 : x, right: align === 'center' ? 0 : undefined, top: y, textAlign: align, fontFamily: F.mono, fontSize: size, letterSpacing: '0.14em', color, opacity: 1 - q, whiteSpace: 'nowrap'}}>{text.slice(0, n)}<span style={{opacity: n < text.length || Math.floor(t * 3) % 2 ? 1 : 0, color: C.or}}>▍</span></div>;
};

// ---------- o ponto (vida/consciência) ----------
export const Dot: React.FC<{x: number; y: number; r: number; glow?: number; opacity?: number}> = ({x, y, r, glow = 1, opacity = 1}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle at 40% 38%, ${C.orHi} 0%, ${C.or} 55%, #d63f0c 100%)`, opacity, boxShadow: `0 0 ${r * 1.5 * glow}px ${C.or}, 0 0 ${r * 5 * glow}px ${C.or}88, 0 0 ${r * 12 * glow}px ${C.or}33`}} />
);

/** onda de choque (anel que expande) */
export const Ring: React.FC<{t: number; at: number; x: number; y: number; r0?: number; r1?: number; d?: number; color?: string; width?: number}> = ({t, at, x, y, r0 = 10, r1 = 900, d = 1.1, color = C.or, width = 3}) => {
  if (t < at || t > at + d) return null;
  const u = P(t, at, d, E.out), r = lerp(r0, r1, u);
  return <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `${width * (1 - u) + 0.5}px solid ${color}`, opacity: (1 - u) * 0.9, boxShadow: `0 0 30px ${color}66`}} />;
};

// ---------- atmosfera ----------
/** grão de filme animado (feTurbulence com semente por quadro) */
export const Grain: React.FC<{frame: number; amount?: number; dark?: boolean}> = ({frame, amount = 0.09, dark}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: amount, mixBlendMode: dark ? 'multiply' : 'screen', pointerEvents: 'none'}}>
    <filter id={dark ? 'grainD' : 'grain'}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 97} /><feColorMatrix values={dark ? '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.4 -0.2' : '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -0.2'} /></filter>
    <rect width={1080} height={1920} filter={`url(#${dark ? 'grainD' : 'grain'})`} />
  </svg>
);
/** papel (fundo claro das cenas invertidas) */
export const Paper: React.FC = () => <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 70% at 50% 45%, #f4f1ea 0%, #ece7dc 60%, #d9d2c3 100%)'}} />;
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.85}) => (
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 40%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: 'none'}} />
);

const R = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** poeira em suspensão (bokeh em 3 profundidades) */
export const Dust: React.FC<{t: number; n?: number; opacity?: number; warm?: number}> = ({t, n = 70, opacity = 1, warm = 0}) => (
  <div style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none'}}>
    {Array.from({length: n}, (_, i) => { const z = R(i * 3 + 1), x = ((R(i) * 1300 + t * (8 + z * 30) * (R(i + 9) - 0.5) * 2) % 1300 + 1300) % 1300 - 110, y = ((R(i * 7) * 2100 - t * (6 + z * 26)) % 2100 + 2100) % 2100 - 90, s = 1.5 + z * z * 7, o = 0.12 + z * 0.4 * (0.6 + 0.4 * Math.sin(t * (1 + R(i) * 2) + i)), orange = R(i * 11) < warm; return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: orange ? C.or : C.bone, opacity: o, filter: z > 0.75 ? `blur(${((z - 0.75) * 14).toFixed(1)}px)` : undefined}} />; })}
  </div>
);

/** clarão (cor, opacidade) */
export const Flash: React.FC<{t: number; at: number; d?: number; color?: string; max?: number}> = ({t, at, d = 0.35, color = '#fff', max = 0.9}) => {
  if (t < at || t > at + d) return null;
  return <div style={{position: 'absolute', inset: 0, background: color, opacity: max * Math.exp(-(t - at) / (d * 0.3)), mixBlendMode: 'screen', pointerEvents: 'none'}} />;
};
