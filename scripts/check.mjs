import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {deploymentOrigin,metadataForOrigin} from './prepare-deploy.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
const pages=[['/','index.html'],['/neural-nexus/','neural-nexus/index.html'],['/startush-smackdown/','startush-smackdown/index.html'],['/404.html','404.html']];
const entries=new Map(pages.map(([route,file])=>[route,fs.readFileSync(path.join(dist,file),'utf8')]));
for(const [route,html] of entries){
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,`Duplicate IDs on ${route}`);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`Exactly one primary heading on ${route}`);
 for(const [,ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  if(!ref.startsWith('/')&&!ref.startsWith('#'))continue;
  const url=new URL(ref,'https://local.invalid'+route);let file=path.join(dist,url.pathname);
  if(url.pathname.endsWith('/'))file=path.join(file,'index.html');
  assert.ok(fs.existsSync(file),`Missing local route/asset ${ref} from ${route}`);
  if(url.hash){const target=fs.readFileSync(file,'utf8');assert.ok(target.includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),`Missing anchor ${ref}`);}
 }
 for(const [,targets] of html.matchAll(/(?:aria-labelledby|aria-controls)="([^"]+)"/g))for(const id of targets.split(' '))assert.ok(ids.includes(id),`Missing accessible label ${id}`);
 for(const [,json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(json);
 if(route!=='/404.html'){
  assert.match(html,/<meta name="description" content="[^"]{50,}"/);
  assert.match(html,/<link rel="canonical" href="https:\/\/[^\"]+"/);
  assert.match(html,/Registrations haven’t opened yet/);
  const transformed=metadataForOrigin(html,'https://elevate.example',route);
  assert.ok(transformed.includes('rel="canonical" href="https://elevate.example'+route+'"'));
  assert.ok(transformed.includes('property="og:url" content="https://elevate.example'+route+'"'));
  for(const [,json] of transformed.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){const data=JSON.parse(json);assert.equal(data.url,'https://elevate.example'+route);if(data.isPartOf)assert.equal(data.isPartOf.url,'https://elevate.example/');}
 }
}
for(const name of fs.readdirSync(dist).filter(n=>n.endsWith('.css'))){
 const css=fs.readFileSync(path.join(dist,name),'utf8');
 for(const [,ref] of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))if(ref.startsWith('/'))assert.ok(fs.existsSync(path.join(dist,ref)),`Missing CSS asset ${ref}`);
 assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,`Unbalanced CSS in ${name}`);
 for(const [,size] of css.matchAll(/font-size:\s*(\d+)px/g))assert.ok(Number(size)>=12,`Text below 12px in ${name}`);
}
for(const name of fs.readdirSync(dist).filter(n=>n.endsWith('.js')))execFileSync(process.execPath,['--check',path.join(dist,name)],{stdio:'pipe'});
execFileSync(process.execPath,['--check',path.join(root,'server.mjs')],{stdio:'pipe'});
assert.ok(entries.get('/neural-nexus/').includes('AI/ML Hackathon'));
assert.ok(entries.get('/startush-smackdown/').includes('Startush Smackdown'));
assert.ok(entries.get('/').indexOf('id="partners"')>entries.get('/').indexOf('id="intel"'));
assert.ok(entries.get('/').indexOf('id="rally"')>entries.get('/').indexOf('id="partners"'));
const roster=JSON.parse(fs.readFileSync(path.join(dist,'content/partners.json'),'utf8'));
for(const key of ['sponsors','communityPartners']){assert.ok(Array.isArray(roster[key]));for(const partner of roster[key]){assert.ok(partner.name);if(partner.logo?.startsWith('/'))assert.ok(fs.existsSync(path.join(dist,partner.logo)));}}
assert.equal(deploymentOrigin({SITE_URL:'https://event.example/',VERCEL_URL:'preview.vercel.app'}),'https://event.example');
assert.equal(deploymentOrigin({VERCEL_PROJECT_PRODUCTION_URL:'event.vercel.app',VERCEL_URL:'preview.vercel.app'}),'https://event.vercel.app');
assert.equal(deploymentOrigin({VERCEL_URL:'preview.vercel.app'}),'https://preview.vercel.app');
assert.equal(deploymentOrigin({}),null);
assert.throws(()=>deploymentOrigin({SITE_URL:'https://user:secret@example.com'}));
assert.throws(()=>deploymentOrigin({SITE_URL:'https://example.com/wrong-path'}));
const vercel=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));assert.equal(vercel.outputDirectory,'dist');assert.equal(vercel.trailingSlash,true);
console.log('PASS: four static routes, local assets, navigation/anchors, accessible references, unique page metadata, Vercel domain metadata, partner data, CSS, and JavaScript syntax.');
