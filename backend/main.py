from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import analyze, stores, compare, projects, auth

app = FastAPI(
    title="COTsify API",
    description="Intelligent component sourcing assistant for technical projects",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["analyze"])
app.include_router(stores.router, prefix="/api/stores", tags=["stores"])
app.include_router(compare.router, prefix="/api/compare", tags=["compare"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])


@app.get("/")
async def root():
    return {"message": "COTsify API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
