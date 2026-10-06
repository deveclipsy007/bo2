# Isolamento de voz (Mel-Band RoFormer via audio-separator). Uso: python separate_voice.py <saida_dir> <pasta_modelos> <wav...>
import sys, glob, time
from audio_separator.separator import Separator
out, models, files = sys.argv[1], sys.argv[2], sys.argv[3:]
s = Separator(output_dir=out, output_format='WAV', model_file_dir=models, mdxc_params={'batch_size': 1, 'segment_size': 256, 'overlap': 8})
s.load_model('model_mel_band_roformer_ep_3005_sdr_11.4360.ckpt')
for f in files:
    t = time.time(); r = s.separate(f); print(f, r, round(time.time() - t, 1), flush=True)
