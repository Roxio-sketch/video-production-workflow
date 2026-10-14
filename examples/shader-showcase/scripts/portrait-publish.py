"""Write copy-ready portrait titles, descriptions, and editable cue subtitles."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT.parent/'exports'/'抖音竖版'
plan=json.loads((ROOT/'src/portrait-plan.json').read_text(encoding='utf-8'))
def stamp(seconds):
 millis=round(seconds*1000)
 return f'{millis//3600000:02d}:{millis//60000%60:02d}:{millis//1000%60:02d},{millis%1000:03d}'
for kind,label,description,track,slug in [
 ('blackhole','黑洞白洞','盘面、配色、厚度、透镜范围与人物参与，都能调整；白洞也有核心、喷流和外扩光壳。演示Mod、Skill、工作台和源码已开源。','The Spaces Between','the-spaces-between'),
 ('lightning','闪电雷劫','分叉、渐变、落雷数量、散布范围与击地放电，都能独立调整。以五行仙途高阶雷劫配方为展示起点；演示Mod、Skill、工作台和源码已开源。','Helios','helios')]:
 old=(ROOT.parent/'exports'/f'{label}-标题与简介.txt').read_text(encoding='utf-8')
 title=old.splitlines()[1]
 text=f'标题\n{title}\n\n简介\n{description}\n\n项目与源码：https://github.com/Roxio-sketch/minecraft-agent-skills\n下载：https://github.com/Roxio-sketch/minecraft-agent-skills/releases/tag/vfx-workbench-0.1.0-20261010\n\n配乐：\'{track}\' by Scott Buckley — released under CC-BY 4.0.\nwww.scottbuckley.com.au\n曲目：https://www.scottbuckley.com.au/library/{slug}/\n许可：https://creativecommons.org/licenses/by/4.0/\n本视频对配乐进行了截取、音量调整、旁白期间压低和淡入淡出。\n\n配音：MamboTTS社区预设生成的AI配音。\n'
 (OUT/f'{label}-标题与简介.txt').write_text(text,encoding='utf-8')
 blocks=[]
 for index,cue in enumerate(plan[kind]['cues']):
  start=cue['start']+.18
  blocks.append(f'{index+1}\n{stamp(start)} --> {stamp(start+cue["voiceDuration"])}\n{cue["text"]}\n')
 (OUT/f'{label}-竖版旁白.srt').write_text('\n'.join(blocks),encoding='utf-8')
 print(label, 'publish files written')
