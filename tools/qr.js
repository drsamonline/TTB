// TTB — QR Code encoder (byte mode, ECC L/M/Q/H, versions 1–40).
// Self-contained: no third-party runtime dependency. The Reed–Solomon block
// tables are the standard ISO/IEC 18004 values.
const TOTAL = [26, 44, 70, 100, 134, 172, 196, 242, 292, 346, 404, 466, 532, 581, 655, 733, 815, 901, 991, 1085, 1156, 1258, 1364, 1474, 1588, 1706, 1828, 1921, 2051, 2185, 2323, 2465, 2611, 2761, 2876, 3034, 3196, 3362, 3532, 3706];
const BLOCKS = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 2, 2, 4, 1, 2, 4, 4, 2, 4, 4, 4, 2, 4, 6, 5, 2, 4, 6, 6, 2, 5, 8, 8, 4, 5, 8, 8, 4, 5, 8, 11, 4, 8, 10, 11, 4, 9, 12, 16, 4, 9, 16, 16, 6, 10, 12, 18, 6, 10, 17, 16, 6, 11, 16, 19, 6, 13, 18, 21, 7, 14, 21, 25, 8, 16, 20, 25, 8, 17, 23, 25, 9, 17, 23, 34, 9, 18, 25, 30, 10, 20, 27, 32, 12, 21, 29, 35, 12, 23, 34, 37, 12, 25, 34, 40, 13, 26, 35, 42, 14, 28, 38, 45, 15, 29, 40, 48, 16, 31, 43, 51, 17, 33, 45, 54, 18, 35, 48, 57, 19, 37, 51, 60, 19, 38, 53, 63, 20, 40, 56, 66, 21, 43, 59, 70, 22, 45, 62, 74, 24, 47, 65, 77, 25, 49, 68, 81];
const EC = [7, 10, 13, 17, 10, 16, 22, 28, 15, 26, 36, 44, 20, 36, 52, 64, 26, 48, 72, 88, 36, 64, 96, 112, 40, 72, 108, 130, 48, 88, 132, 156, 60, 110, 160, 192, 72, 130, 192, 224, 80, 150, 224, 264, 96, 176, 260, 308, 104, 198, 288, 352, 120, 216, 320, 384, 132, 240, 360, 432, 144, 280, 408, 480, 168, 308, 448, 532, 180, 338, 504, 588, 196, 364, 546, 650, 224, 416, 600, 700, 224, 442, 644, 750, 252, 476, 690, 816, 270, 504, 750, 900, 300, 560, 810, 960, 312, 588, 870, 1050, 336, 644, 952, 1110, 360, 700, 1020, 1200, 390, 728, 1050, 1260, 420, 784, 1140, 1350, 450, 812, 1200, 1440, 480, 868, 1290, 1530, 510, 924, 1350, 1620, 540, 980, 1440, 1710, 570, 1036, 1530, 1800, 570, 1064, 1590, 1890, 600, 1120, 1680, 1980, 630, 1204, 1770, 2100, 660, 1260, 1860, 2220, 720, 1316, 1950, 2310, 750, 1372, 2040, 2430];
const LEVEL = { L: 0, M: 1, Q: 2, H: 3 };
const LEVEL_BIT = { L: 1, M: 0, Q: 3, H: 2 };

const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
(() => { let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
const gmul = (a, b) => (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]];
function genPoly(n) { let g = [1]; for (let i = 0; i < n; i++) { const ng = new Array(g.length + 1).fill(0); for (let k = 0; k < g.length; k++) { ng[k] ^= g[k]; ng[k + 1] ^= gmul(g[k], EXP[i]); } g = ng; } return g; }
function rsEncode(data, n) { const g = genPoly(n); const res = new Array(data.length + n).fill(0); for (let i = 0; i < data.length; i++) res[i] = data[i]; for (let i = 0; i < data.length; i++) { const coef = res[i]; if (coef) for (let j = 0; j < g.length; j++) res[i + j] ^= gmul(g[j], coef); } return res.slice(data.length); }
const bchDigit = (x) => { let n = 0; while (x) { n++; x >>>= 1; } return n; };
function bch15(data) { let d = data << 10; const G = 0x537; while (bchDigit(d) - bchDigit(G) >= 0) d ^= G << (bchDigit(d) - bchDigit(G)); return ((data << 10) | d) ^ 0x5412; }
function bch18(version) { let d = version << 12; const G = 0x1f25; while (bchDigit(d) - bchDigit(G) >= 0) d ^= G << (bchDigit(d) - bchDigit(G)); return (version << 12) | d; }

function pickVersion(len, li) { for (let v = 1; v <= 40; v++) { const cc = v < 10 ? 8 : 16; const cap = (TOTAL[v - 1] - EC[(v - 1) * 4 + li]) * 8; if (4 + cc + 8 * len <= cap) return v; } throw new Error('Data is too long for a QR code (max ~2953 bytes).'); }
function buildCodewords(bytes, version, li) {
  const cc = version < 10 ? 8 : 16; const dataCodewords = TOTAL[version - 1] - EC[(version - 1) * 4 + li];
  const bits = []; const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); };
  put(4, 4); put(bytes.length, cc); for (const b of bytes) put(b, 8);
  const cap = dataCodewords * 8; if (bits.length + 4 <= cap) put(0, 4);
  while (bits.length % 8 !== 0) bits.push(0);
  const rem = (cap - bits.length) / 8; for (let i = 0; i < rem; i++) put(i % 2 ? 0x11 : 0xEC, 8);
  const data = new Uint8Array(dataCodewords); for (let i = 0; i < dataCodewords; i++) { let b = 0; for (let k = 0; k < 8; k++) b = (b << 1) | bits[i * 8 + k]; data[i] = b; }
  return data;
}
function interleave(data, version, li) {
  const total = TOTAL[version - 1], ecTotal = EC[(version - 1) * 4 + li], dataTotal = total - ecTotal;
  const blocks = BLOCKS[(version - 1) * 4 + li];
  const g2 = total % blocks, g1 = blocks - g2;
  const d1 = Math.floor(dataTotal / blocks), d2 = d1 + 1;
  const ecCount = Math.floor(total / blocks) - d1;
  let off = 0; const dc = [], ecA = [];
  for (let b = 0; b < blocks; b++) { const sz = b < g1 ? d1 : d2; const blk = data.slice(off, off + sz); off += sz; dc.push(blk); ecA.push(rsEncode(blk, ecCount)); }
  const maxD = Math.max(...dc.map((d) => d.length)); const out = [];
  for (let i = 0; i < maxD; i++) for (let r = 0; r < blocks; r++) if (i < dc[r].length) out.push(dc[r][i]);
  for (let i = 0; i < ecCount; i++) for (let r = 0; r < blocks; r++) out.push(ecA[r][i]);
  return new Uint8Array(out);
}
function alignCoords(version) {
  if (version === 1) return [];
  const posCount = Math.floor(version / 7) + 2, size = 17 + 4 * version;
  const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
  const positions = [size - 7];
  for (let i = 1; i < posCount - 1; i++) positions[i] = positions[i - 1] - intervals;
  positions.push(6); const pos = positions.reverse(); const L = pos.length; const coords = [];
  for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) { if ((i === 0 && j === 0) || (i === 0 && j === L - 1) || (i === L - 1 && j === 0)) continue; coords.push([pos[i], pos[j]]); }
  return coords;
}
const maskAt = (p, r, c) => [ (r + c) % 2 === 0, r % 2 === 0, c % 3 === 0, (r + c) % 3 === 0, (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0, (r * c) % 2 + (r * c) % 3 === 0, ((r * c) % 2 + (r * c) % 3) % 2 === 0, ((r * c) % 3 + (r + c) % 2) % 2 === 0 ][p];

export function qrMatrix(text, ecLevel = 'M', forcedMask = null) {
  const li = LEVEL[ecLevel] ?? 1;
  const bytes = new TextEncoder().encode(String(text));
  const version = pickVersion(bytes.length, li);
  const size = 17 + 4 * version;
  const codewords = interleave(buildCodewords(bytes, version, li), version, li);
  const mod = Array.from({ length: size }, () => new Array(size).fill(0));
  const res = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (r, c, v) => { mod[r][c] = v ? 1 : 0; res[r][c] = true; };
  const finder = (r0, c0) => { for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) { const rr = r0 + r, cc = c0 + c; if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue; const ring = (r >= 0 && r <= 6 && (c === 0 || c === 6)) || (c >= 0 && c <= 6 && (r === 0 || r === 6)) || (r >= 2 && r <= 4 && c >= 2 && c <= 4); set(rr, cc, ring); } };
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
  for (let i = 8; i < size - 8; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  for (const [pr, pc] of alignCoords(version)) for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) set(pr + r, pc + c, Math.max(Math.abs(r), Math.abs(c)) !== 1);
  const reserveFormat = () => { for (let i = 0; i < 15; i++) { if (i < 6) set(i, 8, 0); else if (i < 8) set(i + 1, 8, 0); else set(size - 15 + i, 8, 0); if (i < 8) set(8, size - i - 1, 0); else if (i < 9) set(8, 15 - i, 0); else set(8, 15 - i - 1, 0); } set(size - 8, 8, 1); };
  reserveFormat();
  if (version >= 7) { const bits = bch18(version); for (let i = 0; i < 18; i++) { const r = Math.floor(i / 3), c = (i % 3) + size - 11, v = (bits >> i) & 1; set(r, c, v); set(c, r, v); } }
  let inc = -1, row = size - 1, bitIndex = 7, byteIndex = 0;
  for (let col = size - 1; col > 0; col -= 2) { if (col === 6) col--; for (;;) { for (let c = 0; c < 2; c++) { if (!res[row][col - c]) { let dark = 0; if (byteIndex < codewords.length) dark = (codewords[byteIndex] >> bitIndex) & 1; mod[row][col - c] = dark; bitIndex--; if (bitIndex === -1) { byteIndex++; bitIndex = 7; } } } row += inc; if (row < 0 || row >= size) { row -= inc; inc = -inc; break; } } }
  const setFormat = (p) => { const bits = bch15((LEVEL_BIT[ecLevel] << 3) | p); for (let i = 0; i < 15; i++) { const v = (bits >> i) & 1; if (i < 6) mod[i][8] = v; else if (i < 8) mod[i + 1][8] = v; else mod[size - 15 + i][8] = v; if (i < 8) mod[8][size - i - 1] = v; else if (i < 9) mod[8][15 - i] = v; else mod[8][15 - i - 1] = v; } mod[size - 8][8] = 1; };
  const applyMask = (p) => { for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!res[r][c] && maskAt(p, r, c)) mod[r][c] ^= 1; };
  const penN1 = () => { let pts = 0; for (let r = 0; r < size; r++) { let sc = 0, sr = 0, lc = null, lr = null; for (let c = 0; c < size; c++) { let m = mod[r][c]; if (m === lc) sc++; else { if (sc >= 5) pts += 3 + (sc - 5); lc = m; sc = 1; } m = mod[c][r]; if (m === lr) sr++; else { if (sr >= 5) pts += 3 + (sr - 5); lr = m; sr = 1; } } if (sc >= 5) pts += 3 + (sc - 5); if (sr >= 5) pts += 3 + (sr - 5); } return pts; };
  const penN2 = () => { let pts = 0; for (let r = 0; r < size - 1; r++) for (let c = 0; c < size - 1; c++) { const s = mod[r][c] + mod[r][c + 1] + mod[r + 1][c] + mod[r + 1][c + 1]; if (s === 4 || s === 0) pts++; } return pts * 3; };
  const penN3 = () => { let pts = 0; for (let r = 0; r < size; r++) { let bc = 0, br = 0; for (let c = 0; c < size; c++) { bc = ((bc << 1) & 0x7ff) | mod[r][c]; if (c >= 10 && (bc === 0x5d0 || bc === 0x05d)) pts++; br = ((br << 1) & 0x7ff) | mod[c][r]; if (c >= 10 && (br === 0x5d0 || br === 0x05d)) pts++; } } return pts * 40; };
  const penN4 = () => { let dark = 0; for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) dark += mod[r][c]; return Math.abs(Math.ceil((dark * 100 / (size * size)) / 5) - 10) * 10; };
  let best = 0, bestP = Infinity;
  if (forcedMask != null) { best = forcedMask; }
  else for (let p = 0; p < 8; p++) { setFormat(p); applyMask(p); const pen = penN1() + penN2() + penN3() + penN4(); applyMask(p); if (pen < bestP) { bestP = pen; best = p; } }
  setFormat(best); applyMask(best);
  return { size, version, mask: best, ecLevel, get: (r, c) => mod[r][c] };
}

export function qrSvg(text, ecLevel = 'M', { margin = 4, scale = 4, dark = '#000000', light = '#ffffff' } = {}) {
  const q = qrMatrix(text, ecLevel);
  const dim = (q.size + margin * 2) * scale;
  let path = '';
  for (let r = 0; r < q.size; r++) for (let c = 0; c < q.size; c++) if (q.get(r, c)) path += `M${(c + margin) * scale},${(r + margin) * scale}h${scale}v${scale}h-${scale}z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges"><rect width="${dim}" height="${dim}" fill="${light}"/><path d="${path}" fill="${dark}"/></svg>`;
}
