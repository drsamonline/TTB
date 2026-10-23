// TTB smoke test — catalog integrity, dispatcher coverage, registry metadata.
import assert from 'node:assert/strict';
import './data/tools.js';

const catalog = globalThis.TTB_CATALOG;
assert.ok(Array.isArray(catalog), 'catalog should be an array');
assert.equal(catalog.length, 591, `expected 591 catalog entries, got ${catalog.length}`);

const ids = catalog.map((t) => t.id);
assert.equal(new Set(ids).size, ids.length, 'catalog ids must be unique');
const names = catalog.map((t) => t.name.toLowerCase());
assert.equal(new Set(names).size, names.length, 'catalog names must be unique');
const cats = new Set(catalog.map((t) => t.category));
assert.equal(cats.size, 18, `expected 18 categories, got ${cats.size}`);

// chrome stub so browser-only handlers can be exercised under Node
const R = (v) => () => Promise.resolve(v);
globalThis.chrome = new Proxy({}, {
  get: (_, k) => {
    if (k === 'scripting') return { executeScript: R([{ result: 'ok' }]), insertCSS: R() };
    if (k === 'tabs') return { query: R([]), update: R({}), reload: R(), remove: R(), discard: R(), group: R(1), setZoom: R(), sendMessage: R(), create: R({}), captureVisibleTab: R('data:image/png;base64,') };
    if (k === 'cookies') return { getAll: R([]) };
    if (k === 'history') return { search: R([]), deleteRange: R() };
    if (k === 'downloads') return { search: R([]), download: R(1) };
    if (k === 'bookmarks') return { getTree: R({}), search: R([]) };
    if (k === 'management') return { getAll: R([]) };
    if (k === 'browsingData') return { remove: R() };
    if (k === 'fontSettings') return { getFontList: R([]) };
    if (k === 'permissions') return { getAll: R({}) };
    if (k === 'alarms') return { create: R() };
    if (k === 'storage') return { local: { get: R({}), set: R() }, session: { get: R({}), set: R() } };
    if (k === 'runtime') return { getManifest: () => ({ version: '0.9.0' }), getURL: (u) => u };
    return R(undefined);
  },
  apply: () => Promise.resolve(undefined),
});

const { runTool } = await import('./tools/core.js');
const { tools, getImplementation } = await import('./ui/registry.js');

let fallback = 0, threw = 0;
for (const t of catalog) {
  try {
    const r = await runTool(t.name, { text: '100', a: '100', b: '5', c: '1', d: '1', tab: { id: 1, url: 'https://example.com', title: 'x', windowId: 1 } });
    const s = typeof r === 'string' ? r : JSON.stringify(r);
    if (s.startsWith('Catalog entry:')) { fallback++; console.error('  no handler:', t.name); }
  } catch { threw++; }
}
assert.equal(fallback, 0, `${fallback} catalog entries have no handler`);
console.log(`dispatcher: ${catalog.length - fallback}/${catalog.length} resolved, ${threw} need specific input (ok)`);

// registry metadata sanity
const withInputs = tools.filter((t) => t.inputs && t.inputs.length);
assert.ok(withInputs.length > 40, `expected many tools to expose inputs, got ${withInputs.length}`);
assert.ok(tools.find((t) => t.name === 'History cleaner')?.dangerous, 'History cleaner must be flagged dangerous');
assert.ok(tools.find((t) => t.name === 'Cookie cleaner')?.dangerous, 'Cookie cleaner must be flagged dangerous');
assert.equal(tools.find((t) => t.name === 'Markdown preview')?.output, 'html');
assert.equal(tools.find((t) => t.name === 'QR gen')?.output, 'image');
assert.ok(getImplementation('Lorem ipsum'), 'new handlers should be registered');

// a couple of real computations
assert.equal(await runTool('Roman numerals', { text: '1987' }), 'MCMLXXXVII');
assert.match(await runTool('Base converter', { text: '255', b: '10', c: '16' }), /FF/);
assert.match(await runTool('Slug generator', { text: 'Hello, World!' }), /hello-world/);
const luhn = await runTool('Credit card validator (Luhn)', { text: '4242424242424242' });
assert.equal(luhn, 'Valid');
assert.equal(await runTool('NATO phonetic alphabet', { text: 'SOS' }), 'Sierra Oscar Sierra');
assert.equal(await runTool('NATO phonetic alphabet', { text: 'a-1' }), 'Alfa 1');

console.log(`OK — ${catalog.length} tools, ${cats.size} categories, ${withInputs.length} with custom inputs`);
