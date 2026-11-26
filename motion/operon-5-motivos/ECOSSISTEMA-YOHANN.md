# Ecossistema Yohann — produção infinita de vídeo

O levantamento de como os vídeos do Yohann Escher são feitos hoje, do tema ao arquivo publicado, para virar o ecossistema dele no Jarvis (mesmo padrão dos ecossistemas GTA e Operon). Cada etapa diz o que entra, o que sai, a ferramenta, onde fica no projeto e o que precisa ser conferido antes de seguir.

## A linha de produção

| # | Etapa | Entra | Sai | Ferramenta / arquivo | Confere antes de seguir | Card no Estúdio |
|---|---|---|---|---|---|---|
| 0 | Pauta | Ideia do banco, notícia ou pedido do Yohann | Tema escolhido, formato (lista de 5, atualidade, a conta, história, por dentro, contra a corrente) | Banco de 50 ideias (`tools/estudio/ideias_50.py`, aba Ideias) | Fatos marcados em "conferir antes de gravar" | Ideias |
| 1 | Estilo | Tema | **Gravura** ou **Cinema** | Pergunta obrigatória ao Yohann (`CLAUDE.md`) | Resposta dele, sempre | — |
| 2 | Roteiro | Tema + estilo + perfil do Yohann | Texto com expressões de voz | `roteiros/*.md`; perfil em `estudio/dados/perfil` | Gancho nos 3 s, ganchos encadeados, número como prova, parte técnica, humor; nada da lista "nunca dizer"; até 1:30 | Ideias (abre escrevendo) |
| 3 | Voz | Roteiro com expressões | MP3 com a voz clonada do Yohann | `tools/voz.py` (ElevenLabs v3) | Nenhuma expressão vetada; transcrição confere que nenhuma tag foi lida em voz alta | Voz |
| 4 | Tempo por palavra | MP3 | `words*.json` (início e fim de cada palavra) | faster-whisper (`tools/transcribe_json.py`) | Palavras-chave localizadas (`w('palavra', n)`) | Voz |
| 5 | Imagens | Roteiro | Gravuras tratadas ou cenas de filmes com recortes | Gravura: Wikimedia Commons em domínio público + `tools/eco_lineart.py`, `tools/photo_print.py`. Cinema: acervo FilmGrab/TMDB + recorte de personagem (rembg) | Cada imagem representa a frase (nunca genérica); créditos em `src/films/eco/FONTES.md` ou na tela | Entrada / Produção |
| 6 | Composição | Tempos + imagens | Composição Remotion 16:9 e/ou 9:16 | `src/films/eco/FilmN.tsx` (Gravura), `src/films/cine/CinemaTeste2.tsx` (Cinema), registradas em `src/Root.tsx` | Prévia em quadros (`tools/stills.mjs`); nenhum texto sobreposto em nenhuma troca de frase | Produção |
| 7 | Som | Voz + trilha + roteiro de efeitos | `mix.wav` + relatório | `tools/mix_episode.py`, `tools/sfx.py`, folha de efeitos em `tools/mixes/` | Voz ≥ 14 dB acima da trilha; efeitos sincronizados; −14 LUFS | Produção |
| 8 | Render | Composição + mix | Bruto → master BT.709 → versão web < 30 MB | Remotion + FFmpeg, **uma cadeia única** | Espaço em disco antes; espelho a cada 10%; nunca apagar o bruto antes de conferir | Produção (abre com as cenas) |
| 9 | Entrega | Versão web | Arquivo para o Yohann, prévia no Estúdio, item na fila de publicação | Envio do arquivo, coleções `videos`, `publicacao`, `eventos` | Decodificação completa, loudness, quadros de cada transição | Filmes · Publicação · Pulso |

## Os dois estilos
- **Gravura**: tinta, grafite, osso e um laranja; gravuras de domínio público que se desenham; Fraunces 900 + Instrument Serif itálico + rótulos FIG. em mono; papel e escuro; ponto laranja; final com o olho fechando e o logo.
- **Cinema** (a união com a Gravura): cena real de filme ou série em cima, quase parada; a frase escrita à caneta no ritmo da voz; diagrama FIG. que se desenha embaixo; uma linha liga a cena ao diagrama. Detalhes em `ESTILO-CINEMA.md`.

## O Estúdio (a central)
Artifact `https://claude.ai/artifact/4xQwyEoKJ26BqFQAfyhaeM`, código em `mirror/index.html`, dados exportados em `estudio/dados/`. Abas: Mapa (o organismo: Entrada → Ideias → Voz → Produção → Filmes → Publicação, com Eu, Arsenal e Padrão no centro), Eu, Arsenal, Entrada, Ideias, Voz, Produção, Filmes, Publicação, Padrão. Cada módulo abre no mapa enquanto trabalha (`atividade/<módulo>`, `tools/estudio/ativ.py`).

## O que falta para a produção ser infinita (20 vídeos por dia)
Hoje cada vídeo é uma composição escrita à mão: qualidade alta, mas horas de trabalho por vídeo. Para escala:
1. **Motor por storyboard**: o roteiro vira um JSON de cenas (tempo, módulo visual, imagem, palavra-chave, diagrama, efeito sonoro) e um único componente Remotion renderiza qualquer vídeo a partir dele.
2. **Biblioteca de módulos visuais** reaproveitáveis (ver gramática abaixo), cada um com variações, para os vídeos não parecerem template.
3. **Acervo catalogado** por significado (emoção, conceito, composição) para a escolha de imagens ser busca, não garimpo.
4. **Fila e agenda**: vários vídeos em produção, render em série sem paralelismo de encode, tarefa agendada que processa a Entrada.
5. **Publicação por API** (Instagram, YouTube, TikTok) e leitura de desempenho de volta para o banco de ideias.

## Recomendações do documento de marca "Strategic Modernism" (26/11/2026)
**Adotar já** (combinam com o que existe):
- Território de estrategista e a tese "Nunca tivemos tantas ferramentas para construir. O diferencial está em saber o que construir." Fecha com "o raro é quem sabe conectar".
- Fugir de três estereótipos: guru de IA, influenciador de marketing, vendedor de promessa financeira (já está no "nunca dizer").
- Laranja com função narrativa: só o que merece atenção (oportunidade, descoberta, vantagem). É a regra do ponto laranja.
- Contraste antigo × futuro: diagramas de livro científico dos anos 1960 explicando tecnologia de 2026. É o Estilo Gravura e os diagramas FIG. do Cinema.
- Seis gramáticas como módulos do motor: Exploded View (desmontar um negócio), Business Diorama (o ecossistema em miniatura), Archive Motion (Gravura), Visual Metaphor (diagramas FIG.), Kinetic Intelligence (tipografia), The Strategist (o avatar/personagem).
- Temporadas com uma investigação central; a primeira, "A era da alavancagem" (00 a 06), organiza o banco de ideias.

**Testar antes de decidir:**
- Paleta proposta (laranja #F36B21, preto #171717, off-white #F8F7F4, archive #D9D4C9, grafite #777873) e a proporção 60% claros / 25% preto / 5% laranja: hoje os vídeos são majoritariamente escuros.
- Tipografia Instrument Serif + Manrope Light + IBM Plex Mono (as três já estão no projeto) no lugar do Fraunces 900 nos impactos.
- Personagem definitivo do The Strategist (hoje o avatar em pixel art).
- Blueprint (biblioteca de arquiteturas de negócio liberada por comentário → DM): depende da ferramenta de DM e de conteúdo próprio.
- Volume de 20 por dia / 600 por mês: depende do motor por storyboard acima.

**Ignorar** (a nossa linha já resolve melhor ou não serve agora):
- Trocar a linha de produção por outra: a ordem acima (estilo → roteiro → voz → tempo por palavra → imagens → composição → som → render em cadeia → QA) segue.
- Números e potencial viral sem a mineração de dados que o próprio documento diz não ter feito.
