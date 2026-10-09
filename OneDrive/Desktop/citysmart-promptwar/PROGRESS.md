# Roamly — Progress Log

> Top of file always shows current status. Append new entries at the bottom.

---

## Status Summary

| Field | Value |
|---|---|
| **Current Phase** | Phase 1 — Location Awareness (End-to-End) ✅ |
| **Overall Progress** | ~25% (Phase 1 of 8 completed) |
| **Next 3 Actions** | 1. Split App.jsx into smaller modular components · 2. Add lucide-react icons · 3. Implement Place Details drawer Wikipedia & image enrichment |
| **Blockers** | None |
| **Last Updated** | 2026-10-09 |

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
