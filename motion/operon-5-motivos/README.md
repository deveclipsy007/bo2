# Operon — "5 motivos" (reel vertical 1080×1920, 60 fps)

Filme em Remotion no padrão do **Operon Motion System v3.3**: hook gravado com palavras atrás do fundador, cenas que
alternam preto/papel/azul, nanopartículas nos trechos escuros, Fluffy (rig SVG) em momentos pontuais e o anel dele
virando o logo oficial no fim. Briefing e cena por cena: [`BRIEFING.md`](BRIEFING.md).

## Sequência da locução (definida por transcrição)

| # | Trecho | Fala |
|---|---|---|
| 0 | Hook (vídeo) | "5 motivos para você criar agora seu sistema proprietário inteligente." |
| 1–5 | Motivos 1 a 5 | Ativo · Processo define o sistema · Expansão · Método vira vantagem · Inteligência trabalhando |
| 6 | Fechamento | "Não é só ter um software com a sua marca, é transformar o que a sua empresa sabe fazer numa estrutura capaz de crescer com ela." |
| 7 | Assinatura | "Operon, tecnologia própria, inteligência conectada, você no comando." |

Tempo por palavra: `src/films/cinco/data.ts` (gerado) e `timeline.json`. As cenas são ancoradas em **palavras** (`T('ativo')`,
`sync(...)` em `src/films/cinco/story.ts`), não em segundos: trocar a locução = regenerar `data.ts`.

## Estrutura

```
src/films/cinco/  story.ts (roteiro como dado) · Hook.tsx · Scenes.tsx (motivos 1–5, fechamento, assinatura) · Film.tsx (trechos + transições)
src/lib/          core (curvas E, P) · ui (Say, Glass, Check, Icon, Dots, Fluffy) · cam (spline) · particles · fonts
src/mascot/       rig SVG do Fluffy (fonte única do kit)
tools/            assemble_voice.py · transcribe*.py · score.mjs + audio-engine.mjs · stills.mjs
public/           fonts, logo oficial; (não versionados) video/hook-bg.mp4, video/hook-fg/*.png, audio/voz.wav, audio/mix-final.wav
```

## Pipeline (reprodutível)

1. **Voz** — `python tools/assemble_voice.py <wavs_48k_mono> <palavras.json> .`: cadeia de polimento (high-pass, afftdn, EQ, de-esser,
   compressor), igualar bandas (≤ 2 dB), −16 LUFS por trecho, cascata de pausas → `public/audio/voz.wav` + `data.ts`.
   Isolamento prévio de voz: Mel-Band RoFormer (`audio-separator`).
2. **Hook** — recorte por matting de vídeo (Robust Video Matting, ONNX) → PNGs RGBA em `public/video/hook-fg/`; fundo em `hook-bg.mp4`.
3. **Som** — `node tools/score.mjs` (trilha + efeitos sintetizados a partir dos mesmos tempos) → `mix-vo-raw.wav`;
   master em duas passadas `loudnorm=I=-14:TP=-1.5:LRA=11` → `public/audio/mix-final.wav`.
4. **Storyboard** — `node tools/stills.mjs <pasta> <t1> <t2> …`.
5. **Render** (headless shell pré-instalado neste ambiente):

```bash
npx remotion render src/index.ts Cinco-Motivos out/operon-5-motivos.mp4 --props='{"audio":"mix"}' \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell \
  --chrome-mode=headless-shell --codec=h264 --crf=16 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=320k
```

## Observações

- Serifa itálica de ênfase: o kit pede Georgia itálica; o render embute **Gelasio itálico** (clone métrico da Georgia) para ser idêntico em qualquer máquina.
- Sem números ou resultados inventados; interface genérica ("Etapa 1/2/3", "Ferramenta").
- Não verificável por quem produziu: o resultado **sonoro** (não é possível ouvir). A trilha foi validada por medição (LUFS, pico, re-transcrição do mix).
