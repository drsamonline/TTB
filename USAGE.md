# Usage

1. Open TTB from the toolbar, or press `Alt+Shift+T`.
2. Browse by category on the left, or type in the search box (`Ctrl+K` focuses it).
3. Select a tool. The panel shows the fields that tool needs — a main input box, plus any extra values, switches or file pickers.
4. Press **Run** (or `Ctrl+Enter`).
5. Copy the result, or download it for image/file tools.

## Output types

- **Text** results appear in a read-only box you can copy.
- **HTML** results (markdown previews, colour palettes, CSS generators, charts, small games) render in a sandboxed preview.
- **Image** results render inline with a **Download** link.

## Destructive tools

Tools that change browser state — **History cleaner**, **Cookie cleaner**, **Cache cleaner**, **Duplicate tab closer**, **Auto-close tabs** — do nothing on the first run. They report exactly what they would change and ask you to tick **“I understand — confirm this destructive action”**. Only then does a second **Run** act.

## Lazy tools

Tools that depend on an optional third-party library (PDF, OCR, Excel, Prettier, OpenPGP, …) report the missing dependency and the exact path where it would live. TTB never downloads code.
