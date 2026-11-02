# Instruções para o Claude neste repositório

## Vídeos do Yohann Escher (motion/operon-5-motivos)

### Antes de criar qualquer vídeo: perguntar o estilo
Sempre perguntar ao Yohann qual dos dois estilos o vídeo vai usar, antes de escrever roteiro visual ou cena:

1. **Estilo Gravura** (o do Estúdio Escher, já aprovado): tinta, grafite, osso e um único laranja; gravuras de domínio público que se desenham sozinhas; Fraunces 900, Instrument Serif itálico, rótulos "FIG." em mono; cenas alternando papel e escuro; ponto laranja; final com o olho fechando ("Por enquanto… só observa.") e o logo.
2. **Estilo Cinema** (novo, em construção; a união com o Gravura): em cima, a cena real de um filme ou série, quase parada e com zoom mínimo, escolhida pelo que a frase diz (nunca imagem genérica); no meio, a frase escrita à caneta no ritmo exato da voz, com a palavra-chave em Fraunces laranja; embaixo, um diagrama que se desenha (FIG.) e explica a ideia; uma linha liga a cena ao diagrama. Recursos de impacto usados com parcimônia: palavra atrás do personagem, punch com eco, montagem curta. Referência: `src/films/cine/CinemaTeste2.tsx`. A origem das imagens segue o caminho que o Yohann escolher (ver `motion/operon-5-motivos/ESTILO-CINEMA.md`).

### Regras de produção que valem para os dois estilos
- Conferir espaço em disco antes de renderizar; limpar só caches temporários.
- Nunca rodar encodes em paralelo: uma cadeia única (render → master → web), nomes únicos, e nunca apagar o arquivo bruto antes de verificar o resultado.
- Atualizar o Estúdio (artifact `https://claude.ai/artifact/4xQwyEoKJ26BqFQAfyhaeM`) em cada etapa: `mirror/status` a cada 10% do render, `atividade/<módulo>` enquanto um módulo trabalha (o card abre no mapa), `eventos` quando algo termina.
- Áudio: a voz sempre por cima da trilha (pelo menos 14 dB abaixo na fala), efeitos sonoros sincronizados com o que acontece na tela, master em −14 LUFS.
- Voz: ElevenLabs v3 com a voz do Yohann; expressões vetadas nunca entram (`tools/voz.py` bloqueia). A chave fica na área privada do Estúdio (`data/users/me/elevenlabs`), baixada com `out_dir` para o scratchpad; nunca imprimir a chave.
- Conferir cada troca de frase: nenhum texto sobreposto.
- Sem número de episódio; vídeos curtos até 1:30.
- Não citar a LBA junto com a Operon; cliente só com autorização; números do Yohann só depois de confirmados (aba Eu do Estúdio).
