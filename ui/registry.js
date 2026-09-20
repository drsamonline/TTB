import {TTB_PHASE4_TOOLS} from '../tools/phase4.js';
import {TTB_PHASE5_TOOLS} from '../tools/phase5.js';
import {TTB_PHASE6_TOOLS} from '../tools/phase6.js';
import {TTB_PHASE7_TOOLS} from '../tools/phase7.js';

const catalog = Array.isArray(globalThis.TTB_CATALOG) ? globalThis.TTB_CATALOG : [];
const implementations = new Map();
for (const group of [TTB_PHASE4_TOOLS, TTB_PHASE5_TOOLS, TTB_PHASE6_TOOLS, TTB_PHASE7_TOOLS]) {
  for (const tool of Object.values(group)) {
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
  'rps': 'rock paper scissors'
};
for (const [catalogName, implName] of Object.entries(aliases)) {
  const impl = implementations.get(implName);
  if (impl) implementations.set(catalogName, impl);
}

export const tools = catalog.map(tool => {
  const impl = implementations.get(tool.name.toLowerCase());
  return {...tool, implemented:Boolean(impl), lazy:Boolean(impl?.lazy), dependency:impl?.dependency||null};
});
export const getImplementation = name => implementations.get(String(name || '').toLowerCase()) || null;
