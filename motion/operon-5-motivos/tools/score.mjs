// OPERON · 5 motivos — trilha por seção (tensão no hook → um motivo por harmonia → resolução no logo).
// Pad discreto sob a voz; sons curtos e afinados só nos eventos visuais; impacto só nas viradas. Tempos vêm do story.ts.
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {CHORDS as CH, beatsIn, createEngine} from './audio-engine.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const {END, HOOK_OUT, BEHIND, N, LAST, LEAD_IN, T, at} = await import(join(root, 'src/films/cinco/story.ts'));
const X = createEngine(END);
const pad = (a, b, c, amp = 0.026, cut = 1600) => CH[c].pad.forEach((m, i) => X.padNote(a, b, m, amp, () => cut, (i - 1.5) * 0.3));
const arp = (a, b, c, step = 0.25, amp = 0.022, oct = 12) => beatsIn(a, b, step).forEach((t, k) => X.pluck(t, CH[c].pad[k % 4] + oct, amp * (k % 4 === 0 ? 1.2 : 0.85), (k % 2 ? 0.35 : -0.35), 3400));
const pulse = (a, b, amp = 0.18) => { beatsIn(a, b, 0.5).forEach((t) => X.kick(t, amp)); beatsIn(a, b, 0.25, 0.125).forEach((t, k) => X.hat(t, 0.025 * (k % 2 ? 0.6 : 1))); };
const bass = (a, b, c, amp = 0.045) => beatsIn(a, b, 1).forEach((t) => X.bassNote(t, 0.9, CH[c].root, amp));
const wipe = (t, amp = 0.11) => { X.whoosh(t - 0.18, 0.55, amp, true, -0.5, 0.5); X.sub(t + 0.05, 31, 0.1, 0.6); };
const seg = {m2: N.m2 - LEAD_IN, m3: N.m3 - LEAD_IN, m4: N.m4 - LEAD_IN, m5: N.m5 - LEAD_IN, fecha: N.fecha - LEAD_IN, assina: N.assina - 0.95};
const ticks = (a, n, gap, amp = 0.07) => { for (let i = 0; i < n; i++) { X.tick(a + i * gap, amp, 3200, (i - 1) * 0.3); X.pop(a + i * gap + 0.04, [76, 79, 84, 88][i % 4], 0.05, (i - 1) * 0.3); } };

// ---- música (um acorde por motivo: tensão → resolução) ----
pad(0, HOOK_OUT, 'Am', 0.02, 1100); beatsIn(0.9, HOOK_OUT, 0.5).forEach((t) => X.tick(t, 0.025, 1800, 0));
pad(HOOK_OUT, seg.m2, 'F', 0.026); arp(N.m1, seg.m2, 'F', 0.5, 0.016, 12);
pad(seg.m2, seg.m3, 'C', 0.026, 2000); arp(N.m2 + 1, seg.m3, 'C', 0.5, 0.016, 12);
pad(seg.m3, seg.m4, 'Am', 0.026, 1300); arp(N.m3 + 0.6, seg.m4, 'Am', 0.25, 0.018, 12); bass(N.m3 + 1, seg.m4, 'Am', 0.038); pulse(T('integrações') + 0.4, seg.m4 - 0.2, 0.12);
pad(seg.m4, seg.m5, 'C', 0.028, 2200); pulse(N.m4 + 0.5, seg.m5 - 0.2, 0.14); bass(N.m4 + 0.5, seg.m5 - 0.2, 'C', 0.035);
pad(seg.m5, seg.fecha, 'F', 0.028, 2000); arp(N.m5 + 0.4, seg.fecha, 'F', 0.25, 0.018, 24); pulse(T('executando') - 0.3, seg.fecha - 0.2, 0.14); bass(T('executando') - 0.3, seg.fecha - 0.2, 'F', 0.04);
pad(seg.fecha, T('estrutura', 1) - 0.1, 'Dm', 0.024, 900); pad(T('estrutura', 1) - 0.1, seg.assina, 'C', 0.03, 2200); arp(T('estrutura', 1), seg.assina, 'C', 0.25, 0.02, 12);
pad(seg.assina, END + 0.3, 'C', 0.03, 1800);

// ---- hook ----
BEHIND.forEach((b, i) => { X.stamp(b.at, 0.16 + i * 0.04); X.sub(b.at, [33, 31, 28][i], 0.14 + i * 0.05, 0.55); X.whoosh(b.at - 0.05, 0.35, 0.045, true, i % 2 ? 0.6 : -0.6, 0); });
X.pop(T('sistema') + 0.05, 76, 0.05, -0.5); X.pop(T('inteligente') + 0.05, 79, 0.05, 0.5);
X.whoosh(HOOK_OUT - 0.1, 0.9, 0.13, true, 0.4, -0.4); X.sub(HOOK_OUT + 0.7, 29, 0.16, 0.9); X.shimmer(HOOK_OUT + 0.6, 1.6, 0.03, 24); X.swell(HOOK_OUT + 0.7, 0.8, 0.08);
// número de cada motivo: a poeira voa (whoosh), o numeral assenta (carimbo + brilho)
const num = (a, d = 0) => { X.whoosh(a - 0.75, 0.8, 0.06, true, -0.4, 0.4); X.stamp(a + 0.08, 0.1); X.pop(a + 0.1, 72 + d, 0.06, 0); X.shimmer(a + 0.05, 0.9, 0.028, 22); };
// abertura com soco: o hook entra com zoom e foco
X.sub(0.02, 30, 0.16, 0.8); X.whoosh(0.0, 0.35, 0.05, true, 0.3, -0.3);

// ---- motivo 1 ----
num(N.m1); X.bell(T('ativo') + 0.05, 79, 0.05, 0, 1.6); X.shimmer(T('ativo'), 1.0, 0.025, 18); X.pop(T('acesso'), 74, 0.06, -0.4); X.pop(T('alugar') + 0.04, 72, 0.05, -0.5);
X.pop(T('ter'), 84, 0.06, 0.4); X.tick(T('ter') + 0.05, 0.07, 3200, 0.3); X.shimmer(T('tecnologia'), 0.9, 0.03, 20); X.pop(T('tecnologia') + 0.1, 88, 0.05, 0.3);
// ---- motivo 2 ----
wipe(seg.m2, 0.12); num(N.m2, 2); for (let i = 0; i < 5; i++) X.pop(T('empresa') + 0.15 * i + 0.05, [72, 76, 79, 76, 72][i], 0.04, (i - 2) * 0.3);
X.whoosh(T('caber') - 0.1, 0.8, 0.07, false, 0, 0); X.crunch(T('caber') + 0.45, 0.08); X.tick(T('ferramenta') + 0.3, 0.06, 1800, 0);
X.swell(at('Seu', T('ferramenta') + 0.05) - 0.1, 0.9, 0.09); X.bell(at('sistema', at('Seu', T('ferramenta') + 0.05)) + 0.05, 84, 0.05, 0, 1.6); X.shimmer(at('Seu', T('ferramenta') + 0.05) + 0.2, 1.2, 0.03, 20);
// ---- motivo 3 ----
wipe(seg.m3, 0.13); num(N.m3, 4); [T('produtos'), T('unidades'), T('integrações')].forEach((a, i) => { X.pop(a, [72, 76, 79][i], 0.065, (i - 1) * 0.5); X.tick(a + 0.3, 0.05, 2600, 0); });
X.shimmer(T('evoluir') - 0.1, 1.4, 0.03, 24); X.swell(T('evoluir') - 0.1, 0.8, 0.07); X.tick(T('limite') + 0.05, 0.08, 3200, 0.3); X.crunch(T('limite') + 0.6, 0.06);
// ---- motivo 4 ----
X.impact(seg.m4 + 0.1, 0.2); wipe(seg.m4, 0.13); X.shimmer(seg.m4 + 0.1, 1.2, 0.03, 20); num(N.m4, 5);
X.stamp(T('mesma') + 0.05, 0.14); X.pop(T('mesma') + 0.08, 79, 0.06, 0);
X.swell(T('jeito') - 0.15, 0.7, 0.08); ticks(T('jeito') + 0.25, 3, 0.28, 0.07); X.bell(T('jeito') + 1.2, 88, 0.05, 0, 1.8);
// ---- motivo 5 ----
wipe(seg.m5, 0.13); num(N.m5, 7); X.shimmer(T('conectados') - 0.3, 1.2, 0.03, 20); X.receive(T('conectados') + 0.3, 0.06);
[T('dados'), T('dados') + 0.3, T('dados') + 0.5].forEach((a, i) => X.pop(a, [72, 76, 79][i], 0.045, (i - 1) * 0.4));
ticks(T('executando') + 0.2, 3, 0.55, 0.07); X.send(T('sem') + 0.05, 0.06); X.whoosh(T('empurrar') - 0.1, 0.6, 0.05, true, 0, 0);
// ---- fechamento ----
wipe(seg.fecha, 0.12); X.pop(N.fecha + 0.4, 72, 0.05, 0); const TR = T('transformar', 1);
X.whoosh(TR - 0.2, 0.7, 0.07, false, 0, 0);
[0.55, 0.85, 1.15].forEach((d, i) => X.pop(TR + d, [72, 76, 79][i], 0.05, (i - 1) * 0.5));
X.whoosh(T('estrutura', 1) - 0.1, 0.7, 0.07, false, 0, 0); for (let i = 0; i < 6; i++) X.stamp(T('estrutura', 1) + 0.15 + i * 0.16, 0.08); X.shimmer(T('crescer'), 1.4, 0.03, 22); X.bell(T('crescer') + 0.5, 84, 0.05, 0, 1.8);
// ---- assinatura ----
const A = N.assina + 0.1;
X.riser(A - 0.6, A + 1.2, 0.1); X.whoosh(A + 0.1, 1.1, 0.08, true, -0.4, 0.4); X.impact(A + 1.3, 0.4); X.sub(A + 1.3, 26, 0.26, 2.4); X.shimmer(A + 1.3, 2.4, 0.04, 26);
X.bell(A + 1.4, 84, 0.05, -0.3, 3); X.bell(A + 1.5, 88, 0.045, 0.3, 3); X.bell(A + 1.6, 91, 0.04, 0, 3); X.whoosh(A + 2.2, 1.2, 0.05, true, -0.6, 0.6);

X.render(join(root, 'public/audio'), [{path: join(root, 'public/audio/voz.wav'), at: 0}], {duckDepth: 0.62});
console.log('score ok', END);
