import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const routes=['/','/neural-nexus/','/startush-smackdown/','/team/','/past-editions/'];
export function deploymentOrigin(env){
 const value=env.SITE_URL||(env.VERCEL_PROJECT_PRODUCTION_URL&&'https://'+env.VERCEL_PROJECT_PRODUCTION_URL)||(env.VERCEL_URL&&'https://'+env.VERCEL_URL);
 if(!value)return null;
 const parsed=new URL(value);
 if(!['https:','http:'].includes(parsed.protocol)||parsed.username||parsed.password||parsed.search||parsed.hash||(parsed.pathname!=='/'&&parsed.pathname!==''))throw new Error('SITE_URL must be a complete HTTP(S) origin, without a path or credentials.');
 return parsed.origin;
}
export function metadataForOrigin(html,origin,route){
 const canonical=new URL(route,origin).href;
 html=html.replace(/(<link rel="canonical" href=")[^"]+("\s*\/?>)/,'$1'+canonical+'$2');
 html=html.replace(/(<meta property="og:url" content=")[^"]+("\s*\/?>)/,'$1'+canonical+'$2');
 return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_,json)=>{
  const data=JSON.parse(json);data.url=canonical;if(data.isPartOf?.['@type']==='WebSite')data.isPartOf.url=origin+'/';return '<script type="application/ld+json">'+JSON.stringify(data)+'</script>';
 });
}
export async function prepareDeployment(dist,env){
 const origin=deploymentOrigin(env);
 if(!origin){console.log('Static pages ready; existing preview metadata retained.');return;}
 for(const route of routes){const file=path.join(dist,route,'index.html');const html=await fs.readFile(file,'utf8');await fs.writeFile(file,metadataForOrigin(html,origin,route));}
 await fs.writeFile(path.join(dist,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(route=>'<url><loc>'+new URL(route,origin).href+'</loc></url>').join('')+'</urlset>\n');
 await fs.writeFile(path.join(dist,'robots.txt'),'User-agent: *\nAllow: /\n\nSitemap: '+origin+'/sitemap.xml\n');
 console.log('Static pages and deployment metadata are ready.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await prepareDeployment(path.join(root,'dist'),process.env);
