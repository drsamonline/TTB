const page=(fn,tabId)=>chrome.scripting.executeScript({target:{tabId},func:fn});
const text=(v)=>String(v??'');

function pageFn(name,payload={}){
 return async()=>{
  const n=name.toLowerCase();
  const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const csv=rows=>rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');
  const all=(sel)=>[...document.querySelectorAll(sel)];
  if(n.includes('extract links/images/emails/phones/hashtags/mentions'))return {links:all('a[href]').map(a=>a.href),images:all('img[src]').map(i=>i.src),emails:[...document.body.innerText.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)].map(x=>x[0]),phones:[...document.body.innerText.matchAll(/(?:\+?\d[\d .()\-]{7,}\d)/g)].map(x=>x[0]),hashtags:[...document.body.innerText.matchAll(/#[\p{L}\d_]+/gu)].map(x=>x[0]),mentions:[...document.body.innerText.matchAll(/@[\w.-]+/g)].map(x=>x[0])};
  if(n==='extract tables→csv')return all('table').map(t=>csv(allRows(t))).join('\n\n');
  if(n==='extract form fields')return all('input,textarea,select,button').map(e=>({tag:e.tagName,name:e.name,id:e.id,type:e.type||'',value:e.value||'',placeholder:e.placeholder||'',required:e.required}));
  if(n==='extract meta tags')return all('meta').map(m=>({name:m.getAttribute('name'),property:m.getAttribute('property'),content:m.getAttribute('content')}));
  if(n==='extract headings/alt text')return {headings:all('h1,h2,h3,h4,h5,h6').map(x=>({tag:x.tagName,text:x.innerText.trim()})),alt:all('img').map(x=>({src:x.src,alt:x.alt}))};
  if(n==='extract iframes/scripts/stylesheets')return {iframes:all('iframe').map(x=>x.src),scripts:all('script[src]').map(x=>x.src),stylesheets:all('link[rel="stylesheet"]').map(x=>x.href)};
  if(n==='extract fonts/colors/svg')return {fonts:[...new Set(all('*').map(e=>getComputedStyle(e).fontFamily).filter(Boolean))],colors:[...new Set(all('*').flatMap(e=>[getComputedStyle(e).color,getComputedStyle(e).backgroundColor]).filter(Boolean))].slice(0,500),svg:all('svg').length};
  if(n==='extract videos/audio/pdf links')return {videos:all('video').map(x=>x.currentSrc||x.src),audio:all('audio').map(x=>x.currentSrc||x.src),pdf:all('a[href$=".pdf" i]').map(x=>x.href)};
  if(n.startsWith('page→'))return {title:document.title,url:location.href,text:document.body.innerText,html:document.documentElement.outerHTML};
  if(n==='reading mode'){document.body.dataset.ttbReading='1';document.documentElement.innerHTML=`<head><title>${esc(document.title)}</title><style>body{max-width:760px;margin:40px auto;padding:0 24px;font:18px/1.7 system-ui;color:#222}img{max-width:100%}a{color:#06c}</style></head><body><h1>${esc(document.title)}</h1><article>${esc(document.body.innerText).replace(/\n/g,'<br>')}</article></body>`;return 'Reading mode enabled';}
  const styles={
   'dark mode':'filter:invert(1) hue-rotate(180deg); background:#111 !important;', 'sepia':'filter:sepia(.75);','high contrast':'filter:contrast(1.35);','grayscale':'filter:grayscale(1);','dyslexia font':'font-family:Arial,sans-serif !important;letter-spacing:.04em;','larger text':'font-size:125% !important;','line-height adjuster':'line-height:1.8 !important;'
  };
  for(const [k,css] of Object.entries(styles))if(n===k){let s=document.getElementById('ttb-style');if(!s){s=document.createElement('style');s.id='ttb-style';document.documentElement.appendChild(s)}s.textContent=`html{${css}}`;return `${name} enabled`;}
  if(n==='print cleaner'){const s=document.createElement('style');s.id='ttb-print';s.textContent='@media print{nav,aside,header,footer,.advertisement,.ads{display:none!important}body{font:12pt serif!important}}';document.head.appendChild(s);print();return 'Print dialog opened';}
  if(n==='element hider'){const el=document.elementFromPoint(innerWidth/2,innerHeight/2);if(el){el.style.setProperty('display','none','important');return `Hidden ${el.tagName}`};return 'No element found';}
  if(n==='element picker'){const el=document.elementFromPoint(innerWidth/2,innerHeight/2);return el?{tag:el.tagName,id:el.id,class:el.className,text:el.innerText?.slice(0,200)}:null;}
  if(n==='computed css inspector'||n==='font inspector'||n==='box model inspector'){const el=document.elementFromPoint(innerWidth/2,innerHeight/2);if(!el)return 'No element found';const c=getComputedStyle(el),r=el.getBoundingClientRect();return {tag:el.tagName,id:el.id,class:el.className,box:{x:r.x,y:r.y,width:r.width,height:r.height},font:{family:c.fontFamily,size:c.fontSize,weight:c.fontWeight},display:c.display,position:c.position,color:c.color,background:c.backgroundColor};}
  if(n==='contrast auditor'){return all('*').map(e=>{const c=getComputedStyle(e);return {tag:e.tagName,text:e.innerText?.trim().slice(0,80),color:c.color,background:c.backgroundColor}}).filter(x=>x.text).slice(0,300);}
  if(n==='broken image detector')return all('img').filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src);
  if(n==='slow resource finder')return performance.getEntriesByType('resource').sort((a,b)=>b.duration-a.duration).slice(0,50).map(r=>({name:r.name,duration:r.duration,size:r.transferSize||0}));
  if(n==='page weight analyzer')return performance.getEntriesByType('resource').reduce((a,r)=>{a.count++;a.bytes+=(r.transferSize||0);a.ms=Math.max(a.ms,r.duration);return a},{count:0,bytes:0,ms:0});
  if(n==='seo snapshot')return {title:document.title,description:document.querySelector('meta[name="description"]')?.content||'',canonical:document.querySelector('link[rel="canonical"]')?.href||'',h1:all('h1').map(x=>x.innerText),robots:document.querySelector('meta[name="robots"]')?.content||''};
  if(n==='schema.org extractor')return all('script[type="application/ld+json"]').map(x=>{try{return JSON.parse(x.textContent)}catch{return {invalid:true,text:x.textContent}}});
  if(n==='hreflang checker')return all('link[rel="alternate"][hreflang]').map(x=>({lang:x.hreflang,url:x.href}));
  if(n==='canonical checker')return document.querySelector('link[rel="canonical"]')?.href||'No canonical link';
  if(n==='cookie banner dismisser'||n==='newsletter popup killer'){const terms=/cookie|consent|privacy|newsletter|subscribe|modal|popup|overlay/i;let count=0;all('div,section,aside,dialog').forEach(e=>{if(terms.test((e.id+' '+e.className+' '+e.innerText).slice(0,1000))){e.style.setProperty('display','none','important');count++}});return `Hidden ${count} candidate elements`;}
  if(n==='form autofill'){all('input,textarea').forEach(e=>{if(!e.value)e.value=payload.value||''});return 'Filled empty fields';}
  if(n==='form data exporter')return all('form').map(f=>Object.fromEntries(new FormData(f).entries()));
  if(n==='copy table as markdown/csv')return all('table').map(t=>csv(allRows(t))).join('\n\n');
  if(n==='video speed controller'){all('video').forEach(v=>v.playbackRate=payload.rate||2);return `Set ${all('video').length} videos to ${payload.rate||2}×`;}
  if(n==='autoplay blocker'){all('video,audio').forEach(v=>{v.autoplay=false;v.pause()});return 'Autoplay media paused';}
  if(n==='save scroll position'){scrollTo(0,payload.y||0);return scrollY;}
  return null;
 }
 function allRows(t){return [...t.rows].map(r=>[...r.cells].map(c=>c.innerText.trim()));}
}
function isPageTool(name){
 const n=String(name||'').toLowerCase();
 return n.includes('extract links/images/emails/phones/hashtags/mentions') ||
   n.startsWith('extract ') || n.startsWith('page→') ||
   ['reading mode','dark mode','sepia','high contrast','grayscale','dyslexia font','larger text','line-height adjuster','print cleaner','element hider','element picker','computed css inspector','font inspector','box model inspector','contrast auditor','broken image detector','slow resource finder','page weight analyzer','seo snapshot','schema.org extractor','hreflang checker','canonical checker','cookie banner dismisser','newsletter popup killer','form autofill','form data exporter','copy table as markdown/csv','video speed controller','autoplay blocker','save scroll position'].includes(n);
}
export async function runPage(name,ctx={}){
 const tabId=ctx.tab?.id;
 if(!tabId)return isPageTool(name) ? 'This tool requires an active tab.' : null;
 return (await page(pageFn(name,ctx),tabId))[0]?.result ?? null;
}
