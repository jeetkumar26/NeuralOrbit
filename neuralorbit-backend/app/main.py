"""
app/main.py — NeuralOrbit FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.api.v1.router import api_router
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger("neuralorbit")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"[NeuralOrbit] Backend starting — env={settings.APP_ENV}")
    logger.info(f"[NeuralOrbit] Auth required: {settings.AUTH_REQUIRED}")
    logger.info(f"[NeuralOrbit] LLM provider: {settings.LLM_PROVIDER}")
    yield
    logger.info("[NeuralOrbit] Backend shutting down")


app = FastAPI(
    title="NeuralOrbit AI Backend",
    description=(
        "Intelligence Layer for the NeuralOrbit AI Operating System. "
        "Handles event tracking, reward scoring, and AI recommendations."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS Middleware ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


# ── Health Check ──────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "ok",
        "app": "neuralorbit-backend",
        "version": "1.0.0",
        "env": settings.APP_ENV,
        "llm_provider": settings.LLM_PROVIDER,
        "auth_required": settings.AUTH_REQUIRED,
    }
