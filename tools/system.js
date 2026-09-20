const q=(api,...args)=>api(...args);
const tabQuery=(opts={})=>chrome.tabs.query(opts);
export async function runSystem(name,ctx={}){
 const n=name.toLowerCase();
 if(n==='tab search')return await tabQuery({}).then(ts=>ts.map(t=>({id:t.id,title:t.title,url:t.url,active:t.active,windowId:t.windowId})))
 if(n==='tab pinner'){if(ctx.tab?.id)await chrome.tabs.update(ctx.tab.id,{pinned:!ctx.tab.pinned});return 'Tab pin state toggled';}
 if(n==='tab muter'){if(ctx.tab?.id)await chrome.tabs.update(ctx.tab.id,{muted:!ctx.tab.mutedInfo?.muted});return 'Tab mute state toggled';}
 if(n==='tab reloader'){if(ctx.tab?.id)await chrome.tabs.reload(ctx.tab.id);return 'Tab reloaded';}
 if(n==='duplicate tab closer'){const ts=await tabQuery({});const seen=new Map(),closed=[];for(const t of ts){if(!t.url)continue;if(seen.has(t.url)&&t.id) {await chrome.tabs.remove(t.id);closed.push(t.id)}else seen.set(t.url,t.id)}return `Closed ${closed.length} duplicate tabs`;}
 if(n==='tab group manager'){if(!ctx.tab?.id)return 'Select a tab first';const gid=await chrome.tabs.group({tabIds:[ctx.tab.id]});return `Tab group ${gid} created`;}
 if(n==='tab suspender'){if(ctx.tab?.id){await chrome.tabs.discard(ctx.tab.id);return 'Tab discarded'}return 'No active tab';}
 if(n==='download manager')return await chrome.downloads.search({limit:100});
 if(n==='bookmark manager')return await chrome.bookmarks.getTree();
 if(n==='bookmark cleaner'||n==='bookmark deduplicator'){const all=await chrome.bookmarks.search({});const seen=new Set(),dupes=[];for(const b of all){if(!b.url)continue;if(seen.has(b.url))dupes.push(b);else seen.add(b.url)}return dupes;}
 if(n==='history search')return await chrome.history.search({text:ctx.text||'',maxResults:100});
 if(n==='history cleaner'){if(ctx.text)await chrome.history.deleteRange({startTime:0,endTime:Date.now()});return 'History clear requested';}
 if(n==='cache cleaner'||n==='cookie cleaner') {await chrome.browsingData.remove({},n==='cookie cleaner'?{cookies:true}:{cache:true});return `${name} completed`;}
 if(n==='localstorage viewer/editor'||n==='sessionstorage viewer/editor'||n==='indexeddb viewer')return ctx.tab?.id ? (await chrome.scripting.executeScript({target:{tabId:ctx.tab.id},func:(kind)=>{if(kind==='local')return Object.fromEntries(Object.entries(localStorage));if(kind==='session')return Object.fromEntries(Object.entries(sessionStorage));return indexedDB.databases?indexedDB.databases():[]},args:[n.startsWith('local')?'local':n.startsWith('session')?'session':'idb']}))[0]?.result : 'No active tab';
 if(n==='installed fonts viewer')return await chrome.fontSettings.getFontList();
 if(n==='zoom controller'){if(ctx.tab?.id){const z=ctx.zoom||1;await chrome.tabs.setZoom(ctx.tab.id,z);return `Zoom set to ${z*100}%`};return 'No active tab';}
 if(n==='font size controller'){if(ctx.tab?.id){await chrome.tabs.sendMessage(ctx.tab.id,{type:'ttb-font-size',value:ctx.size||'larger'}).catch(()=>{});return 'Font-size command sent'}return 'No active tab';}
 if(n==='screen resolution viewer')return `${screen.width} × ${screen.height}`;
 if(n==='device info viewer')return {platform:navigator.platform,userAgent:navigator.userAgent,languages:navigator.languages,online:navigator.onLine};
 if(n==='browser info viewer')return {userAgent:navigator.userAgent,language:navigator.language,platform:navigator.platform,chrome:typeof chrome!=='undefined'};
 if(n==='permission viewer')return await chrome.permissions.getAll();
 if(n==='extension manager')return await chrome.management.getAll();
 if(n==='notification blocker')return 'Chrome does not expose a universal notification blocker API; use site settings.';
 if(n==='popup blocker')return 'Chrome controls popup blocking at the browser/site level; TTB cannot globally disable it.';
 if(n==='theme toggler')return 'Theme follows TTB UI settings.';
 if(n==='language switcher')return navigator.language;
 if(n==='focus mode')return ctx.tab?.id?(await chrome.scripting.executeScript({target:{tabId:ctx.tab.id},func:()=>{document.documentElement.style.setProperty('scroll-behavior','auto');document.body.style.maxWidth='900px';document.body.style.margin='auto';return 'Focus mode applied';}}))[0].result:'No active tab';
 if(n==='import/export settings'||n==='backup/restore'){const data=await chrome.storage.local.get(null);return JSON.stringify(data,null,2)}
 if(n==='debug console')return {extensionVersion:chrome.runtime.getManifest().version,tabs:(await tabQuery({})).length};
 return null;
}
