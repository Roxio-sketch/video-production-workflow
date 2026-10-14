import fs from 'node:fs';
import path from 'node:path';

// Narration connects neighboring shots; captions remain short visual labels.
const narration={
 BlackHoleVideo:{
  '开场：自定义黑洞':'这样的黑洞，也可以放进你的世界。盘面、颜色和运动，都能按自己的想法设计。',
  '介绍能力':'先把它拆开来看。核心和盘面决定外形，盘纹与粒子负责运动，透镜则让周围的场景弯曲。',
  '颗粒盘':'先选一种盘面。颗粒风格，把吸积盘的结构清楚地显出来。',
  '层叠光带':'换成层叠光带，画面就有了环带交错的层次。',
  '经典程序光带':'喜欢更简洁的效果？可以保留弯曲光带和清晰的暗核。',
  '体积尘埃':'还可以换成体积尘埃，让云雾和细丝铺开，形成柔和的盘面。',
  '金橙配色':'选好盘面，再来配色。这里先用金色内盘和橙色外缘。',
  '自然语言需求':'你也可以直接描述：做一个冰蓝色黑洞，盘面薄一点，旋转慢一点。让代理整理参数，再到工作台细调。',
  '冰蓝配色':'按照这个想法，保持原来的形状，把盘面换成冰蓝色。',
  '紫色配色':'再换一组紫色。同样的结构，也能呈现另一种气氛。',
  '形状实时修改':'颜色之外，外形也能继续调整。改变倾角和厚度，看看盘面怎样展开。',
  '速度对照':'接着让它动起来。旋转和向内流动各有自己的速度，可以分别调节。',
  '独立粒子':'再加上独立尘粒，螺旋吸入的运动就更清楚了。',
  '世界透镜关闭':'外观调好了，再看世界透镜。先保留原来的网格。',
  '世界透镜开启':'打开透镜后，周围的真实场景开始弯曲。',
  '透镜范围较小':'范围设为三，扭曲集中在黑洞附近。',
  '透镜范围扩大':'范围从三调到十二，覆盖的区域随之扩大。',
  '玩家透镜关闭':'那么，人物也要跟着变形吗？关闭玩家参与，身体和装备就能保持完整。',
  '玩家透镜开启':'打开这个开关，同一个机位下，人物和头盔也会一起扭曲。',
  '真实调参：透镜':['这些效果怎样调？先在工作台改变强度。','再调覆盖范围，两个参数分别控制。'],
  '真实调参：形状':['看完透镜，回到黑洞本身，调整暗核大小。','盘面厚度，决定吸积盘的体积。','倾角则控制它朝向我们的姿态。'],
  '真实调参：颜色':['配色也在这里改，先把内盘换成冰蓝色。','外盘可以单独选色，内外层次由你搭配。'],
  '真实调参：运动':['先让盘面转得更快，观察纹理的变化。','向内流动，有自己独立的节奏。','粒子速度也能单独调，不必跟着盘面走。'],
  '白洞完整展示':'同一套工具，还能设计白洞。明亮的核心，配合上下喷流和向外运动的粒子。',
  '白洞核心':'先看核心光晕。增加强度和半径，让中心的发光向外铺开。',
  '白洞双极喷流':'再打开双极喷流。除了强度，长度、宽度、速度和两端颜色也能设计。',
  '白洞外扩光壳':'如果想要一层层向外传播的能量，还可以加入光壳，调整扩散速度与厚度。',
  '白洞真实调参':['回到工作台，把核心光晕调到合适的亮度。','配合上下喷流，增强向外释放的感觉。','最后加入光壳，组合成自己的白洞。'],
  '使用路线':'效果满意后，就可以保存成配方。技能包附带工作台和演示模组，也提供源码，方便接入自己的模组。',
  '展示收尾':'从黑洞到白洞，把形状、颜色和运动组合起来，就能做出自己的风格。',
  '开源资源':'想亲手试试？技能包、工作台、演示模组和源码都已开源。项目链接与下载入口放在视频简介里。',
 },
 LightningVideo:{
  '开场：自定义闪电':'这样的雷劫，来自五行仙途的参数配方。从环绕电流到密集落雷，每一道闪电都能继续设计。',
  '三种通道':'先按用途来选。环绕电流可以附着对象，单次落雷连接起点和终点，群雷则覆盖一片区域。',
  '固定种子A':'想复现同一种形状？保持配方、端点和种子不变。',
  '固定种子B':'只换一个种子，就能探索另一组主干和分叉。',
  '少分叉':'接着看分叉。先关闭分叉，留下简洁的主雷。',
  '多分叉':'提高分叉概率，结构就更丰富了。',
  '颜色渐变':'接下来给它配色。拖动渐变比例，两种颜色的占比随之变化，也可以只保留其中一种。',
  '材质层解释':'颜色之外，还要看光的层次。核心与光晕可以分开设计，分别调整宽度、亮度和持续时间。',
  '环形电弧':'把这些控制用在环绕电流上，就能让电弧围着对象扫过。',
  '延伸电流':'也可以换成延伸电流，让每条电弧从固定根部，沿自己的方向生长。',
  '集束群雷':'需要更强的冲击感？把多道落雷集中到一个区域，组成群雷。',
  '散布群雷':'再把范围展开，同样的群雷就变成了散布的布局。',
  '击地特写':'落雷命中后，电弧和火花继续展开，还有向外扩散的环形效果。',
  '五行仙途雷劫配方':'开头的雷劫，就是这些控制的一种组合。一百二十九格的长距离落雷，配合密集分叉和多次回击。',
  '自然语言需求':'如果不想从参数表开始，就描述你要的配色、形状和节奏。让代理整理配方，再到工作台检查和细调。',
  '实际调参：粗细亮度':['现在实际调一次，先改变主雷的粗细。','扩大光晕，发光的层次也会改变。','再调核心亮度，观察颜色的表现。'],
  '实际调参：渐变光晕':['配色时，可以让两种颜色渐变，也能选一种纯色。','光晕亮度独立调整，不必改动颜色比例。'],
  '实际调参：分叉':['分叉也是这样，先调整出现的概率。','分叉的层数增加，形状就更丰富了。','再限制总预算，让复杂程度保持可控。'],
  '实际调参：多道落雷':['最后看布局，增加同时出现的落雷数量。','把覆盖范围拉开，调整雷与雷的间距。','击地半径也能单独改，搭配整体布局。'],
  '使用路线':'调好的效果可以保存成配方，在演示模组中载入。也能参考技能包里的源码，把端点接到模型挂点或技能事件上。',
  '展示收尾':'从充能电流，到群雷和击地放电，用同一个内核，组合出自己的雷电效果。',
  '开源资源':'这些工具和演示源码都已开源。项目链接与下载入口放在视频简介里，你可以从现有配方开始，做出自己的版本。',
 },
};
const output=path.resolve('narration');fs.mkdirSync(output,{recursive:true});
const timestamp=s=>{
 const ms=Math.round(s*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;
};
const clean=text=>text.replaceAll('seed','种子').replaceAll('shader','着色器').replaceAll('Mod','模组');
for(const [file,label] of [['BlackHoleVideo.tsx','黑洞白洞'],['LightningVideo.tsx','闪电']]){
 const source=fs.readFileSync(path.join('src',file),'utf8');let cursor=0;const cues=[];
 for(const m of source.matchAll(/<Series.Sequence name="([^"]+)" durationInFrames=\{(\d+)\*fps\}[^>]*>([\s\S]*?)<\/Series.Sequence>/g)){
  const [,name,duration,body]=m;const seconds=Number(duration);
  const stepArray=body.match(/steps=\{\[([\s\S]*?)\]\}/)?.[1];
  const steps=stepArray?[...stepArray.matchAll(/'([^']*)'/g)].map(s=>s[1]):null;
  const override=narration[file.replace('.tsx','')][name];
  if(!override)throw new Error(`Missing authored narration for ${file}: ${name}`);
  let texts=Array.isArray(override)?override:[override];
  if(steps&&texts.length!==steps.length)throw new Error(`Step timing mismatch: ${name}`);
  if(!texts[0]){
   const lines=body.match(/lines=\{\[([\s\S]*?)\]\}/)?.[1];
   texts=[lines?[...lines.matchAll(/'([^']*)'/g)].map(s=>s[1]).join('。'):null];
  }
  if(!texts[0])throw new Error(`Missing narration for ${file}: ${name}`);
  const span=seconds/texts.length;
  texts.forEach((text,index)=>cues.push({index:cues.length+1,chapter:name,start:cursor+index*span+.25,end:cursor+(index+1)*span-.2,text:clean(text)}));
  cursor+=seconds;
 }
 fs.writeFileSync(path.join(output,label+'-曼波配音稿.json'),JSON.stringify({status:'text-prepared-audio-pending',requestedVoice:'曼波（原偏好：剪映 曼波讲故事）',speakerId:null,voiceProvider:null,voiceVerified:false,seconds:cursor,cues},null,2));
 fs.writeFileSync(path.join(output,label+'-朗读字幕.srt'),cues.map(c=>`${c.index}\n${timestamp(c.start)} --> ${timestamp(c.end)}\n${c.text}\n`).join('\n'));
 fs.writeFileSync(path.join(output,label+'-配音稿.txt'),cues.map(c=>`[${timestamp(c.start)} / ${c.chapter}]\n${c.text}`).join('\n\n'));
 fs.writeFileSync(path.join(output,label+'-纯文案.txt'),cues.map(c=>c.text).join('\n\n'));
 console.log(`${label}: ${cues.length} cues / ${cursor} seconds; text only, audio pending`);
}
