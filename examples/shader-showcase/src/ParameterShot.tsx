import {useCurrentFrame,useVideoConfig} from 'remotion';
import {DemoShot} from './DemoShot';
export type ParameterProps={clip:string;chapter:string;accent:string;steps:string[];detail:string;secondsPerStep:number};
export const ParameterShot=({clip,chapter,accent,steps,detail,secondsPerStep}:ParameterProps)=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();
 const part=Math.min(steps.length-1,Math.floor(frame/(secondsPerStep*fps)));
 return <DemoShot clip={clip} chapter={chapter} accent={accent} text={steps[part]} detail={detail}/>;
};
