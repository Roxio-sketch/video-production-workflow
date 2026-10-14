"""Independent local speech recognition to flag missing/repeated narration."""
import argparse
import difflib
import json
import os
import re
import subprocess
import sys
import wave
from pathlib import Path
import numpy as np
from faster_whisper import WhisperModel

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'narration'/'mambo'
parser=argparse.ArgumentParser()
parser.add_argument('action',choices=['sample','all'])
parser.add_argument('--model',choices=['small','turbo'],default='small')
parser.add_argument('--device',choices=['cpu','cuda'],default='cpu')
parser.add_argument('--cue',help='Optional single cue, e.g. lightning:19')
parser.add_argument('--kind',choices=['blackhole','lightning'],help='Limit verification to a completed narration track')
parser.add_argument('--pitch-factor',type=float,default=1.0)
args=parser.parse_args()
_dll_handles=[]
if args.device=='cuda':
    for dll in (Path(sys.prefix)/'Lib'/'site-packages'/'nvidia').rglob('*.dll'):
        directory=str(dll.parent)
        if directory not in os.environ['PATH'].split(os.pathsep):
            _dll_handles.append(os.add_dll_directory(directory))
            os.environ['PATH']=directory+os.pathsep+os.environ['PATH']
model=WhisperModel('E:/MamboTTS-setup/asr-'+args.model,device=args.device,
                   compute_type='float16' if args.device=='cuda' else 'int8',cpu_threads=8,num_workers=1)
def text_of(path):
    command=['E:/JianyingAI/tools/ffmpeg.exe','-v','error','-i',str(path)]
    if args.pitch_factor!=1:
        with wave.open(str(path),'rb') as wav:rate=wav.getframerate()
        command+=['-af',f'asetrate={rate*args.pitch_factor},aresample=16000']
    decoded=subprocess.run(command+['-f','f32le','-ar','16000','-ac','1','pipe:1'],capture_output=True,check=True).stdout
    audio=np.frombuffer(decoded,dtype=np.float32)
    segments,_=model.transcribe(audio,language='zh',beam_size=3,condition_on_previous_text=False,vad_filter=False,
                               initial_prompt='黑洞、白洞、引力透镜、粒子、吸积盘、雷劫、分叉、光晕、喷流、模组。')
    return ''.join(segment.text for segment in segments)
def clean(text):
    text=text.replace('百分之零','0').replace('百分之百','100').replace('一百二十九','129')
    return re.sub(r'[^\u4e00-\u9fffa-zA-Z0-9]','',text)
if args.action=='sample':
    print(text_of(OUT/'试听-黑洞与透镜.wav'),flush=True)
else:
    for kind in ('blackhole','lightning'):
        if args.kind and args.kind!=kind:continue
        if args.cue and args.cue.split(':')[0]!=kind:continue
        manifest=json.loads((OUT/f'{kind}-manifest.json').read_text(encoding='utf-8'))
        suffix=f'-pitch{args.pitch_factor}' if args.pitch_factor!=1 else ''
        if args.cue:suffix+=f'-cue{args.cue.split(":")[1]}'
        check_file=OUT/f'{kind}-speech-check-{args.model}{suffix}.json'
        previous={c['index']:c for c in json.loads(check_file.read_text(encoding='utf-8'))} if check_file.exists() else {}
        checked_at=check_file.stat().st_mtime if check_file.exists() else 0
        checks=[]
        for cue in manifest['cues']:
            if args.cue and int(args.cue.split(':')[1])!=cue['index']:continue
            cached=previous.get(cue['index'])
            if cached and cached['expected']==cue['spokenText'] and Path(cue['file']).stat().st_mtime<=checked_at:
                checks.append(cached)
                print(f'{kind} {cue["index"]:02d}: recognition reused',flush=True)
                continue
            recognized=text_of(cue['file'])
            expected=cue['spokenText']
            ratio=difflib.SequenceMatcher(None,clean(expected),clean(recognized)).ratio()
            item=dict(index=cue['index'],chapter=cue['chapter'],expected=expected,recognized=recognized,similarity=ratio,reviewNeeded=ratio<.65)
            checks.append(item)
            print(f'{kind} {cue["index"]:02d} similarity={ratio:.2f}: {recognized}',flush=True)
        check_file.write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
