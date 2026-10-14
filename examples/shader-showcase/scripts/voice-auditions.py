"""Generate matching regular Mandarin voice auditions, without pitch effects."""
import asyncio
import json
from pathlib import Path
import edge_tts

OUT=Path(__file__).resolve().parents[2]/'exports'/'配音试听'
OUT.mkdir(parents=True,exist_ok=True)
TEXT='黑洞的样子调好了，再看看它怎样影响周围的世界。把透镜范围拉大，更多场景就会跟着弯曲。人物也可以自己选择：保持完整，或者让身体和装备一起参与扭曲。'

async def main():
    for voice,label in [('zh-CN-YunxiNeural','普通男声-云希'),('zh-CN-XiaoxiaoNeural','普通女声-晓晓')]:
        output=OUT/(label+'.mp3')
        await edge_tts.Communicate(TEXT,voice,rate='+0%',pitch='+0Hz').save(str(output))
        print(output,flush=True)
    (OUT/'试听说明.json').write_text(json.dumps(dict(text=TEXT,provider='Microsoft Edge online TTS via edge-tts',rate='+0%',pitch='+0Hz',voices=['zh-CN-YunxiNeural','zh-CN-XiaoxiaoNeural']),ensure_ascii=False,indent=2),encoding='utf-8')

asyncio.run(main())
