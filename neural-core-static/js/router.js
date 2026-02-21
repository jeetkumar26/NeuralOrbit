/* ============================================================
   router.js — Hash-based SPA Router
   No build step needed. Listens to hashchange events.
   ============================================================ */

(function () {
    'use strict';

    // Route → page loader function map
    // These functions are defined in each page's JS file
    const routes = {
        'design-system': () => window.loadDesignSystem?.(),
        'overview': () => window.loadOverview?.(),
        'decisions': () => window.loadDecisionLog?.(),
        'reward': () => window.loadRewardEngine?.(),
        'autonomy': () => window.loadAutonomy?.(),
        'learning': () => window.loadLearning?.(),
        // Module sub-pages
        'crm': () => window.loadModulePage?.('crm'),
        'marketing': () => window.loadModulePage?.('marketing'),
        'shield': () => window.loadModulePage?.('shield'),
        'website': () => window.loadModulePage?.('website'),
    };

    /**
     * Navigate to a route by hash string
     * @param {string} route - e.g. 'overview', 'decisions'
     */
    function navigate(route) {
        const hash = route.startsWith('#') ? route.slice(1) : route;
        if (window.location.hash === '#' + hash) {
            // Already on route — force re-render
            dispatch(hash);
        } else {
            window.location.hash = hash;
        }
    }

    /**
     * Dispatch a route change — update UI and call page loader
     * @param {string} hash - route name without '#'
     */
    function dispatch(hash) {
        const route = hash || 'overview';

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.toggle('is-active', el.dataset.route === route);
        });

        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(el => {
            el.classList.toggle('is-active', el.dataset.route === route);
        });

        // Update breadcrumb
        const activNav = document.querySelector(`.nav-item[data-route="${route}"]`);
        const breadcrumb = document.getElementById('breadcrumb');
        if (breadcrumb) {
            breadcrumb.textContent = activNav?.dataset.label || formatLabel(route);
        }

        // Call the page loader
        const loader = routes[route];
        if (loader) {
            loader();
        } else {
            // Default: overview
            routes['overview']?.();
        }
    }

    /**
     * Format a route name into a human-readable label
     * @param {string} route
     */
    function formatLabel(route) {
        const labels = {
            'design-system': 'Design System',
            'overview': 'Neural Core Dashboard',
            'decisions': 'Decision Log',
            'reward': 'Reward Engine',
            'autonomy': 'Autonomy Control',
            'learning': 'Learning Timeline',
            'crm': 'CRM Module',
            'marketing': 'Marketing Module',
            'shield': 'Shield Module',
            'website': 'Website Module',
        };
        return labels[route] || route;
    }

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        dispatch(hash);
    });

    // Expose navigate globally
    window.navigate = navigate;
    window._routerDispatch = dispatch;

})();
