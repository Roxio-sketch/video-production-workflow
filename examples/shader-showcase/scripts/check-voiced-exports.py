import json
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT.parent/'exports'
FFMPEG='E:/JianyingAI/tools/ffmpeg.exe'
FFPROBE='E:/JianyingAI/tools/ffprobe.exe'
def run(args):
    p=subprocess.run(args,capture_output=True,encoding='utf-8',errors='replace')
    if p.returncode:raise RuntimeError(p.stderr[-2000:])
    return p
def video_hash(path):
    return run([FFMPEG,'-v','error','-i',str(path),'-map','0:v:0','-c:v','copy','-f','hash','-hash','sha256','pipe:1']).stdout.strip()
checks=[]
for title,kind,seconds,count in [('自定义黑洞与白洞','blackhole',246,39),('自定义闪电与雷劫','lightning',195,29)]:
    path=OUT/(title+'-曼波配音版.mp4')
    data=json.loads(run([FFPROBE,'-v','error','-show_streams','-show_format','-of','json',str(path)]).stdout)
    v=next(s for s in data['streams'] if s['codec_type']=='video')
    a=next(s for s in data['streams'] if s['codec_type']=='audio')
    assert (v['width'],v['height'],v['r_frame_rate'],v['codec_name'],v['color_space'])==(1920,1080,'30/1','h264','bt709')
    assert a['codec_name']=='aac' and a['sample_rate']=='48000' and a['channels']==2
    assert abs(float(data['format']['duration'])-seconds)<.05
    before=video_hash(OUT/(title+'-无配音版.mp4'))
    after=video_hash(path)
    assert before==after,'Video stream unexpectedly changed'
    decoded=run([FFMPEG,'-v','error','-i',str(path),'-map','0:v:0','-map','0:a:0','-f','null','NUL'])
    assert not decoded.stderr.strip(),decoded.stderr
    manifest=json.loads((ROOT/'narration'/'mambo'/(kind+'-manifest.json')).read_text(encoding='utf-8'))
    assert len(manifest['cues'])==count
    previous_end=0
    for c in manifest['cues']:
        assert c['start']>=previous_end-.01
        assert c['start']+c['duration']<=c['end']+.015
        previous_end=c['start']+c['duration']
    meter=run([FFMPEG,'-hide_banner','-nostats','-i',str(path),'-vn','-af','loudnorm=I=-16:TP=-1:LRA=7:print_format=json','-f','null','NUL']).stderr
    levels=json.loads(meter[meter.rfind('{'):meter.rfind('}')+1])
    checks.append(dict(file=str(path),seconds=float(data['format']['duration']),width=v['width'],height=v['height'],fps=v['r_frame_rate'],audio=a['codec_name'],sampleRate=a['sample_rate'],channels=a['channels'],videoBitstreamUnchanged=True,videoSHA256=after,fullDecode='passed',cueCount=count,timing='passed',loudness=levels))
    print(json.dumps(checks[-1],ensure_ascii=False),flush=True)
(OUT/'曼波配音成片检查.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
