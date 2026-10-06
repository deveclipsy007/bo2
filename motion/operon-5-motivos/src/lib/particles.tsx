// Nanopartículas Operon em 3D: nuvens que formam ícones, palavras, a silhueta do hook e a logo, e voam de uma forma para a outra.
// Determinístico: cada partícula é função do tempo (sem simulação), então todo quadro renderiza igual em qualquer aba.
import React, {useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {FONTS} from '../brand/tokens';

export const N = 12000;
const rnd = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const io = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export type Shape = string; // 'lupa' | 'q' | 'track' | 'ring' | 'balao' | 'perfil' | 'check' | 'pasta' | 'rede' | 'orbita' | 'ruido' | 'seta' | 'text:...' | 'img:...'
export type KF = {t: number; shape: Shape; cx: number; cy: number; w: number; h?: number; z?: number; spread?: number; tr?: number};

const IMG: Record<string, HTMLImageElement> = {};
const draw = (c: CanvasRenderingContext2D, kind: Shape, S: number, H: number) => {
  c.fillStyle = '#fff'; c.strokeStyle = '#fff'; c.lineCap = 'round'; c.lineJoin = 'round';
  const u = S / 100; c.save(); c.scale(u, u);
  const ring = (x: number, y: number, r: number, lw: number) => { c.lineWidth = lw; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke(); };
  if (kind === 'lupa') { ring(42, 40, 24, 7); c.lineWidth = 10; c.beginPath(); c.moveTo(60, 58); c.lineTo(84, 82); c.stroke(); }
  if (kind === 'q') { c.font = `800 92px ${FONTS.display}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 50, 54); }
  if (kind === 'track') { c.lineWidth = 3; c.beginPath(); c.roundRect(4, 38, 92, 24, 12); c.stroke(); c.beginPath(); c.arc(16, 50, 7, 0, Math.PI * 2); c.fill(); }
  if (kind === 'ring') { ring(50, 50, 38, 9); ring(50, 50, 27, 1.5); }
  if (kind === 'balao') { c.beginPath(); c.roundRect(10, 18, 80, 54, 14); c.fill(); c.beginPath(); c.moveTo(28, 68); c.lineTo(22, 88); c.lineTo(46, 71); c.fill(); c.globalCompositeOperation = 'destination-out'; c.fillRect(24, 36, 52, 5); c.fillRect(24, 50, 34, 5); }
  if (kind === 'perfil') { c.beginPath(); c.arc(50, 34, 17, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(16, 92); c.bezierCurveTo(16, 62, 32, 56, 50, 56); c.bezierCurveTo(68, 56, 84, 62, 84, 92); c.closePath(); c.fill(); }
  if (kind === 'check') { for (let k = 0; k < 3; k++) { c.lineWidth = 5; c.beginPath(); c.roundRect(10, 14 + k * 27, 18, 18, 4); c.stroke(); c.beginPath(); c.moveTo(13, 23 + k * 27); c.lineTo(18, 28 + k * 27); c.lineTo(26, 17 + k * 27); c.stroke(); c.fillRect(36, 20 + k * 27, 52 - k * 8, 6); } }
  if (kind === 'pasta') { c.beginPath(); c.moveTo(8, 26); c.lineTo(38, 26); c.lineTo(46, 35); c.lineTo(92, 35); c.lineTo(92, 82); c.quadraticCurveTo(92, 88, 86, 88); c.lineTo(14, 88); c.quadraticCurveTo(8, 88, 8, 82); c.closePath(); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.roundRect(16, 44, 68, 36, 4); c.fill(); c.globalCompositeOperation = 'source-over'; c.fillRect(24, 52, 50, 4); c.fillRect(24, 62, 38, 4); c.fillRect(24, 72, 44, 4); }
  if (kind === 'rede') { const n = [[50, 50], [16, 20], [84, 22], [14, 78], [86, 76], [50, 8], [50, 92]]; c.lineWidth = 2.6; c.beginPath(); for (let i = 1; i < n.length; i++) { c.moveTo(50, 50); c.lineTo(n[i][0], n[i][1]); } c.moveTo(16, 20); c.lineTo(84, 22); c.moveTo(14, 78); c.lineTo(86, 76); c.stroke(); n.forEach((p, i) => { c.beginPath(); c.arc(p[0], p[1], i ? 5 : 8, 0, Math.PI * 2); c.fill(); }); }
  if (kind === 'orbita') { [42, 30, 18].forEach((r, i) => { c.lineWidth = 4 - i; c.beginPath(); c.ellipse(50, 50, r, r * (0.36 + i * 0.2), i * 0.6, 0, Math.PI * 2); c.stroke(); }); c.beginPath(); c.arc(50, 50, 6, 0, Math.PI * 2); c.fill(); }
  if (kind === 'ruido') { for (let i = 0; i < 520; i++) { const s = 0.4 + rnd(i, 9) * 1.2; c.fillRect(rnd(i, 3) * 100, rnd(i, 4) * 100, s, s); } }
  if (kind === 'seta') { c.beginPath(); c.moveTo(6, 44); c.lineTo(62, 44); c.lineTo(62, 26); c.lineTo(96, 50); c.lineTo(62, 74); c.lineTo(62, 56); c.lineTo(6, 56); c.closePath(); c.fill(); }
  if (kind === 'mira') { ring(50, 50, 40, 5); ring(50, 50, 26, 3); c.lineWidth = 4; c.beginPath(); c.moveTo(50, 2); c.lineTo(50, 20); c.moveTo(50, 80); c.lineTo(50, 98); c.moveTo(2, 50); c.lineTo(20, 50); c.moveTo(80, 50); c.lineTo(98, 50); c.stroke(); c.beginPath(); c.arc(50, 50, 6, 0, Math.PI * 2); c.fill(); }
  if (kind === 'camera') { c.beginPath(); c.roundRect(8, 28, 84, 56, 10); c.fill(); c.beginPath(); c.roundRect(32, 18, 36, 14, 4); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(50, 56, 19, 0, Math.PI * 2); c.fill(); c.globalCompositeOperation = 'source-over'; c.beginPath(); c.arc(50, 56, 11, 0, Math.PI * 2); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(54, 52, 4, 0, Math.PI * 2); c.fill(); }
  if (kind === 'engrenagem') { c.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 44 : 33; c.lineTo(50 + Math.cos(a) * r, 50 + Math.sin(a) * r); } c.closePath(); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(50, 50, 14, 0, Math.PI * 2); c.fill(); }
  if (kind === 'grafico') { [[12, 62, 14, 30], [32, 48, 14, 44], [52, 34, 14, 58], [72, 16, 14, 76]].forEach(([x, y, w, h]) => { c.beginPath(); c.roundRect(x, y, w, h, 3); c.fill(); }); c.lineWidth = 3; c.beginPath(); c.moveTo(8, 95); c.lineTo(94, 95); c.stroke(); }
  if (kind === 'envelope') { c.beginPath(); c.roundRect(8, 22, 84, 58, 8); c.fill(); c.globalCompositeOperation = 'destination-out'; c.lineWidth = 5; c.beginPath(); c.moveTo(12, 28); c.lineTo(50, 56); c.lineTo(88, 28); c.stroke(); }
  if (kind === 'telefone') { c.beginPath(); c.moveTo(24, 10); c.bezierCurveTo(14, 14, 8, 26, 14, 42); c.bezierCurveTo(24, 66, 38, 80, 58, 88); c.bezierCurveTo(72, 94, 86, 88, 90, 78); c.lineTo(76, 64); c.lineTo(64, 70); c.bezierCurveTo(52, 64, 40, 52, 34, 40); c.lineTo(40, 28); c.closePath(); c.fill(); c.lineWidth = 4; [16, 26].forEach((r) => { c.beginPath(); c.arc(62, 36, r, -Math.PI / 2, 0); c.stroke(); }); }
  if (kind === 'pessoas3') { [[22, 0.8], [50, 1], [78, 0.8]].forEach(([x, k]) => { c.beginPath(); c.arc(x, 40 - (k - 0.8) * 30, 11 * k, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(x - 18 * k, 86); c.bezierCurveTo(x - 18 * k, 64, x - 8, 58, x, 58 - (k - 0.8) * 20); c.bezierCurveTo(x + 8, 58, x + 18 * k, 64, x + 18 * k, 86); c.closePath(); c.fill(); }); }
  if (kind === 'camadas') { for (let i = 0; i < 4; i++) { c.globalAlpha = 0.55 + i * 0.15; c.beginPath(); c.moveTo(50, 14 + i * 18); c.lineTo(92, 30 + i * 18); c.lineTo(50, 46 + i * 18); c.lineTo(8, 30 + i * 18); c.closePath(); c.fill(); } c.globalAlpha = 1; }
  if (kind === 'cadeado') { c.lineWidth = 8; c.beginPath(); c.arc(50, 40, 18, Math.PI, 0); c.stroke(); c.beginPath(); c.roundRect(24, 40, 52, 46, 8); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(50, 58, 6, 0, Math.PI * 2); c.fill(); c.fillRect(47, 60, 6, 14); }
  if (kind === 'coracao') { c.beginPath(); c.moveTo(50, 86); c.bezierCurveTo(10, 60, 6, 30, 26, 20); c.bezierCurveTo(40, 13, 48, 22, 50, 30); c.bezierCurveTo(52, 22, 60, 13, 74, 20); c.bezierCurveTo(94, 30, 90, 60, 50, 86); c.fill(); }
  if (kind === 'janela') { c.lineWidth = 3.4; c.beginPath(); c.roundRect(6, 14, 88, 72, 8); c.stroke(); c.fillRect(6, 26, 88, 2.4); [0, 1, 2].forEach((k) => { c.beginPath(); c.arc(12 + k * 5, 20, 1.6, 0, Math.PI * 2); c.fill(); }); c.fillRect(12, 34, 16, 46); [[34, 34, 26, 18], [64, 34, 24, 18], [34, 58, 54, 22]].forEach(([x, y, w, h]) => { c.beginPath(); c.roundRect(x, y, w, h, 3); c.fill(); }); }
  if (kind === 'orbital') { c.beginPath(); c.roundRect(36, 38, 28, 24, 5); c.fill(); [[46, 16, -0.35], [40, 13, 0.5]].forEach(([rx, ry, a]) => { c.lineWidth = 2.2; c.beginPath(); c.ellipse(50, 50, rx, ry, a, 0, Math.PI * 2); c.stroke(); }); [[50 + 46 * Math.cos(0.6), 50 + 16 * Math.sin(0.6)], [14, 58], [78, 30], [30, 76]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 4.2, 0, Math.PI * 2); c.fill(); }); }
  if (kind === 'blocos') { [[10, 60, 36, 26], [50, 60, 40, 26], [10, 28, 24, 26], [38, 28, 52, 26]].forEach(([x, y, w, h], i) => { c.globalAlpha = 0.7 + i * 0.1; c.beginPath(); c.roundRect(x, y, w, h, 4); c.fill(); }); c.globalAlpha = 1; }
  if (kind === 'chat') { c.beginPath(); c.roundRect(8, 12, 62, 34, 12); c.fill(); c.beginPath(); c.roundRect(30, 54, 62, 30, 12); c.fill(); c.globalCompositeOperation = 'destination-out'; [18, 30, 42].forEach((x) => { c.beginPath(); c.arc(x + 4, 29, 3.4, 0, Math.PI * 2); c.fill(); }); }
  c.restore();
  if (kind.startsWith('text:')) { const txt = kind.slice(5); c.textAlign = 'center'; c.textBaseline = 'middle'; let fs = H * 0.8; c.font = `800 ${fs}px ${FONTS.display}`; while (c.measureText(txt).width > S * 0.96) { fs *= 0.95; c.font = `800 ${fs}px ${FONTS.display}`; } c.fillText(txt, S / 2, H / 2); }
  if (kind.startsWith('img:')) { const im = IMG[kind.slice(4)]; if (im) c.drawImage(im, 0, 0, S, H); }
};
const sample = (kind: Shape, aspect: number, gap: number): Float32Array => {
  const S = 560, H = Math.round(S * aspect);
  const cv = document.createElement('canvas'); cv.width = S; cv.height = H;
  const c = cv.getContext('2d', {willReadFrequently: true})!;
  draw(c, kind, S, H);
  const d = c.getImageData(0, 0, S, H).data, pts: number[] = [];
  const isMask = kind.includes('mask');
  for (let y = 0; y < H; y += gap) for (let x = 0; x < S; x += gap) {
    const o = (y * S + x) * 4; const v = isMask ? d[o] : d[o + 3];
    if (v > 110) pts.push(x / S - 0.5, y / H - 0.5);
  }
  // embaralhamento determinístico
  const n = pts.length / 2, idx = Array.from({length: n}, (_, i) => i).sort((a, b) => rnd(a, 77) - rnd(b, 77));
  const out = new Float32Array(n * 2); idx.forEach((k, i) => { out[i * 2] = pts[k * 2]; out[i * 2 + 1] = pts[k * 2 + 1]; });
  return out;
};

export type PCam = {yaw: number; pitch: number; roll: number; zoom: number; x: number; y: number};
const DUST = 1700;
/** Desenha a nuvem: canvas nítido + cópia desfocada (brilho). */
export const ParticleField: React.FC<{t: number; kfs: KF[]; cam: PCam; images: string[]; color?: [number, number, number]; accent?: [number, number, number]; accent2?: [number, number, number]; opacity?: number; blend?: 'lighter' | 'source-over'}> = ({t, kfs, cam, images, color = [246, 244, 236], accent = [46, 190, 110], accent2 = [255, 205, 70], opacity = 1, blend = 'lighter'}) => {
  const a = useRef<HTMLCanvasElement>(null), b = useRef<HTMLCanvasElement>(null);
  const [sets, setSets] = useState<Record<string, Float32Array> | null>(null);
  const [handle] = useState(() => delayRender('nanoparticulas'));
  useLayoutEffect(() => {
    let alive = true;
    (async () => {
      await document.fonts.load(`800 200px ${FONTS.display}`);
      await document.fonts.ready;
      await Promise.all(images.map((src) => new Promise<void>((res) => { const im = new Image(); im.onload = () => { IMG[src] = im; res(); }; im.onerror = () => res(); im.src = staticFile(src); })));
      const out: Record<string, Float32Array> = {};
      for (const k of kfs) { const key = `${k.shape}|${(k.h ?? k.w) / k.w}`; if (!out[key]) out[key] = sample(k.shape, (k.h ?? k.w) / k.w, k.shape.startsWith('img:') ? 3 : 3); }
      if (alive) { setSets(out); continueRender(handle); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(() => {
    if (!sets || !a.current || !b.current) return;
    const W = 1080, Hh = 1920, F = 1100;
    const c = a.current.getContext('2d')!; c.clearRect(0, 0, W, Hh); c.globalCompositeOperation = blend;
    // forma alvo atual
    let k = 0; for (let i = 0; i < kfs.length; i++) if (t >= kfs[i].t - (kfs[i].tr ?? 1)) k = i;
    const to = kfs[k], from = kfs[Math.max(0, k - 1)], tr = to.tr ?? 1;
    const sTo = sets[`${to.shape}|${(to.h ?? to.w) / to.w}`], sFrom = sets[`${from.shape}|${(from.h ?? from.w) / from.w}`];
    const pos = (kf: KF, st: Float32Array, i: number) => {
      const n = st.length / 2, j = i % n, h = kf.h ?? kf.w;
      return [kf.cx + st[j * 2] * kf.w, kf.cy + st[j * 2 + 1] * h, kf.z ?? 0];
    };
    const ya = cam.yaw * Math.PI / 180, pa = cam.pitch * Math.PI / 180, ra = cam.roll * Math.PI / 180;
    const cy = Math.cos(ya), sy = Math.sin(ya), cp = Math.cos(pa), sp = Math.sin(pa), cr = Math.cos(ra), sr = Math.sin(ra);
    const proj = (x: number, y: number, z: number) => {
      x -= cam.x; y -= cam.y;
      const xr = x * cy - z * sy, zr = x * sy + z * cy;
      const yr = y * cp - zr * sp, zz = y * sp + zr * cp;
      const den = F + zz; if (den < 60) return null;
      const sc = (F / den) * cam.zoom;
      const px = xr * sc, py = yr * sc;
      return [540 + px * cr - py * sr, 960 + px * sr + py * cr, sc, zz] as const;
    };
    // poeira de profundidade (paralaxe)
    for (let i = 0; i < DUST; i++) {
      const x = (rnd(i, 31) - 0.5) * 3400, y = (rnd(i, 32) - 0.5) * 3800 + Math.sin(t * 0.2 + i) * 20, z = -900 + rnd(i, 33) * 2900 + ((t * 30 * (0.3 + rnd(i, 34))) % 400);
      const q = proj(x, y, z); if (!q) continue;
      const [X, Y, sc, zz] = q; if (X < -10 || X > W + 10 || Y < -10 || Y > Hh + 10) continue;
      const near = zz < -300;
      const al = (near ? 0.18 : 0.32 * (1 - clamp((zz - 600) / 1800))) * opacity;
      const r = (near ? 2.5 : 0.8 + rnd(i, 35)) * sc;
      c.fillStyle = `rgba(${accent[0]},${accent[1] + 40},${accent[2] + 30},${al.toFixed(3)})`;
      c.fillRect(X - r / 2, Y - r / 2, r, r);
    }
    const settledT = clamp((t - to.t) / 0.6);
    for (let i = 0; i < N; i++) {
      const nA = sFrom.length / 2, nB = sTo.length / 2;
      const layA = Math.floor(i / nA) % 3, layB = Math.floor(i / nB) % 3;
      const A = pos(from, sFrom, i), Bp = pos(to, sTo, i);
      // espessura: a forma tem 3 camadas de profundidade; dispersão só durante a viagem
      A[2] = (from.z ?? 0) + (layA - 1) * 26 + (rnd(i, 7) - 0.5) * 14;
      Bp[2] = (to.z ?? 0) + (layB - 1) * 26 + (rnd(i, 7) - 0.5) * 14;
      const d = rnd(i, 3) * 0.38 * tr;
      const u = k === 0 ? 1 : io(clamp((t - (to.t - tr) - d) / (tr * 0.62)));
      const sw = Math.sin(u * Math.PI);
      const spr = (to.spread ?? 220) / 220;
      let x = A[0] + (Bp[0] - A[0]) * u + sw * (rnd(i, 11) - 0.5) * 520 * spr;
      let y = A[1] + (Bp[1] - A[1]) * u + sw * (rnd(i, 12) - 0.5) * 520 * spr;
      let z = A[2] + (Bp[2] - A[2]) * u + sw * (rnd(i, 13) - 0.5) * 1300 * spr;
      const jit = 2.2 * (1 - settledT * 0.6);
      x += Math.sin(t * (0.6 + rnd(i, 5)) + i) * jit; y += Math.cos(t * (0.5 + rnd(i, 6)) + i) * jit;
      const q = proj(x, y, z); if (!q) continue;
      const [X, Y, sc, zz] = q;
      if (X < -20 || X > W + 20 || Y < -20 || Y > Hh + 20) continue;
      const fog = 1 - clamp((zz - 700) / 2000);
      const edge = layB === 1 ? 1 : 0.62;
      const al = clamp(sc * 0.95) * fog * (0.55 + rnd(i, 8) * 0.45) * opacity * edge;
      if (al < 0.02) continue;
      const gr = rnd(i, 9);
      const col = gr < 0.12 ? accent : gr < 0.2 ? accent2 : color;
      c.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${al.toFixed(3)})`;
      const r = (0.8 + rnd(i, 10) * 1.3) * sc * (1 + sw * 0.6);
      c.fillRect(X - r / 2, Y - r / 2, r, r);
      if (rnd(i, 14) < 0.06 && sw < 0.3) { c.fillStyle = `rgba(255,255,255,${(al * 0.9).toFixed(3)})`; c.fillRect(X - r * 0.35, Y - r * 0.35, r * 0.7, r * 0.7); }
    }
    const g2 = b.current.getContext('2d')!; g2.clearRect(0, 0, W, Hh); g2.filter = 'blur(9px)'; g2.globalAlpha = 0.95; g2.drawImage(a.current, 0, 0); g2.filter = 'none';
  });
  return (
    <>
      <canvas ref={b} width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: blend === 'lighter' ? 'screen' : 'multiply'}} />
      <canvas ref={a} width={1080} height={1920} style={{position: 'absolute', inset: 0}} />
    </>
  );
};
