import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
export const font = '"Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
export const Palette = {bg:'#080C16', text:'#F4F6FC',muted:'#B7C5DC',gold:'#FFBC67',blue:'#83D8FF'};
export const Fade: React.FC<{children:React.ReactNode}> = ({children}) => {
 const frame=useCurrentFrame();const {durationInFrames}=useVideoConfig();
 return <AbsoluteFill style={{opacity:interpolate(frame,[0,10,durationInFrames-10,durationInFrames-1],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>{children}</AbsoluteFill>;
};
export const Caption:React.FC<{text:string; detail?:string;accent:string;top?:boolean}>=({text,detail,accent,top})=><div style={{position:'absolute',left:80,right:80,bottom:top?undefined:72,top:top?146:undefined,fontFamily:font,color:Palette.text}}><div style={{width:64,height:5,background:accent,marginBottom:18}}/><div style={{fontSize:48,fontWeight:600,lineHeight:1.45,textShadow:'0 3px 12px #000'}}>{text}</div>{detail&&<div style={{fontSize:31,color:Palette.muted,marginTop:8,lineHeight:1.45}}>{detail}</div>}</div>;
export const Header:React.FC<{chapter:string;accent:string}>=({chapter,accent})=><div style={{position:'absolute',left:80,right:80,top:62,display:'flex',justifyContent:'space-between',fontFamily:font}}><div style={{fontSize:34,fontWeight:600,color:accent}}>{chapter}</div><div style={{fontSize:25,color:'#CDD6E6'}}>Minecraft 1.20.1 · Forge · 实机渲染</div></div>;
export const Shade=()=> <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(3,6,14,.8) 0%,transparent 24%,transparent 60%,rgba(3,6,14,.94) 100%)'}}/>;
