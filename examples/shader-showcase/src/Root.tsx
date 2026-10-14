import {Composition,Folder} from 'remotion';
import {BlackHoleVideo} from './BlackHoleVideo';
import {LightningVideo} from './LightningVideo';
import {DemoShot} from './DemoShot';
import {ExplainScene} from './ExplainScene';
import {Cover} from './Cover';
import {PortraitVideo,PortraitCover} from './PortraitVideo';
import portraitPlan from './portrait-plan.json';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="CustomBlackHole" component={BlackHoleVideo} durationInFrames={7380} fps={30} width={1920} height={1080} defaultProps={{narration:true}}/>
      <Composition id="CustomLightning" component={LightningVideo} durationInFrames={5850} fps={30} width={1920} height={1080} defaultProps={{narration:true}}/>
      <Composition id="BlackHoleCover" component={Cover} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{kind:'blackhole' as const}}/>
      <Composition id="LightningCover" component={Cover} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{kind:'lightning' as const}}/>
      <Composition id="DouyinBlackHole" component={PortraitVideo} durationInFrames={portraitPlan.blackhole.frames} fps={30} width={1080} height={1920} defaultProps={{kind:'blackhole' as const,narration:true}}/>
      <Composition id="DouyinLightning" component={PortraitVideo} durationInFrames={portraitPlan.lightning.frames} fps={30} width={1080} height={1920} defaultProps={{kind:'lightning' as const,narration:true}}/>
      <Composition id="DouyinBlackHoleCover" component={PortraitCover} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{kind:'blackhole' as const}}/>
      <Composition id="DouyinLightningCover" component={PortraitCover} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{kind:'lightning' as const}}/>
      <Folder name="可编辑场景">
        <Composition id="DemoShot" component={DemoShot} durationInFrames={180} fps={30} width={1920} height={1080} defaultProps={{clip:'bh-hero',chapter:'实机演示',text:'自定义黑洞',accent:'#FFBC67'}}/>
        <Composition id="ExplainScene" component={ExplainScene} durationInFrames={270} fps={30} width={1920} height={1080} defaultProps={{eyebrow:'参数与配方',title:'从想法到实机效果',lines:['描述视觉需求','调整参数与检查结果','保存配方并接入 Forge'],accent:'#83D8FF'}}/>
      </Folder>
    </>
  );
};
