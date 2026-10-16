// MASHUP v2 · Tudo de Novo × Royalty — a letra vira imagem: celular 3D com anel de texto → "outro lado" (o celular vira)
// → a lua e suas fases → tela do produtor (DAW) com os acordes → letra cinética → anel de espectro (DJ) → DROP com texto
// atrás do carro → ROYALTY com vídeo nas letras → "tudo de novo" em loop/rebobinar → texto deitado na estrada →
// recortes saindo do quadro → mosaico → respiro → volta → "bolso" → "bro" → muro de nomes → assinatura.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useFonts} from '../../lib/fonts';
import {E, P, clamp, lerp} from '../../lib/core';
import SHOTS from '../mashup/shots.json';
import {Daw} from './Daw';
import {KW, Kinetic} from './Kinetic';
import {CREAM, F, GOLD, GOLD2, Neon, Phone3D, Shot, SpectrumRing, TextRing, VideoWord, kickAt, spec} from './pieces';
import {B, BREATH, DROP, END, FPS, H, LW, LY, REHIT, SC, W, b} from './story';

const SL: Record<string, number> = Object.fromEntries((SHOTS as {id: string; slow: number}[]).map((s) => [s.id, s.slow]));
const LN: Record<string, number> = Object.fromEntries((SHOTS as {id: string; len: number}[]).map((s) => [s.id, s.len]));
const pad = (n: number) => String(n).padStart(4, '0');
const lastBeat = (t: number) => { let i = 0; while (i < B.length - 1 && B[i + 1] <= t) i++; return i; };
const inSc = (t: number, k: keyof typeof SC, pre = 0, post = 0) => t >= SC[k][0] - pre && t < SC[k][1] + post;

/** Plano de vídeo num intervalo; escolhe normal/lento e taxa para cobrir o intervalo inteiro. */
const Clip: React.FC<{id: string; from: number; to: number; style?: React.CSSProperties; z?: number}> = ({id, from, to, style, z = 1}) => {
  const d = to - from, len = LN[id] ?? 0.5, slow = SL[id] ?? 1.2;
  const useSlow = len < d, rate = useSlow ? Math.min(1, Math.max(0.42, slow / d)) : 1;
  return (
    <Sequence from={Math.max(0, Math.round(from * FPS))} durationInFrames={Math.max(1, Math.round(d * FPS))} layout="none">
      <div style={{position: 'absolute', inset: 0, zIndex: z, overflow: 'hidden', ...style}}><Shot id={id} slow={useSlow} rate={rate} /></div>
    </Sequence>
  );
};
const cutRate = (id: string, d: number) => Math.min(1, Math.max(0.42, (SL[id] ?? 1.2) / d));
/** Recorte do objeto (quadro a quadro), alinhado com o plano lento que começa em `from`. */
const Cut: React.FC<{t: number; id: string; from: number; to: number; style?: React.CSSProperties}> = ({t, id, from, to, style}) => {
  if (t < from || t >= to) return null;
  const rate = cutRate(id, to - from), n = Math.max(1, Math.round((SL[id] ?? 1) * FPS)), fi = Math.max(1, Math.min(n, Math.floor((t - from) * FPS * rate) + 1));
  return <Img src={staticFile(`video/mashup/cut/${id}/${pad(fi)}.webp`)} style={{position: 'absolute', inset: 0, width: W, height: H, ...style}} />;
};

// legenda elegante (Bodoni itálico) palavra por palavra
const Sub: React.FC<{t: number; words: LW[]; out: number; y?: number; size?: number; hi?: string[]; color?: string; align?: 'center' | 'left'}> = ({t, words, out, y = 1480, size = 72, hi = [], color = '#fff', align = 'center'}) => {
  if (t < words[0][1] - 0.1 || t > out + 0.5) return null;
  const q = P(t, out, 0.3, E.in);
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: y, textAlign: align, fontFamily: F.bodoni, fontStyle: 'italic', fontWeight: 400, fontSize: size, lineHeight: 1.15, color, opacity: 1 - q, filter: q > 0 ? `blur(${q * 10}px)` : undefined, textShadow: '0 6px 40px rgba(0,0,0,.7)'}}>
      {words.map(([w, at], i) => { const u = P(t, at - 0.04, 0.45, E.out); const g = hi.includes(w); return <span key={i} style={{display: 'inline-block', marginRight: '0.24em', opacity: clamp(u * 2), transform: `translateY(${(1 - u) * 0.4}em)`, filter: u < 0.99 ? `blur(${(1 - u) * 10}px)` : undefined, color: g ? GOLD2 : undefined, fontWeight: g ? 700 : 400}}>{w}</span>; })}
    </div>
  );
};
const Big: React.FC<{t: number; at: number; out: number; text: string; y: number; size: number; color?: string; font?: string; italic?: boolean; track?: string}> = ({t, at, out, text, y, size, color = '#fff', font = F.grot, italic, track = '-0.05em'}) => {
  if (t < at - 0.05 || t > out + 0.3) return null;
  const u = P(t, at, 0.28, E.out), q = P(t, out, 0.2, E.in), d = t - at, sh = d > 0 && d < 0.3 ? Math.exp(-d / 0.08) * 10 : 0;
  return <div style={{position: 'absolute', left: -300, right: -300, top: y - size * 0.55, textAlign: 'center', fontFamily: font, fontStyle: italic ? 'italic' : 'normal', fontWeight: italic ? 400 : 900, fontSize: size, lineHeight: 1.1, letterSpacing: track, color, whiteSpace: 'nowrap', opacity: clamp(u * 2.5) * (1 - q), transform: `translate(${Math.sin(t * 90) * sh}px, ${Math.cos(t * 70) * sh}px) scale(${lerp(1.35, 1, u) * lerp(1, 0.92, q)})`, filter: u < 0.99 || q > 0 ? `blur(${((1 - u) * 16 + q * 12).toFixed(1)}px)` : undefined}}>{text}</div>;
};

// ---------- cenas ----------
const Void: React.FC<{c?: string}> = ({c = '#0c1a3a'}) => <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 55% at 50% 48%, ${c} 0%, #04060b 70%)`}} />;
const Stars: React.FC<{t: number; o?: number}> = ({t, o = 1}) => <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: o}}>{Array.from({length: 120}, (_, i) => { const x = (Math.sin(i * 91.7) * 0.5 + 0.5) * W, y = (Math.cos(i * 37.3) * 0.5 + 0.5) * H, r = 0.6 + ((i * 13) % 7) / 4; return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + i))} />; })}</svg>;

const PhoneScene: React.FC<{t: number}> = ({t}) => {
  const [a, z] = SC.phone, u = P(t, a, 1.5, E.out);
  const flip = P(t, LY.lado[3][1] - 0.15, 0.55, E.io), back = P(t, 5.62, 0.42, E.io), dive = P(t, z - 0.5, 0.5, E.in);
  const ry = lerp(620, 0, u) + Math.sin(t * 0.9) * 14 + 180 * flip + 180 * back, rx = lerp(25, 6, u) + Math.sin(t * 0.7) * 4;
  const scale = lerp(0.35, 1, u) * lerp(1, 5.2, dive), ring = P(t, LY.volta1[2][1] - 0.1, 0.6, E.out) * (1 - P(t, z - 0.6, 0.3));
  const pulse = Math.max(...[1.24, 3.36].map((n) => (t > n ? Math.exp(-(t - n) / 0.25) : 0)));
  return (
    <AbsoluteFill>
      <Void />
      <Stars t={t} o={1 - dive} />
      <div style={{position: 'absolute', left: 540, top: 900, perspective: 1600}}>
        <div style={{position: 'absolute', transformStyle: 'preserve-3d', transform: `translateZ(${lerp(-900, 0, u)}px) scale(${scale})`}}>
          <div style={{position: 'absolute', transformStyle: 'preserve-3d', transform: 'translateY(-40px)'}}><TextRing text="TUDO DE NOVO · TUDO DE NOVO · " r={430} rot={-t * 38} size={66} tilt={-14} o={ring} color={pulse > 0.2 ? GOLD2 : '#fff'} /></div>
          <Phone3D t={t} w={430} ry={ry} rx={rx} rz={Math.sin(t * 0.5) * 3} glow={0.4 + pulse}>
            <Sequence from={0} durationInFrames={Math.round(4.7 * FPS)} layout="none"><Shot id="v1_00" slow rate={0.5} /></Sequence>
            <Sequence from={Math.round(4.7 * FPS)} durationInFrames={Math.round(1.5 * FPS)} layout="none"><Shot id="v1_07" slow rate={0.5} /></Sequence>
          </Phone3D>
        </div>
      </div>
      <Sub t={t} words={LY.volta1} out={2.05} hi={['novo']} />
      <Sub t={t} words={LY.vivo} out={4.2} hi={['novo']} />
      <Sub t={t} words={LY.lado} out={5.95} hi={['outro', 'lado']} />
    </AbsoluteFill>
  );
};

const Moon: React.FC<{r: number; phase?: number; glow?: number}> = ({r, phase = 1, glow = 1}) => (
  <div style={{position: 'relative', width: r * 2, height: r * 2}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 38% 34%, #fffaf0, #e9dfc9 45%, #b9ae98 80%)', boxShadow: `0 0 ${80 * glow}px rgba(255,240,210,${0.55 * glow}), 0 0 ${220 * glow}px rgba(140,170,255,${0.25 * glow})`, overflow: 'hidden'}}>
      {[[0.3, 0.35, 0.16], [0.62, 0.55, 0.11], [0.45, 0.7, 0.08], [0.7, 0.28, 0.06]].map(([x, y, s], i) => <div key={i} style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: r * 2 * s, height: r * 2 * s, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, rgba(120,110,95,.35), rgba(160,150,130,.15))'}} />)}
      {phase < 1 && <div style={{position: 'absolute', top: -2, bottom: -2, left: `${phase * 200 - 100}%`, width: '100%', borderRadius: '50%', background: '#060912', boxShadow: '0 0 30px 10px #060912'}} />}
    </div>
  </div>
);

const LuaScene: React.FC<{t: number}> = ({t}) => {
  const [a] = SC.lua, u = P(t, a, 1.2, E.out), moonY = lerp(900, 520, P(t, LY.lua1[2][1] - 0.4, 1.2, E.out));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, filter: 'brightness(.55) saturate(.8) hue-rotate(-10deg)', transform: `scale(${lerp(1.25, 1.05, u)})`}}><Sequence from={0} durationInFrames={Math.round((SC.lua[1] + 0.2) * FPS)} layout="none"><div style={{position: 'absolute', inset: 0}} /></Sequence></div>
      <Clip id="v1_07" from={4.7} to={SC.lua[1] + 0.2} style={{filter: 'brightness(.5) saturate(.75) contrast(1.1)', transform: `scale(${lerp(1.25, 1.05, u)})`}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(4,6,14,.75), rgba(4,6,14,0) 55%, rgba(4,6,14,.7))', zIndex: 2}} />
      <div style={{position: 'absolute', left: 540 - 210, top: moonY - 210, zIndex: 3, opacity: P(t, a + 0.1, 0.8)}}><Moon r={210} glow={0.8 + 0.4 * Math.min(1, kickAt(t))} /></div>
      <div style={{position: 'absolute', inset: 0, zIndex: 4, transform: `translateY(${moonY - 960}px)`}}><SpectrumRing t={t} r={250} o={0.38 * P(t, LY.lua1[2][1], 0.8)} bars={120} spin={t * 6} /></div>
      <div style={{position: 'absolute', inset: 0, zIndex: 5, transform: `translateY(${moonY - 960}px)`}} />
      <div style={{position: 'absolute', inset: 0, zIndex: 6}}><Sub t={t} words={LY.lua1} out={SC.lua[1] - 0.1} y={1120} size={92} hi={['lua']} /></div>
    </AbsoluteFill>
  );
};

const FaseScene: React.FC<{t: number}> = ({t}) => {
  const [a, z] = SC.fase, out = P(t, z - 0.35, 0.35, E.in);
  return (
    <AbsoluteFill>
      <Void c="#0a1226" />
      <Stars t={t} />
      {LY.fase1.map(([, at], i) => { const u = P(t, at - 0.03, 0.4, E.out), x = 140 + i * 200; return <div key={i} style={{position: 'absolute', left: x - 80, top: 760, opacity: clamp(u * 2), transform: `translateY(${(1 - u) * 60}px) scale(${lerp(0.5, 1, E.pop(u))})`}}><Moon r={80} phase={[0.1, 0.32, 0.5, 0.72, 1][i]} glow={0.6} /></div>; })}
      <Big t={t} at={LY.fase1[4][1]} out={z - 0.1} text="fase" y={1300} size={300} font={F.bodoni} italic color={CREAM} track="-0.02em" />
      <Sub t={t} words={LY.fase1.slice(0, 4)} out={z - 0.1} y={1010} size={84} />
      <div style={{position: 'absolute', inset: 0, background: '#000', opacity: out}} />
    </AbsoluteFill>
  );
};

const KIN: KW[] = [
  ...LY.fase2.map(([w, at], i) => ({w: i === 4 ? 'fase' : w, at, style: (i === 2 ? 'box' : i === 4 ? 'serif' : 'plain') as KW['style']})),
  {w: 'Ê', at: 19.14, style: 'big', br: true}, {w: 'a', at: 19.5, style: 'box'}, {w: 'a', at: 19.78, style: 'accent'}, {w: 'a', at: 20.03, style: 'big'},
];

const RingScene: React.FC<{t: number}> = ({t}) => {
  const [a, z] = SC.ring, u = P(t, a, 0.5, E.out), acc = P(t, a, z - a, E.in);
  const strobe = t > z - 0.85 ? (Math.floor((t - (z - 0.85)) / 0.067) % 2 ? 0.18 : 0) : 0;
  return (
    <AbsoluteFill style={{background: '#030407'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${lerp(0.7, 1.25, acc)}) rotate(${acc * 40}deg)`, opacity: u}}><SpectrumRing t={t} r={360} bars={140} spin={t * 30 + acc * 200} /></div>
      <div style={{position: 'absolute', left: 540, top: 960, perspective: 1400}}><div style={{position: 'absolute', transformStyle: 'preserve-3d', transform: `rotateX(-10deg) scale(${lerp(0.8, 1.15, acc)})`}}><TextRing text="TUDO DE NOVO · " r={250} rot={-t * (60 + acc * 500)} size={64} tilt={-8} o={u} color={GOLD2} /></div></div>
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: strobe}} />
    </AbsoluteFill>
  );
};

const DropScene: React.FC<{t: number}> = ({t}) => {
  const [a, z] = SC.drop;
  return (
    <AbsoluteFill>
      <Clip id="v2_15" from={a} to={z} style={{transform: `scale(${1 + 0.18 * (1 - E.out(P(t, a, 0.6)))})`}} />
      <div style={{position: 'absolute', inset: 0, zIndex: 2, transform: `scale(${1 + 0.18 * (1 - E.out(P(t, a, 0.6)))})`}}>
        <Big t={t} at={a} out={LY.drop[1][1] - 0.02} text="VOLTA" y={980} size={330} />
        <Big t={t} at={LY.drop[1][1]} out={LY.drop[2][1] - 0.02} text="TUDO" y={980} size={360} />
        <Big t={t} at={LY.drop[2][1]} out={z - 0.05} text="DE NOVO" y={980} size={250} color={GOLD2} />
        <Cut t={t} id="v2_15" from={a} to={z} />
      </div>
    </AbsoluteFill>
  );
};

const RoyaltyScene: React.FC<{t: number}> = ({t}) => {
  const [a, z] = SC.royalty, u = P(t, a, 0.5, E.out);
  return (
    <AbsoluteFill>
      <VideoWord word="ROYALTY" size={250} y={960}><div style={{position: 'absolute', inset: 0, transform: `scale(${lerp(1.4, 1.1, u)})`}}><Clip id="v1_04" from={a} to={z} /></div></VideoWord>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: F.bodoni, fontStyle: 'italic', fontSize: 54, color: GOLD2, opacity: P(t, a + 0.25, 0.4)}}>remix eletrônico</div>
    </AbsoluteFill>
  );
};

const LoopScene: React.FC<{t: number}> = ({t}) => {
  const [a, z] = SC.loop, mid = LY.rep2[0][1] - 0.12, rw = t > mid - 0.16 && t < mid ? P(t, mid - 0.16, 0.16) : 0;
  return (
    <AbsoluteFill>
      <Clip id="v2_17" from={a} to={mid} style={{transform: `scale(${1.04 + 0.12 * rw}) translateX(${rw * -60}px)`, filter: rw > 0 ? `blur(${rw * 18}px) contrast(1.3)` : undefined}} />
      <Clip id="v2_17" from={mid} to={z} style={{filter: 'hue-rotate(-12deg) saturate(1.2)'}} />
      {rw > 0 && <div style={{position: 'absolute', inset: 0, zIndex: 3, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,.08) 0 2px, transparent 2px 7px)', mixBlendMode: 'screen'}} />}
      {rw > 0 && <div style={{position: 'absolute', left: 60, top: 160, zIndex: 4, fontFamily: F.mono, fontSize: 44, color: '#fff', textShadow: '0 0 12px #fff'}}>◀◀</div>}
      <div style={{position: 'absolute', inset: 0, zIndex: 5}}>
        {LY.rep1.map(([w, at], i) => <Neon key={`a${i}`} t={t} at={at} out={mid - 0.1} text={w.toUpperCase()} color={GOLD} size={200} y={720 + i * 230} />)}
        {LY.rep2.map(([w, at], i) => <Neon key={`b${i}`} t={t} at={at} out={z - 0.08} text={w.toUpperCase()} color="#7fd6ff" size={200} y={720 + i * 230} tilt={10} />)}
      </div>
    </AbsoluteFill>
  );
};

const CUTS = ['v1_02', 'v2_02', 'v1_09', 'v2_08', 'v2_11', 'v1_08', 'v1_01'];
const Cuts: React.FC<{t: number; ids: string[]; i0: number; step?: number; spectrum?: boolean}> = ({t, ids, i0, step = 1, spectrum}) => (
  <AbsoluteFill>
    {ids.map((id, k) => { const a = b(i0 + k * step), z = b(i0 + (k + 1) * step), whip = k % 2 === 1, w = whip ? 1 - E.out(P(t, a, 0.2)) : 0, punch = 1 - E.out(P(t, a, 0.4)); return <Clip key={k} id={id} from={a} to={z} style={{transform: `translateX(${(w * 1080 * (k % 4 === 1 ? 1 : -1)).toFixed(0)}px) scale(${(1 + 0.15 * punch).toFixed(3)})`, filter: w > 0.02 ? `blur(${(w * 26).toFixed(1)}px)` : undefined}} />; })}
    {spectrum && (() => { const s = spec(t); return <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, zIndex: 5, display: 'flex', alignItems: 'flex-end', gap: 6, padding: '0 18px', boxSizing: 'border-box', background: 'linear-gradient(0deg, rgba(0,0,0,.65), rgba(0,0,0,0))'}}>{s.concat(s.slice().reverse()).map((v, i) => <div key={i} style={{flex: 1, height: 12 + v * v * 300, borderRadius: 3, background: `linear-gradient(0deg, ${GOLD}, rgba(255,255,255,.9))`, opacity: 0.55 + 0.45 * v}} />)}</div>; })()}
  </AbsoluteFill>
);

const RoadScene: React.FC<{t: number}> = ({t}) => {
  const [a, z] = SC.road, speed = 900;
  const words = LY.follow, wayAt = words[6][1];
  return (
    <AbsoluteFill>
      <Clip id="v2_12" from={a} to={33.9} />
      <Clip id="v2_01" from={33.9} to={35.6} />
      <Clip id="v2_00" from={35.6} to={36.65} />
      <Clip id="v2_06" from={36.65} to={z} />
      <div style={{position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,0) 40%, rgba(0,0,0,.65))'}} />
      {/* a letra deitada no chão, vindo em direção à câmera: cada palavra passa embaixo dela quando é cantada */}
      <div style={{position: 'absolute', left: 540, top: 1150, zIndex: 3, perspective: 700}}>
        <div style={{position: 'absolute', transformStyle: 'preserve-3d', transform: `rotateX(66deg) translateY(${((t - a) * speed).toFixed(1)}px)`}}>
          {words.map(([w, at], i) => { const y = -(at - a) * speed, isWay = i === 6, stretch = isWay ? lerp(1, 2.6, P(t, wayAt, 2.4, E.out)) : 1, lit = t >= at - 0.05;
            return <div key={i} style={{position: 'absolute', left: -700, width: 1400, top: y, textAlign: 'center', fontFamily: F.grot, fontWeight: 900, fontSize: i === 2 ? 190 : 150, letterSpacing: '-0.04em', color: i === 2 ? GOLD2 : '#fff', opacity: lit ? 1 : 0.35, transform: `scaleX(${stretch})`, textShadow: lit ? `0 0 30px ${i === 2 ? GOLD : 'rgba(255,255,255,.6)'}` : undefined}}>{isWay ? 'WAY' : w.toUpperCase()}</div>; })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Card em 3D com o objeto recortado saindo para fora da moldura. */
const PopOut: React.FC<{t: number; id: string; from: number; to: number; dir?: number}> = ({t, id, from, to, dir = 1}) => {
  if (t < from - 0.05 || t > to + 0.05) return null;
  const u = P(t, from, 0.6, E.out), v = P(t, to - 0.2, 0.25, E.in);
  const tr = `perspective(1500px) translateZ(${lerp(-400, 0, u) - v * 300}px) rotateY(${dir * (lerp(35, 14, u) + Math.sin(t * 0.8) * 3)}deg) rotateX(${lerp(14, 6, u)}deg) scale(0.86)`;
  return (
    <AbsoluteFill style={{opacity: clamp(u * 2) * (1 - v)}}>
      <div style={{position: 'absolute', inset: 0, transform: tr}}>
        <div style={{position: 'absolute', inset: 0, clipPath: 'inset(16% 13% 22% 13% round 46px)'}}><Clip id={id} from={from} to={to} /></div>
        <div style={{position: 'absolute', left: '13%', right: '13%', top: '16%', bottom: '22%', borderRadius: 46, boxShadow: `0 0 0 3px ${GOLD}, 0 60px 140px rgba(0,0,0,.7)`}} />
        <Cut t={t} id={id} from={from} to={to} style={{filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.55))'}} />
      </div>
    </AbsoluteFill>
  );
};
const SuitScene: React.FC<{t: number}> = ({t}) => {
  const [a, z] = SC.suit, m = 39.25;
  return (
    <AbsoluteFill>
      <Void c="#1a1408" />
      <PopOut t={t} id="v2_14" from={a} to={m} dir={1} />
      <PopOut t={t} id="v1_06" from={m} to={z} dir={-1} />
      <div style={{position: 'absolute', inset: 0, zIndex: 9}}><Big t={t} at={LY.tudo3[0][1]} out={m - 0.1} text="Tudo de novo" y={1660} size={130} font={F.bodoni} italic color={GOLD2} track="-0.01em" /></div>
    </AbsoluteFill>
  );
};

const GRID = ['v2_10', 'v1_09', 'v2_07', 'v1_08', 'v2_16', 'v1_01', 'v2_13', 'v1_11', 'v2_11'];
const GridScene: React.FC<{t: number}> = ({t}) => {
  const [a, z] = SC.grid, tw = 330, th = 586, g = 18, x0 = (W - (tw * 3 + g * 2)) / 2, y0 = (H - (th * 3 + g * 2)) / 2, zo = P(t, z - 0.35, 0.35, E.io);
  return (
    <AbsoluteFill style={{background: '#050507'}}>
      {GRID.map((id, k) => { const at = a + k * 0.135, u = E.out(P(t, at, 0.45)), col = k % 3, row = Math.floor(k / 3), c = k === 4, x = x0 + col * (tw + g), y = y0 + row * (th + g);
        const L = c ? lerp(x, 0, zo) : x + (col - 1) * zo * 500, T = c ? lerp(y, 0, zo) : y + (row - 1) * zo * 700;
        return <div key={k} style={{position: 'absolute', left: L, top: T, width: c ? lerp(tw, W, zo) : tw, height: c ? lerp(th, H, zo) : th, borderRadius: c ? lerp(26, 0, zo) : 26, overflow: 'hidden', zIndex: c ? 3 : 1, opacity: clamp(u * 2) * (c ? 1 : 1 - zo), transform: `perspective(1200px) rotateY(${((1 - u) * 90).toFixed(1)}deg)`, boxShadow: '0 0 0 1px rgba(255,255,255,.15)'}}><Clip id={id} from={a} to={z + 0.02} /></div>; })}
    </AbsoluteFill>
  );
};

const BreathScene: React.FC<{t: number}> = ({t}) => {
  const [a, z] = SC.breath, u = P(t, a, 0.6, E.out), dive = P(t, z - 0.3, 0.3, E.in);
  return (
    <AbsoluteFill>
      <Void c="#0d1d44" />
      <div style={{position: 'absolute', inset: 0, opacity: 0.6}}><SpectrumRing t={t} r={380} bars={140} spin={t * 20} /></div>
      <div style={{position: 'absolute', left: 540, top: 960, perspective: 1500}}>
        <div style={{position: 'absolute', transformStyle: 'preserve-3d', transform: `translateZ(${lerp(-700, 0, u)}px) scale(${lerp(0.7, 1, u) * lerp(1, 5, dive)})`}}>
          <TextRing text="DE NOVO · DE NOVO · " r={400} rot={-t * 90} size={64} tilt={-12} o={u * (1 - dive)} color={GOLD2} />
          <Phone3D t={t} w={400} ry={lerp(720, 8, u) + Math.sin(t) * 6} rx={6} glow={0.8}><Clip id="v2_16" from={a} to={z + 0.1} /></Phone3D>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const BolsoScene: React.FC<{t: number}> = ({t}) => {
  const [a, z] = SC.bolso, m = 52.28;
  return (
    <AbsoluteFill>
      <Clip id="v2_08" from={a} to={m} style={{filter: 'brightness(.8)'}} />
      <Clip id="v2_05" from={m} to={z} />
      <div style={{position: 'absolute', inset: 0, zIndex: 2}}>
        <Big t={t} at={LY.bolso[7][1]} out={z - 0.05} text="BOLSO" y={900} size={340} color={GOLD2} />
        <Cut t={t} id="v2_05" from={m} to={z} />
      </div>
      <div style={{position: 'absolute', inset: 0, zIndex: 3}}><Sub t={t} words={LY.bolso.slice(0, 7)} out={m - 0.05} y={1380} size={92} hi={['área']} /></div>
    </AbsoluteFill>
  );
};

const BroScene: React.FC<{t: number}> = ({t}) => {
  const [a, z] = SC.bro;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {[0, 1].map((k) => { const u = E.out(P(t, a + k * 0.1, 0.45)); return <div key={k} style={{position: 'absolute', left: k ? W / 2 + 6 : 0, top: 0, width: W / 2 - 6, height: H, overflow: 'hidden', transform: `translateY(${((1 - u) * 1920 * (k ? 1 : -1)).toFixed(0)}px)`}}><div style={{position: 'absolute', left: -W / 4, top: 0, width: W, height: H}}><Clip id={k ? 'v2_02' : 'v1_06'} from={a} to={z} /></div></div>; })}
      <div style={{position: 'absolute', inset: 0, zIndex: 5}}>
        <Neon t={t} at={LY.bro[3][1]} out={z - 0.05} text="MEU BRO" color={GOLD} size={190} y={960} tilt={-8} />
        <Sub t={t} words={LY.bro.slice(0, 3)} out={LY.bro[3][1]} y={1400} size={88} />
      </div>
    </AbsoluteFill>
  );
};

const NAMES = ['Arthur Lemos', 'Bia Duarte', 'Caio Vianna', 'Duda Prado', 'Enzo Castro', 'Fê Moraes', 'Gui Andrade', 'Helô Rocha', 'Igor Sales', 'Júlia Brandão', 'Kaio Teles', 'Lara Pires', 'Murilo Dias', 'Nina Lobo', 'Otávio Reis', 'Paola Neves', 'Rafa Gomes', 'Sofia Lins', 'Theo Barros', 'Vitória Assis', 'Davi Mota', 'Malu Freire', 'Bruno Leal', 'Clara Siqueira'];
const MuroScene: React.FC<{t: number}> = ({t}) => {
  const [a, z] = SC.muro, pan = P(t, a, z - a - 0.3, E.io), slot = P(t, LY.meu[4][1] - 0.1, 0.5, E.out);
  return (
    <AbsoluteFill style={{background: '#14110d'}}>
      <div style={{position: 'absolute', left: 540, top: 960, perspective: 1400}}>
        <div style={{position: 'absolute', left: -900, top: -1400, width: 1800, height: 2800, transform: `rotateY(${lerp(-24, -6, pan)}deg) translate(${lerp(260, -40, pan)}px, ${lerp(520, -60, pan)}px) scale(${lerp(1.0, 1.35, pan)})`, background: 'radial-gradient(ellipse at 40% 30%, #4a4236, #211c16 75%)', boxShadow: 'inset 0 0 200px rgba(0,0,0,.8)'}}>
          {NAMES.map((n, i) => { const col = i % 3, row = Math.floor(i / 3), lit = P(t, a + 0.05 * i, 0.4); return <div key={n} style={{position: 'absolute', left: 120 + col * 560, top: 520 + row * 190, width: 520, fontFamily: F.bodoni, fontWeight: 500, fontSize: 64, color: '#6d604c', textShadow: '1px 1px 0 rgba(255,240,210,.28), -1px -1px 0 rgba(0,0,0,.8)', opacity: lit}}>{n}</div>; })}
          <div style={{position: 'absolute', left: 120 + 560, top: 520 + 8 * 190 - 20, width: 520, height: 110, borderRadius: 8, boxShadow: `inset 0 0 0 3px ${GOLD}${slot > 0 ? 'ff' : '00'}, 0 0 ${60 * slot}px ${GOLD}88`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.bodoni, fontStyle: 'italic', fontSize: 70, color: GOLD2, opacity: 0.3 + 0.7 * slot}}>{slot > 0.5 ? 'o meu?' : ''}</div>
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,.75) 100%)'}} />
      <Sub t={t} words={LY.muro} out={LY.meu[0][1] - 0.05} y={1500} size={86} hi={['muro']} />
      <Sub t={t} words={LY.meu} out={z - 0.05} y={1500} size={86} hi={['meu']} />
    </AbsoluteFill>
  );
};

const EndScene: React.FC<{t: number}> = ({t}) => {
  const [a] = SC.end, u = P(t, a, 0.9, E.out), v = P(t, a + 0.5, 0.9, E.out), sw = P(t, a + 0.9, 1.3, E.io), out = P(t, END - 0.9, 0.85, E.in);
  return (
    <AbsoluteFill style={{background: '#030305'}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 50% 30% at 50% 47%, rgba(233,180,76,${0.18 * u}), rgba(0,0,0,0) 70%)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 780, textAlign: 'center', opacity: 1 - out}}>
        <div style={{display: 'inline-block', fontFamily: F.bodoni, fontStyle: 'italic', fontWeight: 400, fontSize: 168, lineHeight: 1, opacity: clamp(u * 2), transform: `translateY(${(1 - u) * 40}px) scale(${lerp(1.1, 1, u)})`, filter: `blur(${((1 - u) * 14).toFixed(1)}px) drop-shadow(0 0 30px rgba(255,217,138,.55))`,
          background: `linear-gradient(100deg, #fff 0%, #fff 40%, ${GOLD2} 50%, #fff 60%, #fff 100%)`, backgroundSize: '300% 100%', backgroundPosition: `${lerp(100, 0, sw)}% 0`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>Tudo de novo</div>
        <div style={{width: 420 * v, height: 2, margin: '34px auto', background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`}} />
        <div style={{fontFamily: F.grot, fontWeight: 800, fontSize: 58, letterSpacing: '0.5em', paddingLeft: '0.5em', color: '#fff', opacity: clamp(v * 2), filter: 'drop-shadow(0 0 18px rgba(255,255,255,.4))'}}>× ROYALTY</div>
      </div>
    </AbsoluteFill>
  );
};

export const MashupRoyaltyV2: React.FC<{audio: 'none' | 'music'}> = ({audio}) => {
  useFonts();
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), t = frame / fps;
  const bi = lastBeat(t), since = t - B[bi], down = bi % 4 === 0, hot = (t >= DROP && t < BREATH) || t >= REHIT;
  const pulse = hot ? Math.exp(-since / 0.12) * (down ? 0.035 : 0.018) : 0, shake = hot && down ? Math.exp(-since / 0.07) * 5 : 0;
  const flash = Math.max(t >= DROP ? Math.exp(-(t - DROP) / 0.16) : 0, t >= REHIT ? Math.exp(-(t - REHIT) / 0.14) * 0.8 : 0);
  const pre = t > SC.ring[1] && t < DROP;
  const S = (k: keyof typeof SC, pre0 = 0, post = 0) => inSc(t, k, pre0, post);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${(Math.sin(t * 61) * shake).toFixed(1)}px, ${(Math.cos(t * 47) * shake * 0.7).toFixed(1)}px) scale(${(1 + pulse).toFixed(4)})`}}>
        {S('phone') && <PhoneScene t={t} />}
        {S('lua') && <LuaScene t={t} />}
        {S('fase') && <FaseScene t={t} />}
        {S('daw') && <Daw t={t} a={SC.daw[0]} b={SC.daw[1]} drop={DROP} rise={15.9} />}
        {S('daw') && <div style={{position: 'absolute', inset: 0}}><Sub t={t} words={LY.lua2} out={SC.daw[1] - 0.2} y={1560} size={80} hi={['lua']} /></div>}
        {S('kin') && <Kinetic t={t} words={KIN} a={SC.kin[0]} b={SC.kin[1]} />}
        {S('ring') && <RingScene t={t} />}
        {S('drop') && <DropScene t={t} />}
        {S('royalty') && <RoyaltyScene t={t} />}
        {S('heli') && <Cuts t={t} ids={['v2_03']} i0={48} step={1} />}
        {S('loop') && <LoopScene t={t} />}
        {S('cuts') && <Cuts t={t} ids={CUTS} i0={54} spectrum />}
        {S('road') && <RoadScene t={t} />}
        {S('suit') && <SuitScene t={t} />}
        {S('grid') && <GridScene t={t} />}
        {S('breath') && <BreathScene t={t} />}
        {S('rehit') && <Cuts t={t} ids={['v1_04', 'v2_15', 'v1_03', 'v2_16', 'v2_17', 'v2_06', 'v2_02', 'v1_02', 'v2_18', 'v1_11']} i0={85} spectrum={t > 47.7} />}
        {S('bolso') && <BolsoScene t={t} />}
        {S('bro') && <BroScene t={t} />}
        {S('muro') && <MuroScene t={t} />}
        {S('end') && <EndScene t={t} />}
      </div>
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash, mixBlendMode: 'screen', pointerEvents: 'none'}} />
      {pre && <div style={{position: 'absolute', inset: 0, background: '#000'}}><div style={{position: 'absolute', left: 540 - 520 * P(t, SC.ring[1], DROP - SC.ring[1], E.in), top: 958, width: 1040 * P(t, SC.ring[1], DROP - SC.ring[1], E.in), height: 4, background: '#fff', boxShadow: `0 0 30px ${GOLD}`}} /></div>}
      {audio === 'music' && <Audio src={staticFile('audio/mashup/trecho.wav')} />}
    </AbsoluteFill>
  );
};
