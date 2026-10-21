# Installation

1. Extract the release ZIP (or clone the repository).
2. Open `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked**.
5. Select the extracted folder that contains `manifest.json`.
6. Pin TTB from the Extensions menu if you like.
7. Click the TTB icon, or press `Alt+Shift+T`, to open it. `Alt+Shift+K` opens the side panel.

## Requirements

- **Chrome 127 or newer.** The extension calls `chrome.action.openPopup()`, which is only available to normal extensions from Chrome 127.

## Notes

- If an older TTB build is installed, remove it first so a stale directory is not loaded.
- No build step is required — the repository root *is* the extension.
- Some tools need the current tab to be a normal web page; restricted pages (`chrome://`, the Chrome Web Store, other extensions' pages) cannot be scripted by Chrome.
