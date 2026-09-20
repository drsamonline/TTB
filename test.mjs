await import('./data/tools.js');
const {tools}=await import('./ui/registry.js');
if(tools.length!==590)throw new Error(`Expected 590 tools, got ${tools.length}`);
console.log('OK',tools.length);
