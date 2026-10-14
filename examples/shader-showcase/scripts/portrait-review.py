import json
import math
import subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
EXPORT=ROOT.parent/'exports'/'抖音竖版'
QA=ROOT.parent/'maintenance'/'portrait-qa'
QA.mkdir(parents=True,exist_ok=True)
plan=json.loads((ROOT/'src/portrait-plan.json').read_text(encoding='utf-8'))
for kind,label in [('blackhole','自定义黑洞与白洞'),('lightning','自定义闪电与雷劫')]:
 source=EXPORT/f'{label}-抖音竖版.mp4'
 if not source.exists():continue
 times=[]
 for c in plan[kind]['cues']:
  times.append(c['start']+.23)
  if c['mode']=='ui':times.append(c['start']+min(5,c['seconds']-.3))
  if c['mode']=='variants':
   for i in range(1,len(c['clips'])):times.append(c['start']+i*c['seconds']/len(c['clips'])+.23)
 frames=[round(t*30) for t in times]
 select='+'.join(f'eq(n,{f})' for f in frames)
 output=QA/f'{kind}-chapters.jpg'
 result=subprocess.run(['E:/JianyingAI/tools/ffmpeg.exe','-v','error','-i',str(source),'-vf',f"select='{select}',scale=270:480,tile=4x{math.ceil(len(frames)/4)}:nb_frames={len(frames)}:padding=4:margin=4",'-frames:v','1','-q:v','2','-y',str(output)],capture_output=True)
 if result.returncode:raise RuntimeError(result.stderr.decode(errors='replace'))
 (QA/f'{kind}-review-times.json').write_text(json.dumps(times),encoding='utf-8')
 print(output,flush=True)
