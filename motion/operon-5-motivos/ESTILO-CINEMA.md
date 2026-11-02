# Estilo Cinema

O segundo estilo de vídeo do Yohann Escher, ao lado do Estilo Gravura. A narração dele, com cenas de filmes e séries marcantes escolhidas pelo **significado** do que está sendo dito, montadas com motion dinâmico e imersivo. Não é editor automático: um diretor decide cada cena e o Remotion executa.

> Regra do diretor: a narração dita o ritmo, o significado escolhe a imagem e a emoção escolhe o movimento.

## Variações
- **Motivação / filosofia**: contraste dramático, frases monumentais, pausas, trilha emocional.
- **Tech / inteligência**: cards e interfaces em 3D, fluxos, sistemas.
- **Negócios / poder**: editorial, arquitetura, números animados, cortes precisos.

A identidade é fixa (tipografia editorial, tratamento cinematográfico, grão, movimento com física coerente); ritmo, intensidade e cor secundária mudam com o roteiro.

## O que já existe no estúdio e entra igual
Voz clonada na ElevenLabs v3 com expressões · tempo de cada palavra (faster-whisper) · Remotion · mixagem guiada pela voz, efeitos sonoros e −14 LUFS · recorte de objetos para texto por trás (feito no mashup) · espelho do render e mapa do Estúdio · cadeia de render e controle de qualidade.

## O que vamos construir
1. **Diretor (storyboard executável)**: o roteiro vira um JSON de cenas: tempo, cena escolhida, componente, movimento, palavras em destaque, transição e efeito sonoro. O Remotion renderiza esse JSON de forma determinística; qualquer cena pode ser trocada sem refazer o resto.
2. **Banco de cenas (acervo)**: cada cena catalogada por filme/série, personagem, emoção, significado, composição (close, plano aberto, espaço negativo, lado do personagem), movimento e compatibilidade (aceita palavra atrás, colagem, cards). Busca pelo significado da frase, não por palavra-chave. Vira um módulo do Estúdio.
3. **Biblioteca de movimento (MVP com 12 componentes)**:
   1. Tipografia espacial: palavra gigante em perspectiva, atrás do personagem (recorte por máscara).
   2. Colagem cinematográfica: imagens entram de lados diferentes, se sobrepõem e viram a próxima.
   3. Cards 3D com perspectiva, paralaxe e luz.
   4. Legendas cinéticas: palavra-chave explode, o resto entra discreto.
   5. Montagem rápida: 3 a 6 imagens em ritmo com a aceleração da voz.
   6. Match cut: um formato ou movimento leva de uma cena à outra.
   7. Profundidade 2.5D: a foto separada em camadas com câmera virtual.
   8. Tela dividida em painéis (duas ou três cenas em diálogo).
   9. Máscara diagonal e revelação por forma.
   10. Rack focus e desfoque de transição.
   11. Número/estatística monumental sobre a cena.
   12. Respiro: uma imagem só, por 4 a 5 s, quando a frase pede silêncio.
4. **Controle de retenção**: o diretor mede a densidade visual de cada trecho e propõe mudança de plano ou pausa quando a sequência fica repetitiva.

## Fontes de imagem
- **TMDB** (API): identificar filmes, séries, personagens e imagens oficiais (metadados e busca).
- **FilmGrab**: estudo de enquadramento, luz e cor; sem API e sem licença de redistribuição.
- **Flim.ai**: referência estética; os termos limitam o uso a referência e pré-produção.
- **OpenMontage**: só como referência de arquitetura (licença AGPLv3; não vira dependência do estúdio).

**Pendente: o Yohann decide de onde vêm as imagens publicadas.** Cenas de filmes e séries famosos têm dono; no YouTube o Content ID reconhece automaticamente e pode tirar a monetização, bloquear o vídeo ou dar strike (três strikes removem o canal); no Instagram o vídeo pode ser silenciado ou removido. A lei brasileira permite citar pequenos trechos para crítica e estudo, o que dificilmente cobre um vídeo de divulgação de mentoria. Caminhos possíveis: frames de filmes usados como citação curta e transformada em vídeos de análise; cenas originais geradas por IA no clima desses filmes (sem rosto de ator real); filmes já em domínio público e acervo licenciado; ou uma mistura.

## Primeiro passo
Um teste de 15 a 20 s (como o teste do avatar) com uma frase forte, mostrando os componentes 1 a 5, nos dois formatos (16:9 e 9:16), para aprovar a linguagem antes de produzir o primeiro vídeo.
