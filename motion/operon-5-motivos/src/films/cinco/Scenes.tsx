// CENAS dos 5 motivos + fechamento + assinatura. Uma ideia por cena; cada elemento nasce na palavra falada (T/sync).
import React from 'react';
import {Img, staticFile} from 'remotion';
import {COLORS, FONTS} from '../../brand/tokens';
import {E, P, clamp, lerp, rnd, ACC, ACC2, AMBER, CYAN, INK, PAPER, MUTE, Say, Glass, Check, Sparkle, Icon, Dots, GhostNum, Fluffy, fl, OM, blurIn, outBlur, MascotPose} from '../../lib/ui';
import {LAST, N, T, at, W, H} from './story';

const WHITE = '#ffffff';
const rgba = (c: string, a: number) => { const n = parseInt(c.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
const mixHex = (a: string, b: string, u: number) => { const f = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; const [x, y] = [f(a), f(b)]; return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], u))).join(',')})`; };
const smooth = (pts: [number, number][]) => { // Catmull-Rom → Bézier
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
};
const SVG: React.FC<{children: React.ReactNode; z?: number; style?: React.CSSProperties}> = ({children, z = 20, style}) => <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible', zIndex: z, ...style}}>{children}</svg>;
const bez2 = (a: [number, number], b: [number, number], bend = 0.35) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1]; return `M${a[0]} ${a[1]} Q${mx - dy * bend} ${my + dx * bend} ${b[0]} ${b[1]}`; };
const qpt = (a: [number, number], b: [number, number], u: number, bend = 0.35): [number, number] => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], c: [number, number] = [mx - dy * bend, my + dx * bend], v = 1 - u; return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]]; };

const Wire: React.FC<{t: number; a: number; from: [number, number]; to: [number, number]; color?: string; pulse?: boolean; d?: number; bend?: number; w?: number}> = ({t, a, from, to, color = 'rgba(255,255,255,.4)', pulse = true, d = 0.7, bend = 0.25, w = 3}) => {
  const u = P(t, a, d, E.out); if (u <= 0) return null;
  const pu = ((t - a - d * 0.6) * 0.5) % 1, pp = qpt(from, to, clamp(pu));
  return <><path d={bez2(from, to, bend)} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - u} />{pulse && u > 0.98 && t > a + d && <circle cx={pp[0]} cy={pp[1]} r={7} fill="#fff" opacity={Math.sin(clamp(pu) * Math.PI)} style={{filter: `drop-shadow(0 0 8px ${ACC2})`}} />}</>;
};

const TITLE_Y = 250, TITLE_SIZE = 84, CAP_Y = 1470;
const capStyle = (dark: boolean) => ({color: dark ? 'rgba(255,255,255,.84)' : 'rgba(11,11,12,.8)', weight: 600, size: 54, lh: 1.2});

// ============ MOTIVO 1 · ativo, não só acesso (escuro) ============
export const M1: React.FC<{t: number}> = ({t}) => {
  const n = N.m1, o = LAST.m1 + 0.3, fo = outBlur(t, o + 0.05, 0.35);
  const aAtivo = T('ativo'), aAcesso = T('acesso'), aAlugar = T('alugar'), aTer = T('ter'), aTec = T('tecnologia');
  const cap = capStyle(true);
  const pA = P(t, aAtivo - 0.15, 0.75, E.out), pB = P(t, aAcesso - 0.15, 0.75, E.out), own = P(t, aTer, 0.5, E.pop), rent = P(t, aAlugar, 0.5, E.pop), tec = P(t, aTec - 0.1, 0.55, E.out);
  const pose = fl(t, [[0, OM.anim.idle], [aAcesso - 0.1, OM.anim.point], [aTer + 0.2, OM.anim.ok]]);
  const fx = 935 + (1 - E.out(P(t, aAcesso - 0.5, 0.9))) * 360;
  return (
    <>
      <Dots t={t} idx={0} a={n} out={o} />
      <GhostNum t={t} n="1" a={n} out={o} />
      <Say t={t} from={T('Construir') - 0.05} out={o} y={TITLE_Y} size={TITLE_SIZE} color={WHITE} lines={[[{t: 'Construir um'}, {t: 'ativo,', em: 'serif'}], [{t: 'não só pagar o acesso.'}]]} />
      <div style={{position: 'absolute', inset: 0, ...fo}}>
        {/* ATIVO */}
        <Glass style={{left: 70, top: 640, width: 700, height: 290, ...blurIn(t, aAtivo - 0.15, 0.75), boxShadow: `inset 0 1px 0 rgba(255,255,255,.12), 0 0 0 2px ${rgba(ACC, 0.55 + 0.25 * own)}, 0 0 ${50 + 50 * own}px ${rgba(ACC, 0.28 + 0.2 * own)}, 0 40px 90px rgba(0,0,0,.55)`, borderRadius: 38, zIndex: 30}}>
          <div style={{position: 'absolute', left: 36, top: 70, width: 150, height: 150, borderRadius: 40, background: `linear-gradient(150deg, ${ACC2}, ${ACC})`, boxShadow: `0 20px 50px ${rgba(ACC, 0.5)}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k="house" s={86} c="#fff" sw={1.6} /></div>
          <div style={{position: 'absolute', left: 224, top: 66, fontFamily: FONTS.display, fontWeight: 700, fontSize: 64, letterSpacing: '-0.04em'}}>Ativo</div>
          <div style={{position: 'absolute', left: 226, top: 146, fontSize: 30, color: 'rgba(255,255,255,.66)', lineHeight: 1.25}}>seu, construído para<br />o seu negócio</div>
          {own > 0 && <div style={{position: 'absolute', right: 28, top: 28, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 8px 8px', borderRadius: 999, background: rgba(ACC, 0.22), boxShadow: `inset 0 0 0 1px ${rgba(ACC2, 0.6)}`, transform: `scale(${lerp(0.6, 1, own)})`, opacity: clamp(own * 2)}}><Check u={own} size={34} fill={ACC} /><span style={{fontFamily: FONTS.display, fontWeight: 650, fontSize: 28}}>é seu</span></div>}
        </Glass>
        {/* ACESSO */}
        <Glass style={{left: 70, top: 980, width: 700, height: 290, ...blurIn(t, aAcesso - 0.15, 0.75), boxShadow: `inset 0 1px 0 rgba(255,255,255,.1), 0 0 0 1px ${rgba(AMBER, 0.45)}, 0 40px 90px rgba(0,0,0,.55)`, borderRadius: 38, zIndex: 30}}>
          <div style={{position: 'absolute', left: 36, top: 70, width: 150, height: 150, borderRadius: 40, background: `linear-gradient(150deg, #ffb870, ${AMBER})`, boxShadow: `0 20px 50px ${rgba(AMBER, 0.35)}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k="key" s={86} c={INK} sw={1.7} /></div>
          <div style={{position: 'absolute', left: 224, top: 66, fontFamily: FONTS.display, fontWeight: 700, fontSize: 64, letterSpacing: '-0.04em'}}>Acesso</div>
          <div style={{position: 'absolute', left: 226, top: 146, fontSize: 30, color: 'rgba(255,255,255,.66)', lineHeight: 1.25}}>você paga<br />para usar</div>
          {rent > 0 && <div style={{position: 'absolute', right: 28, top: 28, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 999, background: rgba(AMBER, 0.16), boxShadow: `inset 0 0 0 1px ${rgba(AMBER, 0.6)}`, color: AMBER, transform: `scale(${lerp(0.6, 1, rent)})`, opacity: clamp(rent * 2)}}><Icon k="repeat" s={28} c={AMBER} /><span style={{fontFamily: FONTS.display, fontWeight: 650, fontSize: 28}}>alugar</span></div>}
        </Glass>
        {/* tecnologia */}
        {tec > 0 && <div style={{position: 'absolute', left: 470, top: 548, zIndex: 31, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderRadius: 999, background: 'rgba(12,12,14,.7)', backdropFilter: 'blur(14px)', boxShadow: `inset 0 0 0 1px ${rgba(ACC2, 0.55)}, 0 20px 50px rgba(0,0,0,.4)`, color: '#fff', fontFamily: FONTS.display, fontWeight: 650, fontSize: 30, opacity: clamp(tec * 2), transform: `translateY(${(1 - tec) * 24}px)`}}><Sparkle u={clamp((t - aTec) / 0.8)} size={26} color={ACC2} /><Icon k="bolt" s={28} c={ACC2} />tecnologia</div>}
        {tec > 0 && <SVG z={29}><path d="M640 604 L640 640" stroke={ACC2} strokeWidth={3} strokeLinecap="round" opacity={tec} /></SVG>}
      </div>
      <Fluffy pose={pose} x={fx} y={1425} s={0.4} id="f-m1" dark flip o={(1 - P(t, o + 0.05, 0.35, E.in)) * clamp((t - (aAcesso - 0.5)) / 0.2)} z={40} />
      <Say t={t} from={aAlugar - 0.05} out={o} y={CAP_Y} size={cap.size} weight={cap.weight} lh={cap.lh} color={cap.color} lines={[[{t: 'Alugar o imóvel e ter um imóvel'}], [{t: 'seu são coisas bem'}, {t: 'diferentes,', em: 'serif'}], [{t: 'com tecnologia também.'}]]} />
    </>
  );
};

// ============ MOTIVO 2 · processo define o sistema (claro) ============
const ORG: [number, number][] = [[60, 420], [270, 150], [480, 500], [690, 190], [900, 430]];
const FLAT: [number, number][] = [[250, 350], [365, 350], [480, 350], [595, 350], [710, 350]];
export const M2: React.FC<{t: number}> = ({t}) => {
  const n = N.m2, o = LAST.m2 + 0.3, fo = outBlur(t, o + 0.05, 0.35);
  const aEmp = T('empresa'), aCaber = T('caber'), aSeu = at('Seu', T('ferramenta') + 0.05), aSis = at('sistema', aSeu);
  const draw = P(t, aEmp - 0.1, 1.1, E.out), toolP = P(t, aCaber - 0.35, 0.6, E.out);
  const u1 = P(t, aCaber, 0.9, E.io), u2 = P(t, aSeu, 1.0, E.settle), wgt = clamp(u1 * (1 - u2));
  const pts = ORG.map((p, i) => [lerp(p[0], FLAT[i][0], wgt), lerp(p[1], FLAT[i][1], wgt)] as [number, number]);
  const col = u2 > 0.02 ? mixHex(COLORS.amber, COLORS.blue, clamp(u2 * 1.4)) : mixHex(INK, COLORS.amber, clamp(wgt * 5));
  const d = smooth(pts);
  const toolOut = 1 - clamp(u2 * 1.6);
  const cap = capStyle(false);
  const lab = P(t, aEmp, 0.5, E.out), sys = P(t, aSis - 0.1, 0.6, E.out);
  return (
    <>
      <Dots t={t} idx={1} a={n} out={o} dark={false} />
      <GhostNum t={t} n="2" a={n} out={o} rgb="11,11,12" alpha={0.045} />
      <Say t={t} from={T('Parar') - 0.05} out={o} y={TITLE_Y} size={TITLE_SIZE} color={INK} boxFg={PAPER} lines={[[{t: 'Parar de'}, {t: 'entortar', em: 'strike'}], [{t: 'sua empresa para'}], [{t: 'caber numa ferramenta.'}]]} />
      <div style={{position: 'absolute', inset: 0, ...fo}}>
        <SVG z={20}>
          <g transform="translate(60 690)">
            {/* ferramenta rígida */}
            {toolP > 0.01 && <g opacity={toolP * toolOut} transform={`translate(${(1 - toolP) * -40} 0) translate(${u2 * 60} 0)`} style={{filter: u2 > 0 ? `blur(${u2 * 8}px)` : undefined}}>
              <rect x={170} y={200} width={620} height={300} rx={34} fill="#ececea" stroke="rgba(0,0,0,.14)" strokeWidth={2} strokeDasharray="10 10" />
              {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={FLAT[i][0] - 40} y={290} width={80} height={120} rx={20} fill="rgba(0,0,0,.06)" />)}
              <rect x={190} y={150} width={210} height={50} rx={25} fill="#dcdcd8" /><text x={295} y={184} textAnchor="middle" fontFamily={FONTS.body} fontWeight={700} fontSize={29} fill="#5a5a5e">Ferramenta</text>
            </g>}
            {/* sistema que abraça o processo */}
            {u2 > 0.02 && <path d={smooth(ORG)} fill="none" stroke={rgba(COLORS.blue, 0.1)} strokeWidth={190} strokeLinecap="round" strokeLinejoin="round" opacity={clamp(u2 * 1.5)} />}
            {u2 > 0.02 && <path d={smooth(ORG)} fill="none" stroke={rgba(COLORS.blue, 0.22)} strokeWidth={196} strokeLinecap="round" strokeLinejoin="round" opacity={clamp(u2 * 1.5) * 0.0} />}
            {/* processo da empresa */}
            <path d={d} fill="none" stroke={col} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={wgt > 0 || u2 > 0 ? 0 : 1 - draw} style={{filter: wgt > 0.3 ? `drop-shadow(0 0 14px ${rgba(AMBER, 0.55 * wgt)})` : u2 > 0.3 ? `drop-shadow(0 0 16px ${rgba(ACC, 0.4 * u2)})` : undefined}} />
            {pts.map((p, i) => { const q = P(t, aEmp + 0.15 * i, 0.4, E.pop); return q > 0 && <g key={i} transform={`translate(${p[0]} ${p[1]}) scale(${q})`}><circle r={30} fill="#fff" stroke={col} strokeWidth={6} /><circle r={9} fill={col} /></g>; })}
            {wgt > 0.55 && pts.map((p, i) => i % 2 === 0 && <g key={`x${i}`} transform={`translate(${p[0]} ${p[1] - 62})`} opacity={clamp((wgt - 0.55) * 4)}><circle r={17} fill={AMBER} /><text y={9} textAnchor="middle" fontFamily={FONTS.display} fontWeight={800} fontSize={26} fill={INK}>!</text></g>)}
          </g>
        </SVG>
        <div style={{position: 'absolute', left: 80, top: 1180, zIndex: 25, ...blurIn(t, aEmp, 0.5, 20), opacity: lab}}><div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderRadius: 999, background: '#fff', boxShadow: '0 12px 30px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.06)', fontFamily: FONTS.display, fontWeight: 650, fontSize: 30, color: INK}}><Icon k="flow" s={30} c={INK} />Seu processo</div></div>
        {sys > 0 && <div style={{position: 'absolute', right: 80, top: 1180, zIndex: 25, opacity: clamp(sys * 2), transform: `translateY(${(1 - sys) * 20}px) scale(${lerp(0.9, 1, sys)})`}}><div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderRadius: 999, background: ACC, boxShadow: `0 16px 40px ${rgba(ACC, 0.4)}`, fontFamily: FONTS.display, fontWeight: 650, fontSize: 30, color: '#fff'}}><Icon k="grid" s={30} c="#fff" />Seu sistema</div></div>}
      </div>
      <Say t={t} from={aSeu - 0.05} out={o} y={CAP_Y} size={56} weight={cap.weight} lh={cap.lh} color={cap.color} lines={[[{t: 'Seu processo define'}], [{t: 'o sistema,'}, {t: 'não o'}, {t: 'contrário.', em: 'serif'}]]} />
    </>
  );
};

// ============ MOTIVO 3 · expansão sem limite (escuro, partículas) ============
export const M3: React.FC<{t: number}> = ({t}) => {
  const n = N.m3, o = LAST.m3 + 0.3, fo = outBlur(t, o + 0.05, 0.35);
  const aProd = T('produtos'), aUni = T('unidades'), aInt = T('integrações'), aEv = T('evoluir'), aLim = T('limite');
  const CORE: [number, number] = [540, 1020];
  const TILES: [string, string, number, number, number][] = [['Novos produtos', 'box', 210, 770, aProd], ['Unidades', 'pin', 870, 770, aUni], ['Integrações', 'link', 540, 1330, aInt]];
  const grow = TILES.reduce((s, tl) => s + P(t, tl[4], 0.7, E.settle), 0) / 3;
  const cp = P(t, N.m3 + 0.55, 0.8, E.out), evo = P(t, aEv - 0.1, 1.0, E.out);
  const lim = P(t, aLim - 0.1, 0.55, E.out), limGone = P(t, aLim + 0.55, 0.6, E.in);
  const cap = capStyle(true);
  return (
    <>
      <Dots t={t} idx={2} a={n} out={o} />
      <GhostNum t={t} n="3" a={n} out={o} />
      <Say t={t} from={T('Preparar') - 0.05} out={o} y={TITLE_Y} size={TITLE_SIZE} color={WHITE} lines={[[{t: 'Preparar sua'}], [{t: 'expansão,', em: 'serif'}]]} />
      <div style={{position: 'absolute', inset: 0, ...fo}}>
        <SVG z={18}>
          {/* anéis de evolução: a estrutura passa do limite em vez de bater nele */}
          {evo > 0 && [0, 1, 2].map((k) => { const u = clamp(((t - aEv) * 0.55 + k / 3) % 1), r = lerp(160, 560, E.out(u)); return <ellipse key={k} cx={CORE[0]} cy={CORE[1]} rx={r} ry={r * 0.9} fill="none" stroke={rgba(ACC2, 0.5)} strokeWidth={2.5} opacity={(1 - u) * evo * 0.9} />; })}
          {TILES.map(([, , x, y, a]) => <Wire key={a} t={t} a={a - 0.25} from={CORE} to={[x, y + (y > CORE[1] ? -50 : 50)]} color="rgba(143,162,255,.7)" d={0.8} bend={y > CORE[1] ? 0 : 0.18} />)}
          {lim > 0 && <g opacity={1 - limGone}><path d={`M70 640 L${70 + 940 * E.out(lim)} 640`} stroke={AMBER} strokeWidth={4} strokeDasharray="16 12" strokeLinecap="round" style={{filter: `drop-shadow(0 0 12px ${rgba(AMBER, 0.6)})`}} /></g>}
        </SVG>
        {lim > 0 && <div style={{position: 'absolute', left: 80, top: 575, zIndex: 25, opacity: (1 - limGone) * clamp(lim * 2), fontFamily: FONTS.display, fontWeight: 650, fontSize: 28, color: AMBER, letterSpacing: '0.04em'}}>limite</div>}
        <Glass style={{left: CORE[0] - 200, top: CORE[1] - 105, width: 400, height: 210, borderRadius: 40, opacity: clamp(cp * 1.6), transform: `scale(${lerp(0.8, 1, E.settle(cp)) * (1 + grow * 0.12)})`, boxShadow: `inset 0 1px 0 rgba(255,255,255,.14), 0 0 0 2px ${rgba(ACC, 0.7)}, 0 0 ${70 + grow * 110}px ${rgba(ACC, 0.35 + grow * 0.3)}, 0 40px 90px rgba(0,0,0,.55)`, zIndex: 30}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, height: '100%'}}><div style={{width: 92, height: 92, borderRadius: 28, background: `linear-gradient(150deg, ${ACC2}, ${ACC})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k="grid" s={52} c="#fff" /></div><div style={{fontFamily: FONTS.display, fontWeight: 700, fontSize: 48, letterSpacing: '-0.035em', lineHeight: 1.05}}>Seu<br />sistema</div></div>
        </Glass>
        {TILES.map(([label, ic, x, y, a], i) => { const p = P(t, a - 0.15, 0.6, E.out), q = P(t, a, 0.5, E.pop); return p > 0 && (
          <Glass key={label} style={{left: x - 165, top: y - 62, width: 330, height: 124, borderRadius: 32, opacity: clamp(p * 1.8), transform: `translateY(${(1 - p) * 40}px) scale(${lerp(0.85, 1, E.settle(p))})`, boxShadow: `inset 0 1px 0 rgba(255,255,255,.12), 0 0 0 1px rgba(255,255,255,.12), 0 0 ${30 * (1 - clamp((t - a) / 1.2))}px ${rgba(ACC2, 0.7)}, 0 30px 70px rgba(0,0,0,.5)`, zIndex: 30}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, height: '100%', padding: '0 22px'}}><span style={{display: 'flex', width: 62, height: 62, borderRadius: 20, background: 'rgba(143,162,255,.16)', alignItems: 'center', justifyContent: 'center', color: ACC2, transform: `scale(${q > 0 ? lerp(0.7, 1, q) : 1})`}}><Icon k={ic} s={34} /></span><span style={{fontFamily: FONTS.display, fontWeight: 650, fontSize: 35, letterSpacing: '-0.03em', lineHeight: 1.1}}>{label}</span></div>
          </Glass>); })}
      </div>
      <Say t={t} from={at('numa', aInt) - 0.05} out={o} y={CAP_Y - 20} size={54} weight={cap.weight} lh={cap.lh} color={cap.color} lines={[[{t: 'numa estrutura projetada'}], [{t: 'para'}, {t: 'evoluir,', em: 'serif'}, {t: 'não para virar'}], [{t: 'seu próximo'}, {t: 'limite.', em: 'strike'}]]} />
    </>
  );
};

// ============ MOTIVO 4 · método vira vantagem (azul) ============
export const M4: React.FC<{t: number}> = ({t}) => {
  const n = N.m4, o = LAST.m4 + 0.3, fo = outBlur(t, o + 0.05, 0.35);
  const aMet = T('método'), aConc = T('concorrente'), aMesma = T('mesma'), aJeito = T('jeito'), aPronto = T('pronto'), aAss = T('assinatura');
  const pa = P(t, aConc - 0.2, 0.8, E.out), eq = P(t, aMesma, 0.5, E.pop), met = P(t, aJeito - 0.1, 0.9, E.settle), np = P(t, aPronto - 0.05, 0.6, E.out);
  const pose = fl(t, [[0, OM.anim.idle], [aMesma - 0.2, OM.anim.think], [aJeito - 0.1, OM.anim.point]]);
  const fx = 900 + (1 - E.out(P(t, aConc - 0.2, 0.9))) * 330;
  const cap = capStyle(true);
  const Tool: React.FC<{who: 'you' | 'them'}> = ({who}) => {
    const mine = who === 'you', x = mine ? 70 : 570, glow = mine ? met : 0;
    return (
      <Glass dark={false} style={{left: x, top: 610, width: 440, height: 500, borderRadius: 38, zIndex: 30, ...blurIn(t, aConc - 0.2 + (mine ? 0 : 0.18), 0.8), boxShadow: mine && glow > 0 ? `0 0 0 3px ${ACC}, 0 0 ${60 * glow}px ${rgba(ACC, 0.55)}, 0 30px 70px rgba(0,0,0,.25)` : '0 1px 0 rgba(0,0,0,.04), 0 30px 70px rgba(0,0,0,.22), 0 0 0 1px rgba(0,0,0,.05)'}}>
        <div style={{position: 'absolute', left: 30, top: 28, display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONTS.display, fontWeight: 700, fontSize: 32, letterSpacing: '-0.03em', color: INK}}><span style={{width: 46, height: 46, borderRadius: 23, background: mine ? ACC : '#d9d9dd', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k="user" s={26} c={mine ? '#fff' : '#6a6a6e'} /></span>{mine ? 'Você' : 'Concorrente'}</div>
        <div style={{position: 'absolute', left: 30, right: 30, top: 98, height: 126, borderRadius: 24, background: '#f2f2f2', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.05)', padding: '16px 24px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONTS.display, fontWeight: 650, fontSize: 28, color: '#3a3a3e'}}><Icon k="grid" s={30} c="#3a3a3e" />Ferramenta</div>
          {[0.9, 0.62, 0.78].map((w, i) => <div key={i} style={{height: 12, borderRadius: 6, background: '#d6d6da', width: `${w * 100}%`, marginTop: i ? 10 : 14}} />)}
        </div>
        <div style={{position: 'absolute', left: 30, right: 30, top: 244, bottom: 28, borderRadius: 24, ...(mine ? {background: `linear-gradient(160deg, ${rgba(ACC, 0.1)}, ${rgba(ACC, 0.04)})`, boxShadow: `inset 0 0 0 2px ${rgba(ACC, 0.0 + 0.5 * met)}`} : {boxShadow: 'inset 0 0 0 2px rgba(0,0,0,.12)', backgroundImage: 'repeating-linear-gradient(135deg, rgba(0,0,0,.035) 0 10px, transparent 10px 20px)'}), overflow: 'hidden'}}>
          {mine ? (met > 0 && <div style={{padding: '22px 24px', opacity: clamp(met * 1.6), transform: `translateY(${(1 - met) * 30}px)`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONTS.display, fontWeight: 700, fontSize: 30, color: ACC, letterSpacing: '-0.02em'}}><Icon k="flow" s={32} c={ACC} />Seu método</div>
            {['Seu critério', 'Seu fluxo', 'Sua regra'].map((l, i) => { const u = P(t, aJeito + 0.2 + i * 0.28, 0.45, E.out); return <div key={l} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, opacity: clamp(u * 2)}}><Check u={u} size={34} ring="rgba(61,90,254,.35)" fill={ACC} /><span style={{fontFamily: FONTS.body, fontWeight: 600, fontSize: 28, color: '#26262a'}}>{l}</span></div>; })}
          </div>) : (<div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, fontFamily: FONTS.body, fontWeight: 600, fontSize: 28, color: '#8a8a8e', opacity: np, lineHeight: 1.25}}>seu jeito de operar<br />não vem pronto</div>)}
        </div>
      </Glass>
    );
  };
  return (
    <>
      <Dots t={t} idx={3} a={n} out={o} />
      <GhostNum t={t} n="4" a={n} out={o} rgb="255,255,255" alpha={0.1} />
      <Say t={t} from={T('Transformar') - 0.05} out={o} y={TITLE_Y} size={TITLE_SIZE} color={WHITE} boxFg={ACC} lines={[[{t: 'Transformar seu'}, {t: 'método'}], [{t: 'em'}, {t: 'vantagem.', em: 'serif'}]]} />
      <div style={{position: 'absolute', inset: 0, ...fo}}>
        <Tool who="you" /><Tool who="them" />
        {eq > 0 && <div style={{position: 'absolute', left: 540 - 44, top: 855 - 44, width: 88, height: 88, borderRadius: 44, background: '#fff', boxShadow: `0 20px 50px rgba(0,0,0,.35), 0 0 0 6px ${rgba(ACC, 0.9)}`, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${lerp(0.4, 1, eq)})`, opacity: clamp(eq * 2) * (1 - P(t, aJeito + 0.6, 0.4, E.in))}}><div style={{width: 34, height: 6, borderRadius: 3, background: INK, boxShadow: `0 16px 0 ${INK}`, marginTop: -16}} /></div>}
      </div>
      <Fluffy pose={pose} x={fx} y={1440} s={0.34} id="f-m4" dark flip o={(1 - P(t, o + 0.05, 0.35, E.in)) * clamp((t - (aConc - 0.2)) / 0.2)} z={45} />
      <Say t={t} from={aConc - 0.22} out={aJeito - 0.2} y={CAP_Y} size={54} weight={cap.weight} lh={cap.lh} color={cap.color} lines={[[{t: 'O concorrente pode contratar'}], [{t: 'a mesma'}, {t: 'ferramenta.', em: 'serif'}]]} />
      <Say t={t} from={aJeito - 0.2} out={o} y={CAP_Y} size={54} weight={cap.weight} lh={cap.lh} color={cap.color} lines={[[{t: 'Seu jeito de operar não vem'}], [{t: 'pronto na'}, {t: 'assinatura.', em: 'serif'}]]} />
    </>
  );
};

// ============ MOTIVO 5 · inteligência trabalhando (escuro) ============
export const M5: React.FC<{t: number}> = ({t}) => {
  const n = N.m5, o = LAST.m5 + 0.3, fo = outBlur(t, o + 0.05, 0.35);
  const aConect = T('conectados'), aDados = T('dados'), aExec = T('executando'), aProc = T('processos'), aAut = T('autorizados'), aSem = T('sem'), aEmp = T('empurrar');
  const CORE: [number, number] = [540, 880];
  const PILLS: [string, string, number, number, number][] = [['Dados', 'chart', 190, 700, aDados - 0.35], ['Processos', 'flow', 880, 700, aDados - 0.1], ['Regras', 'check', 540, 1150, aDados + 0.15]];
  const op = P(t, aConect - 1.4, 0.9, E.settle), cap = capStyle(true);
  const STEPS = ['Etapa 1', 'Etapa 2', 'Etapa 3'];
  const sem = P(t, aSem - 0.1, 0.6, E.out), emp = P(t, aEmp, 0.6, E.in);
  return (
    <>
      <Dots t={t} idx={4} a={n} out={o} />
      <GhostNum t={t} n="5" a={n} out={o} />
      <Say t={t} from={T('Colocar') - 0.05} out={o} y={TITLE_Y} size={TITLE_SIZE} color={WHITE} lines={[[{t: 'Colocar inteligência'}], [{t: 'para'}, {t: 'trabalhar,', em: 'serif'}]]} />
      <div style={{position: 'absolute', inset: 0, ...fo}}>
        <SVG z={18}>
          {PILLS.map(([, , x, y, a]) => <Wire key={a} t={t} a={aConect - 0.1 + (a - PILLS[0][4]) * 0.3} from={CORE} to={[x, y + (y > CORE[1] ? -52 : 50)]} color="rgba(143,162,255,.75)" d={0.8} bend={0.12} />)}
        </SVG>
        {/* agente */}
        <div style={{position: 'absolute', left: CORE[0] - 130, top: CORE[1] - 130, width: 260, height: 260, borderRadius: 130, zIndex: 30, background: `radial-gradient(circle at 35% 28%, #7f94ff, ${ACC} 55%, #2a3fd6)`, boxShadow: `0 0 ${80 + 40 * Math.sin(t * 2)}px ${rgba(ACC, 0.55)}, inset 0 2px 0 rgba(255,255,255,.35), inset 0 -20px 40px rgba(0,0,40,.35)`, transform: `scale(${lerp(0.6, 1, op)})`, opacity: clamp(op * 1.8), display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k="bolt" s={110} c="#fff" sw={1.5} /></div>
        <SVG z={32}>{op > 0.05 && Array.from({length: 70}, (_, k) => { const ang = (k / 70) * Math.PI * 2 + t * 0.9, tail = clamp(-Math.cos(ang) * 1.2), j = (((k * 37) % 17) / 17 - 0.5) * 2; return <circle key={k} cx={CORE[0] + Math.cos(ang) * (190 + j * 30 * tail)} cy={CORE[1] + Math.sin(ang) * 58} r={2.2 + 5 * (1 - tail)} fill={k % 4 ? '#e8fbff' : CYAN} opacity={(0.4 + 0.6 * (1 - tail)) * op} />; })}</SVG>
        {PILLS.map(([label, ic, x, y, a]) => { const p = P(t, a, 0.6, E.out); return p > 0 && (
          <Glass key={label} style={{left: x - 150, top: y - 52, width: 300, height: 104, borderRadius: 30, opacity: clamp(p * 1.8), transform: `translateY(${(1 - p) * 36}px) scale(${lerp(0.85, 1, E.settle(p))})`, zIndex: 30}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, height: '100%', padding: '0 24px'}}><span style={{display: 'flex', width: 58, height: 58, borderRadius: 18, background: 'rgba(143,162,255,.16)', alignItems: 'center', justifyContent: 'center', color: ACC2}}><Icon k={ic} s={32} /></span><span style={{fontFamily: FONTS.display, fontWeight: 650, fontSize: 31, letterSpacing: '-0.03em'}}>{label}</span></div>
          </Glass>); })}
        {/* etapas autorizadas */}
        <Glass style={{left: 70, top: 1230, width: 940, height: 170, borderRadius: 36, zIndex: 30, ...blurIn(t, aExec - 0.3, 0.7)}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 36px'}}>
            {STEPS.map((s, i) => { const u = P(t, lerp(aExec + 0.15, aAut + 0.1, i / 2), 0.5, E.out); return (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 14}}><Check u={u} size={46} fill={ACC} /><div style={{lineHeight: 1.15}}><div style={{fontFamily: FONTS.display, fontWeight: 700, fontSize: 31, letterSpacing: '-0.03em'}}>{s}</div><div style={{fontFamily: FONTS.body, fontSize: 24, color: u > 0.3 ? ACC2 : 'rgba(255,255,255,.45)'}}>{u > 0.3 ? 'autorizada' : 'em andamento'}</div></div></div>); })}
          </div>
        </Glass>
        {sem > 0 && <div style={{position: 'absolute', left: 70, top: 1152, zIndex: 40, opacity: clamp(sem * 2) * (1 - emp * 0.0), transform: `translateY(${(1 - sem) * 24}px)`}}><div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 26px 12px 18px', borderRadius: 999, background: 'rgba(12,12,14,.82)', boxShadow: `inset 0 0 0 1px rgba(255,255,255,.18)`, fontFamily: FONTS.display, fontWeight: 650, fontSize: 30, color: 'rgba(255,255,255,.9)', position: 'relative'}}><Icon k="hand" s={34} c="#fff" /><span style={{position: 'relative', opacity: lerp(1, 0.5, emp)}}>você empurrando{emp > 0 && <span style={{position: 'absolute', left: -6, top: '52%', height: 4, width: `${(emp * 100) + 8}%`, background: AMBER, borderRadius: 3, boxShadow: `0 0 14px ${AMBER}`}} />}</span></div></div>}
      </div>
      <Say t={t} from={T('Agentes') - 0.05} out={aExec - 0.25} y={CAP_Y} size={54} weight={cap.weight} lh={cap.lh} color={cap.color} lines={[[{t: 'agentes conectados'}], [{t: 'aos seus'}, {t: 'dados,', em: 'serif'}]]} />
      <Say t={t} from={aExec - 0.05} out={aSem - 0.25} y={CAP_Y} size={54} weight={cap.weight} lh={cap.lh} color={cap.color} lines={[[{t: 'executando processos'}], [{t: 'autorizados,', em: 'serif'}]]} />
      <Say t={t} from={aSem - 0.05} out={o} y={CAP_Y} size={54} weight={cap.weight} lh={cap.lh} color={cap.color} lines={[[{t: 'sem você empurrar'}], [{t: 'cada'}, {t: 'etapa.', em: 'serif'}]]} />
    </>
  );
};

// ============ FECHAMENTO · de software com marca a estrutura que cresce (claro) ============
export const Fecha: React.FC<{t: number}> = ({t}) => {
  const n = N.fecha, o = LAST.fecha + 0.35;
  const aTransf = T('transformar', 1), aSabe = T('sabe'), aEstr = T('estrutura', 1), aCresc = T('crescer');
  const tile = P(t, n + 0.1, 0.8, E.out), tOut = P(t, aTransf - 0.05, 0.7, E.io);
  const chips: [string, string, number, number, number][] = [['Processos', 'flow', 220, 960, aTransf + 0.55], ['Regras', 'check', 860, 1010, aTransf + 0.85], ['Experiência', 'users', 540, 1230, aTransf + 1.15]];
  const build = P(t, aEstr - 0.1, 1.4, E.io), grow = P(t, aCresc - 0.2, 1.3, E.out), fade = P(t, o, 0.4, E.in);
  const cx = 540, base = 1480;
  const cols = [[0, 3], [1, 4], [2, 6]];
  return (
    <>
      <Say t={t} from={N.fecha - 0.05} out={aTransf - 0.6} y={TITLE_Y} size={74} color={INK} boxFg={PAPER} lines={[[{t: 'Não é só ter um software'}], [{t: 'com a sua'}, {t: 'marca,', em: 'serif'}]]} />
      <Say t={t} from={aTransf - 0.2} out={o} y={TITLE_Y} size={74} color={INK} lines={[[{t: 'é transformar o que'}], [{t: 'a sua empresa sabe fazer'}], [{t: 'numa'}, {t: 'estrutura', em: 'serif'}, {t: 'capaz'}], [{t: 'de crescer com ela.'}]]} />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - fade}}>
        {/* software com a sua marca */}
        {tile > 0 && tOut < 1 && <div style={{position: 'absolute', left: cx - 220, top: 880, width: 440, zIndex: 25, textAlign: 'center', opacity: clamp(tile * 1.8) * (1 - tOut), transform: `translateY(${(1 - tile) * 50 - tOut * 30}px) scale(${lerp(0.9, 1, tile) * lerp(1, 0.85, tOut)})`, filter: tOut > 0.01 ? `blur(${tOut * 12}px)` : undefined}}>
          <div style={{width: 340, height: 340, margin: '0 auto', borderRadius: 84, background: 'linear-gradient(160deg, #ffffff, #e9e9ee)', boxShadow: '0 40px 80px rgba(0,0,0,.14), 0 0 0 1px rgba(0,0,0,.06), inset 0 2px 0 rgba(255,255,255,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k="grid" s={160} c="#6a6a6e" sw={1.4} /></div>
          <div style={{marginTop: 34, display: 'inline-flex', alignItems: 'center', gap: 12, padding: '14px 28px', borderRadius: 999, background: '#fff', boxShadow: '0 10px 26px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.06)', fontFamily: FONTS.display, fontWeight: 650, fontSize: 36, color: '#4a4a4e'}}><Icon k="tag" s={34} c="#4a4a4e" />sua marca</div>
        </div>}
        {/* o que a empresa sabe fazer */}
        {chips.map(([l, ic, x, y, a]) => { const p = P(t, a, 0.6, E.out), c = P(t, aEstr - 0.1, 0.8, E.io); return p > 0 && c < 1 && (
          <div key={l} style={{position: 'absolute', left: lerp(x, cx, c) - 210, top: lerp(y, 1250, c) - 40, width: 420, zIndex: 26, display: 'flex', justifyContent: 'center', opacity: clamp(p * 2) * (1 - c * 0.9), transform: `scale(${lerp(0.85, 1, E.settle(p)) * lerp(1, 0.6, c)})`, filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined}}>
            <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, padding: '20px 34px', borderRadius: 999, background: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,.12), 0 0 0 1px rgba(0,0,0,.06)', fontFamily: FONTS.display, fontWeight: 650, fontSize: 40, color: INK}}><Icon k={ic} s={42} c={ACC} />{l}</div>
          </div>); })}
        {/* estrutura que cresce */}
        {build > 0 && <SVG z={24}>
          {cols.map(([ci, h], i) => Array.from({length: h}, (_, r) => { const a = lerp(0, 1, clamp((build - (i * 0.18 + r * 0.1)) * 2.4)), up = E.settle(a), hh = 78, y = base - (r + 1) * (hh + 12) * (1 + grow * 0.0) - grow * (r * 8), x = cx - 300 + ci * 215; const last = r === h - 1; return a > 0 && <rect key={`${i}-${r}`} x={x} y={y + (1 - up) * -160} width={190} height={hh} rx={24} fill={last ? (grow > 0.15 ? ACC : INK) : r < 2 ? INK : '#cfd4ff'} opacity={clamp(a * 2)} />; }))}
          {grow > 0 && <g opacity={grow}><path d={`M${cx - 300} ${base - 40 - grow * 40} L${cx + 300} ${base - 440 - grow * 120}`} stroke={ACC} strokeWidth={0} /></g>}
        </SVG>}
      </div>
    </>
  );
};

// ============ ASSINATURA · o anel do Fluffy vira o logo oficial (escuro) ============
export const Assina: React.FC<{t: number}> = ({t}) => {
  const a = N.assina + 0.1, lift = P(t, a - 0.1, 1.1, E.io), logo = P(t, a + 1.25, 0.8, E.out), sweep = P(t, a + 2.2, 1.3, E.io);
  const fo = 1 - P(t, a + 0.5, 0.7, E.in);
  const pose: MascotPose = {...OM.mix(OM.anim.idle(t), {...OM.anim.wave(t), look: [0, -1]}, P(t, a - 0.5, 0.4)), halo: 1 - P(t, a - 0.15, 0.12)};
  const rx = 540, ry = lerp(1700 - 992 * 0.42, 780, lift), rs = lerp(0.42, 1.55, lift);
  const LOGO = 'assets/brand/operon-logo-alpha.png';
  return (
    <>
      <div style={{position: 'absolute', left: 540 - 700, top: -80, width: 1400, height: 1500, background: 'linear-gradient(to bottom, rgba(147,165,255,0.24), rgba(95,224,234,0.05) 55%, rgba(0,0,0,0) 80%)', clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)', filter: 'blur(40px)', opacity: P(t, a, 1.5)}} />
      <Fluffy pose={pose} x={540} y={1700} s={0.42} id="f-fim" dark o={fo * P(t, a - 0.7, 0.4)} z={30} />
      {t > a - 0.15 && <svg width={W} height={H} style={{position: 'absolute', inset: 0, zIndex: 35}}>
        {Array.from({length: 80}, (_, k) => { const ang = (k / 80) * Math.PI * 2 + t * 0.9, tail = clamp(-Math.cos(ang) * 1.2), j = (((k * 37) % 17) / 17 - 0.5) * 2; return <circle key={k} cx={rx + Math.cos(ang) * (186 + j * 38 * tail) * rs} cy={ry + Math.sin(ang) * lerp(42, 186, lift) * rs} r={(2.4 + 5.6 * (1 - tail)) * rs * 0.7} fill={k % 4 ? '#e8fbff' : CYAN} opacity={(1 - logo) * (0.6 + 0.4 * (1 - tail))} />; })}
      </svg>}
      <div style={{position: 'absolute', left: 540 - 330, top: 780 - 330, width: 660, height: 660, opacity: logo, filter: 'drop-shadow(0 0 16px rgba(95,224,234,.45)) drop-shadow(0 0 70px rgba(61,90,254,.55))', zIndex: 40}}><Img src={staticFile(LOGO)} style={{width: '100%', height: '100%'}} /></div>
      <div style={{position: 'absolute', left: 540 - 330, top: 780 - 330, width: 660, height: 660, zIndex: 41, opacity: logo * (sweep > 0 && sweep < 1 ? 1 : 0), background: 'linear-gradient(100deg, rgba(255,255,255,0) 40%, rgba(255,255,255,.95) 50%, rgba(255,255,255,0) 60%)', backgroundSize: '300% 100%', backgroundPosition: `${lerp(100, 0, sweep)}% 0`, WebkitMaskImage: `url(${staticFile(LOGO)})`, WebkitMaskSize: '100% 100%', maskImage: `url(${staticFile(LOGO)})`, maskSize: '100% 100%'}} />
      {(() => { const f = P(t, a + 1.25, 0.5, E.out); return f > 0 && <div style={{position: 'absolute', left: 540 - 900, top: 780 - 72, width: 1800, height: 4, zIndex: 42, background: 'linear-gradient(90deg, rgba(95,224,234,0), rgba(147,165,255,.85) 40%, #fff 50%, rgba(147,165,255,.85) 60%, rgba(95,224,234,0))', transform: `scaleX(${E.out(f)})`, opacity: 1 - P(t, a + 1.8, 1.6), boxShadow: '0 0 24px 6px rgba(95,224,234,.35)'}} />; })()}
      <Say t={t} from={N.assina - 0.05} out={LAST.assina + 1.9} y={1075} size={68} color="#fff" z={50} lines={[[{t: 'Operon,'}], [{t: 'tecnologia própria,'}], [{t: 'inteligência conectada,'}], [{t: 'você no'}, {t: 'comando.', em: 'serif'}]]} />
      {Array.from({length: 50}, (_, k) => { const z = rnd(k, 41), size = lerp(3, 22, z * z), x = (rnd(k, 42) * 1300 + t * lerp(4, 18, z) * (k % 2 ? 1 : -1)) % 1300 - 110, y0 = (rnd(k, 43) * 2100 - t * lerp(3, 12, z)) % 2100; return <div key={k} style={{position: 'absolute', left: x, top: y0 < 0 ? y0 + 2100 : y0, width: size, height: size, borderRadius: '50%', background: k % 4 ? 'rgba(220,230,255,.9)' : 'rgba(95,224,234,.9)', filter: `blur(${lerp(0, 8, Math.abs(z - 0.35) * 1.5)}px)`, opacity: lerp(0.22, 0.07, z) * P(t, a, 1.2), zIndex: 20}} />; })}
    </>
  );
};
export {H as _H};
