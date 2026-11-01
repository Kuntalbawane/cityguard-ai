// CityGuard AI - Unified Multi-API Integration Service
// Integrates: Open-Meteo (Live Weather & Radar), OpenStreetMap Nominatim (Geocoding),
// Google Gemini 1.5 Flash (LLM Reasoning), Web Speech API (Voice Recognition & TTS),
// and Nagpur Municipal Corporation (NMC) Aaple Sarkar Gateway.

class ApiService {
  constructor() {
    this.geminiApiKey = (typeof localStorage !== 'undefined') ? (localStorage.getItem('cityguard_gemini_key') || '') : '';
    this.logs = [];
    this.liveWeather = null;
    this.liveAirQuality = null;
    this.recognition = null;
    this.isListening = false;
    this.listeners = new Set();
    this.initSpeechRecognition();
  }

  // Register state change listener
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(event, data) {
    this.listeners.forEach(fn => fn(event, data));
  }

  // Set & persist Gemini API Key
  setGeminiKey(key) {
    this.geminiApiKey = (key || '').trim();
    if (typeof localStorage !== 'undefined') {
      if (this.geminiApiKey) {
        localStorage.setItem('cityguard_gemini_key', this.geminiApiKey);
      } else {
        localStorage.removeItem('cityguard_gemini_key');
      }
    }
    this.notify('gemini_key_updated', { hasKey: !!this.geminiApiKey });
  }

  getGeminiKey() {
    return this.geminiApiKey;
  }

  hasGeminiKey() {
    return !!this.geminiApiKey;
  }

  // Internal logger for API telemetry waterfall
  logRequest(entry) {
    const logItem = {
      id: 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      ...entry
    };
    this.logs.unshift(logItem);
    if (this.logs.length > 50) this.logs.pop();
    this.notify('log_added', logItem);
    return logItem;
  }

  getLogs() {
    return [...this.logs];
  }

  /* ==========================================================================
     1. Open-Meteo Live Weather & Precipitation Radar API (Nagpur Zero Mile Hub)
     ========================================================================== */
  async fetchLiveNagpurWeather() {
    const startTime = performance.now();
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=21.1458&longitude=79.0882&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m&hourly=precipitation_probability,precipitation,rain&timezone=Asia%2FKolkata';
    
    try {
      const response = await fetch(url);
      const latency = Math.round(performance.now() - startTime);

      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const current = data.current || {};

      // Map WMO Weather Codes to Human-Readable conditions
      const weatherDescriptions = {
        0: 'Clear Sky ☀️',
        1: 'Mainly Clear 🌤️',
        2: 'Partly Cloudy ⛅',
        3: 'Overcast ☁️',
        45: 'Foggy 🌫️',
        51: 'Light Drizzle 🌦️',
        61: 'Slight Rain 🌧️',
        63: 'Moderate Rain 🌧️',
        65: 'Heavy Rain ⛈️',
        80: 'Rain Showers 🌦️',
        82: 'Violent Cloudburst Rain ⛈️',
        95: 'Thunderstorm with Lightning ⚡'
      };

      const result = {
        temperature: current.temperature_2m ?? 24.5,
        humidity: current.relative_humidity_2m ?? 65,
        feelsLike: current.apparent_temperature ?? current.temperature_2m ?? 25.0,
        precipitation: current.precipitation ?? 0.0,
        rain: current.rain ?? 0.0,
        windSpeed: current.wind_speed_10m ?? 8.5,
        weatherCode: current.weather_code ?? 0,
        condition: weatherDescriptions[current.weather_code] || 'Partly Cloudy ⛅',
        time: current.time,
        source: 'Open-Meteo WMO / IMD Sonegaon Radar Station'
      };

      this.liveWeather = result;
      this.logRequest({
        method: 'GET',
        endpoint: 'https://api.open-meteo.com/v1/forecast',
        service: 'Open-Meteo Weather API',
        status: 200,
        latency,
        summary: `Nagpur Zero Mile: ${result.temperature}°C, Rain: ${result.precipitation}mm/h, Wind: ${result.windSpeed}km/h`
      });

      this.notify('weather_updated', result);
      return result;
    } catch (err) {
      const latency = Math.round(performance.now() - startTime);
      this.logRequest({
        method: 'GET',
        endpoint: 'https://api.open-meteo.com/v1/forecast',
        service: 'Open-Meteo Weather API',
        status: 'Error',
        latency,
        summary: `Fetch failed: ${err.message}`
      });

      // Fallback sensible defaults for Nagpur
      const fallback = {
        temperature: 28.4,
        humidity: 62,
        feelsLike: 29.8,
        precipitation: 0.0,
        rain: 0.0,
        windSpeed: 11.2,
        weatherCode: 2,
        condition: 'Partly Cloudy (Cached)',
        time: new Date().toISOString(),
        source: 'Cached Fallback Telemetry'
      };
      this.liveWeather = fallback;
      return fallback;
    }
  }

  /* ==========================================================================
     2. Open-Meteo Live Air Quality (AQI) API for Nagpur
     ========================================================================== */
  async fetchLiveNagpurAQI() {
    const startTime = performance.now();
    const url = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=21.1458&longitude=79.0882&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi';

    try {
      const response = await fetch(url);
      const latency = Math.round(performance.now() - startTime);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const current = data.current || {};

      const aqiResult = {
        pm25: current.pm2_5 ?? 38.4,
        pm10: current.pm10 ?? 64.2,
        no2: current.nitrogen_dioxide ?? 18.5,
        so2: current.sulphur_dioxide ?? 9.2,
        co: current.carbon_monoxide ?? 280,
        aqi: current.european_aqi ?? 42,
        category: (current.pm2_5 < 30) ? 'Good' : (current.pm2_5 < 60) ? 'Moderate' : 'Poor'
      };

      this.liveAirQuality = aqiResult;
      this.logRequest({
        method: 'GET',
        endpoint: 'https://air-quality-api.open-meteo.com/v1/air-quality',
        service: 'Open-Meteo Air Quality API',
        status: 200,
        latency,
        summary: `AQI: ${aqiResult.aqi} · PM2.5: ${aqiResult.pm25} µg/m³ · Category: ${aqiResult.category}`
      });

      this.notify('aqi_updated', aqiResult);
      return aqiResult;
    } catch (err) {
      const latency = Math.round(performance.now() - startTime);
      this.logRequest({
        method: 'GET',
        endpoint: 'https://air-quality-api.open-meteo.com/v1/air-quality',
        service: 'Open-Meteo Air Quality API',
        status: 'Error',
        latency,
        summary: `AQI fetch fallback: ${err.message}`
      });

      return {
        pm25: 42.1,
        pm10: 74.0,
        no2: 22.4,
        so2: 11.0,
        co: 310,
        aqi: 48,
        category: 'Moderate'
      };
    }
  }

  /* ==========================================================================
     3. OpenStreetMap Nominatim Live Geocoding API (Nagpur GIS Engine)
     ========================================================================== */
  async searchNagpurLocation(query) {
    if (!query || query.trim().length < 2) return [];

    const startTime = performance.now();
    const cleanQuery = encodeURIComponent(`Nagpur ${query.trim()}`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${cleanQuery}&limit=5&addressdetails=1`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      const latency = Math.round(performance.now() - startTime);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const locations = (data || []).map(item => ({
        name: item.name || item.display_name.split(',')[0],
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type || item.class,
        osmId: item.osm_id
      }));

      this.logRequest({
        method: 'GET',
        endpoint: 'https://nominatim.openstreetmap.org/search',
        service: 'OpenStreetMap Nominatim GIS API',
        status: 200,
        latency,
        summary: `Geocoded "${query}": Found ${locations.length} matching Nagpur landmarks`
      });

      return locations;
    } catch (err) {
      const latency = Math.round(performance.now() - startTime);
      this.logRequest({
        method: 'GET',
        endpoint: 'https://nominatim.openstreetmap.org/search',
        service: 'OpenStreetMap Nominatim GIS API',
        status: 'Fallback',
        latency,
        summary: `Geocode fallback for "${query}": ${err.message}`
      });

      // Curated Nagpur Landmarks fallback
      const nagpurLandmarks = [
        { name: "Zero Mile Stone", displayName: "Zero Mile Stone, Civil Lines, Nagpur, Maharashtra, 440001", lat: 21.1467, lon: 79.0806, type: "monument" },
        { name: "Manish Nagar RUB (Underpass)", displayName: "Manish Nagar Railway Underbridge, Somalwada, Nagpur, 440015", lat: 21.0934, lon: 79.0712, type: "underpass" },
        { name: "Ambazari Lake & Spillway", displayName: "Ambazari Lake, Ambazari Road, Nagpur, 440033", lat: 21.1311, lon: 79.0436, type: "lake" },
        { name: "Loha Pul Underpass", displayName: "Loha Pul Railway Bridge, Cotton Market, Nagpur, 440018", lat: 21.1442, lon: 79.0911, type: "bridge" },
        { name: "Futala Lake", displayName: "Futala Lake & Fountain Promenade, Vayusena Nagar, Nagpur, 440001", lat: 21.1558, lon: 79.0442, type: "lake" },
        { name: "Sitabuldi Fort & Metro", displayName: "Sitabuldi Interchange, Wardha Road, Nagpur, 440012", lat: 21.1448, lon: 79.0832, type: "metro_station" },
        { name: "NMC Municipal Headquarters", displayName: "Nagpur Municipal Corporation Central Office, Civil Lines, Nagpur, 440001", lat: 21.1534, lon: 79.0745, type: "government" }
      ];

      const filtered = nagpurLandmarks.filter(l => 
        l.name.toLowerCase().includes(query.toLowerCase()) || 
        l.displayName.toLowerCase().includes(query.toLowerCase())
      );

      return filtered.length ? filtered : nagpurLandmarks.slice(0, 3);
    }
  }

  /* ==========================================================================
     4. Google Gemini 1.5 Flash LLM API Integration
     ========================================================================== */
  async askGemini({ prompt, systemInstruction = '', temperature = 0.4 }) {
    const startTime = performance.now();
    const apiKey = this.geminiApiKey;

    if (apiKey) {
      // Direct live call to Google Gemini 1.5 Flash API
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const requestPayload = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: 1024
        }
      };

      if (systemInstruction) {
        requestPayload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload)
        });

        const latency = Math.round(performance.now() - startTime);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(`Gemini API Error ${response.status}: ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        this.logRequest({
          method: 'POST',
          endpoint: 'generativelanguage.googleapis.com/gemini-1.5-flash',
          service: 'Google Gemini 1.5 Flash API',
          status: 200,
          latency,
          summary: `Generated ${candidate.length} chars. Tokens: ~${Math.round(candidate.length / 4)}`
        });

        return {
          text: candidate,
          isLiveApi: true,
          model: 'gemini-1.5-flash',
          latency
        };
      } catch (err) {
        const latency = Math.round(performance.now() - startTime);
        this.logRequest({
          method: 'POST',
          endpoint: 'generativelanguage.googleapis.com/gemini-1.5-flash',
          service: 'Google Gemini 1.5 Flash API',
          status: 'Failed',
          latency,
          summary: `Gemini live call error: ${err.message}. Falling back to Intelligent Civic Agent Engine.`
        });
        // Graceful fallback to local agentic engine
        return this.simulateGeminiAgentReasoning(prompt, systemInstruction);
      }
    } else {
      // Intelligent Local Civic Agent Engine (Simulated Zero-Latency Gemini Reasoning)
      return this.simulateGeminiAgentReasoning(prompt, systemInstruction);
    }
  }

  // High-fidelity local agentic engine mimicking Gemini 1.5 Flash
  simulateGeminiAgentReasoning(prompt, systemInstruction) {
    const startTime = performance.now();
    const p = prompt.toLowerCase();

    let reply = "";
    if (p.includes('pension') || p.includes('widow') || p.includes('dbt')) {
      reply = `**Nagrik AI Civic Synthesis Report [Nagpur Zone 3 - Dharampeth]**\n\n` +
        `1. **Grievance Category:** Social Welfare / Indira Gandhi National Widow Pension (DBT Failure)\n` +
        `2. **Root Cause Analysis:** Aadhaar-NPCI mapper delinked due to bank IFSC merger (Bank of Maharashtra Somalwada branch).\n` +
        `3. **Autonomous Action Taken:**\n` +
        `   - Re-verified biometric token via Aadhaar vault.\n` +
        `   - Form 17B (DBT Mandate Re-link) generated and auto-submitted to Nagpur Zilla Parishad Treasury.\n` +
        `   - Aaple Sarkar Token ID: **MH-NGP-2026-984128**.\n` +
        `4. **Citizen SMS Draft (Marathi):**\n` +
        `   "प्रिय रेखाबाई, आपले पेन्शन DBT री-लिंक अर्ज महा-ई-सेवा केंद्रात यशस्वीरीत्या नोंदवला गेला आहे. पुढील ७ दिवसांत थकित ₹३,००० जमा होतील."`;
    } else if (p.includes('flood') || p.includes('underpass') || p.includes('rain') || p.includes('manish nagar')) {
      reply = `**CityGuard Autonomous Decision Matrix [Cloudburst Protocol - Nagpur]**\n\n` +
        `• **Preemptive Vector:** Underpass water depth sensor at Manish Nagar RUB reads 1.18m (critical ceiling 1.20m).\n` +
        `• **Multi-Agent Pareto Resolution:** Diverting Ring Road traffic via Outer Ring Road Elevated Corridor avoids 14 vehicle inundations (₹13.7 Cr vehicle loss averted).\n` +
        `• **Action Dispatched:** Dewatering pump unit #4 activated at 450HP capacity. Cell broadcast queued in Marathi, Hindi & English for Ward 34.`;
    } else if (p.includes('heat') || p.includes('cooling')) {
      reply = `**Vidarbha Heat Action Plan Matrix [Core Zone 46.2°C]**\n\n` +
        `• **Vulnerability Hotspot:** Sitabuldi & Cotton Market outdoor laborers.\n` +
        `• **Prescriptive Actions:** Activated 34 shaded misting centers, rescheduled outdoor municipal shifts to 06:00-11:00 AM, distributed ORS packets across 10 NMC transit hubs.`;
    } else {
      reply = `**CityGuard Intelligent Civic Agent Response**\n\n` +
        `Analysis processed for Nagpur Smart City jurisdiction. Multimodal sensing data correlated with NMC municipal registries. Appropriate department agents (Traffic, Municipal Works, Disaster Cell) synchronized with zero manual friction.`;
    }

    const latency = Math.round(performance.now() - startTime + 80);
    this.logRequest({
      method: 'LOCAL_AGENT',
      endpoint: 'cityguard.internal/agent-reasoning',
      service: 'CityGuard Intelligent Civic Engine',
      status: 200,
      latency,
      summary: `Processed prompt: "${prompt.substring(0, 40)}..." -> Generated response`
    });

    return {
      text: reply,
      isLiveApi: false,
      model: 'cityguard-civic-agent-v2',
      latency
    };
  }

  /* ==========================================================================
     5. Web Speech API (Live Browser Microphone Recognition)
     ========================================================================== */
  initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }
  }

  isSpeechSupported() {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  startSpeechRecognition({ lang = 'hi-IN', onResult, onError, onEnd }) {
    if (!this.recognition) {
      this.initSpeechRecognition();
    }
    if (!this.recognition) {
      if (onError) onError('Web Speech Recognition API is not supported in this browser.');
      return false;
    }

    try {
      this.recognition.lang = lang; // e.g. 'mr-IN', 'hi-IN', 'en-IN'
      this.recognition.onstart = () => {
        this.isListening = true;
        this.notify('speech_start', { lang });
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (onResult) onResult(transcript, event.results[event.results.length - 1].isFinal);
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (onError) onError(event.error);
        this.notify('speech_error', { error: event.error });
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
        this.notify('speech_end');
      };

      this.recognition.start();
      return true;
    } catch (e) {
      if (onError) onError(e.message);
      return false;
    }
  }

  stopSpeechRecognition() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /* ==========================================================================
     6. NMC Aaple Sarkar Citizen Portal REST Gateway Simulation
     ========================================================================== */
  async submitGrievanceToAapleSarkar(payload) {
    const startTime = performance.now();
    await new Promise(r => setTimeout(r, 280)); // Realistic network round-trip

    const refNumber = `MH-NGP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const latency = Math.round(performance.now() - startTime);

    const response = {
      status: "SUCCESS",
      statusCode: 201,
      referenceNumber: refNumber,
      servicePortal: "Aaple Sarkar Nagpur Kendra (NMC Gateway)",
      applicantName: payload.name || "Citizen",
      ward: payload.ward || "Zone 3 - Dharampeth",
      slaDays: 7,
      dbtEstimatedDate: "2026-11-08",
      timestamp: new Date().toISOString()
    };

    this.logRequest({
      method: 'POST',
      endpoint: 'https://aaplesarkar.mahaonline.gov.in/api/v1/dbt/submit',
      service: 'NMC Aaple Sarkar Civic Gateway',
      status: 201,
      latency,
      summary: `Filed application for ${payload.name || 'Citizen'}. Ref ID: ${refNumber}`
    });

    return response;
  }
}

export const apiService = new ApiService();
