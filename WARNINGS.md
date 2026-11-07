# Warnings

- **Destructive browser tools act for real once confirmed.** History, cookie and cache cleaners and tab-closing tools are irreversible. They are dry-run until you tick the confirmation box.
- **Page tools modify the page you are viewing.** Reading mode, element hider, cookie-banner dismissers and form autofill change the live DOM. Reading mode and visual filters can be undone with **Restore page** / **Reset page styles**; other changes are lost on reload.
- **Every tool in the catalog was executed and graded.** Tools that could not work (they needed an unbundled library, or the browser has no such API) were removed rather than shipped as placeholders. See `TOOL_AUDIT.md`.
- **Browser permissions are required for browser-state tools.** Review `manifest.json` and `PRIVACY.md`.
- **Restricted pages cannot be scripted.** `chrome://` pages, the Web Store and other extensions' pages will fail page tools.
- **Chrome compatibility matters.** The extension targets Chrome 127+. Test on your target Chrome version before a production roll-out.
- **Recording and capture tools need a permission prompt** and keep the popup open while they run.
