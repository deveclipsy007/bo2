// O avatar do Yohann (pixel art com contorno de adesivo) no canto inferior esquerdo: aparece em janelas curtas, fala com a
// boca guiada pelo volume real da voz e, em palavras-chave, troca para um gesto (apontar, mão aberta, joinha, braços
// cruzados, notebook). Os quadros saem de tools/avatar_sprites.py; o envelope da voz, de tools/voice_env.py.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {E, P, clamp, lerp} from '../../lib/core';

/** gestos da folha de poses (public/eco/avatar/pose*.png) */
export const POSE = {neutro: 0, maoAberta: 1, aponta: 2, bracosCruzados: 3, notebook: 4, joinha: 5} as const;
export type Gesture = {at: number; d: number; pose: number; flip?: boolean};
export type Window = {a: number; b: number};

const sprite = (n: string) => staticFile(`eco/avatar/${n}.png`);
const TALK = [0, 1, 2, 3, 4, 5].map((i) => sprite(`talk${i}`));
const POSES = [0, 1, 2, 3, 4, 5].map((i) => sprite(`pose${i}`));
const hash = (a: number) => { const x = Math.sin(a * 91.7) * 43758.5453; return x - Math.floor(x); };

/** boca: 0 fechada · 5 entreaberta · 1 aberta · 3 dentes · 2 bem aberta · 4 "ó" (variação) */
const mouth = (lv: number, q: number) => (lv <= 1 ? 0 : lv <= 3 ? 5 : lv <= 5 ? (hash(q) > 0.72 ? 4 : 1) : lv <= 7 ? 3 : 2);

export const Avatar: React.FC<{t: number; env: string; windows: Window[]; gestures?: Gesture[]; x?: number; base?: number; size?: number; outline?: 'dark' | 'light'}> = ({t, env, windows, gestures = [], x = 18, base = 1600, size = 380, outline = 'dark'}) => {
  const w = windows.find((k) => t >= k.a - 0.01 && t <= k.b + 0.45);
  if (!w) return null;
  const inU = P(t, w.a, 0.42, E.settle), outU = P(t, w.b, 0.38, E.in);
  const frame = Math.round(t * 60), q = Math.floor(frame / 4) * 4;                      // a boca troca a 15 qps, ritmo de pixel art
  const lv = +(env[q] ?? '0'), g = gestures.find((k) => t >= k.at && t < k.at + k.d);
  const src = g ? POSES[g.pose] : TALK[mouth(lv, q)];
  const pop = g ? 1 + 0.05 * Math.exp(-(t - g.at) / 0.06) : 1;                       // a troca de gesto dá um "estalo"
  const bob = Math.round(Math.sin(t * 2.3) * 2.5) - (lv >= 6 && !g ? 2 : 0);          // respiração em passos de pixel
  const y = base - size + lerp(size * 0.95, 0, inU) + lerp(0, size, outU) + bob;
  const rot = lerp(-6, 0, clamp(inU)) + lerp(0, 4, outU);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: size, height: size, transformOrigin: '50% 100%', transform: `rotate(${rot.toFixed(2)}deg) scale(${pop.toFixed(3)})`, opacity: clamp(inU * 3) * (1 - outU * 0.6), filter: outline === 'dark' ? 'drop-shadow(0 14px 26px rgba(0,0,0,.55))' : 'drop-shadow(0 12px 22px rgba(40,30,20,.28))'}}>
      {/* todos os quadros montados (carregam antes), só um visível */}
      {[...TALK, ...POSES].map((s) => <Img key={s} src={s} style={{position: 'absolute', inset: 0, width: size, height: size, visibility: s === src ? 'visible' : 'hidden', transform: g?.flip && s === src ? 'scaleX(-1)' : undefined}} />)}
    </div>
  );
};

/** quanto do vídeo o avatar ocupa (para manter na faixa de 30–40%) */
export const avatarShare = (windows: Window[], dur: number) => windows.reduce((s, w) => s + (w.b - w.a), 0) / dur;
