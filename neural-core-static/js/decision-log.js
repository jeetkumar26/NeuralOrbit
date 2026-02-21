/* ============================================================
   decision-log.js — AI Decision Log Page
   Exact match of DecisionLog.tsx:
   - 6-col CSS grid table (150px 100px 1fr 80px 100px 100px)
   - Right-side drawer panel (inline, not slide overlay)
   - Live search filtering
   - Override toggles (yellow when on)
   ============================================================ */

(function () {
  'use strict';

  /* -------------------------------------------------------
     DATA — exact from DecisionLog.tsx
  ------------------------------------------------------- */
  const moduleColors = {
    CRM: '#5B8CFF',
    Marketing: '#8B5CF6',
    Shield: '#F59E0B',
    Website: '#22C55E',
  };

  const decisions = [
    {
      id: 'DEC-001', timestamp: '2026-02-17 09:14:22',
      module: 'CRM', action: 'Auto-assigned lead to top performer',
      reward: 0.87, confidence: 94, overrideEnabled: false,
      stateSnapshot: 'Lead score: 82, Available reps: 4, Top performer conversion rate: 67%',
      rewardLogic: 'Maximized expected conversion value. Weighted by historical close rates and current pipeline capacity.',
      alternatives: ['Round-robin assignment', 'Assign to newest rep for training', 'Queue for manual review'],
    },
    {
      id: 'DEC-002', timestamp: '2026-02-17 08:47:15',
      module: 'Marketing', action: 'Paused underperforming ad campaign',
      reward: 0.92, confidence: 97, overrideEnabled: false,
      stateSnapshot: 'CTR: 0.3%, CPA: $142, Budget spent: 72%, Conversion rate: 0.8%',
      rewardLogic: 'Cost threshold exceeded with declining ROI trajectory. Reallocated budget to higher-performing channels.',
      alternatives: ['Reduce budget by 50%', 'A/B test new creatives', 'Continue monitoring for 24h'],
    },
    {
      id: 'DEC-003', timestamp: '2026-02-17 07:33:08',
      module: 'Shield', action: 'Blocked suspicious login attempt',
      reward: 0.95, confidence: 99, overrideEnabled: false,
      stateSnapshot: 'IP: 192.168.x.x (VPN), Location: unusual, Device: new, Failed attempts: 3',
      rewardLogic: 'Threat score exceeded critical threshold. Risk of unauthorized access outweighed potential false positive cost.',
      alternatives: ['Send 2FA challenge', 'Allow with monitoring', 'Lock account temporarily'],
    },
    {
      id: 'DEC-004', timestamp: '2026-02-17 06:12:44',
      module: 'Website', action: 'Deployed A/B test variant B',
      reward: 0.78, confidence: 86, overrideEnabled: true,
      stateSnapshot: 'Variant A conversion: 3.2%, Variant B prediction: 4.1%, Sample size: 12,400',
      rewardLogic: 'Statistical significance reached at 95% CI. Variant B shows higher expected value.',
      alternatives: ['Continue testing', 'Deploy variant A', 'Create variant C hybrid'],
    },
    {
      id: 'DEC-005', timestamp: '2026-02-16 22:58:31',
      module: 'CRM', action: 'Triggered re-engagement sequence',
      reward: 0.81, confidence: 89, overrideEnabled: false,
      stateSnapshot: 'Dormant accounts: 47, Avg days inactive: 34, Predicted churn risk: 72%',
      rewardLogic: 'Retention value exceeds acquisition cost. Personalized sequence based on last engagement patterns.',
      alternatives: ['Manual outreach by CSM', 'Discount offer', 'Wait for natural re-engagement'],
    },
    {
      id: 'DEC-006', timestamp: '2026-02-16 19:22:17',
      module: 'Marketing', action: 'Increased bid on high-intent keywords',
      reward: 0.84, confidence: 91, overrideEnabled: false,
      stateSnapshot: "Keyword cluster: 'enterprise AI', Avg CPC: $12.40, Competitor bids: increasing",
      rewardLogic: 'ROI positive at current conversion rates. Market opportunity window detected.',
      alternatives: ['Maintain current bids', 'Shift to long-tail keywords', 'Pause and reassess'],
    },
    {
      id: 'DEC-007', timestamp: '2026-02-16 15:45:03',
      module: 'Shield', action: 'Escalated compliance alert',
      reward: 0.91, confidence: 96, overrideEnabled: false,
      stateSnapshot: 'Data access pattern: anomalous, Sensitivity level: high, User role: standard',
      rewardLogic: 'Regulatory compliance risk detected. Automated escalation to security team for review.',
      alternatives: ['Log and monitor', 'Restrict access silently', 'Direct user notification'],
    },
  ];

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */
  let selectedId = null;
  let overrides = {};
  let filterQuery = '';

  function init() {
    decisions.forEach(d => { overrides[d.id] = d.overrideEnabled; });
  }

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  window.loadDecisionLog = function () {
    const content = document.getElementById('page-content');
    if (!content) return;
    init();
    selectedId = null;

    content.innerHTML = `
      <div class="page-animate" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">

        <!-- Header -->
        <div style="padding: 24px 24px 16px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h1 style="font-size: 22px; font-weight: 600; color: #E2E8F0;">AI Decision Log</h1>
              <p style="font-size: 13px; color: #94A3B8; margin-top: 4px;">Transparent, explainable AI — every decision tracked and auditable</p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <!-- Search -->
              <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(91,140,255,0.1); background: rgba(30,41,59,0.5);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input id="decision-search" type="text" placeholder="Search decisions..." style="background: transparent; border: none; outline: none; color: #E2E8F0; font-size: 13px; width: 160px; font-family: var(--font); placeholder-color: #64748B;" />
              </div>
              <!-- Filter -->
              <button style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(91,140,255,0.1); background: transparent; color: #94A3B8; font-size: 13px; cursor: pointer; font-family: var(--font); transition: all 0.2s;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filter
              </button>
              <!-- Export -->
              <button style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(91,140,255,0.1); background: transparent; color: #94A3B8; font-size: 13px; cursor: pointer; font-family: var(--font); transition: all 0.2s;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export
              </button>
            </div>
          </div>
        </div>

        <!-- Table + Drawer flex container -->
        <div style="flex: 1; display: flex; overflow: hidden; padding: 0 24px 24px; gap: 0;">

          <!-- Table area -->
          <div style="flex: 1; overflow-y: auto; min-width: 0;">
            <div style="border-radius: 14px; border: 1px solid rgba(91,140,255,0.08); overflow: hidden; background: rgba(17,24,39,0.6);">
              <!-- Header row -->
              <div style="display: grid; grid-template-columns: 150px 100px 1fr 80px 100px 100px; gap: 16px; padding: 12px 20px; border-bottom: 1px solid rgba(91,140,255,0.08); background: rgba(17,24,39,0.8);">
                ${['TIMESTAMP', 'MODULE', 'ACTION TAKEN', 'REWARD', 'CONFIDENCE', 'OVERRIDE'].map(h =>
      `<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">${h}</span>`
    ).join('')}
              </div>
              <!-- Rows -->
              <div id="decision-rows"></div>
            </div>
          </div>

          <!-- Drawer (hidden until row clicked) -->
          <div id="decision-drawer" style="width: 0; overflow: hidden; transition: width 0.3s ease; flex-shrink: 0; border-left: 0px solid rgba(91,140,255,0.1); background: #0D1320; display: flex; flex-direction: column;">
            <div id="drawer-inner" style="width: 400px; display: flex; flex-direction: column; height: 100%; overflow-y: auto; opacity: 0; transition: opacity 0.2s;">
              <!-- Drawer header -->
              <div style="padding: 20px; border-bottom: 1px solid rgba(91,140,255,0.1); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
                <div>
                  <div style="font-size: 11px; font-weight: 600; color: #64748B; letter-spacing: 0.05em;">DECISION DETAILS</div>
                  <div id="drawer-id" style="font-size: 14px; font-weight: 600; color: #E2E8F0; margin-top: 4px;">—</div>
                </div>
                <button id="drawer-close" style="padding: 8px; border-radius: 8px; background: transparent; border: none; cursor: pointer; color: #94A3B8; display: flex; align-items: center; justify-content: center;" aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <!-- Drawer body -->
              <div id="drawer-body" style="padding: 20px; display: flex; flex-direction: column; gap: 20px;"></div>
            </div>
          </div>

        </div>
      </div>
    `;

    renderRows();
    bindEvents();
  };

  /* -------------------------------------------------------
     RENDER ROWS
  ------------------------------------------------------- */
  function renderRows() {
    const container = document.getElementById('decision-rows');
    if (!container) return;

    const filtered = decisions.filter(d =>
      !filterQuery ||
      d.action.toLowerCase().includes(filterQuery) ||
      d.module.toLowerCase().includes(filterQuery) ||
      d.id.toLowerCase().includes(filterQuery)
    );

    container.innerHTML = filtered.map(d => buildRow(d)).join('');

    container.querySelectorAll('.dl-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.dl-toggle')) return;
        openDrawer(row.dataset.id);
      });
      row.addEventListener('mouseenter', () => {
        if (row.dataset.id !== selectedId) row.style.background = 'rgba(91,140,255,0.04)';
      });
      row.addEventListener('mouseleave', () => {
        if (row.dataset.id !== selectedId) row.style.background = '';
      });
    });

    container.querySelectorAll('.dl-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        overrides[id] = !overrides[id];
        // Update just this toggle visually
        btn.style.background = overrides[id] ? '#F59E0B' : '#334155';
        const pip = btn.querySelector('.dl-pip');
        if (pip) pip.style.left = overrides[id] ? '22px' : '2px';
        if (selectedId === id) openDrawer(id);
      });
    });
  }

  function buildRow(d) {
    const color = moduleColors[d.module] || '#94A3B8';
    const time = (d.timestamp.split(' ')[1] || d.timestamp);
    const isOn = overrides[d.id];
    const isSel = selectedId === d.id;

    const rewardColor = d.reward >= 0.9 ? '#22C55E' : d.reward >= 0.8 ? '#5B8CFF' : '#F59E0B';
    const confColor = d.confidence >= 95 ? '#22C55E' : d.confidence >= 90 ? '#5B8CFF' : '#F59E0B';

    return `
      <div class="dl-row" data-id="${d.id}" style="display: grid; grid-template-columns: 150px 100px 1fr 80px 100px 100px; gap: 16px; padding: 16px 20px; border-bottom: 1px solid rgba(91,140,255,0.05); cursor: pointer; transition: background 0.15s; ${isSel ? 'background: rgba(91,140,255,0.06);' : ''}">

        <!-- Timestamp -->
        <div style="display: flex; align-items: center; gap: 6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span style="font-size: 12px; color: #94A3B8; font-family: monospace;">${escHtml(time)}</span>
        </div>

        <!-- Module -->
        <div style="display: flex; align-items: center;">
          <span style="padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; color: ${color}; background: ${color}15;">${escHtml(d.module)}</span>
        </div>

        <!-- Action -->
        <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
          <span style="font-size: 13px; color: #E2E8F0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escHtml(d.action)}</span>
          <svg class="dl-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" style="flex-shrink: 0; opacity: 0; transition: opacity 0.15s;"><polyline points="9 18 15 12 9 6"/></svg>
        </div>

        <!-- Reward -->
        <div style="display: flex; align-items: center;">
          <span style="font-size: 13px; font-weight: 600; font-family: monospace; color: ${rewardColor};">${d.reward.toFixed(2)}</span>
        </div>

        <!-- Confidence -->
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="flex: 1; height: 6px; border-radius: 99px; background: #1E293B; overflow: hidden;">
            <div style="height: 100%; width: ${d.confidence}%; background: ${confColor}; border-radius: 99px;"></div>
          </div>
          <span style="font-size: 12px; color: #94A3B8; font-family: monospace; flex-shrink: 0;">${d.confidence}%</span>
        </div>

        <!-- Override toggle -->
        <div style="display: flex; align-items: center;">
          <button class="dl-toggle" data-id="${d.id}" style="width: 40px; height: 20px; border-radius: 99px; border: none; cursor: pointer; position: relative; background: ${isOn ? '#F59E0B' : '#334155'}; transition: background 0.2s; flex-shrink: 0;" aria-label="Toggle override">
            <div class="dl-pip" style="position: absolute; top: 2px; left: ${isOn ? '22px' : '2px'}; width: 16px; height: 16px; border-radius: 50%; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: left 0.2s;"></div>
          </button>
        </div>

      </div>
    `;
  }

  /* -------------------------------------------------------
     DRAWER
  ------------------------------------------------------- */
  function openDrawer(id) {
    selectedId = id;
    const d = decisions.find(x => x.id === id);
    if (!d) return;

    const drawer = document.getElementById('decision-drawer');
    const drawerInner = document.getElementById('drawer-inner');
    const drawerId = document.getElementById('drawer-id');
    const drawerBody = document.getElementById('drawer-body');

    if (!drawer || !drawerId || !drawerBody) return;

    // Show drawer
    drawer.style.width = '400px';
    drawer.style.borderLeftWidth = '1px';
    setTimeout(() => {
      if (drawerInner) drawerInner.style.opacity = '1';
    }, 50);

    drawerId.textContent = d.id;
    const color = moduleColors[d.module] || '#94A3B8';
    const confColor = d.confidence >= 95 ? '#22C55E' : d.confidence >= 90 ? '#5B8CFF' : '#F59E0B';

    drawerBody.innerHTML = `
      <!-- Meta grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="padding: 12px; border-radius: 10px; background: rgba(30,41,59,0.5);">
          <div style="font-size: 10px; font-weight: 600; color: #64748B; text-transform: uppercase; margin-bottom: 4px;">Module</div>
          <div style="font-size: 13px; font-weight: 600; color: ${color};">${escHtml(d.module)}</div>
        </div>
        <div style="padding: 12px; border-radius: 10px; background: rgba(30,41,59,0.5);">
          <div style="font-size: 10px; font-weight: 600; color: #64748B; text-transform: uppercase; margin-bottom: 4px;">Confidence</div>
          <div style="font-size: 13px; font-weight: 600; color: ${confColor};">${d.confidence}%</div>
        </div>
      </div>

      <!-- Action -->
      <div>
        <div style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Action Taken</div>
        <div style="font-size: 13px; color: #E2E8F0; line-height: 1.5;">${escHtml(d.action)}</div>
      </div>

      <!-- State Snapshot -->
      <div style="border-radius: 10px; padding: 16px; border: 1px solid rgba(91,140,255,0.1); background: rgba(17,24,39,0.8);">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B8CFF" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span style="font-size: 11px; font-weight: 600; color: #5B8CFF; text-transform: uppercase; letter-spacing: 0.05em;">State Snapshot</span>
        </div>
        <p style="font-size: 12px; color: #94A3B8; line-height: 1.6; margin: 0;">${escHtml(d.stateSnapshot)}</p>
      </div>

      <!-- Reward Logic -->
      <div style="border-radius: 10px; padding: 16px; border: 1px solid rgba(91,140,255,0.1); background: rgba(17,24,39,0.8);">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span style="font-size: 11px; font-weight: 600; color: #22C55E; text-transform: uppercase; letter-spacing: 0.05em;">Reward Logic Used</span>
        </div>
        <p style="font-size: 12px; color: #94A3B8; line-height: 1.6; margin: 0;">${escHtml(d.rewardLogic)}</p>
      </div>

      <!-- Alternatives Rejected -->
      <div style="border-radius: 10px; padding: 16px; border: 1px solid rgba(91,140,255,0.1); background: rgba(17,24,39,0.8);">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style="font-size: 11px; font-weight: 600; color: #F59E0B; text-transform: uppercase; letter-spacing: 0.05em;">Alternatives Rejected</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${d.alternatives.map(alt => `
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span style="font-size: 12px; color: #94A3B8;">${escHtml(alt)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- CTA -->
      <button style="width: 100%; padding: 13px; border-radius: 10px; border: none; cursor: pointer; background: linear-gradient(135deg, #5B8CFF, #3B6FE0); color: white; font-size: 13px; font-weight: 600; font-family: var(--font); display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 0.2s; margin-top: 4px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.11"/></svg>
        Replay Decision
      </button>
    `;

    // Highlight selected row
    document.querySelectorAll('.dl-row').forEach(row => {
      row.style.background = row.dataset.id === id ? 'rgba(91,140,255,0.06)' : '';
    });
    // Show chevron on selected row
    document.querySelectorAll('.dl-row').forEach(row => {
      const ch = row.querySelector('.dl-chevron');
      if (ch) ch.style.opacity = row.dataset.id === id ? '1' : '0';
    });
  }

  function closeDrawer() {
    const drawer = document.getElementById('decision-drawer');
    const drawerInner = document.getElementById('drawer-inner');
    if (drawerInner) drawerInner.style.opacity = '0';
    setTimeout(() => {
      if (drawer) {
        drawer.style.width = '0';
        drawer.style.borderLeftWidth = '0px';
      }
    }, 200);
    selectedId = null;
    document.querySelectorAll('.dl-row').forEach(row => { row.style.background = ''; });
    document.querySelectorAll('.dl-chevron').forEach(ch => { ch.style.opacity = '0'; });
  }

  /* -------------------------------------------------------
     BIND EVENTS
  ------------------------------------------------------- */
  function bindEvents() {
    const closeBtn = document.getElementById('drawer-close');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    const searchInput = document.getElementById('decision-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        filterQuery = e.target.value.toLowerCase().trim();
        renderRows();
      });
    }
  }

  /* -------------------------------------------------------
     UTILS
  ------------------------------------------------------- */
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
