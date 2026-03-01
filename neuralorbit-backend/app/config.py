"""
config.py — NeuralOrbit Backend Settings
All config comes from .env (or environment variables on AWS).
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────
    APP_ENV: str = "development"
    AUTH_REQUIRED: bool = False  # Set True in production
    APP_CORS_ORIGINS: str = (
        "http://localhost:5173,http://localhost:3000,"
        "http://127.0.0.1:5500,http://localhost:8080"
    )

    # ── Supabase ─────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # ── LLM ──────────────────────────────────────────────
    LLM_PROVIDER: str = "mock"  # "mock" | "openai"
    OPENAI_API_KEY: str = ""

    # ── Redis / Celery ────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.APP_CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


# Single importable instance
settings = get_settings()
