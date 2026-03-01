/* ============================================================
   auth.js — NeuralOrbit Authentication Layer
   Handles login, logout, session persistence.
   Uses real Supabase if configured, else mock auth.
   ============================================================ */

(function () {
    'use strict';

    const SESSION_KEY = 'no_session';

    /* -------------------------------------------------------
       SESSION HELPERS
    ------------------------------------------------------- */
    function saveSession(email, role, name) {
        const session = { email, role, name, ts: Date.now() };
        try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) { }
    }

    function clearSession() {
        try { localStorage.removeItem(SESSION_KEY); } catch (e) { }
    }

    function getSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            // 8 hour session TTL
            if (Date.now() - parsed.ts > 8 * 60 * 60 * 1000) { clearSession(); return null; }
            return parsed;
        } catch (e) { return null; }
    }

    /* -------------------------------------------------------
       LOGIN — Supabase real auth or mock fallback
    ------------------------------------------------------- */
    async function signIn(email, password) {
        const em = (email || '').trim().toLowerCase();

        // Try real Supabase first
        if (window.SUPABASE_READY && window.supabaseClient) {
            try {
                const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email: em, password });
                if (error) throw error;
                // Get role from user metadata
                const role = data?.user?.user_metadata?.role || 'user';
                const name = data?.user?.user_metadata?.name || em;
                saveSession(em, role, name);
                return { ok: true, role, name };
            } catch (err) {
                return { ok: false, error: err.message || 'Login failed.' };
            }
        }

        // Mock auth fallback
        const demo = window.DEMO_CREDENTIALS?.[em];
        if (demo && demo.password === password) {
            saveSession(em, demo.role, demo.name);
            return { ok: true, role: demo.role, name: demo.name };
        }

        return { ok: false, error: 'Invalid email or password.' };
    }

    /* -------------------------------------------------------
       LOGOUT
    ------------------------------------------------------- */
    async function signOut() {
        if (window.SUPABASE_READY && window.supabaseClient) {
            try { await window.supabaseClient.auth.signOut(); } catch (e) { }
        }
        clearSession();
        window.location.href = getRootPath() + 'index.html';
    }

    /* -------------------------------------------------------
       GET CURRENT USER
    ------------------------------------------------------- */
    function getCurrentUser() {
        return getSession();
    }

    /* -------------------------------------------------------
       ROOT PATH RESOLVER
       Works whether page is in /admin/, /user/, or root.
    ------------------------------------------------------- */
    function getRootPath() {
        const path = window.location.pathname;
        if (path.includes('/admin/') || path.includes('/user/')) return '../';
        return '';
    }

    /* -------------------------------------------------------
       LOGIN PAGE INIT
    ------------------------------------------------------- */
    function initLoginPage() {
        // If already logged in, redirect
        const session = getSession();
        if (session) {
            const dest = session.role === 'admin' ? 'admin/neural-orbit.html' : 'user/neural-orbit.html';
            window.location.href = dest;
            return;
        }

        const form = document.getElementById('login-form');
        const emailEl = document.getElementById('login-email');
        const passEl = document.getElementById('login-password');
        const errEl = document.getElementById('login-error');
        const errMsg = document.getElementById('login-error-msg');
        const btn = document.getElementById('login-btn');

        if (!form) return;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = emailEl?.value || '';
            const password = passEl?.value || '';

            if (!email || !password) {
                showError('Please enter both email and password.');
                return;
            }

            // Loading state
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<div class="btn-spinner"></div> Authenticating...';
            }
            if (errEl) errEl.style.display = 'none';

            const result = await signIn(email, password);

            if (result.ok) {
                if (btn) btn.innerHTML = '<i class="bi bi-check-lg"></i> Welcome!';
                const dest = result.role === 'admin' ? 'admin/neural-orbit.html' : 'user/neural-orbit.html';
                setTimeout(() => { window.location.href = dest; }, 400);
            } else {
                showError(result.error || 'Login failed.');
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="bi bi-lightning-fill"></i> Sign In to NeuralOrbit';
                }
            }
        });

        function showError(msg) {
            if (errEl) errEl.style.display = 'flex';
            if (errMsg) errMsg.textContent = msg;
        }
    }

    /* -------------------------------------------------------
       EXPOSE GLOBALLY
    ------------------------------------------------------- */
    window.NOAuth = {
        signIn,
        signOut,
        getCurrentUser,
        getSession,
        getRootPath,
    };

    // Also expose for login page
    window.initLoginPage = initLoginPage;

})();
