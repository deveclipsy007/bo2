import React from 'react';
import {Composition} from 'remotion';
import {CincoMotivos} from './films/cinco/Film';
import {DURATION, FPS, H, W} from './films/cinco/story';
import {MashupRoyalty} from './films/mashup/Film';
import {DURATION as MDUR} from './films/mashup/story';
import {MashupRoyaltyV2} from './films/mashup2/Film';
import {MashupRoyaltyV3} from './films/mashup3/Film';
import {Ecossistema} from './films/eco/Film';
import {DURATION as EDUR} from './films/eco/time';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Cinco-Motivos" component={CincoMotivos} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{audio: 'voice' as const}} />
    <Composition id="Mashup-Royalty" component={MashupRoyalty} durationInFrames={MDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'music' as const}} />
    <Composition id="Mashup-Royalty-v2" component={MashupRoyaltyV2} durationInFrames={MDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'music' as const}} />
    <Composition id="Mashup-Royalty-v3" component={MashupRoyaltyV3} durationInFrames={MDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'music' as const}} />
    <Composition id="Ecossistema" component={Ecossistema} durationInFrames={EDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'mix' as const}} />
  </>
);
