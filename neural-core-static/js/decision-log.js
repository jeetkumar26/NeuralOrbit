/* ============================================================
   decision-log.js — NeuralOrbit AI Decision Log (Module-Aware)
   Filters decision data by CURRENT_MODULE.
   Admin sees all modules on neural-orbit, else module-specific.
   ============================================================ */

(function () {
  'use strict';

  /* -------------------------------------------------------
     MODULE COLORS
  ------------------------------------------------------- */
  const moduleColors = {
    CRM: '#5B8CFF',
    Marketing: '#8B5CF6',
    Shield: '#F59E0B',
    Website: '#22C55E',
  };

  /* -------------------------------------------------------
     FULL DECISIONS DATASET (all modules)
  ------------------------------------------------------- */
  const allDecisions = [
    { id: 'DEC-001', timestamp: '2026-02-17 09:14:22', module: 'CRM', action: 'Auto-assigned lead to top performer', reward: 0.87, confidence: 94, overrideEnabled: false, stateSnapshot: 'Lead score: 82, Available reps: 4, Top performer conversion rate: 67%', rewardLogic: 'Maximized expected conversion value. Weighted by historical close rates and current pipeline capacity.', alternatives: ['Round-robin assignment', 'Assign to newest rep for training', 'Queue for manual review'] },
    { id: 'DEC-002', timestamp: '2026-02-17 08:47:15', module: 'Marketing', action: 'Paused underperforming ad campaign', reward: 0.92, confidence: 97, overrideEnabled: false, stateSnapshot: 'CTR: 0.3%, CPA: $142, Budget spent: 72%, Conversion rate: 0.8%', rewardLogic: 'Cost threshold exceeded with declining ROI trajectory. Reallocated budget to higher-performing channels.', alternatives: ['Reduce budget by 50%', 'A/B test new creatives', 'Continue monitoring for 24h'] },
    { id: 'DEC-003', timestamp: '2026-02-17 07:33:08', module: 'Shield', action: 'Blocked suspicious login attempt', reward: 0.95, confidence: 99, overrideEnabled: false, stateSnapshot: 'IP: 192.168.x.x (VPN), Location: unusual, Device: new, Failed attempts: 3', rewardLogic: 'Threat score exceeded critical threshold. Risk of unauthorized access outweighed potential false positive cost.', alternatives: ['Send 2FA challenge', 'Allow with monitoring', 'Lock account temporarily'] },
    { id: 'DEC-004', timestamp: '2026-02-17 06:12:44', module: 'Website', action: 'Deployed A/B test variant B', reward: 0.78, confidence: 86, overrideEnabled: true, stateSnapshot: 'Variant A conversion: 3.2%, Variant B prediction: 4.1%, Sample size: 12,400', rewardLogic: 'Statistical significance reached at 95% CI. Variant B shows higher expected value.', alternatives: ['Continue testing', 'Deploy variant A', 'Create variant C hybrid'] },
    { id: 'DEC-005', timestamp: '2026-02-16 22:58:31', module: 'CRM', action: 'Triggered re-engagement sequence', reward: 0.81, confidence: 89, overrideEnabled: false, stateSnapshot: 'Dormant accounts: 47, Avg days inactive: 34, Predicted churn risk: 72%', rewardLogic: 'Retention value exceeds acquisition cost. Personalized sequence based on last engagement patterns.', alternatives: ['Manual outreach by CSM', 'Discount offer', 'Wait for natural re-engagement'] },
    { id: 'DEC-006', timestamp: '2026-02-16 19:22:17', module: 'Marketing', action: 'Increased bid on high-intent keywords', reward: 0.84, confidence: 91, overrideEnabled: false, stateSnapshot: "Keyword cluster: 'enterprise AI', Avg CPC: $12.40, Competitor bids: increasing", rewardLogic: 'ROI positive at current conversion rates. Market opportunity window detected.', alternatives: ['Maintain current bids', 'Shift to long-tail keywords', 'Pause and reassess'] },
    { id: 'DEC-007', timestamp: '2026-02-16 15:45:03', module: 'Shield', action: 'Escalated compliance alert', reward: 0.91, confidence: 96, overrideEnabled: false, stateSnapshot: 'Data access pattern: anomalous, Sensitivity level: high, User role: standard', rewardLogic: 'Regulatory compliance risk detected. Automated escalation to security team for review.', alternatives: ['Log and monitor', 'Restrict access silently', 'Direct user notification'] },
    { id: 'DEC-008', timestamp: '2026-02-16 12:10:00', module: 'CRM', action: 'Pipeline stage auto-advanced for hot lead', reward: 0.88, confidence: 92, overrideEnabled: false, stateSnapshot: 'Lead score spike: +24 pts, Meeting booked: yes, Budget confirmed: yes', rewardLogic: 'All deal-closing signals positive. Auto-advancement saves 1.2 days of pipeline latency.', alternatives: ['Wait for rep manual update', 'Send confirmation email first', 'Flag for manager review'] },
    { id: 'DEC-009', timestamp: '2026-02-15 18:30:44', module: 'Website', action: 'Personalized homepage for returning visitor', reward: 0.83, confidence: 88, overrideEnabled: false, stateSnapshot: 'Visitor history: 3 visits, Viewed: Pricing, Industry: FinTech, Device: Desktop', rewardLogic: 'Personalized content shown. FinTech social proof and ROI calculator surfaced based on intent signals.', alternatives: ['Show default homepage', 'Redirect to pricing directly', 'Show demo request popup'] },
    { id: 'DEC-010', timestamp: '2026-02-15 10:05:22', module: 'Marketing', action: 'Sent personalized email sequence to segment', reward: 0.79, confidence: 85, overrideEnabled: false, stateSnapshot: 'Segment: Trial users day 7, Conversion prediction: 34%, Historical: 28%', rewardLogic: 'Day 7 is peak conversion window. Personalized sequence outperforms generic by 2.4x historically.', alternatives: ['Wait until day 14', 'Phone call from CSM', 'In-app notification only'] },
  ];

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */
  let selectedId = null;
  let overrides = {};
  let filterQuery = '';

  /* -------------------------------------------------------
     GET FILTERED DECISIONS BY MODULE
  ------------------------------------------------------- */
  function getDecisions() {
    const moduleKey = window.CURRENT_MODULE || 'neural-orbit';
    if (moduleKey === 'neural-orbit') return allDecisions; // Show all on dashboard
    const moduleNameMap = { crm: 'CRM', marketing: 'Marketing', shield: 'Shield', website: 'Website' };
    const filterName = moduleNameMap[moduleKey];
    return filterName ? allDecisions.filter(d => d.module === filterName) : allDecisions;
  }

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  window.loadDecisionLog = function () {
    const content = document.getElementById('page-content');
    if (!content) return;

    const decisions = getDecisions();
    decisions.forEach(d => { overrides[d.id] = d.overrideEnabled; });
    selectedId = null;
    filterQuery = '';

    const moduleKey = window.CURRENT_MODULE || 'neural-orbit';
    const isGlobal = moduleKey === 'neural-orbit';

    content.innerHTML = `
            <div class="page-animate" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">

                <!-- Header -->
                <div style="padding: 24px 24px 16px; flex-shrink: 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <h1 style="font-size: 22px; font-weight: 600; color: var(--text);">AI Decision Log</h1>
                            <p style="font-size: 13px; color: var(--muted); margin-top: 4px;">
                                ${isGlobal ? 'All modules — every AI decision tracked and auditable' : 'Transparent, explainable AI — every decision tracked and auditable'}
                            </p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border); background: rgba(30,41,59,0.5);">
                                <i class="bi bi-search" style="color: var(--dim); font-size: 13px;"></i>
                                <input id="decision-search" type="text" placeholder="Search decisions..." style="background: transparent; border: none; outline: none; color: var(--text); font-size: 13px; width: 160px; font-family: var(--font);" />
                            </div>
                            <button style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border); background: transparent; color: var(--muted); font-size: 13px; cursor: pointer; font-family: var(--font);">
                                <i class="bi bi-funnel" style="font-size: 12px;"></i> Filter
                            </button>
                            <button style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border); background: transparent; color: var(--muted); font-size: 13px; cursor: pointer; font-family: var(--font);">
                                <i class="bi bi-download" style="font-size: 12px;"></i> Export
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Table + Drawer -->
                <div style="flex: 1; display: flex; overflow: hidden; padding: 0 24px 24px; gap: 0;">
                    <div style="flex: 1; overflow-y: auto; min-width: 0;">
                        <div style="border-radius: 14px; border: 1px solid var(--border-light); overflow: hidden; background: rgba(17,24,39,0.6);">
                            <!-- Header -->
                            <div style="display: grid; grid-template-columns: 150px 100px 1fr 80px 120px 100px; gap: 16px; padding: 12px 20px; border-bottom: 1px solid var(--border-light); background: rgba(17,24,39,0.8);">
                                ${['TIMESTAMP', 'MODULE', 'ACTION TAKEN', 'REWARD', 'CONFIDENCE', 'OVERRIDE'].map(h =>
      `<span style="font-size: 11px; font-weight: 600; color: var(--dim); text-transform: uppercase; letter-spacing: 0.05em;">${h}</span>`
    ).join('')}
                            </div>
                            <div id="decision-rows"></div>
                        </div>
                    </div>

                    <!-- Drawer -->
                    <div id="decision-drawer" style="width: 0; overflow: hidden; transition: width 0.3s ease; flex-shrink: 0; border-left: 0px solid var(--border); background: var(--surface-low); display: flex; flex-direction: column;">
                        <div id="drawer-inner" style="width: 400px; display: flex; flex-direction: column; height: 100%; overflow-y: auto; opacity: 0; transition: opacity 0.2s;">
                            <div style="padding: 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
                                <div>
                                    <div style="font-size: 11px; font-weight: 600; color: var(--dim); letter-spacing: 0.05em;">DECISION DETAILS</div>
                                    <div id="drawer-id" style="font-size: 14px; font-weight: 600; color: var(--text); margin-top: 4px;">—</div>
                                </div>
                                <button id="drawer-close" style="padding: 8px; border-radius: 8px; background: transparent; border: none; cursor: pointer; color: var(--muted); display: flex; align-items: center; justify-content: center;" aria-label="Close">
                                    <i class="bi bi-x-lg" style="font-size: 14px;"></i>
                                </button>
                            </div>
                            <div id="drawer-body" style="padding: 20px; display: flex; flex-direction: column; gap: 20px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    renderRows(decisions);
    bindEvents(decisions);
  };

  /* -------------------------------------------------------
     RENDER ROWS
  ------------------------------------------------------- */
  function renderRows(decisions) {
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
      row.addEventListener('click', e => {
        if (e.target.closest('.dl-toggle')) return;
        openDrawer(row.dataset.id, decisions);
      });
      row.addEventListener('mouseenter', () => { if (row.dataset.id !== selectedId) row.style.background = 'rgba(91,140,255,0.04)'; });
      row.addEventListener('mouseleave', () => { if (row.dataset.id !== selectedId) row.style.background = ''; });
    });

    container.querySelectorAll('.dl-toggle').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        overrides[id] = !overrides[id];
        btn.style.background = overrides[id] ? '#F59E0B' : '#334155';
        const pip = btn.querySelector('.dl-pip');
        if (pip) pip.style.left = overrides[id] ? '22px' : '2px';
      });
    });
  }

  function buildRow(d) {
    const color = moduleColors[d.module] || '#94A3B8';
    const time = d.timestamp.split(' ')[1] || d.timestamp;
    const isOn = overrides[d.id];
    const isSel = selectedId === d.id;
    const rwColor = d.reward >= 0.9 ? '#22C55E' : d.reward >= 0.8 ? '#5B8CFF' : '#F59E0B';
    const cfColor = d.confidence >= 95 ? '#22C55E' : d.confidence >= 90 ? '#5B8CFF' : '#F59E0B';
    const isAdmin = window.CURRENT_ROLE === 'admin';

    return `
            <div class="dl-row" data-id="${d.id}" style="display: grid; grid-template-columns: 150px 100px 1fr 80px 120px 100px; gap: 16px; padding: 16px 20px; border-bottom: 1px solid rgba(91,140,255,0.05); cursor: pointer; transition: background 0.15s; ${isSel ? 'background: rgba(91,140,255,0.06);' : ''}">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <i class="bi bi-clock" style="font-size: 12px; color: var(--dim);"></i>
                    <span style="font-size: 12px; color: var(--muted); font-family: monospace;">${escHtml(time)}</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; color: ${color}; background: ${color}18;">${escHtml(d.module)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
                    <span style="font-size: 13px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escHtml(d.action)}</span>
                    <i class="bi bi-chevron-right dl-chevron" style="flex-shrink: 0; opacity: 0; transition: opacity 0.15s; font-size: 12px; color: var(--dim);"></i>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 13px; font-weight: 600; font-family: monospace; color: ${rwColor};">${d.reward.toFixed(2)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="flex: 1; height: 6px; border-radius: 99px; background: var(--surface); overflow: hidden;">
                        <div style="height: 100%; width: ${d.confidence}%; background: ${cfColor}; border-radius: 99px;"></div>
                    </div>
                    <span style="font-size: 12px; color: var(--muted); font-family: monospace; flex-shrink: 0;">${d.confidence}%</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <button class="dl-toggle" data-id="${d.id}" style="width: 40px; height: 20px; border-radius: 99px; border: none; cursor: ${isAdmin ? 'pointer' : 'not-allowed'}; position: relative; background: ${isOn ? '#F59E0B' : '#334155'}; transition: background 0.2s; flex-shrink: 0; opacity: ${isAdmin ? 1 : 0.5};" ${isAdmin ? '' : 'disabled'} aria-label="Toggle override">
                        <div class="dl-pip" style="position: absolute; top: 2px; left: ${isOn ? '22px' : '2px'}; width: 16px; height: 16px; border-radius: 50%; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: left 0.2s;"></div>
                    </button>
                </div>
            </div>
        `;
  }

  /* -------------------------------------------------------
     DRAWER
  ------------------------------------------------------- */
  function openDrawer(id, decisions) {
    selectedId = id;
    const d = decisions.find(x => x.id === id);
    if (!d) return;

    const drawer = document.getElementById('decision-drawer');
    const drawerInner = document.getElementById('drawer-inner');
    const drawerId = document.getElementById('drawer-id');
    const drawerBody = document.getElementById('drawer-body');
    if (!drawer || !drawerId || !drawerBody) return;

    drawer.style.width = '400px';
    drawer.style.borderLeftWidth = '1px';
    setTimeout(() => { if (drawerInner) drawerInner.style.opacity = '1'; }, 50);

    drawerId.textContent = d.id;
    const color = moduleColors[d.module] || '#94A3B8';
    const cfColor = d.confidence >= 95 ? '#22C55E' : d.confidence >= 90 ? '#5B8CFF' : '#F59E0B';

    drawerBody.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="padding: 12px; border-radius: 10px; background: rgba(30,41,59,0.5);">
                    <div style="font-size: 10px; font-weight: 600; color: var(--dim); text-transform: uppercase; margin-bottom: 4px;">Module</div>
                    <div style="font-size: 13px; font-weight: 600; color: ${color};">${escHtml(d.module)}</div>
                </div>
                <div style="padding: 12px; border-radius: 10px; background: rgba(30,41,59,0.5);">
                    <div style="font-size: 10px; font-weight: 600; color: var(--dim); text-transform: uppercase; margin-bottom: 4px;">Confidence</div>
                    <div style="font-size: 13px; font-weight: 600; color: ${cfColor};">${d.confidence}%</div>
                </div>
            </div>
            <div>
                <div style="font-size: 11px; font-weight: 600; color: var(--dim); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Action Taken</div>
                <div style="font-size: 13px; color: var(--text); line-height: 1.5;">${escHtml(d.action)}</div>
            </div>
            <div style="border-radius: 10px; padding: 16px; border: 1px solid var(--border); background: rgba(17,24,39,0.8);">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
                    <i class="bi bi-check-circle" style="color: var(--accent); font-size: 13px;"></i>
                    <span style="font-size: 11px; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em;">State Snapshot</span>
                </div>
                <p style="font-size: 12px; color: var(--muted); line-height: 1.6; margin: 0;">${escHtml(d.stateSnapshot)}</p>
            </div>
            <div style="border-radius: 10px; padding: 16px; border: 1px solid var(--border); background: rgba(17,24,39,0.8);">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
                    <i class="bi bi-check-circle" style="color: var(--success); font-size: 13px;"></i>
                    <span style="font-size: 11px; font-weight: 600; color: var(--success); text-transform: uppercase; letter-spacing: 0.05em;">Reward Logic Used</span>
                </div>
                <p style="font-size: 12px; color: var(--muted); line-height: 1.6; margin: 0;">${escHtml(d.rewardLogic)}</p>
            </div>
            <div style="border-radius: 10px; padding: 16px; border: 1px solid var(--border); background: rgba(17,24,39,0.8);">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
                    <i class="bi bi-exclamation-circle" style="color: var(--warning); font-size: 13px;"></i>
                    <span style="font-size: 11px; font-weight: 600; color: var(--warning); text-transform: uppercase; letter-spacing: 0.05em;">Alternatives Rejected</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${d.alternatives.map(alt => `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="bi bi-x-circle-fill" style="font-size: 11px; color: var(--danger); flex-shrink: 0;"></i>
                            <span style="font-size: 12px; color: var(--muted);">${escHtml(alt)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <button style="width: 100%; padding: 13px; border-radius: 10px; border: none; cursor: pointer; background: linear-gradient(135deg, #5B8CFF, #3B6FE0); color: white; font-size: 13px; font-weight: 600; font-family: var(--font); display: flex; align-items: center; justify-content: center; gap: 8px;">
                <i class="bi bi-arrow-clockwise"></i> Replay Decision
            </button>
        `;

    document.querySelectorAll('.dl-row').forEach(row => {
      row.style.background = row.dataset.id === id ? 'rgba(91,140,255,0.06)' : '';
    });
    document.querySelectorAll('.dl-chevron').forEach(ch => {
      ch.style.opacity = ch.closest('.dl-row')?.dataset.id === id ? '1' : '0';
    });
  }

  function closeDrawer() {
    const drawer = document.getElementById('decision-drawer');
    const drawerInner = document.getElementById('drawer-inner');
    if (drawerInner) drawerInner.style.opacity = '0';
    setTimeout(() => {
      if (drawer) { drawer.style.width = '0'; drawer.style.borderLeftWidth = '0px'; }
    }, 200);
    selectedId = null;
    document.querySelectorAll('.dl-row').forEach(row => { row.style.background = ''; });
    document.querySelectorAll('.dl-chevron').forEach(ch => { ch.style.opacity = '0'; });
  }

  /* -------------------------------------------------------
     BIND EVENTS
  ------------------------------------------------------- */
  function bindEvents(decisions) {
    document.getElementById('drawer-close')?.addEventListener('click', closeDrawer);
    const searchInput = document.getElementById('decision-search');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        filterQuery = e.target.value.toLowerCase().trim();
        renderRows(decisions);
      });
    }
  }

  function escHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

})();
