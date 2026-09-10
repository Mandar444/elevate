import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import { buildVillage } from '../dist/village-model.js';
import { poses } from '../dist/world.js';

const village=buildVillage();
village.root.updateMatrixWorld(true);
let triangles=0,meshes=0;
village.root.traverse(object=>{
  if(!object.isMesh)return;
  meshes++;
  const geometry=object.geometry;
  for(const [name,attribute] of Object.entries(geometry.attributes)){
    assert.ok(attribute.array.every(Number.isFinite),`Non-finite ${name} in village geometry`);
  }
  assert.ok(object.matrixWorld.elements.every(Number.isFinite),'Invalid object transform');
  geometry.computeBoundingSphere();
  assert.ok(Number.isFinite(geometry.boundingSphere.radius),'Invalid bounding sphere');
  triangles+=(geometry.index?.count??geometry.attributes.position.count)/3;
});
assert.ok(meshes<300,'Scene exceeds its draw-call budget');
assert.ok(triangles<100000,'Scene exceeds its triangle budget');
assert.equal(village.animated.villagers.length,4);
assert.ok(village.animated.flags.length>0);
assert.ok(village.animated.waterfalls.length>0);

// Verify actual camera keyframes can see their destinations at common viewport sizes.
for(const [width,height] of [[1440,900],[1024,768],[390,844]]){
  for(let index=0;index<poses.length;index++){
    const pose=poses[index],mobile=width<760;
    const camera=new T.PerspectiveCamera(38,width/height,.15,170);
    const radius=pose.radius*(mobile?Math.max(1,1.08/(width/height)):1);
    const target=new T.Vector3(...pose.target);
    camera.position.set(target.x+Math.sin(pose.azimuth)*Math.cos(pose.elevation)*radius,target.y+Math.sin(pose.elevation)*radius,target.z+Math.cos(pose.azimuth)*Math.cos(pose.elevation)*radius);
    camera.setViewOffset(width,height,(mobile?0:pose.offsetX)*width,(mobile?-.09:pose.offsetY)*height,width,height);
    camera.lookAt(target);camera.updateMatrixWorld();
    const subject=index===1?village.landmarks.hackathon:index===2?village.landmarks.pitch:target;
    const projected=subject.clone().project(camera);
    assert.ok(projected.toArray().every(Number.isFinite),'Invalid projected landmark');
    assert.ok(Math.abs(projected.x)<.95&&Math.abs(projected.y)<.85&&projected.z<1,`Destination clipped at ${width}×${height}, chapter ${index}`);
  }
}
console.log(`PASS: ${meshes} meshes, ${Math.round(triangles).toLocaleString()} triangles, finite geometry and camera destinations at desktop, tablet, and mobile dimensions.`);
