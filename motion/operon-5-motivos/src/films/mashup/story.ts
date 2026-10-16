// MASHUP · Tudo de Novo × Royalty — 1080×1920, 60 fps, 60 s (trecho 29,4–89,5 s da faixa).
// Tudo ancorado na GRADE DE BATIDAS (beats.json): cortes, punches e textos caem em batidas e compassos, não em segundos soltos.
import BEATS from './beats.json';
import SHOTS from './shots.json';

export const FPS = 60, W = 1080, H = 1920;
export const END = 60.1;
export const DURATION = Math.round(END * FPS);
export const B: number[] = BEATS.beats;
export const b = (i: number) => B[Math.max(0, Math.min(B.length - 1, i))];
export const DROP = b(42), BREATH = b(83), REHIT = b(85), FINALE = b(107);
export const RISE = b(34);   // grave some de vez: a tensão sobe
export const LYRIC = {tudo1: 0.5, novo1: 1.24, tudo2: 2.72, novo2: 3.4, tudo3: 37.5};

export type Mode = 'card' | 'full' | 'strobe' | 'trip' | 'grid' | 'split';
export type Clip = {id: string; t0: number; t1: number; mode: Mode; slot?: number; dir?: number};
type Shot = {id: string; src: string; a: number; b: number; len?: number; slow?: number};
export const SHOT: Record<string, Shot> = Object.fromEntries((SHOTS as Shot[]).map((s) => [s.id, s]));

const run = (ids: string[], i0: number, step: number, mode: Mode, extra: Partial<Clip> = {}): Clip[] => ids.map((id, k) => ({id, t0: b(i0 + k * step), t1: b(i0 + (k + 1) * step), mode, dir: k % 2 ? 1 : -1, ...extra}));

export const EDL: Clip[] = [
  // A · pausa (grave ausente): cards 3D flutuando, um por compasso, câmera lenta
  ...run(['v1_00', 'v1_07', 'v2_16', 'v1_05', 'v2_09', 'v2_13', 'v2_04', 'v1_10'], 2, 4, 'card'),
  // B · subida: cortes aceleram (batida → meia batida → estroboscópio), card cresce
  ...run(['v2_06', 'v2_00', 'v1_03', 'v2_01'], 34, 1, 'card'),
  ...['v2_12', 'v2_14', 'v2_05', 'v1_06'].map((id, k) => ({id, t0: b(38) + k * (b(40) - b(38)) / 4, t1: b(38) + (k + 1) * (b(40) - b(38)) / 4, mode: 'card' as Mode})),
  ...['v2_15', 'v1_04', 'v2_02', 'v2_17', 'v1_11', 'v2_08'].map((id, k) => ({id, t0: b(40) + k * 0.13, t1: b(40) + (k + 1) * 0.13, mode: 'strobe' as Mode})),
  // C · DROP: tela cheia, corte a cada 2 batidas, punch-in + whip
  ...run(['v2_15', 'v1_04', 'v2_02', 'v2_03', 'v1_02', 'v2_17', 'v1_06', 'v2_08'], 42, 2, 'full'),
  ...['v2_12', 'v2_14', 'v2_05'].map((id, k) => ({id, t0: b(58 + k * 2), t1: b(62), mode: 'trip' as Mode, slot: k})),
  ...['v1_03', 'v2_01', 'v2_18'].map((id, k) => ({id, t0: b(62 + k), t1: b(66), mode: 'trip' as Mode, slot: k})),
  ...['v2_10', 'v1_09', 'v2_07', 'v1_08', 'v2_11', 'v1_01', 'v2_13', 'v1_11', 'v2_16'].map((id, k) => ({id, t0: b(66) + k * 0.11, t1: b(70), mode: 'grid' as Mode, slot: k})),
  ...run(['v2_11', 'v1_09', 'v2_07', 'v1_08', 'v1_01', 'v2_04'], 70, 2, 'full'),
  {id: 'v1_11', t0: b(82), t1: b(85), mode: 'full'},
  // E · volta mais forte: corte a cada batida, depois a cada 2, split e o último plano em câmera lenta
  ...run(['v2_15', 'v1_04', 'v2_00', 'v2_06', 'v1_03', 'v2_14', 'v2_02', 'v2_17'], 85, 1, 'full'),
  ...run(['v1_02', 'v2_18', 'v1_06', 'v2_08'], 93, 2, 'full'),
  ...['v2_12', 'v2_01'].map((id, k) => ({id, t0: b(101), t1: b(103), mode: 'split' as Mode, slot: k})),
  ...['v2_05', 'v2_14'].map((id, k) => ({id, t0: b(103), t1: b(105), mode: 'split' as Mode, slot: k})),
  {id: 'v2_16', t0: b(105), t1: b(107), mode: 'full'},
  {id: 'v1_00', t0: b(107), t1: END, mode: 'card'},
];

// palavras que batem nos compassos (a letra cantada manda onde houver)
export const WORDS: {w: string; at: number; out: number; style: 'slam' | 'serif' | 'label'}[] = [
  {w: 'ROYALTY', at: DROP, out: b(46) - 0.1, style: 'slam'},
  {w: 'VISÃO', at: b(50), out: b(54) - 0.1, style: 'slam'},
  {w: 'FOCO', at: b(58), out: b(62) - 0.1, style: 'label'},
  {w: 'NÍVEL', at: b(62), out: b(66) - 0.1, style: 'label'},
  {w: 'TUDO DE NOVO', at: b(70), out: b(76) - 0.1, style: 'serif'},
  {w: 'DISCIPLINA', at: REHIT, out: b(89) - 0.1, style: 'slam'},
  {w: 'LIBERDADE', at: b(93), out: b(97) - 0.1, style: 'slam'},
  {w: 'SEM LIMITE', at: b(101), out: b(105) - 0.1, style: 'label'},
];
