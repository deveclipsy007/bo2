// Tempo do episódio "O conhecimento acabou". Voz entra em VO s. Trilha (mixagem guiada pela voz, tools/mix_episode.py):
// barroca crescendo no gancho e nas provas, para seca em "E não colou" (disco freando) · peça escura no "detalhe" ·
// jazz 161 bpm com o golpe em "conecta" · tensão no envelope · golpe em "primeiro" · acorde final no logo.
import WORDS from './words8.json';

export const FPS = 60;
export const VO = 0.5;
export const DURATION = Math.round(90.3 * FPS);
export const WS = (WORDS as [string, number, number][]).map(([w, a]) => ({w: w.toLowerCase().replace(/[.,?]/g, ''), a: a + VO}));
export const w = (word: string, n = 1) => { let k = 0; for (const x of WS) if (x.w === word && ++k === n) return x.a; throw new Error('palavra ' + word); };
export const T = {
  hoje: w('hoje'), estudado: w('estudado'), arquitetura: w('arquitetura'), projeto: w('projeto'), casa: w('casa'), direito: w('direito'), revisar: w('revisar'), contrato: w('contrato'),
  marketing: w('marketing'), campanha: w('campanha'), inteira: w('inteira'),
  isso: w('isso'), parte: w('parte'), assustadora: w('assustadora'), ja: w('já'), chego: w('chego'), nela: w('nela'),
  inteligencia: w('inteligência'), passou: w('passou'), exame: w('exame'), ordem: w('ordem'), advogados: w('advogados'), americana: w('americana'),
  passou2: w('passou', 2), prova: w('prova'), medicina: w('medicina'), n20: w('20'), pontos: w('pontos'), folga: w('folga'), nao2: w('não', 2), colou: w('colou'),
  ou: w('ou'), conhecimento: w('conhecimento'), profissao: w('profissão'), disponivel: w('disponível'), qualquer: w('qualquer'), agora: w('agora'),
  mas: w('mas'), detalhe: w('detalhe'), ninguem: w('ninguém'), percebeu: w('percebeu'),
  cada: w('cada'), sozinha: w('sozinha'), ferramenta: w('ferramenta'), arquiteto: w('arquiteto'), engenheiro: w('engenheiro'), advogado: w('advogado'), vendedor: w('vendedor'),
  basicamente: w('basicamente'), empresa: w('empresa'), normal: w('normal'),
  jogo: w('jogo'), muda: w('muda'), conecta: w('conecta'),
  pega: w('pega'), construtora: w('construtora'), agente: w('agente'), planta: w('planta'), outro1: w('outro'), orcamento: w('orçamento'), material: w('material'),
  outro2: w('outro', 2), proposta: w('proposta'), outro3: w('outro', 3), contrato2: w('contrato', 2), outro4: w('outro', 4), video: w('vídeo'), pronta: w('pronta'), tijolo: w('tijolo'),
  tudo: w('tudo'), conversando: w('conversando'), tarde: w('tarde'),
  antes2: w('antes', 2), cinco: w('cinco'), profissionais: w('profissionais'), semanas: w('semanas'),
  ecossistema: w('ecossistema'), naoE: w('não', 5), ferramenta2: w('ferramenta', 2), escritorio: w('escritório'), especialistas: w('especialistas'), voce: w('você', 3),
  conhecimento2: w('conhecimento', 2), deixou: w('deixou'), raro: w('raro'), raro2: w('raro', 2), quem: w('quem'), conectar: w('conectar'),
  parte2: w('parte', 2), assustadora2: w('assustadora', 2), concorrente: w('concorrente'), melhor: w('melhor'), nada: w('nada'),
  ele: w('ele'), conectar2: w('conectar', 2), primeiro: w('primeiro'),
  por: w('por', 2), so: w('só', 3), observa: w('observa'),
  jazz: 45.5, sting: 84.7,
};
