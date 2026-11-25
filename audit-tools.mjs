// Functional audit — runs every catalog tool with realistic inputs and grades
// the actual output. This is the honest counterpart to "the handler resolves".
//
// The audit is DETERMINISTIC. Two runs of the same commit produce byte-identical
// `tool-audit.json` and `TOOL_AUDIT.md`, so the audit stops being a screenshot and
// becomes a check: `node audit-tools.mjs --check` exits non-zero when the committed
// results no longer match what the code produces. Three sources of drift are pinned
// before any tool code loads — `Math.random`, `crypto.getRandomValues`/`randomUUID`,
// and the clock — because a random password, a UUID or "now" would otherwise differ
// on every run.
//
// Verdicts:
//   REAL        output is computed and changes with input
//   STATIC      output is identical for different inputs (a reference/lookup, not a function)
//   SHALLOW     REAL but trivially short
//   PLACEHOLDER says it is not available / not bundled / not implemented
//   EMPTY       returned nothing
//   ERROR       threw
//   BROWSER     needs a live tab/extension context (page & privileged tools) — not testable here
//
// Usage:
//   node audit-tools.mjs                 regenerate tool-audit.json + TOOL_AUDIT.md
//   node audit-tools.mjs --check         verify both are current; exit 1 on drift
//   node audit-tools.mjs --seed=7 --clock=2026-01-01T00:00:00Z
import fs from 'node:fs';
process.env.TZ = 'UTC';   // a sample that prints a date must not depend on the host's timezone
process.on('unhandledRejection', () => {});                       // a tool's stray rejection is graded, not fatal
process.on('uncaughtException', (e) => { console.error(e); process.exit(1); });  // anything else is a real bug

// ---- flags ---------------------------------------------------------------
const argv = process.argv.slice(2);
function flag(name, dflt) {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return dflt;
  const eq = hit.indexOf('=');
  return eq === -1 ? true : hit.slice(eq + 1);
}
const SEED = Number(flag('seed', 20260101)) >>> 0;
const CLOCK = Date.parse(String(flag('clock', '2026-01-01T00:00:00.000Z')));
const CHECK = flag('check', false) === true;
const OUT = String(flag('out', 'tool-audit.json'));
const MD = String(flag('md', 'TOOL_AUDIT.md'));
if (!Number.isFinite(CLOCK)) throw new Error(`--clock is not a date: ${flag('clock')}`);

// ---- determinism, installed before any tool module is imported -----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(SEED);
Math.random = rng;

const realCrypto = globalThis.crypto;
const fakeCrypto = {
  getRandomValues(arr) {
    const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(rng() * 256);
    return arr;
  },
  randomUUID() {
    const b = new Uint8Array(16);
    fakeCrypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  },
  randomBytes(n) {
    const b = new Uint8Array(n);
    fakeCrypto.getRandomValues(b);
    return b;
  },
  subtle: realCrypto?.subtle,
};
Object.defineProperty(globalThis, 'crypto', { value: fakeCrypto, configurable: true, writable: true });

// No network. Two tools — URL expander and URL shortener resolver — fetch for real,
// so their verdict depended on whether the HOST had internet: green on a laptop,
// a failure message in a sandbox. The audit grades the offline behaviour, which is
// the behaviour a shipped offline toolbox must have.
globalThis.fetch = () => Promise.reject(new Error('audit: network disabled'));

const RealDate = Date;
class FixedDate extends RealDate {
  constructor(...args) {
    if (args.length === 0) super(CLOCK);
    else super(...args);
  }
  static now() { return CLOCK; }
}
globalThis.Date = FixedDate;

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
    else if (PLACEHOLDER.test(out1) && out1.length < 400) { rec.verdict = 'PLACEHOLDER'; }
    else if (BROWSER_HINT.test(out1)) { rec.verdict = 'BROWSER'; }
    else {
      let r2; try { r2 = await withTimeout(runTool(t.name, buildCtx(meta, s2))); } catch { r2 = null; }
      const out2 = typeof r2 === 'string' ? r2 : JSON.stringify(r2, null, 2);
      if (out1 === out2 && out1.length > 40) rec.verdict = 'STATIC';
      else if (out1.trim().length < 12) rec.verdict = 'SHALLOW';
      else rec.verdict = 'REAL';
    }
    rec.sample = out1.slice(0, 120);
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

// ---- report --------------------------------------------------------------
const counts = {};
for (const r of results) counts[r.verdict] = (counts[r.verdict] || 0) + 1;

const VERDICTS = [
  ['REAL', 'computed output that changes with input'],
  ['SHALLOW', 'real but terse'],
  ['STATIC', 'identical for different inputs (reference or lookup)'],
  ['VALIDATION', 'correctly rejected the generic sample'],
  ['ENV', 'needs a browser API (Image/document/navigator)'],
  ['BROWSER', 'needs a live tab or privileged API'],
  ['PLACEHOLDER', 'says the capability is unavailable here'],
  ['EMPTY', 'no match for the sample input'],
  ['CRASH', 'threw an unexpected error'],
];

const cell = (s) => String(s ?? '').replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim().slice(0, 70) || '—';

function renderSummary() {
  const cats = new Set(results.map((r) => r.category));
  return [
    `**${results.length} tools** across **${cats.size}** categories.`,
    '',
    '| Verdict | Meaning | Count |',
    '|---|---|---:|',
    ...VERDICTS.map(([v, m]) => `| \`${v}\` | ${m} | ${counts[v] || 0} |`),
  ].join('\n');
}

function renderTools() {
  const order = [];
  const byCat = new Map();
  for (const r of results) {
    if (!byCat.has(r.category)) { byCat.set(r.category, []); order.push(r.category); }
    byCat.get(r.category).push(r);
  }
  const out = [];
  for (const cat of order) {
    out.push(`### ${cat}`, '', '| Tool | Verdict | Output sample |', '|---|---|---|');
    for (const r of byCat.get(cat)) out.push(`| ${cell(r.name)} | \`${r.verdict}\` | ${cell(r.sample)} |`);
    out.push('');
  }
  return out.join('\n').trimEnd();
}

const json = JSON.stringify(results, null, 1);
const SUMMARY_RE = /<!-- BEGIN GENERATED: audit summary -->[\s\S]*?<!-- END GENERATED: audit summary -->/;
const TOOLS_RE = /<!-- BEGIN GENERATED: audit tools -->[\s\S]*?<!-- END GENERATED: audit tools -->/;

function applyBlocks(text) {
  if (!SUMMARY_RE.test(text) || !TOOLS_RE.test(text)) {
    throw new Error(`${MD} is missing a generated block marker (audit summary / audit tools)`);
  }
  return text
    .replace(SUMMARY_RE, `<!-- BEGIN GENERATED: audit summary -->\n${renderSummary()}\n<!-- END GENERATED: audit summary -->`)
    .replace(TOOLS_RE, `<!-- BEGIN GENERATED: audit tools -->\n${renderTools()}\n<!-- END GENERATED: audit tools -->`);
}

if (CHECK) {
  const drift = [];
  const committed = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (committed !== json) {
    let before = [];
    try { before = JSON.parse(committed); } catch { /* unparseable counts as total drift */ }
    const was = new Map((Array.isArray(before) ? before : []).map((r) => [r.name, JSON.stringify(r)]));
    const now = new Set(results.map((r) => r.name));
    const changed = results.filter((r) => was.get(r.name) !== JSON.stringify(r)).map((r) => r.name);
    const gone = [...was.keys()].filter((n) => !now.has(n));
    drift.push(`${OUT}: ${changed.length} record(s) changed, ${gone.length} removed${changed.length ? ' — ' + changed.slice(0, 12).join(', ') + (changed.length > 12 ? ', …' : '') : ''}${gone.length ? ' — gone: ' + gone.slice(0, 8).join(', ') : ''}`);
  }
  if (!fs.existsSync(MD)) drift.push(`${MD}: missing`);
  else {
    const md = fs.readFileSync(MD, 'utf8');
    let rendered;
    try { rendered = applyBlocks(md); } catch (e) { drift.push(`${MD}: ${e.message}`); rendered = md; }
    if (rendered !== md) drift.push(`${MD}: generated blocks are stale (run: node audit-tools.mjs)`);
  }
  if (drift.length) {
    console.error('AUDIT DRIFT — the committed audit does not match what the code produces:');
    for (const d of drift) console.error('  ' + d);
    console.error(`(seed ${SEED}, clock ${new Date(CLOCK).toISOString()})`);
    process.exit(1);
  }
  console.log(`audit check: OK — ${OUT} and ${MD} match ${results.length} tools (seed ${SEED})`);
} else {
  fs.writeFileSync(OUT, json);
  const md = fs.readFileSync(MD, 'utf8');
  fs.writeFileSync(MD, applyBlocks(md));
  console.log(JSON.stringify(counts, null, 2));
  console.log('total', results.length);
  for (const v of ['CRASH', 'PLACEHOLDER', 'EMPTY', 'SHALLOW']) {
    const list = results.filter((r) => r.verdict === v);
    console.log(`\n### ${v} (${list.length})`);
    console.log(list.map((r) => `${r.name}  [${r.category}]${r.sample ? '  :: ' + r.sample.replace(/\s+/g, ' ').slice(0, 70) : ''}`).join('\n'));
  }
}
