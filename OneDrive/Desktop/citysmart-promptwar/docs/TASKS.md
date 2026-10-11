# Roamly — Task Checklist

> Update this file after every task. Use [x] for done, [ ] for pending, [~] for in-progress, [!] for blocked.
> Format: `[x] Task description — Phase N, Priority P0/P1/P2`

---

## Phase 0 — Inspect, Rename, Memory Files ✅

- [x] Read all existing files (backend/main.py, smoke_test.py, frontend/src/*, API.md, SPEC.md) — Phase 0
- [x] Create docs/RULES.md — Phase 0
- [x] Create docs/PRD.md — Phase 0
- [x] Create docs/MEMORY.md — Phase 0
- [x] Create docs/TASKS.md (this file) — Phase 0
- [x] Create docs/DESIGN.md — Phase 0
- [x] Create PROGRESS.md at root — Phase 0
- [x] Create AGENTS.md at root — Phase 0
- [x] Rename backend logger from `citysmart` → `roamly` — Phase 0
- [x] Rename FastAPI title from `CitySmart API` → `Roamly API` — Phase 0
- [x] Update User-Agent from `CitySmart-student-project/1.0` → `Roamly-student-project/1.0` — Phase 0
- [x] Update smoke_test.py header string — Phase 0
- [x] Create .agent/rules/roamly.md (mirror of RULES.md) — Phase 0
- [x] Create frontend/src/config/categories.js — Phase 0
- [x] Create root README.md with setup steps — Phase 0
- [x] Run backend smoke tests and verify 11/11 PASS — Phase 0
- [x] Run npm run dev and confirm no build errors — Phase 0
- [x] Git commit phase(0) — Phase 0

---

## Phase 1 — Location Awareness (End-to-End) ✅

- [x] Geolocation on first load (granted → use coords, denied → toast + fallback Pune) — Phase 1, P0
- [x] Sticky "Searching near:" bar with location name — Phase 1, P0
- [x] "Change location" button → modal → Nominatim geocode → updates activeLocation — Phase 1, P0
- [x] "Use my location" button re-prompts GPS — Phase 1, P0
- [x] Radius selector chips (1/3/5/10 km) → re-queries /api/places — Phase 1, P0
- [x] Map re-centers on location change (flyTo) — Phase 1, P0
- [x] `map.invalidateSize()` on tab switch — Phase 1, P0
- [x] Data-source badge on place cards ("Live: OpenStreetMap" / "Demo data") — Phase 1, P0
- [x] "Unavailable" empty state when live fetch fails far from seed coverage — Phase 1, P0
- [x] Debounce city search input (300 ms) in LocationModal — Phase 1, P0
- [x] City-neutral AI suggested prompts (remove "Pune" hardcoding) — Phase 1, P0
- [x] Weather widget uses userLocation lat/lng (not hardcoded Pune) — Phase 1, P0
- [x] Frontend localStorage cache for places with TTL — Phase 1, P0

---

## Phase 2 — Explore & Place Details Polish [x]

- [x] One-pass premium visual redesign matching reference image (clean blue/navy, hero banner, floating filter card, 4 circular feature highlights, image-based cards with badges, Why Choose Roamly 2x2 grid + promo banner, newsletter strip, and polished footer) — Phase 2, P0
- [x] Honesty cleanup: Real data badges only (Top rated, Free, Nearest, Heritage), remove mock badges; rename highlights to transparent labels; illustrative visual headers; demo newsletter banner — Phase 2, P0
- [x] Split App.jsx into separate component files under frontend/src/components/ (ExploreTab, PlaceCard, FilterPanel, LocationBar, Hero, Footer, AssistantTab, CompareTab, LocationModal each < 200 lines) — Phase 2
- [x] Place Details drawer: show description with Wikipedia enrichment if `wikipedia` tag exists (cached REST summary + thumbnail with "Source: Wikipedia" label) — Phase 2, P0
- [x] Place Details drawer: Wikimedia photo thumbnail if available — Phase 2, P1
- [x] Favorites / Save: persist to localStorage with count badge in navbar — Phase 2, P1
- [ ] Add `lucide-react` icons to category chips — Phase 2, P0
- [ ] "Open Now" filter (compare current time to `hours` field) — Phase 2, P1
- [ ] Distance filter from current location — Phase 2, P0
- [ ] Accessibility filter chip — Phase 2, P1
- [ ] Map: click marker → opens Place Details drawer — Phase 2, P0

---

## Phase 3 — AI Assistant & Compare Upgrade [ ]

- [ ] Install `recharts` — Phase 3, P0
- [ ] Compare: radar chart for available numeric dimensions — Phase 3, P0
- [ ] Compare: note which dimensions are excluded from chart (null values) — Phase 3, P0
- [ ] AI: city-neutral suggested prompts — Phase 3, P0
- [ ] AI: response shows `data_source` badge — Phase 3, P0
- [ ] AI: map updates when assistant returns places — Phase 3, P0
- [ ] AI: sends `user_location.name` in payload — Phase 3, P0

---

## Phase 4 — Dashboard / Home Tab [ ]

- [ ] Add "Home" tab to navigation — Phase 4, P0
- [ ] Weather card (current temp, condition, icon) — Phase 4, P0
- [ ] Air quality card (Open-Meteo AQI endpoint) — Phase 4, P0
- [ ] Backend: `GET /api/air-quality?lat=…&lng=…` endpoint — Phase 4, P0
- [ ] Traffic mood chip (time-of-day heuristic, labeled "Estimated") — Phase 4, P0
- [ ] Roamly Pulse (0–100) composite from weather + AQI + traffic + report density — Phase 4, P0
- [ ] Pulse shows which inputs were used and confidence level — Phase 4, P0
- [ ] Quick-action tiles (Explore, Map, AI, Report) — Phase 4, P0

---

## Phase 5 — History & Culture [ ]

- [ ] Heritage layer toggle on map (historic=* + tourism=museum markers) — Phase 5, P1
- [ ] Heritage story cards with Wikipedia summary — Phase 5, P1
- [ ] Heritage trail builder (pick 3–6 sites, OSRM walking route) — Phase 5, P1
- [ ] Backend: `GET /api/wiki-summary?title={title}` (Wikipedia REST proxy) — Phase 5, P1

---

## Phase 6 — Citizen Reports [ ]

- [ ] Backend: SQLite or JSON file for reports storage — Phase 6, P1
- [ ] Backend: `POST /api/reports` (create report) — Phase 6, P1
- [ ] Backend: `GET /api/reports` (browse reports) — Phase 6, P1
- [ ] Backend: AI classification of report category + severity (Gemini or regex) — Phase 6, P1
- [ ] Frontend: floating "Report" button (mobile) — Phase 6, P1
- [ ] Frontend: report form (category, description, map pin, optional photo) — Phase 6, P1
- [ ] Frontend: report browse page (by category, status, time) — Phase 6, P1
- [ ] Verification badge logic (Unverified → Verified at 3+ independent) — Phase 6, P1

---

## Phase 7 — Safety Layers & Insights [ ]

- [ ] Install `leaflet.heat` for heatmap — Phase 7, P1
- [ ] Backend: `GET /api/places?category=safety` (police, hospitals from OSM) — Phase 7, P1
- [ ] Safety layer toggles on map — Phase 7, P1
- [ ] SOS card: nearest police + hospital + country emergency numbers — Phase 7, P1
- [ ] Backend: emergency numbers by country (India: 112/100/108) — Phase 7, P1
- [ ] Insights page: Recharts bar/line for reports by category and time — Phase 7, P1
- [ ] AI "What's happening today" summary from reports + weather — Phase 7, P1

---

## Phase 8 — Polish & Accessibility [ ]

- [ ] Install `framer-motion` — Phase 8, P2
- [ ] Page/tab transition animations — Phase 8, P2
- [ ] Dark/light theme toggle (dark = deep navy #0B1020) — Phase 8, P2
- [ ] Switch to violet-cyan-pink accent gradient (dark theme) — Phase 8, P2
- [ ] Aria labels on all interactive elements — Phase 8, P0
- [ ] Keyboard navigation audit — Phase 8, P0
- [ ] Lighthouse audit ≥ 80 — Phase 8, P0
- [ ] Responsive check at 375px — Phase 8, P0
- [ ] Bottom navigation on mobile — Phase 8, P0
- [ ] PWA manifest — Phase 8, P2
- [ ] README with demo script — Phase 8, P0
- [ ] Final smoke test pass — Phase 8, P0
