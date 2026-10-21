// Tempo do episódio "Fazer sem pensar". Voz entra em VO s. Trilha: abertura lenta da coletânea clássica, cuja peça seguinte
// entra forte em "o comércio explodiu" · corte no vale antes de "Isso está acontecendo de novo" · jazz que respira e volta
// com o grupo inteiro no primeiro "Agentes." · silêncio em "Por enquanto" · o acorde final da mesma faixa com o logo.
import WORDS from './words5.json';

export const FPS = 60;
export const VO = 2.0;
export const DURATION = Math.round(86.8 * FPS);
export const WS = (WORDS as [string, number, number][]).map(([w, a]) => ({w: w.toLowerCase().replace(/[.,?]/g, ''), a: a + VO}));
export const w = (word: string, n = 1) => { let k = 0; for (const x of WS) if (x.w === word && ++k === n) return x.a; throw new Error('palavra ' + word); };
export const T = {
  idade: w('idade'), multiplicar: w('multiplicar'), especialista: w('especialista'), romanos: w('romanos'), simples: w('simples'), abaco: w('abaco'),
  alguem: w('alguém'), treinado: w('treinado'), usar: w('usar'),
  em: w('em'), n1202: w('1202'), fibonacci: w('fibonacci'), europa: w('europa'), alg2: w('algarismos', 2), hoje: w('hoje'),
  repente: w('repente'), qualquer: w('qualquer'), papel: w('papel'), sem: w('sem'), pensar: w('pensar'),
  comercio: w('comércio'), explodiu: w('explodiu'),
  seculos: w('séculos'), matematico: w('matemático'), alfred: w('alfred'), whitehead: w('whitehead'), escreveu: w('escreveu'),
  civ: w('civilização'), avanca: w('avança'), ampliar: w('ampliar'), operacoes: w('operações'), importantes: w('importantes'), sem2: w('sem', 2), nelas: w('nelas'),
  isso: w('isso'), novo: w('novo'), agora: w('agora'), conta3: w('conta', 3), automatica: w('automática'), empresa: w('empresa'), inteira: w('inteira'),
  quem1: w('quem'), pauta: w('pauta'), roteiro: w('roteiro'), grava: w('grava'), edita: w('edita'), publica: w('publica'), ag1: w('agentes'),
  quem2: w('quem', 2), cliente: w('cliente'), proposta: w('proposta'), acompanha: w('acompanha'), fechar: w('fechar'), ag2: w('agentes', 2),
  quem3: w('quem', 3), cobra: w('cobra'), concilia: w('concilia'), projeta: w('projeta'), caixa: w('caixa'), ag3: w('agentes', 3),
  atendimento: w('atendimento'), operacao: w('operação'), gestao: w('gestão'), cada: w('cada'), time: w('time'),
  nao: w('não', 2), agente: w('agente'), eco: w('ecossistema'),
  instagram: w('instagram'), vendido: w('vendido'), bilhao: w('bilhão'), n13: w('13'), pessoas: w('pessoas'), antes: w('antes'), ag4: w('agentes', 4),
  hoje2: w('hoje', 2), empresa3: w('empresa', 2), rodar: w('rodar'), fundadores: w('fundadores'), eco2: w('ecossistema', 2), eles: w('eles'),
  pergunta: w('pergunta'), quantas: w('quantas'), pessoas2: w('pessoas', 2), contratar: w('contratar'), quantas2: w('quantas', 2), decisoes: w('decisões'), so2: w('só', 2), tomar: w('tomar'),
  por: w('por', 3), so3: w('só', 3), observa: w('observa'),
  musicIn: 21.84, jazz: 33.68, drop: 44.3, sting: 80.5,
};
