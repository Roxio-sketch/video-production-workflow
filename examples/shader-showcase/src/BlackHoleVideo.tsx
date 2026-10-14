import {AbsoluteFill,Series,useVideoConfig} from 'remotion';
import {DemoShot} from './DemoShot';
import {ExplainScene} from './ExplainScene';
import {OpenSourceScene} from './OpenSourceScene';
import {ParameterShot} from './ParameterShot';
import {BackgroundMusic} from './BackgroundMusic';
const accent='#FFBC67';
export const BlackHoleVideo=({narration=true}:{narration?:boolean})=>{
 const {fps}=useVideoConfig();
 return <AbsoluteFill><BackgroundMusic kind="blackhole" narration={narration}/><Series>
  <Series.Sequence name="开场：自定义黑洞" durationInFrames={8*fps} premountFor={fps}><DemoShot clip="bh-hero" chapter="自定义黑洞 / 白洞" title="把黑洞，做成你的风格" text="世界中的黑洞，可以按自己的想法调整。" detail="盘面、配色、运动、粒子与世界透镜，都有独立控制。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="介绍能力" durationInFrames={9*fps} premountFor={fps}><ExplainScene eyebrow="MINECRAFT BLACK HOLE SKILL" title="一个效果，多个可编辑层" lines={['核心与吸积盘：调整形状、颜色和层次','盘纹与粒子：分别控制旋转、内流和轨迹','世界透镜：让真实场景参与视觉扭曲']} accent={accent} note="以下画面来自独立 Forge 客户端的真实录制。"/></Series.Sequence>
  <Series.Sequence name="颗粒盘" durationInFrames={6*fps} premountFor={fps}><DemoShot clip="bh-granular" chapter="01 / 盘面风格" text="颗粒盘：用清晰的颗粒结构构成吸积盘。" detail="同一个世界中心，切换不同风格起点。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="层叠光带" durationInFrames={6*fps} premountFor={fps}><DemoShot clip="bh-ribbons" chapter="01 / 盘面风格" text="层叠光带：突出环带与发光层次。" detail="可继续调整光带细节、颜色与盘面扩散。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="经典程序光带" durationInFrames={6*fps} premountFor={fps}><DemoShot clip="bh-classic" chapter="01 / 盘面风格" text="经典光带：冰蓝内盘，紫色外缘。" detail="减少盘纹密度，保留清楚的暗核与弯曲光带。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="体积尘埃" durationInFrames={8*fps} premountFor={fps}><DemoShot clip="bh-dust" chapter="01 / 盘面风格" text="体积尘埃：云雾与细丝构成不同的层次。" detail="与颗粒和光带盘面使用不同的材质起点。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="金橙配色" durationInFrames={6*fps} premountFor={fps}><DemoShot clip="bh-color-gold" chapter="02 / 自定义配色" text="先给它一组暖色：金色内盘，橙色外盘。" detail="以下三段使用相同形态与相机，对照配色差异。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="自然语言需求" durationInFrames={9*fps} premountFor={fps}><ExplainScene eyebrow="从一句描述开始" title="不用先记住 shader 参数" prompt="“做一个冰蓝色黑洞，盘面薄一些，旋转缓慢，保留清晰暗核。”" lines={['把颜色、形状和运动描述给支持 Skill 的代理','在参数工作台中检查，再继续调整']} accent={accent} note="Skill 提供设计流程、参数工作台与 Forge 接入示例。"/></Series.Sequence>
  <Series.Sequence name="冰蓝配色" durationInFrames={6*fps} premountFor={fps}><DemoShot clip="bh-color-ice" chapter="02 / 自定义配色" text="冰蓝色：同一盘面，换成冷色层次。" detail="内盘色、中间色和外盘色可以分别设计。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="紫色配色" durationInFrames={6*fps} premountFor={fps}><DemoShot clip="bh-color-violet" chapter="02 / 自定义配色" text="紫色：继续改变风格，不必重做整个效果。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="形状实时修改" durationInFrames={8*fps} premountFor={fps}><DemoShot clip="bh-shape" chapter="03 / 形状与运动" text="现在改变盘面倾角与厚度。" detail="盘面形态的变化，直接反映在同一个黑洞上。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="速度对照" durationInFrames={8*fps} premountFor={fps}><DemoShot clip="bh-motion" chapter="03 / 形状与运动" text="旋转和径向内流，分别调整。" detail="前半段较慢，后半段提高两种运动速度。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="独立粒子" durationInFrames={6*fps} premountFor={fps}><DemoShot clip="bh-particles" chapter="03 / 独立粒子" text="加入独立尘粒，强调螺旋吸入的运动。" detail="数量、尺寸、速度与颜色可以继续调整。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="世界透镜关闭" durationInFrames={5*fps} premountFor={fps}><DemoShot clip="bh-lens-off" chapter="04 / 世界背景透镜" text="外观调好了，再看黑洞怎样影响周围场景。" detail="先关闭透镜，保留原始网格；以下对照使用同一相机与中心。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="世界透镜开启" durationInFrames={5*fps} premountFor={fps}><DemoShot clip="bh-lens-on" chapter="04 / 世界背景透镜" text="开启背景透镜，真实场景出现扭曲。" detail="这段展示场景颜色与深度参与的世界效果。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="透镜范围较小" durationInFrames={6*fps} premountFor={fps}><DemoShot clip="bh-lens-small" chapter="04 / 透镜范围：3" text="范围较小：扭曲集中在黑洞附近。" detail="固定中心、相机与透镜强度，单独比较范围参数。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="透镜范围扩大" durationInFrames={6*fps} premountFor={fps}><DemoShot clip="bh-lens-large" chapter="04 / 透镜范围：12" text="扩大范围，让更宽的真实场景参与扭曲。" detail="范围决定覆盖区域；强度控制扭曲程度，两者分别调整。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="玩家透镜关闭" durationInFrames={7*fps} premountFor={fps}><DemoShot clip="bh-player-off" chapter="04 / 透镜影响玩家：关闭" text="背景可以扭曲，同时保持人物完整。" detail="实际第三人称玩家；关闭参与开关，保护人物与装备。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="玩家透镜开启" durationInFrames={7*fps} premountFor={fps}><DemoShot clip="bh-player-on" chapter="04 / 透镜影响玩家：开启" text="开启参与，让人物也进入透镜映射。" detail="保持同一机位、姿态与参数，观察身体和装备的变化。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="真实调参：透镜" durationInFrames={8*fps} premountFor={fps}><ParameterShot clip="bh-ui-lens" chapter="04 / 从效果对照到工作台操作" steps={['看完效果，实际调节透镜强度。','再调覆盖范围，两个参数分别控制。']} secondsPerStep={4} detail="接着展示这些效果的实际操作；配方可保存与导出。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="真实调参：形状" durationInFrames={12*fps} premountFor={fps}><ParameterShot clip="bh-ui-shape" chapter="05 / 实际拖动参数" steps={['改变核心半径，观察暗核大小。','调整盘面厚度，改变吸积盘体积。','修改盘面倾角，选择你想要的姿态。']} secondsPerStep={4} detail="右侧为真实 Mod 控件；左侧同步显示调节结果。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="真实调参：颜色" durationInFrames={10*fps} premountFor={fps}><ParameterShot clip="bh-ui-color" chapter="05 / 实际编辑颜色" steps={['改变内盘色，从暖橙过渡到冰蓝。','再改变外盘色，分别设计内外层次。']} secondsPerStep={5} detail="通过实际 HEX / RGB 颜色选择器修改，无需重写 shader。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="真实调参：运动" durationInFrames={12*fps} premountFor={fps}><ParameterShot clip="bh-ui-motion" chapter="05 / 运动参数独立控制" steps={['提高差速旋转，改变盘纹流动。','调节径向内流，改变吸入节奏。','调整粒子速度，强调螺旋轨迹。']} secondsPerStep={4} detail="盘面旋转、内流与独立粒子可以分别调整。" accent={accent}/></Series.Sequence>
  <Series.Sequence name="白洞完整展示" durationInFrames={8*fps} premountFor={fps}><DemoShot clip="wh-hero" chapter="06 / 也可以设计白洞" text="明亮核心、双极喷流与向外运动的粒子。" detail="白洞有自己的外观和运动参数。" accent="#A5ECFF"/></Series.Sequence>
  <Series.Sequence name="白洞核心" durationInFrames={8*fps} premountFor={fps}><DemoShot clip="wh-core" chapter="06 / 白洞核心光晕" text="增加核心光晕，扩大柔和发光范围。" detail="核心光晕的强度与半径独立于盘面材质。" accent="#A5ECFF"/></Series.Sequence>
  <Series.Sequence name="白洞双极喷流" durationInFrames={8*fps} premountFor={fps}><DemoShot clip="wh-jets" chapter="06 / 白洞双极喷流" text="打开双极喷流，逐渐提高喷流强度。" detail="长度、宽度、速度以及根部与末端色都可以设计。" accent="#A5ECFF"/></Series.Sequence>
  <Series.Sequence name="白洞外扩光壳" durationInFrames={8*fps} premountFor={fps}><DemoShot clip="wh-shell" chapter="06 / 白洞外扩光壳" text="启用外扩光壳，让能量一层层向外传播。" detail="强度、扩散速度、半径、厚度与颜色分别控制。" accent="#A5ECFF"/></Series.Sequence>
  <Series.Sequence name="白洞真实调参" durationInFrames={12*fps} premountFor={fps}><ParameterShot clip="wh-ui" chapter="07 / 白洞也能实时调参" steps={['调节白洞核心光晕。','改变双极喷流强度。','修改外扩光壳强度。']} secondsPerStep={4} detail="实际操作 Mod 控件，组合自己的白洞视觉方案。" accent="#A5ECFF"/></Series.Sequence>
  <Series.Sequence name="使用路线" durationInFrames={12*fps} premountFor={fps}><ExplainScene eyebrow="从调参到接入" title="把你的效果保存下来" lines={['安装 minecraft-black-hole Skill，使用随附工作台','导出 JSON 配方，保存自己的参数方案','Forge 1.20.1 安装演示 Mod，或参考源码接入自己的 Mod']} accent={accent} note="配方导入需使用对应接入入口；网页与游戏的背景和显示管线有差异。"/></Series.Sequence>
  <Series.Sequence name="展示收尾" durationInFrames={8*fps} premountFor={fps}><DemoShot clip="bh-finale" chapter="自定义黑洞 / 白洞" text="形态、色彩与运动，组合成你的视觉语言。" detail="F6 工作台 · F7 触发 · F8 停止 · 配方保存与复用" accent={accent}/></Series.Sequence>
  <Series.Sequence name="开源资源" durationInFrames={12*fps} premountFor={fps}><OpenSourceScene skill="minecraft-black-hole" accent={accent}/></Series.Sequence>
 </Series></AbsoluteFill>;
};
