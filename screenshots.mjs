// Screenshot harness — renders the real TTB popup in headless Chrome and
// captures the README images. Dev-only: never shipped in a browser package.
//   npm run shots   (needs puppeteer-core + a Chromium binary)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import puppeteer from 'puppeteer-core';
const ROOT = path.resolve(new URL('.', import.meta.url).pathname); const OUT=path.join(ROOT,'docs/screenshots');
fs.mkdirSync(OUT,{recursive:true});
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=path.join(ROOT,u==='/'?'/popup.html':u);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}
 r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(0,'127.0.0.1',r)); const PORT=srv.address().port;
const b=await puppeteer.launch({executablePath:'/usr/local/bin/chromium-headless-shell',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--font-render-hinting=none']});
const p=await b.newPage(); await p.setViewport({width:1200,height:760,deviceScaleFactor:2});
await p.evaluateOnNewDocument(()=>{const R=v=>async()=>v;window.chrome={tabs:{query:R([{id:1,url:'https://example.com',title:'x',windowId:1,active:true}])},scripting:{executeScript:R([{result:null}])},storage:{local:{get:R({}),set:R()}},downloads:{download:R(1)},runtime:{getManifest:()=>({version:'0.10.0'}),getURL:u=>u}};});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const shot=async n=>{await p.screenshot({path:path.join(OUT,n)});console.log('shot',n)};
await p.goto(`http://127.0.0.1:${PORT}/popup.html`,{waitUntil:'networkidle0'});
await p.waitForSelector('.cat',{timeout:15000}); await wait(500);
await shot('01-catalog.png');
await p.evaluate(()=>{[...document.querySelectorAll('.cat')].find(x=>x.querySelector('.cat-name')?.textContent==='Finance').click()}); await wait(300);
await shot('02-category.png');
async function open(name){
  await p.evaluate(()=>{[...document.querySelectorAll('.cat')].find(x=>x.querySelector('.cat-name')?.textContent==='All Tools').click()});
  await wait(120);
  await p.evaluate(n=>{const s=document.querySelector('#search');s.value=n;s.dispatchEvent(new Event('input',{bubbles:true}))},name);
  await wait(250);
  const ok=await p.evaluate(n=>{const b=[...document.querySelectorAll('.tool')].find(x=>x.querySelector('.tool-name')?.textContent===n);if(!b)return false;b.click();return true},name);
  if(!ok) throw new Error('not found: '+name);
  await wait(280);
}
const fill=async(k,v)=>p.evaluate((k,v)=>{const el=k==='text'?document.querySelector('#input'):document.querySelector(`[data-key="${k}"]`);if(el){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))}},k,v);
const run=async()=>{await p.click('#run');await wait(1000)};
await open('Loan/EMI'); await fill('text','500000'); await fill('b','8.5'); await fill('c','60'); await run();
await shot('03-tool-inputs.png');
await open('Typography scale'); await run(); await shot('04-html-output.png');
await open('QR gen'); await fill('text','https://github.com/drsamonline/TTB'); await run(); await shot('05-image-output.png');
await open('History cleaner'); await wait(200); await shot('06-confirm.png');
console.log('page errors:', errs.length?errs.slice(0,4):'none');
await b.close(); srv.close();
