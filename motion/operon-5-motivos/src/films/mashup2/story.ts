// MASHUP v2 · Tudo de Novo × Royalty — 1080×1920, 60 fps, 60,1 s. A LETRA conduz: cada frase vira uma ideia visual.
// Tempos das palavras: voz isolada (RoFormer) + whisper; grade de batidas: beats.json. Trechos de letra incertos ficam sem texto.
import BEATS from '../mashup/beats.json';
export const FPS = 60, W = 1080, H = 1920, END = 60.1, DURATION = Math.round(END * FPS);
export const B: number[] = BEATS.beats;
export const b = (i: number) => B[Math.max(0, Math.min(B.length - 1, i))];
export const DROP = b(42), BREATH = b(83), REHIT = b(85);

export type LW = [string, number];       // palavra, instante cantado (s)
export const LY = {
  volta1: [['E', 0.0], ['volta', 0.24], ['tudo', 0.5], ['de', 0.88], ['novo', 1.24]] as LW[],
  vivo: [['Vivo', 2.32], ['tudo', 2.7], ['de', 3.04], ['novo', 3.36]] as LW[],
  lado: [['Te', 4.4], ['encontro', 4.5], ['do', 4.8], ['outro', 4.98], ['lado', 5.28]] as LW[],
  lua1: [['Desculpa', 6.22], ['a', 6.55], ['lua', 6.62], ['ser', 6.88], ['tão', 7.32], ['só', 7.74]] as LW[],
  fase1: [['E', 8.64], ['por', 8.82], ['viver', 8.96], ['de', 9.26], ['fase', 9.58]] as LW[],
  lua2: [['Desculpa', 14.78], ['a', 15.0], ['lua', 15.16], ['ser', 15.48], ['tão', 15.9], ['só', 16.32]] as LW[],
  fase2: [['E', 17.14], ['por', 17.32], ['viver', 17.5], ['de', 17.84], ['fase', 18.2]] as LW[],
  drop: [['Volta', 22.32], ['tudo', 22.78], ['de', 23.12], ['novo', 23.48]] as LW[],
  rep1: [['Tudo', 26.13], ['de', 26.43], ['novo', 26.81]] as LW[],
  rep2: [['Tudo', 27.37], ['de', 27.63], ['novo', 27.97]] as LW[],
  follow: [["You've", 31.97], ['been', 32.25], ['following', 32.51], ['me', 32.71], ['all', 33.15], ['the', 33.45], ['way', 33.7]] as LW[],
  tudo3: [['Tudo', 37.66], ['de', 37.94], ['novo', 38.24]] as LW[],
  bolso: [['Eu', 50.07], ['saí', 50.65], ['da', 51.11], ['área', 51.31], ['pra', 51.61], ['encher', 51.85], ['meu', 52.19], ['bolso', 52.41]] as LW[],
  bro: [['Eu', 53.69], ['tô', 53.97], ['com', 54.11], ['meu', 54.33], ['bro', 54.47]] as LW[],
  muro: [['o', 55.85], ['nome', 55.95], ['no', 56.19], ['muro', 56.41]] as LW[],
  meu: [['mas', 56.77], ['não', 57.01], ['vi', 57.21], ['o', 57.35], ['meu', 57.59]] as LW[],
};
// cenas (s): cada uma começa na batida/palavra que a motiva
export const SC = {
  phone: [0, 6.1], lua: [6.1, 8.5], fase: [8.5, 10.62], daw: [10.62, 17.0], kin: [17.0, b(38)], ring: [b(38), DROP - 0.28],
  drop: [DROP, b(46)], royalty: [b(46), b(48)], heli: [b(48), 26.05], loop: [26.05, b(54)], cuts: [b(54), 31.9], road: [31.9, 37.3],
  suit: [37.3, b(78)], grid: [b(78), BREATH], breath: [BREATH, REHIT], rehit: [REHIT, 50.0], bolso: [50.0, 53.55], bro: [53.55, 55.1], muro: [55.1, 57.85], end: [57.85, END],
};
