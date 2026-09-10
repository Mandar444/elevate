import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as T from '../dist/vendor/three.module.js';
import {assets} from '../dist/prop-assets.js';
import {buildings,walls,landmarks,cameraStops} from '../dist/village-layout.js';
import {troopAssets} from '../dist/troop-assets.js';
import {inhabitants,patrolPosition,lightSources,createVillageLife} from '../dist/village-life.js';
import {cameraPose} from '../dist/world.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
assert.ok(buildings.length>=50,'The village should contain its dense building layout');
assert.ok(walls.length>=150,'The village should contain complete wall compartments');
assert.equal(Object.keys(assets).length,28);
for(const [name,item] of Object.entries({...assets,...troopAssets})){
 assert.ok(fs.existsSync(path.join(root,'dist',item.url)),`Missing ${name}`);
 assert.ok(item.width>0&&item.height>0&&item.bounds.width>0);
 assert.ok(item.anchor.x>0&&item.anchor.x<1&&item.anchor.y>=0&&item.anchor.y<1,`Invalid ${name} anchor`);
}
for(const b of buildings){assert.ok(assets[b.type],`Missing building type ${b.type}`);assert.ok([b.x,b.z,b.size].every(Number.isFinite));}
assert.equal(new Set(walls.map(w=>w.x+','+w.z)).size,walls.length,'Duplicate wall positions');
for(const [width,height] of [[1440,900],[1024,768],[390,844]]){
 for(let i=0;i<cameraStops.length;i++){
  const pose=cameraPose(i,width,height),half=pose.height/2;
  const c=new T.OrthographicCamera(-half*width/height,half*width/height,half,-half,.1,220);
  const target=new T.Vector3(pose.x,0,pose.z),angle=Math.atan(1/Math.sqrt(2));
  const direction=new T.Vector3(Math.cos(angle)/Math.sqrt(2),Math.sin(angle),Math.cos(angle)/Math.sqrt(2));
  c.position.copy(target).addScaledVector(direction,95);c.setViewOffset(width,height,pose.offsetX*width,pose.offsetY*height,width,height);c.lookAt(target);c.updateMatrixWorld();
  const point=target.clone().project(c);
  assert.ok(point.toArray().every(Number.isFinite));
  assert.ok(Math.abs(point.x)<.9&&Math.abs(point.y)<.7&&point.z<1,`Camera clips destination ${width}×${height}, chapter ${i}`);
 }
}
// Troops must populate every requested tower and camp, with patrols remaining on clear grass.
for(const b of buildings.filter(b=>b.type==='archer-tower'))assert.equal(inhabitants.filter(u=>u.role==='tower'&&u.type==='archer'&&u.building===b).length,2);
for(const b of buildings.filter(b=>b.type==='wizard-tower'))assert.equal(inhabitants.filter(u=>u.role==='tower'&&u.type==='wizard'&&u.building===b).length,1);
for(const b of buildings.filter(b=>b.type==='army-camp'))assert.ok(inhabitants.filter(u=>u.role==='camp'&&Math.hypot(u.x-b.x,u.z-b.z)<4).length>=6);
for(const u of inhabitants.filter(u=>u.role==='patrol'))for(let t=0;t<500;t+=.5){
 const p=patrolPosition(u,t);assert.ok([p.x,p.z,p.facing].every(Number.isFinite));
 for(const b of buildings)assert.ok(Math.hypot(p.x-b.x,p.z-b.z)>b.size/2+.5,`${u.type} intersects ${b.type}`);
 assert.ok(Math.max(Math.abs(p.x),Math.abs(p.z))<26,'Patrol enters dense forest');
}
for(let i=1;i<cameraStops.length-1;i++){
 const before=cameraPose(i-.0001,1440,900),after=cameraPose(i+.0001,1440,900);
 assert.ok(Math.abs(before.x-after.x)+Math.abs(before.z-after.z)+Math.abs(before.height-after.height)<.001,'Camera jumps at chapter boundary');
}
assert.ok(lightSources.every(l=>l.radius>0&&l.power>0&&l.color.length===3));
// Construct the scene without a browser to check animation transforms and shader/uniform wiring.
const originalDocument=globalThis.document;
globalThis.document={createElement:()=>({getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){}})})};
const testScene=new T.Scene(),testCamera=new T.PerspectiveCamera();testCamera.position.set(1,1,1);testCamera.lookAt(0,0,0);testCamera.updateMatrixWorld();
const q=testCamera.quaternion,right=new T.Vector3(1,0,0).applyQuaternion(q),up=new T.Vector3(0,1,0).applyQuaternion(q),forward=new T.Vector3(1,1,1).normalize();
const life=createVillageLife(testScene,Object.fromEntries(Object.keys(troopAssets).map(key=>[key,new T.Texture()])),right,up,forward,q);
for(const [time,night] of [[0,0],[12,1],[23,.5]]){
 life.update(time,night,true);
 assert.equal(life.uniforms.villageNight.value,night);
 testScene.traverse(o=>{if(o.isInstancedMesh)assert.ok([...o.instanceMatrix.array].every(Number.isFinite),'Invalid troop matrix');});
}
const shader={vertexShader:T.ShaderLib.basic.vertexShader,fragmentShader:T.ShaderLib.basic.fragmentShader,uniforms:{}};
life.lightMaterial(new T.MeshBasicMaterial()).onBeforeCompile(shader);
assert.ok(shader.vertexShader.includes('villagePosition=(modelMatrix*villageWorld).xyz'));
assert.ok(shader.fragmentShader.includes('villageLightAt(villagePosition.xz)*1.25'));
assert.equal(shader.uniforms.villageLights.value.length,lightSources.length);
life.dispose();globalThis.document=originalDocument;
for(const name of Object.keys(landmarks))assert.equal(buildings.filter(b=>b.destination===name).length,1,'Each destination needs one interactive building');
for(const file of ['index.html','app.js','style.css'])assert.doesNotMatch(fs.readFileSync(path.join(root,'dist',file),'utf8'),/barbarian-hero|queen-hero|wizard-hero|cast-layer|clan-character|castFrame/,'Removed character overlays must not be referenced');
console.log(`PASS: ${buildings.length} buildings, ${walls.length} wall posts, ${inhabitants.length} inhabitants, clear patrol routes, ${lightSources.length} light sources, animation transforms, shader wiring, and ${cameraStops.length} camera destinations at desktop/tablet/mobile sizes.`);
