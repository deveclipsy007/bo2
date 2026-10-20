# Ecossistema (Nº 01) — fontes das imagens

Todas em domínio público ou CC0 (Wikimedia Commons). Processadas por `tools/eco_lineart.py` em `public/eco/img/` (não versionado):

| Nome | Arquivo no Commons | Licença |
|---|---|---|
| vitruvian | Da_Vinci_Vitruve_Luc_Viatour.jpg | Domínio público |
| newton | Portrait_of_Sir_Isaac_Newton,_1689_(brightened).jpg | Domínio público |
| flammarion | Flammarion.jpg | Domínio público |
| purkinje | PurkinjeCell.jpg (Ramón y Cajal) | Domínio público |
| cajal | Cajal_cortex_drawings.png | Domínio público |
| mycetozoa | Haeckel Mycetozoa.jpg | Domínio público |
| atlas | Atlas op globe, RP-P-1982-1471.jpg (Rijksmuseum) | CC0 |
| gears | Reproduction of page from notebook of Leonardo da Vinci … LCCN2006681097.jpg | Domínio público |

## Nº 03 — Os centauros

| Nome | Arquivo no Commons | Licença |
|---|---|---|
| turk1, turk3 | Racknitz - The Turk 1.jpg / 3.jpg (1789) | Domínio público |
| centaur | Antiek beeld 'De Getemde centaur' … Rubens, RP-P-OB-33.283.jpg (Rijksmuseum) | CC0 |
| chiron | Chiron leert Achilles de boog te spannen, RP-P-1907-5380.jpg (Rijksmuseum) | CC0 |
| chessplayers | Chess Players engraving (cropped).jpg | Domínio público |
| hercules | Hercules fighting the Centaurs, wood engraving, 1878.jpg | Domínio público |

Exemplos de uso:
`python tools/eco_lineart.py raw/vitruvian.jpg vitruvian ink 2000 0.5 0.45 0.045 0.035 0.955 0.965` (com `LO=86 HI=98.3 GAM=0.75`) ·
`python tools/eco_lineart.py raw/newton.jpg newton cut 1600`.

Áudio (não versionado): voz do autor (ElevenLabs) + trilha "Fear of The Dark" (soundridemusic, distribuída como sem direitos autorais),
mixados em `public/eco/audio/mix.wav` — voz entra em 3,34 s; a trilha corta em 59,47 s e volta (122,1 s da faixa) em 61,55 s.
