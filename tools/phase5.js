export const TTB_PHASE5_TOOLS = (() => {
const nums=s=>String(s||'').split(/[\s,;]+/).map(Number).filter(Number.isFinite);
const emi=(p,annual,m)=>{const r=annual/100/12;return r?p*r*(1+r)**m/((1+r)**m-1):p/m};
function url(i){try{const u=new URL(String(i||''));return {href:u.href,protocol:u.protocol,host:u.host,hostname:u.hostname,port:u.port,pathname:u.pathname,hash:u.hash,query:Object.fromEntries(u.searchParams)}}catch{return {error:'Invalid URL'}}}
function subnet(i){const [ip,b]=String(i||'').split('/'),bits=Number(b),a=ip.split('.').map(Number);if(a.length!==4||bits<0||bits>32||a.some(x=>x<0||x>255))return {error:'Invalid IPv4 CIDR'};const n=a.reduce((x,v)=>(x*256+v)>>>0,0),mask=bits===0?0:(0xffffffff<<(32-bits))>>>0,net=(n&mask)>>>0,bc=(net|(~mask>>>0))>>>0,f=x=>[(x>>>24)&255,(x>>>16)&255,(x>>>8)&255,x&255].join('.');return {network:f(net),broadcast:f(bc),mask:f(mask),usableHosts:bits>=31?Math.max(0,bc-net+1):Math.max(0,bc-net-1)}}
const T={
 'loan-calculator':{name:'Loan',cat:'finance',run:i=>{const[p,r,y]=(i||'100000,8,5').split(',').map(Number),m=y*12,a=emi(p,r,m);return JSON.stringify({principal:p,annualRate:r,years:y,monthlyPayment:+a.toFixed(2),totalPayment:+(a*m).toFixed(2),interest:+(a*m-p).toFixed(2)},null,2)}},
 'emi':{name:'EMI',cat:'finance',run:i=>{const[p,r,m]=(i||'100000,8,60').split(',').map(Number);return emi(p,r,m).toFixed(2)}},
 'compound-interest':{name:'Compound interest',cat:'finance',run:i=>{const[p,r,y,n]=(i||'10000,8,5,12').split(',').map(Number),a=p*(1+r/100/n)**(n*y);return JSON.stringify({amount:+a.toFixed(2),interest:+(a-p).toFixed(2)},null,2)}},
 'profit-margin':{name:'Profit margin',cat:'finance',run:i=>{const[r,c]=(i||'1000,700').split(',').map(Number);return (((r-c)/r)*100).toFixed(2)+'%'}},
 'markup':{name:'Markup',cat:'finance',run:i=>{const[c,s]=(i||'700,1000').split(',').map(Number);return (((s-c)/c)*100).toFixed(2)+'%'}},
 'discount':{name:'Discount',cat:'finance',run:i=>{const[p,d]=(i||'1000,10').split(',').map(Number);return JSON.stringify({discount:p*d/100,final:p*(1-d/100)},null,2)}},
 'tax':{name:'Tax',cat:'finance',run:i=>{const[a,t]=(i||'1000,18').split(',').map(Number);return JSON.stringify({tax:a*t/100,total:a*(1+t/100)},null,2)}},
 'statistics':{name:'Statistics',cat:'data',run:i=>{const x=nums(i||'1,2,3,4,5'),m=x.reduce((a,b)=>a+b,0)/x.length;return JSON.stringify({count:x.length,mean:m,min:Math.min(...x),max:Math.max(...x)},null,2)}},
 'url-parser':{name:'URL parser',cat:'network',run:i=>JSON.stringify(url(i||'https://example.com/path?q=test'),null,2)},
 'subnet-calculator':{name:'Subnet calculator',cat:'network',run:i=>JSON.stringify(subnet(i||'192.168.1.0/24'),null,2)},
 'cidr-converter':{name:'CIDR converter',cat:'network',run:i=>JSON.stringify(subnet(i||'10.0.0.0/8'),null,2)},
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
