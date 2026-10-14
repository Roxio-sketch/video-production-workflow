const fs=require('fs'); const path=require('path'); const ts=require('typescript'); const crypto=require('crypto');
const base='E:/Remotion/backups/pre-zh-20261010-01/studio-dist'; const out='E:/Remotion/remotion-zh-compatible-4.0.534'; const m=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
function shape(s){const a=ts.createSourceFile('file.js',s,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS); if(a.parseDiagnostics.length)throw Error('Syntax error: '+a.parseDiagnostics.map(x=>x.messageText));const parts=[]; function v(n){if(ts.isExpressionStatement(n)&&ts.isCallExpression(n.expression)&&n.expression.expression.getText(a)==="__zhStudioStartDomLocalization")return;if(ts.isFunctionDeclaration(n)&&n.name?.text.startsWith("__zhStudio"))return;if(ts.isVariableStatement(n) && n.declarationList.declarations.every(d=>d.name.getText(a).startsWith("__zhStudio")))return;if(ts.isCallExpression(n)&&n.expression.getText(a)==="__zhStudioText"){v(n.arguments[0]);return;}parts.push(n.kind);if(ts.isIdentifier(n)||ts.isNumericLiteral(n))parts.push(n.text);if(ts.isPropertyAssignment(n))parts.push(n.name.getText(a));ts.forEachChild(n,v)}v(a);return JSON.stringify(parts);}
for(const c of m.changes){if(shape(fs.readFileSync(path.join(base,c.file),'utf8'))!==shape(fs.readFileSync(path.join(out,'dist',c.file),'utf8')))throw Error('Non-string structure changed: '+c.file)}
const files=['src/Root.tsx','src/index.ts','src/Composition.tsx','package-lock.json','remotion.config.ts']; for(const f of files){const h=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');if(h(path.join('E:/Remotion/remotion-studio',f))!==h(path.join('E:/Remotion/backups/zh-before-completion-20261010',f)))throw Error('Existing project changed: '+f)}
console.log(JSON.stringify({verifiedFiles:m.changes.length,syntax:'PASS',identifiersOperatorsAndPropertyNames:'UNCHANGED',originalVideoSourcesAndLockfile:'UNCHANGED'}));




