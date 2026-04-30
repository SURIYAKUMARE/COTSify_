"""Supabase client wrapper — returns None gracefully when not configured."""
from typing import Optional
from app.core.config import settings

_client = None


def get_client():
    global _client
    if _client is not None:
        return _client
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return None
    if (settings.SUPABASE_URL == "https://YOUR_PROJECT_REF.supabase.co" or
            not settings.SUPABASE_SERVICE_KEY.startswith("eyJ")):
        return None
    try:
        from supabase import create_client
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        return _client
    except Exception:
        return None


def _require_client():
    c = get_client()
    if c is None:
        raise RuntimeError("Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_KEY to backend/.env")
    return c


async def sign_up(email: str, password: str, full_name: Optional[str] = None):
    client = _require_client()
    data = {"email": email, "password": password}
    if full_name:
        data["options"] = {"data": {"full_name": full_name}}
    return client.auth.sign_up(data)


async def sign_in(email: str, password: str):
    client = _require_client()
    return client.auth.sign_in_with_password({"email": email, "password": password})


async def save_project(user_id: str, project_title: str, analysis: dict, bookmarked: list):
    client = _require_client()
    return (
        client.table("projects")
        .insert({
            "user_id": user_id,
            "project_title": project_title,
            "analysis": analysis,
            "bookmarked_components": bookmarked,
        })
        .execute()
    )


async def get_user_projects(user_id: str):
    client = _require_client()
    return (
        client.table("projects")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )


async def delete_project(project_id: str, user_id: str):
    client = _require_client()
    return (
        client.table("projects")
        .delete()
        .eq("id", project_id)
        .eq("user_id", user_id)   # ensures user owns the project
        .execute()
    )


async def update_bookmarks(project_id: str, user_id: str, bookmarked: list):
    client = _require_client()
    return (
        client.table("projects")
        .update({"bookmarked_components": bookmarked})
        .eq("id", project_id)
        .eq("user_id", user_id)
        .execute()
    )
