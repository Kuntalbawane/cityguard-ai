import { ROLES } from '../data/mockData.js';
import { sound } from '../utils/soundEngine.js';
import { geminiLiveEngine } from '../services/geminiLiveEngine.js';

export class RightSidebar {
  constructor(containerId, state, onRoleChange, onNavigate) {
    this.container = document.getElementById(containerId);
    this.state = state;
    this.onRoleChange = onRoleChange;
    this.onNavigate = onNavigate;
    this.departments = [
      { name: "Nagpur Traffic Police", handle: "@NagpurPolice", avatar: "👮", role: "traffic", status: "Active AI", following: true },
      { name: "NMC Stormwater Drainage", handle: "@NMC_Stormwater", avatar: "🚜", role: "works", status: "Active Sluice", following: true },
      { name: "NMC Public Health Cell", handle: "@NMC_Health", avatar: "🚑", role: "health", status: "Active Triage", following: true },
      { name: "Nagrik AI Personal Agent", handle: "@Nagrik_AI", avatar: "🤖", role: "citizen", status: "Active Gateway", following: true }
    ];
    this.isOpen = false;
    this._outsideClickListener = null;
    this._keyListener = null;
    this.unsubscribe = null;
  }

  openDrawer() {
    this.isOpen = true;
    if (this.container) {
      this.container.classList.add('drawer-open');
      const arrow = this.container.querySelector('#dock-arrow');
      if (arrow) arrow.textContent = '▶';
      const handle = this.container.querySelector('#sidebar-dock-handle');
      if (handle) handle.setAttribute('aria-expanded', 'true');
    }
    sound.playRadarPing();
  }

  closeDrawer() {
    this.isOpen = false;
    if (this.container) {
      this.container.classList.remove('drawer-open');
      const arrow = this.container.querySelector('#dock-arrow');
      if (arrow) arrow.textContent = '◀';
      const handle = this.container.querySelector('#sidebar-dock-handle');
      if (handle) handle.setAttribute('aria-expanded', 'false');
    }
  }

  toggleDrawer() {
    if (this.isOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  render() {
    this.container.innerHTML = `
      <!-- Dock Handle Tab Attached to Left Edge (Always Accessible on Right Margin) -->
      <button id="sidebar-dock-handle" class="sidebar-dock-handle" title="Toggle Doppler Telemetry & Trends (Hotkey: T)" aria-label="Toggle Radar & Trends Drawer" aria-expanded="false">
        <span class="dock-arrow" id="dock-arrow">◀</span>
        <span class="dock-vertical-text">⚡ RADAR & TRENDS</span>
        <span class="badge-status live-pulse dock-pulse"><span class="pulse-dot"></span></span>
      </button>

      <aside class="right-sidebar-panel">
        <!-- Top Drawer Header with Explicit Collapse/Dock Button -->
        <div class="sidebar-drawer-topbar">
          <div class="drawer-header-brand">
            <span class="badge-status live-pulse"><span class="pulse-dot"></span> LIVE</span>
            <span class="drawer-header-title">⚡ Radar & Swarm</span>
          </div>
          <button id="sidebar-collapse-btn" class="sidebar-collapse-btn" title="Collapse & dock to side (Esc)">
            <span>Dock to side ✕</span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="sidebar-search-box">
          <svg class="search-icon" viewBox="0 0 24 24"><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"/></svg>
          <input type="text" id="sidebar-search-input" class="search-input" placeholder="Search Wards, Radar, Schemes...">
        </div>

        <!-- Live City Weather & Doppler Telemetry Card -->
        <div class="sidebar-widget-card">
          <div class="widget-header">
            <span class="widget-title">🛰️ Doppler Telemetry</span>
            <span class="badge-status live-pulse"><span class="pulse-dot"></span> LIVE</span>
          </div>
          <div class="weather-telemetry-grid">
            <div class="telemetry-box">
              <span class="t-label">PRECIPITATION</span>
              <strong class="t-val text-rose" id="sidebar-weather-precip">${geminiLiveEngine.getLiveCityData().weather.precipitation} mm/h</strong>
            </div>
            <div class="telemetry-box">
              <span class="t-label">CORE TEMP</span>
              <strong class="t-val text-amber" id="sidebar-weather-temp">${geminiLiveEngine.getLiveCityData().weather.temperature}°C</strong>
            </div>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 0.5rem; display: flex; justify-content: space-between;">
            <span>Station: IMD Sonegaon DWR Nagpur</span>
            <span class="font-mono" style="color: var(--navy-700); font-weight: 700;">1,842 Sensors</span>
          </div>
          <button id="sidebar-inspect-api-btn" class="pill-btn" style="margin-top: 0.65rem; width: 100%; font-size: 0.72rem; background: #eff6ff; color: var(--navy-700); border-color: #bfdbfe; text-align: center; cursor: pointer;">
            🔌 Live API Hub & Telemetry (6 Active APIs) →
          </button>
        </div>

        <!-- What's Happening / Trending in Nagpur (Gemini Live Synthesized) -->
        <div class="sidebar-widget-card">
          <div class="widget-header">
            <span class="widget-title">What's happening in Nagpur</span>
            <span class="badge-status live-pulse" style="font-size: 0.6rem;"><span class="pulse-dot"></span> GEMINI AI</span>
          </div>
          <div class="trends-list">
            ${geminiLiveEngine.getLiveCityData().trendingTopics.map(item => `
              <div class="trend-item" style="cursor: pointer;">
                <div class="trend-category-row">
                  <span>${item.category}</span>
                  ${item.isHot ? '<span class="trend-hot-badge">TRENDING</span>' : ''}
                </div>
                <strong class="trend-topic-name">${item.topic}</strong>
                <span class="trend-count">${item.postsCount}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Active Department Swarm (Who to Follow / Swarm Status) -->
        <div class="sidebar-widget-card">
          <div class="widget-header">
            <span class="widget-title">Active Department Swarm</span>
            <span class="font-mono" style="font-size: 0.7rem; color: var(--navy-700); font-weight: 700;">4 AGENTS</span>
          </div>
          <div class="swarm-follows-list">
            ${this.departments.map(dept => `
              <div class="swarm-follow-item">
                <div class="swarm-follow-left">
                  <div class="dept-avatar-icon">${dept.avatar}</div>
                  <div class="dept-details">
                    <strong class="dept-name-text">${dept.name}</strong>
                    <span class="dept-handle-text">${dept.handle} · ${dept.status}</span>
                  </div>
                </div>
                <button class="follow-action-btn ${dept.following ? 'following' : ''}" data-deptname="${dept.name}">
                  ${dept.following ? 'Active' : 'Toggle'}
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Quick Switch Persona / Evaluation Bar -->
        <div class="sidebar-widget-card" style="border-color: #bfdbfe;">
          <div class="widget-header">
            <span class="widget-title" style="color: var(--navy-800);">⚡ Quick Role Switcher</span>
          </div>
          <div class="role-switcher-chips">
            <button class="role-chip-btn ${this.state.currentUser.id === 'commissioner' ? 'active-chip' : ''}" data-role="commissioner">
              <span>🏛️ Commissioner</span>
            </button>
            <button class="role-chip-btn ${this.state.currentUser.id === 'traffic' ? 'active-chip' : ''}" data-role="traffic">
              <span>🚦 Traffic Police</span>
            </button>
            <button class="role-chip-btn ${this.state.currentUser.id === 'works' ? 'active-chip' : ''}" data-role="works">
              <span>🚜 Municipal Works</span>
            </button>
            <button class="role-chip-btn ${this.state.currentUser.id === 'citizen' ? 'active-chip' : ''}" data-role="citizen">
              <span>👤 Citizen (Rekha)</span>
            </button>
          </div>
        </div>

        <!-- Footer Terms & Links -->
        <div class="sidebar-footer-links">
          <span>Terms of Service</span> · <span>Privacy Policy</span> · <span>Aadhaar Masking</span> · <span>Track 3: Smart Cities & Civic Innovation © 2026</span>
        </div>
      </aside>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Dock Handle Toggle Click
    const dockHandle = this.container.querySelector('#sidebar-dock-handle');
    if (dockHandle) {
      dockHandle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDrawer();
      });
    }

    // Collapse to side button
    const collapseBtn = this.container.querySelector('#sidebar-collapse-btn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeDrawer();
        sound.playRadarPing();
      });
    }

    // Auto-close when clicking outside the drawer
    if (this._outsideClickListener) {
      document.removeEventListener('click', this._outsideClickListener);
    }
    this._outsideClickListener = (e) => {
      if (this.isOpen && !this.container.contains(e.target)) {
        this.closeDrawer();
      }
    };
    document.addEventListener('click', this._outsideClickListener);

    // Keyboard Shortcuts: Esc to close, T to toggle
    if (this._keyListener) {
      document.removeEventListener('keydown', this._keyListener);
    }
    this._keyListener = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeDrawer();
      } else if ((e.key === 't' || e.key === 'T') && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        this.toggleDrawer();
      }
    };
    document.addEventListener('keydown', this._keyListener);

    // Quick role switcher buttons
    const roleBtns = this.container.querySelectorAll('.role-chip-btn');
    roleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const roleKey = e.currentTarget.dataset.role;
        const targetRole = ROLES[roleKey] || ROLES.commissioner;
        sound.playApprovalFanfare();
        if (typeof this.onRoleChange === 'function') {
          this.onRoleChange(targetRole);
        }
      });
    });

    // Follow toggle buttons
    const followBtns = this.container.querySelectorAll('.follow-action-btn');
    followBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dName = e.currentTarget.dataset.deptname;
        const d = this.departments.find(dept => dept.name === dName);
        if (d) {
          d.following = !d.following;
          e.currentTarget.classList.toggle('following', d.following);
          e.currentTarget.textContent = d.following ? 'Active' : 'Muted';
          sound.playRadarPing();
        }
      });
    });

    // Trending topics click
    const trendItems = this.container.querySelectorAll('.trend-item');
    trendItems.forEach(item => {
      item.addEventListener('click', () => {
        sound.playRadarPing();
        const searchInput = this.container.querySelector('#sidebar-search-input');
        const topicName = item.querySelector('.trend-topic-name').textContent;
        if (searchInput) searchInput.value = topicName;
      });
    });

    // Inspect API Hub button
    const inspectApiBtn = this.container.querySelector('#sidebar-inspect-api-btn');
    if (inspectApiBtn) {
      inspectApiBtn.addEventListener('click', () => {
        if (typeof this.onNavigate === 'function') {
          this.onNavigate('api-hub');
        }
      });
    }
  }

  updateDopplerTelemetry(weather) {
    if (!weather || !this.container) return;
    const precipEl = this.container.querySelector('#sidebar-weather-precip');
    const tempEl = this.container.querySelector('#sidebar-weather-temp');
    if (precipEl) precipEl.textContent = `${weather.precipitation} mm/h`;
    if (tempEl) tempEl.textContent = `${weather.temperature}°C`;
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this._outsideClickListener) {
      document.removeEventListener('click', this._outsideClickListener);
    }
    if (this._keyListener) {
      document.removeEventListener('keydown', this._keyListener);
    }
  }
}

