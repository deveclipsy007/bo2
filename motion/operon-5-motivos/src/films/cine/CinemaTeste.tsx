// Estilo Cinema, teste de linguagem (≈19 s): cenas reais de filmes e séries escolhidas pelo significado da frase.
// Componentes: palavra 3D atrás do personagem (recorte), punch com eco, colagem de cards em 3D, palavra que se monta
// letra por letra, montagem rápida no ritmo da voz, rack focus, legendas cinéticas e crédito de cada título na tela.
// O mesmo código renderiza 16:9 (YouTube) e 9:16 (Reels): o enquadramento sai do ponto de foco de cada cena.
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {E, P, clamp, lerp} from '../../lib/core';
import {useFonts} from '../../lib/fonts';
import WORDS from './words_teste.json';

export const FPS = 60;
export const VO = 0.5;
export const CINE_TESTE_DUR = Math.round(19.0 * FPS);
const WS = (WORDS as [string, number, number][]).map(([w, a, b]) => ({w: w.toLowerCase().replace(/[.,?…]/g, ''), raw: w, a: a + VO, b: b + VO}));
const w = (word: string, n = 1) => { let k = 0; for (const x of WS) if (x.w === word && ++k === n) return x.a; throw new Error('palavra ' + word); };
const T = {poder: w('poder'), mais: w('mais'), alto: w('alto'), esta2: w('está', 2), construir: w('construir'), ninguem: w('ninguém'), ignorar: w('ignorar'),
  enquanto: w('enquanto'), maioria: w('maioria'), espera: w('espera'), momento: w('momento'), certo: w('certo'), alguem: w('alguém'), construindo: w('construindo'), futuro: w('futuro')};

const C = {ink: '#07070a', bone: '#f3efe6', dim: '#a29e96', or: '#ff5a1f', orHi: '#ffb27a'};
const F = {big: "Fraunces, Georgia, serif", cap: "'Inter Tight', 'Inter', sans-serif", mono: "'Plex Mono', ui-monospace, monospace"};
const src = (n: string) => staticFile(`cine/img/${n}`);
const SIZE: Record<string, [number, number]> = {tommy: [1280, 720], gritos: [1280, 720], caminhada: [1280, 720], torre: [1280, 720], cidade: [1280, 720],
  michael: [998, 574], vito: [998, 574], porta: [998, 574], pregao: [1920, 800], auditorio: [1024, 427], espera: [1024, 427], maos: [1024, 427]};
const hash = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** cena em tela cheia, recortada pelo ponto de foco (fx, fy); o recorte do personagem usa a mesma geometria */
const Plate: React.FC<{n: string; t?: number; fx?: number; fy?: number; zoom?: number; dx?: number; dy?: number; blur?: number; cut?: boolean; opacity?: number}> = ({n, fx = 0.5, fy = 0.5, zoom = 1, dx = 0, dy = 0, blur = 0, cut, opacity = 1}) => {
  const {width: W, height: H} = useVideoConfig();
  const [iw, ih] = SIZE[n], s = Math.max(W / iw, H / ih) * zoom, w = iw * s, h = ih * s;
  const left = clamp(W / 2 - fx * w + dx, W - w, 0), top = clamp(H / 2 - fy * h + dy, H - h, 0);
  return <Img src={src(cut ? `${n}_cut.png` : `${n}.jpg`)} style={{position: 'absolute', left, top, width: w, height: h, opacity, filter: blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : undefined}} />;
};

/** palavra monumental num plano 3D (pode ficar atrás do recorte do personagem) */
const Word: React.FC<{text: string; size: number; x: number; y: number; p: number; out?: number; rx?: number; ry?: number; color?: string; glow?: boolean; track?: string}> = ({text, size, x, y, p, out = 0, rx = 0, ry = 0, color = C.bone, glow, track = '-0.02em'}) => {
  if (p <= 0 || out >= 1) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y - size * 0.62, perspective: 1400, opacity: clamp(p * 1.6) * (1 - out)}}>
      <div style={{position: 'relative', left: x - 4000, width: 8000, textAlign: 'center', fontFamily: F.big, fontWeight: 900, fontSize: size, lineHeight: 1.1, letterSpacing: track, color, whiteSpace: 'nowrap',
        transform: `translateY(${((1 - p) * size * 0.35).toFixed(1)}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${lerp(0.94, 1, p) * lerp(1, 1.06, out)})`,
        filter: p < 0.98 || out > 0 ? `blur(${((1 - p) * 16 + out * 12).toFixed(1)}px)` : undefined, textShadow: glow ? `0 0 50px ${C.or}99, 0 0 140px ${C.or}55` : '0 10px 60px rgba(0,0,0,.55)'}}>{text}</div>
    </div>
  );
};

/** crédito do título na tela (o nome do filme ou da série aparece em todo plano) */
const Credit: React.FC<{text: string; t: number; a: number; b: number}> = ({text, t, a, b}) => {
  const {width: W, height: H} = useVideoConfig(), v = H > W;
  const u = P(t, a + 0.15, 0.4, E.out) * (1 - P(t, b - 0.3, 0.25));
  if (u <= 0) return null;
  return <div style={{position: 'absolute', left: v ? 56 : 72, top: v ? 150 : 56, fontFamily: F.mono, fontSize: v ? 22 : 20, letterSpacing: '0.2em', color: C.bone, opacity: 0.8 * u, display: 'flex', alignItems: 'center', gap: 12}}><span style={{width: 8, height: 8, borderRadius: 4, background: C.or}} />{text}</div>;
};

/** legendas cinéticas: a frase entra palavra por palavra; a palavra da vez fica laranja */
const GROUPS: [number, number][] = [[0, 9], [9, 17], [17, 24], [24, 30]];
const Captions: React.FC<{t: number; hide?: number}> = ({t, hide = 0}) => {
  const {width: W, height: H} = useVideoConfig(), v = H > W;
  const g = GROUPS.findIndex(([a, b], i) => t >= WS[a].a - 0.12 && (i === GROUPS.length - 1 ? t < WS[b - 1].b + 1.2 : t < WS[GROUPS[i + 1][0]].a - 0.12));
  if (g < 0 || hide >= 1) return null;
  const [a, b] = GROUPS[g], fade = 1 - P(t, (g === GROUPS.length - 1 ? WS[b - 1].b + 0.9 : WS[GROUPS[g + 1][0]].a - 0.3), 0.18);
  const cur = WS.slice(a, b).reduce((k, x, i) => (t >= x.a - 0.03 ? i : k), -1);
  return (
    <div style={{position: 'absolute', left: W * 0.08, right: W * 0.08, top: v ? H * 0.76 : H - 170, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: v ? '6px 16px' : '4px 16px', opacity: fade * (1 - hide)}}>
      {WS.slice(a, b).map((x, i) => {
        const u = P(t, x.a - 0.06, 0.2, E.out);
        return <span key={i} style={{fontFamily: F.cap, fontWeight: 800, fontSize: v ? 62 : 54, lineHeight: 1.15, color: i === cur ? C.or : C.bone, opacity: u, transform: `translateY(${((1 - u) * 18).toFixed(1)}px) scale(${i === cur ? 1.06 : 1})`, textShadow: '0 4px 24px rgba(0,0,0,.85)', display: 'inline-block'}}>{x.raw.replace(/[.,…]$/, '')}</span>;
      })}
    </div>
  );
};

const Vignette: React.FC<{k?: number}> = ({k = 0.75}) => <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${k}) 100%)`}} />;
const Grain: React.FC<{frame: number}> = ({frame}) => {
  const {width: W, height: H} = useVideoConfig();
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.08, mixBlendMode: 'screen', pointerEvents: 'none'}}><filter id="cg"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 89} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.5 -0.25" /></filter><rect width={W} height={H} filter="url(#cg)" /></svg>;
};
const fit = (text: string, base: number, W: number, k = 0.86) => Math.min(base, (W * k) / (text.length * 0.74));
const win = (t: number, a: number, b: number, fin = 0.12, fout = 0.12) => P(t, a, fin) * (1 - P(t, b - fout, fout));

/** card com perspectiva (colagem 3D) */
const Card: React.FC<{n: string; x: number; y: number; w: number; p: number; rx?: number; ry?: number; z?: number; fx?: number; fy?: number; fromX?: number; glow?: boolean; children?: React.ReactNode}> = ({n, x, y, w: cw, p, rx = 0, ry = 0, z = 0, fx = 0.5, fy = 0.5, fromX = 0, glow, children}) => {
  if (p <= 0) return null;
  const [iw, ih] = SIZE[n], ch = cw * 0.62, s = Math.max(cw / iw, ch / ih), iw2 = iw * s, ih2 = ih * s;
  return (
    <div style={{position: 'absolute', left: x - cw / 2, top: y - ch / 2, width: cw, height: ch, transformStyle: 'preserve-3d', opacity: clamp(p * 1.4),
      transform: `translate3d(${((1 - p) * fromX).toFixed(1)}px, 0, ${(z - (1 - p) * 600).toFixed(1)}px) rotateX(${rx}deg) rotateY(${(ry + (1 - p) * (fromX > 0 ? -40 : fromX < 0 ? 40 : 0)).toFixed(2)}deg)`,
      borderRadius: 14, overflow: 'hidden', boxShadow: `0 40px 90px rgba(0,0,0,.65)${glow ? `, 0 0 0 2px ${C.or}, 0 0 60px ${C.or}55` : ', 0 0 0 1px rgba(255,255,255,.12)'}`}}>
      <Img src={src(`${n}.jpg`)} style={{position: 'absolute', width: iw2, height: ih2, left: clamp(cw / 2 - fx * iw2, cw - iw2, 0), top: clamp(ch / 2 - fy * ih2, ch - ih2, 0)}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,.14), rgba(255,255,255,0) 40%)'}} />
      {children}
    </div>
  );
};

export const CinemaTeste: React.FC<{audio: 'none' | 'mix'}> = ({audio}) => {
  useFonts();
  const frame = useCurrentFrame(), t = frame / FPS;
  const {width: W, height: H} = useVideoConfig(), v = H > W, U = Math.min(W, H) / 1080;
  const ws = v ? 1 : 1.25;                                   // escala das palavras monumentais por formato

  // ---- 1 · Tommy e PODER atrás dele
  const s1 = win(t, 0, T.mais - 0.04, 0.5, 0.04);
  const z1 = lerp(1.04, 1.13, P(t, 0, T.mais, E.io));
  // ---- 2 · "mais alto": punch com eco, depois o plano vira card e voa para o fundo
  const s2a = T.mais - 0.04, s2b = T.esta2 - 0.15;
  const punch = P(t, s2a, 0.22, E.out), away = P(t, T.alto + 0.45, 0.75, E.in);
  const shake = t > s2a && t < s2a + 0.5 ? Math.sin(t * 90) * 14 * (1 - P(t, s2a, 0.5)) : 0;
  // ---- 3 · colagem: Michael, Vito e a torre de Succession em 3D
  const s3a = T.esta2 - 0.25, s3b = T.ignorar - 0.2;
  const cm = P(t, s3a, 0.7, E.out), cv = P(t, s3a + 0.18, 0.7, E.out), ct = P(t, T.construir - 0.12, 0.8, E.out);
  const zoomThru = P(t, T.ninguem + 0.15, T.ignorar - T.ninguem - 0.2, E.in);
  const dolly = lerp(-5, 5, P(t, s3a, s3b - s3a, E.io));
  // ---- 4 · a cidade e IGNORAR montado letra por letra
  const s4a = T.ignorar - 0.35, s4b = T.enquanto - 0.06;
  // ---- 5 · montagem rápida no ritmo da voz e ESPERANDO num plano em perspectiva
  const cuts: [number, string, number, number, string][] = [[T.enquanto - 0.06, 'auditorio', 0.5, 0.55, 'A REDE SOCIAL · 2010'], [T.maioria - 0.04, 'pregao', 0.5, 0.5, 'O LOBO DE WALL STREET · 2013'], [T.espera - 0.04, 'espera', 0.5, 0.6, 'A REDE SOCIAL · 2010'], [T.momento - 0.04, 'porta', 0.42, 0.5, 'O PODEROSO CHEFÃO · 1972']];
  const s5b = T.alguem - 0.45;
  const ci = cuts.reduce((k, c, i) => (t >= c[0] ? i : k), -1);
  // ---- 6 · as mãos construindo (rack focus)
  const s6a = T.alguem - 0.45, s6b = T.futuro - 0.75;
  // ---- 7 · Tommy caminhando e FUTURO atrás dele; fim
  const s7a = T.futuro - 0.75, end = 17.35;

  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      {/* 1 */}
      {s1 > 0 && <AbsoluteFill style={{opacity: s1}}>
        <Plate n="tommy" fx={0.5} fy={0.42} zoom={z1} />
        {!v && <Word text="PODER" size={fit('PODER', 300 * ws, W)} x={W / 2} y={H * 0.36} p={P(t, T.poder - 0.12, 0.55, E.out)} rx={8} />}
        <Plate n="tommy" cut fx={0.5} fy={0.42} zoom={z1} />
        {v && <Word text="PODER" size={fit('PODER', 300, W)} x={W / 2} y={H * 0.6} p={P(t, T.poder - 0.12, 0.55, E.out)} rx={8} />}
        <Vignette />
        <Credit text="PEAKY BLINDERS · 2013" t={t} a={0} b={T.mais} />
      </AbsoluteFill>}
      {/* 2 */}
      {t >= s2a && t < s2b && <AbsoluteFill style={{perspective: 1600}}>
        <AbsoluteFill style={{transform: `translateZ(${(-away * 1400).toFixed(0)}px) rotateY(${(away * 28).toFixed(1)}deg) rotateZ(${(away * -6).toFixed(1)}deg)`, opacity: 1 - P(t, T.alto + 0.9, 0.3), borderRadius: away * 24, overflow: 'hidden'}}>
          <Plate n="gritos" fx={0.5} fy={0.45} zoom={lerp(1.28, 1.08, punch)} dx={shake} />
          {[0.22, 0.45, 1].map((o, i) => <Word key={i} text="MAIS ALTO" size={fit('MAIS ALTO', 190 * ws, W, 0.92)} x={W / 2 + (2 - i) * 10} y={H * 0.5 + (2 - i) * -26 * ws} p={P(t, s2a + i * 0.05, 0.18, E.out)} color={i === 2 ? C.bone : C.or} />)}
          <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: 0.55 * (1 - P(t, s2a, 0.12))}} />
          <Vignette k={0.6} />
        </AbsoluteFill>
        <Credit text="PEAKY BLINDERS · 2013" t={t} a={s2a} b={T.alto + 0.6} />
      </AbsoluteFill>}
      {/* 3 */}
      {t >= s3a && t < s3b + 0.2 && <AbsoluteFill>
        <Plate n="torre" fx={0.5} fy={0.5} zoom={1.25} blur={22} opacity={0.4 * cm} />
        <div style={{position: 'absolute', inset: 0, background: 'rgba(7,7,10,.45)'}} />
        <AbsoluteFill style={{perspective: 1700 * U, transformStyle: 'preserve-3d'}}>
          <AbsoluteFill style={{transformStyle: 'preserve-3d', transform: `rotateY(${dolly}deg) translateZ(${(zoomThru * 900).toFixed(0)}px)`}}>
            <Word text="CONSTRUIR" size={fit('CONSTRUIR', 210 * ws, W, 0.95)} x={W / 2} y={v ? H * 0.7 : H * 0.74} p={P(t, T.construir - 0.08, 0.5, E.out)} rx={58} color={C.bone} />
            {v ? <>
              <Card n="michael" x={W * 0.5} y={H * 0.18} w={W * 0.78} p={cm} ry={-10} rx={6} z={-120} fromX={-W} fx={0.4} />
              <Card n="vito" x={W * 0.5} y={H * 0.56} w={W * 0.78} p={cv} ry={10} rx={-6} z={-120} fromX={W} fx={0.3} />
              <Card n="torre" x={W * 0.5} y={H * 0.37} w={W * 0.92} p={ct} z={60} glow />
            </> : <>
              <Card n="michael" x={W * 0.22} y={H * 0.44} w={W * 0.34} p={cm} ry={22} z={-160} fromX={-W * 0.6} fx={0.4} />
              <Card n="vito" x={W * 0.78} y={H * 0.44} w={W * 0.34} p={cv} ry={-22} z={-160} fromX={W * 0.6} fx={0.3} />
              <Card n="torre" x={W * 0.5} y={H * 0.42} w={W * 0.4} p={ct} z={80} glow />
            </>}
          </AbsoluteFill>
        </AbsoluteFill>
        <div style={{position: 'absolute', inset: 0, background: '#000', opacity: P(t, s3b - 0.15, 0.2)}} />
        <Credit text={t < T.construir ? 'O PODEROSO CHEFÃO · 1972' : 'SUCCESSION · 2018'} t={t} a={s3a} b={s3b} />
      </AbsoluteFill>}
      {/* 4 */}
      {t >= s4a && t < s4b && <AbsoluteFill style={{opacity: win(t, s4a, s4b, 0.25, 0.1)}}>
        <Plate n="cidade" fx={0.5} fy={0.55} zoom={lerp(1.15, 1.04, P(t, s4a, s4b - s4a, E.out))} />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,7,10,.15), rgba(7,7,10,.55))'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: v ? H * 0.42 : H * 0.36, textAlign: 'center', perspective: 1200, whiteSpace: 'nowrap'}}>
          {'IGNORAR'.split('').map((ch, i) => {
            const u = P(t, T.ignorar - 0.12 + i * 0.035, 0.42, E.out), r = hash(i + 3);
            return <span key={i} style={{display: 'inline-block', fontFamily: F.big, fontWeight: 900, fontSize: fit('IGNORAR', 230 * ws, W), lineHeight: 1, color: C.bone, opacity: clamp(u * 1.5) * (1 - P(t, s4b - 0.25, 0.2)),
              transform: `translate3d(${((1 - u) * (r - 0.5) * 900).toFixed(0)}px, ${((1 - u) * (hash(i + 9) - 0.5) * 600).toFixed(0)}px, ${((1 - u) * -900).toFixed(0)}px) rotate(${((1 - u) * (r - 0.5) * 90).toFixed(1)}deg)`,
              filter: u < 0.97 ? `blur(${((1 - u) * 14).toFixed(1)}px)` : undefined, textShadow: '0 10px 60px rgba(0,0,0,.6)'}}>{ch}</span>;
          })}
        </div>
        <Vignette />
        <Credit text="SUCCESSION · 2018" t={t} a={s4a} b={s4b} />
      </AbsoluteFill>}
      {/* 5 */}
      {ci >= 0 && t < s5b + 0.1 && <AbsoluteFill>
        {(() => { const [a, n, fx, fy] = cuts[ci], k = P(t, a, 0.45, E.out), last = ci === cuts.length - 1;
          return <Plate n={n} fx={fx} fy={fy} zoom={last ? lerp(1.12, 1.24, P(t, a, s5b - a, E.io)) : lerp(1.16, 1.05, k)} dx={last ? 0 : (1 - k) * (ci % 2 ? -60 : 60)} />; })()}
        <div style={{position: 'absolute', inset: 0, background: 'rgba(7,7,10,.3)'}} />
        <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: 0.35 * (1 - P(t, cuts[ci][0], 0.07))}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: v ? H * 0.34 : H * 0.3, perspective: 1100, textAlign: 'center'}}>
          <div style={{display: 'inline-block', fontFamily: F.big, fontWeight: 900, fontSize: fit('ESPERANDO', 200 * ws, W, v ? 0.72 : 0.6), letterSpacing: '0.02em', color: C.bone, whiteSpace: 'nowrap',
            opacity: P(t, T.espera - 0.05, 0.35) * (1 - P(t, s5b - 0.25, 0.25)) * 0.92, transform: `rotateY(${v ? -28 : -34}deg) translateZ(${lerp(-200, 40, P(t, T.espera, s5b - T.espera, E.io)).toFixed(0)}px)`, textShadow: '0 10px 50px rgba(0,0,0,.7)'}}>ESPERANDO</div>
        </div>
        <div style={{position: 'absolute', inset: 0, background: '#000', opacity: P(t, s5b - 0.2, 0.25)}} />
        <Vignette />
        <Credit text={cuts[ci][4]} t={t} a={cuts[ci][0] - 0.15} b={ci < cuts.length - 1 ? cuts[ci + 1][0] + 0.25 : s5b} />
      </AbsoluteFill>}
      {/* 6 */}
      {t >= s6a && t < s6b + 0.1 && <AbsoluteFill style={{opacity: win(t, s6a, s6b + 0.1, 0.2, 0.25)}}>
        <Plate n="maos" fx={0.62} fy={0.5} zoom={lerp(1.2, 1.32, P(t, s6a, s6b - s6a))} blur={lerp(20, 0, P(t, s6a + 0.1, 0.6, E.out))} />
        <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 60% 55%, rgba(255,90,31,${(0.18 * P(t, T.construindo - 0.2, 0.4)).toFixed(3)}), rgba(0,0,0,0) 55%)`}} />
        <Vignette />
        <Credit text="A REDE SOCIAL · 2010" t={t} a={s6a} b={s6b} />
      </AbsoluteFill>}
      {/* 7 */}
      {t >= s7a && <AbsoluteFill style={{opacity: P(t, s7a, 0.35) * (1 - P(t, end - 0.55, 0.55))}}>
        <Plate n="caminhada" fx={0.5} fy={0.38} zoom={lerp(1.0, 1.16, P(t, s7a, end - s7a, E.io))} />
        {!v && <Word text="FUTURO" size={fit('FUTURO', 300 * ws, W)} x={W / 2} y={H * 0.34} p={P(t, T.futuro - 0.1, 0.6, E.out)} rx={6} color={C.or} glow />}
        <Plate n="caminhada" cut fx={0.5} fy={0.38} zoom={lerp(1.0, 1.16, P(t, s7a, end - s7a, E.io))} />
        {v && <Word text="FUTURO" size={fit('FUTURO', 300, W)} x={W / 2} y={H * 0.6} p={P(t, T.futuro - 0.1, 0.6, E.out)} rx={6} color={C.or} glow />}
        <Vignette />
        <Credit text="PEAKY BLINDERS · 2013" t={t} a={s7a} b={end - 0.4} />
      </AbsoluteFill>}
      {/* fim */}
      {t >= end - 0.1 && <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: P(t, end, 0.5, E.out)}}>
        <div style={{fontFamily: F.big, fontWeight: 900, fontSize: 96 * (v ? 1 : 1.1), color: C.bone, letterSpacing: '-0.02em'}}>Yohann Escher<span style={{color: C.or}}>.</span></div>
        <div style={{marginTop: 18, fontFamily: F.mono, fontSize: 20, letterSpacing: '0.22em', color: C.dim}}>ESTÚDIO ESCHER · ESTILO CINEMA</div>
        <div style={{position: 'absolute', bottom: v ? 220 : 70, left: 60, right: 60, textAlign: 'center', fontFamily: F.mono, fontSize: 16, letterSpacing: '0.12em', color: C.dim, lineHeight: 1.6}}>CENAS: PEAKY BLINDERS (BBC) · O PODEROSO CHEFÃO (PARAMOUNT) · SUCCESSION (HBO) · A REDE SOCIAL (SONY) · O LOBO DE WALL STREET (PARAMOUNT)</div>
      </AbsoluteFill>}
      <Captions t={t} hide={P(t, end - 0.6, 0.4)} />
      <Grain frame={frame} />
      {audio === 'mix' && <Audio src={staticFile('cine/audio/mix_teste.wav')} />}
    </AbsoluteFill>
  );
};
