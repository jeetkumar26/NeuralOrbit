"""
api/v1/decisions.py — Decision Log Endpoints

POST   /decisions                   — Create a decision record manually
GET    /decisions                   — Fetch decisions for the current user
PATCH  /decisions/{id}/outcome      — Mark a decision as applied/rejected/pending
POST   /decisions/{id}/execute      — (L5) Execute decision via n8n
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from app.auth.dependencies import get_current_user
from app.models.decision import DecisionCreate, DecisionOutcomeUpdate
from app.database import get_supabase
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", status_code=201)
async def create_decision(
    decision: DecisionCreate,
    current_user: dict = Depends(get_current_user),
):
    """Manually log an AI decision."""
    user_id = current_user["sub"]
    db = get_supabase()

    result = db.table("decisions").insert({
        "user_id":        user_id,
        "module":         decision.module,
        "action":         decision.action,
        "reasoning":      decision.reasoning,
        "confidence":     decision.confidence,
        "state_snapshot": decision.state_snapshot or {},
        "alternatives":   decision.alternatives or [],
        "outcome":        "pending",
    }).execute()

    return {"status": "ok", "decision": result.data[0] if result.data else {}}


@router.get("")
async def get_decisions(
    module: str | None = Query(None, description="Filter by module"),
    outcome: str | None = Query(None, description="Filter by outcome"),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
):
    """Fetch decision log for the authenticated user."""
    user_id = current_user["sub"]
    db = get_supabase()

    query = (
        db.table("decisions")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
    )
    if module:
        query = query.eq("module", module)
    if outcome:
        query = query.eq("outcome", outcome)

    result = query.execute()
    decisions = result.data or []

    return {"decisions": decisions, "count": len(decisions)}


@router.patch("/{decision_id}/outcome")
async def update_outcome(
    decision_id: str,
    update: DecisionOutcomeUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Mark a decision as applied, rejected, or pending."""
    valid = {"applied", "rejected", "pending"}
    if update.outcome not in valid:
        raise HTTPException(
            status_code=400,
            detail=f"outcome must be one of: {sorted(valid)}",
        )

    user_id = current_user["sub"]
    db = get_supabase()

    result = (
        db.table("decisions")
        .update({"outcome": update.outcome})
        .eq("id", decision_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Decision not found")

    logger.info(
        f"[Decisions] Outcome updated → {update.outcome} "
        f"decision={decision_id[:8]} user={user_id[:8]}"
    )
    return {"status": "ok", "decision": result.data[0]}


@router.post("/{decision_id}/execute")
async def execute_decision(
    decision_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    L5 — Execute an approved AI decision via n8n.
    Looks up the decision, confirms it's approved/pending, triggers n8n webhook.
    """
    from app.core.integrations.executor import execute_decision as run_executor, list_available_actions

    user_id = current_user["sub"]
    db = get_supabase()

    # Fetch decision
    r = (
        db.table("decisions")
        .select("*")
        .eq("id", decision_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not r.data:
        raise HTTPException(status_code=404, detail="Decision not found")

    dec = r.data[0]
    if dec.get("outcome") == "rejected":
        raise HTTPException(status_code=400, detail="Cannot execute a rejected decision")

    # Run n8n executor
    result = await run_executor(
        decision_id = decision_id,
        module      = dec.get("module", ""),
        action      = dec.get("action", ""),
        parameters  = dec.get("state_snapshot", {}),
        user_id     = user_id,
    )

    # Update decision outcome to 'applied' if successful
    if result["status"] == "executed":
        db.table("decisions").update({"outcome": "applied"}).eq("id", decision_id).execute()

    logger.info(f"[Decisions/Execute] {result['status']} — decision={decision_id[:8]}")
    return {
        "status"     : result["status"],
        "detail"     : result["detail"],
        "decision_id": decision_id,
    }
