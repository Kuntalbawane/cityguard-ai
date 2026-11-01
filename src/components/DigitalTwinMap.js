// CityGuard AI - Interactive Digital Twin Map Component (Gemini AI Live Engine)

import { geminiLiveEngine } from '../services/geminiLiveEngine.js';

export class DigitalTwinMap {
  constructor(containerId, state) {
    this.container = document.getElementById(containerId);
    this.state = state;
    this.activeLayers = {
      radar: true,
      underpasses: true,
      pumps: true,
      sos: true,
      traffic: true
    };
    this.selectedUnderpass = null;
    this.radarAngle = 0;
    this.animationId = null;
    this.unsubscribe = null;
  }

  render() {
    const liveCityData = geminiLiveEngine.getLiveCityData();
    const city = liveCityData.city || this.state.currentCity;

    this.container.innerHTML = `
      <div class="digital-twin-stage">
        <div class="map-viewport-wrapper" id="map-viewport">
          <!-- Top HUD Badges -->
          <div class="map-hud-overlay">
            <div class="map-hud-badge">
              <span class="pulse-dot"></span>
              <span>NAGPUR DIGITAL TWIN GIS · ZERO MILE HUB</span>
            </div>
            <div class="map-hud-badge">
              <span class="text-cyan">🛰️ RADAR:</span>
              <span>IMD Sonegaon Doppler (S-Band 2.8GHz)</span>
            </div>
          </div>

          <!-- Layer Toggle Bar (Spacious, Never Clipped, High Contrast) -->
          <div class="map-layers-control" id="map-layers-control">
            <button class="layer-toggle-btn ${this.activeLayers.radar ? 'active' : ''}" data-layer="radar" title="Toggle IMD Doppler Precipitation Radar">
              <span>🌦️ Doppler Radar</span>
              <span class="pulse-dot" style="width: 5px; height: 5px;"></span>
            </button>
            <button class="layer-toggle-btn ${this.activeLayers.underpasses ? 'active' : ''}" data-layer="underpasses" title="Toggle Railway Underpasses & Subways">
              <span>🛑 Underpasses</span>
            </button>
            <button class="layer-toggle-btn ${this.activeLayers.pumps ? 'active' : ''}" data-layer="pumps" title="Toggle Sluice Gates & Dewatering Pumps">
              <span>💧 Sluice & Pumps</span>
            </button>
            <button class="layer-toggle-btn ${this.activeLayers.sos ? 'active' : ''}" data-layer="sos" title="Toggle Citizen SOS Hotspots">
              <span>📱 Citizen SOS</span>
            </button>
            <button class="layer-toggle-btn ${this.activeLayers.traffic ? 'active' : ''}" data-layer="traffic" title="Toggle Metro & Arterial Corridors">
              <span>🚦 Corridors</span>
            </button>
          </div>

          <!-- Interactive SVG Map Canvas -->
          <svg id="city-map-canvas" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            <defs>
              <!-- Grid background pattern -->
              <pattern id="grid-pattern" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(56, 189, 248, 0.06)" stroke-width="1"/>
              </pattern>

              <!-- Doppler Radar Multi-Band Reflectivity Gradients (High Contrast) -->
              <radialGradient id="doppler-core-cloudburst" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ec4899" stop-opacity="0.95"/>
                <stop offset="30%" stop-color="#ef4444" stop-opacity="0.85"/>
                <stop offset="60%" stop-color="#f97316" stop-opacity="0.65"/>
                <stop offset="85%" stop-color="#eab308" stop-opacity="0.45"/>
                <stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
              </radialGradient>

              <radialGradient id="doppler-moderate-band" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.75"/>
                <stop offset="50%" stop-color="#eab308" stop-opacity="0.5"/>
                <stop offset="80%" stop-color="#10b981" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
              </radialGradient>

              <!-- Water glow filter -->
              <filter id="water-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <!-- Background Grid & Topo Tint -->
            <rect width="800" height="500" fill="#060b17" />
            <rect width="800" height="500" fill="url(#grid-pattern)" />

            <!-- Nagpur Wards Polygons -->
            <g id="map-wards-layer">
              ${this.renderNagpurWardsSvg()}
            </g>

            <!-- Water Bodies (Ambazari Lake, Futala Lake, Nag River) -->
            <g id="map-waterways-layer">
              ${this.renderNagpurWaterwaysSvg()}
            </g>

            <!-- Major Nagpur Arterial Roads & Metro Corridors -->
            <g id="map-roads-layer">
              ${this.renderNagpurRoadsSvg()}
            </g>

            <!-- Live Doppler Weather Radar Layer (Crystal Clear, High Contrast) -->
            <g id="map-radar-layer" style="display: ${this.activeLayers.radar ? 'block' : 'none'}">
              <!-- Range Rings centered at IMD Sonegaon Radar (cx=410, cy=270) -->
              <circle cx="410" cy="270" r="60" fill="none" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1" stroke-dasharray="3 3" />
              <text x="475" y="274" fill="#38bdf8" font-size="8" font-family="monospace">15km</text>

              <circle cx="410" cy="270" r="120" fill="none" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1.2" stroke-dasharray="4 4" />
              <text x="535" y="274" fill="#38bdf8" font-size="8" font-family="monospace">30km</text>

              <circle cx="410" cy="270" r="180" fill="none" stroke="rgba(56, 189, 248, 0.25)" stroke-width="1" />
              <text x="595" y="274" fill="#38bdf8" font-size="8" font-family="monospace">50km</text>

              <circle cx="410" cy="270" r="240" fill="none" stroke="rgba(56, 189, 248, 0.2)" stroke-width="1" stroke-dasharray="5 5" />
              <text x="655" y="274" fill="#38bdf8" font-size="8" font-family="monospace">75km</text>

              <!-- Crosshair Lines -->
              <line x1="410" y1="30" x2="410" y2="490" stroke="rgba(56, 189, 248, 0.2)" stroke-width="1" stroke-dasharray="2 4" />
              <line x1="170" y1="270" x2="650" y2="270" stroke="rgba(56, 189, 248, 0.2)" stroke-width="1" stroke-dasharray="2 4" />

              <!-- High-Reflectivity Precipitation Rain Cells -->
              <!-- Severe Cloudburst Cell (>55 dBZ) over Manish Nagar & Somalwada -->
              <circle cx="430" cy="310" r="75" fill="url(#doppler-core-cloudburst)" opacity="0.85" />
              <circle cx="430" cy="310" r="35" fill="rgba(236, 72, 153, 0.65)">
                <animate attributeName="r" values="30;40;30" dur="2.4s" repeatCount="indefinite" />
              </circle>

              <!-- Secondary Rain Cell (45-55 dBZ) over Ambazari Spillway -->
              <circle cx="270" cy="250" r="65" fill="url(#doppler-moderate-band)" opacity="0.75" />

              <!-- Rotating Scanning Radar Beam -->
              <line id="radar-beam" x1="410" y1="270" x2="650" y2="270" stroke="#38bdf8" stroke-width="2.5" opacity="0.85" filter="drop-shadow(0 0 8px #38bdf8)" />
              
              <!-- Radar Center Station Icon -->
              <g id="radar-center-station" transform="translate(410, 270)">
                <circle cx="0" cy="0" r="6" fill="#0ea5e9" stroke="#fff" stroke-width="1.5"/>
                <circle cx="0" cy="0" r="12" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.7">
                  <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite"/>
                </circle>
              </g>

              <!-- On-Map Doppler dBZ Reflectivity Scale Legend -->
              <g id="doppler-legend" transform="translate(20, 420)">
                <rect width="210" height="48" rx="6" fill="rgba(8, 13, 26, 0.92)" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1"/>
                <text x="10" y="16" fill="#fff" font-size="8.5" font-weight="700">PRECIPITATION REFLECTIVITY (dBZ)</text>
                <rect x="10" y="24" width="22" height="8" fill="#22c55e" rx="2"/>
                <text x="35" y="31" fill="#94a3b8" font-size="7.5">25-35</text>
                <rect x="65" y="24" width="22" height="8" fill="#eab308" rx="2"/>
                <text x="90" y="31" fill="#94a3b8" font-size="7.5">35-45</text>
                <rect x="120" y="24" width="22" height="8" fill="#f97316" rx="2"/>
                <text x="145" y="31" fill="#94a3b8" font-size="7.5">45-55</text>
                <rect x="175" y="24" width="22" height="8" fill="#ec4899" rx="2"/>
                <text x="10" y="44" fill="#fb7185" font-size="8" font-weight="700">⚡ CLOUDBURST CORE: 84.6 mm/h</text>
              </g>
            </g>

            <!-- Underpasses Pins (Manish Nagar, Loha Pul, Narendra Nagar, Pardi) -->
            <g id="map-underpasses-layer" style="display: ${this.activeLayers.underpasses ? 'block' : 'none'}">
              ${this.renderNagpurUnderpassesSvg()}
            </g>

            <!-- Pumping Stations & Floodgates -->
            <g id="map-pumps-layer" style="display: ${this.activeLayers.pumps ? 'block' : 'none'}">
              ${this.renderNagpurPumpsSvg()}
            </g>

            <!-- Citizen SOS Crowd Clusters -->
            <g id="map-sos-layer" style="display: ${this.activeLayers.sos ? 'block' : 'none'}">
              ${this.renderNagpurSosPinsSvg()}
            </g>

            <!-- Moving Units (NMC Emergency Dewatering Tanker & Police Patrol) -->
            <g id="map-moving-units">
              <!-- Unit 1: NMC Dewatering Unit -->
              <g class="moving-truck" id="truck-unit-1">
                <circle cx="410" cy="295" r="8" fill="#10b981" />
                <circle cx="410" cy="295" r="14" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0.7">
                  <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="410" y="291" text-anchor="middle" font-size="7" fill="#fff" font-weight="bold">NMC</text>
              </g>

              <!-- Unit 2: Traffic Patrol Interceptor -->
              <g class="moving-police" id="police-unit-1">
                <circle cx="390" cy="180" r="8" fill="#0ea5e9" />
                <circle cx="390" cy="180" r="14" fill="none" stroke="#0ea5e9" stroke-width="1.5" opacity="0.7">
                  <animate attributeName="r" values="8;16;8" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <text x="390" y="176" text-anchor="middle" font-size="7" fill="#fff" font-weight="bold">POLICE</text>
              </g>
            </g>
          </svg>

          <!-- Bottom Telemetry HUD Strip -->
          <div class="map-bottom-telemetry">
            <div class="telemetry-node">
              <span class="text-muted">CRITICAL UNDERPASS:</span>
              <span class="telemetry-node-val text-rose" id="hud-underpass-val">Manish Nagar RUB (1.18m Depth)</span>
            </div>
            <div class="telemetry-node">
              <span class="text-muted">AMBAZARI DISCHARGE:</span>
              <span class="telemetry-node-val text-cyan">1,450 m³/sec (Sluice 1-4)</span>
            </div>
            <div class="telemetry-node">
              <span class="text-muted">DRAINAGE EFFICIENCY:</span>
              <span class="telemetry-node-val text-emerald" id="hud-efficiency-val">96% (Plan Alpha active)</span>
            </div>
            <button id="inspect-sim-btn" class="pill-btn">⚡ Run Counterfactual Sim</button>
          </div>
        </div>

        <!-- Selected Underpass Mini Card -->
        <div id="underpass-detail-pop" class="counterfactual-quick-strip">
          <div class="quick-strip-header">
            <span>🔍 DIGITAL TWIN SENSOR TELEMETRY: MANISH NAGAR RAILWAY UNDERPASS (RUB)</span>
            <span class="badge-status">AUTO DROP-GATE ARMED</span>
          </div>
          <div class="strip-plans-row">
            <div class="plan-card-mini recommended active-choice">
              <div class="plan-mini-title">
                <span>Plan Alpha: Autonomous Early Action</span>
                <span class="text-emerald">ACTIVE</span>
              </div>
              <p class="plan-mini-impact">Close gates at T-30m → 4x 450HP pumps active → Wardha Road green wave → 0 trapped vehicles.</p>
            </div>
            <div class="plan-card-mini">
              <div class="plan-mini-title">
                <span>Plan Beta: Reactive Protocol</span>
                <span class="text-rose">HIGH RISK</span>
              </div>
              <p class="plan-mini-impact">Manual barricades after 1.25m depth → 6 vehicles submerged → 125 mins traffic gridlock.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.startRadarAnimation();
  }

  renderNagpurWardsSvg() {
    return `
      <!-- Dharampeth & Ambazari Catchment (W01) -->
      <polygon points="170,160 300,140 330,280 200,300" fill="rgba(14, 165, 233, 0.08)" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1.5" class="ward-poly"/>
      <text x="245" y="210" fill="#94a3b8" font-size="10" font-weight="600" text-anchor="middle">Dharampeth (W01)</text>

      <!-- Sitabuldi & Zero Mile Metro (W02) -->
      <polygon points="300,140 450,130 470,240 330,250" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.45)" stroke-width="2" class="ward-poly"/>
      <text x="385" y="190" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Zero Mile / Sitabuldi (W02)</text>

      <!-- Manish Nagar & Somalwada (W03 - CRITICAL INUNDATION) -->
      <polygon points="350,260 490,250 520,390 380,410" fill="rgba(239, 68, 68, 0.22)" stroke="#ef4444" stroke-width="2.5" class="ward-poly"/>
      <text x="445" y="340" fill="#fff" font-size="11.5" font-weight="800" text-anchor="middle">Manish Nagar RUB (W03) ⚠️</text>

      <!-- Loha Pul & Cotton Market (W04 - CRITICAL UNDERPASS) -->
      <polygon points="450,130 570,120 590,230 470,240" fill="rgba(239, 68, 68, 0.18)" stroke="#f87171" stroke-width="2" class="ward-poly"/>
      <text x="520" y="175" fill="#fca5a5" font-size="10.5" font-weight="700" text-anchor="middle">Loha Pul / Cotton Mkt (W04)</text>

      <!-- Narendra Nagar & Ring Road (W05) -->
      <polygon points="320,290 380,270 410,380 340,390" fill="rgba(245, 158, 11, 0.12)" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1.5" class="ward-poly"/>
      <text x="365" y="335" fill="#fde047" font-size="9.5" font-weight="600" text-anchor="middle">Narendra Nagar (W05)</text>

      <!-- Maharajbagh & Civil Lines Secretariat (W06) -->
      <polygon points="260,70 420,60 440,140 280,150" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1.2" class="ward-poly"/>
      <text x="350" y="105" fill="#a7f3d0" font-size="10" font-weight="600" text-anchor="middle">Civil Lines / NMC (W06)</text>

      <!-- Pardi & Bhandara Road Junction (W07) -->
      <polygon points="570,120 720,110 740,240 590,250" fill="rgba(168, 85, 247, 0.08)" stroke="rgba(168, 85, 247, 0.3)" stroke-width="1.2" class="ward-poly"/>
      <text x="650" y="180" fill="#d8b4fe" font-size="10" font-weight="600" text-anchor="middle">Pardi East Corridor (W07)</text>

      <!-- Reshimbagh & Sakkaradara (W08) -->
      <polygon points="480,250 630,240 660,370 510,380" fill="rgba(56, 189, 248, 0.08)" stroke="rgba(56, 189, 248, 0.25)" stroke-width="1.2" class="ward-poly"/>
      <text x="565" y="310" fill="#94a3b8" font-size="10" font-weight="600" text-anchor="middle">Reshimbagh (W08)</text>
    `;
  }

  renderNagpurWaterwaysSvg() {
    return `
      <!-- Ambazari Lake Reservoir -->
      <path d="M 180,240 Q 240,220 270,250 Q 280,280 250,300 Q 190,310 170,270 Z" fill="rgba(14, 165, 233, 0.45)" stroke="#38bdf8" stroke-width="2" filter="url(#water-glow)"/>
      <text x="225" y="270" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle">Ambazari Lake (100.8% FTL)</text>

      <!-- Futala Lake (North-West) -->
      <circle cx="210" cy="140" r="26" fill="rgba(14, 165, 233, 0.35)" stroke="#0ea5e9" stroke-width="1.5" />
      <text x="210" y="143" fill="#38bdf8" font-size="8" font-weight="700" text-anchor="middle">Futala Lake</text>

      <!-- Nag River Spine (17km Drainage Backbone) -->
      <path d="M 270,260 Q 330,240 380,230 T 480,250 T 580,270 T 710,280" fill="none" stroke="#0ea5e9" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="8 4">
        <animate attributeName="stroke-dashoffset" values="0;24" dur="1.2s" repeatCount="indefinite" />
      </path>
      <text x="490" y="242" fill="#38bdf8" font-size="8.5" font-weight="700">Nag River Channel (1,450 m³/s)</text>

      <!-- Pili River (Northern Spillway Bypass) -->
      <path d="M 240,90 Q 400,110 560,115 T 720,130" fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 3">
        <animate attributeName="stroke-dashoffset" values="0;18" dur="1.4s" repeatCount="indefinite" />
      </path>
      <text x="440" y="105" fill="#22d3ee" font-size="8" font-weight="600">Pili River Bypass</text>
    `;
  }

  renderNagpurRoadsSvg() {
    return `
      <!-- Wardha Road Elevated Arterial (NH-44 Corridor: Sitabuldi -> Somalwada -> MIHAN) -->
      <path d="M 380,180 L 400,230 L 430,300 L 460,380 L 490,460" fill="none" stroke="rgba(245, 158, 11, 0.85)" stroke-width="3.5"/>
      <text x="455" y="360" fill="#fbbf24" font-size="8" font-weight="800" transform="rotate(65 455 360)">WARDHA ROAD FLYOVER</text>

      <!-- Smart Green Wave Diversion Route -->
      <path d="M 320,180 L 410,210 L 510,230 L 630,240" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="6 3"/>
      <text x="510" y="222" fill="#34d399" font-size="8" font-weight="800">SMART GREEN WAVE ARTERIAL</text>

      <!-- Nagpur Ring Road -->
      <path d="M 180,340 Q 350,420 540,400 Q 690,360 740,240" fill="none" stroke="rgba(255, 255, 255, 0.25)" stroke-width="2.5"/>
      <text x="520" y="415" fill="#94a3b8" font-size="8" font-weight="700">NAGPUR OUTER RING ROAD</text>

      <!-- Nagpur Metro (Orange Line: North-South) -->
      <line x1="390" y1="50" x2="440" y2="460" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="2 3" opacity="0.6"/>
      <text x="395" y="70" fill="#38bdf8" font-size="7" font-weight="700">METRO ORANGE LINE</text>
    `;
  }

  renderNagpurUnderpassesSvg() {
    const coords = [
      { x: 440, y: 320, name: "Manish Nagar RUB", depth: "1.18m", status: "critical" },
      { x: 405, y: 220, name: "Loha Pul Underpass", depth: "1.12m", status: "critical" },
      { x: 385, y: 285, name: "Narendra Nagar RUB", depth: "0.95m", status: "caution" },
      { x: 610, y: 190, name: "Pardi Subway", depth: "0.65m", status: "normal" }
    ];

    return coords.map(up => {
      const isCritical = up.status === 'critical';
      const color = isCritical ? '#ef4444' : up.status === 'caution' ? '#f59e0b' : '#10b981';
      return `
        <g class="underpass-pin" data-name="${up.name}" data-depth="${up.depth}" style="cursor: pointer;">
          <circle cx="${up.x}" cy="${up.y}" r="9" fill="${color}" stroke="#fff" stroke-width="2"/>
          ${isCritical ? `
            <circle cx="${up.x}" cy="${up.y}" r="16" fill="none" stroke="#ef4444" stroke-width="2">
              <animate attributeName="r" values="9;26;9" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite" />
            </circle>
          ` : ''}
          <rect x="${up.x - 42}" y="${up.y - 28}" width="84" height="16" rx="4" fill="rgba(8, 13, 26, 0.95)" stroke="${color}" stroke-width="1.2"/>
          <text x="${up.x}" y="${up.y - 17}" text-anchor="middle" fill="#fff" font-size="8" font-weight="800">${up.name}: ${up.depth}</text>
        </g>
      `;
    }).join('');
  }

  renderNagpurPumpsSvg() {
    return `
      <!-- Ambazari Spillway Sluice Station -->
      <g class="pump-marker" style="cursor: pointer;">
        <rect x="250" y="275" width="20" height="20" rx="4" fill="#0ea5e9" stroke="#fff" stroke-width="1.5"/>
        <text x="260" y="289" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">S1</text>
        <text x="260" y="306" text-anchor="middle" fill="#38bdf8" font-size="7.5" font-weight="700">1,450 m³/s</text>
      </g>

      <!-- Manish Nagar High-Flow Pump Bank -->
      <g class="pump-marker" style="cursor: pointer;">
        <rect x="465" y="325" width="20" height="20" rx="4" fill="#10b981" stroke="#fff" stroke-width="1.5"/>
        <text x="475" y="339" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">P1</text>
        <text x="475" y="356" text-anchor="middle" fill="#34d399" font-size="7.5" font-weight="700">4x 450HP</text>
      </g>

      <!-- Loha Pul Sump Station -->
      <g class="pump-marker" style="cursor: pointer;">
        <rect x="415" y="235" width="18" height="18" rx="4" fill="#10b981" stroke="#fff" stroke-width="1.5"/>
        <text x="424" y="248" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">P2</text>
        <text x="424" y="264" text-anchor="middle" fill="#34d399" font-size="7" font-weight="700">900 HP</text>
      </g>
    `;
  }

  renderNagpurSosPinsSvg() {
    const sosCoords = [
      { x: 450, y: 325, count: 24, label: "Manish Nagar RUB" },
      { x: 410, y: 225, count: 18, label: "Loha Pul" },
      { x: 265, y: 285, count: 8, label: "Ambazari Spillway" },
      { x: 380, y: 195, count: 6, label: "Sitabuldi Metro" }
    ];

    return sosCoords.map(pin => `
      <g class="sos-cluster">
        <circle cx="${pin.x}" cy="${pin.y}" r="8" fill="#ef4444" opacity="0.9"/>
        <text x="${pin.x}" y="${pin.y + 3}" text-anchor="middle" fill="#fff" font-size="7.5" font-weight="bold">${pin.count}</text>
      </g>
    `).join('');
  }

  bindEvents() {
    // Layer toggles
    const layerButtons = this.container.querySelectorAll('.layer-toggle-btn');
    layerButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const layer = e.currentTarget.dataset.layer;
        this.activeLayers[layer] = !this.activeLayers[layer];
        e.currentTarget.classList.toggle('active', this.activeLayers[layer]);
        
        const layerGroup = document.getElementById(`map-${layer}-layer`);
        if (layerGroup) {
          layerGroup.style.display = this.activeLayers[layer] ? 'block' : 'none';
        }
      });
    });

    // Underpass click
    const underpassPins = this.container.querySelectorAll('.underpass-pin');
    underpassPins.forEach(pin => {
      pin.addEventListener('click', () => {
        const name = pin.dataset.name;
        const depth = pin.dataset.depth;
        const hudUnderpass = document.getElementById('hud-underpass-val');
        if (hudUnderpass) {
          hudUnderpass.textContent = `${name} (${depth})`;
        }
      });
    });

    // Run Counterfactual Simulation button
    const simBtn = this.container.querySelector('#inspect-sim-btn');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        this.runSimulationVisual();
      });
    }
  }

  startRadarAnimation() {
    const beam = document.getElementById('radar-beam');
    if (!beam) return;

    let angle = 0;
    const animate = () => {
      angle = (angle + 1.2) % 360;
      const rad = (angle * Math.PI) / 180;
      const x2 = 410 + Math.cos(rad) * 240;
      const y2 = 270 + Math.sin(rad) * 240;
      beam.setAttribute('x2', x2);
      beam.setAttribute('y2', y2);
      this.animationId = requestAnimationFrame(animate);
    };
    this.animationId = requestAnimationFrame(animate);
  }

  runSimulationVisual() {
    const hudEfficiency = document.getElementById('hud-efficiency-val');
    const hudUnderpass = document.getElementById('hud-underpass-val');
    if (hudEfficiency) hudEfficiency.textContent = "Simulating Plan Alpha Counterfactual...";

    setTimeout(() => {
      if (hudEfficiency) hudEfficiency.textContent = "Plan Alpha: Manish Nagar RUB water dropping 1.18m -> 0.32m";
      if (hudUnderpass) hudUnderpass.textContent = "Discharge: 4x 450HP Pumps Active (4,800 L/min)";
    }, 1200);

    setTimeout(() => {
      if (hudEfficiency) hudEfficiency.textContent = "Underpasses Safe & Traffic Diverted via Flyover (0 Casualties)";
    }, 2800);
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
