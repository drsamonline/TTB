// TTB — Text & Writing and Calculators & Converters (extended handlers).
// Keyed by the lower-cased catalog name. Consulted only after the built-in
// text/calc/dev modules decline a name, so nothing here shadows existing code.
const W = (s) => (String(s).match(/\b[\p{L}\p{N}][\p{L}\p{N}'’-]*\b/gu) || []);
const syl = (w) => { const x = w.toLowerCase().replace(/[^a-z]/g, ''); if (!x) return 0; if (x.length <= 3) return 1; let n = (x.match(/[aeiouy]+/g) || []).length; if (/e$/.test(x) && n > 1) n--; return Math.max(1, n); };
const rnd = (n) => { const b = crypto.getRandomValues(new Uint32Array(1))[0]; return b % n; };
const pick = (a) => a[rnd(a.length)];
const fmt = (x, d = 2) => Number.isFinite(x) ? Number(x.toFixed(d)) : String(x);

const EMOJI = { smile: '😀😃😄😁😆😅😂🤣🙂🙃😉😊😇🥰😍🤩😘😗😚😙🥲', love: '❤️🧡💛💚💙💜🤎🖤🤍💔❣️💕💞💓💗💖💘💝', hand: '👍👎👌✌️🤞🤟🤘👏🙌👐🤲🙏💪👊✊🤛🤜', animal: '🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐦🐤🦆🦅🦉', food: '🍏🍎🍐🍊🍋🍌🍉🍇🍓🫐🍈🍒🍑🥭🍍🥥🥝🍅🥑🍞🥐🥨', travel: '🚗🚕🚙🚌🚎🏎️🚓🚑🚒🚐🛻🚚🚛🚜🛵🏍️🚲🛴✈️🚀', nature: '🌳🌲🌴🌵🌾🌿☘️🍀🎍🎋🍃🍂🍁🌷🌹🌺🌻🌼🌸💐', symbol: '✅❌⚠️❗❓💡🔔🔒🔑⭐🌟✨⚡🔥💧🎉🎯📌📍' };
const KAOMOJI = ['(╯°□°）╯︵ ┻━┻', '┬─┬ノ( º _ ºノ)', '(づ｡◕‿‿◕｡)づ', '( •_•)>⌐■-■', '¯\\_(ツ)_/¯', '( ͡° ͜ʖ ͡°)', '(╥﹏╥)', 'ʕ•ᴥ•ʔ', '(✿◠‿◠)', '(>_<)', 'o(≧v≦)o', '(￣▽￣)', '(¬_¬)', '(°ロ°)', '＼(^o^)／', '(◕‿◕)', '(っ˘ω˘ς)', '(ง •̀_•́)ง', 'ᕕ( ᐛ )ᕗ', '( •̀ ω •́ )✧'];

export const TTB_EXTRA_TEXT = {
  'lorem ipsum': { name: 'Lorem ipsum', cat: 'text', inputs: [{ key: 'count', label: 'Paragraphs', type: 'number', value: '3' }], run: (t, c) => {
    const base = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
    const n = Math.max(1, Math.min(50, Number(c.count || 3)));
    const out = []; for (let p = 0; p < n; p++) { const len = 40 + rnd(40); const words = []; for (let i = 0; i < len; i++) words.push(base[rnd(base.length)]); words[0] = words[0][0].toUpperCase() + words[0].slice(1); out.push(words.join(' ') + '.'); }
    return out.join('\n\n'); } },
  'n-gram extractor': { name: 'N-gram extractor', cat: 'text', inputs: [{ key: 'n', label: 'N (gram size)', type: 'number', value: '2' }], run: (t, c) => {
    const n = Math.max(1, Math.min(5, Number(c.n || 2))); const words = W(t).map((w) => w.toLowerCase()); const m = new Map();
    for (let i = 0; i + n <= words.length; i++) { const g = words.slice(i, i + n).join(' '); m.set(g, (m.get(g) || 0) + 1); }
    return [...m].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([g, c2]) => `${c2}\t${g}`).join('\n') || 'Not enough words for that n.'; } },
  'syllable counter': { name: 'Syllable counter', cat: 'text', run: (t) => {
    const words = W(t); const total = words.reduce((a, w) => a + syl(w), 0);
    return JSON.stringify({ words: words.length, syllables: total, averagePerWord: words.length ? fmt(total / words.length) : 0, polysyllabic: words.filter((w) => syl(w) >= 3).length }, null, 2); } },
  'passive voice detector': { name: 'Passive voice detector', cat: 'text', run: (t) => {
    const sents = String(t).split(/(?<=[.!?])\s+/).filter(Boolean); const be = /\b(is|are|was|were|be|been|being)\b/i; const pp = /\b\w+(ed|en|wn|ne|nt)\b/i;
    const hits = sents.filter((s) => be.test(s) && pp.test(s));
    return hits.length ? `Possible passive constructions (${hits.length}/${sents.length} sentences):\n` + hits.map((h) => '• ' + h.trim()).join('\n') : 'No obvious passive constructions found.'; } },
  'adverb highlighter': { name: 'Adverb highlighter', cat: 'text', run: (t) => {
    const adv = W(t).filter((w) => /ly$/i.test(w) && w.length > 4); const m = new Map(); adv.forEach((a) => m.set(a.toLowerCase(), (m.get(a.toLowerCase()) || 0) + 1));
    return adv.length ? `${adv.length} -ly words:\n` + [...m].sort((a, b) => b[1] - a[1]).map(([w, c2]) => `${w} ×${c2}`).join('\n') : 'No -ly adverbs found.'; } },
  'homoglyph detector': { name: 'Homoglyph detector', cat: 'text', run: (t) => {
    const found = [...String(t)].map((ch, i) => ({ ch, i })).filter(({ ch }) => ch.charCodeAt(0) >= 128 && /[A-Za-z0-9]/.test(ch.normalize('NFKC')));
    return found.length ? found.map(({ ch, i }) => `pos ${i}: "${ch}" (U+${ch.codePointAt(0).toString(16).toUpperCase()}) looks like ${ch.normalize('NFKC')}`).join('\n') : 'No mixed-script lookalike characters found.'; } },
  'rtl/ltr fixer': { name: 'RTL/LTR fixer', cat: 'text', inputs: [{ key: 'mode', label: 'Direction', type: 'select', options: ['rtl', 'ltr'], value: 'rtl' }], run: (t, c) => {
    const wrap = c.mode === 'ltr' ? '\u202A' : '\u202B'; const pop = '\u202C'; const reset = '\u200E';
    return String(t).split(/\r?\n/).map((line) => wrap + line + pop + reset).join('\n'); } },
  'title case (ap/chicago/apa)': { name: 'Title case (AP/Chicago/APA)', cat: 'text', inputs: [{ key: 'style', label: 'Style', type: 'select', options: ['AP', 'Chicago', 'APA'], value: 'AP' }], run: (t, c) => {
    const small = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'per', 'the', 'to', 'up', 'via', 'vs', 'with', 'from', 'into', 'over', 'onto', 'is', 'it']);
    const words = String(t).split(/(\s+)/);
    return words.map((w, i) => { if (!/[\p{L}]/u.test(w)) return w; const bare = w.replace(/[^\p{L}']/gu, '').toLowerCase(); if (i !== 0 && small.has(bare)) return w.toLowerCase(); return w[0].toUpperCase() + w.slice(1).toLowerCase(); }).join(''); } },
  'citation formatter': { name: 'Citation formatter', cat: 'text', inputs: [{ key: 'style', label: 'Style', type: 'select', options: ['APA', 'MLA', 'Chicago', 'Harvard'], value: 'APA' }, { key: 'b', label: 'Title', type: 'text', placeholder: 'Title of work' }, { key: 'c', label: 'Year', type: 'text', placeholder: '2024' }, { key: 'd', label: 'Publisher / Journal', type: 'text' }], run: (t, c) => {
    const author = String(t || 'Author').trim(), title = c.b || 'Title', year = c.c || 'n.d.', pub = c.d || 'Publisher';
    const out = { APA: `${author} (${year}). ${title}. ${pub}.`, MLA: `${author}. "${title}." ${pub}, ${year}.`, Chicago: `${author}. ${title}. ${pub}, ${year}.`, Harvard: `${author} (${year}) ${title}. ${pub}.` };
    return out[c.style] || out.APA; } },
  'bibtex formatter': { name: 'BibTeX formatter', cat: 'text', inputs: [{ key: 'b', label: 'Title', type: 'text' }, { key: 'c', label: 'Year', type: 'text' }, { key: 'd', label: 'Journal / Booktitle', type: 'text' }], run: (t, c) => {
    const key = (String(t || 'ref').split(/\s+/)[0] || 'ref').toLowerCase() + (c.c || ''); 
    return `@article{${key},\n  author  = {${t || 'Author'}},\n  title   = {${c.b || 'Title'}},\n  journal = {${c.d || 'Journal'}},\n  year    = {${c.c || '2024'}}\n}`; } },
  'text templating': { name: 'Text templating', cat: 'text', inputs: [{ key: 'vars', label: 'Variables (key=value per line)', type: 'textarea', placeholder: 'name=World\ncity=Pune' }], run: (t, c) => {
    const vars = {}; String(c.vars || '').split(/\r?\n/).forEach((l) => { const i = l.indexOf('='); if (i > 0) vars[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
    return String(t).replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, k) => (k in vars ? vars[k] : `{{${k}}}`)); } },
  'emoji picker': { name: 'Emoji picker', cat: 'text', run: (t) => {
    const q = String(t).trim().toLowerCase();
    if (!q) return Object.entries(EMOJI).map(([k, v]) => `${k}: ${v}`).join('\n\n');
    const hit = Object.keys(EMOJI).filter((k) => k.includes(q));
    return hit.length ? hit.map((k) => `${k}: ${EMOJI[k]}`).join('\n\n') : 'No category matched. Try: ' + Object.keys(EMOJI).join(', '); } },
  'kaomoji library': { name: 'Kaomoji library', cat: 'text', run: () => KAOMOJI.join('\n') },
  'unicode browser': { name: 'Unicode browser', cat: 'text', run: (t) => {
    const s = String(t).trim();
    if (!s) return 'Enter a character or a code point (e.g. 1F600 or U+1F600).';
    const cps = /^(u\+|0x)?[0-9a-f]{2,6}$/i.test(s) ? [parseInt(s.replace(/^u\+|0x/i, ''), 16)] : [...s].map((ch) => ch.codePointAt(0));
    return cps.map((cp) => { const ch = String.fromCodePoint(cp); return `${ch}  U+${cp.toString(16).toUpperCase().padStart(4, '0')}  ${cp}  ${ch.normalize('NFKD').replace(/[^\x20-\x7e]/g, '') || '(no ascii decomposition)'}`; }).join('\n'); } },
  'font preview': { name: 'Font preview', cat: 'text', output: 'html', inputs: [{ key: 'size', label: 'Size (px)', type: 'number', value: '22' }], run: (t, c) => {
    const text = String(t || 'The quick brown fox jumps over the lazy dog — 0123456789');
    const size = Number(c.size || 22);
    const fams = ['system-ui', 'Georgia, serif', '"Times New Roman", serif', 'Arial, sans-serif', '"Courier New", monospace', 'Verdana, sans-serif', '"Trebuchet MS", sans-serif', 'Impact, sans-serif'];
    return `<div style="font-size:${size}px">${fams.map((f) => `<p style="font-family:${f};margin:0 0 10px">${f.replace(/['"]/g, '')}<br><span>${text.replace(/[<>&]/g, '')}</span></p>`).join('')}</div>`; } },
  'tts (web speech)': { name: 'TTS (Web Speech)', cat: 'text', run: async (t) => {
    if (typeof speechSynthesis === 'undefined') return 'Speech synthesis is not available in this context.';
    const text = String(t); if (!text.trim()) return 'Enter text to speak.';
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); speechSynthesis.speak(u);
    return `Speaking ${text.length} characters.`; } },
  'stt (web speech)': { name: 'STT (Web Speech)', cat: 'text', run: async () => {
    const SR = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    if (!SR) return 'Speech recognition is not available in this browser context.';
    return await new Promise((resolve) => { const r = new SR(); r.lang = navigator.language || 'en-IN'; r.onresult = (e) => resolve(e.results[0][0].transcript); r.onerror = (e) => resolve('Speech recognition error: ' + e.error); r.onend = () => resolve('No speech detected.'); try { r.start(); } catch (e) { resolve('Could not start recognition: ' + e.message); } }); } },
};

// ---------- Calculators & Converters ----------
const UNITS = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254, nmi: 1852 },
  mass: { kg: 1, g: 0.001, mg: 1e-6, t: 1000, lb: 0.45359237, oz: 0.028349523125, st: 6.35029318 },
  area: { 'm²': 1, 'km²': 1e6, 'cm²': 1e-4, ha: 10000, acre: 4046.8564224, 'ft²': 0.09290304, 'yd²': 0.83612736, 'mi²': 2589988.110336 },
  volume: { L: 1, mL: 0.001, 'm³': 1000, gal: 3.785411784, qt: 0.946352946, pt: 0.473176473, cup: 0.2365882365, 'fl oz': 0.0295735295625 },
  speed: { 'm/s': 1, 'km/h': 0.277777778, mph: 0.44704, kn: 0.514444444, 'ft/s': 0.3048 },
  pressure: { Pa: 1, kPa: 1000, bar: 100000, atm: 101325, psi: 6894.757293, mmHg: 133.322368 },
  energy: { J: 1, kJ: 1000, cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3.6e6, eV: 1.602176634e-19 },
  power: { W: 1, kW: 1000, MW: 1e6, hp: 745.699872, 'BTU/h': 0.29307107 },
  angle: { deg: Math.PI / 180, rad: 1, grad: Math.PI / 200, turn: 2 * Math.PI },
  data: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776, bit: 0.125 },
  time: { s: 1, min: 60, h: 3600, day: 86400, week: 604800, month: 2629800, year: 31557600 },
};
function convert(amount, from, to, table) {
  if (!(from in table) || !(to in table)) throw Error(`Unknown unit. Known: ${Object.keys(table).join(', ')}`);
  return amount * table[from] / table[to];
}
const num = (x, d) => { const n = Number(x); if (!Number.isFinite(n)) throw Error('Enter a valid number'); return n; };

export const TTB_EXTRA_CALC = {
  'matrix': { name: 'Matrix', cat: 'calc', inputs: [{ key: 'b', label: 'Matrix B (rows on new lines, space-separated)', type: 'textarea' }, { key: 'op', label: 'Operation', type: 'select', options: ['multiply', 'add', 'transpose A', 'determinant A'], value: 'multiply' }], run: (t, c) => {
    const parse = (s) => String(s || '').trim().split(/\r?\n/).filter(Boolean).map((r) => r.trim().split(/[\s,]+/).map(Number));
    const A = parse(t), B = parse(c.b);
    const mul = (X, Y) => X.map((row) => Y[0].map((_, j) => row.reduce((a, v, k) => a + v * Y[k][j], 0)));
    const add = (X, Y) => X.map((r, i) => r.map((v, j) => v + Y[i][j]));
    const det = (M) => { const n = M.length; if (n === 1) return M[0][0]; if (n === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0]; let d = 0; for (let j = 0; j < n; j++) { const sub = M.slice(1).map((r) => r.filter((_, k) => k !== j)); d += ((j % 2) ? -1 : 1) * M[0][j] * det(sub); } return d; };
    const show = (M) => M.map((r) => r.map((v) => fmt(v, 4)).join('\t')).join('\n');
    if (!A.length) throw Error('Enter matrix A (one row per line).');
    if (c.op === 'transpose A') return show(A[0].map((_, j) => A.map((r) => r[j])));
    if (c.op === 'determinant A') return String(fmt(det(A), 6));
    if (c.op === 'add') return show(add(A, B));
    return show(mul(A, B)); } },
  'freelance rate': { name: 'Freelance rate', cat: 'calc', inputs: [{ key: 'b', label: 'Billable hours / week', type: 'number', value: '25' }, { key: 'c', label: 'Weeks off / year', type: 'number', value: '6' }], run: (t, c) => {
    const target = num(t), hours = num(c.b || 25), off = num(c.c || 6); const weeks = 52 - off;
    const hourly = target / (hours * weeks);
    return JSON.stringify({ annualTarget: target, billableHoursPerWeek: hours, workingWeeks: weeks, hourlyRate: fmt(hourly), dayRate: fmt(hourly * 8), weeklyRate: fmt(hourly * hours) }, null, 2); } },
  'business days': { name: 'Business days', cat: 'calc', inputs: [{ key: 'b', label: 'End date', type: 'text', placeholder: '2026-12-31' }], run: (t, c) => {
    const a = new Date(t), b = new Date(c.b); if (isNaN(a) || isNaN(b)) throw Error('Enter two valid dates');
    const dir = a <= b ? 1 : -1; const d = new Date(a); let n = 0; const total = 0;
    while ((dir > 0 ? d <= b : d >= b)) { const day = d.getDay(); if (day !== 0 && day !== 6) n++; d.setDate(d.getDate() + dir); }
    return JSON.stringify({ from: a.toISOString().slice(0, 10), to: b.toISOString().slice(0, 10), businessDays: n, calendarDays: Math.round(Math.abs(b - a) / 86400000) }, null, 2); } },
  'add/subtract date': { name: 'Add/subtract date', cat: 'calc', inputs: [{ key: 'b', label: 'Days (+/-)', type: 'number', value: '30' }], run: (t, c) => {
    const d = new Date(t); if (isNaN(d)) throw Error('Enter a valid date'); const n = Number(c.b || 0);
    d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) + ' (' + d.toLocaleDateString(undefined, { weekday: 'long' }) + ')'; } },
  'zodiac': { name: 'Zodiac', cat: 'calc', run: (t) => {
    const d = new Date(t); if (isNaN(d)) throw Error('Enter a valid date');
    const m = d.getMonth() + 1, day = d.getDate();
    const signs = [['Capricorn', 1, 19], ['Aquarius', 2, 18], ['Pisces', 3, 20], ['Aries', 4, 19], ['Taurus', 5, 20], ['Gemini', 6, 20], ['Cancer', 7, 22], ['Leo', 8, 22], ['Virgo', 9, 22], ['Libra', 10, 22], ['Scorpio', 11, 21], ['Sagittarius', 12, 21]];
    let sign = 'Capricorn'; for (const [name, mm, dd] of signs) { if (m > mm || (m === mm && day > dd)) sign = name; }
    return sign; } },
  'chinese zodiac': { name: 'Chinese zodiac', cat: 'calc', run: (t) => {
    const y = new Date(t).getFullYear(); if (!y) throw Error('Enter a valid date');
    const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
    const elements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
    return `${animals[(y - 4) % 12]} (${elements[Math.floor(((y - 4) % 10) / 2)]})`; } },
  'time zone converter': { name: 'Time zone converter', cat: 'calc', inputs: [{ key: 'b', label: 'From zone', type: 'text', value: 'Asia/Kolkata' }, { key: 'c', label: 'To zone', type: 'text', value: 'UTC' }], run: (t, c) => {
    const when = t ? new Date(t) : new Date(); if (isNaN(when)) throw Error('Enter a valid date/time');
    const f = (tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, dateStyle: 'medium', timeStyle: 'medium' }).format(when);
    try { return `${c.b}: ${f(c.b)}\n${c.c}: ${f(c.c)}`; } catch { return 'Unknown time zone. Use IANA names such as Asia/Kolkata or Europe/London.'; } } },
  'cron time': { name: 'Cron time', cat: 'calc', inputs: [{ key: 'b', label: 'Count', type: 'number', value: '5' }], run: (t, c) => {
    const p = String(t).trim().split(/\s+/); if (p.length < 5) throw Error('Enter a 5-field cron expression');
    const [mi, ho] = p; const n = Math.min(20, Number(c.b || 5)); const out = [];
    const match = (field, val) => field === '*' || field.split(',').some((part) => { if (part.includes('-')) { const [a, b] = part.split('-').map(Number); return val >= a && val <= b; } if (part.includes('/')) { const [, s] = part.split('/'); return val % Number(s) === 0; } return Number(part) === val; });
    const d = new Date(); d.setSeconds(0, 0); d.setMinutes(d.getMinutes() + 1);
    for (let i = 0; i < 60 * 24 * 30 && out.length < n; i++) { if (match(mi, d.getMinutes()) && match(ho, d.getHours())) out.push(d.toString()); d.setMinutes(d.getMinutes() + 1); }
    return out.join('\n') || 'No upcoming matches found in the next 30 days.'; } },
  'stopwatch': { name: 'Stopwatch', cat: 'calc', inputs: [{ key: 'action', label: 'Action', type: 'select', options: ['start', 'lap', 'stop', 'reset'], value: 'start' }], run: (t, c) => {
    const KEY = 'ttb_stopwatch'; const now = Date.now();
    return (async () => { const st = (await chrome.storage.local.get(KEY))[KEY] || { running: false, start: 0, laps: [] };
      const a = c.action || 'start';
      if (a === 'start') { st.running = true; st.start = now; st.laps = []; }
      else if (a === 'lap' && st.running) { st.laps.push(now - st.start); }
      else if (a === 'stop') { st.running = false; st.elapsed = now - st.start; }
      else if (a === 'reset') { st.running = false; st.start = 0; st.laps = []; st.elapsed = 0; }
      await chrome.storage.local.set({ [KEY]: st });
      const ms = st.running ? now - st.start : (st.elapsed || 0);
      return JSON.stringify({ running: st.running, elapsedMs: ms, elapsed: (ms / 1000).toFixed(2) + 's', laps: st.laps.map((l, i) => `lap ${i + 1}: ${(l / 1000).toFixed(2)}s`) }, null, 2); })(); } },
  'countdown': { name: 'Countdown', cat: 'calc', run: (t) => {
    const target = new Date(t); if (isNaN(target)) throw Error('Enter a valid target date/time');
    let ms = target - Date.now(); const past = ms < 0; ms = Math.abs(ms);
    const d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24, m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
    return `${past ? 'Since' : 'Until'} ${target.toString()}: ${d}d ${h}h ${m}m ${s}s`; } },
  'pomodoro': { name: 'Pomodoro', cat: 'calc', inputs: [{ key: 'work', label: 'Work (min)', type: 'number', value: '25' }, { key: 'break', label: 'Break (min)', type: 'number', value: '5' }, { key: 'cycles', label: 'Cycles', type: 'number', value: '4' }], run: (t, c) => {
    const work = Number(c.work || 25), brk = Number(c.break || 5), cycles = Math.min(12, Number(c.cycles || 4));
    let cur = new Date(); const plan = [];
    for (let i = 1; i <= cycles; i++) { const s = new Date(cur), e = new Date(cur.getTime() + work * 60000); plan.push(`#${i} work ${s.toTimeString().slice(0, 5)}–${e.toTimeString().slice(0, 5)}`); cur = new Date(e.getTime() + brk * 60000); if (i < cycles) plan.push(`   break until ${cur.toTimeString().slice(0, 5)}`); }
    return plan.join('\n') + `\n\nTotal: ${cycles * work} min work, ${(cycles - 1) * brk} min break.`; } },
  'unit converter': { name: 'Unit converter', cat: 'calc', inputs: [{ key: 'b', label: 'From unit', type: 'text', value: 'km' }, { key: 'c', label: 'To unit', type: 'text', value: 'mi' }, { key: 'd', label: 'Category', type: 'select', options: Object.keys(UNITS), value: 'length' }], run: (t, c) => { const table = UNITS[c.d || 'length']; return `${num(t)} ${c.b} = ${fmt(convert(num(t), c.b, c.c, table), 6)} ${c.c}`; } },
  'length/weight/temp/area/volume': { name: 'Length/weight/temp/area/volume', cat: 'calc', inputs: [{ key: 'b', label: 'From', type: 'text', value: 'm' }, { key: 'c', label: 'To', type: 'text', value: 'ft' }], run: (t, c) => {
    const f = c.b, to = c.c; const temp = { C: (x) => x, F: (x) => (x - 32) * 5 / 9, K: (x) => x - 273.15 };
    if (f in temp && to in temp) { const celsius = temp[f](num(t)); const back = { C: (x) => x, F: (x) => x * 9 / 5 + 32, K: (x) => x + 273.15 }[to](celsius); return `${num(t)}°${f} = ${fmt(back, 3)}°${to}`; }
    const table = { ...UNITS.length, ...UNITS.mass, ...UNITS.area, ...UNITS.volume }; return `${num(t)} ${f} = ${fmt(convert(num(t), f, to, table), 6)} ${to}`; } },
  'speed/pressure/energy/power': { name: 'Speed/pressure/energy/power', cat: 'calc', inputs: [{ key: 'b', label: 'From', type: 'text', value: 'km/h' }, { key: 'c', label: 'To', type: 'text', value: 'mph' }], run: (t, c) => { const table = { ...UNITS.speed, ...UNITS.pressure, ...UNITS.energy, ...UNITS.power }; return `${num(t)} ${c.b} = ${fmt(convert(num(t), c.b, c.c, table), 6)} ${c.c}`; } },
  'fuel economy': { name: 'Fuel economy', cat: 'calc', inputs: [{ key: 'b', label: 'Unit', type: 'select', options: ['L/100km', 'km/L', 'mpg (US)', 'mpg (UK)'], value: 'L/100km' }], run: (t, c) => {
    const v = num(t), u = c.b;
    const l100 = { 'L/100km': v, 'km/L': 100 / v, 'mpg (US)': 235.214583 / v, 'mpg (UK)': 282.481 / v }[u];
    return JSON.stringify({ input: `${v} ${u}`, 'L/100km': fmt(l100, 3), 'km/L': fmt(100 / l100, 3), 'mpg (US)': fmt(235.214583 / l100, 3), 'mpg (UK)': fmt(282.481 / l100, 3) }, null, 2); } },
  'cooking': { name: 'Cooking', cat: 'calc', inputs: [{ key: 'b', label: 'From', type: 'text', value: 'cup' }, { key: 'c', label: 'To', type: 'text', value: 'mL' }], run: (t, c) => {
    const vol = { cup: 236.5882365, tbsp: 14.7867648, tsp: 4.92892159, mL: 1, L: 1000, 'fl oz': 29.5735295625, pint: 473.176473, quart: 946.352946, gallon: 3785.411784 };
    return `${num(t)} ${c.b} = ${fmt(convert(num(t), c.b, c.c, vol), 4)} ${c.c}`; } },
  'byte converter': { name: 'Byte converter', cat: 'calc', run: (t) => { const b = num(t); return JSON.stringify({ bytes: b, KB: fmt(b / 1024, 4), MB: fmt(b / 1048576, 6), GB: fmt(b / 1073741824, 8), TB: fmt(b / 1099511627776, 10), bits: b * 8 }, null, 2); } },
  'data rate': { name: 'Data rate', cat: 'calc', inputs: [{ key: 'b', label: 'To', type: 'select', options: ['Mbps', 'MB/s', 'Gbps', 'GB/s'], value: 'MB/s' }], run: (t, c) => { const mbps = num(t); const map = { Mbps: mbps, 'MB/s': mbps / 8, Gbps: mbps / 1000, 'GB/s': mbps / 8000 }; return `${mbps} Mbps = ${fmt(map[c.b], 4)} ${c.b}`; } },
  'frequency/wavelength': { name: 'Frequency/wavelength', cat: 'calc', inputs: [{ key: 'b', label: 'Input is', type: 'select', options: ['frequency (MHz)', 'wavelength (m)'], value: 'frequency (MHz)' }], run: (t, c) => {
    const v = num(t); const cLight = 299792458;
    if (c.b.startsWith('frequency')) { const hz = v * 1e6; return JSON.stringify({ frequencyMHz: v, wavelengthM: fmt(cLight / hz, 4), wavelengthCm: fmt(cLight / hz * 100, 2), band: hz < 3e8 ? 'HF/VHF' : hz < 3e9 ? 'UHF' : 'SHF' }, null, 2); }
    return JSON.stringify({ wavelengthM: v, frequencyMHz: fmt(cLight / v / 1e6, 4) }, null, 2); } },
  'angle': { name: 'Angle', cat: 'calc', inputs: [{ key: 'b', label: 'From', type: 'text', value: 'deg' }, { key: 'c', label: 'To', type: 'text', value: 'rad' }], run: (t, c) => `${num(t)} ${c.b} = ${fmt(convert(num(t), c.b, c.c, UNITS.angle), 6)} ${c.c}` },
  'base converter': { name: 'Base converter', cat: 'calc', inputs: [{ key: 'b', label: 'From base (2-36)', type: 'number', value: '10' }, { key: 'c', label: 'To base (2-36)', type: 'number', value: '16' }], run: (t, c) => {
    const from = Number(c.b || 10), to = Number(c.c || 16); const v = parseInt(String(t).trim(), from); if (!Number.isFinite(v)) throw Error('Invalid number for that base'); return v.toString(to).toUpperCase(); } },
  'binary/octal/hex': { name: 'Binary/octal/hex', cat: 'calc', inputs: [{ key: 'b', label: 'Input base', type: 'select', options: ['dec', 'bin', 'oct', 'hex'], value: 'dec' }], run: (t, c) => {
    const bases = { dec: 10, bin: 2, oct: 8, hex: 16 }; const v = parseInt(String(t).trim(), bases[c.b || 'dec']); if (!Number.isFinite(v)) throw Error('Invalid number');
    return JSON.stringify({ decimal: v, binary: v.toString(2), octal: v.toString(8), hex: v.toString(16).toUpperCase() }, null, 2); } },
  'scientific notation': { name: 'Scientific notation', cat: 'calc', run: (t) => { const v = num(t); return v.toExponential(6); } },
  'significant figures': { name: 'Significant figures', cat: 'calc', inputs: [{ key: 'b', label: 'Round to (sig figs)', type: 'number', value: '3' }], run: (t, c) => { const v = num(t), n = Math.max(1, Math.min(15, Number(c.b || 3))); return v.toPrecision(n); } },
  'rounding': { name: 'Rounding', cat: 'calc', inputs: [{ key: 'b', label: 'Decimal places', type: 'number', value: '2' }], run: (t, c) => { const v = num(t), d = Math.max(0, Math.min(12, Number(c.b || 2))); const f = 10 ** d; return JSON.stringify({ rounded: Math.round(v * f) / f, floor: Math.floor(v * f) / f, ceil: Math.ceil(v * f) / f, places: d }, null, 2); } },
  'percentile/quartile': { name: 'Percentile/quartile', cat: 'calc', inputs: [{ key: 'b', label: 'Percentile', type: 'number', value: '90' }], run: (t, c) => {
    const a = String(t).split(/[\s,;]+/).map(Number).filter(Number.isFinite).sort((x, y) => x - y); if (!a.length) throw Error('Enter numeric data');
    const q = (p) => { const idx = (a.length - 1) * p; const lo = Math.floor(idx), hi = Math.ceil(idx); return lo === hi ? a[lo] : a[lo] + (a[hi] - a[lo]) * (idx - lo); };
    const p = Math.min(100, Math.max(0, Number(c.b || 90))) / 100;
    return JSON.stringify({ count: a.length, min: a[0], max: a[a.length - 1], q1: fmt(q(0.25)), median: fmt(q(0.5)), q3: fmt(q(0.75)), [`p${p * 100}`]: fmt(q(p)) }, null, 2); } },
  'correlation': { name: 'Correlation', cat: 'calc', inputs: [{ key: 'b', label: 'Y values (comma-separated)', type: 'text', placeholder: '2,4,6,8' }], run: (t, c) => {
    const x = String(t).split(/[\s,;]+/).map(Number).filter(Number.isFinite), y = String(c.b || '').split(/[\s,;]+/).map(Number).filter(Number.isFinite);
    if (x.length !== y.length || x.length < 2) throw Error('X and Y must have the same length (≥2)');
    const mx = x.reduce((a, b) => a + b, 0) / x.length, my = y.reduce((a, b) => a + b, 0) / y.length;
    const cov = x.reduce((a, v, i) => a + (v - mx) * (y[i] - my), 0);
    const sx = Math.sqrt(x.reduce((a, v) => a + (v - mx) ** 2, 0)), sy = Math.sqrt(y.reduce((a, v) => a + (v - my) ** 2, 0));
    const r = cov / (sx * sy);
    return JSON.stringify({ r: fmt(r, 4), r2: fmt(r * r, 4), n: x.length, interpretation: Math.abs(r) > 0.7 ? 'strong' : Math.abs(r) > 0.4 ? 'moderate' : 'weak' }, null, 2); } },
  'linear regression': { name: 'Linear regression', cat: 'calc', inputs: [{ key: 'b', label: 'Y values (comma-separated)', type: 'text', placeholder: '2,4,6,8' }], run: (t, c) => {
    const y = String(t).split(/[\s,;]+/).map(Number).filter(Number.isFinite), x = String(c.b || '').split(/[\s,;]+/).map(Number).filter(Number.isFinite);
    if (x.length !== y.length || x.length < 2) throw Error('X and Y must have the same length (≥2)');
    const n = x.length, mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
    const sxy = x.reduce((a, v, i) => a + (v - mx) * (y[i] - my), 0), sxx = x.reduce((a, v) => a + (v - mx) ** 2, 0);
    const slope = sxy / sxx, intercept = my - slope * mx;
    return JSON.stringify({ slope: fmt(slope, 6), intercept: fmt(intercept, 6), equation: `y = ${fmt(slope, 4)}x + ${fmt(intercept, 4)}`, n }, null, 2); } },
  'probability': { name: 'Probability', cat: 'calc', inputs: [{ key: 'b', label: 'Operation', type: 'select', options: ['nCr (combinations)', 'nPr (permutations)', 'n! (factorial)'], value: 'nCr (combinations)' }, { key: 'c', label: 'r', type: 'number', value: '2' }], run: (t, c) => {
    const n = Math.trunc(num(t)), r = Math.trunc(num(c.c || 2)); const fact = (x) => { let f = 1; for (let i = 2; i <= x; i++) f *= i; return f; };
    if (n > 170) throw Error('Keep n ≤ 170 to stay within floating-point range');
    if (c.b.startsWith('n!')) return String(fact(n));
    if (r > n || r < 0) throw Error('r must be between 0 and n');
    return String(c.b.startsWith('nCr') ? Math.round(fact(n) / (fact(r) * fact(n - r))) : Math.round(fact(n) / fact(n - r))); } },
  'random from list': { name: 'Random from list', cat: 'calc', inputs: [{ key: 'b', label: 'How many to pick', type: 'number', value: '1' }], run: (t, c) => {
    const items = String(t).split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean); if (!items.length) throw Error('Enter a list');
    const n = Math.max(1, Math.min(items.length, Number(c.b || 1))); const copy = [...items]; const out = [];
    for (let i = 0; i < n; i++) out.push(copy.splice(rnd(copy.length), 1)[0]);
    return out.join('\n'); } },
  'bmi/bmr/tdee': { name: 'BMI/BMR/TDEE', cat: 'calc', inputs: [{ key: 'b', label: 'Weight (kg)', type: 'number' }, { key: 'c', label: 'Height (cm)', type: 'number' }, { key: 'd', label: 'Age (years)', type: 'number' }, { key: 'sex', label: 'Sex', type: 'select', options: ['male', 'female'], value: 'male' }, { key: 'activity', label: 'Activity', type: 'select', options: ['sedentary', 'light', 'moderate', 'active', 'very active'], value: 'moderate' }], run: (t, c) => {
    const w = num(t), h = num(c.c) / 100, age = num(c.d);
    const bmi = w / (h * h);
    const bmr = c.sex === 'female' ? 10 * w + 6.25 * h * 100 - 5 * age - 161 : 10 * w + 6.25 * h * 100 - 5 * age + 5;
    const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, 'very active': 1.9 }[c.activity] || 1.55;
    const cat = bmi < 18.5 ? 'underweight' : bmi < 25 ? 'normal' : bmi < 30 ? 'overweight' : 'obese';
    return JSON.stringify({ bmi: fmt(bmi, 1), category: cat, bmr: Math.round(bmr), tdee: Math.round(bmr * mult), activity: c.activity }, null, 2); } },
  'body fat': { name: 'Body fat', cat: 'calc', inputs: [{ key: 'b', label: 'Height (cm)', type: 'number' }, { key: 'c', label: 'Neck (cm)', type: 'number' }, { key: 'd', label: 'Waist (cm)', type: 'number' }, { key: 'sex', label: 'Sex', type: 'select', options: ['male', 'female'], value: 'male' }], run: (t, c) => {
    const w = num(t), h = num(c.b), neck = num(c.c), waist = num(c.d);
    const bf = c.sex === 'female' ? 495 / (1.29579 - 0.35004 * Math.log10(waist + h - neck) + 0.221 * Math.log10(h)) - 450 : 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450;
    return JSON.stringify({ bodyFatPercent: fmt(bf, 1), method: 'US Navy circumference', sex: c.sex }, null, 2); } },
  'pace/speed': { name: 'Pace/speed', cat: 'calc', inputs: [{ key: 'b', label: 'Distance (km)', type: 'number', value: '5' }, { key: 'c', label: 'Time (min)', type: 'number', value: '30' }], run: (t, c) => {
    const dist = num(c.b), min = num(c.c); const pace = min / dist;
    return JSON.stringify({ distanceKm: dist, timeMin: min, paceMinPerKm: `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, '0')}`, speedKmh: fmt(dist / (min / 60), 2), speedMph: fmt(dist / (min / 60) / 1.609344, 2) }, null, 2); } },
  'fuel cost': { name: 'Fuel cost', cat: 'calc', inputs: [{ key: 'b', label: 'Distance (km)', type: 'number' }, { key: 'c', label: 'Efficiency (km/L)', type: 'number', value: '15' }, { key: 'd', label: 'Price / L', type: 'number', value: '100' }], run: (t, c) => {
    const dist = num(c.b), eff = num(c.c), price = num(c.d); const litres = dist / eff;
    return JSON.stringify({ litresUsed: fmt(litres, 2), cost: fmt(litres * price, 2), currencyNote: 'Currency is whatever your price unit is' }, null, 2); } },
  'electricity cost': { name: 'Electricity cost', cat: 'calc', inputs: [{ key: 'b', label: 'Hours/day', type: 'number', value: '4' }, { key: 'c', label: 'Price / kWh', type: 'number', value: '8' }, { key: 'd', label: 'Days', type: 'number', value: '30' }], run: (t, c) => {
    const watts = num(t), h = num(c.b), price = num(c.c), days = num(c.d); const kwh = watts / 1000 * h * days;
    return JSON.stringify({ watts, hoursPerDay: h, days, kWh: fmt(kwh, 3), cost: fmt(kwh * price, 2) }, null, 2); } },
};
