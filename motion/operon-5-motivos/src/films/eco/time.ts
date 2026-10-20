// Tempo do filme "Ecossistema" (intro da série). Voz começa em VO s; música começa em 0 (sem deslocamento).
// O silêncio da trilha (22,0–24,3 s) cai em "como partes separadas se tornam algo vivo" e a volta em "Uma floresta".
import WORDS from './words.json';
import BEATS from './beats.json';

export const FPS = 60, W = 1080, H = 1920;
export const VO = 3.34;
export const DURATION_S = 66.5;
export const DURATION = Math.round(DURATION_S * FPS);
export const BEAT: number[] = (BEATS as {beats: number[]}).beats;

const WS = (WORDS as [string, number, number][]).map(([w, a, b]) => ({w: w.toLowerCase().replace(/[.,]/g, ''), a: a + VO, b: b + VO}));
/** instante (s, no filme) da n-ésima ocorrência da palavra */
export const w = (word: string, n = 1) => { let k = 0; for (const x of WS) if (x.w === word && ++k === n) return x.a; throw new Error('palavra ' + word); };

export const T = {
  hit0: 0.69,                                   // primeira pancada da trilha
  tudo: w('tudo'), pergunta: w('pergunta'),
  davinci: w('da'), corpo: w('corpo'), entender: w('entender'), vivo: w('vivo'), funciona: w('funciona'),
  newton: w('newton'), leis: w('leis'),
  fisica: w('física'), medir: w('medir'), muda: w('muda'), resultado: w('resultado'),
  desde: w('desde'), mesma: w('mesma'),
  como: w('como', 2), partes: w('partes'), separadas: w('separadas'), algo: w('algo', 2), vivo2: w('vivo', 2),
  silence: 22.0, back: 24.38,                   // silêncio da trilha e a volta
  floresta: w('floresta'), raizes: w('raízes'),
  cerebro: w('cérebro'), bilhoes: w('bilhões'), conexoes: 28.72,
  bando: w('bando'), passaros: w('pássaros'), comoum: w('como', 3), sem: w('sem'), ordens: w('ordens'),
  nada: w('nada'), maquina: w('máquina'),
  eco: w('ecossistema') - 0.34, ecossistema: w('ecossistema'),
  agora: w('agora'), empresas: w('empresas'),
  ferramentas: w('ferramentas'), soltas: w('soltas'), dados: w('dados'), parados: w('parados'),
  pessoas: w('pessoas'), costas: w('costas'), pecas: w('peças'), nao: w('não'), vida: w('vida'),
  eu: w('eu'), acredito: w('acredito'), natureza: w('natureza'),
  sentindo: w('sentindo'), aprendendo: w('aprendendo'), movendo: w('movendo'), inteira: w('inteira'),
  naoe: w('não', 2), tecnologia: w('tecnologia'),
  sobre2: w('sobre', 2), dar: w('dar'), vida2: w('vida', 2), ela: w('ela'),
  isso: w('isso'), comeco: w('começo'),
  por: w('por'), so: w('só', 3), observa: w('observa'),
  cut: 59.466,                                  // a trilha corta (silêncio antes de "só observa")
  sting: 61.55,                                 // pancada final
};

/** batida mais próxima de t; e índice */
export const beatAt = (t: number) => { let i = 0; while (i < BEAT.length - 1 && BEAT[i + 1] <= t) i++; return i; };
/** pulso que decai a cada batida (0..1), só onde a trilha está tocando forte */
export const pulse = (t: number, tau = 0.11) => {
  if (t < T.hit0 || (t > T.silence && t < T.back) || (t > T.cut && t < T.sting)) return 0;
  const i = beatAt(t), s = t - BEAT[i]; return s >= 0 ? Math.exp(-s / tau) : 0;
};
