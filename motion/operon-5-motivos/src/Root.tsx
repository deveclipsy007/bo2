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
import {Centauros} from './films/eco/Film3';
import {DURATION as CDUR} from './films/eco/time3';
import {Turing} from './films/eco/Film4';
import {DURATION as TDUR} from './films/eco/time4';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Cinco-Motivos" component={CincoMotivos} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{audio: 'voice' as const}} />
    <Composition id="Mashup-Royalty" component={MashupRoyalty} durationInFrames={MDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'music' as const}} />
    <Composition id="Mashup-Royalty-v2" component={MashupRoyaltyV2} durationInFrames={MDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'music' as const}} />
    <Composition id="Mashup-Royalty-v3" component={MashupRoyaltyV3} durationInFrames={MDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'music' as const}} />
    <Composition id="Ecossistema" component={Ecossistema} durationInFrames={EDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'mix' as const}} />
    <Composition id="Turing" component={Turing} durationInFrames={TDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'mix' as const}} />
    <Composition id="Centauros" component={Centauros} durationInFrames={CDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'mix' as const}} />
  </>
);
