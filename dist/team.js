import {setupEventUI} from './event-ui.js';
setupEventUI(()=>null);
const element=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text)node.textContent=text;return node;};
function webUrl(value){if(typeof value!=='string'||!value.trim())return null;try{const url=new URL(value,location.origin);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}}
function memberCard(member,index){
 const featured=member.featured===true;
 const card=element('article','team-member'+(featured?' team-member--president':''));
 const portraitColumn=element('div','member-portrait-column'),portrait=element('div','member-photo');portrait.setAttribute('aria-hidden','true');
 const initials=element('span','',member.name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase());portrait.append(initials);
 const photo=webUrl(member.photo),photoNote=element('p','member-photo-note','Portrait coming soon');
 if(photo){const image=element('img');image.src=photo;image.alt='';image.width=400;image.height=500;image.loading='lazy';image.decoding='async';image.addEventListener('error',()=>{image.replaceWith(initials);if(featured&&!photoNote.isConnected)portraitColumn.append(photoNote);},{once:true});portrait.replaceChildren(image);}
 portraitColumn.append(portrait);if(featured&&!photo)portraitColumn.append(photoNote);card.append(portraitColumn);
 const content=element('div','member-content');content.append(element('span','member-number',featured?'E-CELL · THE PRESIDENT':'THE CLAN · '+String(index+1).padStart(2,'0')));
 content.append(element('h3','',member.name),element('p','member-role',member.role||'Team member'));
 if(featured)content.append(element('p','member-message','Bringing builders, founders and the community together for Elevate 3.0.'));
 const socials=element('div','member-socials');
 for(const [key,label] of [['linkedin','LinkedIn'],['instagram','Instagram'],['profileUrl','View profile']]){
  const href=webUrl(member[key]);if(!href)continue;
  const link=element('a','',label+' ↗');link.href=href;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',member.name+' on '+label);socials.append(link);
 }
 if(socials.children.length)content.append(socials);
 if(featured){const contact=element('a','member-contact','Contact the team ↗');contact.href='/contact/';content.append(contact);}
 card.append(content);return card;
}
async function loadTeam(){
 try{
  const response=await fetch('/content/team.json');if(!response.ok)return;
  const data=await response.json(),members=Array.isArray(data.members)?data.members.filter(member=>typeof member?.name==='string'&&member.name.trim()):[];
  if(!members.length)return;
  document.querySelector('#team-grid').replaceChildren(...members.map(memberCard));
 }catch{/* The confirmed president remains available in the static HTML. */}
}
loadTeam();
