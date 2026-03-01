"""
api/v1/events.py — Event Tracking Endpoints

POST /events     — Log a business event (auto-calculates reward)
GET  /events     — Fetch events for current user, optionally filtered by module
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from app.auth.dependencies import get_current_user
from app.models.event import EventCreate
from app.database import get_supabase
from app.core.intelligence.reward_engine import (
    calculate_reward,
    store_reward,
    update_module_cumulative_reward,
)
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

VALID_MODULES = {"crm", "marketing", "shield", "website", "neural-orbit"}


@router.post("", status_code=201)
async def log_event(
    event: EventCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Log a business event and automatically score its reward.

    Example:
        POST /api/v1/events
        { "module": "crm", "event_type": "meeting_booked", "payload": {"lead_id": "abc"} }
    """
    if event.module not in VALID_MODULES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid module '{event.module}'. Valid: {sorted(VALID_MODULES)}",
        )

    user_id = current_user["sub"]
    db = get_supabase()

    # Insert event record
    result = db.table("events").insert({
        "user_id":    user_id,
        "module":     event.module,
        "event_type": event.event_type,
        "payload":    event.payload or {},
        "context":    event.context or {},
        "source":     event.source,
    }).execute()

    event_data = result.data[0] if result.data else {}
    event_id = event_data.get("id")

    # Auto-calculate reward for this event
    reward_value = await calculate_reward(event.module, event.event_type)

    if reward_value is not None and event_id:
        await store_reward(
            event_id, user_id, event.module, event.event_type, reward_value
        )
        await update_module_cumulative_reward(user_id, event.module, reward_value)
        event_data["reward_value"] = reward_value
        logger.info(
            f"[Events] Logged {event.module}/{event.event_type} "
            f"reward={reward_value:+.1f} user={user_id[:8]}"
        )
    else:
        event_data["reward_value"] = None
        logger.info(
            f"[Events] Logged {event.module}/{event.event_type} "
            f"(no reward config) user={user_id[:8]}"
        )

    return {
        "status": "ok",
        "event": event_data,
        "reward_applied": reward_value,
    }


@router.get("")
async def get_events(
    module: str | None = Query(None, description="Filter by module"),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
):
    """Fetch recent events for the authenticated user."""
    user_id = current_user["sub"]
    db = get_supabase()

    query = (
        db.table("events")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
    )
    if module:
        query = query.eq("module", module)

    result = query.execute()
    events = result.data or []

    return {"events": events, "count": len(events)}
