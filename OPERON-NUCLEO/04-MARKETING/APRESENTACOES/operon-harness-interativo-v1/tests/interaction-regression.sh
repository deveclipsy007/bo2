#!/bin/zsh
set -euo pipefail

deck_file="${0:A:h:h}/Harness.dc.html"
fx_file="${0:A:h:h}/fx.js"
stage_file="${0:A:h:h}/deck-stage.js"
failures=0

require_pattern() {
  local file="$1"
  local pattern="$2"
  local message="$3"
  if ! rg -U -q "$pattern" "$file"; then
    print -u2 "FAIL: $message"
    failures=$((failures + 1))
  fi
}

reject_pattern() {
  local file="$1"
  local pattern="$2"
  local message="$3"
  if rg -U -q "$pattern" "$file"; then
    print -u2 "FAIL: $message"
    failures=$((failures + 1))
  fi
}

require_pattern "$deck_file" 'data-shapes="engrenagem\|veiculo"' 'a metáfora visual do motor e do veículo precisa permanecer no deck'
require_pattern "$deck_file" 'data-interaction-layer="pass-through"' 'camadas visuais sobre canvases interativos precisam liberar o ponteiro'
require_pattern "$fx_file" 'function vapor\(c\)[[:space:][:print:]\n]*?pointermove' 'a vaporização tipográfica precisa reagir ao ponteiro'
require_pattern "$fx_file" 'function drift\(c\)[[:space:][:print:]\n]*?pointermove' 'o campo disperso precisa reagir ao ponteiro'
reject_pattern "$fx_file" '16,185,129|#10B981' 'a animação não pode renderizar partículas verdes'
require_pattern "$deck_file" 'section\[data-label\] > img\{filter:grayscale\(1\)!important\}' 'imagens de fundo do deck precisam permanecer estritamente em preto e branco'
require_pattern "$deck_file" 'canvas\[data-fx\]\{pointer-events:auto\}' 'todo canvas de partículas precisa receber o ponteiro mesmo dentro de contêineres passivos'
reject_pattern "$fx_file" "off\\.getContext\\('2d'\\)" 'canvases de amostragem precisam declarar leitura frequente para evitar avisos e perda de desempenho'
require_pattern "$deck_file" 'src="fx\.js\?v=[0-9]+' 'o runtime visual precisa de versão explícita para não reutilizar animações antigas do cache'
require_pattern "$deck_file" 'assets/operon-slide-13-capacidade-recuperada-v1\.png' 'o slide 13 precisa usar sua imagem exclusiva de capacidade recuperada'
require_pattern "$deck_file" 'assets/operon-slide-22-fecho-capacidade-v1\.png' 'o slide 22 precisa usar sua imagem exclusiva de fechamento'
require_pattern "$stage_file" 'class="btn fullscreen"' 'a apresentação precisa oferecer um botão de tela cheia nos controles'
require_pattern "$stage_file" 'aria-label="Enter fullscreen"' 'o controle de tela cheia precisa ser acessível'
require_pattern "$stage_file" "requestFullscreen" 'o controle precisa usar a API nativa de tela cheia'
require_pattern "$stage_file" "key === 'f' \|\| key === 'F'" 'a apresentação precisa aceitar F como atalho de tela cheia'
require_pattern "$deck_file" 'data-prefix-sequence="menos\|mais"' 'a abertura precisa tratar “menos” e “mais” como prefixos do título particulado'
reject_pattern "$deck_file" '>menos improviso\.</p>|>mais <em[^>]*>capacidade</em>\.</p>' 'a abertura não pode repetir por extenso os títulos que já aparecem em partículas'

line_of() {
  rg -n -m1 "$1" "$deck_file" | cut -d: -f1 || true
}

matheus_line="$(line_of 'data-label="19 · Matheus"')"
lba_line="$(line_of 'data-label="LBA · Harness Criativo"')"
final_line="$(line_of 'data-label="20 · Menos improviso"')"

if [[ -z "$matheus_line" || -z "$lba_line" || -z "$final_line" ]] || (( lba_line <= matheus_line || lba_line >= final_line )); then
  print -u2 'FAIL: o bloco complementar da LBA precisa aparecer depois do núcleo OPERON e antes do fecho final'
  failures=$((failures + 1))
fi

if (( failures > 0 )); then
  print -u2 "${failures} regression check(s) failed"
  exit 1
fi

print "interaction regression checks passed"
