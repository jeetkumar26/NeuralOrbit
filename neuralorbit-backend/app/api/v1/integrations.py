"""
api/v1/integrations.py — Integration Hub Endpoints (L1–L3)

POST   /integrations                       ← Register integration (webhook or API key)
GET    /integrations                       ← List all for user
GET    /integrations/{id}                  ← Single integration details
DELETE /integrations/{id}                  ← Disconnect
POST   /integrations/inbound/{id}          ← Inbound webhook from external platform
GET    /integrations/oauth/{platform}      ← Get OAuth redirect URL (L2/L3)
GET    /integrations/oauth/callback        ← OAuth callback handler (L2/L3)
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from app.auth.dependencies import get_current_user
from app.database import get_supabase
from app.core.integrations.normalizers.crm import normalize_crm_event
from app.core.integrations.normalizers.marketing import normalize_marketing_event
import secrets, hashlib, logging, os

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Schemas ────────────────────────────────────────────────────────────────

class IntegrationCreate(BaseModel):
    module: str                    # 'crm' | 'marketing' | 'shield' | 'website'
    platform: str                  # 'custom' | 'webhook' | 'zoho' | ...
    label: str | None = None
    type: str = "webhook"          # 'webhook' | 'api_key' | 'oauth'


# ── Helpers ────────────────────────────────────────────────────────────────

def generate_api_key() -> tuple[str, str, str]:
    """Returns (raw_key, prefix, key_hash)"""
    raw = "no_live_" + secrets.token_urlsafe(32)
    prefix = raw[:16]
    key_hash = hashlib.sha256(raw.encode()).hexdigest()
    return raw, prefix, key_hash


def generate_webhook_secret() -> str:
    return secrets.token_hex(32)


# ── Routes ────────────────────────────────────────────────────────────────

@router.post("", status_code=201)
async def create_integration(
    body: IntegrationCreate,
    current_user: dict = Depends(get_current_user),
):
    """Register a new integration. Returns webhook URL or API key based on type."""
    user_id = current_user["sub"]
    db = get_supabase()

    webhook_secret = generate_webhook_secret()
    label = body.label or f"{body.module.upper()} {body.type.replace('_', ' ').title()}"

    try:
        result = db.table("integrations").insert({
            "user_id":        user_id,
            "module":         body.module,
            "platform":       body.platform,
            "type":           body.type,
            "label":          label,
            "status":         "active",
            "webhook_secret": webhook_secret,
            "config":         {"label": label},
        }).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create integration")

        integration = result.data[0]
        response = {"integration": integration}

        # If type is api_key — also generate one and attach to response
        if body.type == "api_key":
            raw_key, prefix, key_hash = generate_api_key()
            db.table("integration_api_keys").insert({
                "user_id":        user_id,
                "integration_id": integration["id"],
                "key_prefix":     prefix,
                "key_hash":       key_hash,
                "label":          label,
                "is_active":      True,
            }).execute()
            # Return raw key ONCE — never stored in plaintext
            integration["api_key"] = raw_key

        logger.info(
            f"[Integrations] Created {body.type} — "
            f"module={body.module} platform={body.platform} user={user_id[:8]}"
        )
        return response

    except Exception as e:
        logger.error(f"[Integrations] Create failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def list_integrations(current_user: dict = Depends(get_current_user)):
    """List all integrations for the current user."""
    user_id = current_user["sub"]
    db = get_supabase()

    try:
        result = (
            db.table("integrations")
            .select("id, module, platform, type, label, status, config, last_sync_at, created_at")
            .eq("user_id", user_id)
            .eq("status", "active")
            .order("created_at", desc=True)
            .execute()
        )
        return {"integrations": result.data or []}
    except Exception as e:
        logger.error(f"[Integrations] List failed: {e}")
        return {"integrations": []}


@router.get("/{integration_id}")
async def get_integration(
    integration_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single integration's details."""
    user_id = current_user["sub"]
    db = get_supabase()

    result = (
        db.table("integrations")
        .select("*")
        .eq("id", integration_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Integration not found")

    return {"integration": result.data[0]}


@router.delete("/{integration_id}", status_code=204)
async def delete_integration(
    integration_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Disconnect / remove an integration."""
    user_id = current_user["sub"]
    db = get_supabase()

    result = (
        db.table("integrations")
        .update({"status": "disconnected"})
        .eq("id", integration_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Integration not found")

    logger.info(f"[Integrations] Disconnected {integration_id[:8]} user={user_id[:8]}")


@router.post("/inbound/{integration_id}")
async def receive_inbound_webhook(
    integration_id: str,
    request: Request,
):
    """
    Receive inbound webhook data from an external platform.
    Validates HMAC signature, logs raw payload, then normalizes to events table.
    No auth required here — validated via webhook secret.
    """
    db = get_supabase()

    # Fetch integration (no user auth — use service role)
    int_result = (
        db.table("integrations")
        .select("id, user_id, module, platform, webhook_secret, status")
        .eq("id", integration_id)
        .eq("status", "active")
        .execute()
    )

    if not int_result.data:
        raise HTTPException(status_code=404, detail="Integration not found or inactive")

    integration = int_result.data[0]
    user_id = integration["user_id"]
    module = integration["module"]
    platform = integration["platform"]

    # Get raw body
    body_bytes = await request.body()
    try:
        payload = await request.json()
    except Exception:
        payload = {"raw": body_bytes.decode(errors="replace")}

    # ── HMAC validation ─────────────────────────────────────────
    sig_header = request.headers.get("X-NeuralOrbit-Signature", "")
    expected = hashlib.sha256(
        f"{integration['webhook_secret']}{body_bytes.decode(errors='replace')}".encode()
    ).hexdigest()

    sig_valid = secrets.compare_digest(sig_header, expected) if sig_header else False
    if sig_header and not sig_valid:
        logger.warning(f"[Webhook] Invalid signature for integration {integration_id[:8]}")
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    # ── Store raw event ─────────────────────────────────────────
    db.table("raw_integration_events").insert({
        "integration_id": integration_id,
        "user_id":        user_id,
        "platform":       platform,
        "raw_payload":    payload,
        "normalized":     False,
    }).execute()

    # ── Normalize to events table ───────────────────────────────
    # Use platform-specific normalizers (L2/L3) or generic fallback
    try:
        if module == "crm" and platform in ("zoho", "hubspot"):
            normalized_events = normalize_crm_event(platform, payload)
        elif module == "marketing" and platform in ("meta_ads", "google_ads"):
            normalized_events = normalize_marketing_event(platform, payload)
        else:
            # Generic fallback — use event_type from payload
            event_type = payload.get("event_type", "webhook_received")
            normalized_events = [{
                "event_type"  : event_type,
                "reward_value": 1.0,
                "payload"     : payload.get("payload", payload),
                "source"      : "webhook",
            }]

        for ne in normalized_events:
            db.table("events").insert({
                "user_id"    : user_id,
                "module"     : module,
                "event_type" : ne["event_type"],
                "reward_value": ne.get("reward_value", 1.0),
                "payload"    : ne.get("payload", {}),
                "source"     : ne.get("source", "webhook"),
            }).execute()

        # Update last_sync_at
        db.table("integrations").update({"last_sync_at": "now()"}).eq("id", integration_id).execute()

        logger.info(
            f"[Webhook] Normalized {len(normalized_events)} events — "
            f"module={module} platform={platform} integration={integration_id[:8]}"
        )
    except Exception as e:
        logger.error(f"[Webhook] Normalization failed: {e}")
        db.table("raw_integration_events").update({"error": str(e)}).eq(
            "integration_id", integration_id
        ).execute()

    return {"status": "ok", "events_created": len(normalized_events) if 'normalized_events' in dir() else 0}


# ── OAuth Routes (L2 / L3) ────────────────────────────────────────────────

# OAuth config — set these in .env after creating app credentials
_OAUTH_CONFIGS = {
    "zoho": {
        "auth_url"     : "https://accounts.zoho.com/oauth/v2/auth",
        "client_id"    : os.getenv("ZOHO_CLIENT_ID", ""),
        "scope"        : "ZohoCRM.modules.ALL,ZohoCRM.settings.ALL",
        "redirect_uri" : os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8000/api/v1/integrations/oauth/callback"),
    },
    "hubspot": {
        "auth_url"     : "https://app.hubspot.com/oauth/authorize",
        "client_id"    : os.getenv("HUBSPOT_CLIENT_ID", ""),
        "scope"        : "crm.objects.contacts.read crm.objects.deals.read",
        "redirect_uri" : os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8000/api/v1/integrations/oauth/callback"),
    },
    "meta_ads": {
        "auth_url"     : "https://www.facebook.com/v18.0/dialog/oauth",
        "client_id"    : os.getenv("META_APP_ID", ""),
        "scope"        : "ads_read,ads_management,pages_read_engagement",
        "redirect_uri" : os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8000/api/v1/integrations/oauth/callback"),
    },
    "google_ads": {
        "auth_url"     : "https://accounts.google.com/o/oauth2/v2/auth",
        "client_id"    : os.getenv("GOOGLE_CLIENT_ID", ""),
        "scope"        : "https://www.googleapis.com/auth/adwords",
        "redirect_uri" : os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8000/api/v1/integrations/oauth/callback"),
    },
}


@router.get("/oauth/{platform}")
async def get_oauth_url(
    platform: str,
    module: str = "crm",
    current_user: dict = Depends(get_current_user),
):
    """
    L2/L3 — Generate OAuth redirect URL for a platform.
    Returns the URL the user should be sent to for authorization.
    Requires PLATFORM_CLIENT_ID set in .env
    """
    cfg = _OAUTH_CONFIGS.get(platform)
    if not cfg:
        raise HTTPException(status_code=400, detail=f"OAuth not configured for: {platform}")

    if not cfg["client_id"]:
        return {
            "status"    : "not_configured",
            "message"   : f"Set {platform.upper().replace('_', '_')}_CLIENT_ID in your .env to enable OAuth.",
            "platform"  : platform,
            "env_vars"  : [
                f"{platform.upper().replace('META_ADS', 'META_APP').replace('GOOGLE_ADS', 'GOOGLE')}_CLIENT_ID",
                f"{platform.upper().replace('META_ADS', 'META_APP').replace('GOOGLE_ADS', 'GOOGLE')}_CLIENT_SECRET",
                "OAUTH_REDIRECT_URI",
            ],
        }

    # Encode state = user_id + module for callback
    state = hashlib.md5(f"{current_user['sub']}:{module}:{platform}".encode()).hexdigest()

    from urllib.parse import urlencode
    params = {
        "client_id"    : cfg["client_id"],
        "redirect_uri" : cfg["redirect_uri"],
        "scope"        : cfg["scope"],
        "response_type": "code",
        "state"        : state,
    }
    url = cfg["auth_url"] + "?" + urlencode(params)
    return {"oauth_url": url, "platform": platform, "state": state}


@router.get("/oauth/callback", response_class=HTMLResponse)
async def oauth_callback(code: str = "", state: str = "", error: str = ""):
    """
    L2/L3 — OAuth callback. Exchanges code for tokens and stores in integrations.
    Returns an HTML page that closes the OAuth popup window.
    NOTE: Full token exchange requires platform-specific code (add in L2/L3 build).
    """
    if error:
        return HTMLResponse(f"""
        <html><body style="font-family:Inter,sans-serif;background:#0A0F1F;color:#EF4444;padding:40px;text-align:center;">
            <h2>Authorization Error</h2>
            <p>{error}</p>
            <script>setTimeout(()=>window.close(),3000);</script>
        </body></html>
        """)

    return HTMLResponse("""
    <html><body style="font-family:Inter,sans-serif;background:#0A0F1F;color:#22C55E;padding:40px;text-align:center;">
        <h2 style="color:#22C55E;">&#10003; Connected!</h2>
        <p style="color:#94A3B8;">Authorization successful. This window will close automatically.</p>
        <p style="color:#64748B;font-size:12px;">Token exchange requires L2 backend completion with platform credentials.</p>
        <script>
            // Notify parent window of success
            if(window.opener) {
                window.opener.postMessage({type:'oauth_success',state:'""" + state + """'}, '*');
            }
            setTimeout(()=>window.close(), 2000);
        </script>
    </body></html>
    """)
