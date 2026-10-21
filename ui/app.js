// TTB — popup / side-panel controller (classic script).
// Renders the catalog, builds the right input fields per tool, gates destructive
// actions behind an explicit tick, and renders text / HTML / image output.
(() => {
  'use strict';
  const catalog = Array.isArray(globalThis.TTB_CATALOG) ? globalThis.TTB_CATALOG : [];
  const $ = (s) => document.querySelector(s);
  const searchInput = $('#search'), categoryNav = $('#categories'), list = $('#list'), panel = $('#panel');
  const titleEl = panel?.querySelector('h2'), categoryEl = panel?.querySelector('.category');
  const status = $('#status'), fields = $('#fields'), output = $('#output');
  const actions = $('#actions'), confirmRow = $('#confirm-row');
  const toolIndex = new Map();
  let activeCategory = 'All Tools';
  let current = null;
  let runTool = null;

  const categories = [...new Set(catalog.map((t) => t.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const categoryCounts = new Map(categories.map((c) => [c, catalog.filter((t) => t.category === c).length]));

  function search(q, categoryName = activeCategory, limit = 80) {
    q = String(q || '').trim().toLowerCase();
    const pool = categoryName === 'All Tools' ? catalog : catalog.filter((t) => t.category === categoryName);
    if (!q) return pool.slice(0, limit);
    const terms = q.split(/\s+/);
    return pool.map((t) => {
      const name = t.name.toLowerCase(), hay = `${name} ${t.category}`.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (name === term) score += 100; else if (name.startsWith(term)) score += 60; else if (hay.includes(term)) score += 25; else score -= 50;
      }
      return [score, t];
    }).filter((x) => x[0] > 0).sort((a, b) => b[0] - a[0]).slice(0, limit).map((x) => x[1]);
  }

  function renderCategories() {
    if (!categoryNav) return;
    categoryNav.textContent = '';
    const frag = document.createDocumentFragment();
    const mk = (label, count, name) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `category-btn${activeCategory === name ? ' active' : ''}`;
      b.setAttribute('aria-pressed', String(activeCategory === name));
      const l = document.createElement('span'); l.textContent = label;
      const c = document.createElement('span'); c.className = 'count'; c.textContent = String(count);
      b.append(l, c);
      b.addEventListener('click', () => selectCategory(name));
      frag.appendChild(b);
    };
    mk('All Tools', catalog.length, 'All Tools');
    for (const name of categories) mk(name, categoryCounts.get(name), name);
    categoryNav.appendChild(frag);
  }

  function selectCategory(name) { activeCategory = name; renderCategories(); render(search(searchInput.value)); list?.scrollTo({ top: 0, behavior: 'smooth' }); }

  function render(items) {
    list.textContent = '';
    const frag = document.createDocumentFragment();
    for (const t of items) {
      const meta = toolIndex.get(t.name.toLowerCase()) || {};
      const b = document.createElement('button');
      b.className = 'tool'; b.type = 'button';
      b.setAttribute('aria-label', `${t.name}, ${t.category}`);
      const name = document.createElement('span'); name.className = 'tool-name'; name.textContent = t.name;
      const cat = document.createElement('span'); cat.className = 'tool-cat'; cat.textContent = t.category;
      b.append(name, cat);
      if (meta.lazy) { const s = document.createElement('span'); s.className = 'badge lazy'; s.textContent = 'lazy'; b.appendChild(s); }
      else if (meta.implemented === false) { const s = document.createElement('span'); s.className = 'badge catalog'; s.textContent = 'catalog'; b.appendChild(s); }
      b.addEventListener('click', () => openTool(t));
      frag.appendChild(b);
    }
    list.appendChild(frag);
    if (status) { const scope = activeCategory === 'All Tools' ? 'all categories' : activeCategory; status.textContent = `${items.length} tools shown in ${scope}`; }
  }

  function field(labelText, control, hint) {
    const wrap = document.createElement('label');
    wrap.className = 'field';
    const span = document.createElement('span'); span.className = 'field-label'; span.textContent = labelText;
    wrap.appendChild(span); wrap.appendChild(control);
    if (hint) { const h = document.createElement('span'); h.className = 'field-hint'; h.textContent = hint; wrap.appendChild(h); }
    return wrap;
  }
  function makeControl(spec) {
    let el;
    if (spec.type === 'select') { el = document.createElement('select'); for (const o of spec.options || []) { const op = document.createElement('option'); op.value = o; op.textContent = o; el.appendChild(op); } if (spec.value != null) el.value = spec.value; }
    else if (spec.type === 'textarea') { el = document.createElement('textarea'); el.rows = 4; el.value = spec.value ?? ''; }
    else if (spec.type === 'file') { el = document.createElement('input'); el.type = 'file'; if (spec.accept) el.accept = spec.accept; }
    else if (spec.type === 'checkbox') { el = document.createElement('input'); el.type = 'checkbox'; el.checked = !!spec.value; }
    else { el = document.createElement('input'); el.type = spec.type === 'number' ? 'number' : 'text'; if (spec.value != null) el.value = spec.value; }
    if (spec.placeholder) el.placeholder = spec.placeholder;
    el.dataset.key = spec.key;
    el.dataset.kind = spec.type || 'text';
    return el;
  }

  function openTool(t) {
    const meta = toolIndex.get(t.name.toLowerCase()) || {};
    current = { tool: t, meta };
    panel.hidden = false;
    titleEl.textContent = t.name;
    categoryEl.textContent = t.category;
    fields.textContent = '';
    output.textContent = '';
    const inputs = Array.isArray(meta.inputs) ? meta.inputs : [];
    const primaryIsFile = inputs[0]?.type === 'file';
    if (!primaryIsFile) {
      const ta = document.createElement('textarea');
      ta.id = 'input'; ta.rows = 5; ta.spellcheck = false;
      ta.placeholder = meta.output === 'html' ? 'Enter input…' : 'Enter input…';
      fields.appendChild(field('Input', ta));
    }
    for (const spec of inputs) fields.appendChild(field(spec.label || spec.key, makeControl(spec), spec.hint));
    confirmRow.hidden = !meta.dangerous;
    const cb = confirmRow.querySelector('input');
    if (cb) cb.checked = false;
    actions.hidden = false;
    panel.scrollTop = 0;
    const focusEl = fields.querySelector('textarea, input:not([type=file])');
    if (focusEl) focusEl.focus();
    if (meta.dangerous && status) status.textContent = 'This tool changes browser state — tick the confirmation to run it.';
  }

  async function readFile(input) {
    const f = input.files && input.files[0];
    if (!f) return null;
    const buf = await f.arrayBuffer();
    let dataUrl = '';
    try { dataUrl = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); }); } catch {}
    return { name: f.name, type: f.type, size: f.size, dataUrl, buf };
  }

  function showOutput(meta, text) {
    output.textContent = '';
    if (meta.output === 'html') {
      const frame = document.createElement('iframe');
      frame.className = 'preview';
      frame.setAttribute('sandbox', 'allow-scripts');
      frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#0f1115;color:#e8eaed;font:13px system-ui}</style></head><body>${text}</body></html>`;
      output.appendChild(frame);
    } else if (meta.output === 'image') {
      const wrap = document.createElement('div'); wrap.className = 'imgwrap';
      const img = document.createElement('img'); img.src = text; img.alt = 'Tool result';
      const a = document.createElement('a'); a.href = text; a.download = 'ttb-result'; a.textContent = 'Download';
      wrap.append(img, a); output.appendChild(wrap);
    } else {
      const ta = document.createElement('textarea');
      ta.readOnly = true; ta.rows = 12; ta.spellcheck = false; ta.value = text;
      output.appendChild(ta);
    }
  }

  async function ensureRunner() { if (!runTool) ({ runTool } = await import('../tools/core.js')); return runTool; }
  const getTab = async () => (await chrome.tabs.query({ active: true, currentWindow: true }))[0] || null;

  async function doRun() {
    if (!current) return;
    const meta = current.meta;
    const ctx = {};
    const inputs = Array.isArray(meta.inputs) ? meta.inputs : [];
    const primaryIsFile = inputs[0]?.type === 'file';
    const textArea = fields.querySelector('textarea#input');
    ctx.text = textArea ? textArea.value : '';
    ctx.a = ctx.text;
    for (const el of fields.querySelectorAll('[data-key]')) {
      const k = el.dataset.key, kind = el.dataset.kind;
      if (kind === 'file') { const file = await readFile(el); if (file) ctx[k] = file; }
      else if (kind === 'checkbox') ctx[k] = el.checked;
      else ctx[k] = el.value;
    }
    if (meta.dangerous) ctx.confirm = !!confirmRow.querySelector('input')?.checked;
    ctx.tab = await getTab();
    if (primaryIsFile && !ctx[inputs[0].key]) { showOutput(meta, 'Choose a file first.'); return; }
    showOutput(meta, 'Running…');
    try {
      const fn = await ensureRunner();
      const result = await fn(current.tool.name, ctx);
      const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      showOutput(meta, text);
      if (meta.dangerous && status) status.textContent = 'Done.';
    } catch (e) {
      showOutput(meta, `Error: ${e?.message || e}`);
    }
    output.scrollTop = 0;
  }

  if (!searchInput || !categoryNav || !list || !panel || !fields || !output) throw new Error('TTB UI shell is incomplete');

  searchInput.addEventListener('input', () => render(search(searchInput.value)));
  $('#run').addEventListener('click', doRun);
  $('#copy').addEventListener('click', async () => {
    const ta = output.querySelector('textarea'); const text = ta ? ta.value : '';
    try { await navigator.clipboard.writeText(text); if (status) status.textContent = 'Copied.'; } catch {}
  });
  $('#clear').addEventListener('click', () => { fields.querySelectorAll('textarea,input').forEach((el) => { if (el.type === 'checkbox') el.checked = false; else if (el.type === 'file') el.value = ''; else el.value = ''; }); output.textContent = ''; fields.querySelector('textarea')?.focus(); });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchInput.focus(); searchInput.select(); }
    if (e.key === 'Escape' && document.activeElement === searchInput) { searchInput.value = ''; render(search('')); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); doRun(); }
  });

  (async function init() {
    try {
      const mod = await import('./registry.js');
      for (const t of mod.tools) toolIndex.set(t.name.toLowerCase(), t);
    } catch (e) {
      if (status) status.textContent = 'Metadata unavailable — running in basic mode.';
    }
    renderCategories();
    render(search(''));
  })();
})();
