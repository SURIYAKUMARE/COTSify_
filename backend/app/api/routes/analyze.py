from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.services import llm_service
from app.core.config import settings

router = APIRouter()


@router.post("/", response_model=AnalyzeResponse)
async def analyze_project(request: AnalyzeRequest):
    """Analyze a project title and extract required components."""
    if not request.project_title.strip():
        raise HTTPException(status_code=400, detail="Project title cannot be empty")

    try:
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip():
            result = await llm_service.analyze_project(request.project_title)
        else:
            result = await llm_service.analyze_project_fallback(request.project_title)
        return result
    except Exception as e:
        # If OpenAI call fails for any reason, fall back to mock data
        try:
            result = await llm_service.analyze_project_fallback(request.project_title)
            return result
        except Exception:
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
