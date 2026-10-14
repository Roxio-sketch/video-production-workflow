import {AbsoluteFill,Img,staticFile} from 'remotion';
import {font} from './visuals';
import type {CSSProperties} from 'react';

/** Crop original framebuffer captures; keep every effect's original pixels. */
const Shot=({src,left,top,width,height,scale,centerX,centerY,brightness=1}:{src:string;left:number;top:number;width:number;height:number;scale:number;centerX:number;centerY:number;brightness?:number})=>(
 <div style={{position:'absolute',left,top,width,height,overflow:'hidden'}}>
  <Img src={staticFile(`clips/${src}.png`)} style={{position:'absolute',width:1920*scale,height:1080*scale,maxWidth:'none',left:width/2-centerX*scale,top:centerY-540*scale,filter:`brightness(${brightness})`}}/>
 </div>
);

export const Cover=({kind}:{kind:'blackhole'|'lightning'})=>{
 const black=kind==='blackhole';
 const lettering:CSSProperties={position:'absolute',left:0,width:'100%',textAlign:'center',fontWeight:900,lineHeight:1.12,WebkitTextStroke:'7px #080B11',paintOrder:'stroke fill',textShadow:'0 6px 5px rgba(0,0,0,.95)',whiteSpace:'nowrap'};
 return <AbsoluteFill style={{background:'#080C16',fontFamily:font,color:'white'}}>
  {black?<>
   <Shot src="bh-hero-mid" left={0} top={0} width={680} height={540} scale={.52} centerX={960} centerY={185}/>
   <Shot src="wh-hero-mid" left={680} top={0} width={680} height={540} scale={.55} centerX={960} centerY={185}/>
   <Shot src="bh-dust-mid" left={0} top={540} width={680} height={540} scale={.48} centerX={960} centerY={390}/>
   <Shot src="bh-classic-mid" left={680} top={540} width={680} height={540} scale={.68} centerX={960} centerY={385}/>
  </>:<>
   <Shot src="lt-cover-impact" left={0} top={0} width={450} height={1080} scale={1.5} centerX={950} centerY={800} brightness={1.2}/>
   <Shot src="lt-ui-branch-mid" left={450} top={0} width={430} height={1080} scale={1} centerX={550} centerY={470} brightness={1.3}/>
   <Shot src="lt-wuxing-vivid" left={880} top={0} width={480} height={1080} scale={.5} centerX={960} centerY={290} brightness={1.8}/>
  </>}
  <Img src={staticFile(black?'covers/blackhole-ui.png':'covers/lightning-ui.png')} style={{position:'absolute',left:1370,top:116,width:550,height:848,objectFit:'contain'}}/>
  <div style={{...lettering,top:310,fontSize:252,color:'#FFEE00'}}>{black?'自定义黑洞':'自定义闪电'}</div>
  <div style={{...lettering,top:655,fontSize:136,color:'#FFFFFF'}}>开源 Mod · Skill</div>
 </AbsoluteFill>;
};
