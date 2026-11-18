export const TTB_PHASE5_TOOLS = (() => {
const nums=s=>String(s||'').split(/[\s,;]+/).map(Number).filter(Number.isFinite);
const emi=(p,annual,m)=>{const r=annual/100/12;return r?p*r*(1+r)**m/((1+r)**m-1):p/m};
function url(i){try{const u=new URL(String(i||''));return {href:u.href,protocol:u.protocol,host:u.host,hostname:u.hostname,port:u.port,pathname:u.pathname,hash:u.hash,query:Object.fromEntries(u.searchParams)}}catch{return {error:'Invalid URL'}}}
function subnet(i){const [ip,b]=String(i||'').split('/'),bits=Number(b),a=ip.split('.').map(Number);if(a.length!==4||bits<0||bits>32||a.some(x=>x<0||x>255))return {error:'Invalid IPv4 CIDR'};const n=a.reduce((x,v)=>(x*256+v)>>>0,0),mask=bits===0?0:(0xffffffff<<(32-bits))>>>0,net=(n&mask)>>>0,bc=(net|(~mask>>>0))>>>0,f=x=>[(x>>>24)&255,(x>>>16)&255,(x>>>8)&255,x&255].join('.');return {network:f(net),broadcast:f(bc),mask:f(mask),usableHosts:bits>=31?Math.max(0,bc-net+1):Math.max(0,bc-net-1)}}
function ipv6(i){
 const raw=String(i||'').trim().replace(/^\[/,'').replace(/\]$/,'');
 const m=raw.match(/^([0-9a-fA-F:]+)(?:\/(\d{1,3}))?$/);
 if(!m)throw Error('Enter an IPv6 address, e.g. 2001:db8::1 or 2001:db8::/32');
 const addr=m[1],prefix=m[2]===undefined?null:Number(m[2]);
 if(prefix!==null&&prefix>128)throw Error('The prefix length must be 0–128');
 const halves=addr.split('::');
 if(halves.length>2)throw Error('An address may contain "::" only once');
 const left=halves[0]?halves[0].split(':'):[];
 const right=halves.length===2&&halves[1]?halves[1].split(':'):[];
 const bad=[...left,...right].find(g=>!/^[0-9a-fA-F]{1,4}$/.test(g));
 if(bad==='')throw Error('A lone ":" is not valid — use "::" for the run of zeros');
 if(bad!==undefined)throw Error(`"${bad}" is not a 1–4 digit hexadecimal group`);
 if(halves.length===1&&left.length!==8)throw Error('A full IPv6 address needs 8 groups; use "::" for the run of zeros');
 const missing=8-left.length-right.length;
 if(halves.length===2&&missing<1)throw Error('"::" must stand for at least one zero group (the address already has 8)');
 const groups=[...left,...Array(halves.length===2?missing:0).fill('0'),...right].map(g=>parseInt(g,16));
 const expanded=groups.map(g=>g.toString(16).padStart(4,'0')).join(':');
 let best=-1,bestLen=0,run=-1,runLen=0;
 for(let k=0;k<=8;k++){const z=k<8&&groups[k]===0;if(z){if(run<0){run=k;runLen=0}runLen++}else{if(run>=0&&runLen>bestLen){best=run;bestLen=runLen}run=-1}}
 const hex=groups.map(g=>g.toString(16));
 const compressed=bestLen>=2
   ?hex.slice(0,best).join(':')+'::'+hex.slice(best+bestLen).join(':')
   :hex.join(':');
 return {expanded,compressed,prefix,groups:8};
}
function hostname(i){
 const raw=String(i||'').trim();
 if(!raw)throw Error('Enter a hostname, e.g. example.com or münchen.de');
 if(/[\s/\\]/.test(raw))throw Error('A hostname cannot contain a space or a path — enter the host only');
 if(raw.includes(':'))throw Error('A hostname cannot contain ":" — that is a port; enter the host only');
 const fqdn=raw.endsWith('.');
 const body=fqdn?raw.slice(0,-1):raw;
 if(!body)throw Error('Enter a hostname, e.g. example.com');
 if(/^\d+(\.\d+){3}$/.test(body)){
  const o=body.split('.').map(Number);
  const bad=o.findIndex(x=>x>255);
  if(bad>=0)throw Error(`"${body}" is not a valid IPv4 address — octet ${bad+1} is ${o[bad]}, above 255`);
  return {hostname:body,ascii:o.join('.'),kind:'ipv4',labels:4,fqdn,tld:null};
 }
 if(/\.\d+$/.test(body))throw Error(`"${body}" ends in a numeric label — that is an IP address, not a hostname`);
 let ascii;
 try{ascii=new URL('http://'+body).hostname.replace(/\.$/,'')}catch{throw Error(`"${body}" is not a valid hostname`)}
 if(/^\d+(\.\d+){3}$/.test(ascii))return {hostname:body,ascii,kind:'ipv4',labels:4,fqdn,tld:null};
 if(ascii.length>253)throw Error(`A hostname may be at most 253 characters; this one is ${ascii.length}`);
 const labels=ascii.split('.');
 if(labels.some(l=>l===''))throw Error(`"${body}" has an empty label — two dots in a row`);
 const badChar=labels.find(l=>/[^a-z0-9-]/i.test(l));
 if(badChar!==undefined){const ch=(badChar.match(/[^a-z0-9-]/i)||[])[0];throw Error(`"${ch}" is not allowed in a hostname label — only letters, digits and hyphen`)}
 const hyphen=labels.find(l=>l.startsWith('-')||l.endsWith('-'));
 if(hyphen!==undefined)throw Error(`"${hyphen}" starts or ends with a hyphen, which a label may not do`);
 const long=labels.find(l=>l.length>63);
 if(long!==undefined)throw Error(`"${long}" is ${long.length} characters; a label may be at most 63`);
 if(labels.length===1)return {hostname:body,ascii,kind:'hostname',labels:1,fqdn:false,tld:null};
 const tld=labels[labels.length-1];
 return {hostname:body,ascii,kind:'hostname',labels:labels.length,fqdn,tld};
}
const T={
 'loan-calculator':{name:'Loan',cat:'finance',run:i=>{const[p,r,y]=(i||'100000,8,5').split(',').map(Number),m=y*12,a=emi(p,r,m);return JSON.stringify({principal:p,annualRate:r,years:y,monthlyPayment:+a.toFixed(2),totalPayment:+(a*m).toFixed(2),interest:+(a*m-p).toFixed(2)},null,2)}},
 'emi':{name:'EMI',cat:'finance',run:i=>{const[p,r,m]=(i||'100000,8,60').split(',').map(Number);return emi(p,r,m).toFixed(2)}},
 'compound-interest':{name:'Compound interest',cat:'finance',run:i=>{const[p,r,y,n]=(i||'10000,8,5,12').split(',').map(Number),a=p*(1+r/100/n)**(n*y);return JSON.stringify({amount:+a.toFixed(2),interest:+(a-p).toFixed(2)},null,2)}},
 'profit-margin':{name:'Profit margin',cat:'finance',inputs:[{key:'c',label:'Cost',type:'number',value:'700'}],run:(i,ctx={})=>{const[r,c]=[Number(String(i).split(',')[0]),Number(ctx.c??String(i).split(',')[1])];if(!Number.isFinite(r)||!Number.isFinite(c))throw Error('Enter revenue in the input box and cost in the Cost field');if(r===0)throw Error('Revenue cannot be zero');return (((r-c)/r)*100).toFixed(2)+'%'}},
 'markup':{name:'Markup',cat:'finance',inputs:[{key:'s',label:'Selling price',type:'number',value:'1000'}],run:(i,ctx={})=>{const[c,sp]=[Number(String(i).split(',')[0]),Number(ctx.s??String(i).split(',')[1])];if(!Number.isFinite(c)||!Number.isFinite(sp))throw Error('Enter cost in the input box and selling price in the field');if(c===0)throw Error('Cost cannot be zero');return (((sp-c)/c)*100).toFixed(2)+'%'}},
 'discount':{name:'Discount',cat:'finance',run:i=>{const[p,d]=(i||'1000,10').split(',').map(Number);return JSON.stringify({discount:p*d/100,final:p*(1-d/100)},null,2)}},
 'tax':{name:'Tax',cat:'finance',run:i=>{const[a,t]=(i||'1000,18').split(',').map(Number);return JSON.stringify({tax:a*t/100,total:a*(1+t/100)},null,2)}},
 'statistics':{name:'Statistics',cat:'data',run:i=>{const x=nums(i||'1,2,3,4,5'),m=x.reduce((a,b)=>a+b,0)/x.length;return JSON.stringify({count:x.length,mean:m,min:Math.min(...x),max:Math.max(...x)},null,2)}},
 'url-parser':{name:'URL parser',cat:'network',run:i=>JSON.stringify(url(i||'https://example.com/path?q=test'),null,2)},
 'subnet-calculator':{name:'Subnet calculator',cat:'network',run:i=>JSON.stringify(subnet(i||'192.168.1.0/24'),null,2)},
 'cidr-converter':{name:'CIDR converter',cat:'network',run:i=>JSON.stringify(subnet(i||'10.0.0.0/8'),null,2)},
 'ipv6-expand-compress':{name:'IPv6 expand/compress',cat:'network',run:i=>JSON.stringify(ipv6(i||'2001:db8::1'),null,2)},
 'hostname-validator':{name:'Hostname validator',cat:'network',run:i=>JSON.stringify(hostname(i||'example.com'),null,2)},
 'port-reference':{name:'Port reference',cat:'network',run:i=>({20:'FTP-data',21:'FTP',22:'SSH',23:'Telnet',25:'SMTP',53:'DNS',80:'HTTP',110:'POP3',143:'IMAP',443:'HTTPS',587:'SMTP submission',993:'IMAPS',995:'POP3S'})[Number(i)]||'Unknown/common port not in reference'},
 'title-analyzer':{name:'Title analyzer',cat:'seo',run:i=>{const s=String(i||'');return JSON.stringify({length:s.length,words:s.trim()?s.trim().split(/\s+/).length:0,typicalRange:s.length>=30&&s.length<=60},null,2)}},
 'meta-description-analyzer':{name:'Meta description analyzer',cat:'seo',run:i=>{const s=String(i||'');return JSON.stringify({length:s.length,typicalRange:s.length>=120&&s.length<=160},null,2)}},
 'canonical-checker':{name:'Canonical checker',cat:'seo',run:i=>{const m=String(i||'').match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i);return m?m[1]:'No canonical link found'}},
 'schema-extractor':{name:'Schema.org extractor',cat:'seo',run:i=>{const m=[...String(i||'').matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];return m.map(x=>x[1].trim()).join('\n')||'No JSON-LD found'}},
 'utm-builder':{name:'UTM builder',cat:'seo',run:i=>{try{const[a,s,m,c]=(i||'https://example.com,google,cpc,test').split(',').map(x=>x.trim()),u=new URL(a);u.searchParams.set('utm_source',s);u.searchParams.set('utm_medium',m);u.searchParams.set('utm_campaign',c);return u.href}catch{return'Invalid URL'}}},
 'utm-parser':{name:'UTM parser',cat:'seo',run:i=>{try{const u=new URL(i||'https://example.com/?utm_source=google');return JSON.stringify(Object.fromEntries([...u.searchParams].filter(([k])=>k.startsWith('utm_'))),null,2)}catch{return'Invalid URL'}}}
};
return T;
})();
