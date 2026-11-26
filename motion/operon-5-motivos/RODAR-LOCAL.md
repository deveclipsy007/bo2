# Rodar o Estúdio Escher no seu computador

## 1. Baixar o projeto
```bash
git clone -b estudio-escher https://github.com/deveclipsy007/bo2.git
cd bo2/motion/operon-5-motivos
```
O Claude Code lê o `CLAUDE.md` da raiz do repositório: as regras de produção e a pergunta "Gravura ou Cinema?" valem no seu computador também.

## 2. Instalar o que o projeto usa
- **Node.js 20 ou mais novo**, depois `npm install` nesta pasta (Remotion e as fontes).
- **FFmpeg** no PATH (render, master, mixagem): no Mac, `brew install ffmpeg`.
- **Python 3.11 ou mais novo** e as bibliotecas das ferramentas:
  ```bash
  python3 -m venv .venv && source .venv/bin/activate
  pip install -r requirements-estudio.txt
  ```
- O Remotion baixa o próprio navegador na primeira vez que renderiza.

## 3. Conferir que funciona
```bash
npx remotion studio src/index.ts            # abre o editor no navegador, com todas as composições
COMP=Cinema-Teste2-V node tools/stills.mjs prévia 2.0 8.0   # quadros de prévia em prévia/
```

## 4. O que não vem no git e precisa voltar para a pasta
Os arquivos de mídia nunca foram para o GitHub (são grandes, e as cenas de filmes têm dono). Eles moravam na máquina da nuvem, que foi reiniciada; então precisam ser refeitos ou recolocados antes de renderizar um vídeo antigo:

| O quê | Onde fica | Como recuperar |
|---|---|---|
| Vídeos finais | `out/` | Os arquivos que o Claude te mandou no chat; prévias leves ficam na aba Filmes do Estúdio |
| Gravuras tratadas (Estilo Gravura) | `public/eco/img/` | Fontes e comandos em `src/films/eco/FONTES.md`; `tools/eco_lineart.py` refaz cada uma |
| Cenas de filmes (Estilo Cinema) | `public/cine/img/` | Baixar de novo do FilmGrab/TMDB e recortar o personagem com rembg (ver `ESTILO-CINEMA.md`) |
| Vozes | `public/*/audio/` | Histórico da sua conta na ElevenLabs, ou gerar de novo com `tools/voz.py` |
| Trilhas (coletânea clássica e playlist de jazz) | onde as folhas de mixagem apontam (`tools/mixes/*.py`) | Os arquivos de música originais; ajustar o caminho no topo de cada folha |
| Mixagens | `public/*/audio/mix*.wav` | `python tools/mix_episode.py <config>`, depois da voz e da trilha no lugar |

## 5. A chave da ElevenLabs
Não está no repositório. Para gerar voz no seu computador: `export ELEVENLABS_API_KEY=...` no terminal (ou a chave salva na aba Voz do Estúdio, baixada para um arquivo e passada com `--chave-arquivo`). Nunca coloque a chave em arquivo dentro do projeto.

## 6. O Estúdio
O Estúdio continua no claude.ai (`https://claude.ai/artifact/4xQwyEoKJ26BqFQAfyhaeM`) e abre em qualquer computador. O código da página está em `mirror/index.html`, e os dados exportados dele em `estudio/dados/`.
