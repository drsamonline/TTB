chrome.runtime.onInstalled.addListener(async()=>{
 try{await chrome.contextMenus.removeAll();await chrome.contextMenus.create({id:'ttb-open',title:'Open TTB',contexts:['page','selection']});}catch{}
 try{await chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:false});}catch{}
});
chrome.contextMenus.onClicked.addListener(()=>chrome.action.openPopup().catch(()=>{}));
chrome.commands.onCommand.addListener(async command=>{
 if(command==='open-popup')await chrome.action.openPopup().catch(()=>{});
 if(command==='focus-search')await chrome.sidePanel.open({windowId:(await chrome.windows.getCurrent()).id}).catch(()=>{});
});
chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
 if(msg?.type==='open-sidepanel')chrome.sidePanel.open({windowId:sender.tab?.windowId}).then(()=>sendResponse({ok:true})).catch(e=>sendResponse({ok:false,error:e.message}));
 return true;
});
