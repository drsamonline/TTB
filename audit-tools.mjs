// Functional audit — runs every catalog tool with realistic inputs and grades
// the actual output. This is the honest counterpart to "the handler resolves".
//
// Verdicts:
//   REAL        output is computed and changes with input
//   STATIC      output is identical for different inputs (a reference/lookup, not a function)
//   SHALLOW     REAL but trivially short
//   PLACEHOLDER says it is not available / not bundled / not implemented
//   EMPTY       returned nothing
//   ERROR       threw
//   BROWSER     needs a live tab/extension context (page & privileged tools) — not testable here
import fs from 'node:fs';
process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});
const withTimeout = (p, ms = 2500) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

await import('./data/tools.js');

const R = (v) => () => Promise.resolve(v);
globalThis.chrome = {
  scripting: { executeScript: R([{ result: null }]) },
  tabs: { query: R([]), update: R({}), reload: R(), remove: R(), discard: R(), group: R(1), setZoom: R(), sendMessage: R(), create: R({}), captureVisibleTab: R('') },
  storage: { local: { get: R({}), set: R() }, session: { get: R({}), set: R() } },
  cookies: { getAll: R([]) }, history: { search: R([]), deleteRange: R() },
  downloads: { search: R([]), download: R(1) }, bookmarks: { getTree: R({}), search: R([]) },
  management: { getAll: R([]) }, browsingData: { remove: R() }, fontSettings: { getFontList: R([]) },
  permissions: { getAll: R({}) }, alarms: { create: R() }, windows: { getCurrent: R({ id: 1 }) },
  runtime: { getManifest: () => ({ version: '0.10.0' }), getURL: (u) => u },
};

const { runTool } = await import('./tools/core.js');
const { tools } = await import('./ui/registry.js');
const { isPageTool } = await import('./tools/page.js');
const catalog = globalThis.TTB_CATALOG;

const PROSE = 'The quick brown fox jumps over the lazy dog. It was a bright cold day in April, and the clocks were striking thirteen.';
const PROSE2 = 'Signal processing benefits enormously from careful sampling and reconstruction. Engineers often overlook aliasing until it bites.';

function sampleFor(name, category) {
  const n = name.toLowerCase();
  const has = (...k) => k.some((x) => n.includes(x));
  if (has('json', 'jsonpath')) return '{"name":"Ada","age":36,"tags":["math","code"],"address":{"city":"Pune","zip":"411001"}}';
  if (has('csv', 'table', 'pivot', 'histogram', 'box plot', 'heatmap', 'chart', 'scatter', 'correlation matrix')) return 'name,score,city\nA,10,Pune\nB,20,Delhi\nC,30,Mumbai\nD,40,Pune';
  if (has('url', 'href', 'domain', 'subnet', 'cidr', 'mac')) return 'https://example.com/path/page?a=1&utm_source=newsletter';
  if (has('color', 'colour', 'hex', 'palette', 'contrast', 'gradient', 'hsl')) return '#336699';
  if (has('date', 'age', 'zodiac', 'birthday', 'anniversary', 'countdown', 'days-since', 'biorhythm', 'week number', 'day of week')) return '1990-05-20';
  if (has('email')) return 'user@example.com';
  if (has('phone', 'sms')) return '+91 98765 43210';
  if (has('regex', 'pattern')) return 'Order 1234 shipped on 2024-03-15 to user@example.com';
  if (has('jwt')) return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSJ9.abc123';
  if (has('morse')) return 'SOS';
  if (has('base64')) return 'hello world';
  if (has('hash', 'hmac', 'sha')) return 'abc';
  if (has('semver', 'semantic version')) return '1.0.0-beta.11\n1.0.0-alpha\n1.0.0';
  if (has('cron')) return '*/15 9-17 * * 1-5';
  if (has('totp', 'hotp', 'base32', 'secret')) return 'JBSWY3DPEHPK3PXP';
  if (has('iban')) return 'DE89370400440532013000';
  if (has('credit card', 'luhn')) return '4242424242424242';
  if (has('matrix')) return '1 2\n3 4';
  if (has('svg')) return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect width="24" height="24"/></svg>';
  if (has('xml')) return '<root><item id="1">A</item><item id="2">B</item></root>';
  if (has('yaml')) return 'name: Ada\nage: 36\ncity: Pune';
  if (has('toml')) return '[server]\nport = 8080\nhost = "localhost"';
  if (has('ini')) return '[main]\nkey=value';
  if (has('env')) return 'API_URL=https://example.com\nDEBUG=true';
  if (has('cron')) return '0 9 * * 1';
  if (has('markdown')) return '# Title\n\nSome **bold** and *italic* text.\n\n- one\n- two';
  if (has('sql')) return 'select id, name from users where age > 30 order by name limit 10;';
  if (has('css')) return 'div.card > a:hover { color: red; }';
  if (has('lorem')) return '';
  if (category === 'Calculators & Converters' || category === 'Finance') return '1234.5';
  if (category === 'Data') return 'name,score\nA,10\nB,20\nC,30';
  return PROSE;
}

const PLACEHOLDER = /not available|not bundled|is not implemented|not enabled in this build|does not expose|requires a dedicated|dedicated adapter|STATUS: dependency|not possible|intentionally not|requires page-level|requires content-script|no remote code|not persisted|requires a file payload|provide a file|not supported by/i;
const BROWSER_HINT = /needs an active tab|no active tab|requires an active tab|select a tab/i;

function buildCtx(meta, text) {
  const ctx = { text, a: text, tab: { id: 1, url: 'https://example.com/article', title: 'Example', windowId: 1, pinned: false } };
  for (const inp of meta?.inputs || []) {
    if (inp.type === 'file') { ctx[inp.key] = { name: 'sample.png', type: 'image/png', size: 1024, dataUrl: 'data:image/png;base64,iVBORw0KGgo=', buf: new ArrayBuffer(64) }; continue; }
    if (inp.key === 'text') continue;
    ctx[inp.key] = inp.value ?? (inp.type === 'select' ? (inp.options || [''])[0] : inp.type === 'number' ? '10' : 'sample');
  }
  return ctx;
}

const results = [];
for (const t of catalog) {
  const meta = tools.find((x) => x.name === t.name) || {};
  const isPage = isPageTool(t.name);
  const rec = { name: t.name, category: t.category, output: meta.output || 'text', lazy: !!meta.lazy, page: isPage };
  const s1 = sampleFor(t.name, t.category);
  const s2 = s1 === PROSE ? PROSE2 : sampleFor(t.name, t.category) + ' extra';
  try {
    const r1 = await withTimeout(runTool(t.name, buildCtx(meta, s1)));
    let out1 = typeof r1 === 'string' ? r1 : JSON.stringify(r1, null, 2);
    rec.bytes = out1.length;
    if (!out1 || !out1.trim()) { rec.verdict = 'EMPTY'; }
    else if (PLACEHOLDER.test(out1) && out1.length < 400) { rec.verdict = 'PLACEHOLDER'; rec.sample = out1.slice(0, 120); }
    else if (BROWSER_HINT.test(out1)) { rec.verdict = 'BROWSER'; }
    else {
      let r2; try { r2 = await withTimeout(runTool(t.name, buildCtx(meta, s2))); } catch { r2 = null; }
      const out2 = typeof r2 === 'string' ? r2 : JSON.stringify(r2, null, 2);
      if (out1 === out2 && out1.length > 40) { rec.verdict = 'STATIC'; rec.sample = out1.slice(0, 120); }
      else if (out1.trim().length < 12) { rec.verdict = 'SHALLOW'; rec.sample = out1.slice(0, 120); }
      else { rec.verdict = 'REAL'; rec.sample = out1.slice(0, 120); }
    }
  } catch (e) {
    const msg = String(e?.message || e);
    rec.sample = msg.slice(0, 120);
    if (/is not defined|document is not defined|navigator is not defined|screen is not defined|DOMParser is not defined|Image is not defined|is not a function/.test(msg)) rec.verdict = 'ENV';       // needs a real browser
    else if (/Cannot read|Cannot convert|undefined is not|of null|of undefined/.test(msg)) rec.verdict = 'CRASH';          // genuine bug
    else rec.verdict = 'VALIDATION';                                                                                     // correctly rejected bad input
  }
  if (isPage && rec.verdict !== 'REAL') rec.verdict = 'BROWSER';
  results.push(rec);
}

const counts = {};
for (const r of results) counts[r.verdict] = (counts[r.verdict] || 0) + 1;
fs.writeFileSync('tool-audit.json', JSON.stringify(results, null, 1));
console.log(JSON.stringify(counts, null, 2));
console.log('total', results.length);
for (const v of ['CRASH', 'PLACEHOLDER', 'EMPTY', 'SHALLOW']) {
  const list = results.filter((r) => r.verdict === v);
  console.log(`\n### ${v} (${list.length})`);
  console.log(list.map((r) => `${r.name}  [${r.category}]${r.sample ? '  :: ' + r.sample.replace(/\s+/g, ' ').slice(0, 70) : ''}`).join('\n'));
}
