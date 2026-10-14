import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const exportsDir='E:/视频/exports';
const ffprobe='E:/JianyingAI/tools/ffprobe.exe';
const ffmpeg='E:/JianyingAI/tools/ffmpeg.exe';
const report=[];
const only=process.argv.find(a=>a.startsWith('--kind='))?.split('=')[1];
if(only&&!['blackhole','lightning'].includes(only))throw new Error('Invalid --kind');
for(const [source,file,seconds,prefix] of [
 ['BlackHoleVideo.tsx','自定义黑洞与白洞-无配音版.mp4',246,'blackhole'],
 ['LightningVideo.tsx','自定义闪电与雷劫-无配音版.mp4',195,'lightning'],
]) {
 if(only&&only!==prefix)continue;
 const video=path.join(exportsDir,file);
 const probe=spawnSync(ffprobe,['-v','error','-show_streams','-show_format','-of','json',video],{encoding:'utf8'});
 if(probe.status!==0)throw new Error(probe.stderr);
 const data=JSON.parse(probe.stdout);
 const v=data.streams.find(s=>s.codec_type==='video');
 const a=data.streams.find(s=>s.codec_type==='audio');
 if(v.width!==1920||v.height!==1080||v.r_frame_rate!=='30/1'||v.codec_name!=='h264'||v.pix_fmt!=='yuv420p'||v.color_space!=='bt709'||!a||a.codec_name!=='aac'||Math.abs(Number(data.format.duration)-seconds)>.05)throw new Error(`${file}: unexpected format`);
 const decode=spawnSync(ffmpeg,['-hide_banner','-v','error','-i',video,'-map','0:v:0','-map','0:a:0','-f','null','NUL'],{encoding:'utf8'});
 fs.writeFileSync(path.join('logs',`decode-${prefix}-final.log`),decode.stderr??'');
 if(decode.status!==0||decode.stderr.trim())throw new Error(`${file}: decode failed ${decode.stderr}`);
 let offset=0;
 const chapters=[];
 const code=fs.readFileSync(path.join('src',source),'utf8');
 for(const m of code.matchAll(/<Series.Sequence\s+name="([^"]+)"\s+durationInFrames=\{(\d+)\*fps\}[^>]*>([\s\S]*?)<\/Series.Sequence>/g)) {
  const duration=Number(m[2]);
  const clip=m[3].match(/clip="([^"]+)"/);
  chapters.push({name:m[1],start:offset,duration,clip:clip?.[1]??null,frame:Math.round((offset+Math.min(2,duration/2))*30)});
  offset+=duration;
 }
 if(offset!==seconds)throw new Error(`${source}: chapter parse failed`);
 const sheets=[];
 for(let i=0;i<chapters.length;i+=12) {
  const group=chapters.slice(i,i+12);
  const select=group.map(c=>`eq(n,${c.frame})`).join('+');
  const sheet=path.join(exportsDir,`${prefix}-final-review-${i/12+1}.jpg`);
  const result=spawnSync(ffmpeg,['-hide_banner','-v','error','-i',video,'-vf',`select='${select}',scale=480:270,tile=4x${Math.ceil(group.length/4)}:nb_frames=${group.length}:padding=4:margin=4:color=gray`,'-frames:v','1','-q:v','2','-y',sheet],{encoding:'utf8'});
  if(result.status!==0)throw new Error(result.stderr);
  sheets.push(sheet);
 }
 report.push({file:video,duration:Number(data.format.duration),bytes:Number(data.format.size),width:v.width,height:v.height,fps:v.r_frame_rate,codec:v.codec_name,colorSpace:v.color_space,audio:a.codec_name,fullDecode:'passed',chapters,sheets});
}
const previous=only?JSON.parse(fs.readFileSync(path.join(exportsDir,'成片检查.json'),'utf8')).videos:[];
const videos=[...previous.filter(v=>!report.some(n=>n.file===v.file)),...report];
fs.writeFileSync(path.join(exportsDir,'成片检查.json'),JSON.stringify({checkedAt:new Date().toISOString(),voiceover:'These are instrumental exports; narrated exports have a separate verification report.',videos},null,2));
console.log(JSON.stringify(report.map(({chapters,sheets,...summary})=>({...summary,chapters:chapters.length,sheets})),null,2));
