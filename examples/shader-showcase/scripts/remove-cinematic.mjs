import fs from 'node:fs';
import path from 'node:path';

const backup=path.resolve('../maintenance/20261012-cinematic-removal');
fs.mkdirSync(backup,{recursive:true});
const changes=[];
function edit(file, transform){
 const before=fs.readFileSync(file,'utf8');const after=transform(before);
 if(before===after)return;
 const copy=path.join(backup,file.replace(/[:\\/]/g,'_'));
 if(!fs.existsSync(copy))fs.writeFileSync(copy,before);
 fs.writeFileSync(file,after);changes.push(file);
}
const skills=[
 'C:/Users/MAINTAINER/.codex/skills/minecraft-black-hole',
 'E:/着色器渲染/skill/minecraft-black-hole',
 'E:/Github维护/minecraft-agent-skills/skills/minecraft-black-hole',
];
for(const root of skills){
 edit(`${root}/assets/preview/index.html`,s=>s.replace('<option value="cinematic">宽窄光带</option>','').replace('主配方按四类盘面算法整理','主配方按三类盘面算法整理'));
 edit(`${root}/assets/preview/preview.js`,s=>s
  .replace("diskStyle:['dust','cinematic','ribbons','granular'][Math.floor(Math.random()*4)]","diskStyle:['dust','ribbons','granular'][Math.floor(Math.random()*3)]")
  .replaceAll('four public algorithm families','three public algorithm families')
  .replaceAll('four distinct algorithms','three distinct algorithms')
  .replace("function ui(){$('inner')", "function ui(){\n      const old=$('diskStyle').querySelector('option[data-legacy]');if(old)old.remove();\n      if(state.diskStyle==='cinematic'){const o=document.createElement('option');o.value='cinematic';o.textContent='旧配方（已停用）';o.disabled=true;o.dataset.legacy='true';$('diskStyle').append(o);}\n      $('inner')"));
 edit(`${root}/assets/preview/recipes.json`,s=>{
  const data=JSON.parse(s);data.recipes=data.recipes.filter(r=>r.diskStyle!=='cinematic');return JSON.stringify(data,null,2)+'\n';
 });
 edit(`${root}/SKILL.md`,s=>s
  .replace('，cinematic 盘使用有限厚度交点采样，避免单点采样的粗糙内缘','')
  .replace('，电影盘使用有限厚度与微细丝结构','')
  .replace('v3.2 五种盘面','v3.2 四种可选盘面')
  .replace('## 制作流程','电影盘面已从内置预设、盘面选择和随机生成入口移除。不要再推荐或为新效果选择 cinematic；旧配方的解析与渲染仅用于兼容已有文件。\n\n## 制作流程'));
 edit(`${root}/references/v3-workbench.md`,s=>s
  .replace(/原有隐藏的 `\?preset=cinematic`[^。]*。/g,'电影盘面预设、盘面选择与随机入口已移除；旧地址回到默认尘埃配方。')
  .replace(/^- `cinematic`[^\n]*/m,'- `ribbons` 使用弯曲射线的薄盘交点产生层叠光带；`dust` 使用多尺度连续体积。电影盘面已从新建入口移除，旧配方可显式导入。')
  .replace('不会改变四个主配方','不会改变三个主配方'));
 edit(`${root}/scripts/validate_workbench_v3.cjs`,s=>s
  .replace("unit?.diskStyle==='cinematic'&&unit.bandDetail<=6","unit?.diskStyle==='ribbons'&&unit.bandDetail>=1&&unit.bandDetail<=24")
  .replace("'cinematic-wide.png'","'default-dust-wide.png'"));
}
for(const root of [
 'E:/着色器渲染/vfx-workbench-lab',
 'E:/Github维护/minecraft-agent-skills/mods/vfx-workbench-forge-1.20.1',
 'E:/视频/capture-mod',
]){
 edit(`${root}/src/main/java/dev/vfxworkbench/client/ScrollableRows.java`,s=>s.replace(
  '    private List<String> enumChoices(ParamSpec p){\n',
  '    private List<String> enumChoices(ParamSpec p){\n        if(state.schema.id.equals(BlackHoleSkillSchema.ID)&&p.key.equals("diskStyle"))\n            return p.enumValues.stream().filter(value->!value.equals("cinematic")).toList();\n'
  ).replace(
  '    private List<String> enumChoices(ParamSpec p){\r\n',
  '    private List<String> enumChoices(ParamSpec p){\r\n        if(state.schema.id.equals(BlackHoleSkillSchema.ID)&&p.key.equals("diskStyle"))\r\n            return p.enumValues.stream().filter(value->!value.equals("cinematic")).toList();\r\n'
  ));
 edit(`${root}/src/main/java/dev/vfxworkbench/core/RandomSchemes.java`,s=>s.replace(
  'new String[]{"dust","cinematic","ribbons","classic","granular"}[r.nextInt(5)]',
  'new String[]{"dust","ribbons","classic","granular"}[r.nextInt(4)]'));
}
for(const file of ['README.md','CONTENT.md','../exports/视频说明.md'])edit(file,s=>s
 .replaceAll('3:46','3:40').replace('五组盘面与配色对照','四组盘面与配色对照')
 .replace('层叠光带、电影盘面与经典光带','层叠光带与经典光带'));
fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(changes,null,2));
console.log(JSON.stringify({backup,changed:changes.length},null,2));
