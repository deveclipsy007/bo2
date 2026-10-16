// Peças 3D e tipográficas do mashup v2: celular 3D, anel de texto, espectro circular (DJ), palavra neon extrudada,
// palavra com vídeo dentro das letras. Tudo é função de t (sem CSS animation).
import React from 'react';
import {OffthreadVideo, staticFile} from 'remotion';
import {E, P, clamp, lerp} from '../../lib/core';
import MUSIC from './music.json';

export const F = {
  grot: "'Inter Tight', Manrope, system-ui, sans-serif",
  bodoni: "'Bodoni Moda', Gelasio, Georgia, serif",
  mono: "ui-monospace, Menlo, monospace",
};
export const GOLD = '#e9b44c', GOLD2 = '#ffd98a', CREAM = '#f3ead8';
const SPEC = MUSIC.spectrum as number[][];
export const spec = (t: number) => SPEC[Math.max(0, Math.min(SPEC.length - 1, Math.round(t * 60)))];
export const kickAt = (t: number) => (MUSIC.kick as number[])[Math.max(0, Math.min(MUSIC.kick.length - 1, Math.round(t * 60)))];

/** Vídeo de um plano (versão normal ou lenta) preenchendo o pai. */
export const Shot: React.FC<{id: string; slow?: boolean; rate?: number; style?: React.CSSProperties}> = ({id, slow, rate = 1, style}) => (
  <OffthreadVideo src={staticFile(`video/mashup/${id}${slow ? '_slow' : ''}.mp4`)} muted playbackRate={rate} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style}} />
);

// ---------- celular 3D (espessura real em camadas, frente com tela, verso em titânio) ----------
export const Phone3D: React.FC<{t: number; w?: number; ry: number; rx?: number; rz?: number; children?: React.ReactNode; glow?: number}> = ({t, w = 430, ry, rx = 0, rz = 0, children, glow = 0}) => {
  const h = w * 2.08, r = w * 0.17, th = w * 0.065, N = 12;
  const face = ((ry % 360) + 360) % 360, front = face < 90 || face > 270;
  const spec = 0.5 + 0.5 * Math.sin((ry + 30) * Math.PI / 180);
  return (
    <div style={{position: 'absolute', left: -w / 2, top: -h / 2, width: w, height: h, transformStyle: 'preserve-3d', transform: `rotateZ(${rz}deg) rotateX(${rx}deg) rotateY(${ry}deg)`}}>
      {Array.from({length: N}, (_, i) => (
        <div key={i} style={{position: 'absolute', inset: 0, borderRadius: r, transform: `translateZ(${(-th / 2 + (th * i) / (N - 1)).toFixed(2)}px)`, background: `linear-gradient(${90 + ry}deg, #2b2d33, #8a8e97 ${30 + 40 * spec}%, #24262b)`, boxShadow: '0 0 0 1px rgba(255,255,255,.06)'}} />
      ))}
      {/* frente */}
      <div style={{position: 'absolute', inset: 0, borderRadius: r, transform: `translateZ(${th / 2 + 0.5}px)`, background: '#050506', backfaceVisibility: 'hidden', boxShadow: `inset 0 0 0 2px #3a3d44, 0 0 ${40 + 80 * glow}px rgba(80,140,255,${0.15 + 0.35 * glow})`}}>
        <div style={{position: 'absolute', inset: w * 0.035, borderRadius: r * 0.82, overflow: 'hidden', background: '#000'}}>
          {children}
          <div style={{position: 'absolute', left: '50%', top: w * 0.03, width: w * 0.28, height: w * 0.075, marginLeft: -w * 0.14, borderRadius: 99, background: '#000'}} />
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${120 + ry * 0.6}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,${0.16 * spec}) 48%, rgba(255,255,255,0) 62%)`}} />
        </div>
      </div>
      {/* verso */}
      <div style={{position: 'absolute', inset: 0, borderRadius: r, transform: `rotateY(180deg) translateZ(${th / 2 + 0.5}px)`, backfaceVisibility: 'hidden', background: `linear-gradient(${150 - ry * 0.4}deg, #c9ccd2, #8d9098 45%, #e3e5e9 ${55 + 20 * spec}%, #9a9da4)`}}>
        <div style={{position: 'absolute', left: w * 0.07, top: w * 0.07, width: w * 0.42, height: w * 0.42, borderRadius: w * 0.11, background: 'linear-gradient(145deg, #b9bcc3, #8b8e95)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.15), 0 6px 14px rgba(0,0,0,.25)'}}>
          {[[0.05, 0.05], [0.05, 0.22], [0.22, 0.135]].map(([x, y], i) => <div key={i} style={{position: 'absolute', left: w * x, top: w * y, width: w * 0.15, height: w * 0.15, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #3b4a66, #07080b 60%)', boxShadow: '0 0 0 3px #6e7179, 0 0 0 5px #2a2c30'}} />)}
        </div>
      </div>
      {!front && null}
    </div>
  );
};

// ---------- anel de texto 3D (letras num cilindro; o verso aparece espelhado e apagado) ----------
export const TextRing: React.FC<{text: string; r: number; rot: number; size: number; tilt?: number; color?: string; o?: number; font?: string; weight?: number}> = ({text, r, rot, size, tilt = 0, color = '#fff', o = 1, font = F.grot, weight = 800}) => {
  const chars = text.split('');
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d', transform: `rotateX(${tilt}deg) rotateY(${rot}deg)`, opacity: o}}>
      {chars.map((ch, i) => {
        const a = (i / chars.length) * 360, facing = Math.cos(((a + rot) * Math.PI) / 180);
        return <div key={i} style={{position: 'absolute', left: -size * 0.35, top: -size * 0.55, width: size * 0.7, textAlign: 'center', fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1, color, transform: `rotateY(${a}deg) translateZ(${r}px)`, opacity: facing > 0 ? 1 : 0.22, textShadow: facing > 0 ? `0 0 ${18}px rgba(120,170,255,.55)` : undefined, whiteSpace: 'pre'}}>{ch}</div>;
      })}
    </div>
  );
};

// ---------- espectro circular (o lado DJ: reage ao áudio real) ----------
export const SpectrumRing: React.FC<{t: number; r: number; o?: number; bars?: number; color?: string; spin?: number}> = ({t, r, o = 1, bars = 96, color = GOLD, spin = 0}) => {
  const s = spec(t), k = Math.min(1.3, kickAt(t));
  const val = (i: number) => { const m = i % (bars / 2), x = (m / (bars / 2)) * (s.length - 1), a = Math.floor(x), f = x - a; return lerp(s[a], s[Math.min(s.length - 1, a + 1)], f); };
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: o}}>
      <defs><filter id="sg"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <g transform={`translate(540 960) rotate(${spin})`} filter="url(#sg)">
        <circle r={r * (0.92 + 0.06 * k)} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={2} />
        <circle r={r * 0.62} fill="none" stroke={color} strokeWidth={2} strokeDasharray="2 14" opacity={0.6} transform={`rotate(${t * 40})`} />
        {Array.from({length: bars}, (_, i) => { const v = val(i), a = (i / bars) * Math.PI * 2, l = 10 + v * v * r * 0.75; return <line key={i} x1={Math.cos(a) * r} y1={Math.sin(a) * r} x2={Math.cos(a) * (r + l)} y2={Math.sin(a) * (r + l)} stroke={v > 0.75 ? GOLD2 : '#fff'} strokeWidth={5} strokeLinecap="round" opacity={0.35 + 0.65 * v} />; })}
        <circle r={r * 0.3 * (1 + 0.18 * k)} fill={`rgba(233,180,76,${0.08 + 0.2 * k})`} />
      </g>
    </svg>
  );
};

// ---------- palavra neon extrudada (camadas de profundidade + brilho), cor por palavra ----------
export const Neon: React.FC<{t: number; at: number; out: number; text: string; color: string; size: number; x?: number; y: number; tilt?: number; font?: string}> = ({t, at, out, text, color, size, x = 540, y, tilt = -12, font = F.grot}) => {
  if (t < at - 0.05 || t > out + 0.3) return null;
  const u = P(t, at, 0.32, E.out), q = P(t, out, 0.2, E.in), depth = 14;
  const dark = color + '66';
  const sh = Array.from({length: depth}, (_, i) => `${0}px ${i + 1}px 0 ${dark}`).join(', ');
  return (
    <div style={{position: 'absolute', left: x - 540, top: y - size / 2, width: 1080, textAlign: 'center', perspective: 900, opacity: clamp(u * 2) * (1 - q)}}>
      <div style={{display: 'inline-block', fontFamily: font, fontWeight: 900, fontSize: size, letterSpacing: '-0.04em', lineHeight: 1, color, transform: `rotateX(${lerp(-70, tilt, u) + q * 30}deg) rotateY(${(1 - u) * 25}deg) scale(${lerp(0.7, 1, u) * lerp(1, 1.12, q)})`, textShadow: `${sh}, 0 0 28px ${color}cc, 0 0 80px ${color}88`, filter: u < 0.99 || q > 0 ? `blur(${((1 - u) * 14 + q * 12).toFixed(1)}px)` : undefined, whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  );
};

// ---------- palavra gigante com o vídeo dentro das letras ----------
export const VideoWord: React.FC<{word: string; size: number; children: React.ReactNode; y?: number; font?: string; tracking?: string}> = ({word, size, children, y = 960, font = F.grot, tracking = '-0.05em'}) => (
  <div style={{position: 'absolute', inset: 0, background: '#000', isolation: 'isolate'}}>
    <div style={{position: 'absolute', left: -200, right: -200, top: y - size * 0.55, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: size, letterSpacing: tracking, lineHeight: 1.1, color: '#fff', whiteSpace: 'nowrap'}}>{word}</div>
    <div style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply'}}>{children}</div>
  </div>
);
