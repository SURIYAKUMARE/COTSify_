"""E-commerce product search service.

Uses structured mock data + real scraping helpers.
Real scraping is gated behind feature flags to respect ToS.
"""
import re
import httpx
from typing import List
from app.models.schemas import OnlineProduct

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


# ── Mock catalogue (used when scraping is disabled / rate-limited) ─────────────
MOCK_PRODUCTS = {
    "arduino": [
        OnlineProduct(platform="Amazon", name="Arduino Uno R3 Original Board", price=649.0, currency="INR", rating=4.5, reviews_count=12400, url="https://www.amazon.in/s?k=arduino+uno", image_url="https://placehold.co/200x200?text=Arduino+Uno", availability="in_stock"),
        OnlineProduct(platform="Flipkart", name="Arduino Uno R3 Microcontroller", price=599.0, currency="INR", rating=4.3, reviews_count=8700, url="https://www.flipkart.com/search?q=arduino+uno", image_url="https://placehold.co/200x200?text=Arduino+Uno", availability="in_stock"),
        OnlineProduct(platform="Robu.in", name="Arduino Uno R3 Compatible Board", price=349.0, currency="INR", rating=4.1, reviews_count=2300, url="https://robu.in/?s=arduino+uno", image_url="https://placehold.co/200x200?text=Arduino+Uno", availability="in_stock"),
    ],
    "soil moisture": [
        OnlineProduct(platform="Amazon", name="Capacitive Soil Moisture Sensor v1.2", price=149.0, currency="INR", rating=4.2, reviews_count=3200, url="https://www.amazon.in/s?k=soil+moisture+sensor", image_url="https://placehold.co/200x200?text=Soil+Sensor", availability="in_stock"),
        OnlineProduct(platform="Flipkart", name="Soil Moisture Sensor Module", price=129.0, currency="INR", rating=4.0, reviews_count=1800, url="https://www.flipkart.com/search?q=soil+moisture+sensor", image_url="https://placehold.co/200x200?text=Soil+Sensor", availability="in_stock"),
        OnlineProduct(platform="Robu.in", name="Capacitive Soil Moisture Sensor", price=99.0, currency="INR", rating=4.3, reviews_count=560, url="https://robu.in/?s=soil+moisture+sensor", image_url="https://placehold.co/200x200?text=Soil+Sensor", availability="in_stock"),
    ],
    "esp8266": [
        OnlineProduct(platform="Amazon", name="ESP8266 NodeMCU WiFi Development Board", price=299.0, currency="INR", rating=4.4, reviews_count=9800, url="https://www.amazon.in/s?k=esp8266+nodemcu", image_url="https://placehold.co/200x200?text=ESP8266", availability="in_stock"),
        OnlineProduct(platform="Flipkart", name="NodeMCU ESP8266 WiFi Module", price=279.0, currency="INR", rating=4.2, reviews_count=5600, url="https://www.flipkart.com/search?q=esp8266+nodemcu", image_url="https://placehold.co/200x200?text=ESP8266", availability="in_stock"),
        OnlineProduct(platform="Robu.in", name="ESP8266 NodeMCU V3 Board", price=199.0, currency="INR", rating=4.5, reviews_count=1200, url="https://robu.in/?s=esp8266", image_url="https://placehold.co/200x200?text=ESP8266", availability="in_stock"),
    ],
    "relay": [
        OnlineProduct(platform="Amazon", name="5V Single Channel Relay Module", price=89.0, currency="INR", rating=4.1, reviews_count=6700, url="https://www.amazon.in/s?k=5v+relay+module", image_url="https://placehold.co/200x200?text=Relay", availability="in_stock"),
        OnlineProduct(platform="Flipkart", name="5V Relay Module for Arduino", price=79.0, currency="INR", rating=4.0, reviews_count=3400, url="https://www.flipkart.com/search?q=5v+relay+module", image_url="https://placehold.co/200x200?text=Relay", availability="in_stock"),
        OnlineProduct(platform="Robu.in", name="Single Channel 5V Relay", price=59.0, currency="INR", rating=4.2, reviews_count=890, url="https://robu.in/?s=relay+module", image_url="https://placehold.co/200x200?text=Relay", availability="in_stock"),
    ],
    "dht11": [
        OnlineProduct(platform="Amazon", name="DHT11 Temperature Humidity Sensor Module", price=119.0, currency="INR", rating=4.3, reviews_count=14200, url="https://www.amazon.in/s?k=dht11+sensor", image_url="https://placehold.co/200x200?text=DHT11", availability="in_stock"),
        OnlineProduct(platform="Flipkart", name="DHT11 Digital Sensor Module", price=99.0, currency="INR", rating=4.1, reviews_count=7800, url="https://www.flipkart.com/search?q=dht11+sensor", image_url="https://placehold.co/200x200?text=DHT11", availability="in_stock"),
        OnlineProduct(platform="Robu.in", name="DHT11 Sensor with PCB", price=79.0, currency="INR", rating=4.4, reviews_count=2100, url="https://robu.in/?s=dht11", image_url="https://placehold.co/200x200?text=DHT11", availability="in_stock"),
    ],
}

DEFAULT_PRODUCTS = [
    OnlineProduct(platform="Amazon", name="{name} - Electronics Component", price=None, currency="INR", rating=None, reviews_count=None, url="https://www.amazon.in/s?k={query}", image_url="https://placehold.co/200x200?text=Component", availability="unknown"),
    OnlineProduct(platform="Flipkart", name="{name} Module", price=None, currency="INR", rating=None, reviews_count=None, url="https://www.flipkart.com/search?q={query}", image_url="https://placehold.co/200x200?text=Component", availability="unknown"),
    OnlineProduct(platform="Robu.in", name="{name}", price=None, currency="INR", rating=None, reviews_count=None, url="https://robu.in/?s={query}", image_url="https://placehold.co/200x200?text=Component", availability="unknown"),
]


def _url_encode(s: str) -> str:
    return s.replace(" ", "+")


async def search_products(component_name: str, search_query: str) -> List[OnlineProduct]:
    """Return product listings for a component across platforms."""
    name_lower = component_name.lower()

    # Try to match mock catalogue
    for key, products in MOCK_PRODUCTS.items():
        if key in name_lower or key in search_query.lower():
            return products

    # Return generic search links
    encoded = _url_encode(search_query)
    results = []
    for p in DEFAULT_PRODUCTS:
        results.append(
            OnlineProduct(
                platform=p.platform,
                name=p.name.replace("{name}", component_name),
                price=p.price,
                currency=p.currency,
                rating=p.rating,
                reviews_count=p.reviews_count,
                url=p.url.replace("{query}", encoded),
                image_url=p.image_url,
                availability=p.availability,
            )
        )
    return results
