/* ============================================================
   reward-engine.js — NeuralOrbit Reward Control (Role-Aware)
   Admin: interactive sliders, apply button
   User: read-only visual view of current weights
   ============================================================ */

(function () {
  'use strict';

  const sliders = [
    { key: 'conversion', label: 'Conversion', default: 75, icon: 'bi-graph-up-arrow', color: '#5B8CFF', desc: 'Optimize for converting prospects to customers' },
    { key: 'retention', label: 'Retention', default: 85, icon: 'bi-people-fill', color: '#22C55E', desc: 'Prioritize keeping existing customers engaged' },
    { key: 'cost', label: 'Cost', default: 40, icon: 'bi-coin', color: '#F59E0B', desc: 'Control spending and budget allocation' },
    { key: 'risk', label: 'Risk', default: 30, icon: 'bi-shield-fill', color: '#EF4444', desc: 'Manage risk tolerance across operations' },
  ];

  const industryPresets = [
    { name: 'SaaS', values: { conversion: 75, retention: 85, cost: 40, risk: 30 } },
    { name: 'Finance', values: { conversion: 60, retention: 70, cost: 50, risk: 20 } },
    { name: 'E-commerce', values: { conversion: 85, retention: 60, cost: 55, risk: 45 } },
    { name: 'Healthcare', values: { conversion: 50, retention: 90, cost: 35, risk: 15 } },
  ];

  let values = {};
  let simMode = true;
  let applying = false;
  let activePreset = 'SaaS';

  function initState() {
    const preset = industryPresets.find(p => p.name === activePreset);
    sliders.forEach(s => { values[s.key] = preset ? preset.values[s.key] : s.default; });
    simMode = true;
    applying = false;
  }

  window.loadRewardEngine = function () {
    const content = document.getElementById('page-content');
    if (!content) return;

    initState();

    const isAdmin = window.CURRENT_ROLE === 'admin';
    const currentModule = window.CURRENT_MODULE || 'neural-orbit';

    content.innerHTML = `
            <div class="page-animate" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">

                <!-- Top Header -->
                <div style="padding: 24px 24px 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-shrink: 0;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #EF4444, #DC2626); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
                            <i class="bi bi-lightning-fill" style="font-size: 22px;"></i>
                        </div>
                        <div>
                            <h1 style="font-size: 22px; font-weight: 700; color: var(--text); line-height: 1.2;">Reward Control Center</h1>
                            <p style="font-size: 13px; color: var(--muted); margin-top: 4px;">Control how the AI thinks — tune reward signals that drive every decision</p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: var(--radius); border: 1px solid ${isAdmin ? 'rgba(239,68,68,0.3)' : 'var(--border)'}; background: ${isAdmin ? 'rgba(239,68,68,0.08)' : 'rgba(30,41,59,0.5)'}; flex-shrink: 0;">
                        <i class="bi bi-${isAdmin ? 'exclamation-triangle' : 'eye'}" style="font-size: 13px; color: ${isAdmin ? '#EF4444' : 'var(--muted)'};"></i>
                        <span style="font-size: 11px; font-weight: 700; color: ${isAdmin ? '#EF4444' : 'var(--muted)'}; letter-spacing: 0.05em;">
                            ${isAdmin ? 'CRITICAL SYSTEM — Changes affect all AI behavior' : 'READ-ONLY VIEW'}
                        </span>
                    </div>
                </div>

                <!-- Main 2-Column -->
                <div style="flex: 1; display: flex; gap: 20px; padding: 20px 24px 24px; overflow: hidden; min-height: 0;">

                    <!-- LEFT: Sliders -->
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; min-width: 0;">
                        <div class="card" style="flex-shrink: 0;">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                                <span style="font-size: 13px; font-weight: 600; color: var(--text); text-transform: uppercase; letter-spacing: 0.05em;">Reward Weight Distribution</span>
                                ${isAdmin ? '<button style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: rgba(30,41,59,0.5); font-size: 11px; font-weight: 600; color: var(--muted); cursor: pointer; font-family: var(--font);"><i class="bi bi-gear" style="font-size: 11px;"></i> Advanced</button>' : ''}
                            </div>
                            <div class="sliders-grid" id="sliders-grid">
                                ${sliders.map(s => buildSlider(s, isAdmin)).join('')}
                            </div>
                        </div>

                        <!-- Weight Bar -->
                        <div class="card" style="flex-shrink: 0;">
                            <div style="font-size: 10px; font-weight: 700; color: var(--dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px;">Combined Weight Distribution</div>
                            <div class="weight-bar" id="weight-bar">${buildWeightBar()}</div>
                            <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-top: 10px; font-size: 11px; color: var(--muted);" id="weight-bar-legend">${buildWeightLegend()}</div>
                        </div>
                    </div>

                    <!-- RIGHT: Panel -->
                    <div style="width: 240px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; overflow-y: auto;">

                        <!-- Industry Presets -->
                        <div class="card card-sm">
                            <div style="font-size: 10px; font-weight: 700; color: var(--dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Industry Presets</div>
                            <div style="position: relative;" id="preset-dropdown-wrap">
                                <button id="preset-trigger" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); font-size: 13px; color: var(--text); cursor: ${isAdmin ? 'pointer' : 'not-allowed'}; font-family: var(--font); opacity: ${isAdmin ? 1 : 0.6};" ${isAdmin ? '' : 'disabled'}>
                                    <span id="preset-current">${activePreset}</span>
                                    <i class="bi bi-chevron-down" style="color: var(--dim); font-size: 12px;"></i>
                                </button>
                                <div id="preset-list" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; z-index: 100; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
                                    ${industryPresets.map(p => `<div class="preset-option ${p.name === activePreset ? 'is-selected' : ''}" data-preset="${p.name}" style="padding: 9px 14px; font-size: 13px; color: var(--muted); cursor: pointer;">${p.name}</div>`).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Simulation Mode -->
                        <div class="card card-sm">
                            <div style="font-size: 10px; font-weight: 700; color: var(--dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Simulation Mode</div>
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                                <span id="sim-label" style="font-size: 13px; font-weight: 600; color: ${simMode ? 'var(--text)' : 'var(--muted)'};">${simMode ? 'Active — No real impact' : 'Inactive — LIVE mode'}</span>
                                <button id="sim-toggle" class="toggle-pill ${simMode ? 'is-on blue-toggle' : 'is-off blue-toggle'}" aria-label="Toggle simulation mode" ${!isAdmin ? 'disabled style="cursor:not-allowed;opacity:0.6;"' : ''}>
                                    <div class="toggle-pip"></div>
                                </button>
                            </div>
                            <div id="sim-note" style="display: ${simMode ? 'flex' : 'none'}; align-items: center; gap: 6px; font-size: 11px; color: var(--accent);">
                                <i class="bi bi-play-fill" style="font-size: 11px;"></i> Learning only — safe to experiment.
                            </div>
                        </div>

                        <!-- Apply Button (admin only) -->
                        ${isAdmin ? `
                            <button id="apply-btn" class="apply-btn state-idle">
                                <div class="apply-btn-overlay"></div>
                                <span id="apply-btn-inner">
                                    <i class="bi bi-lightning-fill"></i>
                                    Apply New Intelligence Rules
                                </span>
                            </button>
                        ` : `
                            <div style="padding: 13px; border-radius: var(--radius); border: 1px solid var(--border); background: rgba(30,41,59,0.3); text-align: center; font-size: 12px; color: var(--dim);">
                                <i class="bi bi-lock" style="display: block; font-size: 20px; margin-bottom: 6px; color: var(--dim);"></i>
                                Admin access required to apply new intelligence rules
                            </div>
                        `}

                        <!-- Current Configuration -->
                        <div class="card card-sm">
                            <div style="font-size: 10px; font-weight: 700; color: var(--dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px;">Current Configuration</div>
                            <div style="display: flex; flex-direction: column; gap: 10px;" id="current-config">${buildConfigList()}</div>
                        </div>

                    </div>
                </div>
            </div>
        `;

    if (isAdmin) bindEvents();
  };

  function buildSlider(s, isAdmin) {
    const val = values[s.key];
    return `
            <div class="slider-col">
                <div class="slider-value-display" style="color: ${s.color};">${val}<span class="slider-value-unit">%</span></div>
                <div class="slider-track-wrap">
                    <div class="slider-track-bg"></div>
                    <div class="slider-track-fill" id="fill-${s.key}" style="height: ${val}%; background: linear-gradient(to top, ${s.color}cc, ${s.color});"></div>
                    <div class="slider-thumb" id="thumb-${s.key}" style="border-color: ${s.color}; bottom: calc(${val}% - 10px); box-shadow: 0 0 8px ${s.color}66;"></div>
                    <input type="range" class="slider-input" id="slider-${s.key}" data-key="${s.key}" min="0" max="100" step="1" value="${val}" ${!isAdmin ? 'disabled' : ''} aria-label="${s.label} weight" style="${!isAdmin ? 'cursor: not-allowed;' : ''}" />
                </div>
                <div class="slider-icon-wrap" style="background: ${s.color}22; color: ${s.color};"><i class="bi ${s.icon}" style="font-size: 18px;"></i></div>
                <div class="slider-label" style="color: ${s.color};">${s.label}</div>
                <div class="slider-desc">${s.desc}</div>
            </div>
        `;
  }

  function totalWeight() { return Object.values(values).reduce((a, b) => a + b, 0) || 1; }

  function buildWeightBar() {
    return sliders.map(s => `<div class="weight-segment" style="flex: ${values[s.key]}; background: ${s.color}; min-width: 4px;"></div>`).join('');
  }

  function buildWeightLegend() {
    const total = totalWeight();
    return sliders.map(s => {
      const pct = (values[s.key] / total * 100).toFixed(1);
      return `<div style="display: flex; align-items: center; gap: 5px;"><div style="width: 8px; height: 8px; border-radius: 50%; background: ${s.color}; flex-shrink: 0;"></div><span>${s.label}: ${pct}%</span></div>`;
    }).join('');
  }

  function buildConfigList() {
    const rows = sliders.map(s => `
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                <div style="display: flex; align-items: center; gap: 6px; color: var(--muted);">
                    <i class="bi ${s.icon}" style="color: ${s.color}; font-size: 12px;"></i> ${s.label}
                </div>
                <span style="font-weight: 600; color: ${s.color};">${values[s.key]}%</span>
            </div>`);
    rows.push(`
            <div style="height: 1px; background: var(--border-light); margin: 2px 0;"></div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                <span style="color: var(--muted);">Industry</span>
                <span style="font-weight: 600; color: var(--accent);">${activePreset}</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                <span style="color: var(--muted);">Simulation</span>
                <span style="font-weight: 600; color: ${simMode ? 'var(--success)' : 'var(--danger)'};">${simMode ? 'ON' : 'OFF'}</span>
            </div>`);
    return rows.join('');
  }

  function bindEvents() {
    document.querySelectorAll('.slider-input').forEach(input => {
      input.addEventListener('input', () => {
        const key = input.dataset.key;
        const val = parseInt(input.value, 10);
        values[key] = val;
        updateSliderVisuals(key, val);
        document.getElementById('weight-bar').innerHTML = buildWeightBar();
        document.getElementById('weight-bar-legend').innerHTML = buildWeightLegend();
        document.getElementById('current-config').innerHTML = buildConfigList();
      });
    });

    const trigger = document.getElementById('preset-trigger');
    const list = document.getElementById('preset-list');
    if (trigger && list) {
      trigger.addEventListener('click', e => { e.stopPropagation(); list.style.display = list.style.display === 'block' ? 'none' : 'block'; });
      list.querySelectorAll('.preset-option').forEach(opt => {
        opt.addEventListener('click', () => {
          const preset = industryPresets.find(p => p.name === opt.dataset.preset);
          if (!preset) return;
          activePreset = preset.name;
          Object.assign(values, preset.values);
          document.getElementById('preset-current').textContent = preset.name;
          list.style.display = 'none';
          sliders.forEach(s => { document.getElementById(`slider-${s.key}`).value = values[s.key]; updateSliderVisuals(s.key, values[s.key]); });
          document.getElementById('weight-bar').innerHTML = buildWeightBar();
          document.getElementById('weight-bar-legend').innerHTML = buildWeightLegend();
          document.getElementById('current-config').innerHTML = buildConfigList();
        });
      });
      document.addEventListener('click', e => { if (!trigger.contains(e.target) && !list.contains(e.target)) list.style.display = 'none'; }, { passive: true });
    }

    const simToggle = document.getElementById('sim-toggle');
    if (simToggle) {
      simToggle.addEventListener('click', () => {
        simMode = !simMode;
        simToggle.className = `toggle-pill ${simMode ? 'is-on blue-toggle' : 'is-off blue-toggle'}`;
        const lbl = document.getElementById('sim-label');
        const note = document.getElementById('sim-note');
        if (lbl) { lbl.textContent = simMode ? 'Active — No real impact' : 'Inactive — LIVE mode'; lbl.style.color = simMode ? 'var(--text)' : 'var(--muted)'; }
        if (note) note.style.display = simMode ? 'flex' : 'none';
        document.getElementById('current-config').innerHTML = buildConfigList();
      });
    }

    const applyBtn = document.getElementById('apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        if (applying) return;
        applying = true;
        const inner = document.getElementById('apply-btn-inner');
        applyBtn.className = 'apply-btn state-applying';
        if (inner) inner.innerHTML = '<div class="apply-btn-spinner"></div> Applying Intelligence Rules...';
        setTimeout(() => {
          applying = false;
          applyBtn.className = 'apply-btn state-idle';
          if (inner) inner.innerHTML = '<i class="bi bi-lightning-fill"></i> Apply New Intelligence Rules';
        }, 1800);
      });
    }
  }

  function updateSliderVisuals(key, val) {
    const fill = document.getElementById(`fill-${key}`);
    const thumb = document.getElementById(`thumb-${key}`);
    const input = document.getElementById(`slider-${key}`);
    const col = input?.closest('.slider-col');
    const vDisp = col?.querySelector('.slider-value-display');
    if (fill) fill.style.height = val + '%';
    if (thumb) thumb.style.bottom = `calc(${val}% - 10px)`;
    if (vDisp) vDisp.innerHTML = `${val}<span class="slider-value-unit">%</span>`;
  }

})();
