// TTB — Tiny Toolbox · background (service worker on Chrome/Edge/Safari,
// event page on Firefox). Kept deliberately small: it wires up the context menu
// and keyboard commands only. No remote code, no network, no message surface.
//
// The namespace alias below is inlined (rather than imported) so this file can
// run as a classic background script on Firefox, which has no MV3 service worker.
const g = globalThis;
const A = (g.browser && g.browser.runtime) ? g.browser : g.chrome;
if (A && g.chrome !== A) { try { g.chrome = A; } catch {} }

const canOpenPopup = typeof A.action?.openPopup === 'function';
const hasSidePanel = !!(A.sidePanel && A.sidePanel.open);
const hasSidebar = !!(A.sidebarAction && A.sidebarAction.open);

A.runtime.onInstalled.addListener(async () => {
  try {
    await A.contextMenus.removeAll();
    A.contextMenus.create({ id: 'ttb-open', title: 'Open TTB', contexts: ['page', 'selection'] });
  } catch {}
  try { if (A.sidePanel?.setPanelBehavior) await A.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }); } catch {}
});

A.contextMenus.onClicked.addListener(async () => {
  try { if (canOpenPopup) await A.action.openPopup(); } catch {}
});

async function openSidebar() {
  try {
    if (hasSidePanel) { const win = await A.windows.getCurrent(); await A.sidePanel.open({ windowId: win.id }); return true; }
    if (hasSidebar) { await A.sidebarAction.open(); return true; }   // Firefox
  } catch {}
  return false;
}

A.commands.onCommand.addListener(async (command) => {
  try {
    if (command === 'open-popup') { if (canOpenPopup) await A.action.openPopup(); }
    else if (command === 'focus-search') { await openSidebar(); }
  } catch {}
});
