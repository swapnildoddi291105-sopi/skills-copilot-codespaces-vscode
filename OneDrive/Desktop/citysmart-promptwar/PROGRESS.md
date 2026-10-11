# Roamly — Progress Log

> Top of file always shows current status. Append new entries at the bottom.

---

## Status Summary

| Field | Value |
|---|---|
| **Current Phase** | Phase 4 — Dashboard / Home Tab [Complete] ✅ |
| **Overall Progress** | ~65% (Phase 0, 1, 2, 3, 4 Complete) |
| **Next 3 Actions** | 1. Phase 5 History & Culture layer · 2. Add lucide-react icons · 3. Phase 6 Citizen Reports |
| **Blockers** | None |
| **Last Updated** | 2026-10-11 |

---

## Changelog

### 2026-10-09 — Phase 0: Project Inspection & Rename

**What was inspected:**
- `backend/main.py` (721 lines): Full FastAPI app with Overpass, Nominatim, Open-Meteo, Gemini, seed fallback. "CitySmart" appears in: logger name, FastAPI title, User-Agent header, smoke test header.
- `backend/smoke_test.py` (104 lines): 11-test suite, tolerant of network timeouts.
- `frontend/src/App.jsx` (556 lines): React app with Context, 4 tabs (Explore/Map/AI/Compare), Location modal, shimmer skeletons. "Roamly" already in navbar (renamed in previous session).
- `frontend/src/MapView.jsx`: Leaflet map, flyTo on location change, `invalidateSize()` on tab switch, pulsing user marker divIcon.
- `frontend/src/PlaceDrawer.jsx`: Slide-in drawer, metadata box with source/last_verified.
- `frontend/src/api.js`: Thin API wrapper, toggles mock/real via `VITE_USE_MOCK`.
- `frontend/src/mock.js`: 12 Pune seed places, full mock for all endpoints matching API.md shapes.
- `frontend/src/index.css` (914 lines): White + Warm Orange theme, CSS variables, shimmer, pulse animation.
- `SPEC.md`, `API.md`: Both exist, describe CitySmart/Roamly features and API contract.

**What was built (Phase 0):**
- Created `docs/RULES.md` — coding law (12 sections)
- Created `docs/PRD.md` — product requirements with personas, stories, flows, risks
- Created `docs/MEMORY.md` — architecture decisions, API endpoints, env vars, known bugs, folder structure
- Created `docs/TASKS.md` — phased checklist (Phases 0–8, all priorities)
- Created `docs/DESIGN.md` — current theme fully documented, target dark navy theme documented for Phase 8
- Created `PROGRESS.md` (this file)
- Created `AGENTS.md` at root
- Created `.agent/rules/roamly.md` (mirrors RULES.md)
- Created `frontend/src/config/categories.js` (single source of truth)
- Created root `README.md`
- Renamed in `backend/main.py`: logger `citysmart` → `roamly`, title `CitySmart API` → `Roamly API`, User-Agent `CitySmart-student-project/1.0` → `Roamly-student-project/1.0`
- Updated `backend/smoke_test.py`: header string updated
- Run `backend/smoke_test.py` → results logged below
- Run `npm run dev` → results logged below

**Files changed in Phase 0:**
- `docs/RULES.md` (new)
- `docs/PRD.md` (new)
- `docs/MEMORY.md` (new)
- `docs/TASKS.md` (new)
- `docs/DESIGN.md` (new)
- `PROGRESS.md` (new)
- `AGENTS.md` (new)
- `.agent/rules/roamly.md` (new)
- `frontend/src/config/categories.js` (new)
- `README.md` (new)
- `backend/main.py` (3 rename changes)
- `backend/smoke_test.py` (1 rename change)

**Decisions made:**
- User-Agent set to `Roamly-student-project/1.0` (descriptive, identifies the project)
- DESIGN.md documents current theme as-is, Phase 8 target clearly separated — no restyling in Phase 0
- TASKS.md marks Phase 1 location items: some are done (geolocation, sticky bar, modal, radius, flyTo, data-source badge), some pending (debounce, "unavailable" state, city-neutral prompts, weather using userLocation)

**Smoke test results:** 11/11 PASSED (Backend verified)
**npm run dev results:** Frontend running cleanly with zero build errors

---

### 2026-10-09 — Phase 1: Location Awareness (Completed)

**What was built & enhanced:**
- **City Search Debounce**: Added 300ms input debounce in `LocationModal` with auto-triggering search when typing 3+ characters.
- **Weather Widget Location Sync**: Connected `fetchWeather({ lat, lng })` to `userLocation` state changes.
- **LocalStorage TTL Caching**: Implemented 5-minute TTL caching layer in frontend for place query parameters (`roamly_places_*`).
- **Data Source & Unavailable State**: Added `dataSource` state tracking and clear alert banner when backend returns `data_source: "unavailable"`.
- **City-Neutral AI Prompts**: Replaced hardcoded "Pune" prompts with city-neutral location prompts ("near me", "in the area").

**Files changed in Phase 1:**
- `frontend/src/App.jsx` (added caching, weather lat/lng, debounced modal search, unavailable banner, city-neutral prompts)
- `docs/TASKS.md` (marked Phase 1 items complete)
- `PROGRESS.md` (logged Phase 1 progress)

**Verification:**
- Backend Smoke Test: 11/11 PASSED
- Frontend Dev Server: Active with zero compile warnings/errors

---

### 2026-10-09 — Final Verification & CORS/Health Diagnosis

**What was done:**
- Diagnosed CORS headers and environment handling for deployment origins (`FRONTEND_ORIGINS`).
- Added missing `GET /health` endpoint returning `{"status": "ok"}` for deployment health checks.
- Fixed CORS middleware configuration in `backend/main.py` to handle dynamic origins and prevent invalid wildcard credentials.
- Verified `frontend/src/api.js` dynamically uses `VITE_API_URL`.
- Ran full backend smoke test suite (`smoke_test.py`): 11/11 PASSED.
- Confirmed git tracking excludes all `.env` files (only `backend/.env.example` tracked).

**Files changed:**
- `backend/main.py`: Updated CORS settings to parse `FRONTEND_ORIGINS` and added `GET /health`.
- `PROGRESS.md`: Appended final verification entry.

**Verification:**
- `python backend/smoke_test.py`: 11 PASSED, 0 FAILED.

---

### 2026-10-11 — One-Pass Frontend Redesign (Reference Design Implementation)

**What was built & enhanced:**
- **Color Palette & Design System**: Transformed theme to crisp white/light-blue background (`#F5F9FE`, `#EAF3FF`), primary blue `#0863C5`, deep navy text `#102440`, muted text `#65758B`, and custom rounded containers (`border-radius: 18px` and `24px`).
- **Typography**: Added Google Fonts *Plus Jakarta Sans* and *Playfair Display* (for cursive highlights) into `frontend/index.html`.
- **Top Navigation Bar**: Replaced plain header with reference-style compact navbar featuring brand logo badge, stylish title with cursive accent, weather pill, support contact pill (`+1 234 567 8900`), and user profile avatar.
- **Hero Section**: Designed prominent hero section with badge pill (`EXPLORE. DREAM. DISCOVER.`), bold headline with cursive highlighted phrase (`Discover Amazing Places with Us`), dynamic subtitle tailored to user's active city, and prominent "Explore Now →" CTA button.
- **Floating Search & Filter Panel**: Implemented floating white panel with category pills, multi-parameter inputs (Keyword/Place, City/Area, Max Budget ₹, Min Rating), and prominent blue Search button, plus dynamic radius selection pills.
- **4 Feature Highlights**: Added row of 4 circular icon highlight cards ("Best Local Value", "Smart AI Itineraries", "Zero Bias Guarantee", "Handpicked Spots").
- **Visual Place Cards**: Upgraded place cards into image-rich cards with badges (`Bestseller`, `Popular`, `Trending`), category badges, verified data source tags, location metadata, pricing indicators (`From ₹...` / `Free`), star ratings, distance metrics, and functional "Compare" checkbox.
- **Secondary Feature Section**: Built "Why Choose Roamly?" 2x2 grid alongside the "Your Next Adventure Awaits!" promotional photo card.
- **Newsletter Banner**: Implemented bottom blue newsletter banner with responsive email subscription form and social icons.
- **Polished Footer**: Multi-column clean footer with brand overview, category shortcuts, transparency notes, and copyright.

**Files changed:**
- `frontend/index.html`: Added *Plus Jakarta Sans* and *Playfair Display* Google fonts.
- `frontend/src/index.css`: Redesigned full theme tokens, hero layout, floating filter card, image cards, features, and responsive rules.
- `frontend/src/App.jsx`: Integrated hero banner, floating filter, feature strip, card imagery, promo banner, newsletter strip, and structured footer while preserving all existing routes, state context, and backend APIs.
- `docs/TASKS.md`, `docs/MEMORY.md`, `PROGRESS.md`: Updated checklist, decisions, and progress log.

**Verification:**
- Production build `npm run build`: PASSED (vite v6.4.4, built in 3.42s with 0 errors).
- Functionality verified: Geolocation, city change modal, live filter query updates, tab navigation, drawer view, and compare feature.

---

### 2026-10-11 — Phase 2 Finish: Honesty Cleanup, Modularization, Favorites & Wikipedia Enrichment

**What was built & refined:**
- **Honesty Cleanup (Strict zero-fabrication rules)**:
  - Place card badges now compute exclusively from genuine data: `"Top rated"` (rating >= 4.5), `"Free"` (price = 0), `"Nearest"` (smallest distance), and `"Heritage"` (historical category). Removed speculative badges ("Bestseller", "Popular", "Trending").
  - Renamed feature highlights to transparent phrases: *"Open data, no sponsored listings"*, *"Places from OpenStreetMap"*, and *"AI place assistant"*.
  - Replaced stock photos with honest category glyph visuals labeled `"Category Visual"`, reserving real photography strictly for verified Wikimedia/Wikipedia assets.
  - Labeled the newsletter subscription card as `"Demo"` and disabled submission.
  - Ensured missing attributes explicitly show `"Not available"`.
- **Modularization**:
  - Split `App.jsx` from a monolithic file into clean, modular components inside `frontend/src/components/`:
    - `LocationBar.jsx` (~20 lines)
    - `LocationModal.jsx` (~50 lines)
    - `Hero.jsx` (~28 lines)
    - `FilterPanel.jsx` (~125 lines)
    - `PlaceCard.jsx` (~90 lines)
    - `ExploreTab.jsx` (~195 lines)
    - `AssistantTab.jsx` (~90 lines)
    - `CompareTab.jsx` (~65 lines)
    - `Footer.jsx` (~55 lines)
  - Result: `App.jsx` reduced to ~230 lines of clean state orchestration.
- **Favorites & Enrichment**:
  - Saved places persist to `localStorage` under `roamly_saved_places`.
  - Added live `Favorites (N)` badge in the top navigation bar.
  - Added `/api/wiki-summary?title=...` proxy in FastAPI (`backend/main.py`) with memory caching.
  - Place details drawer (`PlaceDrawer.jsx`) displays Wikipedia encyclopedia extract & Wikimedia thumbnail with label `"Source: Wikipedia"` when a place has a `wikipedia` tag.
- **Branch**:
  - Switched to git branch `phase-2-finish`.

**Verification:**
- `python backend/smoke_test.py`: 11/11 PASSED.
- `GET /api/wiki-summary?title=Shaniwar_Wada`: 200 OK (returned authentic summary).
- `npm run build`: PASSED (built in 11.89s, 0 errors).
- Tabs verified: Explore, Map, AI Assistant, and Compare all functional.

---

### 2026-10-11 — Phase 3: AI Assistant & Compare Upgrade (Completed)

**What was built & refined:**
- **Wikipedia Proxy Verification (Backend)**:
  - Verified `GET /api/wiki-summary` enforces `User-Agent: Roamly-student-project/1.0`, timeout of 5.0s, in-memory caching in `WIKIPEDIA_CACHE` (10-minute TTL), and clean fallback JSON (`{"title": title, "extract": null, "thumbnail": null}`) on error.
- **Compare Tab: Recharts Radar Chart**:
  - Integrated `recharts` radar chart for 2–4 places with exactly 3 numeric axes:
    - `Rating` (0–5 scaled to 0–100)
    - `Affordability` (inverse of `price_inr` relative to compared places)
    - `Proximity` (inverse of `distance_km` relative to compared places)
  - Zero text conversion into numbers (cleanliness & accessibility retained exclusively in table).
  - Dynamic exclusion note: `"Not charted: <Metric> (missing for <Place>)"`.
  - Hides radar and falls back cleanly to the table if < 3 axes remain.
  - Subtitle explicitly notes: *"Relative to the selected places"*.
  - Added individual "Remove" button per place card/column.
- **AI Assistant Enhancements**:
  - Displays resolved search location badge (`"Searched in: <Location>"`).
  - Clicking any recommendation opens details drawer and updates map pins / centers map.
  - Added cold-start server awakening banner (`"Waking up the server & parsing filters..."`) with retry button on error.
  - Empty-state suggestion chips with guidance to loosen filters.
  - Grounded responses that only mention returned places and explicitly disclose missing prices/ratings.
- **Branch**:
  - Switched to git branch `phase-3`.

**Verification:**
- `python backend/smoke_test.py`: 11/11 PASSED.
- `npm run build`: PASSED (built cleanly with 0 errors).
- Queries tested: `"Find historical places near me"`, `"Find museums in London"`, and `"asdfgh"`.
- Radar comparison tested with 2 and 3 places (including places with missing ratings).

---

### 2026-10-11 — Phase 4: Dashboard / Home Tab & Quick Fixes (Completed)

**What was built & refined:**
- **Quick Fixes (Frontend)**:
  - Replaced all blocking browser `alert()` invocations with non-blocking inline toasts in `App.jsx` and `MapView.jsx`.
  - For geolocation errors / rejections: shows `"Couldn't get your location. Check browser permission. Showing Pune."` and cleanly retains the default city.
  - Completely removed the mock `"Live City Help +1 234 567 8900"` support pill from the navbar.
- **Backend Endpoints (`backend/main.py`)**:
  - `GET /api/air-quality?lat=&lng=`: Proxies Open-Meteo Air Quality API (US AQI, European AQI, PM2.5, category), enforces 5.0s timeout, 10-minute in-memory caching (`AIR_QUALITY_CACHE`), and safe empty fallback JSON on error.
  - `GET /api/traffic-estimate?lat=&lng=`: Returns time-of-day traffic heuristic (e.g. rush hour 8–10 and 17–20 as Heavy, otherwise Moderate/Light), clearly labeled `"label": "Estimated"` with a one-line `"basis"` explanation.
- **Dashboard / Home Tab (`frontend/src/components/HomeTab.jsx`)**:
  - Added new "Home" tab to navigation with responsive dashboard cards:
    - Current weather card (temp, condition, Open-Meteo source, fetch time).
    - Air Quality card (AQI score, category badge, PM2.5, Open-Meteo source, fetch time).
    - Traffic Flow card (level, chip labeled "Estimated", heuristic model basis, fetch time).
    - Quick-action tiles linking seamlessly to Explore, Map, AI Assistant, and Compare tabs.
  - **Roamly Pulse (0–100)**: Computed dynamically from available inputs (weather comfort, AQI, traffic pace). Rescales cleanly if inputs are missing; displays inputs used, confidence rating (High/Medium/Low), and explicit disclaimer: *"Pulse is an indicator, not an official score."*
  - Complete error states with Retry button, loading states, and "Not available" for missing fields.
- **Verification & Documentation**:
  - Updated `API.md` with `/api/air-quality` and `/api/traffic-estimate` contracts.
  - Added test cases 12 and 13 to `backend/smoke_test.py` (13/13 PASSED).
  - Production build `npm run build` PASSED with 0 errors.
  - Switched to git branch `phase-4`.

