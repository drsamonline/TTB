// TTB — cross-browser compatibility layer.
//
// One source tree runs on Chrome, Edge (and other Chromium browsers), Firefox
// and Safari. The differences that matter are:
//
//   1. The API namespace. Firefox exposes both `chrome` (callback style) and
//      `browser` (promise style). Shared code uses `await chrome.x.y()`, so we
//      point `chrome` at the promise-based namespace when `browser` exists.
//   2. Which APIs exist. Safari ships no history/bookmarks/downloads/management/
//      browsingData APIs at all; Firefox has no side panel. `CAPS` records what
//      is actually present so tools can say so plainly instead of throwing.
//
// `TARGET` is written per build into data/target.js.
import { TARGET as BUILD_TARGET } from '../data/target.js';

const g = globalThis;
const native = (g.browser && g.browser.runtime) ? g.browser : (g.chrome || null);
if (native && g.chrome !== native) { try { g.chrome = native; } catch { /* frozen namespace */ } }

export const api = native;
export const isFirefox = typeof g.browser !== 'undefined' && !!g.browser?.runtime;
export const isSafari = !isFirefox && typeof g.safari !== 'undefined' && !!g.safari?.extension;
// Detection wins where it is unambiguous; otherwise the build marker (which
// distinguishes Edge from Chrome) is used.
const detected = isFirefox ? 'firefox' : isSafari ? 'safari' : null;
export const TARGET = detected || BUILD_TARGET || 'chrome';

const A = native || {};
export const CAPS = {
  sidePanel: !!(A.sidePanel && A.sidePanel.open),
  openPopup: typeof A.action?.openPopup === 'function',
  scripting: !!(A.scripting && A.scripting.executeScript),
  captureVisibleTab: typeof A.tabs?.captureVisibleTab === 'function',
  discardTab: typeof A.tabs?.discard === 'function',
  tabGroups: typeof A.tabs?.group === 'function',
  alarms: !!A.alarms,
  cookies: !!A.cookies,
  history: !!A.history,
  bookmarks: !!A.bookmarks,
  downloads: !!A.downloads,
  management: !!A.management,
  browsingData: !!A.browsingData,
  fontSettings: !!A.fontSettings,
  contextMenus: !!A.contextMenus,
  permissions: !!A.permissions,
  barcodeDetector: typeof g.BarcodeDetector !== 'undefined',
  eyeDropper: typeof g.EyeDropper !== 'undefined',
  speech: typeof g.speechSynthesis !== 'undefined',
  speechRecognition: !!(g.SpeechRecognition || g.webkitSpeechRecognition),
  screenCapture: !!(g.navigator?.mediaDevices?.getDisplayMedia),
  camera: !!(g.navigator?.mediaDevices?.getUserMedia),
  compression: typeof g.CompressionStream !== 'undefined' && typeof g.DecompressionStream !== 'undefined',
};

export const has = (k) => !!CAPS[k];

/** A consistent, honest message for a feature this browser does not provide. */
export function unsupported(feature, detail = '') {
  return `${feature} is not available in the ${TARGET} build.${detail ? ' ' + detail : ''}`;
}

/** Save a data URL / blob URL. Uses the downloads API when present (Chrome,
 *  Edge, Firefox) and falls back to an <a download> click elsewhere (Safari). */
export function saveDataUrl(name, url) {
  try {
    if (A.downloads?.download) { A.downloads.download({ url, filename: name, saveAs: false }); return true; }
  } catch { /* fall through */ }
  try {
    const a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    return true;
  } catch { return false; }
}
