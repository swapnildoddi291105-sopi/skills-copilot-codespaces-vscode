import json
import logging
import math
import os
import re
import time
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("roamly")

# Load environment variables
load_dotenv()

app = FastAPI(title="Roamly API", version="2.0.0")

# CORS middleware
frontend_origins_raw = os.getenv("FRONTEND_ORIGINS", "")
origins = [o.strip() for o in frontend_origins_raw.split(",") if o.strip()]
if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True if origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )

# Constants
PUNE_LAT = 18.5204
PUNE_LNG = 73.8567
CACHE_TTL_SECONDS = 600  # 10 minutes

# In-memory storage and caches
PLACES_DATA: List[Dict[str, Any]] = []
OVERPASS_CACHE: Dict[Tuple[float, float, float], Tuple[float, List[Dict[str, Any]]]] = {}
GEOCODE_CACHE: Dict[str, Tuple[float, Dict[str, Any]]] = {}
WIKIPEDIA_CACHE: Dict[str, Tuple[float, Dict[str, Any]]] = {}
AIR_QUALITY_CACHE: Dict[Tuple[float, float], Tuple[float, Dict[str, Any]]] = {}


@app.on_event("startup")
def load_places():
    global PLACES_DATA
    data_path = Path(__file__).parent / "data" / "places.json"
    if data_path.exists():
        with open(data_path, "r", encoding="utf-8") as f:
            PLACES_DATA = json.load(f)
        logger.info(f"Loaded {len(PLACES_DATA)} seed places into memory.")
    else:
        logger.error(f"Data file not found at {data_path}")


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in kilometers."""
    r = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(r * c, 2)


def fetch_osm_overpass_places(lat: float, lng: float, radius_km: float = 5.0) -> Optional[List[Dict[str, Any]]]:
    """Fetch nearby places from OpenStreetMap Overpass API with in-memory caching."""
    radius_km = min(max(radius_km, 1.0), 15.0)
    cache_key = (round(lat, 2), round(lng, 2), round(radius_km, 1))
    now = time.time()

    # Check cache
    if cache_key in OVERPASS_CACHE:
        cached_time, cached_data = OVERPASS_CACHE[cache_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            logger.info(f"Overpass cache hit for {cache_key}")
            return cached_data

    radius_meters = int(radius_km * 1000)
    overpass_query = f"""
    [out:json][timeout:15];
    (
      node["historic"](around:{radius_meters},{lat},{lng});
      way["historic"](around:{radius_meters},{lat},{lng});
      relation["historic"](around:{radius_meters},{lat},{lng});
      node["tourism"="museum"](around:{radius_meters},{lat},{lng});
      way["tourism"="museum"](around:{radius_meters},{lat},{lng});
      node["tourism"="attraction"](around:{radius_meters},{lat},{lng});
      way["tourism"="attraction"](around:{radius_meters},{lat},{lng});
      node["tourism"="viewpoint"](around:{radius_meters},{lat},{lng});
      way["tourism"="viewpoint"](around:{radius_meters},{lat},{lng});
      node["leisure"="park"](around:{radius_meters},{lat},{lng});
      way["leisure"="park"](around:{radius_meters},{lat},{lng});
      node["amenity"="place_of_worship"](around:{radius_meters},{lat},{lng});
      way["amenity"="place_of_worship"](around:{radius_meters},{lat},{lng});
      node["amenity"="restaurant"](around:{radius_meters},{lat},{lng});
      way["amenity"="restaurant"](around:{radius_meters},{lat},{lng});
      node["amenity"="cafe"](around:{radius_meters},{lat},{lng});
      way["amenity"="cafe"](around:{radius_meters},{lat},{lng});
      node["tourism"="hotel"](around:{radius_meters},{lat},{lng});
      way["tourism"="hotel"](around:{radius_meters},{lat},{lng});
      node["tourism"="guest_house"](around:{radius_meters},{lat},{lng});
      way["tourism"="guest_house"](around:{radius_meters},{lat},{lng});
    );
    out center;
    """

    overpass_urls = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
    ]

    for url in overpass_urls:
        try:
            logger.info(f"Querying Overpass API at {url} for lat={lat}, lng={lng}, radius={radius_km}km")
            headers = {"User-Agent": "Roamly-student-project/1.0"}
            with httpx.Client(timeout=15.0) as client:
                resp = client.post(url, data={"data": overpass_query}, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    elements = data.get("elements", [])
                    parsed_places = parse_osm_elements(elements)
                    OVERPASS_CACHE[cache_key] = (now, parsed_places)
                    return parsed_places
        except Exception as e:
            logger.warning(f"Overpass request to {url} failed: {type(e).__name__} - {str(e)}")

    return None


def parse_osm_elements(elements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    today_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    places = []

    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name:
            continue

        el_type = el.get("type", "node")
        el_id = el.get("id")
        place_id = f"osm-{el_type}-{el_id}"

        # Extract lat/lng from node or way/relation center
        if el_type == "node":
            item_lat = el.get("lat")
            item_lng = el.get("lon")
        else:
            center = el.get("center", {})
            item_lat = center.get("lat")
            item_lng = center.get("lon")

        if item_lat is None or item_lng is None:
            continue

        # Map OSM tags to category
        category = "attraction"
        if "historic" in tags or tags.get("tourism") == "museum":
            category = "historical"
        elif tags.get("amenity") == "restaurant":
            category = "restaurant"
        elif tags.get("amenity") == "cafe":
            category = "cafe"
        elif tags.get("tourism") in ["hotel", "guest_house"]:
            category = "hotel"
        elif tags.get("tourism") in ["attraction", "viewpoint"] or tags.get("leisure") == "park" or tags.get("amenity") == "place_of_worship":
            category = "attraction"

        # Accessibility mapping
        wheelchair = tags.get("wheelchair")
        accessibility = None
        if wheelchair == "yes":
            accessibility = "Wheelchair accessible"
        elif wheelchair == "limited":
            accessibility = "Limited wheelchair accessibility"
        elif wheelchair == "no":
            accessibility = "Not wheelchair accessible"

        description = tags.get("description") or tags.get("wikipedia") or tags.get("cuisine")
        if description and tags.get("cuisine"):
            description = f"Cuisine: {description}"
        
        area = tags.get("addr:suburb") or tags.get("addr:district") or tags.get("addr:city") or tags.get("addr:street") or "Local Area"
        historical_facts = tags.get("description") or tags.get("historic") if category == "historical" else None

        places.append({
            "id": place_id,
            "name": name,
            "category": category,
            "lat": float(item_lat),
            "lng": float(item_lng),
            "description": description or f"{category.capitalize()} located in {area}.",
            "historical_facts": historical_facts,
            "price_inr": None,
            "price_note": None,
            "rating": None,
            "hours": tags.get("opening_hours"),
            "accessibility": accessibility,
            "cleanliness": None,
            "source": "OpenStreetMap (Overpass)",
            "last_verified": today_iso,
            "area": area,
            "wikipedia": tags.get("wikipedia"),
        })

    return places


def filter_places_list(
    places: List[Dict[str, Any]],
    q: Optional[Any] = None,
    category: Optional[Any] = None,
    max_price: Optional[Any] = None,
    include_unknown_price: bool = False,
    min_rating: Optional[Any] = None,
    keywords: Optional[List[str]] = None,
    lat: Optional[Any] = None,
    lng: Optional[Any] = None,
    max_distance_km: Optional[Any] = None,
) -> List[Dict[str, Any]]:
    results = []

    q_str = q if isinstance(q, str) else None
    cat_str = category if isinstance(category, str) else None
    max_p = max_price if isinstance(max_price, (int, float)) else None
    min_r = min_rating if isinstance(min_rating, (int, float)) else None
    user_lat = lat if isinstance(lat, (int, float)) else None
    user_lng = lng if isinstance(lng, (int, float)) else None
    max_dist = max_distance_km if isinstance(max_distance_km, (int, float)) else None

    for place in places:
        # Category filter
        if cat_str and place.get("category", "").lower() != cat_str.lower():
            continue

        # Text search filter
        if q_str:
            q_lower = q_str.lower()
            name_match = q_lower in place.get("name", "").lower()
            desc_match = q_lower in place.get("description", "").lower()
            area_match = q_lower in place.get("area", "").lower()
            if not (name_match or desc_match or area_match):
                continue

        # Keywords filter
        if keywords and isinstance(keywords, list):
            kw_match = False
            place_text = f"{place.get('name', '')} {place.get('description', '')} {place.get('area', '')}".lower()
            for kw in keywords:
                if isinstance(kw, str) and kw.lower() in place_text:
                    kw_match = True
                    break
            if not kw_match:
                continue

        # Max price filter
        price = place.get("price_inr")
        if max_p is not None:
            if price is None:
                if not include_unknown_price:
                    continue
            elif price > max_p:
                continue

        # Min rating filter
        rating = place.get("rating")
        if min_r is not None:
            if rating is None or rating < min_r:
                continue

        # Distance calculation
        place_copy = dict(place)
        if user_lat is not None and user_lng is not None:
            dist = haversine_distance(user_lat, user_lng, place["lat"], place["lng"])
            place_copy["distance_km"] = dist
            if max_dist is not None and dist > max_dist:
                continue
        else:
            place_copy["distance_km"] = None

        results.append(place_copy)

    if user_lat is not None and user_lng is not None:
        results.sort(key=lambda p: p["distance_km"] if p.get("distance_km") is not None else float("inf"))

    return results


def geocode_city(city_query: str) -> Optional[Dict[str, Any]]:
    """Geocode a city query using Nominatim with caching."""
    if not isinstance(city_query, str):
        return None
    q_norm = city_query.strip().lower()
    now = time.time()

    if q_norm in GEOCODE_CACHE:
        cached_time, cached_res = GEOCODE_CACHE[q_norm]
        if now - cached_time < CACHE_TTL_SECONDS:
            return cached_res

    url = "https://nominatim.openstreetmap.org/search"
    headers = {"User-Agent": "Roamly-student-project/1.0"}
    params = {"q": city_query, "format": "json", "limit": 1}

    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url, params=params, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                if data and len(data) > 0:
                    item = data[0]
                    res = {
                        "name": item.get("display_name", city_query),
                        "lat": float(item["lat"]),
                        "lng": float(item["lon"]),
                    }
                    GEOCODE_CACHE[q_norm] = (now, res)
                    return res
    except Exception as e:
        logger.warning(f"Geocoding failed for '{city_query}': {type(e).__name__} - {str(e)}")

    # Fallback for Pune if query contains Pune
    if "pune" in q_norm or "poona" in q_norm:
        res = {"name": "Pune, Maharashtra, India", "lat": PUNE_LAT, "lng": PUNE_LNG}
        GEOCODE_CACHE[q_norm] = (now, res)
        return res

    return None


# Models

class UserLocation(BaseModel):
    lat: float
    lng: float


class AssistantRequest(BaseModel):
    message: str
    user_location: Optional[UserLocation] = None


class CompareRequest(BaseModel):
    ids: Optional[List[str]] = None
    places: Optional[List[Dict[str, Any]]] = None


class AssistantFilters(BaseModel):
    category: Optional[str] = None
    city: Optional[str] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    keywords: List[str] = Field(default_factory=list)
    max_distance_km: Optional[float] = None


# Endpoints

@app.get("/api/geocode")
def geocode_endpoint(q: str = Query(..., description="City or location name")):
    res = geocode_city(q)
    if not res:
        raise HTTPException(status_code=404, detail="City not found")
    return res


@app.get("/api/places")
def get_places(
    q: Optional[Any] = Query(None),
    category: Optional[Any] = Query(None),
    max_price: Optional[Any] = Query(None),
    include_unknown_price: bool = Query(False),
    min_rating: Optional[Any] = Query(None),
    lat: Optional[Any] = Query(None),
    lng: Optional[Any] = Query(None),
    max_distance_km: Optional[Any] = Query(None),
):
    clean_lat = lat if isinstance(lat, (int, float)) else None
    clean_lng = lng if isinstance(lng, (int, float)) else None
    clean_max_dist = max_distance_km if isinstance(max_distance_km, (int, float)) else None
    radius_km = clean_max_dist if clean_max_dist and clean_max_dist > 0 else 5.0

    if clean_lat is not None and clean_lng is not None:
        osm_places = fetch_osm_overpass_places(clean_lat, clean_lng, radius_km=radius_km)
        
        if osm_places is not None:
            filtered = filter_places_list(
                places=osm_places,
                q=q,
                category=category,
                max_price=max_price,
                include_unknown_price=include_unknown_price,
                min_rating=min_rating,
                lat=clean_lat,
                lng=clean_lng,
                max_distance_km=clean_max_dist,
            )
            return {"places": filtered, "data_source": "live"}
        
        # Live fetch failed or timed out: check distance from Pune
        dist_from_pune = haversine_distance(clean_lat, clean_lng, PUNE_LAT, PUNE_LNG)
        if dist_from_pune > 50.0:
            logger.info(f"Location ({clean_lat}, {clean_lng}) is {dist_from_pune}km from Pune and live fetch failed. Returning empty list.")
            return {"places": [], "data_source": "unavailable"}

        # Fallback to Pune seed data
        filtered = filter_places_list(
            places=PLACES_DATA,
            q=q,
            category=category,
            max_price=max_price,
            include_unknown_price=include_unknown_price,
            min_rating=min_rating,
            lat=clean_lat,
            lng=clean_lng,
            max_distance_km=clean_max_dist,
        )
        return {"places": filtered, "data_source": "seed"}

    # No coordinates provided: return seed dataset
    filtered = filter_places_list(
        places=PLACES_DATA,
        q=q,
        category=category,
        max_price=max_price,
        include_unknown_price=include_unknown_price,
        min_rating=min_rating,
    )
    return {"places": filtered, "data_source": "seed"}


@app.get("/api/places/{id}")
def get_place_by_id(id: str):
    # Check in seed dataset first
    for place in PLACES_DATA:
        if place["id"] == id:
            return place

    # Check in Overpass cache
    for _, (_, cached_places) in OVERPASS_CACHE.items():
        for place in cached_places:
            if place["id"] == id:
                return place

    raise HTTPException(status_code=404, detail="Place not found")


@app.post("/api/compare")
def compare_places(req: CompareRequest):
    target_places = []

    if req.places and len(req.places) >= 2:
        target_places = req.places
    elif req.ids and len(req.ids) >= 2:
        for pid in req.ids:
            found = None
            for p in PLACES_DATA:
                if p["id"] == pid:
                    found = p
                    break
            if not found:
                for _, (_, cached_places) in OVERPASS_CACHE.items():
                    for p in cached_places:
                        if p["id"] == pid:
                            found = p
                            break
                    if found:
                        break
            if found:
                target_places.append(found)
    
    if not target_places or len(target_places) < 2:
        raise HTTPException(
            status_code=400, detail="At least 2 place IDs or place objects required for comparison"
        )

    rows_spec = [
        ("price_inr", "Price (INR)"),
        ("rating", "Rating"),
        ("distance_km", "Distance (km)"),
        ("hours", "Opening Hours"),
        ("accessibility", "Accessibility"),
        ("cleanliness", "Cleanliness"),
        ("source", "Source"),
        ("last_verified", "Last Verified"),
    ]

    rows = []
    for field_key, label in rows_spec:
        values_dict = {}
        for p in target_places:
            values_dict[p["id"]] = p.get(field_key, None)
        rows.append({"field": field_key, "label": label, "values": values_dict})

    return {"places": target_places, "rows": rows}


def fallback_extract_filters(message: str) -> AssistantFilters:
    msg_lower = message.lower() if isinstance(message, str) else ""
    cat = None
    if "historical" in msg_lower or "fort" in msg_lower or "palace" in msg_lower or "wada" in msg_lower or "museum" in msg_lower:
        cat = "historical"
    elif "cafe" in msg_lower or "coffee" in msg_lower or "chai" in msg_lower:
        cat = "cafe"
    elif "restaurant" in msg_lower or "thali" in msg_lower or "food" in msg_lower or "dining" in msg_lower:
        cat = "restaurant"
    elif "hotel" in msg_lower or "stay" in msg_lower or "resort" in msg_lower:
        cat = "hotel"
    elif "attraction" in msg_lower or "park" in msg_lower or "garden" in msg_lower:
        cat = "attraction"

    city = None
    city_match = re.search(r"in\s+([a-zA-Z\s]+?)(?:\s+under|\s+below|\s+less|\s+with|\s*$)", msg_lower)
    if city_match:
        extracted_city = city_match.group(1).strip()
        if extracted_city and extracted_city not in ["pune", "the city", "historical", "cheap"]:
            city = extracted_city

    max_price = None
    price_match = re.search(r"(?:under|below|less than|within)\s*(?:₹|rs\.?|inr)?\s*(\d+)", msg_lower)
    if not price_match:
        price_match = re.search(r"(\d+)\s*(?:₹|rs\.?|inr)", msg_lower)
    if price_match:
        try:
            max_price = float(price_match.group(1))
        except ValueError:
            pass

    min_rating = None
    rating_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:star|\+|\/5)", msg_lower)
    if rating_match:
        try:
            min_rating = float(rating_match.group(1))
        except ValueError:
            pass

    keywords = []
    if not cat:
        for word in ["museum", "fort", "temple", "garden", "park", "palace", "thali"]:
            if word in msg_lower:
                keywords.append(word)

    return AssistantFilters(
        category=cat,
        city=city,
        max_price=max_price,
        min_rating=min_rating,
        keywords=keywords,
        max_distance_km=None,
    )


@app.post("/api/assistant")
def run_assistant(req: AssistantRequest):
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

        filters = None
        explanation = None

        if api_key and not api_key.startswith("your_") and not api_key.startswith("AQ."):
            try:
                from google import genai
                client = genai.Client(api_key=api_key)

                sys_prompt = (
                    "You are a filter extraction system for a city exploration app. "
                    "Analyze the user message and extract filters: category ('attraction', 'historical', 'restaurant', 'cafe', 'hotel'), "
                    "city (name of city if mentioned, e.g. 'Mumbai', 'London', 'Pune'), max_price, min_rating, keywords, max_distance_km."
                )

                response = client.models.generate_content(
                    model=model_name,
                    contents=f"{sys_prompt}\n\nUser query: {req.message}",
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": AssistantFilters,
                    },
                )

                filters_dict = json.loads(response.text)
                filters = AssistantFilters(**filters_dict)
            except Exception as e:
                logger.warning(f"Gemini filter extraction fallback: {type(e).__name__} - {str(e)}")
                filters = fallback_extract_filters(req.message)
        else:
            filters = fallback_extract_filters(req.message)

        if not filters:
            filters = fallback_extract_filters(req.message)

        # Determine location
        loc_name = "Pune"
        lat = PUNE_LAT
        lng = PUNE_LNG

        if filters.city:
            geo = geocode_city(filters.city)
            if geo:
                loc_name = geo["name"]
                lat = geo["lat"]
                lng = geo["lng"]
        elif req.user_location:
            lat = req.user_location.lat
            lng = req.user_location.lng
            loc_name = req.user_location.name or "Current Location"

        # Fetch places for the resolved location safely
        places_resp = get_places(
            q=None,
            category=filters.category,
            max_price=filters.max_price,
            include_unknown_price=False,
            min_rating=filters.min_rating,
            lat=lat,
            lng=lng,
            max_distance_km=filters.max_distance_km,
        )

        matched_places = places_resp.get("places", [])
        data_source = places_resp.get("data_source", "seed")
        top_places = matched_places[:5]

        if not explanation:
            if top_places:
                names = ", ".join([p["name"] for p in top_places])
                explanation = (
                    f"I found recommendations near {loc_name}: {names}. "
                    "Note that exact prices and ratings for live OpenStreetMap records may be shown as Not available."
                )
            else:
                explanation = (
                    f"No places matched your query for {loc_name}. Try broadening your search filters."
                )

        filters_out = filters.model_dump() if hasattr(filters, "model_dump") else filters.dict()

        return {
            "location": {"name": loc_name, "lat": lat, "lng": lng},
            "filters": filters_out,
            "places": top_places,
            "explanation": explanation,
            "data_source": data_source,
        }
    except Exception as exc:
        logger.error(f"Error in run_assistant: {type(exc).__name__} - {str(exc)}")
        return {
            "location": {"name": "Pune", "lat": PUNE_LAT, "lng": PUNE_LNG},
            "filters": {"category": None, "city": None, "max_price": None, "min_rating": None, "keywords": [], "max_distance_km": None},
            "places": PLACES_DATA[:5],
            "explanation": "I found recommendations matching your query.",
            "data_source": "seed",
        }


@app.get("/api/weather")
def get_weather(
    lat: float = Query(PUNE_LAT),
    lng: float = Query(PUNE_LNG),
):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {"latitude": lat, "longitude": lng, "current_weather": "true"}

    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        cw = data.get("current_weather", {})
        temp = cw.get("temperature")
        wcode = cw.get("weathercode", 0)

        if wcode == 0:
            condition = "Clear sky"
        elif wcode in [1, 2, 3]:
            condition = "Partly cloudy"
        elif wcode in [45, 48]:
            condition = "Foggy"
        elif wcode in [51, 53, 55, 56, 57, 61, 63, 65, 66, 67]:
            condition = "Rainy"
        elif wcode in [71, 73, 75, 77, 85, 86]:
            condition = "Snowy"
        elif wcode in [80, 81, 82]:
            condition = "Showers"
        elif wcode in [95, 96, 99]:
            condition = "Thunderstorm"
        else:
            condition = "Clear"

        return {
            "temperature_c": temp,
            "condition": condition,
            "source": "Open-Meteo",
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        logger.error(f"Weather proxy error: {str(e)}")
        return {
            "temperature_c": 28.0,
            "condition": "Pleasant",
            "source": "Open-Meteo (fallback)",
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }


@app.get("/api/wiki-summary")
def get_wiki_summary(title: str = Query(..., min_length=1)):
    """Proxy Wikipedia REST summary endpoint with in-memory caching."""
    clean_title = title.strip()
    if clean_title.lower().startswith("en:"):
        clean_title = clean_title[3:].strip()
    # Format spaces as underscores for wikipedia API
    api_title = clean_title.replace(" ", "_")

    now = time.time()
    cache_key = api_title.lower()
    if cache_key in WIKIPEDIA_CACHE:
        cached_time, cached_val = WIKIPEDIA_CACHE[cache_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            return cached_val

    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(api_title)}"
    headers = {"User-Agent": "Roamly-student-project/1.0"}

    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 404:
                result = {"title": clean_title, "extract": None, "thumbnail": None}
                WIKIPEDIA_CACHE[cache_key] = (now, result)
                return result
            resp.raise_for_status()
            data = resp.json()

            result = {
                "title": data.get("title", clean_title),
                "extract": data.get("extract"),
                "thumbnail": data.get("thumbnail", {}).get("source") if data.get("thumbnail") else None,
                "description": data.get("description"),
            }
            WIKIPEDIA_CACHE[cache_key] = (now, result)
            return result
    except Exception as e:
        logger.warning(f"Wikipedia fetch error for {title}: {type(e).__name__} - {str(e)}")
        return {"title": clean_title, "extract": None, "thumbnail": None}


def aqi_category(aqi_val: Optional[float]) -> str:
    if aqi_val is None:
        return "Not available"
    if aqi_val <= 50:
        return "Good"
    elif aqi_val <= 100:
        return "Moderate"
    elif aqi_val <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi_val <= 200:
        return "Unhealthy"
    elif aqi_val <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"


@app.get("/api/air-quality")
def get_air_quality(
    lat: float = Query(PUNE_LAT),
    lng: float = Query(PUNE_LNG),
):
    """Fetch live air quality from Open-Meteo with in-memory caching and timeout."""
    cache_key = (round(lat, 2), round(lng, 2))
    now = time.time()

    if cache_key in AIR_QUALITY_CACHE:
        cached_time, cached_val = AIR_QUALITY_CACHE[cache_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            return cached_val

    url = "https://air-quality-api.open-meteo.com/v1/air-quality"
    params = {
        "latitude": lat,
        "longitude": lng,
        "current": "european_aqi,us_aqi,pm2_5",
    }

    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        curr = data.get("current", {})
        us_aqi = curr.get("us_aqi")
        european_aqi = curr.get("european_aqi")
        pm2_5 = curr.get("pm2_5")

        cat = aqi_category(us_aqi if us_aqi is not None else european_aqi)

        res = {
            "us_aqi": us_aqi,
            "european_aqi": european_aqi,
            "pm2_5": pm2_5,
            "category": cat,
            "source": "Open-Meteo",
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }
        AIR_QUALITY_CACHE[cache_key] = (now, res)
        return res
    except Exception as e:
        logger.warning(f"Air quality fetch error: {type(e).__name__} - {str(e)}")
        # Safe empty payload on failure
        return {
            "us_aqi": None,
            "european_aqi": None,
            "pm2_5": None,
            "category": "Not available",
            "source": "Open-Meteo",
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }


@app.get("/api/traffic-estimate")
def get_traffic_estimate(
    lat: float = Query(PUNE_LAT),
    lng: float = Query(PUNE_LNG),
):
    """
    Time-of-day heuristic traffic estimate.
    Never claims to be live traffic; clearly labeled as Estimated.
    """
    # Estimate local time from longitude (15 deg longitude ~= 1 hour offset from UTC)
    utc_now = datetime.now(timezone.utc)
    hour_offset = round(lng / 15.0)
    est_hour = (utc_now.hour + hour_offset) % 24

    # Peak rush hours: 8-10 AM and 17-20 (5-8 PM)
    if (8 <= est_hour < 10) or (17 <= est_hour < 20):
        level = "Heavy"
        basis = f"Estimated rush hour conditions based on local time window ({est_hour:02d}:00)"
        score = 80
    elif (10 <= est_hour < 17) or (20 <= est_hour < 22):
        level = "Moderate"
        basis = f"Standard daytime traffic based on local time window ({est_hour:02d}:00)"
        score = 50
    else:
        level = "Light"
        basis = f"Off-peak / late hours based on local time window ({est_hour:02d}:00)"
        score = 25

    return {
        "level": level,
        "score": score,
        "label": "Estimated",
        "basis": basis,
        "local_hour_approx": est_hour,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }

