from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from app.services.catalog_service import (
    CatalogProduct, search_catalog, get_by_id, get_catalog_for_components, CATALOG
)

router = APIRouter()


class CatalogRequest(BaseModel):
    component_names: List[str]


@router.get("/search", response_model=List[CatalogProduct])
async def search(q: str = Query(..., min_length=1)):
    return search_catalog(q)


@router.post("/for-project", response_model=List[CatalogProduct])
async def catalog_for_project(request: CatalogRequest):
    return get_catalog_for_components(request.component_names)


@router.get("/all", response_model=List[CatalogProduct])
async def get_all(category: Optional[str] = None):
    items = list(CATALOG.values())
    if category:
        items = [i for i in items if i.category.lower() == category.lower()]
    return items


@router.get("/{product_id}", response_model=CatalogProduct)
async def get_product(product_id: str):
    p = get_by_id(product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p
