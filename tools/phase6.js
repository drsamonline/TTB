/* TTB Phase 6 — Education + Communication + Accessibility + Fun */
export const TTB_PHASE6_TOOLS = (() => {
"use strict";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nums=s=>String(s??"").split(/[\s,;]+/).map(Number).filter(Number.isFinite);
const tools={
 "periodic-table":{name:"Periodic table",cat:"education",run(i){
   const e={H:["Hydrogen",1],He:["Helium",2],Li:["Lithium",3],C:["Carbon",6],N:["Nitrogen",7],O:["Oxygen",8],Na:["Sodium",11],Mg:["Magnesium",12],Al:["Aluminium",13],Si:["Silicon",14],Cl:["Chlorine",17],K:["Potassium",19],Ca:["Calcium",20],Fe:["Iron",26],Cu:["Copper",29],Zn:["Zinc",30],Ag:["Silver",47],I:["Iodine",53],Au:["Gold",79],Hg:["Mercury",80],Pb:["Lead",82]};
   const k=String(i||"H").trim(); return e[k]?JSON.stringify({symbol:k,name:e[k][0],atomicNumber:e[k][1]},null,2):"Element not in compact reference.";
 }},
 "multiplication-table":{name:"Multiplication table",cat:"education",run(i){const n=Number(i||"7");return Array.from({length:12},(_,x)=>`${n} × ${x+1} = ${n*(x+1)}`).join("\n")}},
 "typing-speed":{name:"Typing speed test",cat:"education",run(i){const s=String(i||"The quick brown fox jumps over the lazy dog"),words=s.trim().split(/\s+/).length;return JSON.stringify({words,characters:s.length,oneMinuteWPM:words},null,2)}},
 "keyboard-shortcuts":{name:"Keyboard shortcuts",cat:"education",run(){return "Ctrl/Cmd+C Copy\nCtrl/Cmd+V Paste\nCtrl/Cmd+X Cut\nCtrl/Cmd+Z Undo\nCtrl/Cmd+F Find\nCtrl/Cmd+K Search"}},

 "flashcards":{name:"Flashcards",cat:"education",run(i){const pairs=String(i||"HTML=Markup language\nCSS=Style language").split(/\r?\n/).map(x=>x.split("="));return JSON.stringify(pairs.map(([front,back])=>({front,back:back??""})),null,2)}},
 "quiz-maker":{name:"Quiz maker",cat:"education",run(i){return `Quiz input preserved:\n${String(i||"Question? | Answer").trim()}`}},
 "email-validator":{name:"Email validator",cat:"communication",run(i){const s=String(i||"");return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)?"Valid email format":"Invalid email format"}},
 "phone-validator":{name:"Phone validator",cat:"communication",run(i){const s=String(i||"");return /^[+]?[\d\s().-]{7,}$/.test(s)?"Plausible phone format":"Invalid phone format"}},
 "mailto-generator":{name:"Email composer",cat:"communication",run(i){const [to,subject="",body=""]=(i||"test@example.com,Hello,Message").split(",");return `mailto:${String(to).trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}},
 "sms-link":{name:"SMS link generator",cat:"communication",run(i){const [phone,msg]=(i||"+911234567890,Hello").split(",");return `sms:${phone}?body=${encodeURIComponent(msg||"")}`}},
 "whatsapp-link":{name:"WhatsApp link generator",cat:"communication",run(i){const [phone,msg]=(i||"911234567890,Hello").split(",");return `https://wa.me/${String(phone).replace(/\D/g,"")}?text=${encodeURIComponent(msg||"")}`}},
 "telegram-link":{name:"Telegram link generator",cat:"communication",run(i){const [user,msg]=(i||"username,Hello").split(",");return `https://t.me/${String(user).replace(/^@/,"")}?text=${encodeURIComponent(msg||"")}`}},
 "vcard-generator":{name:"vCard generator",cat:"communication",run(i){const [name,tel,email]=(i||"John Doe,+911234567890,john@example.com").split(",");const v=x=>String(x||"").replace(/[\\;,]/g,m=>`\\${m}`);return `BEGIN:VCARD\nVERSION:3.0\nFN:${v(name)}\nTEL:${v(tel)}\nEMAIL:${v(email)}\nEND:VCARD`}},
 "contrast-checker":{name:"Contrast checker",cat:"accessibility",run(i){
   const [a,b]=(i||"#000000,#ffffff").split(",").map(s=>s.trim());
   const lum=h=>{h=h.replace("#","");if(h.length===3)h=h.split("").map(x=>x+x).join("");const c=[0,2,4].map(x=>parseInt(h.slice(x,x+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
   const x=lum(a),y=lum(b),r=(Math.max(x,y)+.05)/(Math.min(x,y)+.05);return JSON.stringify({ratio:+r.toFixed(2),AA:r>=4.5,AAA:r>=7},null,2)
 }},
 "dyslexia-toggle":{name:"Dyslexia font toggle",cat:"accessibility",run(){return "Suggested CSS: font-family: Arial, sans-serif; letter-spacing: 0.04em; line-height: 1.6;"}},
 "reading-guide":{name:"Reading guide",cat:"accessibility",run(){return "Reading guide: use a horizontal focus band with position:fixed and pointer-events:none; keep keyboard focus unaffected."}},
 "motion-reducer":{name:"Motion reducer",cat:"accessibility",run(){return "@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; } }"}},
 "alt-text-viewer":{name:"Alt text viewer",cat:"accessibility",run(i){const ms=[...String(i||"").matchAll(/<img\b[^>]*\balt=["']([^"']*)["'][^>]*>/gi)];return ms.length?ms.map(m=>m[1]).join("\n"):"No image alt attributes found."}},
 "random-joke":{name:"Random joke",cat:"fun",run(){const a=["Why do programmers prefer dark mode? Because light attracts bugs.","There are only 10 kinds of people: those who understand binary and those who don't."];return a[Math.floor(Math.random()*a.length)]}},
 "random-quote":{name:"Random quote",cat:"fun",run(){const a=["The beginning is the most important part of the work.","What we know is a drop; what we don't know is an ocean."];return a[Math.floor(Math.random()*a.length)]}},
 "magic-8-ball":{name:"Magic 8-ball",cat:"fun",run(){const a=["Yes.","No.","Ask again later.","Cannot determine now.","Very likely.","Unlikely."];return a[Math.floor(Math.random()*a.length)]}},
 "dice":{name:"Dice",cat:"fun",run(i){const n=Math.max(1,Math.min(100,Number(i)||1));return String(Math.floor(Math.random()*n)+1)}},
 "coin-flip":{name:"Coin flip",cat:"fun",run(){return Math.random()<.5?"Heads":"Tails"}},
 "rps":{name:"Rock Paper Scissors",cat:"fun",run(i){const a=["rock","paper","scissors"],u=String(i||"rock").toLowerCase(),c=a[Math.floor(Math.random()*3)];if(!a.includes(u))return "Choose rock, paper, or scissors.";return JSON.stringify({you:u,computer:c,result:u===c?"draw":(u==="rock"&&c==="scissors")||(u==="paper"&&c==="rock")||(u==="scissors"&&c==="paper")?"win":"loss"},null,2)}},
 "reaction-time":{name:"Reaction time test",cat:"fun",run(){return "Start a timer on user input; record elapsed milliseconds when the user responds. This catalog entry requires interactive UI state."}},
 "birthday-countdown":{name:"Birthday countdown",cat:"fun",run(i){const now=new Date(),d=new Date(i||`${now.getFullYear()}-12-31`);if(d<now)d.setFullYear(now.getFullYear()+1);return `${Math.ceil((d-now)/86400000)} days`}},
 "age-in-days":{name:"Age in days/hours",cat:"fun",run(i){const d=new Date(i||"2000-01-01"),ms=Date.now()-d.getTime();return JSON.stringify({days:Math.floor(ms/86400000),hours:Math.floor(ms/3600000)},null,2)}},
 "life-in-weeks":{name:"Life in weeks",cat:"fun",run(i){const age=Number(i||30),weeks=Math.round(age*52.1775);return `Approximate weeks lived: ${weeks}`}},
 "holiday-countdown":{name:"Countdown to holiday",cat:"fun",run(i){const d=new Date(i||"2026-12-25"),ms=d-Date.now();return `${Math.ceil(ms/86400000)} days remaining`}}
};
return tools;
})();