// Câmera em spline contínua (Hermite/Catmull-Rom no tempo): nunca para e recomeça entre pontos-chave.
import {clamp} from './core';

export type Cam = {x: number; y: number; z: number; rx: number; ry: number; rz: number};
export type Key = Partial<Cam> & {t: number; e?: (x: number) => number};
const DEF: Cam = {x: 0, y: 0, z: 1, rx: 0, ry: 0, rz: 0};

/**
 * Câmera contínua: interpolação de Hermite com tangentes de Catmull-Rom no tempo, para a câmera nunca "parar e
 * recomeçar" entre pontos-chave (era isso que dava as travadinhas). Zoom em log. Chave com `stop: true` = pouso suave;
 * dois pontos com menos de 0,05 s entre eles = corte seco (sem interpolar).
 */
export const makeCam = (keys: (Key & {stop?: boolean})[]) => {
  const full: (Cam & {t: number; stop?: boolean})[] = [];
  keys.forEach((k, i) => full.push({...(i ? full[i - 1] : DEF), ...k, stop: k.stop} as Cam & {t: number; stop?: boolean}));
  const F: (keyof Cam)[] = ['x', 'y', 'z', 'rx', 'ry', 'rz'];
  const val = (c: Cam, f: keyof Cam) => (f === 'z' ? Math.log(c.z) : c[f]);
  const isCut = (i: number) => i > 0 && full[i].t - full[i - 1].t < 0.05;
  const tangent = (i: number, f: keyof Cam) => {
    if (full[i].stop || i === 0 || i === full.length - 1) return 0;
    if (isCut(i) || isCut(i + 1)) return 0;
    const a = full[i - 1], b = full[i + 1];
    return (val(b, f) - val(a, f)) / (b.t - a.t);
  };
  return (t: number): Cam => {
    if (t <= full[0].t) return full[0];
    for (let i = 0; i < full.length - 1; i++) {
      const a = full[i], b = full[i + 1];
      if (t <= b.t) {
        if (isCut(i + 1)) return a;
        const h = b.t - a.t, u = clamp((t - a.t) / h);
        const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
        const out = {} as Cam;
        F.forEach((f) => { const v = h00 * val(a, f) + h10 * h * tangent(i, f) + h01 * val(b, f) + h11 * h * tangent(i + 1, f); (out as Record<string, number>)[f] = f === 'z' ? Math.exp(v) : v; });
        return out;
      }
    }
    return full[full.length - 1];
  };
};
/** Respiração da câmera: nunca fica parada. */
export const breathe = (c: Cam, t: number, k = 1): Cam => ({...c, x: c.x + Math.sin(t * 0.41) * 8 * k, y: c.y + Math.cos(t * 0.33) * 6 * k, rx: c.rx + Math.sin(t * 0.27) * 1.2 * k, ry: c.ry + Math.cos(t * 0.23) * 1.6 * k, rz: c.rz + Math.sin(t * 0.19) * 0.5 * k});

