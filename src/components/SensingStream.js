// CityGuard AI - Multimodal Sensing Agents Feed Component (Gemini AI Live Engine)

import { geminiLiveEngine } from '../services/geminiLiveEngine.js';

export class SensingStream {
  constructor(containerId, state) {
    this.container = document.getElementById(containerId);
    this.state = state;
    this.activeFilter = 'all';
    this.unsubscribe = null;
  }

  render() {
    const liveCity = geminiLiveEngine.getLiveCityData();
    const items = liveCity.sensingData;
    const weather = liveCity.weather;

    this.container.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span class="panel-title-icon">📡</span>
            <span>Multimodal Sensing Agents</span>
          </div>
          <div class="panel-actions">
            <span class="badge-status live-pulse" style="font-size: 0.62rem;"><span class="pulse-dot"></span> GEMINI AI LIVE</span>
            <button id="inject-report-btn" class="pill-btn">+ Inject SOS</button>
          </div>
        </div>

        <div class="panel-body">
          <!-- Radar Weather Mini Gauge Box -->
          <div class="radar-gauge-box">
            <div class="radar-gauge-header">
              <span class="font-mono text-cyan">LIVE SENSOR TELEMETRY (IMD SONEGAON)</span>
              <span class="badge-status live-pulse"><span class="pulse-dot"></span> 1,842 NODES</span>
            </div>
            <div class="gauge-grid">
              <div class="gauge-pill ${weather.precipitation > 0 ? 'alert' : ''}">
                <div class="gauge-pill-label">PRECIPITATION RATE</div>
                <div class="gauge-pill-val ${weather.precipitation > 0 ? 'text-rose' : 'text-cyan'}">
                  ${weather.precipitation} mm/h
                </div>
              </div>
              <div class="gauge-pill ${weather.temperature >= 40 ? 'alert' : ''}">
                <div class="gauge-pill-label">URBAN CORE TEMP</div>
                <div class="gauge-pill-val ${weather.temperature >= 40 ? 'text-rose' : 'text-amber'}">
                  ${weather.temperature}°C
                </div>
              </div>
            </div>
          </div>

          <!-- Feed Source Filter Buttons -->
          <div style="display: flex; gap: 0.35rem; overflow-x: auto; padding-bottom: 0.2rem;">
            <button class="layer-toggle-btn ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all">All (${items.length})</button>
            <button class="layer-toggle-btn ${this.activeFilter === 'radar' ? 'active' : ''}" data-filter="radar">Radar</button>
            <button class="layer-toggle-btn ${this.activeFilter === 'citizen' ? 'active' : ''}" data-filter="citizen">Citizen SOS</button>
            <button class="layer-toggle-btn ${this.activeFilter === 'cctv' ? 'active' : ''}" data-filter="cctv">CCTV AI</button>
            <button class="layer-toggle-btn ${this.activeFilter === 'social' ? 'active' : ''}" data-filter="social">Social</button>
          </div>

          <!-- Stream Feed Items List -->
          <div class="sensor-stream-container" id="stream-cards-list">
            ${this.renderCards(items)}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    if (!this.unsubscribe) {
      this.unsubscribe = geminiLiveEngine.subscribe((event) => {
        if (event === 'analysis_complete') {
          this.render();
        }
      });
    }
  }

  renderCards(items) {
    const filtered = this.activeFilter === 'all' 
      ? items 
      : items.filter(i => i.source === this.activeFilter);

    return filtered.map(item => `
      <div class="stream-card">
        <div class="stream-card-header">
          <span class="source-tag tag-${item.source}">
            ${item.source === 'radar' ? '🌦️' : item.source === 'citizen' ? '📱' : item.source === 'cctv' ? '🚦' : '🐦'}
            ${item.sourceLabel}
          </span>
          <span class="stream-time">${item.timestamp}</span>
        </div>
        <div class="stream-card-title">${item.title}</div>
        <p class="stream-card-desc">${item.desc}</p>
        <div class="stream-metric-bar">
          <span class="text-cyan">${item.metric}</span>
          <span class="text-muted font-mono">${item.tag}</span>
        </div>
      </div>
    `).join('');
  }

  bindEvents() {
    // Filter click
    const filterBtns = this.container.querySelectorAll('[data-filter]');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeFilter = e.currentTarget.dataset.filter;
        filterBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const list = this.container.querySelector('#stream-cards-list');
        if (list) {
          list.innerHTML = this.renderCards(geminiLiveEngine.getLiveCityData().sensingData);
        }
      });
    });

    // Inject Report Button
    const injectBtn = this.container.querySelector('#inject-report-btn');
    if (injectBtn) {
      injectBtn.addEventListener('click', () => {
        this.injectMockReport();
      });
    }
  }

  injectMockReport() {
    const liveCity = geminiLiveEngine.getLiveCityData();
    const newReport = {
      source: "citizen",
      sourceLabel: "Citizen WhatsApp / NMC 155304 SOS",
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }) + " IST",
      title: "URGENT: Stalled Nagpur City Bus near Somalwada",
      desc: "Water level surging near Manish Nagar RUB approach road. Requesting automated electronic barrier closure and pump team.",
      metric: "Live SOS Priority 1",
      tag: "Evacuation Flag"
    };

    liveCity.sensingData.unshift(newReport);
    const list = this.container.querySelector('#stream-cards-list');
    if (list) {
      list.innerHTML = this.renderCards(liveCity.sensingData);
    }

    if (window.soundEngineInstance) {
      window.soundEngineInstance.playAlertChime();
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
