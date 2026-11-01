// CityGuard AI - Main Application Coordinator (Twitter/X & Instagram Social Media Interface)

import { CITIES, SCENARIOS, ROLES } from './data/mockData.js';
import { sound } from './utils/soundEngine.js';
import { SocialFeed } from './components/SocialFeed.js';
import { RightSidebar } from './components/RightSidebar.js';
import { DigitalTwinMap } from './components/DigitalTwinMap.js';
import { SensingStream } from './components/SensingStream.js';
import { CommissionerGate } from './components/CommissionerGate.js';
import { DigitalTwinStudio } from './components/DigitalTwinStudio.js';
import { PlannerMatrix } from './components/PlannerMatrix.js';
import { NagrikAI } from './components/NagrikAI.js';
import { AgentGraph } from './components/AgentGraph.js';
import { HackathonSpecs } from './components/HackathonSpecs.js';
import { LoginPage } from './components/LoginPage.js';
import { ApiHub } from './components/ApiHub.js';
import { apiService } from './services/apiService.js';
import { geminiLiveEngine } from './services/geminiLiveEngine.js';

// Global Application State (Nagpur Smart City)
export const appState = {
  currentCity: CITIES.nagpur,
  currentScenario: SCENARIOS.cloudburst,
  currentUser: ROLES.commissioner,
  isLoggedIn: false,
  activeTab: 'login-portal', // Default: Login Page as initial Home Page!
  simSpeed: 1,
  audioMuted: false,
  activeComponent: null
};

window.soundEngineInstance = sound;

class CityGuardApp {
  constructor() {
    this.mainViewport = document.getElementById('main-viewport');
    this.rightSidebarMount = document.getElementById('right-sidebar-mount');
    this.clockElement = document.getElementById('live-clock');
    this.citySelect = document.getElementById('city-select');
    this.scenarioSelect = document.getElementById('scenario-select');
    this.audioBtn = document.getElementById('audio-toggle-btn');
    this.simSpeedBtn = document.getElementById('sim-speed-btn');

    // Header User Profile Elements
    this.headerUserAvatar = document.getElementById('header-user-avatar');
    this.headerUserName = document.getElementById('header-user-name');
    this.headerUserRole = document.getElementById('header-user-role');
    this.headerUserBtn = document.getElementById('user-profile-header-btn');

    // Left Sidebar Elements
    this.leftUserAvatar = document.getElementById('left-user-avatar');
    this.leftUserName = document.getElementById('left-user-name');
    this.leftUserHandle = document.getElementById('left-user-handle');
    this.leftPostSosBtn = document.getElementById('left-post-sos-btn');
    this.leftNavUserCard = document.getElementById('left-nav-user-card');

    // One-Liner Ribbon Elements
    this.oneLinerRibbon = document.getElementById('one-liner-ribbon');
    this.ribbonBadge = document.getElementById('ribbon-badge');
    this.ribbonBadgeText = document.getElementById('ribbon-badge-text');
    this.ribbonText = document.getElementById('ribbon-text');
    this.ribbonActionBtn = document.getElementById('ribbon-action-btn');
    this.ribbonActionText = document.getElementById('ribbon-action-text');
    this.ribbonAudioBtn = document.getElementById('ribbon-audio-btn');
    this.ribbonDismissBtn = document.getElementById('ribbon-dismiss-btn');

    this.toggleTrendsBtn = document.getElementById('toggle-trends-header-btn');
    this.apiHubBtn = document.getElementById('open-api-hub-btn');
    this.reanalyzeGeminiBtn = document.getElementById('reanalyze-gemini-btn');

    this.rightSidebar = null;
    this.init();
  }

  init() {
    this.updateUserProfile();
    this.updateRibbon();
    this.renderRightSidebar();
    this.bindGlobalEvents();
    this.startClock();
    this.renderCurrentView();

    // Ensure initial active tab class reflects login-portal
    const navLinks = document.querySelectorAll('.social-nav-link');
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.tab === appState.activeTab);
    });

    // Ingest and synthesize live weather & conditions via Gemini Live AI on boot
    geminiLiveEngine.reanalyzeLiveConditions().then(() => {
      this.updateRibbon();
    });

    geminiLiveEngine.subscribe((event) => {
      if (event === 'analysis_complete') {
        this.updateRibbon();
      }
    });
  }

  updateRibbon() {
    if (!this.oneLinerRibbon || !this.ribbonText) return;
    const liveCity = geminiLiveEngine.getLiveCityData();

    if (liveCity.isFlood) {
      this.oneLinerRibbon.className = 'one-liner-ribbon flash-alert';
      if (this.ribbonBadgeText) this.ribbonBadgeText.textContent = 'LIVE FLOOD ALERT';
      this.ribbonText.innerHTML = `⚠️ <strong>CRITICAL FLASH FLOOD:</strong> Manish Nagar & Loha Pul underpasses reaching ${liveCity.city.underpasses[0].depth} (Crit: 1.20m) · Ambazari Lake spillway armed · 4x 450HP pumps active · 140k citizens alerted in MR/HI/EN`;
      if (this.ribbonActionText) this.ribbonActionText.textContent = '⚡ Inspect Plan Alpha →';
    } else if (liveCity.isHeat) {
      this.oneLinerRibbon.className = 'one-liner-ribbon heat-alert';
      if (this.ribbonBadgeText) this.ribbonBadgeText.textContent = 'HEAT EMERGENCY';
      this.ribbonText.innerHTML = `☀️ <strong>SEVERE HEATWAVE:</strong> Nagpur core ${liveCity.weather.temperature}°C (+4.2°C UHI delta) · 34 AC cooling centers opened in Sitabuldi & Dharampeth · Water mist tankers deployed`;
      if (this.ribbonActionText) this.ribbonActionText.textContent = '⚡ Inspect Heat Plan →';
    } else {
      this.oneLinerRibbon.className = 'one-liner-ribbon civic-alert';
      if (this.ribbonBadgeText) this.ribbonBadgeText.textContent = 'GEMINI LIVE AI';
      this.ribbonText.innerHTML = `🌐 <strong>LIVE NAGPUR TELEMETRY:</strong> ${liveCity.weather.temperature}°C (${liveCity.weather.condition}) · Rain: ${liveCity.weather.precipitation}mm/h · Wind: ${liveCity.weather.windSpeed}km/h · AQI: ${liveCity.aqi.aqi} (${liveCity.aqi.category}) · All 4 Underpasses Clear & Safe`;
      if (this.ribbonActionText) this.ribbonActionText.textContent = '⚡ Open Decision Matrix →';
    }
  }

  renderRightSidebar() {
    if (this.rightSidebarMount) {
      this.rightSidebar = new RightSidebar(
        'right-sidebar-mount',
        appState,
        (newRole) => this.handleRoleSwitch(newRole),
        (targetTab) => this.navigateToTab(targetTab)
      );
      this.rightSidebar.render();
    }
  }

  updateUserProfile() {
    const user = appState.currentUser;

    // Header elements
    if (this.headerUserAvatar) this.headerUserAvatar.textContent = user.avatar;
    if (this.headerUserName) this.headerUserName.textContent = user.name;
    if (this.headerUserRole) {
      this.headerUserRole.textContent = user.badge.split(' ')[1] || user.badge;
      this.headerUserRole.style.color = user.color || 'var(--cyan-400)';
    }

    // Left Sidebar elements
    if (this.leftUserAvatar) this.leftUserAvatar.textContent = user.avatar;
    if (this.leftUserName) this.leftUserName.textContent = user.name;
    if (this.leftUserHandle) {
      if (user.handle) {
        this.leftUserHandle.textContent = user.handle;
      } else {
        this.leftUserHandle.textContent = user.id === 'commissioner' ? '@Commissioner_NMC' :
                                          user.id === 'traffic' ? '@NagpurPolice' :
                                          user.id === 'works' ? '@NMC_Stormwater' :
                                          user.id === 'health' ? '@NMC_Health' : '@Nagrik_SunitaRaut';
      }
    }
  }

  handleRoleSwitch(newRole) {
    appState.currentUser = newRole;
    this.updateUserProfile();
    sound.speak(`Switched role to ${newRole.name}.`);

    // Re-render feed or current view
    if (appState.activeTab === 'social-feed') {
      this.renderCurrentView();
    } else {
      this.navigateToTab(newRole.defaultTab || 'social-feed');
    }
  }

  handleLoginSuccess(userRole) {
    appState.isLoggedIn = true;
    appState.currentUser = userRole;
    this.updateUserProfile();
    // After logging in, immediately open Home Page (City Feed / Dashboard)!
    this.navigateToTab('social-feed');
  }

  navigateToTab(tabName) {
    appState.activeTab = tabName;
    sound.playRadarPing();

    // Update active state in left sidebar navigation
    const navLinks = document.querySelectorAll('.social-nav-link');
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.tab === tabName);
    });

    // Auto-collapse sidebar drawer if open when switching tabs
    if (this.rightSidebar && this.rightSidebar.isOpen) {
      this.rightSidebar.closeDrawer();
    }

    this.renderCurrentView();
  }

  bindGlobalEvents() {
    // Left Sidebar Navigation Links
    const navLinks = document.querySelectorAll('.social-nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.dataset.tab;
        if (targetTab === appState.activeTab) return;
        this.navigateToTab(targetTab);
      });
    });

    // Big Post Citizen SOS Button in Left Sidebar
    if (this.leftPostSosBtn) {
      this.leftPostSosBtn.addEventListener('click', () => {
        sound.playAlertChime();
        this.navigateToTab('social-feed');
        setTimeout(() => {
          const sosCheckbox = document.getElementById('composer-sos-flag');
          const textarea = document.getElementById('composer-textarea');
          if (sosCheckbox) sosCheckbox.checked = true;
          if (textarea) {
            textarea.value = "🚨 EMERGENCY SOS: Underpass water depth is exceeding critical safe limit! Need dewatering pumps immediately.";
            textarea.focus();
          }
        }, 150);
      });
    }

    // Left Nav User Card Click (Switch User)
    if (this.leftNavUserCard) {
      this.leftNavUserCard.addEventListener('click', () => {
        this.navigateToTab('login-portal');
      });
    }

    // Header User Profile Click
    if (this.headerUserBtn) {
      this.headerUserBtn.addEventListener('click', () => {
        this.navigateToTab('login-portal');
      });
    }

    // City selector (Locked to Nagpur Smart City)
    if (this.citySelect) {
      this.citySelect.addEventListener('change', (e) => {
        const cityKey = e.target.value;
        appState.currentCity = CITIES[cityKey] || CITIES.nagpur;
        sound.playRadarPing();
        this.updateHeaderStats();
        this.renderRightSidebar();
        this.renderCurrentView();
      });
    }

    // Scenario selector (Powered by Gemini Live Engine)
    if (this.scenarioSelect) {
      this.scenarioSelect.addEventListener('change', (e) => {
        const selectedMode = e.target.value;
        sound.playAlertChime();
        geminiLiveEngine.setMode(selectedMode).then(() => {
          this.updateRibbon();
          this.renderCurrentView();
        });
      });
    }

    // Ribbon Action Button Click
    if (this.ribbonActionBtn) {
      this.ribbonActionBtn.addEventListener('click', () => {
        this.navigateToTab('control-room');
      });
    }

    // Ribbon Audio Button Click
    if (this.ribbonAudioBtn) {
      this.ribbonAudioBtn.addEventListener('click', () => {
        sound.speak(this.ribbonText ? this.ribbonText.textContent : 'Emergency Alert Active');
      });
    }

    // Ribbon Dismiss Button Click
    if (this.ribbonDismissBtn && this.oneLinerRibbon) {
      this.ribbonDismissBtn.addEventListener('click', () => {
        this.oneLinerRibbon.classList.toggle('ribbon-collapsed');
        sound.playRadarPing();
      });
    }

    // Audio toggle
    if (this.audioBtn) {
      this.audioBtn.addEventListener('click', () => {
        const isAudioActive = sound.toggleMute();
        this.audioBtn.classList.toggle('muted', !isAudioActive);
        const textSpan = this.audioBtn.querySelector('.btn-text');
        if (textSpan) {
          textSpan.textContent = isAudioActive ? 'Voice Audio' : 'Audio Muted';
        }
      });
    }

    // Sim speed toggle
    if (this.simSpeedBtn) {
      this.simSpeedBtn.addEventListener('click', () => {
        const speeds = [1, 2, 5];
        const currentIdx = speeds.indexOf(appState.simSpeed);
        appState.simSpeed = speeds[(currentIdx + 1) % speeds.length];
        this.simSpeedBtn.querySelector('.speed-indicator').textContent = `${appState.simSpeed}x SPEED`;
      });
    }

    // Toggle Trends Drawer Button in Header
    if (this.toggleTrendsBtn) {
      this.toggleTrendsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.rightSidebar) {
          this.rightSidebar.toggleDrawer();
        }
      });
    }

    // Open API Hub Button in Header
    if (this.apiHubBtn) {
      this.apiHubBtn.addEventListener('click', () => {
        this.navigateToTab('api-hub');
      });
    }

    // Re-Analyze Live City Telemetry with Gemini Button
    if (this.reanalyzeGeminiBtn) {
      this.reanalyzeGeminiBtn.addEventListener('click', () => {
        sound.playRadarPing();
        this.reanalyzeGeminiBtn.innerHTML = '<span>⏳ Analyzing...</span>';
        geminiLiveEngine.reanalyzeLiveConditions().then(() => {
          this.reanalyzeGeminiBtn.innerHTML = '<span class="pulse-dot"></span> <span>🧠 Gemini Live AI</span>';
          sound.playApprovalFanfare();
          this.updateRibbon();
          this.renderCurrentView();
        });
      });
    }
  }

  startClock() {
    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      if (this.clockElement) {
        this.clockElement.textContent = new Intl.DateTimeFormat('en-IN', options).format(now);
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  updateHeaderStats() {
    const sensorCount = document.getElementById('sensor-count');
    const totalSensors = appState.currentCity.wards.reduce((acc, w) => acc + w.sensors, 0) + 1200;
    if (sensorCount) sensorCount.textContent = totalSensors.toLocaleString('en-IN');
  }

  renderCurrentView() {
    if (appState.activeComponent && typeof appState.activeComponent.destroy === 'function') {
      appState.activeComponent.destroy();
      appState.activeComponent = null;
    }

    const tab = appState.activeTab;

    if (tab === 'social-feed') {
      // Twitter/X & Instagram Social Timeline View
      const feed = new SocialFeed('main-viewport', appState, (t) => this.navigateToTab(t));
      feed.render();
      appState.activeComponent = feed;

    } else if (tab === 'control-room') {
      this.mainViewport.innerHTML = `
        <div class="control-room-grid" style="padding: 1rem;">
          <div id="col-sensing-stream"></div>
          <div id="col-digital-twin"></div>
          <div id="col-commissioner-gate"></div>
        </div>
      `;

      const sensingStream = new SensingStream('col-sensing-stream', appState);
      sensingStream.render();

      const digitalTwin = new DigitalTwinMap('col-digital-twin', appState);
      digitalTwin.render();

      const commissioner = new CommissionerGate('col-commissioner-gate', appState);
      commissioner.render();

      appState.activeComponent = {
        destroy: () => {
          digitalTwin.destroy();
        }
      };

    } else if (tab === 'digital-twin') {
      this.mainViewport.innerHTML = `<div id="digital-twin-studio-mount"></div>`;
      const studio = new DigitalTwinStudio('digital-twin-studio-mount', appState);
      studio.render();
      appState.activeComponent = studio;

    } else if (tab === 'nagrik-ai') {
      this.mainViewport.innerHTML = `<div id="nagrik-ai-mount" style="padding: 1rem;"></div>`;
      const nagrik = new NagrikAI('nagrik-ai-mount', appState);
      nagrik.render();
      appState.activeComponent = nagrik;

    } else if (tab === 'agent-swarm') {
      this.mainViewport.innerHTML = `<div id="swarm-graph-mount" style="padding: 1rem;"></div>`;
      const swarm = new AgentGraph('swarm-graph-mount', appState);
      swarm.render();
      appState.activeComponent = swarm;

    } else if (tab === 'hackathon-specs') {
      this.mainViewport.innerHTML = `<div id="specs-mount" style="padding: 1rem;"></div>`;
      const specs = new HackathonSpecs('specs-mount');
      specs.render();
      appState.activeComponent = specs;

    } else if (tab === 'login-portal') {
      this.mainViewport.innerHTML = `<div id="login-portal-mount"></div>`;
      const loginPage = new LoginPage('login-portal-mount', appState, (userRole) => this.handleLoginSuccess(userRole));
      loginPage.render();
      appState.activeComponent = loginPage;

    } else if (tab === 'api-hub') {
      this.mainViewport.innerHTML = `<div id="api-hub-mount"></div>`;
      const hub = new ApiHub('api-hub-mount', appState, (t) => this.navigateToTab(t));
      hub.render();
      appState.activeComponent = hub;
    }
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new CityGuardApp();
});
