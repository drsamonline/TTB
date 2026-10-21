# Changelog

## 0.9.0 — Full implementation, hardening and documentation pass

### Implemented
- **Every catalog entry now resolves to a handler** (590/590, up from ~190). New modules cover text, calculators, developer, data, design, media, system, security, productivity, finance, education, communication, SEO, network, accessibility and fun tools.
- **Per-tool input schema.** `ui/app.js` now renders the fields each tool needs — extra values (`a`/`b`/`c`/`d`), select switches (encode/decode, units, methods), file pickers, and a destructive-action confirmation tick. Encode/decode and multi-field tools that previously could not receive their arguments now work.
- **Rich output.** Tools may declare `output: 'html'` (rendered in a sandboxed preview) or `output: 'image'` (rendered inline with a download link).
- **Self-contained QR encoder** (`tools/qr.js`) — byte mode, ECC L/M/Q/H, versions 1–40, verified against a reference implementation.
- **Real cryptography** — TOTP (RFC 6238), HOTP (RFC 4226), AES-GCM with PBKDF2 key derivation, encrypted secure notes, working hash verifier.

### Fixed
- **Password generator** used `% 72` on a 65-character alphabet, injecting the literal text `undefined`; it now uses `crypto.getRandomValues` with rejection sampling. PIN generation no longer uses `Math.random`.
- **IBAN validator** and **.gitignore generator** had name literals that never matched the catalog and silently did nothing.
- **`minimum_chrome_version`** raised to 127 to match `chrome.action.openPopup()`; the `tabs` permission added so tab tools actually read URLs.
- **`font size controller`** sent a message no listener received; it now injects a style directly.
- **Duplicate-tab closer** could not see tab URLs and always found nothing.
- Removed a dead service-worker message listener and an unreachable `runText` branch.
- **Destructive tools** (history/cookie/cache cleaners, duplicate-tab closer, auto-close tabs) are now dry-run until confirmed.

### Changed
- **Reversible page editing** — reading mode snapshots the page first and a new **Restore page** tool (plus **Reset page styles**) undoes visual changes.
- `package.json` added (`type: module`) so every `.js` file is unambiguous ESM.
- CI now runs the smoke test, not just syntax checks.
- Documentation rewritten: `README.md`, `ALL_TOOLS.md` (regenerated), `AUDIT.md`, `PROJECT_METADATA.json`, `CATEGORY_DISCOVERY_FINAL_AUDIT.json`.

## 0.8.0 — Final cleanup/rebuild
- Reworked popup/sidebar startup to use external classic scripts.
- Separated catalog rendering from tool execution.
- Removed duplicate JSON catalog and dependency sources; removed obsolete UI modules.
- Removed the unused `sessions` permission.
- Preserved the 590-entry catalog and the distinction between implemented and catalog-only tools.
- Kept lazy third-party dependencies local-only; no remote download fallback.
