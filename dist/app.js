import {PHONE_LAYOUT_QUERY} from './responsive.js';
import {setupEventUI} from './event-ui.js';
import {loadPartners} from './partners.js';
const body=document.body,experience=document.querySelector('.experience'),stage=document.querySelector('.world-stage');
const chapters=[...document.querySelectorAll('[data-scene]')],guide=document.querySelector('#intel'),partners=document.querySelector('#partners'),worldEnd=document.querySelector('#prizes');
const copy=document.querySelector('.hero-copy'),action=document.querySelector('.hero-action');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),compact=matchMedia(PHONE_LAYOUT_QUERY+', (max-height: 670px)');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),topOf=element=>element.getBoundingClientRect().top+scrollY;
const navLinks=[...document.querySelectorAll('.desktop-nav a')],chapterCount=document.querySelector('#chapter-count');
const routes={hackathon:'/neural-nexus/',pitch:'/startush-smackdown/'};
let world=null,current=-1,currentLayout=null,scheduled=false,progress=0,outside=null,layoutDirty=true,navRegion=-1;
let layout={condensed:null};
const ui=setupEventUI(()=>world);
const worldLayer=document.createElement('div');worldLayer.className='world-layer';
for(const selector of ['.map-backdrop','.world-fallback','.fallback-shade','#world-canvas','.map-vignette','.world-pins','.world-controls','.scene-status'])worldLayer.append(stage.querySelector(selector));
document.querySelector('main').before(worldLayer);body.classList.add('immersive');
function measure(){
 const condensed=compact.matches;
 if(layout.condensed!==condensed)body.classList.toggle('compact-view',condensed);
 // All geometry reads are grouped here, after a real resize/content change, never on every scroll.
 layout={condensed,viewport:innerHeight,origin:topOf(experience),range:Math.max(1,experience.offsetHeight-stage.offsetHeight),worldEndTop:topOf(worldEnd),guideTop:topOf(guide),partnersTop:topOf(partners),stops:condensed?chapters.map(element=>Math.max(0,topOf(element)-innerHeight*.16)):[]};
 layoutDirty=false;
}
function update(){
 scheduled=false;if(layoutDirty)measure();
 const {condensed,stops}=layout,y=scrollY;
 if(condensed){progress=0;for(let i=0;i<stops.length-1;i++)if(y>=stops[i])progress=i+clamp((y-stops[i])/Math.max(1,stops[i+1]-stops[i]),0,1);}
 else progress=clamp((y-layout.origin)/layout.range*3,0,3);
 const nextOutside=y>=layout.worldEndTop,guideActive=y>layout.guideTop-layout.viewport*.45,partnersActive=y>layout.partnersTop-layout.viewport*.45;
 if(outside!==nextOutside){outside=nextOutside;body.classList.toggle('off-village',outside);worldLayer.inert=outside;worldLayer.setAttribute('aria-hidden',String(outside));world?.setActive(!outside);}
 if(!outside)world?.setProgress(progress);
 const region=partnersActive?2:guideActive?1:0;
 if(region!==navRegion){navRegion=region;for(const link of navLinks){const selected=link.hasAttribute('data-partners-link')?region===2:link.hasAttribute('data-guide-link')?region===1:link.dataset.chapter==='0'&&region===0;link.classList.toggle('active',selected);if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}}
 const active=Math.round(progress);if(active===current&&condensed===currentLayout)return;current=active;currentLayout=condensed;stage.dataset.activeScene=String(active);chapterCount.textContent=String(active+1).padStart(2,'0');
 chapters.forEach((chapter,i)=>{const visible=condensed||i===active;chapter.classList.toggle('active',visible);chapter.inert=!visible;chapter.setAttribute('aria-hidden',String(!visible));chapter.dataset.condensed=String(condensed);});
 const intro=active===0||condensed;stage.classList.toggle('intro-active',intro);stage.classList.toggle('story-active',!condensed&&(active===1||active===2));
 copy.inert=action.inert=!intro;copy.setAttribute('aria-hidden',String(!intro));action.setAttribute('aria-hidden',String(!intro));
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
function invalidate(){layoutDirty=true;schedule();}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',invalidate,{passive:true});compact.addEventListener('change',()=>{current=-1;invalidate();});
const contentObserver=new ResizeObserver(invalidate);for(const element of [experience,worldEnd,guide,partners])contentObserver.observe(element);
function jump(index,hash){
 document.querySelectorAll('dialog[open]').forEach(d=>d.close());world?.reset();if(layoutDirty)measure();
 if(compact.matches)document.querySelector(hash)?.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
 else window.scrollTo({top:layout.origin+layout.range/3*index,behavior:reduced.matches?'instant':'smooth'});
 if(hash)history.replaceState(null,'',hash);
}
document.querySelectorAll('.journey-link').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();jump(Number(link.dataset.chapter),link.getAttribute('href'));}));
document.querySelectorAll('a[href="#intel"],a[href="#partners"]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();const hash=link.getAttribute('href');document.querySelector(hash).scrollIntoView({behavior:reduced.matches?'instant':'smooth'});history.replaceState(null,'',hash);}));
update();loadPartners();document.fonts?.ready.then(invalidate);
import('./world.js').then(async({createWorld})=>{
 world=await createWorld(document.querySelector('#world-canvas'),{hackathon:document.querySelector('#pin-hackathon'),pitch:document.querySelector('#pin-pitch'),intel:document.querySelector('#pin-intel')},()=>{
  body.classList.add('world-ready');document.querySelector('#scene-status').textContent='Village ready.';
 },()=>{body.classList.remove('world-ready');body.classList.add('world-failed');document.querySelector('#scene-status').textContent='Using the illustrated view. All event details are available.';},destination=>{
  if(routes[destination])location.assign(routes[destination]);else guide.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
 });
 if(world){world.setProgress(progress);world.setActive(!outside);ui.apply();}
}).catch(()=>{body.classList.add('world-failed');document.querySelector('#scene-status').textContent='Using the illustrated view. All event details are available.';});
const hashIndex={'#village':0,'#hackathon':1,'#pitch':2,'#quest':3};
if(location.hash in hashIndex)requestAnimationFrame(()=>{if(!compact.matches)scrollTo({top:layout.origin+layout.range/3*hashIndex[location.hash],behavior:'instant'});});
