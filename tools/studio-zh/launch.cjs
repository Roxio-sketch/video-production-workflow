const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const args=process.argv.slice(2);const i=args.indexOf('--project');
const project=path.resolve(i<0?process.cwd():args[i+1]);
const patch=path.join(project,'.video-workflow/studio-zh');
const run=(script,extra=[])=>{const p=cp.spawnSync(process.execPath,[path.join(__dirname,script),'--project',project,...extra],{stdio:'inherit',cwd:project});if(p.status!==0)process.exit(p.status??1);};
if(!fs.existsSync(path.join(patch,'manifest.json'))){run('build.cjs');run('verify.cjs');}
const apply=cp.spawnSync(process.execPath,[path.join(__dirname,'manage.cjs'),'apply','--project',project],{stdio:'inherit',cwd:project});
if(apply.status!==0)process.exit(apply.status??1);
const cli=path.join(project,'node_modules/@remotion/cli/remotion-cli.js');
const child=cp.spawn(process.execPath,[cli,'studio','--no-open'],{stdio:'inherit',cwd:project});
child.on('exit',code=>process.exit(code??0));
