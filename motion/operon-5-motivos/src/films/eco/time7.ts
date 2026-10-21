// Tempo do episódio "Seu melhor funcionário vai embora" (o checklist do B-17). Voz entra em VO s. Trilha: peça clássica que
// cresce até um golpe exatamente em "caiu" e silencia · peça calma sob o piloto e o checklist · jazz entra em "Sabe o que é
// um checklist hoje?" · corte em "Por enquanto" · acorde final de outra faixa de jazz com o logo.
import WORDS from './words7.json';

export const FPS = 60;
export const VO = 0.8;
export const DURATION = Math.round(65.9 * FPS);
export const WS = (WORDS as [string, number, number][]).map(([w, a]) => ({w: w.toLowerCase().replace(/[.,?]/g, ''), a: a + VO}));
export const w = (word: string, n = 1) => { let k = 0; for (const x of WS) if (x.w === word && ++k === n) return x.a; throw new Error('palavra ' + word); };
export const T = {
  seu: w('seu'), funcionario: w('funcionário'), pedir: w('pedir'), demissao: w('demissão'), dia: w('dia'), levar: w('levar'), parte: w('parte'), empresa: w('empresa'), junto: w('junto'), cabeca: w('cabeça'), dele: w('dele'),
  em: w('em'), n1935: w('1935'), boeing: w('boeing'), apresentou: w('apresentou'), avancado: w('avançado'), mundo: w('mundo'), voo: w('voo'), demonstracao: w('demonstração'), caiu: w('caiu'), segundos: w('segundos'), decolar: w('decolar'),
  piloto: w('piloto'), melhores: w('melhores'), pais: w('país'), problema: w('problema'), coisa: w('coisa'), lembrar: w('lembrar'), esqueceu: w('esqueceu'), trava: w('trava'),
  solucao: w('solução'), contratar: w('contratar'), cartao: w('cartão'), papel: w('papel'), checklist: w('checklist'),
  ele2: w('ele', 3), mesmo: w('mesmo'), virou: w('virou'), b17: w('b'), quase: w('quase'), mil: w('mil'), fabricados: w('fabricados'),
  sabe: w('sabe'), checklist2: w('checklist', 2), hoje: w('hoje'), exatamente: w('exatamente'), agente: w('agente'), trabalhar: w('trabalhar'),
  pega: w('pega'), jeito: w('jeito'), funcionario2: w('funcionário', 2), atende: w('atende'), vende: w('vende'), resolve: w('resolve'), escreve: w('escreve'), passo: w('passo'),
  isso: w('isso'), agente2: w('agente', 2), esquece: w('esquece'), falta: w('falta'), pede: w('pede'), demissao2: w('demissão', 2),
  conhecimento: w('conhecimento'), finalmente: w('finalmente'), fica: w('fica'), empresa3: w('empresa', 3),
  por: w('por'), so: w('só'), observa: w('observa'),
  jazz: 37.75, sting: 59.6,
};
