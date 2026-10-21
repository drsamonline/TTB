// TTB — System & Browser tools
// Destructive operations are dry-run by default: they report exactly what they
// would change and only act when the UI passes ctx.confirm === true.
const tabQuery = (opts = {}) => chrome.tabs.query(opts);
const needConfirm = (ctx) => ctx.confirm === true;
const SESSION_KEY = 'ttb_tab_sessions';
const SITE_TIME_KEY = 'ttb_site_time';

export async function runSystem(name, ctx = {}) {
  const n = name.toLowerCase();
  const s = String(ctx.text ?? '');

  // --- tabs ---
  if (n === 'tab search') {
    const ts = await tabQuery({});
    const q = s.trim().toLowerCase();
    const rows = ts.filter((t) => !q || (t.title || '').toLowerCase().includes(q) || (t.url || '').toLowerCase().includes(q));
    return rows.map((t) => ({ id: t.id, title: t.title, url: t.url, active: t.active, pinned: t.pinned, audible: t.audible, windowId: t.windowId }));
  }
  if (n === 'tab pinner') { if (ctx.tab?.id) { await chrome.tabs.update(ctx.tab.id, { pinned: !ctx.tab.pinned }); return 'Tab pin state toggled'; } return 'No active tab'; }
  if (n === 'tab muter') { if (ctx.tab?.id) { await chrome.tabs.update(ctx.tab.id, { muted: !ctx.tab.mutedInfo?.muted }); return 'Tab mute state toggled'; } return 'No active tab'; }
  if (n === 'tab reloader') { if (ctx.tab?.id) { await chrome.tabs.reload(ctx.tab.id); return 'Tab reloaded'; } return 'No active tab'; }
  if (n === 'tab group manager') { if (!ctx.tab?.id) return 'Select a tab first'; const gid = await chrome.tabs.group({ tabIds: [ctx.tab.id] }); return `Tab group ${gid} created`; }
  if (n === 'tab suspender') { if (ctx.tab?.id) { await chrome.tabs.discard(ctx.tab.id); return 'Tab discarded'; } return 'No active tab'; }
  if (n === 'duplicate tab closer') {
    const ts = await tabQuery({});
    const seen = new Map(); const dupes = [];
    for (const t of ts) { if (!t.url) continue; if (seen.has(t.url) && t.id) dupes.push(t); else seen.set(t.url, t.id); }
    if (!dupes.length) return 'No duplicate tabs found.';
    if (!needConfirm(ctx)) return `Would close ${dupes.length} duplicate tab(s):\n${dupes.map((d) => '• ' + d.title).join('\n')}\n\nTick "Confirm destructive actions" and Run again to proceed.`;
    for (const d of dupes) { try { await chrome.tabs.remove(d.id); } catch {} }
    return `Closed ${dupes.length} duplicate tab(s).`;
  }
  if (n === 'auto-close tabs') {
    const pattern = s.trim().toLowerCase();
    if (!pattern) return 'Enter a URL or title substring to match.';
    const ts = await tabQuery({});
    const matches = ts.filter((t) => t.id !== ctx.tab?.id && ((t.url || '').toLowerCase().includes(pattern) || (t.title || '').toLowerCase().includes(pattern)));
    if (!matches.length) return `No tabs match "${pattern}".`;
    if (!needConfirm(ctx)) return `Would close ${matches.length} tab(s) matching "${pattern}":\n${matches.map((t) => '• ' + t.title).join('\n')}\n\nTick "Confirm destructive actions" and Run again.`;
    for (const t of matches) { try { await chrome.tabs.remove(t.id); } catch {} }
    return `Closed ${matches.length} tab(s).`;
  }
  if (n === 'tab session save/restore') {
    const store = (await chrome.storage.local.get(SESSION_KEY))[SESSION_KEY] || {};
    if (ctx.mode === 'restore') {
      const key = s.trim() || Object.keys(store).sort().pop();
      if (!key || !store[key]) return `No saved session "${key}". Saved: ${Object.keys(store).join(', ') || '(none)'}`;
      for (const url of store[key].urls) { try { await chrome.tabs.create({ url, active: false }); } catch {} }
      return `Restored ${store[key].urls.length} tab(s) from "${key}".`;
    }
    if (ctx.mode === 'delete') { const key = s.trim(); delete store[key]; await chrome.storage.local.set({ [SESSION_KEY]: store }); return `Deleted session "${key}".`; }
    if (ctx.mode === 'list') return Object.entries(store).map(([k, v]) => `${k} — ${v.urls.length} tab(s), ${new Date(v.at).toLocaleString()}`).join('\n') || '(no saved sessions)';
    const key = s.trim() || new Date().toISOString().slice(0, 16).replace('T', ' ');
    const ts = await tabQuery({});
    store[key] = { at: Date.now(), urls: ts.map((t) => t.url).filter(Boolean) };
    await chrome.storage.local.set({ [SESSION_KEY]: store });
    return `Saved ${store[key].urls.length} tab(s) as "${key}".`;
  }

  // --- downloads / bookmarks / history ---
  if (n === 'download manager') return await chrome.downloads.search({ limit: 100 });
  if (n === 'bookmark manager') return await chrome.bookmarks.getTree();
  if (n === 'bookmark cleaner' || n === 'bookmark deduplicator') {
    const all = await chrome.bookmarks.search({});
    const seen = new Set(), dupes = [];
    for (const b of all) { if (!b.url) continue; if (seen.has(b.url)) dupes.push(b); else seen.add(b.url); }
    return dupes;
  }
  if (n === 'history search') return await chrome.history.search({ text: s || '', maxResults: 100 });
  if (n === 'history cleaner') {
    const scope = String(ctx.scope || 'all');
    const spans = { hour: 3600e3, day: 86400e3, week: 604800e3, all: Date.now() };
    const start = Date.now() - (spans[scope] ?? Date.now());
    if (!needConfirm(ctx)) return `Would delete browsing history for the last ${scope === 'all' ? 'entire history' : scope}.\nTick "Confirm destructive actions" and Run again to proceed.`;
    await chrome.history.deleteRange({ startTime: start, endTime: Date.now() });
    return `History cleared (${scope}).`;
  }
  if (n === 'cache cleaner') {
    if (!needConfirm(ctx)) return 'Would clear the browser HTTP cache for all sites.\nTick "Confirm destructive actions" and Run again to proceed.';
    await chrome.browsingData.remove({}, { cache: true });
    return 'Cache cleared.';
  }
  if (n === 'cookie cleaner') {
    const scope = String(ctx.scope || 'all');
    if (!needConfirm(ctx)) return `Would delete cookies (${scope === 'current-site' ? 'for the current site only' : 'for ALL sites'}).\nTick "Confirm destructive actions" and Run again to proceed.`;
    if (scope === 'current-site' && ctx.tab?.url) {
      const origin = new URL(ctx.tab.url).origin;
      await chrome.browsingData.remove({ origins: [origin] }, { cookies: true });
      return `Cookies cleared for ${origin}.`;
    }
    await chrome.browsingData.remove({}, { cookies: true });
    return 'All cookies cleared.';
  }

  // --- web storage ---
  if (n === 'localstorage viewer/editor' || n === 'sessionstorage viewer/editor' || n === 'indexeddb viewer/editor') {
    if (!ctx.tab?.id) return 'No active tab.';
    const kind = n.startsWith('local') ? 'local' : n.startsWith('session') ? 'session' : 'idb';
    const res = await chrome.scripting.executeScript({
      target: { tabId: ctx.tab.id },
      args: [kind, ctx.mode || 'read', s],
      func: async (k, mode, raw) => {
        if (k === 'idb') return indexedDB.databases ? await indexedDB.databases() : [];
        const store = k === 'local' ? localStorage : sessionStorage;
        if (mode === 'write') { const i = raw.indexOf('='); if (i > 0) { store.setItem(raw.slice(0, i).trim(), raw.slice(i + 1)); return `Set ${raw.slice(0, i).trim()}`; } return 'Use key=value to write.'; }
        if (mode === 'clear') { store.clear(); return 'Cleared.'; }
        return Object.fromEntries(Object.entries(store));
      },
    });
    return res[0]?.result ?? null;
  }

  // --- display / device ---
  if (n === 'installed fonts viewer') return await chrome.fontSettings.getFontList();
  if (n === 'zoom controller') { if (!ctx.tab?.id) return 'No active tab'; const z = Number(ctx.zoom ?? 1); await chrome.tabs.setZoom(ctx.tab.id, z); return `Zoom set to ${Math.round(z * 100)}%`; }
  if (n === 'font size controller') {
    if (!ctx.tab?.id) return 'No active tab';
    const size = String(ctx.size || 'larger');
    const pct = { smaller: '85%', larger: '120%', largest: '150%', reset: '100%' }[size] || '120%';
    await chrome.scripting.executeScript({ target: { tabId: ctx.tab.id }, args: [pct], func: (p) => { let el = document.getElementById('ttb-fontsize'); if (!el) { el = document.createElement('style'); el.id = 'ttb-fontsize'; document.documentElement.appendChild(el); } el.textContent = `html{font-size:${p} !important}`; } });
    return `Page font size set to ${pct}.`;
  }
  if (n === 'theme toggler') return 'Theme follows TTB UI settings.';
  if (n === 'language switcher') return navigator.language;
  if (n === 'screen resolution viewer') return `${screen.width} × ${screen.height} (viewport ${innerWidth} × ${innerHeight}, DPR ${devicePixelRatio})`;
  if (n === 'device info viewer') return { platform: navigator.platform, userAgent: navigator.userAgent, languages: navigator.languages, online: navigator.onLine, cores: navigator.hardwareConcurrency, memoryGB: navigator.deviceMemory ?? 'n/a' };
  if (n === 'browser info viewer') return { userAgent: navigator.userAgent, language: navigator.language, platform: navigator.platform, vendor: navigator.vendor, chrome: typeof chrome !== 'undefined' };
  if (n === 'permission viewer') return await chrome.permissions.getAll();
  if (n === 'extension manager') return await chrome.management.getAll();
  if (n === 'user agent switcher') {
    const ua = ['Chrome desktop (Windows)', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', 'iPhone (iOS 17)', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', 'Android (Pixel)', 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'];
    const rows = []; for (let i = 0; i < ua.length; i += 2) rows.push({ device: ua[i], userAgent: ua[i + 1] });
    return JSON.stringify({ note: 'Chrome MV3 does not expose a per-tab user-agent override without declarativeNetRequest header rules; these strings are for reference/testing.', current: navigator.userAgent, alternatives: rows }, null, 2);
  }
  if (n === 'notification blocker') return 'Chrome does not expose a universal notification blocker API; manage this at chrome://settings/content/notifications.';
  if (n === 'popup blocker') return 'Chrome controls popup blocking at the browser/site level; TTB cannot globally disable it.';
  if (n === 'focus mode') {
    if (!ctx.tab?.id) return 'No active tab';
    const res = await chrome.scripting.executeScript({ target: { tabId: ctx.tab.id }, func: () => { document.querySelectorAll('aside,nav,header,footer,[role="complementary"],.advertisement,.ads').forEach((e) => e.style.setProperty('display', 'none', 'important')); document.body.style.maxWidth = '900px'; document.body.style.margin = 'auto'; return 'Focus mode applied'; } });
    return res[0].result;
  }
  if (n === 'command palette (⌘k)') {
    const q = s.trim().toLowerCase();
    const catalog = globalThis.TTB_CATALOG || [];
    return catalog.filter((t) => !q || t.name.toLowerCase().includes(q)).slice(0, 40).map((t) => `${t.name}  ·  ${t.category}`).join('\n');
  }
  if (n === 'import/export settings' || n === 'backup/restore') {
    if (ctx.mode === 'import') { try { const obj = JSON.parse(s); await chrome.storage.local.set(obj); return `Imported ${Object.keys(obj).length} key(s).`; } catch { return 'Paste valid JSON exported from TTB.'; } }
    const data = await chrome.storage.local.get(null);
    return JSON.stringify(data, null, 2);
  }
  if (n === 'debug console') return { extensionVersion: chrome.runtime.getManifest().version, tabs: (await tabQuery({})).length, catalog: (globalThis.TTB_CATALOG || []).length, permissions: await chrome.permissions.getAll() };
  return null;
}
