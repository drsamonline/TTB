# Browser support

TTB ships from one source tree and is assembled per browser with `npm run build`.
Every build carries the full 591-tool catalog; tools that need an API a browser
does not provide are disabled and say so plainly rather than failing silently.

| Capability | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| Tool catalog, search and category browser | ✅ yes | ✅ yes | ✅ yes | ✅ yes |
| Per-tool inputs, HTML preview, image output | ✅ yes | ✅ yes | ✅ yes | ✅ yes |
| Text, calculator, developer, data and design tools | ✅ yes | ✅ yes | ✅ yes | ✅ yes |
| Page tools (extract, read, restyle, restore) | ✅ yes | ✅ yes | ✅ yes | ✅ yes |
| Tab tools (search, pin, mute, reload, close duplicates) | ✅ yes | ✅ yes | ✅ yes | ✅ yes |
| Real crypto (TOTP/HOTP, AES-GCM, PBKDF2, hashing) | ✅ yes | ✅ yes | ✅ yes | ✅ yes |
| Side panel / sidebar | ✅ yes | ✅ yes | ◐ sidebar_action | — no |
| Browsing history tools | ✅ yes | ✅ yes | ✅ yes | — no |
| Bookmark tools | ✅ yes | ✅ yes | ✅ yes | — no |
| Cookie tools | ✅ yes | ✅ yes | ✅ yes | ◐ partial |
| Downloads manager | ✅ yes | ✅ yes | ✅ yes | — no |
| Cache / cookie / history clearing | ✅ yes | ✅ yes | ✅ yes | — no |
| Extension manager | ✅ yes | ✅ yes | ✅ yes | — no |
| Installed fonts viewer | ✅ yes | ✅ yes | ✅ yes | — no |
| Tab capture / screenshots | ✅ yes | ✅ yes | ✅ yes | ◐ verify |
| File downloads from tools | ✅ yes | ✅ yes | ✅ yes | ◐ fallback |
| QR / barcode scanning | ✅ yes | ✅ yes | — no | — no |
| Screen colour picker | ✅ yes | ✅ yes | — no | — no |
| Text-to-speech / speech recognition | ✅ yes | ✅ yes | ◐ partial | ◐ partial |
| Screen / audio / webcam recording | ✅ yes | ✅ yes | ✅ yes | ◐ verify |

**Legend** — ✅ works · — the API is absent on that browser · ◐ reduced, see below.

## What each build changes

| | Chrome / Edge | Firefox | Safari |
|---|---|---|---|
| Background | MV3 service worker | MV3 event page (`background.scripts`) | MV3 service worker |
| Side panel | `side_panel` | `sidebar_action` | none |
| Manifest notes | — | `browser_specific_settings.gecko.id` | no privileged browser APIs |

## Known gaps, in detail

- **Firefox** has no `background.service_worker`, so the build uses an event page. It has no side panel; the sidebar is opened through `sidebar_action`. `BarcodeDetector` and `EyeDropper` are not implemented, so QR/barcode scanning and the screen colour picker report that.
- **Safari** exposes no history, bookmarks, downloads, management, browsingData or fontSettings APIs at all, so those tools are disabled. `storage.sync` does not sync (it behaves like `local`), so TTB uses `local` everywhere. Safari also needs an Xcode conversion step — see the build README. Cookie access and tab capture should be verified on your Safari version.
- **Chromium browsers** (Chrome, Edge, Brave, Opera, Vivaldi, Arc) run the same package with no changes; the Edge build is produced only so the artifact is labelled.
- **Downloads** fall back to an `<a download>` click when the downloads API is unavailable, so image and file tools still save their output on Safari.
- **Recording** tools need a permission prompt on every browser and keep the popup open while they run.
