// Curvas e utilitários de tempo do Operon Motion System (tokens: enter .16,1,.3,1 · exit .7,0,.84,0 · camera .65,0,.35,1).
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** Bézier cúbica como função de easing (x → y), resolvida por Newton + bisseção. */
const bezier = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (s: number) => ((ax * s + bx) * s + cx) * s;
  const Y = (s: number) => ((ay * s + by) * s + cy) * s;
  const dX = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let s = x;
    for (let i = 0; i < 8; i++) { const e = X(s) - x; if (Math.abs(e) < 1e-6) return Y(s); const d = dX(s); if (Math.abs(d) < 1e-6) break; s -= e / d; }
    let lo = 0, hi = 1; s = x;
    while (lo < hi) { const e = X(s); if (Math.abs(e - x) < 1e-6) break; if (x > e) lo = s; else hi = s; s = (hi - lo) / 2 + lo; if (hi - lo < 1e-7) break; }
    return Y(s);
  };
};
const back = (c: number) => (x: number) => { const t = clamp(x) - 1; return 1 + (c + 1) * t * t * t + c * t * t; };

export const E = {
  out: bezier(0.16, 1, 0.3, 1),     // chegada
  in: bezier(0.7, 0, 0.84, 0),      // saída acelerada
  io: bezier(0.65, 0, 0.35, 1),     // transição / câmera
  smooth: bezier(0.4, 0, 0.2, 1),
  pop: back(1.9),                   // overshoot: só carimbo e confirmação
  settle: back(0.7),                // pouso suave com leve passada
};

/** Progresso 0→1 que começa em `a`, dura `d` s e passa pela curva `e`. */
export const P = (t: number, a: number, d: number, e: (x: number) => number = (x) => x) => e(clamp((t - a) / d));
