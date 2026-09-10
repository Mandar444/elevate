import {setupEventUI} from './event-ui.js';
setupEventUI(()=>null);
const element=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text)node.textContent=text;return node;};
const icons={
 linkedin:'<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V9h4v2"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
 instagram:'<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg>'
};
function webUrl(value){if(typeof value!=='string'||!value.trim())return null;try{const url=new URL(value,location.origin);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}}
function memberCard(member,index){
 const pending=!member,number=String(index+1).padStart(2,'0');
 const card=element('article','team-member'+(pending?' team-member--pending':''));
 const portrait=element('div','member-photo');portrait.setAttribute('aria-hidden','true');
 const initials=element('span','',pending?number:member.name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase());portrait.append(initials);
 const photo=webUrl(member?.photo);
 if(photo){
  const image=element('img');image.src=photo;image.alt=member.name+', '+(member.role||'E-Cell team member');image.width=member.photoWidth||400;image.height=member.photoHeight||400;image.loading='lazy';image.decoding='async';
  if(Array.isArray(member.photoSources)){const sources=member.photoSources.filter(s=>webUrl(s?.src)&&Number.isInteger(s.width)&&s.width>0);if(sources.length){image.srcset=sources.map(s=>webUrl(s.src)+' '+s.width+'w').join(', ');image.sizes='(max-width: 760px) calc((100vw - 60px) / 2), 260px';}}
  image.addEventListener('error',()=>{image.replaceWith(initials);portrait.setAttribute('aria-hidden','true');},{once:true});portrait.replaceChildren(image);portrait.removeAttribute('aria-hidden');
 }
 card.append(portrait);
 const content=element('div','member-content');content.append(element('span','member-number',number+' / E-CELL'),element('h3','',pending?'Revealing soon':member.name),element('p','member-role',pending?'Team member':member.role||'Team member'));
 if(pending)content.append(element('p','member-pending-note','Profile coming soon'));
 else{
  const socials=element('div','member-socials');
  for(const [key,label] of [['linkedin','LinkedIn'],['instagram','Instagram'],['profileUrl','Profile']]){
   const href=webUrl(member[key]);if(!href)continue;
   const link=element('a');link.href=href;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',member.name+' on '+label);link.title=label;
   if(icons[key])link.innerHTML=icons[key];else link.textContent='↗';socials.append(link);
  }
  if(socials.children.length)content.append(socials);
 }
 card.append(content);return card;
}
async function loadTeam(){
 try{
  const response=await fetch('/content/team.json');if(!response.ok)return;
  const data=await response.json(),members=Array.isArray(data.members)?data.members.filter(member=>typeof member?.name==='string'&&member.name.trim()):[];
  const slots=Math.max(members.length,Number.isInteger(data.slots)&&data.slots>0?data.slots:18);
  document.querySelector('#team-grid').replaceChildren(...Array.from({length:slots},(_,index)=>memberCard(members[index]||null,index)));
 }catch{/* The complete static roster remains available if the data request fails. */}
}
loadTeam();
