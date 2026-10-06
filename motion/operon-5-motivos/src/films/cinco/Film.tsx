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

// ---------- nanopartículas (trechos escuros): a forma de cada motivo, de fundo ----------
const KFS: KF[] = [
  {t: HOOK_OUT + 0.4, shape: 'ruido', cx: 0, cy: -60, w: 520, h: 900, spread: 120, tr: 0},
  {t: N.m1 + 0.4, shape: 'ring', cx: 0, cy: 100, w: 1100, spread: 300, tr: 1.2},
  {t: N.m3 - 0.4, shape: 'rede', cx: 0, cy: 120, w: 1250, spread: 320, tr: 1.0},
  {t: N.m5 - 0.4, shape: 'orbital', cx: 0, cy: 90, w: 1300, spread: 320, tr: 1.0},
  {t: N.assina + 0.5, shape: 'ruido', cx: 0, cy: -80, w: 2600, h: 3000, spread: 700, tr: 1.2},
];
const ANG: [number, number, number][] = [[-30, 14, -5], [28, -12, 6], [-26, 16, 4], [30, 8, -6]];
const camSpline = makeCam((() => {
  const keys: {t: number; x: number; y: number; z: number; rx: number; ry: number; rz: number}[] = [{t: HOOK_OUT, x: 0, y: 0, z: 1, rx: 0, ry: 0, rz: 0}];
  KFS.slice(1).forEach((k, i) => {
    const [yaw, pitch, roll] = ANG[i % ANG.length];
    keys.push({t: k.t - (k.tr ?? 1) * 0.35, x: k.cx * 0.3, y: k.cy * 0.3, z: 0.94, rx: pitch, ry: yaw, rz: roll});
    keys.push({t: k.t + 0.55, x: k.cx * 0.6, y: k.cy * 0.55, z: 1.06, rx: pitch * 0.3, ry: yaw * 0.28, rz: roll * 0.2});
  });
  keys.sort((a, b) => a.t - b.t);
  return keys.filter((k, i) => i === 0 || k.t > keys[i - 1].t + 0.25);
})());
const camAt = (t: number) => { const c = camSpline(t); return {yaw: c.ry + Math.sin(t * 0.31) * 3, pitch: c.rx + Math.sin(t * 0.23) * 2, roll: c.rz, zoom: c.z, x: c.x, y: c.y}; };
// o campo de partículas fica sutil atrás de cards e texto (legibilidade em tela pequena)
const partOpacity = (t: number) => (t < N.m3 - 0.8 ? 0.4 : t < N.m4 - LEAD_IN ? 0.26 : t < N.m5 - 0.8 ? 0.0 : t < N.fecha - LEAD_IN ? 0.42 : t < N.assina - 0.95 ? 0 : 0.4);

const SCENES: Record<string, React.FC<{t: number}>> = {m1: M1, m2: M2, m3: M3, m4: M4, m5: M5, fecha: Fecha, assina: Assina};

export const CincoMotivos: React.FC<{audio: 'none' | 'voice' | 'mix'}> = ({audio}) => {
  useFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cam = camAt(t);
  const live = SEGS.map((s, i) => ({s, i})).filter(({s, i}) => { const nx = SEGS[i + 1]; return t >= s.t && (!nx || t < nx.t + TRD[nx.tr] + 0.05); });
  let bi = -1; SEGS.forEach((s, i) => { if (s.c === 'B' && t >= s.t) bi = i; });
  const tilt = (dark: boolean) => dark ? `rotateZ(${cam.roll * 0.15}deg) rotateY(${cam.yaw * 0.18}deg) rotateX(${-cam.pitch * 0.15}deg)` : `rotateY(${Math.sin(t * 0.5) * 2}deg) rotateX(${Math.cos(t * 0.4) * 1.5}deg)`;
  return (
    <AbsoluteFill style={{background: COLORS.ink, overflow: 'hidden'}}>
      {live.map(({s, i}) => {
        const st = segStyle(s, t), Scene = SCENES[s.id];
        return (
          <React.Fragment key={s.id}>
            <div style={{position: 'absolute', inset: 0, zIndex: 10 + i * 3, background: BGC[s.c], ...st}}>
              {s.c === 'B' && <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 50% at ${50 + Math.sin(t * 0.2) * 8}% 45%, #1b1b1f 0%, ${COLORS.ink} 70%)`}} />}
              {s.c === 'C' && <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 30%, #5a73ff 0%, #3d5afe 55%, #2c45e0 100%)'}} />}
            </div>
            {s.c === 'B' && i === bi && <div style={{position: 'absolute', inset: 0, zIndex: 11 + i * 3, ...st}}><ParticleField t={t} kfs={KFS} cam={cam} images={[]} color={[246, 244, 236]} accent={[143, 162, 255]} accent2={[95, 224, 234]} opacity={partOpacity(t)} /></div>}
            <div style={{position: 'absolute', inset: 0, zIndex: 12 + i * 3, ...st}}>
              <div style={{position: 'absolute', inset: 0, perspective: 1600, perspectiveOrigin: '50% 50%'}}>
                <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transformOrigin: '540px 1000px', transform: tilt(s.c === 'B')}}>
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
