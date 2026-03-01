"""
auth/dependencies.py — FastAPI Auth Dependencies
Validates Supabase JWTs on every protected route.
AUTH_REQUIRED=false bypasses auth entirely for local dev.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import settings
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

# ── Dev user used when AUTH_REQUIRED=false ─────────────────────────────────
_DEV_USER = {
    "sub": "dev-user-00000000-0000-0000-0000-000000000000",
    "email": "admin@neuralorbit.ai",
    "role": "authenticated",
    "app_metadata": {"role": "admin"},
    "user_metadata": {"role": "admin", "name": "Dev Admin"},
}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """Validate JWT — or return dev user if AUTH_REQUIRED=false."""

    if not settings.AUTH_REQUIRED:
        return _DEV_USER

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Provide a Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        if not payload.get("sub"):
            raise HTTPException(status_code=401, detail="Invalid token: missing sub")
        return payload

    except JWTError as e:
        logger.warning(f"[Auth] JWT validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_admin_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Require admin role. Use on admin-only endpoints."""
    role = (
        current_user.get("app_metadata", {}).get("role")
        or current_user.get("user_metadata", {}).get("role")
        or current_user.get("role")
        or "user"
    )
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
