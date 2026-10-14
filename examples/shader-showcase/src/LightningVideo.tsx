import {AbsoluteFill,Series,useVideoConfig} from 'remotion';
import {DemoShot} from './DemoShot';
import {ExplainScene} from './ExplainScene';
import {OpenSourceScene} from './OpenSourceScene';
import {ParameterShot} from './ParameterShot';
import {BackgroundMusic} from './BackgroundMusic';
const accent='#83D8FF';
export const LightningVideo=({narration=true}:{narration?:boolean})=>{
 const {fps}=useVideoConfig();
 return <AbsoluteFill><BackgroundMusic kind="lightning" narration={narration}/><Series>
  <Series.Sequence name="开场：自定义闪电" durationInFrames={10*fps} premountFor={fps}><DemoShot clip="lt-wuxing-vivid" chapter="自定义闪电" title="每一道雷，都能设计" text="从环绕电流，到分形落雷与击地放电。" detail="五行仙途高阶雷劫参数起点 · 调整线宽与渐变作用层" accent={accent}/></Series.Sequence>
  <Series.Sequence name="三种通道" durationInFrames={10*fps} premountFor={fps}><ExplainScene eyebrow="MINECRAFT LIGHTNING SKILL" title="三种通道，组合不同用途" lines={['orbit：附着或环绕对象的电流','strike：从起点到终点的一次闪电事件','rain：范围内多道落雷，可散布或集束']} accent={accent} note="工作台与 Forge 示例共享 63 字段配方；具体宿主显示仍可能不同。"/></Series.Sequence>
  <Series.Sequence name="固定种子A" durationInFrames={5*fps} premountFor={fps}><DemoShot clip="lt-seed-a" chapter="01 / 可复现的形状" text="同一配方、端点和 seed，复现同一拓扑。" detail="当前 seed：18234。重复触发，观察主干和分叉。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="固定种子B" durationInFrames={5*fps} premountFor={fps}><DemoShot clip="lt-seed-b" chapter="01 / 可复现的形状" text="只改变 seed，探索另一种闪电形状。" detail="当前 seed：9417。其余配方保持一致。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="少分叉" durationInFrames={5*fps} premountFor={fps}><DemoShot clip="lt-branches-low" chapter="02 / 分叉与预算" text="关闭分叉，留下简洁的主雷。" detail="主干与分叉层数、概率和总预算分别控制。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="多分叉" durationInFrames={5*fps} premountFor={fps}><DemoShot clip="lt-branches-high" chapter="02 / 分叉与预算" text="提高分叉概率，形成更丰富的结构。" detail="几何在触发时生成，闪烁不会每帧随机重建树。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="颜色渐变" durationInFrames={9*fps} premountFor={fps}><DemoShot clip="lt-gradient" chapter="03 / 色彩与光晕" text="渐变起始色占比，从 0% 调到 100%。" detail="0% 全终止色 · 50% 保留标准插值 · 100% 全起始色" accent={accent}/></Series.Sequence>
  <Series.Sequence name="材质层解释" durationInFrames={10*fps} premountFor={fps}><ExplainScene eyebrow="核心与光晕分开设计" title="控制颜色，也控制光的层次" lines={['渐变可作用于核心、光晕，或同时作用于两层','核心选择保留色相，或传统加法叠加','分别调整线宽、光晕宽度、亮度与时间包络']} accent={accent} note="高增益的传统加法叠加可能显示为白色，需按目标画面选择。"/></Series.Sequence>
  <Series.Sequence name="环形电弧" durationInFrames={7*fps} premountFor={fps}><DemoShot clip="lt-ring" chapter="04 / 环绕电流" text="环形电弧：围绕对象安排固定根部与扫掠范围。" detail="ring 动画使用极坐标圆弧中心线。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="延伸电流" durationInFrames={7*fps} premountFor={fps}><DemoShot clip="lt-grow" chapter="04 / 环绕电流" text="延伸电流：每条电弧沿自己的方向生长。" detail="延伸速度与噪声抖动分别控制，根部保持固定。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="集束群雷" durationInFrames={8*fps} premountFor={fps}><DemoShot clip="lt-cluster" chapter="05 / 群雷与击地" text="集束落雷：把多道雷集中在一个区域。" detail="数量、横纵范围与触发间隔可以独立修改。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="散布群雷" durationInFrames={7*fps} premountFor={fps}><DemoShot clip="lt-rain" chapter="05 / 群雷与击地" text="散布落雷：扩大范围，形成不同的布局。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="击地特写" durationInFrames={7*fps} premountFor={fps}><DemoShot clip="lt-impact" chapter="05 / 击地特写" text="命中后，继续播放电弧、扩散断环与火花。" detail="击地继承落雷终点的实际材质色；半径与尾段时间可调。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="五行仙途雷劫配方" durationInFrames={10*fps} premountFor={fps}><DemoShot clip="lt-wuxing" chapter="06 / 五行仙途高阶雷劫配方" text="129 格落雷，高密度分叉与多次回击。" detail="以 08.json 为起点；调节线宽与亮度，适合远景观看。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="自然语言需求" durationInFrames={10*fps} premountFor={fps}><ExplainScene eyebrow="从一句描述开始" title="描述你想要的雷电" prompt="“做一组紫青渐变的集束落雷，主雷细一些，命中后有扩散电弧和火花。”" lines={['用 Skill 把视觉需求整理成配方','在工作台中检查形状、节奏、颜色与预算']} accent={accent}/></Series.Sequence>
  <Series.Sequence name="实际调参：粗细亮度" durationInFrames={12*fps} premountFor={fps}><ParameterShot clip="lt-ui-width" chapter="07 / 粗细与亮度" steps={['调节主雷核心宽度。','增加光晕宽度，改变发光层次。','修改核心亮度，观察显色。']} secondsPerStep={4} detail="实际拖动 Mod 控件；固定事件时间，清楚对照参数变化。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="实际调参：渐变光晕" durationInFrames={12*fps} premountFor={fps}><ParameterShot clip="lt-ui-gradient" chapter="07 / 色彩与光晕" steps={['把起始色占比从 0% 调到 100%。','再调整光晕亮度。']} secondsPerStep={6} detail="固定事件时间；渐变比例与光晕亮度互相独立。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="实际调参：分叉" durationInFrames={12*fps} premountFor={fps}><ParameterShot clip="lt-ui-branch" chapter="07 / 分叉与预算" steps={['提高分叉概率。','改变分叉深度，丰富拓扑。','调整分叉预算，控制复杂程度。']} secondsPerStep={4} detail="同一随机种子与事件时间，对照三个参数带来的差异。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="实际调参：多道落雷" durationInFrames={12*fps} premountFor={fps}><ParameterShot clip="lt-ui-layout" chapter="07 / 布局与击地" steps={['增加群雷数量。','扩大落雷散布范围。','改变击地放电半径。']} secondsPerStep={4} detail="固定事件时间；数量、范围与击地效果可以分别设计。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="使用路线" durationInFrames={12*fps} premountFor={fps}><ExplainScene eyebrow="从演示到你的 MOD" title="配方可以继续复用" lines={['安装 minecraft-lightning Skill，打开随附 WebGL 工作台','保存 63 字段 JSON，使用对应 Forge 演示入口载入','参考 Forge 源码，把锚点替换成模型挂点或技能事件']} accent={accent} note="演示工程只做客户端视觉。伤害、碰撞与服务器权威事件需要另外接入。"/></Series.Sequence>
  <Series.Sequence name="展示收尾" durationInFrames={8*fps} premountFor={fps}><DemoShot clip="lt-finale" chapter="自定义闪电" text="同一个内核，设计属于你的电流与落雷。" detail="从单次技能，到充能、群雷和击地放电。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="开源资源" durationInFrames={12*fps} premountFor={fps}><OpenSourceScene skill="minecraft-lightning" accent={accent}/></Series.Sequence>
 </Series></AbsoluteFill>;
};
