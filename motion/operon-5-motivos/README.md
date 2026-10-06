# Operon — "5 motivos" (reel vertical 1080×1920, 30 fps)

Projeto Remotion do reel "5 motivos para criar seu sistema proprietário inteligente".
**Status: preparação concluída, edição final aguardando os áudios dos motivos 1–3.**

## Sequência correta dos áudios (analisada por transcrição)

| # | Arquivo | Duração | Conteúdo |
|---|---|---|---|
| 1 | `IMG_5749.MOV` (vídeo falando, não versionado) | 5,37 s | Hook: "5 motivos para você criar agora seu sistema proprietário inteligente." |
| 2 | `public/audio/02-motivo-04.ogg` | 10,05 s | **Motivo 4** — Transformar seu método em vantagem |
| 3 | `public/audio/03-motivo-05.ogg` | 11,41 s | **Motivo 5** — Colocar inteligência para trabalhar |
| 4 | `public/audio/04-fechamento.ogg` | 9,07 s | Fechamento — "Não é só ter um software com a sua marca…" |
| 5 | `public/audio/05-assinatura.ogg` | 6,21 s | Assinatura — "Operon, tecnologia própria, inteligência conectada, você no comando." |

Os motivos **1, 2 e 3** ainda não foram enviados e entram entre o hook e o motivo 4.
Transcrição com tempo por palavra (base das legendas): `timeline.json` (gerada por `tools/transcribe.py`, faster-whisper).

## Render neste ambiente

O Chromium baixado pelo Remotion não está disponível; usar o headless shell pré-instalado:

```bash
npx remotion render src/index.ts <ComposicaoId> out/video.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell \
  --chrome-mode=headless-shell --codec=h264 --crf=16
```

`src/Root.tsx` hoje só tem uma composição de teste do toolchain (renderizou um still com sucesso).

## Pendências do usuário

- Áudios dos motivos 1, 2 e 3.
- Arquivo do mascote Fluffy (o endereço `localhost:8765` é da máquina do usuário e não é acessível daqui).
- Confirmar qual HTML é a "estrutura de motion": no repositório só existe o deck `OPERON-NUCLEO/04-MARKETING/APRESENTACOES/operon-harness-interativo-v1/Harness.dc.html`.
