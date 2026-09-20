# Changelog

## 0.8.0 — Final cleanup/rebuild

- Reworked popup/sidebar startup to use external classic scripts.
- Separated catalog rendering from tool execution.
- Removed duplicate JSON catalog source.
- Removed duplicate lazy dependency JSON source.
- Removed obsolete UI bootstrap/shell/search/render/toast modules.
- Removed unused dispatcher declaration and duplicate fallback handlers.
- Removed unused `sessions` permission.
- Preserved the 590-entry catalog.
- Preserved explicit distinction between implemented and catalog-only tools.
- Added visible startup failure behavior through the page itself rather than a hidden bootstrap dependency.
- Kept lazy third-party dependencies local-only; no remote download fallback.
