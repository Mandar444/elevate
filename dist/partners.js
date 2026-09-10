function webUrl(value){try{const url=new URL(value,location.origin);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}}
export async function loadPartners(){
 try{
  const response=await fetch('/content/partners.json');if(!response.ok)return;const data=await response.json();
  for(const [key,id] of [['sponsors','sponsor-grid'],['communityPartners','community-grid']]){
   const list=Array.isArray(data[key])?data[key].filter(item=>typeof item.name==='string'&&item.name.trim()):[];if(!list.length)continue;
   const grid=document.getElementById(id);grid.replaceChildren(...list.map(partner=>{
    const href=partner.url&&webUrl(partner.url),card=document.createElement(href?'a':'div');card.className='partner-card';
    if(href){card.href=href;card.target='_blank';card.rel='noopener noreferrer';}
    const logo=partner.logo&&webUrl(partner.logo);if(logo){const image=document.createElement('img');image.src=logo;image.alt='';image.loading='lazy';image.width=240;image.height=100;image.addEventListener('error',()=>image.remove(),{once:true});card.append(image);}
    const name=document.createElement('span');name.textContent=partner.name;card.append(name);return card;
   }));
   grid.previousElementSibling.querySelector('span').textContent=key==='sponsors'?'SUPPORTING ELEVATE ’26':'BUILDING TOGETHER';
  }
  if(data.sponsors?.length||data.communityPartners?.length)document.querySelector('.alliance-note').textContent='Together, we give ideas room to grow.';
 }catch{/* Keep the useful announcement space when no partner roster is available. */}
}
