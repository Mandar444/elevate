import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {deploymentOrigin,metadataForOrigin} from './prepare-deploy.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
const pages=[['/','index.html'],['/neural-nexus/','neural-nexus/index.html'],['/startush-smackdown/','startush-smackdown/index.html'],['/team/','team/index.html'],['/past-editions/','past-editions/index.html'],['/404.html','404.html']];
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
 for(const [,srcset] of html.matchAll(/srcset="([^"]+)"/g))for(const source of srcset.split(',')){const ref=source.trim().split(/\s+/)[0];assert.ok(ref.startsWith('/')&&fs.existsSync(path.join(dist,ref)),'Missing responsive image '+ref);}
 for(const [,targets] of html.matchAll(/(?:aria-labelledby|aria-controls)="([^"]+)"/g))for(const id of targets.split(' '))assert.ok(ids.includes(id),`Missing accessible label ${id}`);
 for(const [,json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(json);
 if(route!=='/404.html'){
  assert.ok(html.includes('viewport-fit=cover'));assert.ok(html.includes('href="/mobile.css"'));

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
assert.ok(entries.get('/startush-smackdown/').includes('Startup Smackdown'));
assert.ok(entries.get('/').indexOf('id="partners"')>entries.get('/').indexOf('id="intel"'));
assert.ok(entries.get('/').indexOf('id="rally"')>entries.get('/').indexOf('id="partners"'));
const home=entries.get('/');
const selection=home.slice(home.indexOf('id="rally"'),home.indexOf('<section class="meet-the-clan"'));
for(const route of ['/neural-nexus/','/startush-smackdown/'])assert.ok(new RegExp('<a href="'+route+'" class="button [^"]+battle-button"').test(selection),'Each arena needs an equally prominent button');
const team=JSON.parse(fs.readFileSync(path.join(dist,'content/team.json'),'utf8'));assert.ok(Array.isArray(team.members));
for(const member of team.members){assert.ok(typeof member.name==='string'&&member.name.trim());if(member.photo?.startsWith('/'))assert.ok(fs.existsSync(path.join(dist,member.photo)));}
assert.match(entries.get('/team/'),/src="\/team.js"/);
assert.ok(!entries.get('/team/').includes('id="world-canvas"'),'Team roster does not load the village renderer');
const history=JSON.parse(fs.readFileSync(path.join(dist,'content/past-editions.json'),'utf8'));assert.deepEqual(history.editions.map(e=>e.year),[2024,2025]);
for(const edition of history.editions){for(const key of ['judges','guests','photos'])assert.ok(Array.isArray(edition[key]));for(const person of [...edition.judges,...edition.guests]){assert.ok(typeof person.name==='string'&&person.name.trim());if(person.photo?.startsWith('/'))assert.ok(fs.existsSync(path.join(dist,person.photo)));}for(const photo of edition.photos){assert.ok(photo.src&&photo.alt,'Archive photos need a source and accessible description');if(photo.src.startsWith('/'))assert.ok(fs.existsSync(path.join(dist,photo.src)));}}
const roster=JSON.parse(fs.readFileSync(path.join(dist,'content/partners.json'),'utf8'));
for(const key of ['sponsors','communityPartners']){assert.ok(Array.isArray(roster[key]));for(const partner of roster[key]){assert.ok(partner.name);if(partner.logo?.startsWith('/'))assert.ok(fs.existsSync(path.join(dist,partner.logo)));}}
assert.equal(deploymentOrigin({SITE_URL:'https://event.example/',VERCEL_URL:'preview.vercel.app'}),'https://event.example');
assert.equal(deploymentOrigin({VERCEL_PROJECT_PRODUCTION_URL:'event.vercel.app',VERCEL_URL:'preview.vercel.app'}),'https://event.vercel.app');
assert.equal(deploymentOrigin({VERCEL_URL:'preview.vercel.app'}),'https://preview.vercel.app');
assert.equal(deploymentOrigin({}),null);
assert.throws(()=>deploymentOrigin({SITE_URL:'https://user:secret@example.com'}));
assert.throws(()=>deploymentOrigin({SITE_URL:'https://example.com/wrong-path'}));
const vercel=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));assert.equal(vercel.outputDirectory,'dist');assert.equal(vercel.trailingSlash,true);
console.log('PASS: six static routes, local assets, navigation/anchors, accessible references, unique page metadata, Vercel domain metadata, partner and team data, equal competition buttons, CSS, and JavaScript syntax.');
