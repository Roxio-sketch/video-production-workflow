const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const args=process.argv.slice(2),mode=args[0]||'status';
const get=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
const project=path.resolve(get('--project',process.cwd()));
const resource=path.resolve(get('--resource',path.join(project,'.video-workflow/studio-zh')));
const installed=JSON.parse(fs.readFileSync(path.join(project,'node_modules/@remotion/studio/package.json'),'utf8')).version;
const manifest=JSON.parse(fs.readFileSync(path.join(resource,'manifest.json'),'utf8'));
if(installed!==manifest.version||installed!=='4.0.534')throw Error('Version mismatch; no files changed.');
if(!['apply','restore','status'].includes(mode))throw Error('Use apply, restore or status.');
const target=path.join(project,'node_modules/@remotion/studio/dist');
const backup=path.join(resource,'baseline');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const items=manifest.changes.map(change=>{
 const dest=path.resolve(target,change.file);
 if(!dest.startsWith(target+path.sep))throw Error('Invalid manifest path.');
 const current=fs.readFileSync(dest),digest=hash(current);
 if(digest!==change.before&&digest!==change.after)throw Error('Unknown edited resource, refusing overwrite: '+change.file);
 const saved=path.resolve(backup,change.file);
 const localized=path.resolve(resource,'dist',change.file);
 if(!saved.startsWith(backup+path.sep)||!localized.startsWith(path.join(resource,'dist')+path.sep))throw Error('Invalid resource path.');
 if(mode==='restore'&&!fs.existsSync(saved)&&digest!==change.before)throw Error('Original backup missing: '+change.file);
 const source=mode==='restore'?(fs.existsSync(saved)?fs.readFileSync(saved):current):fs.readFileSync(localized);
 if(hash(source)!==(mode==='restore'?change.before:change.after))throw Error('Source SHA mismatch: '+change.file);
 if(fs.existsSync(saved)&&hash(fs.readFileSync(saved))!==change.before)throw Error('Backup SHA mismatch: '+change.file);
 return {change,dest,current,digest,saved,source};
});
if(mode==='status'){
 console.log(JSON.stringify({version:installed,files:items.length,localized:items.filter(x=>x.digest===x.change.after).length,original:items.filter(x=>x.digest===x.change.before).length}));
}else{
 // Preflight every file before any installed resource is changed.
 if(mode==='apply')for(const item of items){if(!fs.existsSync(item.saved)){if(item.digest!==item.change.before)throw Error('Cannot create an original backup from a localized file.');fs.mkdirSync(path.dirname(item.saved),{recursive:true});fs.writeFileSync(item.saved,item.current);}}
 const touched=[];
 try{
  for(const item of items){const temp=item.dest+`.workflow-${process.pid}.tmp`;fs.writeFileSync(temp,item.source);fs.renameSync(temp,item.dest);touched.push(item);}
 }catch(error){for(const item of touched)fs.writeFileSync(item.dest,item.current);throw error;}
 console.log(JSON.stringify({mode,version:installed,files:items.length,project,backup}));
}
