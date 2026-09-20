import {runText} from './text.js';
import {runCalc} from './calc.js';
import {runDev} from './dev.js';
import {runPage} from './page.js';
import {runSystem} from './system.js';
import {runSecurity} from './security.js';
import {getImplementation} from '../ui/registry.js';
export async function runTool(name,ctx={}){
 const groups=[runText,runCalc,runDev,runPage,runSystem,runSecurity];
 for(const fn of groups){try{const r=await fn(name,ctx);if(r!==null&&r!==undefined)return typeof r==='string'?r:JSON.stringify(r,null,2)}catch(e){throw e}}
 const phaseImpl=getImplementation(name);
 if(phaseImpl){const r=await phaseImpl.run(ctx.text ?? '',ctx);return typeof r==='string'?r:JSON.stringify(r,null,2)}
 const s=String(ctx.text??''),n=name.toLowerCase();
 if(n==='copy url as markdown/html/citation')return ctx.tab?.url?`[${ctx.tab.title||ctx.tab.url}](${ctx.tab.url})`:'';
 if(n==='extract links/images/emails/phones/hashtags/mentions'&&ctx.tab?.id){const r=await chrome.scripting.executeScript({target:{tabId:ctx.tab.id},func:()=>[...document.querySelectorAll('a')].map(a=>a.href)});return JSON.stringify(r[0]?.result||[],null,2)}
 if(n==='page→markdown/plain text/clean html/json'&&ctx.tab?.id){const r=await chrome.scripting.executeScript({target:{tabId:ctx.tab.id},func:()=>document.body.innerText});return r[0]?.result||''}
 if(n==='browser info')return JSON.stringify({userAgent:navigator.userAgent,language:navigator.language,platform:navigator.platform,online:navigator.onLine},null,2);
 if(n==='screen resolution viewer')return `${screen.width} × ${screen.height}`;
 if(n==='credit card validator (luhn)'){const d=s.replace(/\D/g,'');let sum=0,alt=false;for(let i=d.length-1;i>=0;i--){let x=+d[i];if(alt){x*=2;if(x>9)x-=9}sum+=x;alt=!alt}return d.length>=12&&sum%10===0?'Valid':'Invalid'}
 return `Catalog entry: ${name}\n\nA dedicated handler has not yet been implemented in this build. The registry entry is retained so the catalog remains complete.`;
}
