// PROGRAMA: o vídeo que está sendo montado. Aparece pequeno no monitor do editor e em tela cheia quando a câmera
// mergulha no preview — é o mesmo componente, então a passagem é contínua.
import React from 'react';
import {Img, Sequence, staticFile} from 'remotion';
import {E, P, clamp, lerp} from '../../lib/core';
import SHOTS from '../mashup/shots.json';
import {Shot} from '../mashup2/pieces';
import {B, DROP, LY, b} from '../mashup2/story';
import {Accent, GlassWord, T} from './glass';

const FPS = 60, W = 1080, H = 1920;
const SL: Record<string, number> = Object.fromEntries((SHOTS as {id: string; slow: number}[]).map((s) => [s.id, s.slow]));
const LN: Record<string, number> = Object.fromEntries((SHOTS as {id: string; len: number}[]).map((s) => [s.id, s.len]));
const pad = (n: number) => String(n).padStart(4, '0');

export type PC = {id: string; from: number; to: number; punch?: boolean; cut?: boolean};
const bf = (x: number) => { const i = Math.floor(x); return lerp(b(i), b(i + 1), x - i); };     // batida fracionária (meio tempo)
const seq = (ids: string[], i0: number, step = 1): PC[] => ids.map((id, k) => ({id, from: bf(i0 + k * step), to: bf(i0 + (k + 1) * step), punch: true}));
export const PROG: PC[] = [
  {id: 'v1_00', from: b(2), to: b(6)}, {id: 'v1_07', from: b(6), to: b(10)}, {id: 'v2_16', from: b(10), to: b(14)}, {id: 'v1_05', from: b(14), to: b(18)},
  {id: 'v2_13', from: b(18), to: b(20)}, {id: 'v2_04', from: b(20), to: b(26)}, {id: 'v1_10', from: b(26), to: b(32)},
  ...seq(['v2_06', 'v2_00', 'v1_03', 'v2_01'], 32, 2), ...seq(['v2_12', 'v2_14', 'v2_05', 'v1_06'], 40, 0.5),
  {id: 'v2_15', from: DROP, to: b(46), cut: true}, {id: 'v1_04', from: b(46), to: b(48)}, {id: 'v2_03', from: b(48), to: 26.05},
  {id: 'v2_17', from: 26.05, to: 27.25}, {id: 'v2_17', from: 27.25, to: b(54)},
  ...seq(['v1_02', 'v2_02', 'v1_09', 'v2_08', 'v2_11', 'v1_08', 'v1_01'], 54),
  {id: 'v2_12', from: b(61), to: 33.9}, {id: 'v2_01', from: 33.9, to: 35.6}, {id: 'v2_00', from: 35.6, to: 36.65}, {id: 'v2_06', from: 36.65, to: 37.3},
  {id: 'v2_14', from: 37.3, to: 39.25}, {id: 'v1_06', from: 39.25, to: 41.12},
  {id: 'v2_16', from: 43.6, to: b(85)},
  ...seq(['v1_04', 'v2_15', 'v1_03', 'v2_16', 'v2_17', 'v2_06', 'v2_02', 'v1_02', 'v2_18', 'v1_11'], 85),
  {id: 'v2_08', from: 50.0, to: 52.28}, {id: 'v2_05', from: 52.28, to: 53.55, cut: true},
  {id: 'v2_18', from: 55.1, to: 57.85}, {id: 'v1_00', from: 57.85, to: 60.15},
];
export const GRID_AT = 41.12, GRID_END = 43.6, GRID_IDS = ['v2_10', 'v1_09', 'v2_07', 'v1_08', 'v2_16', 'v1_01', 'v2_13', 'v1_11', 'v2_11'];
export const GRID_PICK = [0, 4, 2, 6, 8];       // tiles escolhidos pelo cursor nas batidas

const rateFor = (id: string, d: number) => { const len = LN[id] ?? 0.5, slow = SL[id] ?? 1.2; return len >= d ? {slow: false, rate: 1} : {slow: true, rate: Math.min(1, Math.max(0.42, slow / d))}; };
export const ClipV: React.FC<{c: PC; style?: React.CSSProperties}> = ({c, style}) => {
  const r = rateFor(c.id, c.to - c.from);
  return <Sequence from={Math.max(0, Math.round(c.from * FPS))} durationInFrames={Math.max(1, Math.round((c.to - c.from) * FPS))} layout="none"><div style={{position: 'absolute', inset: 0, overflow: 'hidden', ...style}}><Shot id={c.id} slow={r.slow} rate={r.rate} /></div></Sequence>;
};
const CutImg: React.FC<{t: number; c: PC}> = ({t, c}) => {
  if (t < c.from || t >= c.to) return null;
  const r = rateFor(c.id, c.to - c.from), n = Math.max(1, Math.round((SL[c.id] ?? 1) * FPS)), fi = Math.max(1, Math.min(n, Math.floor((t - c.from) * FPS * r.rate) + 1));
  return <Img src={staticFile(`video/mashup/cut/${c.id}/${pad(fi)}.webp`)} style={{position: 'absolute', inset: 0, width: W, height: H}} />;
};
const cur = (t: number) => PROG.find((c) => t >= c.from && t < c.to);

/** Parâmetros de efeito aplicados no editor (o cursor os coloca; o programa reage). */
export const FX = {glow: (t: number) => P(t, 10.45, 0.6, E.out) * 0.55, grade: (t: number) => P(t, 28.6, 2.4, E.io)};

export const Program: React.FC<{t: number; small?: boolean}> = ({t}) => {
  const c = cur(t), glow = FX.glow(t), grade = FX.grade(t);
  const punch = c?.punch ? 1 - E.out(P(t, c.from, 0.4)) : 0;
  const tf = `scale(${(1 + 0.14 * punch).toFixed(4)})`;
  const filt = `contrast(${1.04 + 0.06 * grade}) saturate(${1 + 0.15 * grade}) sepia(${0.28 * grade}) hue-rotate(${-6 * grade}deg)`;
  const glassBg = c ? <ClipV c={c} style={{transform: tf}} /> : null;
  const inGrid = t >= GRID_AT && t < GRID_END;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, overflow: 'hidden', background: '#000'}}>
      <div style={{position: 'absolute', inset: 0, filter: filt}}>
        {c && <ClipV c={c} style={{transform: tf}} />}
        {glow > 0.01 && c && <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: glow, filter: 'blur(26px) brightness(1.2)'}}><ClipV c={c} style={{transform: tf}} /></div>}
        {inGrid && <Grid t={t} />}
        {c?.cut && <Behind t={t} c={c} />}
        {t >= 53.55 && t < 55.1 && <Split t={t} />}
      </div>
      {/* palavras de destaque: só as que importam. Vidro (Syne) para a palavra-chave, serifa itálica para o resto da frase */}
      <GlassWord t={t} at={LY.volta1[2][1]} out={2.0} text="TUDO" size={300} y={880} bg={glassBg} />
      <Accent t={t} at={LY.volta1[3][1]} out={2.0} text="de novo" size={120} y={1090} />
      <Accent t={t} at={LY.lado[2][1]} out={6.1} text="do outro" size={104} y={760} />
      <GlassWord t={t} at={LY.lado[4][1]} out={6.1} text="LADO" size={300} y={930} bg={glassBg} />
      <GlassWord t={t} at={LY.lua1[2][1]} out={8.45} text="LUA" size={330} y={900} bg={glassBg} />
      <Accent t={t} at={LY.lua1[4][1]} out={8.45} text="ser tão só" size={92} y={1130} />
      <Accent t={t} at={LY.fase1[2][1]} out={10.65} text="por viver de" size={92} y={760} />
      <GlassWord t={t} at={LY.fase1[4][1]} out={10.65} text="FASE" size={300} y={920} bg={glassBg} />
      <GlassWord t={t} at={LY.lua2[2][1]} out={16.9} text="LUA" size={330} y={900} bg={glassBg} />
      <Accent t={t} at={LY.rep1[0][1]} out={27.2} text="tudo de" size={110} y={760} />
      <GlassWord t={t} at={LY.rep1[2][1]} out={27.2} text="NOVO" size={300} y={920} bg={glassBg} />
      <Accent t={t} at={LY.rep2[0][1]} out={28.45} text="tudo de" size={110} y={760} color="#f3e3bd" />
      <GlassWord t={t} at={LY.rep2[2][1]} out={28.45} text="NOVO" size={300} y={920} bg={glassBg} tint="rgba(233,180,76,.18)" />
      <Accent t={t} at={LY.follow[2][1]} out={33.1} text="following" size={112} y={720} />
      <GlassWord t={t} at={LY.follow[3][1]} out={33.1} text="ME" size={340} y={900} bg={glassBg} />
      <Accent t={t} at={LY.follow[4][1]} out={37.15} text="all the" size={112} y={720} />
      <GlassWord t={t} at={LY.follow[6][1]} out={37.15} text="WAY" size={330} y={900} bg={glassBg} />
      <Title t={t} />
      <Accent t={t} at={LY.bro[3][1]} out={55.0} text="com meu" size={100} y={720} />
      <GlassWord t={t} at={LY.bro[4][1]} out={55.0} text="BRO" size={340} y={900} bg={glassBg} />
      <Accent t={t} at={LY.bolso[1][1]} out={52.25} text="eu saí da área" size={92} y={1250} />
      <Signature t={t} bg={glassBg} />
    </div>
  );
};

// texto atrás do objeto recortado (carro no drop; mão com dinheiro em "bolso")
const Behind: React.FC<{t: number; c: PC}> = ({t, c}) => {
  const words = c.id === 'v2_15' ? [['VOLTA', LY.drop[0][1], LY.drop[1][1]], ['TUDO', LY.drop[1][1], LY.drop[3][1]], ['NOVO', LY.drop[3][1], c.to - 0.05]] as [string, number, number][] : [['BOLSO', LY.bolso[7][1], c.to - 0.05]] as [string, number, number][];
  const bg = <ClipV c={c} />;
  return (
    <>
      {words.map(([w, a, o]) => <GlassWord key={w} t={t} at={a} out={o} text={w} size={320} y={940} bg={bg} tint="rgba(255,255,255,.22)" />)}
      <CutImg t={t} c={c} />
      {c.id === 'v2_15' && <Accent t={t} at={LY.drop[2][1]} out={c.to - 0.05} text="de" size={130} y={1180} />}
    </>
  );
};

const Grid: React.FC<{t: number}> = ({t}) => {
  const tw = 330, th = 586, g = 18, x0 = (W - (tw * 3 + g * 2)) / 2, y0 = (H - (th * 3 + g * 2)) / 2;
  let pick = -1; GRID_PICK.forEach((k, i) => { if (t >= b(78 + i)) pick = k; });
  return (
    <div style={{position: 'absolute', inset: 0, background: '#07070a'}}>
      {GRID_IDS.map((id, k) => { const u = E.out(P(t, GRID_AT + k * 0.06, 0.4)), col = k % 3, row = Math.floor(k / 3), on = k === pick; return (
        <div key={k} style={{position: 'absolute', left: x0 + col * (tw + g), top: y0 + row * (th + g), width: tw, height: th, borderRadius: 22, overflow: 'hidden', opacity: clamp(u * 2), transform: `scale(${lerp(0.85, 1, u) * (on ? 1.04 : 1)})`, boxShadow: on ? '0 0 0 6px #e9b44c, 0 0 40px rgba(233,180,76,.6)' : '0 0 0 1px rgba(255,255,255,.15)'}}>
          <ClipV c={{id, from: GRID_AT, to: GRID_END}} />
          <div style={{position: 'absolute', left: 14, top: 12, fontFamily: T.ui, fontWeight: 700, fontSize: 26, color: '#fff', textShadow: '0 2px 8px #000'}}>CAM {k + 1}</div>
        </div>); })}
    </div>
  );
};

const Split: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', inset: 0, background: '#000'}}>
    {(['v1_06', 'v2_02'] as const).map((id, k) => { const u = E.out(P(t, 53.55 + k * 0.42, 0.4)); return <div key={id} style={{position: 'absolute', left: 0, right: 0, top: k ? H / 2 + 6 : 0, height: H / 2 - 6, overflow: 'hidden', transform: `translateX(${((1 - u) * 1080 * (k ? 1 : -1)).toFixed(0)}px)`}}><div style={{position: 'absolute', left: 0, top: -H / 4, width: W, height: H}}><ClipV c={{id, from: 53.55, to: 55.1}} /></div></div>; })}
  </div>
);

// título digitado no editor (serifa de apoio), com cursor de texto
const Title: React.FC<{t: number}> = ({t}) => {
  const a = 37.5, txt = 'Tudo de novo', n = Math.floor(clamp((t - a) / 0.9) * txt.length);
  if (t < a || t > 39.2) return null;
  const caret = Math.floor(t * 2.5) % 2 === 0 || n < txt.length;
  return <div style={{position: 'absolute', left: 0, right: 0, top: 1380, textAlign: 'center', fontFamily: T.serif, fontStyle: 'italic', fontSize: 150, color: '#fff', textShadow: '0 6px 40px rgba(0,0,0,.6)', opacity: 1 - P(t, 39.0, 0.2)}}>{txt.slice(0, n)}<span style={{opacity: caret ? 1 : 0, fontStyle: 'normal', fontWeight: 200, marginLeft: 4}}>|</span></div>;
};

const Signature: React.FC<{t: number; bg: React.ReactNode}> = ({t, bg}) => {
  const a = 57.95;
  if (t < a - 0.1) return null;
  const v = P(t, a + 0.6, 0.8, E.out), out = P(t, 59.3, 0.75, E.in);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.35 * P(t, a, 0.6) * (1 - out)})`}} />
      <GlassWord t={t} at={a} out={60.5} text="TUDO" size={300} y={760} bg={bg} dim={1 - out} />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - out}}><Accent t={t} at={a + 0.15} out={60.5} text="de" size={110} y={935} /></div>
      <GlassWord t={t} at={a + 0.25} out={60.5} text="NOVO" size={300} y={1100} bg={bg} dim={1 - out} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, textAlign: 'center', fontFamily: T.serif, fontStyle: 'italic', fontSize: 86, color: '#f3e3bd', opacity: v * (1 - out), transform: `translateY(${(1 - v) * 20}px)`, letterSpacing: '0.02em', textShadow: '0 0 30px rgba(233,180,76,.5)'}}>× Royalty</div>
    </>
  );
};
export {B};
