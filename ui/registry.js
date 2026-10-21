// TTB — tool registry.
// Merges the catalog with every handler module and the input schema, so the UI
// can render the right fields and mark catalog-only entries honestly.
import { TTB_PHASE4_TOOLS } from '../tools/phase4.js';
import { TTB_PHASE5_TOOLS } from '../tools/phase5.js';
import { TTB_PHASE6_TOOLS } from '../tools/phase6.js';
import { TTB_PHASE7_TOOLS } from '../tools/phase7.js';
import { TTB_EXTRA_TEXT, TTB_EXTRA_CALC } from '../tools/t-text-calc.js';
import { TTB_EXTRA_DEV } from '../tools/t-dev-data.js';
import { TTB_EXTRA_MEDIA } from '../tools/t-media-design.js';
import { TTB_EXTRA_MISC } from '../tools/t-rest.js';
import { CORE_INPUTS } from '../data/inputs.js';
import { CORE_HANDLED } from '../data/core-handled.js';

const catalog = Array.isArray(globalThis.TTB_CATALOG) ? globalThis.TTB_CATALOG : [];
const groups = [TTB_PHASE4_TOOLS, TTB_PHASE5_TOOLS, TTB_PHASE6_TOOLS, TTB_PHASE7_TOOLS, TTB_EXTRA_TEXT, TTB_EXTRA_CALC, TTB_EXTRA_DEV, TTB_EXTRA_MEDIA, TTB_EXTRA_MISC];

const implementations = new Map();
for (const group of groups) {
  for (const tool of Object.values(group || {})) {
    if (tool?.name && typeof tool.run === 'function') implementations.set(tool.name.toLowerCase(), tool);
  }
}

const aliases = {
  'csv viewer/editor': 'csv viewer',
  'csv→json/sql/markdown/excel': 'csv to json',
  'email composer (mailto)': 'email composer',
  'sms link gen': 'sms link generator',
  'whatsapp link gen': 'whatsapp link generator',
  'telegram link gen': 'telegram link generator',
  'reading guide (ruler)': 'reading guide',
  'rps': 'rock paper scissors',
};
for (const [catalogName, implName] of Object.entries(aliases)) {
  const impl = implementations.get(implName);
  if (impl) implementations.set(catalogName, impl);
}

const handled = new Set([...CORE_HANDLED].map((n) => n.toLowerCase()));

export const tools = catalog.map((tool) => {
  const lc = tool.name.toLowerCase();
  const impl = implementations.get(lc);
  const core = CORE_INPUTS[lc] || {};
  const inputs = impl?.inputs || core.inputs || null;
  return {
    ...tool,
    implemented: Boolean(impl) || handled.has(lc),
    lazy: Boolean(impl?.lazy),
    dependency: impl?.dependency || null,
    inputs,
    output: impl?.output || core.output || 'text',
    dangerous: Boolean(core.dangerous || impl?.dangerous),
  };
});

export const getImplementation = (name) => implementations.get(String(name || '').toLowerCase()) || null;
export const toolMeta = (name) => tools.find((t) => t.name.toLowerCase() === String(name || '').toLowerCase()) || null;
