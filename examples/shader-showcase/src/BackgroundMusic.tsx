import {Audio} from '@remotion/media';
import {interpolate,staticFile,useVideoConfig} from 'remotion';

/** A speech-aware music mix, with an instrumental-only export option. */
export const BackgroundMusic=({kind,narration=false}:{kind:'blackhole'|'lightning';narration?:boolean})=>{
 const {fps,durationInFrames}=useVideoConfig();
 if(narration)return <Audio name="曼波配音与背景音乐（连贯解说）" src={staticFile(kind==='blackhole'?'audio/blackhole-mambo-flow-v2.m4a':'audio/lightning-mambo-flow-v2.m4a')} premountFor={fps} volume={1}/>;
 return <Audio name="背景音乐" src={staticFile(kind==='blackhole'?'audio/blackhole-bgm.m4a':'audio/lightning-bgm.m4a')} trimBefore={kind==='blackhole'?8*fps:32*fps} premountFor={fps} volume={frame=>interpolate(frame,[0,2*fps,durationInFrames-4*fps,durationInFrames],[0,.22,.22,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}/>;
};
