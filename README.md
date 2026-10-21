# TTB — Tiny Toolbox

> **590 tools. One popup. No framework, no telemetry, no remote code.**

TTB (Tiny Toolbox) is a Manifest V3 Chrome extension that gathers a large collection of small utilities — text, calculations, developer helpers, page tools, data, design, finance, media, security, accessibility and more — into one fast, offline-first interface, instead of a separate tab or extension for every small task.

## What's in it

- **590 cataloged tools across 18 categories**, all reachable from the popup or the side panel.
- **A real category browser** — pick a category, see its count, then search within it. You don't need to know a tool's name to find it.
- **Per-tool inputs.** Multi-field tools (EMI, tax, tip, regex, colour, matrix, image jobs…) render the fields they actually need — encode/decode switches, extra values, and file pickers for media tools.
- **Text, HTML and image output.** Rich results (markdown previews, colour palettes, CSS generators, charts, even small games) render in a sandboxed preview; images render inline with a download link.
- **Destructive actions are gated.** History/cookie/cache cleaners, duplicate-tab closing and auto-close are dry-run by default and only act after you tick an explicit confirmation.

## How it is built

```
popup.html / sidebar.html
  ├─ data/tools.js        → globalThis.TTB_CATALOG  (590 entries)
  └─ ui/app.js            → renders the catalog, builds inputs, runs tools
       └─ (on first Run) tools/core.js  → dispatcher
            ├─ text · calc · dev · page · system · security   (core handlers)
            ├─ phase4–7 + t-*.js                              (bundled modules)
            └─ ui/registry.js                                 (name → handler, inputs)
background.js             → context menu + keyboard commands only
lazy/loader.js            → optional third-party loader (nothing is downloaded)
```

The catalog is separated from execution, so the tool list renders even if a handler or a privileged API fails. Tool execution is imported on demand. There is **no network layer** in the extension: nothing is fetched, phoned home, or loaded remotely.

## Honest limitations

- **Optional third-party libraries are not bundled.** 24 tools (PDF merge/split/rotate, PDF→text, OCR, Excel viewer, Prettier, OpenPGP, QR scanning helpers, axe-core, zxcvbn…) report their required local dependency instead of pretending to run. No remote code is fetched.
- **Some tools are intentionally lightweight.** A few provide guidance, generators or browser-native behaviour rather than the depth of a specialist app.
- **Browser tools need the right context.** Tab, history, cookie, bookmark, download and page tools can fail on restricted pages (e.g. `chrome://`) or where Chrome does not expose the API.
- **A few capabilities are limited by Chrome itself.** A per-tab user-agent override, a global notification blocker, WebRTC leak testing and IP lookup cannot be done from an MV3 extension without extra permissions or a network request; those tools say so plainly.
- **Recording tools are interactive.** Screen/audio/webcam capture need a permission prompt and keep the popup open for the duration.

These limitations are documented deliberately rather than hidden.

## Install

1. Download or clone the repository.
2. Open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the folder containing `manifest.json`.
5. Pin TTB, then open the popup. Use **Browse by category** or the search box.

Requires **Chrome 127+** (the extension uses `chrome.action.openPopup`). See `INSTALL.md`.

## Development

No build step and no framework. Vanilla JavaScript and browser APIs.

- `npm test` — runs the smoke test (catalog integrity, dispatcher coverage, registry metadata).
- CI (`.github/workflows/validate.yml`) syntax-checks every module and runs the smoke test on push.

See `INSTALL.md`, `USAGE.md`, `CONTRIBUTING.md`, `SECURITY.md`, `WARNINGS.md` and `AUDIT.md`.

## Privacy and security

Local-first: no analytics, no telemetry, no remote code. Privileged tools use the Chrome permissions declared in `manifest.json`. Read `PRIVACY.md` and `SECURITY.md` before deployment, and `WARNINGS.md` for the caveats that matter.

## License

MIT — see `LICENSE`.

## Author

**Dr. Sohil Momin**
