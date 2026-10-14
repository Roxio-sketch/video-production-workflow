import {Audio, Video} from '@remotion/media';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig, Img} from 'remotion';
import plan from './portrait-plan.json';
import {font} from './visuals';

type Kind='blackhole'|'lightning';
type Cue={chapter:string;text:string;clips:string[];mode:string;seconds:number;frames:number;start:number;voiceDuration?:number;labels?:string[]};

const Capture=({clip,box,scale=.82,centerX=960,centerY=540,timeOffset=0,still=false}:{clip:string;box:number[];scale?:number;centerX?:number;centerY?:number;timeOffset?:number;still?:boolean})=>{
 const {fps}=useVideoConfig();
 return <div style={{position:'absolute',left:box[0],top:box[1],width:box[2],height:box[3],overflow:'hidden'}}>
  {still?<Img src={staticFile(`clips/${clip}-portrait-peak.png`)} style={{position:'absolute',width:1920*scale,height:1080*scale,maxWidth:'none',left:box[2]/2-centerX*scale,top:box[3]/2-centerY*scale}}/>:
   <Video name={`实机 ${clip}`} src={staticFile(`clips/${clip}.mp4`)} muted loop trimBefore={timeOffset*fps} premountFor={fps}
   style={{position:'absolute',width:1920*scale,height:1080*scale,maxWidth:'none',left:box[2]/2-centerX*scale,top:box[3]/2-centerY*scale}}/>}
 </div>;
};

const PortraitScene=({cue,kind}:{cue:Cue;kind:Kind})=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();
 const sentences=cue.text.match(/[^。！？，]+[。！？，]?/g)??[cue.text];
 const progress=Math.max(0,Math.min(1,(frame/fps-.18)/(cue.voiceDuration??cue.seconds)))*cue.text.length;
 let total=0;const found=sentences.findIndex(s=>{total+=s.length;return progress<total;});
 const sentence=found<0?sentences.length-1:found;
 const black=kind==='blackhole';
 return <AbsoluteFill style={{background:'#080C16',fontFamily:font,color:'white'}}>
  {cue.mode==='compare'?cue.clips.map((clip,i)=><div key={clip}>
   <Capture clip={clip} box={[0,345+i*455,1080,445]} scale={.82} centerY={540} timeOffset={.2} still={!black}/>
   <div style={{position:'absolute',left:65,top:370+i*455,fontSize:40,fontWeight:700,color:'#FFE900',textShadow:'0 3px 5px black'}}>{cue.labels?.[i]}</div>
  </div>):cue.mode==='ui'?<>
   <Capture clip={cue.clips[0]} box={[0,320,1080,695]} scale={1} centerX={650} centerY={485}/>
   <Capture clip={cue.clips[0]} box={[60,1040,960,520]} scale={1.4} centerX={1560} centerY={405}/>
  </>:cue.clips.map((clip,i)=><Sequence key={clip} name={clip} from={Math.round(i*cue.frames/cue.clips.length)} durationInFrames={Math.round((i+1)*cue.frames/cue.clips.length)-Math.round(i*cue.frames/cue.clips.length)} premountFor={fps}>
   <Capture clip={clip} box={[0,330,1080,940]} scale={black?.82:clip.includes('wuxing')?1.04:1.25} centerY={540} timeOffset={clip.startsWith('lt-')?.2:0}/>
  </Sequence>)}
  <div style={{position:'absolute',left:62,top:90,fontSize:34,color:'#D5DEEF'}}>GPT制作 · 实机演示 · 已开源</div>
  <div style={{position:'absolute',left:60,top:160,fontSize:106,fontWeight:900,color:'#FFEE00',WebkitTextStroke:'3px #080C16',paintOrder:'stroke fill'}}>{black?'自定义黑洞':'自定义闪电'}</div>
  <div style={{position:'absolute',left:65,top:cue.mode==='ui'?1580:1300,width:850,fontSize:38,fontWeight:700,color:black?'#FFCD86':'#8BDFFF'}}>{cue.chapter}</div>
  <div style={{position:'absolute',left:65,top:cue.mode==='ui'?1640:1390,width:850,fontSize:54,lineHeight:1.5,fontWeight:700,textShadow:'0 3px 6px black'}}>{sentences[sentence]}</div>
  {cue.mode==='outro'&&<div style={{position:'absolute',left:65,top:1190,width:850,fontSize:34,lineHeight:1.3,color:'#8BDFFF',textShadow:'0 3px 6px black'}}>配方工作台 + Forge演示Mod<br/>{black?'minecraft-black-hole':'minecraft-lightning'}</div>}
  <div style={{position:'absolute',left:65,top:1825,fontSize:26,color:'#8697B2'}}>开源 Mod · Skill · 源码</div>
 </AbsoluteFill>;
};

export const PortraitVideo=({kind,narration=true}:{kind:Kind;narration?:boolean})=>{
 const {fps}=useVideoConfig();
 const data=plan[kind];
 return <AbsoluteFill>
  {narration&&<Audio name="竖版曼波配音与配乐" src={staticFile(`audio/${kind}-portrait.m4a`)} premountFor={fps}/>}
  {data.cues.map((cue)=><Sequence key={cue.index} name={cue.chapter} from={Math.round(cue.start*fps)} durationInFrames={cue.frames} premountFor={fps}><PortraitScene kind={kind} cue={cue}/></Sequence>)}
 </AbsoluteFill>;
};

const CoverShot=({src,left,top,width,height,scale,centerX=960,centerY=540}:{src:string;left:number;top:number;width:number;height:number;scale:number;centerX?:number;centerY?:number})=><div style={{position:'absolute',left,top,width,height,overflow:'hidden'}}><Img src={staticFile(src)} style={{position:'absolute',width:1920*scale,height:1080*scale,maxWidth:'none',left:width/2-centerX*scale,top:height/2-centerY*scale}}/></div>;

export const PortraitCover=({kind}:{kind:Kind})=>{
 const black=kind==='blackhole';
 return <AbsoluteFill style={{background:'#080C16',fontFamily:font}}>
  {black?<>
   <CoverShot src="clips/bh-hero-mid.png" left={0} top={40} width={1080} height={500} scale={.85}/>
   <CoverShot src="clips/wh-hero-mid.png" left={0} top={540} width={540} height={450} scale={.65}/>
   <CoverShot src="clips/bh-dust-mid.png" left={540} top={540} width={540} height={450} scale={.5}/>
   <CoverShot src="clips/bh-classic-mid.png" left={0} top={1400} width={680} height={460} scale={.75}/>
  </>:<>
   <CoverShot src="clips/lt-wuxing-vivid.png" left={0} top={20} width={1080} height={930} scale={1}/>
   <CoverShot src="clips/lt-cover-impact.png" left={0} top={1390} width={700} height={470} scale={.85} centerY={490}/>
  </>}
  <Img src={staticFile(black?'covers/blackhole-ui.png':'covers/lightning-ui.png')} style={{position:'absolute',right:35,top:1350,width:340,height:524}}/>
  <div style={{position:'absolute',top:940,left:0,width:'100%',textAlign:'center',fontSize:176,fontWeight:900,color:'#FFEE00',WebkitTextStroke:'5px black',paintOrder:'stroke fill',whiteSpace:'nowrap'}}>自定义{black?'黑洞':'闪电'}</div>
  <div style={{position:'absolute',top:1190,left:0,width:'100%',textAlign:'center',fontSize:88,fontWeight:900,color:'white',WebkitTextStroke:'4px black',paintOrder:'stroke fill'}}>开源 Mod · Skill</div>
 </AbsoluteFill>;
};
