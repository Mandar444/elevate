const body=document.body;
const experience=document.querySelector('.experience');
const stage=document.querySelector('.world-stage');
const chapters=[...document.querySelectorAll('[data-scene]')];
const copy=document.querySelector('.hero-copy'),action=document.querySelector('.hero-action');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const compact=matchMedia('(max-height: 670px), (max-width: 760px) and (max-height: 770px)');
const registration=document.querySelector('#registration-dialog');
const trackDialog=document.querySelector('#track-dialog');
let world=null,current=-1,scheduled=false,progress=0,isNight=false;

// The village persists through the entire journey; only the event copy uses the sticky stage.
const worldLayer=document.createElement('div');worldLayer.className='world-layer';
for(const selector of ['.map-backdrop','.world-fallback','.fallback-shade','#world-canvas','.map-vignette','.world-pins','.world-controls','.scene-status'])worldLayer.append(stage.querySelector(selector));
document.querySelector('main').before(worldLayer);
const guide=document.querySelector('#intel'),rally=document.querySelector('#rally');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const topOf=element=>element.getBoundingClientRect().top+scrollY;
body.classList.add('immersive');
function update(){
  scheduled=false;
  const condensed=compact.matches;
  body.classList.toggle('compact-view',condensed);
  const range=Math.max(1,experience.offsetHeight-stage.offsetHeight);
  if(condensed){
    const stops=[chapters[0],chapters[1],chapters[2],chapters[3],guide,rally].map(element=>Math.max(0,topOf(element)-innerHeight*.16));
    progress=0;
    for(let i=0;i<stops.length-1;i++)if(scrollY>=stops[i])progress=i+clamp((scrollY-stops[i])/Math.max(1,stops[i+1]-stops[i]),0,1);
  }else{
    const start=topOf(experience),end=start+range;
    progress=clamp((scrollY-start)/range*3,0,3);
    if(scrollY>end)progress=3+clamp((scrollY-end)/innerHeight,0,1)+clamp((scrollY-(topOf(rally)-innerHeight*.65))/(innerHeight*.65),0,1);
  }
  const active=Math.min(3,Math.round(progress));
  world?.setProgress(progress);
  worldLayer.classList.toggle('guide-view',progress>=3.6&&progress<4.65);
  worldLayer.classList.toggle('rally-view',progress>=4.65);
  document.querySelector('#chapter-count').textContent=String(Math.round(progress)+1).padStart(2,'0');
  document.querySelectorAll('.desktop-nav a').forEach(link=>{
    const selected=link.hasAttribute('data-guide-link')?progress>=2.6:Number(link.dataset.chapter)===Math.round(progress)&&progress<2.6;
    link.classList.toggle('active',selected);
    if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  });
  if(active===current&&!condensed&&chapters.every(c=>c.dataset.condensed!=='true'))return;
  current=active;
  stage.dataset.activeScene=String(active);
  chapters.forEach((chapter,i)=>{
    const visible=condensed||i===active;
    chapter.classList.toggle('active',visible);
    chapter.inert=!visible;
    chapter.setAttribute('aria-hidden',String(!visible));
    chapter.dataset.condensed=String(condensed);
  });
  const intro=active===0||condensed;
  stage.classList.toggle('intro-active',intro);
  stage.classList.toggle('story-active',!condensed&&(active===1||active===2));
  copy.inert=action.inert=!intro;
  copy.setAttribute('aria-hidden',String(!intro));action.setAttribute('aria-hidden',String(!intro));
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});compact.addEventListener('change',()=>{current=-1;schedule();});
function jump(index,hash){
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  world?.reset();
  if(compact.matches){document.querySelector(hash)?.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});}
  else {const range=experience.offsetHeight-stage.offsetHeight;window.scrollTo({top:experience.offsetTop+range/3*index,behavior:reduced.matches?'instant':'smooth'});}
  if(hash)history.replaceState(null,'',hash);
}
document.querySelectorAll('.journey-link').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();jump(Number(link.dataset.chapter),link.getAttribute('href'));}));
document.querySelectorAll('a[href="#intel"]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();world?.reset();guide.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});history.replaceState(null,'','#intel');}));
document.querySelectorAll('.registration-trigger').forEach(button=>button.addEventListener('click',()=>registration.showModal()));
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
});
const tracks={
  hackathon:{label:'BATTLE 01 · BUILDER’S CAMP',title:'THE HACKATHON',image:'/assets/props/laboratory.webp',alt:'Clash of Clans laboratory building.',description:'Start with a real problem. Explore possibilities, build a working solution, and show what your idea can do.',prompts:['Find a problem you care about.','Make your idea tangible with a prototype.','Prepare a clear demonstration of your solution.']},
  pitch:{label:'BATTLE 02 · THE PITCH ARENA',title:'THE BUSINESS PITCH',image:'/assets/props/clan-castle.webp',alt:'Clash of Clans Clan Castle building.',description:'Turn an insight into a business worth believing in. Show the opportunity, explain your approach, and bring your vision to life.',prompts:['Understand your audience and the problem.','Shape a business model around your solution.','Tell a focused, convincing story.']}
};
document.querySelectorAll('.track-trigger').forEach(button=>button.addEventListener('click',()=>{
  const track=tracks[button.dataset.track];
  document.querySelector('#track-eyebrow').textContent=track.label;
  document.querySelector('#track-title').textContent=track.title;
  document.querySelector('#track-description').textContent=track.description;
  const img=document.querySelector('#track-image');img.src=track.image;img.alt=track.alt;
  document.querySelector('#track-checklist').replaceChildren(...track.prompts.map((text,index)=>{const p=document.createElement('p'),n=document.createElement('span');n.textContent=String(index+1).padStart(2,'0');p.append(n,document.createTextNode(text));return p;}));
  trackDialog.showModal();
}));
document.querySelector('#track-register').addEventListener('click',()=>{trackDialog.close();registration.showModal();});
document.querySelector('#year').textContent=String(new Date().getFullYear());
const lightButton=document.querySelector('#light-toggle');
function setNight(value){isNight=value;body.classList.toggle('night',value);lightButton.setAttribute('aria-pressed',String(value));lightButton.setAttribute('aria-label',value?'Switch to daylight':'Switch to moonlight');document.querySelector('#light-icon').textContent=value?'☾':'☀';document.querySelector('#light-label').textContent=value?'Moonlight':'Daylight';world?.setNight(value);}
lightButton.addEventListener('click',()=>setNight(!isNight));
const motionButton=document.querySelector('#motion-toggle');let motionPaused=reduced.matches;
function setMotion(paused){motionPaused=paused;motionButton.setAttribute('aria-pressed',String(paused));motionButton.setAttribute('aria-label',paused?'Resume village animation':'Pause village animation');motionButton.querySelector('span').textContent=paused?'▶':'Ⅱ';world?.setPaused(paused);}
motionButton.addEventListener('click',()=>setMotion(!motionPaused));reduced.addEventListener('change',()=>setMotion(reduced.matches));setMotion(motionPaused);
document.querySelector('#reset-view').addEventListener('click',()=>world?.reset());
document.querySelector('#zoom-in').addEventListener('click',()=>world?.zoomBy(1.15));
document.querySelector('#zoom-out').addEventListener('click',()=>world?.zoomBy(1/1.15));
update();
// Rendering is a progressive enhancement. Navigation, briefs and registration remain usable if it fails.
import('./world.js').then(async({createWorld})=>{
  world=await createWorld(document.querySelector('#world-canvas'),{hackathon:document.querySelector('#pin-hackathon'),pitch:document.querySelector('#pin-pitch'),intel:document.querySelector('#pin-intel')},()=>{
    body.classList.add('world-ready');document.querySelector('#scene-status').textContent='Village ready.';
  },()=>{body.classList.remove('world-ready');body.classList.add('world-failed');document.querySelector('#scene-status').textContent='Using the illustrated view. All event details are available.';},destination=>{
    if(destination==='intel')document.querySelector('#intel').scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
    else jump(destination==='hackathon'?1:2,'#'+destination);
  });
  if(world){world.setProgress(progress);world.setNight(isNight);world.setPaused(motionPaused);}
}).catch(()=>{body.classList.add('world-failed');document.querySelector('#scene-status').textContent='Using the illustrated view. All event details are available.';});
const hashIndex={'#village':0,'#hackathon':1,'#pitch':2,'#quest':3};
if(location.hash in hashIndex){requestAnimationFrame(()=>{const range=experience.offsetHeight-stage.offsetHeight;if(!compact.matches)scrollTo({top:experience.offsetTop+range/3*hashIndex[location.hash],behavior:'instant'});});}
