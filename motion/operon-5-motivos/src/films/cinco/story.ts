// OPERON · 5 motivos — 1080×1920, 60 fps. Hook gravado + 7 notas de voz (ordem pelo conteúdo, analisada por transcrição).
// Roteiro como dado: cenas ancoradas em PALAVRAS da locução (T/sync), não em segundos. Trocar a locução = regenerar data.ts.
import {CLIPS, END as VOICE_FILM_END, WORDS} from './data.ts';

export const FPS = 60;
export const W = 1080, H = 1920;
export const HOOK_OUT = 5.3;                // o vídeo vira card no espaço
export const END = VOICE_FILM_END;
export const DURATION = Math.round(END * FPS);
export {CLIPS};

const DIGITS: Record<string, string> = {'1': 'um', '2': 'dois', '3': 'tres', '4': 'quatro', '5': 'cinco'};
const norm = (w: string) => { const n = w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, ''); return DIGITS[n] ?? n; };

/** Instante (s) de cada palavra da frase, a partir de `from` — com `lead` de antecipação (padrão do kit: 0,05 s). */
export const sync = (phrase: string, from: number, lead = 0.05): number[] => {
  const want = phrase.split(/\s+/).filter(Boolean);
  let j = WORDS.findIndex(([, t]) => t >= from - 0.05);
  if (j < 0) j = WORDS.length;
  let last = from;
  return want.map((w) => {
    const k = WORDS.slice(j, j + 9).findIndex(([x]) => norm(x) === norm(w));
    if (k >= 0) { last = WORDS[j + k][1]; j = j + k + 1; } else last += 0.12;
    return Math.max(0, last - lead);
  });
};
/** n-ésima ocorrência (0 = primeira) da palavra no master. */
export const T = (word: string, nth = 0): number => {
  const hits = WORDS.filter(([w]) => norm(w) === norm(word));
  return hits[Math.min(nth, hits.length - 1)]?.[1] ?? 0;
};
export const at = (word: string, from: number) => sync(word, from)[0];

export type Cap = {w: string; at: number; k?: 'g' | 'y' | 'em'};
const cap = (phrase: string, from: number, keys: Record<string, 'g' | 'y' | 'em'> = {}): Cap[] => { const ws = phrase.split(' '); const ts = sync(phrase, from, 0.03); return ws.map((w, i) => ({w, at: ts[i], k: keys[w]})); };

// ---- hook (5,4 s) ----
const H0 = T('Cinco');
export const CAPTIONS: Cap[][] = [
  cap('5 motivos para você', H0, {'5': 'y', motivos: 'y'}),
  cap('criar agora seu sistema', T('criar'), {sistema: 'g'}),
  cap('proprietário', T('proprietário'), {'proprietário': 'g'}),
  cap('inteligente.', T('inteligente.'), {'inteligente.': 'em'}),
];
export const BEHIND = [{w: '5 MOTIVOS', at: T('motivos')}, {w: 'SISTEMA', at: T('sistema')}, {w: 'INTELIGENTE', at: T('inteligente')}];

// ---- cascata de cenas: cada trecho começa 0,7 s antes do número falado, para a transição assentar antes da voz ----
export const LEAD_IN = 0.7;
export const N = {m1: CLIPS.m1.first, m2: CLIPS.m2.first, m3: CLIPS.m3.first, m4: CLIPS.m4.first, m5: CLIPS.m5.first, fecha: CLIPS.fecha.first, assina: CLIPS.assina.first};
export const LAST = {m1: CLIPS.m1.last, m2: CLIPS.m2.last, m3: CLIPS.m3.last, m4: CLIPS.m4.last, m5: CLIPS.m5.last, fecha: CLIPS.fecha.last, assina: CLIPS.assina.last};
