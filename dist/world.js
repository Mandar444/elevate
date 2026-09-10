import * as T from './vendor/three.module.js';
import { buildVillage } from './village-model.js';

const clamp=T.MathUtils.clamp, mix=T.MathUtils.lerp;
export const poses=[
  {target:[0,1.0,0],radius:36,elevation:.51,azimuth:.74,offsetX:0,offsetY:-.08},
  {target:[-6.0,2.8,1.6],radius:14.7,elevation:.37,azimuth:.58,offsetX:-.24,offsetY:0},
  {target:[6.0,2.5,1.5],radius:15.2,elevation:.43,azimuth:1.04,offsetX:-.24,offsetY:0},
  {target:[0,.1,0],radius:34,elevation:.83,azimuth:1.16,offsetX:0,offsetY:-.04}
];
export async function createWorld(canvas,pins,onReady,onError,onNavigate=()=>{}){
  let renderer;
  try {renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});}catch(error){onError(error);return null;}
  const scene=new T.Scene();
  scene.fog=new T.Fog(0xa9d5c6,48,95);
  const camera=new T.PerspectiveCamera(38,1,.15,170);
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.02;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const hemi=new T.HemisphereLight(0xd6f1ff,0x6e8650,1.85);scene.add(hemi);
  const sun=new T.DirectionalLight(0xffe4b0,3.3);sun.position.set(-13,25,17);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-19;sun.shadow.camera.right=19;sun.shadow.camera.top=19;sun.shadow.camera.bottom=-19;sun.shadow.camera.near=1;sun.shadow.camera.far=70;sun.shadow.bias=-.0003;sun.shadow.normalBias=.055;sun.shadow.radius=3;scene.add(sun);
  const rim=new T.DirectionalLight(0xb3ddff,1.5);rim.position.set(15,12,-17);scene.add(rim);
  const village=buildVillage();scene.add(village.root);
  const fireLight=new T.PointLight(0xff862d,5,8,2);fireLight.position.set(-3.7,2.6,5.55);scene.add(fireLight);
  const refineryLight=new T.PointLight(0xcf5aff,4,9,2);refineryLight.position.set(-5.5,3.0,-3.8);scene.add(refineryLight);
  const stageLight=new T.PointLight(0xa65aff,3,8,2);stageLight.position.set(6.4,3,1.3);scene.add(stageLight);
  // Fireflies use a tiny generated radial gradient, not an external scene asset.
  const particleCanvas=document.createElement('canvas');particleCanvas.width=32;particleCanvas.height=32;
  const ctx=particleCanvas.getContext('2d');const grad=ctx.createRadialGradient(16,16,0,16,16,16);grad.addColorStop(0,'rgba(255,248,180,1)');grad.addColorStop(.2,'rgba(255,219,101,.8)');grad.addColorStop(1,'rgba(255,210,80,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,32,32);
  const dots=new Float32Array(75*3);for(let i=0;i<75;i++){dots[i*3]=Math.sin(i*1.97)*10;dots[i*3+1]=1.8+(i%11)*.4;dots[i*3+2]=Math.cos(i*2.4)*7;}
  const dotGeometry=new T.BufferGeometry();dotGeometry.setAttribute('position',new T.BufferAttribute(dots,3));
  const dotMat=new T.PointsMaterial({map:new T.CanvasTexture(particleCanvas),size:.15,color:0xffda75,transparent:true,opacity:.26,depthWrite:false,blending:T.AdditiveBlending});const fireflies=new T.Points(dotGeometry,dotMat);scene.add(fireflies);

  let progress=0,targetProgress=0,night=0,targetNight=0,orbit=0,orbitGoal=0,pitch=0,pitchGoal=0;
  let width=1,height=1,mobile=false,visible=true,raf=0,last=0,elapsed=0,ready=false,disposed=false,dirty=true;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const pointer={x:0,y:0,down:false,dragged:false,lastX:0,lastY:0,startX:0,startY:0};
  const target=new T.Vector3(),projected=new T.Vector3();
  const raycaster=new T.Raycaster(),mouse=new T.Vector2(),intersection=new T.Vector3();
  const zones={hackathon:new T.Box3(new T.Vector3(-8.5,1.5,-.3),new T.Vector3(-4.3,5.2,4.0)),pitch:new T.Box3(new T.Vector3(4.4,1.5,-.6),new T.Vector3(8.8,4.4,4.2)),intel:new T.Box3(new T.Vector3(3.9,1.5,-5.2),new T.Vector3(6.8,3.5,-2.8))};
  function hitTest(e){if(progress>.45)return null;const rect=canvas.getBoundingClientRect();mouse.set((e.clientX-rect.left)/width*2-1,-(e.clientY-rect.top)/height*2+1);raycaster.setFromCamera(mouse,camera);let chosen=null,nearest=Infinity;for(const [name,box] of Object.entries(zones)){if(raycaster.ray.intersectBox(box,intersection)){const d=raycaster.ray.origin.distanceToSquared(intersection);if(d<nearest){nearest=d;chosen=name;}}}return chosen;}
  const nightFog=new T.Color(0x334766),dayFog=new T.Color(0xa9d5c6);
  function resize(){const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);mobile=width<760;renderer.setSize(width,height,false);renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.35:1.7));camera.aspect=width/height;camera.updateProjectionMatrix();dirty=true;wake();}
  function applyCamera(){
    const p=clamp(progress,0,3),i=Math.min(2,Math.floor(p)),t=p-i,s=t*t*(3-2*t),a=poses[i],b=poses[i+1];
    const center=a.target.map((v,j)=>mix(v,b.target[j],s));target.set(...center);
    const isStory=Math.sin(Math.min(p,3)/3*Math.PI);
    const aspect=width/height;
    const fit=mobile?Math.max(1,1.08/aspect):1;
    const r=mix(a.radius,b.radius,s)*fit;
    const theta=mix(a.azimuth,b.azimuth,s)+orbit;
    const elevation=clamp(mix(a.elevation,b.elevation,s)+pitch,.23,1.12);
    camera.position.set(target.x+Math.sin(theta)*Math.cos(elevation)*r,target.y+Math.sin(elevation)*r,target.z+Math.cos(theta)*Math.cos(elevation)*r);
    const x=mobile?0:mix(a.offsetX,b.offsetX,s),y=mobile?mix(-.09,-.16,Math.min(1,isStory*1.5)):mix(a.offsetY,b.offsetY,s);
    camera.setViewOffset(width,height,x*width,y*height,width,height);camera.lookAt(target);camera.updateMatrixWorld();
  }
  function updatePins(){
    for(const [name,el] of Object.entries(pins)){
      projected.copy(village.landmarks[name]).add(village.root.position).project(camera);
      const x=(projected.x*.5+.5)*width,y=(-projected.y*.5+.5)*height;
      const shown=progress<.38&&!mobile&&x>width*.09&&x<width*.91&&y>100&&y<height-100&&projected.z<1;
      el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-100%)`;
      el.hidden=!shown;el.inert=!shown;
    }
  }
  function frame(now){
    raf=0;if(disposed||!visible||document.hidden)return;
    if(last&&now-last<(mobile?31:22)){wake();return;}
    const dt=last?Math.min((now-last)/1000,.07):1/30;last=now;
    const ease=1-Math.exp(-dt*6),moving=Math.abs(progress-targetProgress)>.0003||Math.abs(night-targetNight)>.003||Math.abs(orbit-orbitGoal)>.0003||Math.abs(pitch-pitchGoal)>.0003;
    if(reduced.matches&&!dirty&&!moving)return;
    progress=mix(progress,targetProgress,reduced.matches?1:ease);night=mix(night,targetNight,ease);orbit=mix(orbit,orbitGoal,ease);pitch=mix(pitch,pitchGoal,ease);
    if(!reduced.matches)elapsed+=dt;
    const time=elapsed;
    village.root.position.y=reduced.matches?0:Math.sin(time*.42)*.055;
    for(const flag of village.animated.flags){const a=flag.geometry.attributes.position,base=flag.userData.original;for(let i=0;i<a.count;i++){const x=base[i*3];a.array[i*3+2]=base[i*3+2]+Math.sin(x*5-time*3+flag.userData.seed)*Math.pow(Math.max(0,x),.8)*.09;}a.needsUpdate=true;flag.geometry.computeVertexNormals();}
    village.animated.mill.rotation.z=time*.32;
    village.animated.crystals.forEach((o,i)=>{o.rotation.y=time*.6+i;o.rotation.z=Math.sin(time+i)*.09;});
    village.animated.flames.forEach((f,i)=>{f.scale.y=2.3+Math.sin(time*9+i*2)*.48;f.rotation.y=time*.8+i;});
    village.animated.clouds.forEach(g=>{g.position.x=g.userData.start.x+Math.sin(time*.11+g.userData.seed)*.65;g.position.y=g.userData.start.y+Math.sin(time*.26+g.userData.seed)*.18;});
    village.animated.villagers.forEach(g=>{
      const s=g.userData.seed,walk=g.userData.walking;
      if(walk){g.position.x=g.userData.start.x+Math.sin(time*.32+s)*.7;g.position.z=g.userData.start.z+Math.cos(time*.32+s)*.26;g.rotation.y=Math.atan2(Math.cos(time*.32+s)*.7,-Math.sin(time*.32+s)*.26);}
      g.userData.legs.forEach((leg,i)=>{leg.rotation.x=walk?Math.sin(time*4.5+s+i*Math.PI)*.32:0;});
      g.userData.arms.forEach((arm,i)=>{if(g.userData.type==='wizard'&&i===1)arm.rotation.x=-.95+Math.sin(time+s)*.11;else arm.rotation.x=Math.sin(time*(walk?4.5:1.7)+s+i*Math.PI)*(walk?.28:.09);});
    });
    village.animated.waterfalls.forEach(w=>{w.material.uniforms.time.value=time;w.material.uniforms.night.value=night;});
    fireflies.rotation.y=time*.015;dotMat.opacity=mix(.18,.9,night);
    hemi.intensity=mix(1.85,.75,night);sun.intensity=mix(3.3,.48,night);rim.intensity=mix(1.5,1.25,night);rim.color.setRGB(mix(.59,.2,night),mix(.76,.35,night),1);
    village.materials.window.emissiveIntensity=mix(.55,2.7,night);village.materials.purple.emissiveIntensity=mix(.26,1.15,night);fireLight.intensity=mix(3,9,night)*(1+Math.sin(time*9)*.06);refineryLight.intensity=mix(1,7,night);stageLight.intensity=mix(1,7,night);
    scene.fog.color.copy(dayFog).lerp(nightFog,night);
    applyCamera();updatePins();renderer.render(scene,camera);dirty=false;
    if(!ready){ready=true;renderer.shadowMap.autoUpdate=false;onReady({meshes:village.meshCount,triangles:renderer.info.render.triangles});}
    if(!reduced.matches||moving)wake();
  }
  function wake(){if(!raf&&!disposed)raf=requestAnimationFrame(frame);}
  function down(e){if(e.button!==0&&e.pointerType==='mouse')return;pointer.down=true;pointer.dragged=false;pointer.startX=pointer.lastX=e.clientX;pointer.startY=pointer.lastY=e.clientY;if(e.pointerType==='mouse')canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');}
  function move(e){if(!pointer.down){canvas.classList.toggle('over-landmark',!!hitTest(e));return;}const dx=e.clientX-pointer.lastX,dy=e.clientY-pointer.lastY;
    if(e.pointerType==='touch'&&!pointer.dragged&&Math.abs(e.clientY-pointer.startY)>Math.abs(e.clientX-pointer.startX)){return;}
    if(Math.abs(e.clientX-pointer.startX)+Math.abs(e.clientY-pointer.startY)>6){pointer.dragged=true;if(!canvas.hasPointerCapture(e.pointerId))canvas.setPointerCapture(e.pointerId);}
    if(pointer.dragged){orbitGoal-=dx*.007;pitchGoal=clamp(pitchGoal+dy*.003,-.15,.29);dirty=true;wake();}
    pointer.lastX=e.clientX;pointer.lastY=e.clientY;
  }
  function up(e){const click=pointer.down&&!pointer.dragged&&e.type!=='pointercancel';pointer.down=false;canvas.classList.remove('dragging');if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(click){const dest=hitTest(e);if(dest)onNavigate(dest);}}
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
  canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')orbitGoal+=.15;if(e.key==='ArrowRight')orbitGoal-=.15;if(e.key==='ArrowUp')pitchGoal=clamp(pitchGoal+.06,-.15,.29);if(e.key==='ArrowDown')pitchGoal=clamp(pitchGoal-.06,-.15,.29);dirty=true;wake();}});
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);
  const visibilityObserver=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible){last=0;wake();}else{cancelAnimationFrame(raf);raf=0;}});visibilityObserver.observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=0;wake();}});
  reduced.addEventListener('change',()=>{dirty=true;wake();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();disposed=true;cancelAnimationFrame(raf);onError(new Error('The 3D view is unavailable. All event details remain accessible.'));});
  resize();applyCamera();
  try{await renderer.compileAsync(scene,camera);}catch(error){renderer.dispose();onError(error);return null;}
  wake();
  return {
    setProgress(value){targetProgress=clamp(value,0,3);dirty=true;wake();},
    setNight(value){targetNight=value?1:0;dirty=true;wake();},
    reset(){orbitGoal=0;pitchGoal=0;dirty=true;wake();},
    dispose(){disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();visibilityObserver.disconnect();renderer.dispose();}
  };
}
