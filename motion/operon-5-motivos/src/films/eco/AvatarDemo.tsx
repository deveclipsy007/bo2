// Teste do avatar sobre um trecho real de "O lugar errado" (33,6–42,4 s): a boca segue a voz, gestos nas palavras-chave,
// e o texto da cena abre espaço à direita enquanto o avatar está na tela.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {useFonts} from '../../lib/fonts';
import {P} from '../../lib/core';
import {T} from './time6';
import {C, Dust, F, Grain, Label, Thin, Vignette} from './fx';
import {CO1, Company, Ink} from './Film6';
import {Avatar, POSE} from './Avatar';
import ENV from './env6.json';

const O = 33.6;
export const AVATAR_DEMO_DUR = Math.round(8.8 * 60);
const Q = [{at: T.cliente, q: 'cliente chegando', q2: 'e ninguém respondendo?', ali: T.gargalo2 - 0.1, i: 1}, {at: T.proposta, q: 'proposta que leva', q2: 'três dias pra sair?', ali: T.ali2, i: 2}, {at: T.cliente2, q: 'cliente que some', q2: 'depois da compra?', ali: T.ali3, i: 5}];

export const AvatarDemo: React.FC<{audio: 'none' | 'mix'}> = ({audio}) => {
  useFonts();
  const frame = useCurrentFrame(), t = frame / 60 + O;
  const cur = Q.reduce((k, c, i) => (t >= c.at - 0.3 ? i : k), 0);
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden', fontFamily: F.head}}>
      <Company t={t} sim={CO1} fg={C.bone} draw={P(t, O, 1.0)} focus={Q[cur].i} />
      <Label t={t} at={O + 0.1} out={42.3} text="FIG. V — ONDE AS COISAS PARAM" y={230} />
      {Q.map((k, i) => <Thin key={i} t={t} at={k.at - 0.25} out={(Q[i + 1]?.at ?? 42.6) - 0.35} text={k.q} size={60} y={1200} x={700} />)}
      {Q.map((k, i) => <Thin key={`b${i}`} t={t} at={k.at + 0.35} out={(Q[i + 1]?.at ?? 42.6) - 0.35} text={k.q2} size={60} y={1275} x={700} />)}
      {Q.map((k, i) => <Ink key={`a${i}`} t={t} at={k.ali - 0.05} out={(Q[i + 1]?.at ?? 42.6) - 0.35} text="ALI." size={170} y={1410} x={700} maxW={520} color={C.or} />)}
      <Avatar t={t} env={ENV.env} windows={[{a: O + 0.15, b: 42.6}]} gestures={[{at: T.gargalo2 - 0.15, d: 1.0, pose: POSE.aponta}, {at: T.ali2 - 0.1, d: 0.85, pose: POSE.maoAberta, flip: true}, {at: T.ali3 - 0.05, d: 1.3, pose: POSE.bracosCruzados, flip: true}]} />
      <Dust t={t} n={40} opacity={0.5} warm={0.08} />
      <Vignette strength={0.75} />
      <Grain frame={frame} amount={0.07} />
      {audio === 'mix' && <Audio src={staticFile('eco6/audio/mix.wav')} startFrom={Math.round(O * 60)} />}
    </AbsoluteFill>
  );
};
