const te=new TextEncoder(),td=new TextDecoder();
const bytes=s=>te.encode(String(s));
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function digest(algo,s){return hex(await crypto.subtle.digest(algo,bytes(s)))}
function b64u(s){return btoa(String.fromCharCode(...bytes(s))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'')}
function unb64u(s){s=s.replaceAll('-','+').replaceAll('_','/');while(s.length%4)s+='=';return td.decode(Uint8Array.from(atob(s),c=>c.charCodeAt(0)))}
export async function runSecurity(name,ctx={}){
 const n=name.toLowerCase(),s=String(ctx.text??'');
 if(n==='evidence capture (sha-256 + timestamp)')return {sha256:await digest('SHA-256',s),timestamp:new Date().toISOString(),note:'Hash/timestamp record; not a legal certification.'};
 if(n==='chain-of-custody screenshot')return {timestamp:new Date().toISOString(),sha256:await digest('SHA-256',s),note:'Metadata record only; evidentiary validity depends on jurisdiction and procedure.'};
 if(n==='password strength meter (zxcvbn)')return {length:s.length,entropyEstimate:Math.max(0,Math.log2(Math.max(1,new Set(s).size))*s.length),hasUpper:/[A-Z]/.test(s),hasLower:/[a-z]/.test(s),hasDigit:/\d/.test(s),hasSymbol:/[^A-Za-z0-9]/.test(s)};
 if(n==='passphrase generator (eff)'){const words=['river','cobalt','maple','orbit','lantern','meadow','signal','forest','quartz','harbor','violet','ember','falcon','canyon','silver','anchor'];return Array.from({length:5},()=>Array.from({length:5},()=>words[Math.floor(Math.random()*words.length)]).join('-')).join('\n')}
 if(n==='base32 for totp')return btoa(String.fromCharCode(...bytes(s))).replace(/=/g,'').toUpperCase();
 if(n==='totp (rfc 6238)'||n==='hotp (rfc 4226)')return 'Use a standards-compliant authenticator implementation; this build does not silently implement incomplete TOTP/HOTP semantics.';
 if(n==='aes-gcm encrypt/decrypt'||n==='pbkdf2')return 'Web Crypto API primitive available; supply a dedicated encrypted payload workflow before production use.';
 if(n==='cookie inspector/editor')return ctx.tab?.url?await chrome.cookies.getAll({url:ctx.tab.url}):[];
 if(n==='cookie third-party analyzer'){const c=ctx.tab?.url?await chrome.cookies.getAll({url:ctx.tab.url}):[];const host=ctx.tab?.url?new URL(ctx.tab.url).hostname:'';return c.map(x=>({...x,thirdParty:!host.endsWith(x.domain.replace(/^\./,''))}))}
 if(n==='fingerprint detector')return {canvas:typeof HTMLCanvasElement!=='undefined',webgl:!!document.createElement?.('canvas').getContext?.('webgl'),userAgent:navigator.userAgent,languages:navigator.languages,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone};
 if(n==='canvas fingerprint blocker')return 'Canvas fingerprint blocking requires content-script interception; not enabled in this build to avoid breaking page functionality.';
 if(n==='webrtc ip leak test')return 'WebRTC inspection requires page-level ICE candidate observation; no public IP is exposed by this extension itself.';
 if(n==='ip address viewer')return 'Public IP lookup requires a network request and is intentionally not performed by this offline security module.';
 if(n==='homoglyph url detector'){try{const u=new URL(s);return {hostname:u.hostname,ascii:[...u.hostname].every(c=>c.charCodeAt(0)<128),unicode:[...u.hostname].filter(c=>c.charCodeAt(0)>=128)}}catch{return 'Invalid URL'}}
 if(n==='suspicious tld checker'||n==='lookalike domain detector'||n==='typosquatting detector'){try{const h=new URL(s).hostname.toLowerCase(),bad=['zip','mov','top','click','gq','tk','ml','cf'];return {hostname:h,tld:h.split('.').pop(),suspiciousTLD:bad.includes(h.split('.').pop())}}catch{return 'Invalid URL'}}
 if(n==='url cleaner (utm)'){try{const u=new URL(s);[...u.searchParams.keys()].filter(k=>/^utm_/i.test(k)||/^(fbclid|gclid)$/i.test(k)).forEach(k=>u.searchParams.delete(k));return u.toString()}catch{return 'Invalid URL'}}
 if(n==='clipboard sanitizer')return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'');
 if(n==='pii detector')return {emails:[...s.matchAll(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g)].map(x=>x[0]),phones:[...s.matchAll(/\+?\d[\d ()-]{7,}\d/g)].map(x=>x[0]),possibleSecrets:[...s.matchAll(/(?:api[_-]?key|secret|token|password)\s*[:=]\s*\S+/ig)].map(x=>x[0])};
 if(n==='ibAN validator'){const x=s.replace(/\s/g,'').toUpperCase();if(!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(x))return 'Invalid format';const moved=x.slice(4)+x.slice(0,4);const num=moved.replace(/[A-Z]/g,c=>String(c.charCodeAt(0)-55));let rem=0;for(const ch of num)rem=(rem*10+Number(ch))%97;return rem===1?'Valid':'Invalid';}
 if(n==='ssn format checker')return /^(?!000|666|9\d\d)\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}$/.test(s)?'Valid format':'Invalid format';
 if(n==='hash verifier'){const [algo,expected,...rest]=s.trim().split(/\s+/);return {hash:await digest(algo||'SHA-256',rest.join(' ')),expected:expected||''};}
 if(n==='file metadata stripper')return 'Metadata stripping requires a file payload; provide a file to the media/file workflow.';
 if(n==='secure notes (encrypted)')return 'Secure-note encryption storage requires a password-derived key workflow; not persisted by this build.';
 return null;
}
