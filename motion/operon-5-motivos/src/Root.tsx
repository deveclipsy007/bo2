import React from 'react';
import {Composition} from 'remotion';
import {CincoMotivos} from './films/cinco/Film';
import {DURATION, FPS, H, W} from './films/cinco/story';

export const RemotionRoot: React.FC = () => (
  <Composition id="Cinco-Motivos" component={CincoMotivos} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{audio: 'voice' as const}} />
);
