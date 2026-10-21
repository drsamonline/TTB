const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const words=s=>(String(s).match(/\b[\p{L}\p{N}][\p{L}\p{N}'’-]*\b/gu)||[]);
function lines(s){return String(s).split(/\r?\n/)}
export async function runText(name,ctx={}){
 const s=String(ctx.text??''),n=name.toLowerCase();
 if(n==='case converter') return ctx.mode==='lower'?s.toLowerCase():ctx.mode==='upper'?s.toUpperCase():s.replace(/\b[\p{L}]/gu,c=>c.toUpperCase());
 if(n==='trim/dedupe/sort/reverse lines') return [...new Set(lines(s).map(x=>x.trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b)).join('\n');
 if(n==='remove empty/duplicate lines') return [...new Set(lines(s).filter(x=>x.trim()))].join('\n');
 if(n==='strip html/markdown/urls') return s.replace(/https?:\/\/\S+/g,'').replace(/<[^>]*>/g,'').replace(/[*_`#>\[\]()~-]/g,'').replace(/\n{3,}/g,'\n\n').trim();
 if(n==='word/char/line/sentence/paragraph count'){return JSON.stringify({words:words(s).length,characters:s.length,charactersNoSpaces:s.replace(/\s/g,'').length,lines:s?s.split(/\r?\n/).length:0,sentences:(s.match(/[^.!?]+[.!?]+(?=\s|$)/g)||[]).length,paragraphs:s.trim()?s.trim().split(/\n\s*\n/).length:0},null,2)}
 if(n==='reading time') return `${Math.max(1,Math.ceil(words(s).length/200))} min (at 200 wpm)`;
 if(n==='speaking time') return `${Math.max(1,Math.ceil(words(s).length/130))} min (at 130 wpm)`;
 if(n==='flesch-kincaid') {const w=words(s).length||1, sent=Math.max(1,(s.match(/[.!?]+/g)||[]).length), syl=countSyllables(s); return `Reading Ease: ${(206.835-1.015*(w/sent)-84.6*(syl/w)).toFixed(2)}\nGrade: ${(0.39*(w/sent)+11.8*(syl/w)-15.59).toFixed(2)}`;}
 if(n==='gunning fog'||n==='smog'){const w=words(s).length||1,sent=Math.max(1,(s.match(/[.!?]+/g)||[]).length),complex=words(s).filter(x=>countWordSyllables(x)>=3).length;if(n==='gunning fog')return `Grade: ${(0.4*((w/sent)+100*(complex/w))).toFixed(2)}`;return `Grade: ${(1.043*Math.sqrt(complex*(30/sent))+3.1291).toFixed(2)}`;}
 if(n==='slug generator') return s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
 if(n==='base64 encode/decode') return ctx.mode==='decode'?decodeURIComponent(escape(atob(s))):btoa(unescape(encodeURIComponent(s)));
 if(n==='url encode/decode') return ctx.mode==='decode'?decodeURIComponent(s):encodeURIComponent(s);
 if(n==='html entity encode/decode') return ctx.mode==='decode'?s.replace(/&(#\d+|#x[\da-f]+|\w+);/gi,(m,x)=>x[0]==='#'?(x[1].toLowerCase()==='x'?String.fromCodePoint(parseInt(x.slice(2),16)):String.fromCodePoint(+x.slice(1))):({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[x]??m)):esc(s);
 if(n==='unicode escape/unescape') return ctx.mode==='decode'?s.replace(/\\u([\da-f]{4})/gi,(_,x)=>String.fromCharCode(parseInt(x,16))):[...s].map(c=>`\\u${c.codePointAt(0).toString(16).padStart(4,'0')}`).join('');
 if(n==='rot13') return s.replace(/[a-z]/gi,c=>String.fromCharCode((c<='Z'?65:97)+(c.toLowerCase().charCodeAt(0)-97+13)%26));
 if(n==='caesar cipher'){const sh=Number(ctx.shift??13);return s.replace(/[a-z]/gi,c=>{const base=c<='Z'?65:97;return String.fromCharCode(base+(c.charCodeAt(0)-base+sh+2600)%26)})}
 if(n==='binary ↔ text') return ctx.mode==='decode'?s.trim().split(/\s+/).map(x=>String.fromCharCode(parseInt(x,2))).join(''):[...s].map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');
 if(n==='hex ↔ text') return ctx.mode==='decode'?(s.replace(/\s+/g,'').match(/.{1,2}/g)||[]).map(x=>String.fromCharCode(parseInt(x,16))).join(''):[...s].map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join('');
 if(n==='reverse text/words') return ctx.mode==='words'?s.split(/\s+/).reverse().join(' '):[...s].reverse().join('');
 if(n==='palindrome checker'){const x=s.normalize('NFKD').replace(/[^\p{L}\p{N}]/gu,'').toLowerCase();return x===([...x].reverse().join(''))?'Palindrome':'Not a palindrome'}
 if(n==='anagram finder'){const x=s.replace(/\s/g,'').toLowerCase().split('').sort().join('');return x?`Signature: ${x}`:'Empty input'}
 if(n==='word frequency'){const m=new Map();for(const w of words(s))m.set(w.toLowerCase(),(m.get(w.toLowerCase())||0)+1);return [...m].sort((a,b)=>b[1]-a[1]).map(([w,c])=>`${w}\t${c}`).join('\n')}
 if(n==='keyword density'){const m=new Map();for(const w of words(s))m.set(w.toLowerCase(),(m.get(w.toLowerCase())||0)+1);const total=words(s).length||1;return [...m].sort((a,b)=>b[1]-a[1]).slice(0,30).map(([w,c])=>`${w}: ${(100*c/total).toFixed(2)}%`).join('\n')}
 if(n==='paragraph reflow') return s.split(/\n\s*\n/).map(p=>p.replace(/\s+/g,' ').trim()).join('\n\n');
 if(n==='smart quotes ↔ straight quotes') return s.replace(/[“”]/g,'"').replace(/[‘’]/g,"'");
 if(n==='dash normalizer') return s.replace(/[‐‑‒–—―]/g,'-');
 if(n==='ellipsis normalizer') return s.replace(/\.{3,}|…/g,'…');
 if(n==='whitespace visualizer') return s.replace(/ /g,'·').replace(/\t/g,'→\t').replace(/\r?\n/g,'↵\n');
 if(n==='invisible character detector') {const found=[...s].filter(c=>/\p{Cf}|\u00a0|\u2000-\u200a/gu.test(c));return found.length?found.map(c=>`U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')} ${JSON.stringify(c)}`).join('\n'):'None found';}
 if(n==='zero-width char remover') return s.replace(/[\u200B-\u200D\uFEFF]/g,'');
 if(n==='bidi char remover') return s.replace(/[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g,'');
 if(n==='markdown → html') return esc(s).replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^# (.*)$/gm,'<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');
 if(n==='html → markdown') return s.replace(/<br\s*\/?\s*>/gi,'\n').replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gis,'$1\n').replace(/<strong[^>]*>(.*?)<\/strong>/gis,'**$1**').replace(/<em[^>]*>(.*?)<\/em>/gis,'*$1*').replace(/<[^>]+>/g,'');
 if(n==='csv → markdown table'){const rows=lines(s).filter(Boolean).map(r=>r.split(','));if(!rows.length)return '';return [rows[0],rows[0].map(()=> '---'),...rows.slice(1)].map(r=>'| '+r.map(x=>x.trim()).join(' | ')+' |').join('\n')}
 if(n==='regex extractor'){const re=new RegExp(ctx.pattern||s.match(/^\/(.*)\/[gimuy]*$/)?.[1]||'','g');return [...String(ctx.source??s).matchAll(re)].map(m=>m[0]).join('\n')}
 if(n==='regex replace preview'){const re=new RegExp(ctx.pattern||'','g');return String(ctx.source??s).replace(re,String(ctx.replacement??''));}
 if(n==='levenshtein similarity'){const a=String(ctx.a??s),b=String(ctx.b??'');return String(sim(a,b,'lev'))}
 if(n==='jaccard similarity'){const A=new Set(words(String(ctx.a??s)).map(x=>x.toLowerCase())),B=new Set(words(String(ctx.b??'')).map(x=>x.toLowerCase()));return String(inter(A,B)/Math.max(1,new Set([...A,...B]).size))}
 if(n==='text diff'){const a=String(ctx.a??s).split(/\r?\n/),b=String(ctx.b??'').split(/\r?\n/);return diff(a,b)}
 if(n==='morse code')return ctx.mode==='decode'?decodeMorse(s):[...s.toUpperCase()].map(c=>MORSE[c]??'').join(' ');
 if(n==='leetspeak')return s.replace(/[aAeEiIoOsStTbBgG]/g,c=>({a:'4',e:'3',i:'1',o:'0',s:'5',t:'7',b:'8',g:'9'}[c.toLowerCase()]??c));
 if(n==='pig latin')return s.replace(/\b[\p{L}]+\b/gu,w=>/^[aeiou]/i.test(w)?w+'way':w.slice(1)+w[0]+'ay');
 if(n==='sentence length variance'){const a=(s.match(/[^.!?]+[.!?]+/g)||[]).map(x=>words(x).length);if(!a.length)return '0';const mean=a.reduce((x,y)=>x+y,0)/a.length;return String(a.reduce((x,y)=>x+(y-mean)**2,0)/a.length)}
 return null;
}
function countWordSyllables(w){const x=w.toLowerCase().replace(/[^a-z]/g,'');if(!x)return 0;if(x.length<=3)return 1;const m=x.match(/[aeiouy]+/g)||[];let n=m.length;if(/e$/.test(x)&&n>1)n--;return Math.max(1,n)}
function countSyllables(s){return words(s).reduce((n,w)=>n+countWordSyllables(w),0)}
function sim(a,b){const d=[...a].reduce((r,_,i)=>{r[i+1]=i+1;return r},[0]);for(let j=1;j<=b.length;j++){let prev=d[0];d[0]=j;for(let i=1;i<=a.length;i++){const cur=d[i];d[i]=Math.min(d[i]+1,d[i-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=cur}}return 1-d[a.length]/Math.max(1,Math.max(a.length,b.length))}
const inter=(A,B)=>[...A].filter(x=>B.has(x)).length;
function diff(a,b){const out=[],n=Math.max(a.length,b.length);for(let i=0;i<n;i++){if(a[i]===b[i])out.push('  '+(a[i]??''));else{if(a[i]!==undefined)out.push('- '+a[i]);if(b[i]!==undefined)out.push('+ '+b[i])}}return out.join('\n')}
const MORSE={'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','0':'-----'};
const decodeMorse=s=>s.split(/\s+/).map(x=>Object.entries(MORSE).find(([,v])=>v===x)?.[0]??'').join('');
