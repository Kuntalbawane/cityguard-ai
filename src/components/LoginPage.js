// CityGuard AI - Multi-Role Authentication & Access Portal (Nagpur Smart City Edition)
// Serves Government Departments (Commissioner, Traffic Police, Works, Health), Citizens (Nagrik), and New User Registration

import { ROLES, NAGRIK_PROMPTS } from '../data/mockData.js';
import { sound } from '../utils/soundEngine.js';

export class LoginPage {
  constructor(containerId, state, onLoginSuccess) {
    this.container = document.getElementById(containerId);
    this.state = state;
    this.onLoginSuccess = onLoginSuccess;
    this.activeAuthTab = 'department'; // 'department' | 'citizen' | 'register'
    this.selectedDeptRole = ROLES.commissioner;
    this.selectedCitizenPersona = NAGRIK_PROMPTS[0];
    this.otpSent = false;
    this.otpTimer = 30;
  }

  render() {
    this.container.innerHTML = `
      <div class="auth-page-container">
        <!-- Center Auth Card -->
        <div class="auth-card-wrapper">
          <!-- Card Header & National Emblem / Seal -->
          <div class="auth-card-header">
            <div class="auth-emblem-badge">
              <span style="font-size: 2rem;">🇮🇳</span>
              <div class="auth-emblem-text">
                <span class="auth-gov-sub">NAGPUR MUNICIPAL CORPORATION & MAHARASHTRA POLICE</span>
                <h2 class="auth-portal-title">CityGuard Unified Access Gateway</h2>
              </div>
            </div>
            <p class="auth-portal-sub">
              Single-Sign-On Gateway for Nagpur Municipal Corporation (NMC), Police Command, and Citizen Services
            </p>
          </div>

          <!-- Auth Mode Segment Tabs (Departments vs Citizen vs Create New Account) -->
          <div class="auth-tabs-bar">
            <button class="auth-segment-btn ${this.activeAuthTab === 'department' ? 'active' : ''}" data-authtab="department">
              <span class="segment-icon">🏛️</span>
              <span class="segment-text">Department Login</span>
              <span class="segment-pill">Officials</span>
            </button>
            <button class="auth-segment-btn ${this.activeAuthTab === 'citizen' ? 'active' : ''}" data-authtab="citizen">
              <span class="segment-icon">👤</span>
              <span class="segment-text">Citizen Sign In</span>
              <span class="segment-pill highlight">Nagrik</span>
            </button>
            <button class="auth-segment-btn ${this.activeAuthTab === 'register' ? 'active' : ''}" data-authtab="register">
              <span class="segment-icon">✨</span>
              <span class="segment-text">Create New Account</span>
              <span class="segment-pill new-tag">New User</span>
            </button>
          </div>

          <!-- Dynamic Auth Body -->
          <div class="auth-body-container" id="auth-body-mount">
            ${this.renderActiveTabContent()}
          </div>

          <!-- Card Footer Compliance Note -->
          <div class="auth-card-footer">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.74rem; color: var(--text-muted); flex-wrap: wrap; gap: 0.5rem;">
              <span>🔒 256-Bit Encrypted & Aadhaar Tokenized Access</span>
              <span class="font-mono">MeriPehchaan · Aaple Sarkar · NIC SSO</span>
            </div>
          </div>
        </div>

        <!-- Quick 1-Click Instant Demo Login for Evaluators -->
        <div class="auth-demo-helper">
          <div class="helper-title">
            <span class="text-navy">⚡ 1-CLICK INSTANT DEMO LOGIN FOR HACKATHON EVALUATION:</span>
          </div>
          <div class="helper-buttons-row">
            <button class="quick-demo-btn" data-role="commissioner">
              <span>🏛️ Dr. Chaudhari (IAS)</span>
            </button>
            <button class="quick-demo-btn" data-role="traffic">
              <span>🚦 CP Singal (IPS)</span>
            </button>
            <button class="quick-demo-btn" data-role="works">
              <span>🚜 Er. Jamgade (SWD)</span>
            </button>
            <button class="quick-demo-btn" data-role="health">
              <span>🚑 Dr. Selokar (Health)</span>
            </button>
            <button class="quick-demo-btn" data-role="citizen">
              <span>👤 Sunita Tai (Citizen)</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderActiveTabContent() {
    if (this.activeAuthTab === 'department') {
      return this.renderDepartmentAuth();
    } else if (this.activeAuthTab === 'citizen') {
      return this.renderCitizenAuth();
    } else {
      return this.renderRegistrationAuth();
    }
  }

  renderDepartmentAuth() {
    const role = this.selectedDeptRole;
    return `
      <div class="dept-auth-view">
        <div style="margin-bottom: 1.15rem;">
          <label class="input-field-label">Select Departmental Authority (Nagpur Command Hub):</label>
          <div class="dept-role-selector-grid">
            <div class="role-select-box ${role.id === 'commissioner' ? 'selected' : ''}" data-dept="commissioner">
              <div class="role-icon">🏛️</div>
              <div class="role-meta">
                <strong>Municipal Commissioner</strong>
                <span>Executive HITL Approval</span>
              </div>
            </div>
            <div class="role-select-box ${role.id === 'traffic' ? 'selected' : ''}" data-dept="traffic">
              <div class="role-icon">🚦</div>
              <div class="role-meta">
                <strong>Traffic Police Command</strong>
                <span>Arterials & Underpass Gates</span>
              </div>
            </div>
            <div class="role-select-box ${role.id === 'works' ? 'selected' : ''}" data-dept="works">
              <div class="role-icon">🚜</div>
              <div class="role-meta">
                <strong>Municipal Works & SWD</strong>
                <span>Ambazari & SCADA Pumps</span>
              </div>
            </div>
            <div class="role-select-box ${role.id === 'health' ? 'selected' : ''}" data-dept="health">
              <div class="role-icon">🚑</div>
              <div class="role-meta">
                <strong>Health & Disaster Cell</strong>
                <span>Cooling Centers & 108 EMS</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Official Profile Preview Box -->
        <div class="active-official-card" style="border-left-color: ${role.color};">
          <div class="official-avatar">${role.avatar}</div>
          <div class="official-info">
            <div class="official-name-row">
              <strong style="color: var(--navy-900); font-size: 0.95rem;">${role.name}</strong>
              <span class="official-clearance">${role.clearanceLevel}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">${role.title} · ${role.department}</div>
          </div>
        </div>

        <!-- Department Credentials Form -->
        <form id="dept-login-form" class="auth-fields-form">
          <div class="form-group">
            <label class="input-field-label" for="dept-email-input">Official NIC / Gov.in Email</label>
            <div class="input-with-icon">
              <span class="input-icon">📧</span>
              <input type="email" id="dept-email-input" class="auth-input" value="${role.demoEmail}" required>
            </div>
          </div>

          <div class="form-group">
            <label class="input-field-label" for="dept-pin-input">Department Security Key / PIN</label>
            <div class="input-with-icon">
              <span class="input-icon">🔑</span>
              <input type="password" id="dept-pin-input" class="auth-input" value="Gov@Nagpur2026" required>
            </div>
          </div>

          <button type="submit" class="auth-submit-btn" id="dept-submit-btn">
            <span>🔐 Authenticate as ${role.badge.split(' ')[1]} & Open Dashboard &rarr;</span>
          </button>
        </form>
      </div>
    `;
  }

  renderCitizenAuth() {
    return `
      <div class="citizen-auth-view">
        <div class="citizen-notice-banner">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
            <strong style="font-size: 0.85rem; color: var(--navy-800);">🇮🇳 NAGRIK CIVIC AGENT PORTAL (NAGPUR CITY-02)</strong>
            <span class="tab-badge highlight-badge">Free Public Service</span>
          </div>
          <p style="font-size: 0.76rem; color: var(--text-secondary); line-height: 1.45;">
            Access government certificates, widow/old-age pension DBT tracking, and voice assistance in Marathi and Hindi. No middlemen, zero fees.
          </p>
        </div>

        <!-- Citizen Fast Profile Chooser -->
        <div style="margin-bottom: 1.15rem;">
          <label class="input-field-label">Choose Citizen Persona (Instant Demo):</label>
          <div class="citizen-personas-row">
            ${NAGRIK_PROMPTS.map(p => `
              <div class="persona-chip ${p.id === this.selectedCitizenPersona.id ? 'active-persona' : ''}" data-personaid="${p.id}">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <strong style="color: var(--navy-900); font-size: 0.8rem;">${p.speaker.split(' (')[0]}</strong>
                  <span class="sample-chip-lang">${p.language}</span>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.15rem;">${p.intent}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Citizen Phone OTP Form -->
        <form id="citizen-login-form" class="auth-fields-form">
          <div class="form-group">
            <label class="input-field-label" for="citizen-mobile-input">Aadhaar Linked Mobile Number</label>
            <div class="input-with-icon">
              <span class="input-icon">📱</span>
              <input type="tel" id="citizen-mobile-input" class="auth-input" value="+91 98765 43210" placeholder="+91 9XXXX XXXXX">
            </div>
          </div>

          <!-- OTP Box -->
          <div class="form-group" id="otp-input-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
              <label class="input-field-label" style="margin-bottom: 0;">Enter 6-Digit SMS OTP</label>
              <span class="font-mono text-cyan" style="font-size: 0.72rem;" id="otp-status-badge">Auto-filled for demo</span>
            </div>
            <div class="otp-inputs-row">
              <input type="text" class="otp-box" value="5" maxlength="1">
              <input type="text" class="otp-box" value="8" maxlength="1">
              <input type="text" class="otp-box" value="2" maxlength="1">
              <input type="text" class="otp-box" value="9" maxlength="1">
              <input type="text" class="otp-box" value="1" maxlength="1">
              <input type="text" class="otp-box" value="4" maxlength="1">
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; margin-top: 0.25rem;">
            <button type="submit" class="auth-submit-btn" style="background: linear-gradient(135deg, #1e3a8a, #0a192f); flex: 1;">
              <span>👤 Enter Nagrik Civic Agent &rarr;</span>
            </button>
            <button type="button" class="btn-secondary" id="digilocker-btn" style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem;">
              <span>🆔 DigiLocker SSO</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  renderRegistrationAuth() {
    return `
      <div class="register-auth-view">
        <div class="register-welcome-box">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
            <strong style="font-size: 0.85rem; color: #1e3a8a;">✨ NAGPUR SMART CITY · NEW USER REGISTRATION</strong>
            <span class="tab-badge highlight-badge">Instant Verification</span>
          </div>
          <p style="font-size: 0.76rem; color: #334155; line-height: 1.45;">
            Register as a Nagpur resident, municipal officer, or disaster taskforce volunteer to receive localized flood alerts, emergency evacuation routes, and direct Nagrik AI civic assistance.
          </p>
        </div>

        <form id="new-user-register-form" class="auth-fields-form">
          <!-- Account Type -->
          <div class="form-group">
            <label class="input-field-label">Select Account Type / Role:</label>
            <div class="register-role-grid">
              <label class="reg-role-option">
                <input type="radio" name="reg-role-type" value="citizen" checked>
                <div class="reg-role-box">
                  <span class="reg-role-icon">👤</span>
                  <div class="reg-role-meta">
                    <strong>Citizen / Resident</strong>
                    <span>Ward updates & SOS</span>
                  </div>
                </div>
              </label>
              <label class="reg-role-option">
                <input type="radio" name="reg-role-type" value="official">
                <div class="reg-role-box">
                  <span class="reg-role-icon">🏛️</span>
                  <div class="reg-role-meta">
                    <strong>NMC Municipal Officer</strong>
                    <span>Field operations & pumps</span>
                  </div>
                </div>
              </label>
              <label class="reg-role-option">
                <input type="radio" name="reg-role-type" value="traffic">
                <div class="reg-role-box">
                  <span class="reg-role-icon">🚦</span>
                  <div class="reg-role-meta">
                    <strong>Traffic Police Officer</strong>
                    <span>Underpass gates & routes</span>
                  </div>
                </div>
              </label>
              <label class="reg-role-option">
                <input type="radio" name="reg-role-type" value="medic">
                <div class="reg-role-box">
                  <span class="reg-role-icon">🚑</span>
                  <div class="reg-role-meta">
                    <strong>Health & Medic</strong>
                    <span>Triage & cooling centers</span>
                  </div>
                </div>
              </label>
              <label class="reg-role-option">
                <input type="radio" name="reg-role-type" value="volunteer">
                <div class="reg-role-box">
                  <span class="reg-role-icon">🦺</span>
                  <div class="reg-role-meta">
                    <strong>Taskforce Volunteer</strong>
                    <span>Ground relief swarm</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Name & Contact -->
          <div class="form-row-2col">
            <div class="form-group">
              <label class="input-field-label" for="reg-fullname">Full Name</label>
              <div class="input-with-icon">
                <span class="input-icon">👤</span>
                <input type="text" id="reg-fullname" class="auth-input" placeholder="e.g. Pooja Deshmukh" required value="Pooja Deshmukh">
              </div>
            </div>

            <div class="form-group">
              <label class="input-field-label" for="reg-contact">Mobile Number / Email</label>
              <div class="input-with-icon">
                <span class="input-icon">📱</span>
                <input type="text" id="reg-contact" class="auth-input" placeholder="+91 98230 45678" required value="+91 98230 45678">
              </div>
            </div>
          </div>

          <!-- Nagpur Ward / Zone Selection -->
          <div class="form-group">
            <label class="input-field-label" for="reg-ward">Nagpur Administrative Zone & Ward</label>
            <div class="input-with-icon">
              <span class="input-icon">📍</span>
              <select id="reg-ward" class="auth-input auth-select" required>
                <option value="Dharampeth & Ramdaspeth (Zone 2)" selected>Zone 2: Dharampeth & Ramdaspeth (Ambazari Lake Basin)</option>
                <option value="Sitabuldi & Dhantoli (Zone 1)">Zone 1: Sitabuldi & Dhantoli (Zero Mile Metro Hub)</option>
                <option value="Manish Nagar & Somalwada (Zone 3)">Zone 3: Manish Nagar & Somalwada (RUB Drainage Basin)</option>
                <option value="Loha Pul & Cotton Market (Zone 6)">Zone 6: Loha Pul & Cotton Market Underpass</option>
                <option value="Narendra Nagar & Khamla (Zone 4)">Zone 4: Narendra Nagar & Ring Road</option>
                <option value="Hanuman Nagar & Reshimbagh (Zone 5)">Zone 5: Hanuman Nagar & Sakkaradara</option>
                <option value="Pardi & Lakadganj (Zone 7)">Zone 7: Pardi & Bhandara Road Corridor</option>
                <option value="Mangalwari & Sadar (Zone 8)">Zone 8: Mangalwari, Sadar & Civil Lines</option>
                <option value="Ashi Nagar (Zone 9)">Zone 9: Ashi Nagar & Pili River Northern Basin</option>
                <option value="Nehru Nagar (Zone 10)">Zone 10: Nehru Nagar & Eastern Suburbs</option>
              </select>
            </div>
          </div>

          <!-- Password & Confirm Password -->
          <div class="form-row-2col">
            <div class="form-group">
              <label class="input-field-label" for="reg-password">Security Password / MPIN</label>
              <div class="input-with-icon">
                <span class="input-icon">🔒</span>
                <input type="password" id="reg-password" class="auth-input" placeholder="••••••••" required value="Nagpur@2026">
              </div>
            </div>

            <div class="form-group">
              <label class="input-field-label" for="reg-confirm-password">Confirm Password</label>
              <div class="input-with-icon">
                <span class="input-icon">🔒</span>
                <input type="password" id="reg-confirm-password" class="auth-input" placeholder="••••••••" required value="Nagpur@2026">
              </div>
            </div>
          </div>

          <!-- Emergency Alert Opt-ins -->
          <div class="reg-checkbox-group">
            <label class="reg-checkbox-item">
              <input type="checkbox" id="reg-optin-alerts" checked>
              <span>📲 Opt-in to real-time WhatsApp & SMS Flash Flood & Heatwave emergency broadcasts</span>
            </label>
            <label class="reg-checkbox-item">
              <input type="checkbox" id="reg-optin-nagrik" checked>
              <span>🤖 Enable autonomous Nagrik AI civic assistance (Aaple Sarkar / DBT Tracker)</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="auth-submit-btn" id="reg-submit-btn">
            <span>✨ Create Account & Enter Home Dashboard &rarr;</span>
          </button>
        </form>
      </div>
    `;
  }

  bindEvents() {
    // Auth Tab switching (Department vs Citizen vs Register)
    const segmentBtns = this.container.querySelectorAll('.auth-segment-btn');
    segmentBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.authtab;
        this.activeAuthTab = tab;
        segmentBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        const mount = this.container.querySelector('#auth-body-mount');
        if (mount) {
          mount.innerHTML = this.renderActiveTabContent();
          this.bindFormEvents();
        }
        sound.playRadarPing();
      });
    });

    this.bindFormEvents();

    // 1-Click Quick Demo Login buttons at bottom
    const quickBtns = this.container.querySelectorAll('.quick-demo-btn');
    quickBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const roleKey = e.currentTarget.dataset.role;
        this.executeQuickLogin(roleKey);
      });
    });
  }

  bindFormEvents() {
    // Dept role select boxes
    const roleBoxes = this.container.querySelectorAll('.role-select-box');
    roleBoxes.forEach(box => {
      box.addEventListener('click', (e) => {
        const deptKey = e.currentTarget.dataset.dept;
        this.selectedDeptRole = ROLES[deptKey];
        const mount = this.container.querySelector('#auth-body-mount');
        if (mount) {
          mount.innerHTML = this.renderDepartmentAuth();
          this.bindFormEvents();
        }
        sound.playRadarPing();
      });
    });

    // Citizen persona selector
    const personaChips = this.container.querySelectorAll('.persona-chip');
    personaChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const pId = e.currentTarget.dataset.personaid;
        this.selectedCitizenPersona = NAGRIK_PROMPTS.find(p => p.id === pId);
        personaChips.forEach(c => c.classList.remove('active-persona'));
        e.currentTarget.classList.add('active-persona');
        sound.playRadarPing();
      });
    });

    // Department Login Form Submit
    const deptForm = this.container.querySelector('#dept-login-form');
    if (deptForm) {
      deptForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.completeLogin(this.selectedDeptRole);
      });
    }

    // Citizen Login Form Submit
    const citizenForm = this.container.querySelector('#citizen-login-form');
    if (citizenForm) {
      citizenForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const citizenRole = {
          ...ROLES.citizen,
          name: this.selectedCitizenPersona.speaker.split(' (')[0],
          title: `Verified Citizen (${this.selectedCitizenPersona.speaker})`,
          activePrompt: this.selectedCitizenPersona
        };
        this.completeLogin(citizenRole);
      });
    }

    // New User Registration Form Submit
    const regForm = this.container.querySelector('#new-user-register-form');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fullname = this.container.querySelector('#reg-fullname').value.trim() || 'Nagpur Citizen';
        const contact = this.container.querySelector('#reg-contact').value.trim();
        const ward = this.container.querySelector('#reg-ward').value;
        const roleTypeRadio = this.container.querySelector('input[name="reg-role-type"]:checked');
        const roleType = roleTypeRadio ? roleTypeRadio.value : 'citizen';

        let avatar = '👤';
        let badge = '👤 CITIZEN';
        let title = `Nagpur Resident · ${ward.split(' (')[0]}`;
        let dept = 'Nagpur Civic Community';
        let clearance = 'Citizen Verified (Aadhaar Linked)';

        if (roleType === 'official') {
          avatar = '🏛️';
          badge = '🏛️ NMC OFFICER';
          title = `NMC Zonal Officer · ${ward.split(' (')[0]}`;
          dept = 'Nagpur Municipal Corporation';
          clearance = 'Level 3 (Zonal Operations)';
        } else if (roleType === 'traffic') {
          avatar = '🚦';
          badge = '🚦 TRAFFIC POLICE';
          title = `Sub-Inspector (Traffic) · ${ward.split(' (')[0]}`;
          dept = 'Nagpur Police Traffic Wing';
          clearance = 'Level 3 (Underpass Gate Control)';
        } else if (roleType === 'medic') {
          avatar = '🚑';
          badge = '🚑 MEDICAL OFFICER';
          title = `Medical Officer (EMS) · ${ward.split(' (')[0]}`;
          dept = 'NMC Health & Disaster Triage';
          clearance = 'Level 3 (Cooling Centers & Triage)';
        } else if (roleType === 'volunteer') {
          avatar = '🦺';
          badge = '🦺 TASKFORCE VOLUNTEER';
          title = `Disaster Response Volunteer · ${ward.split(' (')[0]}`;
          dept = 'Nagpur Civil Defence Swarm';
          clearance = 'Citizen Taskforce Responder';
        }

        const newUserRole = {
          id: `user_${Date.now()}`,
          name: fullname,
          handle: `@${fullname.toLowerCase().replace(/\s+/g, '_')}_ngp`,
          title: title,
          department: dept,
          badge: badge,
          color: '#1e3a8a',
          avatar: avatar,
          clearanceLevel: clearance,
          defaultTab: 'social-feed',
          ward: ward,
          contact: contact,
          isNewRegistration: true
        };

        sound.playApprovalFanfare();
        sound.speak(`Registration complete. Welcome to Nagpur Smart City, ${fullname}.`);
        this.completeLogin(newUserRole);
      });
    }

    // DigiLocker SSO Button
    const digiBtn = this.container.querySelector('#digilocker-btn');
    if (digiBtn) {
      digiBtn.addEventListener('click', () => {
        sound.playApprovalFanfare();
        sound.speak("DigiLocker Single-Sign-On verified with Aadhaar Virtual ID.");
        const citizenRole = {
          ...ROLES.citizen,
          name: this.selectedCitizenPersona.speaker.split(' (')[0],
          title: `Verified Citizen (${this.selectedCitizenPersona.speaker})`,
          activePrompt: this.selectedCitizenPersona
        };
        this.completeLogin(citizenRole);
      });
    }
  }

  executeQuickLogin(roleKey) {
    sound.playApprovalFanfare();
    if (roleKey === 'citizen') {
      const citizenRole = {
        ...ROLES.citizen,
        name: this.selectedCitizenPersona.speaker.split(' (')[0],
        title: `Verified Citizen (${this.selectedCitizenPersona.speaker})`,
        activePrompt: this.selectedCitizenPersona
      };
      this.completeLogin(citizenRole);
    } else {
      const deptRole = ROLES[roleKey] || ROLES.commissioner;
      this.completeLogin(deptRole);
    }
  }

  completeLogin(userRole) {
    this.state.currentUser = userRole;
    this.state.isLoggedIn = true;
    sound.playApprovalFanfare();
    sound.speak(`Welcome ${userRole.name}. Authenticated as ${userRole.badge}.`);

    if (typeof this.onLoginSuccess === 'function') {
      this.onLoginSuccess(userRole);
    }
  }
}
