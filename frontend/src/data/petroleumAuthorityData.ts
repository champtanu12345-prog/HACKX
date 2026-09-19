export interface ExtractionPlatform {
  id: string;
  name: string;
  code: string;
  basin: string;
  region: 'offshore' | 'inland' | 'terminal';
  coords: { x: number; y: number; lat: number; lon: number };
  status: 'OPTIMAL' | 'ELEVATED_THROUGHPUT' | 'MAINTENANCE_HOLD' | 'REDUCED_CHOKE';
  dailyExtractionBbl: number;
  targetBbl: number;
  flowVelocityMs: number;
  wellheadPressureBar: number;
  casingPressureBar: number;
  chokePositionPct: number;
  crudeGrade: string;
  apiGravity: number;
  sulfurContentPct: number;
  waterCutPct: number;
  gasOilRatio: number;
  operator: string;
  lastBopTest: string;
  healthScore: number;
}

export interface PipelineRoute {
  id: string;
  name: string;
  code: string;
  fromNode: string;
  toNode: string;
  pathD: string;
  lengthKm: number;
  diameterInch: number;
  status: 'NORMAL' | 'ELEVATED_PRESSURE' | 'SCHEDULED_PIGGING' | 'CAUTION';
  flowRateM3h: number;
  operatingPressureBar: number;
  maxPressureBar: number;
  temperatureC: number;
  viscosityCst: number;
  leakDetectionIndex: number; // 0 - 100
}

export interface RegulatoryAuditEntry {
  id: string;
  timestamp: string;
  referenceId: string;
  authority: string;
  facility: string;
  category: 'COMPLIANCE' | 'SCADA_ALERT' | 'ENVIRONMENTAL' | 'ALLOCATION' | 'MAINTENANCE';
  severity: 'ROUTINE' | 'ADVISORY' | 'CRITICAL' | 'VERIFIED';
  directive: string;
  officer: string;
  statutoryAct: string;
  verifiedSha: string;
}

export const EXTRACTION_PLATFORMS: ExtractionPlatform[] = [
  {
    id: 'rig-mh-alpha',
    name: 'Mumbai High Alpha Deepwater Complex',
    code: 'MHA-DW-01',
    basin: 'Western Offshore Continental Shelf',
    region: 'offshore',
    coords: { x: 28, y: 52, lat: 19.412, lon: 71.325 },
    status: 'OPTIMAL',
    dailyExtractionBbl: 248500,
    targetBbl: 240000,
    flowVelocityMs: 2.85,
    wellheadPressureBar: 142.6,
    casingPressureBar: 98.4,
    chokePositionPct: 74,
    crudeGrade: 'Mumbai High Sweet Light',
    apiGravity: 39.4,
    sulfurContentPct: 0.12,
    waterCutPct: 3.2,
    gasOilRatio: 480,
    operator: 'National Hydrocarbon Exploration Authority (ONGC Core)',
    lastBopTest: '2026-09-17 04:30 UTC (PASS)',
    healthScore: 98.6,
  },
  {
    id: 'rig-kg-subsea',
    name: 'KG-D6 Subsea Cluster-2 Ultra-Deep',
    code: 'KGD6-SC-02',
    basin: 'Krishna-Godavari Deepwater Basin',
    region: 'offshore',
    coords: { x: 74, y: 64, lat: 16.321, lon: 82.215 },
    status: 'ELEVATED_THROUGHPUT',
    dailyExtractionBbl: 312000,
    targetBbl: 295000,
    flowVelocityMs: 3.42,
    wellheadPressureBar: 218.4,
    casingPressureBar: 165.2,
    chokePositionPct: 88,
    crudeGrade: 'Eastern Basin Super Light Condensate',
    apiGravity: 44.1,
    sulfurContentPct: 0.08,
    waterCutPct: 1.8,
    gasOilRatio: 820,
    operator: 'National Deepwater Operating Command',
    lastBopTest: '2026-09-18 01:15 UTC (PASS)',
    healthScore: 96.4,
  },
  {
    id: 'rig-barmer-desert',
    name: 'Barmer Basin Mangala Processing Hub',
    code: 'BMR-MG-04',
    basin: 'Rajasthan Inland Rift Basin',
    region: 'inland',
    coords: { x: 22, y: 32, lat: 25.751, lon: 71.392 },
    status: 'OPTIMAL',
    dailyExtractionBbl: 164000,
    targetBbl: 160000,
    flowVelocityMs: 2.15,
    wellheadPressureBar: 88.5,
    casingPressureBar: 62.1,
    chokePositionPct: 62,
    crudeGrade: 'Barmer Heavy Waxy Crude (Heated Core)',
    apiGravity: 29.8,
    sulfurContentPct: 0.18,
    waterCutPct: 5.4,
    gasOilRatio: 120,
    operator: 'Inland Hydrocarbon Authority',
    lastBopTest: '2026-09-16 11:00 UTC (PASS)',
    healthScore: 97.2,
  },
  {
    id: 'rig-digboi-legacy',
    name: 'Assam Shelf Digboi-Naharkatiya Reservoir',
    code: 'ASM-DB-07',
    basin: 'Upper Assam Tertiary Basin',
    region: 'inland',
    coords: { x: 88, y: 26, lat: 27.382, lon: 95.621 },
    status: 'REDUCED_CHOKE',
    dailyExtractionBbl: 86500,
    targetBbl: 95000,
    flowVelocityMs: 1.64,
    wellheadPressureBar: 74.2,
    casingPressureBar: 51.8,
    chokePositionPct: 48,
    crudeGrade: 'Assam Sweet Paraffinic',
    apiGravity: 34.2,
    sulfurContentPct: 0.22,
    waterCutPct: 8.1,
    gasOilRatio: 260,
    operator: 'North-East Petroleum Command (Oil India Ltd)',
    lastBopTest: '2026-09-15 16:45 UTC (PASS)',
    healthScore: 91.8,
  },
  {
    id: 'rig-panna-mukta',
    name: 'Panna-Mukta Offshore Central Platform',
    code: 'PMO-CP-03',
    basin: 'Mumbai Continental Shelf Sector 2',
    region: 'offshore',
    coords: { x: 36, y: 58, lat: 18.914, lon: 72.185 },
    status: 'OPTIMAL',
    dailyExtractionBbl: 182000,
    targetBbl: 180000,
    flowVelocityMs: 2.38,
    wellheadPressureBar: 124.8,
    casingPressureBar: 84.6,
    chokePositionPct: 68,
    crudeGrade: 'Western Offshore Medium Light',
    apiGravity: 37.6,
    sulfurContentPct: 0.14,
    waterCutPct: 4.1,
    gasOilRatio: 390,
    operator: 'National Hydrocarbon Exploration Authority',
    lastBopTest: '2026-09-17 19:20 UTC (PASS)',
    healthScore: 98.1,
  },
  {
    id: 'terminal-jamnagar',
    name: 'Jamnagar Strategic Mega-Terminal & SPM',
    code: 'JMN-SPM-01',
    basin: 'Gulf of Kutch Maritime Terminal',
    region: 'terminal',
    coords: { x: 18, y: 44, lat: 22.471, lon: 70.061 },
    status: 'OPTIMAL',
    dailyExtractionBbl: 435000,
    targetBbl: 420000,
    flowVelocityMs: 3.85,
    wellheadPressureBar: 42.4,
    casingPressureBar: 32.0,
    chokePositionPct: 92,
    crudeGrade: 'Blended National Strategic Export Stock',
    apiGravity: 36.5,
    sulfurContentPct: 0.15,
    waterCutPct: 0.8,
    gasOilRatio: 45,
    operator: 'National Strategic Reserves Directorate',
    lastBopTest: '2026-09-18 06:00 UTC (VERIFIED)',
    healthScore: 99.4,
  },
];

export const PIPELINE_ROUTES: PipelineRoute[] = [
  {
    id: 'pipe-mumbai-arterial',
    name: 'Mumbai High Subsea Trunkline Arterial',
    code: 'MHA-URAN-42IN',
    fromNode: 'Mumbai High Alpha',
    toNode: 'Uran Coastal Processing Terminal',
    pathD: 'M 180 290 Q 220 280 255 310 T 320 330',
    lengthKm: 215,
    diameterInch: 42,
    status: 'NORMAL',
    flowRateM3h: 3840,
    operatingPressureBar: 84.6,
    maxPressureBar: 110.0,
    temperatureC: 46.2,
    viscosityCst: 14.8,
    leakDetectionIndex: 99.8,
  },
  {
    id: 'pipe-barmer-salaya',
    name: 'Barmer-Salaya Continuously Heated Trunkline',
    code: 'BMR-SLY-24IN',
    fromNode: 'Barmer Basin Mangala',
    toNode: 'Salaya Marine Terminal',
    pathD: 'M 140 180 Q 130 220 120 250',
    lengthKm: 670,
    diameterInch: 24,
    status: 'NORMAL',
    flowRateM3h: 2150,
    operatingPressureBar: 68.2,
    maxPressureBar: 95.0,
    temperatureC: 62.4, // heated crude
    viscosityCst: 22.4,
    leakDetectionIndex: 99.4,
  },
  {
    id: 'pipe-kg-haldia',
    name: 'East Coast Deepwater Inter-State Carrier',
    code: 'KGD-HLD-36IN',
    fromNode: 'KG-D6 Subsea Cluster',
    toNode: 'Paradip Strategic Terminal',
    pathD: 'M 460 360 Q 500 320 540 270 T 570 210',
    lengthKm: 480,
    diameterInch: 36,
    status: 'ELEVATED_PRESSURE',
    flowRateM3h: 4620,
    operatingPressureBar: 96.4,
    maxPressureBar: 105.0,
    temperatureC: 38.6,
    viscosityCst: 12.1,
    leakDetectionIndex: 98.9,
  },
  {
    id: 'pipe-assam-barauni',
    name: 'North-East Crude Transmission Arterial',
    code: 'ASM-BRN-18IN',
    fromNode: 'Digboi Processing Horizon',
    toNode: 'Barauni Strategic Refinery',
    pathD: 'M 550 150 Q 500 140 440 160',
    lengthKm: 1150,
    diameterInch: 18,
    status: 'NORMAL',
    flowRateM3h: 1280,
    operatingPressureBar: 58.4,
    maxPressureBar: 85.0,
    temperatureC: 32.1,
    viscosityCst: 18.5,
    leakDetectionIndex: 99.6,
  },
];

export const REGULATORY_AUDIT_LOGS: RegulatoryAuditEntry[] = [
  {
    id: 'aud-2026-0918-01',
    timestamp: '2026-09-18 04:12:45 UTC',
    referenceId: 'MOPNG/OISD/2026/SEC-156/0091',
    authority: 'Oil Industry Safety Directorate (OISD)',
    facility: 'KG-D6 Subsea Cluster-2',
    category: 'SCADA_ALERT',
    severity: 'CRITICAL',
    directive: 'Automated pressure threshold balancing triggered on Choke manifold #4; wellhead pressure stabilized at 218.4 bar.',
    officer: 'Chief Controller R. K. Varma',
    statutoryAct: 'Petroleum & Natural Gas Regulatory Board Act (Sec 19)',
    verifiedSha: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'aud-2026-0918-02',
    timestamp: '2026-09-18 02:40:10 UTC',
    referenceId: 'DGH/ENV-AUDIT/2026/GHG-441',
    authority: 'Directorate General of Hydrocarbons (DGH)',
    facility: 'Mumbai High Alpha Complex',
    category: 'ENVIRONMENTAL',
    severity: 'VERIFIED',
    directive: 'Quarterly Zero-Flaring compliance verified. Associated petroleum gas (APG) re-injection rate exceeds 99.4%.',
    officer: 'Director (Environment) Dr. S. Mukherjee',
    statutoryAct: 'Environment (Protection) Act 1986 & MARPOL Annex VI',
    verifiedSha: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
  },
  {
    id: 'aud-2026-0917-03',
    timestamp: '2026-09-17 21:15:30 UTC',
    referenceId: 'MOPNG/STRAT-RES/ALLOC-2026/088',
    authority: 'National Strategic Petroleum Reserves Authority (ISPRL)',
    facility: 'Jamnagar SPM & Padur Caverns',
    category: 'ALLOCATION',
    severity: 'ROUTINE',
    directive: 'Dispatched 480,000 BBL sweet crude into Subterranean Rock Cavern Storage Unit-3 for 90-day national buffer reserve.',
    officer: 'Joint Secretary (Petroleum Reserves) A. Narayanan, IAS',
    statutoryAct: 'National Energy Security Directive 2024 (Art. 12)',
    verifiedSha: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
  },
  {
    id: 'aud-2026-0917-04',
    timestamp: '2026-09-17 14:22:00 UTC',
    referenceId: 'DGH/TECH-INSP/2026/BOP-118',
    authority: 'DGH Marine Safety Enforcement Wing',
    facility: 'Panna-Mukta Platform CP-03',
    category: 'MAINTENANCE',
    severity: 'VERIFIED',
    directive: 'Hydraulic subsea blowout preventer (BOP) blind shear ram test completed successfully at 350 bar test pressure.',
    officer: 'Senior Rig Inspector Capt. M. Fernandez',
    statutoryAct: 'Offshore Safety Regulations 2008 & OISD-GDN-169',
    verifiedSha: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  },
  {
    id: 'aud-2026-0916-05',
    timestamp: '2026-09-16 18:05:12 UTC',
    referenceId: 'MOPNG/PIPELINE/OISD-220/004',
    authority: 'National Gas & Crude Grid Management',
    facility: 'HBJ & Salaya-Mathura Pipeline',
    category: 'COMPLIANCE',
    severity: 'ROUTINE',
    directive: 'Intelligent pigging diagnostic run finalized across 670km line. Wall thickness integrity certified at 99.8%.',
    officer: 'General Manager (Pipelines) V. Joshi',
    statutoryAct: 'Petroleum Act 1934 & OISD Standard 141',
    verifiedSha: 'c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2',
  },
];

export const MACRO_TELEMETRY_STATS = {
  nationalExtractionBblPerDay: 1428500,
  targetQuotaBblPerDay: 1370500,
  strategicReservePct: 87.4,
  strategicReserveBblMillions: 68.2,
  nationalGridPressureAvgBar: 84.2,
  nationalGridPressureTargetBar: 82.0,
  activeWellheadsCount: 348,
  subseaPipelinesTotalKm: 14280,
  crudePriceReferenceUsd: 79.45,
  brentCrudeDeltaPct: +1.28,
  carbonIntensityKgPerBbl: 14.8,
  zeroFlaringCompliancePct: 99.4,
};
