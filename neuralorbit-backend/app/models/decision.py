"""
models/decision.py — Decision Pydantic schemas
"""

from pydantic import BaseModel
from typing import Any
from datetime import datetime


class DecisionCreate(BaseModel):
    module: str
    action: str                                    # What the AI/user decided
    reasoning: str | None = None                   # Why
    confidence: float | None = None               # 0.0 → 1.0
    state_snapshot: dict[str, Any] | None = None  # System state at decision time
    alternatives: list[dict] | None = None        # Other options considered


class DecisionOutcomeUpdate(BaseModel):
    outcome: str  # 'applied' | 'rejected' | 'pending'


class DecisionResponse(BaseModel):
    id: str
    user_id: str | None
    module: str
    action: str
    reasoning: str | None
    confidence: float | None
    state_snapshot: dict[str, Any] | None
    alternatives: list[dict] | None
    outcome: str | None
    created_at: datetime
