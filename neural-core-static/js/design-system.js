/* ============================================================
   design-system.js — Design System Page
   Colors, Typography, Buttons, Alert States
   ============================================================ */

(function () {
    'use strict';

    /* -------------------------------------------------------
       DATA — exact from DesignSystem.tsx
    ------------------------------------------------------- */
    const colors = [
        { name: 'Primary', value: '#0A0F1F', label: 'Deep AI Navy', usage: 'Backgrounds, primary surfaces' },
        { name: 'Accent', value: '#5B8CFF', label: 'Intelligence Blue', usage: 'Interactive elements, highlights' },
        { name: 'Success', value: '#22C55E', label: 'Success Green', usage: 'Positive actions, confirmations' },
        { name: 'Warning', value: '#F59E0B', label: 'Warning Amber', usage: 'Alerts, caution states' },
        { name: 'Danger', value: '#EF4444', label: 'Danger Red', usage: 'Errors, destructive actions' },
        { name: 'Light Surface', value: '#F8FAFC', label: 'Light Surface', usage: 'Light mode backgrounds' },
    ];

    const typography = [
        { label: 'Heading 1', size: '24px', weight: '600', sample: 'Neural Core Dashboard' },
        { label: 'Heading 2', size: '20px', weight: '600', sample: 'Executive Overview' },
        { label: 'Heading 3', size: '16px', weight: '600', sample: 'Business Intelligence Score' },
        { label: 'Body Regular', size: '14px', weight: '400', sample: 'Real-time business intelligence powered by AI' },
        { label: 'Body Medium', size: '14px', weight: '500', sample: 'Your business is 4.1% smarter' },
        { label: 'Caption', size: '12px', weight: '400', sample: 'Last updated 2 minutes ago' },
        { label: 'Overline', size: '11px', weight: '600', sample: 'SYSTEM STATUS', upper: true },
    ];

    const buttons = [
        { label: 'Primary', style: 'background: linear-gradient(135deg, #5B8CFF, #3B6FE0); color: white;', tag: 'Primary' },
        { label: 'Secondary', style: 'background: transparent; border: 1px solid rgba(91,140,255,0.2); color: #E2E8F0;', tag: 'Secondary' },
        { label: 'Danger', style: 'background: #EF4444; color: white;', tag: 'Danger' },
        { label: 'Success', style: 'background: #22C55E; color: white;', tag: 'Success' },
    ];

    const alerts = [
        { text: 'Information: System update available', color: '#5B8CFF', bg: 'rgba(91,140,255,0.06)', border: 'rgba(91,140,255,0.2)' },
        { text: 'Success: Intelligence rules applied successfully', color: '#22C55E', bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.2)' },
        { text: 'Warning: Approaching API rate limit', color: '#F59E0B', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
        { text: 'Danger: Critical security alert detected', color: '#EF4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)' },
    ];

    /* -------------------------------------------------------
       RENDER
    ------------------------------------------------------- */
    window.loadDesignSystem = function () {
        const content = document.getElementById('page-content');
        if (!content) return;

        content.innerHTML = `
      <div class="page-animate" style="padding: 24px; display: flex; flex-direction: column; gap: 32px;">

        <!-- Header -->
        <div>
          <h1 class="page-title">Design System</h1>
          <p class="page-subtitle">Neural Core design tokens, components, and guidelines</p>
        </div>

        <!-- Colors -->
        <div class="card">
          <div class="card-title">
            <i class="bi bi-palette" style="color: var(--accent);"></i>
            Colors
          </div>
          <div class="ds-swatch-grid">
            ${colors.map(c => `
              <div class="ds-swatch-card">
                <div class="ds-swatch-block" style="background: ${c.value};"></div>
                <div class="ds-swatch-info">
                  <div class="ds-swatch-row">
                    <span class="ds-swatch-name">${c.name}</span>
                    <span class="ds-swatch-hex">${c.value}</span>
                  </div>
                  <div class="ds-swatch-label">${c.label}</div>
                  <div class="ds-swatch-usage">${c.usage}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Typography -->
        <div class="card">
          <div class="card-title">
            <i class="bi bi-type" style="color: var(--accent);"></i>
            Typography — Inter
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${typography.map(t => `
              <div class="ds-type-row">
                <div class="ds-type-left">
                  <span class="ds-type-level">${t.label}</span>
                  <span style="font-size: ${t.size}; font-weight: ${t.weight}; color: var(--text); margin-top: 4px; ${t.upper ? 'text-transform: uppercase; letter-spacing: 0.08em;' : ''}">${t.sample}</span>
                </div>
                <span class="ds-type-class">${t.size} / ${t.weight}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Buttons -->
        <div class="card">
          <div class="card-title">
            <i class="bi bi-square" style="color: var(--accent);"></i>
            Buttons
          </div>
          <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
            ${buttons.map(b => `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <button style="padding: 10px 24px; border-radius: var(--radius); font-size: 14px; font-weight: 600; cursor: pointer; border: none; font-family: var(--font); ${b.style} transition: opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
                  ${b.label} Button
                </button>
                <span style="font-size: 11px; color: var(--dim);">${b.tag}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Alert States -->
        <div class="card">
          <div class="card-title">
            <i class="bi bi-exclamation-triangle" style="color: var(--warning);"></i>
            Alert States
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${alerts.map(a => `
              <div class="ds-alert-row" style="background: ${a.bg}; border: 1px solid ${a.border};">
                <div class="ds-alert-dot" style="background: ${a.color};"></div>
                <span style="font-size: 13px; color: ${a.color};">${escHtml(a.text)}</span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
    };

    /* -------------------------------------------------------
       UTILS
    ------------------------------------------------------- */
    function escHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

})();
