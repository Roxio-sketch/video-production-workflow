import React from 'react';
import {Video} from '@remotion/media';
import {AbsoluteFill,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {Caption,Fade,Header,Shade,font} from './visuals';
export type DemoProps={clip:string;chapter:string;text:string;detail?:string;accent:string;title?:string};
export const DemoShot:React.FC<DemoProps>=({clip,chapter,text,detail,accent,title})=>{
 const {fps}=useVideoConfig();
 const frame=useCurrentFrame();const titleOpacity=interpolate(frame,[2.5*fps,3.2*fps],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const ui=clip.includes('ui');const player=clip.startsWith('bh-player-');
 return <AbsoluteFill style={{background:'#080C16'}}><Video name="游戏录制" src={staticFile(`clips/${clip}.mp4`)} muted premountFor={fps} objectFit="cover" style={{width:'100%',height:'100%',}}/>{ui?<AbsoluteFill style={{width:1160,background:'linear-gradient(180deg,rgba(3,6,14,.7),transparent 22%,transparent 68%,rgba(3,6,14,.9))'}}/>:player?<AbsoluteFill style={{background:'linear-gradient(180deg,rgba(3,6,14,.9),transparent 36%)'}}/>:<Shade/>}<Fade>{ui?<><div style={{position:'absolute',left:64,top:62,fontFamily:font,fontSize:34,fontWeight:600,color:accent}}>{chapter}</div><div style={{position:'absolute',left:64,width:1010,bottom:64,fontFamily:font,color:'white'}}><div style={{width:64,height:5,background:accent,marginBottom:16}}/><div style={{fontSize:44,fontWeight:600,lineHeight:1.4}}>{text}</div>{detail&&<div style={{fontSize:29,color:'#B7C5DC',marginTop:10,lineHeight:1.5}}>{detail}</div>}</div></>:<><Header chapter={chapter} accent={accent}/>{title&&<div style={{position:'absolute',left:80,top:140,fontFamily:font,fontSize:100,fontWeight:700,color:'white',letterSpacing:3,opacity:titleOpacity}}>{title}</div>}<Caption text={text} detail={detail} accent={accent} top={player}/></>}</Fade></AbsoluteFill>;
};
