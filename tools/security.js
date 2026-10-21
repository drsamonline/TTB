// TTB — Security tools
// All primitives use the Web Crypto API. Nothing here performs a network
// request except the explicitly-invoked URL expander, which degrades
// gracefully when the browser blocks a cross-origin fetch.
const te = new TextEncoder();
const td = new TextDecoder();
const bytes = (s) => te.encode(String(s));
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const unhex = (h) => Uint8Array.from(String(h).replace(/[^0-9a-f]/gi, '').match(/.{1,2}/g) || [], (x) => parseInt(x, 16));
async function digest(algo, s) { return hex(await crypto.subtle.digest(algo, bytes(s))); }
function b64(bytesIn) { let s = ''; for (const b of new Uint8Array(bytesIn)) s += String.fromCharCode(b); return btoa(s); }
function unb64(str) { return Uint8Array.from(atob(str), (c) => c.charCodeAt(0)); }
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Encode(input) {
  const buf = typeof input === 'string' ? bytes(input) : new Uint8Array(input);
  let bits = 0, val = 0, out = '';
  for (const b of buf) { val = (val << 8) | b; bits += 8; while (bits >= 5) { out += B32[(val >>> (bits -= 5)) & 31]; } }
  if (bits) out += B32[(val << (5 - bits)) & 31];
  return out;
}
function base32Decode(str) {
  const clean = String(str).toUpperCase().replace(/=+$/, '').replace(/[^A-Z2-7]/g, '');
  let bits = 0, val = 0; const out = [];
  for (const c of clean) { const i = B32.indexOf(c); if (i < 0) continue; val = (val << 5) | i; bits += 5; if (bits >= 8) { out.push((val >>> (bits -= 8)) & 255); } }
  return new Uint8Array(out);
}
async function hmac(algo, keyBytes, msgBytes) {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: algo }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, msgBytes));
}
async function hotp(secretB32, counter, digits = 6) {
  const key = base32Decode(secretB32);
  const buf = new ArrayBuffer(8); const view = new DataView(buf);
  view.setUint32(4, counter >>> 0, false); view.setUint32(0, Math.floor(counter / 4294967296), false);
  const mac = await hmac('SHA-1', key, new Uint8Array(buf));
  const off = mac[mac.length - 1] & 0x0f;
  const bin = ((mac[off] & 0x7f) << 24) | (mac[off + 1] << 16) | (mac[off + 2] << 8) | mac[off + 3];
  return String(bin % 10 ** digits).padStart(digits, '0');
}
async function totp(secretB32, { step = 30, digits = 6, t = Date.now() } = {}) {
  return hotp(secretB32, Math.floor(t / 1000 / step), digits);
}
async function deriveKey(password, salt, iterations = 210000) {
  const base = await crypto.subtle.importKey('raw', bytes(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function aesEncrypt(password, plaintext) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes(plaintext));
  return JSON.stringify({ v: 1, kdf: 'PBKDF2-SHA256', iter: 210000, cipher: 'AES-GCM', salt: b64(salt), iv: b64(iv), data: b64(ct) });
}
async function aesDecrypt(password, payload) {
  const o = JSON.parse(payload);
  const key = await deriveKey(password, unb64(o.salt), o.iter || 210000);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(o.iv) }, key, unb64(o.data));
  return td.decode(pt);
}
function ibanValid(raw) {
  const x = String(raw).replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(x)) return { valid: false, reason: 'Invalid format' };
  const moved = x.slice(4) + x.slice(0, 4);
  const num = moved.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rem = 0; for (const ch of num) rem = (rem * 10 + Number(ch)) % 97;
  return { valid: rem === 1, country: x.slice(0, 2), checkDigits: x.slice(2, 4) };
}
export async function runSecurity(name, ctx = {}) {
  const n = name.toLowerCase(), s = String(ctx.text ?? '');
  // --- hashing / evidence ---
  if (n === 'evidence capture (sha-256 + timestamp)') return { sha256: await digest('SHA-256', s), timestamp: new Date().toISOString(), note: 'Hash/timestamp record; not a legal certification.' };
  if (n === 'chain-of-custody screenshot') return { timestamp: new Date().toISOString(), sha256: await digest('SHA-256', s), note: 'Metadata record only; evidentiary validity depends on jurisdiction and procedure.' };
  if (n === 'hash verifier') {
    const algo = (ctx.algorithm || 'SHA-256').toUpperCase();
    const expected = String(ctx.expected ?? '').trim().toLowerCase().replace(/[^0-9a-f]/g, '');
    const got = await digest(algo, s);
    return { algorithm: algo, computed: got, expected, match: expected ? got === expected : null };
  }
  // --- one-time passwords ---
  if (n === 'totp (rfc 6238)') {
    const secret = String(ctx.secret ?? s).trim();
    if (!secret) throw Error('Provide a Base32 secret');
    const code = await totp(secret);
    const period = 30, now = Math.floor(Date.now() / 1000);
    return JSON.stringify({ code, period, secondsRemaining: period - (now % period), algorithm: 'SHA-1', digits: 6 }, null, 2);
  }
  if (n === 'hotp (rfc 4226)') {
    const secret = String(ctx.secret ?? s).trim();
    const counter = Number(ctx.counter ?? 0) || 0;
    if (!secret) throw Error('Provide a Base32 secret');
    return JSON.stringify({ code: await hotp(secret, counter), counter, algorithm: 'SHA-1', digits: 6 }, null, 2);
  }
  if (n === 'base32 for totp') {
    const raw = ctx.hex ? unhex(s) : bytes(s);
    return base32Encode(raw);
  }
  // --- symmetric crypto ---
  if (n === 'aes-gcm encrypt/decrypt') {
    const pw = String(ctx.password ?? '');
    if (!pw) throw Error('Provide a password');
    return ctx.mode === 'decrypt' ? await aesDecrypt(pw, s) : await aesEncrypt(pw, s);
  }
  if (n === 'pbkdf2') {
    const pw = String(ctx.password ?? s), saltStr = String(ctx.salt ?? 'ttb-salt'), iter = Number(ctx.iterations ?? 210000) || 210000;
    const base = await crypto.subtle.importKey('raw', bytes(pw), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: bytes(saltStr), iterations: iter, hash: 'SHA-256' }, base, 256);
    return JSON.stringify({ algorithm: 'PBKDF2-HMAC-SHA256', iterations: iter, salt: saltStr, derivedKeyHex: hex(bits) }, null, 2);
  }
  if (n === 'secure notes (encrypted)') {
    const label = String(ctx.label ?? 'note').trim() || 'note';
    const pw = String(ctx.password ?? '');
    if (!pw) throw Error('Provide a password');
    const KEY = 'ttb_secure_notes';
    const store = (await chrome.storage.local.get(KEY))[KEY] || {};
    if (ctx.mode === 'load') {
      if (!store[label]) return `No stored note named "${label}".`;
      try { return await aesDecrypt(pw, store[label]); } catch { return 'Decryption failed — wrong password or corrupted note.'; }
    }
    store[label] = await aesEncrypt(pw, s);
    await chrome.storage.local.set({ [KEY]: store });
    return `Encrypted note "${label}" saved. Labels: ${Object.keys(store).join(', ') || '(none)'}`;
  }
  if (n === 'password strength meter (zxcvbn)') {
    const pool = (/[a-z]/.test(s) ? 26 : 0) + (/[A-Z]/.test(s) ? 26 : 0) + (/\d/.test(s) ? 10 : 0) + (/[^A-Za-z0-9]/.test(s) ? 33 : 0);
    const entropy = s.length ? +(s.length * Math.log2(pool || 1)).toFixed(1) : 0;
    const verdict = entropy >= 100 ? 'very strong' : entropy >= 70 ? 'strong' : entropy >= 45 ? 'moderate' : entropy >= 25 ? 'weak' : 'very weak';
    return JSON.stringify({ length: s.length, charsetSize: pool, entropyBits: entropy, verdict, hasUpper: /[A-Z]/.test(s), hasLower: /[a-z]/.test(s), hasDigit: /\d/.test(s), hasSymbol: /[^A-Za-z0-9]/.test(s) }, null, 2);
  }
  if (n === 'passphrase generator (eff)') {
    const words = ['river', 'cobalt', 'maple', 'orbit', 'lantern', 'meadow', 'signal', 'forest', 'quartz', 'harbor', 'violet', 'ember', 'falcon', 'canyon', 'silver', 'anchor', 'hollow', 'summit', 'copper', 'thistle', 'wander', 'marble', 'cinder', 'aurora', 'pebble', 'saffron', 'timber', 'zephyr'];
    const count = Math.max(3, Math.min(12, Number(ctx.count ?? 5) || 5));
    const pick = () => words[crypto.getRandomValues(new Uint32Array(1))[0] % words.length];
    return Array.from({ length: count }, pick).join('-');
  }
  // --- cookies ---
  if (n === 'cookie inspector/editor') return ctx.tab?.url ? await chrome.cookies.getAll({ url: ctx.tab.url }) : [];
  if (n === 'cookie third-party analyzer') {
    const c = ctx.tab?.url ? await chrome.cookies.getAll({ url: ctx.tab.url }) : [];
    const host = ctx.tab?.url ? new URL(ctx.tab.url).hostname : '';
    return c.map((x) => ({ ...x, thirdParty: !host.endsWith(x.domain.replace(/^\./, '')) }));
  }
  // --- phishing / URL analysis ---
  if (n === 'homoglyph url detector') {
    try {
      const u = new URL(s);
      const nonAscii = [...u.hostname].filter((c) => c.charCodeAt(0) >= 128);
      const mixed = /[a-z]/i.test(u.hostname) && nonAscii.length > 0;
      return JSON.stringify({ hostname: u.hostname, asciiOnly: nonAscii.length === 0, nonAsciiChars: nonAscii, punycode: u.hostname.startsWith('xn--'), mixedScript: mixed, suspicious: mixed }, null, 2);
    } catch { return 'Invalid URL'; }
  }
  if (n === 'suspicious tld checker' || n === 'lookalike domain detector' || n === 'typosquatting detector') {
    try {
      const h = new URL(s).hostname.toLowerCase(), tld = h.split('.').pop();
      const bad = ['zip', 'mov', 'top', 'click', 'gq', 'tk', 'ml', 'cf', 'work', 'loan', 'rest'];
      const brands = ['google', 'paypal', 'apple', 'amazon', 'microsoft', 'facebook', 'whatsapp', 'instagram', 'netflix', 'sbi', 'hdfc', 'icici'];
      const hit = brands.filter((b) => h.includes(b) && !h.endsWith(b + '.com') && !h.endsWith('.' + b + '.com'));
      return JSON.stringify({ hostname: h, tld, suspiciousTLD: bad.includes(tld), brandImpersonation: hit, hyphenCount: (h.match(/-/g) || []).length, verdict: bad.includes(tld) || hit.length ? 'suspicious' : 'no obvious signal' }, null, 2);
    } catch { return 'Invalid URL'; }
  }
  if (n === 'url cleaner (utm)') {
    try { const u = new URL(s); [...u.searchParams.keys()].filter((k) => /^utm_/i.test(k) || /^(fbclid|gclid|mc_eid|igshid)$/i.test(k)).forEach((k) => u.searchParams.delete(k)); return u.toString(); } catch { return 'Invalid URL'; }
  }
  if (n === 'url expander') {
    if (!/^https?:\/\//i.test(s)) return 'Enter a full http(s) URL.';
    try {
      const r = await fetch(s, { method: 'GET', redirect: 'follow', cache: 'no-store' });
      return JSON.stringify({ requested: s, finalUrl: r.url, redirected: r.url !== s, status: r.status }, null, 2);
    } catch (e) {
      return `Could not follow redirects (${e.message}). Cross-origin fetches are blocked unless the site allows it; open the link in a tab to see where it lands.`;
    }
  }
  if (n === 'clipboard hijack detector') {
    const cryptoAddr = [...s.matchAll(/\b(?:bc1[a-z0-9]{25,62}|0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g)].map((m) => m[0]);
    const zeroWidth = [...s].filter((c) => /[\u200B-\u200D\uFEFF\u2060]/.test(c)).length;
    const bidi = [...s].filter((c) => /[\u202A-\u202E\u2066-\u2069]/.test(c)).length;
    const homoglyph = [...s].filter((c) => c.charCodeAt(0) >= 128 && /[A-Za-z0-9]/.test(c.normalize('NFKC'))).length;
    const flags = { zeroWidth, bidiControls: bidi, homoglyphs: homoglyph, cryptoAddresses: cryptoAddr.length };
    const suspicious = zeroWidth + bidi + homoglyph > 0;
    return JSON.stringify({ ...flags, cryptoAddresses: cryptoAddr, suspicious, note: suspicious ? 'Invisible or lookalike characters present — retype critical values by hand.' : 'No invisible-character tampering detected.' }, null, 2);
  }
  // --- validators ---
  if (n === 'iban validator') { const r = ibanValid(s); return r.valid ? `Valid IBAN (${r.country}, check digits ${r.checkDigits})` : `Invalid — ${r.reason || 'checksum failed'}`; }
  if (n === 'ssn format checker') return /^(?!000|666|9\d\d)\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}$/.test(s) ? 'Valid format' : 'Invalid format';
  if (n === 'credit card validator (luhn)') { const d = s.replace(/\D/g, ''); let sum = 0, alt = false; for (let i = d.length - 1; i >= 0; i--) { let x = +d[i]; if (alt) { x *= 2; if (x > 9) x -= 9; } sum += x; alt = !alt; } return d.length >= 12 && sum % 10 === 0 ? 'Valid' : 'Invalid'; }
  if (n === 'pii detector') return { emails: [...s.matchAll(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g)].map((x) => x[0]), phones: [...s.matchAll(/\+?\d[\d ()-]{7,}\d/g)].map((x) => x[0]), possibleSecrets: [...s.matchAll(/(?:api[_-]?key|secret|token|password)\s*[:=]\s*\S+/gi)].map((x) => x[0]), aadhaarLike: [...s.matchAll(/\b\d{4}\s?\d{4}\s?\d{4}\b/g)].map((x) => x[0]) };
  if (n === 'clipboard sanitizer') return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  // --- honest, non-implementable-locally tools ---
  if (n === 'fingerprint detector') return { canvas: typeof HTMLCanvasElement !== 'undefined', webgl: !!(typeof document !== 'undefined' && document.createElement?.('canvas')?.getContext?.('webgl')), userAgent: navigator.userAgent, languages: navigator.languages, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, hardwareConcurrency: navigator.hardwareConcurrency };
  if (n === 'canvas fingerprint blocker') return 'Canvas fingerprint blocking requires content-script interception; not enabled in this build to avoid breaking page functionality.';
  if (n === 'webrtc ip leak test') return 'WebRTC inspection requires page-level ICE candidate observation; no public IP is exposed by this extension itself.';
  if (n === 'ip address viewer') return 'Public IP lookup requires a network request and is intentionally not performed by this offline security module.';
  if (n === 'file metadata stripper') return 'Metadata stripping requires a file payload; use the Media & Files tools for image metadata.';
  return null;
}
