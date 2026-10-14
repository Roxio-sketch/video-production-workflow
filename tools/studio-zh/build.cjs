const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args=process.argv.slice(2);
const get=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
const project=path.resolve(get('--project',process.cwd()));
const version='4.0.534';
const installed=JSON.parse(fs.readFileSync(path.join(project,'node_modules/@remotion/studio/package.json'),'utf8')).version;
if(installed!==version)throw new Error(`Requires Remotion ${version}, found ${installed}`);
const ts=require(require.resolve('typescript',{paths:[project]}));
const source=path.resolve(get('--source',path.join(project,'node_modules/@remotion/studio/dist')));
const output=path.resolve(get('--output',path.join(project,'.video-workflow/studio-zh')));
if(output===source||output.startsWith(source+path.sep))throw new Error('Output must be outside installed dist');
if(fs.existsSync(path.join(output,'manifest.json')))throw new Error('A generated patch already exists. Restore and use a new output directory for a new generation.');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'reference-manifest.json'),'utf8'));
for(const c of baseline.changes){const p=path.resolve(source,c.file);if(!p.startsWith(source+path.sep)||hash(fs.readFileSync(p))!==c.before)throw new Error('Unknown or already patched source: '+c.file);}
const dictionary=JSON.parse(fs.readFileSync(path.join(__dirname,'translations.json'),'utf8'));
fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'translations.json'),JSON.stringify(dictionary,null,2));
fs.copyFileSync(path.join(__dirname,'UPSTREAM-LICENSE.md'),path.join(output,'UPSTREAM-LICENSE.md'));
const safeKeys = new Set(['children','title','label','description','placeholder','tooltip','tooltipLabel','aria-label','ariaLabel','displayName','helpText','text','message','quickSwitcherLabel']);
// Translate presentation values only; never import paths, enum values, IDs,
// comparisons, property keys, CSS values, protocol names or function bodies.
function displayContext(n) {
  let p=n.parent;
  while(p && (ts.isConditionalExpression(p)||ts.isArrayLiteralExpression(p)||ts.isParenthesizedExpression(p)||ts.isTemplateExpression(p)||ts.isTemplateSpan(p)||ts.isBinaryExpression(p))) {
    if(ts.isConditionalExpression(p) && n.pos>=p.condition.pos && n.end<=p.condition.end) return false;
    if(ts.isBinaryExpression(p) && p.operatorToken.kind!==ts.SyntaxKind.PlusToken) return false;
    p=p.parent;
  }
  if(p && ts.isVariableDeclaration(p) && /(?:label|title|tooltip|description|accessibilityLabel)\d*$/i.test(p.name.getText())) return n.pos >= p.initializer.pos;
  return p && ts.isPropertyAssignment(p) && n.pos >= p.initializer.pos && safeKeys.has(p.name.getText().replace(/^['"]|['"]$/g,''));
}
const changes=[]; const missed={};
function walk(dir) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const file=path.join(dir,entry.name); if(entry.isDirectory()){walk(file);continue;}
    const rel=path.relative(source,file); const dest=path.join(output,'dist',rel); fs.mkdirSync(path.dirname(dest),{recursive:true});
    const buffer=fs.readFileSync(file); let result=buffer;
    if (/\.(js|mjs)$/.test(file)) {
      const text=buffer.toString('utf8'); const tree=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS); const edits=[];
      function visit(n){
        if((ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)||ts.isTemplateHead(n)||ts.isTemplateMiddle(n)||ts.isTemplateTail(n)) && displayContext(n)) {
          if(dictionary[n.text]) {
            const template=ts.isTemplateHead(n)||ts.isTemplateMiddle(n)||ts.isTemplateTail(n);
            const value=dictionary[n.text].replaceAll('`','\\`').replaceAll('${','\\${');
            edits.push({start:n.getStart(tree),end:n.end,old:n.text,value:dictionary[n.text],replacement:template ? (ts.isTemplateHead(n)?'`':'}')+value+(ts.isTemplateTail(n)?'`':'${') : ts.isNoSubstitutionTemplateLiteral(n)?'`'+value+'`':JSON.stringify(dictionary[n.text])});
          }
          else if (/[A-Za-z]{3}/.test(n.text) && !/^https?:|^#[a-f0-9]+$/.test(n.text)) missed[n.text]=(missed[n.text]||0)+1;
        }
        ts.forEachChild(n,visit);
      }
      visit(tree); let patched=text;
      for(const e of edits.reverse()) patched=patched.slice(0,e.start)+e.replacement+patched.slice(e.end);
      const localized=ts.createSourceFile(file,patched,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
      let dynamic=[];
      function dynamicVisit(n){
        if(ts.isPropertyAssignment(n)) {
          const key=n.name.getText(localized).replace(/^['"]|['"]$/g,'');
          const call=n.parent.parent;
          const jsxCall=call && ts.isCallExpression(call) && /jsx/.test(call.expression.getText(localized));
          const dom=jsxCall && ts.isStringLiteral(call.arguments[0]);
          const expr=n.initializer;
          const dynamicText=ts.isIdentifier(expr)||ts.isPropertyAccessExpression(expr)||ts.isElementAccessExpression(expr);
          const codeChild=jsxCall && ts.isStringLiteral(call.arguments[0]) && ['code','style','script','pre'].includes(call.arguments[0].text);
          const eligible=(jsxCall && (['title','aria-label','ariaLabel','label','placeholder'].includes(key) || (key==='children' && !codeChild))) || ['label','title','description','placeholder','tooltip','displayName','helpText'].includes(key);
          if(eligible && !ts.isStringLiteral(expr)) dynamic.push({start:expr.getStart(localized),end:expr.end,value:expr.getText(localized)});
        }
        ts.forEachChild(n,dynamicVisit);
      }
      dynamicVisit(localized);
      dynamic=dynamic.filter(e=>!dynamic.some(other=>other!==e && other.start>=e.start && other.end<=e.end));
      dynamic.sort((a,b)=>a.start-b.start);
      for(const e of dynamic.reverse()) patched=patched.slice(0,e.start)+'__zhStudioText('+e.value+')'+patched.slice(e.end);
      const needsObserver=rel==='Studio.js'||rel.replaceAll('\\','/')==='esm/previewEntry.mjs';
      if(dynamic.length||needsObserver) {
        const helper='\nconst __zhStudioDictionary='+JSON.stringify(dictionary)+';\nfunction __zhStudioText(value) { if(Array.isArray(value)) return value.map(__zhStudioText); if(value && typeof value === "object" && value.$$typeof && value.props && Object.prototype.hasOwnProperty.call(value.props,"children") && value.type !== "code" && value.type !== "style" && value.type !== "script") return {...value,props:{...value.props,children:__zhStudioText(value.props.children)}}; if(typeof value !== "string") return value; if(Object.prototype.hasOwnProperty.call(__zhStudioDictionary,value)) return __zhStudioDictionary[value]; return value.replace(/File Explorer/g,"文件资源管理器").replace(/JPEG Quality/g,"JPEG 质量").replace(/delayRender\\(\\) timeout/g,"delayRender() 超时").replace(/User Agent/g,"用户代理").replace(/^(修改快捷键：|操作：)(.*)$/,(_,prefix,body)=>prefix+(__zhStudioDictionary[body]??body)).replace(/^Delete (remotion-[a-z-]+)$/,"删除 $1").replace(/^(Scale|Concurrency): /,word=>({"Scale: ":"缩放：","Concurrency: ":"并发数："}[word]??word)).replace(/left sidebar/g,"左侧栏").replace(/right sidebar/g,"右侧栏").replace(/left侧栏/g,"左侧栏").replace(/right侧栏/g,"右侧栏").replace(/default editor/g,"默认编辑器").replace(/\\b(Controls|Transform|Text|Background|Border|Crop|Layout)\\b/g,word=>__zhStudioDictionary[word]??word).replace(/^(Bundling|Rendering|Encoding|Downloading|Preparing|Checking) (?=\\d)/,word=>({"Bundling ":"正在打包 ","Rendering ":"正在渲染 ","Encoding ":"正在编码 ","Downloading ":"正在下载 ","Preparing ":"正在准备 ","Checking ":"正在检查 "}[word]??word)).replace(/(渲染|导出) video\\b/g,"$1视频").replace(/(渲染|导出) audio\\b/g,"$1音频").replace(/(渲染|导出) still\\b/g,"$1静帧"); }\n';
        patched=patched.startsWith('"use strict";')?'"use strict";'+helper+patched.slice(13):helper+patched;
      }
      if(needsObserver) patched += `
function __zhStudioStartDomLocalization() {
 if(typeof document==='undefined'||typeof MutationObserver==='undefined'||window.__remotionZhUIObserver) return;
 function localize(node) {
  if(node.nodeType===3) {
   const parent=node.parentElement;
   if(!parent||parent.closest('.remotion-studio-composition-container,code,pre,style,script,input,textarea,[contenteditable="true"],.monaco-editor,.cm-editor')) return;
   const raw=node.nodeValue; const lead=raw.match(/^\\s*/)[0]; const tail=raw.match(/\\s*$/)[0]; const body=raw.trim();
   if(!body) return;
   const translated=__zhStudioText(body);
   if(translated!==body) node.nodeValue=lead+translated+tail;
   return;
  }
  if(node.nodeType!==1&&node.nodeType!==9) return;
  if(node.nodeType===1&&node.matches('.remotion-studio-composition-container,code,pre,style,script,input,textarea,[contenteditable="true"],.monaco-editor,.cm-editor')) return;
  for(const child of Array.from(node.childNodes)) localize(child);
 }
 window.__remotionZhUIObserver=new MutationObserver(records=>{for(const record of records){if(record.type==='characterData')localize(record.target);else for(const node of record.addedNodes)localize(node);}});
 window.__remotionZhUIObserver.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
 localize(document.documentElement);
}
__zhStudioStartDomLocalization();
`;
      if(edits.length||dynamic.length||needsObserver){result=Buffer.from(patched); changes.push({file:rel.replaceAll('\\','/'),before:hash(buffer),after:hash(result),count:edits.length,dynamicDisplayValues:dynamic.length});}
    }
    fs.writeFileSync(dest,result);
  }
}
walk(source);
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({version,sourceCommit:'885239c3fc78a8fc11da39d411011b09b9b9da43',strategy:'Official 4.0.534 dist, presentation localization with scoped DOM fallback',changes},null,2));
fs.writeFileSync(path.join(output,'untranslated-display-strings.json'),JSON.stringify(missed,null,2));
console.log(JSON.stringify({files:changes.length,replacements:changes.reduce((n,x)=>n+x.count,0),output}));






