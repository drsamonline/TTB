function num(s){const x=Number(String(s).trim());if(!Number.isFinite(x))throw Error('Enter a valid number');return x}
function expr(s){if(!/^[0-9+\-*/%().,\s^]+$/.test(s))throw Error('Only numeric arithmetic is allowed');return Function(`"use strict";return (${s.replace(/\^/g,'**')})`)()}
export async function runCalc(name,ctx={}){const s=String(ctx.text??''),n=name.toLowerCase();
 if(n==='live calculator'||n==='scientific')return String(expr(s));
 if(n==='percentage') {const a=String(ctx.a??'').trim(),b=String(ctx.b??'').trim();return a&&b?String(num(a)*num(b)/100):String(expr(s));}
 if(n==='tip'){const bill=num(ctx.a??s),pct=num(ctx.b??'15');return JSON.stringify({tip:bill*pct/100,total:bill*(1+pct/100)},null,2)}
 if(n==='discount'){const p=num(ctx.a??s),d=num(ctx.b??'10');return JSON.stringify({discount:p*d/100,final:p*(1-d/100)},null,2)}
 if(n==='tax/vat/gst'){const p=num(ctx.a??s),r=num(ctx.b??'18');return JSON.stringify({tax:p*r/100,total:p*(1+r/100)},null,2)}
 if(n==='simple interest'){const p=num(ctx.a??''),r=num(ctx.b??''),t=num(ctx.c??'1');return String(p*r*t/100)}
 if(n==='compound interest'){const p=num(ctx.a??''),r=num(ctx.b??''),t=num(ctx.c??'1'),m=num(ctx.d??'1');const total=p*Math.pow(1+r/(100*m),m*t);return JSON.stringify({interest:total-p,total},null,2)}
 if(n==='loan/emi'||n==='emi'){const p=num(ctx.a??''),annual=num(ctx.b??''),months=num(ctx.c??'');const r=annual/1200,emi=r? p*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1):p/months;return JSON.stringify({emi,total:emi*months,interest:emi*months-p},null,2)}
 if(n==='amortization'){const p=num(ctx.a??''),annual=num(ctx.b??''),months=num(ctx.c??''),r=annual/1200;const emi=r?p*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1):p/months;let bal=p,out=[];for(let i=1;i<=months;i++){const interest=bal*r,principal=Math.min(bal,emi-interest);bal-=principal;out.push({month:i,payment:emi,principal,interest,balance:Math.max(0,bal)});if(i>=1200)break}return JSON.stringify(out,null,2)}
 if(n==='roi/roas'){const gain=num(ctx.a??''),cost=num(ctx.b??'');return `${((gain-cost)/cost*100).toFixed(2)}%`}
 if(n==='break-even'){const fixed=num(ctx.a??''),price=num(ctx.b??''),variable=num(ctx.c??'');return String(fixed/(price-variable))}
 if(n==='markup/margin'){const cost=num(ctx.a??''),sell=num(ctx.b??'');return JSON.stringify({markup:(sell-cost)/cost*100,margin:(sell-cost)/sell*100},null,2)}
 if(n==='salary↔hourly'||n==='salary converter'){const salary=num(ctx.a??s),hours=num(ctx.b??'2080');return String(salary/hours)}
 if(n==='overtime'){const rate=num(ctx.a??s),hours=num(ctx.b??'1'),mult=num(ctx.c??'1.5');return String(rate*hours*mult)}
 if(n==='age'){const d=new Date(ctx.date??s);if(Number.isNaN(d.getTime()))throw Error('Use a valid birth date');const now=new Date(),age=now.getUTCFullYear()-d.getUTCFullYear()-((now.getUTCMonth()<d.getUTCMonth()||(now.getUTCMonth()===d.getUTCMonth()&&now.getUTCDate()<d.getUTCDate()))?1:0);return String(age)}
 if(n==='date difference'){const a=new Date(ctx.a??''),b=new Date(ctx.b??'');return String(Math.abs(b-a)/86400000)+' days'}
 if(n==='unix timestamp')return String(Math.floor(Date.now()/1000));
 if(n==='iso 8601')return new Date().toISOString();
 if(n==='week number'){const d=new Date(ctx.date??s);const jan4=new Date(Date.UTC(d.getUTCFullYear(),0,4));return String(1+Math.floor((d-new Date(jan4.getTime()-((jan4.getUTCDay()+6)%7)*86400000))/604800000))}
 if(n==='day of week'){const d=new Date(ctx.date??s);return d.toLocaleDateString(undefined,{weekday:'long'})}
 if(n==='fraction↔decimal'){const [a,b]=s.split('/').map(Number);return b?String(a/b):String(num(s))}
 if(n==='roman numerals'){let x=Math.trunc(num(s)),out='';for(const [v,r] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]){while(x>=v){out+=r;x-=v}}return out||'0'}
 if(n==='prime checker'){const x=Math.trunc(num(s));if(x<2)return 'Not prime';for(let i=2;i*i<=x;i++)if(x%i===0)return 'Not prime';return 'Prime'}
 if(n==='gcd/lcm'){const [a,b]=s.split(/[,\s]+/).map(x=>Math.abs(Math.trunc(Number(x))));const g=(x,y)=>y?g(y,x%y):x;const z=g(a,b);return JSON.stringify({gcd:z,lcm:a&&b?Math.abs(a*b)/z:0},null,2)}
 if(n==='factorial/permutations'){const [a,b]=s.split(/[,\s]+/).map(Number);const f=x=>{let r=1;for(let i=2;i<=x;i++)r*=i;return r};return JSON.stringify({factorial:f(a),permutation:b===undefined?null:f(a)/f(a-b)},null,2)}
 if(n==='fibonacci'){let a=0,b=1,out=[];for(let i=0;i<num(s);i++){out.push(a);[a,b]=[b,a+b]}return out.join(', ')}
 if(n==='statistics'){const a=s.split(/[,\s]+/).filter(Boolean).map(Number).sort((x,y)=>x-y),m=a.reduce((x,y)=>x+y,0)/a.length;return JSON.stringify({count:a.length,min:a[0],max:a.at(-1),mean:m,median:a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2},null,2)}
 if(n==='random number')return String(Math.floor(Math.random()*1000000));
 if(n==='dice')return String(1+Math.floor(Math.random()*6));
 if(n==='coin flip')return Math.random()<.5?'Heads':'Tails';
 if(n==='password generator'){const bytes=crypto.getRandomValues(new Uint8Array(24));return [...bytes].map(x=>'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'[x%72]).join('').slice(0,16)}
 if(n==='pin generator')return String(Math.floor(100000+Math.random()*900000));
 return null;
}
