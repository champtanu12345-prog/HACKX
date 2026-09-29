export type Language = 'en' | 'hi';

export interface TranslationDictionary {
  // Common / Header
  govOfIndia: string;
  minOfDefence: string;
  lawEnforcementSensitive: string;
  fontLabel: string;
  langLabel: string;
  icgTitle: string;
  systemTitle: string;
  subSystemTitle: string;
  mrccLocation: string;
  modeSwitcherLabel: string;
  portalModeBtn: string;
  workstationModeBtn: string;
  mrccStatusActive: string;

  // Ticker
  liveIntelligence: string;
  tickerAlerts: Array<{
    id: number;
    category: string;
    text: string;
  }>;
  metoceanTicker: string;
  satPassTicker: string;

  // Hero Section
  defenceIntelligence: string;
  mottoText: string;
  heroHeadline: string;
  heroDescription: string;
  launchWorkstationBtn: string;
  evaluatorTourBtn: string;
  viewDossierBtn: string;
  statusMrcc: string;
  statusSar: string;
  statusHycom: string;
  statusLegal: string;

  // Radar HUD
  liveRadarTitle: string;
  sectorLabel: string;
  radarHeadingN: string;
  radarHeadingS: string;
  radarHeadingE: string;
  radarHeadingW: string;
  dischargeLocusLabel: string;
  suspectVesselLabel: string;
  slickSizeLabel: string;
  radarHoverOverlayTitle: string;
  radarHoverOverlayDesc: string;
  radarSuspectLabel: string;
  radarAttributionScoreLabel: string;

  // Metrics
  metric1Value: string;
  metric1Unit: string;
  metric1Title: string;
  metric1Subtitle: string;

  metric2Value: string;
  metric2Unit: string;
  metric2Title: string;
  metric2Subtitle: string;

  metric3Value: string;
  metric3Unit: string;
  metric3Title: string;
  metric3Subtitle: string;

  metric4Value: string;
  metric4Unit: string;
  metric4Title: string;
  metric4Subtitle: string;

  // 4 Subsystems
  subsystemsHeader: string;
  subsystemsTitle: string;
  subsystemsSubtitle: string;

  sub1Stage: string;
  sub1Title: string;
  sub1Desc: string;
  sub1Tag1: string;
  sub1Tag2: string;

  sub2Stage: string;
  sub2Title: string;
  sub2Desc: string;
  sub2Tag1: string;
  sub2Tag2: string;

  sub3Stage: string;
  sub3Title: string;
  sub3Desc: string;
  sub3Tag1: string;
  sub3Tag2: string;

  sub4Stage: string;
  sub4Title: string;
  sub4Desc: string;
  sub4Tag1: string;
  sub4Tag2: string;

  // Scenarios
  scenariosHeader: string;
  scenariosTitle: string;
  scenariosSubtitle: string;
  scenarioBtnText: string;

  scenarioATag: string;
  scenarioATitle: string;
  scenarioADesc: string;
  scenarioASlickLabel: string;
  scenarioASuspectLabel: string;
  scenarioAConfidenceLabel: string;

  scenarioBTag: string;
  scenarioBTitle: string;
  scenarioBDesc: string;
  scenarioBSlickLabel: string;
  scenarioBSuspectLabel: string;
  scenarioBConfidenceLabel: string;

  scenarioCTag: string;
  scenarioCTitle: string;
  scenarioCDesc: string;
  scenarioCSlickLabel: string;
  scenarioCSuspectLabel: string;
  scenarioCConfidenceLabel: string;

  // Institutional Hub
  dgCardHeader: string;
  dgName: string;
  dgRank: string;
  dgQuote: string;
  dgReadMoreBtn: string;
  dgModalTitle: string;
  dgModalP1: string;
  dgModalP2: string;
  dgModalClose: string;

  tabWhatsNew: string;
  tabPressRelease: string;
  tabTenders: string;
  bulletinFooterText: string;

  videoGalleryHeader: string;
  videoGalleryModTag: string;
  video1Title: string;
  video1Sub: string;
  video1ModalTitle: string;
  video1ModalDesc: string;

  video2Title: string;
  video2Sub: string;
  video2ModalTitle: string;
  video2ModalDesc: string;

  linkCommands: string;
  linkJoinIcg: string;

  // Footer
  govPortalsLabel: string;
  footerCompliance: string;
  backToTop: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    // Common / Header
    govOfIndia: 'GOVERNMENT OF INDIA',
    minOfDefence: 'MINISTRY OF DEFENCE',
    lawEnforcementSensitive: 'LAW ENFORCEMENT SENSITIVE // ICG-MRCC',
    fontLabel: 'FONT:',
    langLabel: 'हिन्दी',
    icgTitle: 'INDIAN COAST GUARD',
    systemTitle: 'National Maritime Oil Spill Intelligence & Legal Attribution System',
    subSystemTitle: 'HACKX Maritime Intelligence Workstation',
    mrccLocation: 'Maritime Rescue Coordination Centre (MRCC), Regional HQ (West), Mumbai',
    modeSwitcherLabel: 'VIEW MODE:',
    portalModeBtn: '🏛️ Official Portal',
    workstationModeBtn: '⚡ Tactical Workstation',
    mrccStatusActive: 'MRCC MUMBAI // SECTOR MH-4 ACTIVE',

    // Ticker
    liveIntelligence: 'LIVE INTELLIGENCE',
    tickerAlerts: [
      {
        id: 1,
        category: 'SAR DETECTION',
        text: 'Sentinel-1A SAR Pass: 14.85 km² oil slick verified in Mumbai High offshore sector. Damping confirmed at σ° < -24 dB.',
      },
      {
        id: 2,
        category: 'AIS BLACKOUT',
        text: 'PRIORITY ALERT: MT ARABIAN STAR (MMSI: 419000123) logged 92-min transponder blackout across estimated discharge locus.',
      },
      {
        id: 3,
        category: 'INCOIS DRIFT',
        text: 'INCOIS Metocean Hydrodynamics: Surface current 0.85 kts @ 235° with 15 kts windage. Lagrangian hindcast confirms 98.2% correlation.',
      },
      {
        id: 4,
        category: 'LEGAL PROSECUTION',
        text: 'Section 356C Merchant Shipping Act 1958: Official forensic evidence dossier compiled with SHA-256 digest: 7f83b165... Issued to Magistrate.',
      },
      {
        id: 5,
        category: 'COMMAND MOTTO',
        text: '"वयं रक्षामः // WE PROTECT" — Bharatiya Tatrakshak (Indian Coast Guard) 24x7 Sovereign Maritime Sentinel.',
      },
    ],
    metoceanTicker: 'METOCEAN: 0.85 KTS @ 235°',
    satPassTicker: 'S-1A PASS: 48M',

    // Hero Section
    defenceIntelligence: 'DEFENCE INTELLIGENCE',
    mottoText: '"वयं रक्षामः — We Protect"',
    heroHeadline: 'Autonomous Maritime Oil Spill Intelligence & Legal Attribution System',
    heroDescription:
      "Empowering the Indian Coast Guard with automated Sentinel-1A SAR deep-space anomaly detection, INCOIS hydrodynamic ocean hindcasting, and dark vessel AIS transponder forensics across India's 7,516 km sovereign coastline. Instantly transforms satellite imagery into Section 356C Merchant Shipping Act 1958 court-admissible evidence.",
    launchWorkstationBtn: 'LAUNCH TACTICAL WORKSTATION',
    evaluatorTourBtn: '🎯 5-STAGE EVALUATOR TOUR',
    viewDossierBtn: '⚖️ VIEW LEGAL DOSSIER',
    statusMrcc: 'MRCC Mumbai 24x7',
    statusSar: 'Sentinel-1A SAR Ingest',
    statusHycom: 'INCOIS HyCOM Currents',
    statusLegal: 'Sec 356C MSA 1958',

    // Radar HUD
    liveRadarTitle: 'LIVE RADAR INTERCEPT',
    sectorLabel: 'SECTOR MH-4 // MUMBAI HIGH',
    radarHeadingN: '000° N',
    radarHeadingS: '180° S',
    radarHeadingE: '090° E',
    radarHeadingW: '270° W',
    dischargeLocusLabel: 'DISCHARGE LOCUS',
    suspectVesselLabel: 'MT ARABIAN STAR (SUSPECT #1)',
    slickSizeLabel: 'SLICK 14.85 km²',
    radarHoverOverlayTitle: 'Launch Tactical Workstation',
    radarHoverOverlayDesc: 'Inspect Sector MH-4 incident with full forensic telemetry & live map layers',
    radarSuspectLabel: 'MT ARABIAN STAR (MMSI 419000123)',
    radarAttributionScoreLabel: '96.8% HIGH CONFIDENCE',

    // Metrics
    metric1Value: '7516',
    metric1Unit: 'KM',
    metric1Title: 'Sovereign Coastline',
    metric1Subtitle: '24x7 EEZ Sentinel Surveillance',

    metric2Value: '15',
    metric2Unit: 'MIN',
    metric2Title: 'Attribution Latency',
    metric2Subtitle: 'Satellite Ingest to Suspect Interdiction',

    metric3Value: '98.2',
    metric3Unit: '%',
    metric3Title: 'INCOIS Drift Correlation',
    metric3Subtitle: 'Lagrangian Hydrodynamic Accuracy',

    metric4Value: '100',
    metric4Unit: '%',
    metric4Title: 'Court Admissibility',
    metric4Subtitle: 'Section 356C SHA-256 Tamper-Proof',

    // 4 Subsystems
    subsystemsHeader: 'SUBSYSTEM ARCHITECTURE // SIH 260143',
    subsystemsTitle: 'End-to-End Autonomous Intelligence Pipeline',
    subsystemsSubtitle:
      'A military-grade workflow integrating spaceborne synthetic aperture radar, numerical ocean modeling, and forensic vessel analytics to enforce zero-tolerance marine pollution laws.',

    sub1Stage: 'STAGE 01 // SATELLITE RADAR',
    sub1Title: 'Multi-Sensor SAR & Optical Detection',
    sub1Desc:
      'Autonomous ingestion of Sentinel-1A C-band SAR and Sentinel-2 MSI. Exploits ocean capillary wave damping to segment oil slicks in total darkness and severe monsoon cloud cover (damping ratio > 4.5 dB).',
    sub1Tag1: 'σ° < -24 dB DAMPING',
    sub1Tag2: 'AUTOMATED',

    sub2Stage: 'STAGE 02 // METOCEAN HYDRODYNAMICS',
    sub2Title: 'Lagrangian Ocean Drift Hindcasting',
    sub2Desc:
      'Coupled with INCOIS HyCOM 1/12° surface currents, GFS windage drift factors (3.0%), and tidal matrices to reverse-calculate the spill origin locus and timestamp back to the exact discharge instant.',
    sub2Tag1: 'RK4 INTEGRATION',
    sub2Tag2: '98.2% FIT',

    sub3Stage: 'STAGE 03 // VESSEL ATTRIBUTION',
    sub3Title: 'AIS Forensics & Dark Target Analysis',
    sub3Desc:
      'Correlates candidate vessel trajectories, transponder silence/blackouts, course deviations, and historical tanker manifests within the spatio-temporal uncertainty envelope to assign explainable culpability scores.',
    sub3Tag1: 'GAP DETECTION',
    sub3Tag2: 'EXPLAINABLE',

    sub4Stage: 'STAGE 04 // COURT PROSECUTION',
    sub4Title: 'Section 356C MSA Legal Dossier',
    sub4Desc:
      'Generates tamper-evident forensic PDF evidence packages sealed with SHA-256 cryptographic digests, Ashoka state crests, officer signatures, and full chain of custody for immediate maritime court prosecution.',
    sub4Tag1: 'SHA-256 SEALED',
    sub4Tag2: 'STATUTORY',

    // Scenarios
    scenariosHeader: 'BENCHMARK INCIDENTS // EVALUATION SCENARIOS',
    scenariosTitle: 'Select Operational Scenario for Live Interdiction',
    scenariosSubtitle: 'Click any scenario to immediately load telemetry and launch the workstation',
    scenarioBtnText: 'LOAD & LAUNCH SCENARIO',

    scenarioATag: 'CRITICAL PRIORITY',
    scenarioATitle: 'Mumbai High Offshore Sector MH-4',
    scenarioADesc:
      'Single-culprit illegal tank washing. MT ARABIAN STAR executed a 92-min AIS transponder blackout directly over the reconstructed Lagrangian origin coordinates.',
    scenarioASlickLabel: '14.85 km² (420 m³)',
    scenarioASuspectLabel: 'MT ARABIAN STAR',
    scenarioAConfidenceLabel: '96.8% High',

    scenarioBTag: 'CONFLUENCE ALERT',
    scenarioBTitle: 'Goa Offshore High-Density Corridor',
    scenarioBDesc:
      'Multi-vessel traffic corridor. Tests transparent explainable scoring to disambiguate 3 proximal tankers and identify the bilge discharge offender.',
    scenarioBSlickLabel: '8.40 km² (190 m³)',
    scenarioBSuspectLabel: 'M/V GOA TRADER',
    scenarioBConfidenceLabel: '88.4% Probable',

    scenarioCTag: 'SPOOFING ANOMALY',
    scenarioCTitle: 'Gulf of Kutch Eco-Sensitive Zone',
    scenarioCDesc:
      'Dark target AIS spoofer near Marine National Park. Employs speed-jump algorithms and radar-AIS mismatch detection to break spoofing cover.',
    scenarioCSlickLabel: '22.10 km² (640 m³)',
    scenarioCSuspectLabel: 'PACIFIC GLORY',
    scenarioCConfidenceLabel: '94.2% High',

    // Institutional Hub
    dgCardHeader: 'Message from the Director General',
    dgName: 'Director General Paramesh Sivamani, AVSM, PTM, TM',
    dgRank: 'DGICG // INDIAN COAST GUARD',
    dgQuote: '"The connection between serving personnel and veterans is intangible, everlasting and strong"',
    dgReadMoreBtn: 'Read More',
    dgModalTitle: 'Message from Director General Paramesh Sivamani, AVSM, PTM, TM',
    dgModalP1:
      '"As the Director General of the Indian Coast Guard, I commend our valiant officers and men who maintain an unyielding 24x7 vigil across our maritime zones."',
    dgModalP2:
      '"With the adoption of indigenous AI-driven satellite radar intelligence and autonomous spill attribution systems like HACKX (SIH 260143), we strengthen India\'s resolve to enforce MARPOL Annex-I and prosecute illegal high-seas polluters with court-admissible forensic rigor."',
    dgModalClose: 'Close',

    tabWhatsNew: "What's New",
    tabPressRelease: 'Press Release',
    tabTenders: 'Tenders & Notices',
    bulletinFooterText: 'Official Bulletins updated 24x7 by Coast Guard Headquarters (CGHQ), New Delhi',

    videoGalleryHeader: 'Video Intelligence',
    videoGalleryModTag: 'MOD MEDIA',
    video1Title: 'SAR Aviation',
    video1Sub: 'Maritime Vigilance',
    video1ModalTitle: 'Indian Coast Guard Aviation Search & Rescue',
    video1ModalDesc:
      'Chetak and ALH Dhruv helicopters conducting open-sea medical evacuations and maritime environmental monitoring over Indian EEZ.',

    video2Title: 'Valour at Sea',
    video2Sub: 'Offshore Fleet Patrol',
    video2ModalTitle: 'Valour at Sea: Sentinels of the Deep',
    video2ModalDesc:
      'Official Indian Coast Guard documentary highlighting offshore fleet patrol, anti-smuggling interdiction, and marine environmental protection.',

    linkCommands: 'CG Commands & Regions',
    linkJoinIcg: 'Join Indian Coast Guard',

    // Footer
    govPortalsLabel: 'Government of India Portals:',
    footerCompliance: 'GIGW 3.0 COMPLIANT',
    backToTop: 'Back to Top',
  },

  hi: {
    // Common / Header
    govOfIndia: 'भारत सरकार',
    minOfDefence: 'रक्षा मंत्रालय',
    lawEnforcementSensitive: 'विधि प्रवर्तन संवेदनशील // आईसीजी-एमआरसीसी',
    fontLabel: 'आकार:',
    langLabel: 'English',
    icgTitle: 'भारतीय तटरक्षक',
    systemTitle: 'राष्ट्रीय समुद्री तेल रिसाव निगरानी एवं पोत दायित्व निर्धारण प्रणाली',
    subSystemTitle: 'हैक-एक्स (HACKX) समुद्री आसूचना कार्यक्षेत्र',
    mrccLocation: 'समुद्री बचाव समन्वय केंद्र (MRCC), क्षेत्रीय मुख्यालय (पश्चिम), मुंबई',
    modeSwitcherLabel: 'प्रणाली मोड:',
    portalModeBtn: '🏛️ मुख्य नागरिक पोर्टल',
    workstationModeBtn: '⚡ सामरिक कार्यक्षेत्र',
    mrccStatusActive: 'एमआरसीसी मुंबई // सेक्टर एमएच-4 सक्रिय',

    // Ticker
    liveIntelligence: 'प्रत्यक्ष आसूचना',
    tickerAlerts: [
      {
        id: 1,
        category: 'उपग्रह SAR पहचान',
        text: 'सेंटीनेल-1A SAR पास: मुंबई हाई अपतटीय सेक्टर में 14.85 वर्ग किमी तेल रिसाव सत्यापित। σ° < -24 dB पर तरंग अवमंदन की पुष्टि।',
      },
      {
        id: 2,
        category: 'AIS ब्लैकआउट',
        text: 'प्राथमिकता चेतावनी: एमटी अरेबियन स्टार (MMSI: 419000123) ने अनुमानित रिसाव स्थल पर 92 मिनट का ट्रांसपोंडर ब्लैकआउट दर्ज किया।',
      },
      {
        id: 3,
        category: 'इनकोइस बहाव',
        text: 'इनकोइस समुद्री हाइड्रोडायनामिक्स: सतही धारा 0.85 नॉट @ 235° तथा 15 नॉट पवन बहाव। लाग्रेंजियन पश्च-अनुमान 98.2% सहसंबंध की पुष्टि करता है।',
      },
      {
        id: 4,
        category: 'वैधानिक अभियोजन',
        text: 'वाणिज्य पोत अधिनियम 1958 की धारा 356C: अधिकृत फॉरेंसिक साक्ष्य डॉसियर SHA-256 डाइजेस्ट 7f83b165... सहित संकलित एवं मजिस्ट्रेट को प्रेषित।',
      },
      {
        id: 5,
        category: 'कमान आदर्श वाक्य',
        text: '"वयं रक्षामः // हम रक्षा करते हैं" — भारतीय तटरक्षक 24x7 संप्रभु समुद्री सजग प्रहरी।',
      },
    ],
    metoceanTicker: 'समुद्री बहाव: 0.85 नॉट @ 235°',
    satPassTicker: 'एस-1A उपग्रह: 48 मिनट',

    // Hero Section
    defenceIntelligence: 'रक्षा आसूचना',
    mottoText: '"वयं रक्षामः — हम रक्षा करते हैं"',
    heroHeadline: 'स्वचालित समुद्री तेल रिसाव आसूचना एवं वैधानिक दायित्व निर्धारण प्रणाली',
    heroDescription:
      'भारतीय तटरक्षक बल को देश की 7,516 किमी संप्रभु तटरेखा पर स्वचालित सेंटीनेल-1A उपग्रह रडार रिसाव पहचान, इनकोइस (INCOIS) हाइड्रोडायनामिक बहाव पश्च-अनुमान, एवं संदिग्ध जहाजों के एआईएस ट्रांसपोंडर ब्लैकआउट विश्लेषण से सशक्त बनाता है। उपग्रह डेटा को तत्काल वाणिज्य पोत अधिनियम, 1958 की धारा 356C के अंतर्गत न्यायालय में मान्य साक्ष्य में परिवर्तित करता है।',
    launchWorkstationBtn: 'कार्यक्षेत्र प्रारंभ करें / LAUNCH WORKSTATION',
    evaluatorTourBtn: '🎯 5-चरणीय मूल्यांकनकर्ता टूर',
    viewDossierBtn: '⚖️ वैधानिक डॉसियर देखें',
    statusMrcc: 'एमआरसीसी मुंबई 24x7 सक्रिय',
    statusSar: 'सेंटीनेल-1A SAR सीधा अंतर्ग्रहण',
    statusHycom: 'इनकोइस HyCOM समुद्री धाराएं',
    statusLegal: 'धारा 356C विधिक वैधता',

    // Radar HUD
    liveRadarTitle: 'प्रत्यक्ष रडार अवरोधन',
    sectorLabel: 'सेक्टर एमएच-4 // मुंबई हाई',
    radarHeadingN: '000° उत्तर',
    radarHeadingS: '180° दक्षिण',
    radarHeadingE: '090° पूर्व',
    radarHeadingW: '270° पश्चिम',
    dischargeLocusLabel: 'अनुमानित रिसाव बिंदु',
    suspectVesselLabel: 'एमटी अरेबियन स्टार (संदिग्ध #1)',
    slickSizeLabel: 'रिसाव 14.85 वर्ग किमी',
    radarHoverOverlayTitle: 'सामरिक कार्यक्षेत्र में प्रवेश करें',
    radarHoverOverlayDesc: 'विस्तृत फॉरेंसिक टेलीमेट्री एवं मानचित्र स्तरों के साथ सेक्टर एमएच-4 का निरीक्षण करें',
    radarSuspectLabel: 'एमटी अरेबियन स्टार (MMSI 419000123)',
    radarAttributionScoreLabel: '96.8% उच्च विश्वास स्तर',

    // Metrics
    metric1Value: '7516',
    metric1Unit: 'किमी',
    metric1Title: 'संप्रभु समुद्री तटरेखा',
    metric1Subtitle: '24x7 ईईजेड सतत निगरानी व सुरक्षा',

    metric2Value: '15',
    metric2Unit: 'मिनट',
    metric2Title: 'दायित्व निर्धारण समय',
    metric2Subtitle: 'उपग्रह डेटा से संदिग्ध पोत संज्ञान व अवरोधन',

    metric3Value: '98.2',
    metric3Unit: '%',
    metric3Title: 'इनकोइस बहाव सहसंबंध',
    metric3Subtitle: 'लाग्रेंजियन हाइड्रोडायनामिक मॉडलिंग शुद्धता',

    metric4Value: '100',
    metric4Unit: '%',
    metric4Title: 'न्यायालय साक्ष्य स्वीकार्यता',
    metric4Subtitle: 'धारा 356C SHA-256 डिजिटल सील युक्त',

    // 4 Subsystems
    subsystemsHeader: 'सबसिस्टम आर्किटेक्चर // एसआईएच 260143',
    subsystemsTitle: 'संपूर्ण स्वचालित आसूचना एवं अभियोजन पाइपलाइन',
    subsystemsSubtitle:
      'शून्य-सहनशीलता समुद्री प्रदूषण कानूनों को लागू करने के लिए अंतरिक्ष रडार, समुद्री मॉडलिंग और फॉरेंसिक पोत विश्लेषण का सैन्य-ग्रेड एकीकरण।',

    sub1Stage: 'चरण 01 // उपग्रह रडार',
    sub1Title: 'मल्टी-सेंसर SAR एवं ऑप्टिकल पहचान',
    sub1Desc:
      'सेंटीनेल-1A सी-बैंड एसएआर और सेंटीनेल-2 एमएसआई का स्वचालित अंतर्ग्रहण। घोर अंधकार और भारी मानसूनी बादलों में भी समुद्री तरंग अवमंदन के आधार पर तेल रिसाव की सटीक पहचान (अवमंदन अनुपात > 4.5 dB)।',
    sub1Tag1: 'σ° < -24 dB अवमंदन',
    sub1Tag2: 'पूर्णतः स्वचालित',

    sub2Stage: 'चरण 02 // समुद्री हाइड्रोडायनामिक्स',
    sub2Title: 'लाग्रेंजियन समुद्री बहाव पश्च-अनुमान',
    sub2Desc:
      'इनकोइस HyCOM सतही धाराओं (1/12° ग्रिड), जीएफएस पवन बहाव कारकों और ज्वारीय डेटा के संयोजन से रिसाव के वास्तविक समय और मूल स्रोत स्थल की उल्टी गणना (रिवर्स ट्रेसिंग)।',
    sub2Tag1: 'RK4 एकीकरण',
    sub2Tag2: '98.2% शुद्धता',

    sub3Stage: 'चरण 03 // पोत दायित्व निर्धारण',
    sub3Title: 'एआईएस फॉरेंसिक एवं डार्क टारगेट विश्लेषण',
    sub3Desc:
      'स्थानिक-कालिक अनिश्चितता दायरे में गुजरने वाले जहाजों के प्रक्षेपवक्र, ट्रांसपोंडर विच्छेदन (ब्लैकआउट), असामान्य गति व दिशा में बदलाव का विश्लेषण कर संज्ञान व दायित्व अंक निर्धारित करना।',
    sub3Tag1: 'ब्लैकआउट पहचान',
    sub3Tag2: 'व्याख्यात्मक विश्लेषण',

    sub4Stage: 'चरण 04 // न्यायिक अभियोजन',
    sub4Title: 'धारा 356C विधिक साक्ष्य डॉसियर',
    sub4Desc:
      'वाणिज्य पोत अधिनियम की धारा 356C के तहत तत्काल न्यायिक अभियोजन हेतु SHA-256 क्रिप्टोग्राफिक सील, राष्ट्रीय प्रतीक, कमान हस्ताक्षर व संपूर्ण साक्ष्य श्रृंखला युक्त पीडीएफ डॉसियर का निर्माण।',
    sub4Tag1: 'SHA-256 डिजिटल सील',
    sub4Tag2: 'कानूनी मान्यता प्राप्त',

    // Scenarios
    scenariosHeader: 'मानक परीक्षण परिदृश्य // मूल्यांकन मामले',
    scenariosTitle: 'प्रत्यक्ष अंतःक्षेपण हेतु परिचालन परिदृश्य चुनें',
    scenariosSubtitle: 'कार्यक्षेत्र में टेलीमेट्री लोड करने हेतु किसी भी परिदृश्य पर क्लिक करें',
    scenarioBtnText: 'परिदृश्य लोड करें और कार्यक्षेत्र खोलें',

    scenarioATag: 'अति-महत्वपूर्ण प्राथमिकता',
    scenarioATitle: 'मुंबई हाई अपतटीय सेक्टर एमएच-4',
    scenarioADesc:
      'एकल संदिग्ध द्वारा अवैध टैंक धुलाई। एमटी अरेबियन स्टार ने अनुमानित लाग्रेंजियन रिसाव निर्देशांकों के ठीक ऊपर 92 मिनट का ट्रांसपोंडर ब्लैकआउट किया।',
    scenarioASlickLabel: '14.85 वर्ग किमी (420 घन मी)',
    scenarioASuspectLabel: 'एमटी अरेबियन स्टार',
    scenarioAConfidenceLabel: '96.8% उच्च विश्वास',

    scenarioBTag: 'सघन संगम चेतावनी',
    scenarioBTitle: 'गोवा अपतटीय सघन यातायात गलियारा',
    scenarioBDesc:
      'बहु-पोत यातायात गलियारा। 3 निकटवर्ती टैंकरों में से वास्तविक बिल्ज रिसाव अपराधी की पहचान हेतु पारदर्शी व्याख्यात्मक स्कोरिंग का परीक्षण।',
    scenarioBSlickLabel: '8.40 वर्ग किमी (190 घन मी)',
    scenarioBSuspectLabel: 'एम/वी गोवा ट्रेडर',
    scenarioBConfidenceLabel: '88.4% संभावित',

    scenarioCTag: 'स्पूफिंग विसंगति',
    scenarioCTitle: 'कच्छ की खाड़ी पर्यावरण-संवेदनशील क्षेत्र',
    scenarioCDesc:
      'समुद्री राष्ट्रीय उद्यान के निकट डार्क टारगेट एआईएस स्पूफर। स्पूफिंग आवरण को भेदने के लिए गति-कूद एल्गोरिदम और रडार-एआईएस बेमेल पहचान का प्रयोग।',
    scenarioCSlickLabel: '22.10 वर्ग किमी (640 घन मी)',
    scenarioCSuspectLabel: 'पैसिफिक ग्लोरी',
    scenarioCConfidenceLabel: '94.2% उच्च विश्वास',

    // Institutional Hub
    dgCardHeader: 'महानिदेशक का संदेश',
    dgName: 'महानिदेशक परमेश शिवमणि, एवीएसएम, पीटीएम, टीएम',
    dgRank: 'महानिदेशक भारतीय तटरक्षक (DGICG)',
    dgQuote: '"सेवारत कर्मियों और पूर्व सैनिकों के बीच का संबंध अमूर्त, शाश्वत और अटूट है।"',
    dgReadMoreBtn: 'विस्तार से पढ़ें',
    dgModalTitle: 'महानिदेशक परमेश शिवमणि, एवीएसएम, पीटीएम, टीएम का संदेश',
    dgModalP1:
      '"भारतीय तटरक्षक बल के महानिदेशक के रूप में, मैं अपने शूरवीर अधिकारियों और जवानों की सराहना करता हूँ जो हमारे समुद्री क्षेत्रों में 24x7 अटूट सतर्कता बनाए रखते हैं।"',
    dgModalP2:
      '"हैक-एक्स (HACKX - SIH 260143) जैसी स्वदेशी एआई-संचालित उपग्रह रडार आसूचना एवं स्वचालित रिसाव दायित्व प्रणालियों को अपनाकर, हम मार्पोल अनुलग्नक-I को लागू करने और अवैध उच्च-समुद्री प्रदूषकों पर न्यायालय में मान्य साक्ष्यों के साथ कठोर अभियोजन चलाने के भारत के संकल्प को सुदृढ़ करते हैं।"',
    dgModalClose: 'बंद करें',

    tabWhatsNew: 'नया क्या है',
    tabPressRelease: 'प्रेस विज्ञप्ति',
    tabTenders: 'निविदाएं एवं सूचनाएं',
    bulletinFooterText: 'तटरक्षक मुख्यालय (CGHQ), नई दिल्ली द्वारा 24x7 अद्यतन आधिकारिक बुलेटिन',

    videoGalleryHeader: 'वीडियो आसूचना',
    videoGalleryModTag: 'रक्षा मंत्रालय मीडिया',
    video1Title: 'विमानन खोज व बचाव',
    video1Sub: 'समुद्री सतर्कता',
    video1ModalTitle: 'भारतीय तटरक्षक विमानन खोज एवं बचाव अभियान',
    video1ModalDesc:
      'चेतक और एएलएच ध्रुव हेलीकॉप्टरों द्वारा भारतीय ईईजेड में खुले समुद्र में चिकित्सीय निकासी और समुद्री पर्यावरण निगरानी।',

    video2Title: 'समुद्र में पराक्रम',
    video2Sub: 'अपतटीय बेड़ा गश्त',
    video2ModalTitle: 'समुद्र में पराक्रम: गहरे सागर के प्रहरी',
    video2ModalDesc:
      'अपतटीय बेड़े की गश्त, तस्करी-रोधी अंतःक्षेपण और समुद्री पर्यावरण संरक्षण को रेखांकित करने वाली भारतीय तटरक्षक की आधिकारिक वृत्तचित्र।',

    linkCommands: 'तटरक्षक कमान एवं क्षेत्र',
    linkJoinIcg: 'भारतीय तटरक्षक में शामिल हों',

    // Footer
    govPortalsLabel: 'भारत सरकार के प्रमुख पोर्टल:',
    footerCompliance: 'GIGW 3.0 प्रमाणित',
    backToTop: 'शीर्ष पर जाएं',
  },
};
