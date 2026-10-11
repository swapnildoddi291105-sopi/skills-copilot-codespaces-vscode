# CitySmart API Contract

This document defines the exact specification for all communication between the CitySmart frontend and Python FastAPI backend.

---

## Data Models

### `Place` Object
```json
{
  "id": "shaniwar-wada",
  "name": "Shaniwar Wada",
  "category": "historical",
  "lat": 18.5196,
  "lng": 73.8553,
  "description": "7-story fort palace built in 1732 by Peshwa Baji Rao I, seat of the Peshwas of the Maratha Empire.",
  "historical_facts": "Built in 1732 as the seat of the Peshwas. Survived a major fire in 1828.",
  "price_inr": 25,
  "price_note": "Entry fee for Indian nationals; foreign nationals ₹300",
  "rating": 4.4,
  "hours": "08:00 AM - 06:30 PM",
  "accessibility": "Partial wheelchair accessibility at ground level",
  "cleanliness": "Well maintained heritage grounds",
  "source": "Seed data (unverified)",
  "last_verified": "2026-10-09",
  "area": "Shaniwar Peth",
  "distance_km": 1.2  // Optional: calculated dynamically if lat/lng are provided in request
}
```

#### Category Allowed Values:
- `"attraction"`
- `"historical"`
- `"restaurant"`
- `"cafe"`
- `"hotel"`

---

## Endpoints

### 1. `GET /api/geocode`
Geocode a city or place name into geographic coordinates via Nominatim with in-memory caching.

#### Query Parameters:
- `q` *(required string)*: City name to geocode (e.g. `"Mumbai"`, `"Delhi"`, `"London"`).

#### Response `200 OK`:
```json
{
  "name": "Mumbai, Maharashtra, India",
  "lat": 19.0760,
  "lng": 72.8777
}
```

#### Response `404 Not Found`:
```json
{
  "error": "City not found"
}
```

---

### 2. `GET /api/places`
Query for places matching search, category, budget, rating, and distance filters. When `lat`/`lng` are provided, live places are fetched via OpenStreetMap Overpass API (with 10-minute TTL caching).

#### Query Parameters:
- `q` *(optional string)*: Case-insensitive search on `name`, `description`, `area`.
- `category` *(optional string)*: Filter by exact category.
- `max_price` *(optional number)*: Maximum price in INR. By default, places with `price_inr: null` are excluded when `max_price` is set.
- `include_unknown_price` *(optional boolean)*: If `true` and `max_price` is set, includes places where `price_inr` is `null`. Default: `false`.
- `min_rating` *(optional number)*: Minimum rating (e.g. `4.0`). Excludes places with `rating: null`.
- `lat` *(optional number)*: Latitude for location-aware discovery.
- `lng` *(optional number)*: Longitude for location-aware discovery.
- `max_distance_km` *(optional number)*: Maximum search radius in kilometers (default: 5, max: 15).

#### Response `200 OK`:
```json
{
  "places": [
    /* Array of Place objects, sorted by distance_km if lat/lng provided */
  ],
  "data_source": "live"  // "live" (Overpass), "seed" (in-memory places.json), or "unavailable" (>50km from Pune on fetch error)
}
```

---

### 3. `GET /api/places/{id}`
Retrieve a single place record by its unique ID.

#### Response `200 OK`:
Returns a single `Place` object.

#### Response `404 Not Found`:
```json
{
  "error": "Place not found"
}
```

---

### 4. `POST /api/assistant`
Natural language query endpoint for AI city assistant with city recognition and location context.

#### Request Body:
```json
{
  "message": "Find historical places in Mumbai under ₹500",
  "user_location": {
    "lat": 19.0760,
    "lng": 72.8777
  }
}
```

#### Response `200 OK`:
```json
{
  "location": {
    "name": "Mumbai",
    "lat": 19.0760,
    "lng": 72.8777
  },
  "filters": {
    "category": "historical",
    "city": "Mumbai",
    "max_price": 500,
    "min_rating": null,
    "keywords": ["historical", "mumbai"],
    "max_distance_km": null
  },
  "places": [
    /* Array of max 5 Place objects matching extracted filters */
  ],
  "explanation": "I found historical locations near Mumbai. Note that price and rating information for live OpenStreetMap records may be listed as not available.",
  "data_source": "live"
}
```

---

### 5. `POST /api/compare`
Generate side-by-side tabular comparison data for 2 or more selected places. Accepts either place IDs (`ids`) or full place objects (`places`).

#### Request Body (Option A - IDs):
```json
{
  "ids": ["shaniwar-wada", "aga-khan-palace"]
}
```

#### Request Body (Option B - Full Place Objects for Live OSM Places):
```json
{
  "places": [
    { "id": "osm-node-101", "name": "Gateway of India", "category": "historical", "price_inr": null, ... },
    { "id": "osm-node-102", "name": "Elephanta Caves", "category": "historical", "price_inr": null, ... }
  ]
}
```

#### Response `200 OK`:
```json
{
  "places": [
    /* Array of Place objects corresponding to requested IDs/places */
  ],
  "rows": [
    { "field": "price_inr", "label": "Price (INR)", "values": { "osm-node-101": null, "osm-node-102": null } },
    { "field": "rating", "label": "Rating", "values": { "osm-node-101": null, "osm-node-102": null } },
    { "field": "distance_km", "label": "Distance (km)", "values": { "osm-node-101": 0.5, "osm-node-102": 12.1 } },
    { "field": "hours", "label": "Opening Hours", "values": { "osm-node-101": "24 Hours", "osm-node-102": "09:00 AM - 05:00 PM" } },
    { "field": "accessibility", "label": "Accessibility", "values": { "osm-node-101": "Wheelchair accessible", "osm-node-102": "Not wheelchair accessible" } },
    { "field": "cleanliness", "label": "Cleanliness", "values": { "osm-node-101": null, "osm-node-102": null } },
    { "field": "source", "label": "Source", "values": { "osm-node-101": "OpenStreetMap (Overpass)", "osm-node-102": "OpenStreetMap (Overpass)" } },
    { "field": "last_verified", "label": "Last Verified", "values": { "osm-node-101": "2026-10-09", "osm-node-102": "2026-10-09" } }
  ]
}
```

#### Response `400 Bad Request`:
```json
{
  "error": "At least 2 place IDs or place objects required for comparison"
}
```

---

### 6. `GET /api/weather`
Proxy live weather data for specified coordinates from Open-Meteo API.

#### Query Parameters:
- `lat` *(optional number, default: 18.5204)*
- `lng` *(optional number, default: 73.8567)*

#### Response `200 OK`:
```json
{
  "temperature_c": 28.5,
  "condition": "Partly cloudy",
  "source": "Open-Meteo",
  "fetched_at": "2026-10-09T11:58:00Z"
}
```

---

### 7. `GET /api/air-quality`
Proxy live air quality data for specified coordinates from Open-Meteo Air Quality API with 10-minute caching.

#### Query Parameters:
- `lat` *(optional number, default: 18.5204)*
- `lng` *(optional number, default: 73.8567)*

#### Response `200 OK`:
```json
{
  "us_aqi": 117,
  "european_aqi": 78,
  "pm2_5": 29.6,
  "category": "Moderate",
  "source": "Open-Meteo",
  "fetched_at": "2026-10-11T08:16:00Z"
}
```

---

### 8. `GET /api/traffic-estimate`
Time-of-day heuristic traffic estimate (rush hours vs standard/light). Never claims to be live traffic; clearly labeled as Estimated.

#### Query Parameters:
- `lat` *(optional number, default: 18.5204)*
- `lng` *(optional number, default: 73.8567)*

#### Response `200 OK`:
```json
{
  "level": "Moderate",
  "score": 50,
  "label": "Estimated",
  "basis": "Standard daytime traffic based on local time window (14:00)",
  "local_hour_approx": 14,
  "fetched_at": "2026-10-11T08:16:00Z"
}
```

---

## Standard Error Response Structure
All non-200 responses return JSON with an `error` key:
```json
{
  "error": "Descriptive error message"
}
```
