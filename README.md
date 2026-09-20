# TTB — Tiny Toolbox

> **590 tools. Lightweight architecture. Zero framework bloat.**

TTB (Tiny Toolbox) is a Manifest V3 Chrome extension designed to put a broad collection of small utilities in one fast, privacy-conscious interface instead of requiring a separate website or extension for every small task.

## Why TTB is useful

### 1. One toolbox instead of dozens of tabs
TTB brings everyday utilities into one extension: text processing, calculations, developer utilities, page tools, design helpers, data utilities, communication helpers, accessibility utilities, finance, SEO, networking, education, productivity, media and more.

### 2. Browse by category — not just search
The interface includes a dedicated **Browse by category** panel. Users can see the available categories and their tool counts immediately, select a category, and then search within that category.

This is important for discoverability: users do not need to know the name of a tool before they can find it.

### 3. Fast and lightweight architecture
TTB uses vanilla JavaScript and browser-native APIs instead of a large application framework. The catalog is separated from the execution engine so browsing does not unnecessarily depend on every tool implementation.

### 4. Local-first design
The project is designed around local execution and minimal network dependence. The core extension does not include a telemetry/analytics layer.

### 5. Privacy-conscious permissions
The extension avoids broad host permissions and uses Chrome permissions for specific browser capabilities. Review `manifest.json` and `PRIVACY.md` before deployment.

### 6. Large catalog with honest implementation status
The catalog contains **590 tools**. The current audited codebase contains **87 integrated handlers**. The remaining catalog entries are intentionally retained as catalog/fallback entries rather than being falsely presented as complete implementations.

### 7. Search plus browsing
Search remains useful when you know approximately what you need. It now works alongside category browsing rather than replacing it.

### 8. GitHub-ready project structure
The repository includes issue templates, a GitHub Actions validation workflow, contribution guidance, security guidance, privacy documentation, warnings, installation instructions, usage documentation, changelog and an MIT license.

## Category browser

The popup and side panel expose the catalog's **18 categories** directly. Each category displays its current tool count. Selecting a category filters the list; the search field then searches within that category. **All Tools** restores the complete catalog.

The catalog categories are:

- Accessibility
- Calculators & Converters
- Communication
- Data
- Design & Color
- Developer
- Education
- Finance
- Fun & Misc
- Media & Files
- Network
- Page Tools
- Productivity
- SEO
- Security
- System & Browser
- Text & Writing
- Unique

The exact catalog is authoritative in `data/tools.js`.

## Honest limitations / cons

TTB is intentionally not presented as a finished replacement for every specialist application. Important limitations are:

- **Not every catalog entry is fully implemented yet.** There are 590 catalogue entries but 87 audited integrated handlers.
- **Some tools are lightweight implementations.** A few entries provide guidance, generators or browser-native functionality rather than the depth of a dedicated specialist application.
- **Some browser tools require permissions or an appropriate page context.** Features involving tabs, scripting, bookmarks, history, downloads or page content can fail on restricted Chrome pages or where Chrome does not expose the requested API.
- **Heavy third-party tools are not automatically bundled.** Phase 7 tools that depend on large external libraries require those libraries to be supplied and reviewed for licensing, security and distribution requirements.
- **Chrome compatibility matters.** Chrome extension APIs can change. A release should be tested against the target Chrome version before production deployment.
- **The popup is space-constrained.** Category browsing improves discovery, but a 590-tool catalog still cannot display every tool simultaneously in a small popup.
- **Some advanced utilities are intentionally modest.** TTB favors a small local footprint over reproducing the complete feature set of large applications.
- **Privileged tools require care.** Browser-management tools necessarily have more powerful permissions than purely computational tools. Users should review the permissions and privacy documentation.

These limitations are documented deliberately rather than hidden.

## Installation

1. Download or clone the repository.
2. Open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the repository root containing `manifest.json`.
6. Open the TTB popup.
7. Use **Browse by category** or the search field to find a tool.

## Development

No framework installation is required. TTB uses browser-native JavaScript.

See:

- `INSTALL.md`
- `USAGE.md`
- `CONTRIBUTING.md`
- `SECURITY.md`

## Privacy and security

See `PRIVACY.md`, `SECURITY.md`, and `WARNINGS.md`.

## License

MIT — see `LICENSE`.

## Author

**Dr. Sohil Momin**
