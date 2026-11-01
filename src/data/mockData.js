// CityGuard AI - Real Indian Cities & Multi-Agent Mock Data (Nagpur Smart City Edition)

export const CITIES = {
  nagpur: {
    id: "nagpur",
    name: "Nagpur Smart City (Zero Mile)",
    authority: "Nagpur Municipal Corporation (NMC) & Nagpur Police Command Hub",
    state: "Maharashtra",
    primaryLang: "Marathi / Hindi",
    center: { lat: 21.1458, lng: 79.0882 },
    weatherStation: "IMD Nagpur (Sonegaon Airport Doppler Radar)",
    elevation: "310m MSL",
    wards: [
      { id: "W01", name: "Dharampeth & Ambazari Catchment", riskLevel: "critical", currentWaterDepth: "88 cm", heatIndex: "+3.8°C", sensors: 185 },
      { id: "W02", name: "Sitabuldi & Zero Mile Metro Interchange", riskLevel: "critical", currentWaterDepth: "94 cm", heatIndex: "+4.2°C", sensors: 230 },
      { id: "W03", name: "Manish Nagar & Somalwada (RUB Corridor)", riskLevel: "critical", currentWaterDepth: "1.18m", heatIndex: "+3.6°C", sensors: 245 },
      { id: "W04", name: "Loha Pul & Cotton Market Underpass", riskLevel: "critical", currentWaterDepth: "1.12m", heatIndex: "+3.9°C", sensors: 210 },
      { id: "W05", name: "Narendra Nagar & Ring Road Basin", riskLevel: "high", currentWaterDepth: "72 cm", heatIndex: "+3.4°C", sensors: 175 },
      { id: "W06", name: "Maharajbagh & Civil Lines Secretariat", riskLevel: "medium", currentWaterDepth: "32 cm", heatIndex: "+3.1°C", sensors: 160 },
      { id: "W07", name: "Pardi & Bhandara Road Junction", riskLevel: "high", currentWaterDepth: "64 cm", heatIndex: "+3.5°C", sensors: 190 },
      { id: "W08", name: "Reshimbagh & Sakkaradara Basin", riskLevel: "medium", currentWaterDepth: "40 cm", heatIndex: "+3.7°C", sensors: 165 }
    ],
    underpasses: [
      { id: "UP-NGP-01", name: "Manish Nagar Railway Underpass (RUB)", depth: "1.18m", status: "flooding_fast", barrierAutoDeploy: true, critDepth: "1.20m" },
      { id: "UP-NGP-02", name: "Loha Pul (Iron Bridge Underpass, Sitabuldi)", depth: "1.12m", status: "flooding_fast", barrierAutoDeploy: true, critDepth: "1.15m" },
      { id: "UP-NGP-03", name: "Narendra Nagar Railway Underpass", depth: "0.95m", status: "caution", barrierAutoDeploy: false, critDepth: "1.10m" },
      { id: "UP-NGP-04", name: "Pardi Bhavani Mata Subway", depth: "0.65m", status: "caution", barrierAutoDeploy: false, critDepth: "1.00m" }
    ],
    pumps: [
      { id: "PUMP-NGP-01", location: "Ambazari Lake Spillway Sluice 1-4", capacity: "1450 m³/s", status: "running" },
      { id: "PUMP-NGP-02", location: "Manish Nagar High-Discharge Pump Bank (4x 450HP)", capacity: "1800 HP", status: "running" },
      { id: "PUMP-NGP-03", location: "Loha Pul Submersible Sump Station", capacity: "900 HP", status: "running" },
      { id: "PUMP-NGP-04", location: "Nag River Mor Bhavan Retention Gate", capacity: "650 HP", status: "ready" }
    ]
  }
};

// Aliases for compatibility so existing city keys don't break
CITIES.bengaluru = CITIES.nagpur;
CITIES.mumbai = CITIES.nagpur;
CITIES.delhi = CITIES.nagpur;

export const SCENARIOS = {
  cloudburst: {
    id: "cloudburst",
    title: "Nagpur Cloudburst & Nag River Flash Flood (84.6mm/h)",
    type: "flood",
    severity: "CRITICAL RED ALERT",
    timeDetected: "T-00:42 ago",
    leadTimeRemaining: "18 minutes before Manish Nagar RUB critical submersion",
    weatherOverview: "Stalled convective cloudburst cell over Nagpur Zero Mile core. 84.6 mm/h recorded by IMD Sonegaon Doppler Radar. Ambazari Lake at 100.8% Full Tank Level.",
    sensingData: [
      {
        source: "radar",
        sourceLabel: "IMD Nagpur Doppler Radar",
        timestamp: "02:14:10 IST",
        title: "Convective Storm Cell over Ambazari & Somalwada",
        desc: "Radar reflectivity 58.4 dBZ recorded at Sonegaon station. Cloud top 14.2 km. Projected rainfall: 85-95mm in 45 mins directly over Nag River catchment.",
        metric: "84.6 mm/hr",
        tag: "Hydrology Mesh"
      },
      {
        source: "citizen",
        sourceLabel: "Citizen WhatsApp / NMC 155304 SOS",
        timestamp: "02:15:32 IST",
        title: "56 Geo-tagged Citizen SOS in 8 minutes",
        desc: "Citizens reporting water gushing past wheel rims at Manish Nagar underpass and Sitabuldi Loha Pul. 3 city buses halted safely before entry.",
        metric: "56 SOS calls · 22 photo uploads",
        tag: "Crowd Sensing"
      },
      {
        source: "cctv",
        sourceLabel: "Nagpur Smart City CCTV Vision AI",
        timestamp: "02:16:04 IST",
        title: "Underpass Optical Depth Sensor Alert",
        desc: "YOLOv10 Water-Depth model detected rapid surge from 40cm to 1.18m in 12 minutes at Manish Nagar RUB. Drop-gate preemption triggered.",
        metric: "Depth: 1.18m (Crit: 1.20m)",
        tag: "Computer Vision"
      },
      {
        source: "social",
        sourceLabel: "Social Radar & Twitter/X",
        timestamp: "02:16:45 IST",
        title: "Social Sentiment Surge (+480% flood tweets)",
        desc: "'Manish Nagar underpass water level scary', 'Loha Pul closed avoid Sitabuldi', 'Ambazari lake overflowing'. NLP clustered 18 urgent rescue requests.",
        metric: "Trending #NagpurRains 24.8k/hr",
        tag: "NLP Agent"
      }
    ],
    counterfactualPlans: {
      planA: {
        id: "planA",
        name: "Plan Alpha: Autonomous Early Action (Recommended)",
        subtitle: "Multi-Agent Coordinated Preemption & Digital Twin Optimization",
        isRecommended: true,
        summary: "Preemptively drop electronic safety gates at Manish Nagar RUB and Loha Pul Sitabuldi; trigger Smart Green Wave on Wardha Road Elevated Corridor & Ring Road; power on 4x 450HP storm pumps at Ambazari spillway; blast geo-fenced voice/SMS alerts to 140,000 citizens in Marathi, Hindi & English.",
        rationale: "Digital twin hydraulic simulation indicates storm inflow rate is 3.1x gravity drainage capacity. Preemptive barrier closure guarantees zero trapped vehicle fatalities; intelligent traffic diversion maintains arterial flow to MIHAN and Airport.",
        metrics: {
          projectedCasualties: "0 (Zero Fatalities)",
          commuteDelay: "+11 mins (Elevated Flyover)",
          infrastructureDamage: "₹1.2 Crore",
          coordinationLatency: "3.5 minutes",
          drainageEfficiency: "96% Active Pumping"
        },
        actions: [
          { dept: "Traffic Police Agent", task: "Deploy automated drop-gate barrier at Manish Nagar RUB & Loha Pul; activate Smart Green Wave on Wardha Road Elevated Flyover." },
          { dept: "NMC Municipal Works", task: "Engage 4x 450HP high-flow pumps at Ambazari Lake Spillway & open Nag River Mor Bhavan sluice gates." },
          { dept: "MSEDCL Power Grid", task: "Remotely isolate 11kV low-lying feeder line in Somalwada/Manish Nagar basin to eliminate electrocution risk." },
          { dept: "Citizen Alert Agent", task: "Broadcast WhatsApp/Cell alerts in Marathi, Hindi, and English to 140,000 geo-fenced citizens." }
        ]
      },
      planB: {
        id: "planB",
        name: "Plan Beta: Legacy Reactive Protocol (Status Quo)",
        subtitle: "Manual Department-by-Department Escalation",
        isRecommended: false,
        summary: "Wait until underpass depth exceeds 1.25m before manually dispatching police barricade vans. Mobilize NMC diesel pumps only after repeated physical distress calls.",
        rationale: "Follows obsolete departmental silos where municipal works and traffic police operate without real-time AI synchronization.",
        metrics: {
          projectedCasualties: "4-6 trapped vehicles (Severe Risk)",
          commuteDelay: "+125 mins (Gridlock)",
          infrastructureDamage: "₹16.5 Crore",
          coordinationLatency: "82 minutes",
          drainageEfficiency: "35%"
        },
        actions: [
          { dept: "Traffic Police Agent", task: "Manual barricade vehicle dispatch via wireless (Est. 50 min arrival in gridlock)." },
          { dept: "NMC Municipal Works", task: "Diesel pump mobilization only after physical water inspection report." },
          { dept: "Citizen Alert Agent", task: "Advisory posted on website portal (Zero proactive geo-fenced push alerts)." }
        ]
      }
    },
    alerts: {
      marathi: "⚠️ तात्काळ इशारा (NMC आपत्ती व्यवस्थापन कक्ष): मुसळधार पावसामुळे मनीष नगर रेल्वे अंडरपास आणि सीताबर्डी लोहा पूल येथे पाणी साचले आहे. वाहतूक वर्धा रोड उड्डाणपुलावरून वळवण्यात आली आहे. कृपया अंडरपासचा वापर टाळा. आपत्कालीन मदत: 155304.",
      hindi: "⚠️ आपातकालीन चेतावनी (नागपुर नियंत्रण कक्ष): भारी बारिश से मनीष नगर अंडरपास और लोहा पुल सीताबर्डी में गंभीर जलभराव। यातायात को वर्धा रोड फ्लाईओवर और रिंग रोड पर डायवर्ट किया गया है। कृपया जलमग्न अंडरपास में न जाएं। हेल्पलाइन: 155304.",
      english: "⚠️ URGENT ADVISORY (Nagpur Smart City Control Room): Severe flash flooding at Manish Nagar RUB & Loha Pul Underpass. Traffic diverted to Wardha Road Elevated Corridor. 4x 450HP pumps active. Avoid subways.",
      tamil: "⚠️ எச்சரிக்கை (நாக்பூர் ஸ்மார்ட் சிட்டி): கனமழை காரணமாக மணீஷ் நகர் மற்றும் லோகா புல் சுரங்கப்பாதைகளில் நீர் தேங்கியுள்ளது. சுரங்கப்பாதைகளைத் தவிர்க்கவும்."
    }
  },

  heatwave: {
    id: "heatwave",
    title: "Vidarbha Extreme Heatwave (46.2°C Nagpur Core Spike)",
    type: "heat",
    severity: "ORANGE HEAT EMERGENCY",
    timeDetected: "T-01:15 ago",
    leadTimeRemaining: "Peak solar irradiance in 35 minutes",
    weatherOverview: "Severe Vidarbha summer heatwave causing central Nagpur asphalt corridors to run +4.2°C hotter than peri-urban areas. Wet-bulb temp approaching 32.1°C.",
    sensingData: [
      {
        source: "radar",
        sourceLabel: "Thermal Satellite & AWS Mesh",
        timestamp: "02:10:00 IST",
        title: "Urban Heat Island Peak Thermal Inversion",
        desc: "Surface temperature in Sitabuldi, Mahal, and Cotton Market clocked at 46.2°C vs 41.5°C in Gorewada periphery.",
        metric: "46.2°C (+4.2°C Core Delta)",
        tag: "Satellite Thermal"
      },
      {
        source: "citizen",
        sourceLabel: "108 Ambulance & Health Calls",
        timestamp: "02:12:15 IST",
        title: "Spike in Heat Stroke & Dehydration Cases",
        desc: "24 heat distress calls logged in last 30 minutes, primarily street vendors, rickshaw drivers, and outdoor construction workers.",
        metric: "24 Emergency Health Calls",
        tag: "Health Telemetry"
      },
      {
        source: "cctv",
        sourceLabel: "Smart Pole Solar Radiometers",
        timestamp: "02:13:50 IST",
        title: "UV Index Reaching Extreme Category 12+",
        desc: "Direct solar flux 980 W/m² at Zero Mile Monument. Critical danger of heat stroke for outdoor populations between 11:30 AM and 4:00 PM.",
        metric: "UV Index 12.1 (Extreme)",
        tag: "IoT Mesh"
      },
      {
        source: "social",
        sourceLabel: "MSEDCL Power Grid Telemetry",
        timestamp: "02:15:20 IST",
        title: "Substation Transformer Overheating Alarm",
        desc: "Surging AC load causing 33kV Sitabuldi commercial substation transformer oil temperature to reach 91°C.",
        metric: "Grid Load: 97.8% Peak",
        tag: "Power Works"
      }
    ],
    counterfactualPlans: {
      planA: {
        id: "planA",
        name: "Plan Alpha: Proactive Heat Refuge & Mist Dispersion (Recommended)",
        subtitle: "Multi-Agency Coordinated Climate Action",
        isRecommended: true,
        summary: "Immediately open 34 air-conditioned cooling centres with ORS in Sitabuldi, Dharampeth & Cotton Market; deploy 16 mobile water misting tankers to Mor Bhavan bus stand & Zero Mile; enforce outdoor labor stand-down 11:30 AM - 4:00 PM.",
        rationale: "Prevents heatstroke fatalities among vulnerable street workers while managing peak substation thermal stress via automated demand-side balancing.",
        metrics: {
          projectedCasualties: "0 Heatstroke ICU admissions",
          commuteDelay: "Normal",
          infrastructureDamage: "₹0 Grid Burnout",
          coordinationLatency: "2.8 minutes",
          drainageEfficiency: "100% Shelter Capacity"
        },
        actions: [
          { dept: "Health Department Agent", task: "Activate 34 Ward Community Halls as AC Cooling Centers with chilled water and free ORS sachets." },
          { dept: "Municipal Works Agent", task: "Dispatch 16 high-pressure mist tankers to Mor Bhavan, Sitabuldi Metro, and Cotton Market." },
          { dept: "Labor & Police Agent", task: "Issue automated mandatory work suspension order for all outdoor construction sites from 11:30 to 16:00." },
          { dept: "Citizen Broadcast Agent", task: "Push hydration alerts and nearest cooling shelter GPS links via WhatsApp in Marathi & Hindi." }
        ]
      },
      planB: {
        id: "planB",
        name: "Plan Beta: Standard Advisory (Status Quo)",
        subtitle: "Passive Municipal Website Notice",
        isRecommended: false,
        summary: "Publish static PDF heatwave advisory on municipal website and alert Government Medical College (GMC) to prepare triage beds.",
        rationale: "Relies on citizens having internet access to proactively read government advisories; no mobile field intervention.",
        metrics: {
          projectedCasualties: "35-50 severe heat exhaustion cases",
          commuteDelay: "Normal",
          infrastructureDamage: "Substation tripping risk",
          coordinationLatency: "95 minutes",
          drainageEfficiency: "N/A"
        },
        actions: [
          { dept: "Health Department Agent", task: "Prepare 20 beds at GMC & Mayo Hospital triage wing." },
          { dept: "Municipal Works Agent", task: "No active misting or cooling center mobilization." },
          { dept: "Citizen Broadcast Agent", task: "Post PDF notice on official NMC portal." }
        ]
      }
    },
    alerts: {
      marathi: "☀️ तीव्र उष्णतेची लाट इशारा (NMC आरोग्य विभाग): नागपूर शहरात तापमान 46.2°C वर पोहोचले आहे. सीताबर्डी, धरमपेठ आणि कॉटन मार्केटमध्ये 34 वातानुकूलित कुलिंग शेल्टर्स सुरू करण्यात आले आहेत. दुपारी 11:30 ते 4:00 दरम्यान उन्हात जाणे टाळा. मदत क्रमांक: 155304.",
      hindi: "☀️ भीषण लू और हीटवेव चेतावनी (नागपुर): तापमान 46.2°C दर्ज। सीताबर्डी और कॉटन मार्केट में 34 कूलिंग सेंटर शुरू किए गए हैं जहां मुफ्त ठंडा पानी और ओआरएस उपलब्ध है। दोपहर 11:30 से 4:00 बजे तक धूप में काम बंद रखें।",
      english: "☀️ SEVERE HEATWAVE WARNING: Temperature peaking at 46.2°C in Nagpur core. 34 air-conditioned cooling centers activated across Wards with free ORS and hydration. Outdoor labor suspended 11:30 AM - 4:00 PM.",
      tamil: "☀️ கடுமையான வெப்ப அலை எச்சரிக்கை: நாக்பூரில் வெப்பம் 46.2°C தாண்டியுள்ளது. 34 குளிரூட்டும் மையங்கள் திறக்கப்பட்டுள்ளன."
    }
  },

  grievance: {
    id: "grievance",
    title: "Nagrik Civic Agent: Service Delivery Stoppage",
    type: "civic",
    severity: "CITIZEN AGENT ASSIST",
    timeDetected: "T-00:12 ago",
    leadTimeRemaining: "Application pending for 26 days on Aaple Sarkar",
    weatherOverview: "Administrative workflow bottleneck detected on Maharashtra Aaple Sarkar / NMC e-Governance portal.",
    sensingData: [
      {
        source: "citizen",
        sourceLabel: "Voice Intake Agent (Marathi / Hindi)",
        timestamp: "02:18:12 IST",
        title: "Voice Grievance from Smt. Sunita Tai Raut (Age 64)",
        desc: "'Maza Sanjay Gandhi Niradhar pension don mahinya pasun aala nahi, bank wale boltat DBT link fail zala aahe...'",
        metric: "Intent: Pension DBT Restart",
        tag: "Voice NLP"
      },
      {
        source: "radar",
        sourceLabel: "Citizen DigiLocker Vault",
        timestamp: "02:18:40 IST",
        title: "Autonomous Document Discovery & Verification",
        desc: "Found verified Aadhaar token and spouse death certificate in DigiLocker vault. Consent verified for single-purpose access.",
        metric: "DigiLocker KYC 100% Match",
        tag: "Consent Vault"
      },
      {
        source: "cctv",
        sourceLabel: "Computer Use Portal Agent",
        timestamp: "02:19:15 IST",
        title: "Automated Navigation on Aaple Sarkar Portal",
        desc: "Agent executed 5 form steps, uploaded income certificate, solved captcha, and identified NPCI bank mapping error code E-04.",
        metric: "Portal Form Submitted",
        tag: "Computer Use"
      },
      {
        source: "social",
        sourceLabel: "Follow-up Voice Agent",
        timestamp: "02:20:00 IST",
        title: "Autonomous Call to Collectorate / Tehsil Revenue Desk",
        desc: "Civic Agent placed voice call to Tehsil Revenue Officer (Sitabuldi), explained NPCI re-link, and secured immediate approval reference.",
        metric: "Call Duration: 2m 14s",
        tag: "Voice Bot Call"
      }
    ],
    counterfactualPlans: {
      planA: {
        id: "planA",
        name: "Plan Alpha: End-to-End Autonomous Civic Agent Action",
        subtitle: "Computer Use + Voice Intake + Automated Phone Follow-Up",
        isRecommended: true,
        summary: "Take voice input in Marathi dialect, fetch documents from DigiLocker with cryptographic consent, auto-submit portal rectification via computer use on Aaple Sarkar, and call the Tehsil office autonomously when stalled.",
        rationale: "Eliminates middlemen, requires zero travel for the elderly citizen, resolves bureaucratic stagnation within 24 hours.",
        metrics: {
          projectedCasualties: "₹0 Middleman Bribe Paid",
          commuteDelay: "0 Citizen Office Visits",
          infrastructureDamage: "100% Data Consent Protected",
          coordinationLatency: "Automated in 1 Day",
          drainageEfficiency: "Resolution Rate: 98%"
        },
        actions: [
          { dept: "Voice Intake Agent", task: "Convert citizen voice in Marathi/Hindi into structured administrative request." },
          { dept: "Computer Use Portal Agent", task: "Autonomously navigate Aaple Sarkar portal, fill forms, and upload verified credentials." },
          { dept: "Autonomous Follow-up Voice Agent", task: "Place interactive phone call to stalled Tehsil revenue desk with formal case tracking." },
          { dept: "Consent & Privacy Vault", task: "Ensure zero-knowledge document tokenization and auto-mask Aadhaar credentials." }
        ]
      },
      planB: {
        id: "planB",
        name: "Plan Beta: Conventional Citizen Ordeal (Status Quo)",
        subtitle: "Manual Cyber Cafe & Middleman Route",
        isRecommended: false,
        summary: "Citizen travels 14km to Tehsil office, stands in line for 4 hours, pays ₹1,500 to informal cyber cafe broker, faces indefinite stall.",
        rationale: "Current fragmented system with opaque status tracking and zero administrative accountability.",
        metrics: {
          projectedCasualties: "₹1,500 - ₹2,500 Extortion by Brokers",
          commuteDelay: "4 to 6 Office Visits",
          infrastructureDamage: "Identity Theft / Data Leak Risk",
          coordinationLatency: "Pending 6 to 16 Weeks",
          drainageEfficiency: "High Frustration & Despair"
        },
        actions: [
          { dept: "Citizen Ordeal", task: "Manual physical queuing at government Tehsil desk." },
          { dept: "Middleman Broker", task: "Charging vulnerable citizens for basic free government welfare services." }
        ]
      }
    },
    alerts: {
      marathi: "✅ नागरिक सेवा अपडेट: तुमची संजय गांधी निराधार पेन्शन डीबीटी दुरुस्ती अर्जी यशस्वीरित्या पूर्ण झाली आहे. पावती क्रमांक: MH-NGP-2026-984128. पुढील 48 तासांत रक्कम खात्यात जमा होईल.",
      hindi: "✅ नागरिक सेवा अपडेट: आपकी विधवा पेंशन डीबीटी सुधार अर्जी सफलतापूर्वक जमा कर दी गई है। पावती संख्या: MH-NGP-2026-984128. राशि 48 घंटों में आपके बैंक खाते में आ जाएगी।",
      english: "✅ CIVIC AGENT UPDATE: Your pension DBT seeding application has been successfully resolved through computer-use automation on Aaple Sarkar. Reference ID: MH-NGP-2026-984128. No office visit required.",
      tamil: "✅ குடிமக்கள் சேவை தகவல்: உங்கள் ஓய்வூதிய விண்ணப்பம் வெற்றிகரமாக தாக்கல் செய்யப்பட்டுள்ளது. ஒப்புதல் எண்: MH-NGP-2026-984128."
    }
  }
};

export const NAGRIK_PROMPTS = [
  {
    id: "prompt1",
    language: "Marathi",
    langCode: "mr",
    audioText: "माझी संजय गांधी निराधार विधवा पेन्शन दोन महिन्यांपासून आली नाही. बँक वाले बोलतात DBT मॅपिंग फेल झाली आहे. मला चालता येत नाही, कृपया हे ठीक करून द्या.",
    transcription: "माझी संजय गांधी निराधार विधवा पेन्शन दोन महिन्यांपासून आली नाही. बँक वाले बोलतात DBT मॅपिंग फेल झाली आहे. मला चालता येत नाही, कृपया हे ठीक करून द्या.",
    speaker: "Sunita Tai Raut (Age 64, Sitabuldi, Nagpur)",
    intent: "Pension DBT Re-activation & NPCI Seeding",
    department: "Social Justice & Special Assistance Dept (Maharashtra)",
    requiredDocs: ["Aadhaar Card (Masked)", "Bank Passbook", "Death Certificate of Spouse"],
    estimatedDays: "2 Business Days",
    portalName: "Maharashtra Aaple Sarkar (aaplesarkar.mahaonline.gov.in)"
  },
  {
    id: "prompt2",
    language: "Hindi",
    langCode: "hi",
    audioText: "मेरे बेटे के इंजीनियरिंग कॉलेज स्कॉलरशिप के लिए आय प्रमाण पत्र (Income Certificate) तत्काल चाहिए। आपले सरकार पोर्टल पर सर्वर एरर आ रहा है, कृपया मदद करें।",
    transcription: "मेरे बेटे के इंजीनियरिंग कॉलेज स्कॉलरशिप के लिए आय प्रमाण पत्र तत्काल चाहिए। आपले सरकार पोर्टल पर सर्वर एरर आ रहा है, कृपया मदद करें।",
    speaker: "Rameshwar Kapse (Age 49, Somalwada, Nagpur)",
    intent: "Income Certificate for Higher Education Scholarship",
    department: "Revenue Department (Nagpur Tehsil)",
    requiredDocs: ["Ration Card", "Aadhaar Card", "Salary Certificate / 7/12 Land Record"],
    estimatedDays: "3 Business Days",
    portalName: "Aaple Sarkar Nagpur District Portal"
  },
  {
    id: "prompt3",
    language: "English",
    langCode: "en",
    audioText: "Need to update the residential address on my NMC property tax assessment for my home in Dharampeth. The ward office has an 8-week backlog and no one answers the helpline.",
    transcription: "Need to update the residential address on my NMC property tax assessment for my home in Dharampeth. The ward office has an 8-week backlog and no one answers the helpline.",
    speaker: "Pooja Deshmukh (Age 34, Dharampeth, Nagpur)",
    intent: "Property Tax Mutation & Address Correction",
    department: "NMC Property Tax & Urban Land Records",
    requiredDocs: ["Sale Deed", "Previous Tax Paid Receipt", "MSEDCL Electricity Bill"],
    estimatedDays: "4 Business Days",
    portalName: "NMC Nagpur Smart City E-Services"
  }
];

export const CALL_SIMULATION_SCRIPT = [
  {
    speaker: "agent",
    name: "Nagrik Civic AI Agent",
    time: "00:03",
    text: "Namaste, I am calling on behalf of citizen Sunita Tai Raut regarding application reference MH-NGP-2026-984128 for Sanjay Gandhi Niradhar Pension DBT re-activation. Am I speaking with the Nagpur Tehsil Revenue desk?"
  },
  {
    speaker: "officer",
    name: "Tehsil Revenue Officer (Mr. Joshi)",
    time: "00:15",
    text: "Haan, Joshi bol raha hoon. Kya issue hai? Daily 100 cases aate hain, portal pe check karo na."
  },
  {
    speaker: "agent",
    name: "Nagrik Civic AI Agent",
    time: "00:26",
    text: "Sir, I have already verified the Aaple Sarkar portal status. The application has been pending at Desk 3 for 26 days due to an NPCI bank mapping mismatch code E-04. Sunita Tai has completed digital Aadhaar bio-consent through our encrypted vault, and the Bank of Maharashtra Sitabuldi IFSC MAHB0000042 is confirmed active. Can you please authorize the digital clearing token?"
  },
  {
    speaker: "officer",
    name: "Tehsil Revenue Officer (Mr. Joshi)",
    time: "00:52",
    text: "Achha... reference ID batao dobara... MH-NGP-2026-984128? Haan, open kiya maine. Aadhaar link verify ho gaya hai ab. Theek hai, maine Desk 4 verification approve kar diya hai. Kal tak DBT account me credit ho jayega."
  },
  {
    speaker: "agent",
    name: "Nagrik Civic AI Agent",
    time: "01:14",
    text: "Thank you Officer Joshi. Digitally recording Approval Reference CODE-AP-9921 for citizen Sunita Tai Raut. We have also notified the citizen in Marathi via WhatsApp. Have a great day!"
  }
];

export const ROLES = {
  commissioner: {
    id: "commissioner",
    type: "department",
    name: "Dr. Abhijeet Chaudhari, IAS",
    title: "Municipal Commissioner & CEO",
    department: "Nagpur Municipal Corporation (NMC)",
    badge: "🏛️ COMMISSIONER",
    color: "#38bdf8",
    avatar: "🏛️",
    clearanceLevel: "Level 5 (HITL Autonomous Actuator)",
    defaultTab: "control-room",
    demoEmail: "commissioner@nmcnagpur.gov.in",
    demoPin: "••••••••"
  },
  traffic: {
    id: "traffic",
    type: "department",
    name: "Ravinder Singal, IPS",
    title: "Commissioner of Police & Traffic Command",
    department: "Nagpur Police & Smart City Mobility",
    badge: "🚦 TRAFFIC POLICE",
    color: "#f59e0b",
    avatar: "🚦",
    clearanceLevel: "Level 4 (Drop-Gates & Green Waves)",
    defaultTab: "control-room",
    demoEmail: "cp.nagpur@mahapolice.gov.in",
    demoPin: "••••••••"
  },
  works: {
    id: "works",
    type: "department",
    name: "Er. Dilip Jamgade",
    title: "Chief Engineer (Stormwater & Nag River)",
    department: "NMC Stormwater Drainage & SCADA Cell",
    badge: "🚜 MUNICIPAL WORKS",
    color: "#10b981",
    avatar: "🚜",
    clearanceLevel: "Level 4 (High-Flow Dewatering)",
    defaultTab: "control-room",
    demoEmail: "ce.stormwater@nmcnagpur.gov.in",
    demoPin: "••••••••"
  },
  health: {
    id: "health",
    type: "department",
    name: "Dr. Deepak Selokar",
    title: "Chief Medical Officer (Health & Heat Action)",
    department: "NMC Public Health & 108 Emergency",
    badge: "🚑 HEALTH & CLIMATE",
    color: "#fb7185",
    avatar: "🚑",
    clearanceLevel: "Level 3 (Cooling Centers & Triage)",
    defaultTab: "control-room",
    demoEmail: "health.officer@nmcnagpur.gov.in",
    demoPin: "••••••••"
  },
  citizen: {
    id: "citizen",
    type: "citizen",
    name: "Sunita Tai Raut",
    title: "Verified Citizen (Aadhaar KYC)",
    department: "Ward 18 (Sitabuldi, Nagpur)",
    badge: "👤 NAGRIK (CITIZEN)",
    color: "#a855f7",
    avatar: "👤",
    clearanceLevel: "Citizen Vault & Personal Civic Agent",
    defaultTab: "nagrik-ai",
    demoPhone: "+91 98220 12345",
    demoOtp: "582914"
  }
};
