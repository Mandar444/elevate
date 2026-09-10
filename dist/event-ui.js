import {setupRegistrationLinks} from './registration.js';
export function setupEventUI(getWorld,{night=false}={}){
 const chromeObserver=new ResizeObserver(entries=>{for(const entry of entries){const name=entry.target.classList.contains('desktop-nav')?'--dock-height':'--header-height';document.documentElement.style.setProperty(name,Math.ceil(entry.target.getBoundingClientRect().height)+'px');}});
 for(const selector of ['.site-header','.desktop-nav']){const element=document.querySelector(selector);if(element)chromeObserver.observe(element);}
 setupRegistrationLinks();
 document.querySelectorAll('.dialog-return').forEach(button=>button.addEventListener('click',()=>document.querySelector('#registration-dialog')?.close()));
 const more=document.querySelector('.nav-more');
 if(more){more.addEventListener('click',event=>{if(event.target.closest('a'))more.open=false;});document.addEventListener('pointerdown',event=>{if(!more.contains(event.target))more.open=false;},{passive:true});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&more.open){more.open=false;more.querySelector('summary').focus();}});}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),registration=document.querySelector('#registration-dialog');
 let isNight=night,paused=reduced.matches;
 document.querySelectorAll('.registration-trigger').forEach(button=>button.addEventListener('click',()=>registration?.showModal()));
 document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.querySelector('.dialog-close')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
 });
 document.querySelector('#year').textContent=String(new Date().getFullYear());
 const light=document.querySelector('#light-toggle'),motion=document.querySelector('#motion-toggle');
 function apply(){
  document.body.classList.toggle('night',isNight);if(light){light.setAttribute('aria-pressed',String(isNight));light.setAttribute('aria-label',isNight?'Switch to daylight':'Switch to moonlight');
  document.querySelector('#light-icon').textContent=isNight?'☾':'☀';document.querySelector('#light-label').textContent=isNight?'Moonlight':'Daylight';}
  if(motion){motion.setAttribute('aria-pressed',String(paused));motion.setAttribute('aria-label',paused?'Resume village animation':'Pause village animation');motion.querySelector('span').textContent=paused?'▶':'Ⅱ';}
  getWorld()?.setNight(isNight);getWorld()?.setPaused(paused);
 }
 light?.addEventListener('click',()=>{isNight=!isNight;apply();});motion?.addEventListener('click',()=>{paused=!paused;apply();});reduced.addEventListener('change',()=>{paused=reduced.matches;apply();});
 document.querySelector('#reset-view')?.addEventListener('click',()=>getWorld()?.reset());
 document.querySelector('#zoom-in')?.addEventListener('click',()=>getWorld()?.zoomBy(1.15));document.querySelector('#zoom-out')?.addEventListener('click',()=>getWorld()?.zoomBy(1/1.15));
 apply();return {apply};
}
