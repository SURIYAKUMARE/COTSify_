from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import SaveProjectRequest, ProjectRecord
from app.services import supabase_service

router = APIRouter()


@router.post("/save")
async def save_project(request: SaveProjectRequest):
    try:
        result = await supabase_service.save_project(
            request.user_id,
            request.project_title,
            request.analysis,
            request.bookmarked_components or [],
        )
        return {"success": True, "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}")
async def get_projects(user_id: str):
    try:
        result = await supabase_service.get_user_projects(user_id)
        return {"projects": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{project_id}")
async def delete_project(project_id: str, user_id: str):
    try:
        await supabase_service.delete_project(project_id, user_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{project_id}/bookmarks")
async def update_bookmarks(project_id: str, user_id: str, bookmarked: List[str]):
    try:
        await supabase_service.update_bookmarks(project_id, user_id, bookmarked)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
