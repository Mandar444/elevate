import {setupEventUI} from './event-ui.js';
setupEventUI(()=>null);

function webUrl(value){if(typeof value!=='string'||!value.trim())return null;try{const url=new URL(value,location.origin);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}}
const element=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text)node.textContent=text;return node;};
const photoDialog=document.querySelector('#photo-dialog'),photoImage=document.querySelector('#archive-photo-full');
let album=[],photoIndex=0,albumYear='';
function showPhoto(index){
 photoIndex=(index+album.length)%album.length;const photo=album[photoIndex];
 photoImage.src=webUrl(photo.src);photoImage.alt=photo.alt||photo.caption||'Elevate '+albumYear+' event photograph';
 document.querySelector('#photo-caption').textContent=photo.caption||photo.alt||'Elevate '+albumYear;
 document.querySelector('#photo-credit').textContent=photo.credit?'Photo: '+photo.credit:'';
 document.querySelector('#photo-count').textContent=(photoIndex+1)+' / '+album.length;
 document.querySelector('#photo-dialog-title').textContent='ELEVATE '+albumYear+' · THE ALBUM';
 document.querySelectorAll('.photo-step').forEach(button=>button.hidden=album.length<2);
 if(!photoDialog.open)photoDialog.showModal();
}
document.querySelector('#photo-prev').addEventListener('click',()=>showPhoto(photoIndex-1));
document.querySelector('#photo-next').addEventListener('click',()=>showPhoto(photoIndex+1));
photoDialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();showPhoto(photoIndex+(event.key==='ArrowLeft'?-1:1));}});
photoImage.addEventListener('error',()=>{photoImage.hidden=true;document.querySelector('#photo-caption').textContent='This photograph is temporarily unavailable.';});
photoImage.addEventListener('load',()=>photoImage.hidden=false);
photoDialog.addEventListener('close',()=>{photoImage.removeAttribute('src');});
function personCard(person){
 const card=element('article','archive-person'),portrait=element('div','archive-portrait');
 const initials=element('span','',person.name.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase());portrait.setAttribute('aria-hidden','true');portrait.append(initials);
 const photo=webUrl(person.photo);if(photo){const image=element('img');image.src=photo;image.alt='';image.width=160;image.height=160;image.loading='lazy';image.decoding='async';image.addEventListener('error',()=>image.replaceWith(initials),{once:true});portrait.replaceChildren(image);}
 card.append(portrait,element('h4','',person.name));
 if(person.role)card.append(element('p','archive-person-role',person.role));
 if(person.organization)card.append(element('p','archive-person-org',person.organization));
 const url=webUrl(person.profileUrl);if(url){const link=element('a','archive-person-link','View profile ↗');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','View '+person.name+'’s profile');card.append(link);}return card;
}
async function loadArchive(){
 try{
  const response=await fetch('/content/past-editions.json');if(!response.ok)return;const data=await response.json();
  for(const edition of data.editions||[]){
   if(![2024,2025].includes(edition.year))continue;
   for(const key of ['judges','guests']){
    const people=Array.isArray(edition[key])?edition[key].filter(p=>typeof p?.name==='string'&&p.name.trim()):[];
    if(people.length){document.querySelector('#'+key+'-'+edition.year).replaceChildren(...people.map(personCard));document.querySelector('#'+key+'-status-'+edition.year).textContent=key==='judges'?'THE JUDGING PANEL':'THE PEOPLE WHO JOINED US';}
   }
   const photos=Array.isArray(edition.photos)?edition.photos.filter(photo=>webUrl(photo?.src)):[];
   if(!photos.length)continue;
   const gallery=document.querySelector('#photos-'+edition.year);
   gallery.replaceChildren(...photos.map((photo,index)=>{
    const figure=element('figure','archive-photo'),button=element('button','archive-photo-open'),image=element('img');
    image.src=webUrl(photo.src);image.alt=photo.alt||photo.caption||'Elevate '+edition.year+' event photograph';image.width=800;image.height=600;image.loading='lazy';image.decoding='async';button.setAttribute('aria-label','Open photo '+(index+1)+': '+image.alt);
    image.addEventListener('error',()=>{button.replaceChildren(element('span','photo-unavailable','Photograph unavailable'));},{once:true});
    button.append(image,element('span','photo-expand','View photo ↗'));button.addEventListener('click',()=>{album=photos;albumYear=edition.year;showPhoto(index);});figure.append(button);
    if(photo.caption)figure.append(element('figcaption','',photo.caption));return figure;
   }));
   document.querySelector('#photos-status-'+edition.year).textContent='EXPLORE THE ALBUM';
  }
 }catch{/* Keep clear announcement spaces while the archive is being assembled. */}
}
loadArchive();
