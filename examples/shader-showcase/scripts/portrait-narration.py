"""Prepare independent, natural-speed Mambo narration for portrait summaries."""
import hashlib
import json
import math
import subprocess
import wave
from pathlib import Path
import numpy as np
import requests

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'narration'/'portrait'
EXPORT=ROOT.parent/'exports'/'抖音竖版'
FFMPEG='E:/JianyingAI/tools/ffmpeg.exe'
FFPROBE='E:/JianyingAI/tools/ffprobe.exe'
SESSION=requests.Session()
SESSION.trust_env=False

PLANS={
 'blackhole':[
  dict(chapter='我用GPT制作并开源',text='这款黑洞模组，是我用人工智能制作并开源的。黑洞和白洞，都能自定义。',clips=['bh-hero'],mode='hero',minimum=8),
  dict(chapter='同一个黑洞，多种盘面',text='先看盘面。光带、颗粒和体积尘埃，可以换成完全不同的风格。',clips=['bh-ribbons','bh-granular','bh-dust'],mode='variants',minimum=9),
  dict(chapter='配色也由你决定',text='形态确定以后，再换一组配色。内盘和外缘，可以分别设计。',clips=['bh-color-gold','bh-color-ice','bh-color-violet'],mode='variants',minimum=7),
  dict(chapter='真实拖动参数',text='这些变化不是后期做的。在模组里拖动参数，暗核大小和盘面厚度会同步改变。',clips=['bh-ui-shape'],mode='ui',minimum=9),
  dict(chapter='透镜开关，同机位对照',text='再看引力透镜。开启以后，真实背景会发生扭曲。',clips=['bh-lens-off','bh-lens-on'],labels=['透镜关闭','透镜开启'],mode='compare',minimum=6),
  dict(chapter='范围大小，单独控制',text='范围可以单独调节，从只影响附近，到覆盖更宽的场景。',clips=['bh-lens-small','bh-lens-large'],labels=['范围 3','范围 12'],mode='compare',minimum=6),
  dict(chapter='人物是否参与，也能选',text='人物是否跟着扭曲，也有独立开关。你可以按想要的画面来选择。',clips=['bh-player-off','bh-player-on'],labels=['人物不参与','人物参与'],mode='compare',minimum=7),
  dict(chapter='白洞也有自己的形态',text='白洞同样能设计。明亮核心、双极喷流，还有一层层向外传播的光壳。',clips=['wh-hero','wh-jets','wh-shell'],mode='variants',minimum=10),
  dict(chapter='开源 Mod · Skill · 源码',text='想做自己的版本，可以用配套技能整理需求，再到工作台细调。模组、技能和源码都已开源。',clips=['bh-finale'],mode='outro',minimum=10),
 ],
 'lightning':[
  dict(chapter='我用GPT制作并开源',text='这组雷劫，用的是我制作并开源的闪电模组。形状、颜色和落雷布局，都能自定义。',clips=['lt-wuxing-vivid'],mode='hero',minimum=9),
  dict(chapter='先设计落雷的形状',text='先从一道落雷开始。换一个种子，主干和分叉，就能形成另一种形状。',clips=['lt-seed-a','lt-seed-b'],labels=['种子 18234','种子 9417'],mode='compare',minimum=7),
  dict(chapter='实际修改分叉参数',text='接着实际调参数。分叉概率、层数和预算，分别控制它的复杂程度。',clips=['lt-ui-branch'],mode='ui',minimum=8),
  dict(chapter='颜色与光晕分别调',text='形状确定以后，再改配色。渐变比例和光晕亮度，也可以分别调整。',clips=['lt-ui-gradient'],mode='ui',minimum=8),
  dict(chapter='群雷与击地放电',text='把多道雷集中起来，命中后继续播放地面电弧和火花，就能组合出雷劫效果。',clips=['lt-cluster','lt-impact'],mode='variants',minimum=8),
  dict(chapter='数量、范围与半径',text='想覆盖更大的区域，还能修改落雷数量、散布范围，以及击地放电的半径。',clips=['lt-ui-layout'],mode='ui',minimum=8),
  dict(chapter='五行仙途雷劫配方起点',text='这段以五行仙途的高阶雷劫配方为起点，调整了线宽、亮度与配色。',clips=['lt-wuxing-vivid'],mode='hero',minimum=7),
  dict(chapter='开源 Mod · Skill · 源码',text='配套技能可以把你的想法整理成配方，再到工作台细调。模组、技能和源码都已开源。',clips=['lt-wuxing-vivid'],mode='outro',minimum=10),
 ]}

def run(args):
 p=subprocess.run(args,capture_output=True,encoding='utf-8',errors='replace')
 if p.returncode:raise RuntimeError(p.stderr[-4000:])
 return p

def duration(file):
 return float(run([FFPROBE,'-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(file)]).stdout)

def main():
 OUT.mkdir(parents=True,exist_ok=True)
 EXPORT.mkdir(parents=True,exist_ok=True)
 final={}
 for kind,cues in PLANS.items():
  directory=OUT/kind
  directory.mkdir(exist_ok=True)
  offset=0
  rows=[]
  for index,cue in enumerate(cues):
   raw=directory/f'{index:02d}-raw.wav'
   trimmed=directory/f'{index:02d}-trim.wav'
   ready=directory/f'{index:02d}.wav'
   cache=directory/f'{index:02d}.json'
   key=hashlib.sha256(cue['text'].encode()).hexdigest()
   old=json.loads(cache.read_text(encoding='utf-8')) if cache.exists() else {}
   if old.get('key')!=key or not ready.exists():
    r=SESSION.post('http://127.0.0.1:9880/',json=dict(text=cue['text'],text_language='zh',speed=1.0,cut_punc='。？！；',top_k=20,top_p=.8,temperature=.8,refer_wav_path='E:/MamboTTS/models/refer.wav',prompt_text='大家好，欢迎来到我的频道，今天给大家分享一个有趣的内容',prompt_language='zh'),timeout=(10,600))
    r.raise_for_status()
    if r.content[:4]!=b'RIFF':raise RuntimeError('TTS did not return WAV')
    raw.write_bytes(r.content)
    run([FFMPEG,'-v','error','-i',str(raw),'-af','silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB:start_silence=0.05,areverse','-ar','48000','-ac','1','-y',str(trimmed)])
    run([FFMPEG,'-v','error','-i',str(trimmed),'-af','loudnorm=I=-16:TP=-1.5:LRA=7','-ar','48000','-ac','1','-c:a','pcm_s16le','-y',str(ready)])
    cache.write_text(json.dumps({'key':key,'text':cue['text']},ensure_ascii=False),encoding='utf-8')
   length=duration(ready)
   seconds=math.ceil(max(cue['minimum'],length+.9)*30)/30
   row={**cue,'index':index,'start':offset,'seconds':seconds,'frames':round(seconds*30),'voiceDuration':length,'voice':str(ready),'source':'MamboTTS 1.2.1 community preset; native speed; no pitch shift'}
   rows.append(row)
   offset+=seconds
   print(f'{kind} cue {index}: speech={length:.2f}s scene={seconds:.2f}s',flush=True)
  count=round(offset*48000)
  speech=np.zeros(count,dtype=np.int16)
  for row in rows:
   with wave.open(row['voice'],'rb') as source:audio=np.frombuffer(source.readframes(source.getnframes()),dtype=np.int16)
   start=round((row['start']+.18)*48000)
   speech[start:start+len(audio)]=audio
  wav=EXPORT/f'{kind}-竖版配音.wav'
  with wave.open(str(wav),'wb') as output:
   output.setnchannels(1);output.setsampwidth(2);output.setframerate(48000);output.writeframes(speech.tobytes())
  mixed=ROOT/'public'/'audio'/f'{kind}-portrait.m4a'
  fade=max(0,offset-2)
  filt=f'[0:a]asplit=2[voice][duck];[1:a]volume=0.22,afade=t=in:d=1,afade=t=out:st={fade}:d=2[music];[music][duck]sidechaincompress=threshold=0.035:ratio=8:attack=30:release=350[bed];[voice][bed]amix=inputs=2:normalize=0,alimiter=limit=0.94[a]'
  run([FFMPEG,'-v','error','-i',str(wav),'-i',str(ROOT/'public'/'audio'/f'{kind}-bgm.m4a'),'-filter_complex',filt,'-map','[a]','-t',str(offset),'-ar','48000','-ac','2','-c:a','aac','-b:a','320k','-y',str(mixed)])
  final[kind]={'seconds':offset,'frames':round(offset*30),'cues':rows}
  (EXPORT/f'{kind}-竖版文案.txt').write_text('\n\n'.join(c['text'] for c in rows),encoding='utf-8')
 (ROOT/'src'/'portrait-plan.json').write_text(json.dumps(final,ensure_ascii=False,indent=2),encoding='utf-8')
 (EXPORT/'配音与镜头记录.json').write_text(json.dumps(final,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({k:v['seconds'] for k,v in final.items()}),flush=True)

if __name__=='__main__':main()
