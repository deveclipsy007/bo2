// MASHUP · Tudo de Novo × Royalty — edição de luxo sincronizada à música, na linguagem de motion do filme Operon:
// pausa com cards 3D flutuando → subida com cortes acelerando → DROP em tela cheia com punch/whip/flash →
// faixas, mosaico e split → respiro em partículas → volta mais forte → card final e assinatura do remix.
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONTS} from '../../brand/tokens';
import {useFonts} from '../../lib/fonts';
import {E, P, clamp, lerp} from '../../lib/core';
import {KF, ParticleField} from '../../lib/particles';
import {B, BREATH, Clip, DROP, EDL, END, FINALE, FPS, H, LYRIC, REHIT, RISE, SHOT, W, WORDS, b} from './story';

const GOLD = '#f5b942', GOLD2 = '#ffd77a', INK = '#07070a';
const rnd = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const lastBeat = (t: number) => { let i = 0; while (i < B.length - 1 && B[i + 1] <= t) i++; return i; };
const hot = (t: number) => (t >= DROP && t < BREATH) || t >= REHIT;      // trechos com grave: tudo pulsa

// ---------- escolha da versão do plano: normal, câmera lenta ou câmera lenta esticada ----------
const pick = (id: string, slot: number) => {
  const s = SHOT[id], len = s.len ?? s.b - s.a, slow = s.slow ?? len * 2.5;
  if (len >= slot) return {src: `video/mashup/${id}.mp4`, rate: 1};
  if (slow >= slot) return {src: `video/mashup/${id}_slow.mp4`, rate: 1};
  return {src: `video/mashup/${id}_slow.mp4`, rate: Math.max(0.5, slow / slot)};
};
const Vid: React.FC<{id: string; slot: number; style?: React.CSSProperties}> = ({id, slot, style}) => {
  const v = pick(id, slot);
  return <OffthreadVideo src={staticFile(v.src)} muted playbackRate={v.rate} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style}} />;
};

// ---------- modos de montagem ----------
const PRE = {card: 0.32, full: 0.18, strobe: 0, trip: 0, grid: 0, split: 0};
const POST = {card: 0.4, full: 0, strobe: 0, trip: 0.28, grid: 0.3, split: 0.25};

const Card: React.FC<{c: Clip; t: number}> = ({c, t}) => {
  const u = E.out(P(t, c.t0 - PRE.card, 0.75)), v = c.t1 >= END ? 0 : E.in(P(t, c.t1 - 0.2, 0.5));
  const grow = P(t, RISE, DROP - RISE, E.io), fin = c.t0 >= FINALE ? P(t, FINALE + 1.2, 2.2, E.io) : 0;
  const sc = lerp(0.78, 0.97, grow) * lerp(1, 0.66, fin), dir = c.dir ?? 1;
  const kb = lerp(1.1, 1.0, P(t, c.t0 - PRE.card, c.t1 - c.t0 + 0.7, E.smooth));
  const float = Math.sin(t * 0.9 + c.t0) * 8;
  return (
    <>
      <div style={{position: 'absolute', inset: -120, opacity: u * (1 - v) * 0.9, filter: 'blur(46px) brightness(.42) saturate(1.3)', transform: `scale(${1.15 + 0.05 * Math.sin(t * 0.3)})`}}><Vid id={c.id} slot={c.t1 - c.t0 + PRE.card + POST.card} /></div>
      <div style={{position: 'absolute', inset: 0, perspective: 1800}}>
        <div style={{position: 'absolute', left: (W - 840) / 2, top: (H - 1494) / 2 + float, width: 840, height: 1494, borderRadius: 60, overflow: 'hidden', opacity: clamp(u * 1.6) * (1 - v),
          transform: `translateX(${((1 - u) * 760 * dir - v * 760 * dir).toFixed(1)}px) translateZ(${(lerp(-650, 0, u) - v * 380).toFixed(1)}px) rotateY(${((1 - u) * -40 * dir + v * 42 * dir + Math.sin(t * 0.6 + c.t0) * 2.5).toFixed(2)}deg) rotateX(${(Math.cos(t * 0.5) * 2).toFixed(2)}deg) scale(${sc})`,
          boxShadow: '0 0 0 1.5px rgba(255,255,255,.22), 0 60px 160px rgba(0,0,0,.75), 0 0 120px rgba(245,185,66,.08)', filter: u < 0.98 || v > 0.02 ? `blur(${((1 - u) * 10 + v * 12).toFixed(1)}px)` : undefined}}>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${kb})`}}><Vid id={c.id} slot={c.t1 - c.t0 + PRE.card + POST.card} /></div>
          {(() => { const s = P(t, c.t0 + 0.1, 1.1, E.io); return s > 0 && s < 1 && <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(112deg, rgba(255,255,255,0) 38%, rgba(255,255,255,.28) 50%, rgba(255,255,255,0) 62%)', backgroundSize: '260% 100%', backgroundPosition: `${lerp(130, -30, s)}% 0`, mixBlendMode: 'screen'}} />; })()}
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,.35))'}} />
        </div>
      </div>
    </>
  );
};

const Full: React.FC<{c: Clip; t: number; idx: number}> = ({c, t, idx}) => {
  const punch = 1 - E.out(P(t, c.t0, 0.5));
  const whip = idx % 2 === 0, w = whip ? 1 - E.out(P(t, c.t0 - PRE.full, 0.24)) : 0, dir = c.dir ?? 1;
  const drift = lerp(1.0, 1.07, P(t, c.t0, c.t1 - c.t0));
  const breath = c.t1 > BREATH && c.t0 < REHIT ? P(t, BREATH, 0.5, E.out) * (1 - P(t, REHIT - 0.12, 0.2, E.in)) : 0;   // respiro: o quadro vira card cinza
  const bs = lerp(1, 0.8, breath);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translateX(${(w * 1080 * dir).toFixed(1)}px) scale(${((1 + 0.16 * punch) * drift * bs).toFixed(4)})`, filter: `${w > 0.01 ? `blur(${(w * 30).toFixed(1)}px) ` : ''}${breath > 0.01 ? `grayscale(${breath}) brightness(${lerp(1, 0.55, breath)}) ` : ''}contrast(1.04)`, borderRadius: breath * 70, overflow: 'hidden', boxShadow: breath > 0 ? `0 0 0 2px rgba(255,255,255,${0.3 * breath})` : undefined}}>
      <Vid id={c.id} slot={c.t1 - c.t0 + PRE.full} />
    </div>
  );
};

const Strobe: React.FC<{c: Clip; t: number; idx: number}> = ({c, idx}) => (
  <div style={{position: 'absolute', inset: 0, transform: `scale(${1.08 + (idx % 3) * 0.06}) rotate(${(idx % 2 ? 1 : -1) * 1.5}deg)`, filter: `contrast(1.35) brightness(${idx % 2 ? 1.25 : 0.85}) saturate(${idx % 2 ? 0.2 : 1.4})`}}><Vid id={c.id} slot={c.t1 - c.t0} /></div>
);

const Trip: React.FC<{c: Clip; t: number}> = ({c, t}) => {
  const k = c.slot ?? 0, hh = 560, gap = 26, top = (H - (hh * 3 + gap * 2)) / 2, dir = k % 2 ? 1 : -1;
  const u = E.out(P(t, c.t0, 0.42)), v = E.in(P(t, c.t1 - 0.02, 0.26));
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: top + k * (hh + gap), height: hh, borderRadius: 34, overflow: 'hidden', transform: `translateX(${((1 - u) * 1150 * dir + v * -1150 * dir).toFixed(1)}px)`, filter: u < 0.98 || v > 0.02 ? `blur(${((1 - u) * 22 + v * 22).toFixed(1)}px)` : undefined, boxShadow: '0 0 0 1.5px rgba(255,255,255,.2), 0 30px 80px rgba(0,0,0,.6)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: -(1920 * (1000 / 1080) - hh) / 2, height: 1920 * (1000 / 1080), transform: `scale(${lerp(1.15, 1.0, P(t, c.t0, 1.6, E.out))})`}}><Vid id={c.id} slot={c.t1 - c.t0 + POST.trip} /></div>
    </div>
  );
};

const Grid: React.FC<{c: Clip; t: number}> = ({c, t}) => {
  const k = c.slot ?? 0, tw = 330, th = 586, g = 18, x0 = (W - (tw * 3 + g * 2)) / 2, y0 = (H - (th * 3 + g * 2)) / 2;
  const col = k % 3, row = Math.floor(k / 3), x = x0 + col * (tw + g), y = y0 + row * (th + g);
  const u = E.out(P(t, c.t0, 0.45)), z = P(t, c.t1 - 0.32, 0.36, E.io), center = k === 4;
  const out = center ? 0 : z;
  const L = center ? lerp(x, 0, z) : x + (col - 1) * out * 500, T = center ? lerp(y, 0, z) : y + (row - 1) * out * 700;
  const ww = center ? lerp(tw, W, z) : tw, hh = center ? lerp(th, H, z) : th;
  return (
    <div style={{position: 'absolute', left: L, top: T, width: ww, height: hh, borderRadius: lerp(26, 0, center ? z : 0), overflow: 'hidden', opacity: clamp(u * 1.6) * (1 - out), zIndex: center ? 5 : 1, transform: `perspective(1200px) rotateY(${((1 - u) * 90).toFixed(1)}deg) scale(${lerp(0.8, 1, u)})`, boxShadow: '0 0 0 1px rgba(255,255,255,.18), 0 20px 50px rgba(0,0,0,.5)'}}>
      <Vid id={c.id} slot={c.t1 - c.t0 + POST.grid} />
    </div>
  );
};

const Split: React.FC<{c: Clip; t: number}> = ({c, t}) => {
  const k = c.slot ?? 0, u = E.out(P(t, c.t0 + k * 0.08, 0.4)), v = E.in(P(t, c.t1 - 0.02, 0.24)), dir = k ? 1 : -1;
  return (
    <div style={{position: 'absolute', left: k ? W / 2 + 7 : 0, top: 0, width: W / 2 - 7, height: H, overflow: 'hidden', transform: `translateY(${((1 - u) * 1920 * dir - v * 1920 * dir).toFixed(1)}px)`, filter: u < 0.98 || v > 0.02 ? `blur(${((1 - u) * 20 + v * 20).toFixed(1)}px)` : undefined}}>
      <div style={{position: 'absolute', left: -W / 4, top: 0, width: W, height: H}}><Vid id={c.id} slot={c.t1 - c.t0 + POST.split} /></div>
    </div>
  );
};

// ---------- nanopartículas: o título se forma do pó, e o respiro vira pó ----------
const KFS: KF[] = [
  {t: 0, shape: 'ruido', cx: 0, cy: 0, w: 1400, h: 2400, spread: 400, tr: 0},
  {t: 1.15, shape: 'text:TUDO DE NOVO', cx: 0, cy: -40, w: 980, h: 300, spread: 300, tr: 0.95},
  {t: 3.9, shape: 'ring', cx: 0, cy: 0, w: 1500, spread: 380, tr: 1.4},
  {t: BREATH + 0.45, shape: 'text:DE NOVO', cx: 0, cy: -40, w: 900, h: 300, spread: 340, tr: 0.55},
  {t: REHIT + 0.7, shape: 'ruido', cx: 0, cy: 0, w: 2600, h: 3400, spread: 900, tr: 0.7},
  {t: FINALE + 1.6, shape: 'ring', cx: 0, cy: -60, w: 1250, spread: 360, tr: 1.6},
];
const partOp = (t: number) => {
  if (t < 2.4) return 1;
  if (t < RISE) return lerp(1, 0.32, P(t, 2.4, 1.2));
  if (t < BREATH - 0.2) return 0;
  if (t < REHIT + 1.2) return P(t, BREATH - 0.2, 0.3) * (1 - P(t, REHIT + 0.6, 0.6));
  if (t < FINALE + 0.8) return 0;
  return P(t, FINALE + 0.8, 1.2) * 0.85;
};

// ---------- tipografia ----------
const fitSize = (w: string, max: number, k = 0.66) => Math.min(max, 990 / (w.length * k));
const Word: React.FC<{t: number; w: (typeof WORDS)[number]}> = ({t, w}) => {
  if (t < w.at - 0.05 || t > w.out + 0.3) return null;
  const q = P(t, w.out, 0.22, E.in);
  if (w.style === 'serif') {
    const u = P(t, w.at, 0.7, E.out);
    return <div style={{position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center', fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 150, color: '#fff', letterSpacing: '-0.02em', opacity: clamp(u * 2) * (1 - q), transform: `translateY(${(1 - u) * 60}px)`, filter: `blur(${((1 - u) * 14 + q * 10).toFixed(1)}px) drop-shadow(0 0 30px ${GOLD}aa) drop-shadow(0 10px 40px rgba(0,0,0,.6))`}}>{w.w.toLowerCase().replace(/^./, (c) => c.toUpperCase())}</div>;
  }
  if (w.style === 'label') {
    const u = P(t, w.at, 0.4, E.out), line = P(t, w.at + 0.1, 0.5, E.out);
    return <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: (1 - q)}}>
      <div style={{display: 'inline-block', fontFamily: FONTS.display, fontWeight: 800, fontSize: 104, letterSpacing: '0.18em', color: '#fff', paddingLeft: '0.18em', transform: `translateY(${(1 - u) * -40}px)`, opacity: clamp(u * 2), filter: `blur(${((1 - u) * 12).toFixed(1)}px) drop-shadow(0 8px 30px rgba(0,0,0,.7))`}}>{w.w}</div>
      <div style={{width: 260 * line, height: 5, margin: '14px auto 0', borderRadius: 3, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, boxShadow: `0 0 18px ${GOLD}`}} />
    </div>;
  }
  // slam: entra grande e assenta com tremor e aberração cromática que decaem; letra por letra
  const size = fitSize(w.w, 250), d = t - w.at, shake = d > 0 && d < 0.35 ? Math.exp(-d / 0.09) * 14 : 0, ab = Math.exp(-Math.max(0, d) / 0.16) * 9;
  const sweep = P(t, w.at + 0.15, 0.8, E.io);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 860 - size / 2, textAlign: 'center', whiteSpace: 'nowrap', fontFamily: FONTS.display, fontWeight: 800, fontSize: size, letterSpacing: '-0.035em', lineHeight: 1, opacity: 1 - q, transform: `translate(${(Math.sin(t * 97) * shake).toFixed(1)}px, ${(Math.cos(t * 83) * shake * 0.6).toFixed(1)}px) scale(${lerp(1, 0.9, q)})`}}>
      {w.w.split('').map((ch, i) => {
        const u = P(t, w.at + i * 0.028, 0.22, E.out);
        return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: clamp(u * 2.5), transform: `scale(${lerp(1.9, 1, u)}) translateY(${((1 - u) * -30).toFixed(1)}px)`, filter: u < 0.99 ? `blur(${((1 - u) * 18).toFixed(1)}px)` : undefined,
          background: `linear-gradient(100deg, #fff 0%, #fff 38%, ${GOLD2} 50%, #fff 62%, #fff 100%)`, backgroundSize: '320% 100%', backgroundPosition: `${lerp(100, 0, sweep)}% 0`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          textShadow: 'none'}}>{ch}</span>;
      })}
      <div style={{position: 'absolute', inset: 0, color: 'rgba(255,40,90,.55)', transform: `translateX(${-ab}px)`, mixBlendMode: 'screen', opacity: ab > 0.3 ? 1 : 0}}>{w.w}</div>
      <div style={{position: 'absolute', inset: 0, color: 'rgba(40,200,255,.55)', transform: `translateX(${ab}px)`, mixBlendMode: 'screen', opacity: ab > 0.3 ? 1 : 0}}>{w.w}</div>
    </div>
  );
};

// ---------- acabamento: grão, vinheta, letterbox, HUD ----------
const Grain: React.FC<{t: number}> = ({t}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.085, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(t * 30) % 97} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width={W} height={H} filter="url(#gr)" />
  </svg>
);
const tc = (t: number) => { const s = Math.floor(t), f = Math.floor((t - s) * 60); return `00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`; };
const HUD: React.FC<{t: number}> = ({t}) => {
  const o = P(t, 0.6, 0.8) * (1 - P(t, END - 1.4, 1.0)), bi = lastBeat(t), inBar = bi % 4, beatU = Math.exp(-Math.max(0, t - B[bi]) / 0.18);
  const label: React.CSSProperties = {fontFamily: FONTS.body, fontWeight: 600, fontSize: 22, letterSpacing: '0.16em', color: 'rgba(255,255,255,.78)', textShadow: '0 2px 10px rgba(0,0,0,.6)'};
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 54, top: 70, ...label}}>TUDO DE NOVO <span style={{color: GOLD}}>×</span> ROYALTY</div>
      <div style={{position: 'absolute', right: 54, top: 70, ...label, fontFamily: FONTS.data, letterSpacing: '0.06em'}}>{tc(t)} · 112 BPM</div>
      <div style={{position: 'absolute', left: 54, right: 54, bottom: 96, display: 'flex', gap: 8}}>
        {Array.from({length: 16}, (_, i) => { const on = i === (bi % 16), down = i % 4 === 0; return <div key={i} style={{flex: 1, height: on ? 10 : 4, marginTop: on ? 0 : 3, borderRadius: 3, background: on ? (down ? GOLD : '#fff') : 'rgba(255,255,255,.22)', boxShadow: on ? `0 0 ${12 * beatU + 4}px ${down ? GOLD : '#fff'}` : undefined}} />; })}
      </div>
      <div style={{position: 'absolute', left: 54, bottom: 124, ...label, fontSize: 18}}>REMIX ELETRÔNICO</div>
      <div style={{position: 'absolute', right: 54, bottom: 124, ...label, fontSize: 18, color: inBar === 0 ? GOLD : 'rgba(255,255,255,.6)'}}>{String(Math.floor(bi / 4) + 1).padStart(2, '0')}.{inBar + 1}</div>
    </div>
  );
};

// ---------- abertura e assinatura ----------
const EndTitle: React.FC<{t: number}> = ({t}) => {
  const a = FINALE + 1.4, u = P(t, a, 0.9, E.out), v = P(t, a + 0.5, 0.9, E.out), l = P(t, a + 0.3, 0.8, E.out), out = P(t, END - 0.9, 0.8, E.in);
  if (t < a) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1450, textAlign: 'center', opacity: 1 - out}}>
      <div style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 132, color: '#fff', opacity: clamp(u * 2), transform: `translateY(${(1 - u) * 40}px)`, filter: `blur(${((1 - u) * 12).toFixed(1)}px) drop-shadow(0 0 24px ${GOLD}88)`}}>Tudo de novo</div>
      <div style={{width: 360 * l, height: 3, margin: '18px auto', background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`}} />
      <div style={{fontFamily: FONTS.display, fontWeight: 800, fontSize: 64, letterSpacing: '0.42em', paddingLeft: '0.42em', color: '#fff', opacity: clamp(v * 2), transform: `translateY(${(1 - v) * 24}px)`}}>× ROYALTY</div>
    </div>
  );
};

export const MashupRoyalty: React.FC<{audio: 'none' | 'music'}> = ({audio}) => {
  useFonts();
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), t = frame / fps;
  const bi = lastBeat(t), since = t - B[bi], down = bi % 4 === 0;
  const pulse = hot(t) ? Math.exp(-since / 0.12) * (down ? 0.04 : 0.02) : 0;
  const shake = hot(t) && down ? Math.exp(-since / 0.07) * 6 : 0;
  const flash = Math.max(Math.exp(-Math.max(0, t - DROP) / 0.16) * (t >= DROP ? 1 : 0), Math.exp(-Math.max(0, t - REHIT) / 0.14) * (t >= REHIT ? 0.85 : 0), hot(t) && down ? Math.exp(-since / 0.06) * 0.14 : 0);
  const pre = t > DROP - 0.28 && t < DROP ? 1 : 0;                           // apagão antes do drop
  const box = (1 - P(t, DROP, 0.35, E.out)) * P(t, 0.2, 1.0, E.out) + P(t, FINALE + 0.4, 1.2, E.io);   // letterbox na pausa e no fim
  const cam = {x: Math.sin(t * 61) * shake, y: Math.cos(t * 47) * shake * 0.7};
  let fi = 0;
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${cam.x.toFixed(1)}px, ${cam.y.toFixed(1)}px) scale(${(1 + pulse).toFixed(4)})`}}>
        {EDL.map((c, idx) => {
          const pre0 = PRE[c.mode], post = POST[c.mode];
          const from = Math.max(0, Math.round((c.t0 - pre0) * FPS)), dur = Math.max(1, Math.round((Math.min(END, c.t1 + post) - (c.t0 - pre0)) * FPS));
          const k = c.mode === 'full' ? fi++ : idx;
          return (
            <Sequence key={`${c.id}-${idx}`} from={from} durationInFrames={dur} layout="none">
              <div style={{position: 'absolute', inset: 0, zIndex: c.mode === 'card' ? 2 : c.mode === 'grid' ? 3 : 4}}>
                {c.mode === 'card' && <Card c={c} t={t} />}
                {c.mode === 'full' && <Full c={c} t={t} idx={k} />}
                {c.mode === 'strobe' && <Strobe c={c} t={t} idx={idx} />}
                {c.mode === 'trip' && <Trip c={c} t={t} />}
                {c.mode === 'grid' && <Grid c={c} t={t} />}
                {c.mode === 'split' && <Split c={c} t={t} />}
              </div>
            </Sequence>
          );
        })}
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 62% at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,.55) 100%)', pointerEvents: 'none'}} />
      <Grain t={t} />
      <div style={{position: 'absolute', inset: 0, zIndex: 20}}><ParticleField t={t} kfs={KFS} cam={{yaw: Math.sin(t * 0.3) * 8, pitch: Math.cos(t * 0.21) * 5, roll: 0, zoom: 1, x: 0, y: 0}} images={[]} color={[255, 246, 228]} accent={[245, 185, 66]} accent2={[255, 215, 122]} opacity={partOp(t)} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 170 * box, background: '#000', zIndex: 30}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 170 * box, background: '#000', zIndex: 30}} />
      <div style={{position: 'absolute', inset: 0, zIndex: 40}}>{WORDS.map((w) => <Word key={w.w} t={t} w={w} />)}<EndTitle t={t} /></div>
      {/* subtítulo do título de partículas */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1090, textAlign: 'center', zIndex: 41, fontFamily: FONTS.body, fontWeight: 600, fontSize: 26, letterSpacing: '0.5em', paddingLeft: '0.5em', color: GOLD2, opacity: P(t, LYRIC.novo1, 0.5) * (1 - P(t, b(2) + 0.2, 0.4))}}>REMIX ELETRÔNICO</div>
      <div style={{position: 'absolute', inset: 0, zIndex: 50}}><HUD t={t} /></div>
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash, zIndex: 60, mixBlendMode: 'screen', pointerEvents: 'none'}} />
      <div style={{position: 'absolute', inset: 0, background: '#000', opacity: pre, zIndex: 61}} />
      {pre > 0 && <div style={{position: 'absolute', left: 540 - 520 * P(t, DROP - 0.28, 0.28, E.in), top: 958, width: 1040 * P(t, DROP - 0.28, 0.28, E.in), height: 4, background: '#fff', boxShadow: `0 0 30px ${GOLD}`, zIndex: 62}} />}
      {audio === 'music' && <Audio src={staticFile('audio/mashup/trecho.wav')} />}
    </AbsoluteFill>
  );
};
