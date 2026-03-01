/* ============================================================
   autonomy.js — NeuralOrbit Autonomy Control (Module + Role Aware)
   Admin: full interactive controls to change levels
   User: read-only view of current autonomy settings
   ============================================================ */

(function () {
  'use strict';

  const levels = [
    { key: 'observe', label: 'Observe', icon: 'bi-eye', color: '#5B8CFF', bg: 'rgba(91,140,255,0.1)', border: 'rgba(91,140,255,0.2)', desc: 'AI watches and learns from your decisions without taking any action', features: ['Monitors all data streams', 'Builds decision models', 'Suggests improvements', 'Zero risk'] },
    { key: 'assist', label: 'Assist', icon: 'bi-hand-index-thumb', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', desc: 'AI recommends actions and assists, but you approve every decision', features: ['Real-time recommendations', 'Draft responses & actions', 'Human approval required', 'Low risk'] },
    { key: 'autonomous', label: 'Autonomous', icon: 'bi-robot', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', desc: 'AI makes and executes decisions independently within defined boundaries', features: ['Full decision authority', 'Real-time execution', 'Post-action reporting', 'High efficiency'] },
  ];

  const moduleOverrides = [
    { key: 'crm', label: 'CRM', icon: 'bi-people', color: '#5B8CFF', default: 'assist' },
    { key: 'marketing', label: 'Marketing', icon: 'bi-megaphone', color: '#8B5CF6', default: 'assist' },
    { key: 'shield', label: 'Shield', icon: 'bi-shield', color: '#F59E0B', default: 'observe' },
    { key: 'website', label: 'Website', icon: 'bi-globe', color: '#22C55E', default: 'autonomous' },
  ];

  let globalLevel = 'assist';
  let moduleSettings = {};

  function initState() {
    globalLevel = 'assist';
    moduleOverrides.forEach(m => { moduleSettings[m.key] = m.default; });
  }

  window.loadAutonomy = function () {
    const content = document.getElementById('page-content');
    if (!content) return;

    initState();

    const isAdmin = window.CURRENT_ROLE === 'admin';
    const currentModule = window.CURRENT_MODULE || 'neural-orbit';
    const isGlobal = currentModule === 'neural-orbit';

    // For non-global modules, pre-select the relevant module level
    if (!isGlobal) {
      const moduleMap = { crm: 'CRM', marketing: 'Marketing', shield: 'Shield', website: 'Website' };
      const modName = moduleMap[currentModule];
      const modSetting = moduleOverrides.find(m => m.label === modName);
      if (modSetting) globalLevel = modSetting.default;
    }

    content.innerHTML = `
            <div class="page-animate" style="padding: 24px; display: flex; flex-direction: column; gap: 24px;">

                <!-- Header -->
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h1 class="page-title">Autonomy Control</h1>
                        <p class="page-subtitle">Set operational boundaries for AI decision autonomy</p>
                    </div>
                    ${!isAdmin ? `
                        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: var(--radius); border: 1px solid var(--border); background: rgba(30,41,59,0.5);">
                            <i class="bi bi-eye" style="font-size: 13px; color: var(--muted);"></i>
                            <span style="font-size: 11px; font-weight: 600; color: var(--muted);">READ-ONLY VIEW</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Global Level Cards -->
                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                        <span style="font-size: 13px; font-weight: 600; color: var(--text);">
                            ${isGlobal ? 'Global Autonomy Level' : `${currentModule.charAt(0).toUpperCase() + currentModule.slice(1)} Autonomy Level`}
                        </span>
                        ${isAdmin ? `
                            <button id="disable-all-btn" class="btn btn-danger btn-sm">
                                <i class="bi bi-x-circle"></i> ${isGlobal ? 'Disable All' : 'Set to Observe'}
                            </button>
                        ` : ''}
                    </div>
                    <div class="autonomy-grid" id="level-cards">
                        ${levels.map(l => buildLevelCard(l, isAdmin)).join('')}
                    </div>
                </div>

                <!-- Warning Banner (shows when Autonomous) -->
                <div class="warning-banner" id="autonomous-warning" style="display: ${globalLevel === 'autonomous' ? 'flex' : 'none'};">
                    <div class="warning-icon-wrap"><i class="bi bi-exclamation-triangle-fill"></i></div>
                    <div>
                        <div class="warning-title">Full Autonomy Activated</div>
                        <div class="warning-desc">The AI will execute decisions automatically without human approval. Monitor actively and use Emergency Override if behavior deviates.</div>
                        ${isAdmin ? `
                            <div class="warning-actions">
                                <button class="btn btn-danger btn-sm" id="emergency-override"><i class="bi bi-x-octagon"></i> Emergency Override</button>
                                <button class="btn btn-secondary btn-sm" id="switch-to-assist">Switch to Assist</button>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Per-module overrides (only on NeuralOrbit global dashboard) -->
                ${isGlobal ? `
                    <div class="card">
                        <div class="card-title">
                            <i class="bi bi-grid-3x3-gap" style="color: var(--accent);"></i>
                            Per-Module Autonomy Override
                            ${!isAdmin ? '<span style="margin-left: auto; font-size: 10px; font-weight: 600; color: var(--dim); background: rgba(30,41,59,0.6); padding: 2px 8px; border-radius: 4px;">READ-ONLY</span>' : ''}
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px;" id="module-rows">
                            ${moduleOverrides.map(m => buildModuleRow(m, isAdmin)).join('')}
                        </div>
                    </div>
                ` : ''}

            </div>
        `;

    if (isAdmin) bindEvents(isGlobal);
  };

  function buildLevelCard(l, isAdmin) {
    const isActive = globalLevel === l.key;
    return `
            <div class="autonomy-card ${isActive ? 'is-active' : ''} ${!isAdmin ? 'readonly-card' : ''}"
                 id="level-card-${l.key}" data-level="${l.key}"
                 style="${isActive ? `border-color: ${l.color}; box-shadow: 0 0 30px ${l.bg};` : ''}"
                 role="${isAdmin ? 'button' : 'presentation'}" tabindex="${isAdmin ? 0 : -1}">
                <i class="bi bi-check-circle-fill autonomy-check" style="color: ${l.color};"></i>
                <div class="autonomy-level-icon" style="background: ${l.bg};">
                    <i class="bi ${l.icon}" style="color: ${l.color}; font-size: 24px;"></i>
                </div>
                <div class="autonomy-title">${l.label}</div>
                <div class="autonomy-desc">${l.desc}</div>
                <ul class="autonomy-features">
                    ${l.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
            </div>
        `;
  }

  function buildModuleRow(m, isAdmin) {
    const setting = moduleSettings[m.key];
    return `
            <div class="module-row">
                <div class="module-row-left">
                    <div class="module-icon-sq" style="background: ${m.color}18; color: ${m.color};"><i class="bi ${m.icon}"></i></div>
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
                                style="${setting === lv ? `background: ${m.color}18; color: ${m.color}; border-color: ${m.color}40;` : ''}"
                                ${!isAdmin ? 'disabled style="cursor:not-allowed;opacity:0.5;"' : ''}>
                            ${capitalize(lv)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
  }

  function bindEvents(isGlobal) {
    document.querySelectorAll('.autonomy-card').forEach(card => {
      if (card.getAttribute('role') === 'button') {
        card.addEventListener('click', () => setGlobalLevel(card.dataset.level));
      }
    });

    if (isGlobal) {
      document.querySelectorAll('.module-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          moduleSettings[btn.dataset.module] = btn.dataset.level;
          refreshModuleRows();
          updateWarningBanner();
        });
      });
    }

    document.getElementById('disable-all-btn')?.addEventListener('click', () => {
      setGlobalLevel('observe');
      if (isGlobal) { moduleOverrides.forEach(m => { moduleSettings[m.key] = 'observe'; }); refreshModuleRows(); }
    });

    document.getElementById('emergency-override')?.addEventListener('click', () => {
      setGlobalLevel('observe');
      if (isGlobal) { moduleOverrides.forEach(m => { moduleSettings[m.key] = 'observe'; }); refreshModuleRows(); }
    });

    document.getElementById('switch-to-assist')?.addEventListener('click', () => setGlobalLevel('assist'));
  }

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
    const anyAuto = globalLevel === 'autonomous' || Object.values(moduleSettings).some(v => v === 'autonomous');
    const banner = document.getElementById('autonomous-warning');
    if (banner) banner.style.display = anyAuto ? 'flex' : 'none';
  }

  function refreshModuleRows() {
    const container = document.getElementById('module-rows');
    if (!container) return;
    const isAdmin = window.CURRENT_ROLE === 'admin';
    container.innerHTML = moduleOverrides.map(m => buildModuleRow(m, isAdmin)).join('');
    document.querySelectorAll('.module-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        moduleSettings[btn.dataset.module] = btn.dataset.level;
        refreshModuleRows();
        updateWarningBanner();
      });
    });
  }

  function levelColor(lvl) {
    return { observe: '#94A3B8', assist: '#5B8CFF', autonomous: '#22C55E' }[lvl] || '#94A3B8';
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

})();
