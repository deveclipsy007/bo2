# Inventário de assets públicos

## Marca

- `images/brand/operon-logo-dark.webp`: logo oficial otimizada para fundo preto.
- `images/brand/operon-logo-light.webp`: logo oficial otimizada para fundo branco.
- arquivos `*-source.png`: masters locais para novas derivações; são excluídos do pacote de deploy.

## Partículas

- `contexto.webp`: camadas e contexto operacional.
- `memoria.webp`: memória consultável e acúmulo.
- `direcao.webp`: direção e decisão humana.
- `integracoes.webp`: conexão entre fontes e ferramentas.
- `capacidade.webp`: capacidade operacional formada.

## Cenas autorais geradas

- `images/generated-v3/operational-case-system.webp`: visualização demonstrativa do case operacional; representa fluxo, critérios, exceção, revisão humana e memória sem cliente ou resultado factual embutido. A fonte PNG é mantida apenas no projeto.
- `images/generated/hero-orbit.webp`: órbita monumental do hero, com área negativa para copy.
- `images/generated/harness-layers.webp`: cinco planos de contexto transformando caos em fluxo.
- `images/generated/human-direction.webp`: direção humana em ambiente real e silencioso.
- `media/orbital.gif`: GIF orbital original da apresentação, usado em carregamento tardio.
- `images/about/about-yohann.webp` e `images/about/about-matheus.webp`: retratos autorais de Yohann Escher e Matheus Marques, derivados dos assets da apresentação e comprimidos para uso na página Sobre. Os masters `*-source.png` permanecem locais e fora do deploy.

Os masters `*-source.png` ficam somente no projeto local e não entram em `dist/public_html`.

## Regras

- Imagens de conteúdo entram em WebP ou AVIF, com dimensões responsivas.
- Canvas é reservado para cenas em que movimento explica transformação.
- Não publicar estudos de logo, vetores simplificados, favicons, símbolos reduzidos ou assets da LBA.
- Não carregar mais de uma imagem material de grande porte no primeiro viewport.
