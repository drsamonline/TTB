# Contributing

Thanks for helping improve TTB.

## Ground rules

- No frameworks and no build step — vanilla JavaScript and browser APIs only.
- No remote code. Nothing may be fetched or evaluated from the network.
- Every catalog entry must resolve to a handler or honestly report why it cannot.
- New destructive behaviour must be dry-run until the user confirms.

## Adding a tool

1. Add the catalog entry to `data/tools.js` (keep the 591-entry shape: `{id, name, category}`).
2. Add a handler in the matching `tools/t-*.js` module, keyed by the **lower-cased catalog name**:

   ```js
   'my tool': {
     name: 'My tool',
     cat: 'text',
     inputs: [{ key: 'b', label: 'Extra value', type: 'number', value: '1' }],
     run: (text, ctx) => String(text).toUpperCase(),
   }
   ```

3. If the tool needs extra fields, declare them in `inputs` (types: `text`, `number`, `textarea`, `select`, `file`, `checkbox`). Use `output: 'html'` or `output: 'image'` for rich results.
4. Run `npm test` — it checks that every catalog entry resolves and that the registry metadata is sane.

## Style

Keep modules small and focused, prefer `const`, avoid clever one-liners where a reader would have to squint, and comment anything a newcomer would not immediately understand.
