"""
core/intelligence/reward_engine.py — NeuralOrbit Reward Engine

Calculates reward values for business events based on:
- Module-specific reward config (loaded from Supabase reward_config table)
- Falls back to hardcoded defaults from your Reward Frameworks document

Phase 1: Rule-based rewards (lookup table)
Phase 2: Will add bandit-adjusted dynamic weights
"""

from app.database import get_supabase
import logging

logger = logging.getLogger(__name__)

# ── Default Reward Config ──────────────────────────────────────────────────
# Directly from your "Reward Frameworks (CORE IP)" document
DEFAULT_REWARD_CONFIG: dict[str, dict[str, float]] = {
    "crm": {
        "lead_reply":      3.0,   # Lead replied to outreach
        "meeting_booked":  8.0,   # Meeting successfully booked
        "deal_closed":    21.0,   # Deal closed and won
        "no_response_7d": -4.0,   # No response after 7 days
        "lead_churn":    -10.0,   # Lead churned / lost
    },
    "marketing": {
        "ctr_increase":   5.0,   # Click-through rate increased
        "cpa_decrease":   8.0,   # Cost per acquisition decreased
        "conversion":    15.0,   # Campaign conversion recorded
        "ad_fatigue":    -6.0,   # Ad fatigue detected
        "budget_waste": -10.0,   # Budget waste detected
    },
    "shield": {
        "threat_blocked":        10.0,  # Security threat blocked
        "false_positive":        -3.0,  # False positive alert
        "data_misuse_detected":  15.0,  # Data misuse—flagged
        "breach":               -60.0,  # Security breach occurred
    },
    "website": {
        "page_conversion":       10.0,  # Visitor converted
        "bounce":                -3.0,  # Visitor bounced
        "session_value_high":     8.0,  # High-value session
        "core_vitals_improved":   5.0,  # Performance improved
    },
    "neural-orbit": {
        "decision_applied":   5.0,  # AI decision applied
        "decision_rejected": -2.0,  # AI decision rejected
        "insight_acted_on":   8.0,  # AI insight acted upon
    },
}


async def get_reward_config() -> dict[str, dict[str, float]]:
    """Load reward config from Supabase; fall back to defaults on failure."""
    try:
        db = get_supabase()
        result = (
            db.table("reward_config")
            .select("module, event_type, reward_value")
            .eq("is_active", True)
            .execute()
        )
        if result.data:
            config: dict[str, dict[str, float]] = {}
            for row in result.data:
                m = row["module"]
                if m not in config:
                    config[m] = {}
                config[m][row["event_type"]] = float(row["reward_value"])
            logger.info(f"[RewardEngine] Loaded {len(result.data)} reward rules from DB")
            return config
    except Exception as e:
        logger.warning(f"[RewardEngine] DB config unavailable, using defaults: {e}")

    return DEFAULT_REWARD_CONFIG


async def calculate_reward(module: str, event_type: str) -> float | None:
    """Return reward score for a (module, event_type) pair. None if unknown."""
    config = await get_reward_config()
    return config.get(module, {}).get(event_type)


async def store_reward(
    event_id: str,
    user_id: str,
    module: str,
    event_type: str,
    reward_value: float,
    source: str = "rule_engine",
) -> dict | None:
    """Persist a reward record to the rewards table."""
    try:
        db = get_supabase()
        result = db.table("rewards").insert({
            "event_id": event_id,
            "user_id": user_id,
            "module": module,
            "event_type": event_type,
            "reward_value": reward_value,
            "reward_source": source,
        }).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error(f"[RewardEngine] Failed to store reward: {e}")
        return None


async def update_module_cumulative_reward(
    user_id: str,
    module: str,
    reward_delta: float,
) -> None:
    """
    Upsert module_states — adds reward_delta to the running total.
    Creates the record if this is the user's first event in this module.
    """
    try:
        db = get_supabase()
        existing = (
            db.table("module_states")
            .select("id, cumulative_reward, decision_count")
            .eq("user_id", user_id)
            .eq("module", module)
            .execute()
        )

        if existing.data:
            row = existing.data[0]
            db.table("module_states").update({
                "cumulative_reward": round(row["cumulative_reward"] + reward_delta, 4),
                "decision_count":    row["decision_count"] + 1,
                "last_updated":      "now()",
            }).eq("id", row["id"]).execute()
        else:
            db.table("module_states").insert({
                "user_id":           user_id,
                "module":            module,
                "state":             {},
                "cumulative_reward": round(reward_delta, 4),
                "decision_count":    1,
            }).execute()

        logger.info(
            f"[RewardEngine] module_states updated — "
            f"user={user_id[:8]} module={module} delta={reward_delta:+.1f}"
        )
    except Exception as e:
        logger.error(f"[RewardEngine] Failed to update module_states: {e}")
