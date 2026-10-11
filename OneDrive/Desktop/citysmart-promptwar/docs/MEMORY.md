# Roamly — Architecture Memory

> Read this before every session. Update after every decision.

---

## Architecture Overview

```
Browser (React + Vite)
   │
   ├── /api/*  ──────────────────────────────► FastAPI (uvicorn :8000)
   │                                               │
   │                                               ├── Overpass API (OSM places)
   │                                               ├── Nominatim (geocoding)
   │                                               ├── Open-Meteo (weather)
   │                                               ├── Gemini (NLP filter extraction)
   │                                               └── places.json (seed fallback)
   │
   └── Leaflet + OSM tiles (direct from browser — tiles only, no data)
```

Frontend data flow:
1. App boots → geolocation → `GET /api/places?lat=…&lng=…&max_distance_km=5`
2. Backend tries Overpass → on fail, checks distance from Pune → seed or "unavailable"
3. `data_source` field (`"live"` / `"seed"` / `"unavailable"`) drives source badge in UI

---

## Key Decisions

| Decision | Rationale | Date |
|---|---|---|
| Backend proxies all external calls | Rate limit handling, User-Agent control, caching | 2026-10-09 |
| Seed fallback only within 50 km of Pune | Prevents misleading Pune data shown for distant cities | 2026-10-09 |
| CircleMarker (not Leaflet default icon) | Avoids broken icon image paths in Vite build | 2026-10-09 |
| Vanilla CSS (no Tailwind) | Existing CSS is well-structured; no rewrite budget | 2026-10-09 |
| React Context (not Zustand) | State is manageable; avoid extra dependency | 2026-10-09 |
| Mock layer via `VITE_USE_MOCK=true` | Enables frontend dev without backend running | 2026-10-09 |
| `out center;` in Overpass query | Returns lat/lng for ways and relations, not just nodes | 2026-10-09 |
| Blue travel design system & image cards | Matched reference layout (hero, floating search, feature strip, footer) | 2026-10-11 |
| Honesty cleanup & category visuals | Badges strictly from data (Top rated, Free, Nearest, Heritage); no stock photos | 2026-10-11 |
| Modularized App.jsx components | All components in frontend/src/components/ under ~200 lines each | 2026-10-11 |
| Wikipedia REST Proxy endpoint | Cached /api/wiki-summary proxy with 10m TTL in backend | 2026-10-11 |
| Favorites in localStorage | Stored in roamly_saved_places with live navbar counter | 2026-10-11 |

---

## API Endpoints (current)

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/geocode?q={city}` | Nominatim, 1 hr cache, 404 on miss |
| `GET` | `/api/places` | Overpass → seed → unavailable fallback |
| `GET` | `/api/places/{id}` | Seed first, then Overpass cache |
| `POST` | `/api/compare` | Accepts `ids` or full `places` objects |
| `POST` | `/api/assistant` | Gemini → regex fallback, grounded results |
| `GET` | `/api/weather?lat=…&lng=…` | Open-Meteo, fallback payload on error |
| `GET` | `/api/wiki-summary?title=…` | Wikipedia REST summary & thumbnail proxy with in-memory caching |

**NEVER rename or delete these endpoints.**

---

## Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `GEMINI_API_KEY` | No | (none) | Regex fallback if missing |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Free tier model |
| `VITE_API_URL` | No | `http://localhost:8000` | Frontend → backend URL |
| `VITE_USE_MOCK` | No | `false` | Set `true` to skip backend |

---

## Rate Limits & Caching

| API | Rate Limit | Cache TTL | Strategy |
|---|---|---|---|
| Nominatim | 1 req/sec | 1 hr | Debounce 300ms + in-memory dict |
| Overpass | Polite use | 10 min | Key: (lat_2dp, lng_2dp, radius) |
| Open-Meteo | No hard limit | 10 min | Simple TTL |
| Gemini | Free tier | None | Per-request, no caching needed |
| Wikipedia REST | No hard limit | 30 min (future) | Future: add when Phase 5 starts |

---

## Known Bugs & Fixes

| Bug | Fix | Status |
|---|---|---|
| Leaflet gray tiles on tab switch | `map.invalidateSize()` after 200ms on tab change | Fixed (Phase 0) |
| `VITE_USE_MOCK` blocking run if task killed | Kill old task before restarting dev server | Known |
| Suggested prompts mention "Pune" explicitly | Hardcoded strings — need city-neutral prompts (Phase 1 task) | Pending |
| Weather widget always fetches Pune default | Should use `userLocation` lat/lng (Phase 4 task) | Pending |
| `AssistantTab` sends `user_location` without `.name` field | Backend expects `{ lat, lng }` — name is optional, OK | OK |

---

## Folder Structure (current)

```
citysmart-promptwar/
├── .agent/rules/          ← agent rules (roamly.md after Phase 0)
├── backend/
│   ├── data/places.json   ← Pune seed data (12 places)
│   ├── main.py            ← All FastAPI routes + helpers
│   ├── smoke_test.py      ← 11-test suite
│   ├── .env               ← secrets (git-ignored)
│   ├── .env.example       ← template (committed)
│   └── requirements.txt
├── docs/                  ← created Phase 0
│   ├── RULES.md
│   ├── PRD.md
│   ├── MEMORY.md          ← this file
│   ├── TASKS.md
│   └── DESIGN.md
├── frontend/
│   ├── src/
│   │   ├── config/        ← created Phase 0
│   │   │   └── categories.js
│   │   ├── App.jsx        ← main app + all tabs (556 lines — split needed in Phase 2)
│   │   ├── MapView.jsx
│   │   ├── PlaceDrawer.jsx
│   │   ├── api.js         ← thin wrapper, switches mock/real
│   │   ├── mock.js        ← full mock returning API.md shapes
│   │   ├── index.css      ← all styles (914 lines)
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env               ← VITE_API_URL + VITE_USE_MOCK
├── API.md
├── SPEC.md
├── PROGRESS.md            ← created Phase 0
└── AGENTS.md              ← created Phase 0
```

---

## Packages Installed

### Frontend (npm)
| Package | Version | Purpose |
|---|---|---|
| react | ^18.3.1 | Core UI framework |
| react-dom | ^18.3.1 | DOM renderer |
| react-leaflet | ^4.2.1 | Leaflet React bindings |
| leaflet | ^1.9.4 | Map library |
| @vitejs/plugin-react | ^4.3.4 | Vite React plugin |
| vite | ^6.0.0 | Build tool |

**Not yet installed (needed in later phases):**
- `recharts` — Phase 3 (radar chart in Compare)
- `framer-motion` — Phase 8 (animations)
- `lucide-react` — Phase 2 (icons)

### Backend (pip)
| Package | Purpose |
|---|---|
| fastapi | Web framework |
| uvicorn | ASGI server |
| pydantic | Data validation |
| httpx | Async HTTP client |
| google-genai | Gemini API |
| python-dotenv | .env loading |

---

## Gotchas

1. **Overpass `out center;`** — required for ways/relations to get lat/lng. Without it, ways return only node IDs.
2. **Nominatim `display_name`** — returns full name like "Pune, Pune District, Maharashtra, India" — trim in UI to first two parts.
3. **Gemini response schema** — `AssistantFilters` model is used as `response_schema` in structured output. If Gemini changes API format, the json.loads() path may need updating.
4. **`VITE_USE_MOCK` string comparison** — must be exactly `"true"` (lowercase string), not boolean `true`.
5. **Leaflet in Vite** — CSS must be loaded via `<link>` in `index.html` (CDN), not imported in JS, to avoid icon path issues.
6. **map.invalidateSize()** — must be called after any CSS transition that changes the map container size. Delay 200ms after tab switch.
