# Tool audit — what each tool actually does

This is a functional audit, not a coverage count. Every catalog entry was executed with realistic inputs and the **actual output** was graded. Machine-readable result: `tool-audit.json`. Regenerate with `node audit-tools.mjs`.

**563 tools** across **18** categories.

| Verdict | Meaning | Count |
|---|---|---:|
| `REAL` | computed output that changes with input | 271 |
| `SHALLOW` | real but terse | 64 |
| `STATIC` | identical for different inputs (reference or lookup) | 97 |
| `VALIDATION` | correctly rejected the generic sample | 28 |
| `ENV` | needs a browser API (Image/document/navigator) | 31 |
| `BROWSER` | needs a live tab or privileged API | 64 |
| `PLACEHOLDER` | says the capability is unavailable here | 5 |
| `EMPTY` | no match for the sample input | 3 |
| `CRASH` | threw an unexpected error | 0 |

## Removed in this pass

29 entries could never produce a real result in a browser and were deleted rather than shipped as dead weight.

**Require an unbundled third-party library (22):** Prettier · Accessibility auditor (lazy) · Accessibility auditor (axe-core) · Image→PDF · Images→PDF · PDF merge · PDF split · PDF rotate · PDF reorder · PDF page numbers · PDF watermark · PDF crop · PDF form filler · PDF signature · PDF metadata viewer · PDF metadata cleaner · PDF→images · PDF→text · OCR · Excel viewer · Screenshot→Markdown table · OpenPGP viewer

**Cannot be done by an extension at all (7):** Notification blocker · Popup blocker · Canvas fingerprint blocker · WebRTC IP leak test · IP address viewer · File metadata stripper · Frames→GIF

Two entries that looked dead were recovered instead: **Password strength meter** (real entropy) and **vCard QR code** (now uses the bundled QR encoder).

## Per-tool results

### Accessibility

| Tool | Verdict | Output sample |
|---|---|---|
| Dyslexia font toggle | `STATIC` | Suggested CSS: font-family: Arial, sans-serif; letter-spacing: 0.04em; |
| Letter-spacing adjuster | `BROWSER` | No result — the page returned nothing for this tool. |
| Word-spacing adjuster | `BROWSER` | No result — the page returned nothing for this tool. |
| Reading guide (ruler) | `STATIC` | Reading guide: use a horizontal focus band with position:fixed and poi |
| Reading mask | `BROWSER` | No result — the page returned nothing for this tool. |
| ARIA inspector | `BROWSER` | No result — the page returned nothing for this tool. |
| Keyboard navigation tester | `BROWSER` | No result — the page returned nothing for this tool. |
| Focus indicator viewer | `BROWSER` | No result — the page returned nothing for this tool. |
| Motion reducer | `STATIC` | @media (prefers-reduced-motion: reduce) { *, *::before, *::after { ani |
| Animation pauser | `BROWSER` | No result — the page returned nothing for this tool. |
| Flashing content detector | `BROWSER` | No result — the page returned nothing for this tool. |
| Alt text viewer | `REAL` | No image alt attributes found. |

### Calculators & Converters

| Tool | Verdict | Output sample |
|---|---|---|
| Live calculator | `SHALLOW` | 1234.5 |
| Scientific | `SHALLOW` | 1234.5 |
| Matrix | `VALIDATION` | Matrix B must be rectangular and contain only numbers. |
| Percentage | `VALIDATION` | Enter a valid number |
| Tip | `REAL` | { "tip": 185.175, "total": 1419.675 } |
| Discount | `REAL` | { "discount": 123.45, "final": 1111.05 } |
| Tax/VAT/GST | `REAL` | { "tax": 222.21, "total": 1456.71 } |
| Loan/EMI | `REAL` | { "emi": 25.031208749046904, "total": 1501.8725249428142, "interest":  |
| Amortization | `REAL` | [ { "month": 1, "payment": 25.031208749046904, "principal": 16.8012087 |
| Compound interest | `REAL` | { "interest": 604.7145268983311, "total": 1839.214526898331 } |
| Simple interest | `SHALLOW` | 98.76 |
| ROI/ROAS | `SHALLOW` | 12245.00% |
| Break-even | `SHALLOW` | Infinity |
| Markup/margin | `REAL` | { "markup": -99.18995544754962, "margin": -12245 } |
| Salary↔hourly | `VALIDATION` | Enter a valid number |
| Overtime | `SHALLOW` | 1851.75 |
| Freelance rate | `REAL` | { "annualTarget": 1234.5, "billableHoursPerWeek": 25, "workingWeeks":  |
| Age | `VALIDATION` | Use a valid birth date |
| Date difference | `SHALLOW` | NaN days |
| Business days | `VALIDATION` | Enter two valid dates |
| Add/subtract date | `REAL` | 1990-06-19 (Tuesday) |
| Week number | `SHALLOW` | NaN |
| Day of week | `REAL` | Invalid Date |
| Zodiac | `SHALLOW` | Aries |
| Chinese zodiac | `REAL` | Horse (Metal) |
| Time zone converter | `REAL` | Asia/Kolkata: 1 May 1234, 05:53:28 UTC: 1 May 1234, 00:00:00 |
| Unix timestamp | `SHALLOW` | 1794055305 |
| ISO 8601 | `REAL` | 2026-11-07T12:41:45.852Z |
| Cron time | `STATIC` | Sat Nov 07 2026 12:45:00 GMT+0000 (Coordinated Universal Time) Sat Nov |
| Stopwatch | `STATIC` | { "running": true, "elapsedMs": 0, "elapsed": "0.00s", "laps": [] } |
| Countdown | `REAL` | Since Sun May 20 1990 00:00:00 GMT+0000 (Coordinated Universal Time):  |
| Pomodoro | `STATIC` | #1 work 12:41–13:06 break until 13:11 #2 work 13:11–13:36 break until  |
| Unit converter | `REAL` | 1234.5 km = 767.082737 mi |
| Length/weight/temp/area/volume | `REAL` | 1234.5 m = 4050.19685 ft |
| Speed/pressure/energy/power | `REAL` | 1234.5 km/h = 767.082737 mph |
| Fuel economy | `REAL` | { "input": "1234.5 L/100km", "L/100km": 1234.5, "km/L": 0.081, "mpg (U |
| Cooking | `REAL` | 1234.5 cup = 292068.178 mL |
| Byte converter | `REAL` | { "bytes": 1234.5, "KB": 1.2056, "MB": 0.001177, "GB": 0.00000115, "TB |
| Data rate | `REAL` | 1234.5 Mbps = 154.3125 MB/s |
| Frequency/wavelength | `REAL` | { "frequencyMHz": 1234.5, "wavelengthM": 0.2428, "wavelengthCm": 24.28 |
| Angle | `REAL` | 1234.5 deg = 21.54609 rad |
| Base converter | `SHALLOW` | 4D2 |
| Roman numerals | `SHALLOW` | MCCXXXIV |
| Binary/octal/hex | `VALIDATION` | Invalid number |
| Fraction↔decimal | `SHALLOW` | 1234.5 |
| Scientific notation | `SHALLOW` | 1.234500e+3 |
| Significant figures | `SHALLOW` | 1.23e+3 |
| Rounding | `REAL` | { "rounded": 1234.5, "floor": 1234.5, "ceil": 1234.5, "places": 2 } |
| Prime checker | `SHALLOW` | Not prime |
| GCD/LCM | `REAL` | { "gcd": 1234, "lcm": 0 } |
| Factorial/permutations | `VALIDATION` | Enter a whole number ≥ 0 (e.g. 10 or 10,3) |
| Fibonacci | `REAL` | 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597 |
| Statistics | `REAL` | { "count": 1, "min": 1234.5, "max": 1234.5, "mean": 1234.5, "median":  |
| Percentile/quartile | `STATIC` | { "count": 1, "min": 1234.5, "max": 1234.5, "q1": 1234.5, "median": 12 |
| Correlation | `VALIDATION` | X and Y must have the same length (≥2) |
| Linear regression | `VALIDATION` | X and Y must have the same length (≥2) |
| Probability | `VALIDATION` | Keep n ≤ 170 to stay within floating-point range |
| Random number | `SHALLOW` | 875358 |
| Random from list | `SHALLOW` | 1234.5 |
| Dice | `SHALLOW` | 3 |
| Coin flip | `SHALLOW` | Heads |
| Password generator | `REAL` | GHoyd![n[n5[cUL# |
| PIN generator | `SHALLOW` | 683591 |
| BMI/BMR/TDEE | `REAL` | { "bmi": 123450, "category": "obese", "bmr": 12363, "tdee": 19162, "ac |
| Body fat | `REAL` | { "bodyFatPercent": -450, "method": "US Navy circumference", "sex": "m |
| Pace/speed | `STATIC` | { "distanceKm": 5, "timeMin": 30, "paceMinPerKm": "6:00", "speedKmh":  |
| Fuel cost | `STATIC` | { "litresUsed": 0.67, "cost": 66.67, "currencyNote": "Currency is what |
| Electricity cost | `REAL` | { "watts": 1234.5, "hoursPerDay": 4, "days": 30, "kWh": 148.14, "cost" |
| Number to words | `REAL` | One Thousand Two Hundred Thirty-Four Point Five |

### Communication

| Tool | Verdict | Output sample |
|---|---|---|
| Email composer (mailto) | `REAL` | mailto:user@example.com?subject=&body= |
| Signature generator | `REAL` | — The quick brown fox jumps over the lazy dog. It was a bright cold da |
| Template library | `STATIC` | Templates: followup, intro, apology, invoice |
| Subject line tester | `REAL` | { "subject": "The quick brown fox jumps over the lazy dog. It was a br |
| Email validator | `REAL` | Valid email format |
| Phone validator | `REAL` | Plausible phone format |
| SMS link gen | `REAL` | sms:+91 98765 43210?body= |
| WhatsApp link gen | `REAL` | https://wa.me/?text=%20and%20the%20clocks%20were%20striking%20thirteen |
| Telegram link gen | `REAL` | https://t.me/The quick brown fox jumps over the lazy dog. It was a bri |
| Signal link gen | `REAL` | https://signal.me/#p/ |
| Zoom link gen | `REAL` | https://zoom.us/j/?pwd=sample |
| Meet link gen | `REAL` | https://meet.google.com/ThequickbrownfoxjumpsoverthelazydogItwasabrigh |
| ICS calendar invite | `VALIDATION` | Use YYYY-MM-DD HH:MM |
| vCard generator | `REAL` | BEGIN:VCARD VERSION:3.0 FN:The quick brown fox jumps over the lazy dog |
| vCard QR code | `STATIC` | data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAw |

### Data

| Tool | Verdict | Output sample |
|---|---|---|
| CSV viewer/editor | `REAL` | <table><thead><tr><th>name</th><th>score</th><th>city</th></tr></thead |
| CSV→JSON/SQL/Markdown/Excel | `SHALLOW` | [] |
| JSON viewer | `REAL` | { "name": "Ada", "age": 36, "tags": [ "math", "code" ], "address": { " |
| XML viewer | `ENV` | DOMParser is not defined |
| YAML viewer | `REAL` | { "name": "Ada", "age": "36", "city": "Pune" } |
| Table sorter | `REAL` | name,score,city A,10,Pune B,20,Delhi C,30,Mumbai D,40,Pune |
| Table filter | `REAL` | name,score,city |
| Table dedup | `REAL` | Removed 0 duplicate row(s). name,score,city A,10,Pune B,20,Delhi C,30, |
| Pivot table | `VALIDATION` | Check the field names against the header row |
| Data cleaner | `REAL` | name,score A,10 B,20 C,30 |
| Data validator | `REAL` | All 3 rows look consistent. |
| Schema detector | `REAL` | { "rows": 3, "columns": [ { "column": "name", "type": "string", "nonEm |
| Chart generator | `STATIC` | <svg width="560" height="260"><rect x="34" y="180" width="117" height= |
| Histogram | `STATIC` | <svg width="560" height="240"><rect x="0" y="20" width="52" height="20 |
| Box plot | `STATIC` | <svg width="560" height="120"><line x1="40" y1="60" x2="520" y2="60" s |
| Scatter plot | `VALIDATION` | X and Y need the same number of values |
| Heatmap | `REAL` | <table style="border-collapse:collapse;font:11px system-ui;color:#e8ea |
| Correlation matrix | `STATIC` | <table style="border-collapse:collapse;font:11px system-ui;color:#fff" |
| Outlier finder | `STATIC` | { "lower": -5, "upper": 35, "outliers": [] } |
| Encoding detector | `REAL` | { "guess": "ASCII / UTF-8", "byteLength": 25, "charLength": 25, "nonAs |
| Line-ending converter | `REAL` | name,score A,10 B,20 C,30 |
| Delimiter detector | `REAL` | Likely delimiter: "," (1 per row) |
| Duplicate finder | `REAL` | No duplicate lines. |
| Fuzzy match | `REAL` | Levenshtein distance: 6 |
| Fake-data generator | `STATIC` | [ { "id": 1, "name": "User 1", "email": "user1@example.test" }, { "id" |

### Design & Color

| Tool | Verdict | Output sample |
|---|---|---|
| Color converter | `REAL` | { "hex": "#336699", "rgb": "rgb(51, 102, 153)", "hsl": "hsl(210 50% 40 |
| Palette generator | `STATIC` | [ "#1f3d5c", "#29527a", "#336699", "#3d7ab8", "#478fd6" ] |
| Palette from image | `ENV` | Image is not defined |
| Color harmony | `STATIC` | <div style="display:flex;flex-wrap:wrap;gap:8px;font:11px system-ui;co |
| Contrast checker | `STATIC` | { "ratio": 6, "AA_normal": true, "AA_large": true, "AAA_normal": false |
| Color blindness simulator | `STATIC` | <div style="display:flex;flex-wrap:wrap;gap:8px;font:11px system-ui;co |
| Gradient generator | `REAL` | linear-gradient(90deg, #336699, undefined) |
| Box shadow | `STATIC` | <div style="display:grid;place-items:center;height:200px;background:#1 |
| Text shadow | `REAL` | <div style="display:grid;place-items:center;height:160px;background:#0 |
| Border radius | `STATIC` | <div style="display:grid;place-items:center;height:200px;background:#1 |
| Transform | `STATIC` | <div style="display:grid;place-items:center;height:220px;background:#1 |
| Filter playground | `STATIC` | <div style="display:grid;place-items:center;height:220px;background:#1 |
| Blend mode playground | `STATIC` | <div style="display:grid;place-items:center;height:220px;background:#1 |
| Clip-path gen | `STATIC` | <div style="display:grid;place-items:center;height:220px;background:#1 |
| OG image gen | `REAL` | <div style="width:600px;height:315px;background:#0f1115;display:flex;f |
| Placeholder image gen | `ENV` | document is not defined |
| Pattern gen | `STATIC` | <div style="height:220px;background-color:#0f1115;background:radial-gr |
| Aspect ratio | `REAL` | NaN:NaN = NaN (reduced NaN:NaN) |
| Typography scale | `STATIC` | <div style="font-family:system-ui;color:#e8eaed"><div style="display:f |
| Font pairing | `REAL` | <div style="margin-bottom:18px;color:#e8eaed"><div style="font:700 26p |
| Spacing scale | `STATIC` | <div style="font:12px system-ui;color:#e8eaed"><div style="display:fle |
| Design tokens | `SHALLOW` | {} |
| CSS variables | `SHALLOW` | :root { } |
| Animation builder | `STATIC` | <style>@keyframes fadeUp{from{opacity:0; transform:translateY(12px)}to |
| Keyframe builder | `STATIC` | <style>@keyframes spin{ 0% { transform: rotate(0deg); } 50% { transfor |
| Transition builder | `STATIC` | <style>.ttb-demo{transition:all 0.3s ease}.ttb-demo:hover{background:# |
| Bezier editor | `STATIC` | <svg width="240" height="240" style="background:#171a21"><rect x="30"  |

### Developer

| Tool | Verdict | Output sample |
|---|---|---|
| JSON format/validate/minify | `REAL` | {"name":"Ada","age":36,"tags":["math","code"],"address":{"city":"Pune" |
| JSON→TypeScript | `REAL` | interface Root { name: string; age: number; tags: type x = string[]; a |
| JSON→Go/Rust/Python | `REAL` | type Root struct { Name string `json:"name"` Age int `json:"age"` Tags |
| JSON→SQL/CSV/YAML/XML | `REAL` | { "name": "Ada", "age": 36, "tags": [ "math", "code" ], "address": { " |
| JSON Schema gen | `REAL` | { "$schema": "https://json-schema.org/draft/2020-12/schema", "type": " |
| JSONPath eval | `SHALLOW` | [] |
| JSON diff | `VALIDATION` | Unexpected token 's', "sample" is not valid JSON |
| YAML↔JSON | `REAL` | { "name": "Ada", "age": 36, "tags": [ "math", "code" ], "address": { " |
| XML format | `REAL` | <root> <item id="1">A</item> <item id="2">B</item> </root> |
| XML→JSON | `ENV` | DOMParser is not defined |
| CSV↔JSON | `SHALLOW` | [] |
| TOML parser | `REAL` | { "server": { "port": 8080, "host": "localhost" } } |
| INI parser | `REAL` | { "default": {}, "main": { "key": "value" } } |
| .env parser | `REAL` | { "API_URL": "https://example.com", "DEBUG": "true" } |
| Regex tester | `EMPTY` |  |
| Cron explainer | `STATIC` | Runs at every 15 minute, hour 9–17, on every day-of-month, in every mo |
| Cron next-run | `STATIC` | Mon Nov 09 2026 09:00:00 GMT+0000 (Coordinated Universal Time) Mon Nov |
| UUID v4/v7 | `REAL` | 87d01433-7305-4b0e-8153-5f9eaa0e6c63 |
| ULID | `REAL` | 01M6V0EYNRBVEJ72T1WCADX5R3 |
| NanoID | `REAL` | D_9c8xWixa1ZdxR2InxWC |
| JWT decode | `STATIC` | { "sub": "1234567890", "name": "Ada" } |
| JWT verify (HS256) | `STATIC` | { "valid": false, "header": { "alg": "HS256", "typ": "JWT" }, "payload |
| Base64 URL-safe | `REAL` | aHR0cHM6Ly9leGFtcGxlLmNvbS9wYXRoL3BhZ2U_YT0xJnV0bV9zb3VyY2U9bmV3c2xldH |
| Base32 | `REAL` | JJBFGV2ZGNCFARKIKBFTGUCYKA |
| Base58 | `REAL` | bqG9UewMrMvQa5LCR1ZkA2soupheyiDL1Jt8gLepeGX97MQqSUX8W4LAsrmiTsgTmemaeC |
| URL parser | `REAL` | { "href": "https://example.com/path/page?a=1&utm_source=newsletter", " |
| Query string parser | `REAL` | { "The quick brown fox jumps over the lazy dog. It was a bright cold d |
| HTTP header parser | `REAL` | [ [ "The quick brown fox jumps over the lazy dog. It was a bright cold |
| HTTP status lookup | `REAL` | Unknown status |
| MIME lookup | `SHALLOW` | Unknown |
| Hash (MD5/SHA-1/256/512) | `REAL` | ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad |
| HMAC | `REAL` | 421fda9fa81e8bb20275cc5c7a947731bce933f4131182a1fdf2eabd0a714c93 |
| Diff tool | `REAL` | - The quick brown fox jumps over the lazy dog. It was a bright cold da |
| JS/CSS/HTML beautify | `REAL` | div.card > a:hover { color: red; }  |
| JS/CSS/HTML minify | `REAL` | [main] key=value |
| CSS specificity | `REAL` | { "ids": 0, "classes": 2, "elements": 4 } |
| CSS selector gen | `REAL` | #id #div.card > a:hover { color: red; } .class .div.card > a:hover { c |
| XPath gen | `REAL` | By tag //The quick brown fox jumps over the lazy dog. It was a bright  |
| Color picker | `REAL` | <div style="display:flex;gap:14px;align-items:center;font:13px system- |
| Hex↔RGB↔HSL↔CMYK | `REAL` | { "hex": "#336699", "rgb": "rgb(51, 102, 153)", "hsl": "hsl(210, 50%,  |
| Color contrast (WCAG) | `REAL` | 5.997786839657083 |
| Palette extractor | `REAL` | <div style="display:flex;font:11px system-ui;color:#111"><div style="f |
| Gradient gen | `REAL` | linear-gradient(90deg, #336699, #66ccff) |
| Box shadow gen | `REAL` | box-shadow: 0px 8px 24px -4px #00000033; |
| Border radius gen | `REAL` | border-radius: The quick brown fox jumps over the lazy dog. It was a b |
| CSS transform gen | `STATIC` | transform: translate(0px, 0px) rotate(0deg) scale(1); |
| Flexbox playground | `REAL` | .flex { display: flex; flex-direction: row; justify-content: center; a |
| Grid playground | `REAL` | .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; grid-auto-r |
| SVG→JSX | `REAL` | <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect w |
| SVG→PNG | `ENV` | Image is not defined |
| Favicon gen | `REAL` | <img width="64" height="64" style="border-radius:14px" src="data:image |
| Meta tag gen | `REAL` | <title>The quick brown fox jumps over the lazy dog. It was a bright co |
| OG/Twitter preview | `BROWSER` | No result — the page returned nothing for this tool. |
| Robots.txt tester | `STATIC` | Path "/" for user-agent "*": ALLOWED Parsed rules: (none) |
| Sitemap validator | `STATIC` | { "urlCount": 0, "invalid": [], "duplicate": [], "ok": false } |
| HTML validator | `STATIC` | Missing <title> Missing meta description Missing lang on <html> |
| Markdown preview | `REAL` | <div style="font:14px/1.6 system-ui;color:#e8eaed;background:#0f1115;p |
| ASCII table | `REAL` | \| name \| score \| city \| \| A \| 10 \| Pune \| \| B \| 20 \| Delhi  |
| CSV table | `REAL` | <table style="border-collapse:collapse;font:13px system-ui;color:#e8ea |
| SQL formatter | `REAL` | SELECT id, name FROM users WHERE age > 30 ORDER BY name LIMIT 10; |
| SQL→MongoDB | `REAL` | db.users.find({ age > 30 order by name }, id: 1, name: 1).limit(10) |
| Regex→SQL | `REAL` | -- Simple LIKE translation of Order 1234 shipped on 2024-03-15 to user |
| GraphQL builder | `REAL` | query { item(id: "1") { The quick brown fox jumps over the lazy dog. I |
| WebSocket tester | `REAL` | Enter a ws:// or wss:// URL. |
| SSE inspector | `REAL` | Enter an http(s) URL of an SSE endpoint. |
| CORS tester | `REAL` | Enter an http(s) URL. |
| Cookie inspector | `SHALLOW` | [] |
| LocalStorage viewer | `SHALLOW` | null |
| SessionStorage viewer | `SHALLOW` | null |
| IndexedDB viewer | `SHALLOW` | null |
| CacheStorage viewer | `SHALLOW` | null |
| HAR viewer | `VALIDATION` | Unexpected token 'T', "The quick "... is not valid JSON |
| IP subnet | `VALIDATION` | Use IPv4 CIDR, e.g. 192.168.1.10/24 |
| MAC checker | `REAL` | { "valid": false, "normalized": "EA:EC:AA:EA:1C:EE:EE", "oui": "EA:EC: |
| Port reference | `REAL` | Unknown/common port not in reference |
| HSTS/CSP/SRI checker | `STATIC` | { "hsts": null, "csp": null, "cspIssues": [ "(no CSP)" ], "xContentTyp |
| Git commit templates | `REAL` | feat(The quick brown fox jumps over the lazy dog. It was a bright cold |
| .gitignore gen | `STATIC` | node_modules/ .env dist/ coverage/ .DS_Store *.log  |
| Dockerfile gen | `STATIC` | FROM node:22-alpine WORKDIR /app COPY package*.json ./ RUN npm ci --om |
| Docker Compose gen | `REAL` | services: app: build: . ports: - "The quick brown fox jumps over the l |
| K8s YAML gen | `REAL` | apiVersion: apps/v1 kind: Deployment metadata: name: name: Ada age: 36 |
| Nginx config gen | `REAL` | server { listen 80; server_name The quick brown fox jumps over the laz |
| Makefile gen | `REAL` | .PHONY: install build test clean install: The quick brown fox jumps ov |
| Bash/PowerShell snippets | `STATIC` | Bash find . -name '*.js' \| xargs wc -l tar -czf out.tgz dir/ grep -rn |
| SSH config gen | `REAL` | Host The quick brown fox jumps over the lazy dog. It was a bright cold |
| Big-O cheatsheet | `STATIC` | Array lookup O(1) Array search O(n) Binary search O(log n) Hash lookup |
| Design patterns | `SHALLOW` | No match. |
| Sorting visualizer | `REAL` | <div id="v" style="display:flex;gap:2px;align-items:flex-end;height:22 |
| Path finding visualizer | `REAL` | <div style="display:grid;grid-template-columns:repeat(15,1fr);gap:2px; |

### Education

| Tool | Verdict | Output sample |
|---|---|---|
| Periodic table | `REAL` | Element not in compact reference. |
| Unit circle | `STATIC` | <table style="border-collapse:collapse;font:12px system-ui;color:#e8ea |
| Multiplication table | `STATIC` | NaN × 1 = NaN NaN × 2 = NaN NaN × 3 = NaN NaN × 4 = NaN NaN × 5 = NaN  |
| Formula reference | `REAL` | No formula matched. |
| Typing tutor | `REAL` | <div style="font:18px/1.8 monospace;color:#e8eaed;background:#0f1115;p |
| Typing speed test | `REAL` | { "words": 23, "characters": 118, "oneMinuteWPM": 23 } |
| Morse practice | `SHALLOW` | ... --- ... |
| Keyboard shortcuts | `STATIC` | Ctrl/Cmd+C Copy Ctrl/Cmd+V Paste Ctrl/Cmd+X Cut Ctrl/Cmd+Z Undo Ctrl/C |
| Alphabet reference | `STATIC` | A=Alpha B=Bravo C=Charlie D=Delta E=Echo F=Foxtrot G=Golf H=Hotel I=In |
| Number system reference | `STATIC` | Decimal → Binary / Octal / Hex 0 → 0 / 0 / 0 1 → 1 / 1 / 1 2 → 10 / 2 |
| Country info | `STATIC` | Known countries: India, USA, UK, Japan, Australia |
| Flag identifier | `STATIC` | Try a 2-letter code: IN, US, GB, JP, DE, FR, CN, BR, AU, CA, AE, SG |
| Flashcards | `REAL` | [ { "front": "The quick brown fox jumps over the lazy dog. It was a br |
| Quiz maker | `REAL` | Quiz input preserved: The quick brown fox jumps over the lazy dog. It  |
| Study timer | `STATIC` | Round 1: study 12:41–13:31 rest until 13:41 Round 2: study 13:41–14:31 |

### Finance

| Tool | Verdict | Output sample |
|---|---|---|
| Loan | `REAL` | { "principal": 1234.5, "monthlyPayment": null, "totalPayment": null, " |
| EMI | `REAL` | { "emi": null, "total": null, "interest": null } |
| Mortgage | `STATIC` | { "loanAmount": null, "monthlyPayment": "NaN", "totalPaid": "NaN", "to |
| Retirement estimate | `STATIC` | { "invested": 3000000, "futureValue": 9510264, "gain": 6510264 } |
| Savings goal | `REAL` | { "remaining": -1224.5, "monthlyNeeded": -102.04, "months": 12 } |
| ROI | `REAL` | { "gain": 1234.5, "cost": 10, "roi": "12245%", "multiple": "123.45×" } |
| Profit margin | `SHALLOW` | 43.30% |
| Markup | `SHALLOW` | -19.00% |
| Tax | `REAL` | { "tax": null, "total": null } |
| VAT/GST | `REAL` | { "net": 1234.5, "tax": 222.21, "gross": 1456.71 } |
| Invoice generator | `REAL` | INVOICE ============================== From: 1234.5 To: sample Date: 1 |
| Quote generator | `REAL` | QUOTATION ============================== Provider: 1234.5 Client: samp |
| Receipt generator | `REAL` | RECEIPT — 1234.5 ============================== 11/7/2026, 12:41:50 PM |
| Expense tracker | `REAL` | Total: 10 general: 10 |
| Budget planner | `REAL` | { "income": 10, "needs": 5, "savings": 2, "wants": 3, "note": "1234.5  |
| Debt payoff (snowball/avalanche) | `VALIDATION` | Enter debts as name=balance,annualRate |
| Salary converter | `REAL` | 0.5935096153846153 |
| Meeting cost | `STATIC` | { "people": 5, "minutes": 60, "hourlyRate": 30, "cost": 150, "perYearI |
| Project cost | `REAL` | { "project": "1234.5", "base": 60000, "buffer": 9000, "total": 69000 } |
| Invoice number gen | `STATIC` | INV-2026-0188 INV-2026-0189 INV-2026-0190 INV-2026-0191 INV-2026-0192 |

### Fun & Misc

| Tool | Verdict | Output sample |
|---|---|---|
| Random joke | `REAL` | There are only 10 kinds of people: those who understand binary and tho |
| Random quote | `REAL` | The beginning is the most important part of the work. |
| Random fact | `REAL` | Honey never spoils — 3,000-year-old jars are still edible. |
| Random name | `SHALLOW` | Ishita Nair |
| Random password | `REAL` | mgyS3GPvuR#v^fkz |
| Random color | `REAL` | <div style="width:200px;height:120px;border-radius:12px;background:#ce |
| Decision maker | `REAL` | and the clocks were striking thirteen. |
| Magic 8-ball | `SHALLOW` | No. |
| RPS | `REAL` | Choose rock, paper, or scissors. |
| Tic-tac-toe | `STATIC` | <style>body{margin:0;font:14px system-ui;background:#0f1115;color:#e8e |
| Sudoku gen/solve | `REAL` | 004008010 000090008 198040060 800061003 400053001 000020050 900037284  |
| Word search gen | `REAL` | Find these words: THE, QUICK, BROWN, FOX, JUMPS, OVER, THE, LAZY S T P |
| Minesweeper | `STATIC` | <style>body{margin:0;font:14px system-ui;background:#0f1115;color:#e8e |
| 2048 | `STATIC` | <style>body{margin:0;font:14px system-ui;background:#0f1115;color:#e8e |
| Snake | `STATIC` | <style>body{margin:0;font:14px system-ui;background:#0f1115;color:#e8e |
| Tetris-mini | `STATIC` | <style>body{margin:0;font:14px system-ui;background:#0f1115;color:#e8e |
| Pong | `STATIC` | <style>body{margin:0;font:14px system-ui;background:#0f1115;color:#e8e |
| Memory match | `STATIC` | <style>body{margin:0;font:14px system-ui;background:#0f1115;color:#e8e |
| Reaction time test | `STATIC` | Start a timer on user input; record elapsed milliseconds when the user |
| Typing test | `REAL` | <div id="t" style="font:18px/1.7 monospace;color:#e8eaed;background:#0 |
| Trivia quiz | `STATIC` | <div style="font:14px system-ui;color:#e8eaed;max-width:520px"><div st |
| Riddle library | `REAL` | The more you take, the more you leave behind. What am I? — Footsteps. |
| Fortune cookie | `REAL` | You will find what you are looking for where you least expect it. |
| Biorhythm | `VALIDATION` | Enter a valid birth date |
| Birthday countdown | `SHALLOW` | 194 days |
| Anniversary tracker | `VALIDATION` | Enter a valid date |
| Age in days/hours | `REAL` | { "days": 13320, "hours": 319692 } |
| Life in weeks | `REAL` | Approximate weeks lived: NaN |
| Countdown to holiday | `REAL` | -13320 days remaining |

### Media & Files

| Tool | Verdict | Output sample |
|---|---|---|
| Image compressor | `ENV` | Image is not defined |
| Image resizer | `ENV` | Image is not defined |
| Image cropper | `ENV` | Image is not defined |
| Image rotator/flipper | `ENV` | Image is not defined |
| Format converter (PNG/JPG/WebP/AVIF) | `ENV` | Image is not defined |
| Quality adjuster | `ENV` | Image is not defined |
| Image filters | `ENV` | Image is not defined |
| Watermarker | `ENV` | Image is not defined |
| Annotator | `ENV` | Image is not defined |
| Blur/pixelate | `ENV` | Image is not defined |
| Redactor | `ENV` | Image is not defined |
| Border/padding/rounding | `ENV` | Image is not defined |
| Collage | `ENV` | Image is not defined |
| Splitter (grid) | `ENV` | Image is not defined |
| Stitcher | `ENV` | Image is not defined |
| Comparison (diff) | `STATIC` | <div style="display:flex;gap:10px;font:11px system-ui;color:#e8eaed">< |
| EXIF viewer | `VALIDATION` | Choose a JPEG file. |
| EXIF remover | `ENV` | Image is not defined |
| GPS extractor | `VALIDATION` | Choose a JPEG file. |
| Color extractor | `ENV` | Image is not defined |
| Image→base64 | `STATIC` | data:image/png;base64,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA |
| GIF→frames | `VALIDATION` | Choose a GIF. |
| QR gen | `REAL` | data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAw |
| QR scan | `PLACEHOLDER` | Barcode/QR scanning is not available in the chrome build. The BarcodeD |
| Barcode gen | `REAL` | data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAw |
| Barcode scan | `PLACEHOLDER` | Barcode/QR scanning is not available in the chrome build. The BarcodeD |
| ZIP extract | `SHALLOW` | Contents:  |
| ZIP create | `STATIC` | Created a ZIP containing file.txt (120 bytes). Check your downloads. |
| TAR extract | `STATIC` | No entries found (is this really a TAR?). |
| GZIP extract | `VALIDATION` | incorrect header check |
| File type detector | `STATIC` | { "name": "sample.png", "declaredType": "image/png", "size": 1024, "fi |
| File hash calculator | `STATIC` | f5a5fd42d16a20302798ef6ed309979b43003d2320d9f0e8ea9831a92759fb4b |
| Screen recorder | `ENV` | navigator is not defined |
| Audio recorder | `ENV` | navigator is not defined |
| Webcam capture | `ENV` | navigator is not defined |
| Screenshot annotator | `STATIC` | Captured the visible area of the tab (0 KB) — download started. |

### Network

| Tool | Verdict | Output sample |
|---|---|---|
| Subnet calculator | `REAL` | { "error": "Invalid IPv4 CIDR" } |
| CIDR converter | `REAL` | { "error": "Invalid IPv4 CIDR" } |
| HTTP header viewer | `REAL` | Enter an http(s) URL. |
| Redirect viewer | `REAL` | Enter an http(s) URL. |
| URL shortener resolver | `VALIDATION` | timeout |
| QR link gen | `VALIDATION` | Enter an http(s) URL. |

### Page Tools

| Tool | Verdict | Output sample |
|---|---|---|
| Extract links/images/emails/phones/hashtags/mentions | `BROWSER` | No result — the page returned nothing for this tool. |
| Extract tables→CSV | `BROWSER` | No result — the page returned nothing for this tool. |
| Extract form fields | `BROWSER` | No result — the page returned nothing for this tool. |
| Extract meta tags | `BROWSER` | No result — the page returned nothing for this tool. |
| Extract headings/alt text | `BROWSER` | No result — the page returned nothing for this tool. |
| Extract iframes/scripts/stylesheets | `BROWSER` | No result — the page returned nothing for this tool. |
| Extract fonts/colors/SVG | `BROWSER` | No result — the page returned nothing for this tool. |
| Extract videos/audio/PDF links | `BROWSER` | No result — the page returned nothing for this tool. |
| Page→Markdown/Plain text/Clean HTML/JSON | `BROWSER` | No result — the page returned nothing for this tool. |
| Reading mode | `BROWSER` | No result — the page returned nothing for this tool. |
| Dark mode | `BROWSER` | No result — the page returned nothing for this tool. |
| Sepia | `BROWSER` | No result — the page returned nothing for this tool. |
| High contrast | `BROWSER` | No result — the page returned nothing for this tool. |
| Grayscale | `BROWSER` | No result — the page returned nothing for this tool. |
| Dyslexia font | `BROWSER` | No result — the page returned nothing for this tool. |
| Larger text | `BROWSER` | No result — the page returned nothing for this tool. |
| Line-height adjuster | `BROWSER` | No result — the page returned nothing for this tool. |
| Print cleaner | `BROWSER` | No result — the page returned nothing for this tool. |
| Screenshot (visible) | `STATIC` | “Screenshot (visible)” has no handler in this build. It should not be  |
| Full-page screenshot | `STATIC` | “Full-page screenshot” has no handler in this build. It should not be  |
| Sticky notes | `BROWSER` | No result — the page returned nothing for this tool. |
| Highlight & annotate | `BROWSER` | No result — the page returned nothing for this tool. |
| Save scroll position | `BROWSER` | No result — the page returned nothing for this tool. |
| Auto-refresh | `BROWSER` | No result — the page returned nothing for this tool. |
| Page change monitor | `BROWSER` | No result — the page returned nothing for this tool. |
| Element hider | `BROWSER` | No result — the page returned nothing for this tool. |
| Element picker | `BROWSER` | No result — the page returned nothing for this tool. |
| Computed CSS inspector | `BROWSER` | No result — the page returned nothing for this tool. |
| Font inspector | `BROWSER` | No result — the page returned nothing for this tool. |
| Box model inspector | `BROWSER` | No result — the page returned nothing for this tool. |
| Contrast auditor | `BROWSER` | No result — the page returned nothing for this tool. |
| Broken image detector | `BROWSER` | No result — the page returned nothing for this tool. |
| Slow resource finder | `BROWSER` | No result — the page returned nothing for this tool. |
| Page weight analyzer | `BROWSER` | No result — the page returned nothing for this tool. |
| SEO snapshot | `BROWSER` | No result — the page returned nothing for this tool. |
| Schema.org extractor | `BROWSER` | No result — the page returned nothing for this tool. |
| Hreflang checker | `BROWSER` | No result — the page returned nothing for this tool. |
| Canonical checker | `BROWSER` | No result — the page returned nothing for this tool. |
| Cookie banner dismisser | `BROWSER` | No result — the page returned nothing for this tool. |
| Newsletter popup killer | `BROWSER` | No result — the page returned nothing for this tool. |
| Form autofill | `BROWSER` | No result — the page returned nothing for this tool. |
| Form data exporter | `BROWSER` | No result — the page returned nothing for this tool. |
| Copy URL as Markdown/HTML/citation | `REAL` | [Example](https://example.com/article) |
| Copy table as Markdown/CSV | `BROWSER` | No result — the page returned nothing for this tool. |
| Video speed controller | `BROWSER` | No result — the page returned nothing for this tool. |
| Autoplay blocker | `BROWSER` | No result — the page returned nothing for this tool. |

### Productivity

| Tool | Verdict | Output sample |
|---|---|---|
| Multiple timers | `REAL` | Timer "timer" set for 60s. |
| Alarms | `VALIDATION` | Enter a valid date/time |
| Reminders | `REAL` | Saved 1 reminder(s). • The quick brown fox jumps over the lazy dog. It |
| Recurring reminders | `REAL` | Recurring reminder "The quick brown fox jumps over the lazy dog. It wa |
| Task list | `REAL` | ☐ 1. The quick brown fox jumps over the lazy dog. It was a bright cold |
| Todo from selection | `REAL` | Added task: The quick brown fox jumps over the lazy dog. It was a brig |
| Eisenhower matrix | `REAL` | <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font:13 |
| Time blocking | `REAL` | 09:00–09:30 The quick brown fox jumps over the lazy dog. It was a brig |
| Habit tracker | `REAL` | { "The quick brown fox jumps over the lazy dog. It was a bright cold d |
| Streak tracker | `REAL` | Streak "The quick brown fox jumps over the lazy dog. It was a bright c |
| Goal tracker | `REAL` | The quick brown fox jumps over the lazy dog. It was a bright cold day  |
| Countdown to date | `REAL` | { "target": "1990-05-20T00:00:00.000Z", "milliseconds": -1150893710162 |
| Days-since tracker | `VALIDATION` | Enter a valid date |
| Break reminder | `STATIC` | Break reminder set every 20 minutes. Follow the 20-20-20 rule: every 2 |
| Posture reminder | `REAL` | Posture reminder set every 30 minutes. |
| Hydration reminder | `REAL` | Hydration reminder set every 45 minutes. |
| DND | `STATIC` | Do-not-disturb until 1:41:50 PM. TTB will stay quiet (no alarms) until |
| Site blocker | `REAL` | Blocked list: the quick brown fox jumps over the lazy dog. it was a br |
| Daily limit enforcer | `REAL` | Limit for "The quick brown fox jumps over the lazy dog. It was a brigh |

### SEO

| Tool | Verdict | Output sample |
|---|---|---|
| Title analyzer | `REAL` | { "length": 118, "words": 23, "typicalRange": false } |
| Meta description analyzer | `REAL` | { "length": 118, "typicalRange": false } |
| Heading structure | `BROWSER` | No result — the page returned nothing for this tool. |
| OG preview | `REAL` | <div style="max-width:520px;border:1px solid #333;border-radius:10px;o |
| Twitter card preview | `REAL` | <div style="max-width:420px;border:1px solid #333;border-radius:14px;o |
| SERP snippet preview | `REAL` | <div style="font:13px system-ui;color:#e8eaed;max-width:560px"><div st |
| HTML basic validator | `BROWSER` | No result — the page returned nothing for this tool. |
| Structured data tester | `BROWSER` | No result — the page returned nothing for this tool. |
| UTM builder | `SHALLOW` | Invalid URL |
| UTM parser | `SHALLOW` | Invalid URL |

### Security

| Tool | Verdict | Output sample |
|---|---|---|
| Evidence capture (SHA-256 + timestamp) | `REAL` | { "sha256": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f |
| Chain-of-custody screenshot | `REAL` | { "timestamp": "2026-11-07T12:41:46.694Z", "sha256": "b53413d9cd9bc655 |
| Password strength meter (zxcvbn) | `REAL` | { "length": 118, "charsetSize": 85, "entropyBits": 756.3, "verdict": " |
| Passphrase generator (EFF) | `REAL` | aurora-signal-thistle-signal-marble |
| TOTP (RFC 6238) | `STATIC` | { "code": "624138", "period": 30, "secondsRemaining": 14, "algorithm": |
| HOTP (RFC 4226) | `STATIC` | { "code": "397368", "counter": 0, "algorithm": "SHA-1", "digits": 6 } |
| Base32 for TOTP | `REAL` | JJBFGV2ZGNCFARKIKBFTGUCYKA |
| AES-GCM encrypt/decrypt | `REAL` | {"v":1,"kdf":"PBKDF2-SHA256","iter":210000,"cipher":"AES-GCM","salt":" |
| PBKDF2 | `STATIC` | { "algorithm": "PBKDF2-HMAC-SHA256", "iterations": 210000, "salt": "tt |
| Cookie inspector/editor | `SHALLOW` | [] |
| Cookie third-party analyzer | `SHALLOW` | [] |
| Fingerprint detector | `ENV` | navigator is not defined |
| Homoglyph URL detector | `STATIC` | { "hostname": "example.com", "asciiOnly": true, "nonAsciiChars": [], " |
| Typosquatting detector | `SHALLOW` | Invalid URL |
| Lookalike domain detector | `STATIC` | { "hostname": "example.com", "tld": "com", "suspiciousTLD": false, "br |
| Suspicious TLD checker | `SHALLOW` | Invalid URL |
| URL expander | `VALIDATION` | timeout |
| URL cleaner (UTM) | `REAL` | https://example.com/path/page?a=1 |
| Clipboard hijack detector | `STATIC` | { "zeroWidth": 0, "bidiControls": 0, "homoglyphs": 0, "cryptoAddresses |
| Clipboard sanitizer | `REAL` | The quick brown fox jumps over the lazy dog. It was a bright cold day  |
| PII detector | `STATIC` | { "emails": [], "phones": [], "possibleSecrets": [], "aadhaarLike": [] |
| Credit card validator (Luhn) | `SHALLOW` | Valid |
| IBAN validator | `REAL` | Valid IBAN (DE, check digits 89) |
| SSN format checker | `REAL` | Invalid format |
| Secure notes (encrypted) | `STATIC` | Encrypted note "note" saved. Labels: note |
| Hash verifier | `REAL` | { "algorithm": "SHA-256", "computed": "ba7816bf8f01cfea414140de5dae222 |

### System & Browser

| Tool | Verdict | Output sample |
|---|---|---|
| Tab suspender | `REAL` | Tab discarded |
| Tab group manager | `REAL` | Tab group 1 created |
| Duplicate tab closer | `REAL` | No duplicate tabs found. |
| Tab session save/restore | `REAL` | Saved 0 tab(s) as "The quick brown fox jumps over the lazy dog. It was |
| Tab search | `SHALLOW` | [] |
| Tab pinner | `REAL` | Tab pin state toggled |
| Tab muter | `REAL` | Tab mute state toggled |
| Tab reloader | `REAL` | Tab reloaded |
| Auto-close tabs | `REAL` | No tabs match "the quick brown fox jumps over the lazy dog. it was a b |
| Extension manager | `SHALLOW` | [] |
| Command palette (⌘K) | `REAL` | No tool matches “#336699”. |
| Download manager | `SHALLOW` | [] |
| Bookmark manager | `SHALLOW` | {} |
| Bookmark cleaner | `SHALLOW` | [] |
| Bookmark deduplicator | `SHALLOW` | [] |
| History search | `SHALLOW` | [] |
| History cleaner | `STATIC` | Would delete browsing history for the last day. Tick "Confirm destruct |
| Cache cleaner | `STATIC` | Would clear the browser HTTP cache for all sites. Tick "Confirm destru |
| Cookie cleaner | `STATIC` | Would delete cookies (for the current site only). Tick "Confirm destru |
| LocalStorage viewer/editor | `REAL` | No stored data on this page. |
| SessionStorage viewer/editor | `REAL` | No stored data on this page. |
| IndexedDB viewer/editor | `REAL` | No stored data on this page. |
| Installed fonts viewer | `SHALLOW` | [] |
| Zoom controller | `REAL` | Zoom set to 100% |
| Font size controller | `REAL` | Page font size set to 120%. |
| Theme toggler | `REAL` | Theme follows TTB UI settings. |
| User agent switcher | `ENV` | navigator is not defined |
| Language switcher | `ENV` | navigator is not defined |
| Screen resolution viewer | `ENV` | screen is not defined |
| Device info viewer | `ENV` | navigator is not defined |
| Browser info viewer | `ENV` | navigator is not defined |
| Permission viewer | `SHALLOW` | {} |
| Focus mode | `REAL` | Focus mode applied. |
| Break reminder (20-20-20) | `STATIC` | “Break reminder (20-20-20)” has no handler in this build. It should no |
| Session timer | `STATIC` | “Session timer” has no handler in this build. It should not be in the  |
| Site time tracker | `STATIC` | “Site time tracker” has no handler in this build. It should not be in  |
| Import/export settings | `SHALLOW` | {} |
| Backup/restore | `SHALLOW` | {} |
| Debug console | `STATIC` | { "extensionVersion": "0.10.0", "tabs": 0, "catalog": 563, "permission |

### Text & Writing

| Tool | Verdict | Output sample |
|---|---|---|
| Case converter | `REAL` | The Quick Brown Fox Jumps Over The Lazy Dog. It Was A Bright Cold Day  |
| Trim/dedupe/sort/reverse lines | `REAL` | The quick brown fox jumps over the lazy dog. It was a bright cold day  |
| Remove empty/duplicate lines | `REAL` | The quick brown fox jumps over the lazy dog. It was a bright cold day  |
| Strip HTML/Markdown/URLs | `EMPTY` |  |
| Word/char/line/sentence/paragraph count | `REAL` | { "words": 23, "characters": 118, "charactersNoSpaces": 96, "lines": 1 |
| Reading time | `REAL` | 1 min (at 200 wpm) |
| Speaking time | `REAL` | 1 min (at 130 wpm) |
| Flesch-Kincaid | `REAL` | Reading Ease: 92.17 Grade: 3.26 |
| Gunning Fog | `SHALLOW` | Grade: 4.60 |
| SMOG | `SHALLOW` | Grade: 3.13 |
| Slug generator | `REAL` | the-quick-brown-fox-jumps-over-the-lazy-dog-it-was-a-bright-cold-day-i |
| Lorem ipsum | `REAL` | Laboris aliqua deserunt velit ipsum proident et enim incididunt enim e |
| Base64 encode/decode | `REAL` | aGVsbG8gd29ybGQ= |
| URL encode/decode | `REAL` | https%3A%2F%2Fexample.com%2Fpath%2Fpage%3Fa%3D1%26utm_source%3Dnewslet |
| HTML entity encode/decode | `REAL` | The quick brown fox jumps over the lazy dog. It was a bright cold day  |
| Unicode escape/unescape | `REAL` | \u0054\u0068\u0065\u0020\u0071\u0075\u0069\u0063\u006b\u0020\u0062\u00 |
| ROT13 | `REAL` | Gur dhvpx oebja sbk whzcf bire gur ynml qbt. Vg jnf n oevtug pbyq qnl  |
| Caesar cipher | `REAL` | Gur dhvpx oebja sbk whzcf bire gur ynml qbt. Vg jnf n oevtug pbyq qnl  |
| Morse code | `SHALLOW` | ... --- ... |
| Binary ↔ text | `REAL` | 01010100 01101000 01100101 00100000 01110001 01110101 01101001 0110001 |
| Hex ↔ text | `REAL` | 23333336363939 |
| Leetspeak | `REAL` | 7h3 qu1ck 8r0wn f0x jump5 0v3r 7h3 l4zy d09. 17 w45 4 8r19h7 c0ld d4y  |
| Pig Latin | `REAL` | heTay uickqay rownbay oxfay umpsjay overway hetay azylay ogday. Itway  |
| Reverse text/words | `REAL` | .neetriht gnikirts erew skcolc eht dna ,lirpA ni yad dloc thgirb a saw |
| Palindrome checker | `REAL` | Not a palindrome |
| Anagram finder | `REAL` | Signature: ,..aaaaaabbccccddddeeeeeeeefggghhhhhiiiiiiiijkkkllllmnnnnno |
| Word frequency | `REAL` | the 3 quick 1 brown 1 fox 1 jumps 1 over 1 lazy 1 dog 1 it 1 was 1 a 1 |
| N-gram extractor | `REAL` | 1 the quick 1 quick brown 1 brown fox 1 fox jumps 1 jumps over 1 over  |
| Keyword density | `REAL` | the: 13.04% quick: 4.35% brown: 4.35% fox: 4.35% jumps: 4.35% over: 4. |
| Syllable counter | `REAL` | { "words": 23, "syllables": 28, "averagePerWord": 1.22, "polysyllabic" |
| Passive voice detector | `REAL` | Possible passive constructions (1/2 sentences): • It was a bright cold |
| Adverb highlighter | `REAL` | No -ly adverbs found. |
| Sentence length variance | `SHALLOW` | 6.25 |
| Paragraph reflow | `REAL` | The quick brown fox jumps over the lazy dog. It was a bright cold day  |
| Smart quotes ↔ straight quotes | `REAL` | The quick brown fox jumps over the lazy dog. It was a bright cold day  |
| Dash normalizer | `REAL` | The quick brown fox jumps over the lazy dog. It was a bright cold day  |
| Ellipsis normalizer | `REAL` | The quick brown fox jumps over the lazy dog. It was a bright cold day  |
| Whitespace visualizer | `REAL` | The·quick·brown·fox·jumps·over·the·lazy·dog.·It·was·a·bright·cold·day· |
| Invisible character detector | `SHALLOW` | None found |
| Zero-width char remover | `REAL` | The quick brown fox jumps over the lazy dog. It was a bright cold day  |
| Homoglyph detector | `STATIC` | No mixed-script lookalike characters found. |
| RTL/LTR fixer | `REAL` | ‫The quick brown fox jumps over the lazy dog. It was a bright cold day |
| Bidi char remover | `REAL` | The quick brown fox jumps over the lazy dog. It was a bright cold day  |
| Title case (AP/Chicago/APA) | `REAL` | The Quick Brown Fox Jumps over the Lazy Dog. it Was a Bright Cold Day  |
| Citation formatter | `REAL` | The quick brown fox jumps over the lazy dog. It was a bright cold day  |
| BibTeX formatter | `REAL` | @article{thesample, author = {The quick brown fox jumps over the lazy  |
| Markdown → HTML | `REAL` | <h1>Title</h1><br><br>Some <strong>bold</strong> and <em>italic</em> t |
| HTML → Markdown | `REAL` | # Title Some **bold** and *italic* text. - one - two |
| CSV → Markdown table | `REAL` | \| name \| score \| city \| \| --- \| --- \| --- \| \| A \| 10 \| Pune |
| Text diff | `REAL` | - The quick brown fox jumps over the lazy dog. It was a bright cold da |
| Levenshtein similarity | `REAL` | 0.0423728813559322 |
| Jaccard similarity | `SHALLOW` | 0 |
| Regex extractor | `EMPTY` |  |
| Regex replace preview | `REAL` | Order 1234 shipped on 2024-03-15 to user@example.com |
| Text templating | `REAL` | The quick brown fox jumps over the lazy dog. It was a bright cold day  |
| Emoji picker | `STATIC` | No category matched. Try: smile, love, hand, animal, food, travel, nat |
| Kaomoji library | `STATIC` | (╯°□°）╯︵ ┻━┻ ┬─┬ノ( º _ ºノ) (づ｡◕‿‿◕｡)づ ( •_•)>⌐■-■ ¯\_(ツ)_/¯ ( ͡° ͜ʖ ͡° |
| Unicode browser | `REAL` | T U+0054 84 T h U+0068 104 h e U+0065 101 e U+0020 32 q U+0071 113 q u |
| Font preview | `REAL` | <div style="font-size:22px"><p style="font-family:system-ui;margin:0 0 |
| TTS (Web Speech) | `PLACEHOLDER` | Speech synthesis is not available in this context. |
| STT (Web Speech) | `PLACEHOLDER` | Speech recognition is not available in this browser context. |
| NATO phonetic alphabet | `REAL` | 9 1 9 8 7 6 5 4 3 2 1 0 |

### Unique

| Tool | Verdict | Output sample |
|---|---|---|
| Smart Selection Parser | `REAL` | { "input": "The quick brown fox jumps over the lazy dog. It was a brig |
| Cross-tab copy queue | `REAL` | Queued (1 item(s)). |
| Clipboard history (opt-in) | `REAL` | Saved. History now has 1 item(s). |
| Sticky notes across tabs | `BROWSER` | No result — the page returned nothing for this tool. |
| Screen ruler | `BROWSER` | No result — the page returned nothing for this tool. |
| Color from screen (EyeDropper) | `PLACEHOLDER` | Screen colour picking is not available in the chrome build. The EyeDro |
| Meeting cost calculator | `REAL` | Estimated meeting cost: 0.00 |
| Calendar gap finder | `REAL` | Free slots: 09:00 – 18:00 (540 min) |
| Reading fatigue detector | `REAL` | { "words": 23, "sentences": 2, "averageWordsPerSentence": 11.5, "flagg |
| Auto-pause video on tab switch | `BROWSER` | No result — the page returned nothing for this tool. |
| Resume video across tabs | `BROWSER` | No result — the page returned nothing for this tool. |
| Scroll position memory | `BROWSER` | No result — the page returned nothing for this tool. |
| Page annotations | `BROWSER` | No result — the page returned nothing for this tool. |
| Document redactor | `REAL` | The quick brown fox jumps over the lazy dog. It was a bright cold day  |
| PII highlighter | `REAL` | <div style="font:14px/1.7 system-ui;color:#e8eaed;background:#0f1115;p |
| Page weight→CO₂ estimate | `BROWSER` | No result — the page returned nothing for this tool. |
| Boss key | `BROWSER` | No result — the page returned nothing for this tool. |
| Element copier (selector/XPath/CSS) | `BROWSER` | No result — the page returned nothing for this tool. |
