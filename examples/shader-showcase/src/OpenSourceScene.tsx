import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Fade,font,Palette} from './visuals';
export const OpenSourceScene:React.FC<{skill:string;accent:string}>=({skill,accent})=>
 <AbsoluteFill style={{background:Palette.bg,color:Palette.text,fontFamily:font}}><Fade>
  <div style={{position:'absolute',left:110,top:110,right:110}}>
   <div style={{fontSize:30,color:accent,letterSpacing:3}}>OPEN SOURCE · 开源资源</div>
   <div style={{fontSize:90,fontWeight:700,marginTop:28}}>从效果演示，到自己的作品</div>
   <div style={{fontSize:42,lineHeight:1.7,marginTop:42}}>Skill · 参数工作台 · Forge 示例 · 演示 Mod 源码</div>
   <div style={{marginTop:58,fontSize:40,color:accent,fontFamily:'Consolas,Microsoft YaHei,monospace'}}>github.com/Roxio-sketch/<br/><span style={{fontSize:66,lineHeight:1.5}}>minecraft-agent-skills</span></div>
   <div style={{fontSize:34,marginTop:48}}>Release 中下载 {skill}.zip 与演示 Mod JAR</div>
   <div style={{fontSize:29,color:Palette.muted,marginTop:24}}>2026-10-10 Release · Minecraft 1.20.1 / Forge 47.x / Java 17</div>
  </div>
  <div style={{position:'absolute',left:110,bottom:110,fontSize:29,color:Palette.muted}}>视频说明中附项目链接、下载入口与本次演示配方。</div>
  <div style={{position:'absolute',left:110,bottom:54,fontSize:25,color:Palette.muted}}>Music: {skill==='minecraft-black-hole'?'The Spaces Between':'Helios'} · Scott Buckley · CC BY 4.0 · www.scottbuckley.com.au</div>
 </Fade></AbsoluteFill>;
