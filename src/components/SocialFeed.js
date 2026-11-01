import { sound } from '../utils/soundEngine.js';
import { geminiLiveEngine } from '../services/geminiLiveEngine.js';

export class SocialFeed {
  constructor(containerId, state, onNavigate) {
    this.container = document.getElementById(containerId);
    this.state = state;
    this.onNavigate = onNavigate;
    this.posts = [...geminiLiveEngine.getLiveCityData().socialPosts];
    this.activeFeedFilter = 'all'; // 'all' | 'control-room' | 'nagrik' | 'sos'
    this.selectedStory = null;
    this.planApprovedInFeed = false;
    this.unsubscribe = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="social-feed-wrapper">
        <!-- Sticky Feed Header -->
        <div class="feed-top-nav">
          <div class="feed-tabs-row">
            <button class="feed-tab-btn ${this.activeFeedFilter === 'all' ? 'active' : ''}" data-feedfilter="all">
              <span>For You</span>
              <div class="active-indicator"></div>
            </button>
            <button class="feed-tab-btn ${this.activeFeedFilter === 'control-room' ? 'active' : ''}" data-feedfilter="control-room">
              <span>🏛️ Control Room (CITY-01)</span>
              <div class="active-indicator"></div>
            </button>
            <button class="feed-tab-btn ${this.activeFeedFilter === 'nagrik' ? 'active' : ''}" data-feedfilter="nagrik">
              <span>🤖 Nagrik AI (CITY-02)</span>
              <div class="active-indicator"></div>
            </button>
            <button class="feed-tab-btn ${this.activeFeedFilter === 'sos' ? 'active' : ''}" data-feedfilter="sos">
              <span>🚨 Citizen SOS</span>
              <div class="active-indicator"></div>
            </button>
          </div>
        </div>

        <!-- Instagram-Style Ward Stories Bar (Gemini Live Synthesized) -->
        <div class="stories-reel-container">
          <div class="stories-scroll-track" id="stories-track">
            ${this.getDynamicStories().map(story => `
              <div class="story-circle-item" data-storyid="${story.id}">
                <div class="story-avatar-ring ${story.hasUnseen ? 'gradient-ring' : 'viewed-ring'}">
                  <div class="story-avatar-inner">
                    <span>${story.avatar}</span>
                  </div>
                </div>
                <span class="story-name-label">${story.name}</span>
                <span class="story-tag-pill">${story.tag}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Twitter/X Post Composer Box -->
        <div class="post-composer-card">
          <div class="composer-avatar-col">
            <div class="composer-avatar">${this.state.currentUser.avatar || '👤'}</div>
          </div>
          <div class="composer-body-col">
            <div class="composer-author-meta">
              <strong style="color: var(--navy-900); font-size: 0.88rem; font-weight: 800;">${this.state.currentUser.name}</strong>
              <span class="composer-role-pill">${this.state.currentUser.badge}</span>
            </div>
            <textarea id="composer-textarea" class="composer-input" rows="2" placeholder="What's happening in your ward? Report waterlogging, extreme heat, or civic grievance..."></textarea>
            
            <div class="composer-actions-bar">
              <div class="composer-tools">
                <button class="tool-icon-btn" title="Add Ward Geo-tag">📍 Ward 150</button>
                <button class="tool-icon-btn" title="Add Photo Simulation">📸 Photo</button>
                <button class="tool-icon-btn" title="Add Doppler Radar Stamp">🌦️ Radar</button>
                <button class="tool-icon-btn" id="composer-voice-btn" title="Voice Input">🎙️ Voice</button>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <label class="emergency-checkbox-label">
                  <input type="checkbox" id="composer-sos-flag">
                  <span class="sos-text">⚠️ Emergency SOS</span>
                </label>
                <button id="composer-submit-btn" class="tweet-submit-btn">Post Update</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Social Posts Stream List -->
        <div class="posts-stream" id="posts-stream-mount">
          ${this.renderPosts()}
        </div>

        <!-- Story Viewer Modal -->
        <div id="story-modal-overlay" class="story-modal-backdrop hidden">
          <div class="story-modal-box" id="story-modal-content">
            <!-- Injected by openStory() -->
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderPosts() {
    let filtered = this.posts;
    if (this.activeFeedFilter === 'control-room') {
      filtered = this.posts.filter(p => p.interactiveType === 'planner_matrix' || p.interactiveType === 'sensor_telemetry' || p.interactiveType === 'multilingual_alert');
    } else if (this.activeFeedFilter === 'nagrik') {
      filtered = this.posts.filter(p => p.interactiveType === 'nagrik_civic_demo');
    } else if (this.activeFeedFilter === 'sos') {
      filtered = this.posts.filter(p => p.interactiveType === 'citizen_sos');
    }

    return filtered.map(post => `
      <article class="tweet-post-card" data-postid="${post.id}">
        <div class="tweet-left-avatar">
          <div class="author-avatar">${post.author.avatar}</div>
        </div>
        <div class="tweet-right-content">
          <!-- Tweet Author Header -->
          <div class="tweet-header-row">
            <div class="tweet-author-info">
              <strong class="tweet-author-name">${post.author.name}</strong>
              ${post.author.isGov ? `
                <span class="verified-badge-gov" title="Government / System Verified">
                  <svg viewBox="0 0 24 24" fill="${post.author.badgeColor || '#38bdf8'}"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </span>
              ` : `
                <span class="verified-badge-citizen" title="Verified Citizen">
                  <svg viewBox="0 0 24 24" fill="#a855f7"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </span>
              `}
              <span class="tweet-handle">${post.author.handle}</span>
              <span class="tweet-dot">·</span>
              <span class="tweet-time">${post.time}</span>
            </div>
            <span class="badge-role-pill" style="border-color: ${post.author.badgeColor || '#38bdf8'}; color: ${post.author.badgeColor || '#38bdf8'};">
              ${post.author.badgeText}
            </span>
          </div>

          <!-- Tweet Body Text -->
          <div class="tweet-text-body">
            ${post.content.replace(/\n/g, '<br>')}
          </div>

          <!-- Hashtags -->
          <div class="tweet-tags-row">
            ${post.tags.map(tag => `<span class="tweet-hashtag">${tag}</span>`).join(' ')}
          </div>

          <!-- Embedded Interactive Module (Rich Media Widget) -->
          <div class="tweet-embed-widget">
            ${this.renderEmbedWidget(post)}
          </div>

          <!-- Tweet Social Action Metrics (Like, Retweet, Reply, Views) -->
          <div class="tweet-actions-bar">
            <button class="tweet-act-btn act-reply" title="Reply">
              <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.25c-4.421 0-8-3.58-8-8.01z"/></svg>
              <span>${post.replies}</span>
            </button>

            <button class="tweet-act-btn act-retweet ${post.isRetweeted ? 'active' : ''}" data-act="retweet" data-postid="${post.id}" title="Repost / Broadcast">
              <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 20.12l-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14z"/></svg>
              <span class="retweet-count">${post.retweets}</span>
            </button>

            <button class="tweet-act-btn act-like ${post.isLiked ? 'active' : ''}" data-act="like" data-postid="${post.id}" title="Like">
              <svg viewBox="0 0 24 24"><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"/></svg>
              <span class="like-count">${post.likes}</span>
            </button>

            <button class="tweet-act-btn act-views" title="Analytics Views">
              <svg viewBox="0 0 24 24"><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/></svg>
              <span>${post.views}</span>
            </button>

            <button class="tweet-act-btn act-share" title="Share">
              <svg viewBox="0 0 24 24"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41L7.71 9.71 6.3 8.29 12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21.08 3 19.97 3 18.59V15h2v3.59c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  renderEmbedWidget(post) {
    if (post.interactiveType === 'planner_matrix') {
      return `
        <div class="embed-counterfactual-card">
          <div class="embed-header">
            <span class="font-mono text-cyan" style="font-size: 0.72rem; font-weight: bold;">AI DIGITAL TWIN SCENARIO COMPARISON</span>
            <span class="badge-status">CITY-01 RATIFICATION</span>
          </div>
          <div class="embed-plans-compare-grid">
            <div class="embed-plan-box plan-alpha-box">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <strong class="text-emerald">⭐ Plan Alpha (AI Recommended)</strong>
                <span class="mini-pill text-emerald">PREEMPTIVE</span>
              </div>
              <ul class="embed-metrics-list">
                <li><span>Casualties:</span> <strong class="text-emerald">0 (Zero)</strong></li>
                <li><span>Commute Delay:</span> <strong class="text-emerald">+12 mins</strong></li>
                <li><span>Infrastructure Saved:</span> <strong class="text-cyan">₹13.7 Crore</strong></li>
                <li><span>Storm Pumps:</span> <strong class="text-emerald">3x 500HP Active</strong></li>
              </ul>
            </div>
            <div class="embed-plan-box plan-beta-box">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <strong class="text-rose">⚠️ Plan Beta (Status Quo)</strong>
                <span class="mini-pill text-rose">REACTIVE</span>
              </div>
              <ul class="embed-metrics-list">
                <li><span>Casualties:</span> <strong class="text-rose">18 Trapped Cars</strong></li>
                <li><span>Commute Delay:</span> <strong class="text-rose">+118 mins Gridlock</strong></li>
                <li><span>Damage Loss:</span> <strong class="text-rose">₹14.8 Crore</strong></li>
                <li><span>Manual Barricade:</span> <strong class="text-amber">45 min arrival lag</strong></li>
              </ul>
            </div>
          </div>
          <div class="embed-footer-action">
            <button id="feed-approve-btn" class="feed-btn-approve ${this.planApprovedInFeed ? 'approved' : ''}">
              <span>${this.planApprovedInFeed ? '✅ Plan Alpha Authorized & Executing' : '✍️ Approve & Authorize Plan Alpha (1-Click HITL)'}</span>
            </button>
            <button id="feed-jump-twin-btn" class="btn-secondary" style="font-size: 0.75rem;">
              <span>🗺️ Open Digital Twin &rarr;</span>
            </button>
          </div>
        </div>
      `;
    }

    if (post.interactiveType === 'nagrik_civic_demo') {
      return `
        <div class="embed-nagrik-card">
          <div class="embed-header">
            <span class="font-mono text-violet" style="font-size: 0.72rem; font-weight: bold;">NAGRIK AI (CITY-02) CIVIC AGENT STUDIO</span>
            <span class="tab-badge highlight-badge">Voice + Computer Use</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem;">
            <div style="background: #ffffff; border-radius: var(--radius-sm); padding: 0.75rem; border: 1px solid #cbd5e1;">
              <div style="font-size: 0.7rem; color: var(--navy-700); font-weight: 700; margin-bottom: 0.25rem;">CITIZEN VOICE INTAKE (HINDI)</div>
              <p style="font-size: 0.75rem; color: var(--navy-900); font-style: italic; margin-bottom: 0.5rem;">
                "Meri widow pension 2 mahine se ruki hai, bank me DBT fail dikha raha hai..."
              </p>
              <button class="embed-audio-play-btn" id="feed-play-voice-btn">
                <span>▶ Play Citizen Audio</span>
              </button>
            </div>
            <div style="background: #ffffff; border-radius: var(--radius-sm); padding: 0.75rem; border: 1px solid #cbd5e1;">
              <div style="font-size: 0.7rem; color: var(--navy-700); font-weight: 700; margin-bottom: 0.25rem;">COMPUTER USE FORM SUBMISSION</div>
              <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #059669; font-weight: 700; margin-bottom: 0.35rem;">
                ACK: MH-NGP-2026-984128 (Aaple Sarkar)
              </div>
              <button class="embed-audio-play-btn" id="feed-jump-nagrik-btn" style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1e3a8a; font-weight: 700;">
                <span>🤖 Launch Nagrik AI Studio &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (post.interactiveType === 'citizen_sos') {
      return `
        <div class="embed-sos-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span class="font-mono text-rose" style="font-size: 0.72rem; font-weight: bold;">🚨 REAL-TIME WATERLOGGING TELEMETRY</span>
            <span class="tab-badge alert-pulse">Depth 1.15m</span>
          </div>
          <div class="sos-progress-track">
            <div class="sos-progress-fill" style="width: 88%;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-secondary); margin-top: 0.35rem;">
            <span>Underpass Threshold: 1.20m</span>
            <span class="text-rose font-bold">CRITICAL FLOODING (88%)</span>
          </div>
          <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
            <button class="btn-sm btn-outline" id="feed-view-underpass-btn">🛑 View Underpass on Map</button>
            <button class="btn-sm" style="background: var(--emerald-500); color: #fff;" id="feed-dispatch-pumps-btn">💧 Dispatch Dewatering Unit</button>
          </div>
        </div>
      `;
    }

    if (post.interactiveType === 'multilingual_alert') {
      return `
        <div class="embed-alert-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span class="font-mono" style="font-size: 0.72rem; font-weight: 800; color: #1e3a8a;">MULTILINGUAL BROADCAST PREVIEW</span>
            <span class="tab-badge">Cell Broadcast</span>
          </div>
          <p style="font-size: 0.78rem; color: #0a192f; line-height: 1.4; margin-bottom: 0.5rem; font-weight: 600;">
            ⚠️ सावधान (NMC आपत्ती व्यवस्थापन कक्ष): मुसळधार पावसामुळे मनीष नगर आणि लोहा पूल अंडरपास तातडीने बंद करण्यात आला आहे. कृपया आउटर रिंग रोड उड्डाणपुलाचा वापर करा.
          </p>
          <button class="embed-audio-play-btn" id="feed-speak-alert-btn">
            <span>🔊 Listen in Marathi / Hindi / English</span>
          </button>
        </div>
      `;
    }

    return '';
  }

  bindEvents() {
    // Feed Filter Tabs
    const filterBtns = this.container.querySelectorAll('.feed-tab-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.currentTarget.dataset.feedfilter;
        this.activeFeedFilter = filter;
        filterBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const mount = this.container.querySelector('#posts-stream-mount');
        if (mount) {
          mount.innerHTML = this.renderPosts();
          this.bindPostInteractions();
        }
        sound.playRadarPing();
      });
    });

    // Stories Circle click
    const storyItems = this.container.querySelectorAll('.story-circle-item');
    storyItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const sId = e.currentTarget.dataset.storyid;
        const story = STORIES_DATA.find(s => s.id === sId);
        if (story) this.openStory(story);
      });
    });

    // Post Composer Submit
    const composerSubmit = this.container.querySelector('#composer-submit-btn');
    const composerText = this.container.querySelector('#composer-textarea');
    const composerSos = this.container.querySelector('#composer-sos-flag');

    if (composerSubmit && composerText) {
      composerSubmit.addEventListener('click', () => {
        const text = composerText.value.trim();
        if (!text) return;

        const isEmergency = composerSos && composerSos.checked;
        const newPost = {
          id: `post-${Date.now()}`,
          author: {
            name: this.state.currentUser.name,
            handle: `@${this.state.currentUser.id}_user`,
            avatar: this.state.currentUser.avatar || '👤',
            isGov: this.state.currentUser.type === 'department',
            badgeText: this.state.currentUser.badge,
            badgeColor: this.state.currentUser.color || '#38bdf8'
          },
          time: "Just now",
          content: text,
          tags: isEmergency ? ["#EmergencySOS", "#WardReport", "#LiveAlert"] : ["#WardUpdate", "#NagpurCivic"],
          interactiveType: isEmergency ? "citizen_sos" : "standard",
          likes: 1,
          retweets: 0,
          replies: 0,
          views: "1",
          isLiked: false,
          isRetweeted: false
        };

        this.posts.unshift(newPost);
        composerText.value = '';
        if (composerSos) composerSos.checked = false;

        sound.playApprovalFanfare();
        const mount = this.container.querySelector('#posts-stream-mount');
        if (mount) {
          mount.innerHTML = this.renderPosts();
          this.bindPostInteractions();
        }

        // Gemini AI understands citizen post and autonomously drafts official response
        geminiLiveEngine.generateAutonomousDepartmentReply(text).then(replyPost => {
          this.posts.unshift(replyPost);
          if (mount) {
            mount.innerHTML = this.renderPosts();
            this.bindPostInteractions();
          }
          sound.playRadarPing();
        });
      });
    }

    // Voice button in composer
    const voiceBtn = this.container.querySelector('#composer-voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        sound.playAlertChime();
        sound.speak("Voice intake active. Speak your ward report in any Indian language.");
        if (composerText) {
          composerText.value = "⚠️ Heavy waterlogging observed near Marathahalli junction. Requesting immediate dewatering pumps!";
        }
      });
    }

    this.bindPostInteractions();
  }

  bindPostInteractions() {
    // Like button
    const likeBtns = this.container.querySelectorAll('.act-like');
    likeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pId = e.currentTarget.dataset.postid;
        const post = this.posts.find(p => p.id === pId);
        if (post) {
          post.isLiked = !post.isLiked;
          post.likes += post.isLiked ? 1 : -1;
          e.currentTarget.classList.toggle('active', post.isLiked);
          const countSpan = e.currentTarget.querySelector('.like-count');
          if (countSpan) countSpan.textContent = post.likes;
          if (post.isLiked) sound.playRadarPing();
        }
      });
    });

    // Retweet button
    const rtBtns = this.container.querySelectorAll('.act-retweet');
    rtBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pId = e.currentTarget.dataset.postid;
        const post = this.posts.find(p => p.id === pId);
        if (post) {
          post.isRetweeted = !post.isRetweeted;
          post.retweets += post.isRetweeted ? 1 : -1;
          e.currentTarget.classList.toggle('active', post.isRetweeted);
          const countSpan = e.currentTarget.querySelector('.retweet-count');
          if (countSpan) countSpan.textContent = post.retweets;
          if (post.isRetweeted) sound.playAlertChime();
        }
      });
    });

    // Plan Alpha Approval button in feed
    const approveBtn = this.container.querySelector('#feed-approve-btn');
    if (approveBtn) {
      approveBtn.addEventListener('click', () => {
        this.planApprovedInFeed = true;
        approveBtn.classList.add('approved');
        approveBtn.innerHTML = "<span>✅ Plan Alpha Authorized & Executing</span>";
        sound.playApprovalFanfare();
        sound.speak("Commissioner approval received from Social Feed. Plan Alpha executing across department agents.");
      });
    }

    // Jump to Digital Twin
    const jumpTwinBtn = this.container.querySelector('#feed-jump-twin-btn');
    if (jumpTwinBtn) {
      jumpTwinBtn.addEventListener('click', () => {
        if (typeof this.onNavigate === 'function') {
          this.onNavigate('digital-twin');
        }
      });
    }

    // Play citizen voice audio
    const playVoiceBtn = this.container.querySelector('#feed-play-voice-btn');
    if (playVoiceBtn) {
      playVoiceBtn.addEventListener('click', () => {
        sound.speak("Meri widow pension pichle do mahine se nahi aayi hai. Bank wale bol rahe hain DBT mapping fail ho gayi hai. Kripya sahi karwayein.");
      });
    }

    // Jump to Nagrik AI Studio
    const jumpNagrikBtn = this.container.querySelector('#feed-jump-nagrik-btn');
    if (jumpNagrikBtn) {
      jumpNagrikBtn.addEventListener('click', () => {
        if (typeof this.onNavigate === 'function') {
          this.onNavigate('nagrik-ai');
        }
      });
    }

    // Speak alert
    const speakAlertBtn = this.container.querySelector('#feed-speak-alert-btn');
    if (speakAlertBtn) {
      speakAlertBtn.addEventListener('click', () => {
        sound.speak(this.state.currentScenario.alerts.english);
      });
    }

    // View underpass on map
    const viewUpBtn = this.container.querySelector('#feed-view-underpass-btn');
    if (viewUpBtn) {
      viewUpBtn.addEventListener('click', () => {
        if (typeof this.onNavigate === 'function') {
          this.onNavigate('control-room');
        }
      });
    }

    // Dispatch pumps
    const dispatchPumpsBtn = this.container.querySelector('#feed-dispatch-pumps-btn');
    if (dispatchPumpsBtn) {
      dispatchPumpsBtn.addEventListener('click', () => {
        sound.playApprovalFanfare();
        sound.speak("BBMP high-flow pump truck dispatched to Marathahalli underpass.");
        dispatchPumpsBtn.textContent = "✓ Dewatering Unit En Route";
      });
    }
  }

  openStory(story) {
    const modal = document.getElementById('story-modal-overlay');
    const content = document.getElementById('story-modal-content');
    if (!modal || !content) return;

    sound.playRadarPing();
    modal.classList.remove('hidden');

    content.innerHTML = `
      <div class="story-view-card" style="border-top: 4px solid ${story.previewColor};">
        <div class="story-modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.4rem;">${story.avatar}</span>
            <div>
              <strong style="color: var(--navy-900); font-size: 0.88rem;">${story.name}</strong>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${story.handle} · LIVE REEL</div>
            </div>
          </div>
          <button id="close-story-btn" class="icon-btn-sm" style="font-size: 1.1rem; color: var(--navy-700);">✕</button>
        </div>

        <div class="story-media-view" style="background: radial-gradient(circle, ${story.previewColor}22 0%, #080d1a 80%);">
          <div class="story-badge-floating">${story.tag}</div>
          <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">${story.avatar}</div>
          <p style="font-size: 1.05rem; font-weight: 700; color: #fff; text-align: center; max-width: 380px;">
            ${story.caption}
          </p>
        </div>

        <div class="story-modal-footer">
          <button class="pill-btn" id="story-inspect-action-btn" style="background: ${story.previewColor}; color: #fff; border: none;">
            <span>Inspect Live Stream &rarr;</span>
          </button>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('close-story-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    const inspectBtn = document.getElementById('story-inspect-action-btn');
    if (inspectBtn) {
      inspectBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (story.mediaType === 'portal') {
          if (typeof this.onNavigate === 'function') this.onNavigate('nagrik-ai');
        } else {
          if (typeof this.onNavigate === 'function') this.onNavigate('control-room');
        }
      });
    }
  }

  getDynamicStories() {
    const liveCity = geminiLiveEngine.getLiveCityData();
    return [
      { id: "story-radar", name: "IMD Nagpur", avatar: "🌦️", handle: "@imd_nagpur_radar", badge: "bot", hasUnseen: true, tag: `${liveCity.weather.precipitation} mm/h`, caption: `Doppler sweep: ${liveCity.weather.precipitation} mm/h · Temp: ${liveCity.weather.temperature}°C (${liveCity.weather.condition})`, mediaType: "radar", previewColor: "#0ea5e9" },
      { id: "story-underpass", name: "Manish Nagar", avatar: "🛑", handle: "@underpass_cam", badge: "cctv", hasUnseen: true, tag: `${liveCity.city.underpasses[0].depth} Depth`, caption: `CCTV Vision AI: Underpass water depth ${liveCity.city.underpasses[0].depth} at Manish Nagar RUB`, mediaType: "cctv", previewColor: "#ef4444" },
      { id: "story-pumps", name: "Ambazari Sluice", avatar: "🚜", handle: "@nmc_stormwater", badge: "gov", hasUnseen: true, tag: "1,450 m³/s", caption: "Ambazari Lake Spillway retention gates and high-discharge pumps active", mediaType: "pumps", previewColor: "#10b981" },
      { id: "story-nagrik", name: "Nagrik AI", avatar: "🤖", handle: "@nagrik_ai", badge: "ai", hasUnseen: true, tag: "Aaple Sarkar", caption: "Autonomous form rectification and DBT grievance resolution active", mediaType: "portal", previewColor: "#a855f7" }
    ];
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
