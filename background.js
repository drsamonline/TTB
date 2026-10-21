// TTB — Tiny Toolbox · service worker
// Kept deliberately small: it only wires up the context menu and keyboard
// commands. No remote code, no network, no message surface.
const canOpenPopup = typeof chrome.action?.openPopup === 'function';

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await chrome.contextMenus.removeAll();
    chrome.contextMenus.create({ id: 'ttb-open', title: 'Open TTB', contexts: ['page', 'selection'] });
  } catch {}
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  } catch {}
});

chrome.contextMenus.onClicked.addListener(async () => {
  try { if (canOpenPopup) await chrome.action.openPopup(); } catch {}
});

chrome.commands.onCommand.addListener(async (command) => {
  try {
    if (command === 'open-popup') {
      if (canOpenPopup) await chrome.action.openPopup();
    } else if (command === 'focus-search') {
      const win = await chrome.windows.getCurrent();
      await chrome.sidePanel.open({ windowId: win.id });
    }
  } catch {}
});
