// Letra cinética num "campo de texto": cada palavra nasce no instante cantado, em posição/ângulo próprios;
// a câmera persegue a palavra da vez (com rastro por velocidade), como na referência. Lente com borda desfocada.
import React from 'react';
import {E, P, clamp, lerp} from '../../lib/core';
import {F} from './pieces';

export type KW = {w: string; at: number; style?: 'box' | 'accent' | 'serif' | 'big' | 'plain'; br?: boolean};
type Placed = KW & {x: number; y: number; rot: number; size: number; width: number};

// layout determinístico: linhas que descem em diagonal, cada palavra com leve rotação
const layout = (words: KW[]): Placed[] => {
  const out: Placed[] = []; let x = 0, y = 0, line = 0;
  words.forEach((w, i) => {
    const size = w.style === 'big' ? 190 : w.style === 'serif' ? 150 : w.style === 'box' ? 120 : 112;
    const width = w.w.length * size * (w.style === 'serif' ? 0.48 : 0.56) + 30;
    if (i > 0 && (w.br || x + width > 1200)) { line++; x = line * 90 - (line % 2) * 160; y += size * 1.02 + 20; }
    const rot = (((i * 37) % 9) - 4) * 1.6;
    out.push({...w, x: x + width / 2, y, rot, size, width}); x += width + 10;
  });
  return out;
};

export const Kinetic: React.FC<{t: number; words: KW[]; a: number; b: number; bg?: string; ink?: string; accent?: string}> = ({t, words, a, b, bg = '#d9dadd', ink = '#1c1d22', accent = '#8a5a12'}) => {
  const L = React.useMemo(() => layout(words), [words]);
  const camAt = (s: number) => {
    let i = 0; while (i < L.length - 1 && s >= L[i + 1].at) i++;
    const cur = L[i], prev = L[Math.max(0, i - 1)], u = E.io(clamp((s - cur.at) / 0.38));
    return {x: lerp(prev.x, cur.x, u), y: lerp(prev.y, cur.y, u), r: lerp(prev.rot, cur.rot, u)};
  };
  const c = camAt(t), c0 = camAt(t - 1 / 60), vel = Math.hypot(c.x - c0.x, c.y - c0.y);
  const intro = P(t, a, 0.35, E.out), outro = P(t, b - 0.3, 0.3, E.in);
  const zoom = lerp(1.25, 1, intro) * lerp(1, 1.6, outro);
  return (
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${bg} 30%, #6f7176 100%)`, overflow: 'hidden', opacity: 1 - outro * 0.0}}>
      <div style={{position: 'absolute', left: 540, top: 900, transform: `scale(${zoom}) rotate(${-c.r * 0.8}deg) translate(${-c.x}px, ${-c.y}px)`, filter: vel > 2 ? `blur(${Math.min(14, vel * 0.35).toFixed(1)}px)` : undefined}}>
        {L.map((w, i) => {
          if (t < w.at - 0.03) return null;
          const u = P(t, w.at, 0.3, E.out), pop = E.pop(clamp((t - w.at) / 0.32));
          const isBox = w.style === 'box', isAcc = w.style === 'accent', isSerif = w.style === 'serif';
          return (
            <div key={i} style={{position: 'absolute', left: w.x - w.width / 2, top: w.y, width: w.width, textAlign: 'center', perspective: 700}}>
              <span style={{display: 'inline-block', padding: isBox ? '0 0.18em 0.06em' : 0, background: isBox ? ink : undefined, color: isBox ? bg : isAcc ? accent : ink, fontFamily: isSerif ? F.bodoni : F.grot, fontStyle: isSerif ? 'italic' : 'normal', fontWeight: isSerif ? 400 : 900, fontSize: w.size, lineHeight: 1, letterSpacing: isSerif ? '-0.01em' : '-0.045em',
                transform: `rotate(${w.rot}deg) rotateX(${(1 - u) * -80}deg) scale(${lerp(0.6, 1, pop)})`, transformOrigin: '50% 90%', opacity: clamp(u * 3), filter: u < 0.99 ? `blur(${((1 - u) * 10).toFixed(1)}px)` : undefined,
                textShadow: isAcc ? '2px 0 rgba(255,0,90,.25), -2px 0 rgba(0,180,255,.25)' : undefined}}>{w.w}</span>
            </div>
          );
        })}
      </div>
      {/* lente: bordas desfocadas e escurecidas (abaulamento da referência) */}
      <div style={{position: 'absolute', inset: 0, backdropFilter: 'blur(7px)', WebkitMaskImage: 'radial-gradient(ellipse 62% 52% at 50% 50%, transparent 55%, black 100%)', maskImage: 'radial-gradient(ellipse 62% 52% at 50% 50%, transparent 55%, black 100%)'}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 60% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%)'}} />
    </div>
  );
};
