// "SEU MELHOR FUNCIONÁRIO VAI EMBORA" — o checklist do B-17. Primeiro episódio com o AVATAR do Yohann (gancho e entrega
// prática) e com transições CONTÍNUAS: em cada passagem algo de uma cena vira a próxima (o crachá gira e no verso está o
// avião; a foto cai com o avião; a trava laranja voa e vira o primeiro ✓; o cartão gira e revela o B-17; o manual se fecha
// num ponto, que vira o agente; o agente vira a pupila do olho).
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {useFonts} from '../../lib/fonts';
import {E, P, clamp, lerp} from '../../lib/core';
import {FPS, T} from './time7';
import {C, Dot, Dust, F, Flash, Grain, IMG, Label, Paper, Reveal, Ring, Thin, Vignette, img, usePreload} from './fx';
import {Eye} from './sims';
import {Ink} from './Film6';
import {Avatar, POSE} from './Avatar';
import DIMS from './img7.json';
import ENV from './env7.json';

Object.assign(IMG, DIMS as unknown as Record<string, [number, number]>);
const ALL = Object.keys(DIMS).filter((k) => !k.startsWith('logo'));
const hash = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
const RX = 712, RW = 600;   // coluna de texto à direita enquanto o avatar está na tela

// ---------- cena com entrada e saída próprias (as transições contínuas) ----------
type In = {kind: 'iris' | 'flip' | 'rise' | 'zoom' | 'cut'; x?: number; y?: number; d: number; delay?: number};
type Out = {kind: 'fade' | 'flip' | 'drop' | 'slide' | 'shrink' | 'push'; x?: number; y?: number; d: number};
const Scene: React.FC<{t: number; a: number; b: number; enter?: In; exit?: Out; light?: boolean; children: React.ReactNode}> = ({t, a, b, enter = {kind: 'cut', d: 0}, exit = {kind: 'fade', d: 0.3}, light, children}) => {
  const a0 = a + (enter.delay ?? 0);
  if (t < a0 - 0.001 || t > b + exit.d) return null;
  const u = enter.d > 0 ? P(t, a0, enter.d) : 1, q = P(t, b, exit.d);
  const ex = enter.x ?? 540, ey = enter.y ?? 960, ox = exit.x ?? 540, oy = exit.y ?? 960;
  let tf = '', op = 1, blur = 0, clip: string | undefined, origin = '540px 960px';
  if (u < 1) {
    const v = E.out(u);
    if (enter.kind === 'iris') { clip = `circle(${(E.io(u) * 2300).toFixed(0)}px at ${ex}px ${ey}px)`; tf += `scale(${lerp(1.06, 1, v).toFixed(4)}) `; }
    if (enter.kind === 'flip') { tf += `perspective(1800px) rotateY(${lerp(-90, 0, v).toFixed(2)}deg) scale(${lerp(0.6, 1, v).toFixed(4)}) `; op = clamp(u * 4); }
    if (enter.kind === 'rise') { tf += `translateY(${lerp(240, 0, v).toFixed(1)}px) `; op = clamp(u * 2); blur = (1 - v) * 8; }
    if (enter.kind === 'zoom') { tf += `scale(${lerp(1.7, 1, v).toFixed(4)}) `; op = clamp(u * 2); blur = (1 - v) * 12; }
  }
  if (q > 0) {
    const v = E.in(q);
    if (exit.kind === 'fade') { op *= 1 - q; blur += q * 12; tf += `scale(${lerp(1, 1.08, v).toFixed(4)}) `; }
    if (exit.kind === 'flip') { tf += `perspective(1800px) rotateY(${lerp(0, 90, v).toFixed(2)}deg) scale(${lerp(1, 0.6, v).toFixed(4)}) `; }
    if (exit.kind === 'drop') { origin = '0px 1920px'; tf += `translateY(${lerp(0, 640, v).toFixed(1)}px) rotate(${lerp(0, 11, v).toFixed(2)}deg) `; blur += q * 10; op *= 1 - q * 0.7; }
    if (exit.kind === 'slide') { tf += `translateY(${lerp(0, -300, v).toFixed(1)}px) `; op *= 1 - q; blur += q * 6; }
    if (exit.kind === 'shrink') { clip = `circle(${lerp(2300, 0, v).toFixed(0)}px at ${ox}px ${oy}px)`; origin = `${ox}px ${oy}px`; tf += `scale(${lerp(1, 0.7, v).toFixed(4)}) `; }
    if (exit.kind === 'push') { tf += `scale(${lerp(1, 0.8, v).toFixed(4)}) `; op *= 1 - q; blur += q * 8; }
  }
  return (
    <div style={{position: 'absolute', inset: 0, transformOrigin: origin, transform: tf || undefined, opacity: op, filter: blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : undefined, clipPath: clip, backfaceVisibility: 'hidden'}}>
      {light ? <Paper /> : <div style={{position: 'absolute', inset: 0, background: C.ink}} />}
      {children}
    </div>
  );
};
const Cam: React.FC<{t: number; a: number; b: number; z0?: number; z1?: number; ox?: number; oy?: number; children: React.ReactNode}> = ({t, a, b, z0 = 1, z1 = 1.08, ox = 540, oy = 960, children}) => {
  const u = P(t, a, b - a, E.smooth);
  return <div style={{position: 'absolute', inset: 0, transformOrigin: `${ox}px ${oy}px`, transform: `scale(${lerp(z0, z1, u).toFixed(4)})`}}>{children}</div>;
};

// ---------- pictograma, carimbo, odômetro ----------
const Person: React.FC<{x: number; y: number; h: number; color: string; head?: string; glow?: number}> = ({x, y, h, color, head, glow = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={0} cy={-h * 0.78} r={h * 0.15} fill={head ?? color} style={glow > 0 ? {filter: `drop-shadow(0 0 ${(14 * glow).toFixed(0)}px ${C.or})`} : undefined} />
    <path d={`M${-h * 0.24} 0 v${-h * 0.3} a${h * 0.24} ${h * 0.24} 0 0 1 ${h * 0.48} 0 v${h * 0.3} z`} fill={color} />
  </g>
);
const Stamp: React.FC<{t: number; at: number; text: string; x: number; y: number; rot?: number; size?: number}> = ({t, at, text, x, y, rot = -12, size = 64}) => {
  if (t < at) return null;
  const u = P(t, at, 0.22, E.pop);
  return <div style={{position: 'absolute', left: x - 400, width: 800, top: y - size * 0.7, textAlign: 'center', transform: `rotate(${rot}deg) scale(${lerp(2.2, 1, u).toFixed(3)})`, opacity: clamp(u * 2) * 0.92}}>
    <span style={{display: 'inline-block', padding: '6px 22px', border: `6px solid ${C.or}`, borderRadius: 10, fontFamily: F.head, fontWeight: 900, fontSize: size, letterSpacing: '0.04em', color: C.or, mixBlendMode: 'multiply', boxShadow: `0 0 0 2px ${C.or}55 inset`}}>{text}</span>
  </div>;
};
const Odo: React.FC<{t: number; at: number; text: string; size: number; y: number; color: string; x?: number}> = ({t, at, text, size, y, color, x = 540}) => {
  if (t < at - 0.05) return null;
  const digits = [...text], nd = digits.filter((c) => /\d/.test(c)).length, H = 1.2, fade = 'linear-gradient(180deg, transparent 0%, #000 22%, #000 78%, transparent 100%)'; let di = 0;
  return (
    <div style={{position: 'absolute', left: x - 600, width: 1200, top: y - size * 0.6, display: 'flex', justifyContent: 'center', fontFamily: F.head, fontWeight: 900, fontSize: size, lineHeight: `${H}em`, letterSpacing: '-0.02em', color, whiteSpace: 'nowrap', opacity: P(t, at - 0.05, 0.15)}}>
      {digits.map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} style={{display: 'block', height: `${H}em`}}>{ch}</span>;
        const pos = nd - 1 - di++, u = P(t, at + (nd - pos) * 0.04, 0.8 + pos * 0.06, E.out), turns = 1 + pos * 0.7, off = +ch + 10 * Math.ceil(turns) - (1 - u) * 10 * turns;
        return <span key={i} style={{display: 'block', height: `${H}em`, overflow: 'hidden', WebkitMaskImage: u < 1 ? fade : undefined, maskImage: u < 1 ? fade : undefined}}><span style={{display: 'block', transform: `translateY(${(-off * H).toFixed(3)}em)`}}>{Array.from({length: 10 * (Math.ceil(turns) + 1)}, (_, k) => <span key={k} style={{display: 'block', height: `${H}em`}}>{k % 10}</span>)}</span></span>;
      })}
    </div>
  );
};

// ================================================================== cenas
// 0 · o crachá do funcionário do mês (escuro, com o avatar)
const BADGE = {x: 600, y: 640, w: 400, h: 520};
const CHIPS = ['CLIENTES', 'ATALHOS', 'SENHAS', 'O JEITO DE VENDER', 'PROCESSOS', 'CONTATOS'];
const S0: React.FC<{t: number}> = ({t}) => {
  const drop = P(t, 0.2, 0.9, E.settle), sw = Math.sin(t * 1.8) * 2.2 * Math.exp(-t * 0.15), empty = P(t, T.levar, 1.6, E.io), headGlow = P(t, T.cabeca - 0.1, 0.4, E.out);
  const by = lerp(-700, BADGE.y, drop), hx = BADGE.x, hy = by - 40;
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g transform={`rotate(${sw.toFixed(2)} ${BADGE.x} 0)`}>
          <line x1={BADGE.x - 40} y1={0} x2={BADGE.x - 16} y2={by - BADGE.h / 2 + 10} stroke={C.or} strokeWidth={10} opacity={0.85} />
          <line x1={BADGE.x + 40} y1={0} x2={BADGE.x + 16} y2={by - BADGE.h / 2 + 10} stroke={C.or} strokeWidth={10} opacity={0.85} />
          <rect x={BADGE.x - BADGE.w / 2} y={by - BADGE.h / 2} width={BADGE.w} height={BADGE.h} rx={22} fill={C.bone} />
          <rect x={BADGE.x - 34} y={by - BADGE.h / 2 + 18} width={68} height={14} rx={7} fill={C.ink} opacity={0.7} />
          <rect x={BADGE.x - 120} y={by - BADGE.h / 2 + 60} width={240} height={250} rx={8} fill="#e2ddd2" />
          <g opacity={lerp(1, 0.25, empty)}><Person x={hx} y={by + 70} h={200} color={C.pen} head={headGlow > 0 ? C.or : C.pen} glow={headGlow} /></g>
          <text x={BADGE.x} y={by + 130} textAnchor="middle" fontFamily={F.mono} fontSize={18} letterSpacing="0.2em" fill={C.pdim}>FUNCIONÁRIO DO MÊS</text>
          <text x={BADGE.x} y={by + 178} textAnchor="middle" fontFamily={F.head} fontWeight={900} fontSize={40} fill={C.pen}>O MELHOR</text>
          {[0, 1, 2, 3, 4].map((k) => <text key={k} x={BADGE.x - 72 + k * 36} y={by + 228} textAnchor="middle" fontSize={28} fill={C.or}>★</text>)}
        </g>
        {CHIPS.map((c, k) => { const u = P(t, T.levar + k * 0.2, 1.6, E.in); if (u <= 0 || u >= 1) return null; const x = lerp(hx, 1180 + k * 30, u), y = lerp(hy - 30, 420 + k * 70 - 140 * Math.sin(u * Math.PI), u); return <g key={k} opacity={1 - u * 0.4}><rect x={x - 6} y={y - 22} width={c.length * 14 + 30} height={38} rx={19} fill={C.ink} stroke={C.or} strokeWidth={2} /><text x={x + 9} y={y + 4} fontFamily={F.mono} fontSize={18} letterSpacing="0.12em" fill={C.bone}>{c}</text></g>; })}
      </svg>
      <Stamp t={t} at={T.demissao - 0.05} text="DEMISSÃO" x={BADGE.x} y={BADGE.y + 40} />
      <Label t={t} at={0.3} out={8.4} text="FIG. I — O FUNCIONÁRIO DO MÊS" y={230} />
      <Thin t={t} at={T.seu - 0.2} out={T.levar - 0.55} text="o seu melhor funcionário" size={58} y={1190} x={RX} />
      <Ink t={t} at={T.pedir - 0.1} out={T.levar - 0.55} text="VAI PEDIR DEMISSÃO." size={110} y={1320} x={RX} maxW={RW} color={C.or} />
      <Thin t={t} at={T.levar - 0.2} out={8.45} text="e levar uma parte da empresa" size={54} y={1190} x={RX} />
      <Ink t={t} at={T.cabeca - 0.35} out={8.45} text="NA CABEÇA DELE." size={110} y={1320} x={RX} maxW={RW} />
    </>
  );
};
// 1 · Boeing, 1935: o avião mais avançado do mundo (papel)
const S1: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={8.6} b={16.4} z0={1.0} z1={1.08} oy={700}>
    <div style={{position: 'absolute', inset: 0, transform: `translateX(${lerp(30, -30, P(t, 8.6, 7.5)).toFixed(1)}px)`}}><Reveal name="m299" p={P(t, 8.65, 1.4, E.smooth)} x={540} y={700} width={1060} edge={0} /></div>
    <Label t={t} at={8.8} out={16.2} text="FIG. II — BOEING MODELO 299 · 1935" y={230} color={C.pdim} />
    <Label t={t} at={T.avancado - 0.2} out={16.2} text="4 MOTORES · 31,6 m DE ENVERGADURA" y={272} color={C.or} />
    <Ink t={t} at={T.n1935 - 0.15} out={T.boeing + 0.05} text="1935." size={240} y={1240} color={C.pen} stagger={0.06} />
    <Thin t={t} at={T.boeing + 0.45} out={T.voo - 0.5} text="o avião mais avançado do mundo." size={72} y={1240} color={C.pen} />
    <Thin t={t} at={T.voo - 0.15} out={16.3} text="no voo de demonstração," size={72} y={1210} color={C.pen} />
    <Ink t={t} at={T.caiu - 0.32} out={16.35} text="ELE CAIU." size={190} y={1350} color={C.or} stagger={0.022} />
  </Cam>
);
// 2 · a queda (escuro) — tremor de câmera que decai
const S2: React.FC<{t: number}> = ({t}) => {
  const k = Math.exp(-(t - 15.95) * 3.5), sx = Math.sin(t * 73) * 18 * k, sy = Math.cos(t * 61) * 14 * k;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`}}>
      <Cam t={t} a={15.95} b={21.0} z0={1.12} z1={1.0} oy={700}>
        <Reveal name="crash" p={P(t, 15.95, 0.55, E.out)} x={540} y={700} width={1080} edge={0} />
      </Cam>
      <Label t={t} at={16.2} out={20.8} text="30 DE OUTUBRO DE 1935 · WRIGHT FIELD, OHIO" y={230} />
      <Thin t={t} at={T.segundos - 0.2} out={T.piloto - 0.6} text="segundos depois de decolar." size={70} y={1250} />
      <Thin t={t} at={T.piloto - 0.25} out={20.85} text="o piloto era um dos" size={70} y={1200} />
      <Ink t={t} at={T.melhores - 0.1} out={20.85} text="MELHORES DO PAÍS." size={140} y={1340} />
    </div>
  );
};
// 3 · coisa demais pra lembrar (papel) — o painel, e a trava esquecida
const TRAVA = {x: 820, y: 960};
const GAUGES = Array.from({length: 28}, (_, i) => ({x: 150 + (i % 7) * 130, y: 420 + Math.floor(i / 7) * 128, r: 44 + (i % 3) * 4}));
const S3: React.FC<{t: number}> = ({t}) => {
  const n = Math.floor(lerp(0, 87, P(t, T.coisa - 0.3, 1.4, E.io))), forget = P(t, T.esqueceu - 0.1, 0.5, E.io), hot = P(t, T.trava - 0.2, 0.4, E.out);
  return (
    <Cam t={t} a={20.95} b={26.9} z0={1.0} z1={1.05} ox={TRAVA.x} oy={TRAVA.y}>
      <div style={{position: 'absolute', inset: 0, opacity: 0.16}}><Reveal name="cockpit" p={P(t, 21.0, 1.0)} x={540} y={700} width={1080} edge={0} /></div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {GAUGES.map((g, i) => { const u = P(t, 21.0 + i * 0.03, 0.3, E.pop), a = -2.2 + (hash(i, 1) * 3.4 + Math.sin(t * (1 + hash(i, 2) * 3) + i) * 0.5); if (u <= 0) return null; return (
          <g key={i} opacity={lerp(1, 0.25, forget)} transform={`translate(${g.x} ${g.y}) scale(${u.toFixed(3)})`}>
            <circle r={g.r} fill="#fffaf2" stroke={C.pen} strokeWidth={2.2} />
            {Array.from({length: 12}, (_, k) => { const an = -Math.PI * 0.75 + (k / 11) * Math.PI * 1.5; return <line key={k} x1={Math.cos(an) * g.r * 0.78} y1={Math.sin(an) * g.r * 0.78} x2={Math.cos(an) * g.r * 0.92} y2={Math.sin(an) * g.r * 0.92} stroke={C.pen} strokeWidth={1.4} />; })}
            <line x1={0} y1={0} x2={Math.cos(a) * g.r * 0.72} y2={Math.sin(a) * g.r * 0.72} stroke={C.pen} strokeWidth={2.4} strokeLinecap="round" />
            <circle r={4} fill={C.pen} />
          </g>); })}
        {Array.from({length: 9}, (_, k) => { const x = 140 + k * 72, on = Math.floor(t * 4 + k * 1.7) % 3 === 0; return <g key={k} opacity={lerp(1, 0.25, forget)}><rect x={x - 12} y={TRAVA.y - 30} width={24} height={60} rx={6} fill="#fffaf2" stroke={C.pen} strokeWidth={2} /><circle cx={x} cy={TRAVA.y + (on ? -16 : 16)} r={9} fill={C.pen} /></g>; })}
        <g style={hot > 0 ? {filter: `drop-shadow(0 0 ${(16 * hot).toFixed(0)}px ${C.or})`} : undefined}>
          <rect x={TRAVA.x - 22} y={TRAVA.y - 50} width={44} height={100} rx={8} fill="#fffaf2" stroke={hot > 0 ? C.or : C.pen} strokeWidth={3} />
          <line x1={TRAVA.x} y1={TRAVA.y + 30} x2={TRAVA.x} y2={TRAVA.y - 36} stroke={hot > 0 ? C.or : C.pen} strokeWidth={8} strokeLinecap="round" />
          <circle cx={TRAVA.x} cy={TRAVA.y - 40} r={15 + 4 * hot} fill={hot > 0 ? C.or : C.pen} />
        </g>
        {hot > 0 && <><circle cx={TRAVA.x} cy={TRAVA.y} r={lerp(220, 78, hot)} fill="none" stroke={C.or} strokeWidth={2.5} opacity={hot} /><text x={TRAVA.x - 100} y={TRAVA.y + 120} textAnchor="middle" fontFamily={F.mono} fontSize={20} letterSpacing="0.16em" fill={C.or} opacity={hot}>TRAVA DOS COMANDOS · TRAVADA</text></>}
      </svg>
      <Label t={t} at={21.1} out={26.7} text={`FIG. III — O PAINEL · ITENS PARA LEMBRAR: ${n}`} y={230} color={C.pdim} />
      <Thin t={t} at={T.problema - 0.2} out={T.esqueceu - 0.55} text="o avião tinha coisa demais pra lembrar." size={60} y={1250} color={C.pen} />
      <Thin t={t} at={T.esqueceu - 0.2} out={26.75} text="e ele esqueceu uma." size={72} y={1230} color={C.pen} />
      <Ink t={t} at={T.trava - 0.1} out={26.75} text="UMA TRAVA." size={190} y={1370} color={C.or} />
    </Cam>
  );
};
// 4 · o cartão de papel: um checklist (papel)
const CARD = {x: 540, y: 690, w: 820, h: 640};
const ITEMS = ['TRAVA DOS COMANDOS — DESTRAVADA', 'COMBUSTÍVEL — TRANSFERÊNCIA DESLIGADA', 'GIROSCÓPIOS — LIBERADOS', 'FLAPS DE ARREFECIMENTO — ABERTOS', 'COMPENSADORES — AJUSTADOS', 'GERADORES — VERIFICADOS'];
const BOX = (i: number) => ({x: CARD.x - CARD.w / 2 + 70, y: CARD.y - CARD.h / 2 + 150 + i * 78});
const Card: React.FC<{t: number; typeAt: number; tickAt: (i: number) => number; title: string; strikeAt?: number; newTitle?: string; items?: string[]}> = ({t, typeAt, tickAt, title, strikeAt, newTitle, items = ITEMS}) => {
  const strike = strikeAt ? P(t, strikeAt, 0.35, E.io) : 0, nt = strikeAt ? P(t, strikeAt + 0.3, 0.6) : 0;
  return (
    <div style={{position: 'absolute', left: CARD.x - CARD.w / 2, top: CARD.y - CARD.h / 2, width: CARD.w, height: CARD.h, background: '#fbf7ee', borderRadius: 14, boxShadow: '0 30px 60px rgba(40,30,20,.22), 0 0 0 2px #121110'}}>
      <div style={{position: 'absolute', left: 40, top: 34, fontFamily: F.mono, fontSize: 24, letterSpacing: '0.2em', color: C.pen, whiteSpace: 'nowrap'}}>
        <span style={{position: 'relative'}}>{title}{strike > 0 && <span style={{position: 'absolute', left: 0, top: '52%', height: 4, width: `${strike * 100}%`, background: C.or}} />}</span>
        {nt > 0 && <span style={{display: 'block', marginTop: 8, fontFamily: F.head, fontWeight: 900, fontSize: 40, letterSpacing: '0.02em', color: C.or, WebkitMaskImage: `linear-gradient(90deg, #000 ${(nt * 100).toFixed(0)}%, transparent ${(nt * 100 + 4).toFixed(0)}%)`, maskImage: `linear-gradient(90deg, #000 ${(nt * 100).toFixed(0)}%, transparent ${(nt * 100 + 4).toFixed(0)}%)`}}>{newTitle}</span>}
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 112, height: 2, background: C.pen, opacity: 0.6}} />
      {items.map((it, i) => { const ty = P(t, typeAt + i * 0.16, 0.45), tk = P(t, tickAt(i), 0.25, E.pop), b = BOX(i); return (
        <div key={i} style={{position: 'absolute', left: b.x - (CARD.x - CARD.w / 2) - 20, top: b.y - (CARD.y - CARD.h / 2) - 20, display: 'flex', alignItems: 'center', gap: 22, opacity: clamp(ty * 3)}}>
          <div style={{width: 40, height: 40, border: `3px solid ${tk > 0 ? C.or : C.pen}`, borderRadius: 6, position: 'relative', background: '#fffdf8'}}>{tk > 0 && <svg width={40} height={40} style={{position: 'absolute', left: -3, top: -3, overflow: 'visible'}}><path d="M8 21 L17 30 L34 9" fill="none" stroke={C.or} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(tk)} /></svg>}</div>
          <span style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.06em', color: C.pen, whiteSpace: 'nowrap'}}>{it.slice(0, Math.floor(ty * it.length))}</span>
        </div>); })}
    </div>
  );
};
const S4: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={26.75} b={32.0} z0={1.0} z1={1.05} oy={700}>
    <Card t={t} typeAt={27.0} tickAt={(i) => (i === 0 ? 27.45 : T.cartao + 0.15 + i * 0.32)} title="B-17 · CHECKLIST DO PILOTO" />
    <Label t={t} at={26.9} out={31.8} text="FIG. IV — O CARTÃO DE PAPEL" y={230} color={C.pdim} />
    <Thin t={t} at={T.solucao - 0.2} out={T.cartao - 0.75} text="a solução não foi contratar um piloto melhor." size={50} y={1210} color={C.pen} />
    <Thin t={t} at={T.cartao - 0.4} out={31.85} text="foi um cartão de papel." size={72} y={1210} color={C.pen} />
    <Ink t={t} at={T.checklist - 0.35} out={31.85} text="UM CHECKLIST." size={170} y={1350} color={C.or} />
  </Cam>
);
// 5 · o B-17: quase 13 mil (escuro)
const S5: React.FC<{t: number}> = ({t}) => (
  <Cam t={t} a={31.9} b={37.7} z0={1.06} z1={1.0} oy={700}>
    <Reveal name="b17f" p={P(t, 31.95, 1.3, E.smooth)} x={540} y={720} width={1080} edge={0} />
    <Label t={t} at={32.1} out={37.5} text="FIG. V — B-17 FLYING FORTRESS" y={230} />
    <Thin t={t} at={T.ele2 - 0.1} out={T.quase - 0.45} text="com ele, aquele mesmo avião virou o" size={56} y={1200} />
    <Ink t={t} at={T.b17 - 0.1} out={T.quase - 0.45} text="B-17." size={230} y={1360} color={C.or} stagger={0.06} />
    <Odo t={t} at={T.quase - 0.1} text="12.731" size={190} y={1230} color={C.bone} />
    <Label t={t} at={T.fabricados - 0.3} out={37.5} text="FABRICADOS ENTRE 1936 E 1945" y={1360} align="center" color={C.or} />
  </Cam>
);
// 6 · o checklist de hoje: o manual do agente (papel, com o avatar)
const TABS = [{n: 'ATENDE', at: T.atende}, {n: 'VENDE', at: T.vende}, {n: 'RESOLVE', at: T.resolve}];
const STEPS = ['RESPONDER EM ATÉ 5 MINUTOS', 'PERGUNTAR O QUE O CLIENTE QUER', 'MANDAR A PROPOSTA CERTA', 'COBRAR A RESPOSTA EM 2 DIAS', 'PASSAR PRO HUMANO SE TRAVAR', 'REGISTRAR TUDO NO CRM'];
const S6: React.FC<{t: number}> = ({t}) => {
  const tabsIn = TABS.filter((k) => t > k.at - 0.1).length;
  return (
    <Cam t={t} a={37.6} b={48.1} z0={1.0} z1={1.04} oy={600}>
      <div style={{position: 'absolute', inset: 0, transform: 'translateY(-60px) scale(0.92)', transformOrigin: '540px 690px'}}>
        <Card t={t} typeAt={T.escreve - 0.1} tickAt={(i) => T.passo + 0.2 + i * 0.12} title="B-17 · CHECKLIST DO PILOTO" strikeAt={T.agente - 0.25} newTitle="MANUAL DO AGENTE" items={STEPS} />
        {TABS.map((k, i) => { const u = P(t, k.at - 0.1, 0.35, E.pop); return u > 0 && <div key={i} style={{position: 'absolute', left: CARD.x - CARD.w / 2 + 40 + i * 200, top: CARD.y - CARD.h / 2 - 54, width: 180, height: 56, borderRadius: '12px 12px 0 0', background: i === tabsIn - 1 ? C.or : '#fbf7ee', boxShadow: '0 0 0 2px #121110', display: 'grid', placeItems: 'center', fontFamily: F.mono, fontSize: 20, letterSpacing: '0.16em', color: i === tabsIn - 1 ? '#fff' : C.pen, transform: `translateY(${((1 - u) * 30).toFixed(0)}px)`, opacity: clamp(u * 2)}}>{k.n}</div>; })}
      </div>
      <Label t={t} at={37.8} out={47.9} text="FIG. VI — O CHECKLIST DE HOJE" y={230} color={C.pdim} />
      <Thin t={t} at={T.sabe - 0.15} out={T.exatamente - 0.55} text="sabe o que é um checklist hoje?" size={52} y={1250} x={RX} color={C.pen} />
      <Thin t={t} at={T.exatamente - 0.2} out={T.pega - 0.6} text="é o que um agente precisa" size={54} y={1210} x={RX} color={C.pen} />
      <Ink t={t} at={T.trabalhar - 0.4} out={T.pega - 0.6} text="PRA TRABALHAR." size={110} y={1340} x={RX} maxW={RW} color={C.or} />
      <Thin t={t} at={T.pega - 0.2} out={T.escreve - 0.55} text="o jeito que o seu melhor" size={52} y={1170} x={RX} color={C.pen} />
      <Thin t={t} at={T.pega + 0.3} out={T.escreve - 0.55} text="funcionário…" size={52} y={1235} x={RX} color={C.pen} />
      {TABS.map((k, i) => <Ink key={i} t={t} at={k.at - 0.06} out={(TABS[i + 1]?.at ?? T.escreve) - 0.42} text={`${k.n}.`} size={120} y={1360} x={RX} maxW={RW} color={C.pen} />)}
      <Thin t={t} at={T.escreve - 0.15} out={47.95} text="e escreve," size={60} y={1220} x={RX} color={C.pen} />
      <Ink t={t} at={T.passo - 0.1} out={47.95} text="PASSO A PASSO." size={110} y={1350} x={RX} maxW={RW} color={C.or} />
    </Cam>
  );
};
// 7 · vira um agente: não esquece, não falta, não pede demissão (escuro, com o avatar)
const AGT = {x: 540, y: 680};
const S7: React.FC<{t: number}> = ({t}) => {
  const back = (k: number) => P(t, T.conhecimento - 0.2 + k * 0.14, 1.1, E.io), box = P(t, T.empresa3 - 0.9, 0.9, E.io);
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {[0, 1, 2].map((k) => <circle key={k} cx={AGT.x} cy={AGT.y} r={70 + k * 46 + Math.sin(t * 2 + k) * 4} fill="none" stroke={C.or} strokeWidth={1.4} opacity={0.4 - k * 0.1} />)}
        {CHIPS.map((c, k) => { const u = back(k); if (u <= 0) return null; const a0 = (k / CHIPS.length) * Math.PI * 2 + t * 0.4, r = lerp(620, 190, u), x = AGT.x + Math.cos(a0) * r * 0.95, y = AGT.y + Math.sin(a0) * r * 0.62; return <g key={k} opacity={clamp(u * 2)}><rect x={x - (c.length * 14 + 30) / 2} y={y - 19} width={c.length * 14 + 30} height={38} rx={19} fill={C.ink} stroke={C.or} strokeWidth={2} /><text x={x} y={y + 7} textAnchor="middle" fontFamily={F.mono} fontSize={18} letterSpacing="0.12em" fill={C.bone}>{c}</text></g>; })}
        {box > 0 && <g opacity={box}><path d={`M${AGT.x - 330} ${AGT.y + 260} V${AGT.y - 150} L${AGT.x} ${AGT.y - 330} L${AGT.x + 330} ${AGT.y - 150} V${AGT.y + 260} Z`} fill="none" stroke={C.bone} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - box} /><text x={AGT.x} y={AGT.y + 310} textAnchor="middle" fontFamily={F.mono} fontSize={22} letterSpacing="0.2em" fill={C.bone}>SUA EMPRESA</text></g>}
      </svg>
      <Dot x={AGT.x} y={AGT.y} r={30 + 4 * Math.sin(t * 4)} glow={2} />
      <Label t={t} at={48.1} out={56.7} text="FIG. VII — O AGENTE" y={230} />
      <Thin t={t} at={T.isso - 0.15} out={T.esquece - 0.5} text="isso vira um agente." size={66} y={1240} x={RX} />
      {[{s: 'NÃO ESQUECE.', at: T.esquece}, {s: 'NÃO FALTA.', at: T.falta}, {s: 'NÃO PEDE DEMISSÃO.', at: T.pede - 0.2}].map((k, i) => <Ink key={i} t={t} at={k.at - 0.1} out={T.conhecimento - 0.55} text={k.s} size={78} y={1150 + i * 105} x={RX} maxW={RW} color={i === 2 ? C.or : C.bone} />)}
      <Thin t={t} at={T.conhecimento - 0.2} out={56.75} text="e o conhecimento finalmente" size={52} y={1210} x={RX} />
      <Ink t={t} at={T.fica - 0.1} out={56.75} text="FICA NA SUA EMPRESA." size={100} y={1340} x={RX} maxW={RW} color={C.or} />
    </>
  );
};
// 8 · o olho: o agente vira a pupila; um checklist refletido na íris
const S8: React.FC<{t: number}> = ({t}) => {
  const open = t < T.sting ? P(t, T.por - 0.05, 0.9, E.io) * 0.92 + P(t, T.observa - 0.05, 0.35, E.out) * 0.08 : 1 - P(t, T.sting, 0.18, E.in);
  const pupil = t < T.observa ? 0.35 : lerp(0.35, 1, P(t, T.observa, 0.45, E.out));
  return (
    <>
      {open > 0.01 && <Eye t={t} open={Math.max(0.02, open)} pupil={pupil} cx={AGT.x} cy={AGT.y} R={290} checklist={0.24} />}
      {open < 0.3 && t < T.sting && <Dot x={AGT.x} y={AGT.y} r={30 * (1 - open * 3)} glow={2} />}
      <Thin t={t} at={T.por - 0.02} out={T.sting - 0.1} text="por enquanto…" size={86} y={1200} color={C.dim} />
      <Thin t={t} at={T.so - 0.05} out={T.sting + 0.15} text="só observa." size={136} y={1340} />
    </>
  );
};
// 9 · o logo: "Yohann" sai como uma folha impressa (linha laranja de impressão), "Escher" é escrito com a ponta laranja
const LOGO = {x0: 111, y0: 107, x1: 1345, y1: 739, w: 860};
const lg = (x: number, y: number) => { const s = LOGO.w / (LOGO.x1 - LOGO.x0), cx = (LOGO.x0 + LOGO.x1) / 2, cy = (LOGO.y0 + LOGO.y1) / 2; return {x: 540 + (x - cx) * s, y: 900 + (y - cy) * s, s}; };
const S9: React.FC<{t: number}> = ({t}) => {
  const a = T.sting + 0.35, yo = lg(111, 107), es = lg(202, 339), s = yo.s, YW = 1234 * s, YH = 630 * s, EW = 1008 * s, EH = 400 * s;
  const pr = P(t, a, 1.1, E.io), wr = P(t, a + 0.95, 1.3, E.smooth), shine = P(t, a + 2.4, 1.1, E.io), fade = P(t, 65.2, 0.7, E.in);
  const mask = `linear-gradient(180deg, #000 ${(pr * 100 - 2).toFixed(1)}%, transparent ${(pr * 100 + 1).toFixed(1)}%)`;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - fade}}>
      <div style={{position: 'absolute', left: yo.x, top: yo.y, width: YW, height: YH, WebkitMaskImage: mask, maskImage: mask}}><Img src={img('logo_yohann')} style={{width: YW, height: YH}} /></div>
      {pr > 0 && pr < 1 && <div style={{position: 'absolute', left: yo.x - 30, width: YW + 60, top: yo.y + YH * pr - 2, height: 4, background: C.or, boxShadow: `0 0 16px ${C.or}`}} />}
      <div style={{position: 'absolute', left: es.x, top: es.y, width: EW, height: EH, WebkitMaskImage: `linear-gradient(90deg, #000 ${(wr * 100 - 6).toFixed(1)}%, transparent ${(wr * 100 + 2).toFixed(1)}%)`, maskImage: `linear-gradient(90deg, #000 ${(wr * 100 - 6).toFixed(1)}%, transparent ${(wr * 100 + 2).toFixed(1)}%)`}}>
        <Img src={img('logo_escher')} style={{position: 'absolute', inset: 0, width: EW, height: EH, filter: 'drop-shadow(0 6px 18px rgba(255,90,31,.25))'}} />
        {shine > 0 && shine < 1 && <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `url(${img('logo_escher')})`, maskImage: `url(${img('logo_escher')})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', background: `linear-gradient(100deg, transparent ${(shine * 140 - 30).toFixed(0)}%, rgba(255,255,255,.85) ${(shine * 140 - 15).toFixed(0)}%, transparent ${(shine * 140).toFixed(0)}%)`}} />}
      </div>
      {wr > 0 && wr < 1 && <Dot x={es.x + EW * wr} y={es.y + EH * (0.55 + 0.25 * Math.sin(wr * 18))} r={9} glow={1.6} />}
    </div>
  );
};

// a trava laranja voa do painel até o primeiro quadradinho do cartão (passagem 3 → 4)
const FlyDot: React.FC<{t: number}> = ({t}) => {
  const u = P(t, 26.75, 0.65, E.io); if (t < 26.7 || u >= 1) return null;
  const b = BOX(0), x = lerp(TRAVA.x, b.x, u), y = lerp(TRAVA.y - 40, b.y, u) - Math.sin(u * Math.PI) * 220;
  return <Dot x={x} y={y} r={lerp(19, 12, u)} glow={1.8} />;
};

const LIGHT: [number, number][] = [[8.6, 15.95], [20.95, 31.9], [37.6, 47.95], [T.sting + 0.2, 80]];
const WINDOWS = [{a: 0.25, b: 8.4}, {a: 37.75, b: 56.7}];
export const MelhorFuncionario: React.FC<{audio: 'none' | 'mix'}> = ({audio}) => {
  useFonts(); usePreload(ALL);
  const frame = useCurrentFrame(), t = frame / FPS;
  const lightK = LIGHT.reduce((m, [a, b]) => Math.max(m, P(t, a, 0.4, E.io) * (1 - P(t, b, 0.35, E.io))), 0);
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden', fontFamily: F.head}}>
      <Scene t={t} a={0} b={8.6} enter={{kind: 'cut', d: 0}} exit={{kind: 'flip', d: 0.32}}><S0 t={t} /></Scene>
      <Scene t={t} a={8.6} b={15.95} light enter={{kind: 'flip', d: 0.4, delay: 0.3}} exit={{kind: 'drop', d: 0.45}}><S1 t={t} /></Scene>
      <Scene t={t} a={15.95} b={20.95} enter={{kind: 'cut', d: 0}} exit={{kind: 'fade', d: 0.3}}><S2 t={t} /></Scene>
      <Scene t={t} a={20.95} b={26.75} light enter={{kind: 'iris', x: TRAVA.x, y: TRAVA.y, d: 0.45}} exit={{kind: 'slide', d: 0.4}}><S3 t={t} /></Scene>
      <Scene t={t} a={26.75} b={31.9} light enter={{kind: 'rise', d: 0.5, delay: 0.1}} exit={{kind: 'flip', d: 0.32}}><S4 t={t} /></Scene>
      <Scene t={t} a={31.9} b={37.6} enter={{kind: 'flip', d: 0.4, delay: 0.3}} exit={{kind: 'push', d: 0.35}}><S5 t={t} /></Scene>
      <Scene t={t} a={37.6} b={47.95} light enter={{kind: 'zoom', d: 0.45}} exit={{kind: 'shrink', x: AGT.x, y: AGT.y, d: 0.5}}><S6 t={t} /></Scene>
      <Scene t={t} a={47.95} b={56.9} enter={{kind: 'iris', x: AGT.x, y: AGT.y, d: 0.5, delay: 0.35}} exit={{kind: 'fade', d: 0.25}}><S7 t={t} /></Scene>
      <Scene t={t} a={56.9} b={T.sting + 0.6} enter={{kind: 'cut', d: 0}} exit={{kind: 'fade', d: 0.1}}><S8 t={t} /></Scene>
      {t > T.sting && <Dot x={AGT.x} y={AGT.y} r={14 * (1 + 0.6 * Math.exp(-(t - T.sting) / 0.2)) * (1 - P(t, T.sting + 0.45, 0.3))} glow={2} />}
      <Scene t={t} a={T.sting + 0.2} b={80} light enter={{kind: 'iris', x: AGT.x, y: AGT.y, d: 0.55}}><S9 t={t} /></Scene>
      <FlyDot t={t} />
      {t > 47.95 && t < 48.5 && <Dot x={AGT.x} y={AGT.y} r={lerp(6, 30, P(t, 48.0, 0.4, E.out))} glow={2} />}
      <Avatar t={t} env={ENV.env} windows={WINDOWS} gestures={[{at: T.cabeca - 0.15, d: 0.95, pose: POSE.aponta}, {at: T.sabe - 0.05, d: 1.0, pose: POSE.maoAberta, flip: true}, {at: T.escreve - 0.1, d: 1.4, pose: POSE.notebook, flip: true}, {at: T.pede - 0.2, d: 1.0, pose: POSE.bracosCruzados, flip: true}, {at: T.fica - 0.1, d: 1.1, pose: POSE.joinha, flip: true}]} outline={lightK > 0.5 ? 'light' : 'dark'} />
      <Dust t={t} n={45} opacity={(1 - lightK) * 0.5} warm={0.08} />
      <Flash t={t} at={0.2} d={0.4} color={C.or} max={0.2} />
      <Flash t={t} at={T.caiu} d={0.6} color={C.or} max={0.6} />
      <Flash t={t} at={T.jazz} d={0.4} max={0.3} />
      <Flash t={t} at={T.sting} d={0.6} color={C.or} max={0.5} />
      <Ring t={t} at={T.agente2} x={AGT.x} y={AGT.y} r1={1100} d={1.2} />
      <Ring t={t} at={T.sting} x={AGT.x} y={AGT.y} r1={1300} d={1.4} />
      <Vignette strength={lerp(0.8, 0.32, lightK)} />
      <Grain frame={frame} amount={0.07 * (1 - lightK)} />
      <Grain frame={frame} amount={0.1 * lightK} dark />
      {audio === 'mix' && <Audio src={staticFile('eco7/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
