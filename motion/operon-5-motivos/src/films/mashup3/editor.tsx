// O EDITOR: um app de música + vídeo (dark, vidro) filmado como gravação de tela. A timeline grava ao vivo
// (onda e faixas se preenchem até o playhead), clipes entram quando o cursor os solta, efeitos aparecem no FX,
// piano roll registra os acordes da música, exportação no fim. Coordenadas da janela: 2400×1500.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {E, P, clamp, lerp} from '../../lib/core';
import BEATS from '../mashup/beats.json';
import MUSIC from '../mashup2/music.json';
import {spec, kickAt} from '../mashup2/pieces';
import {DROP} from '../mashup2/story';
import {T} from './glass';
import {FX, PROG, Program} from './program';

export const WIN = {w: 2400, h: 1500};
const B: number[] = BEATS.beats;
const SONG = 60.1, TX0 = 236, TX1 = 2370;
export const tx = (s: number) => TX0 + (s / SONG) * (TX1 - TX0);
export const TR = {top: 840, h: 78};
export const trackY = (i: number) => TR.top + i * TR.h + TR.h / 2;     // 0 V3 · 1 V2 · 2 V1 · 3 Drums · 4 808 · 5 Chords · 6 Vocal · 7 Riser
export const BIN = ['v1_00', 'v1_07', 'v2_16', 'v1_05', 'v2_13', 'v2_04', 'v1_10', 'v2_06', 'v2_00', 'v1_03', 'v2_01', 'v2_15', 'v1_06', 'v2_02', 'v2_05'];
export const binPos = (i: number) => ({x: 34 + (i % 5) * 106 + 48, y: 150 + Math.floor(i / 5) * 186 + 85});
export const PV = {x: 700, y: 100, w: 360, h: 640};                  // canvas 9:16 do preview
export const TOOL = (i: number) => ({x: PV.x + PV.w + 24 + i * 56 + 22, y: 78 + 20 + 22});
export const FXROWS = ['Glow', 'Speed Ramp', 'Chromatic', 'Zoom Punch', 'Riser FX', 'Film Grain'];
export const fxPos = (i: number) => ({x: 2010, y: 168 + i * 62});
export const WHEEL = {x: 2110, y: 600};

const C = {bg: '#0f1013', panel: '#16171b', line: '#26282e', text: '#e7e8ec', dim: '#8b8f99', gold: '#e9b44c', v: '#7c8cff', fx: '#c27bff', txt: '#ff7ab8', dr: '#ff8a4c', bass: '#9b6bff', ch: '#2ed3b0', vox: '#ff6fb5', ris: '#ffd23f'};
const TRACKS: [string, string][] = [['V3 Texto', C.txt], ['V2 FX', C.fx], ['V1 Vídeo', C.v], ['A1 Drums', C.dr], ['A2 808', C.bass], ['A3 Acordes', C.ch], ['A4 Vocal', C.vox], ['A5 Riser', C.ris]];
const FLAT: Record<string, string> = {'C#': 'D♭', 'D#': 'E♭', 'F#': 'G♭', 'G#': 'A♭', 'A#': 'B♭'};
const chordName = (n: string) => { const m = n.endsWith('m'), r = m ? n.slice(0, -1) : n; return (FLAT[r] ?? r) + (m ? 'm' : ''); };
type Ch = {name: string; start: number; end: number; root: number; tones: number[]};
const CH = MUSIC.chords as Ch[];
const WAVE = MUSIC.wave as [number, number][];

const Panel: React.FC<{x: number; y: number; w: number; h: number; title?: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({x, y, w, h, title, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: C.panel, borderRadius: 14, boxShadow: `inset 0 0 0 1px ${C.line}`, overflow: 'hidden', ...style}}>
    {title && <div style={{position: 'absolute', left: 18, top: 12, fontFamily: T.ui, fontWeight: 600, fontSize: 20, color: C.dim, letterSpacing: '0.04em'}}>{title}</div>}
    {children}
  </div>
);

const Wave: React.FC<{y: number; color: string; upto: number; from?: number; to?: number; amp?: number}> = ({y, color, upto, from = 0, to = SONG, amp = 30}) => {
  const a = Math.max(from, 0), z = Math.min(to, upto); if (z <= a) return null;
  const n = WAVE.length, top: string[] = [], bot: string[] = [];
  for (let px = tx(a); px <= tx(z); px += 2.5) { const s = ((px - TX0) / (TX1 - TX0)) * SONG, w = WAVE[Math.min(n - 1, Math.floor((s / SONG) * n))]; top.push(`${px.toFixed(1)},${(y - w[1] * amp).toFixed(1)}`); bot.unshift(`${px.toFixed(1)},${(y - w[0] * amp).toFixed(1)}`); }
  return <polygon points={[...top, ...bot].join(' ')} fill={color} />;
};

export type EdState = {play: number; cursor: {x: number; y: number; down: boolean}; drag?: {kind: 'thumb' | 'fx'; i: number}; roll: number; exportU: number; keycap: number; scrub: boolean};

export const Editor: React.FC<{t: number; s: EdState}> = ({t, s}) => {
  const ph = s.play, phx = tx(ph);
  const clips = PROG.filter((c) => c.from <= ph + 0.01 && c.from < 41.2 || (c.from >= 53.5 && c.from <= ph + 0.01) || (c.from <= ph + 0.01 && c.from > 41.2));
  const dup = t >= 27.25;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: WIN.w, height: WIN.h, background: C.bg, borderRadius: 22, overflow: 'hidden', fontFamily: T.ui, color: C.text}}>
      {/* barra superior */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 64, background: '#18191d', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 22px'}}>
        <div style={{display: 'flex', gap: 10}}>{['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 15, height: 15, borderRadius: 8, background: c}} />)}</div>
        <div style={{fontWeight: 600, fontSize: 22}}>Tudo de Novo × Royalty <span style={{color: C.dim, fontWeight: 500}}>— projeto.mix</span></div>
        <div style={{marginLeft: 120, display: 'flex', gap: 16, alignItems: 'center', fontFamily: T.mono, fontSize: 24}}>
          <div style={{width: 0, height: 0, borderTop: '13px solid transparent', borderBottom: '13px solid transparent', borderLeft: `22px solid ${C.gold}`, filter: `drop-shadow(0 0 8px ${C.gold})`}} />
          <span style={{padding: '6px 14px', background: '#101114', borderRadius: 8}}>112.35 BPM</span>
          <span style={{padding: '6px 14px', background: '#101114', borderRadius: 8}}>{(() => { let i = 0; while (i < B.length - 1 && B[i + 1] <= ph) i++; return `${Math.floor(i / 4) + 1}.${(i % 4) + 1}.1`; })()}</span>
          <span style={{padding: '6px 14px', background: '#101114', borderRadius: 8, color: C.dim}}>{`00:${String(Math.floor(ph)).padStart(2, '0')}:${String(Math.floor((ph % 1) * 60)).padStart(2, '0')}`}</span>
        </div>
        <div style={{marginLeft: 'auto', display: 'flex', gap: 5, alignItems: 'flex-end', height: 40}}>{spec(ph).slice(0, 20).map((v, i) => <div key={i} style={{width: 7, height: 4 + v * 36, borderRadius: 2, background: v > 0.8 ? '#ff5f57' : v > 0.6 ? C.gold : C.ch}} />)}</div>
        <div style={{padding: '10px 22px', borderRadius: 10, background: s.exportU > 0 ? C.gold : '#2a2c33', color: s.exportU > 0 ? '#111' : C.text, fontWeight: 700, fontSize: 21}}>Exportar</div>
      </div>
      {/* biblioteca */}
      <Panel x={14} y={78} w={556} h={692} title="MÍDIA">
        {BIN.map((id, i) => { const p = binPos(i), used = clips.some((c) => c.id === id), dragging = s.drag?.kind === 'thumb' && s.drag.i === i; return (
          <div key={id} style={{position: 'absolute', left: p.x - 14 - 48, top: p.y - 78 - 85, width: 96, height: 170, borderRadius: 10, overflow: 'hidden', boxShadow: dragging ? `0 0 0 3px ${C.gold}` : used ? `0 0 0 2px ${C.v}88` : `0 0 0 1px ${C.line}`, opacity: dragging ? 0.45 : 1}}>
            <Img src={staticFile(`video/mashup/thumbs/${id}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>); })}
        <div style={{position: 'absolute', left: 18, bottom: 16, fontSize: 18, color: C.dim}}>15 clipes · 1080×1920 · 60 fps</div>
      </Panel>
      {/* preview / programa */}
      <Panel x={584} y={78} w={1232} h={692} title="PROGRAMA">
        <div style={{position: 'absolute', left: PV.x - 584, top: PV.y - 78, width: PV.w, height: PV.h, overflow: 'hidden', borderRadius: 6, boxShadow: '0 0 0 1px #2c2e35, 0 20px 60px rgba(0,0,0,.6)', background: '#000'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${PV.w / 1080})`, transformOrigin: '0 0'}}><Program t={ph} /></div>
          <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.08)', pointerEvents: 'none'}} />
        </div>
        <div style={{position: 'absolute', left: PV.x - 584 + PV.w + 24, top: 20, display: 'flex', gap: 12}}>{['↖', 'T', '✂', '◐'].map((k, i) => <div key={k} style={{width: 44, height: 44, borderRadius: 10, background: (k === 'T' && t > 37.4 && t < 39.3) ? C.gold : '#22242a', color: (k === 'T' && t > 37.4 && t < 39.3) ? '#111' : C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700}}>{k}</div>)}</div>
        <div style={{position: 'absolute', right: 24, bottom: 18, fontFamily: T.mono, fontSize: 18, color: C.dim}}>1080 × 1920 · 60 fps</div>
      </Panel>
      {/* efeitos + cor */}
      <Panel x={1830} y={78} w={556} h={692} title="EFEITOS">
        {FXROWS.map((n, i) => { const p = fxPos(i), on = (n === 'Glow' && t > 10.45) || (n === 'Riser FX' && t > 17.6), dragging = s.drag?.kind === 'fx' && s.drag.i === i; return (
          <div key={n} style={{position: 'absolute', left: 18, top: p.y - 78 - 24, width: 520, height: 48, borderRadius: 10, background: dragging ? '#2c2a20' : '#1d1e23', boxShadow: dragging ? `0 0 0 2px ${C.gold}` : undefined, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', boxSizing: 'border-box', fontSize: 21, fontWeight: 600}}>
            <div style={{width: 22, height: 22, borderRadius: 6, background: on ? C.gold : '#34363d'}} />{n}<span style={{marginLeft: 'auto', color: C.dim, fontSize: 17}}>{on ? 'ativo' : 'arrastar'}</span>
          </div>); })}
        {/* rodas de cor */}
        {[0, 1, 2].map((k) => { const cx = 130 + k * 150, cy = WHEEL.y - 78, g = FX.grade(t), pk = k === 2 ? {x: lerp(0, 26, g), y: lerp(0, -22, g)} : {x: 0, y: 0}; return (
          <div key={k} style={{position: 'absolute', left: cx - 62, top: cy - 62, width: 124, height: 124, borderRadius: '50%', background: 'conic-gradient(from 0deg, #ff4d4d, #ffd23f, #4dff88, #4dd2ff, #7c5cff, #ff4dd2, #ff4d4d)', boxShadow: '0 0 0 3px #101114'}}>
            <div style={{position: 'absolute', inset: 10, borderRadius: '50%', background: 'radial-gradient(circle, #d9d9d9 0%, rgba(30,30,34,.85) 70%)'}} />
            <div style={{position: 'absolute', left: 62 - 9 + pk.x, top: 62 - 9 + pk.y, width: 18, height: 18, borderRadius: 9, background: '#fff', boxShadow: '0 0 0 3px #111'}} />
            <div style={{position: 'absolute', left: 0, right: 0, top: 132, textAlign: 'center', fontSize: 17, color: C.dim}}>{['Sombras', 'Médios', 'Luzes'][k]}</div>
          </div>); })}
      </Panel>
      {/* TIMELINE */}
      <div style={{position: 'absolute', left: 14, top: 784, width: 2372, height: 702, background: C.panel, borderRadius: 14, boxShadow: `inset 0 0 0 1px ${C.line}`, overflow: 'hidden'}} />
      <svg width={WIN.w} height={WIN.h} style={{position: 'absolute', inset: 0}}>
        {/* régua */}
        {B.map((bt, i) => i % 4 === 0 && <g key={i}><line x1={tx(bt)} x2={tx(bt)} y1={800} y2={1480} stroke={C.line} strokeWidth={1} /><text x={tx(bt) + 4} y={826} fill={C.dim} fontFamily={T.mono} fontSize={16}>{i / 4 + 1}</text></g>)}
        {TRACKS.map(([n, col], i) => <g key={n}><rect x={20} y={trackY(i) - TR.h / 2 + 3} width={200} height={TR.h - 6} rx={8} fill="#1d1e23" /><rect x={20} y={trackY(i) - TR.h / 2 + 3} width={6} height={TR.h - 6} fill={col} /><text x={38} y={trackY(i) + 7} fill={C.text} fontFamily={T.ui} fontWeight={600} fontSize={20}>{n}</text></g>)}
        {/* V3 texto: as palavras de destaque viram blocos */}
        {[[0.5, 2.0, 'TUDO DE NOVO'], [4.98, 6.1, 'OUTRO LADO'], [6.62, 8.45, 'LUA'], [9.58, 10.65, 'FASE'], [15.16, 16.9, 'LUA'], [22.32, 24.4, 'VOLTA TUDO DE NOVO'], [26.13, 28.45, 'DE NOVO ×2'], [32.51, 37.15, 'FOLLOWING / ALL THE WAY'], [37.5, 39.2, 'Tudo de novo'], [52.41, 53.5, 'BOLSO'], [54.47, 55.0, 'BRO'], [57.95, 60.1, 'ASSINATURA']].map(([a, z, n], i) => (a as number) <= ph && <g key={i}><rect x={tx(a as number)} y={trackY(0) - 30} width={Math.max(8, tx(z as number) - tx(a as number))} height={60} rx={8} fill={`${C.txt}44`} stroke={C.txt} strokeWidth={2} /><text x={tx(a as number) + 8} y={trackY(0) + 7} fill="#ffd1e6" fontFamily={T.ui} fontWeight={700} fontSize={15}>{n as string}</text></g>)}
        {/* V2 FX */}
        {t > 10.45 && <g><rect x={tx(9.679)} y={trackY(1) - 30} width={tx(SONG) - tx(9.679)} height={60} rx={8} fill={`${C.fx}33`} stroke={C.fx} strokeWidth={2} /><text x={tx(9.679) + 10} y={trackY(1) + 7} fill="#ead6ff" fontFamily={T.ui} fontWeight={700} fontSize={16}>✦ Glow</text></g>}
        {t > 28.6 && <g><rect x={tx(28.5)} y={trackY(1) - 14} width={tx(SONG) - tx(28.5)} height={28} rx={6} fill={`${C.gold}44`} stroke={C.gold} strokeWidth={2} /><text x={tx(28.5) + 10} y={trackY(1) + 6} fill="#fff1cf" fontFamily={T.ui} fontWeight={700} fontSize={14}>◐ Color · gold</text></g>}
        {/* V1 vídeo: clipes soltos pelo cursor / gravados até o playhead */}
        {clips.map((c, i) => <g key={i}><rect x={tx(c.from) + 1} y={trackY(2) - 32} width={Math.max(4, tx(Math.min(c.to, Math.max(ph, c.from + 0.3))) - tx(c.from) - 2)} height={64} rx={7} fill={`${C.v}40`} stroke={C.v} strokeWidth={2} /></g>)}
        {clips.map((c, i) => <image key={`im${i}`} href={staticFile(`video/mashup/thumbs/${c.id}.jpg`)} x={tx(c.from) + 4} y={trackY(2) - 28} width={30} height={56} preserveAspectRatio="xMidYMid slice" />)}
        {dup && <rect x={tx(27.25)} y={trackY(2) - 36} width={tx(28.53) - tx(27.25)} height={72} rx={8} fill="none" stroke={C.gold} strokeWidth={3} strokeDasharray="8 6" opacity={1 - P(t, 28.2, 0.4)} />}
        {/* áudio: a música "cresce" — cada camada se grava até o playhead */}
        <rect x={tx(0)} y={trackY(3) - 30} width={Math.max(0, Math.min(phx, tx(17.7)) - tx(0))} height={60} rx={6} fill={`${C.dr}26`} stroke={C.dr} strokeWidth={1.5} />
        {ph > DROP && <rect x={tx(DROP)} y={trackY(3) - 30} width={phx - tx(DROP)} height={60} rx={6} fill={`${C.dr}26`} stroke={C.dr} strokeWidth={1.5} />}
        {B.filter((bt) => bt <= ph && (bt < 17.7 || bt >= DROP)).map((bt, i) => <rect key={i} x={tx(bt)} y={trackY(3) - 20} width={3} height={40} fill={C.dr} />)}
        {ph > DROP && <><rect x={tx(DROP)} y={trackY(4) - 30} width={phx - tx(DROP)} height={60} rx={6} fill={`${C.bass}26`} stroke={C.bass} strokeWidth={1.5} /><Wave y={trackY(4)} color={`${C.bass}cc`} upto={ph} from={DROP} amp={26} /></>}
        {CH.filter((c) => c.start <= ph).map((c, i) => <g key={i}><rect x={tx(c.start) + 1} y={trackY(5) - 30} width={Math.max(2, tx(Math.min(c.end, ph)) - tx(c.start) - 2)} height={60} rx={6} fill={`${C.ch}30`} stroke={C.ch} strokeWidth={1.5} />{tx(Math.min(c.end, ph)) - tx(c.start) > 40 && <text x={tx(c.start) + 6} y={trackY(5) + 7} fill="#cffff4" fontFamily={T.ui} fontWeight={700} fontSize={16}>{chordName(c.name)}</text>}</g>)}
        <Wave y={trackY(6)} color={`${C.vox}cc`} upto={ph} amp={30} />
        {t > 17.6 && <g><rect x={tx(17.18)} y={trackY(7) - 30} width={tx(DROP) - tx(17.18)} height={60} rx={6} fill={`${C.ris}22`} stroke={C.ris} strokeWidth={1.5} />
          <path d={(() => { let d = ''; const z = Math.min(Math.max(ph, 18.27), 22.0); for (let s2 = 18.27; s2 <= z; s2 += 0.05) d += `${d ? 'L' : 'M'}${tx(s2).toFixed(1)} ${(trackY(7) + 24 - Math.pow((s2 - 18.27) / 3.73, 2.2) * 48).toFixed(1)} `; return d; })()} stroke={C.ris} strokeWidth={4} fill="none" />
          <text x={tx(17.18) + 8} y={trackY(7) - 10} fill="#fff3bf" fontFamily={T.ui} fontWeight={700} fontSize={14}>Filtro ↗</text></g>}
        {/* playhead */}
        <line x1={phx} x2={phx} y1={800} y2={1480} stroke="#fff" strokeWidth={3} style={{filter: `drop-shadow(0 0 8px ${C.gold})`}} />
        <path d={`M${phx - 12} 800 L${phx + 12} 800 L${phx} 818 Z`} fill={s.scrub ? C.gold : '#fff'} />
      </svg>
      {/* PIANO ROLL (abre sobre a timeline) */}
      {s.roll > 0.001 && <PianoRoll t={t} ph={ph} u={s.roll} />}
      {/* exportação */}
      {s.exportU > 0 && <Export t={t} u={s.exportU} />}
      {/* atalho de teclado */}
      {s.keycap > 0 && <div style={{position: 'absolute', left: tx(26.4) - 40, top: 690, display: 'flex', gap: 10, opacity: s.keycap, transform: `translateY(${(1 - s.keycap) * 20}px)`}}>{['⌘', 'D'].map((k) => <div key={k} style={{minWidth: 70, height: 70, borderRadius: 14, background: 'rgba(30,31,36,.92)', boxShadow: '0 0 0 2px #3a3c44, 0 10px 30px rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 700}}>{k}</div>)}<div style={{alignSelf: 'center', marginLeft: 8, fontSize: 24, color: C.dim}}>duplicar</div></div>}
      {/* item sendo arrastado */}
      {s.drag && <div style={{position: 'absolute', left: s.cursor.x - 40, top: s.cursor.y - 60, width: s.drag.kind === 'thumb' ? 80 : 200, height: s.drag.kind === 'thumb' ? 142 : 46, borderRadius: 10, overflow: 'hidden', opacity: 0.85, boxShadow: `0 0 0 2px ${C.gold}, 0 20px 40px rgba(0,0,0,.6)`, background: '#2c2a20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, transform: 'rotate(-4deg)'}}>{s.drag.kind === 'thumb' ? <Img src={staticFile(`video/mashup/thumbs/${BIN[s.drag.i]}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : FXROWS[s.drag.i]}</div>}
      <Cursor x={s.cursor.x} y={s.cursor.y} down={s.cursor.down} />
    </div>
  );
};

const Cursor: React.FC<{x: number; y: number; down: boolean}> = ({x, y, down}) => (
  <svg width={48} height={48} viewBox="0 0 24 24" style={{position: 'absolute', left: x - 6, top: y - 4, transform: `scale(${down ? 0.86 : 1})`, transformOrigin: '20% 20%', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.6))', zIndex: 50}}><path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.8 L11.6 14 L18 14 Z" fill="#fff" stroke="#000" strokeWidth={1.3} strokeLinejoin="round" /></svg>
);

const PianoRoll: React.FC<{t: number; ph: number; u: number}> = ({t, ph, u}) => {
  const x0 = 14, y0 = lerp(1500, 784, E.out(u)), w = 2372, h = 702, keyW = 150, lo = 48, hi = 74, nh = (h - 70) / (hi - lo), px = 210;
  const X = (s: number) => keyW + 40 + (s - (ph - 4)) * px;          // rola com o playhead fixo
  const cur = CH.find((c) => ph >= c.start && ph < c.end) ?? CH[0];
  return (
    <div style={{position: 'absolute', left: x0, top: y0, width: w, height: h, background: '#121317', borderRadius: 14, boxShadow: `0 -20px 60px rgba(0,0,0,.6), inset 0 0 0 1px ${C.line}`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 64, background: '#1a1b20', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 20, fontWeight: 600, fontSize: 22}}><span style={{color: C.ch}}>●</span> Piano Roll — A3 Acordes<span style={{marginLeft: 'auto', color: C.dim}}>✕</span></div>
      {Array.from({length: hi - lo}, (_, i) => { const p = hi - 1 - i, blk = [1, 3, 6, 8, 10].includes(p % 12), lit = cur.tones.includes(p % 12) && ph >= cur.start; return <React.Fragment key={p}>
        <div style={{position: 'absolute', left: 0, top: 64 + i * nh, width: keyW, height: nh - 1, background: lit ? C.gold : blk ? '#1b1c20' : '#e8e8eb', boxShadow: lit ? `0 0 14px ${C.gold}` : undefined}} />
        <div style={{position: 'absolute', left: keyW, right: 0, top: 64 + i * nh, height: nh - 1, background: blk ? '#16171b' : '#1b1c21'}} />
        {p % 12 === 0 && <span style={{position: 'absolute', left: 10, top: 64 + i * nh + nh - 24, fontFamily: T.mono, fontSize: 16, color: '#666'}}>C{Math.floor(p / 12) - 1}</span>}
      </React.Fragment>; })}
      {CH.filter((c) => c.start <= ph && X(c.end) > keyW).flatMap((c, i) => [...c.tones.map((tn) => 60 + tn > hi - 1 ? 48 + tn : 60 + tn), 48 + c.root].map((p, j) => { const on = ph < c.end; const a = Math.max(keyW, X(c.start)), z = X(Math.min(c.end, ph)); return z > a && <div key={`${i}-${j}`} style={{position: 'absolute', left: a + 2, top: 64 + (hi - 1 - p) * nh + 2, width: z - a - 4, height: nh - 5, borderRadius: 5, background: on ? C.ch : `${C.ch}66`, boxShadow: on ? `0 0 16px ${C.ch}aa` : undefined}} />; }))}
      <div style={{position: 'absolute', left: X(ph) - 1, top: 64, width: 3, bottom: 0, background: '#fff'}} />
      <div style={{position: 'absolute', left: X(ph) + 50, top: 90}}><div style={{fontFamily: T.mono, fontSize: 20, color: C.dim, letterSpacing: '0.12em'}}>ACORDE</div><div style={{fontFamily: T.ui, fontWeight: 700, fontSize: 130, lineHeight: 1, color: '#fff', textShadow: `0 0 30px ${C.ch}88`}}>{chordName(cur.name)}</div></div>
      <div style={{position: 'absolute', left: X(ph) + 50, bottom: 30, display: 'flex', gap: 6, alignItems: 'flex-end', height: 120}}>{spec(ph).map((v, i) => <div key={i} style={{width: 10, height: 6 + v * 110, borderRadius: 3, background: v > 0.75 ? C.gold : C.ch, opacity: 0.5 + 0.5 * v}} />)}</div>
      <div style={{position: 'absolute', left: keyW + 20, bottom: 20, fontFamily: T.mono, fontSize: 18, color: C.dim}}>grave {Math.min(1, kickAt(ph)).toFixed(2)}</div>
    </div>
  );
};

const Export: React.FC<{t: number; u: number}> = ({t, u}) => {
  const name = 'tudo-de-novo_royalty.mp4', n = Math.floor(clamp((t - 55.45) / 0.8) * name.length), prog = P(t, 56.3, 1.4, E.smooth), done = t > 57.75;
  return (
    <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.45 * u})`}}>
      <div style={{position: 'absolute', left: 1200 - 420, top: 380, width: 840, height: 460, borderRadius: 22, background: 'rgba(28,29,34,.96)', boxShadow: '0 0 0 1px #3a3c44, 0 40px 120px rgba(0,0,0,.7)', opacity: u, transform: `scale(${lerp(0.92, 1, u)})`, padding: 40, boxSizing: 'border-box'}}>
        <div style={{fontWeight: 700, fontSize: 34}}>Exportar vídeo</div>
        <div style={{marginTop: 28, fontSize: 20, color: C.dim}}>Arquivo</div>
        <div style={{marginTop: 8, height: 60, borderRadius: 12, background: '#121317', boxShadow: `inset 0 0 0 2px ${n > 0 && !done ? C.gold : '#2c2e35'}`, display: 'flex', alignItems: 'center', padding: '0 18px', fontFamily: T.mono, fontSize: 24}}>{name.slice(0, n)}<span style={{opacity: Math.floor(t * 3) % 2 ? 1 : 0}}>|</span></div>
        <div style={{marginTop: 22, fontSize: 20, color: C.dim}}>1080 × 1920 · 60 fps · H.264 · áudio 48 kHz</div>
        <div style={{marginTop: 34, height: 18, borderRadius: 9, background: '#121317', overflow: 'hidden'}}><div style={{width: `${prog * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.gold}, #ffe3a3)`, boxShadow: `0 0 20px ${C.gold}`}} /></div>
        <div style={{marginTop: 16, display: 'flex', fontSize: 22}}><span>{done ? '✓ Pronto' : prog > 0 ? 'Renderizando…' : ''}</span><span style={{marginLeft: 'auto', fontFamily: T.mono}}>{Math.round(prog * 100)}%</span></div>
      </div>
    </div>
  );
};
