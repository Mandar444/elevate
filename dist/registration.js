export function registrationUrl(value){
 if(typeof value!=='string'||!value.trim())return null;
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null;}catch{return null;}
}
export async function setupRegistrationLinks(){
 try{
  const response=await fetch('/content/registration.json');if(!response.ok)return;
  const data=await response.json();
  for(const key of ['neural','startup']){
   const slot=document.querySelector(`[data-registration-slot="${key}"]`),href=registrationUrl(data.links?.[key]);
   if(!slot||!href)continue;
   const link=document.createElement('a');link.className='button button-gold';link.href=href;link.target='_blank';link.rel='noopener noreferrer';
   link.textContent='Register on Unstop ↗';link.setAttribute('aria-label','Register for '+(key==='neural'?'Neural Nexus':'Startup Smackdown')+' on Unstop');slot.replaceChildren(link);
  }
 }catch{/* Keep the planned dates and honest pending-link notice available. */}
}
