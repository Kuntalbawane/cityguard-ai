// CityGuard AI - Human-in-the-Loop Commissioner Approval & Department Swarm (Gemini AI Live Engine)

import { sound } from '../utils/soundEngine.js';
import { geminiLiveEngine } from '../services/geminiLiveEngine.js';

export class CommissionerGate {
  constructor(containerId, state) {
    this.container = document.getElementById(containerId);
    this.state = state;
    this.isApproved = false;
    this.unsubscribe = null;
  }

  render() {
    const liveCity = geminiLiveEngine.getLiveCityData();
    const plan = liveCity.counterfactualPlans.planA;
    const isFlood = liveCity.isFlood;

    const alertText = isFlood
      ? "नागपूर महानगरपालिका चेतावणी: मनीष नगर व लोहा पूल अंडरपासमध्ये पाण्याचा वेग वाढला आहे. कृपया वर्धा रोड उड्डाणपुलाचा वापर करा."
      : "नागपूर स्मार्ट सिटी अलर्ट: हवामान स्थिती सामान्य आहे. सर्व 10 झोनमध्ये महापालिका सुविधा सुरळीत सुरू आहेत.";

    this.container.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span class="panel-title-icon">🏛️</span>
            <span>Commissioner Approval Terminal</span>
          </div>
          <div style="display: flex; gap: 0.4rem; align-items: center;">
            <span class="badge-status live-pulse" style="font-size: 0.62rem;"><span class="pulse-dot"></span> GEMINI PLANNER</span>
            <span class="commissioner-badge">HUMAN-IN-THE-LOOP</span>
          </div>
        </div>

        <div class="panel-body">
          <!-- Commissioner Action Card -->
          <div class="commissioner-control-box" id="commissioner-box">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <span class="font-mono text-cyan" style="font-size: 0.72rem;">DECISION BRIEFING #NMC-DIS-2026-09</span>
              <span id="approval-status-pill" class="badge-status ${this.isApproved ? '' : 'alert-pulse'}">
                ${this.isApproved ? '✅ AUTHORIZED & EXECUTING' : '⏳ PENDING SIGN-OFF'}
              </span>
            </div>

            <p class="decision-summary-text" id="plain-language-brief">
              ${plan.summary}
            </p>

            <div class="why-chosen-box">
              <strong>WHY GEMINI AI AGENTS CHOSE THIS PLAN:</strong><br>
              ${plan.rationale}
            </div>

            <div class="decision-btn-row">
              <button id="approve-plan-btn" class="btn-primary" ${this.isApproved ? 'disabled' : ''}>
                <span>${this.isApproved ? '✓ Plan Alpha Executing' : '✍️ Approve & Authorize Plan Alpha'}</span>
              </button>
              <button id="listen-briefing-btn" class="btn-secondary" title="Listen to AI Voice Readout">
                <span>🔊 Hear Brief</span>
              </button>
            </div>
          </div>

          <!-- Department Agents Coordinated Swarm -->
          <div class="panel-header" style="padding: 0.5rem 0; background: transparent; border: none; margin-top: 0.5rem;">
            <div class="panel-title" style="font-size: 0.85rem;">
              <span>⚡ Coordinated Department Actions</span>
            </div>
            <span class="text-muted font-mono" style="font-size: 0.7rem;">4 ACTUATORS</span>
          </div>

          <div class="dept-agents-list" id="dept-actions-list">
            ${plan.actions.map(action => `
              <div class="dept-agent-card">
                <div class="dept-agent-header">
                  <span class="dept-name">
                    ${this.getDeptIcon(action.dept)} ${action.dept}
                  </span>
                  <span class="dept-status ${this.isApproved ? 'text-emerald' : 'text-amber'}">
                    ${this.isApproved ? 'ACTIVE' : 'READY TO DEPLOY'}
                  </span>
                </div>
                <p class="dept-action-text">${action.task}</p>
                <div class="dept-action-tags">
                  <span class="action-pill">Auto-Actuator</span>
                  <span class="action-pill">${this.isApproved ? 'Ack 200 OK' : 'Awaiting Sign-off'}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Multilingual Citizen Alert Station -->
          <div class="multilingual-preview-box">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span class="font-mono text-violet" style="font-size: 0.75rem; font-weight: 700;">MULTILINGUAL CITIZEN BROADCAST</span>
              <span class="tab-badge highlight-badge">140k Users</span>
            </div>
            <div class="alert-lang-tabs" id="alert-lang-tabs">
              <button class="lang-btn active" data-lang="marathi">मराठी (Marathi)</button>
              <button class="lang-btn" data-lang="hindi">हिन्दी (Hindi)</button>
              <button class="lang-btn" data-lang="english">English</button>
            </div>
            <div class="alert-message-bubble" id="alert-message-text">
              ${alertText}
            </div>
            <button id="speak-alert-btn" class="alert-audio-btn">
              <span>🔊 Read Alert Aloud</span>
            </button>
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

  getDeptIcon(dept) {
    if (dept.includes("Traffic") || dept.includes("Police")) return "🚦";
    if (dept.includes("Works") || dept.includes("NMC")) return "🚜";
    if (dept.includes("Power") || dept.includes("MSEDCL")) return "⚡";
    if (dept.includes("Health")) return "🚑";
    if (dept.includes("Labor")) return "👷";
    return "📢";
  }

  bindEvents() {
    // Approve Button
    const approveBtn = this.container.querySelector('#approve-plan-btn');
    if (approveBtn) {
      approveBtn.addEventListener('click', () => {
        this.authorizePlan();
      });
    }

    // Audio Briefing Button
    const briefBtn = this.container.querySelector('#listen-briefing-btn');
    if (briefBtn) {
      briefBtn.addEventListener('click', () => {
        const liveCity = geminiLiveEngine.getLiveCityData();
        const plan = liveCity.counterfactualPlans.planA;
        const text = `City Commissioner Briefing: ${plan.summary}. Agents chose this plan because ${plan.rationale}`;
        sound.speak(text);
      });
    }

    // Language switcher for alerts
    const langBtns = this.container.querySelectorAll('.lang-btn');
    const alertMsg = this.container.querySelector('#alert-message-text');
    langBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.currentTarget.dataset.lang;
        langBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        if (alertMsg) {
          const liveCity = geminiLiveEngine.getLiveCityData();
          if (lang === 'marathi') {
            alertMsg.textContent = liveCity.isFlood 
              ? "नागपूर महानगरपालिका चेतावणी: मनीष नगर व लोहा पूल अंडरपासमध्ये पाण्याचा वेग वाढला आहे. कृपया वर्धा रोड उड्डाणपुलाचा वापर करा."
              : "नागपूर स्मार्ट सिटी: हवामान सामान्य आहे. सर्व नागरी सेवा सुरळीत सुरू आहेत.";
          } else if (lang === 'hindi') {
            alertMsg.textContent = liveCity.isFlood
              ? "नागपुर महानगरपालिका चेतावनी: मनीष नगर और लोहा पुल अंडरपास में जलभराव है। कृपया वर्धा रोड एलिवेटेड कॉरिडोर का प्रयोग करें।"
              : "नागपुर स्मार्ट सिटी: मौसम सामान्य है। सभी 10 जोन में नागरिक सेवाएं सुचारू हैं।";
          } else {
            alertMsg.textContent = liveCity.isFlood
              ? "NMC FLASH FLOOD ADVISORY: Water depth at Manish Nagar RUB is critical. Preemptive barriers deployed. Use Wardha Road Elevated Flyover."
              : `NMC Advisory: Nagpur weather is ${liveCity.weather.temperature}°C, ${liveCity.weather.condition}. All municipal services operational.`;
          }
        }
      });
    });

    // Speak alert aloud button
    const speakAlertBtn = this.container.querySelector('#speak-alert-btn');
    if (speakAlertBtn) {
      speakAlertBtn.addEventListener('click', () => {
        if (alertMsg) {
          sound.speak(alertMsg.textContent);
        }
      });
    }
  }

  authorizePlan() {
    this.isApproved = true;
    sound.playApprovalFanfare();

    const pill = this.container.querySelector('#approval-status-pill');
    if (pill) {
      pill.className = "badge-status";
      pill.textContent = "✅ AUTHORIZED & EXECUTING";
    }

    const approveBtn = this.container.querySelector('#approve-plan-btn');
    if (approveBtn) {
      approveBtn.disabled = true;
      approveBtn.innerHTML = "<span>✓ Plan Alpha Executing</span>";
    }

    // Update status in cards
    const statusBadges = this.container.querySelectorAll('.dept-status');
    statusBadges.forEach(b => {
      b.className = "dept-status text-emerald";
      b.textContent = "ACTIVE";
    });

    // Notify user with audio
    sound.speak("Commissioner authorization received. Plan Alpha deployed across Traffic, Works, and Citizen notification agents.");
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
