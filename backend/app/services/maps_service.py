"""Google Maps Places API service for finding nearby electronics stores."""
import math
import httpx
from typing import List
from app.core.config import settings
from app.models.schemas import StoreResult

PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"

ELECTRONICS_KEYWORDS = [
    "electronics store",
    "electronic components",
    "hardware store",
    "computer store",
]


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in km between two coordinates."""
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


async def find_nearby_stores(
    component_name: str,
    latitude: float,
    longitude: float,
    radius_meters: int = 10000,
) -> List[StoreResult]:
    if not settings.GOOGLE_MAPS_API_KEY:
        return _mock_stores(latitude, longitude)

    results: List[StoreResult] = []
    async with httpx.AsyncClient(timeout=15) as client:
        for keyword in ELECTRONICS_KEYWORDS[:2]:
            params = {
                "location": f"{latitude},{longitude}",
                "radius": radius_meters,
                "keyword": keyword,
                "key": settings.GOOGLE_MAPS_API_KEY,
            }
            resp = await client.get(PLACES_URL, params=params)
            data = resp.json()

            for place in data.get("results", [])[:5]:
                loc = place["geometry"]["location"]
                dist = _haversine(latitude, longitude, loc["lat"], loc["lng"])
                results.append(
                    StoreResult(
                        place_id=place["place_id"],
                        name=place["name"],
                        address=place.get("vicinity", ""),
                        rating=place.get("rating"),
                        total_ratings=place.get("user_ratings_total"),
                        distance_km=round(dist, 2),
                        open_now=place.get("opening_hours", {}).get("open_now"),
                        maps_url=f"https://www.google.com/maps/place/?q=place_id:{place['place_id']}",
                        lat=loc["lat"],
                        lng=loc["lng"],
                    )
                )

    # Deduplicate by place_id and sort by distance
    seen = set()
    unique = []
    for s in results:
        if s.place_id not in seen:
            seen.add(s.place_id)
            unique.append(s)
    return sorted(unique, key=lambda x: x.distance_km or 999)[:10]


def _mock_stores(lat: float, lng: float) -> List[StoreResult]:
    """Return mock store data when no API key is configured."""
    return [
        StoreResult(
            place_id="mock_1",
            name="Electronics Hub",
            address="123 Tech Street, Electronics Market",
            rating=4.2,
            total_ratings=340,
            distance_km=1.2,
            open_now=True,
            maps_url="https://maps.google.com",
            lat=lat + 0.01,
            lng=lng + 0.01,
        ),
        StoreResult(
            place_id="mock_2",
            name="Component World",
            address="456 Circuit Avenue, Tech Zone",
            rating=4.5,
            total_ratings=210,
            distance_km=2.8,
            open_now=True,
            maps_url="https://maps.google.com",
            lat=lat + 0.02,
            lng=lng - 0.01,
        ),
        StoreResult(
            place_id="mock_3",
            name="Robomart Electronics",
            address="789 Maker Lane, Innovation District",
            rating=3.9,
            total_ratings=95,
            distance_km=4.1,
            open_now=False,
            maps_url="https://maps.google.com",
            lat=lat - 0.03,
            lng=lng + 0.02,
        ),
    ]
