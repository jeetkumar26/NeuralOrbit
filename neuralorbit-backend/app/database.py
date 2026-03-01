"""
database.py — Supabase client (singleton)
Uses the service role key so it can bypass RLS for backend operations.
"""

from supabase import create_client, Client
from app.config import settings
import logging

logger = logging.getLogger(__name__)

_client: Client | None = None


def get_supabase() -> Client:
    """Return the Supabase client (lazy-initialized singleton)."""
    global _client
    if _client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env"
            )
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        logger.info("[NeuralOrbit] Supabase client initialized ✓")
    return _client
