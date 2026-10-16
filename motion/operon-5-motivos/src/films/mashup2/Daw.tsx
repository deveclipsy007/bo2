// "Gravação de tela" de um produtor: arranjo com faixas, onda real da música, piano roll com os acordes detectados
// acendendo no instante em que tocam, medidores do mixer reagindo ao espectro. A tela vive num plano 3D filmado de perto.
import React from 'react';
import {E, P, clamp, lerp} from '../../lib/core';
import BEATS from '../mashup/beats.json';
import MUSIC from './music.json';
import {F, GOLD, kickAt, spec} from './pieces';

const B: number[] = BEATS.beats;
const SW = 1500, SH = 1180;                   // a "tela" do software
const PX = 150;                               // px por segundo no arranjo
const FLAT: Record<string, string> = {'C#': 'D♭', 'D#': 'E♭', 'F#': 'G♭', 'G#': 'A♭', 'A#': 'B♭'};
const chordName = (n: string) => { const m = n.endsWith('m'), r = m ? n.slice(0, -1) : n; return (FLAT[r] ?? r) + (m ? 'm' : ''); };
type Ch = {name: string; start: number; end: number; root: number; tones: number[]};
const CH = MUSIC.chords as Ch[];
const WAVE = MUSIC.wave as [number, number][];
const chordAt = (t: number) => CH.find((c) => t >= c.start && t < c.end) ?? CH[CH.length - 1];
const TRACKS: [string, string][] = [['Drums', '#ff7a45'], ['808 Bass', '#9b6bff'], ['Chords', '#2ed3b0'], ['Vocal', '#ff6fb5'], ['Riser FX', '#ffd23f'], ['Master', '#c9ccd3']];

const Arrange: React.FC<{t: number; drop: number; rise: number}> = ({t, drop, rise}) => {
  const head = 190, laneH = 92, top = 70, ox = head + 360;          // playhead fixo a 360 px da trilha
  const x = (s: number) => ox + (s - t) * PX;
  const vis = (a: number, b: number) => x(b) > head && x(a) < SW;
  return (
    <div style={{position: 'absolute', left: 0, top: 96, width: SW, height: top + laneH * TRACKS.length + 10, background: '#16171a', overflow: 'hidden'}}>
      {/* régua de compassos */}
      <div style={{position: 'absolute', left: head, right: 0, top: 0, height: top, background: '#1d1e22', borderBottom: '1px solid #2b2d33'}} />
      {B.map((b, i) => vis(b, b) && <div key={i} style={{position: 'absolute', left: x(b), top: i % 4 === 0 ? 30 : 50, width: 1, height: i % 4 === 0 ? 40 + laneH * TRACKS.length : 20, background: i % 4 === 0 ? '#3a3c43' : '#2a2c31'}}>{i % 4 === 0 && <span style={{position: 'absolute', left: 6, top: -26, fontFamily: F.mono, fontSize: 20, color: '#8b8f98'}}>{Math.floor(i / 4) + 13}</span>}</div>)}
      {TRACKS.map(([name, col], k) => {
        const y = top + k * laneH;
        return (
          <React.Fragment key={name}>
            <div style={{position: 'absolute', left: 0, top: y, width: head, height: laneH - 2, background: '#1f2024', borderRight: `4px solid ${col}`, display: 'flex', alignItems: 'center', paddingLeft: 18, boxSizing: 'border-box', fontFamily: F.grot, fontWeight: 800, fontSize: 24, color: '#e6e7ea'}}>{name}</div>
            {/* clipes de cada faixa conforme as seções da música */}
            {(k === 0 ? [[0, rise], [drop, 60.1]] : k === 1 ? [[drop, 60.1]] : k === 2 ? [[0, 60.1]] : k === 3 ? [[0, 18.9], [31.5, 60.1]] : k === 4 ? [[rise - 0.6, drop]] : [[0, 60.1]]).map(([a, b], j) => vis(a, b) && (
              <div key={j} style={{position: 'absolute', left: x(a), top: y + 6, width: (b - a) * PX, height: laneH - 14, borderRadius: 8, background: `${col}33`, boxShadow: `inset 0 0 0 2px ${col}aa`, overflow: 'hidden'}}>
                <div style={{position: 'absolute', left: 8, top: 4, fontFamily: F.grot, fontWeight: 800, fontSize: 16, color: col}}>{name.toUpperCase()}</div>
                {k === 0 && B.filter((bt) => bt >= a && bt < b && vis(bt, bt)).map((bt, q) => <div key={q} style={{position: 'absolute', left: (bt - a) * PX, bottom: 8, width: 6, height: 40 - (q % 2) * 16, background: col, borderRadius: 2}} />)}
                {k === 2 && CH.filter((c) => c.end > a && c.start < b && vis(c.start, c.end)).map((c, q) => <div key={q} style={{position: 'absolute', left: (c.start - a) * PX + 2, top: 30, width: (c.end - c.start) * PX - 4, height: 40, borderRadius: 6, background: `${col}55`, fontFamily: F.grot, fontWeight: 800, fontSize: 20, color: '#eafff9', paddingLeft: 8, boxSizing: 'border-box', lineHeight: '40px'}}>{chordName(c.name)}</div>)}
                {k === 4 && <svg width={(b - a) * PX} height={laneH - 14} style={{position: 'absolute', left: 0, top: 0}}><path d={`M0 ${laneH - 20} Q ${(b - a) * PX * 0.8} ${laneH - 20} ${(b - a) * PX} 6`} stroke={col} strokeWidth={4} fill="none" /></svg>}
              </div>
            ))}
            {(k === 3 || k === 5 || k === 1) && (() => {
              // forma de onda real (envelope da música) desenhada dentro da faixa
              const pts: string[] = [], n = WAVE.length, dur = MUSIC.wave_dur as number, amp = k === 1 ? 0.6 : 1;
              for (let px = Math.max(head, 0); px < SW; px += 3) { const s = t + (px - ox) / PX; if (s < 0 || s > dur) continue; const w = WAVE[Math.min(n - 1, Math.floor((s / dur) * n))]; pts.push(`${px},${(y + laneH / 2 - w[1] * 40 * amp).toFixed(1)}`); }
              const pts2: string[] = [];
              for (let px = SW - 1; px >= Math.max(head, 0); px -= 3) { const s = t + (px - ox) / PX; if (s < 0 || s > dur) continue; const w = WAVE[Math.min(n - 1, Math.floor((s / dur) * n))]; pts2.push(`${px},${(y + laneH / 2 - w[0] * 40 * amp).toFixed(1)}`); }
              if (k === 1 && t < drop - 1.2) return null;
              return <svg width={SW} height={SH} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}><polygon points={[...pts, ...pts2].join(' ')} fill={`${TRACKS[k][1]}cc`} /></svg>;
            })()}
          </React.Fragment>
        );
      })}
      {/* playhead */}
      <div style={{position: 'absolute', left: ox - 1, top: 0, width: 3, height: '100%', background: '#fff', boxShadow: `0 0 18px ${GOLD}`}} />
      <div style={{position: 'absolute', left: ox - 12, top: 0, width: 0, height: 0, borderLeft: '13px solid transparent', borderRight: '13px solid transparent', borderTop: '18px solid #fff'}} />
    </div>
  );
};

const PianoRoll: React.FC<{t: number}> = ({t}) => {
  const top = 96 + 70 + 92 * 6 + 20, h = SH - top - 10, keyW = 120, lo = 48, hi = 72, nh = h / (hi - lo), ox = keyW + 330;
  const x = (s: number) => ox + (s - t) * PX * 1.4;
  const cur = chordAt(t);
  const notes: {p: number; a: number; b: number; on: boolean}[] = [];
  CH.forEach((c) => { if (x(c.end) < keyW || x(c.start) > SW) return; const on = t >= c.start && t < c.end; c.tones.forEach((tn) => notes.push({p: 60 + tn > hi ? 48 + tn : 60 + tn, a: c.start, b: c.end, on})); notes.push({p: 48 + c.root, a: c.start, b: c.end, on}); });
  return (
    <div style={{position: 'absolute', left: 0, top, width: SW, height: h, background: '#121316', overflow: 'hidden', borderTop: '2px solid #2b2d33'}}>
      {Array.from({length: hi - lo}, (_, i) => { const p = hi - 1 - i, blk = [1, 3, 6, 8, 10].includes(p % 12), lit = cur.tones.includes(p % 12) && Math.abs(p - 60) < 12; return (
        <React.Fragment key={p}>
          <div style={{position: 'absolute', left: 0, top: i * nh, width: keyW, height: nh - 1, background: lit ? GOLD : blk ? '#1a1b1e' : '#e9e9ec', boxShadow: lit ? `0 0 16px ${GOLD}` : undefined}} />
          <div style={{position: 'absolute', left: keyW, right: 0, top: i * nh, height: nh - 1, background: blk ? '#17181b' : '#1b1c20'}} />
          {p % 12 === 0 && <span style={{position: 'absolute', left: 8, top: i * nh + nh - 22, fontFamily: F.mono, fontSize: 16, color: '#555'}}>C{Math.floor(p / 12) - 1}</span>}
        </React.Fragment>); })}
      {notes.map((n, i) => n.p >= lo && n.p < hi && <div key={i} style={{position: 'absolute', left: Math.max(keyW, x(n.a) + 2), top: (hi - 1 - n.p) * nh + 2, width: Math.max(0, x(n.b) - Math.max(keyW, x(n.a)) - 4), height: nh - 5, borderRadius: 4, background: n.on ? '#2ed3b0' : '#2ed3b055', boxShadow: n.on ? '0 0 18px #2ed3b0aa' : undefined}} />)}
      <div style={{position: 'absolute', left: ox - 1, top: 0, width: 3, height: '100%', background: '#fff'}} />
      <div style={{position: 'absolute', right: 40, top: 26, textAlign: 'right'}}>
        <div style={{fontFamily: F.mono, fontSize: 20, color: '#8b8f98', letterSpacing: '0.1em'}}>CHORD</div>
        <div style={{fontFamily: F.grot, fontWeight: 900, fontSize: 120, color: '#fff', lineHeight: 1, textShadow: '0 0 30px rgba(46,211,176,.6)'}}>{chordName(cur.name)}</div>
      </div>
    </div>
  );
};

const Transport: React.FC<{t: number}> = ({t}) => {
  let bi = 0; while (bi < B.length - 1 && B[bi + 1] <= t) bi++;
  const k = Math.min(1.2, kickAt(t)), s = spec(t);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: SW, height: 96, background: '#202125', borderBottom: '2px solid #2b2d33', display: 'flex', alignItems: 'center', gap: 34, padding: '0 28px', boxSizing: 'border-box', fontFamily: F.mono, color: '#e6e7ea'}}>
      <div style={{display: 'flex', gap: 10}}>{['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}</div>
      <div style={{width: 0, height: 0, borderTop: '16px solid transparent', borderBottom: '16px solid transparent', borderLeft: `26px solid ${GOLD}`, filter: `drop-shadow(0 0 10px ${GOLD})`}} />
      <div style={{fontSize: 30, padding: '8px 16px', background: '#141518', borderRadius: 8}}>112.35 <span style={{color: '#8b8f98', fontSize: 20}}>BPM</span></div>
      <div style={{fontSize: 30, padding: '8px 16px', background: '#141518', borderRadius: 8}}>{Math.floor(bi / 4) + 13}.{(bi % 4) + 1}.1</div>
      <div style={{fontSize: 22, color: '#8b8f98'}}>Tudo de Novo x Royalty — Remix.als</div>
      <div style={{marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'flex-end', height: 60}}>
        {s.slice(0, 18).map((v, i) => <div key={i} style={{width: 10, height: 6 + v * 54, borderRadius: 2, background: v > 0.8 ? '#ff5f57' : v > 0.6 ? GOLD : '#2ed3b0'}} />)}
      </div>
      <div style={{width: 20, height: 60, background: '#141518', borderRadius: 4, position: 'relative'}}><div style={{position: 'absolute', bottom: 0, width: '100%', height: `${clamp(k / 1.2) * 100}%`, background: k > 1 ? '#ff5f57' : '#2ed3b0', borderRadius: 4}} /></div>
    </div>
  );
};

/** A tela do DAW num plano 3D, filmada de perto: a câmera desliza, aproxima e no fim mergulha no playhead. */
export const Daw: React.FC<{t: number; a: number; b: number; drop: number; rise: number}> = ({t, a, b, drop, rise}) => {
  const u = P(t, a, 0.9, E.out), push = P(t, rise, b - rise, E.in), out = P(t, b - 0.25, 0.25, E.in);
  const rx = lerp(38, 22, P(t, a, b - a, E.io)), rz = lerp(-14, -6, P(t, a, b - a, E.io)), sc = lerp(1.15, 1.35, P(t, a, b - a, E.smooth)) * lerp(1, 2.6, push);
  const pan = lerp(120, -80, P(t, a, b - a, E.smooth));
  return (
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, #121722, #050608 70%)', opacity: clamp(u * 2) * (1 - out), overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 540, top: 960, perspective: 1300}}>
        <div style={{position: 'absolute', left: -SW / 2 + pan, top: -SH / 2, width: SW, height: SH, transform: `translateZ(${lerp(-500, 0, u)}px) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${sc})`, transformOrigin: '60% 50%', borderRadius: 18, overflow: 'hidden', boxShadow: '0 0 0 2px #2b2d33, 0 60px 160px rgba(0,0,0,.8), 0 0 140px rgba(46,211,176,.12)'}}>
          <Transport t={t} />
          <Arrange t={t} drop={drop} rise={rise} />
          <PianoRoll t={t} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0) 40%, rgba(255,255,255,.05) 50%, rgba(255,255,255,0) 60%)'}} />
        </div>
      </div>
      {/* profundidade de campo: bordas desfocadas por cima (cópia da cena seria pesada; uma névoa radial resolve) */}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 45% at 52% 50%, rgba(5,6,8,0) 55%, rgba(5,6,8,.85) 100%)'}} />
    </div>
  );
};
