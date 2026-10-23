# TTB — Tiny Toolbox — Complete Tool List

**Version:** v0.9.0  
**Author:** Dr. Sohil Momin  
**Total catalog entries:** 591  
**Categories:** 18  
**Handlers wired:** 591 (of which 24 are lazy/optional-dependency stubs)  

The catalog in `data/tools.js` is authoritative. Every entry now resolves to a handler; tools that need an optional third-party library (PDF, OCR, Excel, …) report that dependency honestly instead of pretending to work.

## Category summary

| # | Category | Tools |
|---:|---|---:|
| 1 | Accessibility | 13 |
| 2 | Calculators & Converters | 68 |
| 3 | Communication | 15 |
| 4 | Data | 26 |
| 5 | Design & Color | 27 |
| 6 | Developer | 90 |
| 7 | Education | 15 |
| 8 | Finance | 20 |
| 9 | Fun & Misc | 29 |
| 10 | Media & Files | 53 |
| 11 | Network | 6 |
| 12 | Page Tools | 47 |
| 13 | Productivity | 19 |
| 14 | SEO | 10 |
| 15 | Security | 31 |
| 16 | System & Browser | 41 |
| 17 | Text & Writing | 62 |
| 18 | Unique | 19 |

## Tools by category

### Accessibility (13)

- Accessibility auditor (axe-core lazy) _(lazy dependency)_
- Dyslexia font toggle
- Letter-spacing adjuster
- Word-spacing adjuster
- Reading guide (ruler)
- Reading mask
- ARIA inspector
- Keyboard navigation tester
- Focus indicator viewer
- Motion reducer
- Animation pauser
- Flashing content detector
- Alt text viewer

### Calculators & Converters (68)

- Live calculator
- Scientific
- Matrix
- Percentage
- Tip
- Discount
- Tax/VAT/GST
- Loan/EMI
- Amortization
- Compound interest
- Simple interest
- ROI/ROAS
- Break-even
- Markup/margin
- Salary↔hourly
- Overtime
- Freelance rate
- Age
- Date difference
- Business days
- Add/subtract date
- Week number
- Day of week
- Zodiac
- Chinese zodiac
- Time zone converter
- Unix timestamp
- ISO 8601
- Cron time
- Stopwatch
- Countdown
- Pomodoro
- Unit converter
- Length/weight/temp/area/volume
- Speed/pressure/energy/power
- Fuel economy
- Cooking
- Byte converter
- Data rate
- Frequency/wavelength
- Angle
- Base converter
- Roman numerals
- Binary/octal/hex
- Fraction↔decimal
- Scientific notation
- Significant figures
- Rounding
- Prime checker
- GCD/LCM
- Factorial/permutations
- Fibonacci
- Statistics
- Percentile/quartile
- Correlation
- Linear regression
- Probability
- Random number
- Random from list
- Dice
- Coin flip
- Password generator
- PIN generator
- BMI/BMR/TDEE
- Body fat
- Pace/speed
- Fuel cost
- Electricity cost

### Communication (15)

- Email composer (mailto)
- Signature generator
- Template library
- Subject line tester
- Email validator
- Phone validator
- SMS link gen
- WhatsApp link gen
- Telegram link gen
- Signal link gen
- Zoom link gen
- Meet link gen
- ICS calendar invite
- vCard generator
- vCard QR code _(lazy dependency)_

### Data (26)

- CSV viewer/editor
- CSV→JSON/SQL/Markdown/Excel
- JSON viewer
- XML viewer
- YAML viewer
- Excel viewer (lazy) _(lazy dependency)_
- Table sorter
- Table filter
- Table dedup
- Pivot table
- Data cleaner
- Data validator
- Schema detector
- Chart generator
- Histogram
- Box plot
- Scatter plot
- Heatmap
- Correlation matrix
- Outlier finder
- Encoding detector
- Line-ending converter
- Delimiter detector
- Duplicate finder
- Fuzzy match
- Fake-data generator

### Design & Color (27)

- Color converter
- Palette generator
- Palette from image
- Color harmony
- Contrast checker
- Color blindness simulator
- Gradient generator
- Box shadow
- Text shadow
- Border radius
- Transform
- Filter playground
- Blend mode playground
- Clip-path gen
- OG image gen
- Placeholder image gen
- Pattern gen
- Aspect ratio
- Typography scale
- Font pairing
- Spacing scale
- Design tokens
- CSS variables
- Animation builder
- Keyframe builder
- Transition builder
- Bezier editor

### Developer (90)

- JSON format/validate/minify
- JSON→TypeScript
- JSON→Go/Rust/Python
- JSON→SQL/CSV/YAML/XML
- JSON Schema gen
- JSONPath eval
- JSON diff
- YAML↔JSON
- XML format
- XML→JSON
- CSV↔JSON
- TOML parser
- INI parser
- .env parser
- Regex tester
- Cron explainer
- Cron next-run
- UUID v4/v7
- ULID
- NanoID
- JWT decode
- JWT verify (HS256)
- Base64 URL-safe
- Base32
- Base58
- URL parser
- Query string parser
- HTTP header parser
- HTTP status lookup
- MIME lookup
- Hash (MD5/SHA-1/256/512)
- HMAC
- Diff tool
- JS/CSS/HTML beautify
- JS/CSS/HTML minify
- CSS specificity
- CSS selector gen
- XPath gen
- Color picker
- Hex↔RGB↔HSL↔CMYK
- Color contrast (WCAG)
- Palette extractor
- Gradient gen
- Box shadow gen
- Border radius gen
- CSS transform gen
- Flexbox playground
- Grid playground
- SVG→JSX
- SVG→PNG
- Favicon gen
- Meta tag gen
- OG/Twitter preview
- Robots.txt tester
- Sitemap validator
- HTML validator
- Prettier (lazy) _(lazy dependency)_
- Markdown preview
- ASCII table
- CSV table
- SQL formatter
- SQL→MongoDB
- Regex→SQL
- GraphQL builder
- WebSocket tester
- SSE inspector
- CORS tester
- Cookie inspector
- LocalStorage viewer
- SessionStorage viewer
- IndexedDB viewer
- CacheStorage viewer
- HAR viewer
- IP subnet
- MAC checker
- Port reference
- HSTS/CSP/SRI checker
- Git commit templates
- .gitignore gen
- Dockerfile gen
- Docker Compose gen
- K8s YAML gen
- Nginx config gen
- Makefile gen
- Bash/PowerShell snippets
- SSH config gen
- Big-O cheatsheet
- Design patterns
- Sorting visualizer
- Path finding visualizer

### Education (15)

- Periodic table
- Unit circle
- Multiplication table
- Formula reference
- Typing tutor
- Typing speed test
- Morse practice
- Keyboard shortcuts
- Alphabet reference
- Number system reference
- Country info
- Flag identifier
- Flashcards
- Quiz maker
- Study timer

### Finance (20)

- Loan
- EMI
- Mortgage
- Retirement estimate
- Savings goal
- ROI
- Profit margin
- Markup
- Tax
- VAT/GST
- Invoice generator
- Quote generator
- Receipt generator
- Expense tracker
- Budget planner
- Debt payoff (snowball/avalanche)
- Salary converter
- Meeting cost
- Project cost
- Invoice number gen

### Fun & Misc (29)

- Random joke
- Random quote
- Random fact
- Random name
- Random password
- Random color
- Decision maker
- Magic 8-ball
- RPS
- Tic-tac-toe
- Sudoku gen/solve
- Word search gen
- Minesweeper
- 2048
- Snake
- Tetris-mini
- Pong
- Memory match
- Reaction time test
- Typing test
- Trivia quiz
- Riddle library
- Fortune cookie
- Biorhythm
- Birthday countdown
- Anniversary tracker
- Age in days/hours
- Life in weeks
- Countdown to holiday

### Media & Files (53)

- Image compressor
- Image resizer
- Image cropper
- Image rotator/flipper
- Format converter (PNG/JPG/WebP/AVIF)
- Quality adjuster
- Image filters
- Watermarker
- Annotator
- Blur/pixelate
- Redactor
- Border/padding/rounding
- Collage
- Splitter (grid)
- Stitcher
- Comparison (diff)
- EXIF viewer
- EXIF remover
- GPS extractor
- Color extractor
- Image→base64
- Image→PDF _(lazy dependency)_
- GIF→frames
- Frames→GIF
- QR gen
- QR scan
- Barcode gen
- Barcode scan
- PDF merge _(lazy dependency)_
- PDF split _(lazy dependency)_
- PDF rotate _(lazy dependency)_
- PDF reorder _(lazy dependency)_
- PDF→images _(lazy dependency)_
- PDF→text _(lazy dependency)_
- PDF metadata viewer _(lazy dependency)_
- PDF metadata cleaner _(lazy dependency)_
- PDF page numbers _(lazy dependency)_
- PDF watermark _(lazy dependency)_
- PDF crop _(lazy dependency)_
- PDF form filler _(lazy dependency)_
- PDF signature _(lazy dependency)_
- Images→PDF _(lazy dependency)_
- ZIP extract
- ZIP create
- TAR extract
- GZIP extract
- File type detector
- File hash calculator
- Screen recorder
- Audio recorder
- Webcam capture
- Screenshot annotator
- OCR (lazy) _(lazy dependency)_

### Network (6)

- Subnet calculator
- CIDR converter
- HTTP header viewer
- Redirect viewer
- URL shortener resolver
- QR link gen

### Page Tools (47)

- Extract links/images/emails/phones/hashtags/mentions
- Extract tables→CSV
- Extract form fields
- Extract meta tags
- Extract headings/alt text
- Extract iframes/scripts/stylesheets
- Extract fonts/colors/SVG
- Extract videos/audio/PDF links
- Page→Markdown/Plain text/Clean HTML/JSON
- Reading mode
- Dark mode
- Sepia
- High contrast
- Grayscale
- Dyslexia font
- Larger text
- Line-height adjuster
- Print cleaner
- Screenshot (visible)
- Full-page screenshot
- Sticky notes
- Highlight & annotate
- Save scroll position
- Auto-refresh
- Page change monitor
- Element hider
- Element picker
- Computed CSS inspector
- Font inspector
- Box model inspector
- Accessibility auditor (lazy) _(lazy dependency)_
- Contrast auditor
- Broken image detector
- Slow resource finder
- Page weight analyzer
- SEO snapshot
- Schema.org extractor
- Hreflang checker
- Canonical checker
- Cookie banner dismisser
- Newsletter popup killer
- Form autofill
- Form data exporter
- Copy URL as Markdown/HTML/citation
- Copy table as Markdown/CSV
- Video speed controller
- Autoplay blocker

### Productivity (19)

- Multiple timers
- Alarms
- Reminders
- Recurring reminders
- Task list
- Todo from selection
- Eisenhower matrix
- Time blocking
- Habit tracker
- Streak tracker
- Goal tracker
- Countdown to date
- Days-since tracker
- Break reminder
- Posture reminder
- Hydration reminder
- DND
- Site blocker
- Daily limit enforcer

### SEO (10)

- Title analyzer
- Meta description analyzer
- Heading structure
- OG preview
- Twitter card preview
- SERP snippet preview
- HTML basic validator
- Structured data tester
- UTM builder
- UTM parser

### Security (31)

- Evidence capture (SHA-256 + timestamp)
- Chain-of-custody screenshot
- Password strength meter (zxcvbn) _(lazy dependency)_
- Passphrase generator (EFF)
- TOTP (RFC 6238)
- HOTP (RFC 4226)
- Base32 for TOTP
- AES-GCM encrypt/decrypt
- PBKDF2
- OpenPGP viewer (lazy) _(lazy dependency)_
- Cookie inspector/editor
- Cookie third-party analyzer
- Fingerprint detector
- Canvas fingerprint blocker
- WebRTC IP leak test
- IP address viewer
- Homoglyph URL detector
- Typosquatting detector
- Lookalike domain detector
- Suspicious TLD checker
- URL expander
- URL cleaner (UTM)
- Clipboard hijack detector
- Clipboard sanitizer
- PII detector
- Credit card validator (Luhn)
- IBAN validator
- SSN format checker
- Secure notes (encrypted)
- File metadata stripper
- Hash verifier

### System & Browser (41)

- Tab suspender
- Tab group manager
- Duplicate tab closer
- Tab session save/restore
- Tab search
- Tab pinner
- Tab muter
- Tab reloader
- Auto-close tabs
- Extension manager
- Command palette (⌘K)
- Download manager
- Bookmark manager
- Bookmark cleaner
- Bookmark deduplicator
- History search
- History cleaner
- Cache cleaner
- Cookie cleaner
- LocalStorage viewer/editor
- SessionStorage viewer/editor
- IndexedDB viewer/editor
- Installed fonts viewer
- Zoom controller
- Font size controller
- Theme toggler
- User agent switcher
- Language switcher
- Screen resolution viewer
- Device info viewer
- Browser info viewer
- Permission viewer
- Notification blocker
- Popup blocker
- Focus mode
- Break reminder (20-20-20)
- Session timer
- Site time tracker
- Import/export settings
- Backup/restore
- Debug console

### Text & Writing (62)

- NATO phonetic alphabet

- Case converter
- Trim/dedupe/sort/reverse lines
- Remove empty/duplicate lines
- Strip HTML/Markdown/URLs
- Word/char/line/sentence/paragraph count
- Reading time
- Speaking time
- Flesch-Kincaid
- Gunning Fog
- SMOG
- Slug generator
- Lorem ipsum
- Base64 encode/decode
- URL encode/decode
- HTML entity encode/decode
- Unicode escape/unescape
- ROT13
- Caesar cipher
- Morse code
- Binary ↔ text
- Hex ↔ text
- Leetspeak
- Pig Latin
- Reverse text/words
- Palindrome checker
- Anagram finder
- Word frequency
- N-gram extractor
- Keyword density
- Syllable counter
- Passive voice detector
- Adverb highlighter
- Sentence length variance
- Paragraph reflow
- Smart quotes ↔ straight quotes
- Dash normalizer
- Ellipsis normalizer
- Whitespace visualizer
- Invisible character detector
- Zero-width char remover
- Homoglyph detector
- RTL/LTR fixer
- Bidi char remover
- Title case (AP/Chicago/APA)
- Citation formatter
- BibTeX formatter
- Markdown → HTML
- HTML → Markdown
- CSV → Markdown table
- Text diff
- Levenshtein similarity
- Jaccard similarity
- Regex extractor
- Regex replace preview
- Text templating
- Emoji picker
- Kaomoji library
- Unicode browser
- Font preview
- TTS (Web Speech)
- STT (Web Speech)

### Unique (19)

- Smart Selection Parser
- Cross-tab copy queue
- Clipboard history (opt-in)
- Sticky notes across tabs
- Screen ruler
- Color from screen (EyeDropper)
- Meeting cost calculator
- Calendar gap finder
- Reading fatigue detector
- Auto-pause video on tab switch
- Resume video across tabs
- Scroll position memory
- Page annotations
- Screenshot→Markdown table (lazy) _(lazy dependency)_
- Document redactor
- PII highlighter
- Page weight→CO₂ estimate
- Boss key
- Element copier (selector/XPath/CSS)
