// MASHUP v3 · "criando o vídeo": gravação de tela imersiva de um editor de música + vídeo. O cursor arrasta clipes no tempo
// da batida, desenha os acordes, puxa o riser, aplica glow e cor, duplica ("tudo de novo"), digita o título e exporta.
// A câmera segue o cursor com zoom suave (estilo Screen Studio) e MERGULHA no preview nos momentos fortes.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useFonts} from '../../lib/fonts';
import {E, P, clamp, lerp} from '../../lib/core';
import BEATS from '../mashup/beats.json';
import MUSIC from '../mashup2/music.json';
import {DROP, REHIT} from '../mashup2/story';
import {BIN, EdState, Editor, PV, TOOL, TR, WIN, binPos, fxPos, trackY, tx} from './editor';
import {GRID_PICK, Program} from './program';

const B: number[] = BEATS.beats;
const b = (i: number) => B[Math.max(0, Math.min(B.length - 1, i))];
type XY = {x: number; y: number};
const V1 = (s: number): XY => ({x: tx(s), y: trackY(2)});
const PC: XY = {x: PV.x + PV.w / 2, y: PV.y + PV.h / 2};
const prog2win = (px: number, py: number): XY => ({x: PV.x + px / 3, y: PV.y + py / 3});
const tile = (k: number) => prog2win(27 + (k % 3) * 348 + 165, 63 + Math.floor(k / 3) * 604 + 293);

// ---------- roteiro do cursor: [t, ponto, botão pressionado] ----------
type K = [number, XY, 0 | 1];
const K: K[] = [];
const at = (t: number, p: XY, d: 0 | 1 = 0) => K.push([t, p, d]);
const click = (t: number, p: XY) => { at(t - 0.18, p); at(t, p, 1); at(t + 0.05, p); };
const drag = (t0: number, a: XY, t1: number, z: XY) => { at(t0 - 0.2, a); at(t0, a, 1); at(t1, z, 1); at(t1 + 0.05, z); };
at(0, {x: 1500, y: 1250});
drag(0.62, binPos(0), 1.05, V1(1.111));
drag(2.5, binPos(1), 3.15, V1(3.247));
drag(4.55, binPos(2), 5.38, V1(5.476));
drag(6.66, binPos(3), 7.46, V1(7.543));
drag(8.8, binPos(4), 9.6, V1(9.679));
// entre um clipe e outro o cursor sobe para o preview ("assistindo" o que montou) — a câmera vai junto
[[1.05, 2.5], [3.15, 4.55], [5.38, 6.66], [7.46, 8.8]].forEach(([a, z]) => { at(a + 0.42, {x: PC.x + 30, y: PV.y + 520}); at(z - 0.5, {x: PC.x - 10, y: PV.y + 560}); });
drag(9.98, fxPos(0), 10.4, {x: tx(10.2), y: trackY(1)});
click(10.66, {x: 300, y: trackY(5)}); click(10.75, {x: 300, y: trackY(5)});
// piano roll: o cursor desenha a nota fundamental de cada acorde enquanto o playhead grava
const ROLL_X = 14 + 150 + 40 + 4 * 210, rowY = (p: number) => 784 + 64 + (74 - 1 - p) * ((702 - 70) / (74 - 48)) + 12;
(MUSIC.chords as {start: number; root: number}[]).filter((c) => c.start > 10.7 && c.start < 16.8).forEach((c, i) => { at(c.start - 0.12, {x: ROLL_X - 40, y: rowY(48 + c.root)}, i ? 1 : 0); at(c.start, {x: ROLL_X, y: rowY(48 + c.root)}, 1); });
at(10.85, {x: ROLL_X, y: rowY(49)}, 1);
click(17.0, {x: 2350, y: 812});
drag(17.18, fxPos(4), 17.55, {x: tx(17.7), y: trackY(7)});
at(18.15, {x: tx(18.27), y: trackY(7) + 24}); for (let s = 18.27; s <= 21.3; s += 0.25) at(s, {x: tx(s), y: trackY(7) + 24 - Math.pow((s - 18.27) / 3.73, 2.2) * 48}, 1); at(21.35, {x: tx(21.3), y: trackY(7) - 20});
click(22.0, {x: PC.x, y: PV.y + PV.h - 30});
at(26.3, {x: tx(26.0), y: trackY(2) + 10}); click(26.88, {x: tx(26.3), y: trackY(2)});
drag(28.6, {x: 2260, y: 600}, 31.0, {x: 2286, y: 578});
at(31.2, PC);
at(37.3, {x: PC.x + 40, y: PC.y + 80}); click(37.45, TOOL(1)); click(37.6, {x: PC.x, y: PV.y + 470});
click(39.7, {x: tx(38.3), y: trackY(0)}); click(40.3, {x: tx(39.0), y: trackY(0)});
GRID_PICK.forEach((k, i) => click(b(78 + i), tile(k)));
at(43.5, {x: tx(43.6), y: 808}); at(43.7, {x: tx(43.6), y: 808}, 1); at(44.2, {x: tx(41.6), y: 808}, 1); at(44.5, {x: tx(44.6), y: 808}, 1); at(44.55, {x: tx(44.6), y: 808});
drag(53.75, binPos(12), 54.05, {x: PC.x, y: PV.y + 160}); drag(54.15, binPos(13), 54.45, {x: PC.x, y: PV.y + 480});
click(55.2, {x: 2300, y: 32}); click(55.42, {x: 1200, y: 520}); click(56.28, {x: 1200, y: 690}); at(57.3, {x: 1500, y: 900});
K.sort((p, q) => p[0] - q[0]);

const cursorAt = (t: number): {x: number; y: number; down: boolean} => {
  let i = 0; while (i < K.length - 1 && K[i + 1][0] <= t) i++;
  const a = K[i], z = K[Math.min(K.length - 1, i + 1)];
  if (z === a || t <= a[0]) return {x: a[1].x, y: a[1].y, down: !!a[2]};
  const u = E.io(clamp((t - a[0]) / (z[0] - a[0])));
  const lin = a[2] && z[2];                                 // arrastando: movimento mais direto
  const v = lin ? E.smooth(clamp((t - a[0]) / (z[0] - a[0]))) : u;
  return {x: lerp(a[1].x, z[1].x, v), y: lerp(a[1].y, z[1].y, v), down: !!a[2]};
};
const DRAGS: [number, number, 'thumb' | 'fx', number][] = [[0.62, 1.05, 'thumb', 0], [2.5, 3.15, 'thumb', 1], [4.55, 5.38, 'thumb', 2], [6.66, 7.46, 'thumb', 3], [8.8, 9.6, 'thumb', 4], [9.98, 10.4, 'fx', 0], [17.18, 17.55, 'fx', 4], [53.75, 54.05, 'thumb', 12], [54.15, 54.45, 'thumb', 13]];

// ---------- câmera: segue o cursor / enquadra / mergulha no preview ----------
type Cam = {x: number; y: number; z: number; rx: number; ry: number};
type Shot = {s: number; d: number; f: (t: number) => Cam};
const fixed = (x: number, y: number, z: number, rx = 0, ry = 0) => () => ({x, y, z, rx, ry});
const follow = (z: number, rx = 5, ry = -4, yBias = 0) => (t: number): Cam => {
  let sx = 0, sy = 0; for (let k = 0; k < 8; k++) { const c = cursorAt(t - 0.4 + k * 0.06); sx += c.x; sy += c.y; }
  const hw = 540 / z, hh = 960 / z, x = clamp(sx / 8, hw, WIN.w - hw), y = hh * 2 > WIN.h ? WIN.h / 2 + yBias : clamp(sy / 8 + yBias, hh, WIN.h - hh);
  return {x, y, z, rx: rx + Math.sin(t * 0.5) * 1.5, ry: ry + Math.sin(t * 0.37) * 2};
};
const DIVE = fixed(PC.x, PC.y, 1080 / PV.w);
const SHOTS: Shot[] = [
  {s: 0, d: 0.01, f: fixed(1200, 750, 0.36, 24, -18)},
  {s: 0.25, d: 1.1, f: fixed(1100, 760, 0.62, 10, -8)},
  {s: 1.2, d: 0.9, f: follow(1.3)},
  {s: 10.62, d: 0.7, f: (t) => ({x: lerp(960, 1040, P(t, 10.8, 6)), y: lerp(940, 900, P(t, 10.8, 6)), z: 1.22, rx: 10 + Math.sin(t) * 1.5, ry: -6})},
  {s: 16.9, d: 0.6, f: follow(1.3)},
  {s: 18.15, d: 0.5, f: follow(1.45, 8, -3)},
  {s: 20.9, d: 1.1, f: DIVE},
  {s: 26.05, d: 0.01, f: DIVE},
  {s: 26.1, d: 0.75, f: follow(1.3)},
  {s: 28.3, d: 0.6, f: (t) => ({x: 1530, y: 720, z: 0.72, rx: 9 + Math.sin(t * 0.6) * 1.5, ry: -10})},
  {s: 31.05, d: 0.85, f: DIVE},
  {s: 37.3, d: 0.01, f: DIVE},
  {s: 37.32, d: 0.6, f: fixed(PC.x + 60, 470, 1.55, 4, -3)},
  {s: 39.35, d: 0.5, f: follow(1.3)},
  {s: 40.95, d: 0.45, f: fixed(PC.x, PC.y, 2.35, 3, 2)},
  {s: 43.35, d: 0.35, f: (t) => ({x: tx(43), y: 1000, z: 1.5, rx: 8, ry: -4 + Math.sin(t * 9) * 1.5})},
  {s: 44.42, d: 0.25, f: DIVE},
  {s: 53.55, d: 0.01, f: DIVE},
  {s: 53.6, d: 0.6, f: fixed(620, 460, 0.82, 6, -5)},
  {s: 55.0, d: 0.5, f: fixed(1200, 640, 0.95, 6, -4)},
  {s: 57.35, d: 0.5, f: DIVE},
];
const camAt = (t: number): Cam => {
  let k = 0; while (k < SHOTS.length - 1 && SHOTS[k + 1].s <= t) k++;
  const cur = SHOTS[k].f(t); if (k === 0) return cur;
  const prev = SHOTS[k - 1].f(t), u = E.io(clamp((t - SHOTS[k].s) / SHOTS[k].d));
  return {x: lerp(prev.x, cur.x, u), y: lerp(prev.y, cur.y, u), z: Math.exp(lerp(Math.log(prev.z), Math.log(cur.z), u)), rx: lerp(prev.rx, cur.rx, u), ry: lerp(prev.ry, cur.ry, u)};
};
const FULL: [number, number][] = [[22.08, 26.05], [31.9, 37.3], [44.67, 53.55], [57.85, 60.2]];

const Wallpaper: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 30% 20%, #232a52 0%, #0b0d1a 55%, #050508 100%)'}}>
    {[[200, 300, 420, '#4b3cff'], [880, 1500, 520, '#e9b44c'], [700, 700, 360, '#1fb8c9']].map(([x, y, r, c], i) => <div key={i} style={{position: 'absolute', left: (x as number) - (r as number) + Math.sin(t * 0.2 + i) * 30, top: (y as number) - (r as number), width: (r as number) * 2, height: (r as number) * 2, borderRadius: '50%', background: c as string, opacity: 0.16, filter: 'blur(120px)'}} />)}
  </AbsoluteFill>
);

export const MashupRoyaltyV3: React.FC<{audio: 'none' | 'music'}> = ({audio}) => {
  useFonts();
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), t = frame / fps;
  const full = FULL.some(([a, z]) => t >= a && t < z);
  // batida: pulso e tremor só na tela cheia com grave
  let bi = 0; while (bi < B.length - 1 && B[bi + 1] <= t) bi++;
  const since = t - B[bi], hot = full && t >= DROP, down = bi % 4 === 0;
  const pulse = hot ? Math.exp(-since / 0.12) * (down ? 0.035 : 0.016) : 0, shake = hot && down ? Math.exp(-since / 0.07) * 5 : 0;
  const flash = Math.max(t >= DROP ? Math.exp(-(t - DROP) / 0.16) : 0, t >= REHIT ? Math.exp(-(t - REHIT) / 0.14) * 0.8 : 0);
  if (full) return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${(Math.sin(t * 61) * shake).toFixed(1)}px, ${(Math.cos(t * 47) * shake * 0.7).toFixed(1)}px) scale(${(1 + pulse).toFixed(4)})`}}><Program t={t} /></div>
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash, mixBlendMode: 'screen'}} />
      {audio === 'music' && <Audio src={staticFile('audio/mashup/trecho.wav')} />}
    </AbsoluteFill>
  );
  const c = camAt(t), c0 = camAt(t - 1 / 60), vel = Math.hypot((c.x - c0.x) * c.z, (c.y - c0.y) * c.z) + Math.abs(Math.log(c.z / c0.z)) * 900;
  const cur = cursorAt(t), dr = DRAGS.find(([a, z]) => t >= a && t <= z);
  const scrub = t >= 43.7 && t <= 44.55;
  const play = scrub ? ((cur.x - tx(0)) / (tx(60.1) - tx(0))) * 60.1 : t;
  const st: EdState = {play, cursor: cur, drag: dr ? {kind: dr[2], i: dr[3]} : undefined, roll: P(t, 10.75, 0.45, E.out) * (1 - P(t, 17.0, 0.35, E.in)), exportU: P(t, 55.28, 0.35, E.out), keycap: P(t, 26.95, 0.2) * (1 - P(t, 27.6, 0.25)), scrub};
  const strobe = t > 21.3 && t < 22.08 ? (Math.floor((t - 21.3) / 0.067) % 2 ? 0.12 : 0) : 0;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Wallpaper t={t} />
      <div style={{position: 'absolute', inset: 0, perspective: 2200, perspectiveOrigin: '50% 50%'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: WIN.w, height: WIN.h, transformOrigin: `${c.x}px ${c.y}px`, transform: `translate(${(540 - c.x).toFixed(2)}px, ${(960 - c.y).toFixed(2)}px) rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg) scale(${c.z.toFixed(4)})`, filter: vel > 6 ? `blur(${Math.min(10, (vel - 6) * 0.12).toFixed(1)}px)` : undefined,
          boxShadow: '0 80px 200px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.06)', borderRadius: 22}}>
          <Editor t={t} s={st} />
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: strobe, pointerEvents: 'none'}} />
      {audio === 'music' && <Audio src={staticFile('audio/mashup/trecho.wav')} />}
    </AbsoluteFill>
  );
};
export {BIN, TR};
