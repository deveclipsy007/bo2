// Tempo do Nº 03 "Os centauros". Voz começa em VO s; a trilha (a mesma da série) começa em 0.
// O silêncio da trilha (22,0–24,3 s) cai em "Quem venceu foram…" e a volta explode em "dois amadores".
import WORDS from './words3.json';
import BEATS from './beats.json';

export const FPS = 60;
export const VO = 3.16;
export const DURATION = Math.round(66.0 * FPS);
export const BEAT: number[] = (BEATS as {beats: number[]}).beats;
const WS = (WORDS as [string, number, number][]).map(([w, a]) => ({w: w.toLowerCase().replace(/[.,?]/g, ''), a: a + VO}));
export const w = (word: string, n = 1) => { let k = 0; for (const x of WS) if (x.w === word && ++k === n) return x.a; throw new Error('palavra ' + word); };

export const T = {
  hit0: 0.69, em: w('em'), ano: w('1997'), maquina: w('máquina'), campeao: w('campeão'), xadrez: w('xadrez'),
  parecia: w('parecia'), fim: w('fim'), historia: w('história'),
  mas: w('mas'), kasparov: w('kasparov'), outra: w('outra'), pergunta: w('pergunta'),
  ese: w('e'), humanos: w('humanos'), maquinas: w('máquinas'), juntos: w('juntos'),
  anos: w('anos'), torneio: w('torneio'), grandes: w('grandes'), mestres: w('mestres'), computadores: w('computadores'), super: w('supercomputadores'), sozinhos: w('sozinhos'),
  silence: 22.0, quem: w('quem'), dois: w('dois'), back: 24.38, amadores: w('amadores'), tres: w('três'), computadores2: w('computadores', 2), comuns: w('comuns'),
  eles: w('eles'), jogadores: w('jogadores'), naotinham: w('não', 2), maquinas2: w('máquinas', 2),
  tinham: w('tinham', 2), processo: w('processo'),
  sabiam: w('sabiam'), ouvir: w('ouvir'), confiar: w('confiar'), si: w('si'),
  kasparov2: w('kasparov', 2), gente: w('gente'), maqC: w('máquina', 3), processo2: w('processo', 2), venceu3: w('venceu', 3), maqF: w('máquina', 4), forte: w('forte'),
  evenceu: w('venceu', 4), grande: w('grande'), processo3: w('processo', 3), pior: w('pior'),
  agora: w('agora'), ia: w('inteligência'), todo: w('todo'), ferramenta: w('ferramenta'), nova: w('nova'),
  quase: w('quase'), construindo: w('construindo'), processo4: w('processo', 4),
  vantagem: w('vantagem'), nunca: w('nunca'), maq5: w('máquina', 5), sistema: w('sistema'), desenha: w('desenha'), volta: w('volta'), dela: w('dela'),
  por: w('por'), so: w('só'), observa: w('observa'),
  cut: 58.793, sting: 61.0,
};
export const beatAt = (t: number) => { let i = 0; while (i < BEAT.length - 1 && BEAT[i + 1] <= t) i++; return i; };
export const pulse = (t: number, tau = 0.11) => {
  if (t < T.hit0 || (t > T.silence && t < T.back) || (t > T.cut && t < T.sting)) return 0;
  const i = beatAt(t), s = t - BEAT[i]; return s >= 0 ? Math.exp(-s / tau) : 0;
};
