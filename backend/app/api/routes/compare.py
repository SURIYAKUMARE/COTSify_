from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import CompareRequest, PriceComparison, OnlineProduct
from app.services import ecommerce_service

router = APIRouter()


@router.post("/", response_model=PriceComparison)
async def compare_prices(request: CompareRequest):
    """Fetch and compare prices across online platforms."""
    try:
        products = await ecommerce_service.search_products(
            request.component_name, request.search_query
        )
        priced = [p for p in products if p.price is not None]
        lowest = min(priced, key=lambda p: p.price) if priced else None
        rated = [p for p in products if p.rating is not None]
        best_rated = max(rated, key=lambda p: p.rating) if rated else None
        return PriceComparison(
            component_name=request.component_name,
            products=products,
            lowest_price=lowest,
            best_rated=best_rated,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Price comparison failed: {str(e)}")


@router.post("/bulk", response_model=List[PriceComparison])
async def compare_bulk(requests: List[CompareRequest]):
    """Compare prices for multiple components at once."""
    results = []
    for req in requests[:10]:
        try:
            products = await ecommerce_service.search_products(req.component_name, req.search_query)
            priced = [p for p in products if p.price is not None]
            lowest = min(priced, key=lambda p: p.price) if priced else None
            rated = [p for p in products if p.rating is not None]
            best_rated = max(rated, key=lambda p: p.rating) if rated else None
            results.append(PriceComparison(
                component_name=req.component_name,
                products=products,
                lowest_price=lowest,
                best_rated=best_rated,
            ))
        except Exception:
            results.append(PriceComparison(
                component_name=req.component_name,
                products=[],
                lowest_price=None,
                best_rated=None,
            ))
    return results
