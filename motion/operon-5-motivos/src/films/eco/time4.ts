// Tempo do episódio "Turing e a Enigma". Voz entra em VO s. Trilha: 3 cortes da coletânea clássica
// (A 0–22,6 s · silêncio em "o que virou o jogo foi um detalhe humano" · B entra em "Eles perceberam" com o acorde final em
// "contexto" · corte em "Por enquanto" · acorde final de outra peça com o logo).
import WORDS from './words4.json';

export const FPS = 60;
export const VO = 2.4;
export const DURATION = Math.round(72.6 * FPS);
const WS = (WORDS as [string, number, number][]).map(([w, a]) => ({w: w.toLowerCase().replace(/[.,?]/g, ''), a: a + VO}));
export const w = (word: string, n = 1) => { let k = 0; for (const x of WS) if (x.w === word && ++k === n) return x.a; throw new Error('palavra ' + word); };
export const T = {
  na: w('na'), guerra: w('guerra'), maquina: w('máquina'), enigma: w('enigma'), todos: w('todos'), dias: w('dias'),
  eram: w('eram'), n158: w('158'), quint: w('quintilhões'), comb: w('combinações'),
  alan: w('alan'), turing: w('turing'), bletchley: w('bletchley'), construiram: w('construíram'), maq2: w('máquina', 2), testar: w('testar'),
  bombe: w('bombe'), mas: w('mas'), forca: w('força'), bastava: w('bastava'), nenhuma: w('nenhuma'), tempo: w('tempo'),
  musicOff: 22.6, oque: w('que', 1) - 0.14, jogo: w('jogo'), detalhe: w('detalhe'), humano: w('humano'),
  eles: w('eles'), mensagens: w('mensagens'), repetiam: w('repetiam'), previsao: w('previsão'), tempo2: w('tempo', 2), manha: w('manhã'), mesmas: w('mesmas'), palavras: w('palavras'),
  pista: w('pista'), testar2: w('testar', 2), so: w('só'), sentido: w('sentido'),
  maq5: w('máquina', 5), velocidade: w('velocidade'), pessoas: w('pessoas'), contexto: w('contexto'),
  agentes: w('agentes'), ia: w('inteligência'), igual: w('igual'),
  um: w('um', 2), sem: w('sem'), contexto2: w('contexto', 2), bombe2: w('bombe', 2), quint2: w('quintilhões', 2),
  rapido: w('rápido'), caro: w('caro'), perdido: w('perdido'),
  conhece: w('conhece'), negocio: w('negócio'), jeito: w('jeito'), vender: w('vender'), clientes: w('clientes'), regras: w('regras'),
  encontra: w('encontra'), resposta: w('resposta'), cafe: w('café'),
  diferencial: w('diferencial'), nunca: w('nunca'), maq6: w('máquina', 6), saber: w('saber'), dizer: w('dizer'), ela: w('ela'),
  por: w('por'), so2: w('só', 2), observa: w('observa'),
  sting: 65.7,
};
