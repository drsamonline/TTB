# Installation

TTB ships from one source tree and is assembled per browser. Run `npm run build`
to produce `dist/chrome`, `dist/edge`, `dist/firefox` and `dist/safari`, or grab the
ZIPs from the Artifacts section of the latest **Validate** workflow run.

---

## Chrome, Edge, Brave, Opera, Vivaldi, Arc (Chromium)

These browsers all load the same package.

1. Open `chrome://extensions` (or `edge://extensions`, `brave://extensions`, …).
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the folder containing `manifest.json` — the repository root, or `dist/chrome`.
5. Pin TTB from the Extensions menu, then click the icon (or press `Alt+Shift+T`).
   `Alt+Shift+K` opens the side panel.

## Firefox

Firefox has no MV3 service worker, so the Firefox build uses an event page, and it
uses `sidebar_action` in place of the side panel.

1. Run `npm run build:firefox` (or unzip `ttb-firefox.zip`).
2. Open `about:debugging#/runtime/this-firefox`.
3. Choose **Load Temporary Add-on…** and pick `dist/firefox/manifest.json`.
4. The add-on stays until you restart Firefox.

For a permanent install, ZIP the `dist/firefox` folder and submit it on
[addons.mozilla.org](https://addons.mozilla.org/developers/). Temporary loading
does not require signing.

## Safari

Safari cannot load an unpacked folder; it needs an Xcode conversion step and a
signed build. This must be done on macOS with Xcode installed.

1. Run `npm run build:safari`.
2. Convert the package:

   ```
   xcrun safari-web-extension-converter /path/to/dist/safari \
     --project-location ./TTB-safari \
     --app-name "TTB Tiny Toolbox" \
     --bundle-identifier com.drsamonline.ttb
   ```

3. Open the generated Xcode project, set your signing team, and run it.
4. In Safari: **Settings → Extensions**, enable TTB, and grant it access to the
   sites you want the page tools to work on.

Safari exposes no history, bookmarks, downloads, management, browsingData or
fontSettings APIs, so those tools are disabled there and report that. See
`BROWSER_SUPPORT.md`.

---

## Requirements

| Browser | Minimum |
|---|---|
| Chrome | 127 (the extension uses `chrome.action.openPopup`) |
| Edge | 127 |
| Firefox | 121 (MV3 event pages; `sidebar_action`) |
| Safari | 16.4 (Manifest V3) |

## Notes

- No build step is required to *load* the extension — the repository root is a
  working Chromium extension. `build.mjs` only picks the right manifest per browser.
- If an older TTB build is installed, remove it first so a stale directory is not loaded.
- Some tools need the current tab to be a normal web page; restricted pages
  (`chrome://`, the Web Store, other extensions' pages) cannot be scripted by any browser.
