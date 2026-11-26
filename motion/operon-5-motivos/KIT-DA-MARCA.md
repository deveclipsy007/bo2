# Kit da marca — Yohann Escher

O que identifica os vídeos do Yohann, em um lugar só.

## Tipografia (arquivos em `public/fonts/`, carregados por `src/lib/fonts.tsx`)
| Papel | Fonte | Onde aparece |
|---|---|---|
| Impacto, títulos, palavra-chave | **Fraunces 900** (e 900 itálico) | PODER, FUTURO, títulos das cenas, assinatura "Yohann Escher." |
| Fala, frase escrita à caneta | **Instrument Serif itálico** | legendas finas do Gravura, a frase escrita do Cinema |
| Rótulos técnicos, dados, créditos | **IBM Plex Mono** 400/500 | "FIG. I — …", créditos de filmes, números |
| Legendas cinéticas (Cinema v1) | **Inter Tight 800/900** | legendas palavra por palavra |
| Em teste (documento Strategic Modernism) | **Manrope Light** | candidata a texto de apoio |

## Cores
| Token | Hoje nos vídeos | Proposta Strategic Modernism (em teste) |
|---|---|---|
| Laranja (só o que merece atenção) | `#FF5A1F` | Signal Orange `#F36B21` |
| Tinta / fundo escuro | `#0A0A0A` | Carbon Black `#171717` |
| Osso / texto claro | `#F2EFE8` | Off White `#F8F7F4` |
| Papel | `#EFEBE3` | Archive `#D9D4C9` |
| Grafite / texto apagado | `#8D8A84` | Graphite `#777873` |

## Personagem (avatar em pixel art)
- Usado no canto inferior esquerdo, 30–40% do vídeo, com a boca seguindo a voz (`src/films/eco/Avatar.tsx`).
- Poses (`POSE`): neutro 0 · mão aberta 1 · aponta 2 · braços cruzados 3 · notebook 4 · joinha 5. Boca: 6 quadros de fala (`talk0` a `talk5`).
- Mapa dos sprites: `src/films/eco/avatar.json` (quadro 560 × 560, base 540). O recorte das folhas de sprites é feito por `tools/avatar_sprites.py`.
- **Os arquivos de imagem do personagem não estão no repositório**: as folhas de sprites originais precisam voltar para `public/eco/avatar/` (ver "Arquivos que faltam").

## Logo Yohann Escher
- Duas camadas animadas no fim dos vídeos Gravura: `logo_yohann` (1234 × 630, monta em células) e `logo_escher` (1008 × 400, escrito à caneta com brilho).
- **Os arquivos do logo não estão no repositório**: precisam voltar para `public/eco/img/logo_yohann.png` e `logo_escher.png`.

## Assinaturas e frases
"Menos improviso. Mais sistematização." · "A IA é um motor de Fórmula 1. O ecossistema é o carro inteiro." · "Por enquanto… só observa." (fim do Gravura) · Strategic Modernism (em teste): "Strategy is an art."

## Arquivos que faltam (perdidos no reinício da máquina da nuvem)
As folhas de sprites do personagem e o arquivo do logo Yohann Escher. Quando o Yohann reenviar, eles entram no repositório (são dele, pequenos) para não se perderem de novo.
