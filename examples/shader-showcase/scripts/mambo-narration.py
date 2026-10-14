"""Generate chapter-aligned narration through the local MamboTTS engine.

All speech requests go to localhost. Keep raw files, timing, model identity and
the lossless narration track so the edit remains reproducible.
"""
import argparse
import hashlib
import json
import math
import re
import subprocess
import time
import wave
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'narration' / 'mambo'
OUT.mkdir(parents=True, exist_ok=True)
FFMPEG = 'E:/JianyingAI/tools/ffmpeg.exe'
FFPROBE = 'E:/JianyingAI/tools/ffprobe.exe'
SESSION = requests.Session()
SESSION.trust_env = False
ENGINE = 'http://127.0.0.1:9880'
REF = 'E:/MamboTTS/models/refer.wav'
REF_TEXT = '大家好，欢迎来到我的频道，今天给大家分享一个有趣的内容'
FILES = [('黑洞白洞', 'blackhole', '自定义黑洞与白洞'), ('闪电', 'lightning', '自定义闪电与雷劫')]

def run(args):
    p = subprocess.run(args, capture_output=True, encoding='utf-8', errors='replace')
    if p.returncode:
        raise RuntimeError(p.stderr[-3000:])
    return p

def duration(path):
    return float(run([FFPROBE, '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', str(path)]).stdout)

def spoken_text(text):
    alternatives={
        '先给它一组暖色：金色内盘，橙色外盘。':'金色内盘，橙色外盘。先看一组暖色。',
        '层叠光带：突出环带与发光层次。':'多层光带，突出环带与发光层次。',
        '体积尘埃：云雾与细丝构成不同的层次。':'尘埃盘面，云雾和细丝构成不同层次。',
        '冰蓝色：同一盘面，换成冷色层次。':'同样的盘面，换成冰蓝色。',
        '旋转和径向内流，分别调整。':'旋转速度和向内流动的速度，都可以单独调节。',
        '扩大范围，让更宽的真实场景参与扭曲。':'扩大透镜的范围，让周围更多的场景被扭曲。',
        '背景可以扭曲，同时保持人物完整。':'玩家保持完整。背景继续扭曲。',
        '开启参与，让人物也进入透镜映射。':'让人物也参与背景扭曲，身体和装备一起变化。',
        '改变透镜范围，观察背景网格。':'调节透镜的范围，观察周围的网格。',
        '增加核心光晕，扩大柔和发光范围。':'增强核心的光晕，让发光范围更大。',
        '改变双极喷流强度。':'调节上下喷流的强度。',
        '改变内盘色，从暖橙过渡到冰蓝。':'把内盘的橙色，改成冰蓝色。',
        '再改变外盘色，分别设计内外层次。':'接着修改外盘的颜色。',
        '调节白洞核心光晕。':'调节白洞核心的发光效果。',
        '同一配方、端点和 种子，复现同一拓扑。':'配方、起点、终点和种子不变，雷电形状也不变。',
        '渐变起始色占比，从 0% 调到 100%。':'改变两种颜色的比例。从百分之零，调到百分之百。',
        '把起始色占比从 0% 调到 100%。':'把第一种颜色的比例，从百分之零，调到百分之百。',
        '129 格落雷，高密度分叉与多次回击。':'一百二十九格的长距离落雷，多次回击，配合密集分叉。',
        '改变分叉深度，丰富拓扑。':'增加分叉的层数，让雷电形状更丰富。',
        '扩大落雷散布范围。':'扩大落雷的范围。',
    }
    text=alternatives.get(text,text)
    return text.replace('100%', '百分之百').replace('0%', '百分之零').replace('129', '一百二十九').replace(' 种子', '种子')

def synth(text, path, speed=1.0):
    params = dict(text=text, text_language='zh', speed=speed, cut_punc='。？！；', top_k=20, top_p=0.8, temperature=0.8,
                  refer_wav_path=REF, prompt_text=REF_TEXT, prompt_language='zh')
    response = SESSION.post(ENGINE+'/', json=params, timeout=(10, 600))
    response.raise_for_status()
    if response.content[:4] != b'RIFF' or response.content[8:12] != b'WAVE':
        raise RuntimeError('Engine returned non-WAV: '+response.text[:300])
    path.write_bytes(response.content)
    if duration(path) < .3:
        raise RuntimeError('Unexpectedly short speech')

def trim(raw, trimmed):
    filter_ = ('silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB:start_silence=0.05,'
               'areverse,silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB:start_silence=0.05,areverse')
    run([FFMPEG,'-hide_banner','-v','error','-i',str(raw),'-af',filter_,'-ar','48000','-ac','1','-c:a','pcm_s16le','-y',str(trimmed)])

def normalize(trimmed, ready, tempo):
    base = f'atempo={tempo:.8f},loudnorm=I=-16:TP=-1.5:LRA=7'
    analysis = run([FFMPEG,'-hide_banner','-nostats','-i',str(trimmed),'-af',base+':print_format=json','-f','null','NUL']).stderr
    stats = json.loads(analysis[analysis.rfind('{'):analysis.rfind('}')+1])
    if not all(math.isfinite(float(stats[k])) for k in ('input_i','input_tp','input_lra','input_thresh','target_offset')):
        raise RuntimeError('Silent or invalid narration: '+str(trimmed))
    filt = (f'atempo={tempo:.8f},loudnorm=I=-16:TP=-1.5:LRA=7:'
            f'measured_I={stats["input_i"]}:measured_TP={stats["input_tp"]}:'
            f'measured_LRA={stats["input_lra"]}:measured_thresh={stats["input_thresh"]}:'
            f'offset={stats["target_offset"]}:linear=true,afade=t=in:st=0:d=0.008')
    run([FFMPEG,'-hide_banner','-v','error','-i',str(trimmed),'-af',filt,'-ar','48000','-ac','1','-c:a','pcm_s16le','-y',str(ready)])
    return stats

def generate():
    SESSION.get(ENGINE+'/control', timeout=3).raise_for_status()
    for label, kind, _ in FILES:
        plan = json.loads((ROOT/'narration'/f'{label}-曼波配音稿.json').read_text(encoding='utf-8'))
        directory = OUT/kind
        directory.mkdir(exist_ok=True)
        manifest = dict(provider='Tsukimisaka/MamboTTS', version='1.2.1',
                        model='manbo_e8_s168.pth + manbo-e10.ckpt', revision='connected-narration-v2',
                        sampling=dict(top_k=20,top_p=.8,temperature=.8), seconds=plan['seconds'], cues=[])
        for cue in plan['cues']:
            start=time.monotonic()
            text=spoken_text(cue['text'])
            available=cue['end']-cue['start']
            stem=f'{cue["index"]:02d}'
            raw, trimmed, ready=[directory/(stem+ext) for ext in ('-raw.wav','-trim.wav','.wav')]
            key=hashlib.sha256((text+'|mambo-v1.2.1|k20p0.8t0.8').encode()).hexdigest()
            cache=directory/(stem+'.json')
            cached=json.loads(cache.read_text(encoding='utf-8')) if cache.exists() else {}
            if cached.get('key')==key and ready.exists() and duration(ready)<=available+.015:
                # A reordered shot keeps its speech but receives its new timing.
                manifest['cues'].append({**cached,**cue})
                print(f'{kind} {stem}: reused', flush=True)
                continue
            synth(text,raw)
            trim(raw,trimmed)
            native_speed=1.0
            length=duration(trimmed)
            tempo=max(1.0,length/(available-.04))
            if tempo>1.10:
                raise RuntimeError(f'{kind} {stem}: shorten this sentence; required tempo {tempo:.2f}, raw duration {length:.2f}s, window {available:.2f}s')
            stats=normalize(trimmed,ready,tempo)
            final_duration=duration(ready)
            if final_duration>available+.015:
                raise RuntimeError(f'{kind} {stem}: narration overruns chapter')
            item={**cue,'spokenText':text,'key':key,'file':str(ready),'duration':final_duration,
                  'nativeSpeed':native_speed,'tempo':tempo,'sourceLoudness':stats}
            cache.write_text(json.dumps(item,ensure_ascii=False,indent=2),encoding='utf-8')
            manifest['cues'].append(item)
            print(f'{kind} {stem}/{len(plan["cues"])}: {final_duration:.2f}s in {available:.2f}s; synthesis {time.monotonic()-start:.1f}s',flush=True)
        track=bytearray(round(plan['seconds']*48000)*2)
        for cue in manifest['cues']:
            with wave.open(cue['file'],'rb') as wav:
                assert (wav.getframerate(),wav.getnchannels(),wav.getsampwidth())==(48000,1,2)
                audio=wav.readframes(wav.getnframes())
            offset=round(cue['start']*48000)*2
            track[offset:offset+len(audio)]=audio
        output=ROOT/'public'/'audio'/f'{kind}-mambo-narration.wav'
        with wave.open(str(output),'wb') as wav:
            wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(48000);wav.writeframes(track)
        manifest['track']=str(output)
        (OUT/f'{kind}-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
        print('Completed '+str(output),flush=True)

def mix(preview_only=False):
    for label,kind,title in FILES:
        manifest=json.loads((OUT/f'{kind}-manifest.json').read_text(encoding='utf-8'))
        voice=manifest['track']
        music=ROOT/'public'/'audio'/f'{kind}-bgm.m4a'
        seconds=manifest['seconds']
        trim_before=8 if kind=='blackhole' else 32
        # The original BGM is replaced, allowing speech-dependent ducking.
        # Copy the verified video stream without another lossy video encode.
        filt=(f'[1:a]aresample=48000,pan=stereo|c0=c0|c1=c0,volume=0.707107,asplit=2[voice][side];'
              f'[2:a]atrim=start={trim_before}:duration={seconds},asetpts=PTS-STARTPTS,'
              f'aresample=48000,volume=0.22,afade=t=in:d=2,afade=t=out:st={seconds-4}:d=4[music];'
              '[music][side]sidechaincompress=threshold=0.025:ratio=5:attack=15:release=450:knee=2:makeup=1[ducked];'
              '[voice][ducked]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.891251:level=false:latency=true[mixed]')
        target=(ROOT/'public'/'audio'/f'{kind}-mambo-flow-v2.m4a') if preview_only else (ROOT.parent/'exports'/f'{title}-曼波配音版.mp4')
        command=[FFMPEG,'-hide_banner','-v','error','-i',str(ROOT.parent/'exports'/f'{title}-无配音版.mp4'),
             '-i',voice,'-i',str(music),'-filter_complex',filt]
        if not preview_only:command+=['-map','0:v:0','-c:v','copy']
        run(command+['-map','[mixed]','-c:a','aac','-b:a','320k','-ar','48000','-ac','2','-t',str(seconds),
             '-movflags','+faststart','-metadata','comment=MamboTTS v1.2.1 local narration; video stream copied from verified Remotion export',
             '-y',str(target)])
        print('Mixed '+str(target),flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('action',choices=['sample','generate','mix','preview'])
    args=parser.parse_args()
    if args.action=='sample':
        synth('世界中的黑洞，可以按自己的想法调整。开启引力透镜，让人物和场景一起参与扭曲。', OUT/'试听-黑洞与透镜.wav')
        print(OUT/'试听-黑洞与透镜.wav')
    elif args.action=='generate':generate()
    else:mix(preview_only=args.action=='preview')
