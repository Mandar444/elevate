import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate HTML ids');
assert.equal((html.match(/<h1\b/g)||[]).length,1,'Exactly one primary heading');
const refs=[...html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)].map(m=>m[1]);
for(const ref of refs.filter(x=>x.startsWith('/')))assert.ok(fs.existsSync(path.join(dist,ref)),`Missing local file ${ref}`);
for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(id),`Missing anchor ${id}`);
for(const [,targets] of html.matchAll(/(?:aria-labelledby|aria-controls)="([^"]+)"/g))for(const id of targets.split(' '))assert.ok(ids.includes(id),`Missing accessible label ${id}`);
for(const [,src] of html.matchAll(/srcset="([^"]+)"/g))for(const part of src.split(','))assert.ok(fs.existsSync(path.join(dist,part.trim().split(' ')[0])),`Missing responsive image ${part}`);
for(const name of ['style.css','clan.css','fonts.css']){
  const css=fs.readFileSync(path.join(dist,name),'utf8');
  for(const [,ref] of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))if(ref.startsWith('/'))assert.ok(fs.existsSync(path.join(dist,ref)),`Missing CSS asset ${ref}`);
  assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,`Unbalanced CSS braces in ${name}`);
  for(const [,size] of css.matchAll(/font-size:\s*(\d+)px/g))assert.ok(Number(size)>=12,`Text below 12px in ${name}`);
}
for(const [,json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(json);
assert.match(html,/<meta name="description" content="[^"]{50,}"/,'Missing SEO description');
assert.match(html,/<link rel="canonical" href="https:\/\/[^\"]+"/,'Missing canonical');
assert.match(html,/Registrations haven’t opened yet/,'Registration must clearly state pending status');
for(const name of ['dist/app.js','dist/world.js','dist/village-model.js','server.mjs'])execFileSync(process.execPath,['--check',path.join(root,name)],{stdio:'pipe'});
console.log('PASS: local assets, responsive images, anchors, accessible references, structured metadata, minimum text size, CSS structure, and JavaScript syntax.');
