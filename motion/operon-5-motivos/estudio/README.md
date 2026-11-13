# Estúdio Escher

A central de produção do Yohann Escher: um artifact no claude.ai (`https://claude.ai/artifact/4xQwyEoKJ26BqFQAfyhaeM`) com o banco de dados dele, mais o código dos filmes neste projeto Remotion.

## Onde está cada coisa

| O quê | Onde |
|---|---|
| Página do Estúdio (todas as abas: Mapa, Eu, Arsenal, Entrada, Ideias, Voz, Produção, Filmes, Publicação, Padrão) | `../mirror/index.html` |
| Dados do Estúdio, exportados do banco do artifact (um JSON por documento) | `dados/` |
| Composições dos filmes (Estilo Gravura e Estilo Cinema) | `../src/films/` (`eco/` e `cine/`), registradas em `../src/Root.tsx` |
| Roteiros | `../roteiros/` |
| Voz (ElevenLabs v3, expressões vetadas bloqueadas) | `../tools/voz.py` |
| Mixagem guiada pela voz e efeitos sonoros | `../tools/mix_episode.py`, `../tools/sfx.py`, folhas de efeitos em `../tools/mixes/` |
| Banco de ideias, acervo inicial e atividade ao vivo do mapa | `../tools/estudio/` (`ideias_50.py`, `acervo_inicial.py`, `ativ.py`) |
| Regras de produção e os dois estilos | `../../../CLAUDE.md`, `../ESTILO-CINEMA.md` |

## Coleções em `dados/`

`perfil` (aba Eu) · `arsenal` (checklist do pré-lançamento) · `ideias` (50 ideias em 8 semanas) · `videos` (Filmes) · `voz` (voz e expressões liberadas/vetadas) · `takes` (vozes geradas) · `publicacao` e `canais` (Publicação) · `atividade` (cards abertos no mapa) · `eventos` (Pulso) · `mirror` (espelho do render). A coleção `entrada` estava vazia na exportação.

## O que fica fora do repositório

- **Chaves e senhas.** A chave da ElevenLabs vive só na área privada do Estúdio (`data/users/<id>/elevenlabs`), que não foi exportada.
- **Mídia:** vídeos renderizados (`out/`), áudios mixados (`*.wav`), imagens processadas (`public/eco/`) e as cenas de filmes e séries de terceiros do Estilo Cinema (`public/cine/`).
- Os campos `capa`, `video` e `audio` dos dados apontam para arquivos guardados no próprio artifact (`/_blob/<id>`), que só abrem dentro dele.
