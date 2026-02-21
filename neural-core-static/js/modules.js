/* ============================================================
   modules.js — CRM, Marketing, Shield, Website Module Pages
   Exact content from ModulePlaceholder.tsx + each Module.tsx
   ============================================================ */

(function () {
    'use strict';

    /* -------------------------------------------------------
       MODULE DATA — exact from source files
    ------------------------------------------------------- */
    const modules = {
        crm: {
            label: 'CRM',
            icon: 'bi-people-fill',
            color: '#5B8CFF',
            bg: 'rgba(91,140,255,0.12)',
            border: 'rgba(91,140,255,0.3)',
            aiBg: 'rgba(91,140,255,0.06)',
            aiBorder: 'rgba(91,140,255,0.25)',
            stats: [
                { label: 'Active Leads', value: '1,247', change: '+18.4%' },
                { label: 'Conversion Rate', value: '34.2%', change: '+5.1%' },
                { label: 'Avg Deal Value', value: '$24.8K', change: '+12.3%' },
            ],
            features: [
                { icon: 'bi-crosshair', name: 'Lead Scoring', desc: 'AI-powered lead scoring based on behavioral data, engagement patterns, and historical conversion to prioritize the highest-value prospects.' },
                { icon: 'bi-people', name: 'Smart Assignment', desc: 'Intelligent lead distribution that matches prospects to the best-fit sales rep based on expertise, capacity, and historical win rates.' },
                { icon: 'bi-graph-up', name: 'Pipeline Forecasting', desc: 'Accurate revenue forecasting using machine learning trained on historical deal data, seasonality patterns, and current pipeline velocity.' },
                { icon: 'bi-arrow-repeat', name: 'Churn Prevention', desc: 'Proactive identification of at-risk accounts with automated re-engagement workflows to reduce churn before it happens.' },
            ],
            aiBannerText: 'Neural Core is actively monitoring your CRM pipeline, scoring leads in real-time, and optimizing rep assignments to maximize conversion rates.',
        },

        marketing: {
            label: 'Marketing',
            icon: 'bi-megaphone-fill',
            color: '#8B5CF6',
            bg: 'rgba(139,92,246,0.12)',
            border: 'rgba(139,92,246,0.3)',
            aiBg: 'rgba(139,92,246,0.06)',
            aiBorder: 'rgba(139,92,246,0.25)',
            stats: [
                { label: 'Campaign ROAS', value: '4.8x', change: '+21.3%' },
                { label: 'Cost Per Lead', value: '$18.40', change: '-14.2%' },
                { label: 'Email Open Rate', value: '42.1%', change: '+8.7%' },
            ],
            features: [
                { icon: 'bi-bar-chart', name: 'Campaign Optimizer', desc: 'Automated campaign performance optimization that reallocates budget in real-time to the highest-performing channels and placements.' },
                { icon: 'bi-person-lines-fill', name: 'Audience Segmentation', desc: 'Dynamic audience segmentation using behavioral clustering to deliver personalized messaging that converts at 3x the industry average.' },
                { icon: 'bi-bullseye', name: 'Attribution Modeling', desc: 'Multi-touch attribution that accurately maps every touchpoint in the customer journey, giving credit where it\'s truly due.' },
                { icon: 'bi-envelope', name: 'Email Intelligence', desc: 'AI-optimized send times, subject lines, and content personalization that adapts to each individual\'s engagement patterns.' },
            ],
            aiBannerText: 'Neural Core is optimizing your ad spend in real-time, pausing underperforming campaigns and reallocating budget to maximize ROAS across all channels.',
        },

        shield: {
            label: 'Shield',
            icon: 'bi-shield-fill-check',
            color: '#F59E0B',
            bg: 'rgba(245,158,11,0.12)',
            border: 'rgba(245,158,11,0.3)',
            aiBg: 'rgba(245,158,11,0.06)',
            aiBorder: 'rgba(245,158,11,0.25)',
            stats: [
                { label: 'Threats Blocked', value: '2,841', change: '+33.1%' },
                { label: 'False Positive Rate', value: '0.02%', change: '-61.4%' },
                { label: 'Response Time', value: '180ms', change: '-47.2%' },
            ],
            features: [
                { icon: 'bi-exclamation-triangle', name: 'Threat Detection', desc: 'Real-time anomaly detection across all system access patterns, identifying sophisticated threats including zero-day attacks and insider threats.' },
                { icon: 'bi-shield-exclamation', name: 'Compliance Monitor', desc: 'Continuous compliance monitoring across GDPR, SOC2, HIPAA, and industry-specific regulations with automated alert escalation.' },
                { icon: 'bi-person-badge', name: 'Identity Verification', desc: 'Behavioral biometrics and multi-factor authentication that adapts risk requirements based on access context and anomaly scores.' },
                { icon: 'bi-check-circle', name: 'Auto-Remediation', desc: 'Automated incident response that contains and neutralizes threats within milliseconds, minimizing exposure window and business impact.' },
            ],
            aiBannerText: 'Neural Core\'s Shield module is actively monitoring 847 security signals across your infrastructure, with automated threat containment running 24/7.',
        },

        website: {
            label: 'Website',
            icon: 'bi-globe',
            color: '#22C55E',
            bg: 'rgba(34,197,94,0.12)',
            border: 'rgba(34,197,94,0.3)',
            aiBg: 'rgba(34,197,94,0.06)',
            aiBorder: 'rgba(34,197,94,0.25)',
            stats: [
                { label: 'Conversion Rate', value: '4.7%', change: '+31.2%' },
                { label: 'Bounce Rate', value: '18.3%', change: '-22.1%' },
                { label: 'Avg Session Value', value: '$8.40', change: '+19.8%' },
            ],
            features: [
                { icon: 'bi-layout-split', name: 'A/B Testing', desc: 'Automated multivariate testing that runs hundreds of experiments simultaneously, with AI determining statistical significance and deploying winners.' },
                { icon: 'bi-person-video3', name: 'Personalization', desc: 'Real-time content personalization for every visitor based on behavior, source, device, and predicted intent — no manual rules required.' },
                { icon: 'bi-speedometer2', name: 'Performance Optimizer', desc: 'Continuous performance monitoring with automated optimizations for Core Web Vitals, improving load times and search engine rankings.' },
                { icon: 'bi-graph-up-arrow', name: 'Conversion Funnel AI', desc: 'Intelligent funnel analysis that identifies drop-off points and automatically tests optimizations to guide more visitors to conversion.' },
            ],
            aiBannerText: 'Neural Core is running 14 concurrent A/B tests on your website, personalizing content for each visitor, and optimizing your conversion funnel in real-time.',
        },
    };

    /* -------------------------------------------------------
       RENDER
    ------------------------------------------------------- */
    window.loadModulePage = function (moduleKey) {
        const content = document.getElementById('page-content');
        if (!content) return;

        const m = modules[moduleKey];
        if (!m) return;

        content.innerHTML = `
      <div class="page-animate" style="padding: 24px; display: flex; flex-direction: column; gap: 24px;">

        <!-- Header -->
        <div class="page-header">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 56px; height: 56px; border-radius: var(--radius-lg); background: ${m.bg}; border: 1px solid ${m.border}; display: flex; align-items: center; justify-content: center;">
              <i class="${m.icon}" style="font-size: 26px; color: ${m.color};"></i>
            </div>
            <div>
              <h1 class="page-title">${m.label} Module</h1>
              <p class="page-subtitle">AI-powered ${m.label.toLowerCase()} intelligence and automation</p>
            </div>
          </div>
          <span class="section-chip chip-blue">
            <i class="bi bi-cpu"></i>
            AI Active
          </span>
        </div>

        <!-- Stats Grid -->
        <div class="module-stat-grid">
          ${m.stats.map(s => `
            <div class="module-stat-card">
              <div class="module-stat-label">${s.label}</div>
              <div style="display: flex; align-items: baseline; gap: 4px; margin-top: 8px;">
                <span class="module-stat-value">${s.value}</span>
                <span class="module-stat-change" style="color: ${s.change.startsWith('-') && s.label !== 'Response Time' && s.label !== 'Bounce Rate' && s.label !== 'False Positive Rate' && s.label !== 'Cost Per Lead' ? 'var(--danger)' : 'var(--success)'}">${s.change}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Feature Grid -->
        <div class="module-feature-grid">
          ${m.features.map((f, i) => `
            <div class="module-feature-card" id="feature-card-${moduleKey}-${i}">
              <div class="module-feature-header">
                <div class="module-feature-title-row">
                  <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: ${m.bg}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="${f.icon}" style="color: ${m.color}; font-size: 15px;"></i>
                  </div>
                  <span class="module-feature-name">${f.name}</span>
                </div>
                <i class="bi bi-arrow-right module-feature-chevron"></i>
              </div>
              <div class="module-feature-desc">${escHtml(f.desc)}</div>
            </div>
          `).join('')}
        </div>

        <!-- AI Integration Banner -->
        <div class="module-ai-banner" style="background: ${m.aiBg}; border-color: ${m.aiBorder};">
          <div class="module-ai-icon" style="background: ${m.bg};">
            <i class="bi bi-cpu" style="color: ${m.color};"></i>
          </div>
          <div>
            <div class="module-ai-title">AI Integration Active</div>
            <div class="module-ai-desc">${escHtml(m.aiBannerText)}</div>
          </div>
        </div>

      </div>
    `;

        // Bind hover events for feature cards (ArrowRight fade-in already done via CSS)
        // Additional interactivity if needed
    };

    /* -------------------------------------------------------
       UTILS
    ------------------------------------------------------- */
    function escHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;');
    }

})();
