// OPERON · 5 motivos — hook gravado → o vídeo vira card → filme preto/branco/azul que alterna por trecho (padrão Marta),
// nanopartículas nos trechos escuros, Fluffy como guia em momentos pontuais e o anel dele virando o logo oficial no fim.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../../brand/tokens';
import {useFonts} from '../../lib/fonts';
import {E, P, clamp, lerp} from '../../lib/core';
import {makeCam} from '../../lib/cam';
import {KF, ParticleField} from '../../lib/particles';
import {Hook} from './Hook';
import {Assina, Fecha, M1, M2, M3, M4, M5} from './Scenes';
import {HOOK_OUT, LEAD_IN, N} from './story';

type Bg = 'B' | 'W' | 'C';
type Seg = {t: number; c: Bg; tr: 'cut' | 'circle' | 'ramp' | 'wipe'; o?: [number, number]; id: string};
// cada trecho começa antes do número falado, para a transição assentar antes da voz (nada de "some → aparece")
const SEGS: Seg[] = [
  {t: HOOK_OUT, c: 'B', tr: 'cut', id: 'm1'},
  {t: N.m2 - LEAD_IN, c: 'W', tr: 'circle', o: [540, 1000], id: 'm2'},
  {t: N.m3 - LEAD_IN, c: 'B', tr: 'circle', o: [540, 1020], id: 'm3'},
  {t: N.m4 - LEAD_IN, c: 'C', tr: 'wipe', id: 'm4'},
  {t: N.m5 - LEAD_IN, c: 'B', tr: 'circle', o: [540, 880], id: 'm5'},
  {t: N.fecha - LEAD_IN, c: 'W', tr: 'wipe', id: 'fecha'},
  {t: N.assina - 0.95, c: 'B', tr: 'ramp', id: 'assina'},
];
const TRD = {cut: 0.001, circle: 0.62, ramp: 0.75, wipe: 0.6};
const BGC: Record<Bg, string> = {B: COLORS.ink, W: COLORS.paper, C: COLORS.blue};
const segStyle = (s: Seg, t: number): React.CSSProperties => {
  if (s.tr === 'circle') { const u = P(t, s.t, TRD.circle, E.out); return u >= 0.999 ? {} : {clipPath: `circle(${(u * 2300).toFixed(1)}px at ${s.o![0]}px ${s.o![1]}px)`}; }
  if (s.tr === 'ramp') return {opacity: P(t, s.t, TRD.ramp, E.io)};
  if (s.tr === 'wipe') { const u = P(t, s.t, TRD.wipe, E.out); return u >= 0.999 ? {} : {clipPath: `inset(${((1 - u) * 100).toFixed(2)}% 0 0 0 round ${(1 - u) * 90}px ${(1 - u) * 90}px 0 0)`}; }
  return {};
};

// ---------- nanopartículas: o card do hook vira poeira, a poeira desenha o NÚMERO de cada motivo e depois a forma da cena ----------
const NUM_HOLD = 0.85;   // quanto o numeral de partículas fica legível antes de virar a forma de fundo
const beat = (n: number, num: string, after: string, extra: Partial<KF> = {}, trNum = 0.95): KF[] => [
  {t: n + 0.1, shape: `text:${num}`, cx: 0, cy: -120, w: 700, h: 700, spread: 260, tr: trNum},
  {t: n + 0.1 + NUM_HOLD + 1.1, shape: after, cx: 0, cy: 110, w: 1150, spread: 320, tr: 1.1, ...extra},
];
const KFS: KF[] = [
  {t: HOOK_OUT + 0.75, shape: 'ruido', cx: 0, cy: -60, w: 454, h: 806, spread: 120, tr: 0},
  ...beat(N.m1, '1', 'ring', {}, 0.6),   // o card do hook só vira poeira depois de sumir
  ...beat(N.m2, '2', 'orbita', {w: 1000}),
  ...beat(N.m3, '3', 'rede', {w: 1250}),
  ...beat(N.m4, '4', 'blocos', {w: 900}),
  ...beat(N.m5, '5', 'orbital', {w: 1300}),
  {t: N.fecha + 1.2, shape: 'camadas', cx: 0, cy: 120, w: 900, spread: 320, tr: 1.2},
  {t: N.assina + 0.5, shape: 'ruido', cx: 0, cy: -80, w: 2600, h: 3000, spread: 700, tr: 1.2},
];
const ANG: [number, number, number][] = [[-30, 14, -5], [28, -12, 6], [-26, 16, 4], [30, 8, -6]];
const camSpline = makeCam((() => {
  const keys: {t: number; x: number; y: number; z: number; rx: number; ry: number; rz: number}[] = [{t: HOOK_OUT, x: 0, y: 0, z: 1, rx: 0, ry: 0, rz: 0}];
  KFS.slice(1).forEach((k, i) => {
    const [yaw, pitch, roll] = ANG[i % ANG.length];
    const flat = k.shape.startsWith('text:') || k.shape === 'ring';   // número chega de frente, legível
    keys.push({t: k.t - (k.tr ?? 1) * 0.35, x: k.cx * 0.3, y: k.cy * 0.3, z: 0.92, rx: pitch * (flat ? 0.6 : 1), ry: yaw * (flat ? 0.6 : 1), rz: roll});
    keys.push({t: k.t + 0.55, x: k.cx * 0.6, y: k.cy * 0.55, z: flat ? 1.0 : 1.06, rx: pitch * (flat ? 0.04 : 0.3), ry: yaw * (flat ? 0.04 : 0.28), rz: roll * 0.15});
  });
  keys.sort((a, b) => a.t - b.t);
  return keys.filter((k, i) => i === 0 || k.t > keys[i - 1].t + 0.25);
})());
const camAt = (t: number) => { const c = camSpline(t); return {yaw: c.ry + Math.sin(t * 0.31) * 3, pitch: c.rx + Math.sin(t * 0.23) * 2, roll: c.rz, zoom: c.z, x: c.x, y: c.y}; };
// forte no card que se desfaz e nos numerais; sutil atrás de cards e texto (legibilidade em tela pequena)
const BEATS = [N.m1, N.m2, N.m3, N.m4, N.m5];
const partOpacity = (t: number, c: Bg) => {
  if (t < N.m1 - 0.2) return 1;
  const near = Math.max(...BEATS.map((n) => (t > n - 0.9 && t < n + NUM_HOLD + 0.9 ? Math.min(P(t, n - 0.9, 0.5), 1 - P(t, n + NUM_HOLD + 0.2, 0.7)) : 0)));
  const base = t >= N.assina - 0.95 ? 0.4 : c === 'B' ? 0.3 : c === 'C' ? 0.22 : 0.16;
  return lerp(base, c === 'W' ? 0.9 : 1, near);
};
const FIELD: Record<Bg, {color: [number, number, number]; accent: [number, number, number]; accent2: [number, number, number]; blend: 'lighter' | 'source-over'}> = {
  B: {color: [246, 244, 236], accent: [143, 162, 255], accent2: [95, 224, 234], blend: 'lighter'},
  C: {color: [255, 255, 255], accent: [210, 220, 255], accent2: [150, 240, 255], blend: 'lighter'},
  W: {color: [24, 26, 34], accent: [61, 90, 254], accent2: [61, 90, 254], blend: 'source-over'},
};

/** Câmera de cada trecho: entra vindo do fundo, respira, e no fim avança para dentro da tela (zoom através da transição). */
const segCam = (s: Seg, next: Seg | undefined, t: number, i: number) => {
  const enter = s.tr === 'cut' ? P(t, s.t + 0.6, 1.4, E.out) : P(t, s.t, 1.3, E.out), exit = next ? P(t, next.t - 0.05, 0.75, E.in) : 0, dir = i % 2 ? 1 : -1;
  const z = lerp(-340, 0, enter) + exit * 460, ry = lerp(10 * dir, 0, enter) + Math.sin(t * 0.37 + i) * 2.2, rx = lerp(7, 0, enter) + Math.cos(t * 0.29 + i) * 1.4;
  return {transform: `translateZ(${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`, exit};
};

const SCENES: Record<string, React.FC<{t: number}>> = {m1: M1, m2: M2, m3: M3, m4: M4, m5: M5, fecha: Fecha, assina: Assina};

export const CincoMotivos: React.FC<{audio: 'none' | 'voice' | 'mix'}> = ({audio}) => {
  useFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cam = camAt(t);
  const live = SEGS.map((s, i) => ({s, i})).filter(({s, i}) => { const nx = SEGS[i + 1]; return t >= s.t && (!nx || t < nx.t + TRD[nx.tr] + 0.05); });
  const tilt = (dark: boolean) => dark ? `rotateZ(${cam.roll * 0.15}deg) rotateY(${cam.yaw * 0.18}deg) rotateX(${-cam.pitch * 0.15}deg)` : `rotateY(${Math.sin(t * 0.5) * 2}deg) rotateX(${Math.cos(t * 0.4) * 1.5}deg)`;
  return (
    <AbsoluteFill style={{background: COLORS.ink, overflow: 'hidden'}}>
      {live.map(({s, i}) => {
        const st = segStyle(s, t), Scene = SCENES[s.id], sc = segCam(s, SEGS[i + 1], t, i);
        return (
          <React.Fragment key={s.id}>
            <div style={{position: 'absolute', inset: 0, zIndex: 10 + i * 3, background: BGC[s.c], ...st}}>
              {s.c === 'B' && <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 50% at ${50 + Math.sin(t * 0.2) * 8}% 45%, #1b1b1f 0%, ${COLORS.ink} 70%)`}} />}
              {s.c === 'C' && <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 30%, #5a73ff 0%, #3d5afe 55%, #2c45e0 100%)'}} />}
            </div>
            <div style={{position: 'absolute', inset: 0, zIndex: 11 + i * 3, ...st}}><ParticleField t={t} kfs={KFS} cam={cam} images={[]} {...FIELD[s.c]} opacity={partOpacity(t, s.c)} /></div>
            <div style={{position: 'absolute', inset: 0, zIndex: 12 + i * 3, ...st, ...(sc.exit > 0.01 ? {filter: `blur(${(sc.exit * 9).toFixed(1)}px)`, opacity: 1 - sc.exit * 0.35} : {})}}>
              <div style={{position: 'absolute', inset: 0, perspective: 1600, perspectiveOrigin: '50% 50%'}}>
                <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transformOrigin: '540px 1000px', transform: `${sc.transform} ${tilt(s.c === 'B')}`}}>
                  <Scene t={t} />
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <Hook t={t} />
      {audio === 'voice' && <Audio src={staticFile('audio/voz.wav')} />}
      {audio === 'mix' && <Audio src={staticFile('audio/mix-final.wav')} />}
    </AbsoluteFill>
  );
};
export {clamp, lerp};
