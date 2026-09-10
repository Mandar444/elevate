import {setupEventUI} from './event-ui.js';
const neural=document.body.dataset.competition==='neural',hero=document.querySelector('.competition-hero');
let world=null;document.body.classList.add('immersive');const ui=setupEventUI(()=>world,{night:neural});
document.querySelector('.dialog-return').addEventListener('click',()=>document.querySelector('#registration-dialog').close());
const headerObserver=new IntersectionObserver(([entry])=>document.body.classList.toggle('off-village',!entry.isIntersecting),{threshold:0});headerObserver.observe(hero);
function failed(){document.body.classList.remove('world-ready');document.body.classList.add('world-failed');document.querySelector('#scene-status').textContent='Using the illustrated view. All competition details are available.';}
import('./world.js').then(async({createWorld})=>{
 world=await createWorld(document.querySelector('#world-canvas'),{},()=>{document.body.classList.add('world-ready');document.querySelector('#scene-status').textContent='Arena ready.';},failed,destination=>{
  if(destination==='intel')location.assign('/#intel');else if((neural&&destination==='hackathon')||(!neural&&destination==='pitch'))document.querySelector('#mission').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});else location.assign(neural?'/startush-smackdown/':'/neural-nexus/');
 },{progress:neural?1:2,night:neural});if(world)ui.apply();
}).catch(failed);
