# Instruções para o Claude neste repositório

## Vídeos do Yohann Escher (motion/operon-5-motivos)

### Antes de criar qualquer vídeo: perguntar o estilo
Sempre perguntar ao Yohann qual dos dois estilos o vídeo vai usar, antes de escrever roteiro visual ou cena:

1. **Estilo Gravura** (o do Estúdio Escher, já aprovado): tinta, grafite, osso e um único laranja; gravuras de domínio público que se desenham sozinhas; Fraunces 900, Instrument Serif itálico, rótulos "FIG." em mono; cenas alternando papel e escuro; ponto laranja; final com o olho fechando ("Por enquanto… só observa.") e o logo.
2. **Estilo Cinema** (novo, em construção): cenas de filmes e séries marcantes escolhidas pelo significado do que está sendo dito (poder, ambição, estratégia, tecnologia), com colagem cinematográfica, tipografia espacial em 3D (palavra atrás do personagem), cards 3D com perspectiva, legendas cinéticas e montagem rápida. Variações: motivação/filosofia, tech, negócios. A origem das imagens segue o caminho que o Yohann escolher (ver `motion/operon-5-motivos/ESTILO-CINEMA.md`).

### Regras de produção que valem para os dois estilos
- Conferir espaço em disco antes de renderizar; limpar só caches temporários.
- Nunca rodar encodes em paralelo: uma cadeia única (render → master → web), nomes únicos, e nunca apagar o arquivo bruto antes de verificar o resultado.
- Atualizar o Estúdio (artifact `https://claude.ai/artifact/4xQwyEoKJ26BqFQAfyhaeM`) em cada etapa: `mirror/status` a cada 10% do render, `atividade/<módulo>` enquanto um módulo trabalha (o card abre no mapa), `eventos` quando algo termina.
- Áudio: a voz sempre por cima da trilha (pelo menos 14 dB abaixo na fala), efeitos sonoros sincronizados com o que acontece na tela, master em −14 LUFS.
- Voz: ElevenLabs v3 com a voz do Yohann; expressões vetadas nunca entram (`tools/voz.py` bloqueia). A chave fica na área privada do Estúdio (`data/users/me/elevenlabs`), baixada com `out_dir` para o scratchpad; nunca imprimir a chave.
- Conferir cada troca de frase: nenhum texto sobreposto.
- Sem número de episódio; vídeos curtos até 1:30.
- Não citar a LBA junto com a Operon; cliente só com autorização; números do Yohann só depois de confirmados (aba Eu do Estúdio).
