from fastapi import APIRouter, HTTPException
from app.models.schemas import NearbyStoreRequest, NearbyStoresResponse
from app.services import maps_service

router = APIRouter()


@router.post("/nearby", response_model=NearbyStoresResponse)
async def get_nearby_stores(request: NearbyStoreRequest):
    """Find nearby electronics stores for a component."""
    # Clamp radius between 500m and 50km
    radius = max(500, min(request.radius_meters, 50000))
    try:
        stores = await maps_service.find_nearby_stores(
            component_name=request.component_name,
            latitude=request.latitude,
            longitude=request.longitude,
            radius_meters=radius,
        )
        return NearbyStoresResponse(component_name=request.component_name, stores=stores)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Store search failed: {str(e)}")
