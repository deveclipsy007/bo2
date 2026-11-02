// Estilo Cinema v2: a união com o Estilo Gravura. Em cima, a cena do filme quase parada (pouco zoom), escolhida
// pelo que a frase diz; no meio, a frase escrita à caneta no ritmo da voz; embaixo, um diagrama que se desenha e
// explica a ideia (FIG.). Uma linha liga a cena ao diagrama. 16:9 e 9:16 saem do mesmo código.
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {E, P, clamp, lerp} from '../../lib/core';
import {useFonts} from '../../lib/fonts';
import WORDS from './words_teste.json';

export const FPS = 60;
export const VO = 0.5;
export const CINE_TESTE2_DUR = Math.round(19.0 * FPS);
const WS = (WORDS as [string, number, number][]).map(([w, a, b]) => ({w: w.toLowerCase().replace(/[.,?…]/g, ''), raw: w.replace(/[,…]$/, ''), a: a + VO, b: b + VO}));
const w = (word: string, n = 1) => { let k = 0; for (const x of WS) if (x.w === word && ++k === n) return x.a; throw new Error('palavra ' + word); };
const T = {poder: w('poder'), mais: w('mais'), alto: w('alto'), esta2: w('está', 2), construir: w('construir'), ninguem: w('ninguém'), ignorar: w('ignorar'),
  enquanto: w('enquanto'), maioria: w('maioria'), espera: w('espera'), momento: w('momento'), certo: w('certo'), alguem: w('alguém'), ja: w('já'), construindo: w('construindo'), futuro: w('futuro')};

const C = {ink: '#0a0a0b', panel: '#121214', line: '#2c2c31', bone: '#f2efe8', dim: '#8d8a84', or: '#ff5a1f', orHi: '#ffb27a'};
const F = {big: "Fraunces, Georgia, serif", hand: "'Instrument Serif', Georgia, serif", mono: "'Plex Mono', ui-monospace, monospace"};
const SIZE: Record<string, [number, number]> = {tommy: [1280, 720], gritos: [1280, 720], caminhada: [1280, 720], torre: [1280, 720], cidade: [1280, 720], auditorio: [1024, 427], banco: [998, 574], maos: [1024, 427]};
const hash = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const BEATS: [number, number][] = [[0, 9], [9, 17], [17, 24], [24, 30]];
const KEY = new Set([2, 11, 20, 27]);                         // poder · construir · espera · construindo: a palavra-chave de cada frase

// planos do filme (em cima): cada um ligado ao que a frase diz
const SHOTS: {n: string; a: number; fx: number; fy: number; credit: string; cut?: boolean}[] = [
  {n: 'tommy', a: 0, fx: 0.5, fy: 0.4, credit: 'PEAKY BLINDERS · 2013', cut: true},
  {n: 'gritos', a: T.mais - 0.05, fx: 0.5, fy: 0.45, credit: 'PEAKY BLINDERS · 2013'},
  {n: 'torre', a: T.esta2 - 0.25, fx: 0.5, fy: 0.45, credit: 'SUCCESSION · 2018'},
  {n: 'cidade', a: T.ninguem - 0.1, fx: 0.5, fy: 0.55, credit: 'SUCCESSION · 2018'},
  {n: 'auditorio', a: T.enquanto - 0.2, fx: 0.5, fy: 0.5, credit: 'A REDE SOCIAL · 2010'},
  {n: 'banco', a: T.espera - 0.1, fx: 0.45, fy: 0.5, credit: 'O PODEROSO CHEFÃO · 1972'},
  {n: 'maos', a: T.alguem - 0.15, fx: 0.62, fy: 0.5, credit: 'A REDE SOCIAL · 2010'},
  {n: 'caminhada', a: T.construindo - 0.1, fx: 0.5, fy: 0.36, credit: 'PEAKY BLINDERS · 2013', cut: true},
];
const END = 17.4;

/** cena dentro da faixa de cima: enquadramento pelo ponto de foco, zoom mínimo (1,00 → 1,04) */
const Frame: React.FC<{n: string; w: number; h: number; zoom: number; fx: number; fy: number; cut?: boolean; brighten?: number}> = ({n, w: bw, h: bh, zoom, fx, fy, cut, brighten = 1}) => {
  const [iw, ih] = SIZE[n], s = Math.max(bw / iw, bh / ih) * zoom, w = iw * s, h = ih * s;
  const left = clamp(bw / 2 - fx * w, bw - w, 0), top = clamp(bh / 2 - fy * h, bh - h, 0);
  return <Img src={staticFile(`cine/img/${cut ? `${n}_cut.png` : `${n}.jpg`}`)} style={{position: 'absolute', left, top, width: w, height: h, filter: brighten !== 1 ? `brightness(${brighten})` : undefined}} />;
};

/** frase escrita à caneta: cada palavra é revelada no tempo em que é falada; a palavra-chave entra em Fraunces laranja */
const Handwrite: React.FC<{t: number; beat: number; size: number}> = ({t, beat, size}) => {
  const [a, b] = BEATS[beat];
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: `${size * 0.14}px ${size * 0.26}px`}}>
      {WS.slice(a, b).map((x, i) => {
        const k = a + i, key = KEY.has(k), p = P(t, x.a - 0.04, Math.max(0.16, (x.b - x.a) * 0.9), E.smooth);
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block', fontFamily: key ? F.big : F.hand, fontWeight: key ? 900 : 400, fontStyle: key ? 'normal' : 'italic', fontSize: key ? size * 1.08 : size, lineHeight: 1.12, color: key ? C.or : C.bone,
            WebkitMaskImage: `linear-gradient(90deg, #000 ${(p * 108 - 8).toFixed(1)}%, transparent ${(p * 108).toFixed(1)}%)`, maskImage: `linear-gradient(90deg, #000 ${(p * 108 - 8).toFixed(1)}%, transparent ${(p * 108).toFixed(1)}%)`, opacity: p > 0.04 ? 1 : 0}}>
            {x.raw}
            {p > 0 && p < 1 && <span style={{position: 'absolute', left: `${(p * 100).toFixed(1)}%`, bottom: size * 0.12, width: 9, height: 9, borderRadius: 5, background: C.or, boxShadow: `0 0 12px ${C.or}`}} />}
          </span>
        );
      })}
    </div>
  );
};

// ---------- diagramas (viewBox 960 × 560), traço que se desenha: pathLength 1 e dashoffset
const Stroke: React.FC<{d: string; p: number; color?: string; width?: number; opacity?: number}> = ({d, p, color = C.bone, width = 2.4, opacity = 1}) =>
  p <= 0 ? null : <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - clamp(p)} opacity={opacity} />;

/** FIG. I — o volume: a onda cresce, explode em laranja no "mais alto" e é riscada */
const DVolume: React.FC<{t: number}> = ({t}) => {
  const loud = P(t, T.mais - 0.05, 0.25, E.out) * (1 - P(t, T.alto + 0.55, 0.5, E.io)), cross = P(t, T.alto + 0.35, 0.4, E.out), appear = P(t, 0.4, 0.8, E.out);
  const bars = Array.from({length: 46}, (_, i) => {
    const x = 70 + i * 18.5, base = 10 + 14 * Math.abs(Math.sin(t * 5 + i * 0.7)) * (0.4 + hash(i) * 0.6), big = 30 + 190 * hash(i + 7) * Math.abs(Math.sin(t * 16 + i));
    const h = lerp(base, big, loud) * P(t, 0.3 + i * 0.012, 0.3, E.out);
    return <rect key={i} x={x} y={280 - h / 2} width={9} height={h} rx={4} fill={loud > 0.2 ? C.or : C.bone} opacity={0.35 + 0.65 * appear} />;
  });
  return <g>{bars}
    <Stroke d="M 60 280 L 900 280" p={appear} color={C.line} width={1.5} />
    <Stroke d="M 120 90 L 840 470" p={cross} color={C.or} width={7} />
    {cross > 0.6 && <text x={480} y={530} textAnchor="middle" fontFamily={F.hand} fontStyle="italic" fontSize={40} fill={C.bone} opacity={P(t, T.alto + 0.6, 0.4)}>volume não é poder</text>}
  </g>;
};

/** FIG. II — o que não dá para ignorar: o prédio sobe andar por andar e todo mundo vira o olhar para ele */
const DBuild: React.FC<{t: number}> = ({t}) => {
  const ground = P(t, T.esta2 - 0.1, 0.5, E.out), floors = 9, look = P(t, T.ignorar - 0.15, 0.6, E.out), glow = P(t, T.ignorar, 0.5);
  const people = Array.from({length: 22}, (_, i) => ({x: 80 + (i % 11) * 30 + (i > 10 ? 520 : 0) + hash(i) * 10, y: 500 - hash(i + 3) * 26}));
  return <g>
    <Stroke d="M 50 510 L 910 510" p={ground} color={C.dim} width={2} />
    {Array.from({length: floors}, (_, k) => {
      const p = P(t, T.construir - 0.1 + k * 0.17, 0.3, E.out), y = 510 - (k + 1) * 46;
      return <g key={k}>
        <Stroke d={`M 400 ${y + 46} L 400 ${y} L 560 ${y} L 560 ${y + 46}`} p={p} color={C.bone} width={2.4} />
        {p > 0.9 && [0, 1, 2].map((j) => <rect key={j} x={420 + j * 46} y={y + 12} width={28} height={22} fill={glow > 0 && (k + j) % 2 === 0 ? C.or : 'none'} stroke={C.bone} strokeWidth={1.2} opacity={0.9} />)}
      </g>;
    })}
    <Stroke d="M 480 96 L 480 40" p={P(t, T.construir + 1.4, 0.3)} color={C.or} width={3} />
    {people.map((q, i) => {
      const a = P(t, T.ninguem - 0.1 + i * 0.02, 0.3, E.out);
      return a > 0 && <g key={i}>
        <circle cx={q.x} cy={q.y} r={6} fill={look > 0.5 ? C.or : C.bone} opacity={a} />
        {look > 0 && <Stroke d={`M ${q.x} ${q.y} L 480 ${60 + hash(i) * 60}`} p={look} color={C.or} width={1} opacity={0.45} />}
      </g>;
    })}
    {glow > 0 && <circle cx={480} cy={110} r={30 + glow * 70} fill="none" stroke={C.or} strokeWidth={2} opacity={0.6 * (1 - glow)} />}
  </g>;
};

/** FIG. III e IV — a espera e quem constrói: a maioria parada, o relógio que nunca chega; um ponto sai e liga a rede */
const GRID = Array.from({length: 35}, (_, i) => ({x: 90 + (i % 7) * 44, y: 140 + Math.floor(i / 7) * 62}));
const NET = [{x: 520, y: 150}, {x: 620, y: 110}, {x: 720, y: 170}, {x: 650, y: 260}, {x: 800, y: 260}, {x: 560, y: 330}, {x: 720, y: 360}, {x: 860, y: 380}, {x: 620, y: 450}, {x: 780, y: 470}];
const LINKS: [number, number][] = [[0, 1], [1, 2], [0, 3], [2, 3], [2, 4], [3, 5], [3, 6], [4, 6], [4, 7], [5, 8], [6, 8], [6, 9], [7, 9], [8, 9]];
const DWait: React.FC<{t: number}> = ({t}) => {
  const dots = P(t, T.maioria - 0.1, 0.5, E.out), clockP = P(t, T.espera - 0.05, 0.6, E.out), build = t >= T.alguem - 0.1;
  const fade = P(t, T.alguem - 0.2, 0.4);                      // o relógio some quando alguém começa a construir
  const hand = (t - T.espera) * 2.4, mark = P(t, T.momento - 0.05, 0.3, E.pop);
  const lead = P(t, T.alguem - 0.05, 0.5, E.io), start = GRID[17], ig = P(t, T.futuro - 0.05, 0.4, E.out);
  const linkP = (i: number) => P(t, T.ja + i * ((T.futuro - T.ja - 0.2) / LINKS.length), 0.32, E.out);
  return <g>
    {GRID.map((q, i) => i === 17 && build ? null : <circle key={i} cx={q.x} cy={q.y + Math.sin(t * 1.5 + i) * 1.5} r={8} fill={C.dim} opacity={0.75 * dots * (build ? 0.55 : 1)} />)}
    {clockP > 0 && fade < 1 && <g opacity={1 - fade} transform="translate(700 280)">
      <circle r={150 * clockP} fill="none" stroke={C.bone} strokeWidth={2.4} />
      {Array.from({length: 12}, (_, k) => <line key={k} x1={0} y1={-140} x2={0} y2={-124} stroke={C.bone} strokeWidth={k % 3 ? 1.4 : 3} transform={`rotate(${k * 30})`} opacity={clockP} />)}
      <line x1={0} y1={0} x2={0} y2={-118} stroke={C.or} strokeWidth={4} strokeLinecap="round" transform={`rotate(${(hand * 57.3) % 360})`} opacity={clockP} />
      {mark > 0 && <g transform="rotate(-40)"><circle cx={0} cy={-150} r={14 * mark} fill={C.or} /><text x={0} y={-178} textAnchor="middle" fontFamily={F.mono} fontSize={18} letterSpacing="0.12em" fill={C.or} transform="rotate(40 0 -178)">MOMENTO CERTO?</text></g>}
      <circle r={6} fill={C.bone} opacity={clockP} />
    </g>}
    {build && <g>
      {LINKS.map(([i, j], k) => <Stroke key={k} d={`M ${NET[i].x} ${NET[i].y} L ${NET[j].x} ${NET[j].y}`} p={linkP(k)} color={ig > 0 ? C.or : C.bone} width={ig > 0 ? 3 : 2} />)}
      {NET.map((q, i) => { const on = linkP(Math.max(0, LINKS.findIndex(([a, b]) => a === i || b === i))); return on > 0 && <circle key={i} cx={q.x} cy={q.y} r={9 + ig * 4} fill={ig > 0 ? C.or : C.bone} opacity={on} />; })}
      <circle cx={lerp(start.x, NET[0].x, lead)} cy={lerp(start.y, NET[0].y, lead)} r={11} fill={C.or} style={{filter: `drop-shadow(0 0 10px ${C.or})`}} />
      {ig > 0 && <circle cx={690} cy={290} r={60 + ig * 260} fill="none" stroke={C.or} strokeWidth={2} opacity={0.5 * (1 - ig)} />}
    </g>}
  </g>;
};

const FIGS = ['FIG. I — O VOLUME', 'FIG. II — O QUE NÃO DÁ PARA IGNORAR', 'FIG. III — A ESPERA', 'FIG. IV — QUEM CONSTRÓI'];

export const CinemaTeste2: React.FC<{audio: 'none' | 'mix'}> = ({audio}) => {
  useFonts();
  const frame = useCurrentFrame(), t = frame / FPS;
  const {width: W, height: H} = useVideoConfig(), v = H > W;
  // regiões: faixa do filme, frase escrita, diagrama
  const film = v ? {x: 0, y: 190, w: 1080, h: 608} : {x: 80, y: 130, w: 1040, h: 585};
  const write = v ? {x: 60, y: 860, w: 960, size: 58} : {x: 80, y: 780, w: 1040, size: 60};
  const diag = v ? {x: 40, y: 1120, w: 1000, h: 583} : {x: 1170, y: 230, w: 690, h: 402};
  const beat = BEATS.reduce((k, [a], i) => (t >= WS[a].a - 0.25 ? i : k), 0);
  const fig = beat === 3 ? 3 : beat;
  const si = SHOTS.reduce((k, s, i) => (t >= s.a ? i : k), 0), shot = SHOTS[si], prev = SHOTS[si - 1];
  const sin = P(t, shot.a, 0.32, E.io);
  const outAll = P(t, END - 0.5, 0.5);
  const zoomOf = (s: typeof shot, i: number) => lerp(1.0, 1.04, P(t, s.a, ((SHOTS[i + 1]?.a ?? END) - s.a) + 0.3));
  const figIn = P(t, (beat === 0 ? 0.3 : WS[BEATS[beat][0]].a - 0.25), 0.4);
  const hw = beat === 0 ? 1 : P(t, WS[BEATS[beat][0]].a - 0.3, 0.25);   // troca de frase: a anterior apaga, a nova começa a ser escrita

  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - outAll}}>
        {/* faixa do filme */}
        <div style={{position: 'absolute', left: film.x, top: film.y, width: film.w, height: film.h, overflow: 'hidden', background: '#000', boxShadow: `0 30px 80px rgba(0,0,0,.6)`}}>
          {prev && sin < 1 && <div style={{position: 'absolute', inset: 0}}><Frame n={prev.n} w={film.w} h={film.h} zoom={zoomOf(prev, si - 1)} fx={prev.fx} fy={prev.fy} brighten={prev.n === 'banco' ? 1.5 : 1} /></div>}
          <div style={{position: 'absolute', inset: 0, opacity: sin, transform: `translateX(${((1 - sin) * 40).toFixed(1)}px)`}}>
            <Frame n={shot.n} w={film.w} h={film.h} zoom={zoomOf(shot, si)} fx={shot.fx} fy={shot.fy} brighten={shot.n === 'banco' ? 1.5 : 1} />
            {shot.cut && (() => {                               // palavra atrás do personagem, dentro da faixa
              const isP = shot.n === 'tommy', word = isP ? 'PODER' : 'FUTURO', at = isP ? T.poder : T.futuro, p = P(t, at - 0.12, 0.55, E.out);
              const size = Math.min(film.h * 0.46, (film.w * 0.9) / (word.length * 0.74));
              return p > 0 && <>
                <div style={{position: 'absolute', left: 0, right: 0, top: film.h * (isP ? 0.2 : 0.16), textAlign: 'center', fontFamily: F.big, fontWeight: 900, fontSize: size, lineHeight: 1, color: isP ? C.bone : C.or, opacity: clamp(p * 1.5),
                  transform: `translateY(${((1 - p) * 60).toFixed(0)}px)`, filter: p < 0.98 ? `blur(${((1 - p) * 14).toFixed(1)}px)` : undefined, textShadow: isP ? '0 10px 50px rgba(0,0,0,.5)' : `0 0 50px ${C.or}99`}}>{word}</div>
                <Frame n={shot.n} w={film.w} h={film.h} zoom={zoomOf(shot, si)} fx={shot.fx} fy={shot.fy} cut />
              </>;
            })()}
          </div>
          {shot.n === 'gritos' && <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: 0.45 * (1 - P(t, shot.a, 0.12))}} />}
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />
          {/* barras de cinema */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: film.h * 0.06, background: '#000'}} /><div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: film.h * 0.06, background: '#000'}} />
        </div>
        {/* crédito e a régua de tempo do plano */}
        <div style={{position: 'absolute', left: film.x + (v ? 60 : 0), top: film.y + film.h + 18, fontFamily: F.mono, fontSize: v ? 20 : 18, letterSpacing: '0.2em', color: C.dim, display: 'flex', gap: 12, alignItems: 'center'}}>
          <span style={{width: 8, height: 8, borderRadius: 4, background: C.or}} />{shot.credit}
        </div>
        <div style={{position: 'absolute', left: film.x, top: film.y + film.h, width: film.w * P(t, shot.a, ((SHOTS[si + 1]?.a ?? END) - shot.a)), height: 3, background: C.or, opacity: 0.85}} />
        {/* a frase escrita */}
        <div style={{position: 'absolute', left: write.x, top: write.y, width: write.w, opacity: hw}}>
          <Handwrite t={t} beat={beat} size={write.size} />
        </div>
        {/* a linha que liga a cena ao diagrama */}
        {(() => {
          const x1 = v ? W - 90 : film.x + film.w + 8, y1 = v ? film.y + film.h + 10 : film.y + 40, x2 = v ? W - 90 : diag.x - 10, y2 = v ? diag.y - 24 : diag.y - 30;
          const q = P(t, (beat === 0 ? 0.3 : WS[BEATS[beat][0]].a - 0.3), 0.6, E.io), u = ((t * 0.6) % 1);
          return <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
            <path d={v ? `M ${x1} ${y1} L ${x2} ${y2}` : `M ${x1} ${y1} C ${x1 + 30} ${y1}, ${x2 - 30} ${y2}, ${x2} ${y2}`} fill="none" stroke={C.line} strokeWidth={1.5} strokeDasharray="3 6" />
            <circle cx={lerp(x1, x2, v ? u : q)} cy={lerp(y1, y2, u)} r={4} fill={C.or} opacity={0.9} />
          </svg>;
        })()}
        {/* o diagrama */}
        <div style={{position: 'absolute', left: diag.x, top: diag.y - 34, fontFamily: F.mono, fontSize: v ? 20 : 17, letterSpacing: '0.2em', color: C.or, opacity: figIn}}>{FIGS[fig]}</div>
        <svg viewBox="0 0 960 560" width={diag.w} height={diag.h} style={{position: 'absolute', left: diag.x, top: diag.y, overflow: 'visible'}}>
          <g opacity={beat === 0 ? 1 : 1 - P(t, WS[BEATS[1][0]].a - 0.35, 0.3)}>{t < WS[BEATS[1][0]].a + 0.1 && <DVolume t={t} />}</g>
          {beat === 1 && <g opacity={P(t, WS[BEATS[1][0]].a - 0.25, 0.3) * (1 - P(t, WS[BEATS[2][0]].a - 0.35, 0.3))}><DBuild t={t} /></g>}
          {beat >= 2 && <g opacity={P(t, WS[BEATS[2][0]].a - 0.25, 0.3)}><DWait t={t} /></g>}
        </svg>
      </div>
      {/* assinatura */}
      {t >= END - 0.1 && <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: P(t, END, 0.5, E.out)}}>
        <div style={{fontFamily: F.big, fontWeight: 900, fontSize: 96, color: C.bone, letterSpacing: '-0.02em'}}>Yohann Escher<span style={{color: C.or}}>.</span></div>
        <div style={{marginTop: 18, fontFamily: F.mono, fontSize: 20, letterSpacing: '0.22em', color: C.dim}}>ESTÚDIO ESCHER · ESTILO CINEMA</div>
        <div style={{position: 'absolute', bottom: v ? 220 : 70, left: 60, right: 60, textAlign: 'center', fontFamily: F.mono, fontSize: 16, letterSpacing: '0.12em', color: C.dim, lineHeight: 1.6}}>CENAS: PEAKY BLINDERS (BBC) · SUCCESSION (HBO) · A REDE SOCIAL (SONY) · O PODEROSO CHEFÃO (PARAMOUNT)</div>
      </AbsoluteFill>}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'screen', pointerEvents: 'none'}}><filter id="g2"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 89} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.5 -0.25" /></filter><rect width={W} height={H} filter="url(#g2)" /></svg>
      {audio === 'mix' && <Audio src={staticFile('cine/audio/mix_teste2.wav')} />}
    </AbsoluteFill>
  );
};
