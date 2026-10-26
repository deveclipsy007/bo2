"""Monta o documento atividade/<módulo> do Estúdio: o que um módulo está fazendo agora (abre o card dele no mapa, ao vivo).

uso: python ativ.py <módulo> <saida.json> --titulo "..." [--etapas "Roteiro,Escrevendo,Revisão"] [--atual 1] [--progresso 40]
                    [--texto "..."] [--linha "..."]... [--log "..."]... [--audio /_blob/<id>] [--fim]
Depois: ArtifactData set collection=atividade doc_id=<módulo> file_path=<saida.json>. Com --fim, o card fecha.
"""
import argparse, datetime, json

ap = argparse.ArgumentParser()
ap.add_argument('modulo'); ap.add_argument('saida')
ap.add_argument('--titulo', default=''); ap.add_argument('--etapas', default=''); ap.add_argument('--atual', type=int, default=-1)
ap.add_argument('--progresso', type=float); ap.add_argument('--texto', default='')
ap.add_argument('--linha', action='append', default=[]); ap.add_argument('--log', action='append', default=[])
ap.add_argument('--audio', default=''); ap.add_argument('--fim', action='store_true')
a = ap.parse_args()
nomes = [e.strip() for e in a.etapas.split(',') if e.strip()]
etapas = [{'label': n, 'state': 'done' if i < a.atual or (a.fim and a.atual >= 0) else 'run' if i == a.atual else 'wait'} for i, n in enumerate(nomes)]
doc = {'ativo': not a.fim, 'titulo': a.titulo, 'etapas': etapas, 'linhas': a.linha, 'log': a.log,
       'atualizado': datetime.datetime.now(datetime.timezone.utc).isoformat()}
if a.progresso is not None: doc['progresso'] = 100 if a.fim else a.progresso
if a.texto: doc['texto'] = a.texto
if a.audio: doc['audio'] = a.audio
json.dump(doc, open(a.saida, 'w'), ensure_ascii=False)
print(a.modulo, 'ativo' if doc['ativo'] else 'encerrado', len(etapas), 'etapas')
