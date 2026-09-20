const catalog = Array.isArray(globalThis.TTB_CATALOG) ? globalThis.TTB_CATALOG : [];
const searchInput = document.querySelector('#search');
const categoryNav = document.querySelector('#categories');
const list = document.querySelector('#list');
const panel = document.querySelector('#panel');
const input = document.querySelector('#input');
const output = document.querySelector('#output');
const title = panel?.querySelector('h2');
const category = panel?.querySelector('.category');
const status = document.querySelector('#status');
let current = null;
let activeCategory = 'All Tools';
let runTool = null;

const categories = [...new Set(catalog.map(t => t.category).filter(Boolean))].sort((a,b) => a.localeCompare(b));
const categoryCounts = new Map(categories.map(c => [c, catalog.filter(t => t.category === c).length]));

function search(q, categoryName = activeCategory, limit = 60) {
  q = String(q || '').trim().toLowerCase();
  const pool = categoryName === 'All Tools' ? catalog : catalog.filter(t => t.category === categoryName);
  if (!q) return pool.slice(0, limit);
  const terms = q.split(/\s+/);
  return pool.map(t => {
    const name = t.name.toLowerCase();
    const hay = `${name} ${t.category}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (name === term) score += 100;
      else if (name.startsWith(term)) score += 60;
      else if (hay.includes(term)) score += 25;
      else score -= 50;
    }
    return [score, t];
  }).filter(x => x[0] > 0).sort((a,b) => b[0] - a[0]).slice(0, limit).map(x => x[1]);
}

function renderCategories() {
  if (!categoryNav) return;
  categoryNav.textContent = '';
  const frag = document.createDocumentFragment();
  const all = document.createElement('button');
  all.type = 'button';
  all.className = `category-btn${activeCategory === 'All Tools' ? ' active' : ''}`;
  all.setAttribute('aria-pressed', String(activeCategory === 'All Tools'));
  all.innerHTML = `<span>All Tools</span><span class="count">${catalog.length}</span>`;
  all.addEventListener('click', () => selectCategory('All Tools'));
  frag.appendChild(all);
  for (const name of categories) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `category-btn${activeCategory === name ? ' active' : ''}`;
    b.setAttribute('aria-pressed', String(activeCategory === name));
    const label = document.createElement('span');
    label.textContent = name;
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = String(categoryCounts.get(name));
    b.append(label, count);
    b.addEventListener('click', () => selectCategory(name));
    frag.appendChild(b);
  }
  categoryNav.appendChild(frag);
}

function selectCategory(name) {
  activeCategory = name;
  renderCategories();
  render(search(searchInput.value));
  list?.scrollTo({ top: 0, behavior: 'smooth' });
}

function render(items) {
  list.textContent = '';
  const frag = document.createDocumentFragment();
  for (const t of items) {
    const b = document.createElement('button');
    b.className = 'tool';
    b.type = 'button';
    b.setAttribute('aria-label', `${t.name}, ${t.category}`);
    const name = document.createElement('span');
    name.className = 'tool-name';
    name.textContent = t.name;
    const cat = document.createElement('span');
    cat.className = 'tool-cat';
    cat.textContent = t.category;
    b.append(name, cat);
    b.addEventListener('click', () => openTool(t));
    frag.appendChild(b);
  }
  list.appendChild(frag);
  if (status) {
    const scope = activeCategory === 'All Tools' ? 'all categories' : activeCategory;
    status.textContent = `${items.length} tools shown in ${scope}`;
  }
}

function openTool(t) {
  current = t;
  panel.hidden = false;
  title.textContent = t.name;
  category.textContent = t.category;
  input.value = '';
  output.value = '';
  input.focus();
}

async function ensureRunner() {
  if (!runTool) ({ runTool } = await import('../tools/core.js'));
  return runTool;
}

async function getTab() {
  return (await chrome.tabs.query({ active: true, currentWindow: true }))[0] || null;
}

if (!searchInput || !categoryNav || !list || !panel || !input || !output || !document.querySelector('#run')) {
  throw new Error('TTB UI shell is incomplete');
}

searchInput.addEventListener('input', () => render(search(searchInput.value)));
document.querySelector('#run').addEventListener('click', async () => {
  if (!current) return;
  output.value = 'Running…';
  try {
    const fn = await ensureRunner();
    const result = await fn(current.name, { text: input.value, tab: await getTab(), a: input.value });
    output.value = String(result);
  } catch (e) {
    output.value = `Error: ${e?.message || e}`;
  }
  output.scrollTop = 0;
});
document.querySelector('#copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(output.value); } catch {}
});
document.querySelector('#clear').addEventListener('click', () => {
  input.value = '';
  output.value = '';
  input.focus();
});
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.value = '';
    render(search(''));
  }
});

renderCategories();
render(search(''));
