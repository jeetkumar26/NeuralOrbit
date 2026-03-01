/* ============================================================
   supabase-client.js — NeuralOrbit Supabase Client Init
   Uses try/catch so mock auth works when Supabase is offline.
   ============================================================ */

(function () {
    'use strict';

    // ── Supabase Configuration ─────────────────────────────────
    // Replace these with your real Supabase project URL + anon key
    // from Supabase → Settings → API
    const SUPABASE_URL = 'https://your-project.supabase.co';
    const SUPABASE_ANON = 'your-anon-public-key-here';

    // ── Demo credentials (used by mock auth fallback) ──────────
    window.DEMO_CREDENTIALS = {
        'admin@neuralorbit.ai': { password: 'NeuralAdmin@2025', role: 'admin', name: 'Admin User' },
        'user@neuralorbit.ai': { password: 'NeuralUser@2025', role: 'user', name: 'Demo User' },
    };

    // ── Try to init real Supabase client ──────────────────────
    let client = null;

    try {
        if (typeof window.supabase !== 'undefined' &&
            SUPABASE_URL !== 'https://your-project.supabase.co') {
            client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
        }
    } catch (err) {
        console.warn('[NeuralOrbit] Supabase init failed, using local mock auth.', err);
    }

    window.supabaseClient = client;
    window.SUPABASE_READY = !!client;

})();
