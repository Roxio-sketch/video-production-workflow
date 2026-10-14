"""Independent ASR of final portrait narration, one cue at a time."""
import difflib
import json
import re
import subprocess
import numpy as np
import argparse
from pathlib import Path
from faster_whisper import WhisperModel

ROOT=Path(__file__).resolve().parents[1]
plan=json.loads((ROOT/'src/portrait-plan.json').read_text(encoding='utf-8'))
parser=argparse.ArgumentParser()
parser.add_argument('--model',choices=['small','turbo'],default='small')
parser.add_argument('--cue')
parser.add_argument('--pitch-factor',type=float,default=1)
args=parser.parse_args()
model=WhisperModel('E:/MamboTTS-setup/asr-'+args.model,device='cpu',compute_type='int8',cpu_threads=6,num_workers=1)
out=ROOT.parent/'exports'/'抖音竖版'/('配音识别检查.json' if not args.cue else '配音识别复核.json')
rows=[]
def clean(text):return re.sub(r'[^\u4e00-\u9fffa-zA-Z0-9]','',text)
for kind,data in plan.items():
 for cue in data['cues']:
  if args.cue and args.cue!=f'{kind}:{cue["index"]}':continue
  command=['E:/JianyingAI/tools/ffmpeg.exe','-v','error','-i',cue['voice']]
  if args.pitch_factor!=1:command+=['-af',f'asetrate={48000*args.pitch_factor},aresample=16000']
  decoded=subprocess.run(command+['-f','f32le','-ar','16000','-ac','1','pipe:1'],capture_output=True,check=True).stdout
  audio=np.frombuffer(decoded,dtype=np.float32)
  segments,_=model.transcribe(audio,language='zh',beam_size=3,condition_on_previous_text=False,vad_filter=False,initial_prompt='黑洞、白洞、模组、透镜、盘面、雷劫、分叉、光晕、配方、技能。')
  recognized=''.join(s.text for s in segments)
  similarity=difflib.SequenceMatcher(None,clean(cue['text']),clean(recognized)).ratio()
  rows.append({'kind':kind,'index':cue['index'],'expected':cue['text'],'recognized':recognized,'similarity':similarity,'reviewNeeded':similarity<.65})
  out.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
  print(f'{kind} {cue["index"]}: {similarity:.2f} {recognized}',flush=True)
print('Speech recognition complete.',flush=True)
