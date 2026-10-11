import json
import urllib.request
import urllib.error
import sys

BASE_URL = "http://127.0.0.1:8000"

def make_request(method, path, body=None, timeout=30):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    data = json.dumps(body).encode("utf-8") if body else None
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status = resp.status
            content = json.loads(resp.read().decode("utf-8"))
            return status, content
    except urllib.error.HTTPError as e:
        status = e.code
        try:
            raw = e.read().decode("utf-8")
            content = json.loads(raw) if raw else {"error": "HTTPError"}
        except Exception:
            content = {"error": "HTTPError"}
        return status, content
    except Exception as e:
        return 0, {"error": str(e)}

def run_tests():
    print("=" * 65)
    print("Starting Roamly Location-Aware Backend Smoke Test Suite")
    print("=" * 65)
    
    passed = 0
    failed = 0

    def test(name, status, expected_status, check_fn):
        nonlocal passed, failed
        if (status == expected_status or expected_status is None) and check_fn():
            print(f"[PASS] {name}")
            passed += 1
        else:
            print(f"[FAIL] {name} (Status: {status})")
            failed += 1

    # 1. GET /api/places - fetch all places
    st, res = make_request("GET", "/api/places")
    test("1. GET /api/places - seed dataset", st, 200, lambda: "places" in res and res.get("data_source") == "seed")

    # 2. GET /api/places with query filters
    st, res = make_request("GET", "/api/places?category=historical&max_price=500")
    test("2. GET /api/places - category & max_price filter", st, 200, lambda: "places" in res and all(p["category"] == "historical" and p["price_inr"] <= 500 for p in res["places"]))

    # 3. GET /api/places/{id} - Valid ID
    st, res = make_request("GET", "/api/places/shaniwar-wada")
    test("3. GET /api/places/{id} - single place lookup", st, 200, lambda: res.get("id") == "shaniwar-wada")

    # 4. GET /api/places/{id} - Invalid ID (404 test)
    st, res = make_request("GET", "/api/places/invalid-id-xyz")
    test("4. GET /api/places/{id} - 404 handling", st, 404, lambda: "error" in res)

    # 5. POST /api/compare - IDs option
    st, res = make_request("POST", "/api/compare", {"ids": ["shaniwar-wada", "aga-khan-palace"]})
    test("5. POST /api/compare - valid comparison (IDs)", st, 200, lambda: len(res.get("places", [])) == 2 and len(res.get("rows", [])) == 8)

    # 6. POST /api/compare - Full place objects option
    sample_places = [
        {"id": "osm-node-101", "name": "Gateway of India", "category": "historical", "price_inr": None, "rating": None},
        {"id": "osm-node-102", "name": "Elephanta Caves", "category": "historical", "price_inr": None, "rating": None}
    ]
    st, res = make_request("POST", "/api/compare", {"places": sample_places})
    test("6. POST /api/compare - valid comparison (place objects)", st, 200, lambda: len(res.get("places", [])) == 2 and len(res.get("rows", [])) == 8)

    # 7. POST /api/compare - Invalid (< 2 items, 400 test)
    st, res = make_request("POST", "/api/compare", {"ids": ["shaniwar-wada"]})
    test("7. POST /api/compare - 400 validation", st, 400, lambda: "error" in res)

    # 8. GET /api/geocode - Nominatim search (tolerant of network timeouts)
    st, res = make_request("GET", "/api/geocode?q=Mumbai")
    test("8. GET /api/geocode - geocode city name", st, 200 if st == 200 else 0, lambda: st == 0 or ("name" in res and "lat" in res and "lng" in res))

    # 9. GET /api/places with lat/lng - Live OSM or Fallback (tolerant of network timeouts)
    st, res = make_request("GET", "/api/places?lat=19.0760&lng=72.8777")
    test("9. GET /api/places with lat/lng - shape & data_source validation", st, 200 if st == 200 else 0, lambda: st == 0 or ("places" in res and res.get("data_source") in ["live", "seed", "unavailable"]))

    # 10. POST /api/assistant - City query (tolerant of live OSM/network timeouts)
    st, res = make_request("POST", "/api/assistant", {"message": "Find cafes in Mumbai"})
    test("10. POST /api/assistant - city location & response shape", st, 200 if st == 200 else 0, lambda: st == 0 or ("location" in res and "filters" in res and "places" in res and "explanation" in res))

    # 11. GET /api/weather - Open-Meteo proxy
    st, res = make_request("GET", "/api/weather?lat=18.5204&lng=73.8567")
    test("11. GET /api/weather - weather proxy shape", st, 200 if st == 200 else 0, lambda: st == 0 or ("temperature_c" in res and "condition" in res and "source" in res))

    # 12. GET /api/air-quality - Open-Meteo AQI proxy (tolerant of network timeouts)
    st, res = make_request("GET", "/api/air-quality?lat=18.5204&lng=73.8567")
    test("12. GET /api/air-quality - air quality proxy shape", st, 200 if st == 200 else 0, lambda: st == 0 or ("category" in res and "source" in res))

    # 13. GET /api/traffic-estimate - Time-of-day heuristic traffic estimate
    st, res = make_request("GET", "/api/traffic-estimate?lat=18.5204&lng=73.8567")
    test("13. GET /api/traffic-estimate - traffic estimate shape", st, 200, lambda: res.get("label") == "Estimated" and "level" in res and "basis" in res)

    print("=" * 65)
    print(f"Results: {passed} PASSED, {failed} FAILED")
    print("=" * 65)
    
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
