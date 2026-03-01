"""
api/v1/router.py — API v1 Master Router
"""

from fastapi import APIRouter
from app.api.v1 import events, decisions, rewards, recommendations, states, integrations, tracking

api_router = APIRouter()

api_router.include_router(events.router,          prefix="/events",       tags=["Events"])
api_router.include_router(decisions.router,       prefix="/decisions",    tags=["Decisions"])
api_router.include_router(rewards.router,         prefix="/rewards",      tags=["Rewards"])
api_router.include_router(recommendations.router, prefix="/recommend",    tags=["AI Recommendations"])
api_router.include_router(states.router,          prefix="/states",       tags=["Module States"])
api_router.include_router(integrations.router,    prefix="/integrations", tags=["Integrations"])
api_router.include_router(tracking.router,        prefix="/track",        tags=["Website Tracker (L4)"])
