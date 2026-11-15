// TTB input guard — no tool may answer with the JavaScript engine's own error.
//
// test.mjs counts a throwing tool as "needs specific input (ok)". That is true for a
// tool that says "Choose an image file first." and false for one that says
// "Cannot read properties of undefined (reading 'length')" — the UI prints whatever
// it catches (`Error: ${e.message}`), so an internal error IS the tool's answer.
//
// On 2026-11-15 forty-four such leaks existed. Every JSON tool answered an empty box
// with "Unexpected end of JSON input"; Base converter answered "to base 1" with a raw
// RangeError; Fuzzy match answered one word with a TypeError. They are fixed. This
// test is what keeps them fixed.
//
// Two things are checked, and the second is the one that usually rots:
//   1. no tool throws TypeError/RangeError/ReferenceError/SyntaxError/URIError,
//      except for a browser global that Node does not have (declared, printed, and
//      cross-checked so the exemption list cannot quietly grow);
//   2. every tool that does throw throws an ordinary Error with a sentence in it.
import assert from 'node:assert/strict';
import './data/tools.js';

const INTERNAL = new Set(['TypeError', 'RangeError', 'ReferenceError', 'SyntaxError', 'URIError']);

// Tools that need a browser: the handler itself is correct and this guard runs in Node.
// The VALUE is the global each one is allowed to be missing, so an exemption cannot be
// used to hide a different failure.
const BROWSER_ONLY = new Map([
  ['XML→JSON', 'DOMParser'],
  ['XML viewer', 'DOMParser'],
  ['SVG→PNG', 'Image'],
  ['Screen recorder', 'navigator'],
  ['Audio recorder', 'navigator'],
  ['Webcam capture', 'navigator'],
  ['User agent switcher', 'navigator'],
  ['Language switcher', 'navigator'],
  ['Device info viewer', 'navigator'],
  ['Browser info viewer', 'navigator'],
  ['Fingerprint detector', 'navigator'],
  ['Screen resolution viewer', 'screen'],
  ['Placeholder image gen', 'document'],
]);

// chrome stub, same shape as test.mjs, so browser-API handlers can be exercised here.
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
const catalog = globalThis.TTB_CATALOG;

// Two shapes of "the user pressed Run without filling anything in", plus a filled one.
const CONTEXTS = {
  empty: { text: '' },
  untouched: { text: '', a: '', b: '', c: '', d: '' },
  filled: { text: '100', a: '100', b: '5', c: '1', d: '1', tab: { id: 1, url: 'https://example.com', title: 'x', windowId: 1 } },
};

const leaks = [];          // internal errors with no exemption
const badMessages = [];    // an Error, but with nothing a person can act on
const exempted = new Map(); // tool -> globals actually missing (must match BROWSER_ONLY)
let thrown = 0;

for (const t of catalog) {
  for (const [label, ctx] of Object.entries(CONTEXTS)) {
    let err = null;
    try {
      await runTool(t.name, { ...ctx });
    } catch (e) {
      err = e;
    }
    if (!err) continue;
    thrown++;
    const kind = err?.constructor?.name || 'Error';
    const msg = String(err?.message ?? '');
    if (INTERNAL.has(kind)) {
      const global = /^(\w+) is not defined$/.exec(msg)?.[1];
      if (global && BROWSER_ONLY.get(t.name) === global) {
        exempted.set(t.name, global);
        continue;
      }
      leaks.push(`${t.name} [${label}] ${kind}: ${msg}`);
      continue;
    }
    if (!msg.trim()) badMessages.push(`${t.name} [${label}] threw an ${kind} with no message`);
  }
}

// The exemption list must be exactly what the estate actually needs — a stale entry
// hides a fix, a missing one fails the run. Both are printed, neither is silent.
const stale = [...BROWSER_ONLY.keys()].filter((n) => !exempted.has(n));
const surprising = [...exempted.keys()].filter((n) => !BROWSER_ONLY.has(n));

console.log(`input guard: ${catalog.length} tools x ${Object.keys(CONTEXTS).length} contexts, ${thrown} refusals`);
console.log(`  ${exempted.size} browser-only (declared): ${[...exempted].map(([n, g]) => `${n} (${g})`).join(', ')}`);

assert.deepEqual(leaks, [], `${leaks.length} tool(s) answer with a raw JavaScript error:\n  ${leaks.join('\n  ')}`);
assert.deepEqual(badMessages, [], `${badMessages.length} tool(s) throw an empty error:\n  ${badMessages.join('\n  ')}`);
assert.deepEqual(stale, [], `BROWSER_ONLY lists ${stale.length} tool(s) that no longer need a browser: ${stale.join(', ')} — remove them, the guard should not carry dead exemptions`);
assert.deepEqual(surprising, [], `these tools were exempted without being declared: ${surprising.join(', ')}`);

// A refusal has to be a sentence, not a code. Spot-check the three that used to leak.
const sentence = async (name, ctx) => {
  try {
    await runTool(name, ctx);
    return '';
  } catch (e) {
    assert.equal(e.constructor.name, 'Error', `${name} must throw a plain Error, got ${e.constructor.name}`);
    return String(e.message);
  }
};
const emptyJson = await sentence('JSON format/validate/minify', { text: '' });
assert.match(emptyJson, /Paste some JSON first/, `JSON tools must name the empty box, got: ${emptyJson}`);
const badJson = await sentence('JSON viewer', { text: '{oops}' });
assert.match(badJson, /not valid JSON/, `invalid JSON must say so, got: ${badJson}`);
const badBase = await sentence('Base converter', { text: '100', b: '10', c: '1' });
assert.match(badBase, /2 to 36/, `Base converter must name the range, got: ${badBase}`);
const oneWord = await sentence('Fuzzy match', { text: 'hello' });
assert.match(oneWord, /comma/, `Fuzzy match must ask for two strings, got: ${oneWord}`);

console.log(`OK — ${catalog.length} tools, 0 raw JavaScript errors, ${exempted.size} declared browser-only`);
