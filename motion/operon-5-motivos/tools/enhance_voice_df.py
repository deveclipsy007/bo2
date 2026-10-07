# Realce de fala com DeepFilterNet3 (remove ruído e parte da reverberação). Uso: python dfenh.py <saida_dir> <wav...>
import sys, os, wave
import numpy as np, torch
from df.enhance import init_df, enhance
model, st, _ = init_df(model_base_dir=os.environ['DF_DIR'], post_filter=True)
sr = st.sr()
for p in sys.argv[2:]:
    with wave.open(p) as w:
        assert w.getframerate() == sr, (w.getframerate(), sr)
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    y = enhance(model, st, torch.from_numpy(x)[None]).squeeze(0).numpy()
    o = os.path.join(sys.argv[1], os.path.basename(p))
    with wave.open(o, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    print('ok', o, flush=True)
