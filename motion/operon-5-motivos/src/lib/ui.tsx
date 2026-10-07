// Peças de interface do Operon Motion System (padrão Marta / "O que é a Operon"): texto por palavra, vidro, checks, ícones, Fluffy.
import React from 'react';
import {COLORS, FONTS} from '../brand/tokens';
import {E, P, clamp, lerp} from './core';
import {Mascot, MascotPose, OM} from '../mascot/Mascot';
import {W, H, sync} from '../films/cinco/story';

export {E, P, clamp, lerp};
export const INK = COLORS.ink, PAPER = COLORS.paper, ACC = COLORS.blue, ACC2 = COLORS.blueSoft, AMBER = COLORS.amber, CYAN = COLORS.cyan, MUTE = COLORS.muted;
export const rnd = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

export const blurIn = (t: number, a: number, d = 0.55, dy = 40): React.CSSProperties => { const p = P(t, a, d, E.out); return {opacity: clamp(p * 1.8), transform: `translateY(${(1 - p) * dy}px) scale(${lerp(0.94, 1, p)})`, filter: p < 0.99 ? `blur(${(1 - p) * 16}px)` : undefined}; };
/** Entrada 3D: o bloco vem do fundo, inclinado, e assenta de frente (perspectiva própria, sem depender do pai). */
export const rise3d = (t: number, a: number, d = 0.8, dir = 1): React.CSSProperties => { const p = P(t, a, d, E.out), s = E.settle(clamp((t - a) / d)); return {opacity: clamp(p * 1.7), transform: `perspective(1400px) translateY(${(1 - p) * 70}px) translateZ(${(1 - s) * -280}px) rotateX(${(1 - s) * 34}deg) rotateY(${(1 - s) * 10 * dir}deg)`, filter: p < 0.99 ? `blur(${(1 - p) * 14}px)` : undefined}; };
/** Reflexo que atravessa o vidro uma vez quando o card assenta (luz com direção, não brilho constante). */
export const Sheen: React.FC<{t: number; a: number; d?: number; strength?: number; radius?: number}> = ({t, a, d = 1.1, strength = 0.22, radius = 34}) => {
  const u = P(t, a, d, E.io); if (u <= 0 || u >= 1) return null;
  return <div style={{position: 'absolute', inset: 0, borderRadius: radius, pointerEvents: 'none', background: `linear-gradient(112deg, rgba(255,255,255,0) 38%, rgba(255,255,255,${strength}) 50%, rgba(255,255,255,0) 62%)`, backgroundSize: '260% 100%', backgroundPosition: `${lerp(130, -30, u)}% 0`, mixBlendMode: 'screen', zIndex: 5}} />;
};
export const outBlur = (t: number, a: number, d = 0.32): React.CSSProperties => { const q = P(t, a, d, E.in); return {opacity: 1 - q, filter: q > 0.01 ? `blur(${q * 12}px)` : undefined}; };

// ---------- tipografia sincronizada à voz ----------
export type Wd = {t: string; em?: 'box' | 'serif' | 'strike' | 'blue'; at?: number};
export const Say: React.FC<{lines: Wd[][]; t: number; from: number; out: number; y: number; size: number; color: string; boxBg?: string; boxFg?: string; z?: number; align?: 'center' | 'left'; weight?: number; lh?: number; strikeColor?: string; blueColor?: string}> = ({lines, t, from, out, y, size, color, boxBg = color, boxFg = PAPER, z = 50, align = 'center', weight = 650, lh = 1.12, strikeColor = AMBER, blueColor = ACC}) => {
  if (t < from - 0.2 || t > out + 0.8) return null;
  const words = lines.flat().flatMap((s) => s.t.split(' ').filter(Boolean));
  const ats = sync(words.join(' '), from);
  let k = 0;
  return (
    <div style={{position: 'absolute', left: align === 'left' ? 90 : 40, right: 40, top: y, textAlign: align, fontFamily: FONTS.display, fontWeight: weight, fontSize: size, lineHeight: lh, letterSpacing: '-0.045em', color, zIndex: z, transform: 'translateZ(70px)'}}>
      {lines.map((ln, li) => (
        <div key={li} style={{whiteSpace: 'nowrap', perspective: 700}}>
          {ln.map((seg, si) => seg.t.split(' ').filter(Boolean).map((word, wi) => {
            const i = k++, a = ats[Math.min(i, ats.length - 1)];
            const p = P(t, a, 0.5, E.out), q = P(t, out + i * 0.018, 0.32, E.in);
            const sp = (si > 0 || wi > 0) ? ' ' : '';
            if (p <= 0.001 || q >= 0.999) return <React.Fragment key={`${si}-${wi}`}>{sp}<span style={{visibility: 'hidden'}}>{word}</span></React.Fragment>;
            const box = seg.em === 'box' ? P(t, a - 0.02, 0.38, E.out) : 0;
            const st = seg.em === 'strike' ? P(t, seg.at ?? a + 0.35, 0.35, E.out) : 0;
            return (
              <React.Fragment key={`${si}-${wi}`}>
                {sp}
                <span style={{position: 'relative', display: 'inline-block', opacity: Math.min(1, p * 2.4) * (1 - q), transform: `translateY(${((1 - p) * 0.38 - q * 0.25).toFixed(3)}em) rotateX(${((1 - E.settle(clamp((t - a) / 0.6))) * -78 + q * 40).toFixed(1)}deg)`, transformOrigin: '50% 85%', filter: p < 0.99 || q > 0.01 ? `blur(${((1 - p) * 14 + q * 10).toFixed(1)}px)` : undefined}}>
                  {box > 0 && <span style={{position: 'absolute', left: '-0.12em', right: '-0.12em', top: '0.06em', bottom: '-0.02em', background: boxBg, borderRadius: '0.12em', transform: `scaleX(${box})`, transformOrigin: '0 50%'}} />}
                  <span style={{position: 'relative', color: box > 0.5 ? boxFg : seg.em === 'blue' ? blueColor : undefined, ...(seg.em === 'serif' ? {fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em', fontSize: '1.1em'} : {}), opacity: st > 0.5 ? 0.55 : 1}}>{word}</span>
                  {st > 0 && <span style={{position: 'absolute', left: '-0.08em', top: '52%', height: '0.09em', width: `calc((100% + 0.16em) * ${st})`, background: strikeColor, borderRadius: 4, boxShadow: `0 0 18px ${strikeColor}88`}} />}
                </span>
              </React.Fragment>
            );
          }))}
        </div>
      ))}
    </div>
  );
};

// ---------- superfícies ----------
export const Glass: React.FC<{dark?: boolean; style?: React.CSSProperties; children?: React.ReactNode}> = ({dark = true, style, children}) => (
  <div style={{position: 'absolute', borderRadius: 34, background: dark ? 'linear-gradient(180deg, rgba(34,34,38,.92), rgba(18,18,20,.94))' : '#ffffff', boxShadow: dark ? 'inset 0 1px 0 rgba(255,255,255,.1), 0 0 0 1px rgba(255,255,255,.07), 0 40px 90px rgba(0,0,0,.55)' : '0 1px 0 rgba(0,0,0,.04), 0 24px 60px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.05)', color: dark ? '#fff' : INK, fontFamily: FONTS.body, overflow: 'hidden', ...style}}>{children}</div>
);
export const Check: React.FC<{u: number; size?: number; ring?: string; fill?: string}> = ({u, size = 44, ring = 'rgba(255,255,255,.28)', fill = ACC}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, flexShrink: 0, boxShadow: `inset 0 0 0 2px ${u > 0.02 ? fill : ring}`, background: u > 0.02 ? fill : 'transparent', transform: `scale(${u > 0 ? lerp(0.7, 1, E.pop(clamp(u))) : 1})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    {u > 0.02 && <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(u * 1.6)} /></svg>}
  </div>
);
export const Sparkle: React.FC<{u: number; size?: number; color?: string}> = ({u, size = 34, color = '#fff'}) => (u <= 0 || u >= 1 ? null : (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `scale(${Math.sin(u * Math.PI) * 1.2}) rotate(${u * 120}deg)`}}><path d="M12 1 L14 10 L23 12 L14 14 L12 23 L10 14 L1 12 L10 10 Z" fill={color} /></svg>
));
export const Icon: React.FC<{k: string; s?: number; c?: string; sw?: number}> = ({k, s = 40, c = 'currentColor', sw = 1.7}) => {
  const p: Record<string, React.ReactNode> = {
    doc: <><rect x={5} y={3} width={14} height={18} rx={2.5} /><path d="M8.5 8h7M8.5 12h7M8.5 16h4.5" /></>,
    check: <><rect x={3.5} y={3.5} width={17} height={17} rx={4} /><path d="M8 12.3l2.8 2.8L16.5 9" /></>,
    chart: <><path d="M4 19h16" /><path d="M5 15l4-4 3.5 3 6.5-7" /></>,
    users: <><circle cx={9} cy={8.5} r={3.2} /><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6" /><circle cx={16.5} cy={9.5} r={2.6} /><path d="M16 14.6c2.3.1 4 1.5 4.5 4.1" /></>,
    lock: <><rect x={5} y={10.5} width={14} height={10} rx={2.5} /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
    gear: <><circle cx={12} cy={12} r={3.2} /><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1" /></>,
    grid: <><rect x={4} y={4} width={7} height={7} rx={1.5} /><rect x={13} y={4} width={7} height={7} rx={1.5} /><rect x={4} y={13} width={7} height={7} rx={1.5} /><rect x={13} y={13} width={7} height={7} rx={1.5} /></>,
    repeat: <path d="M4 11V9a3 3 0 0 1 3-3h11l-3-3M20 13v2a3 3 0 0 1-3 3H6l3 3" />,
    search: <><circle cx={11} cy={11} r={6} /><path d="M20 20l-4.5-4.5" /></>,
    chat: <path d="M4 5h16v11H9l-5 4z" />,
    box: <><path d="M3.5 8L12 4l8.5 4-8.5 4z" /><path d="M3.5 8v8L12 20l8.5-4V8M12 12v8" /></>,
    orbit: <><circle cx={12} cy={12} r={2.6} /><ellipse cx={12} cy={12} rx={9.5} ry={4} transform="rotate(-20 12 12)" /></>,
    user: <><circle cx={12} cy={8} r={3.6} /><path d="M5 20c.8-3.8 3.6-5.6 7-5.6s6.2 1.8 7 5.6" /></>,
    bolt: <path d="M13 2L5 13.5h6L10 22l9-12h-6z" />,
    house: <><path d="M3.5 11.5L12 4l8.5 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M10 19.5v-5h4v5" /></>,
    key: <><circle cx={8} cy={14} r={3.6} /><path d="M10.6 11.4L20 2.5M16 6.5l2.5 2.5M13.5 9l2 2" /></>,
    link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 10 18.7l1-1" /></>,
    pin: <><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11z" /><circle cx={12} cy={10} r={2.4} /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    cross: <path d="M6 6l12 12M18 6L6 18" />,
    hand: <><path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 10.5V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v8c0 4-2.5 6-5.5 6S6 18 5 15l-1.5-3.5a1.5 1.5 0 0 1 2.6-1.3L8 12" /></>,
    tag: <><path d="M3.5 12.5V4.5h8l9 9-8 8z" /><circle cx={8} cy={9} r={1.3} /></>,
    layers: <><path d="M12 3.5L21 8l-9 4.5L3 8z" /><path d="M3 12.5l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" /></>,
    flow: <><circle cx={5.5} cy={6} r={2.3} /><circle cx={18.5} cy={12} r={2.3} /><circle cx={5.5} cy={18} r={2.3} /><path d="M7.7 6.5C13 6.5 13 11.5 16.2 11.8M7.7 17.5C13 17.5 13 12.5 16.2 12.2" /></>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{p[k]}</svg>;
};

// ---------- progresso 1–5 (page control no estilo iOS) ----------
export const Dots: React.FC<{t: number; idx: number; a: number; out?: number; dark?: boolean}> = ({t, idx, a, out = 1e9, dark = true}) => {
  const p = P(t, a - 0.35, 0.5, E.out), q = P(t, out, 0.3, E.in);
  const rgb = dark ? '255,255,255' : '11,11,12';
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 176, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, opacity: p * (1 - q), transform: `translateZ(90px) translateY(${(1 - p) * -14}px)`, zIndex: 60}}>
      {[0, 1, 2, 3, 4].map((i) => {
        const grow = i === idx ? P(t, a, 0.6, E.settle) : i === idx - 1 ? 1 - P(t, a, 0.5, E.out) : 0;
        return <div key={i} style={{width: 12 + 42 * grow, height: 12, borderRadius: 6, background: `rgba(${rgb},${i === idx ? 0.95 : i < idx ? 0.55 : 0.2})`}} />;
      })}
    </div>
  );
};
/** Numeral fantasma em serifa itálica, atrás do palco (profundidade). */
export const GhostNum: React.FC<{t: number; n: string; a: number; out?: number; rgb?: string; alpha?: number; x?: number; y?: number; size?: number}> = ({t, n, a, out = 1e9, rgb = '255,255,255', alpha = 0.05, x = 560, y = 760, size = 1150}) => {
  const p = P(t, a, 1.1, E.out), q = P(t, out, 0.4, E.in);
  return <div style={{position: 'absolute', left: x - 500, top: y - size * 0.55, width: 1000, textAlign: 'center', fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: size, lineHeight: 1, color: `rgba(${rgb},${alpha})`, opacity: p * (1 - q), transform: `translateZ(-320px) translate(${Math.sin(t * 0.3) * 16}px, ${(1 - p) * 60 + Math.cos(t * 0.25) * 10}px) scale(${lerp(1.08, 1, p) * 1.2})`, filter: p < 0.99 ? `blur(${(1 - p) * 20}px)` : undefined, zIndex: 2, pointerEvents: 'none'}}>{n}</div>;
};

// ---------- Fluffy ----------
export const Fluffy: React.FC<{pose: MascotPose; x: number; y: number; s: number; id: string; dark?: boolean; o?: number; z?: number; flip?: boolean}> = ({pose, x, y, s, id, dark, o = 1, z = 60, flip}) => (o <= 0.001 ? null : (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible', zIndex: z, opacity: o}}><Mascot pose={{...pose, theme: dark ? 'dark' : 'light', glow: dark ? 0.55 : 0, shadow: dark ? 0.45 : 0.14}} x={x} y={y} s={s} id={id} flip={flip} /></svg>
));
/** Sequência de poses [início, animação(t)]; cada troca é misturada em 0,35 s (OM.mix). */
export const fl = (t: number, list: [number, (t: number) => MascotPose][]) => { let i = 0; while (i < list.length - 1 && t >= list[i + 1][0]) i++; const [a, f] = list[i]; return i === 0 ? f(t) : OM.mix(list[i - 1][1](t), f(t), E.io(clamp((t - a) / 0.35))); };
export {OM};
export type {MascotPose};
