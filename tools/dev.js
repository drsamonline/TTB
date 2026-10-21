function json(s,space=2){return JSON.stringify(JSON.parse(String(s)),null,space)}
export async function runDev(name,ctx={}){const s=String(ctx.text??''),n=name.toLowerCase();
 if(n==='json format/validate/minify'||n==='json viewer'){const o=JSON.parse(s);return n.includes('minify')?JSON.stringify(o):JSON.stringify(o,null,2)}
 if(n==='json→typescript'){const o=JSON.parse(s);return typeFor('Root',o)}
 if(n==='json→csv') {const a=JSON.parse(s);if(!Array.isArray(a))throw Error('Expected an array of objects');const keys=[...new Set(a.flatMap(x=>Object.keys(x)))];return [keys.join(','),...a.map(x=>keys.map(k=>csv(x[k])).join(','))].join('\n')}
 if(n==='json→sql/csv/yaml/xml') return JSON.stringify(JSON.parse(s),null,2);
 if(n==='yaml↔json'){return s.trim().startsWith('{')?json(s):yamlToJson(s)}
 if(n==='xml format')return s.replace(/></g,'>\n<');
 if(n==='base64 url-safe')return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 if(n==='base32')return base32(new TextEncoder().encode(s));
 if(n==='base58')return base58(new TextEncoder().encode(s));
 if(n==='url parser'){const u=new URL(s);return JSON.stringify({href:u.href,protocol:u.protocol,host:u.host,hostname:u.hostname,port:u.port,path:u.pathname,query:u.search,hash:u.hash},null,2)}
 if(n==='query string parser')return JSON.stringify(Object.fromEntries(new URLSearchParams(s)),null,2);
 if(n==='http header parser')return s.split(/\r?\n/).filter(Boolean).map(x=>{const i=x.indexOf(':');return [i<0?x:x.slice(0,i).trim(),i<0?'':x.slice(i+1).trim()]});
 if(n==='http status lookup')return ({200:'OK',201:'Created',204:'No Content',301:'Moved Permanently',302:'Found',304:'Not Modified',400:'Bad Request',401:'Unauthorized',403:'Forbidden',404:'Not Found',409:'Conflict',429:'Too Many Requests',500:'Internal Server Error',502:'Bad Gateway',503:'Service Unavailable'})[s.trim()]??'Unknown status';
 if(n==='mime lookup')return ({'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.csv':'text/csv','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf','.zip':'application/zip'})[s.trim().toLowerCase()]??'Unknown';
 if(n.startsWith('hash (md5/sha-1/256/512)')){const alg=(ctx.algorithm||'SHA-256').toUpperCase();const data=new TextEncoder().encode(s);const h=await crypto.subtle.digest(alg,data);return hex(new Uint8Array(h))}
 if(n==='hmac'){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(String(ctx.key??'')),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(s))))}
 if(n==='uuid v4/v7')return crypto.randomUUID();
 if(n==='jwt decode'){const p=s.split('.')[1];if(!p)throw Error('Invalid JWT');return JSON.stringify(JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/'))),null,2)}
 if(n==='color converter'){const m=s.match(/^#?([\da-f]{6})$/i);if(!m)throw Error('Use a 6-digit hex color');const h=m[1],r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return JSON.stringify({hex:'#'+h.toUpperCase(),rgb:`rgb(${r}, ${g}, ${b})`,hsl:rgbToHsl(r,g,b)},null,2)}
 if(n==='color contrast (wcag)'){const [a,b]=s.split(/\s+/);return contrast(a,b)}
 if(n==='css specificity'){const x=s.replace(/"[^"]*"|'[^']*'/g,'');return JSON.stringify({ids:(x.match(/#[\w-]+/g)||[]).length,classes:(x.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g)||[]).length,elements:(x.match(/(^|[ >+~])([a-z][\w-]*)/gi)||[]).length},null,2)}
 if(n==='ascii table'){const rows=s.split(/\r?\n/).map(r=>r.split(/\t|,/));const w=[];for(const r of rows)r.forEach((c,i)=>w[i]=Math.max(w[i]||0,c.length));return rows.map(r=>'| '+r.map((c,i)=>c.padEnd(w[i])).join(' | ')+' |').join('\n')}
 if(n==='regex tester'){const re=new RegExp(String(ctx.pattern??''),String(ctx.flags??'g'));return [...s.matchAll(re)].map(m=>m[0]).join('\n')}
 if(n==='.gitignore gen'||n==='gitignore gen')return 'node_modules/\n.env\ndist/\ncoverage/\n.DS_Store\n*.log\n';
 if(n==='dockerfile gen')return 'FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nCMD ["npm","start"]\n';
 if(n==='big-o cheatsheet')return 'Array lookup O(1)\nArray search O(n)\nBinary search O(log n)\nHash lookup average O(1)\nMerge sort O(n log n)\nQuick sort average O(n log n)';
 return null;
}
function csv(v){const x=v==null?'':typeof v==='object'?JSON.stringify(v):String(v);return /[",\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x}
function typeFor(k,v){if(Array.isArray(v))return `type ${k} = ${v.length?typeFor('Item',v[0]):'unknown'}[];`;if(v&&typeof v==='object')return `interface ${k} {\n${Object.entries(v).map(([a,b])=>`  ${a}: ${typeFor('x',b).replace(/^.*?\b/,'').replace(/;$/,'')};`).join('\n')}\n}`;return typeof v==='number'?'number':typeof v}
function yamlToJson(s){const o={};for(const l of s.split(/\r?\n/)){const m=l.match(/^([^:#]+):\s*(.*)$/);if(m)o[m[1].trim()]=m[2].trim()}return JSON.stringify(o,null,2)}
function base32(bytes){const abc='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits=0,val=0,out='';for(const b of bytes){val=(val<<8)|b;bits+=8;while(bits>=5){out+=abc[(val>>>(bits-=5))&31]}}if(bits)out+=abc[(val<<(5-bits))&31];return out}
function base58(bytes){const abc='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';let digits=[0];for(const b of bytes){let carry=b;for(let i=0;i<digits.length;i++){const x=digits[i]*256+carry;digits[i]=x%58;carry=Math.floor(x/58)}while(carry){digits.push(carry%58);carry=Math.floor(carry/58)}}return digits.reverse().map(i=>abc[i]).join('')}
function hex(a){return [...a].map(x=>x.toString(16).padStart(2,'0')).join('')}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2;let h=0,s=0;if(max!==min){const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);h=max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4;h/=6}return `hsl(${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%)`}
function lum(hexColor){const x=hexColor.replace('#','');const a=[0,2,4].map(i=>parseInt(x.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2]}
function contrast(a,b){const L1=lum(a),L2=lum(b);return String((Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05))}
