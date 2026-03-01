"""
api/v1/tracking.py — NeuralOrbit Website Tracker Endpoint (L4)

POST /track   ← receives batched events from tracker.js on user websites
"""

from fastapi import APIRouter, Request, HTTPException
from app.database import get_supabase
import logging, hashlib

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Reward map for website events ─────────────────────────────────────────
_REWARD_MAP = {
    "page_view"          : 1.0,
    "cta_click"          : 3.0,
    "form_submit"        : 10.0,
    "scroll_depth_75"    : 4.0,
    "scroll_depth_100"   : 6.0,
    "session_end_long"   : 8.0,   # >300s session
    "checkout_complete"  : 15.0,
    "session_end"        : 0.5,
}


def _resolve_token(token: str) -> dict | None:
    """Lookup integration by hashed token → return {integration_id, user_id}"""
    db = get_supabase()
    key_hash = hashlib.sha256(token.encode()).hexdigest()

    # Check api_keys first (most common for website tracker)
    r = (
        db.table("integration_api_keys")
        .select("id, user_id, integration_id, is_active")
        .eq("key_hash", key_hash)
        .eq("is_active", True)
        .execute()
    )
    if r.data:
        return {"user_id": r.data[0]["user_id"], "integration_id": r.data[0]["integration_id"]}

    # Fallback: check integration webhook_secret (for tracker-generated IDs)
    r2 = (
        db.table("integrations")
        .select("id, user_id")
        .eq("webhook_secret", token)
        .eq("status", "active")
        .execute()
    )
    if r2.data:
        return {"user_id": r2.data[0]["user_id"], "integration_id": r2.data[0]["id"]}

    return None


def _event_reward(evt: dict) -> tuple[str, float]:
    """Map tracker event to (event_type, reward_value)"""
    t = evt.get("type", "unknown")
    data = evt.get("data", {})

    if t == "scroll_depth":
        pct = data.get("pct", 0)
        if pct >= 100:   return "scroll_depth_full",   _REWARD_MAP["scroll_depth_100"]
        elif pct >= 75:  return "scroll_depth_high",   _REWARD_MAP["scroll_depth_75"]
        else:            return f"scroll_depth_{pct}",  1.0

    if t == "session_end":
        dur = data.get("duration_s", 0)
        if dur >= 300:   return "session_engaged",  _REWARD_MAP["session_end_long"]
        elif dur < 10:   return "session_bounce",   -3.0
        else:            return "session_end",       _REWARD_MAP["session_end"]

    return t, _REWARD_MAP.get(t, 1.0)


@router.post("")
async def receive_tracking_events(request: Request):
    """
    Receive batched tracking events from tracker.js running on a user's website.
    Validates token, normalizes events, and stores with reward scores.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    token = body.get("token", "")
    events = body.get("events", [])
    session_id = body.get("session_id", "")

    if not token:
        raise HTTPException(status_code=401, detail="Missing tracking token")
    if not events:
        return {"status": "ok", "accepted": 0}

    # Resolve token → user
    ctx = _resolve_token(token)
    if not ctx:
        raise HTTPException(status_code=401, detail="Invalid or inactive tracking token")

    user_id = ctx["user_id"]
    integration_id = ctx["integration_id"]

    db = get_supabase()
    accepted = 0
    total_reward = 0.0

    for evt in events[:50]:   # cap at 50 events per batch
        event_type, reward = _event_reward(evt)
        try:
            db.table("events").insert({
                "user_id"    : user_id,
                "module"     : "website",
                "event_type" : event_type,
                "source"     : "tracker",
                "payload"    : {
                    "path"       : evt.get("path", ""),
                    "session_id" : session_id,
                    "referrer"   : evt.get("referrer", ""),
                    "data"       : evt.get("data", {}),
                },
                "reward_value": reward,
            }).execute()
            accepted += 1
            total_reward += reward
        except Exception as e:
            logger.warning(f"[Track] Failed to store event {event_type}: {e}")

    # Update integration last_sync
    db.table("integrations").update({"last_sync_at": "now()"}).eq("id", integration_id).execute()

    logger.info(f"[Track] session={session_id[:12]} accepted={accepted} reward={total_reward:.1f}")
    return {"status": "ok", "accepted": accepted, "total_reward": total_reward}


@router.get("/snippet/{integration_id}")
async def get_tracker_snippet(integration_id: str):
    """
    Returns the personalised tracker snippet for a given integration_id.
    The token embedded is the integration's webhook_secret (single-use tracker key).
    """
    db = get_supabase()
    r = (
        db.table("integrations")
        .select("id, webhook_secret, module")
        .eq("id", integration_id)
        .eq("module", "website")
        .eq("status", "active")
        .execute()
    )
    if not r.data:
        raise HTTPException(status_code=404, detail="Integration not found")

    token = r.data[0]["webhook_secret"]
    snippet = f"""<!-- NeuralOrbit Website Tracker -->
<script>
(function(w,d){{
  'use strict';
  var s=d.createElement('script');
  s.async=true;
  s.src='http://localhost:8000/static/tracker.js';
  s.dataset.token='{token}';
  d.head.appendChild(s);
}})(window,document);
</script>"""

    return {"snippet": snippet, "token": token}
