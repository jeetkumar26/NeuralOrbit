"""
api/v1/states.py — Module State Endpoints

GET /states/all          — All module states for current user (NeuralOrbit overview)
GET /states/{module}     — State for a specific module
"""

from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.core.intelligence.state_engine import get_module_state, get_all_module_states
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/all")
async def get_all_states(current_user: dict = Depends(get_current_user)):
    """Get AI states for ALL modules — used by the NeuralOrbit overview dashboard."""
    user_id = current_user["sub"]
    states = await get_all_module_states(user_id)
    return {"status": "ok", "states": states, "count": len(states)}


@router.get("/{module}")
async def get_state(module: str, current_user: dict = Depends(get_current_user)):
    """Get current AI state for a specific module."""
    user_id = current_user["sub"]
    state = await get_module_state(user_id, module)
    return {"status": "ok", "state": state}
