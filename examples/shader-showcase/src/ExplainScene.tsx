import React from 'react';
import {AbsoluteFill,useCurrentFrame,interpolate} from 'remotion';
import {Fade,font,Palette} from './visuals';
export type ExplainProps={eyebrow:string;title:string;lines:string[];accent:string;note?:string;prompt?:string};
export const ExplainScene:React.FC<ExplainProps>=({eyebrow,title,lines,accent,note,prompt})=>{
 const frame=useCurrentFrame();
 return <AbsoluteFill style={{background:Palette.bg,fontFamily:font,color:Palette.text,padding:'80px 110px'}}><div style={{position:'absolute',width:850,height:850,right:-220,top:-170,borderRadius:'50%',background:`radial-gradient(circle,${accent}18,transparent 65%)`}}/><Fade><div style={{position:'absolute',left:110,right:110,top:94}}><div style={{fontSize:30,letterSpacing:3,color:accent,marginBottom:32}}>{eyebrow}</div><div style={{fontSize:88,fontWeight:700,lineHeight:1.25,maxWidth:1600}}>{title}</div>{prompt&&<div style={{marginTop:45,padding:'30px 38px',borderLeft:`5px solid ${accent}`,background:'#152033',fontSize:42,lineHeight:1.65}}>{prompt}</div>}<div style={{marginTop:46,display:'flex',flexDirection:'column',gap:28}}>{lines.map((line,i)=><div key={line} style={{fontSize:42,lineHeight:1.5,opacity:interpolate(frame,[14+i*7,25+i*7],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}><span style={{display:'inline-block',minWidth:66,color:accent,fontSize:28}}>{String(i+1).padStart(2,'0')}</span>{line}</div>)}</div></div>{note&&<div style={{position:'absolute',left:110,right:110,bottom:92,color:Palette.muted,fontSize:29,lineHeight:1.5}}>{note}</div>}</Fade></AbsoluteFill>;
};
