/* ============================================================
   overview.js — Executive Overview Page
   KPI cards + Chart.js area chart + AI Insight banner
   ============================================================ */

(function () {
    'use strict';

    /* -------------------------------------------------------
       DATA
    ------------------------------------------------------- */
    const kpiData = [
        {
            title: 'Business Intelligence Score',
            value: '87.3', unit: '/100',
            change: '+4.1%', trend: 'up',
            icon: 'bi-cpu',
            color: '#5B8CFF',
            desc: 'Composite AI intelligence rating',
        },
        {
            title: 'Revenue Momentum',
            value: '$2.4M', unit: '/mo',
            change: '+12.8%', trend: 'up',
            icon: 'bi-graph-up-arrow',
            color: '#22C55E',
            desc: 'Monthly recurring revenue trend',
        },
        {
            title: 'AI Confidence',
            value: '94.7', unit: '%',
            change: '+2.3%', trend: 'up',
            icon: 'bi-bullseye',
            color: '#8B5CF6',
            desc: 'Average decision confidence level',
        },
        {
            title: 'Risk Index',
            value: '12.1', unit: '/100',
            change: '-3.2%', trend: 'up', // down is good = 'up' green style
            icon: 'bi-shield-exclamation',
            color: '#F59E0B',
            desc: 'Aggregate operational risk score',
        },
    ];

    const chartData = {
        labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'],
        intelligence: [72, 74, 73, 78, 80, 79, 83, 85, 84, 88, 90, 87],
        revenue: [1800, 1950, 1870, 2050, 2100, 2200, 2150, 2280, 2310, 2390, 2450, 2400],
        confidence: [88, 89, 88, 90, 91, 91, 92, 93, 92, 94, 95, 95],
    };

    /* -------------------------------------------------------
       RENDER
    ------------------------------------------------------- */
    window.loadOverview = function () {
        const content = document.getElementById('page-content');
        if (!content) return;

        content.innerHTML = `
      <div class="page-animate" style="padding: 24px; display: flex; flex-direction: column; gap: 24px; min-height: 100%;">

        <!-- Page Header -->
        <div>
          <h1 class="page-title">Executive Overview</h1>
          <p class="page-subtitle">Real-time performance intelligence across all AI modules</p>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-grid">
          ${kpiData.map(kpi => buildKPICard(kpi)).join('')}
        </div>

        <!-- Area Chart -->
        <div class="card" style="padding: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <div class="card-title" style="margin-bottom: 4px;">
                <i class="bi bi-graph-up" style="color: var(--accent);"></i>
                Business Intelligence Growth (Weekly)
              </div>
              <p style="font-size: 12px; color: var(--dim);">12-week trajectory across core intelligence metrics</p>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-line" style="background: #5B8CFF;"></div>
                <span>Intelligence</span>
              </div>
              <div class="legend-item">
                <div class="legend-line" style="background: #22C55E;"></div>
                <span>Revenue</span>
              </div>
              <div class="legend-item">
                <div class="legend-line" style="background: #8B5CF6;"></div>
                <span>Confidence</span>
              </div>
            </div>
          </div>
          <div class="chart-wrap" style="height: 320px;">
            <canvas id="overview-chart"></canvas>
          </div>
        </div>

        <!-- AI Insight Banner -->
        <div class="ai-insight">
          <div class="ai-insight-left">
            <div class="ai-insight-icon">
              <i class="bi bi-stars"></i>
            </div>
            <div>
              <div class="ai-insight-quote">
                Your business is 4.1% smarter than last week
              </div>
              <div class="ai-insight-sub">
                Neural Core AI Insight — Based on 1,847 data points analyzed in the last 7 days
              </div>
            </div>
          </div>
          <div class="ai-insight-right">
            <div class="ai-generated-badge">
              <i class="bi bi-cpu"></i>
              AI GENERATED
            </div>
          </div>
        </div>

      </div>
    `;

        // Initialize chart after DOM is ready
        requestAnimationFrame(() => initOverviewChart());
    };

    /* -------------------------------------------------------
       KPI CARD BUILDER
    ------------------------------------------------------- */
    function buildKPICard(kpi) {
        const trendClass = kpi.trend === 'up' ? 'trend-up' : 'trend-down';
        const trendIcon = kpi.trend === 'up' ? 'bi-arrow-up' : 'bi-arrow-down';
        const [mainVal, unitPart] = splitValue(kpi.value, kpi.unit);

        return `
      <div class="kpi-card">
        <div class="kpi-card-top">
          <div class="kpi-icon" style="background: ${kpi.color}15; color: ${kpi.color};">
            <i class="${kpi.icon}"></i>
          </div>
          <div class="kpi-trend ${trendClass}">
            <i class="bi ${trendIcon}"></i>
            ${kpi.change}
          </div>
        </div>
        <div class="kpi-value">
          ${mainVal}
          ${unitPart ? `<span class="kpi-unit">${unitPart}</span>` : ''}
        </div>
        <div class="kpi-label">${kpi.title}</div>
        <div class="kpi-desc">${kpi.desc}</div>
      </div>
    `;
    }

    function splitValue(value, unit) {
        // Returns [displayValue, displayUnit]
        if (unit) return [value, unit];
        return [value, ''];
    }

    /* -------------------------------------------------------
       CHART.JS AREA CHART
    ------------------------------------------------------- */
    let overviewChartInstance = null;

    function initOverviewChart() {
        const canvas = document.getElementById('overview-chart');
        if (!canvas) return;

        // Destroy previous instance if any
        if (overviewChartInstance) {
            overviewChartInstance.destroy();
            overviewChartInstance = null;
        }

        const ctx = canvas.getContext('2d');

        // Gradient fills
        const gradBlue = ctx.createLinearGradient(0, 0, 0, 320);
        gradBlue.addColorStop(0, 'rgba(91,140,255,0.30)');
        gradBlue.addColorStop(1, 'rgba(91,140,255,0.00)');

        const gradGreen = ctx.createLinearGradient(0, 0, 0, 320);
        gradGreen.addColorStop(0, 'rgba(34,197,94,0.20)');
        gradGreen.addColorStop(1, 'rgba(34,197,94,0.00)');

        const gradPurple = ctx.createLinearGradient(0, 0, 0, 320);
        gradPurple.addColorStop(0, 'rgba(139,92,246,0.30)');
        gradPurple.addColorStop(1, 'rgba(139,92,246,0.00)');

        const gridColor = 'rgba(91,140,255,0.06)';
        const axisColor = 'rgba(91,140,255,0.1)';
        const tickColor = '#64748B';
        const tooltipBg = '#111827';
        const tooltipBorder = 'rgba(91,140,255,0.2)';

        overviewChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Intelligence',
                        data: chartData.intelligence,
                        borderColor: '#5B8CFF',
                        backgroundColor: gradBlue,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: '#5B8CFF',
                    },
                    {
                        label: 'Revenue',
                        data: chartData.revenue.map(v => v / 100), // scale to same axis
                        borderColor: '#22C55E',
                        backgroundColor: gradGreen,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: '#22C55E',
                    },
                    {
                        label: 'Confidence',
                        data: chartData.confidence,
                        borderColor: '#8B5CF6',
                        backgroundColor: gradPurple,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: '#8B5CF6',
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
                        backgroundColor: tooltipBg,
                        borderColor: tooltipBorder,
                        borderWidth: 1,
                        titleColor: '#94A3B8',
                        bodyColor: '#E2E8F0',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (ctx) {
                                const label = ctx.dataset.label;
                                const val = ctx.parsed.y;
                                if (label === 'Revenue') return `  Revenue: $${(val * 100).toFixed(0)}`;
                                if (label === 'Confidence') return `  Confidence: ${val}%`;
                                return `  Intelligence: ${val}`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { color: gridColor, drawBorder: false },
                        border: { color: axisColor },
                        ticks: { color: tickColor, font: { size: 11, family: "'Inter', sans-serif" } },
                    },
                    y: {
                        grid: { color: gridColor, drawBorder: false },
                        border: { color: axisColor },
                        ticks: { color: tickColor, font: { size: 11, family: "'Inter', sans-serif" } },
                        min: 0,
                    },
                },
            },
        });
    }

})();
