from fastapi import APIRouter, HTTPException
from app.models.schemas import SignUpRequest, SignInRequest, AuthResponse
from app.services import supabase_service

router = APIRouter()


@router.post("/signup", response_model=AuthResponse)
async def sign_up(request: SignUpRequest):
    try:
        result = await supabase_service.sign_up(
            request.email, request.password, request.full_name
        )
        session = result.session
        user = result.user
        if not session or not user:
            raise HTTPException(status_code=400, detail="Sign up failed – check your email for confirmation")
        return AuthResponse(
            access_token=session.access_token,
            user_id=str(user.id),
            email=user.email,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/signin", response_model=AuthResponse)
async def sign_in(request: SignInRequest):
    try:
        result = await supabase_service.sign_in(request.email, request.password)
        session = result.session
        user = result.user
        if not session or not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return AuthResponse(
            access_token=session.access_token,
            user_id=str(user.id),
            email=user.email,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
