/* ============================================================
   learning.js — Learning Timeline Page
   Chart.js line chart + weekly notes + mistake/correction log
   ============================================================ */

(function () {
  'use strict';

  /* -------------------------------------------------------
     DATA — exact from LearningTimeline.tsx
  ------------------------------------------------------- */
  const learningData = [
    { week: 'W1', accuracy: 72, decisions: 120, corrections: 18 },
    { week: 'W2', accuracy: 75, decisions: 145, corrections: 15 },
    { week: 'W3', accuracy: 74, decisions: 162, corrections: 16 },
    { week: 'W4', accuracy: 79, decisions: 178, corrections: 12 },
    { week: 'W5', accuracy: 82, decisions: 195, corrections: 10 },
    { week: 'W6', accuracy: 81, decisions: 210, corrections: 11 },
    { week: 'W7', accuracy: 85, decisions: 234, corrections: 8 },
    { week: 'W8', accuracy: 88, decisions: 256, corrections: 6 },
    { week: 'W9', accuracy: 87, decisions: 278, corrections: 7 },
    { week: 'W10', accuracy: 91, decisions: 301, corrections: 4 },
    { week: 'W11', accuracy: 93, decisions: 324, corrections: 3 },
    { week: 'W12', accuracy: 95, decisions: 348, corrections: 2 },
  ];

  const weeklyNotes = [
    {
      week: 'Week 12', date: 'Feb 10 – Feb 16', improvement: '+2.1%',
      notes: [
        'Achieved 95% accuracy milestone — highest recorded',
        'CRM lead scoring model refined with 2,400 new data points',
        'Marketing attribution model updated to include cross-channel signals',
      ],
    },
    {
      week: 'Week 11', date: 'Feb 3 – Feb 9', improvement: '+2.2%',
      notes: [
        'Shield module detected and prevented 12 security anomalies',
        'Reduced false positive rate by 34%',
        'Integrated new behavioral pattern recognition',
      ],
    },
    {
      week: 'Week 10', date: 'Jan 27 – Feb 2', improvement: '+4.6%',
      notes: [
        'Website optimization decisions reached 91% accuracy',
        'A/B testing framework improved with Bayesian approach',
        'Reduced decision latency from 340ms to 180ms',
      ],
    },
  ];

  const mistakeLog = [
    {
      id: 'ERR-047', severity: 'medium',
      module: 'Marketing', date: 'Feb 14',
      mistake: 'Over-allocated marketing budget to low-converting channel',
      correction: 'Implemented real-time ROI thresholds with automatic budget reallocation triggers',
      impact: 'Saved $4,200 in wasted spend after correction',
    },
    {
      id: 'ERR-046', severity: 'low',
      module: 'CRM', date: 'Feb 11',
      mistake: 'Assigned high-value lead to rep with full pipeline',
      correction: 'Added pipeline capacity weight to lead assignment algorithm',
      impact: 'Lead conversion rate improved by 8% post-correction',
    },
    {
      id: 'ERR-045', severity: 'high',
      module: 'Shield', date: 'Feb 7',
      mistake: 'Failed to detect sophisticated phishing attempt (new pattern)',
      correction: 'Expanded threat signature database with 340 new patterns from incident analysis',
      impact: 'Zero similar incidents since correction',
    },
    {
      id: 'ERR-044', severity: 'medium',
      module: 'Website', date: 'Feb 3',
      mistake: 'Prematurely ended A/B test before statistical significance',
      correction: 'Enforced minimum sample size requirement of 5,000 visitors before decision',
      impact: 'Test validity improved — no premature terminations since',
    },
  ];

  const moduleColors = { CRM: '#5B8CFF', Marketing: '#8B5CF6', Shield: '#F59E0B', Website: '#22C55E' };

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  let learningChartInstance = null;

  window.loadLearning = function () {
    const content = document.getElementById('page-content');
    if (!content) return;

    if (learningChartInstance) {
      learningChartInstance.destroy();
      learningChartInstance = null;
    }

    content.innerHTML = `
      <div class="page-animate" style="padding: 24px; display: flex; flex-direction: column; gap: 24px;">

        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">Learning Timeline</h1>
            <p class="page-subtitle">Track the AI's evolution — intelligence, growth, and self-reflection</p>
          </div>
          <!-- Accuracy Improvement KPI -->
          <div style="display: flex; align-items: center; gap: 16px; padding: 12px 20px; border-radius: var(--radius-lg); border: 1px solid rgba(34,197,94,0.2); background: rgba(34,197,94,0.06);">
            <div style="width: 48px; height: 48px; border-radius: var(--radius-lg); background: rgba(34,197,94,0.15); display: flex; align-items: center; justify-content: center;">
              <i class="bi bi-graph-up-arrow" style="font-size: 22px; color: var(--success);"></i>
            </div>
            <div>
              <div style="font-size: 11px; font-weight: 600; color: var(--dim); text-transform: uppercase; letter-spacing: 0.05em;">Accuracy Improvement</div>
              <div style="display: flex; align-items: baseline; gap: 4px; margin-top: 4px;">
                <span style="font-size: 28px; font-weight: 700; color: var(--success); font-family: var(--font-mono);">+23%</span>
                <span style="font-size: 12px; color: var(--muted);">over 12 weeks</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart Card -->
        <div class="card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <div class="card-title" style="margin: 0;">
              <i class="bi bi-cpu" style="color: var(--accent);"></i>
              Learning Progress Over Time
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-line" style="background: #5B8CFF;"></div>
                <span>Accuracy %</span>
              </div>
              <div class="legend-item">
                <div class="legend-line" style="background: #22C55E;"></div>
                <span>Decisions Made</span>
              </div>
              <div class="legend-item">
                <div class="legend-line" style="background: #EF4444;"></div>
                <span>Corrections</span>
              </div>
            </div>
          </div>
          <div class="chart-wrap" style="height: 280px;">
            <canvas id="learning-chart"></canvas>
          </div>
        </div>

        <!-- Notes + Mistakes Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">

          <!-- Weekly Learning Notes -->
          <div class="card">
            <div class="card-title">
              <i class="bi bi-lightbulb" style="color: var(--warning);"></i>
              Weekly Learning Notes
            </div>
            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${weeklyNotes.map(n => buildWeekNote(n)).join('')}
            </div>
          </div>

          <!-- Mistake → Correction Log -->
          <div class="card">
            <div class="card-title" style="display: flex; align-items: center; gap: 8px;">
              <i class="bi bi-exclamation-circle" style="color: var(--danger);"></i>
              Mistake → Correction Log
              <span style="margin-left: auto; font-size: 10px; font-weight: 600; color: #94A3B8; background: rgba(30,41,59,0.6); padding: 2px 8px; border-radius: 4px;">AI SELF-REFLECTION</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${mistakeLog.map(m => buildMistakeCard(m)).join('')}
            </div>
          </div>

        </div>

      </div>
    `;

    requestAnimationFrame(() => initLearningChart());
  };

  /* -------------------------------------------------------
     BUILD WEEK NOTE
  ------------------------------------------------------- */
  function buildWeekNote(n) {
    return `
      <div class="week-note-card">
        <div class="week-note-header">
          <div class="week-note-left">
            <i class="bi bi-calendar3" style="font-size: 13px; color: var(--dim);"></i>
            <span class="week-note-name">${n.week}</span>
            <span class="week-note-date">${n.date}</span>
          </div>
          <span style="font-size: 12px; font-weight: 700; color: var(--success);">${n.improvement}</span>
        </div>
        <div class="week-note-items">
          ${n.notes.map(note => `
            <div class="week-note-item">
              <i class="bi bi-lightning" style="color: var(--accent);"></i>
              <span>${escHtml(note)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* -------------------------------------------------------
     BUILD MISTAKE CARD
  ------------------------------------------------------- */
  function buildMistakeCard(m) {
    const modColor = moduleColors[m.module] || '#94A3B8';
    return `
      <div class="mistake-card">
        <div class="mistake-header">
          <span class="mistake-id">${m.id}</span>
          <span class="sev-badge sev-${m.severity}">${m.severity.toUpperCase()}</span>
          <span class="mod-badge" style="color:${modColor}; background:${modColor}18; font-size: 10px; padding: 2px 8px;">${m.module}</span>
          <span style="font-size: 11px; color: var(--dim); margin-left: auto;">${m.date}</span>
        </div>
        <div class="mistake-row">
          <i class="bi bi-x-circle"></i>
          <span>${escHtml(m.mistake)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px;padding:0 4px;">
          <i class="bi bi-arrow-right" style="font-size:12px;color:var(--dim);"></i>
        </div>
        <div class="correction-row">
          <i class="bi bi-check-circle"></i>
          <span>${escHtml(m.correction)}</span>
        </div>
        <div class="impact-row">
          <i class="bi bi-star" style="font-size:12px;"></i>
          ${escHtml(m.impact)}
        </div>
      </div>
    `;
  }

  /* -------------------------------------------------------
     CHART.JS
  ------------------------------------------------------- */
  function initLearningChart() {
    const canvas = document.getElementById('learning-chart');
    if (!canvas) return;

    if (learningChartInstance) {
      learningChartInstance.destroy();
      learningChartInstance = null;
    }

    const ctx = canvas.getContext('2d');

    // Gradient fill for accuracy (blue area)
    const gradBlue = ctx.createLinearGradient(0, 0, 0, 280);
    gradBlue.addColorStop(0, 'rgba(91,140,255,0.25)');
    gradBlue.addColorStop(1, 'rgba(91,140,255,0.00)');

    learningChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: learningData.map(d => d.week),
        datasets: [
          {
            // Accuracy — blue filled area
            label: 'Accuracy',
            data: learningData.map(d => d.accuracy),
            borderColor: '#5B8CFF',
            backgroundColor: gradBlue,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#5B8CFF',
            yAxisID: 'y',
          },
          {
            // Decisions Made — green line
            label: 'Decisions Made',
            data: learningData.map(d => d.decisions),
            borderColor: '#22C55E',
            backgroundColor: 'transparent',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#22C55E',
            yAxisID: 'y1',
          },
          {
            // Corrections — red line with dots
            label: 'Corrections',
            data: learningData.map(d => d.corrections),
            borderColor: '#EF4444',
            backgroundColor: 'transparent',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#EF4444',
            pointHoverRadius: 5,
            yAxisID: 'y2',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            borderColor: 'rgba(91,140,255,0.2)',
            borderWidth: 1,
            titleColor: '#94A3B8',
            bodyColor: '#E2E8F0',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (ctx) {
                const name = ctx.dataset.label;
                const val = ctx.parsed.y;
                if (name === 'Accuracy') return `  Accuracy: ${val}%`;
                if (name === 'Decisions Made') return `  Decisions Made: ${val}`;
                if (name === 'Corrections') return `  Corrections: ${val}`;
                return `  ${name}: ${val}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(91,140,255,0.06)', drawBorder: false },
            border: { color: 'rgba(91,140,255,0.1)' },
            ticks: { color: '#64748B', font: { size: 11 } },
          },
          y: {
            position: 'left',
            grid: { color: 'rgba(91,140,255,0.06)', drawBorder: false },
            border: { color: 'rgba(91,140,255,0.1)' },
            ticks: { color: '#64748B', font: { size: 11 } },
            min: 60, max: 100,
          },
          y1: {
            position: 'right',
            display: false,
          },
          y2: {
            position: 'right',
            display: false,
          },
        },
      },
    });
  }

  /* -------------------------------------------------------
     UTILS
  ------------------------------------------------------- */
  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

})();
