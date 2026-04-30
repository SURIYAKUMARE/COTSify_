from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str


# ── Analysis ──────────────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    project_title: str
    user_id: Optional[str] = None


class Component(BaseModel):
    name: str
    category: str          # "hardware" | "software"
    description: str
    quantity: Optional[int] = 1
    search_query: str      # optimised query for product search


class AnalyzeResponse(BaseModel):
    project_title: str
    summary: str
    hardware: List[Component]
    software: List[Component]


# ── Stores ────────────────────────────────────────────────────────────────────
class NearbyStoreRequest(BaseModel):
    component_name: str
    latitude: float
    longitude: float
    radius_meters: int = 10000


class StoreResult(BaseModel):
    place_id: str
    name: str
    address: str
    rating: Optional[float] = None
    total_ratings: Optional[int] = None
    distance_km: Optional[float] = None
    open_now: Optional[bool] = None
    maps_url: str
    lat: float
    lng: float


class NearbyStoresResponse(BaseModel):
    component_name: str
    stores: List[StoreResult]


# ── Online Products ───────────────────────────────────────────────────────────
class OnlineProduct(BaseModel):
    platform: str
    name: str
    price: Optional[float] = None
    currency: str = "INR"
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    url: str
    image_url: Optional[str] = None
    availability: str = "unknown"   # "in_stock" | "out_of_stock" | "unknown"


class OnlineSearchRequest(BaseModel):
    component_name: str
    search_query: str


class OnlineSearchResponse(BaseModel):
    component_name: str
    products: List[OnlineProduct]


# ── Compare ───────────────────────────────────────────────────────────────────
class CompareRequest(BaseModel):
    component_name: str
    search_query: str


class PriceComparison(BaseModel):
    component_name: str
    products: List[OnlineProduct]
    lowest_price: Optional[OnlineProduct] = None
    best_rated: Optional[OnlineProduct] = None


# ── Projects ──────────────────────────────────────────────────────────────────
class SaveProjectRequest(BaseModel):
    user_id: str
    project_title: str
    analysis: dict
    bookmarked_components: Optional[List[str]] = []


class ProjectRecord(BaseModel):
    id: str
    user_id: str
    project_title: str
    analysis: dict
    bookmarked_components: List[str]
    created_at: datetime
