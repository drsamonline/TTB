# Privacy

TTB is designed for local, offline use.

- **No analytics, no telemetry, no tracking.** There is no remote logging and no usage reporting of any kind.
- **No remote code.** Nothing is downloaded or executed from the network. Optional third-party libraries are loaded only from a local path inside the extension and are not bundled in this release.
- **Where data is stored.** Settings, saved tab sessions, the clipboard queue, tasks, notes and similar features are stored in `chrome.storage.local` on your machine. Encrypted notes are stored encrypted with a key derived from your password.
- **When privileged APIs are used.** Some tools read or change browser state (tabs, history, cookies, bookmarks, downloads, fonts). They use the permissions declared in `manifest.json` and act only when you run them.
- **Network tools.** A small number of tools (URL expander, redirect viewer, CORS tester, HTTP header viewer, WebSocket/SSE inspectors) make a request *only when you run them*, and say so when Chrome blocks the request.

Review `manifest.json` to see exactly which permissions the extension requests, and `WARNINGS.md` for the caveats that matter.
