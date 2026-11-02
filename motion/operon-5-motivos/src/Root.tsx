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
import {SemPensar} from './films/eco/Film5';
import {DURATION as SDUR} from './films/eco/time5';
import {LugarErrado} from './films/eco/Film6';
import {DURATION as LDUR} from './films/eco/time6';
import {AvatarDemo, AVATAR_DEMO_DUR} from './films/eco/AvatarDemo';
import {MelhorFuncionario} from './films/eco/Film7';
import {DURATION as MDUR7} from './films/eco/time7';
import {ConhecimentoAcabou} from './films/eco/Film8';
import {DURATION as CDUR8} from './films/eco/time8';
import {CinemaTeste, CINE_TESTE_DUR} from './films/cine/CinemaTeste';
import {CinemaTeste2, CINE_TESTE2_DUR} from './films/cine/CinemaTeste2';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Cinco-Motivos" component={CincoMotivos} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{audio: 'voice' as const}} />
    <Composition id="Mashup-Royalty" component={MashupRoyalty} durationInFrames={MDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'music' as const}} />
    <Composition id="Mashup-Royalty-v2" component={MashupRoyaltyV2} durationInFrames={MDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'music' as const}} />
    <Composition id="Mashup-Royalty-v3" component={MashupRoyaltyV3} durationInFrames={MDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'music' as const}} />
    <Composition id="Ecossistema" component={Ecossistema} durationInFrames={EDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'mix' as const}} />
    <Composition id="Turing" component={Turing} durationInFrames={TDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'mix' as const}} />
    <Composition id="Conhecimento-Acabou" component={ConhecimentoAcabou} durationInFrames={CDUR8} fps={60} width={1080} height={1920} defaultProps={{audio: 'mix' as const}} />
    <Composition id="Melhor-Funcionario" component={MelhorFuncionario} durationInFrames={MDUR7} fps={60} width={1080} height={1920} defaultProps={{audio: 'mix' as const}} />
    <Composition id="Avatar-Teste" component={AvatarDemo} durationInFrames={AVATAR_DEMO_DUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'mix' as const}} />
    <Composition id="Lugar-Errado" component={LugarErrado} durationInFrames={LDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'mix' as const}} />
    <Composition id="Sem-Pensar" component={SemPensar} durationInFrames={SDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'mix' as const}} />
    <Composition id="Centauros" component={Centauros} durationInFrames={CDUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'mix' as const}} />
    <Composition id="Cinema-Teste" component={CinemaTeste} durationInFrames={CINE_TESTE_DUR} fps={60} width={1920} height={1080} defaultProps={{audio: 'mix' as const}} />
    <Composition id="Cinema-Teste-V" component={CinemaTeste} durationInFrames={CINE_TESTE_DUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'mix' as const}} />
    <Composition id="Cinema-Teste2" component={CinemaTeste2} durationInFrames={CINE_TESTE2_DUR} fps={60} width={1920} height={1080} defaultProps={{audio: 'mix' as const}} />
    <Composition id="Cinema-Teste2-V" component={CinemaTeste2} durationInFrames={CINE_TESTE2_DUR} fps={60} width={1080} height={1920} defaultProps={{audio: 'mix' as const}} />
  </>
);
