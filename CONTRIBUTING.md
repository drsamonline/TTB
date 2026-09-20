# Contributing

## Principles

- Preserve Manifest V3 compatibility.
- Avoid unnecessary permissions.
- Keep tools small and focused.
- Avoid framework dependencies unless explicitly justified.
- Do not mark a catalog entry as implemented without an executable handler.
- Preserve accessibility and keyboard operation.

## Before a pull request

Check:

- JavaScript syntax
- duplicate tool IDs
- broken imports/paths
- manifest permissions
- popup/sidebar startup
- tool lookup
- representative tool execution
- accessibility regressions

Describe what changed, why, tests performed, permissions changed, and known limitations.
