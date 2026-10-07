// HOOK GRAVADO (gramática C): o vídeo do fundador com palavras gigantes ATRÁS dele (recorte por matting), cards de vidro,
// legenda cinética por palavra, punch-ins nas palavras fortes; saída: o vídeo vira card no espaço.
import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {COLORS, FONTS} from '../../brand/tokens';
import {E, P, clamp, lerp, Icon, INK, ACC} from '../../lib/ui';
import {BEHIND, CAPTIONS, HOOK_OUT, T, W, H} from './story';

const CARDS: [string, string, string, number, number, number][] = [
  ['Seu sistema', 'proprietário', 'grid', 60, 250, T('sistema') - 0.1],
  ['Inteligência', 'conectada', 'orbit', 700, 335, T('inteligente') - 0.15],
];
const HookCard: React.FC<{t: number; i: number}> = ({t, i}) => {
  const [n, sub, ic, x, y, a] = CARDS[i], p = P(t, a, 0.6, E.out), q = P(t, HOOK_OUT - 0.2, 0.4, E.in);
  if (p <= 0 || q >= 1) return null;
  const left = x < 540, f = Math.sin(t * 1.6 + i) * 6;
  return (
    <div style={{position: 'absolute', left: x, top: y + f, width: 320, perspective: 1000, opacity: clamp(p * 1.8) * (1 - q), filter: p < 0.99 || q > 0 ? `blur(${(1 - p) * 14 + q * 10}px)` : undefined}}>
      <div style={{padding: '20px 24px', borderRadius: 28, background: i === 1 ? `linear-gradient(160deg, ${ACC}, #2a3fd6)` : 'rgba(12,12,14,.52)', backdropFilter: 'blur(18px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25), 0 0 0 1px rgba(255,255,255,.14), 0 30px 60px rgba(0,0,0,.35)', color: '#fff', fontFamily: FONTS.body,
        transform: `rotateY(${(left ? 1 : -1) * (1 - p) * 55 + (left ? 8 : -8)}deg) translateX(${(left ? -1 : 1) * (1 - p) * 120}px) scale(${lerp(0.85, 1, p)})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}><span style={{display: 'flex', opacity: 0.9}}><Icon k={ic} s={30} /></span><span style={{fontFamily: FONTS.display, fontWeight: 700, fontSize: 33, letterSpacing: '-0.03em'}}>{n}</span></div>
        <div style={{fontSize: 25, opacity: 0.8, marginTop: 6, whiteSpace: 'nowrap'}}>{sub}</div>
      </div>
    </div>
  );
};

const pad = (n: number) => String(n).padStart(4, '0');
const HOOK_FRAMES = 161;

export const Hook: React.FC<{t: number}> = ({t}) => {
  if (t > HOOK_OUT + 1.1) return null;
  const card = P(t, HOOK_OUT, 0.85, E.io), gone = P(t, HOOK_OUT + 0.72, 0.3, E.in);
  const z = 1 + 0.04 * P(t, BEHIND[0].at, 0.18, E.out) + 0.05 * P(t, BEHIND[1].at, 0.18, E.out) + 0.07 * P(t, BEHIND[2].at, 0.18, E.out) + lerp(0.16, 0, E.out(clamp(t / 0.75)));
  const open = P(t, 0, 0.4, E.out);
  const kick = BEHIND.reduce((s, b, i) => { const d = t - b.at; return d >= 0 && d < 0.25 ? s + Math.exp(-d / 0.07) * (i === 2 ? 5 : 2.5) : s; }, 0);
  let ci = -1; CAPTIONS.forEach((c, i) => { if (t >= c[0].at - 0.05) ci = i; });
  const chunk = ci >= 0 ? CAPTIONS[ci] : [];
  const tag = Math.min(P(t, 0.25, 0.5, E.out), 1 - P(t, HOOK_OUT - 0.3, 0.3, E.in));
  const away = P(t, HOOK_OUT + 0.6, 0.6, E.in);
  const sc = lerp(1, 0.42, card) * lerp(1, 0.9, away), r = lerp(0, 70, card), ry = lerp(0, -16, card) + away * 10, ty = lerp(0, -60, card);
  const fi = Math.min(HOOK_FRAMES, Math.floor(t * 30) + 1);
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 800, opacity: 1 - gone, filter: gone > 0.01 ? `blur(${gone * 14}px)` : undefined}}>
      <div style={{position: 'absolute', inset: 0, perspective: 1800}}>
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${ty}px) rotateY(${ry}deg) scale(${sc})`, borderRadius: r / sc, overflow: 'hidden', boxShadow: card > 0 ? `0 0 0 ${2 / sc}px rgba(255,255,255,.25), 0 ${60 / sc}px ${120 / sc}px rgba(0,0,0,.6)` : undefined}}>
          <div style={{position: 'absolute', inset: 0, transformOrigin: '540px 900px', transform: `translate(${Math.sin(t * 90) * kick}px, ${Math.cos(t * 70) * kick * 0.6}px) scale(${z})`, filter: open < 0.99 ? `blur(${((1 - open) * 14).toFixed(1)}px)` : undefined}}>
            <OffthreadVideo src={staticFile('video/hook-bg-blur.mp4')} muted style={{position: 'absolute', inset: 0, width: W, height: H, filter: 'brightness(.84) contrast(1.05) saturate(1.04)'}} />
            <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 55% at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,.35) 100%)'}} />
            {/* palavras gigantes atrás da pessoa, uma por vez (a anterior sai antes da próxima entrar) */}
            {BEHIND.map((b, i) => {
              const nx = BEHIND[i + 1]?.at ?? HOOK_OUT - 0.05;
              const p = clamp((t - b.at) / 0.34), e = 1 - Math.pow(1 - p, 3), q = P(t, nx - 0.14, 0.16, E.in);
              if (p <= 0 || q >= 1) return null;
              const size = Math.min(210, 960 / (b.w.length * 0.74));
              const sweep = P(t, b.at + 0.05, 0.7, E.io);
              const glow = i === 2 ? `drop-shadow(0 0 40px ${ACC}) drop-shadow(0 0 90px ${ACC}aa)` : 'drop-shadow(0 22px 50px rgba(0,0,0,.3))';
              const fill: React.CSSProperties = {background: `linear-gradient(100deg, #ffffff 0%, #ffffff 38%, ${i === 2 ? '#bfe9ff' : '#d9e2ff'} 50%, #ffffff 62%, #ffffff 100%)`, backgroundSize: '320% 100%', backgroundPosition: `${lerp(100, 0, sweep)}% 0`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};
              const [num, ...rest] = b.w.split(' ');
              const isNum = /^\d$/.test(num) && rest.length > 0;
              return <div key={b.w} style={{position: 'absolute', left: 0, right: 0, top: 585 - size / 2, textAlign: 'center', fontFamily: FONTS.display, fontWeight: 800, fontSize: size, letterSpacing: '-0.055em', lineHeight: 1, opacity: clamp(p * 3) * (1 - q), transform: `perspective(900px) translateY(${(1 - e) * 90 - q * 120}px) rotateX(${(1 - e) * 62 - q * 30}deg) scale(${lerp(1.18, 1, e) * lerp(1, 0.92, q)})`, transformOrigin: '50% 100%', filter: `${p < 1 || q > 0 ? `blur(${(1 - e) * 16 + q * 18}px) ` : ''}${glow}`, whiteSpace: 'nowrap'}}>
                {isNum ? <><span style={{...fill, fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 400, fontSize: '1.22em', letterSpacing: '-0.02em', paddingRight: '0.12em'}}>{num}</span><span style={fill}>{rest.join(' ')}</span></> : <span style={fill}>{b.w}</span>}
              </div>;
            })}
            <Img src={staticFile(`video/hook-fg/${pad(fi)}.png`)} style={{position: 'absolute', inset: 0, width: W, height: H, filter: 'contrast(1.07) saturate(1.06) brightness(1.03) drop-shadow(0 30px 60px rgba(0,0,0,.35))'}} />
          </div>
          {[0, 1].map((i) => <HookCard key={i} t={t} i={i} />)}
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 62%, rgba(0,0,0,.5) 100%)'}} />
          {tag > 0 && <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', opacity: tag, transform: `translateY(${(1 - tag) * -20}px)`}}><div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 28px', borderRadius: 999, background: 'rgba(10,10,12,.45)', backdropFilter: 'blur(14px)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.2)', color: '#fff', fontFamily: FONTS.body, fontSize: 28, fontWeight: 600}}><span style={{width: 12, height: 12, borderRadius: 6, background: ACC, boxShadow: `0 0 12px ${ACC}`, opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 3))}} />Operon · 5 motivos</div></div>}
          <div style={{position: 'absolute', left: 50, right: 50, top: 1470, textAlign: 'center', opacity: 1 - P(t, HOOK_OUT - 0.1, 0.3)}}>
            <div style={{display: 'inline-block', fontFamily: FONTS.display, fontWeight: 700, fontSize: 86, lineHeight: 1.1, letterSpacing: '-0.045em', color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,0.5)'}}>
              {chunk.map((wd, i) => {
                const e = P(t, wd.at, 0.4, E.out), sp = i > 0 ? ' ' : '';
                if (e <= 0.001) return <React.Fragment key={`${ci}-${i}`}>{sp}<span style={{visibility: 'hidden'}}>{wd.w}</span></React.Fragment>;
                const boxed = wd.k === 'g' || wd.k === 'y', box = boxed ? P(t, wd.at, 0.32, E.out) : 0, bg = wd.k === 'y' ? ACC : '#fff', fg = wd.k === 'y' ? '#fff' : INK;
                return <React.Fragment key={`${ci}-${i}`}>{sp}<span style={{position: 'relative', display: 'inline-block', opacity: Math.min(1, e * 2.4), transform: `translateY(${(1 - e) * 0.35}em)`, filter: e < 0.99 ? `blur(${(1 - e) * 12}px)` : undefined}}>{box > 0 && <span style={{position: 'absolute', left: '-0.12em', right: '-0.12em', top: '0.04em', bottom: '-0.04em', background: bg, borderRadius: '0.12em', transform: `scaleX(${box})`, transformOrigin: '0 50%', boxShadow: '0 10px 30px rgba(0,0,0,.25)'}} />}<span style={{position: 'relative', color: box > 0.5 ? fg : undefined, ...(wd.k === 'em' ? {fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em', fontSize: '1.1em'} : {})}}>{wd.w}</span></span></React.Fragment>;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export {COLORS};
