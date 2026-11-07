# TTB v0.11.0 — Audit & coverage report

This report describes the state of the repository at v0.11.0. The headline change is
a **functional audit**: every tool is executed with realistic input and graded on its
actual output, rather than counted as "resolved". The full per-tool evidence lives in
`TOOL_AUDIT.md` and `tool-audit.json` (regenerate with `npm run audit`).

## Coverage

| Measure | Value |
|---|---|
| Catalog entries | **563** |
| Unique ids / names | **563 / 563** |
| Duplicate ids or names | **0** |
| Categories | **18** |
| Entries that resolve to a handler | **563 / 563** |
| Tools with dedicated input fields | **225** |
| Destructive tools gated by confirmation | **5** |
| Tools that crash on realistic input | **0** |
| JavaScript syntax | **PASS** (every module) |
| Smoke test | **PASS** |

## Functional audit

Each tool was run with realistic input and graded:

| Verdict | Count | Meaning |
|---|---:|---|
| Computed output | 271 | real work, changes with input |
| Works, short output | 64 | real but terse |
| Fixed reference | 97 | same output each run (Big-O, alphabet, unit circle…) |
| Validates input | 28 | correctly rejects bad input with a message |
| Needs a browser API | 31 | `Image`/`document`/`navigator` — fine in the browser |
| Needs a live tab | 64 | page and privileged tools |
| Unavailable here | 5 | speech, BarcodeDetector, EyeDropper — degrade honestly |

## Removed in this pass

29 entries could never produce a result in a browser and were deleted rather than
shipped as dead weight:

- **22 require an unbundled third-party library:** Prettier, accessibility auditor
  (both variants), Image→PDF, Images→PDF, PDF merge/split/rotate/reorder, PDF page
  numbers, PDF watermark, PDF crop, PDF form filler, PDF signature, PDF metadata
  viewer/cleaner, PDF→images, PDF→text, OCR, Excel viewer, screenshot→markdown,
  OpenPGP viewer.
- **7 no extension can implement:** notification blocker, popup blocker,
  canvas-fingerprint blocker, WebRTC IP leak test, IP address viewer,
  file metadata stripper, frames→GIF.

`tools/phase7.js` and the entire `lazy/` loader were removed with them — they existed
only to report a missing dependency. Two entries that looked dead were recovered
instead: **Password strength meter** (real entropy) and **vCard QR code** (now uses
the bundled QR encoder).

## Fixed in this pass

- A handler that returned nothing was reported as "not implemented" — page and
  storage tools that legitimately produced no output fell through to the catalog
  fallback.
- `Contrast checker` was silently shadowed by a broken duplicate in `phase6.js`; the
  registry now refuses to replace a working implementation with one that declares
  fewer inputs.
- `Matrix` crashed on a dimension mismatch; it now validates shape and explains it.
- Colour contrast ignored its second-colour field; Profit margin / Markup returned
  `NaN%` instead of asking for the missing value; Factorial returned `null` for
  non-integers; Command palette returned an empty string when nothing matched.

## Browser builds

Four packages are assembled from the one source tree by `npm run build`:
`dist/chrome`, `dist/edge`, `dist/firefox`, `dist/safari`. Each is smoke-tested in CI
(563/563 catalog entries resolve in every target) before the ZIPs are uploaded as
artifacts. Feature parity and per-browser gaps live in `BROWSER_SUPPORT.md`.

## Known limitations

- Optional third-party libraries are **not bundled** — the tools that needed them are
  no longer in the catalog.
- A per-tab user-agent override, a global notification blocker, WebRTC leak testing
  and public IP lookup are **not possible** from an MV3 extension without extra
  permissions or a network request; those tools were removed.
- Network-dependent tools (URL expander, redirect viewer, CORS tester, header viewer,
  WebSocket/SSE inspectors) make a request only when run and degrade gracefully when
  Chrome blocks it.
- Interactive tools (screen/audio/webcam recording) require a permission prompt and
  keep the popup open.

## Not claimed

This repository contains **no** claim that a real Chrome popup was clicked through in
every browser version. The static checks, the dispatcher sweep, the functional audit
and the smoke test are thorough but do not replace a manual GUI pass on the target
Chrome build.
