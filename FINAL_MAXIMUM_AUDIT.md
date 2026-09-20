# TTB v0.8.0 — Maximum Fix / Deduplication / Dead-Code / Optimization Audit

## Final scope

Every file in the release root was inspected after the startup-path refactor. The build was syntax-checked, the catalog and registry were exercised under Node, stale references were searched, permissions were reviewed against source usage, and the UI startup path was simulated with a DOM harness.

## File inventory

**33 release files**:

- 8 documentation/legal files
- 1 manifest
- 1 background service worker
- 1 catalog data file
- 3 icons
- 2 lazy modules
- 2 HTML pages
- 1 test harness
- 9 tool modules
- 2 UI modules
- 1 stylesheet

## Results

| Check | Result |
|---|---|
| Catalog entries | **590** |
| Unique IDs | **590/590** |
| Duplicate IDs | **0** |
| Duplicate catalog names | **0** |
| Integrated handlers | **87** |
| Lazy definitions | **24** |
| JavaScript syntax | **PASS** |
| Registry load | **PASS** |
| Tool lookup simulation | **PASS** |
| UI initial-render simulation | **PASS — status reports 40 tools shown** |
| Stale deleted UI references | **0** |
| Inline startup scripts | **0** |
| Duplicate catalog JSON | **REMOVED** |
| Duplicate dependency JSON | **REMOVED** |
| Unused `sessions` permission | **REMOVED** |
| Release ZIP integrity | **PASS** |
| ALL FILES ZIP integrity | **PASS** |

## Structural fix for the empty-tool-list failure

The old startup path depended on an ES-module bootstrap chain:

`popup.html → bootstrap.js → shell.js → registry/search/render`

The optimized build deliberately removes that fragile display dependency.

The new startup path is:

`popup.html → data/tools.js → ui/app.js`

Both are external classic scripts. `data/tools.js` creates the single catalog source as `globalThis.TTB_CATALOG`. `ui/app.js` renders the catalog immediately. Tool execution is dynamically imported only after the user presses **Run**.

This means a failure in `tools/core.js`, a privileged Chrome API, or a lazy third-party dependency can no longer prevent the catalog itself from being displayed.

## Deduplication performed

Removed:

- `data/tools.json` — duplicate catalog source.
- `lazy/dependencies.json` — duplicate dependency metadata.
- `ui/bootstrap.js` — obsolete startup wrapper.
- `ui/shell.js` — replaced by `ui/app.js`.
- `ui/search.js` — merged into `ui/app.js`.
- `ui/render.js` — merged into `ui/app.js`.
- `ui/toast.js` — unused after the startup refactor.
- `categoryOf` unused declaration in `tools/core.js`.
- duplicate fallback implementations already supplied by Phase 6.
- unused `sessions` permission.

## Optimization performed

- Initial catalog rendering no longer imports the complete tool execution graph.
- DOM rendering uses `DocumentFragment`.
- Tool names/categories use `textContent` rather than generated HTML.
- Search logic is local and bounded to 40 displayed results.
- Execution module is loaded on demand.
- Catalog has one authoritative source.
- Dependency metadata has one authoritative source.
- Release contains no remote-code loader.

## Remaining limitations

The Phase 7 third-party vendor libraries are not bundled. Lazy definitions therefore report their dependency as unavailable rather than downloading code remotely.

Actual Chrome extension GUI testing remains environment-dependent. The build contains no claim that a real Chrome popup was interactively clicked and inspected inside this environment. The static/module/UI simulations do not replace that final manual test.
