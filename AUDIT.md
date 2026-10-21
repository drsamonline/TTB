# TTB v0.10.0 — Audit & coverage report

This report describes the state of the repository at v0.10.0 (the implementation pass, README badges and screenshots, and the cross-browser builds). Every number below is produced by the shipped smoke test (`node test.mjs`) and the registry, not by hand.

## Coverage

| Measure | Value |
|---|---|
| Catalog entries | **590** |
| Unique ids / names | **590 / 590** |
| Duplicate ids or names | **0** |
| Categories | **18** |
| Entries that resolve to a handler | **590 / 590** |
| Tools with custom input fields | **220** |
| Lazy / optional-dependency stubs | **24** |
| Destructive tools gated by confirmation | **5** |
| JavaScript syntax | **PASS** (every module) |
| Smoke test | **PASS** |

The 24 lazy stubs are the tools that genuinely need a third-party library (PDF merge/split/rotate/crop/watermark, PDF→text, PDF→images, OCR, Excel viewer, screenshot→markdown, Prettier, OpenPGP viewer, QR helper, axe-core auditor, zxcvbn). They report the exact package, version and expected local path instead of pretending to work, and **no remote code is fetched**.

## What changed from v0.8.0

- Coverage went from ~190 to **590** entries with handlers.
- The UI gained **per-tool inputs**, so multi-field and encode/decode tools are usable, plus HTML and image output.
- Destructive browser operations are **dry-run until confirmed**.
- Correctness fixes: the password generator (modulo bug), the IBAN validator and .gitignore generator (name-literal bugs), the font-size controller (dead message), the duplicate-tab closer (missing `tabs` permission), and the `minimum_chrome_version` mismatch.
- Real cryptography: TOTP/HOTP, AES-GCM + PBKDF2, encrypted notes, hash verification.
- A self-contained QR encoder, verified against a reference implementation across versions, ECC levels and mask patterns.

## Verification performed

- **Static:** every `.js` module syntax-checked as ES modules; `manifest.json` parsed.
- **Dynamic:** each of the 590 catalog names executed through the real dispatcher under a Chrome mock; none fall through to the "no handler" message.
- **Unit-style assertions:** Roman numerals, base conversion, slug generation and Luhn validation checked for known-correct output; destructive flags, HTML/image output types and handler registration asserted.
- **QR encoder:** output matrices compared cell-for-cell against a reference encoder for multiple inputs, all four ECC levels and all eight mask patterns.

## Browser builds

Four packages are assembled from the one source tree by `npm run build`:
`dist/chrome`, `dist/edge`, `dist/firefox`, `dist/safari`. Each is smoke-tested in CI
(590/590 catalog entries resolve in every target) before the ZIPs are uploaded as
artifacts. The feature-parity matrix and per-browser gaps live in
`BROWSER_SUPPORT.md`; the differences that matter are a namespace/capability layer
(`tools/compat.js`) and a per-browser manifest (`browsers/*.json`).

## Known limitations

- Optional third-party libraries are **not bundled** (by design).
- A per-tab user-agent override, a global notification blocker, WebRTC leak testing and public IP lookup are **not possible** from an MV3 extension without extra permissions or a network request; those tools explain this.
- Network-dependent tools (URL expander, redirect viewer, CORS tester, header viewer, WebSocket/SSE inspectors) make a request only when run and degrade gracefully when Chrome blocks it.
- Interactive tools (screen/audio/webcam recording) require a permission prompt and keep the popup open.

## Not claimed

This repository contains **no** claim that a real Chrome popup was interactively clicked through in every browser version. The static checks, the dispatcher sweep and the smoke test are thorough but do not replace a manual GUI pass on the target Chrome build.
