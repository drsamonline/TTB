// Screenshot harness — renders the real TTB popup in headless Chrome and
// captures PNGs for the README. Lives outside the extension, never shipped.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)));
const OUT = path.join(ROOT, 'docs', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, url === '/' ? '/popup.html' : url);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nope'); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;

const CHROME = ['/usr/local/bin/chromium-headless-shell', '/usr/local/bin/chromium', '/usr/local/bin/google-chrome-stable'].find((p) => fs.existsSync(p));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 760, deviceScaleFactor: 2 });

await page.evaluateOnNewDocument(() => {
  const R = (v) => async () => v;
  window.chrome = {
    tabs: { query: R([{ id: 1, url: 'https://example.com/article', title: 'Example page', windowId: 1, active: true }]), captureVisibleTab: R('data:image/png;base64,'), update: R({}), reload: R(), setZoom: R(), create: R({}) },
    scripting: { executeScript: R([{ result: null }]) },
    storage: { local: { get: R({}), set: R() }, session: { get: R({}), set: R() } },
    downloads: { download: R(1), search: R([]) },
    cookies: { getAll: R([]) }, history: { search: R([]), deleteRange: R() }, bookmarks: { getTree: R({}), search: R([]) },
    management: { getAll: R([]) }, browsingData: { remove: R() }, fontSettings: { getFontList: R([]) },
    permissions: { getAll: R({}) }, alarms: { create: R() }, windows: { getCurrent: R({ id: 1 }) },
    runtime: { getManifest: () => ({ version: '0.9.0' }), getURL: (u) => u },
  };
});

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = async (name) => { await page.screenshot({ path: path.join(OUT, name) }); console.log('shot', name); };

async function searchFor(q) {
  await page.evaluate((q) => { const s = document.querySelector('#search'); s.value = q; s.dispatchEvent(new Event('input', { bubbles: true })); }, q);
  await wait(220);
}
async function openTool(name) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('.category-btn')].find((x) => x.textContent.startsWith('All Tools')); b.click(); });
  await wait(150);
  await searchFor(name);
  const clicked = await page.evaluate((n) => {
    const btn = [...document.querySelectorAll('.tool')].find((b) => b.querySelector('.tool-name')?.textContent === n);
    if (!btn) return false; btn.click(); return true;
  }, name);
  if (!clicked) throw new Error('tool not found: ' + name);
  await wait(280);
}
async function fill(key, value) {
  await page.evaluate((k, v) => {
    const el = k === 'text' ? document.querySelector('#input') : document.querySelector(`[data-key="${k}"]`);
    if (!el) throw new Error('field not found: ' + k);
    el.value = v; el.dispatchEvent(new Event('input', { bubbles: true }));
  }, key, value);
}
async function run() { await page.click('#run'); await wait(1000); }

await page.goto(`http://127.0.0.1:${PORT}/popup.html`, { waitUntil: 'networkidle0' });
await page.waitForSelector('.category-btn', { timeout: 15000 });
await wait(500);
await shot('01-catalog.png');

await page.evaluate(() => { const b = [...document.querySelectorAll('.category-btn')].find((x) => x.textContent.startsWith('Finance')); b.click(); });
await wait(350);
await shot('02-category.png');

await openTool('Loan/EMI');
await fill('text', '500000'); await fill('b', '8.5'); await fill('c', '60');
await run();
await shot('03-tool-inputs.png');

await openTool('Typography scale');
await run();
await shot('04-html-output.png');

await openTool('QR gen');
await fill('text', 'https://github.com/drsamonline/TTB');
await run();
await shot('05-image-output.png');

await openTool('TOTP (RFC 6238)');
await fill('secret', 'JBSWY3DPEHPK3PXP');
await run();
await shot('06-totp.png');

await openTool('History cleaner');
await wait(250);
await shot('07-confirm.png');

await browser.close();
server.close();
console.log('done');
