// CityGuard AI - Counterfactual Planner Matrix & Digital Twin Simulator

import { sound } from '../utils/soundEngine.js';
import { geminiLiveEngine } from '../services/geminiLiveEngine.js';

export class PlannerMatrix {
  constructor(containerId, state) {
    this.container = document.getElementById(containerId);
    this.state = state;
    this.simulationTimeStep = 2; // Index into simulation steps
    this.unsubscribe = null;
  }

  render() {
    const liveCity = geminiLiveEngine.getLiveCityData();
    const planA = liveCity.counterfactualPlans.planA;
    const planB = liveCity.counterfactualPlans.planB;

    this.container.innerHTML = `
      <div class="digital-twin-grid">
        <!-- Left: Side-by-Side Counterfactual Comparison -->
        <div class="counterfactual-matrix">
          <div class="matrix-header-card">
            <div class="matrix-header-title">
              <span>🔮 Counterfactual "What-If" Planner Agent</span>
              <span class="badge-track">Simulate Before Acting</span>
            </div>
            <p class="matrix-header-desc">
              The Planner Agent simulates multiple alternate futures on the city's digital twin before dispatching real-world actions.
              Below is the side-by-side comparative analysis of <strong>Plan Alpha (Autonomous Coordinated Preemption)</strong> vs 
              <strong>Plan Beta (Status-Quo Departmental Sinks)</strong>.
            </p>
          </div>

          <!-- Comparison Cards Grid -->
          <div class="matrix-comparison-cards">
            <!-- Plan Alpha (Recommended) -->
            <div class="plan-card-full plan-recommended">
              <div class="plan-badge-top">
                <span class="badge-status">⭐ RECOMMENDED CHOICE</span>
                <span class="font-mono text-emerald" style="font-size: 0.75rem;">AI CONFIDENCE: 98.4%</span>
              </div>
              <div>
                <h3 class="plan-title-lg">${planA.name}</h3>
                <span class="plan-tagline">${planA.subtitle}</span>
              </div>

              <!-- Metric Bars Stack -->
              <div class="metric-bars-stack">
                <div class="metric-bar-item">
                  <div class="metric-label-row">
                    <span>Casualty / Entrapment Risk</span>
                    <strong class="text-emerald">${planA.metrics.projectedCasualties}</strong>
                  </div>
                  <div class="metric-progress-bg">
                    <div class="metric-progress-fill fill-emerald" style="width: 5%;"></div>
                  </div>
                </div>

                <div class="metric-bar-item">
                  <div class="metric-label-row">
                    <span>Average Commute Delay</span>
                    <strong class="text-emerald">${planA.metrics.commuteDelay}</strong>
                  </div>
                  <div class="metric-progress-bg">
                    <div class="metric-progress-fill fill-emerald" style="width: 15%;"></div>
                  </div>
                </div>

                <div class="metric-bar-item">
                  <div class="metric-label-row">
                    <span>Projected Infrastructure Damage</span>
                    <strong class="text-cyan">${planA.metrics.infrastructureDamage}</strong>
                  </div>
                  <div class="metric-progress-bg">
                    <div class="metric-progress-fill fill-cyan" style="width: 12%;"></div>
                  </div>
                </div>

                <div class="metric-bar-item">
                  <div class="metric-label-row">
                    <span>Inter-Department Sync Latency</span>
                    <strong class="text-emerald">${planA.metrics.coordinationLatency}</strong>
                  </div>
                  <div class="metric-progress-bg">
                    <div class="metric-progress-fill fill-emerald" style="width: 8%;"></div>
                  </div>
                </div>
              </div>

              <!-- Key Coordinated Actions -->
              <div>
                <h4 style="font-size: 0.82rem; font-weight: 700; color: var(--navy-900); margin-bottom: 0.5rem;">Preemptive Multi-Agent Action Vector:</h4>
                <ul class="plan-actions-checklist">
                  ${planA.actions.map(act => `
                    <li>
                      <span class="text-emerald">✓</span>
                      <span><strong>${act.dept}:</strong> ${act.task}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>

              <button class="plan-select-btn btn-primary" id="btn-select-planA">
                <span>✓ Select & Enact Plan Alpha</span>
              </button>
            </div>

            <!-- Plan Beta (Status Quo / Legacy) -->
            <div class="plan-card-full plan-legacy">
              <div class="plan-badge-top">
                <span class="tab-badge alert-pulse">⚠️ LEGACY STATUS QUO</span>
                <span class="font-mono text-rose" style="font-size: 0.75rem;">HIGH FAILURE RISK</span>
              </div>
              <div>
                <h3 class="plan-title-lg">${planB.name}</h3>
                <span class="plan-tagline">${planB.subtitle}</span>
              </div>

              <!-- Metric Bars Stack -->
              <div class="metric-bars-stack">
                <div class="metric-bar-item">
                  <div class="metric-label-row">
                    <span>Casualty / Entrapment Risk</span>
                    <strong class="text-rose">${planB.metrics.projectedCasualties}</strong>
                  </div>
                  <div class="metric-progress-bg">
                    <div class="metric-progress-fill fill-rose" style="width: 85%;"></div>
                  </div>
                </div>

                <div class="metric-bar-item">
                  <div class="metric-label-row">
                    <span>Average Commute Delay</span>
                    <strong class="text-rose">${planB.metrics.commuteDelay}</strong>
                  </div>
                  <div class="metric-progress-bg">
                    <div class="metric-progress-fill fill-rose" style="width: 95%;"></div>
                  </div>
                </div>

                <div class="metric-bar-item">
                  <div class="metric-label-row">
                    <span>Projected Infrastructure Damage</span>
                    <strong class="text-rose">${planB.metrics.infrastructureDamage}</strong>
                  </div>
                  <div class="metric-progress-bg">
                    <div class="metric-progress-fill fill-rose" style="width: 88%;"></div>
                  </div>
                </div>

                <div class="metric-bar-item">
                  <div class="metric-label-row">
                    <span>Inter-Department Sync Latency</span>
                    <strong class="text-amber">${planB.metrics.coordinationLatency}</strong>
                  </div>
                  <div class="metric-progress-bg">
                    <div class="metric-progress-fill fill-amber" style="width: 75%;"></div>
                  </div>
                </div>
              </div>

              <!-- Key Coordinated Actions -->
              <div>
                <h4 style="font-size: 0.82rem; font-weight: 700; color: var(--navy-900); margin-bottom: 0.5rem;">Siloed Department Protocols:</h4>
                <ul class="plan-actions-checklist">
                  ${planB.actions.map(act => `
                    <li>
                      <span class="text-rose">✗</span>
                      <span><strong>${act.dept}:</strong> ${act.task}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>

              <button class="plan-select-btn btn-secondary" id="btn-select-planB" style="opacity: 0.8;">
                <span>Simulate Reactive Failure</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Interactive Digital Twin Timeline Simulation -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <span class="panel-title-icon">⏱️</span>
              <span>Digital Twin Timeline Scrubbing</span>
            </div>
          </div>

          <div class="panel-body">
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.45;">
              Scrub the timeline slider to observe hydraulic accumulation and traffic density under counterfactual simulation.
            </p>

            <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); border: 1px solid #cbd5e1;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.5rem;">
                <span class="text-muted">SIMULATION HORIZON:</span>
                <strong class="font-mono" style="color: var(--navy-700); font-weight: 800;" id="sim-horizon-text">T+00:00 (Peak Cloudburst Arrival)</strong>
              </div>
              <input type="range" id="timeline-slider" min="0" max="4" value="2" step="1" style="width: 100%; accent-color: var(--navy-700); cursor: pointer;">
              <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--text-muted); margin-top: 0.35rem;">
                <span>T-30m (Early Warning)</span>
                <span>T-15m</span>
                <span style="color: var(--navy-900); font-weight: 800;">T+0 (Peak)</span>
                <span>T+30m</span>
                <span>T+60m (Clearance)</span>
              </div>
            </div>

            <!-- Timeline Simulation Comparison Visualizer -->
            <div id="timeline-status-card" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: var(--radius-md); padding: 1rem; display: flex; flex-direction: column; gap: 0.85rem; box-shadow: 0 2px 6px rgba(10, 25, 47, 0.03);">
              <div style="font-size: 0.82rem; font-weight: 700; color: var(--navy-900); display: flex; justify-content: space-between;">
                <span>HYDRAULIC PREDICTION AT T+0:</span>
                <span style="color: var(--navy-700); font-weight: 800;">84 mm/h Cloudburst</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.75rem;">
                <div style="background: #f0fdf4; border-left: 3px solid #10b981; padding: 0.5rem; border-radius: 4px; border: 1px solid #bbf7d0;">
                  <strong class="text-emerald">Plan Alpha Outcome:</strong>
                  <p style="color: #334155; margin-top: 0.2rem;">Gates sealed 20 mins prior. Zero vehicles entering underpass. Pumps operating at 100% discharge.</p>
                </div>
                <div style="background: #fef2f2; border-left: 3px solid #ef4444; padding: 0.5rem; border-radius: 4px; border: 1px solid #fecaca;">
                  <strong class="text-rose">Plan Beta Outcome:</strong>
                  <p style="color: #334155; margin-top: 0.2rem;">Underpass depth exceeds 1.15m. 14 vehicles trapped in water. Traffic backed up 4.8km on Ring Road.</p>
                </div>
              </div>
            </div>

            <!-- Inter-Department Trade-off Resolving Agent Box -->
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-md); padding: 1rem;">
              <div style="font-size: 0.82rem; font-weight: 700; color: #1e3a8a; margin-bottom: 0.4rem;">
                🤝 Inter-Agent Conflict Resolution Matrix
              </div>
              <p style="font-size: 0.75rem; color: #334155; line-height: 1.45;">
                <strong>Conflict:</strong> Traffic Police Agent sought to keep Ring Road underpass open to maintain throughput. Municipal Works Agent required immediate drainage gate closure to prevent motor inundation.<br>
                <strong>Planner Resolution:</strong> Pareto-optimal trade-off computed: Divert only light vehicles to ORR flyover, seal underpass drop-gate, avoiding ₹13.7 Cr loss while keeping throughput at 82%.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const btnSelectA = this.container.querySelector('#btn-select-planA');
    if (btnSelectA) {
      btnSelectA.addEventListener('click', () => {
        sound.playApprovalFanfare();
        sound.speak("Plan Alpha selected for commissioner ratification.");
        alert("Plan Alpha chosen. Transitioning to Commissioner Terminal for execution.");
      });
    }

    const btnSelectB = this.container.querySelector('#btn-select-planB');
    if (btnSelectB) {
      btnSelectB.addEventListener('click', () => {
        sound.playAlertChime();
        sound.speak("Warning: Plan Beta simulates 18 trapped vehicles and severe gridlock.");
      });
    }

    const slider = this.container.querySelector('#timeline-slider');
    const horizonText = this.container.querySelector('#sim-horizon-text');
    const statusCard = this.container.querySelector('#timeline-status-card');

    const steps = [
      { time: "T-30m (Early Radar Detection)", alpha: "Preemptive drop-gates deployed. Warning SMS queued to 120k citizens.", beta: "No action taken. Underpass open." },
      { time: "T-15m (Rain Commences)", alpha: "Dewatering pumps operating. Traffic diverted to elevated arterial smoothly.", beta: "Water reaches 35cm. Vehicles slowing down, brake waves propagating." },
      { time: "T+0 (Peak Cloudburst)", alpha: "Gates sealed 20 mins prior. Zero vehicles entering underpass. Pumps operating at 100% discharge.", beta: "Underpass depth exceeds 1.15m. 14 vehicles trapped in water. Traffic backed up 4.8km." },
      { time: "T+30m (Storm Subsiding)", alpha: "Floodwaters receded below 15cm. Underpass scheduled for re-opening in 10 mins.", beta: "Disaster NDRF boat units called. Severe public outcry on social channels." },
      { time: "T+60m (Post-Crisis Review)", alpha: "Underpass re-opened. Zero damage. City commute restored to normal.", beta: "Crane towing operations underway. Submerged vehicles write-offs." }
    ];

    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        const cur = steps[val];
        if (horizonText) horizonText.textContent = cur.time;
        if (statusCard) {
          statusCard.innerHTML = `
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--navy-900); display: flex; justify-content: space-between;">
              <span>HYDRAULIC PREDICTION AT ${cur.time.split(' ')[0]}:</span>
              <span style="color: var(--navy-700); font-weight: 800;">Digital Twin Mesh</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.75rem;">
              <div style="background: #f0fdf4; border-left: 3px solid #10b981; padding: 0.5rem; border-radius: 4px; border: 1px solid #bbf7d0;">
                <strong class="text-emerald">Plan Alpha Outcome:</strong>
                <p style="color: #334155; margin-top: 0.2rem;">${cur.alpha}</p>
              </div>
              <div style="background: #fef2f2; border-left: 3px solid #ef4444; padding: 0.5rem; border-radius: 4px; border: 1px solid #fecaca;">
                <strong class="text-rose">Plan Beta Outcome:</strong>
                <p style="color: #334155; margin-top: 0.2rem;">${cur.beta}</p>
              </div>
            </div>
          `;
        }
      });
    }

    if (!this.unsubscribe) {
      this.unsubscribe = geminiLiveEngine.subscribe((event) => {
        if (event === 'analysis_complete') {
          this.render();
        }
      });
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
