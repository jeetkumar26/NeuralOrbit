/* ============================================================
   app.js — Application Entry Point
   Sidebar collapse, nav click, AI status, initial load
   ============================================================ */

(function () {
    'use strict';

    /* -------------------------------------------------------
       SIDEBAR COLLAPSE
    ------------------------------------------------------- */
    function initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebar-toggle');
        const toggleIcon = document.getElementById('sidebar-toggle-icon');

        if (!sidebar || !toggleBtn) return;

        let isCollapsed = false;

        toggleBtn.addEventListener('click', () => {
            isCollapsed = !isCollapsed;
            sidebar.classList.toggle('sidebar--collapsed', isCollapsed);

            // Update icon direction
            if (toggleIcon) {
                toggleIcon.className = isCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left';
            }
        });
    }

    /* -------------------------------------------------------
       TOP NAV MODULE TABS
    ------------------------------------------------------- */
    function initTopNavTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const route = btn.dataset.route;
                if (route) window.navigate(route);
            });
        });
    }

    /* -------------------------------------------------------
       SIDEBAR NAV ITEMS
    ------------------------------------------------------- */
    function initSidebarNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const route = item.dataset.route;
                if (route) window.navigate(route);
            });
        });
    }

    /* -------------------------------------------------------
       AI STATUS BADGE
       Cycles: active → learning → idle every 8s for demo
    ------------------------------------------------------- */
    function initAIStatus() {
        const statusEl = document.getElementById('ai-status');
        const textEl = document.getElementById('ai-status-text');

        if (!statusEl) return;

        const states = [
            { key: 'active', label: 'AI ACTIVE', cls: 'status-active' },
            { key: 'learning', label: 'AI LEARNING', cls: 'status-learning' },
            { key: 'idle', label: 'AI IDLE', cls: 'status-idle' },
        ];

        let current = 0;
        // Start with active
        applyStatus(states[0]);

        function applyStatus(state) {
            statusEl.className = 'ai-status ' + state.cls;
            if (textEl) textEl.textContent = state.label;
        }

        // Auto-cycle for demo purposes
        setInterval(() => {
            current = (current + 1) % states.length;
            applyStatus(states[current]);
        }, 8000);
    }

    /* -------------------------------------------------------
       INITIAL PAGE LOAD
    ------------------------------------------------------- */
    function initialLoad() {
        const hash = window.location.hash.replace('#', '') || 'overview';
        window._routerDispatch?.(hash);
    }

    /* -------------------------------------------------------
       BOOT
    ------------------------------------------------------- */
    function boot() {
        initSidebar();
        initTopNavTabs();
        initSidebarNav();
        initAIStatus();
        initialLoad();
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
