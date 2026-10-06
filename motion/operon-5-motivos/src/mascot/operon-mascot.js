/* OPERON · FLUFFY — personagem da Operon em SVG (rig 2D) — uma fonte só para o brand kit (navegador) e para os filmes (Remotion).
 * Uso: OperonMascot.render(pose, id) → string SVG (grupo), com o chão em y=0 e ~1000 unidades de altura.
 *      OperonMascot.anim.<nome>(t) → pose; OperonMascot.mix(a, b, u) → pose interpolada.
 * Traços próprios da Operon: corpo de seixo inclinado, olhos-cápsula pretos, mãos de 4 dedos, botas com sola clara
 * e o anel de partículas do logo orbitando acima da cabeça. Sem emblema no corpo.
 */
(function (root) {
  const COL = {
    hi: '#7ce9ff', light: '#3fc6ff', mid: '#2f8bff', base: '#3d6bff', shade: '#3346e0', deep: '#2632b0',
    line: '#0b0b0c', crease: '#2a3fd0', tongue: '#2a2f8a', sole: '#dfe9ff', halo: '#e8fbff', haloC: '#5fe0ea',
  };
  const R = Math.PI / 180, f = (n) => Math.round(n * 10) / 10, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, u) => a + (b - a) * u;

  const BASE = {
    facing: 0, lean: 0, squash: 0, bob: 0, lift: 0,
    look: [0, 0], blink: 0, eyes: 'open', eyeL: null, eyeR: null, brows: 0, browTilt: 0,
    mouth: 'smile', mouthOpen: 0.35, blush: 0.5,
    armL: {a1: 12, a2: 8, hand: 'rest', rot: 0, front: true}, armR: {a1: 12, a2: 8, hand: 'rest', rot: 0, front: true},
    legL: {a1: -3, a2: 0}, legR: {a1: 3, a2: 0}, toe: 0,
    halo: 1, haloT: 0, theme: 'light', prop: null, text: '', magic: 0, glow: 0, shadow: 0.18,
  };

  // ---------- geometria ----------
  const BODY = 'M10 -884 C176 -888 268 -786 272 -628 C276 -470 222 -336 8 -330 C-206 -326 -270 -452 -268 -612 C-266 -776 -170 -880 10 -884Z';
  const SHOULDER = (side) => [side * 222, -548];
  const HIP = (side) => [side * 92, -360];

  function limb(s, side, a1, a2, l1, l2) {
    const d1 = [side * Math.sin(a1 * R), Math.cos(a1 * R)], e = [s[0] + d1[0] * l1, s[1] + d1[1] * l1];
    const a = a1 + a2, d2 = [side * Math.sin(a * R), Math.cos(a * R)], w = [e[0] + d2[0] * l2, e[1] + d2[1] * l2];
    const c = [2 * e[0] - (s[0] + w[0]) / 2, 2 * e[1] - (s[1] + w[1]) / 2];
    return {e, w, c, theta: Math.atan2(d2[1], d2[0]) / R};
  }
  const tube = (s, l, w, id, extra = '') => `<path d="M${f(s[0])} ${f(s[1])} Q${f(l.c[0])} ${f(l.c[1])} ${f(l.w[0])} ${f(l.w[1])}" fill="none" stroke="url(#${id}-g)" stroke-width="${w}" stroke-linecap="round" ${extra}/>` +
    `<path d="M${f(s[0])} ${f(s[1])} Q${f(l.c[0])} ${f(l.c[1])} ${f(l.w[0])} ${f(l.w[1])}" fill="none" stroke="${COL.hi}" stroke-width="${w * 0.22}" stroke-linecap="round" opacity="0.28" transform="translate(${f(w * 0.16)} ${f(-w * 0.18)})"/>`;

  // mão: dedos para +x, polegar para -y, punho na origem
  const FINGERS = {
    rest: {f: [[-18, 40], [6, 44], [30, 40]], th: [-78, 34], palm: 40},
    open: {f: [[-54, 62], [-20, 70], [12, 66], [42, 56]], th: [-104, 52], palm: 42},
    wave: {f: [[-46, 60], [-14, 68], [16, 64], [44, 54]], th: [-100, 50], palm: 42},
    point: {f: [[-4, 92], [30, 24], [52, 22]], th: [-64, 32], palm: 40},
    thumb: {f: [[-6, 26], [18, 26], [40, 24]], th: [-92, 70], palm: 44},
    fist: {f: [[-10, 24], [14, 26], [38, 24]], th: [-70, 26], palm: 44},
    ok: {f: [[8, 64], [32, 62], [56, 52]], th: null, palm: 40},
    hold: {f: [[-30, 46], [-4, 50], [22, 46]], th: [-96, 40], palm: 42},
  };
  function hand(l, side, kind, rot, id) {
    const H = FINGERS[kind] || FINGERS.rest, px = 34, g = `url(#${id}-h)`;
    let s = `<g transform="translate(${f(l.w[0])} ${f(l.w[1])}) rotate(${f(l.theta + rot)}) scale(1.18 ${side * 1.18})">`;
    const fing = (a, len, w = 30) => { const bx = px + Math.cos(a * R) * 22, by = Math.sin(a * R) * 22, ex = px + Math.cos(a * R) * (22 + len), ey = Math.sin(a * R) * (22 + len); return `<path d="M${f(bx)} ${f(by)} L${f(ex)} ${f(ey)}" stroke="${g}" stroke-width="${w}" stroke-linecap="round"/>`; };
    H.f.forEach(([a, len]) => { s += fing(a, len); });
    if (H.th) s += fing(H.th[0], H.th[1], 32);
    if (kind === 'ok') s += `<circle cx="${px + 58}" cy="-40" r="24" fill="none" stroke="${g}" stroke-width="26"/>`;
    s += `<circle cx="${px}" cy="0" r="${H.palm}" fill="${g}"/>`;
    if (kind === 'open' || kind === 'wave' || kind === 'rest') s += `<path d="M${px - 8} -14 Q${px + 8} 0 ${px - 4} 18 M${px + 12} -18 Q${px + 26} -2 ${px + 16} 16" fill="none" stroke="${COL.crease}" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`;
    return s + '</g>';
  }
  function foot(l, toe, id) {
    const d = toe >= 0 ? 1 : -1, k = Math.abs(toe) * 26;
    return `<g transform="translate(${f(l.w[0] + d * k)} ${f(l.w[1] + 14)})"><path d="M-62 4 C-66 -40 -20 -50 10 -46 C56 -40 86 -18 84 6 C82 24 60 30 0 30 C-46 30 -60 22 -62 4Z" fill="url(#${id}-h)" transform="scale(${d} 1)"/><path d="M-60 18 C-40 30 50 32 82 14 L84 22 C70 34 -40 36 -58 26Z" fill="${COL.sole}" opacity="0.9" transform="scale(${d} 1)"/></g>`;
  }

  // ---------- rosto ----------
  function eye(kind, x, y, w, blink, look) {
    const lx = look[0] * 12, ly = look[1] * 9;
    if (kind === 'happy') return `<path d="M${f(x - 25 * w)} ${y + 8} Q${f(x)} ${y - 28} ${f(x + 25 * w)} ${y + 8}" fill="none" stroke="${COL.line}" stroke-width="14" stroke-linecap="round"/>`;
    if (kind === 'closed') return `<path d="M${f(x - 24 * w)} ${y - 2} Q${f(x)} ${y + 16} ${f(x + 24 * w)} ${y - 2}" fill="none" stroke="${COL.line}" stroke-width="13" stroke-linecap="round"/>`;
    if (kind === 'flat') return `<path d="M${f(x - 22 * w)} ${y} L${f(x + 22 * w)} ${y}" stroke="${COL.line}" stroke-width="13" stroke-linecap="round"/>`;
    const big = kind === 'wide' ? 1.25 : 1, ry = Math.max(3, 31 * big * (1 - blink)), rx = 18 * big * w;
    if (ry < 6) return eye('closed', x, y, w, 0, look);
    return `<ellipse cx="${f(x + lx)}" cy="${f(y + ly)}" rx="${f(rx)}" ry="${f(ry)}" fill="${COL.line}"/><circle cx="${f(x + lx - 6 * w)}" cy="${f(y + ly - ry * 0.42)}" r="${f(6.5 * big)}" fill="#fff" opacity="0.95"/>`;
  }
  function mouth(p, x, y, id) {
    const m = cl(p.mouthOpen), k = p.mouth;
    if (k === 'flat') return `<path d="M${x - 34} ${y + 6} L${x + 34} ${y + 6}" stroke="${COL.line}" stroke-width="12" stroke-linecap="round"/>`;
    if (k === 'worry') return `<path d="M${x - 40} ${y + 16} Q${x} ${y - 10} ${x + 40} ${y + 16}" fill="none" stroke="${COL.line}" stroke-width="12" stroke-linecap="round"/>`;
    if (k === 'smirk') return `<path d="M${x - 40} ${y + 4} Q${x + 6} ${y + 22} ${x + 46} ${y - 12}" fill="none" stroke="${COL.line}" stroke-width="12" stroke-linecap="round"/>`;
    if (k === 'o') return `<ellipse cx="${x}" cy="${y + 12}" rx="${f(16 + 10 * m)}" ry="${f(18 + 18 * m)}" fill="${COL.line}"/>`;
    if (m < 0.08) return `<path d="M${x - 46} ${y - 4} Q${x} ${y + 34} ${x + 46} ${y - 4}" fill="none" stroke="${COL.line}" stroke-width="12" stroke-linecap="round"/>`;
    const d = 18 + 56 * m, wdt = k === 'grin' ? 60 : 52;
    const path = `M${x - wdt} ${y - 4} Q${x} ${y + 6} ${x + wdt} ${y - 4} Q${x + wdt * 0.82} ${f(y + d)} ${x} ${f(y + d + 4)} Q${x - wdt * 0.82} ${f(y + d)} ${x - wdt} ${y - 4}Z`;
    return `<clipPath id="${id}-m"><path d="${path}"/></clipPath><path d="${path}" fill="${COL.line}"/><ellipse cx="${x + 4}" cy="${f(y + d + 2)}" rx="30" ry="${f(8 + 14 * m)}" fill="${COL.tongue}" clip-path="url(#${id}-m)"/>`;
  }

  // ---------- anel (assinatura) ----------
  function halo(p, front) {
    if (p.halo <= 0) return '';
    const dark = p.theme === 'dark', cA = dark ? COL.halo : COL.base, cB = dark ? COL.haloC : COL.light;
    let s = '';
    for (let k = 0; k < 72; k++) {
      const a = (k / 72) * Math.PI * 2 + p.haloT, z = Math.sin(a);
      if ((z >= 0) !== front) continue;
      const tail = cl(-Math.cos(a) * 1.2), j = (((k * 37) % 17) / 17 - 0.5) * 2;   // lado esquerdo vira poeira, como no logo
      const rr = 186 + j * 38 * tail, r = (2.4 + 5.6 * (1 - tail) + (k % 3) * 0.8) * (0.8 + 0.3 * z) * p.halo;
      s += `<circle cx="${f(Math.cos(a) * rr)}" cy="${f(-992 + z * 42 + j * 10 * tail)}" r="${f(r)}" fill="${k % 4 ? cA : cB}" opacity="${f(cl((0.45 + 0.55 * (z + 1) / 2) * (1 - tail * 0.45)) * p.halo * 100) / 100}"/>`;
    }
    return s;
  }
  function headphones(p) {
    const fx = p.facing * 30;
    return `<path d="M${-262 + fx} -640 C${-262 + fx} -930 ${270 + fx} -930 ${270 + fx} -640" fill="none" stroke="#eef3fb" stroke-width="30" stroke-linecap="round"/><path d="M${-246 + fx} -660 C${-240 + fx} -900 ${254 + fx} -900 ${254 + fx} -660" fill="none" stroke="#c9d6ee" stroke-width="6" opacity="0.8"/>` +
      [-1, 1].map((sd) => `<rect x="${f(sd * 268 + fx - 40)}" y="-712" width="80" height="140" rx="36" fill="#f6f9ff"/><rect x="${f(sd * 268 + fx - 40 + (sd < 0 ? 46 : 0))}" y="-700" width="34" height="116" rx="17" fill="${COL.light}" opacity="0.5"/>`).join('');
  }

  function laptop(p) {
    const x = p.facing * 40;
    return `<g transform="translate(${f(x)} 0)"><path d="M-170 -548 L170 -548 L182 -372 L-182 -372Z" fill="#e9eef6"/><path d="M-170 -548 L170 -548 L182 -372 L-182 -372Z" fill="none" stroke="#c9d3e4" stroke-width="6"/><rect x="-200" y="-374" width="400" height="22" rx="10" fill="#cfd8e8"/>` +
      `<circle cx="0" cy="-462" r="34" fill="none" stroke="${COL.base}" stroke-width="7" opacity="0.8"/><circle cx="0" cy="-462" r="50" fill="${COL.light}" opacity="0.12"/></g>`;
  }
  function sign(p, arms) {
    const t = String(p.text || ''), w = Math.max(260, t.length * 44 + 90);
    const poles = arms.map(({l}) => `<path d="M${f(l.w[0])} ${f(l.w[1] + 30)} L${f(l.w[0] * 0.9)} -960" stroke="#c9d3e4" stroke-width="16" stroke-linecap="round"/>`).join('');
    return poles + `<g transform="translate(0 -1030) rotate(${f(Math.sin(p.haloT * 2) * 2)})"><rect x="${-w / 2 + 10}" y="-74" width="${w}" height="150" rx="34" fill="${COL.line}" opacity="0.18"/><rect x="${-w / 2}" y="-84" width="${w}" height="150" rx="34" fill="#fff"/><text x="0" y="16" text-anchor="middle" font-family="Manrope, DM Sans, sans-serif" font-weight="800" font-size="72" letter-spacing="-2" fill="${COL.line}">${t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></g>`;
  }
  function zzz(p) {
    let s = '';
    for (let k = 0; k < 3; k++) { const u = ((p.haloT * 0.25 + k / 3) % 1); s += `<text x="${f(170 + u * 120)}" y="${f(-860 - u * 260)}" font-family="Manrope, sans-serif" font-weight="800" font-size="${f(46 + u * 40)}" fill="${COL.light}" opacity="${f((1 - u) * 90) / 100}">z</text>`; }
    return s;
  }
  function sparks(p, arms) {
    let s = '';
    arms.forEach(({l}, i) => { for (let k = 0; k < 14; k++) { const a = k * 2.4 + p.haloT * 3 + i, r = 40 + ((k * 53) % 70) + Math.sin(p.haloT * 4 + k) * 12; s += `<circle cx="${f(l.w[0] + Math.cos(a) * r)}" cy="${f(l.w[1] - 40 + Math.sin(a) * r * 0.7)}" r="${f(3 + (k % 3) * 2)}" fill="${k % 3 ? COL.halo : COL.haloC}" opacity="${f(p.magic * (0.4 + 0.6 * ((k % 5) / 5)) * 100) / 100}"/>`; } });
    return s;
  }
  function render(pose, id = 'om') {
    const p = Object.assign({}, BASE, pose || {});
    const L = Object.assign({}, BASE.armL, p.armL), Rr = Object.assign({}, BASE.armR, p.armR);
    const fx = p.facing * 62, sx = 1 + p.squash * 0.14, sy = 1 - p.squash * 0.14, up = -p.lift;
    const arms = [[-1, L], [1, Rr]].map(([side, a]) => ({side, a, l: limb(SHOULDER(side), side, a.a1, a.a2, 118, 108)}));
    const legs = [[-1, Object.assign({}, BASE.legL, p.legL)], [1, Object.assign({}, BASE.legR, p.legR)]].map(([side, a]) => ({side, l: limb(HIP(side), 1, a.a1, a.a2, 140, 138)}));
    const drawArm = ({side, a, l}) => tube(SHOULDER(side), l, 76, id) + hand(l, side, a.hand, a.rot, id);
    const ey = -664, wNear = 1 - Math.max(0, p.facing) * 0.28, wFar = 1 - Math.max(0, -p.facing) * 0.28;
    const eL = p.eyeL || p.eyes, eR = p.eyeR || p.eyes;
    const up2 = `translate(0 ${f(up + p.bob)})`, body = `translate(0 -340) rotate(${f(p.lean)}) scale(${f(sx * 1000) / 1000} ${f(sy * 1000) / 1000}) translate(0 340)`;
    let s = `<defs>
<linearGradient id="${id}-g" gradientUnits="userSpaceOnUse" x1="240" y1="-900" x2="-260" y2="-200"><stop offset="0" stop-color="${COL.light}"/><stop offset="0.45" stop-color="${COL.mid}"/><stop offset="1" stop-color="${COL.shade}"/></linearGradient>
<linearGradient id="${id}-h" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COL.light}"/><stop offset="1" stop-color="${COL.base}"/></linearGradient>
<radialGradient id="${id}-hl" cx="0.66" cy="0.2" r="0.55"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}-sh" cx="0.25" cy="0.92" r="0.75"><stop offset="0" stop-color="${COL.deep}" stop-opacity="0.75"/><stop offset="1" stop-color="${COL.deep}" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}-rim" x1="1" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="${COL.hi}" stop-opacity="0.95"/><stop offset="0.5" stop-color="${COL.hi}" stop-opacity="0"/></linearGradient>
<clipPath id="${id}-b"><path d="${BODY}"/></clipPath>
<filter id="${id}-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
<filter id="${id}-hglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;
    s += `<ellipse cx="0" cy="6" rx="${f(230 * (1 - cl(p.lift / 400) * 0.45))}" ry="26" fill="#000" opacity="${f(p.shadow * (1 - cl(p.lift / 400) * 0.5) * 100) / 100}"/>`;
    s += `<g transform="${up2}">`;
    if (p.glow > 0) s += `<ellipse cx="0" cy="-610" rx="330" ry="330" fill="#2f6bff" opacity="${f(p.glow * 0.55 * 100) / 100}" filter="url(#${id}-blur)"/>`;
    s += `<g transform="${body}"><g filter="url(#${id}-hglow)">${halo(p, false)}</g></g>`;
    legs.forEach(({side, l}) => { s += tube(HIP(side), l, 86, id) + foot(l, p.toe, id); });
    s += `<g transform="${body}">`;
    arms.filter((x) => !x.a.front).forEach((x) => { s += drawArm(x); });
    s += `<path d="${BODY}" fill="url(#${id}-g)"/><g clip-path="url(#${id}-b)"><rect x="-300" y="-900" width="600" height="600" fill="url(#${id}-sh)"/><ellipse cx="${f(70 + fx * 0.6)}" cy="-760" rx="190" ry="130" fill="url(#${id}-hl)"/><path d="${BODY}" fill="none" stroke="url(#${id}-rim)" stroke-width="16" transform="translate(-6 6)"/></g>`;
    s += `<path d="M${f(120 + fx * 0.5)} -834 Q${f(190 + fx * 0.5)} -812 ${f(222 + fx * 0.5)} -748" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity="0.55"/>`;
    if (p.blush > 0) s += [-1, 1].map((sd) => `<ellipse cx="${f(sd * 132 + fx)}" cy="-588" rx="34" ry="18" fill="${COL.hi}" opacity="${f(p.blush * 0.45 * 100) / 100}"/>`).join('');
    s += eye(eL, -86 + fx, ey, p.facing > 0 ? wFar : wNear, p.blink, p.look) + eye(eR, 86 + fx, ey, p.facing > 0 ? wNear : wFar, p.blink, p.look);
    s += [-1, 1].map((sd) => `<path d="M-26 4 Q0 -8 26 4" fill="none" stroke="${COL.line}" stroke-width="12" stroke-linecap="round" transform="translate(${f(sd * 88 + fx)} ${f(-738 - p.brows * 20)}) rotate(${f(-p.browTilt * sd * 14)})"/>`).join('');
    s += mouth(p, f(fx), -590, id);
    if (p.prop === 'headphones') s += headphones(p);
    if (p.prop === 'laptop') s += laptop(p);
    arms.filter((x) => x.a.front).forEach((x) => { s += drawArm(x); });
    if (p.prop === 'sign') s += sign(p, arms) + arms.map(({side, a, l}) => hand(l, side, a.hand, a.rot, id)).join('');
    if (p.prop === 'zzz') s += zzz(p);
    if (p.magic > 0) s += `<g filter="url(#${id}-hglow)">${sparks(p, arms)}</g>`;
    s += `<g filter="url(#${id}-hglow)">${halo(p, true)}</g>`;
    s += '</g></g>';
    return s;
  }

  // ---------- animação ----------
  const mixV = (a, b, u) => (typeof a === 'number' && typeof b === 'number' ? lerp(a, b, u) : u < 0.5 ? a : b);
  function mix(a, b, u) {
    const o = {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    keys.forEach((k) => {
      const x = a[k] ?? BASE[k], y = b[k] ?? BASE[k];
      if (Array.isArray(x)) o[k] = x.map((v, i) => lerp(v, y[i], u));
      else if (x && typeof x === 'object') o[k] = mix(Object.assign({}, BASE[k], x), Object.assign({}, BASE[k], y), u);
      else o[k] = mixV(x, y, u);
    });
    return o;
  }
  const blinkAt = (t, seed = 0) => { const c = (t + seed) % 3.7; return c < 0.14 ? Math.sin((c / 0.14) * Math.PI) : 0; };
  const talkAt = (t) => cl(0.25 + 0.45 * Math.abs(Math.sin(t * 13.1)) * (0.6 + 0.4 * Math.sin(t * 3.7)) + 0.15 * Math.sin(t * 29));
  const anim = {
    idle: (t) => ({bob: Math.sin(t * 2.2) * 6, squash: Math.sin(t * 2.2) * 0.02, blink: blinkAt(t), haloT: t * 0.7, armL: {a1: 12 + Math.sin(t * 2.2) * 3, a2: 8, hand: 'rest'}, armR: {a1: 12 + Math.sin(t * 2.2 + 1) * 3, a2: 8, hand: 'rest'}, look: [Math.sin(t * 0.7) * 0.3, 0]}),
    wave: (t) => ({bob: Math.sin(t * 2.2) * 6, lean: -3, blink: 0, eyes: 'happy', mouth: 'smile', mouthOpen: 0.55, haloT: t * 0.9, armR: {a1: 150 + Math.sin(t * 8) * 10, a2: 22 + Math.sin(t * 8 - 0.6) * 22, hand: 'wave'}, armL: {a1: 14, a2: 10, hand: 'rest'}}),
    talk: (t) => ({bob: Math.sin(t * 2.4) * 5, blink: blinkAt(t, 1.2), mouth: 'smile', mouthOpen: talkAt(t), brows: 0.3 * Math.sin(t * 1.9), haloT: t * 0.7, armL: {a1: 40 + Math.sin(t * 1.7) * 14, a2: 70 + Math.sin(t * 1.3) * 16, hand: 'open', rot: -20}, armR: {a1: 14, a2: 8, hand: 'rest'}, look: [0.2, 0]}),
    walk: (t, dir = 1) => {
      const ph = t * 7.2, s = Math.sin(ph);
      return {facing: 0.55 * dir, toe: dir, bob: -Math.abs(Math.cos(ph)) * 16 + 8, squash: Math.cos(ph * 2) * 0.025, lean: 4 * dir, blink: blinkAt(t), haloT: t * 1.2, mouth: 'smile', mouthOpen: 0.2,
        legL: {a1: s * 24 * dir, a2: Math.max(0, -Math.cos(ph)) * -30 * dir}, legR: {a1: -s * 24 * dir, a2: Math.max(0, Math.cos(ph)) * -30 * dir},
        armL: {a1: 16 - s * 18 * dir, a2: 18, hand: 'rest'}, armR: {a1: 16 + s * 18 * dir, a2: 18, hand: 'rest'}};
    },
    point: (t) => ({bob: Math.sin(t * 2.2) * 5, lean: 4, blink: blinkAt(t, 0.5), facing: 0.35, look: [1, -0.1], mouth: 'smile', mouthOpen: 0.4, haloT: t * 0.7, armR: {a1: 92 + Math.sin(t * 2) * 3, a2: -6, hand: 'point'}, armL: {a1: 14, a2: 10, hand: 'rest'}}),
    think: (t) => ({bob: Math.sin(t * 1.6) * 4, lean: -4, blink: blinkAt(t, 2), look: [-0.6, -0.8], brows: 0.6, browTilt: -0.3, eyeR: 'open', mouth: 'smirk', haloT: t * 0.5, armL: {a1: 28, a2: 196, hand: 'fist', rot: 20}, armR: {a1: 14, a2: 10, hand: 'rest'}}),
    listen: (t) => ({prop: 'headphones', bob: Math.sin(t * 4) * 6, lean: Math.sin(t * 4) * 2.5, eyes: 'closed', mouth: 'smile', mouthOpen: 0.3, haloT: t * 0.6, armL: {a1: 100, a2: 124, hand: 'hold', rot: 0}, armR: {a1: 100, a2: 124, hand: 'hold', rot: 0}}),
    ok: (t) => ({bob: Math.sin(t * 2.2) * 5, lean: -2, eyeL: 'happy', eyeR: 'open', mouth: 'grin', mouthOpen: 0.45, blink: 0, haloT: t * 0.8, armR: {a1: 118, a2: 62, hand: 'ok', rot: -10}, armL: {a1: 14, a2: 10, hand: 'rest'}}),
    surprise: (t) => ({bob: 0, squash: -0.06, eyes: 'wide', brows: 1, mouth: 'o', mouthOpen: 0.7, haloT: t * 1.5, armL: {a1: 62, a2: 40, hand: 'open'}, armR: {a1: 62, a2: 40, hand: 'open'}}),
    celebrate: (t) => {
      const c = (t % 1.1) / 1.1, air = Math.sin(cl(c / 0.62) * Math.PI), land = c > 0.62 ? Math.sin(((c - 0.62) / 0.38) * Math.PI) : 0, pre = c < 0.08 ? Math.sin((c / 0.08) * Math.PI) : 0;
      return {lift: air * 150, squash: land * 0.22 + pre * 0.12 - air * 0.08, eyes: 'happy', mouth: 'grin', mouthOpen: 0.85, haloT: t * 2, legL: {a1: -8 - air * 10, a2: air * 30}, legR: {a1: 8 + air * 10, a2: -air * 30},
        armL: {a1: 150 + air * 15, a2: 10, hand: 'open'}, armR: {a1: 150 + air * 15, a2: 10, hand: 'open'}};
    },
    present: (t) => ({bob: Math.sin(t * 2.2) * 5, eyes: 'happy', mouth: 'grin', mouthOpen: 0.5, haloT: t * 0.8, armL: {a1: 52 + Math.sin(t * 2) * 4, a2: 58, hand: 'open', rot: 10}, armR: {a1: 52 + Math.sin(t * 2 + 0.5) * 4, a2: 58, hand: 'open', rot: 10}}),
    thumbs: (t) => ({bob: Math.sin(t * 2.2) * 5, lean: -3, eyeL: 'happy', eyeR: 'happy', mouth: 'grin', mouthOpen: 0.4, haloT: t * 0.8, armR: {a1: 40, a2: 100, hand: 'thumb', rot: -55}, armL: {a1: 14, a2: 10, hand: 'rest'}}),
    shrug: (t) => { const u = 0.5 + 0.5 * Math.sin(t * 3); return {bob: -6 * u, squash: -0.03 * u, brows: 0.8, browTilt: -0.6, look: [0.3, -0.2], mouth: 'smirk', haloT: t * 0.6, armL: {a1: 48 + u * 8, a2: -64, hand: 'open', rot: 80}, armR: {a1: 48 + u * 8, a2: -64, hand: 'open', rot: 80}}; },
    nod: (t) => ({bob: Math.abs(Math.sin(t * 5)) * 8, lean: Math.sin(t * 5) * 2, look: [0, 0.2 + Math.sin(t * 5) * 0.5], eyes: 'happy', mouth: 'smile', mouthOpen: 0.2, haloT: t * 0.6}),
    shake: (t) => ({facing: Math.sin(t * 9) * 0.45, brows: 0.2, browTilt: 0.6, mouth: 'flat', blink: 0, haloT: t * 0.6, armL: {a1: 16, a2: 8, hand: 'rest'}, armR: {a1: 16, a2: 8, hand: 'rest'}}),
    peek: (t) => { const u = 0.5 + 0.5 * Math.sin(t * 1.4); return {lean: 14 + u * 6, facing: 0.6, look: [1, 0], eyes: u > 0.4 ? 'open' : 'wide', brows: 0.5, mouth: 'smile', mouthOpen: 0.15, haloT: t * 0.6, armR: {a1: 104, a2: -14, hand: 'hold', rot: -20}, armL: {a1: 14, a2: 10, hand: 'rest'}}; },
    sleep: (t) => ({prop: 'zzz', bob: Math.sin(t * 1.4) * 8, squash: Math.sin(t * 1.4) * 0.03, lean: -5, eyes: 'closed', mouth: 'o', mouthOpen: 0.1 + 0.1 * Math.sin(t * 1.4), halo: 0.45, haloT: t * 0.3, blush: 0.8, armL: {a1: 8, a2: 4, hand: 'rest'}, armR: {a1: 8, a2: 4, hand: 'rest'}}),
    type: (t) => ({prop: 'laptop', bob: Math.sin(t * 2.2) * 3, look: [0, 0.7], mouth: 'smile', mouthOpen: 0.15, blink: blinkAt(t, 0.8), haloT: t * 1.2, armL: {a1: 34, a2: -96 + Math.max(0, Math.sin(t * 16)) * 14, hand: 'fist', rot: 0}, armR: {a1: 34, a2: -96 + Math.max(0, Math.sin(t * 16 + 2)) * 14, hand: 'fist', rot: 0}}),
    run: (t, dir = 1) => {
      const ph = t * 11, s = Math.sin(ph);
      return {facing: 0.65 * dir, toe: dir, bob: -Math.abs(Math.cos(ph)) * 34 + 14, squash: Math.cos(ph * 2) * 0.05, lean: 11 * dir, eyes: 'open', look: [dir, 0], mouth: 'grin', mouthOpen: 0.4, haloT: t * 2,
        legL: {a1: s * 40 * dir, a2: Math.max(0, -Math.cos(ph)) * -60 * dir}, legR: {a1: -s * 40 * dir, a2: Math.max(0, Math.cos(ph)) * -60 * dir},
        armL: {a1: 30 - s * 40 * dir, a2: 60, hand: 'fist'}, armR: {a1: 30 + s * 40 * dir, a2: 60, hand: 'fist'}};
    },
    magic: (t) => ({magic: 1, bob: Math.sin(t * 2.4) * 8, lift: 20 + Math.sin(t * 2.4) * 12, eyes: 'happy', mouth: 'o', mouthOpen: 0.4, haloT: t * 2.4, glow: 0.3, armL: {a1: 112 + Math.sin(t * 3) * 6, a2: -20, hand: 'open', rot: 40}, armR: {a1: 112 + Math.sin(t * 3 + 1) * 6, a2: -20, hand: 'open', rot: 40}}),
    carry: (t, text = 'Olá!') => ({prop: 'sign', text, bob: Math.sin(t * 2.2) * 5, eyes: 'happy', mouth: 'grin', mouthOpen: 0.45, halo: 0, haloT: t, armL: {a1: 168, a2: 4, hand: 'hold', rot: 0}, armR: {a1: 168, a2: 4, hand: 'hold', rot: 0}}),
    dance: (t) => { const s = Math.sin(t * 6); return {lean: s * 8, bob: -Math.abs(Math.cos(t * 6)) * 18, squash: Math.cos(t * 12) * 0.04, eyes: 'happy', mouth: 'grin', mouthOpen: 0.6, haloT: t * 2, armL: {a1: 120 + s * 30, a2: 40, hand: 'open'}, armR: {a1: 120 - s * 30, a2: 40, hand: 'open'}, legL: {a1: -6 + s * 6, a2: 0}, legR: {a1: 6 + s * 6, a2: 0}}; },
    worry: (t) => ({bob: Math.sin(t * 3) * 3, eyes: 'open', brows: 0.4, browTilt: 1, look: [0, 0.4], mouth: 'worry', blush: 0, haloT: t * 0.3, halo: 0.6, armL: {a1: 30, a2: 110, hand: 'fist', rot: -40}, armR: {a1: 30, a2: 110, hand: 'fist', rot: -40}}),
  };
  /** Boca a partir do volume da locução (0–1, já normalizado). */
  const mouthFromLevel = (v) => cl(Math.pow(cl(v), 0.6) * 1.1);
  const api = {name: 'Fluffy', render, mix, anim, BASE, COL, blinkAt, talkAt, mouthFromLevel, VERSION: '1.1'};
  root.OperonMascot = api; root.Fluffy = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
