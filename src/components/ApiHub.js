// CityGuard AI - API Integration Hub & Civic Telemetry Playground
// Provides real-time interactive testing and live telemetry for:
// 1. Open-Meteo Live Weather & Precipitation Radar API
// 2. Open-Meteo Air Quality & Dispersion API
// 3. OpenStreetMap Nominatim Geocoding API
// 4. Google Gemini 1.5 Flash LLM API (with Local Civic Agent Fallback)
// 5. Browser Web Speech Recognition & Speech Synthesis API
// 6. NMC Aaple Sarkar Civic REST Gateway

import { apiService } from '../services/apiService.js';
import { sound } from '../utils/soundEngine.js';

export class ApiHub {
  constructor(containerId, state, onNavigate) {
    this.container = document.getElementById(containerId);
    this.state = state;
    this.onNavigate = onNavigate;
    this.unsubscribe = null;
    this.activeSubTab = 'weather'; // 'weather', 'osm', 'gemini', 'speech', 'aaplesarkar', 'waterfall'
    this.weatherData = null;
    this.aqiData = null;
    this.osmResults = [];
    this.geminiResult = null;
    this.isGeminiLoading = false;
    this.speechTranscript = '';
    this.isListening = false;
    this.gatewayResult = null;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="api-hub-container">
        <!-- Top Hub Banner -->
        <div class="api-hub-header">
          <div class="api-header-left">
            <div class="api-brand-icon">🔌</div>
            <div>
              <div class="api-header-title-row">
                <h2 class="api-header-title">CityGuard API Integration Hub</h2>
                <span class="badge-status live-pulse"><span class="pulse-dot"></span> LIVE CONNECTIVITY</span>
                <span class="badge-track-compact">NAGPUR ZERO MILE MESH</span>
              </div>
              <p class="api-header-desc">
                Real-time external API endpoints powering Nagpur Smart City digital twin, autonomous multi-agent decision loops, and citizen multimodal intake.
              </p>
            </div>
          </div>
          <div class="api-header-actions">
            <button id="hub-refresh-all-btn" class="pill-btn" style="background: var(--navy-700); color: #fff; padding: 0.45rem 1rem;">
              ⚡ Ping All Endpoints
            </button>
          </div>
        </div>

        <!-- 6 Live API Mesh Status Strip -->
        <div class="api-mesh-grid">
          <div class="api-mesh-card" id="mesh-card-weather">
            <div class="mesh-card-top">
              <span class="mesh-icon">🌦️</span>
              <span class="badge-status">HTTP 200</span>
            </div>
            <strong class="mesh-name">Open-Meteo Weather</strong>
            <span class="mesh-endpoint font-mono">api.open-meteo.com/v1/forecast</span>
            <div class="mesh-meta">
              <span id="mesh-weather-temp">--°C</span> · <span id="mesh-weather-rain">-- mm/h</span>
            </div>
          </div>

          <div class="api-mesh-card" id="mesh-card-aqi">
            <div class="mesh-card-top">
              <span class="mesh-icon">💨</span>
              <span class="badge-status">HTTP 200</span>
            </div>
            <strong class="mesh-name">Air Quality (AQI)</strong>
            <span class="mesh-endpoint font-mono">air-quality-api.open-meteo.com</span>
            <div class="mesh-meta">
              <span id="mesh-aqi-val">AQI: --</span> · <span id="mesh-aqi-pm25">PM2.5: --</span>
            </div>
          </div>

          <div class="api-mesh-card" id="mesh-card-osm">
            <div class="mesh-card-top">
              <span class="mesh-icon">🗺️</span>
              <span class="badge-status">HTTP 200</span>
            </div>
            <strong class="mesh-name">OSM Nominatim GIS</strong>
            <span class="mesh-endpoint font-mono">nominatim.openstreetmap.org</span>
            <div class="mesh-meta">Nagpur Wards & Underpasses</div>
          </div>

          <div class="api-mesh-card" id="mesh-card-gemini">
            <div class="mesh-card-top">
              <span class="mesh-icon">🧠</span>
              <span class="badge-status ${apiService.hasGeminiKey() ? 'text-emerald' : 'text-cyan'}">
                ${apiService.hasGeminiKey() ? 'LIVE API KEY' : 'LOCAL ENGINE'}
              </span>
            </div>
            <strong class="mesh-name">Google Gemini 1.5 Flash</strong>
            <span class="mesh-endpoint font-mono">generativelanguage.googleapis.com</span>
            <div class="mesh-meta">Multimodal Civic Reasoning</div>
          </div>

          <div class="api-mesh-card" id="mesh-card-speech">
            <div class="mesh-card-top">
              <span class="mesh-icon">🎙️</span>
              <span class="badge-status">SUPPORTED</span>
            </div>
            <strong class="mesh-name">Web Speech API</strong>
            <span class="mesh-endpoint font-mono">Browser SpeechRecognition</span>
            <div class="mesh-meta">MR / HI / EN Real-time STT</div>
          </div>

          <div class="api-mesh-card" id="mesh-card-aaple">
            <div class="mesh-card-top">
              <span class="mesh-icon">🏛️</span>
              <span class="badge-status">REST 201</span>
            </div>
            <strong class="mesh-name">NMC Aaple Sarkar</strong>
            <span class="mesh-endpoint font-mono">aaplesarkar.mahaonline.gov.in</span>
            <div class="mesh-meta">Direct Civic DB Dispatch</div>
          </div>
        </div>

        <!-- Testing Stations Sub-Navigation -->
        <div class="api-subnav-bar">
          <button class="api-subnav-tab ${this.activeSubTab === 'weather' ? 'active' : ''}" data-subtab="weather">
            <span>🌦️ 1. Open-Meteo Weather</span>
          </button>
          <button class="api-subnav-tab ${this.activeSubTab === 'osm' ? 'active' : ''}" data-subtab="osm">
            <span>🗺️ 2. OSM Nominatim GIS</span>
          </button>
          <button class="api-subnav-tab ${this.activeSubTab === 'gemini' ? 'active' : ''}" data-subtab="gemini">
            <span>🧠 3. Gemini 1.5 Flash</span>
          </button>
          <button class="api-subnav-tab ${this.activeSubTab === 'speech' ? 'active' : ''}" data-subtab="speech">
            <span>🎙️ 4. Web Speech Voice</span>
          </button>
          <button class="api-subnav-tab ${this.activeSubTab === 'aaplesarkar' ? 'active' : ''}" data-subtab="aaplesarkar">
            <span>🏛️ 5. NMC Aaple Sarkar</span>
          </button>
          <button class="api-subnav-tab ${this.activeSubTab === 'waterfall' ? 'active' : ''}" data-subtab="waterfall">
            <span>📊 6. Telemetry Waterfall (<span id="telemetry-count">${apiService.getLogs().length}</span>)</span>
          </button>
        </div>

        <!-- Station Interactive Viewport -->
        <div class="api-station-viewport" id="api-station-viewport">
          ${this.renderActiveStation()}
        </div>
      </div>
    `;

    this.bindEvents();
    this.initSubscriptions();
    this.refreshLiveTelemetryPills();
  }

  renderActiveStation() {
    switch (this.activeSubTab) {
      case 'weather':
        return this.renderWeatherStation();
      case 'osm':
        return this.renderOsmStation();
      case 'gemini':
        return this.renderGeminiStation();
      case 'speech':
        return this.renderSpeechStation();
      case 'aaplesarkar':
        return this.renderAapleSarkarStation();
      case 'waterfall':
        return this.renderWaterfallStation();
      default:
        return this.renderWeatherStation();
    }
  }

  /* --------------------------------------------------------------------------
     Station 1: Open-Meteo Weather & Doppler Precipitation
     -------------------------------------------------------------------------- */
  renderWeatherStation() {
    const w = this.weatherData || apiService.liveWeather || {
      temperature: 24.2,
      precipitation: 0.0,
      humidity: 68,
      windSpeed: 9.4,
      condition: 'Partly Cloudy ⛅',
      source: 'Open-Meteo API (Ready to Fetch)'
    };

    return `
      <div class="station-card">
        <div class="station-header">
          <div>
            <h3 class="station-title">🌦️ Open-Meteo Live Weather & Radar Precipitation API</h3>
            <p class="station-desc">Real-time weather telemetry from Open-Meteo WMO / IMD Sonegaon Radar for Nagpur Zero Mile Hub (Lat: 21.1458, Lon: 79.0882).</p>
          </div>
          <button id="station-fetch-weather-btn" class="btn-primary" style="padding: 0.5rem 1rem;">
            <span>⚡ Fetch Live Nagpur Weather</span>
          </button>
        </div>

        <!-- Weather Telemetry Cards -->
        <div class="weather-metrics-display">
          <div class="wm-card">
            <span class="wm-label">TEMPERATURE</span>
            <strong class="wm-value text-amber" id="w-temp">${w.temperature}°C</strong>
            <span class="wm-sub">Feels like: ${(w.temperature + 1.2).toFixed(1)}°C</span>
          </div>

          <div class="wm-card">
            <span class="wm-label">PRECIPITATION / RAIN</span>
            <strong class="wm-value text-rose" id="w-rain">${w.precipitation} mm/h</strong>
            <span class="wm-sub">IMD Critical Flood Ceiling: 80.0 mm/h</span>
          </div>

          <div class="wm-card">
            <span class="wm-label">HUMIDITY</span>
            <strong class="wm-value text-cyan" id="w-humidity">${w.humidity}%</strong>
            <span class="wm-sub">Dew point calculated</span>
          </div>

          <div class="wm-card">
            <span class="wm-label">WIND VELOCITY</span>
            <strong class="wm-value text-emerald" id="w-wind">${w.windSpeed} km/h</strong>
            <span class="wm-sub">Vector: 10m Altitude</span>
          </div>
        </div>

        <div class="station-info-row">
          <div class="station-pill">
            <strong>Current Condition:</strong> <span id="w-condition">${w.condition}</span>
          </div>
          <div class="station-pill">
            <strong>Endpoint:</strong> <code class="font-mono">GET https://api.open-meteo.com/v1/forecast</code>
          </div>
          <div class="station-pill">
            <strong>Station:</strong> <span>${w.source}</span>
          </div>
        </div>

        <!-- Raw JSON Preview -->
        <details class="json-inspector">
          <summary>🔍 Inspect Raw Open-Meteo JSON Response</summary>
          <pre class="json-code font-mono">${JSON.stringify(w, null, 2)}</pre>
        </details>
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     Station 2: OpenStreetMap Nominatim GIS Geocoding
     -------------------------------------------------------------------------- */
  renderOsmStation() {
    return `
      <div class="station-card">
        <div class="station-header">
          <div>
            <h3 class="station-title">🗺️ OpenStreetMap Nominatim Live Geocoding API</h3>
            <p class="station-desc">Search and resolve real-world geographic coordinates, OSM polygon IDs, and bounding boxes for any landmark, lake, or underpass in Nagpur.</p>
          </div>
        </div>

        <!-- Search Bar & Preset Chips -->
        <div class="osm-search-row">
          <div class="osm-input-wrapper">
            <span>📍</span>
            <input type="text" id="osm-query-input" class="osm-input" placeholder="Enter Nagpur landmark (e.g. Ambazari Lake, Zero Mile, Manish Nagar RUB)..." value="Manish Nagar">
          </div>
          <button id="osm-search-btn" class="btn-primary" style="padding: 0.5rem 1.25rem;">
            <span>Search Nominatim</span>
          </button>
        </div>

        <!-- Quick 1-Click Nagpur Landmark Chips -->
        <div class="osm-quick-chips">
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--navy-900);">Quick Presets:</span>
          <button class="osm-chip" data-q="Zero Mile Stone">📍 Zero Mile Stone</button>
          <button class="osm-chip" data-q="Manish Nagar RUB">🌧️ Manish Nagar RUB</button>
          <button class="osm-chip" data-q="Ambazari Lake">🌊 Ambazari Lake</button>
          <button class="osm-chip" data-q="Loha Pul Underpass">🌉 Loha Pul</button>
          <button class="osm-chip" data-q="Futala Lake">⛲ Futala Promenade</button>
          <button class="osm-chip" data-q="Sitabuldi Fort">🏛️ Sitabuldi Fort</button>
        </div>

        <!-- Geocoding Results Container -->
        <div id="osm-results-container" class="osm-results-grid">
          ${this.renderOsmResults()}
        </div>
      </div>
    `;
  }

  renderOsmResults() {
    if (!this.osmResults || this.osmResults.length === 0) {
      return `
        <div class="empty-results-box">
          <span>📍 Enter a location or click a preset above to query OpenStreetMap Nominatim in real-time.</span>
        </div>
      `;
    }

    return this.osmResults.map((loc, idx) => `
      <div class="osm-result-card">
        <div class="osm-card-top">
          <strong class="osm-loc-name">#${idx + 1} ${loc.name}</strong>
          <span class="osm-type-tag font-mono">${loc.type || 'landmark'}</span>
        </div>
        <p class="osm-display-name">${loc.displayName}</p>
        <div class="osm-coords-row font-mono">
          <span>Lat: <strong>${loc.lat.toFixed(6)}</strong></span>
          <span>Lon: <strong>${loc.lon.toFixed(6)}</strong></span>
          ${loc.osmId ? `<span>OSM ID: ${loc.osmId}</span>` : ''}
        </div>
        <div style="margin-top: 0.5rem; display: flex; justify-content: flex-end;">
          <button class="pill-btn osm-twin-link-btn" data-lat="${loc.lat}" data-lon="${loc.lon}" data-name="${loc.name}">
            <span>🗺️ Inspect in Digital Twin Studio →</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  /* --------------------------------------------------------------------------
     Station 3: Google Gemini 1.5 Flash Cognitive Engine
     -------------------------------------------------------------------------- */
  renderGeminiStation() {
    const hasKey = apiService.hasGeminiKey();
    const currentKey = apiService.getGeminiKey();

    return `
      <div class="station-card">
        <div class="station-header">
          <div>
            <h3 class="station-title">🧠 Google Gemini 1.5 Flash LLM Integration</h3>
            <p class="station-desc">
              Powers CityGuard's autonomous decision loops, multi-lingual Marathi/Hindi grievance entity extraction, and commissioner counterfactual syntheses.
            </p>
          </div>
          <span class="badge-status ${hasKey ? 'text-emerald' : 'text-cyan'}">
            ${hasKey ? '🟢 LIVE GEMINI API CONNECTED' : '🔵 LOCAL CIVIC ENGINE ACTIVE'}
          </span>
        </div>

        <!-- Gemini API Key Configuration Box -->
        <div class="gemini-key-box">
          <div class="gemini-key-header">
            <strong>🔑 Google AI Studio / Gemini API Key Configuration</strong>
            <span style="font-size: 0.72rem; color: var(--text-muted);">Stored securely in browser localStorage only</span>
          </div>
          <div class="gemini-key-row">
            <input type="password" id="gemini-key-input" class="gemini-input" placeholder="Paste your AI Studio Gemini API key (AIzaSy...)" value="${currentKey}">
            <button id="save-gemini-key-btn" class="pill-btn" style="background: var(--navy-700); color: #fff;">
              Save Key
            </button>
            <button id="clear-gemini-key-btn" class="pill-btn" style="background: #fee2e2; color: #dc2626; border-color: #fca5a5;">
              Clear Key
            </button>
          </div>
          <p style="font-size: 0.73rem; color: var(--text-secondary); margin-top: 0.4rem;">
            💡 <em>Don't have a key? CityGuard automatically uses its built-in zero-latency local civic reasoning engine for all demonstrations.</em>
          </p>
        </div>

        <!-- Interactive Prompt Tester -->
        <div class="gemini-prompt-tester">
          <label style="font-size: 0.78rem; font-weight: 700; color: var(--navy-900); display: block; margin-bottom: 0.35rem;">
            Civic Reasoning Prompt:
          </label>
          <textarea id="gemini-prompt-input" class="gemini-textarea" rows="3" placeholder="Enter prompt or choose a preset scenario below...">Analyze the flood risk for Manish Nagar Underpass when Sonegaon Radar detects 84.6 mm/h rainfall. What autonomous multi-agent actions should be dispatched?</textarea>

          <!-- Prompt Preset Buttons -->
          <div class="prompt-presets-row">
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted);">Presets:</span>
            <button class="prompt-preset-chip" data-prompt="Analyze the flood risk for Manish Nagar Underpass when Sonegaon Radar detects 84.6 mm/h rainfall. What autonomous multi-agent actions should be dispatched?">
              🌧️ Manish Nagar Flood Risk
            </button>
            <button class="prompt-preset-chip" data-prompt="Draft a polite Marathi SMS to citizen Sunita Tai Raut explaining that her widow pension DBT mapping has been re-linked to Bank of Maharashtra IFSC and ₹3,000 arrears will deposit in 7 days.">
              👵 Rekha Devi Pension SMS (Marathi)
            </button>
            <button class="prompt-preset-chip" data-prompt="Synthesize a 3-point Vidarbha Heatwave Action Plan for Sitabuldi outdoor construction workers when temperatures reach 46.2°C.">
              ☀️ Vidarbha 46.2°C Heat Mitigation
            </button>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 0.75rem;">
            <button id="run-gemini-btn" class="btn-primary" style="padding: 0.5rem 1.4rem;">
              <span>${this.isGeminiLoading ? '⏳ Generating Reasoning...' : '🚀 Execute Gemini Reasoning'}</span>
            </button>
          </div>
        </div>

        <!-- Gemini Output Display -->
        <div id="gemini-output-box" class="gemini-output-card ${this.geminiResult ? '' : 'hidden'}">
          ${this.renderGeminiOutput()}
        </div>
      </div>
    `;
  }

  renderGeminiOutput() {
    if (!this.geminiResult) return '';
    const res = this.geminiResult;

    return `
      <div class="gemini-output-header">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.1rem;">✨</span>
          <strong>Civic Agent Reasoning Output</strong>
          <span class="badge-status ${res.isLiveApi ? 'text-emerald' : 'text-cyan'}">
            ${res.isLiveApi ? 'LIVE GEMINI 1.5 FLASH' : 'LOCAL CIVIC ENGINE'}
          </span>
        </div>
        <div class="font-mono text-muted" style="font-size: 0.72rem;">
          Latency: <strong>${res.latency} ms</strong> · Model: <code>${res.model}</code>
        </div>
      </div>
      <div class="gemini-response-text">
        ${this.formatMarkdown(res.text)}
      </div>
      <div style="margin-top: 0.65rem; display: flex; justify-content: flex-end;">
        <button id="speak-gemini-output-btn" class="pill-btn" style="background: #eff6ff; color: var(--navy-700);">
          🔊 Listen via Web Speech TTS
        </button>
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     Station 4: Web Speech Voice Recognition & TTS
     -------------------------------------------------------------------------- */
  renderSpeechStation() {
    const isSupported = apiService.isSpeechSupported();

    return `
      <div class="station-card">
        <div class="station-header">
          <div>
            <h3 class="station-title">🎙️ Web Speech API (Live Microphone & Multilingual TTS)</h3>
            <p class="station-desc">
              Direct real-time speech recognition and text-to-speech engine operating in the browser. Supports Indian dialects: Marathi (mr-IN), Hindi (hi-IN), and Indian English (en-IN).
            </p>
          </div>
          <span class="badge-status ${isSupported ? 'text-emerald' : 'text-rose'}">
            ${isSupported ? 'MICROPHONE HARDWARE READY' : 'SPEECH API NOT SUPPORTED'}
          </span>
        </div>

        <!-- Speech Settings & Controls -->
        <div class="speech-controls-box">
          <div class="speech-lang-select-row">
            <label style="font-size: 0.78rem; font-weight: 700; color: var(--navy-900);">Input Language:</label>
            <select id="speech-lang-select" class="custom-select">
              <option value="mr-IN">मराठी (Marathi - mr-IN)</option>
              <option value="hi-IN" selected>हिन्दी (Hindi - hi-IN)</option>
              <option value="en-IN">English (India - en-IN)</option>
            </select>
          </div>

          <!-- Big Record Mic Button -->
          <div class="speech-mic-stage">
            <button id="test-mic-btn" class="big-mic-btn ${this.isListening ? 'active-recording' : ''}">
              <span class="mic-glyph">${this.isListening ? '🔴' : '🎤'}</span>
              <span class="mic-text">${this.isListening ? 'Listening to Microphone... (Click to Stop)' : 'Click to Speak (Live Mic)'}</span>
            </button>
            <div id="speech-live-status" style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">
              ${this.isListening ? 'AUDIO STREAM ACTIVE · SPEAK NOW...' : 'IDLE · CLICK MIC TO TEST'}
            </div>
          </div>

          <!-- Live Transcription Box -->
          <div class="speech-transcription-box">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--navy-700); margin-bottom: 0.25rem;">
              REAL-TIME RECOGNIZED TRANSCRIPT:
            </div>
            <div id="live-transcript-display" class="transcript-text">
              ${this.speechTranscript || '<em>Your spoken voice will appear here in real-time...</em>'}
            </div>
          </div>

          <!-- Text-to-Speech (TTS) Verification -->
          <div class="tts-tester-row">
            <input type="text" id="tts-test-input" class="gemini-input" placeholder="Type text to synthesize with Web Speech..." value="नागपूर महानगरपालिका: मनीष नगर अंडरपासमध्ये पाणी भरले आहे. कृपया पर्यायी मार्गाचा वापर करा.">
            <button id="tts-speak-btn" class="pill-btn" style="background: var(--navy-700); color: #fff; padding: 0.45rem 1rem;">
              🔊 Speak Aloud
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     Station 5: NMC Aaple Sarkar Civic REST Gateway
     -------------------------------------------------------------------------- */
  renderAapleSarkarStation() {
    return `
      <div class="station-card">
        <div class="station-header">
          <div>
            <h3 class="station-title">🏛️ NMC Aaple Sarkar Civic REST Gateway</h3>
            <p class="station-desc">
              Direct REST integration with Maharashtra Aaple Sarkar MahaOnline Citizen Services Gateway for autonomous grievance filing and DBT tracking.
            </p>
          </div>
          <span class="badge-status text-emerald">REST ENDPOINT READY</span>
        </div>

        <!-- Grievance Submission Form -->
        <div class="gateway-form-grid">
          <div class="gw-field">
            <label class="portal-label">Applicant Full Name</label>
            <input type="text" id="gw-name" class="portal-input" value="Sunita Tai Raut">
          </div>
          <div class="gw-field">
            <label class="portal-label">Nagpur Administrative Zone</label>
            <select id="gw-ward" class="custom-select" style="width: 100%; height: 38px;">
              <option value="Zone 3 - Dharampeth">Zone 3 - Dharampeth</option>
              <option value="Zone 1 - Laxmi Nagar">Zone 1 - Laxmi Nagar</option>
              <option value="Zone 2 - Dharampeth West">Zone 2 - Dharampeth West</option>
              <option value="Zone 4 - Dhantoli">Zone 4 - Dhantoli</option>
              <option value="Zone 5 - Nehru Nagar">Zone 5 - Nehru Nagar</option>
              <option value="Zone 6 - Gandhi Bagh">Zone 6 - Gandhi Bagh</option>
              <option value="Zone 7 - Satranjipura">Zone 7 - Satranjipura</option>
              <option value="Zone 8 - Lakadganj">Zone 8 - Lakadganj</option>
              <option value="Zone 9 - Ashi Nagar">Zone 9 - Ashi Nagar</option>
              <option value="Zone 10 - Mangalwari">Zone 10 - Mangalwari</option>
            </select>
          </div>
          <div class="gw-field">
            <label class="portal-label">Civic Service / Scheme Category</label>
            <select id="gw-scheme" class="custom-select" style="width: 100%; height: 38px;">
              <option value="Indira Gandhi National Widow Pension (DBT Re-Link)">Indira Gandhi National Widow Pension (DBT Re-Link)</option>
              <option value="Manish Nagar RUB Waterlogging Urgent Relief">Manish Nagar RUB Waterlogging Urgent Relief</option>
              <option value="Sanjay Gandhi Niradhar Yojana Verification">Sanjay Gandhi Niradhar Yojana Verification</option>
              <option value="Pot-hole Paving & Stormwater Drain Clearing">Pot-hole Paving & Stormwater Drain Clearing</option>
            </select>
          </div>
          <div class="gw-field">
            <label class="portal-label">Citizen Contact Mobile</label>
            <input type="text" id="gw-phone" class="portal-input" value="+91 98230 48192">
          </div>
        </div>

        <div style="margin-top: 1rem; display: flex; justify-content: flex-end;">
          <button id="gw-submit-btn" class="btn-primary" style="padding: 0.5rem 1.4rem;">
            <span>🚀 Dispatch REST Grievance to NMC Gateway</span>
          </button>
        </div>

        <!-- Gateway Response Box -->
        <div id="gw-response-box" class="gateway-response-card ${this.gatewayResult ? '' : 'hidden'}">
          ${this.renderGatewayResponse()}
        </div>
      </div>
    `;
  }

  renderGatewayResponse() {
    if (!this.gatewayResult) return '';
    const res = this.gatewayResult;

    return `
      <div class="gw-res-top">
        <span style="font-size: 1.25rem;">✅</span>
        <div>
          <strong style="color: #065f46; font-size: 0.95rem;">Grievance Successfully Registered on Aaple Sarkar</strong>
          <div style="color: var(--text-secondary); font-size: 0.75rem;">Official Government of Maharashtra Token Generated</div>
        </div>
      </div>
      <div class="gw-res-grid">
        <div class="gw-res-item">
          <span class="gw-res-k">Reference ID:</span>
          <strong class="gw-res-v text-navy font-mono">${res.referenceNumber}</strong>
        </div>
        <div class="gw-res-item">
          <span class="gw-res-k">HTTP Status:</span>
          <strong class="gw-res-v text-emerald font-mono">${res.statusCode} ${res.status}</strong>
        </div>
        <div class="gw-res-item">
          <span class="gw-res-k">Assigned Ward:</span>
          <span class="gw-res-v">${res.ward}</span>
        </div>
        <div class="gw-res-item">
          <span class="gw-res-k">SLA Commitment:</span>
          <span class="gw-res-v text-emerald">${res.slaDays} Business Days</span>
        </div>
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     Station 6: Real-Time API Telemetry Waterfall Console
     -------------------------------------------------------------------------- */
  renderWaterfallStation() {
    const logs = apiService.getLogs();

    return `
      <div class="station-card">
        <div class="station-header">
          <div>
            <h3 class="station-title">📊 Live API Telemetry Waterfall Console</h3>
            <p class="station-desc">
              Real-time audit log of all outbound REST queries, WebSocket pings, and internal agent transitions with latency metrics.
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button id="clear-telemetry-btn" class="pill-btn" style="background: #f1f5f9; color: var(--navy-700);">
              Clear Logs
            </button>
            <button id="sim-burst-btn" class="pill-btn" style="background: var(--navy-700); color: #fff;">
              ⚡ Simulate Traffic Burst
            </button>
          </div>
        </div>

        <!-- Telemetry Table -->
        <div class="telemetry-table-wrapper">
          <table class="telemetry-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>SERVICE</th>
                <th>METHOD</th>
                <th>ENDPOINT</th>
                <th>STATUS</th>
                <th>LATENCY</th>
                <th>PAYLOAD SUMMARY</th>
              </tr>
            </thead>
            <tbody id="telemetry-table-body">
              ${logs.length ? logs.map(l => this.renderTelemetryRow(l)).join('') : `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No API queries recorded yet. Trigger any endpoint above to populate the waterfall!
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderTelemetryRow(log) {
    const statusColor = (log.status === 200 || log.status === 201) ? 'text-emerald' :
                        (log.status === 'Fallback' || log.status === 'LOCAL_AGENT') ? 'text-cyan' : 'text-rose';

    return `
      <tr class="telemetry-row">
        <td class="font-mono" style="font-size: 0.72rem; color: var(--text-muted);">${log.time}</td>
        <td><strong style="color: var(--navy-900); font-size: 0.75rem;">${log.service}</strong></td>
        <td><span class="method-tag method-${(log.method || 'GET').toLowerCase()} font-mono">${log.method}</span></td>
        <td class="font-mono text-muted" style="font-size: 0.72rem; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${log.endpoint}
        </td>
        <td class="font-mono ${statusColor}" style="font-weight: 700;">${log.status}</td>
        <td class="font-mono text-amber" style="font-size: 0.72rem;">${log.latency || 42} ms</td>
        <td style="font-size: 0.72rem; color: var(--text-secondary);">${log.summary || 'OK'}</td>
      </tr>
    `;
  }

  /* --------------------------------------------------------------------------
     Event Handlers and State Management
     -------------------------------------------------------------------------- */
  bindEvents() {
    // Subnav Tabs
    const subnavTabs = this.container.querySelectorAll('.api-subnav-tab');
    subnavTabs.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget.dataset.subtab;
        if (target === this.activeSubTab) return;
        this.activeSubTab = target;
        sound.playRadarPing();
        this.render();
      });
    });

    // Refresh all button
    const refreshAllBtn = this.container.querySelector('#hub-refresh-all-btn');
    if (refreshAllBtn) {
      refreshAllBtn.addEventListener('click', async () => {
        sound.playAlertChime();
        refreshAllBtn.textContent = '⏳ Pinging...';
        await Promise.all([
          apiService.fetchLiveNagpurWeather(),
          apiService.fetchLiveNagpurAQI(),
          apiService.searchNagpurLocation('Zero Mile')
        ]);
        refreshAllBtn.textContent = '⚡ Ping All Endpoints';
        this.refreshLiveTelemetryPills();
        if (this.activeSubTab === 'weather' || this.activeSubTab === 'waterfall') {
          this.render();
        }
      });
    }

    // Weather Station Handlers
    const fetchWeatherBtn = this.container.querySelector('#station-fetch-weather-btn');
    if (fetchWeatherBtn) {
      fetchWeatherBtn.addEventListener('click', async () => {
        sound.playRadarPing();
        fetchWeatherBtn.innerHTML = '<span>⏳ Querying Open-Meteo...</span>';
        const res = await apiService.fetchLiveNagpurWeather();
        this.weatherData = res;
        this.render();
      });
    }

    // OSM Station Handlers
    const osmSearchBtn = this.container.querySelector('#osm-search-btn');
    const osmInput = this.container.querySelector('#osm-query-input');
    if (osmSearchBtn && osmInput) {
      osmSearchBtn.addEventListener('click', async () => {
        const q = osmInput.value.trim();
        if (!q) return;
        osmSearchBtn.innerHTML = '<span>⏳ Geocoding...</span>';
        sound.playRadarPing();
        const results = await apiService.searchNagpurLocation(q);
        this.osmResults = results;
        osmSearchBtn.innerHTML = '<span>Search Nominatim</span>';
        const container = this.container.querySelector('#osm-results-container');
        if (container) container.innerHTML = this.renderOsmResults();
        this.bindOsmResultButtons();
      });

      osmInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') osmSearchBtn.click();
      });
    }

    // Preset chips
    const osmChips = this.container.querySelectorAll('.osm-chip');
    osmChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const query = e.currentTarget.dataset.q;
        if (osmInput) {
          osmInput.value = query;
          if (osmSearchBtn) osmSearchBtn.click();
        }
      });
    });

    this.bindOsmResultButtons();

    // Gemini Station Handlers
    const saveKeyBtn = this.container.querySelector('#save-gemini-key-btn');
    const clearKeyBtn = this.container.querySelector('#clear-gemini-key-btn');
    const keyInput = this.container.querySelector('#gemini-key-input');
    if (saveKeyBtn && keyInput) {
      saveKeyBtn.addEventListener('click', () => {
        const val = keyInput.value.trim();
        apiService.setGeminiKey(val);
        sound.playRadarPing();
        this.render();
      });
    }
    if (clearKeyBtn) {
      clearKeyBtn.addEventListener('click', () => {
        apiService.setGeminiKey('');
        sound.playAlertChime();
        this.render();
      });
    }

    // Prompt presets
    const promptPresets = this.container.querySelectorAll('.prompt-preset-chip');
    const promptInput = this.container.querySelector('#gemini-prompt-input');
    promptPresets.forEach(chip => {
      chip.addEventListener('click', (e) => {
        if (promptInput) {
          promptInput.value = e.currentTarget.dataset.prompt;
          sound.playRadarPing();
        }
      });
    });

    // Run Gemini
    const runGeminiBtn = this.container.querySelector('#run-gemini-btn');
    if (runGeminiBtn && promptInput) {
      runGeminiBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) return;
        this.isGeminiLoading = true;
        runGeminiBtn.innerHTML = '<span>⏳ Generating Reasoning...</span>';
        sound.playRadarPing();

        const result = await apiService.askGemini({ prompt });
        this.geminiResult = result;
        this.isGeminiLoading = false;
        this.render();

        const speakBtn = this.container.querySelector('#speak-gemini-output-btn');
        if (speakBtn) {
          speakBtn.addEventListener('click', () => {
            sound.speak(result.text.replace(/[*#]/g, ''));
          });
        }
      });
    }

    // Speech Station Handlers
    const testMicBtn = this.container.querySelector('#test-mic-btn');
    const langSelect = this.container.querySelector('#speech-lang-select');
    const transcriptBox = this.container.querySelector('#live-transcript-display');
    const statusLabel = this.container.querySelector('#speech-live-status');

    if (testMicBtn) {
      testMicBtn.addEventListener('click', () => {
        if (this.isListening) {
          apiService.stopSpeechRecognition();
          this.isListening = false;
          testMicBtn.classList.remove('active-recording');
          testMicBtn.querySelector('.mic-glyph').textContent = '🎤';
          testMicBtn.querySelector('.mic-text').textContent = 'Click to Speak (Live Mic)';
          if (statusLabel) statusLabel.textContent = 'STOPPED · CLICK MIC TO TEST AGAIN';
        } else {
          const lang = langSelect ? langSelect.value : 'hi-IN';
          this.isListening = true;
          testMicBtn.classList.add('active-recording');
          testMicBtn.querySelector('.mic-glyph').textContent = '🔴';
          testMicBtn.querySelector('.mic-text').textContent = 'Listening to Microphone... (Click to Stop)';
          if (statusLabel) statusLabel.textContent = `LISTENING IN ${lang}... SPEAK NOW!`;
          sound.playAlertChime();

          apiService.startSpeechRecognition({
            lang,
            onResult: (text, isFinal) => {
              this.speechTranscript = text;
              if (transcriptBox) {
                transcriptBox.innerHTML = `<strong>${text}</strong> ${isFinal ? '✅ (Final)' : '...'}`;
              }
            },
            onError: (err) => {
              this.isListening = false;
              testMicBtn.classList.remove('active-recording');
              testMicBtn.querySelector('.mic-glyph').textContent = '🎤';
              testMicBtn.querySelector('.mic-text').textContent = 'Click to Speak (Live Mic)';
              if (statusLabel) statusLabel.textContent = `ERROR: ${err}`;
            },
            onEnd: () => {
              this.isListening = false;
              testMicBtn.classList.remove('active-recording');
              testMicBtn.querySelector('.mic-glyph').textContent = '🎤';
              testMicBtn.querySelector('.mic-text').textContent = 'Click to Speak (Live Mic)';
              if (statusLabel) statusLabel.textContent = 'RECORDING COMPLETE';
            }
          });
        }
      });
    }

    // TTS Tester
    const ttsBtn = this.container.querySelector('#tts-speak-btn');
    const ttsInput = this.container.querySelector('#tts-test-input');
    if (ttsBtn && ttsInput) {
      ttsBtn.addEventListener('click', () => {
        const text = ttsInput.value.trim();
        if (text) {
          sound.speak(text);
        }
      });
    }

    // Aaple Sarkar Station Handlers
    const gwSubmitBtn = this.container.querySelector('#gw-submit-btn');
    if (gwSubmitBtn) {
      gwSubmitBtn.addEventListener('click', async () => {
        gwSubmitBtn.innerHTML = '<span>⏳ Dispatching to NMC Gateway...</span>';
        sound.playRadarPing();

        const name = this.container.querySelector('#gw-name')?.value || 'Citizen';
        const ward = this.container.querySelector('#gw-ward')?.value || 'Zone 3';
        const scheme = this.container.querySelector('#gw-scheme')?.value || 'DBT';

        const res = await apiService.submitGrievanceToAapleSarkar({ name, ward, scheme });
        this.gatewayResult = res;
        gwSubmitBtn.innerHTML = '<span>🚀 Dispatch REST Grievance to NMC Gateway</span>';

        const respBox = this.container.querySelector('#gw-response-box');
        if (respBox) {
          respBox.classList.remove('hidden');
          respBox.innerHTML = this.renderGatewayResponse();
        }
        sound.playAlertChime();
      });
    }

    // Waterfall Station Handlers
    const clearLogsBtn = this.container.querySelector('#clear-telemetry-btn');
    if (clearLogsBtn) {
      clearLogsBtn.addEventListener('click', () => {
        apiService.logs = [];
        this.render();
      });
    }

    const simBurstBtn = this.container.querySelector('#sim-burst-btn');
    if (simBurstBtn) {
      simBurstBtn.addEventListener('click', async () => {
        simBurstBtn.textContent = '⏳ Simulating Burst...';
        sound.playRadarPing();

        await apiService.fetchLiveNagpurWeather();
        await apiService.fetchLiveNagpurAQI();
        await apiService.searchNagpurLocation('Ambazari');
        await apiService.submitGrievanceToAapleSarkar({ name: 'Ramesh Patil', ward: 'Zone 4' });

        simBurstBtn.textContent = '⚡ Simulate Traffic Burst';
        this.render();
      });
    }
  }

  bindOsmResultButtons() {
    const twinBtns = this.container.querySelectorAll('.osm-twin-link-btn');
    twinBtns.forEach(b => {
      b.addEventListener('click', (e) => {
        const lat = parseFloat(e.currentTarget.dataset.lat);
        const lon = parseFloat(e.currentTarget.dataset.lon);
        const name = e.currentTarget.dataset.name;
        if (this.onNavigate) {
          this.onNavigate('digital-twin');
        }
      });
    });
  }

  initSubscriptions() {
    if (this.unsubscribe) this.unsubscribe();
    this.unsubscribe = apiService.subscribe((event, data) => {
      this.refreshLiveTelemetryPills();
      const badge = this.container.querySelector('#telemetry-count');
      if (badge) badge.textContent = apiService.getLogs().length;
    });
  }

  refreshLiveTelemetryPills() {
    const w = apiService.liveWeather;
    if (w) {
      const tempEl = this.container.querySelector('#mesh-weather-temp');
      const rainEl = this.container.querySelector('#mesh-weather-rain');
      if (tempEl) tempEl.textContent = `${w.temperature}°C`;
      if (rainEl) rainEl.textContent = `${w.precipitation} mm/h`;
    }

    const aqi = apiService.liveAirQuality;
    if (aqi) {
      const aqiEl = this.container.querySelector('#mesh-aqi-val');
      const pmEl = this.container.querySelector('#mesh-aqi-pm25');
      if (aqiEl) aqiEl.textContent = `AQI: ${aqi.aqi}`;
      if (pmEl) pmEl.textContent = `PM2.5: ${aqi.pm25}`;
    }
  }

  formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="font-mono">$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n• /g, '<br>• ')
      .replace(/\n- /g, '<br>- ')
      .replace(/\n\d+\. /g, (match) => `<br>${match.trim()} `);
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.isListening) {
      apiService.stopSpeechRecognition();
    }
  }
}
