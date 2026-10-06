// Ponte Remotion ↔ rig SVG do Fluffy (operon-mascot.js é a fonte única, também usada no brand kit).
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import './operon-mascot.js';

export type MascotPose = Record<string, unknown>;
type API = {render: (p: MascotPose, id: string) => string; mix: (a: MascotPose, b: MascotPose, u: number) => MascotPose; mouthFromLevel: (v: number) => number; blinkAt: (t: number, seed?: number) => number; talkAt: (t: number) => number; anim: Record<string, (t: number, ...a: (number | string)[]) => MascotPose>};
export const OM = (globalThis as unknown as {OperonMascot: API}).OperonMascot;

/** Personagem com o chão em (x, y); s = 1 → ~1000 px de altura. */
export const Mascot: React.FC<{pose: MascotPose; x: number; y: number; s: number; id: string; flip?: boolean; opacity?: number}> = ({pose, x, y, s, id, flip, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={opacity} dangerouslySetInnerHTML={{__html: OM.render(pose, id)}} />
);

/** Lip-sync: abertura da boca (0–1) pelo volume da locução no quadro atual. `src` = staticFile(...) da voz isolada. */
export const useMouthOpen = (src: string, gain = 3.2, offsetFrames = 0): number => {
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), audio = useAudioData(src);
  if (!audio) return 0;
  const bins = visualizeAudio({fps, frame: Math.max(0, frame + offsetFrames), audioData: audio, numberOfSamples: 32, optimizeFor: 'speed'});
  const voice = bins.slice(1, 12).reduce((a, b) => a + b, 0) / 11;   // faixa da voz
  return OM.mouthFromLevel(voice * gain);
};
