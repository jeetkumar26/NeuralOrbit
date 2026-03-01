"""
api/v1/rewards.py — Reward System Endpoints

GET  /rewards/config   — View current reward configuration
GET  /rewards/summary  — Reward totals, averages, and module breakdown
POST /rewards/manual   — Admin-only: manually assign a reward score
"""

from fastapi import APIRouter, Depends, Query
from app.auth.dependencies import get_current_user, get_admin_user
from app.models.reward import ManualRewardCreate
from app.database import get_supabase
from app.core.intelligence.reward_engine import DEFAULT_REWARD_CONFIG
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/config")
async def get_reward_config(current_user: dict = Depends(get_current_user)):
    """Return the current reward configuration (DB values + defaults)."""
    try:
        db = get_supabase()
        result = (
            db.table("reward_config")
            .select("*")
            .eq("is_active", True)
            .order("module")
            .execute()
        )
        return {
            "reward_config": result.data or [],
            "defaults":      DEFAULT_REWARD_CONFIG,
        }
    except Exception as e:
        logger.warning(f"[Rewards] Could not load DB config: {e}")
        return {"reward_config": [], "defaults": DEFAULT_REWARD_CONFIG}


@router.get("/summary")
async def get_reward_summary(
    module: str | None = Query(None, description="Filter by module"),
    current_user: dict = Depends(get_current_user),
):
    """Reward summary — totals, averages, per-module breakdown, recent entries."""
    user_id = current_user["sub"]
    db = get_supabase()

    query = (
        db.table("rewards")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(200)
    )
    if module:
        query = query.eq("module", module)

    result = query.execute()
    data = result.data or []

    total = sum(r["reward_value"] for r in data)
    avg = round(total / len(data), 2) if data else 0.0

    # Group by module
    by_module: dict = {}
    for r in data:
        m = r["module"]
        if m not in by_module:
            by_module[m] = {"total": 0.0, "count": 0, "avg": 0.0}
        by_module[m]["total"] = round(by_module[m]["total"] + r["reward_value"], 2)
        by_module[m]["count"] += 1

    for m_data in by_module.values():
        m_data["avg"] = round(m_data["total"] / m_data["count"], 2)

    return {
        "total_reward": round(total, 2),
        "event_count":  len(data),
        "avg_reward":   avg,
        "by_module":    by_module,
        "recent":       data[:10],
    }


@router.post("/manual", status_code=201)
async def add_manual_reward(
    reward: ManualRewardCreate,
    current_user: dict = Depends(get_admin_user),   # Admin only
):
    """Admin-only: manually assign a reward score to a module/event-type."""
    user_id = current_user["sub"]
    db = get_supabase()

    result = db.table("rewards").insert({
        "user_id":       user_id,
        "module":        reward.module,
        "event_type":    reward.event_type,
        "reward_value":  reward.reward_value,
        "reward_source": "manual",
        "notes":         reward.notes,
    }).execute()

    logger.info(
        f"[Rewards] Manual reward added — {reward.module}/{reward.event_type} "
        f"value={reward.reward_value:+.1f} user={user_id[:8]}"
    )
    return {"status": "ok", "reward": result.data[0] if result.data else {}}
