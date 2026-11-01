import { NAGRIK_PROMPTS, CALL_SIMULATION_SCRIPT } from '../data/mockData.js';
import { sound } from '../utils/soundEngine.js';
import { apiService } from '../services/apiService.js';
import { geminiLiveEngine } from '../services/geminiLiveEngine.js';

export class NagrikAI {
  constructor(containerId, state) {
    this.container = document.getElementById(containerId);
    this.state = state;
    this.selectedPrompt = NAGRIK_PROMPTS[0];
    this.isRecording = false;
    this.computerUseStep = 0; // 0 to 4
    this.computerUseInterval = null;
    this.callScriptIndex = 0;
    this.callInterval = null;
    this.waveformAnimationId = null;
    this.geminiAnalysis = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="nagrik-grid">
        <!-- Left Column: Voice Intake Studio & Intent Extractor -->
        <div class="nagrik-left-col">
          <!-- Voice Intake Card -->
          <div class="voice-intake-card">
            <div class="voice-card-header">
              <div class="voice-card-title">
                <span>🎙️ Multilingual Voice Intake</span>
              </div>
              <span class="tab-badge highlight-badge">Indian Dialects</span>
            </div>

            <!-- Waveform Canvas -->
            <div class="voice-visualizer-box">
              <canvas id="nagrik-waveform" class="waveform-canvas" width="360" height="90"></canvas>
              <div id="waveform-label" style="position: absolute; bottom: 6px; font-size: 0.65rem; color: var(--text-muted); font-family: var(--font-mono);">
                READY FOR VOICE INPUT
              </div>
            </div>

            <!-- Mic Control Row -->
            <div class="voice-controls-row">
              <button id="mic-toggle-btn" class="mic-action-btn" title="Click to Speak / Record">
                <span>🎤</span>
              </button>
              <div class="mic-status-label">
                <span class="mic-status-title" id="mic-status-text">Click Mic or Choose Citizen Sample</span>
                <span class="mic-status-sub">Understands Hindi, Kannada, Tamil, Telugu, English</span>
              </div>
            </div>

            <!-- Sample Citizen Voice Prompts -->
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem; text-transform: uppercase;">
              Realistic Citizen Audio Scenarios:
            </div>
            <div class="voice-samples-box">
              ${NAGRIK_PROMPTS.map(p => `
                <div class="sample-chip ${p.id === this.selectedPrompt.id ? 'active-sample' : ''}" data-id="${p.id}">
                  <div>
                    <strong style="color: var(--navy-900); font-size: 0.75rem;">${p.speaker}</strong>
                    <div style="color: var(--text-secondary); font-size: 0.7rem; text-overflow: ellipsis; white-space: nowrap; max-width: 250px; overflow: hidden;">
                      "${p.audioText}"
                    </div>
                  </div>
                  <span class="sample-chip-lang">${p.language}</span>
                </div>
              `).join('')}
            </div>

            <!-- Extracted Intent & Document Requirements -->
            <div class="intent-extractor-box" id="intent-extractor-box">
              ${this.renderIntentBox()}
            </div>
          </div>

          <!-- Citizen Consent & Data-Handling Vault -->
          <div class="consent-vault-card">
            <div class="consent-header">
              <div class="consent-title">
                <span>🛡️ Citizen Privacy & Consent Vault</span>
              </div>
              <span class="badge-status">ZERO-KNOWLEDGE</span>
            </div>
            <p style="font-size: 0.72rem; color: var(--text-secondary); margin-bottom: 0.65rem; line-height: 1.4;">
              Cryptographically masks citizen identity credentials before transmitting to government portals. Zero data stored after task completion.
            </p>
            <div class="consent-toggles-list">
              <div class="consent-toggle-row">
                <span>Aadhaar Masking (XXXX-XXXX-4819)</span>
                <label class="switch">
                  <input type="checkbox" checked disabled>
                  <span class="slider"></span>
                </label>
              </div>
              <div class="consent-toggle-row">
                <span>Single-Purpose DigiLocker Certificate Pull</span>
                <label class="switch">
                  <input type="checkbox" checked id="consent-digilocker">
                  <span class="slider"></span>
                </label>
              </div>
              <div class="consent-toggle-row">
                <span>Authorize Autonomous Phone Follow-up</span>
                <label class="switch">
                  <input type="checkbox" checked id="consent-phonecall">
                  <span class="slider"></span>
                </label>
              </div>
              <div class="consent-toggle-row">
                <span>Auto-Purge Session Documents on Approval</span>
                <label class="switch">
                  <input type="checkbox" checked id="consent-autopurge">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Computer-Use Simulation & Stalled Call Agent -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <!-- Computer-Use Portal Automation Simulator -->
          <div class="portal-frame-wrapper">
            <div class="browser-bar">
              <div class="browser-dots">
                <span class="b-dot b-red"></span>
                <span class="b-dot b-yellow"></span>
                <span class="b-dot b-green"></span>
              </div>
              <div class="browser-url-input">
                <span>🔒</span>
                <span id="portal-url-display">https://sevasindhu.karnataka.gov.in/service/apply?scheme=pension-dbt</span>
              </div>
              <span class="browser-badge-agent">
                <span class="pulse-dot"></span>
                <span>AGENT COMPUTER USE</span>
              </span>
            </div>

            <!-- Browser Viewport with Artificial Cursor -->
            <div class="browser-viewport" id="portal-viewport">
              <!-- Animated Cursor -->
              <div class="agent-ai-cursor" id="ai-cursor" style="top: 140px; left: 160px;">
                <svg viewBox="0 0 24 24">
                  <path d="M4 0l16 12-7 2-4 8z"/>
                </svg>
                <span class="cursor-tag" id="cursor-tag">Nagrik AI</span>
              </div>

              <!-- Portal Content Simulation -->
              <div class="mock-portal-header">
                <div class="portal-gov-title">
                  <span>🏛️ National Civic & Social Welfare Services Portal</span>
                </div>
                <div class="portal-step-stepper" id="portal-stepper">
                  <span class="step-chip done">1. Identity</span>
                  <span class="step-chip active">2. Scheme Details</span>
                  <span class="step-chip">3. KYC Upload</span>
                  <span class="step-chip">4. Submission</span>
                </div>
              </div>

              <!-- Interactive Portal Form View -->
              <div id="portal-form-body" style="display: flex; flex-direction: column; gap: 1rem;">
                ${this.renderPortalForm(0)}
              </div>

              <!-- Portal Automation Control Bar -->
              <div style="margin-top: auto; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.4); padding: 0.65rem 1rem; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.08);">
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                  <strong class="text-cyan">Computer Use Status:</strong>
                  <span id="computer-use-status">Autonomous form filling in progress...</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <button id="step-portal-btn" class="pill-btn">Next Step &rarr;</button>
                  <button id="auto-portal-btn" class="pill-btn" style="background: var(--cyan-500); color: #fff;">▶ Auto Run</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Stalled Application Follow-Up Phone Call Agent Simulator -->
          <div class="stalled-call-simulator">
            <div class="call-header">
              <div class="call-title">
                <span>📞 Autonomous Voice Call Follow-Up Agent</span>
              </div>
              <span class="tab-badge alert-pulse" id="call-status-badge">STALLED AT DESK 3 (22 DAYS)</span>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.75rem; line-height: 1.4;">
              When applications stall indefinitely, Nagrik AI autonomously dials the Taluk Revenue Office, holds a natural dialogue with the officer, explains the missing NPCI bank mapping, and secures immediate clearance.
            </p>

            <div class="call-dialogue-transcript" id="call-transcript-box">
              ${this.renderCallDialogue()}
            </div>

            <div style="margin-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
              <span class="font-mono text-muted" style="font-size: 0.7rem;">AUDIO PROTOCOL: WEBRTC VOICE BOT</span>
              <button id="trigger-call-sim-btn" class="btn-primary" style="padding: 0.45rem 0.95rem; font-size: 0.78rem;">
                <span>▶ Play Stalled Office Call Simulation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.startWaveformVisualizer();
  }

  renderIntentBox() {
    const p = this.selectedPrompt;
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem;">
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--navy-900);">
          🤖 PARSED CIVIC INTENT & ENTITIES:
        </span>
        <span class="badge-status live-pulse" style="font-size: 0.6rem;"><span class="pulse-dot"></span> GEMINI 1.5 FLASH</span>
      </div>
      <div class="intent-row">
        <span class="intent-key">Citizen Name:</span>
        <span class="intent-val">${p.speaker}</span>
      </div>
      <div class="intent-row">
        <span class="intent-key">Detected Need:</span>
        <span class="intent-val text-amber">${p.intent}</span>
      </div>
      <div class="intent-row">
        <span class="intent-key">Government Portal:</span>
        <span class="intent-val text-cyan">${p.portalName}</span>
      </div>
      <div class="intent-row">
        <span class="intent-key">Required Credentials:</span>
        <span class="intent-val text-emerald">${p.requiredDocs.join(', ')}</span>
      </div>
      <div class="intent-row">
        <span class="intent-key">Resolution SLA:</span>
        <span class="intent-val text-emerald">${p.estimatedDays}</span>
      </div>

      <div style="margin-top: 0.65rem; padding-top: 0.5rem; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.68rem; color: var(--text-muted); font-family: var(--font-mono);">
          ${this.geminiAnalysis ? '✨ Live Gemini Reasoning Cached' : 'Ready for Live Gemini Parsing'}
        </span>
        <button id="trigger-gemini-parse-btn" class="pill-btn" style="background: #eff6ff; color: var(--navy-700); border-color: #bfdbfe; font-size: 0.7rem; cursor: pointer;">
          🧠 Re-Analyze with Gemini AI
        </button>
      </div>
      ${this.geminiAnalysis ? `
        <div style="margin-top: 0.5rem; background: #f8fafc; border-left: 3px solid var(--navy-700); padding: 0.5rem; border-radius: 4px; font-size: 0.72rem; color: var(--navy-900); line-height: 1.4;">
          ${this.geminiAnalysis.replace(/\n/g, '<br>')}
        </div>
      ` : ''}
    `;
  }

  renderPortalForm(step) {
    const p = this.selectedPrompt;

    if (step === 0) {
      return `
        <div class="portal-form-grid">
          <div class="portal-field-group">
            <label class="portal-label">Applicant Full Name</label>
            <input type="text" class="portal-input highlight-autofill" value="${p.speaker.split(' (')[0]}" readonly>
          </div>
          <div class="portal-field-group">
            <label class="portal-label">Aadhaar Tokenized ID (Virtual UID)</label>
            <input type="text" class="portal-input highlight-autofill" value="XXXX-XXXX-4819" readonly>
          </div>
          <div class="portal-field-group">
            <label class="portal-label">Target Government Scheme</label>
            <input type="text" class="portal-input" value="${p.intent}" readonly>
          </div>
          <div class="portal-field-group">
            <label class="portal-label">State Jurisdiction</label>
            <input type="text" class="portal-input" value="Karnataka / National Portal" readonly>
          </div>
        </div>
        <div style="background: rgba(14, 165, 233, 0.08); border: 1px dashed var(--cyan-400); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.75rem; color: #cbd5e1;">
          🔐 <strong>Computer Use Agent Action:</strong> Solved visual captcha with OCR agent. Automatically retrieved tokenized proof from DigiLocker API under citizen consent policy.
        </div>
      `;
    } else if (step === 1) {
      return `
        <div class="portal-form-grid">
          <div class="portal-field-group">
            <label class="portal-label">Bank Account Number (Masked)</label>
            <input type="text" class="portal-input highlight-autofill" value="SBI ········4019" readonly>
          </div>
          <div class="portal-field-group">
            <label class="portal-label">Bank IFSC Code</label>
            <input type="text" class="portal-input highlight-autofill" value="SBIN0004128 (Jayanagar)" readonly>
          </div>
          <div class="portal-field-group">
            <label class="portal-label">DBT NPCI Seeding Status</label>
            <input type="text" class="portal-input" style="color: #ef4444; font-weight: bold;" value="Flagged E-04 (Mismatch Resolved by Agent)" readonly>
          </div>
          <div class="portal-field-group">
            <label class="portal-label">Income Certificate Reg No.</label>
            <input type="text" class="portal-input highlight-autofill" value="RD003829104" readonly>
          </div>
        </div>
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid var(--emerald-400); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.75rem; color: #a7f3d0;">
          ✅ <strong>Form Autofill Complete:</strong> Agent matched biometric Aadhaar token with bank IFSC mapping. Bypassed manual cyber-cafe middleman step.
        </div>
      `;
    } else {
      return `
        <div style="text-align: center; padding: 2rem 1rem; background: #f0fdf4; border: 1px solid #86efac; border-radius: var(--radius-md);">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🎉</div>
          <h3 style="font-size: 1.1rem; font-weight: 800; color: #065f46; margin-bottom: 0.35rem;">
            Application Successfully Submitted via Computer Use
          </h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">
            Official Nagpur Aaple Sarkar / Seva Kendra Acknowledgement Generated
          </p>
          <div style="display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; padding: 0.65rem 1.25rem; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.9rem; color: var(--navy-800); font-weight: 700;">
            ACK REF NO: MH-NGP-2026-984128
          </div>
          <p style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.75rem;">
            Citizen notified in their native language with download link & SMS confirmation.
          </p>
        </div>
      `;
    }
  }

  renderCallDialogue() {
    return CALL_SIMULATION_SCRIPT.map(msg => `
      <div class="dialogue-bubble ${msg.speaker === 'agent' ? 'dialogue-agent' : 'dialogue-officer'}">
        <div class="dialogue-speaker text-${msg.speaker === 'agent' ? 'cyan' : 'amber'}">
          ${msg.speaker === 'agent' ? '🤖' : '👔'} ${msg.name} (${msg.time})
        </div>
        <div>${msg.text}</div>
      </div>
    `).join('');
  }

  bindEvents() {
    // Mic Toggle with Web Speech API
    const micBtn = this.container.querySelector('#mic-toggle-btn');
    const micStatus = this.container.querySelector('#mic-status-text');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        this.isRecording = !this.isRecording;
        micBtn.classList.toggle('recording', this.isRecording);
        if (this.isRecording) {
          micStatus.textContent = "Listening to Citizen Microphone (Web Speech API)...";
          sound.playAlertChime();

          const started = apiService.startSpeechRecognition({
            lang: 'hi-IN',
            onResult: (text, isFinal) => {
              micStatus.textContent = `Recognized: "${text}"`;
              if (isFinal) {
                this.selectedPrompt.audioText = text;
                const intentBox = this.container.querySelector('#intent-extractor-box');
                if (intentBox) intentBox.innerHTML = this.renderIntentBox();
              }
            },
            onError: (err) => {
              this.isRecording = false;
              micBtn.classList.remove('recording');
              micStatus.textContent = "Voice intent recognized (Simulated)";
              sound.speak("Voice intake recognized. Processing pension DBT reactivation for citizen Rekha Devi.");
            },
            onEnd: () => {
              this.isRecording = false;
              micBtn.classList.remove('recording');
              micStatus.textContent = "Voice intent parsed successfully!";
              sound.speak("Voice intake processed for citizen " + this.selectedPrompt.speaker);
            }
          });

          if (!started) {
            setTimeout(() => {
              if (this.isRecording) {
                this.isRecording = false;
                micBtn.classList.remove('recording');
                micStatus.textContent = "Voice intent parsed successfully!";
                sound.speak("Voice intake recognized. Processing pension DBT reactivation for citizen Rekha Devi.");
              }
            }, 3000);
          }
        } else {
          apiService.stopSpeechRecognition();
          micStatus.textContent = "Click Mic or Choose Citizen Sample";
        }
      });
    }

    // Sample Selection
    const sampleChips = this.container.querySelectorAll('.sample-chip');
    sampleChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.selectedPrompt = NAGRIK_PROMPTS.find(p => p.id === id);
        sampleChips.forEach(c => c.classList.remove('active-sample'));
        e.currentTarget.classList.add('active-sample');

        const intentBox = this.container.querySelector('#intent-extractor-box');
        if (intentBox) intentBox.innerHTML = this.renderIntentBox();

        const formBody = this.container.querySelector('#portal-form-body');
        if (formBody) formBody.innerHTML = this.renderPortalForm(0);

        sound.speak(`Selected ${this.selectedPrompt.speaker}. Citizen request: ${this.selectedPrompt.audioText}`);
      });
    });

    // Step Portal Button
    const stepBtn = this.container.querySelector('#step-portal-btn');
    if (stepBtn) {
      stepBtn.addEventListener('click', () => {
        this.computerUseStep = (this.computerUseStep + 1) % 3;
        this.updatePortalStep();
      });
    }

    // Auto Run Button
    const autoBtn = this.container.querySelector('#auto-portal-btn');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        this.runAutoComputerUse();
      });
    }

    // Call Simulator Button
    const callBtn = this.container.querySelector('#trigger-call-sim-btn');
    if (callBtn) {
      callBtn.addEventListener('click', () => {
        this.playCallSimulation();
      });
    }

    // Trigger Gemini Civic Parsing Button
    const parseBtn = this.container.querySelector('#trigger-gemini-parse-btn');
    if (parseBtn) {
      parseBtn.addEventListener('click', async () => {
        parseBtn.innerHTML = '<span>⏳ Gemini Reasoning...</span>';
        sound.playRadarPing();
        const res = await geminiLiveEngine.processCitizenGrievance({
          prompt: this.selectedPrompt.audioText,
          citizenName: this.selectedPrompt.speaker
        });
        this.geminiAnalysis = res.rawAnalysis;
        const intentBox = this.container.querySelector('#intent-extractor-box');
        if (intentBox) {
          intentBox.innerHTML = this.renderIntentBox();
          this.bindEvents();
        }
        sound.playApprovalFanfare();
      });
    }
  }

  updatePortalStep() {
    const formBody = this.container.querySelector('#portal-form-body');
    const statusText = this.container.querySelector('#computer-use-status');
    const cursor = this.container.querySelector('#ai-cursor');
    const cursorTag = this.container.querySelector('#cursor-tag');

    if (formBody) {
      formBody.innerHTML = this.renderPortalForm(this.computerUseStep);
    }

    // Move cursor around
    if (cursor) {
      const positions = [
        { top: '140px', left: '160px', text: 'Typing Name' },
        { top: '220px', left: '340px', text: 'Verifying Bank' },
        { top: '320px', left: '260px', text: 'Submitting Form' }
      ];
      const p = positions[this.computerUseStep];
      cursor.style.top = p.top;
      cursor.style.left = p.left;
      if (cursorTag) cursorTag.textContent = p.text;
    }

    if (statusText) {
      if (this.computerUseStep === 0) statusText.textContent = "Step 1: Captcha solved & Identity tokens populated";
      else if (this.computerUseStep === 1) statusText.textContent = "Step 2: Bank IFSC & DigiLocker KYC verified";
      else statusText.textContent = "Step 3: Submission Confirmed! Ack generated.";
    }

    sound.playRadarPing();
  }

  runAutoComputerUse() {
    this.computerUseStep = 0;
    this.updatePortalStep();

    setTimeout(() => {
      this.computerUseStep = 1;
      this.updatePortalStep();
    }, 1500);

    setTimeout(() => {
      this.computerUseStep = 2;
      this.updatePortalStep();
      sound.playApprovalFanfare();
      sound.speak("Computer use execution complete. Application successfully submitted to Nagpur Aaple Sarkar Gateway.");

      // Dispatch real audit to NMC Gateway
      apiService.submitGrievanceToAapleSarkar({
        name: this.selectedPrompt.speaker,
        ward: 'Zone 3 - Dharampeth',
        scheme: this.selectedPrompt.intent
      });
    }, 3200);
  }

  playCallSimulation() {
    const callBadge = this.container.querySelector('#call-status-badge');
    if (callBadge) {
      callBadge.className = "badge-status";
      callBadge.textContent = "🔴 LIVE CALL TO TALUK DESK IN PROGRESS";
    }

    sound.playAlertChime();
    sound.speak("Dialing Sub-Registrar Office Desk 3. Namaste, I am calling on behalf of citizen Rekha Devi regarding application reference KA-SS-2026-984128. Desk 4 verification has now been authorized.");

    setTimeout(() => {
      if (callBadge) {
        callBadge.className = "badge-status";
        callBadge.textContent = "✅ CALL RESOLVED: DESK 4 APPROVED";
      }
    }, 4500);
  }

  startWaveformVisualizer() {
    const canvas = document.getElementById('nagrik-waveform');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let phase = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = this.isRecording ? '#ef4444' : '#a855f7';

      const amplitude = this.isRecording ? 28 : 10;
      const freq = this.isRecording ? 0.05 : 0.02;

      for (let x = 0; x < canvas.width; x++) {
        const y = (canvas.height / 2) + Math.sin(x * freq + phase) * amplitude * Math.sin(x / canvas.width * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += this.isRecording ? 0.15 : 0.04;
      this.waveformAnimationId = requestAnimationFrame(draw);
    };

    this.waveformAnimationId = requestAnimationFrame(draw);
  }

  destroy() {
    if (this.waveformAnimationId) {
      cancelAnimationFrame(this.waveformAnimationId);
    }
  }
}
