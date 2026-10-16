// Tipografia do v3 — DUAS famílias: Syne (destaque, em VIDRO translúcido que refrata o vídeo por trás) e
// Instrument Serif itálica (apoio, fina). A interface do editor usa Inter, como um app de verdade.
import React from 'react';
import {E, P, clamp, lerp} from '../../lib/core';

export const T = {
  glass: "Syne, 'Inter Tight', sans-serif",
  serif: "'Instrument Serif', Gelasio, Georgia, serif",
  ui: "Inter, 'DM Sans', system-ui, sans-serif",
  mono: "ui-monospace, Menlo, monospace",
};

type GW = {t: number; at: number; out: number; text: string; size: number; y: number; bg?: React.ReactNode; track?: string; tint?: string; dim?: number};
const Letters: React.FC<{t: number; at: number; text: string; style: React.CSSProperties; size: number; track: string}> = ({t, at, text, style, size, track}) => (
  <div style={{position: 'absolute', left: -400, right: -400, textAlign: 'center', fontFamily: T.glass, fontWeight: 800, fontSize: size, letterSpacing: track, lineHeight: 1, whiteSpace: 'nowrap', ...style}}>
    {text.split('').map((ch, i) => { const u = P(t, at + i * 0.025, 0.42, E.out); return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: clamp(u * 2.2), transform: `translateY(${((1 - u) * 0.35).toFixed(3)}em) scale(${lerp(1.25, 1, u).toFixed(3)})`, filter: u < 0.99 ? `blur(${((1 - u) * 12).toFixed(1)}px)` : undefined}}>{ch}</span>; })}
  </div>
);

/** Palavra de vidro: dentro das letras aparece o vídeo de trás desfocado e clareado (refração), com aresta de luz e brilho que atravessa. */
// avanço real de cada glifo da Syne 800 (em; medido do arquivo da fonte) — a palavra é ajustada para nunca vazar da tela
const ADV: Record<string, number> = {A: 1.16, B: 1.14, C: 1.316, D: 1.302, E: 1.14, F: 1.128, G: 1.34, H: 1.28, I: 0.42, J: 1.004, K: 1.215, L: 0.943, M: 1.58, N: 1.3, O: 1.33, P: 1.177, Q: 1.33, R: 1.232, S: 1.056, T: 1.1, U: 1.289, V: 1.16, W: 1.882, X: 1.14, Y: 1.07, Z: 1.2, ' ': 0.31};
const em = (s: string) => [...s].reduce((a, ch) => a + (ADV[ch] ?? 1.15) - 0.035, 0);
export const GlassWord: React.FC<GW> = ({t, at, out, text, size: want, y, bg, track = '-0.035em', tint = 'rgba(255,255,255,0.10)', dim = 1}) => {
  if (t < at - 0.05 || t > out + 0.35) return null;
  const size = Math.min(want, 980 / em(text));
  const q = P(t, out, 0.28, E.in), sweep = P(t, at + 0.2, 1.1, E.io), top = y - size * 0.5;
  // a saída (opacidade/escala/blur) vai em cada camada, nunca num pai comum: um pai com transform/opacity isolaria o
  // grupo em "screen" e o preto dele cobriria o vídeo
  const wrap: React.CSSProperties = {position: 'absolute', inset: 0, opacity: (1 - q) * dim, transform: q > 0 ? `scale(${lerp(1, 1.06, q)})` : undefined, filter: q > 0 ? `blur(${(q * 10).toFixed(1)}px)` : undefined};
  return (
    <>
      {bg && <div style={{...wrap, isolation: 'isolate', mixBlendMode: 'screen'}}>
        <div style={{position: 'absolute', inset: 0, background: '#000'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top}}><Letters t={t} at={at} text={text} size={size} track={track} style={{color: '#fff'}} /></div>
        <div style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', filter: 'blur(16px) brightness(1.55) saturate(1.25)', transform: 'scale(1.08) translateY(-14px)'}}>{bg}</div>
      </div>}
      <div style={wrap}>
      <div style={{position: 'absolute', left: 0, right: 0, top}}><Letters t={t} at={at} text={text} size={size} track={track} style={{color: tint, WebkitTextStroke: '2px rgba(255,255,255,0.62)', filter: 'drop-shadow(0 10px 34px rgba(0,0,0,.35))'}} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top}}><Letters t={t} at={at} text={text} size={size} track={track} style={{background: 'linear-gradient(172deg, rgba(255,255,255,.75) 0%, rgba(255,255,255,.08) 38%, rgba(255,255,255,0) 60%, rgba(255,255,255,.25) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', opacity: 0.55}} /></div>
      {sweep > 0 && sweep < 1 && <div style={{position: 'absolute', left: 0, right: 0, top}}><Letters t={t} at={at} text={text} size={size} track={track} style={{background: 'linear-gradient(105deg, rgba(255,255,255,0) 40%, rgba(255,255,255,.95) 50%, rgba(255,255,255,0) 60%)', backgroundSize: '300% 100%', backgroundPosition: `${lerp(100, 0, sweep)}% 0`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}} /></div>}
      </div>
    </>
  );
};

/** Linha de apoio na serifa itálica (fina, sem competir com o vidro). */
export const Accent: React.FC<{t: number; at: number; out: number; text: string; size: number; y: number; color?: string}> = ({t, at, out, text, size, y, color = 'rgba(255,255,255,.9)'}) => {
  if (t < at - 0.05 || t > out + 0.3) return null;
  const u = P(t, at, 0.6, E.out), q = P(t, out, 0.25, E.in);
  return <div style={{position: 'absolute', left: 0, right: 0, top: y - size * 0.55, textAlign: 'center', fontFamily: T.serif, fontStyle: 'italic', fontSize: size, color, opacity: clamp(u * 2) * (1 - q), transform: `translateY(${((1 - u) * 24).toFixed(1)}px)`, filter: u < 0.99 || q > 0 ? `blur(${((1 - u) * 8 + q * 8).toFixed(1)}px)` : undefined, textShadow: '0 4px 30px rgba(0,0,0,.6)', letterSpacing: '0.01em'}}>{text}</div>;
};
