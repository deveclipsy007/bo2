// Tempo do episódio "O lugar errado" (Goldratt e o gargalo). Voz entra em VO s. Trilha: clássica sombria na abertura;
// jazz a 161 bpm entra logo depois de "miragem", some antes de "Só nele" e volta inteiro em "destrava" (o respiro da
// própria faixa) · corte em "Por enquanto" · o acorde final de outra faixa de jazz com o logo.
import WORDS from './words6.json';

export const FPS = 60;
export const VO = 2.0;
export const DURATION = Math.round(74.2 * FPS);
export const WS = (WORDS as [string, number, number][]).map(([w, a]) => ({w: w.toLowerCase().replace(/[.,?]/g, ''), a: a + VO}));
export const w = (word: string, n = 1) => { let k = 0; for (const x of WS) if (x.w === word && ++k === n) return x.a; throw new Error('palavra ' + word); };
export const T = {
  maioria: w('maioria'), usando: w('usando'), lugar: w('lugar'), errado: w('errado'), fisico: w('físico'), explicou: w('explicou'), n1984: w('1984'),
  eliyahu: w('eliyahu'), goldratt: w('goldratt'), escreveu: w('escreveu'), hora: w('hora'), ganha: w('ganha'), fora: w('fora'), gargalo: w('gargalo'), miragem: w('miragem'),
  pensa: w('pensa'), fabrica: w('fábrica'), dez: w('dez'), rapidas: w('rápidas'), lenta: w('lenta'), acelerar: w('acelerar'), dez2: w('dez', 2), quiser: w('quiser'),
  fabrica2: w('fábrica', 2), continua: w('continua'), ritmo: w('ritmo'), lenta2: w('lenta', 2),
  empresa: w('empresa'), igual: w('igual'), fosse: w('fosse'), hoje: w('hoje'), nao: w('não'), perguntando: w('perguntando'), onde: w('onde'), ia: w('ea'),
  perguntaria: w('perguntaria'), onde2: w('onde', 2), coisas: w('coisas'), param: w('param'),
  cliente: w('cliente'), ninguem: w('ninguém'), gargalo2: w('gargalo', 2), ali1: w('ali'),
  proposta: w('proposta'), tres: w('três'), sair: w('sair'), ali2: w('ali', 2),
  cliente2: w('cliente', 2), some: w('some'), compra: w('compra'), ali3: w('ali', 3),
  meu: w('meu'), agente: w('agente'), exatamente: w('exatamente'), ponto: w('ponto'), so: w('só'), nele: w('nele'),
  quando: w('quando'), destrava: w('destrava'), gargalo3: w('gargalo', 3), muda: w('muda'), sempre: w('sempre'),
  segundo: w('segundo'), terceiro: w('terceiro'), ecossistema: w('ecossistema'), nasce: w('nasce'), naoUma: w('não', 2), seguindo: w('seguindo'), gargalo4: w('gargalo', 4),
  fazer: w('fazer'), post: w('post'), rapido: w('rápido'), problema: w('problema'), venda: w('venda'), acelera: w('acelera'), miragem2: w('miragem', 2),
  entao: w('então'), ferramenta: w('ferramenta'), responde: w('responde'), pergunta: w('pergunta'), onde3: w('onde', 3), empresa2: w('empresa', 2), espera: w('espera'),
  por: w('por', 2), so2: w('só', 2), observa: w('observa'),
  jazz: 14.65, drop: 46.24, sting: 67.9,
};
