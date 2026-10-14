import {AbsoluteFill, Composition, Img, Interactive, interpolate, useCurrentFrame, useVideoConfig, staticFile} from 'remotion';

export const ChineseDemo = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill
    style={{
      backgroundColor: '#081a22',
      color: '#effffb',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      scale: 1.472
    }}
  >
    <Interactive.Div name="栏目标签" from={0} premountFor={fps} style={{position:'absolute', left:'8%', top:'10%', fontSize:38, color:'#69e7c4', letterSpacing:5}}>方块世界 · 无限创造</Interactive.Div>
    <Interactive.Div name="主标题" from={0} premountFor={fps} style={{position:'absolute', left:'8%', top:'18%', width:'84%', fontSize:86, fontWeight:700, lineHeight:1.25, opacity:interpolate(frame,[0, 1 * fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}), translate:interpolate(frame,[0, 1 * fps],['0px 45px','0px 0px'],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>Minecraft 修仙之旅</Interactive.Div>
    <Interactive.Div name="副标题" from={0} premountFor={fps} style={{position:'absolute', left:'8%', top:'33%', width:'84%', fontSize:44, color:'#aac7cb', lineHeight:1.5, opacity:interpolate(frame,[0.5 * fps, 1.5 * fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>御剑凌空，探索属于你的世界</Interactive.Div>
    <Img name="图片占位：替换为游戏截图" src={staticFile('images/minecraft-placeholder.svg')} from={0} premountFor={fps} style={{position:'absolute', left:'8%', top:'44%', width:'84%', height:'34%', objectFit:'cover', borderRadius:28, opacity:interpolate(frame,[1 * fps, 2 * fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}} />
    <Interactive.Div name="功能说明" from={0} premountFor={fps} style={{position:'absolute', left:'8%', top:'82%', width:'84%', fontSize:38, color:'#69e7c4'}}>Mod 宣传 / 开发教程 / 开源项目介绍</Interactive.Div>
    <Interactive.Div name="中文验收文字" from={0} premountFor={fps} style={{position:'absolute', left:'8%', top:'89%', width:'84%', fontSize:30, color:'#aac7cb'}}>中文测试：修仙、御剑、灵气、开源。你好，世界！</Interactive.Div>
  </AbsoluteFill>;
};
export const RemotionRoot = () => <>
  <Composition id="Landscape" component={ChineseDemo} width={1920} height={1080} fps={30} durationInFrames={180}/>
  <Composition id="Portrait" component={ChineseDemo} width={1080} height={1920} fps={30} durationInFrames={180}/>
</>;
