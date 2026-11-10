// TTB smoke test — catalog integrity, dispatcher coverage, registry metadata.
import assert from 'node:assert/strict';
import './data/tools.js';
import fs from 'node:fs';
const meta = JSON.parse(fs.readFileSync(new URL('./PROJECT_METADATA.json', import.meta.url), 'utf8'));

const catalog = globalThis.TTB_CATALOG;
assert.ok(Array.isArray(catalog), 'catalog should be an array');
assert.equal(catalog.length, meta.tools, `expected ${meta.tools} catalog entries, got ${catalog.length}`);

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
// Case converter, title mode: the rest of the word goes down, and an apostrophe
// does not start a new one — "don't" used to become "Don't" with a capital T,
// and an all-caps input came back unchanged.
assert.equal(await runTool('Case converter', { text: 'HELLO WORLD', mode: 'Title Case' }), 'Hello World');
assert.equal(await runTool('Case converter', { text: 'hello WORLD', mode: 'Title Case' }), 'Hello World');
assert.equal(await runTool('Case converter', { text: "don't stop", mode: 'Title Case' }), "Don't Stop");
assert.equal(await runTool('Case converter', { text: 'Hello World', mode: 'lower' }), 'hello world');
const luhn = await runTool('Credit card validator (Luhn)', { text: '4242424242424242' });
assert.equal(luhn, 'Valid');
assert.equal(await runTool('NATO phonetic alphabet', { text: 'SOS' }), 'Sierra Oscar Sierra');
assert.equal(await runTool('NATO phonetic alphabet', { text: 'a-1' }), 'Alfa 1');

// Number to words — the grouping IS the feature, so each system is checked
// against a number whose grouping differs between them.
const nw = (text, b) => runTool('Number to words', { text, b: b || 'Indian (lakh/crore)' });
assert.equal(await nw('0'), 'Zero');
assert.equal(await nw('19'), 'Nineteen');
assert.equal(await nw('100'), 'One Hundred');
assert.equal(await nw('999'), 'Nine Hundred Ninety-Nine');
assert.equal(await nw('100000'), 'One Lakh');
assert.equal(await nw('12345678'), 'One Crore Twenty-Three Lakh Forty-Five Thousand Six Hundred Seventy-Eight');
assert.equal(await nw('12345678', 'International (million/billion)'), 'Twelve Million Three Hundred Forty-Five Thousand Six Hundred Seventy-Eight');
assert.equal(await nw('1000000000'), 'One Hundred Crore');
assert.equal(await nw('1000000000', 'International (million/billion)'), 'One Billion');
assert.equal(await nw('1,23,45,678'), 'One Crore Twenty-Three Lakh Forty-Five Thousand Six Hundred Seventy-Eight');
assert.equal(await nw('1234.50'), 'One Thousand Two Hundred Thirty-Four Point Five Zero');
assert.equal(await nw('-7'), 'Minus Seven');
assert.match(await nw(''), /Enter a number/);
assert.rejects(() => nw('12a'), /not a number/);
assert.rejects(() => nw('9'.repeat(16)), /Too large/);

console.log(`OK — ${catalog.length} tools, ${cats.size} categories, ${withInputs.length} with custom inputs`);

// Semver — the spec's own precedence list (semver.org §11) is the known answer,
// and each check is chosen so a plausible wrong implementation fails it.
const sv = (text, ctx) => runTool('Semver compare & bump', { text, ...ctx });
const specOrder = ['1.0.0-alpha', '1.0.0-alpha.1', '1.0.0-alpha.beta', '1.0.0-beta', '1.0.0-beta.2', '1.0.0-beta.11', '1.0.0-rc.1', '1.0.0'];
const shuffled = [specOrder[7], specOrder[4], specOrder[0], specOrder[6], specOrder[2], specOrder[5], specOrder[1], specOrder[3]];
const sorted = await sv(shuffled.join('\n'));
const got = sorted.split('\n').slice(1, 9).map((l) => l.replace(/^\d+\. /, ''));
assert.deepEqual(got, specOrder, 'precedence must follow semver.org §11 exactly');
// beta.11 vs beta.2 separates numeric comparison from lexical ("11" < "2" as text).
assert.ok(sorted.indexOf('1.0.0-beta.2') < sorted.indexOf('1.0.0-beta.11'), 'numeric identifiers must compare numerically');
assert.match(sorted, /Highest: 1\.0\.0$/m);
// A release outranks any prerelease of the same version.
assert.ok(sorted.indexOf('1.0.0-rc.1') < sorted.indexOf('\n8. 1.0.0') || sorted.includes('8. 1.0.0'));
// Build metadata is ignored for precedence but not silently dropped from the output.
const tie = await sv('1.0.0+build.9\n1.0.0+other');
assert.match(tie, /Equal precedence \(build metadata is ignored\)/);
// Parsing reports the parts it actually found.
const one = await sv('2.7.1-rc.2+sha.abc');
assert.match(one, /major 2/); assert.match(one, /minor 7/); assert.match(one, /patch 1/);
assert.match(one, /prerelease rc\.2/); assert.match(one, /build sha\.abc/);
// Rejections: a leading zero in a numeric prerelease id is invalid per the spec.
assert.rejects(() => sv('1.0.0-01'), /leading zeroes/);
assert.rejects(() => sv('1.0'), /Not a semantic version/);
assert.rejects(() => sv(''), /Enter a semantic version/);
// Bump — including the case where a patch bump on a prerelease only drops the prerelease.
assert.equal(await sv('1.2.3', { mode: 'Bump', b: 'patch' }), '1.2.3 → 1.2.4  (patch)');
assert.equal(await sv('1.2.3', { mode: 'Bump', b: 'minor' }), '1.2.3 → 1.3.0  (minor)');
assert.equal(await sv('1.2.3', { mode: 'Bump', b: 'major' }), '1.2.3 → 2.0.0  (major)');
assert.equal(await sv('1.2.3-rc.1', { mode: 'Bump', b: 'patch' }), '1.2.3-rc.1 → 1.2.3  (patch)');
assert.equal(await sv('1.2.3-rc.1+sha', { mode: 'Bump', b: 'minor' }), '1.2.3-rc.1+sha → 1.3.0  (minor)');
// Ranges — caret, tilde, AND, OR, wildcard, and the npm prerelease rule.
const inR = async (v, c) => (await sv(v, { mode: 'Range check', c })).includes('satisfies') && !(await sv(v, { mode: 'Range check', c })).includes('does NOT');
assert.equal(await inR('1.2.9', '^1.2.3'), true);
assert.equal(await inR('1.9.0', '^1.2.3'), true);
assert.equal(await inR('2.0.0', '^1.2.3'), false);
assert.equal(await inR('0.2.9', '^0.2.3'), true, 'caret on 0.x is bounded by the minor');
assert.equal(await inR('0.3.0', '^0.2.3'), false);
assert.equal(await inR('0.0.4', '^0.0.3'), false, 'caret on 0.0.x is bounded by the patch');
assert.equal(await inR('1.2.9', '~1.2.3'), true);
assert.equal(await inR('1.3.0', '~1.2.3'), false, 'tilde is bounded by the minor');
assert.equal(await inR('1.5.0', '>=1.2.0 <2.0.0'), true);
assert.equal(await inR('2.0.0', '>=1.2.0 <2.0.0'), false);
assert.equal(await inR('2.0.0', '1.2.3 || 2.0.0'), true);
assert.equal(await inR('2.0.1', '1.2.3 || 2.0.0'), false);
assert.equal(await inR('1.9.9', '1.x'), true);
assert.equal(await inR('2.0.0', '1.x'), false);
assert.equal(await inR('1.4.0', '1.2.3 - 1.5.0'), true);
assert.equal(await inR('1.6.0', '1.2.3 - 1.5.0'), false);
assert.equal(await inR('1.3.0-rc.1', '^1.2.3'), false, 'npm: a prerelease needs a prerelease in the same set');
assert.equal(await inR('1.2.3-rc.2', '>=1.2.3-rc.1 <2.0.0'), true);
assert.rejects(() => sv('1.0.0', { mode: 'Range check', c: '' }), /Enter a range/);
assert.match(await sv('1.2.3', { mode: 'Range check', c: '^2.0.0' }), /1\.2\.3 does NOT satisfy \^2\.0\.0/);
