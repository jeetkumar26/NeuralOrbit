/* ============================================================
   autonomy.js — Autonomy Control Page
   3-way level selection + per-module overrides + warning banner
   ============================================================ */

(function () {
  'use strict';

  /* -------------------------------------------------------
     DATA — exact from AutonomyControl.tsx
  ------------------------------------------------------- */
  // Exact from AutonomyControl.tsx: observe=#5B8CFF, assist=#22C55E, autonomous=#EF4444
  const levels = [
    {
      key: 'observe',
      label: 'Observe',
      icon: 'bi-eye',
      color: '#5B8CFF',
      bg: 'rgba(91,140,255,0.1)',
      border: 'rgba(91,140,255,0.2)',
      desc: 'AI watches and learns from your decisions without taking any action',
      features: [
        'Monitors all data streams',
        'Builds decision models',
        'Suggests improvements',
        'Zero risk',
      ],
    },
    {
      key: 'assist',
      label: 'Assist',
      icon: 'bi-hand-index-thumb',
      color: '#22C55E',
      bg: 'rgba(34,197,94,0.1)',
      border: 'rgba(34,197,94,0.3)',
      desc: 'AI recommends actions and assists, but you approve every decision',
      features: [
        'Real-time recommendations',
        'Draft responses & actions',
        'Human approval required',
        'Low risk',
      ],
    },
    {
      key: 'autonomous',
      label: 'Autonomous',
      icon: 'bi-robot',
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.1)',
      border: 'rgba(239,68,68,0.3)',
      desc: 'AI makes and executes decisions independently within defined boundaries',
      features: [
        'Full decision authority',
        'Real-time execution',
        'Post-action reporting',
        'High efficiency',
      ],
    },
  ];

  // Exact from AutonomyControl.tsx: crm=assist, marketing=assist, shield=observe, website=autonomous
  const moduleOverrides = [
    { key: 'crm', label: 'CRM', icon: 'bi-people', color: '#5B8CFF', default: 'assist' },
    { key: 'marketing', label: 'Marketing', icon: 'bi-megaphone', color: '#8B5CF6', default: 'assist' },
    { key: 'shield', label: 'Shield', icon: 'bi-shield-check', color: '#F59E0B', default: 'observe' },
    { key: 'website', label: 'Website', icon: 'bi-globe', color: '#22C55E', default: 'autonomous' },
  ];

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */
  let globalLevel = 'assist';
  let moduleSettings = {};

  function initState() {
    globalLevel = 'assist';
    moduleOverrides.forEach(m => { moduleSettings[m.key] = m.default; });
  }

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  window.loadAutonomy = function () {
    const content = document.getElementById('page-content');
    if (!content) return;

    initState();

    content.innerHTML = `
      <div class="page-animate" style="padding: 24px; display: flex; flex-direction: column; gap: 24px;">

        <!-- Header -->
        <div>
          <h1 class="page-title">Autonomy Control</h1>
          <p class="page-subtitle">Set operational boundaries for AI decision autonomy</p>
        </div>

        <!-- Global Level Cards -->
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <span style="font-size: 13px; font-weight: 600; color: var(--text);">Global Autonomy Level</span>
            <button id="disable-all-btn" class="btn btn-danger btn-sm">
              <i class="bi bi-x-circle"></i>
              Disable All
            </button>
          </div>
          <div class="autonomy-grid" id="level-cards">
            ${levels.map(l => buildLevelCard(l)).join('')}
          </div>
        </div>

        <!-- Warning banner (Autonomous) -->
        <div class="warning-banner" id="autonomous-warning" style="display: ${globalLevel === 'autonomous' ? 'flex' : 'none'};">
          <div class="warning-icon-wrap">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div>
            <div class="warning-title">Full Autonomy Activated</div>
            <div class="warning-desc">
              The AI will execute decisions automatically across all modules without human approval.
              Monitor actively and use Emergency Override if behavior deviates from expectations.
            </div>
            <div class="warning-actions">
              <button class="btn btn-danger btn-sm" id="emergency-override">
                <i class="bi bi-x-octagon"></i>
                Emergency Override
              </button>
              <button class="btn btn-secondary btn-sm" id="switch-to-assist">
                Switch to Assist
              </button>
            </div>
          </div>
        </div>

        <!-- Per-module overrides -->
        <div class="card">
          <div class="card-title">
            <i class="bi bi-grid-3x3-gap" style="color: var(--accent);"></i>
            Per-Module Autonomy Override
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;" id="module-rows">
            ${moduleOverrides.map(m => buildModuleRow(m)).join('')}
          </div>
        </div>

      </div>
    `;

    bindEvents();
  };

  /* -------------------------------------------------------
     BUILD LEVEL CARD
  ------------------------------------------------------- */
  function buildLevelCard(l) {
    const isActive = globalLevel === l.key;
    return `
      <div class="autonomy-card ${isActive ? 'is-active' : ''}"
           id="level-card-${l.key}"
           data-level="${l.key}"
           style="${isActive ? `border-color: ${l.color}; box-shadow: 0 0 30px ${l.bg};` : ''}"
           role="button" tabindex="0">
        <i class="bi bi-check-circle-fill autonomy-check" style="color: ${l.color};"></i>
        <div class="autonomy-level-icon" style="background: ${l.bg};">
          <i class="${l.icon}" style="color: ${l.color}; font-size: 24px;"></i>
        </div>
        <div class="autonomy-title">${l.label}</div>
        <div class="autonomy-desc">${l.desc}</div>
        <ul class="autonomy-features">
          ${l.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  /* -------------------------------------------------------
     BUILD MODULE ROW
  ------------------------------------------------------- */
  function buildModuleRow(m) {
    const setting = moduleSettings[m.key];
    return `
      <div class="module-row">
        <div class="module-row-left">
          <div class="module-icon-sq" style="background: ${m.color}18; color: ${m.color};">
            <i class="${m.icon}"></i>
          </div>
          <div class="module-row-info">
            <div class="module-row-name">${m.label}</div>
            <div class="module-row-status">
              <span class="module-row-dot" style="background: ${levelColor(setting)};"></span>
              <span style="text-transform: capitalize;">${setting}</span>
            </div>
          </div>
        </div>
        <div class="module-pill-group" data-module="${m.key}">
          ${['observe', 'assist', 'autonomous'].map(lv => `
            <button class="module-pill ${setting === lv ? 'is-active' : ''}"
                    data-module="${m.key}" data-level="${lv}"
                    style="${setting === lv ? `background: ${m.color}18; color: ${m.color}; border-color: ${m.color}40;` : ''}">
              ${capitalize(lv)}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* -------------------------------------------------------
     BIND EVENTS
  ------------------------------------------------------- */
  function bindEvents() {
    // Global level cards
    document.querySelectorAll('.autonomy-card').forEach(card => {
      card.addEventListener('click', () => {
        const lvl = card.dataset.level;
        setGlobalLevel(lvl);
      });
    });

    // Module pills
    document.querySelectorAll('.module-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const mod = btn.dataset.module;
        const lvl = btn.dataset.level;
        moduleSettings[mod] = lvl;
        refreshModuleRows();
      });
    });

    // Disable All
    const disableBtn = document.getElementById('disable-all-btn');
    if (disableBtn) {
      disableBtn.addEventListener('click', () => {
        setGlobalLevel('observe');
        moduleOverrides.forEach(m => { moduleSettings[m.key] = 'observe'; });
        refreshModuleRows();
      });
    }

    // Emergency Override
    const emergencyBtn = document.getElementById('emergency-override');
    if (emergencyBtn) {
      emergencyBtn.addEventListener('click', () => {
        setGlobalLevel('observe');
        moduleOverrides.forEach(m => { moduleSettings[m.key] = 'observe'; });
        refreshModuleRows();
      });
    }

    // Switch to Assist
    const assistBtn = document.getElementById('switch-to-assist');
    if (assistBtn) {
      assistBtn.addEventListener('click', () => {
        setGlobalLevel('assist');
      });
    }
  }

  /* -------------------------------------------------------
     SET GLOBAL LEVEL
  ------------------------------------------------------- */
  function setGlobalLevel(lvl) {
    globalLevel = lvl;

    levels.forEach(l => {
      const card = document.getElementById(`level-card-${l.key}`);
      if (!card) return;
      const isActive = l.key === lvl;
      card.classList.toggle('is-active', isActive);
      card.style.borderColor = isActive ? l.color : '';
      card.style.boxShadow = isActive ? `0 0 30px ${l.bg}` : '';
    });

    updateWarningBanner();
  }

  function updateWarningBanner() {
    // Show warning if global level is autonomous OR any module is autonomous
    const anyAutonomous = globalLevel === 'autonomous' ||
      Object.values(moduleSettings).some(v => v === 'autonomous');
    const banner = document.getElementById('autonomous-warning');
    if (banner) banner.style.display = anyAutonomous ? 'flex' : 'none';
  }

  /* -------------------------------------------------------
     REFRESH MODULE ROWS
  ------------------------------------------------------- */
  function refreshModuleRows() {
    const container = document.getElementById('module-rows');
    if (!container) return;
    container.innerHTML = moduleOverrides.map(m => buildModuleRow(m)).join('');

    // Re-bind events
    container.querySelectorAll('.module-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const mod = btn.dataset.module;
        const lvl = btn.dataset.level;
        moduleSettings[mod] = lvl;
        refreshModuleRows();
      });
    });
  }

  /* -------------------------------------------------------
     UTILS
  ------------------------------------------------------- */
  function levelColor(lvl) {
    const map = { observe: '#94A3B8', assist: '#5B8CFF', autonomous: '#22C55E' };
    return map[lvl] || '#94A3B8';
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

})();
