/* ============================================================
   overview.js — NeuralOrbit Executive Overview (Module-Aware)
   KPI cards + Chart.js area chart + AI Insight banner
   Reads window.CURRENT_MODULE to show correct module data.
   ============================================================ */

(function () {
  'use strict';

  /* -------------------------------------------------------
     MODULE-SPECIFIC DATA
  ------------------------------------------------------- */
  const moduleData = {
    'neural-orbit': {
      title: 'Executive Overview',
      subtitle: 'Real-time performance intelligence across all AI modules',
      insight: 'Your business is 4.1% smarter than last week',
      insightSub: 'NeuralOrbit AI Insight — Based on 1,847 data points analyzed in the last 7 days',
      kpis: [
        { title: 'Business Intelligence Score', value: '87.3', unit: '/100', change: '+4.1%', trend: 'up', icon: 'bi-cpu', color: '#5B8CFF', desc: 'Composite AI intelligence rating' },
        { title: 'Revenue Momentum', value: '$2.4M', unit: '/mo', change: '+12.8%', trend: 'up', icon: 'bi-graph-up-arrow', color: '#22C55E', desc: 'Monthly recurring revenue trend' },
        { title: 'AI Confidence', value: '94.7', unit: '%', change: '+2.3%', trend: 'up', icon: 'bi-bullseye', color: '#8B5CF6', desc: 'Average decision confidence level' },
        { title: 'Risk Index', value: '12.1', unit: '/100', change: '-3.2%', trend: 'up', icon: 'bi-shield-exclamation', color: '#F59E0B', desc: 'Aggregate operational risk score' },
      ],
      chartLabels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'],
      chartA: { label: 'Intelligence', data: [72, 74, 73, 78, 80, 79, 83, 85, 84, 88, 90, 87], color: '#5B8CFF' },
      chartB: { label: 'Revenue', data: [18, 19.5, 18.7, 20.5, 21, 22, 21.5, 22.8, 23.1, 23.9, 24.5, 24], color: '#22C55E' },
      chartC: { label: 'Confidence', data: [88, 89, 88, 90, 91, 91, 92, 93, 92, 94, 95, 95], color: '#8B5CF6' },
    },
    'crm': {
      title: 'CRM Overview',
      subtitle: 'AI-powered lead intelligence and pipeline performance',
      insight: 'Lead conversion improved by 5.1% this week — AI pipeline scoring driving results',
      insightSub: 'NeuralOrbit CRM AI — Based on 1,247 lead interactions in the last 7 days',
      kpis: [
        { title: 'Active Leads', value: '1,247', unit: '', change: '+18.4%', trend: 'up', icon: 'bi-people', color: '#5B8CFF', desc: 'Leads in active pipeline' },
        { title: 'Conversion Rate', value: '34.2', unit: '%', change: '+5.1%', trend: 'up', icon: 'bi-graph-up', color: '#22C55E', desc: 'Leads converted to customers' },
        { title: 'Avg Deal Value', value: '$24.8K', unit: '', change: '+12.3%', trend: 'up', icon: 'bi-currency-dollar', color: '#8B5CF6', desc: 'Average deal size closed' },
        { title: 'Pipeline Velocity', value: '8.4', unit: '/day', change: '+6.7%', trend: 'up', icon: 'bi-lightning', color: '#F59E0B', desc: 'Leads advancing per day' },
      ],
      chartLabels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'],
      chartA: { label: 'Leads', data: [820, 870, 860, 920, 980, 940, 1050, 1100, 1090, 1180, 1220, 1247], color: '#5B8CFF' },
      chartB: { label: 'Conversions', data: [28, 29, 28.5, 30, 31, 31.5, 32, 33, 32.5, 34, 34.5, 34.2], color: '#22C55E' },
      chartC: { label: 'Deal Value', data: [18, 19, 19.5, 20, 21, 21.5, 22, 23, 22.5, 23.5, 24, 24.8], color: '#8B5CF6' },
    },
    'marketing': {
      title: 'Marketing Overview',
      subtitle: 'AI-optimized campaign performance and ROI intelligence',
      insight: 'Campaign ROAS increased 21.3% — AI reallocated budget to top 3 performers',
      insightSub: 'NeuralOrbit Marketing AI — Based on 14 active campaigns analyzed this week',
      kpis: [
        { title: 'Campaign ROAS', value: '4.8', unit: 'x', change: '+21.3%', trend: 'up', icon: 'bi-bar-chart', color: '#8B5CF6', desc: 'Return on ad spend' },
        { title: 'Cost Per Lead', value: '$18.40', unit: '', change: '-14.2%', trend: 'up', icon: 'bi-coin', color: '#22C55E', desc: 'Average cost per acquired lead' },
        { title: 'Email Open Rate', value: '42.1', unit: '%', change: '+8.7%', trend: 'up', icon: 'bi-envelope-open', color: '#5B8CFF', desc: 'AI-optimized send times' },
        { title: 'Ad Spend Efficiency', value: '87', unit: '%', change: '+11.2%', trend: 'up', icon: 'bi-pie-chart', color: '#F59E0B', desc: 'Spend allocation accuracy' },
      ],
      chartLabels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'],
      chartA: { label: 'ROAS', data: [3.0, 3.1, 3.2, 3.5, 3.7, 3.8, 4.0, 4.2, 4.3, 4.5, 4.7, 4.8], color: '#8B5CF6' },
      chartB: { label: 'Open Rate', data: [35, 36, 35.5, 37, 38, 39, 40, 41, 40.5, 41.5, 42, 42.1], color: '#5B8CFF' },
      chartC: { label: 'Efficiency', data: [70, 72, 73, 75, 77, 78, 80, 82, 83, 85, 86, 87], color: '#22C55E' },
    },
    'shield': {
      title: 'Shield Overview',
      subtitle: 'AI-powered threat detection and compliance intelligence',
      insight: 'Shield blocked 33% more threats this week with 0.02% false positive rate',
      insightSub: 'NeuralOrbit Shield AI — Monitoring 847 active security signals 24/7',
      kpis: [
        { title: 'Threats Blocked', value: '2,841', unit: '', change: '+33.1%', trend: 'up', icon: 'bi-shield-check', color: '#F59E0B', desc: 'Threats neutralized this period' },
        { title: 'False Positive Rate', value: '0.02', unit: '%', change: '-61.4%', trend: 'up', icon: 'bi-check-circle', color: '#22C55E', desc: 'AI accuracy in threat detection' },
        { title: 'Response Time', value: '180', unit: 'ms', change: '-47.2%', trend: 'up', icon: 'bi-lightning', color: '#5B8CFF', desc: 'Avg threat containment speed' },
        { title: 'Security Score', value: '98.4', unit: '/100', change: '+4.1%', trend: 'up', icon: 'bi-shield-fill', color: '#8B5CF6', desc: 'Overall security health' },
      ],
      chartLabels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'],
      chartA: { label: 'Threats Blocked', data: [1800, 1900, 1950, 2100, 2200, 2300, 2400, 2500, 2550, 2700, 2800, 2841], color: '#F59E0B' },
      chartB: { label: 'Security Score', data: [90, 91, 91, 92, 93, 94, 95, 96, 96, 97, 98, 98.4], color: '#22C55E' },
      chartC: { label: 'Response(ms/10)', data: [34, 32, 30, 28, 26, 25, 24, 22, 21, 20, 19, 18], color: '#5B8CFF' },
    },
    'website': {
      title: 'Website Overview',
      subtitle: 'AI-driven conversion optimization and user experience intelligence',
      insight: 'Website conversion rate improved 31.2% — 14 concurrent A/B tests running',
      insightSub: 'NeuralOrbit Website AI — Personalizing content for every visitor in real-time',
      kpis: [
        { title: 'Conversion Rate', value: '4.7', unit: '%', change: '+31.2%', trend: 'up', icon: 'bi-graph-up-arrow', color: '#22C55E', desc: 'Visitors converting to leads' },
        { title: 'Bounce Rate', value: '18.3', unit: '%', change: '-22.1%', trend: 'up', icon: 'bi-arrow-left-right', color: '#5B8CFF', desc: 'Single-page session rate' },
        { title: 'Avg Session Value', value: '$8.40', unit: '', change: '+19.8%', trend: 'up', icon: 'bi-currency-dollar', color: '#8B5CF6', desc: 'Revenue attributed per session' },
        { title: 'Core Web Vitals', value: '94', unit: '/100', change: '+7.4%', trend: 'up', icon: 'bi-speedometer2', color: '#F59E0B', desc: 'Google performance score' },
      ],
      chartLabels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'],
      chartA: { label: 'Conversion %', data: [2.8, 3.0, 3.1, 3.5, 3.7, 3.9, 4.0, 4.2, 4.3, 4.5, 4.6, 4.7], color: '#22C55E' },
      chartB: { label: 'Session Value', data: [5.5, 5.8, 6.0, 6.4, 6.8, 7.0, 7.2, 7.6, 7.8, 8.0, 8.2, 8.4], color: '#8B5CF6' },
      chartC: { label: 'Web Vitals', data: [80, 82, 83, 85, 87, 88, 89, 90, 91, 92, 93, 94], color: '#5B8CFF' },
    },
  };

  /* -------------------------------------------------------
     CHART INSTANCE (preserve for re-render)
  ------------------------------------------------------- */
  let overviewChartInstance = null;

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  window.loadOverview = function () {
    const content = document.getElementById('page-content');
    if (!content) return;

    const moduleKey = window.CURRENT_MODULE || 'neural-orbit';
    const d = moduleData[moduleKey] || moduleData['neural-orbit'];

    content.innerHTML = `
            <div class="page-animate" style="padding: 24px; display: flex; flex-direction: column; gap: 24px; min-height: 100%;">

                <!-- Page Header -->
                <div>
                    <h1 class="page-title">${d.title}</h1>
                    <p class="page-subtitle">${d.subtitle}</p>
                </div>

                <!-- KPI Cards -->
                <div class="kpi-grid">
                    ${d.kpis.map(kpi => buildKPICard(kpi)).join('')}
                </div>

                <!-- Area Chart -->
                <div class="card" style="padding: 24px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                        <div>
                            <div class="card-title" style="margin-bottom: 4px;">
                                <i class="bi bi-graph-up" style="color: var(--accent);"></i>
                                ${d.title} — Weekly Growth
                            </div>
                            <p style="font-size: 12px; color: var(--dim);">12-week performance trajectory</p>
                        </div>
                        <div class="chart-legend">
                            <div class="legend-item"><div class="legend-line" style="background:${d.chartA.color};"></div><span>${d.chartA.label}</span></div>
                            <div class="legend-item"><div class="legend-line" style="background:${d.chartB.color};"></div><span>${d.chartB.label}</span></div>
                            <div class="legend-item"><div class="legend-line" style="background:${d.chartC.color};"></div><span>${d.chartC.label}</span></div>
                        </div>
                    </div>
                    <div class="chart-wrap" style="height: 300px;">
                        <canvas id="overview-chart"></canvas>
                    </div>
                </div>

                <!-- AI Insight Banner -->
                <div class="ai-insight">
                    <div class="ai-insight-left">
                        <div class="ai-insight-icon"><i class="bi bi-stars"></i></div>
                        <div>
                            <div class="ai-insight-quote">${d.insight}</div>
                            <div class="ai-insight-sub">${d.insightSub}</div>
                        </div>
                    </div>
                    <div class="ai-insight-right">
                        <div class="ai-generated-badge"><i class="bi bi-cpu"></i> AI GENERATED</div>
                    </div>
                </div>

            </div>
        `;

    requestAnimationFrame(() => initOverviewChart(d));
  };

  /* -------------------------------------------------------
     KPI CARD BUILDER
  ------------------------------------------------------- */
  function buildKPICard(kpi) {
    const trendClass = kpi.trend === 'up' ? 'trend-up' : 'trend-down';
    const trendIcon = kpi.trend === 'up' ? 'bi-arrow-up' : 'bi-arrow-down';
    return `
            <div class="kpi-card">
                <div class="kpi-card-top">
                    <div class="kpi-icon" style="background: ${kpi.color}18; color: ${kpi.color};">
                        <i class="${kpi.icon}"></i>
                    </div>
                    <div class="kpi-trend ${trendClass}">
                        <i class="bi ${trendIcon}"></i> ${kpi.change}
                    </div>
                </div>
                <div class="kpi-value">
                    ${kpi.value}
                    ${kpi.unit ? `<span class="kpi-unit">${kpi.unit}</span>` : ''}
                </div>
                <div class="kpi-label">${kpi.title}</div>
                <div class="kpi-desc">${kpi.desc}</div>
            </div>
        `;
  }

  /* -------------------------------------------------------
     CHART.JS AREA CHART
  ------------------------------------------------------- */
  function initOverviewChart(d) {
    const canvas = document.getElementById('overview-chart');
    if (!canvas) return;

    if (overviewChartInstance) { overviewChartInstance.destroy(); overviewChartInstance = null; }

    const ctx = canvas.getContext('2d');

    function makeGrad(color) {
      const g = ctx.createLinearGradient(0, 0, 0, 300);
      g.addColorStop(0, color.replace(')', ', 0.28)').replace('rgb', 'rgba'));
      g.addColorStop(1, color.replace(')', ', 0.00)').replace('rgb', 'rgba'));
      return g;
    }

    function hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }

    const gradA = ctx.createLinearGradient(0, 0, 0, 300);
    gradA.addColorStop(0, hexToRgba(d.chartA.color, 0.28));
    gradA.addColorStop(1, hexToRgba(d.chartA.color, 0.00));

    const gradB = ctx.createLinearGradient(0, 0, 0, 300);
    gradB.addColorStop(0, hexToRgba(d.chartB.color, 0.18));
    gradB.addColorStop(1, hexToRgba(d.chartB.color, 0.00));

    const gradC = ctx.createLinearGradient(0, 0, 0, 300);
    gradC.addColorStop(0, hexToRgba(d.chartC.color, 0.22));
    gradC.addColorStop(1, hexToRgba(d.chartC.color, 0.00));

    overviewChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: d.chartLabels,
        datasets: [
          { label: d.chartA.label, data: d.chartA.data, borderColor: d.chartA.color, backgroundColor: gradA, borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5 },
          { label: d.chartB.label, data: d.chartB.data, borderColor: d.chartB.color, backgroundColor: gradB, borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5 },
          { label: d.chartC.label, data: d.chartC.data, borderColor: d.chartC.color, backgroundColor: gradC, borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#111827', borderColor: 'rgba(91,140,255,0.2)', borderWidth: 1, titleColor: '#94A3B8', bodyColor: '#E2E8F0', padding: 12, cornerRadius: 8 },
        },
        scales: {
          x: { grid: { color: 'rgba(91,140,255,0.06)' }, border: { color: 'rgba(91,140,255,0.1)' }, ticks: { color: '#64748B', font: { size: 11 } } },
          y: { grid: { color: 'rgba(91,140,255,0.06)' }, border: { color: 'rgba(91,140,255,0.1)' }, ticks: { color: '#64748B', font: { size: 11 } }, min: 0 },
        },
      },
    });
  }

})();
