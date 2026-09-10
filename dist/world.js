import {PHONE_LAYOUT_QUERY,renderBudget,gestureIntent} from './responsive.js';
import * as T from './vendor/three.module.js';
import {assets} from './prop-assets.js';
import {buildings,walls,landmarks,cameraStops} from './village-layout.js';
import {troopAssets} from './troop-assets.js';
import {createVillageLife} from './village-life.js';

const mix=T.MathUtils.lerp,clamp=T.MathUtils.clamp;
const ISO_ANGLE=Math.atan(1/Math.sqrt(2));
const direction=new T.Vector3(Math.cos(ISO_ANGLE)/Math.sqrt(2),Math.sin(ISO_ANGLE),Math.cos(ISO_ANGLE)/Math.sqrt(2));
export function cameraPose(progress,width,height,zoom=1,phone=false,panel=false){
  const p=clamp(progress,0,cameraStops.length-1),i=Math.min(cameraStops.length-2,Math.floor(p)),t=p-i,s=t*t*(3-2*t),a=cameraStops[i],b=cameraStops[i+1],mobile=width<=760||phone;
  const h=mix(a.height,b.height,s)*(mobile?(panel?1.35:1.67):1)/zoom;
  return {x:mix(a.x,b.x,s),z:mix(a.z,b.z,s),height:h,offsetX:mobile?(width>height&&!panel?-.20:0):mix(a.offsetX,b.offsetX,s),offsetY:mobile?(panel||width>height?0:-.145):mix(a.offsetY,b.offsetY,s)};
}

export async function createWorld(canvas,pins,onReady,onError,onNavigate=()=>{},initial={}){
 let renderer;
 try{renderer=new T.WebGLRenderer({canvas,alpha:false,antialias:!matchMedia(PHONE_LAYOUT_QUERY).matches,powerPreference:'low-power'});}catch(e){onError(e);return null;}
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NoToneMapping;
 const scene=new T.Scene();scene.background=new T.Color(0x56832e);
 const camera=new T.OrthographicCamera(-30,30,20,-20,.1,220);
 camera.position.copy(direction).multiplyScalar(95);camera.lookAt(0,0,0);camera.updateMatrixWorld();
 const facing=camera.quaternion.clone(),right=new T.Vector3(1,0,0).applyQuaternion(facing),upAxis=new T.Vector3(0,1,0).applyQuaternion(facing);
 const coarse=matchMedia('(pointer: coarse)'),saveData=!!navigator.connection?.saveData;
 const loader=new T.TextureLoader(),textures={};
 try{await Promise.all(Object.entries({...assets,...troopAssets}).map(async([name,meta])=>{const map=await loader.loadAsync(meta.url);map.colorSpace=T.SRGBColorSpace;map.anisotropy=Math.min(coarse.matches?2:4,renderer.capabilities.getMaxAnisotropy());textures[name]=map;}));}
 catch(e){renderer.dispose();onError(e);return null;}
 const life=createVillageLife(scene,textures,right,upAxis,direction,facing);

 // A flat checker of fine green grass, with a dirt perimeter, replaces the floating island.
 const grassMaterial=new T.ShaderMaterial({depthWrite:false,uniforms:life.uniforms,vertexShader:`varying vec2 ground;void main(){ground=vec2(position.x,-position.y);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`
 varying vec2 ground;${life.lightGLSL}
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 void main(){
 float edge=max(abs(ground.x),abs(ground.y));float checker=mod(floor(ground.x)+floor(ground.y),2.0);
 float fine=noise(ground*95.0)*.038+noise(ground*19.0)*.018;
 vec3 field=vec3(.52,.66,.21)+(checker-.5)*.027+(noise(ground*.35)-.5)*.055+fine;
 vec3 forest=vec3(.29,.43,.14)+(noise(ground*.6)-.5)*.055+fine;
 vec3 color=mix(field,forest,smoothstep(21.7,26.5,edge));
 float trail=smoothstep(23.8,24.4,edge)*(1.0-smoothstep(25.0,25.7,edge))*.58;
 color=mix(color,vec3(.62,.46,.235)+(noise(ground*5.0)-.5)*.055,trail);
 color*=mix(vec3(1.),vec3(.30,.40,.62)+villageLightAt(ground)*1.12,villageNight);gl_FragColor=vec4(color,1.0);
 }`});
 const ground=new T.Mesh(new T.PlaneGeometry(180,180),grassMaterial);ground.rotation.x=-Math.PI/2;ground.position.y=-.03;ground.renderOrder=-100;scene.add(ground);

 // All props retain the original game artwork. Geometry batches make repeated scenery cheap.
 const buckets=new Map(),interactive=[];
 function batchProp(type,x,z,size,extra={}){
   const meta=assets[type],frame=extra.frame;
   const ratio=frame?frame.w/frame.h:meta.width/meta.height;
   const contentFraction=frame?1:meta.bounds.width/meta.width;
   const w=size*Math.sqrt(2)/contentFraction,h=w/ratio;
   const anchor=frame?{x:.5,y:.20}:meta.anchor;
   const center=new T.Vector3(x,.06,z);
   const points=[[-anchor.x*w,-anchor.y*h],[(1-anchor.x)*w,-anchor.y*h],[(1-anchor.x)*w,(1-anchor.y)*h],[-anchor.x*w,(1-anchor.y)*h]].map(([x,y])=>center.clone().addScaledVector(right,x).addScaledVector(upAxis,y));
   if(!buckets.has(type))buckets.set(type,{positions:[],uvs:[],indices:[]});
   const data=buckets.get(type),offset=data.positions.length/3;
   for(const v of points)data.positions.push(...v.toArray());
   const u0=frame?frame.x/meta.width:0,u1=frame?(frame.x+frame.w)/meta.width:1,v0=frame?1-(frame.y+frame.h)/meta.height:0,v1=frame?1-frame.y/meta.height:1;
   data.uvs.push(u0,v0,u1,v0,u1,v1,u0,v1);data.indices.push(offset,offset+1,offset+2,offset,offset+2,offset+3);
   if(extra.destination)interactive.push({type,x,z,size,w,h,anchor,points,destination:extra.destination});
 }
 for(const b of buildings)batchProp(b.type,b.x,b.z,b.size,b);
 // The source atlas shows a three-post corner; UVs select its visible central wall post.
 for(const wall of walls)batchProp('wall',wall.x,wall.z,.84,{frame:{x:71,y:77,w:58,h:85}});
 let seed=306;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 for(let x=-43;x<=43;x+=2.7)for(let z=-43;z<=43;z+=2.7){
   const edge=Math.max(Math.abs(x),Math.abs(z));if(edge<26||random()<.20)continue;
   const kind=random()<.15?'pine':random()<.46?'tree':'tree2';
   batchProp(kind,x+(random()-.5)*1.8,z+(random()-.5)*1.8,2.1+random()*1.3);
   if(random()<.17)batchProp('bush',x-1.2,z+1.2,1.5);
 }
 for(const [x,z,kind,size] of [[-22,17,'tree',3],[19,-22,'tree2',3],[-21,-18,'pine',2.5],[21,17,'rock',2.7],[-22,5,'rock2',2.6],[20,-17,'bush',1.7],[-19,21,'stump',1.3],[8,22,'rock',1.8],[-21,-2,'bush',1.2]])batchProp(kind,x,z,size);
 for(const [type,data] of buckets){
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(data.positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(data.uvs,2));geo.setIndex(data.indices);geo.computeBoundingSphere();
   const material=life.lightMaterial(new T.MeshBasicMaterial({map:textures[type],alphaTest:.12,side:T.DoubleSide}));
   const mesh=new T.Mesh(geo,material);scene.add(mesh);
 }

 // Soft ground contact shadows, independent of the sprites' native shadows.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;
 const ctx=shadowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,3,32,32,32);gradient.addColorStop(0,'rgba(20,38,8,.38)');gradient.addColorStop(1,'rgba(20,38,8,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
 const shadowMaterial=new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false});
 const shadows=new T.InstancedMesh(new T.PlaneGeometry(1,1),shadowMaterial,buildings.length),dummy=new T.Object3D();
 buildings.forEach((b,index)=>{dummy.position.set(b.x,.015,b.z);dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.set(b.size*1.65,b.size*1.45,1);dummy.updateMatrix();shadows.setMatrixAt(index,dummy.matrix);});shadows.renderOrder=-10;scene.add(shadows);
 const selectMaterial=new T.LineBasicMaterial({color:0xfff1bc,transparent:true,opacity:.9,depthTest:false});
 const selection=new T.LineLoop(new T.BufferGeometry(),selectMaterial);selection.renderOrder=10;selection.visible=false;scene.add(selection);
 let selected='';
 function select(destination){if(selected===destination)return;selected=destination;const b=buildings.find(x=>x.destination===destination);selection.visible=!!b;if(!b)return;const r=b.size*.54;selection.geometry.dispose();selection.geometry=new T.BufferGeometry().setFromPoints([new T.Vector3(b.x-r,.09,b.z-r),new T.Vector3(b.x+r,.09,b.z-r),new T.Vector3(b.x+r,.09,b.z+r),new T.Vector3(b.x-r,.09,b.z+r)]);}

 let width=1,height=1,mobile=false,frameRate=30,progress=clamp(initial.progress??0,0,cameraStops.length-1),progressGoal=progress,night=initial.night?1:0,nightGoal=night,zoom=1,zoomGoal=1,panX=0,panZ=0,panXGoal=0,panZGoal=0;
 let raf=0,dirty=true,disposed=false,visible=true,enabled=true,last=0,ready=false,animationTime=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),temp=new T.Vector3();
 function applyCamera(){const pose=cameraPose(progress,width,height,zoom,mobile,initial.panel===true),half=pose.height/2;camera.left=-half*width/height;camera.right=half*width/height;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();const target=new T.Vector3(pose.x+panX,0,pose.z+panZ);camera.position.copy(target).addScaledVector(direction,95);camera.setViewOffset(width,height,pose.offsetX*width,pose.offsetY*height,width,height);camera.lookAt(target);camera.updateMatrixWorld();}
 function updatePins(){for(const [name,element] of Object.entries(pins)){const landmark=landmarks[name];temp.set(landmark.x,.1,landmark.z).addScaledVector(upAxis,landmark.height);temp.project(camera);const x=(temp.x*.5+.5)*width,y=(-temp.y*.5+.5)*height;const shown=!mobile&&progress<.35&&x>Math.max(340,width*.25)&&x<width-90&&y>110&&y<height-90;element.hidden=!shown;element.inert=!shown;element.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-100%)`;}}
 function hitTest(event){const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;for(const item of [...interactive].sort((a,b)=>b.x+b.z-a.x-a.z)){const points=item.points.map(p=>p.clone().project(camera));const xs=points.map(p=>(p.x*.5+.5)*width),ys=points.map(p=>(-p.y*.5+.5)*height);if(x>Math.min(...xs)&&x<Math.max(...xs)&&y>Math.min(...ys)&&y<Math.max(...ys))return item.destination;}return null;}
 function frame(now){raf=0;if(disposed||!visible||!enabled||document.hidden)return;
  const animate=!paused&&!reduced.matches;
  if(!dirty&&last&&now-last<1000/frameRate){wake();return;}
  const dt=last?Math.min((now-last)/1000,.1):.03;last=now;if(animate)animationTime+=dt;
  const smooth=reduced.matches?1:1-Math.exp(-dt*7);const moving=Math.abs(progress-progressGoal)>.0001||Math.abs(night-nightGoal)>.001||Math.abs(zoom-zoomGoal)>.001||Math.abs(panX-panXGoal)>.001||Math.abs(panZ-panZGoal)>.001;
  progress=mix(progress,progressGoal,smooth);night=mix(night,nightGoal,smooth);zoom=mix(zoom,zoomGoal,smooth);panX=mix(panX,panXGoal,smooth);panZ=mix(panZ,panZGoal,smooth);
  if(dirty||moving||animate||!ready){applyCamera();updatePins();life.update(animationTime,night,animate);scene.background.setRGB(mix(.337,.09,night),mix(.514,.17,night),mix(.18,.2,night));const p=Math.round(progress);if(!pointer.down)select(p===1?'hackathon':p===2?'pitch':progress<.35?pointer.hover:'');renderer.render(scene,camera);dirty=false;if(!ready){ready=true;onReady();}}
  if(moving||animate)wake();
 }
 function wake(){if(!raf&&!disposed&&enabled)raf=requestAnimationFrame(frame);}
 function resize(){const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);const budget=renderBudget(width,height,devicePixelRatio||1,coarse.matches,saveData);mobile=budget.mobile;frameRate=budget.fps;renderer.setPixelRatio(budget.pixelRatio);renderer.setSize(width,height,false);dirty=true;wake();}
 const pointer={down:false,id:null,dragged:false,intent:'pending',x:0,y:0,startX:0,startY:0,hover:''};
 function down(event){
  if(event.pointerType==='mouse'&&event.button!==0)return;
  if(pointer.down){pointer.dragged=true;pointer.intent='scroll';return;}
  pointer.down=true;pointer.id=event.pointerId;pointer.dragged=false;pointer.intent='pending';pointer.x=pointer.startX=event.clientX;pointer.y=pointer.startY=event.clientY;
  if(event.pointerType==='mouse')canvas.setPointerCapture(event.pointerId);
 }
 function move(event){
  if(!pointer.down){if(event.pointerType==='touch')return;const hit=hitTest(event);pointer.hover=hit||'';canvas.classList.toggle('over-landmark',!!hit);if(progress<.35){dirty=true;wake();}return;}
  if(event.pointerId!==pointer.id)return;
  const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
  pointer.intent=gestureIntent(event.clientX-pointer.startX,event.clientY-pointer.startY,event.pointerType,pointer.intent);
  if(pointer.intent!=='pending')pointer.dragged=true;
  if(pointer.intent==='pan'){
   if(!canvas.hasPointerCapture(event.pointerId))canvas.setPointerCapture(event.pointerId);
   canvas.classList.add('dragging');
   const factor=cameraPose(progress,width,height,zoom,mobile,initial.panel===true).height/height;
   panXGoal=clamp(panXGoal-dx*factor*.707+dy*factor*.866,-15,15);panZGoal=clamp(panZGoal+dx*factor*.707+dy*factor*.866,-15,15);dirty=true;wake();
  }
  pointer.x=event.clientX;pointer.y=event.clientY;
 }
 function release(event){
  if(event.pointerId!==pointer.id)return;
  const click=pointer.down&&!pointer.dragged&&event.type==='pointerup'&&Math.hypot(event.clientX-pointer.startX,event.clientY-pointer.startY)<8;
  pointer.down=false;pointer.id=null;canvas.classList.remove('dragging');
  if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
  if(click){const hit=hitTest(event);if(hit)onNavigate(hit);}
 }
 function key(event){const step=1.5;switch(event.key){case'ArrowLeft':panXGoal-=step;panZGoal+=step;break;case'ArrowRight':panXGoal+=step;panZGoal-=step;break;case'ArrowUp':panXGoal-=step;panZGoal-=step;break;case'ArrowDown':panXGoal+=step;panZGoal+=step;break;case'+':case'=':zoomGoal=clamp(zoomGoal*1.15,.8,1.7);break;case'-':zoomGoal=clamp(zoomGoal/1.15,.8,1.7);break;default:return;}event.preventDefault();panXGoal=clamp(panXGoal,-15,15);panZGoal=clamp(panZGoal,-15,15);dirty=true;wake();}
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);canvas.addEventListener('keydown',key);
 const observer=new ResizeObserver(resize);observer.observe(canvas);coarse.addEventListener('change',resize);
 const visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){last=0;dirty=true;wake();}else{cancelAnimationFrame(raf);raf=0;}});visibility.observe(canvas);
 function visibilityChange(){if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=0;dirty=true;wake();}}
 document.addEventListener('visibilitychange',visibilityChange);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();disposed=true;cancelAnimationFrame(raf);onError(new Error('Village graphics unavailable.'));});
 resize();applyCamera();life.update(0,night,false);try{await renderer.compileAsync(scene,camera);}catch(error){onError(error);return null;}wake();
 return {setActive(value){if(enabled===value)return;enabled=value;if(value){last=0;dirty=true;wake();}else{cancelAnimationFrame(raf);raf=0;}},setProgress(p){const next=clamp(p,0,cameraStops.length-1);if(progressGoal===next)return;progressGoal=next;dirty=true;wake();},setNight(value){nightGoal=value?1:0;dirty=true;wake();},setPaused(value){paused=value;dirty=true;wake();},reset(){panXGoal=panZGoal=0;zoomGoal=1;dirty=true;wake();},zoomBy(factor){zoomGoal=clamp(zoomGoal*factor,.8,1.7);dirty=true;wake();},dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();coarse.removeEventListener('change',resize);visibility.disconnect();document.removeEventListener('visibilitychange',visibilityChange);life.dispose();shadowMaterial.map.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});Object.values(textures).forEach(t=>t.dispose());renderer.dispose();}};
}
