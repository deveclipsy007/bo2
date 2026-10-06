import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';

// Smoke test do toolchain — substituído pela composição real quando os áudios 1–3 chegarem.
const Smoke: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#000', color: '#F4F4EF', justifyContent: 'center', alignItems: 'center', fontFamily: 'Inter, sans-serif', fontSize: 96}}>
    Operon
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition id="Smoke" component={Smoke} durationInFrames={30} fps={30} width={1080} height={1920} />
);
