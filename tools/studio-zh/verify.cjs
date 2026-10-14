const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const args=process.argv.slice(2),get=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
const project=path.resolve(get('--project',process.cwd()));
const base=path.resolve(get('--source',path.join(project,'node_modules/@remotion/studio/dist')));
const out=path.resolve(get('--output',path.join(project,'.video-workflow/studio-zh')));
const ts=require(require.resolve('typescript',{paths:[project]}));
const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function shape(s){const a=ts.createSourceFile('file.js',s,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);if(a.parseDiagnostics.length)throw Error('Syntax error: '+a.parseDiagnostics.map(x=>x.messageText));const parts=[];function v(n){if(ts.isExpressionStatement(n)&&ts.isCallExpression(n.expression)&&n.expression.expression.getText(a)==='__zhStudioStartDomLocalization')return;if(ts.isFunctionDeclaration(n)&&n.name?.text.startsWith('__zhStudio'))return;if(ts.isVariableStatement(n)&&n.declarationList.declarations.every(d=>d.name.getText(a).startsWith('__zhStudio')))return;if(ts.isCallExpression(n)&&n.expression.getText(a)==='__zhStudioText'){v(n.arguments[0]);return;}parts.push(n.kind);if(ts.isIdentifier(n)||ts.isNumericLiteral(n))parts.push(n.text);if(ts.isPropertyAssignment(n))parts.push(n.name.getText(a));ts.forEachChild(n,v);}v(a);return JSON.stringify(parts);}
for(const c of manifest.changes){const before=fs.readFileSync(path.join(base,c.file)),after=fs.readFileSync(path.join(out,'dist',c.file));if(hash(before)!==c.before||hash(after)!==c.after)throw Error('SHA mismatch: '+c.file);if(shape(before.toString('utf8'))!==shape(after.toString('utf8')))throw Error('Non-display structure changed: '+c.file);}
console.log(JSON.stringify({version:manifest.version,files:manifest.changes.length,syntax:'PASS',identifiersOperatorsAndPropertyNames:'UNCHANGED'}));
