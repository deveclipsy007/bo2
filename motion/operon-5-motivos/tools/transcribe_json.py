import sys, json, wave
import numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("medium", device="cpu", compute_type="int8")
out = {}
for p in sys.argv[2:]:
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    segs, info = m.transcribe(a, language="pt", word_timestamps=True, vad_filter=False, condition_on_previous_text=False,
                              initial_prompt="Operon, sistema proprietário, agentes de IA, método, ferramenta.")
    ws = []
    for s in segs:
        for w in s.words: ws.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)})
    out[p.split("/")[-1].replace(".wav", "")] = ws
json.dump(out, open(sys.argv[1], "w"), ensure_ascii=False, indent=1)
print({k: len(v) for k, v in out.items()})
