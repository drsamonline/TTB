import dependencies from './dependencies.js';
const cache=new Map();
export function dependencyInfo(name){const d=dependencies[name];if(!d)throw new Error(`Unknown lazy dependency: ${name}`);return d;}
export function dependencyStatus(name){const d=dependencyInfo(name);return {name,...d,bundled:false,ready:false};}
export async function loadLocalDependency(name){
 if(cache.has(name))return cache.get(name);
 const d=dependencyInfo(name);
 const promise=(async()=>{try{
   const url=chrome.runtime.getURL(d.local); const r=await fetch(url,{cache:'no-store'});
   if(!r.ok)throw new Error(`HTTP ${r.status}`); const source=await r.text();
   if(!source.trim())throw new Error('empty file');
   if(d.local.endsWith('.mjs'))return await import(url);
   throw new Error('classic-script adapter not enabled');
 }catch(e){throw new Error(`${d.package}@${d.version} is not bundled. Add the exact local vendor file at ${d.local}.`);}})();
 cache.set(name,promise); try{return await promise}catch(e){cache.delete(name);throw e;}
}
