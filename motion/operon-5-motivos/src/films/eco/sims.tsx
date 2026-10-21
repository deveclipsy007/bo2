// Simulações desenhadas em canvas (deterministas: dependem só de t). Cada uma é uma "figura" da série.
import React, {useLayoutEffect, useRef} from 'react';
import {E, P, clamp, lerp} from '../../lib/core';
import {C} from './fx';

const W = 1080, H = 1920;
export const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());

/** canvas do tamanho do quadro, redesenhado a cada t */
const useCanvas = (draw: (g: CanvasRenderingContext2D) => void, deps: unknown[]) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const c = ref.current; if (!c) return; const g = c.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); draw(g); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
};
const Cv: React.FC<{cref: React.RefObject<HTMLCanvasElement>; style?: React.CSSProperties}> = ({cref, style}) => <canvas ref={cref} width={W} height={H} style={{position: 'absolute', inset: 0, width: W, height: H, ...style}} />;

// =====================================================================================================
// DUPLA FENDA: partículas uma a uma → franjas de interferência; "medir" → o detector liga e viram duas faixas
// =====================================================================================================
const r1 = rng(11);
const INTF: number[] = []; while (INTF.length < 7000) { const X = r1() * 2 - 1, s = 2.6 * X, sinc = Math.abs(s) < 1e-4 ? 1 : Math.sin(s) / s, I = Math.cos(10.5 * X) ** 2 * sinc * sinc; if (r1() < I) INTF.push(X); }
const TWO: number[] = Array.from({length: 4000}, () => (r1() < 0.5 ? -1 : 1) * 0.15 + gauss(r1) * 0.085);
const YS: number[] = Array.from({length: 7000}, () => r1());
const SL = {ey: 330, by: 640, sx: 64, sw: 20, py0: 830, py1: 1230, px: 430};
/** quantas partículas já chegaram, τ s depois do início */
const fired = (tau: number) => (tau < 0 ? 0 : tau < 1.5 ? Math.floor(tau / 0.3) + 1 : Math.min(7000, Math.floor(6 + Math.pow(tau - 1.5, 2.4) * 3600)));
export const DoubleSlit: React.FC<{t: number; a: number; medir: number; fg?: string}> = ({t, a, medir, fg = C.bone}) => {
  const ref = useCanvas((g) => {
    const tau = t - a, after = t - medir;
    // aparato (traço de gravura)
    g.strokeStyle = fg; g.lineWidth = 2; g.globalAlpha = 0.85 * P(t, a - 0.3, 0.5);
    g.beginPath(); g.arc(540, SL.ey, 26, 0, Math.PI * 2); g.stroke();
    for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(540 + k * 7, SL.ey - 26); g.lineTo(540 + k * 7, SL.ey - 70); g.stroke(); }
    g.beginPath(); g.moveTo(90, SL.by); g.lineTo(540 - SL.sx - SL.sw / 2, SL.by); g.moveTo(540 - SL.sx + SL.sw / 2, SL.by); g.lineTo(540 + SL.sx - SL.sw / 2, SL.by); g.moveTo(540 + SL.sx + SL.sw / 2, SL.by); g.lineTo(990, SL.by); g.stroke();
    for (let x = 96; x < 990; x += 14) { if (Math.abs(Math.abs(x - 540) - SL.sx) < SL.sw) continue; g.beginPath(); g.moveTo(x, SL.by); g.lineTo(x - 10, SL.by + 14); g.globalAlpha = 0.35; g.stroke(); }
    g.globalAlpha = 0.6; g.strokeRect(540 - SL.px - 20, SL.py0 - 20, SL.px * 2 + 40, SL.py1 - SL.py0 + 40);
    // ondas saindo das fendas (antes da medição)
    const waveA = clamp(tau / 1.2) * (1 - P(t, medir, 0.3));
    if (waveA > 0) for (const s of [-1, 1]) for (let k = 0; k < 7; k++) { const rr = ((t * 160 + k * 60) % 420); g.globalAlpha = waveA * 0.22 * (1 - rr / 420); g.lineWidth = 1.5; g.beginPath(); g.arc(540 + s * SL.sx, SL.by, rr, 0.12 * Math.PI, 0.88 * Math.PI); g.stroke(); }
    // partículas
    const n = fired(Math.min(tau, medir - a)), fade = 1 - 0.82 * P(t, medir + 0.12, 0.7, E.io);
    for (let i = 0; i < n; i++) { const X = INTF[i], x = 540 + X * SL.px, y = SL.py0 + YS[i] * (SL.py1 - SL.py0); const age = tau - (i < 5 ? i * 0.3 : 1.5 + Math.pow((i - 6) / 3600, 1 / 2.4)); const hot = age < (i < 40 ? 0.18 : 0.025) && after < 0; g.globalAlpha = (hot ? 1 : 0.78) * fade; g.fillStyle = hot ? C.or : fg; const s = hot ? 6 : 3; g.fillRect(x - s / 2, y - s / 2, s, s); }
    if (after > 0) { const m = Math.min(4000, Math.floor(Math.pow(after, 1.6) * 2600)); for (let i = 0; i < m; i++) { const x = 540 + TWO[i] * SL.px, y = SL.py0 + YS[(i * 7) % 7000] * (SL.py1 - SL.py0); g.globalAlpha = 0.85; g.fillStyle = i > m - 40 ? C.or : fg; g.fillRect(x - 1.5, y - 1.5, 3, 3); } }
    // as primeiras viajam visíveis (o ponto laranja)
    for (let i = 0; i < 5; i++) { const t0 = a + i * 0.3 - 0.55, u = (t - t0) / 0.55; if (u < 0 || u > 1) continue; const X = INTF[i], sx = 540 + (X > 0 ? 1 : -1) * SL.sx; const p = u < 0.45 ? {x: lerp(540, sx, u / 0.45), y: lerp(SL.ey, SL.by, u / 0.45)} : {x: lerp(sx, 540 + X * SL.px, (u - 0.45) / 0.55), y: lerp(SL.by, SL.py0 + YS[i] * (SL.py1 - SL.py0), (u - 0.45) / 0.55)}; g.globalAlpha = 1; g.fillStyle = C.or; g.shadowColor = C.or; g.shadowBlur = 24; g.beginPath(); g.arc(p.x, p.y, 7, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0; }
    // detector (o olho) liga nas fendas
    if (after > -0.05) { const u = P(t, medir - 0.05, 0.35, E.out); g.globalAlpha = u; g.strokeStyle = C.or; g.lineWidth = 3; g.shadowColor = C.or; g.shadowBlur = 18; const ex = 540, ey = SL.by - 150, ew = 120 * u; g.beginPath(); g.moveTo(ex - ew, ey); g.quadraticCurveTo(ex, ey - 70 * u, ex + ew, ey); g.quadraticCurveTo(ex, ey + 70 * u, ex - ew, ey); g.stroke(); g.beginPath(); g.arc(ex, ey, 30 * u, 0, Math.PI * 2); g.fillStyle = C.or; g.fill(); g.fillStyle = '#050505'; g.beginPath(); g.arc(ex, ey, 12 * u, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0; for (const s of [-1, 1]) { g.setLineDash([6, 8]); g.beginPath(); g.moveTo(ex + s * 40, ey + 40); g.lineTo(540 + s * SL.sx, SL.by - 6); g.stroke(); g.setLineDash([]); } }
    g.globalAlpha = 1;
  }, [t, fg]);
  return <Cv cref={ref} />;
};

// =====================================================================================================
// REVOADA: milhares de pássaros movendo-se como um só (campo analítico, sem líder) + um pássaro laranja
// =====================================================================================================
const r2 = rng(23);
const BIRDS = Array.from({length: 2600}, () => { let x = gauss(r2), y = gauss(r2), z = gauss(r2); const n = Math.hypot(x, y, z) || 1, r = Math.cbrt(r2()); return {x: (x / n) * r, y: (y / n) * r, z: (z / n) * r, ph: r2() * 6.28}; });
const flockPos = (b: {x: number; y: number; z: number; ph: number}, s: number) => {
  let x = b.x * 2.3, y = b.y * 0.62, z = b.z * 0.95;
  x *= 1 + 0.28 * Math.sin(s * 0.8); y *= 1 - 0.22 * Math.sin(s * 0.8 + 0.6);
  y += 0.5 * Math.sin(x * 1.25 + s * 1.3) + 0.18 * Math.sin(x * 2.9 - s * 2.0);
  x += 0.22 * Math.sin(b.y * 4 + s * 1.7);
  const th = 0.7 * Math.sin(s * 0.6) + 0.42 * x * Math.sin(s * 0.9 + 1), cy = Math.cos(th), sy = Math.sin(th); [y, z] = [y * cy - z * sy, y * sy + z * cy];
  const ph = s * 0.33 + 0.4, cp = Math.cos(ph), sp = Math.sin(ph); [x, z] = [x * cp - z * sp, x * sp + z * cp];
  return {x, y, z};
};
export const Flock: React.FC<{t: number; a: number; cx?: number; cy?: number; scale?: number; opacity?: number; color?: string; orange?: boolean; speed?: number}> = ({t, a, cx = 540, cy = 900, scale = 330, opacity = 1, color = C.bone, orange = true, speed = 1}) => {
  const ref = useCanvas((g) => {
    const s = (t - a) * 0.75 * speed + 3, s0 = s - 0.035, f = 3.3, mx = cx + Math.sin(s * 0.41) * 90, my = cy + Math.sin(s * 0.53 + 1) * 70;
    g.strokeStyle = color; g.lineCap = 'round';
    for (let i = 1; i < BIRDS.length; i++) {
      const b = BIRDS[i], p = flockPos(b, s), q = flockPos(b, s0), zc = p.z + 4.2, k = (scale * f) / zc, k0 = (scale * f) / (q.z + 4.2);
      const x = mx + p.x * k, y = my + p.y * k, x0 = mx + q.x * k0, y0 = my + q.y * k0;
      const band = 0.55 + 0.45 * Math.sin(b.x * 5 - s * 2.4), depth = clamp(1.25 - p.z * 0.45);
      g.globalAlpha = opacity * (0.25 + 0.6 * band) * depth; g.lineWidth = 1.2 + 2.2 * depth;
      const flap = Math.sin(t * 22 + b.ph) * 2.5;
      g.beginPath(); g.moveTo(x0 - (x - x0) * 0.6, y0 - (y - y0) * 0.6 + flap); g.lineTo(x, y); g.stroke();
    }
    if (orange) { const b = BIRDS[0], p = flockPos({...b, x: 0.15, y: 0.1, z: 0.3}, s), k = (scale * f) / (p.z + 4.2); g.globalAlpha = opacity; g.fillStyle = C.or; g.shadowColor = C.or; g.shadowBlur = 26; g.beginPath(); g.arc(mx + p.x * k, my + p.y * k, 7, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0; }
    g.globalAlpha = 1;
  }, [t, opacity, cx, cy, scale]);
  return <Cv cref={ref} />;
};

// =====================================================================================================
// FLORESTA: três árvores, raízes que crescem e se ligam por fios de micélio; sinais laranja viajam por eles
// =====================================================================================================
type Seg = {x1: number; y1: number; x2: number; y2: number; t0: number; t1: number; w: number; tree: number; tip: boolean};
const SEGS: Seg[] = []; const TIPS: {x: number; y: number; tree: number; t: number}[] = [];
(() => {
  const r = rng(5), GROUND = 760;
  const grow = (x: number, y: number, ang: number, len: number, depth: number, t0: number, tree: number, up: boolean) => {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len, t1 = t0 + len / 900;
    const tip = depth >= (up ? 6 : 6) || len < 9;
    SEGS.push({x1: x, y1: y, x2, y2, t0, t1, w: Math.max(0.7, (up ? 9 : 7) * Math.pow(0.7, depth)), tree, tip});
    if (tip) { if (!up) TIPS.push({x: x2, y: y2, tree, t: t1}); return; }
    const kids = r() < (up ? 0.4 : 0.25) ? 3 : 2;
    for (let k = 0; k < kids; k++) { const spread = up ? 0.55 : 0.62; const a2 = ang + (k - (kids - 1) / 2) * spread + (r() - 0.5) * 0.5 + (up ? 0 : Math.sin(x2 * 0.01) * 0.2); grow(x2, y2, up ? a2 : clamp(a2, 0.15, Math.PI - 0.15), len * (up ? 0.7 + r() * 0.16 : 0.78 + r() * 0.14), depth + 1, t1, tree, up); }
  };
  [[200, 0.25], [540, 0], [880, 0.18]].forEach(([x, d], i) => { grow(x, GROUND, Math.PI / 2 + (r() - 0.5) * 0.2, 120, 0, d, i, false); grow(x, GROUND, -Math.PI / 2 + (r() - 0.5) * 0.15, i === 1 ? 170 : 130, 0, d, i, true); });
})();
const MYC: {a: number; b: number; t0: number; bend: number}[] = (() => {
  const r = rng(9), out: {a: number; b: number; t0: number; bend: number}[] = [];
  TIPS.forEach((p, i) => TIPS.forEach((q, j) => { if (j <= i || p.tree === q.tree) return; const d = Math.hypot(p.x - q.x, p.y - q.y); if (d < 360 && r() < 0.16) out.push({a: i, b: j, t0: Math.max(p.t, q.t) + r() * 0.3, bend: (r() - 0.5) * 120}); }));
  return out;
})();
const ROOT_END = Math.max(...SEGS.map((s) => s.t1));
export const Forest: React.FC<{t: number; a: number; dur?: number; opacity?: number; pulses?: number; ground?: boolean; fg?: string}> = ({t, a, dur = 1.6, opacity = 1, pulses = 1, ground = true, fg = C.bone}) => {
  const ref = useCanvas((g) => {
    const tg = ((t - a) / dur) * ROOT_END;
    g.lineCap = 'round'; g.strokeStyle = fg;
    if (ground) { g.globalAlpha = opacity * 0.6; g.lineWidth = 2; g.beginPath(); g.moveTo(40, 760); g.lineTo(1040, 760); g.stroke(); for (let x = 50; x < 1040; x += 18) { g.globalAlpha = opacity * 0.25; g.beginPath(); g.moveTo(x, 762); g.lineTo(x - 12, 778); g.stroke(); } }
    for (const s of SEGS) { if (tg < s.t0) continue; const u = clamp((tg - s.t0) / (s.t1 - s.t0)); g.globalAlpha = opacity * (0.35 + 0.55 * clamp(s.w / 3)); g.lineWidth = s.w; g.beginPath(); g.moveTo(s.x1, s.y1); g.lineTo(lerp(s.x1, s.x2, u), lerp(s.y1, s.y2, u)); g.stroke(); }
    // micélio
    for (const m of MYC) { const p = TIPS[m.a], q = TIPS[m.b], u = clamp((tg - m.t0) / 0.5); if (u <= 0) continue; const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2 + m.bend; g.globalAlpha = opacity * 0.4; g.lineWidth = 1; g.strokeStyle = fg; g.beginPath(); g.moveTo(p.x, p.y); const N = 16; for (let k = 1; k <= N * u; k++) { const v = k / N; g.lineTo((1 - v) ** 2 * p.x + 2 * (1 - v) * v * mx + v * v * q.x, (1 - v) ** 2 * p.y + 2 * (1 - v) * v * my + v * v * q.y); } g.stroke();
      if (pulses > 0 && u >= 1) { const v = ((t * 0.9 + m.a * 0.137) % 1); g.globalAlpha = opacity * pulses; g.fillStyle = C.or; g.shadowColor = C.or; g.shadowBlur = 16; g.beginPath(); g.arc((1 - v) ** 2 * p.x + 2 * (1 - v) * v * mx + v * v * q.x, (1 - v) ** 2 * p.y + 2 * (1 - v) * v * my + v * v * q.y, 4.5, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0; } }
    g.globalAlpha = 1;
  }, [t, opacity, fg]);
  return <Cv cref={ref} />;
};

// =====================================================================================================
// REDE VIVA (o ecossistema): nós num volume, arestas por vizinhança, pulsos laranja percorrendo; gira em 3D
// =====================================================================================================
const r3 = rng(31);
const NODES = Array.from({length: 170}, (_, i) => { const u = r3() * 2 - 1, th = r3() * 6.283, rr = i < 30 ? 0.35 + r3() * 0.3 : 0.75 + r3() * 0.3, s = Math.sqrt(1 - u * u); return {x: s * Math.cos(th) * rr, y: u * rr * 1.25, z: s * Math.sin(th) * rr}; });
const EDGES: [number, number][] = []; NODES.forEach((p, i) => { NODES.map((q, j) => [j, Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z)] as [number, number]).filter(([j]) => j !== i).sort((m, n) => m[1] - n[1]).slice(0, 3).forEach(([j]) => { if (!EDGES.some(([a, b]) => (a === j && b === i))) EDGES.push([i, j]); }); });
export const Net: React.FC<{t: number; a: number; cx?: number; cy?: number; r?: number; grow?: number; alive?: number; opacity?: number; spin?: number; fg?: string}> = ({t, a, cx = 540, cy = 960, r = 420, grow = 1, alive = 1, opacity = 1, spin = 1, fg = C.bone}) => {
  const ref = useCanvas((g) => {
    const ang = (t - a) * 0.35 * spin + 0.6, ca = Math.cos(ang), sa = Math.sin(ang), tilt = 0.32, ct = Math.cos(tilt), st = Math.sin(tilt);
    const P2 = NODES.map((p) => { const x = p.x * ca - p.z * sa, z0 = p.x * sa + p.z * ca, y = p.y * ct - z0 * st, z = p.y * st + z0 * ct, k = 3 / (z + 3.4); return {x: cx + x * r * k, y: cy + y * r * k, z, k}; });
    const nE = Math.floor(EDGES.length * clamp(grow));
    g.lineCap = 'round';
    for (let e = 0; e < nE; e++) { const [i, j] = EDGES[e], p = P2[i], q = P2[j], d = clamp(1.1 - (p.z + q.z) * 0.35); g.globalAlpha = opacity * (0.12 + 0.35 * d); g.strokeStyle = fg; g.lineWidth = 1 + d; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
      if (alive > 0) { const sp = 0.6 + ((e * 0.37) % 1) * 0.9, v = ((t - a) * sp + e * 0.211) % 1; if (e % 2 === 0) { g.globalAlpha = opacity * alive * d; g.fillStyle = C.or; g.shadowColor = C.or; g.shadowBlur = 14; g.beginPath(); g.arc(lerp(p.x, q.x, v), lerp(p.y, q.y, v), 2.5 + 2 * d, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0; } } }
    P2.forEach((p, i) => { if (i / NODES.length > clamp(grow * 1.2)) return; const d = clamp(1.1 - p.z * 0.6), lit = alive * (0.5 + 0.5 * Math.sin(t * 3 + i * 1.7)); g.globalAlpha = opacity * (0.4 + 0.6 * d); g.fillStyle = lit > 0.7 ? C.or : fg; if (lit > 0.7) { g.shadowColor = C.or; g.shadowBlur = 18; } g.beginPath(); g.arc(p.x, p.y, (2.5 + 4 * d) * (i < 30 ? 1.3 : 1), 0, Math.PI * 2); g.fill(); g.shadowBlur = 0; });
    g.globalAlpha = 1;
  }, [t, grow, alive, opacity, cx, cy, r, fg]);
  return <Cv cref={ref} />;
};

// =====================================================================================================
// MÁQUINA: engrenagens em traço de gravura; travam e se desfazem em pó
// =====================================================================================================
const GEARS = [{x: 380, y: 820, r: 230, n: 24, dir: 1}, {x: 700, y: 1100, r: 150, n: 16, dir: -1}, {x: 760, y: 640, r: 110, n: 12, dir: -1}, {x: 320, y: 1250, r: 130, n: 14, dir: -1}, {x: 860, y: 1400, r: 90, n: 10, dir: 1}];
const r4 = rng(77);
const DUST = GEARS.flatMap((gr, gi) => Array.from({length: 260}, () => { const a = r4() * 6.283, rr = gr.r * (0.3 + r4() * 0.75); return {gi, a, rr, vx: (r4() - 0.5) * 900, vy: (r4() - 0.7) * 900, d: r4()}; }));
export const Gears: React.FC<{t: number; a: number; stop: number; shatter: number; opacity?: number}> = ({t, a, stop, shatter, opacity = 1}) => {
  const ref = useCanvas((g) => {
    const run = Math.min(t, stop) - a, jolt = t > stop ? Math.exp(-(t - stop) / 0.08) * Math.sin((t - stop) * 90) * 0.03 : 0, sh = t - shatter;
    g.strokeStyle = C.bone; g.lineJoin = 'round';
    GEARS.forEach((gr, gi) => {
      if (sh > 0) return;
      const rot = gr.dir * run * (1.2 * 230 / gr.r) + jolt;
      g.save(); g.translate(gr.x, gr.y); g.rotate(rot); g.globalAlpha = opacity * 0.92; g.lineWidth = 3;
      g.beginPath(); for (let k = 0; k <= gr.n * 4; k++) { const an = (k / (gr.n * 4)) * Math.PI * 2, tooth = Math.floor(k / 2) % 2 === 0 ? 1 : 0.86; g.lineTo(Math.cos(an) * gr.r * tooth, Math.sin(an) * gr.r * tooth); } g.closePath(); g.stroke();
      g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, gr.r * 0.62, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(0, 0, gr.r * 0.16, 0, Math.PI * 2); g.stroke();
      for (let k = 0; k < 6; k++) { const an = (k / 6) * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(an) * gr.r * 0.16, Math.sin(an) * gr.r * 0.16); g.lineTo(Math.cos(an) * gr.r * 0.62, Math.sin(an) * gr.r * 0.62); g.stroke(); }
      g.globalAlpha = opacity * 0.22; for (let k = 0; k < 40; k++) { const an = (k / 40) * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(an) * gr.r * 0.64, Math.sin(an) * gr.r * 0.64); g.lineTo(Math.cos(an + 0.08) * gr.r * 0.8, Math.sin(an + 0.08) * gr.r * 0.8); g.stroke(); }
      g.restore();
    });
    if (sh > 0) { const u = clamp(sh / 1.1); DUST.forEach((p) => { const gr = GEARS[p.gi], rot = gr.dir * (stop - a) * (1.2 * 230 / gr.r); const x = gr.x + Math.cos(p.a + rot) * p.rr + p.vx * u * (0.4 + p.d), y = gr.y + Math.sin(p.a + rot) * p.rr + p.vy * u * (0.4 + p.d) + 500 * u * u; g.globalAlpha = opacity * (1 - u) * 0.9; g.fillStyle = p.d < 0.06 ? C.or : C.bone; g.fillRect(x, y, 3, 3); }); }
    g.globalAlpha = 1;
  }, [t, opacity]);
  return <Cv cref={ref} />;
};

// =====================================================================================================
// ECG: linha reta (sem vida) que volta a bater
// =====================================================================================================
export const Ecg: React.FC<{t: number; beats: number[]; y?: number; color?: string; opacity?: number; draw?: number}> = ({t, beats, y = 960, color = C.mid, opacity = 1, draw = 1}) => {
  const ref = useCanvas((g) => {
    g.strokeStyle = color; g.lineWidth = 4; g.globalAlpha = opacity; g.shadowColor = color; g.shadowBlur = color === C.or ? 20 : 0; g.beginPath();
    const X1 = 1080 * draw;
    for (let x = 0; x <= X1; x += 3) {
      const tx = t - (1080 - x) / 900; let v = 0;
      beats.forEach((b) => { const d = tx - b; if (d > -0.05 && d < 0.35) v += (d < 0.03 ? -0.15 * (d + 0.05) / 0.08 : d < 0.07 ? 1.0 * Math.sin(((d - 0.03) / 0.04) * Math.PI) : d < 0.13 ? -0.35 * Math.sin(((d - 0.07) / 0.06) * Math.PI) : 0.12 * Math.sin(((d - 0.13) / 0.22) * Math.PI)); });
      const yy = y - v * 260; if (x === 0) g.moveTo(x, yy); else g.lineTo(x, yy);
    }
    g.stroke(); g.shadowBlur = 0; g.globalAlpha = 1;
  }, [t, opacity, color, draw]);
  return <Cv cref={ref} />;
};

// =====================================================================================================
// O OLHO (fim): pálpebras abrem, íris de fibras laranja, pupila responde
// =====================================================================================================
const r5 = rng(51);
const FIB = Array.from({length: 260}, () => ({a: r5() * 6.283, r0: 0.28 + r5() * 0.12, r1: 0.8 + r5() * 0.2, w: 0.6 + r5() * 1.6, c: r5()}));
export const Eye: React.FC<{t: number; open: number; pupil: number; cx?: number; cy?: number; R?: number; opacity?: number; grid?: number; spiral?: number; hourglass?: number}> = ({t, open, pupil, cx = 540, cy = 900, R = 300, opacity = 1, grid = 0, spiral = 0, hourglass = 0}) => {
  const ref = useCanvas((g) => {
    const o = clamp(open), lw = 2.5;
    g.globalAlpha = opacity; g.strokeStyle = C.bone; g.lineWidth = lw;
    // contorno das pálpebras (amêndoa)
    const ew = R * 1.9, eh = R * 1.05 * o;
    g.save(); g.beginPath(); g.moveTo(cx - ew, cy); g.bezierCurveTo(cx - ew * 0.5, cy - eh * 1.25, cx + ew * 0.5, cy - eh * 1.25, cx + ew, cy); g.bezierCurveTo(cx + ew * 0.5, cy + eh * 1.25, cx - ew * 0.5, cy + eh * 1.25, cx - ew, cy); g.closePath(); g.stroke(); g.clip();
    // íris
    const pr = R * lerp(0.12, 0.34, clamp(pupil));
    const grd = g.createRadialGradient(cx, cy, pr, cx, cy, R * 0.95); grd.addColorStop(0, '#7a2a08'); grd.addColorStop(0.35, C.or); grd.addColorStop(0.8, '#b8400f'); grd.addColorStop(1, '#2a0d03');
    g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, R * 0.95, 0, Math.PI * 2); g.fill();
    FIB.forEach((f) => { g.strokeStyle = f.c < 0.5 ? C.orHi : '#3a1204'; g.globalAlpha = opacity * (0.35 + 0.4 * f.c); g.lineWidth = f.w; const a2 = f.a + Math.sin(t * 0.7 + f.a * 3) * 0.02; g.beginPath(); g.moveTo(cx + Math.cos(a2) * Math.max(pr, f.r0 * R), cy + Math.sin(a2) * Math.max(pr, f.r0 * R)); g.lineTo(cx + Math.cos(a2 + 0.05) * f.r1 * R * 0.95, cy + Math.sin(a2 + 0.05) * f.r1 * R * 0.95); g.stroke(); });
    // reflexo do tema do episódio na íris (ex.: o tabuleiro no Nº 03)
    if (grid > 0) { g.save(); g.beginPath(); g.arc(cx, cy, R * 0.95, 0, Math.PI * 2); g.clip(); g.globalAlpha = opacity * grid; g.fillStyle = '#fff3e6'; const sq = R * 0.16, x0 = cx - R * 0.7, y0 = cy - R * 0.55; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 0) { const sk = 1 - r * 0.045; g.fillRect(x0 + c * sq * sk + r * sq * 0.18, y0 + r * sq * 0.72, sq * sk * 0.96, sq * 0.7); } g.restore(); }
    // espiral áurea (Fibonacci) refletida na íris
    if (spiral > 0) { g.save(); g.beginPath(); g.arc(cx, cy, R * 0.95, 0, Math.PI * 2); g.clip(); g.globalAlpha = opacity * spiral; g.strokeStyle = '#fff3e6'; g.lineWidth = 2.2; const b = Math.log(1.618034) / (Math.PI / 2), rot = t * 0.12, ox = cx + R * 0.12, oy = cy + R * 0.06; g.beginPath(); for (let k = 0; k <= 240; k++) { const th = -14 + (k / 240) * 14, r = R * 0.86 * Math.exp(b * th); const x = ox + Math.cos(th + rot) * r, y = oy + Math.sin(th + rot) * r; if (k) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); g.restore(); }
    // ampulheta refletida na íris
    if (hourglass > 0) { g.save(); g.beginPath(); g.arc(cx, cy, R * 0.95, 0, Math.PI * 2); g.clip(); g.globalAlpha = opacity * hourglass; g.strokeStyle = '#fff3e6'; g.lineWidth = 2.4; const hx = cx + R * 0.36, hy = cy - R * 0.08, hh = R * 0.42, hw = R * 0.22; g.beginPath(); g.moveTo(hx - hw, hy - hh); g.lineTo(hx + hw, hy - hh); g.quadraticCurveTo(hx + hw, hy - hh * 0.2, hx + 3, hy); g.quadraticCurveTo(hx + hw, hy + hh * 0.2, hx + hw, hy + hh); g.lineTo(hx - hw, hy + hh); g.quadraticCurveTo(hx - hw, hy + hh * 0.2, hx - 3, hy); g.quadraticCurveTo(hx - hw, hy - hh * 0.2, hx - hw, hy - hh); g.stroke(); g.restore(); }
    g.globalAlpha = opacity; g.fillStyle = '#050505'; g.beginPath(); g.arc(cx, cy, pr, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(cx - R * 0.28, cy - R * 0.3, R * 0.09, R * 0.06, -0.5, 0, Math.PI * 2); g.fill();
    // sombra da pálpebra
    const sh = g.createLinearGradient(0, cy - eh, 0, cy - eh * 0.2); sh.addColorStop(0, 'rgba(0,0,0,.85)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(cx - ew, cy - eh * 1.3, ew * 2, eh * 1.1);
    g.restore();
    // hachuras de gravura em volta
    g.strokeStyle = C.bone; g.globalAlpha = opacity * 0.28; g.lineWidth = 1.2;
    for (let k = 0; k < 46; k++) { const v = k / 45, x = cx - ew + v * ew * 2, top = cy - eh * 1.25 * Math.sin(v * Math.PI) * 0.75; g.beginPath(); g.moveTo(x, top - 30 - 40 * Math.sin(v * Math.PI)); g.lineTo(x + 18, top - 6); g.stroke(); }
    g.globalAlpha = 1;
  }, [t, open, pupil, opacity, cx, cy, R, grid, spiral, hourglass]);
  return <Cv cref={ref} />;
};
