"""Gera a locução com a voz do Yohann na ElevenLabs, a partir de um roteiro com expressões entre colchetes.

uso: python voz.py <roteiro.txt> <saida.mp3> [--voz ID] [--modelo eleven_v3]
A chave vem do ambiente (ELEVENLABS_API_KEY), nunca de arquivo ou do chat. O ID da voz vem de --voz ou de ELEVENLABS_VOICE_ID.
Expressões vetadas (as afetadas/animadas demais) bloqueiam a geração antes de gastar crédito; a lista espelha a aba Voz do Estúdio.
"""
import argparse, json, os, re, sys, urllib.request

VETADAS = {'excited', 'happily', 'cheerfully', 'playfully', 'mischievously', 'giggles', 'laughs harder', 'starts laughing', 'squeals', 'shouts'}

ap = argparse.ArgumentParser()
ap.add_argument('roteiro'); ap.add_argument('saida')
ap.add_argument('--voz', default=os.environ.get('ELEVENLABS_VOICE_ID', ''))
ap.add_argument('--modelo', default='eleven_v3')
a = ap.parse_args()

key = os.environ.get('ELEVENLABS_API_KEY')
if not key: sys.exit('ELEVENLABS_API_KEY não está no ambiente: cadastre a chave nos segredos do ambiente e abra uma sessão nova.')
if not a.voz: sys.exit('Falta o ID da voz: passe --voz ou defina ELEVENLABS_VOICE_ID.')
texto = open(a.roteiro, encoding='utf-8').read().strip()
tags = {t.strip().lower() for t in re.findall(r'\[([^\]]+)\]', texto)}
if tags & VETADAS: sys.exit('Expressões vetadas no roteiro: ' + ', '.join(sorted(tags & VETADAS)))

body = {'text': texto, 'model_id': a.modelo,
        'voice_settings': {'stability': 0.5, 'similarity_boost': 0.8, 'style': 0.0, 'use_speaker_boost': True}}
req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{a.voz}?output_format=mp3_44100_192', data=json.dumps(body).encode(),
                             headers={'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
try:
    with urllib.request.urlopen(req, timeout=300) as r: open(a.saida, 'wb').write(r.read())
except urllib.error.HTTPError as e:
    sys.exit(f'ElevenLabs recusou ({e.code}): {e.read().decode(errors="replace")[:400]}')
print(json.dumps({'saida': a.saida, 'modelo': a.modelo, 'caracteres': len(texto), 'expressoes': sorted(tags)}, ensure_ascii=False))
