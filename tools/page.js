// TTB — Page Tools
// Everything that touches the active tab. Reading mode is now reversible:
// the original document is snapshotted before it is replaced, and a
// "Restore page" tool puts it back. All injections run in the isolated world.
const page = (fn, tabId, args = []) => chrome.scripting.executeScript({ target: { tabId }, func: fn, args });

function pageFn(name, payload = {}) {
  return async () => {
    const n = String(name).toLowerCase();
    const esc = (s) => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
    const csv = (rows) => rows.map((r) => r.map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const all = (sel) => [...document.querySelectorAll(sel)];
    const allRows = (t) => [...t.rows].map((r) => [...r.cells].map((c) => c.innerText.trim()));
    const styleOnce = (id, css) => { let s = document.getElementById(id); if (!s) { s = document.createElement('style'); s.id = id; document.documentElement.appendChild(s); } s.textContent = css; return s; };

    // ---- extraction ----
    if (n.includes('extract links/images/emails/phones/hashtags/mentions')) return { links: all('a[href]').map((a) => a.href), images: all('img[src]').map((i) => i.src), emails: [...document.body.innerText.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)].map((x) => x[0]), phones: [...document.body.innerText.matchAll(/(?:\+?\d[\d .()\-]{7,}\d)/g)].map((x) => x[0]), hashtags: [...document.body.innerText.matchAll(/#[\p{L}\d_]+/gu)].map((x) => x[0]), mentions: [...document.body.innerText.matchAll(/@[\w.-]+/g)].map((x) => x[0]) };
    if (n === 'extract tables→csv' || n === 'copy table as markdown/csv') return all('table').map((t) => csv(allRows(t))).join('\n\n');
    if (n === 'extract form fields') return all('input,textarea,select,button').map((e) => ({ tag: e.tagName, name: e.name, id: e.id, type: e.type || '', value: e.value || '', placeholder: e.placeholder || '', required: e.required }));
    if (n === 'extract meta tags') return all('meta').map((m) => ({ name: m.getAttribute('name'), property: m.getAttribute('property'), content: m.getAttribute('content') }));
    if (n === 'extract headings/alt text' || n === 'heading structure') return { headings: all('h1,h2,h3,h4,h5,h6').map((x) => ({ tag: x.tagName, text: x.innerText.trim() })), alt: all('img').map((x) => ({ src: x.src, alt: x.alt })) };
    if (n === 'extract iframes/scripts/stylesheets') return { iframes: all('iframe').map((x) => x.src), scripts: all('script[src]').map((x) => x.src), stylesheets: all('link[rel="stylesheet"]').map((x) => x.href) };
    if (n === 'extract fonts/colors/svg') return { fonts: [...new Set(all('*').map((e) => getComputedStyle(e).fontFamily).filter(Boolean))], colors: [...new Set(all('*').flatMap((e) => [getComputedStyle(e).color, getComputedStyle(e).backgroundColor]).filter(Boolean))].slice(0, 500), svg: all('svg').length };
    if (n === 'extract videos/audio/pdf links') return { videos: all('video').map((x) => x.currentSrc || x.src), audio: all('audio').map((x) => x.currentSrc || x.src), pdf: all('a[href$=".pdf" i]').map((x) => x.href) };
    if (n.startsWith('page→')) return { title: document.title, url: location.href, text: document.body.innerText, html: document.documentElement.outerHTML };
    if (n === 'markdown preview') return document.body.innerText;

    // ---- reversible reading mode ----
    if (n === 'reading mode') {
      if (!window.__ttb_snapshot) window.__ttb_snapshot = document.documentElement.outerHTML;
      document.documentElement.innerHTML = `<head><title>${esc(document.title)}</title><style>body{max-width:760px;margin:40px auto;padding:0 24px;font:18px/1.7 system-ui;color:#e8eaed;background:#0f1115}img{max-width:100%}a{color:#7aa2ff}</style></head><body><h1>${esc(document.title)}</h1><article>${esc(document.body.innerText).replace(/\n/g, '<br>')}</article></body>`;
      return 'Reading mode enabled. Run "Restore page" to undo.';
    }
    if (n === 'restore page') { if (!window.__ttb_snapshot) return 'No snapshot found for this tab.'; const html = window.__ttb_snapshot; window.__ttb_snapshot = null; document.open(); document.write(html); document.close(); return 'Page restored.'; }

    // ---- visual filters (reversible) ----
    const styles = { 'dark mode': 'filter:invert(1) hue-rotate(180deg); background:#111 !important;', sepia: 'filter:sepia(.75);', 'high contrast': 'filter:contrast(1.35);', grayscale: 'filter:grayscale(1);', 'dyslexia font': 'font-family:Arial,sans-serif !important;letter-spacing:.04em;', 'larger text': 'font-size:125% !important;', 'line-height adjuster': 'line-height:1.8 !important;', 'letter-spacing adjuster': 'letter-spacing:.12em !important;', 'word-spacing adjuster': 'word-spacing:.3em !important;' };
    if (styles[n]) { styleOnce('ttb-style', `html{${styles[n]}}`); return `${name} enabled. Run "Reset page styles" to undo.`; }
    if (n === 'reset page styles') { document.getElementById('ttb-style')?.remove(); document.getElementById('ttb-fontsize')?.remove(); document.getElementById('ttb-print')?.remove(); return 'Page styles reset.'; }
    if (n === 'animation pauser') { styleOnce('ttb-anim', '*{animation-play-state:paused !important;transition:none !important}'); return 'Animations paused.'; }
    if (n === 'reading mask') { styleOnce('ttb-mask', 'html{background:#000 !important}body{background:#fff !important;max-width:680px;margin:0 auto;padding:80px 24px}'); return 'Reading mask applied.'; }
    if (n === 'print cleaner') { styleOnce('ttb-print', '@media print{nav,aside,header,footer,.advertisement,.ads{display:none!important}body{font:12pt serif!important}}'); print(); return 'Print dialog opened'; }

    // ---- element inspection ----
    if (n === 'element picker' || n === 'element hider' || n === 'computed css inspector' || n === 'font inspector' || n === 'box model inspector' || n === 'element copier (selector/xpath/css)') {
      const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
      if (!el) return 'No element found';
      const cssPath = (node) => { const parts = []; for (let e = node; e && e.nodeType === 1 && parts.length < 6; e = e.parentElement) { let sel = e.tagName.toLowerCase(); if (e.id) { sel += '#' + e.id; parts.unshift(sel); break; } const cls = (e.className || '').toString().trim().split(/\s+/).filter(Boolean).slice(0, 2).map((c) => '.' + c).join(''); sel += cls; const sibs = [...(e.parentElement?.children || [])].filter((s) => s.tagName === e.tagName); if (sibs.length > 1) sel += `:nth-of-type(${sibs.indexOf(e) + 1})`; parts.unshift(sel); } return parts.join(' > '); };
      const xPath = (node) => { const p = []; for (let e = node; e && e.nodeType === 1; e = e.parentElement) { let i = 1; for (let s = e.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === e.tagName) i++; p.unshift(`${e.tagName.toLowerCase()}[${i}]`); } return '/' + p.join('/'); };
      if (n === 'element hider') { el.style.setProperty('display', 'none', 'important'); return `Hidden ${el.tagName}${el.id ? '#' + el.id : ''}`; }
      if (n === 'element picker') return { tag: el.tagName, id: el.id, class: el.className, text: el.innerText?.slice(0, 200) };
      if (n === 'element copier (selector/xpath/css)') return { cssSelector: cssPath(el), xpath: xPath(el), tagName: el.tagName, id: el.id, className: el.className };
      const c = getComputedStyle(el), r = el.getBoundingClientRect();
      return { tag: el.tagName, id: el.id, class: el.className, box: { x: r.x, y: r.y, width: r.width, height: r.height }, font: { family: c.fontFamily, size: c.fontSize, weight: c.fontWeight }, display: c.display, position: c.position, color: c.color, background: c.backgroundColor };
    }
    if (n === 'contrast auditor') return all('*').map((e) => { const c = getComputedStyle(e); return { tag: e.tagName, text: e.innerText?.trim().slice(0, 80), color: c.color, background: c.backgroundColor }; }).filter((x) => x.text).slice(0, 300);
    if (n === 'broken image detector') return all('img').filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src);
    if (n === 'slow resource finder') return performance.getEntriesByType('resource').sort((a, b) => b.duration - a.duration).slice(0, 50).map((r) => ({ name: r.name, duration: Math.round(r.duration), size: r.transferSize || 0 }));
    if (n === 'page weight analyzer') return performance.getEntriesByType('resource').reduce((a, r) => { a.count++; a.bytes += (r.transferSize || 0); a.ms = Math.max(a.ms, r.duration); return a; }, { count: 0, bytes: 0, ms: 0 });
    if (n === 'page weight→co₂ estimate') { const b = performance.getEntriesByType('resource').reduce((a, r) => a + (r.transferSize || 0), 0); return JSON.stringify({ bytes: b, mb: +(b / 1048576).toFixed(3), co2GramsPerVisit: +((b / 1048576) * 0.36).toFixed(3), note: 'Rough estimate at ~0.36 g CO₂ per MB transferred.' }, null, 2); }

    // ---- SEO ----
    if (n === 'seo snapshot') return { title: document.title, description: document.querySelector('meta[name="description"]')?.content || '', canonical: document.querySelector('link[rel="canonical"]')?.href || '', h1: all('h1').map((x) => x.innerText), robots: document.querySelector('meta[name="robots"]')?.content || '' };
    if (n === 'schema.org extractor' || n === 'structured data tester') return all('script[type="application/ld+json"]').map((x) => { try { return JSON.parse(x.textContent); } catch { return { invalid: true, text: x.textContent }; } });
    if (n === 'hreflang checker') return all('link[rel="alternate"][hreflang]').map((x) => ({ lang: x.hreflang, url: x.href }));
    if (n === 'canonical checker') return document.querySelector('link[rel="canonical"]')?.href || 'No canonical link';
    if (n === 'html basic validator') { const issues = []; if (!document.title) issues.push('Missing <title>'); if (!document.querySelector('meta[name="description"]')) issues.push('Missing meta description'); if (all('h1').length !== 1) issues.push(`${all('h1').length} <h1> element(s)`); if (!document.documentElement.lang) issues.push('Missing <html lang>'); all('img').forEach((i) => { if (!i.hasAttribute('alt')) issues.push('Image without alt: ' + i.src.slice(0, 60)); }); return issues.length ? issues.slice(0, 50).join('\n') : 'No basic issues found.'; }
    if (n === 'og/twitter preview') return { ogTitle: document.querySelector('meta[property="og:title"]')?.content || document.title, ogDescription: document.querySelector('meta[property="og:description"]')?.content || '', ogImage: document.querySelector('meta[property="og:image"]')?.content || '', twitterCard: document.querySelector('meta[name="twitter:card"]')?.content || '' };

    // ---- accessibility ----
    if (n === 'aria inspector') return all('[role],[aria-label],[aria-hidden],[aria-expanded],[aria-controls]').slice(0, 300).map((e) => ({ tag: e.tagName, role: e.getAttribute('role'), label: e.getAttribute('aria-label'), hidden: e.getAttribute('aria-hidden'), text: e.innerText?.slice(0, 60) }));
    if (n === 'keyboard navigation tester') return all('a[href],button,input,select,textarea,[tabindex]').filter((e) => e.tabIndex >= 0).map((e, i) => ({ order: i + 1, tag: e.tagName, text: (e.innerText || e.value || '').slice(0, 40) }));
    if (n === 'focus indicator viewer') { styleOnce('ttb-focus', ':focus{outline:3px solid #ff2d55 !important;outline-offset:2px !important}'); return 'Focus outlines highlighted. Tab through the page to inspect.'; }
    if (n === 'flashing content detector') { const hits = all('*').filter((e) => { const a = getComputedStyle(e).animationName; return a && a !== 'none' && /flash|blink|pulse|strobe/i.test(a); }); return hits.length ? hits.map((e) => `${e.tagName}${e.id ? '#' + e.id : ''} (${getComputedStyle(e).animationName})`) : 'No obviously flashing animations detected.'; }

    // ---- interaction helpers ----
    if (n === 'cookie banner dismisser' || n === 'newsletter popup killer') { const terms = /cookie|consent|privacy|newsletter|subscribe|modal|popup|overlay/i; let count = 0; all('div,section,aside,dialog').forEach((e) => { if (terms.test((e.id + ' ' + e.className + ' ' + e.innerText).slice(0, 1000))) { e.style.setProperty('display', 'none', 'important'); count++; } }); return `Hidden ${count} candidate elements`; }
    if (n === 'form autofill') { all('input,textarea').forEach((e) => { if (!e.value) e.value = payload.value || ''; }); return 'Filled empty fields'; }
    if (n === 'form data exporter') return all('form').map((f) => Object.fromEntries(new FormData(f).entries()));
    if (n === 'video speed controller') { all('video').forEach((v) => (v.playbackRate = Number(payload.rate) || 2)); return `Set ${all('video').length} videos to ${Number(payload.rate) || 2}×`; }
    if (n === 'autoplay blocker') { all('video,audio').forEach((v) => { v.autoplay = false; v.pause(); }); return 'Autoplay media paused'; }
    if (n === 'save scroll position' || n === 'scroll position memory') { if (payload.y != null) { scrollTo(0, Number(payload.y)); return `Scrolled to ${scrollY}`; } return { x: scrollX, y: scrollY }; }
    if (n === 'highlight & annotate') { const sel = getSelection(); if (!sel || sel.isCollapsed) return 'Select some text on the page first.'; const range = sel.getRangeAt(0); const mark = document.createElement('mark'); mark.style.background = '#ffe066'; try { range.surroundContents(mark); return 'Highlighted selection.'; } catch { return 'Could not highlight a multi-element selection.'; } }
    if (n === 'sticky notes' || n === 'sticky notes across tabs' || n === 'page annotations') { const id = 'ttb-note-' + Date.now(); const el = document.createElement('div'); el.id = id; el.textContent = payload.value || 'Note'; el.style.cssText = 'position:fixed;top:60px;right:20px;max-width:240px;background:#ffe066;color:#111;padding:10px;border-radius:8px;font:13px system-ui;z-index:2147483647;box-shadow:0 4px 16px #0006'; document.body.appendChild(el); return 'Note added.'; }
    if (n === 'auto-refresh') { const ms = Math.max(2000, Number(payload.ms) || 30000); clearInterval(window.__ttb_refresh); window.__ttb_refresh = setInterval(() => location.reload(), ms); return `Page will auto-refresh every ${ms / 1000}s.`; }
    if (n === 'page change monitor') { const dur = Math.min(60000, Math.max(1000, Number(payload.ms) || 5000)); let count = 0, first = ''; const ob = new MutationObserver((muts) => { count += muts.length; if (!first && muts[0]?.target) first = (muts[0].target.nodeName || '') + ' ' + (muts[0].target.textContent || '').slice(0, 80); }); ob.observe(document.body, { childList: true, subtree: true, characterData: true }); await new Promise((r) => setTimeout(r, dur)); ob.disconnect(); return JSON.stringify({ seconds: dur / 1000, mutations: count, sample: first }, null, 2); }
    if (n === 'auto-pause video on tab switch') { document.addEventListener('visibilitychange', () => { if (document.hidden) all('video,audio').forEach((v) => v.pause()); }); return 'Installed: media pauses when this tab is hidden.'; }
    if (n === 'resume video across tabs') { all('video').forEach((v) => { const t = parseFloat(sessionStorage.getItem('ttb_video_t') || '0'); if (t && v.duration > t) v.currentTime = t; v.addEventListener('timeupdate', () => sessionStorage.setItem('ttb_video_t', String(v.currentTime))); }); return 'Installed: video position remembered across tab switches.'; }
    if (n === 'boss key') { const hide = () => { document.body.style.visibility = document.hidden ? 'hidden' : 'visible'; }; document.addEventListener('visibilitychange', hide); document.body.style.visibility = 'hidden'; setTimeout(() => (document.body.style.visibility = 'visible'), 1500); return 'Boss key armed — page hides when the tab loses focus.'; }
    if (n === 'screen ruler') { const el = document.createElement('div'); el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;background-image:linear-gradient(to right,#f005,#f005 1px,transparent 1px);background-size:50px 100%'; document.body.appendChild(el); return 'Ruler overlay added (50 px grid).'; }
    return null;
  };
}

const PAGE_TOOLS = new Set([
  'extract links/images/emails/phones/hashtags/mentions', 'extract tables→csv', 'extract form fields', 'extract meta tags', 'extract headings/alt text', 'extract iframes/scripts/stylesheets', 'extract fonts/colors/svg', 'extract videos/audio/pdf links', 'reading mode', 'restore page',
  'dark mode', 'sepia', 'high contrast', 'grayscale', 'dyslexia font', 'larger text', 'line-height adjuster', 'letter-spacing adjuster', 'word-spacing adjuster', 'reset page styles', 'animation pauser', 'reading mask', 'print cleaner',
  'element hider', 'element picker', 'element copier (selector/xpath/css)', 'computed css inspector', 'font inspector', 'box model inspector', 'contrast auditor', 'broken image detector', 'slow resource finder', 'page weight analyzer', 'page weight→co₂ estimate',
  'seo snapshot', 'schema.org extractor', 'structured data tester', 'hreflang checker', 'canonical checker', 'html basic validator', 'og/twitter preview', 'heading structure',
  'aria inspector', 'keyboard navigation tester', 'focus indicator viewer', 'flashing content detector',
  'cookie banner dismisser', 'newsletter popup killer', 'form autofill', 'form data exporter', 'copy table as markdown/csv', 'video speed controller', 'autoplay blocker', 'save scroll position', 'scroll position memory', 'highlight & annotate', 'sticky notes', 'sticky notes across tabs', 'page annotations', 'auto-refresh', 'page change monitor', 'auto-pause video on tab switch', 'resume video across tabs', 'boss key', 'screen ruler',
]);
function isPageTool(name) { return PAGE_TOOLS.has(String(name || '').toLowerCase()); }

export async function runPage(name, ctx = {}) {
  const tabId = ctx.tab?.id;
  if (!tabId) return isPageTool(name) ? 'This tool needs an active tab (open a normal web page first).' : null;
  return (await page(pageFn(name, ctx), tabId))[0]?.result ?? null;
}
export { isPageTool };
