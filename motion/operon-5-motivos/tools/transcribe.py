import sys, wave
import numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("medium", device="cpu", compute_type="int8")
for p in sys.argv[1:]:
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    segs, info = m.transcribe(a, language="pt", word_timestamps=True, vad_filter=False)
    print("==", p, round(len(a)/16000,2))
    for s in segs:
        print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
        print("   " + " | ".join(f"{w.start:.2f}-{w.end:.2f} {w.word.strip()}" for w in s.words))
