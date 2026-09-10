import {setupEventUI} from './event-ui.js';
setupEventUI(()=>null);
document.querySelector('.dialog-return').addEventListener('click',()=>document.querySelector('#registration-dialog').close());
function webUrl(value){if(typeof value!=='string'||!value.trim())return null;try{const url=new URL(value,location.origin);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}}
async function loadTeam(){
 try{
  const response=await fetch('/content/team.json');if(!response.ok)return;
  const data=await response.json(),members=Array.isArray(data.members)?data.members.filter(member=>typeof member?.name==='string'&&member.name.trim()):[];
  if(!members.length)return;
  const cards=members.map((member,index)=>{
   const card=document.createElement('article');card.className='team-member';
   const number=document.createElement('span');number.className='member-number';number.textContent='THE CLAN · '+String(index+1).padStart(2,'0');card.append(number);
   const portrait=document.createElement('div');portrait.className='member-photo';portrait.setAttribute('aria-hidden','true');
   const initials=document.createElement('span');initials.textContent=member.name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();portrait.append(initials);
   const photo=webUrl(member.photo);if(photo){const image=document.createElement('img');image.src=photo;image.alt='';image.width=200;image.height=200;image.loading='lazy';image.addEventListener('error',()=>image.replaceWith(initials),{once:true});portrait.replaceChildren(image);}card.append(portrait);
   const name=document.createElement('h3');name.textContent=member.name;card.append(name);
   const role=document.createElement('p');role.className='member-role';role.textContent=typeof member.role==='string'&&member.role.trim()?member.role:'Team member';card.append(role);
   const href=webUrl(member.profileUrl);if(href){const profile=document.createElement('a');profile.className='member-profile';profile.href=href;profile.target='_blank';profile.rel='noopener noreferrer';profile.textContent='View profile ↗';profile.setAttribute('aria-label','View '+member.name+'’s profile');card.append(profile);}
   return card;
  });
  document.querySelector('#team-grid').replaceChildren(...cards);
  document.querySelector('#roster-description').textContent='Meet the people bringing Elevate ’26 to life.';
  document.querySelector('#team-roster-note').textContent='One team. Two arenas. The third edition of Elevate.';
 }catch{/* The static roster remains available until confirmed team details are supplied. */}
}
loadTeam();
