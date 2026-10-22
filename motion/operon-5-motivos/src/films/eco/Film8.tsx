// "O CONHECIMENTO ACABOU" — quem conecta primeiro vence. Avatar em ~34% do vídeo, transições contínuas e um gancho
// físico: o ENVELOPE LACRADO ("a parte mais assustadora") fica pregado no canto da tela o vídeo inteiro e só é aberto no
// fim. Diplomas que não fazem mais falta → envelope → as provas (sem cola) → todas as profissões destravadas → o detalhe →
// a empresa normal (especialistas que não se falam) → o jogo muda quando conecta → a construtora conectada (planta,
// orçamento, proposta, contrato, vídeo da casa) → antes × agora → o escritório inteiro → o envelope aberto → o olho → logo.
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {useFonts} from '../../lib/fonts';
import {E, P, clamp, lerp} from '../../lib/core';
import {FPS, T} from './time8';
import {C, Dot, Dust, F, Flash, Grain, IMG, Label, Reveal, Ring, Thin, Vignette, img, usePreload} from './fx';
import {Eye, rng} from './sims';
import {Ink} from './Film6';
import {Cam, Odo, Person, Scene, Stamp} from './Film7';
import {Avatar, POSE} from './Avatar';
import DIMS from './img8.json';
import ENV from './env8.json';

Object.assign(IMG, DIMS as unknown as Record<string, [number, number]>);
const ALL = Object.keys(DIMS).filter((k) => !k.startsWith('logo'));
const hash = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
const RX = 712, RW = 600;   // coluna de texto à direita enquanto o avatar está na tela
const ENV_POS = {x: 968, y: 232};

// ---------- o envelope lacrado (o gancho que atravessa o vídeo) ----------
const Envelope: React.FC<{x: number; y: number; s: number; seal: number; open?: number; label?: boolean; glow?: number}> = ({x, y, s, seal, open = 0, label = true, glow = 0}) => {
  const W = 560, H = 360;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <g transform={`translate(${x} ${y}) scale(${s.toFixed(4)})`} style={glow > 0 ? {filter: `drop-shadow(0 0 ${(20 * glow).toFixed(0)}px ${C.or})`} : undefined}>
        <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={10} fill="#efe6d4" stroke="#6f6a60" strokeWidth={2} />
        <path d={`M${-W / 2} ${-H / 2} L0 ${lerp(30, -H / 2 - 150, open)} L${W / 2} ${-H / 2}`} fill={open > 0.5 ? '#e4d9c3' : '#e8dec9'} stroke="#6f6a60" strokeWidth={2} />
        <path d={`M${-W / 2} ${H / 2} L-40 0 M${W / 2} ${H / 2} L40 0`} stroke="#6f6a60" strokeWidth={1.5} opacity={0.5} />
        {label && <text x={0} y={H / 2 - 50} textAnchor="middle" fontFamily={F.mono} fontSize={22} letterSpacing="0.18em" fill="#3a3530">A PARTE MAIS ASSUSTADORA</text>}
        {label && <text x={0} y={H / 2 - 20} textAnchor="middle" fontFamily={F.mono} fontSize={16} letterSpacing="0.2em" fill="#8a8170">ABRIR SÓ NO FIM</text>}
        {seal > 0 && open < 0.4 && <g transform={`translate(0 30) scale(${seal.toFixed(3)})`}><circle r={44} fill={C.or} /><circle r={34} fill="none" stroke="#c4440f" strokeWidth={3} /><text x={0} y={14} textAnchor="middle" fontFamily={F.head} fontWeight={900} fontSize={40} fill="#fff3e6">Y</text></g>}
        {open >= 0.4 && <g opacity={clamp((0.7 - open) * 3)}><circle cx={-18} cy={30} r={22} fill={C.or} /><circle cx={22} cy={34} r={18} fill={C.or} /></g>}
      </g>
    </svg>
  );
};

// ---------- painéis do gancho ----------
const Panel: React.FC<{t: number; at: number; x: number; title: string; years: string; children: React.ReactNode}> = ({t, at, x, title, years, children}) => {
  const u = P(t, at - 0.15, 0.5, E.out), strike = P(t, at + 0.5, 0.35, E.io); if (u <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x - 160, top: 330, width: 320, height: 640, opacity: clamp(u * 1.5), transform: `translateY(${((1 - u) * 60).toFixed(0)}px)`}}>
      <div style={{position: 'absolute', inset: 0, border: `1.5px solid ${C.mid}`, borderRadius: 10, background: '#111113', overflow: 'hidden'}}>{children}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: -44, textAlign: 'center', fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.bone}}>{title}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', fontFamily: F.mono, fontSize: 20, letterSpacing: '0.12em', color: C.dim}}>
        <span style={{position: 'relative'}}>{years}<span style={{position: 'absolute', left: -6, right: -6, top: '50%', height: 3, background: C.or, transform: `scaleX(${strike})`, transformOrigin: '0 50%'}} /></span>
        {strike > 0.9 && <span style={{color: C.or, marginLeft: 14, opacity: P(t, at + 0.85, 0.3)}}>0</span>}
      </div>
    </div>
  );
};
const Campaign: React.FC<{t: number; at: number}> = ({t, at}) => (
  <div style={{position: 'absolute', inset: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10}}>
    {Array.from({length: 12}, (_, k) => { const u = P(t, at + k * 0.07, 0.3, E.pop); return <div key={k} style={{borderRadius: 6, background: k % 4 === 1 ? C.or : '#26262a', transform: `scale(${u.toFixed(3)})`, display: 'grid', placeItems: 'center', color: C.bone, fontSize: 26, opacity: clamp(u * 2)}}>{k % 5 === 2 ? '▶' : k % 4 === 1 ? '' : <div style={{width: '60%', height: 6, background: C.mid, borderRadius: 3, boxShadow: `0 14px 0 ${C.mid}`}} />}</div>; })}
  </div>
);
const S0: React.FC<{t: number}> = ({t}) => (
  <>
    <Label t={t} at={0.3} out={9.6} text="FIG. I — O QUE ANTES EXIGIA DIPLOMA" y={230} />
    <Panel t={t} at={T.arquitetura} x={190} title="ARQUITETURA" years="5 ANOS">
      <Reveal name="rotplan" p={P(t, T.arquitetura - 0.1, 1.6, E.smooth)} x={160} y={300} width={290} />
    </Panel>
    <Panel t={t} at={T.direito} x={540} title="DIREITO" years="5 ANOS">
      <Reveal name="justitia" p={P(t, T.direito - 0.1, 1.4, E.smooth)} x={160} y={320} width={300} opacity={0.7} edge={0} />
      {[0, 1, 2, 3, 4].map((k) => <div key={k} style={{position: 'absolute', left: 30, right: 30, top: 420 + k * 34, height: 8, borderRadius: 4, background: k === 2 ? C.or : '#4a4a50', opacity: P(t, T.revisar + k * 0.1, 0.3), transform: `scaleX(${P(t, T.revisar + k * 0.1, 0.4, E.out).toFixed(3)})`, transformOrigin: '0 50%'}} />)}
    </Panel>
    <Panel t={t} at={T.marketing} x={890} title="MARKETING" years="4 ANOS"><Campaign t={t} at={T.marketing} /></Panel>
    <Thin t={t} at={T.hoje - 0.2} out={T.arquitetura - 0.35} text="hoje você não precisa ter estudado" size={52} y={1250} x={RX} />
    <Ink t={t} at={T.arquitetura - 0.08} out={T.direito - 0.45} text="ARQUITETURA." size={110} y={1300} x={RX} maxW={RW} />
    <Ink t={t} at={T.direito - 0.08} out={T.marketing - 0.42} text="NEM DIREITO." size={110} y={1300} x={RX} maxW={RW} />
    <Ink t={t} at={T.marketing - 0.08} out={9.7} text="NEM MARKETING." size={110} y={1300} x={RX} maxW={RW} color={C.or} />
  </>
);
// 1 · o envelope lacrado
const S1: React.FC<{t: number}> = ({t}) => {
  const drop = P(t, T.isso - 0.2, 0.7, E.settle), seal = P(t, T.assustadora - 0.05, 0.25, E.pop);
  return (
    <>
      <Envelope x={540} y={lerp(-300, 720, drop)} s={1.15} seal={seal} />
      <Label t={t} at={10.0} out={13.6} text="FIG. II — LACRADO ATÉ O FIM DO VÍDEO" y={230} />
      <Thin t={t} at={T.isso - 0.15} out={T.ja - 0.4} text="isso nem é a parte mais" size={56} y={1190} x={RX} />
      <Ink t={t} at={T.assustadora - 0.08} out={T.ja - 0.4} text="ASSUSTADORA." size={110} y={1320} x={RX} maxW={RW} color={C.or} />
      <Thin t={t} at={T.ja - 0.1} out={13.75} text="já já eu chego nela." size={66} y={1260} x={RX} />
    </>
  );
};
// 2 · as provas (papel)
const Sheet: React.FC<{t: number; at: number; x: number; rot: number; title: string; sub: string; score: string; stampAt: number; children?: React.ReactNode}> = ({t, at, x, rot, title, sub, score, stampAt, children}) => {
  const u = P(t, at, 0.55, E.out); if (u <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x - 215, top: 360, width: 430, height: 600, background: '#fbf7ee', borderRadius: 8, boxShadow: '0 24px 50px rgba(40,30,20,.22), 0 0 0 1.5px #121110', transform: `translateY(${((1 - u) * 260).toFixed(0)}px) rotate(${lerp(rot * 3, rot, u).toFixed(2)}deg)`, opacity: clamp(u * 2), overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 26, top: 22, fontFamily: F.mono, fontSize: 19, letterSpacing: '0.16em', color: C.pen}}>{title}</div>
      <div style={{position: 'absolute', left: 26, top: 50, fontFamily: F.mono, fontSize: 14, letterSpacing: '0.16em', color: C.pdim}}>{sub}</div>
      <div style={{position: 'absolute', left: 26, right: 26, top: 80, height: 2, background: C.pen, opacity: 0.6}} />
      {children}
      {Array.from({length: 6}, (_, k) => <div key={k} style={{position: 'absolute', left: 26, top: 370 + k * 30, display: 'flex', gap: 10, alignItems: 'center', opacity: P(t, at + 0.3 + k * 0.08, 0.3)}}>{['A', 'B', 'C', 'D'].map((l, j) => <span key={j} style={{width: 18, height: 18, borderRadius: 9, border: '1.5px solid #121110', background: hash(k, j + 2) > 0.7 || j === (k * 3) % 4 ? C.pen : 'transparent'}} />)}<span style={{width: 180, height: 5, borderRadius: 3, background: '#cfc8bb', marginLeft: 8}} /></div>)}
      <div style={{position: 'absolute', right: 24, bottom: 24, fontFamily: F.head, fontWeight: 900, fontSize: 44, color: C.pen, opacity: P(t, stampAt - 0.4, 0.3)}}>{score}</div>
      <Stamp t={t} at={stampAt} text="APROVADA" x={215} y={250} rot={-14} size={46} />
    </div>
  );
};
const S2: React.FC<{t: number}> = ({t}) => {
  const cola = P(t, T.nao2 - 0.25, 0.35, E.out), x = P(t, T.colou - 0.05, 0.25, E.pop);
  return (
    <Cam t={t} a={13.8} b={24.3} z0={1.0} z1={1.04} oy={700}>
      <Label t={t} at={14.0} out={24.0} text="FIG. III — AS PROVAS MAIS DIFÍCEIS DOS EUA" y={230} color={C.pdim} />
      <Sheet t={t} at={T.exame - 0.6} x={300} rot={-3} title="UNIFORM BAR EXAM" sub="ORDEM DOS ADVOGADOS · EUA" score="298/400" stampAt={T.advogados - 0.1}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 90, height: 270}}><Reveal name="justitia" p={P(t, T.exame - 0.4, 1.2, E.smooth)} x={215} y={135} width={190} light edge={0} /></div>
      </Sheet>
      <Sheet t={t} at={T.passou2 - 0.4} x={780} rot={3} title="USMLE" sub="PROVA DE MEDICINA · EUA" score="+20" stampAt={T.folga - 0.15}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 90, height: 270}}><Reveal name="vesalius" p={P(t, T.passou2 - 0.2, 1.2, E.smooth)} x={215} y={135} width={155} light edge={0} /></div>
      </Sheet>
      {cola > 0 && <div style={{position: 'absolute', left: 430, top: 860, width: 220, height: 150, background: '#f7e58a', transform: `rotate(-6deg) scale(${cola.toFixed(3)})`, boxShadow: '0 10px 20px rgba(0,0,0,.18)', padding: 14, boxSizing: 'border-box'}}>
        <div style={{fontFamily: F.thin, fontStyle: 'italic', fontSize: 30, color: '#4a4030'}}>cola ;)</div>
        {[0, 1, 2].map((k) => <div key={k} style={{height: 4, width: `${80 - k * 15}%`, background: '#8a7a50', marginTop: 12, borderRadius: 2}} />)}
        {x > 0 && <svg width={220} height={150} style={{position: 'absolute', inset: 0, overflow: 'visible'}}><path d="M20 20 L200 130 M200 20 L20 130" stroke={C.or} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - x} /></svg>}
      </div>}
      <Thin t={t} at={T.inteligencia - 0.2} out={T.passou2 - 0.45} text="a inteligência artificial já passou no exame" size={50} y={1160} color={C.pen} />
      <Ink t={t} at={T.ordem - 0.1} out={T.passou2 - 0.45} text="DA ORDEM DOS ADVOGADOS." size={92} y={1290} color={C.pen} />
      <Thin t={t} at={T.passou2 - 0.15} out={T.nao2 - 0.55} text="e na prova de medicina dos EUA" size={56} y={1160} color={C.pen} />
      <Ink t={t} at={T.n20 - 0.1} out={T.nao2 - 0.55} text="+20 PONTOS DE FOLGA." size={100} y={1290} color={C.or} />
      <Ink t={t} at={T.nao2 - 0.1} out={24.15} text="E NÃO COLOU." size={160} y={1240} color={C.pen} />
    </Cam>
  );
};
// 3 · todas as profissões destravadas (escuro, com o avatar)
const PROFS = ['ARQUITETO', 'ADVOGADO', 'MÉDICO', 'CONTADOR', 'DESIGNER', 'ENGENHEIRO', 'PUBLICITÁRIO', 'ANALISTA', 'TRADUTOR', 'ROTEIRISTA', 'EDITOR', 'FOTÓGRAFO', 'PROGRAMADOR', 'CONSULTOR', 'ECONOMISTA', 'PROFESSOR', 'NUTRICIONISTA', 'CORRETOR', 'COPYWRITER', 'AUDITOR', 'PSICÓLOGO', 'COMPRADOR', 'RECRUTADOR', 'JORNALISTA', 'ILUSTRADOR', 'MÚSICO', 'ESTATÍSTICO', 'PESQUISADOR', 'GESTOR', 'VENDEDOR', 'LOCUTOR', 'URBANISTA'];
const Lock: React.FC<{open: boolean; pop: number}> = ({open, pop}) => (
  <svg width={22} height={26} viewBox="0 0 22 26" style={{flex: 'none', transform: `scale(${lerp(1, 1.35, pop).toFixed(3)})`}}>
    <path d={open ? 'M6 12 V7 a5 5 0 0 1 10 0' : 'M6 12 V7 a5 5 0 0 1 10 0 V12'} fill="none" stroke={open ? C.or : C.dim} strokeWidth={2.4} transform={open ? 'translate(5 -3) rotate(18 11 7)' : undefined} />
    <rect x={2} y={12} width={18} height={13} rx={3} fill={open ? C.or : C.dim} />
  </svg>
);
const PG = (i: number) => ({x: 150 + (i % 4) * 260, y: 380 + Math.floor(i / 4) * 86});
const GAP = {x: 410, y: 380 + 4 * 86};   // o espaço vazio entre dois cards: "o detalhe"
const S3: React.FC<{t: number}> = ({t}) => {
  const unlocked = (i: number) => P(t, T.disponivel - 0.3 + hash(i, 4) * 1.2, 0.3, E.pop), dim = P(t, T.mas - 0.1, 0.5), spot = P(t, T.detalhe - 0.2, 0.7, E.io);
  const n = PROFS.filter((_, i) => unlocked(i) > 0.5).length;
  return (
    <>
      <Label t={t} at={24.4} out={33.0} text={`PROFISSÕES DESTRAVADAS: ${n}`} y={230} color={n > 0 ? C.or : C.dim} />
      <div style={{position: 'absolute', inset: 0, opacity: lerp(1, 0.22, dim)}}>
        {PROFS.map((p, i) => { const g = PG(i), u = unlocked(i), a = P(t, 24.3 + i * 0.03, 0.3); return (
          <div key={i} style={{position: 'absolute', left: g.x - 118, top: g.y - 30, width: 236, height: 60, borderRadius: 8, border: `1.5px solid ${u > 0.5 ? C.or : C.mid}`, background: u > 0.5 ? 'rgba(255,90,31,.10)' : '#141416', display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', boxSizing: 'border-box', opacity: a, fontFamily: F.mono, fontSize: 17, letterSpacing: '0.1em', color: u > 0.5 ? C.bone : C.dim}}>
            <Lock open={u > 0.5} pop={Math.sin(clamp(u) * Math.PI)} />{p}
          </div>); })}
      </div>
      {spot > 0 && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}><circle cx={lerp(800, GAP.x + 130, spot)} cy={lerp(1000, GAP.y, spot)} r={70} fill="none" stroke={C.or} strokeWidth={4} /><line x1={lerp(800, GAP.x + 130, spot) + 50} y1={lerp(1000, GAP.y, spot) + 50} x2={lerp(800, GAP.x + 130, spot) + 110} y2={lerp(1000, GAP.y, spot) + 110} stroke={C.or} strokeWidth={8} strokeLinecap="round" /><text x={lerp(800, GAP.x + 130, spot)} y={lerp(1000, GAP.y, spot) + 14} textAnchor="middle" fontFamily={F.head} fontWeight={900} fontSize={44} fill={C.or} opacity={P(t, T.ninguem, 0.3)}>?</text></svg>}
      <Thin t={t} at={T.ou - 0.2} out={T.qualquer - 0.45} text="o conhecimento de quase toda profissão" size={46} y={1250} x={RX} />
      <Ink t={t} at={T.qualquer - 0.1} out={T.mas - 0.4} text="PRA QUALQUER PESSOA." size={100} y={1300} x={RX} maxW={RW} color={C.or} />
      <Thin t={t} at={T.mas - 0.1} out={33.1} text="mas tem um detalhe…" size={66} y={1190} x={RX} />
      <Ink t={t} at={T.ninguem - 0.15} out={33.1} text="QUE NINGUÉM PERCEBEU." size={100} y={1320} x={RX} maxW={RW} />
    </>
  );
};
// 4 · a empresa normal: especialistas que não se falam (papel)
const ROLES = ['ARQUITETO', 'ENGENHEIRO', 'ADVOGADO', 'VENDEDOR', 'DESIGNER', 'CONTADOR'];
const RP = (i: number) => ({x: 200 + (i % 3) * 340, y: 470 + Math.floor(i / 3) * 360});
const NOTES = [{s: 'REUNIÃO ÀS 15H', i: 0}, {s: 'ME MANDA POR E-MAIL', i: 3}, {s: 'QUEM FICOU DE FAZER?', i: 4}, {s: 'AGUARDANDO APROVAÇÃO', i: 2}];
const Cubicles: React.FC<{t: number; fg: string; walls: number; net?: number}> = ({t, fg, walls, net = 0}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    {net > 0 && ROLES.map((_, i) => ROLES.map((__, j) => { if (j <= i) return null; const a = RP(i), b = RP(j), u = P(net, (i + j) * 0.04, 0.4); return u > 0 && <line key={`${i}-${j}`} x1={a.x} y1={a.y - 60} x2={lerp(a.x, b.x, u)} y2={lerp(a.y - 60, b.y - 60, u)} stroke={C.or} strokeWidth={2} opacity={0.65} />; }))}
    {ROLES.map((r, i) => { const p = RP(i), u = P(t, 33.3 + i * 0.08, 0.4, E.pop); return u > 0 && (
      <g key={i} opacity={clamp(u * 1.5)}>
        <path d={`M${p.x - 140} ${p.y - 170} V${p.y + 40} H${p.x + 140} V${p.y - 170}`} fill="none" stroke={fg} strokeWidth={6} opacity={walls} />
        <Person x={p.x} y={p.y - 10} h={120} color={net > 0.5 ? C.or : fg} />
        <rect x={p.x + 46} y={p.y - 66} width={44} height={56} rx={3} fill="none" stroke={fg} strokeWidth={2} opacity={0.6} />
        <text x={p.x} y={p.y + 82} textAnchor="middle" fontFamily={F.mono} fontSize={19} letterSpacing="0.16em" fill={fg}>{r}</text>
      </g>); })}
  </svg>
);
const S4: React.FC<{t: number}> = ({t}) => {
  const tryA = P(t, T.arquiteto, 0.6, E.io), tryB = P(t, T.advogado, 0.6, E.io);
  const tryLine = (a: number, b: number, u: number, breakAt: number, key: string) => { if (u <= 0) return null; const p = RP(a), q = RP(b), mid = lerp(p.x, q.x, 0.5), br = P(t, breakAt, 0.3, E.pop); return <g key={key}><line x1={p.x + 60} y1={p.y - 80} x2={lerp(p.x + 60, mid - 10, u)} y2={p.y - 80} stroke={C.or} strokeWidth={3} strokeDasharray="10 8" />{br > 0 && <text x={mid} y={p.y - 66} textAnchor="middle" fontFamily={F.head} fontWeight={900} fontSize={60 * br} fill={C.or}>✕</text>}</g>; };
  return (
    <Cam t={t} a={33.2} b={43.5} z0={1.0} z1={1.04} oy={700}>
      <Label t={t} at={33.4} out={43.2} text="FIG. IV — CADA UM NA SUA CAIXINHA" y={230} color={C.pdim} />
      <Cubicles t={t} fg={C.pen} walls={1} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>{tryLine(0, 1, tryA, T.engenheiro, 'a')}{tryLine(2, 3, tryB, T.vendedor, 'b')}</svg>
      {NOTES.map((n, k) => { const u = P(t, T.basicamente + k * 0.18, 0.3, E.pop), p = RP(n.i); return u > 0 && <div key={k} style={{position: 'absolute', left: p.x - 100 + (k % 2) * 40, top: p.y - 230, width: 200, padding: '10px 12px', background: '#f7e58a', fontFamily: F.mono, fontSize: 15, letterSpacing: '0.06em', color: '#3d3523', transform: `rotate(${(k % 2 ? 4 : -5)}deg) scale(${u.toFixed(3)})`, boxShadow: '0 8px 16px rgba(0,0,0,.15)'}}>{n.s}</div>; })}
      <Stamp t={t} at={T.normal - 0.1} text="EMPRESA NORMAL" x={540} y={640} rot={-8} size={70} />
      <Thin t={t} at={T.cada - 0.2} out={T.arquiteto - 0.45} text="cada inteligência dessa, sozinha," size={60} y={1200} color={C.pen} />
      <Ink t={t} at={T.ferramenta - 0.6} out={T.arquiteto - 0.45} text="É SÓ UMA FERRAMENTA." size={110} y={1320} color={C.pen} />
      <Thin t={t} at={T.arquiteto - 0.15} out={T.advogado - 0.45} text="um arquiteto que não fala com o engenheiro." size={48} y={1260} color={C.pen} />
      <Thin t={t} at={T.advogado - 0.15} out={T.basicamente - 0.4} text="um advogado que não conversa com o vendedor." size={48} y={1260} color={C.pen} />
      <Thin t={t} at={T.basicamente - 0.1} out={43.3} text="basicamente…" size={60} y={1200} x={RX} color={C.pen} />
      <Ink t={t} at={T.empresa - 0.15} out={43.3} text="UMA EMPRESA NORMAL." size={100} y={1320} x={RX} maxW={RW} color={C.or} />
    </Cam>
  );
};
// 5 · o jogo muda quando conecta → a construtora conectada (escuro)
const ST = [
  {k: 'PLANTA', at: T.planta - 0.3, label: 'A PLANTA.'},
  {k: 'ORÇAMENTO', at: T.orcamento - 0.3, label: 'O ORÇAMENTO.'},
  {k: 'PROPOSTA', at: T.proposta - 0.3, label: 'A PROPOSTA.'},
  {k: 'CONTRATO', at: T.contrato2 - 0.3, label: 'O CONTRATO.'},
  {k: 'VÍDEO', at: T.video - 0.3, label: 'O VÍDEO DA CASA.'},
];
const BOM = [['CIMENTO CP-II 50 kg', '120 sc', 'R$ 4.680'], ['AÇO CA-50 10 mm', '85 br', 'R$ 4.250'], ['TIJOLO 9×19×19', '8.400 un', 'R$ 7.560'], ['AREIA MÉDIA', '18 m³', 'R$ 2.340'], ['TELHA CERÂMICA', '3.100 un', 'R$ 6.820']];
const Doc: React.FC<{t: number; at: number; title: string; lines: number; sign?: boolean}> = ({t, at, title, lines, sign}) => (
  <div style={{position: 'absolute', left: 90, top: 70, width: 460, height: 560, background: '#fbf7ee', borderRadius: 6, boxShadow: '0 0 0 1.5px #121110', padding: 26, boxSizing: 'border-box'}}>
    <div style={{fontFamily: F.mono, fontSize: 17, letterSpacing: '0.14em', color: C.pen}}>{title}</div>
    <div style={{height: 2, background: C.pen, opacity: 0.6, margin: '12px 0 18px'}} />
    {Array.from({length: lines}, (_, k) => <div key={k} style={{height: 7, borderRadius: 3, background: k % 4 === 3 ? C.or : '#cfc8bb', marginBottom: 16, width: `${92 - (k * 13) % 30}%`, transform: `scaleX(${P(t, at + 0.1 + k * 0.06, 0.3, E.out).toFixed(3)})`, transformOrigin: '0 50%'}} />)}
    {sign && <svg width={300} height={70} style={{position: 'absolute', left: 26, bottom: 30}}><path d="M5 50 C40 10 60 60 90 30 S140 10 160 40 S220 60 290 20" fill="none" stroke={C.pen} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - P(t, at + 1.0, 0.7, E.io)} /><line x1={0} y1={62} x2={300} y2={62} stroke={C.pdim} strokeWidth={1.5} /></svg>}
  </div>
);
const S5: React.FC<{t: number}> = ({t}) => {
  const conn = P(t, T.muda - 0.2, 1.4, E.out), walls = 1 - P(t, T.jogo - 0.2, 0.9), toLine = P(t, T.pega - 0.4, 0.8, E.io);
  const idx = ST.reduce((k, s, i) => (t >= s.at ? i : k), -1), cam = idx < 0 ? 0 : lerp(Math.max(0, idx - 1), idx, P(t, ST[idx].at, 0.6, E.io));
  const zoomOut = P(t, T.tudo - 0.3, 1.0, E.io), sc = lerp(1, 0.36, zoomOut), camX = lerp(cam * 640, 2 * 640, zoomOut);
  const clock = Math.floor(lerp(13 * 60 + 2, 17 * 60 + 20, P(t, T.pega, 59.9 - T.pega)));
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - toLine}}>
        <Cubicles t={Math.max(t, 34.5)} fg={C.bone} walls={walls} net={conn} />
      </div>
      {toLine > 0 && <div style={{position: 'absolute', inset: 0, opacity: toLine}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '540px 700px', transform: `translateX(${(-camX * sc + (1 - sc) * 0).toFixed(1)}px) scale(${sc.toFixed(4)})`}}>
          <svg width={5 * 640 + 400} height={1400} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <line x1={540} y1={330} x2={540 + 4 * 640} y2={330} stroke={C.bone} strokeWidth={1.5} strokeDasharray="5 9" opacity={0.4} />
            {ST.map((s, i) => { const on = t >= s.at; return <g key={i}><circle cx={540 + i * 640} cy={330} r={on ? 18 : 10} fill={on ? C.or : C.mid} style={on ? {filter: `drop-shadow(0 0 10px ${C.or})`} : undefined} /><text x={540 + i * 640} y={290} textAnchor="middle" fontFamily={F.mono} fontSize={20} letterSpacing="0.16em" fill={on ? C.or : C.dim}>{`AGENTE ${i + 1} · ${s.k}`}</text></g>; })}
            {ST.map((s, i) => { if (i === 0) return null; const u = P(t, s.at - 0.5, 0.45, E.io); return u > 0 && u < 1 && <circle key={`p${i}`} cx={lerp(540 + (i - 1) * 640, 540 + i * 640, u)} cy={330} r={9} fill={C.orHi} />; })}
            {zoomOut > 0 && [0, 1, 2, 3].map((k) => { const ph = ((t - T.tudo) * 0.9 + k * 0.25) % 1; return <circle key={`z${k}`} cx={540 + ph * 4 * 640} cy={330} r={9} fill={C.orHi} />; })}
          </svg>
          {ST.map((s, i) => { const u = P(t, s.at, 0.5, E.out); if (u <= 0) return null; return (
            <div key={i} style={{position: 'absolute', left: 540 + i * 640 - 320, top: 380, width: 640, height: 700, opacity: clamp(u * 2)}}>
              {i === 0 && <Reveal name="rotplan" p={P(t, s.at, 1.1, E.smooth)} x={320} y={340} width={560} />}
              {i === 1 && <div style={{position: 'absolute', left: 50, top: 60, width: 540, fontFamily: F.mono, fontSize: 18, color: C.bone}}>
                <div style={{display: 'flex', justifyContent: 'space-between', color: C.dim, letterSpacing: '0.14em', marginBottom: 16}}><span>MATERIAL</span><span>QTD</span><span>PREÇO HOJE</span></div>
                {BOM.map((r, k) => <div key={k} style={{display: 'grid', gridTemplateColumns: '260px 1fr 1fr', gap: 8, padding: '12px 0', borderTop: `1px solid ${C.mid}`, opacity: P(t, s.at + 0.2 + k * 0.18, 0.3)}}><span>{r[0]}</span><span style={{textAlign: 'right'}}>{r[1]}</span><span style={{textAlign: 'right', color: C.orHi}}>{r[2]}</span></div>)}
                <div style={{display: 'flex', justifyContent: 'space-between', borderTop: `2px solid ${C.bone}`, paddingTop: 16, marginTop: 6, fontSize: 24}}><span>TOTAL DA OBRA</span><span style={{color: C.or, fontWeight: 500}}>{`R$ ${Math.round(lerp(0, 286400, P(t, s.at + 1.0, 0.9, E.out))).toLocaleString('pt-BR')}`}</span></div>
              </div>}
              {i === 2 && <Doc t={t} at={s.at} title="PROPOSTA Nº 0147 · CASA ROTONDA" lines={12} />}
              {i === 3 && <Doc t={t} at={s.at} title="CONTRATO DE EMPREITADA" lines={10} sign />}
              {i === 4 && <><div style={{position: 'absolute', left: 30, top: 80, width: 580, height: 400, borderRadius: 10, overflow: 'hidden', background: `linear-gradient(180deg, #2a2420 0%, #3a2f26 ${lerp(100, 55, P(t, s.at + 0.6, 1.2))}%, #1b1b1d 100%)`, boxShadow: `0 0 0 1.5px ${C.mid}`}}>
                <Reveal name="rotelev" p={P(t, s.at, 1.0, E.smooth)} x={290} y={210} width={540} />
                <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${(P(t, s.at + 1.1, 1.4) * 140 - 30).toFixed(0)}%, rgba(255,180,120,.35) ${(P(t, s.at + 1.1, 1.4) * 140 - 12).toFixed(0)}%, transparent ${(P(t, s.at + 1.1, 1.4) * 140).toFixed(0)}%)`}} />
                <div style={{position: 'absolute', left: 16, top: 14, fontFamily: F.mono, fontSize: 15, letterSpacing: '0.14em', color: C.or}}>● REC · RENDER 4K</div>
              </div>
              <div style={{position: 'absolute', left: 30, top: 500, width: 580, height: 8, borderRadius: 4, background: C.mid}}><div style={{width: `${(P(t, s.at + 0.3, 2.6) * 100).toFixed(1)}%`, height: '100%', borderRadius: 4, background: C.or}} /></div></>}
            </div>); })}
        </div>
        <Label t={t} at={T.pega} out={60.1} text={`SEGUNDA · ${String(Math.floor(clock / 60)).padStart(2, '0')}:${String(clock % 60).padStart(2, '0')}`} y={230} color={C.or} />
      </div>}
      <Label t={t} at={43.6} out={T.pega - 0.3} text="FIG. V — QUANDO VOCÊ CONECTA" y={230} />
      <Thin t={t} at={T.jogo - 0.2} out={T.conecta - 0.3} text="o jogo muda quando você" size={56} y={1250} x={RX} />
      <Ink t={t} at={T.conecta - 0.12} out={T.pega - 0.4} text="CONECTA." size={170} y={1330} x={RX} maxW={RW} color={C.or} />
      <Thin t={t} at={T.pega - 0.15} out={ST[0].at - 0.15} text="pega uma construtora pequena." size={66} y={1300} />
      {ST.map((s, i) => <Ink key={i} t={t} at={s.at - 0.05} out={(ST[i + 1]?.at ?? T.pronta + 0.3) - 0.42} text={s.label} size={130} y={1320} color={i === 4 ? C.or : C.bone} />)}
      <Thin t={t} at={T.pronta + 0.2} out={T.tudo - 0.4} text="antes de existir um tijolo." size={70} y={1300} />
      <Thin t={t} at={T.tudo - 0.15} out={T.tarde - 0.45} text="tudo conversando entre si," size={70} y={1250} />
      <Ink t={t} at={T.tarde - 0.25} out={60.15} text="NUMA TARDE." size={190} y={1360} color={C.or} />
    </>
  );
};
// 6 · antes × agora (papel)
const S6: React.FC<{t: number}> = ({t}) => {
  const day = Math.min(21, 1 + Math.floor(P(t, T.antes2, 3.0) * 21));
  return (
    <Cam t={t} a={60.3} b={64.2} z0={1.0} z1={1.05} oy={700}>
      <Label t={t} at={60.4} out={64.0} text="FIG. VI — ANTES × AGORA" y={230} color={C.pdim} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <text x={280} y={380} textAnchor="middle" fontFamily={F.mono} fontSize={24} letterSpacing="0.2em" fill={C.pdim}>ANTES</text>
        <text x={800} y={380} textAnchor="middle" fontFamily={F.mono} fontSize={24} letterSpacing="0.2em" fill={C.or}>AGORA</text>
        <line x1={540} y1={340} x2={540} y2={1060} stroke={C.pen} strokeWidth={1.5} opacity={0.3} />
        {Array.from({length: 5}, (_, k) => { const u = P(t, T.cinco - 0.2 + k * 0.08, 0.3, E.pop); return u > 0 && <Person key={k} x={150 + k * 65} y={560} h={90 * u} color={C.pen} />; })}
        <rect x={190} y={640} width={180} height={190} rx={10} fill="#fbf7ee" stroke={C.pen} strokeWidth={2.5} />
        <rect x={190} y={640} width={180} height={50} rx={10} fill={C.pen} />
        <text x={280} y={675} textAnchor="middle" fontFamily={F.mono} fontSize={20} letterSpacing="0.16em" fill={C.paper}>DIA</text>
        <text x={280} y={790} textAnchor="middle" fontFamily={F.head} fontWeight={900} fontSize={96} fill={C.pen}>{day}</text>
        <text x={280} y={900} textAnchor="middle" fontFamily={F.mono} fontSize={22} letterSpacing="0.16em" fill={C.pen}>5 PROFISSIONAIS · 3 SEMANAS</text>
        <circle cx={800} cy={620} r={110} fill="none" stroke={C.or} strokeWidth={4} />
        <line x1={800} y1={620} x2={800 + Math.sin(t * 6) * 80} y2={620 - Math.cos(t * 6) * 80} stroke={C.or} strokeWidth={6} strokeLinecap="round" />
        <circle cx={800} cy={620} r={9} fill={C.or} />
        <text x={800} y={900} textAnchor="middle" fontFamily={F.mono} fontSize={22} letterSpacing="0.16em" fill={C.or}>1 ECOSSISTEMA · 1 TARDE</text>
      </svg>
      <Thin t={t} at={T.antes2 - 0.3} out={T.semanas - 0.45} text="o que antes passava por cinco profissionais" size={48} y={1220} color={C.pen} />
      <Ink t={t} at={T.semanas - 0.3} out={64.05} text="E LEVAVA SEMANAS." size={120} y={1320} color={C.pen} />
    </Cam>
  );
};
// 7 · um escritório inteiro de especialistas (papel, com o avatar no fim)
const FLOORS = ['GESTÃO', 'MARKETING', 'FINANCEIRO', 'JURÍDICO', 'ENGENHARIA', 'ARQUITETURA'];
const S7: React.FC<{t: number}> = ({t}) => {
  const build = P(t, T.ecossistema - 0.6, 3.0, E.out), lit = P(t, T.escritorio - 0.3, 1.6), raro = P(t, T.raro - 0.05, 0.3, E.io);
  const BX = 540, BY = 1060, FW = 560, FH = 104;
  return (
    <Cam t={t} a={64.1} b={74.7} z0={1.0} z1={1.05} oy={700}>
      <Label t={t} at={64.2} out={74.4} text="FIG. VII — O SEU ESCRITÓRIO" y={230} color={C.pdim} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {FLOORS.map((f, k) => { const u = P(build, k / 7, 0.25, E.out); if (u <= 0) return null; const y = BY - (k + 1) * FH; return (
          <g key={k} opacity={clamp(u * 2)} transform={`translate(0 ${((1 - u) * -40).toFixed(1)})`}>
            <rect x={BX - FW / 2} y={y} width={FW} height={FH - 8} fill="#fbf7ee" stroke={C.pen} strokeWidth={2.2} />
            {Array.from({length: 6}, (_, j) => { const on = P(lit, (k * 6 + j) / 36, 0.08) > 0.5; return <rect key={j} x={BX - FW / 2 + 22 + j * 58} y={y + 18} width={40} height={FH - 44} fill={on ? C.or : 'none'} stroke={C.pen} strokeWidth={1.5} style={on ? {filter: `drop-shadow(0 0 6px ${C.or})`} : undefined} />; })}
            <text x={BX + FW / 2 - 18} y={y + FH / 2} textAnchor="end" fontFamily={F.mono} fontSize={17} letterSpacing="0.14em" fill={C.pen}>{f}</text>
          </g>); })}
        <path d={`M${BX - FW / 2 - 30} ${BY} H${BX + FW / 2 + 30}`} stroke={C.pen} strokeWidth={4} opacity={build} />
        {lit > 0.9 && <text x={BX} y={BY - 6 * FH - 24} textAnchor="middle" fontFamily={F.mono} fontSize={22} letterSpacing="0.2em" fill={C.or}>36 ESPECIALISTAS · 24 HORAS</text>}
      </svg>
      <Thin t={t} at={T.ecossistema - 0.6} out={T.naoE - 0.4} text="é isso que é um ecossistema." size={70} y={1250} color={C.pen} />
      <Thin t={t} at={T.naoE - 0.1} out={T.escritorio - 0.55} text="não é uma ferramenta." size={72} y={1250} color={C.pen} />
      <Ink t={t} at={T.escritorio - 0.3} out={T.conhecimento2 - 0.4} text="É UM ESCRITÓRIO INTEIRO." size={100} y={1300} color={C.pen} />
      <Thin t={t} at={T.conhecimento2 - 0.15} out={T.raro2 - 0.5} text="o conhecimento deixou de ser" size={52} y={1190} x={RX} color={C.pen} />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - P(t, T.raro2 - 0.5, 0.3)}}>
        <Ink t={t} at={T.raro - 0.08} out={74.5} text="RARO." size={150} y={1320} x={RX} maxW={RW} color={C.pen} />
        {raro > 0 && <div style={{position: 'absolute', left: RX - 180, top: 1316, width: 360 * raro, height: 12, background: C.or, transform: 'rotate(-3deg)', transformOrigin: '0 50%'}} />}
      </div>
      <Thin t={t} at={T.raro2 - 0.2} out={T.conectar - 0.4} text="o raro agora é quem sabe" size={56} y={1250} x={RX} color={C.pen} />
      <Ink t={t} at={T.conectar - 0.1} out={74.5} text="CONECTAR." size={150} y={1330} x={RX} maxW={RW} color={C.or} />
    </Cam>
  );
};
// 8 · o envelope aberto: o seu concorrente só precisa conectar primeiro (escuro)
const LETTER = 'O SEU CONCORRENTE NÃO PRECISA SER MELHOR QUE VOCÊ EM NADA.';
const S8: React.FC<{t: number}> = ({t}) => {
  const come = P(t, 74.65, 0.6, E.io), open = P(t, T.assustadora2 - 0.2, 0.7, E.io), letter = P(t, T.assustadora2 + 0.4, 0.6, E.out);
  const typed = Math.floor(clamp((t - T.concorrente + 0.4) / (T.nada - T.concorrente + 0.6)) * LETTER.length);
  const race = P(t, T.ele - 0.3, T.primeiro - T.ele + 0.3), lead = P(t, T.conectar2 - 0.2, 0.8, E.io);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - P(t, T.ele - 0.4, 0.4)}}>
        <Envelope x={lerp(ENV_POS.x, 540, come)} y={lerp(ENV_POS.y, 860, come)} s={lerp(0.17, 1.15, come)} seal={1} open={open} label={open < 0.3} />
        {letter > 0 && <div style={{position: 'absolute', left: 540 - 300, top: lerp(800, 380, letter), width: 600, minHeight: 360, background: '#fbf7ee', borderRadius: 6, boxShadow: '0 30px 60px rgba(0,0,0,.5)', padding: '40px 44px', boxSizing: 'border-box', opacity: clamp(letter * 2)}}>
          <div style={{fontFamily: F.mono, fontSize: 16, letterSpacing: '0.2em', color: C.pdim, marginBottom: 22}}>A PARTE MAIS ASSUSTADORA</div>
          <div style={{fontFamily: F.head, fontWeight: 900, fontSize: 50, lineHeight: 1.12, color: C.pen}}>{LETTER.slice(0, typed)}<span style={{color: C.or}}>{typed < LETTER.length ? '▍' : ''}</span></div>
        </div>}
      </div>
      {race > 0 && <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: P(t, T.ele - 0.4, 0.4)}}>
        {[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={760 + Math.cos(k * 1.05) * 110} cy={680 + Math.sin(k * 1.05) * 110} r={12} fill={lead > 0.5 ? C.or : C.mid} opacity={0.9} />)}
        {lead > 0 && [0, 1, 2, 3, 4, 5].map((k) => <line key={`l${k}`} x1={760} y1={680} x2={760 + Math.cos(k * 1.05) * 110 * lead} y2={680 + Math.sin(k * 1.05) * 110 * lead} stroke={C.or} strokeWidth={2} />)}
        <line x1={120} y1={580} x2={640} y2={580} stroke={C.mid} strokeWidth={2} strokeDasharray="6 10" /><line x1={120} y1={780} x2={640} y2={780} stroke={C.mid} strokeWidth={2} strokeDasharray="6 10" />
        <circle cx={lerp(120, 640, Math.min(1, race * 1.25))} cy={580} r={20} fill={C.or} style={{filter: `drop-shadow(0 0 12px ${C.or})`}} />
        <circle cx={lerp(120, 640, race * 0.62)} cy={780} r={20} fill={C.bone} />
        <text x={120} y={540} fontFamily={F.mono} fontSize={20} letterSpacing="0.16em" fill={C.or}>O SEU CONCORRENTE</text>
        <text x={120} y={740} fontFamily={F.mono} fontSize={20} letterSpacing="0.16em" fill={C.dim}>VOCÊ</text>
      </svg>}
      <Label t={t} at={74.8} out={81.7} text="FIG. VIII — O ENVELOPE" y={230} />
      <Thin t={t} at={T.parte2 - 0.2} out={T.concorrente - 0.45} text="e a parte assustadora é essa:" size={66} y={1250} />
      <Thin t={t} at={T.ele - 0.1} out={T.conectar2 - 0.35} text="ele só precisa" size={84} y={1250} />
      <Ink t={t} at={T.conectar2 - 0.12} out={81.75} text="CONECTAR" size={170} y={1230} color={C.or} />
      <Ink t={t} at={T.primeiro - 0.08} out={81.75} text="PRIMEIRO." size={170} y={1390} />
    </>
  );
};
// 9 · o olho
const S9: React.FC<{t: number}> = ({t}) => {
  const open = t < T.sting ? P(t, T.por - 0.05, 0.9, E.io) * 0.92 + P(t, T.observa - 0.05, 0.35, E.out) * 0.08 : 1 - P(t, T.sting, 0.18, E.in);
  const pupil = t < T.observa ? 0.35 : lerp(0.35, 1, P(t, T.observa, 0.45, E.out));
  return (
    <>
      {open > 0.01 && <Eye t={t} open={Math.max(0.02, open)} pupil={pupil} cx={540} cy={700} R={290} grid={0.11} />}
      <Thin t={t} at={T.por - 0.02} out={T.sting - 0.1} text="por enquanto…" size={86} y={1220} color={C.dim} />
      <Thin t={t} at={T.so - 0.05} out={T.sting + 0.15} text="só observa." size={136} y={1360} />
    </>
  );
};
// 10 · o logo: "Yohann" se monta em blocos que se conectam; "Escher" escrito com a ponta laranja
const LOGO = {x0: 111, y0: 107, x1: 1345, y1: 739, w: 860};
const lg = (x: number, y: number) => { const s = LOGO.w / (LOGO.x1 - LOGO.x0), cx = (LOGO.x0 + LOGO.x1) / 2, cy = (LOGO.y0 + LOGO.y1) / 2; return {x: 540 + (x - cx) * s, y: 900 + (y - cy) * s, s}; };
const rL = rng(55);
const CELLS = Array.from({length: 14 * 8}, (_, i) => ({c: i % 14, r: Math.floor(i / 14), d: rL()}));
const S10: React.FC<{t: number}> = ({t}) => {
  const a = T.sting + 0.35, yo = lg(111, 107), es = lg(202, 339), s = yo.s, YW = 1234 * s, YH = 630 * s, EW = 1008 * s, EH = 400 * s;
  const wr = P(t, a + 0.95, 1.3, E.smooth), shine = P(t, a + 2.4, 1.1, E.io), fade = P(t, 89.6, 0.7, E.in), cw = YW / 14, ch = YH / 8;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - fade}}>
      {CELLS.map((c, i) => { const u = P(t, a + c.d * 0.8, 0.35, E.out); if (u <= 0) return null; return (
        <div key={i} style={{position: 'absolute', left: yo.x + c.c * cw, top: yo.y + c.r * ch, width: cw + 0.6, height: ch + 0.6, overflow: 'hidden', opacity: clamp(u * 2), transform: `scale(${lerp(0.4, 1, u).toFixed(3)})`}}>
          <Img src={img('logo_yohann')} style={{position: 'absolute', left: -c.c * cw, top: -c.r * ch, width: YW, height: YH}} />
        </div>); })}
      <div style={{position: 'absolute', left: es.x, top: es.y, width: EW, height: EH, WebkitMaskImage: `linear-gradient(90deg, #000 ${(wr * 100 - 6).toFixed(1)}%, transparent ${(wr * 100 + 2).toFixed(1)}%)`, maskImage: `linear-gradient(90deg, #000 ${(wr * 100 - 6).toFixed(1)}%, transparent ${(wr * 100 + 2).toFixed(1)}%)`}}>
        <Img src={img('logo_escher')} style={{position: 'absolute', inset: 0, width: EW, height: EH, filter: 'drop-shadow(0 6px 18px rgba(255,90,31,.25))'}} />
        {shine > 0 && shine < 1 && <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `url(${img('logo_escher')})`, maskImage: `url(${img('logo_escher')})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', background: `linear-gradient(100deg, transparent ${(shine * 140 - 30).toFixed(0)}%, rgba(255,255,255,.85) ${(shine * 140 - 15).toFixed(0)}%, transparent ${(shine * 140).toFixed(0)}%)`}} />}
      </div>
      {wr > 0 && wr < 1 && <Dot x={es.x + EW * wr} y={es.y + EH * (0.55 + 0.25 * Math.sin(wr * 18))} r={9} glow={1.6} />}
    </div>
  );
};

// o envelope pregado no canto: vai do centro (cena 1) para o canto e fica lá até ser aberto (cena 8)
const PinnedEnvelope: React.FC<{t: number}> = ({t}) => {
  if (t < T.ja - 0.1 || t > 74.7) return null;
  const go = P(t, T.ja - 0.1, 0.7, E.io), pulse = (t > T.detalhe - 0.3 && t < T.percebeu + 0.6) || (t > T.parte2 - 0.8) ? 0.6 + 0.4 * Math.sin(t * 8) : 0;
  return <Envelope x={lerp(540, ENV_POS.x, go)} y={lerp(720, ENV_POS.y, go)} s={lerp(1.15, 0.17, go)} seal={1} label={go < 0.5} glow={pulse} />;
};

const LIGHT: [number, number][] = [[13.8, 24.2], [33.2, 43.4], [60.3, 74.6], [T.sting + 0.2, 95]];
const WINDOWS = [{a: 0.3, b: 13.75}, {a: 24.3, b: 32.95}, {a: 41.7, b: 45.9}, {a: 70.7, b: 74.55}];
export const ConhecimentoAcabou: React.FC<{audio: 'none' | 'mix'}> = ({audio}) => {
  useFonts(); usePreload(ALL);
  const frame = useCurrentFrame(), t = frame / FPS;
  const lightK = LIGHT.reduce((m, [a, b]) => Math.max(m, P(t, a, 0.4, E.io) * (1 - P(t, b, 0.35, E.io))), 0);
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden', fontFamily: F.head}}>
      <Scene t={t} a={0} b={9.8} exit={{kind: 'push', d: 0.4}}><S0 t={t} /></Scene>
      <Scene t={t} a={9.8} b={13.8} enter={{kind: 'cut', d: 0}} exit={{kind: 'fade', d: 0.3}}><S1 t={t} /></Scene>
      <Scene t={t} a={13.8} b={24.2} light enter={{kind: 'rise', d: 0.5}} exit={{kind: 'flip', d: 0.32}}><S2 t={t} /></Scene>
      <Scene t={t} a={24.2} b={33.2} enter={{kind: 'flip', d: 0.4, delay: 0.3}} exit={{kind: 'fade', d: 0.3}}><S3 t={t} /></Scene>
      <Scene t={t} a={33.2} b={43.4} light enter={{kind: 'iris', x: GAP.x + 130, y: GAP.y, d: 0.5}} exit={{kind: 'fade', d: 0.35}}><S4 t={t} /></Scene>
      <Scene t={t} a={43.4} b={60.3} enter={{kind: 'cut', d: 0}} exit={{kind: 'push', d: 0.35}}><S5 t={t} /></Scene>
      <Scene t={t} a={60.3} b={64.1} light enter={{kind: 'zoom', d: 0.45}} exit={{kind: 'slide', d: 0.4}}><S6 t={t} /></Scene>
      <Scene t={t} a={64.1} b={74.6} light enter={{kind: 'rise', d: 0.5, delay: 0.1}} exit={{kind: 'shrink', x: ENV_POS.x, y: ENV_POS.y, d: 0.5}}><S7 t={t} /></Scene>
      <Scene t={t} a={74.6} b={81.9} enter={{kind: 'iris', x: ENV_POS.x, y: ENV_POS.y, d: 0.5}} exit={{kind: 'fade', d: 0.25}}><S8 t={t} /></Scene>
      <Scene t={t} a={81.9} b={T.sting + 0.6} enter={{kind: 'iris', x: 640, y: 580, d: 0.5}} exit={{kind: 'fade', d: 0.1}}><S9 t={t} /></Scene>
      {t > T.sting && <Dot x={540} y={700} r={14 * (1 + 0.6 * Math.exp(-(t - T.sting) / 0.2)) * (1 - P(t, T.sting + 0.45, 0.3))} glow={2} />}
      <Scene t={t} a={T.sting + 0.2} b={95} light enter={{kind: 'iris', x: 540, y: 700, d: 0.55}}><S10 t={t} /></Scene>
      <PinnedEnvelope t={t} />
      <Avatar t={t} env={ENV.env} windows={WINDOWS} gestures={[{at: 0.9, d: 1.0, pose: POSE.maoAberta, flip: true}, {at: T.ja - 0.1, d: 1.1, pose: POSE.aponta}, {at: T.qualquer - 0.1, d: 1.0, pose: POSE.maoAberta, flip: true}, {at: T.detalhe - 0.1, d: 1.2, pose: POSE.aponta}, {at: T.normal - 0.3, d: 1.2, pose: POSE.bracosCruzados, flip: true}, {at: T.conecta - 0.2, d: 0.9, pose: POSE.aponta}, {at: T.conectar - 0.2, d: 1.0, pose: POSE.aponta}]} outline={lightK > 0.5 ? 'light' : 'dark'} />
      <Dust t={t} n={45} opacity={(1 - lightK) * 0.5} warm={0.08} />
      <Flash t={t} at={0.2} d={0.4} color={C.or} max={0.2} />
      <Flash t={t} at={T.conecta} d={0.6} color={C.or} max={0.55} />
      <Flash t={t} at={T.primeiro} d={0.5} color={C.or} max={0.5} />
      <Flash t={t} at={T.sting} d={0.6} color={C.or} max={0.5} />
      <Ring t={t} at={T.conecta} x={540} y={600} r1={1300} d={1.3} />
      <Ring t={t} at={T.sting} x={540} y={700} r1={1300} d={1.4} />
      <Vignette strength={lerp(0.8, 0.32, lightK)} />
      <Grain frame={frame} amount={0.07 * (1 - lightK)} />
      <Grain frame={frame} amount={0.1 * lightK} dark />
      {audio === 'mix' && <Audio src={staticFile('eco8/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
