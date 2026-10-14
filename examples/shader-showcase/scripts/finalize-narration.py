import hashlib
import json
import shutil
from datetime import datetime,timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT.parent/'exports'/'配音准备'
OUT.mkdir(parents=True,exist_ok=True)
def timestamp(s):
    ms=round(s*1000)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in Path('E:/MamboTTS/models').glob('*') if p.is_file()}
for label,kind in [('黑洞白洞','blackhole'),('闪电','lightning')]:
    for suffix in ['-曼波配音稿.json','-配音稿.txt','-纯文案.txt','-朗读字幕.srt']:
        shutil.copyfile(ROOT/'narration'/(label+suffix),OUT/(label+suffix))
    manifest=json.loads((ROOT/'narration'/'mambo'/f'{kind}-manifest.json').read_text(encoding='utf-8'))
    manifest['status']='audio-generated-and-mixed'
    manifest['modelHashes']=hashes
    manifest['generatedAt']=datetime.now(timezone.utc).isoformat()
    manifest['voiceIdentity']='MamboTTS community preset; not verified as identical to Jianying voice'
    (OUT/f'{label}-曼波配音成稿.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/f'{label}-曼波朗读字幕.srt').write_text('\n'.join(f'{c["index"]}\n{timestamp(c["start"])} --> {timestamp(c["start"]+c["duration"])}\n{c["spokenText"]}\n' for c in manifest['cues']),encoding='utf-8')
    (OUT/f'{label}-曼波最终文案.txt').write_text('\n\n'.join(c['spokenText'] for c in manifest['cues']),encoding='utf-8')
    shutil.copyfile(manifest['track'],OUT/f'{label}-曼波配音.wav')
    for base in (ROOT/'narration',OUT):
        plan_path=base/f'{label}-曼波配音稿.json'
        plan=json.loads(plan_path.read_text(encoding='utf-8'))
        plan.update(status='audio-generated-and-mixed',voiceProvider='Tsukimisaka/MamboTTS v1.2.1',speakerId='manbo_e8_s168.pth + manbo-e10.ckpt',voiceVerified=True,voiceVerification='Preset model identity confirmed; exact Jianying match not asserted',track=manifest['track'])
        plan_path.write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'{label}: {len(manifest["cues"])} voiced cues / {manifest["seconds"]} seconds')
