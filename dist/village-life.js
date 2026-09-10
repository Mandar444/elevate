import * as T from './vendor/three.module.js';
import {buildings} from './village-layout.js';
import {assets} from './prop-assets.js';
import {troopAssets} from './troop-assets.js';

// All inhabitants belong to the village. Tower crew use image-space roof anchors;
// camp inhabitants and patrols use ground coordinates and retain scene occlusion.
export const inhabitants=[];
for(const building of buildings.filter(b=>b.type==='archer-tower')){
  for(const [u,v] of [[.40,.245],[.61,.28]])inhabitants.push({type:'archer',role:'tower',building,u,v,height:1.32});
}
for(const building of buildings.filter(b=>b.type==='wizard-tower'))inhabitants.push({type:'wizard',role:'tower',building,u:.49,v:.15,height:1.5});
const camps=buildings.filter(b=>b.type==='army-camp');
const campOffsets=[[-2.4,1.4,'barbarian'],[-1.6,2.5,'archer'],[.1,2.8,'barbarian'],[1.9,2.3,'wizard'],[2.6,.6,'giant'],[2.2,-1.2,'archer']];
for(const camp of camps)for(const [x,z,type] of campOffsets)inhabitants.push({type,role:'camp',x:camp.x+x,z:camp.z+z,height:type==='giant'?1.9:1.36});
// Wide grass lanes outside the wall enclosures keep patrols away from buildings.
export const patrolRoutes=[
 [[-23,-19],[-23,18],[-20,22],[3,22]],
 [[-23,-19],[-19,-23],[16,-23],[22,-18]],
 [[22,-18],[23,-12],[23,15],[21,23],[14,23]],
 [[3,23],[-4,23],[-16,23],[-22,20]]
];
for(let i=0;i<8;i++)inhabitants.push({type:['barbarian','archer','wizard','barbarian'][i%4],role:'patrol',route:i%4,phase:i*.137,height:1.4,speed:.64+(i%3)*.12});

const lightStyle={
 'army-camp':{color:[1,.50,.105],radius:6.2,power:1.55,u:.52,v:.60,halo:2.3},
 'elixir-storage':{color:[.65,.15,1],radius:4.2,power:.85,u:.5,v:.42,halo:2.4},
 'laboratory':{color:[.55,.18,1],radius:4.6,power:1.0,u:.51,v:.46,halo:1.8},
 'town-hall':{color:[1,.64,.22],radius:4.7,power:1.15,u:.66,v:.73,halo:.65},
 'wizard-tower':{color:[.33,.49,1],radius:3.5,power:.65,u:.49,v:.16,halo:.95}
};
export const lightSources=buildings.filter(b=>lightStyle[b.type]).map(building=>({building,x:building.x,z:building.z,...lightStyle[building.type]}));

export function patrolPosition(unit,time){
 const points=patrolRoutes[unit.route],segments=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 const length=segments.reduce((a,b)=>a+b,0),cycle=(time*unit.speed+unit.phase*length*2)%(length*2),reverse=cycle>length;
 let distance=reverse?length*2-cycle:cycle;
 for(let i=0;i<segments.length;i++){
  if(distance<=segments[i]||i===segments.length-1){const f=distance/segments[i],a=points[i],b=points[i+1];return {x:T.MathUtils.lerp(a[0],b[0],f),z:T.MathUtils.lerp(a[1],b[1],f),facing:Math.sign(((b[0]-a[0])-(b[1]-a[1]))*(reverse?-1:1))||1};}
  distance-=segments[i];
 }
}

export function createVillageLife(scene,textures,right,upAxis,direction,facing){
 const uniforms={villageNight:{value:0},villageTime:{value:0},villageLights:{value:lightSources.map(l=>new T.Vector4(l.x,l.z,l.radius,l.power))},villageColors:{value:lightSources.map(l=>new T.Vector3(...l.color))}};
 const lightGLSL=`uniform float villageNight;uniform float villageTime;uniform vec4 villageLights[${lightSources.length}];uniform vec3 villageColors[${lightSources.length}];
 vec3 villageLightAt(vec2 point){vec3 sum=vec3(0.);for(int i=0;i<${lightSources.length};i++){vec4 light=villageLights[i];float d=max(0.,1.-distance(point,light.xy)/light.z);float flicker=.95+.035*sin(villageTime*5.7+float(i)*2.9)+.025*sin(villageTime*11.3+float(i));sum+=villageColors[i]*d*d*light.w*flicker;}return sum;}`;
 function lightMaterial(material){
  material.onBeforeCompile=shader=>{
   Object.assign(shader.uniforms,uniforms);
   shader.vertexShader='varying vec3 villagePosition;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
   vec4 villageWorld=vec4(transformed,1.0);
   #ifdef USE_INSTANCING
   villageWorld=instanceMatrix*villageWorld;
   #endif
   villagePosition=(modelMatrix*villageWorld).xyz;`);
   shader.fragmentShader='varying vec3 villagePosition;\n'+lightGLSL+'\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   diffuseColor.rgb*=mix(vec3(1.),vec3(.32,.43,.65)+villageLightAt(villagePosition.xz)*1.25,villageNight);`);
  };
  material.customProgramCacheKey=()=> 'elevate-village-lights-v1';
  return material;
 }
 function onBuilding(b,u,v){
  const meta=assets[b.type],w=b.size*Math.SQRT2/(meta.bounds.width/meta.width),h=w*meta.height/meta.width;
  return new T.Vector3(b.x,.06,b.z).addScaledVector(right,(u-meta.anchor.x)*w).addScaledVector(upAxis,(1-v-meta.anchor.y)*h).addScaledVector(direction,.04);
 }
 const groups=[];
 for(const [type,meta] of Object.entries(troopAssets)){
  const units=inhabitants.filter(u=>u.type===type),geometry=new T.PlaneGeometry(1,1);
  geometry.translate(.5-meta.anchor.x,.5-meta.anchor.y,0);
  const material=lightMaterial(new T.MeshBasicMaterial({map:textures[type],alphaTest:.10,side:T.DoubleSide}));
  const mesh=new T.InstancedMesh(geometry,material,units.length);mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;scene.add(mesh);groups.push({mesh,units,meta});
 }
 // A smooth radial texture is a lighting kernel, not replacement building artwork.
 const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;
 const ctx=glowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);
 gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(.16,'rgba(255,255,255,.7)');gradient.addColorStop(.45,'rgba(255,255,255,.18)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
 const glowTexture=new T.CanvasTexture(glowCanvas),halos=[];
 for(const light of lightSources){
  const material=new T.SpriteMaterial({map:glowTexture,color:new T.Color(...light.color),transparent:true,blending:T.AdditiveBlending,depthWrite:false,depthTest:true});
  const glow=new T.Sprite(material);glow.position.copy(onBuilding(light.building,light.u,light.v)).addScaledVector(direction,.06);glow.scale.setScalar(light.halo*2.2);scene.add(glow);halos.push({glow,light});
  if(light.building.type==='town-hall'){
   const core=new T.Sprite(material.clone());core.position.copy(glow.position);core.scale.set(.31,.48,1);scene.add(core);halos.push({glow:core,light,core:true});
  }
 }
 const emberCount=camps.length*8,emberGeometry=new T.BufferGeometry();
 const emberPositions=new Float32Array(emberCount*3);emberGeometry.setAttribute('position',new T.BufferAttribute(emberPositions,3));
 const emberMaterial=new T.PointsMaterial({map:glowTexture,color:0xffc36d,size:2.2,transparent:true,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:false});
 const embers=new T.Points(emberGeometry,emberMaterial);embers.frustumCulled=false;scene.add(embers);
 const dummy=new T.Object3D(),base=new T.Vector3();
 function update(time,night,animate){
  uniforms.villageNight.value=night;uniforms.villageTime.value=time;
  for(const {mesh,units,meta} of groups){
   units.forEach((unit,index)=>{
    let flip=1,bob=0;
    if(unit.role==='tower')base.copy(onBuilding(unit.building,unit.u,unit.v));
    else if(unit.role==='patrol'){const p=patrolPosition(unit,time);base.set(p.x,.09,p.z);flip=p.facing;bob=animate?Math.abs(Math.sin(time*6.6+index))*.07:0;}
    else{base.set(unit.x,.09,unit.z);flip=index%2?-1:1;bob=animate?Math.sin(time*1.8+index*2.7)*.018:0;}
    const h=unit.height/(meta.bounds.height/meta.height),w=h*meta.width/meta.height;
    dummy.position.copy(base).addScaledVector(upAxis,bob);dummy.quaternion.copy(facing);dummy.scale.set(w*flip,h,1);dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);
   });mesh.instanceMatrix.needsUpdate=true;
  }
  for(const {glow,light,core} of halos){const pulse=1+Math.sin(time*(light.building.type==='army-camp'?7.1:1.6)+light.x)*.07;glow.material.opacity=core?night*.92:(.09+night*.62)*pulse;}
  for(let i=0;i<emberCount;i++){
   const camp=camps[Math.floor(i/8)],t=(time*.24+(i%8)/8)%1,p=onBuilding(camp,.52,.58);
   p.addScaledVector(upAxis,t*2.3).addScaledVector(right,Math.sin(t*5+i)*.28).addScaledVector(direction,.12);
   emberPositions[i*3]=p.x;emberPositions[i*3+1]=p.y;emberPositions[i*3+2]=p.z;
  }
  emberGeometry.attributes.position.needsUpdate=true;emberMaterial.opacity=.3+night*.62;
 }
 return {uniforms,lightGLSL,lightMaterial,update,dispose(){glowTexture.dispose();}};
}
