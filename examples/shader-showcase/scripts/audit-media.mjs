import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const ffprobe='E:/JianyingAI/tools/ffprobe.exe';
const issues=[];const videos=[];
for(const [source,expected] of [['BlackHoleVideo.tsx',246],['LightningVideo.tsx',195]]){
 const text=fs.readFileSync(path.join('src',source),'utf8');let total=0;let clips=0;
 for(const match of text.matchAll(/<Series.Sequence[\s\S]*?durationInFrames=\{(\d+)\*fps\}[^>]*>([\s\S]*?)<\/Series.Sequence>/g)){
  const seconds=Number(match[1]);total+=seconds;
  const clip=match[2].match(/clip="([^"]+)"/);if(!clip)continue;
  clips++;const filename=path.join('public','clips',clip[1]+'.mp4');
  const r=spawnSync(ffprobe,['-v','error','-select_streams','v:0','-show_entries','stream=width,height,r_frame_rate,nb_frames:format=duration','-of','json',filename],{encoding:'utf8'});
  if(r.status!==0){issues.push(`${filename}: ${r.stderr}`);continue;}
  const data=JSON.parse(r.stdout);const s=data.streams[0];
  if(s.width!==1920||s.height!==1080||s.r_frame_rate!=='30/1'||Math.abs(Number(data.format.duration)-seconds)>.04)issues.push(`${filename}: incorrect dimensions, fps, or duration`);
 }
 if(total!==expected)issues.push(`${source}: ${total} seconds, expected ${expected}`);
 videos.push({source,seconds:total,clips});
}
console.log(JSON.stringify({videos,issues},null,2));
if(issues.length)process.exitCode=1;
