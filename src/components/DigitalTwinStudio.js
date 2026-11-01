// CityGuard AI - Digital Twin Studio (2D & 3D Map Visualization for Nagpur Smart City)
// Features Hardware-Accelerated 3D WebGL (Three.js), 2D GIS Vector Map, and Counterfactual "What-If" Analysis

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DigitalTwinMap } from './DigitalTwinMap.js';
import { sound } from '../utils/soundEngine.js';
import { geminiLiveEngine } from '../services/geminiLiveEngine.js';

export class DigitalTwinStudio {
  constructor(containerId, state) {
    this.container = document.getElementById(containerId);
    this.state = state;
    this.activeView = '3d'; // '3d' | '2d' | 'counterfactual'
    this.simStep = 2; // Default to Peak Cloudburst (T-00m)
    this.isSimPlaying = false;
    this.simInterval = null;

    // Three.js State
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animFrameId = null;
    this.rainParticles = null;
    this.waterMesh = null;
    this.radarMesh = null;
    this.beaconLight = null;
    this.stormLight = null;
    this.lightningTimer = 0;
    this.unsubscribe = null;
  }

  render() {
    const liveCity = geminiLiveEngine.getLiveCityData();
    const planA = liveCity.counterfactualPlans.planA;
    const planB = liveCity.counterfactualPlans.planB;

    this.container.innerHTML = `
      <div class="dt-studio-container" style="padding: 1rem 1.25rem 2rem; display: flex; flex-direction: column; gap: 1rem; min-height: calc(100vh - 110px);">
        
        <!-- Top Mode Bar & Controls -->
        <div class="dt-top-toolbar" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.85rem; background: #ffffff; border: 1px solid #cbd5e1; padding: 0.75rem 1.15rem; border-radius: var(--radius-lg); box-shadow: 0 2px 8px rgba(10, 25, 47, 0.04);">
          
          <!-- Left: Title & Badge -->
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="badge-status live-pulse"><span class="pulse-dot"></span> LIVE TWIN</span>
            <div>
              <h2 style="font-size: 1.1rem; font-weight: 800; color: var(--navy-900); margin: 0; letter-spacing: -0.01em;">
                Nagpur Digital Twin · 2D & 3D Geospatial Engine
              </h2>
              <span style="font-size: 0.74rem; color: var(--text-secondary);">Zero Mile Urban Topography · Nag River Basin · 1,842 IoT Sensors Active</span>
            </div>
          </div>

          <!-- Center: View Mode Segmented Controls -->
          <div class="dt-view-switcher" style="display: flex; background: #eff6ff; padding: 0.25rem; border-radius: var(--radius-md); border: 1px solid #bfdbfe;">
            <button class="dt-tab-btn ${this.activeView === '3d' ? 'active' : ''}" data-view="3d" style="display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.9rem; font-size: 0.8rem; font-weight: 700; border: none; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s;">
              <span>🌐 3D Cyber Twin</span>
              <span class="mini-pill" style="background: rgba(30, 58, 138, 0.15); color: var(--navy-700); font-size: 0.6rem; padding: 1px 4px; border-radius: 3px;">WebGL</span>
            </button>
            <button class="dt-tab-btn ${this.activeView === '2d' ? 'active' : ''}" data-view="2d" style="display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.9rem; font-size: 0.8rem; font-weight: 700; border: none; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s;">
              <span>🗺️ 2D Tactical GIS</span>
            </button>
            <button class="dt-tab-btn ${this.activeView === 'counterfactual' ? 'active' : ''}" data-view="counterfactual" style="display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.9rem; font-size: 0.8rem; font-weight: 700; border: none; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s;">
              <span>🔮 "What-If" Matrix</span>
            </button>
          </div>

          <!-- Right: Camera Presets (for 3D Mode) -->
          <div id="cam-presets-bar" style="display: ${this.activeView === '3d' ? 'flex' : 'none'}; align-items: center; gap: 0.35rem;">
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">3D Cam:</span>
            <button class="cam-preset-btn" data-cam="zeromile" style="background: #eff6ff; border: 1px solid #bfdbfe; color: var(--navy-700); font-size: 0.72rem; padding: 0.25rem 0.55rem; border-radius: var(--radius-sm); cursor: pointer; font-weight: 700;">🎯 Zero Mile</button>
            <button class="cam-preset-btn" data-cam="underpass" style="background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; font-size: 0.72rem; padding: 0.25rem 0.55rem; border-radius: var(--radius-sm); cursor: pointer; font-weight: 700;">🛑 Manish Nagar RUB</button>
            <button class="cam-preset-btn" data-cam="spillway" style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1e3a8a; font-size: 0.72rem; padding: 0.25rem 0.55rem; border-radius: var(--radius-sm); cursor: pointer; font-weight: 700;">🌊 Ambazari Spillway</button>
            <button class="cam-preset-btn" data-cam="aerial" style="background: #eff6ff; border: 1px solid #bfdbfe; color: var(--navy-700); font-size: 0.72rem; padding: 0.25rem 0.55rem; border-radius: var(--radius-sm); cursor: pointer; font-weight: 700;">🛰️ Aerial Radar</button>
          </div>
        </div>

        <!-- Main View Mount Stages -->
        <div class="dt-main-stage-wrapper" style="position: relative; flex: 1; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-subtle); background: #060b17; min-height: 520px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);">
          
          <!-- STAGE 1: 3D WebGL Canvas (Three.js) -->
          <div id="dt-stage-3d" style="width: 100%; height: 560px; display: ${this.activeView === '3d' ? 'block' : 'none'}; position: relative;">
            <canvas id="dt-three-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
            
            <!-- 3D HUD Overlay -->
            <div style="position: absolute; top: 14px; left: 14px; pointer-events: none; display: flex; flex-direction: column; gap: 0.5rem; z-index: 10;">
              <div style="background: rgba(8, 13, 26, 0.88); border: 1px solid var(--border-glow); padding: 0.4rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 700; color: #fff; backdrop-filter: blur(10px);">
                <span class="text-cyan">3D WebGL Engine:</span> 60 FPS · Hardware Accelerated
              </div>
              <div style="background: rgba(8, 13, 26, 0.88); border: 1px solid rgba(239, 68, 68, 0.4); padding: 0.4rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 700; color: #fff; backdrop-filter: blur(10px);">
                <span class="text-rose">Live Underpass Water Depth:</span> <span id="three-water-depth-label" class="font-mono text-rose" style="font-size: 0.9rem;">1.18m (CRITICAL)</span>
              </div>
            </div>

            <!-- 3D Quick Controls Hints -->
            <div style="position: absolute; bottom: 14px; right: 14px; background: rgba(8, 13, 26, 0.85); border: 1px solid var(--border-subtle); padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.7rem; color: var(--text-muted); pointer-events: none;">
              🖱️ Left Click + Drag: Rotate · Right Click: Pan · Scroll: Zoom 3D View
            </div>
          </div>

          <!-- STAGE 2: 2D Tactical GIS Map View -->
          <div id="dt-stage-2d" style="width: 100%; min-height: 560px; display: ${this.activeView === '2d' ? 'block' : 'none'};">
            <div id="dt-2d-canvas-mount" style="width: 100%; height: 100%;"></div>
          </div>

          <!-- STAGE 3: Counterfactual "What-If" Matrix View -->
          <div id="dt-stage-counterfactual" style="width: 100%; padding: 1.25rem; display: ${this.activeView === 'counterfactual' ? 'block' : 'none'}; overflow-y: auto;">
            
            <div class="matrix-header-card" style="margin-bottom: 1.25rem;">
              <div class="matrix-header-title">
                <span>🔮 Counterfactual "What-If" Planner Agent (Nagpur Digital Twin)</span>
                <span class="badge-track">Simulate Before Acting</span>
              </div>
              <p class="matrix-header-desc">
                The Planner Agent simulates alternate future outcomes on the Nagpur Digital Twin before deploying physical actuation.
                Below is the side-by-side analysis of <strong>Plan Alpha (Autonomous Coordinated Preemption)</strong> vs 
                <strong>Plan Beta (Status-Quo Departmental Sinks)</strong>.
              </p>
            </div>

            <!-- Comparison Cards Grid -->
            <div class="matrix-comparison-cards">
              <!-- Plan Alpha -->
              <div class="plan-card-full plan-recommended">
                <div class="plan-badge-top">
                  <span class="badge-status">⭐ RECOMMENDED CHOICE</span>
                  <span class="font-mono text-emerald" style="font-size: 0.75rem;">AI CONFIDENCE: 98.4%</span>
                </div>
                <div>
                  <h3 class="plan-title-lg">${planA.name}</h3>
                  <span class="plan-tagline">${planA.subtitle}</span>
                </div>
                <div class="metric-bars-stack">
                  <div class="metric-bar-item">
                    <div class="metric-label-row">
                      <span>Casualty / Entrapment Risk</span>
                      <strong class="text-emerald">${planA.metrics.projectedCasualties}</strong>
                    </div>
                    <div class="metric-progress-bg"><div class="metric-progress-fill fill-emerald" style="width: 5%;"></div></div>
                  </div>
                  <div class="metric-bar-item">
                    <div class="metric-label-row">
                      <span>Average Commute Delay</span>
                      <strong class="text-emerald">${planA.metrics.commuteDelay}</strong>
                    </div>
                    <div class="metric-progress-bg"><div class="metric-progress-fill fill-emerald" style="width: 12%;"></div></div>
                  </div>
                  <div class="metric-bar-item">
                    <div class="metric-label-row">
                      <span>Projected Infrastructure Loss</span>
                      <strong class="text-cyan">${planA.metrics.infrastructureDamage}</strong>
                    </div>
                    <div class="metric-progress-bg"><div class="metric-progress-fill fill-cyan" style="width: 10%;"></div></div>
                  </div>
                </div>
                <button class="plan-select-btn btn-primary" id="btn-select-planA" style="margin-top: auto;">
                  <span>✓ Execute Plan Alpha Preemption</span>
                </button>
              </div>

              <!-- Plan Beta -->
              <div class="plan-card-full plan-legacy">
                <div class="plan-badge-top">
                  <span class="badge-status" style="background: rgba(239, 68, 68, 0.2); color: #f87171;">⚠️ STATUS QUO FAILURE</span>
                  <span class="font-mono text-rose" style="font-size: 0.75rem;">SEVERITY: EXTREME</span>
                </div>
                <div>
                  <h3 class="plan-title-lg">${planB.name}</h3>
                  <span class="plan-tagline">${planB.subtitle}</span>
                </div>
                <div class="metric-bars-stack">
                  <div class="metric-bar-item">
                    <div class="metric-label-row">
                      <span>Casualty / Entrapment Risk</span>
                      <strong class="text-rose">${planB.metrics.projectedCasualties}</strong>
                    </div>
                    <div class="metric-progress-bg"><div class="metric-progress-fill fill-rose" style="width: 88%;"></div></div>
                  </div>
                  <div class="metric-bar-item">
                    <div class="metric-label-row">
                      <span>Average Commute Delay</span>
                      <strong class="text-rose">${planB.metrics.commuteDelay}</strong>
                    </div>
                    <div class="metric-progress-bg"><div class="metric-progress-fill fill-rose" style="width: 95%;"></div></div>
                  </div>
                  <div class="metric-bar-item">
                    <div class="metric-label-row">
                      <span>Projected Infrastructure Damage</span>
                      <strong class="text-rose">${planB.metrics.infrastructureDamage}</strong>
                    </div>
                    <div class="metric-progress-bg"><div class="metric-progress-fill fill-rose" style="width: 92%;"></div></div>
                  </div>
                </div>
                <button class="plan-select-btn btn-secondary" id="btn-select-planB" style="margin-top: auto;">
                  <span>Simulate Reactive Failure</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Simulation Scrubbing Bar (Ties 2D and 3D Together!) -->
        <div class="dt-bottom-scrubber" style="background: #ffffff; border: 1px solid #cbd5e1; padding: 0.85rem 1.25rem; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 0.65rem; box-shadow: 0 4px 16px rgba(10, 25, 47, 0.05);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <button id="sim-play-btn" class="icon-btn-sm" style="background: var(--navy-700); color: #ffffff; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 800; cursor: pointer; border: none;">▶</button>
              <span style="font-size: 0.85rem; font-weight: 800; color: var(--navy-900);">Timeline Hydraulic Scrubbing:</span>
              <strong id="sim-step-label" class="font-mono text-cyan" style="font-size: 0.88rem;">T-00m (Peak Cloudburst Arrival · 84.6 mm/h)</strong>
            </div>
            <div style="display: flex; gap: 1rem; font-size: 0.75rem; color: var(--navy-900); font-weight: 600;">
              <span>Underpass Water: <strong id="sim-water-val" class="text-rose font-mono">1.18m</strong></span>
              <span>Pumps: <strong id="sim-pump-val" class="text-emerald font-mono">4x 450HP Active</strong></span>
              <span>Evac Status: <strong id="sim-evac-val" class="font-mono" style="color: #1e3a8a;">Gates Sealed</strong></span>
            </div>
          </div>
          <input type="range" id="sim-timeline-slider" min="0" max="4" value="2" step="1" style="width: 100%; accent-color: var(--navy-700); cursor: pointer; height: 6px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--text-muted); font-family: var(--font-mono);">
            <span>T-30m (Early Warning)</span>
            <span>T-15m (Drop-Gates Armed)</span>
            <span style="color: var(--rose-500); font-weight: 700;">T-00m (Peak Cloudburst)</span>
            <span>T+15m (Pump Drawdown)</span>
            <span>T+30m (Full Recovery)</span>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
    if (this.activeView === '3d') {
      setTimeout(() => this.initThreeJs(), 50);
    }
  }

  initThreeJs() {
    const canvas = document.getElementById('dt-three-canvas');
    if (!canvas) return;

    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 560;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060b17);
    this.scene.fog = new THREE.FogExp2(0x060b17, 0.0018);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    this.camera.position.set(220, 260, 340);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    // 4. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
    this.controls.minDistance = 60;
    this.controls.maxDistance = 800;
    this.controls.target.set(0, 0, 0);

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.4);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight.position.set(150, 250, 100);
    this.scene.add(dirLight);

    // Zero Mile Beacon Light (Cyan rotating spotlight)
    this.beaconLight = new THREE.PointLight(0x38bdf8, 3, 200);
    this.beaconLight.position.set(0, 35, 0);
    this.scene.add(this.beaconLight);

    // Underpass Warning Red Light
    const underpassLight = new THREE.PointLight(0xef4444, 2.5, 120);
    underpassLight.position.set(60, 15, 80);
    this.scene.add(underpassLight);

    // Storm Cloud Lightning Light
    this.stormLight = new THREE.PointLight(0xa855f7, 0, 500);
    this.stormLight.position.set(40, 140, 40);
    this.scene.add(this.stormLight);

    // 6. Ground & Terrain Grid
    const groundGeo = new THREE.PlaneGeometry(800, 800, 40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x080e1e,
      roughness: 0.85,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(800, 50, 0x0ea5e9, 0x1e293b);
    grid.position.y = 0.2;
    this.scene.add(grid);

    // 7. Water Bodies (Nag River & Ambazari Lake in 3D)
    this.build3DWaterways();

    // 8. 3D Nagpur City Blocks & Landmarks
    this.build3DCityBuildings();

    // 9. 3D Dynamic Flood Water Plane at Manish Nagar Underpass
    const waterGeo = new THREE.BoxGeometry(60, 1, 40);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.6
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.set(60, 5.5, 80);
    this.scene.add(this.waterMesh);

    // 10. 3D Rain Particles
    this.build3DRain();

    // 11. Overhead 3D Volumetric Radar Storm Cloud
    this.build3DRadarCloud();

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      this.controls.update();

      // Rain animation
      if (this.rainParticles) {
        const positions = this.rainParticles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 220 * delta;
          if (positions[i] < 0) {
            positions[i] = 180 + Math.random() * 40;
          }
        }
        this.rainParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Beacon rotation
      if (this.beaconLight) {
        this.beaconLight.position.x = Math.sin(elapsed * 2) * 20;
        this.beaconLight.position.z = Math.cos(elapsed * 2) * 20;
      }

      // Cloud rotation
      if (this.radarMesh) {
        this.radarMesh.rotation.y = elapsed * 0.15;
      }

      // Simulated lightning flash
      this.lightningTimer += delta;
      if (this.lightningTimer > 4.5) {
        this.lightningTimer = 0;
        if (this.stormLight) {
          this.stormLight.intensity = 5;
          setTimeout(() => { if (this.stormLight) this.stormLight.intensity = 0; }, 80);
          setTimeout(() => { if (this.stormLight) this.stormLight.intensity = 3; }, 140);
          setTimeout(() => { if (this.stormLight) this.stormLight.intensity = 0; }, 220);
        }
      }

      // Water oscillation
      if (this.waterMesh) {
        this.waterMesh.scale.y = 1 + Math.sin(elapsed * 3) * 0.05;
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();

    // Handle Resize
    window.addEventListener('resize', this._onResize = () => {
      if (!canvas || !this.renderer || !this.camera) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  build3DWaterways() {
    // Ambazari Lake (West)
    const lakeGeo = new THREE.CylinderGeometry(55, 55, 3, 32);
    const lakeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      metalness: 0.8
    });
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.position.set(-140, 1.5, 30);
    this.scene.add(lake);

    // Nag River Channel (diagonal winding water curve)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-140, 1, 30),
      new THREE.Vector3(-70, 1, 20),
      new THREE.Vector3(0, 1, 10),
      new THREE.Vector3(70, 1, 15),
      new THREE.Vector3(140, 1, 40),
      new THREE.Vector3(220, 1, 60)
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 7, 8, false);
    const river = new THREE.Mesh(tubeGeo, lakeMat);
    river.scale.set(1, 0.25, 1);
    this.scene.add(river);
  }

  build3DCityBuildings() {
    // 1. Nagpur Zero Mile Monument (Center: 0, 0, 0)
    const monumentGeo = new THREE.CylinderGeometry(4, 5, 30, 16);
    const monumentMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.8 });
    const monument = new THREE.Mesh(monumentGeo, monumentMat);
    monument.position.set(0, 15, 0);
    this.scene.add(monument);

    // Zero Mile Pillar Crown
    const crownGeo = new THREE.SphereGeometry(3.5, 16, 16);
    const crownMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.set(0, 31, 0);
    this.scene.add(crown);

    // 2. Sitabuldi Fort on Elevated Hill
    const hillGeo = new THREE.ConeGeometry(35, 25, 16);
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const hill = new THREE.Mesh(hillGeo, hillMat);
    hill.position.set(-45, 12.5, -40);
    this.scene.add(hill);

    const fortGeo = new THREE.BoxGeometry(22, 10, 22);
    const fortMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const fort = new THREE.Mesh(fortGeo, fortMat);
    fort.position.set(-45, 26, -40);
    this.scene.add(fort);

    // 3. Deekshabhoomi Dome (Iconic Sarnath Stupa replica)
    const domeGeo = new THREE.SphereGeometry(18, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.7 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(-80, 0, 110);
    this.scene.add(dome);

    // 4. Nagpur Metro Elevated Viaduct & Sitabuldi Station
    const viaductGeo = new THREE.BoxGeometry(10, 16, 260);
    const viaductMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const viaduct = new THREE.Mesh(viaductGeo, viaductMat);
    viaduct.position.set(10, 8, 20);
    this.scene.add(viaduct);

    // 5. Manish Nagar Underpass Embankment & Cut-out
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(8, 18, 45), wallMat);
    leftWall.position.set(26, 9, 80);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(8, 18, 45), wallMat);
    rightWall.position.set(94, 9, 80);
    this.scene.add(rightWall);

    // Drop-Gates (Red/White barrier poles)
    const gateGeo = new THREE.CylinderGeometry(1, 1, 60, 8);
    const gateMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const gate = new THREE.Mesh(gateGeo, gateMat);
    gate.rotation.z = Math.PI / 2;
    gate.position.set(60, 10, 60);
    this.scene.add(gate);

    // 6. Extruded Procedural City Blocks (Civil Lines, Dharampeth, Ramdaspeth, Somalwada)
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.3
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, opacity: 0.3, transparent: true });

    const blocks = [
      { x: -50, z: 20, w: 22, d: 25, h: 42 },
      { x: -20, z: -80, w: 26, d: 28, h: 55 },
      { x: 40, z: -60, w: 30, d: 24, h: 48 },
      { x: 80, z: -30, w: 25, d: 30, h: 36 },
      { x: -90, z: -20, w: 35, d: 28, h: 30 },
      { x: 110, z: 20, w: 28, d: 26, h: 40 },
      { x: 50, z: 140, w: 30, d: 35, h: 28 },
      { x: -30, z: 150, w: 26, d: 24, h: 32 },
      { x: -120, z: 80, w: 32, d: 30, h: 25 },
      { x: 120, z: 110, w: 34, d: 28, h: 35 }
    ];

    blocks.forEach(b => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mesh = new THREE.Mesh(geo, buildingMat);
      mesh.position.set(b.x, b.h / 2, b.z);
      this.scene.add(mesh);

      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, edgeMat);
      line.position.copy(mesh.position);
      this.scene.add(line);
    });
  }

  build3DRain() {
    const rainCount = 2200;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 500;
      positions[i + 1] = Math.random() * 220;
      positions[i + 2] = (Math.random() - 0.5) * 500;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 1.8,
      transparent: true,
      opacity: 0.65
    });

    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.scene.add(this.rainParticles);
  }

  build3DRadarCloud() {
    // 3D Storm Cloud mesh over the city
    const cloudGeo = new THREE.CylinderGeometry(140, 160, 20, 32);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0x3b0764,
      emissive: 0x1e1b4b,
      transparent: true,
      opacity: 0.6,
      roughness: 0.9
    });
    this.radarMesh = new THREE.Mesh(cloudGeo, cloudMat);
    this.radarMesh.position.set(20, 170, 30);
    this.scene.add(this.radarMesh);
  }

  setCameraPreset(name) {
    if (!this.camera || !this.controls) return;
    sound.playRadarPing();

    if (name === 'zeromile') {
      this.camera.position.set(0, 110, 160);
      this.controls.target.set(0, 15, 0);
    } else if (name === 'underpass') {
      this.camera.position.set(130, 50, 130);
      this.controls.target.set(60, 10, 80);
    } else if (name === 'spillway') {
      this.camera.position.set(-180, 80, 100);
      this.controls.target.set(-120, 10, 30);
    } else if (name === 'aerial') {
      this.camera.position.set(0, 500, 50);
      this.controls.target.set(0, 0, 0);
    }
  }

  updateSimulationStep(step) {
    this.simStep = step;
    const stepLabel = document.getElementById('sim-step-label');
    const waterDepthLabel = document.getElementById('three-water-depth-label');
    const simWaterVal = document.getElementById('sim-water-val');
    const simPumpVal = document.getElementById('sim-pump-val');
    const simEvacVal = document.getElementById('sim-evac-val');

    const stepsData = [
      { label: "T-30m (Early Lead Detection · 22 mm/h)", depth: "0.20m", depthY: 1.0, pump: "Standby", evac: "Gate Open" },
      { label: "T-15m (Auto-Drop Gates Armed · 45 mm/h)", depth: "0.65m", depthY: 3.2, pump: "2x 450HP Armed", evac: "Gate Closing" },
      { label: "T-00m (Peak Cloudburst Arrival · 84.6 mm/h)", depth: "1.18m (CRITICAL)", depthY: 6.2, pump: "4x 450HP Active", evac: "Gates Sealed" },
      { label: "T+15m (High-Flow Pump Drawdown · 4,800 L/m)", depth: "0.48m", depthY: 2.4, pump: "4x 450HP Max Draw", evac: "Pumping Down" },
      { label: "T+30m (Underpass De-inundated & Safe)", depth: "0.15m (SAFE)", depthY: 0.8, pump: "1x Pump Residual", evac: "Gates Reopened" }
    ];

    const current = stepsData[step] || stepsData[2];

    if (stepLabel) stepLabel.textContent = current.label;
    if (waterDepthLabel) waterDepthLabel.textContent = current.depth;
    if (simWaterVal) simWaterVal.textContent = current.depth;
    if (simPumpVal) simPumpVal.textContent = current.pump;
    if (simEvacVal) simEvacVal.textContent = current.evac;

    // Update 3D Water Height in Three.js
    if (this.waterMesh) {
      this.waterMesh.position.y = current.depthY;
    }
  }

  bindEvents() {
    // Mode Switcher Buttons
    const viewButtons = this.container.querySelectorAll('.dt-tab-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        this.activeView = view;
        sound.playRadarPing();

        viewButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Toggle Stage Displays
        const s3d = document.getElementById('dt-stage-3d');
        const s2d = document.getElementById('dt-stage-2d');
        const scf = document.getElementById('dt-stage-counterfactual');
        const camPresets = document.getElementById('cam-presets-bar');

        if (s3d) s3d.style.display = view === '3d' ? 'block' : 'none';
        if (s2d) s2d.style.display = view === '2d' ? 'block' : 'none';
        if (scf) scf.style.display = view === 'counterfactual' ? 'block' : 'none';
        if (camPresets) camPresets.style.display = view === '3d' ? 'flex' : 'none';

        if (view === '3d') {
          if (!this.scene) {
            setTimeout(() => this.initThreeJs(), 50);
          }
        } else if (view === '2d') {
          this.render2DMapStage();
        }
      });
    });

    // Camera Preset Buttons
    const camBtns = this.container.querySelectorAll('.cam-preset-btn');
    camBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = e.currentTarget.dataset.cam;
        this.setCameraPreset(preset);
      });
    });

    // Timeline Scrubber Slider
    const slider = this.container.querySelector('#sim-timeline-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.updateSimulationStep(val);
        sound.playRadarPing();
      });
    }

    // Play/Pause Simulation Button
    const playBtn = this.container.querySelector('#sim-play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.isSimPlaying = !this.isSimPlaying;
        playBtn.textContent = this.isSimPlaying ? '⏸' : '▶';
        sound.playAlertChime();

        if (this.isSimPlaying) {
          this.simInterval = setInterval(() => {
            const nextStep = (this.simStep + 1) % 5;
            if (slider) slider.value = nextStep;
            this.updateSimulationStep(nextStep);
          }, 2400);
        } else {
          clearInterval(this.simInterval);
        }
      });
    }

    // Plan Execution Buttons
    const btnPlanA = this.container.querySelector('#btn-select-planA');
    if (btnPlanA) {
      btnPlanA.addEventListener('click', () => {
        sound.playApprovalFanfare();
        sound.speak("Plan Alpha ratified by Municipal Commissioner. Executing multi-agent drop-gates and pumps in Nagpur.");
        this.updateSimulationStep(3);
        if (slider) slider.value = 3;
      });
    }
  }

  render2DMapStage() {
    const mount = document.getElementById('dt-2d-canvas-mount');
    if (!mount) return;

    // Use our enhanced Nagpur 2D Map component
    mount.innerHTML = '';
    const map = new DigitalTwinMap('dt-2d-canvas-mount', this.state);
    map.render();
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.simInterval) {
      clearInterval(this.simInterval);
    }
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
