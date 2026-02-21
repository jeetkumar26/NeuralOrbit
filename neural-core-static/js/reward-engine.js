/* ============================================================
   reward-engine.js — Reward Control Center
   2-column layout: left = sliders + weight bar, right = panel
   ============================================================ */

(function () {
  'use strict';

  /* -------------------------------------------------------
     DATA
  ------------------------------------------------------- */
  const sliders = [
    {
      key: 'conversion', label: 'Conversion', default: 75,
      iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
      color: '#5B8CFF',
      desc: 'Optimize for converting prospects to customers',
    },
    {
      key: 'retention', label: 'Retention', default: 85,
      iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      color: '#22C55E',
      desc: 'Prioritize keeping existing customers engaged',
    },
    {
      key: 'cost', label: 'Cost', default: 40,
      iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
      color: '#F59E0B',
      desc: 'Control spending and budget allocation',
    },
    {
      key: 'risk', label: 'Risk', default: 30,
      iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      color: '#EF4444',
      desc: 'Manage risk tolerance across operations',
    },
  ];

  const industryPresets = [
    { name: 'SaaS', values: { conversion: 75, retention: 85, cost: 40, risk: 30 } },
    { name: 'Finance', values: { conversion: 60, retention: 70, cost: 50, risk: 20 } },
    { name: 'E-commerce', values: { conversion: 85, retention: 60, cost: 55, risk: 45 } },
    { name: 'Healthcare', values: { conversion: 50, retention: 90, cost: 35, risk: 15 } },
  ];

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */
  let values = {};
  let simMode = true;   // ON by default (matches screenshot)
  let applying = false;
  let activePreset = 'SaaS';

  function initState() {
    const preset = industryPresets.find(p => p.name === activePreset);
    sliders.forEach(s => { values[s.key] = preset ? preset.values[s.key] : s.default; });
    simMode = true;
    applying = false;
  }

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  window.loadRewardEngine = function () {
    const content = document.getElementById('page-content');
    if (!content) return;

    initState();

    content.innerHTML = `
      <div class="page-animate" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">

        <!-- ===== TOP HEADER STRIP ===== -->
        <div style="padding: 24px 24px 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #EF4444, #DC2626); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div>
              <h1 style="font-size: 22px; font-weight: 700; color: var(--text); line-height: 1.2;">Reward Control Center</h1>
              <p style="font-size: 13px; color: var(--muted); margin-top: 4px;">Control how the AI thinks — tune reward signals that drive every decision</p>
            </div>
          </div>
          <!-- Critical System Warning -->
          <div style="display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: var(--radius); border: 1px solid rgba(239,68,68,0.3); background: rgba(239,68,68,0.08); flex-shrink: 0;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style="font-size: 11px; font-weight: 700; color: #EF4444; letter-spacing: 0.05em;">CRITICAL SYSTEM</span>
            <span style="font-size: 11px; color: var(--text-danger);">— Changes affect all AI behavior</span>
          </div>
        </div>

        <!-- ===== MAIN 2-COLUMN LAYOUT ===== -->
        <div style="flex: 1; display: flex; gap: 20px; padding: 20px 24px 24px; overflow: hidden; min-height: 0;">

          <!-- LEFT COLUMN: Sliders + Weight Bar -->
          <div style="flex: 1; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; min-width: 0;">

            <!-- Sliders Card -->
            <div class="card" style="flex-shrink: 0;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <span style="font-size: 13px; font-weight: 600; color: var(--text); text-transform: uppercase; letter-spacing: 0.05em;">Reward Weight Distribution</span>
                <button style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: rgba(30,41,59,0.5); font-size: 11px; font-weight: 600; color: var(--muted); cursor: pointer; font-family: var(--font);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41"/><path d="M4.93 4.93l1.41 1.41"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M19.07 19.07l-1.41-1.41"/><path d="M4.93 19.07l1.41-1.41"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>
                  Advanced
                </button>
              </div>

              <!-- Sliders Grid -->
              <div class="sliders-grid" id="sliders-grid">
                ${sliders.map(s => buildSlider(s)).join('')}
              </div>
            </div>

            <!-- Weight Distribution Bar Card -->
            <div class="card" style="flex-shrink: 0;">
              <div style="font-size: 10px; font-weight: 700; color: var(--dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px;">Combined Weight Distribution</div>
              <div class="weight-bar" id="weight-bar">
                ${buildWeightBar()}
              </div>
              <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-top: 10px; font-size: 11px; color: var(--muted);" id="weight-bar-legend">
                ${buildWeightLegend()}
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: Panel -->
          <div style="width: 240px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; overflow-y: auto;">

            <!-- Industry Presets -->
            <div class="card card-sm">
              <div style="font-size: 10px; font-weight: 700; color: var(--dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Industry Presets</div>
              <div style="position: relative;" id="preset-dropdown-wrap">
                <button id="preset-trigger" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); font-size: 13px; color: var(--text); cursor: pointer; font-family: var(--font);">
                  <span id="preset-current">${activePreset}</span>
                  <svg id="preset-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transition: transform var(--t-base); color: var(--dim);"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div id="preset-list" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; z-index: 100; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
                  ${industryPresets.map(p => `
                    <div class="preset-option ${p.name === activePreset ? 'is-selected' : ''}" data-preset="${p.name}" style="padding: 9px 14px; font-size: 13px; color: var(--muted); cursor: pointer;">
                      ${p.name}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Simulation Mode -->
            <div class="card card-sm">
              <div style="font-size: 10px; font-weight: 700; color: var(--dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Simulation Mode</div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <span id="sim-label" style="font-size: 13px; font-weight: 600; color: ${simMode ? 'var(--text)' : 'var(--muted)'};">${simMode ? 'Active — No real impact' : 'Inactive — LIVE mode'}</span>
                <button id="sim-toggle" class="toggle-pill ${simMode ? 'is-on blue-toggle' : 'is-off blue-toggle'}" aria-label="Toggle simulation mode">
                  <div class="toggle-pip"></div>
                </button>
              </div>
              <div id="sim-note" style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--accent); ${simMode ? '' : 'display: none !important;'}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Learning only — safe to experiment.
              </div>
            </div>

            <!-- Apply Button -->
            <button id="apply-btn" class="apply-btn state-idle">
              <div class="apply-btn-overlay"></div>
              <span id="apply-btn-inner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Apply New Intelligence Rules
              </span>
            </button>

            <!-- Current Configuration -->
            <div class="card card-sm">
              <div style="font-size: 10px; font-weight: 700; color: var(--dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px;">Current Configuration</div>
              <div style="display: flex; flex-direction: column; gap: 10px;" id="current-config">
                ${buildConfigList()}
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    bindEvents();
  };

  /* -------------------------------------------------------
     BUILD SLIDER
  ------------------------------------------------------- */
  function buildSlider(s) {
    const val = values[s.key];
    return `
      <div class="slider-col">
        <div class="slider-value-display" style="color: ${s.color};">
          ${val}<span class="slider-value-unit">%</span>
        </div>

        <div class="slider-track-wrap">
          <div class="slider-track-bg"></div>
          <div class="slider-track-fill" id="fill-${s.key}" style="height: ${val}%; background: linear-gradient(to top, ${s.color}cc, ${s.color});"></div>
          <div class="slider-thumb" id="thumb-${s.key}" style="border-color: ${s.color}; bottom: calc(${val}% - 10px); box-shadow: 0 0 8px ${s.color}66;"></div>
          <input
            type="range"
            class="slider-input"
            id="slider-${s.key}"
            data-key="${s.key}"
            min="0" max="100" step="1"
            value="${val}"
            aria-label="${s.label} weight"
          />
        </div>

        <div class="slider-icon-wrap" style="background: ${s.color}22; color: ${s.color};">${s.iconSvg}</div>
        <div class="slider-label" style="color: ${s.color};">${s.label}</div>
        <div class="slider-desc">${s.desc}</div>
      </div>
    `;
  }

  /* -------------------------------------------------------
     UTILS
  ------------------------------------------------------- */
  function totalWeight() {
    return Object.values(values).reduce((a, b) => a + b, 0);
  }

  function buildWeightBar() {
    const total = totalWeight() || 1;
    return sliders.map(s => {
      const flex = values[s.key];
      return `<div class="weight-segment" style="flex: ${flex}; background: ${s.color}; min-width: 4px;"></div>`;
    }).join('');
  }

  function buildWeightLegend() {
    const total = totalWeight() || 1;
    return sliders.map(s => {
      const pct = (values[s.key] / total * 100).toFixed(1);
      return `
          <div style="display: flex; align-items: center; gap: 5px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${s.color}; flex-shrink: 0;"></div>
            <span>${s.label}: ${pct}%</span>
          </div>`;
    }).join('');
  }

  function buildConfigList() {
    const total = totalWeight() || 1;
    const rows = sliders.map(s => `
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 6px; color: var(--muted);">
            <span style="color: ${s.color};">${s.iconSvg.replace('width="20" height="20"', 'width="13" height="13"')}</span>
            ${s.label}
          </div>
          <span style="font-weight: 600; color: ${s.color};">${values[s.key]}%</span>
        </div>`);
    // Add Industry and Simulation rows
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

  /* -------------------------------------------------------
     BIND EVENTS
  ------------------------------------------------------- */
  function bindEvents() {
    // Slider inputs
    document.querySelectorAll('.slider-input').forEach(input => {
      input.addEventListener('input', () => {
        const key = input.dataset.key;
        const val = parseInt(input.value, 10);
        values[key] = val;
        updateSliderVisuals(key, val);
        updateWeightBar();
        updateConfigList();
      });
    });

    // Preset dropdown
    const trigger = document.getElementById('preset-trigger');
    const list = document.getElementById('preset-list');
    const chevron = document.getElementById('preset-chevron');

    if (trigger && list) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = list.style.display === 'block';
        list.style.display = isOpen ? 'none' : 'block';
        if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
      });

      list.querySelectorAll('.preset-option').forEach(opt => {
        opt.addEventListener('click', () => {
          const name = opt.dataset.preset;
          const preset = industryPresets.find(p => p.name === name);
          if (!preset) return;
          activePreset = name;
          Object.assign(values, preset.values);
          const cur = document.getElementById('preset-current');
          if (cur) cur.textContent = name;
          list.style.display = 'none';
          if (chevron) chevron.style.transform = '';
          list.querySelectorAll('.preset-option').forEach(o => {
            o.classList.toggle('is-selected', o.dataset.preset === name);
          });
          sliders.forEach(s => {
            const inp = document.getElementById(`slider-${s.key}`);
            if (inp) inp.value = values[s.key];
            updateSliderVisuals(s.key, values[s.key]);
          });
          updateWeightBar();
          updateConfigList();
        });
      });

      document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !list.contains(e.target)) {
          list.style.display = 'none';
          if (chevron) chevron.style.transform = '';
        }
      }, { passive: true });
    }

    // Simulation toggle
    const simToggle = document.getElementById('sim-toggle');
    if (simToggle) {
      simToggle.addEventListener('click', () => {
        simMode = !simMode;
        simToggle.className = `toggle-pill ${simMode ? 'is-on blue-toggle' : 'is-off blue-toggle'}`;
        const simLabel = document.getElementById('sim-label');
        const simNote = document.getElementById('sim-note');
        if (simLabel) {
          simLabel.textContent = simMode ? 'Active — No real impact' : 'Inactive — LIVE mode';
          simLabel.style.color = simMode ? 'var(--text)' : 'var(--muted)';
        }
        if (simNote) simNote.style.display = simMode ? 'flex' : 'none';
        updateConfigList();
      });
    }

    // Apply button
    const applyBtn = document.getElementById('apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        if (applying) return;
        applying = true;
        const inner = document.getElementById('apply-btn-inner');
        applyBtn.className = 'apply-btn state-applying';
        if (inner) inner.innerHTML = `<div class="apply-btn-spinner"></div> Applying Intelligence Rules...`;
        setTimeout(() => {
          applying = false;
          applyBtn.className = 'apply-btn state-idle';
          if (inner) inner.innerHTML = `
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      Apply New Intelligence Rules`;
        }, 1800);
      });
    }
  }

  function updateSliderVisuals(key, val) {
    const fill = document.getElementById(`fill-${key}`);
    const thumb = document.getElementById(`thumb-${key}`);
    // Find value display in same slider-col
    const input = document.getElementById(`slider-${key}`);
    const col = input && input.closest('.slider-col');
    const vDisp = col && col.querySelector('.slider-value-display');
    const s = sliders.find(x => x.key === key);
    if (fill) fill.style.height = val + '%';
    if (thumb) thumb.style.bottom = `calc(${val}% - 10px)`;
    if (vDisp && s) vDisp.innerHTML = `${val}<span class="slider-value-unit">%</span>`;
  }

  function updateWeightBar() {
    const bar = document.getElementById('weight-bar');
    const legend = document.getElementById('weight-bar-legend');
    if (bar) bar.innerHTML = buildWeightBar();
    if (legend) legend.innerHTML = buildWeightLegend();
  }

  function updateConfigList() {
    const cfg = document.getElementById('current-config');
    if (cfg) cfg.innerHTML = buildConfigList();
  }

})();
