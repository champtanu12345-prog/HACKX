export interface MaritimeScenario {
  id: 'scenario_a' | 'scenario_b' | 'scenario_c';
  title: string;
  tagline: string;
  region: string;
  spill: {
    id: string;
    satellite: string;
    acquisitionTime: string;
    areaSqKm: number;
    perimeterKm: number;
    estimatedVolumeM3: number;
    confidence: number;
    estimatedAgeHours: number;
    centroid: [number, number]; // [lat, lon]
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
  };
  environment: {
    windSpeedKnots: number;
    windDirectionDeg: number;
    currentSpeedKnots: number;
    currentDirectionDeg: number;
    seaState: string;
    waterTempC: number;
  };
  drift: {
    runType: 'HINDCAST' | 'FORECAST';
    estimatedOriginCoords: [number, number];
    estimatedOriginTime: string;
    trajectory: Array<{
      step: number;
      time: string;
      lat: number;
      lon: number;
      uncertaintyRadiusM: number;
    }>;
  };
  vessels: Array<{
    id: string;
    mmsi: string;
    imo: string;
    name: string;
    vesselType: string;
    flag: string;
    lengthM: number;
    widthM: number;
    draughtM: number;
    speedKnots: number;
    courseDeg: number;
    headingDeg: number;
    minDistanceNm: number;
    suspicionScore: number;
    rank: number;
    anomalies: Array<{
      type: string;
      severity: 'critical' | 'warning' | 'info';
      description: string;
    }>;
    positions: Array<{
      time: string;
      lat: number;
      lon: number;
      sog: number;
      cog: number;
    }>;
  }>;
  groundTruth: {
    sourceVessel: string;
    sourceMmsi: string;
    sourceCoords: [number, number];
    sourceTimestamp: string;
    evidenceConfidence: string;
  };
  timeline: Array<{
    id: string;
    timestamp: string;
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info' | 'normal';
    category: string;
  }>;
}

export const DEMO_SCENARIOS: Record<string, MaritimeScenario> = {
  scenario_a: {
    id: 'scenario_a',
    title: 'Scenario A: Mumbai High Single-Culprit Discharge',
    tagline: 'High-confidence crude slick with solitary dark tanker maneuver',
    region: 'Offshore Mumbai High, Arabian Sea (Sector MH-4)',
    spill: {
      id: 'SPL-2026-MUM-01',
      satellite: 'Sentinel-1A C-SAR IW GRD',
      acquisitionTime: '2026-09-15T01:28:45Z',
      areaSqKm: 14.85,
      perimeterKm: 28.4,
      estimatedVolumeM3: 420.0,
      confidence: 0.96,
      estimatedAgeHours: 18.5,
      centroid: [19.112, 72.395],
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.320, 19.110],
            [72.355, 19.135],
            [72.410, 19.145],
            [72.470, 19.140],
            [72.485, 19.120],
            [72.440, 19.095],
            [72.370, 19.085],
            [72.320, 19.110],
          ],
        ],
      },
    },
    environment: {
      windSpeedKnots: 12.5,
      windDirectionDeg: 225,
      currentSpeedKnots: 0.8,
      currentDirectionDeg: 340,
      seaState: 'Sea State 3 (Moderate)',
      waterTempC: 28.4,
    },
    drift: {
      runType: 'HINDCAST',
      estimatedOriginCoords: [19.040, 72.330],
      estimatedOriginTime: '2026-09-14T19:30:00Z',
      trajectory: [
        { step: 0, time: '2026-09-15T01:28:00Z', lat: 19.112, lon: 72.395, uncertaintyRadiusM: 300 },
        { step: 1, time: '2026-09-14T23:30:00Z', lat: 19.088, lon: 72.372, uncertaintyRadiusM: 450 },
        { step: 2, time: '2026-09-14T21:30:00Z', lat: 19.062, lon: 72.351, uncertaintyRadiusM: 620 },
        { step: 3, time: '2026-09-14T19:30:00Z', lat: 19.040, lon: 72.330, uncertaintyRadiusM: 850 },
      ],
    },
    vessels: [
      {
        id: 'vsl-01',
        mmsi: '419000123',
        imo: '9384712',
        name: 'MT ARABIAN STAR',
        vesselType: 'Crude Oil Tanker',
        flag: 'Panama',
        lengthM: 274.0,
        widthM: 48.0,
        draughtM: 16.2,
        speedKnots: 3.8,
        courseDeg: 45.0,
        headingDeg: 44.0,
        minDistanceNm: 0.79,
        suspicionScore: 98.2,
        rank: 1,
        anomalies: [
          {
            type: 'AIS_GAP_DARK_SHIP',
            severity: 'critical',
            description: 'AIS transponder silenced for 2h 20m directly over hindcasted release point.',
          },
          {
            type: 'SUDDEN_DECELERATION',
            severity: 'critical',
            description: 'Transit speed dropped 73% from 14.2 kn to 3.8 kn without anchor deployment.',
          },
        ],
        positions: [
          { time: '2026-09-14T16:00:00Z', lat: 18.78, lon: 72.12, sog: 14.8, cog: 35.0 },
          { time: '2026-09-14T18:00:00Z', lat: 18.98, lon: 72.28, sog: 14.2, cog: 36.0 },
          { time: '2026-09-14T19:30:00Z', lat: 19.04, lon: 72.33, sog: 3.8, cog: 45.0 },
          { time: '2026-09-14T22:00:00Z', lat: 19.12, lon: 72.41, sog: 4.2, cog: 52.0 },
          { time: '2026-09-15T01:00:00Z', lat: 19.28, lon: 72.58, sog: 13.9, cog: 35.0 },
        ],
      },
      {
        id: 'vsl-02',
        mmsi: '352001456',
        imo: '9421159',
        name: 'PACIFIC GLORY',
        vesselType: 'Chemical Tanker',
        flag: 'Liberia',
        lengthM: 182.0,
        widthM: 27.5,
        draughtM: 9.8,
        speedKnots: 12.3,
        courseDeg: 354.0,
        headingDeg: 355.0,
        minDistanceNm: 8.4,
        suspicionScore: 38.4,
        rank: 2,
        anomalies: [],
        positions: [
          { time: '2026-09-14T17:00:00Z', lat: 18.60, lon: 72.45, sog: 12.5, cog: 355.0 },
          { time: '2026-09-14T19:30:00Z', lat: 18.95, lon: 72.48, sog: 12.1, cog: 356.0 },
          { time: '2026-09-14T22:00:00Z', lat: 19.25, lon: 72.50, sog: 12.3, cog: 354.0 },
        ],
      },
      {
        id: 'vsl-03',
        mmsi: '219018442',
        imo: '9632064',
        name: 'MAERSK SENTOSA',
        vesselType: 'Container Ship',
        flag: 'Denmark',
        lengthM: 366.0,
        widthM: 48.2,
        draughtM: 14.5,
        speedKnots: 19.4,
        courseDeg: 170.0,
        headingDeg: 171.0,
        minDistanceNm: 15.2,
        suspicionScore: 22.1,
        rank: 3,
        anomalies: [],
        positions: [
          { time: '2026-09-14T15:00:00Z', lat: 18.40, lon: 72.00, sog: 19.4, cog: 170.0 },
          { time: '2026-09-14T17:30:00Z', lat: 18.85, lon: 72.08, sog: 19.1, cog: 171.0 },
          { time: '2026-09-14T20:00:00Z', lat: 19.30, lon: 72.15, sog: 19.5, cog: 169.0 },
        ],
      },
    ],
    groundTruth: {
      sourceVessel: 'MT ARABIAN STAR',
      sourceMmsi: '419000123',
      sourceCoords: [19.040, 72.330],
      sourceTimestamp: '2026-09-14T19:30:00Z',
      evidenceConfidence: 'VERY HIGH (98.2%) — Transponder blackout + verified deceleration',
    },
    timeline: [
      {
        id: 'ev-01',
        timestamp: '2026-09-14 18:00 UTC',
        title: 'Vessel in Transit Approach',
        description: 'MT ARABIAN STAR transiting normal speed (14.2 kn) northbound toward Mumbai High TSS.',
        severity: 'normal',
        category: 'AIS TELEMETRY',
      },
      {
        id: 'ev-02',
        timestamp: '2026-09-14 19:30 UTC',
        title: 'Abrupt Deceleration & Bilge Discharge',
        description: 'Speed drops from 14.2 kn to 3.8 kn. Vessel drifts into off-lane zone.',
        severity: 'critical',
        category: 'DUMPING EVENT',
      },
      {
        id: 'ev-03',
        timestamp: '2026-09-14 19:35 UTC',
        title: 'AIS Transponder Inactive (Dark Ship)',
        description: 'Transponder transmissions cease for 2h 20m inside Mumbai High separation scheme.',
        severity: 'critical',
        category: 'TRANSPONDER GAP',
      },
      {
        id: 'ev-04',
        timestamp: '2026-09-15 01:28 UTC',
        title: 'Sentinel-1A SAR Acquisition',
        description: 'Copernicus SAR scene captures 14.85 km² dark slick with 96% contrast ratio.',
        severity: 'warning',
        category: 'EARTH OBSERVATION',
      },
      {
        id: 'ev-05',
        timestamp: '2026-09-15 02:10 UTC',
        title: 'Coast Guard Incident Escalation',
        description: 'Attribution engine flags MT ARABIAN STAR with 98.2/100 score. Case file generated.',
        severity: 'critical',
        category: 'ENFORCEMENT',
      },
    ],
  },

  scenario_b: {
    id: 'scenario_b',
    title: 'Scenario B: Goa Corridor Multi-Candidate Spill',
    tagline: 'Moderate fuel oil slick in dense traffic corridor with multiple suspects',
    region: 'Offshore Goa Shipping Corridor (Sector GOA-2)',
    spill: {
      id: 'SPL-2026-GOA-02',
      satellite: 'Sentinel-1B C-SAR IW GRD',
      acquisitionTime: '2026-09-15T02:15:10Z',
      areaSqKm: 8.40,
      perimeterKm: 18.2,
      estimatedVolumeM3: 210.0,
      confidence: 0.88,
      estimatedAgeHours: 10.0,
      centroid: [15.655, 73.155],
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.110, 15.640],
            [73.145, 15.665],
            [73.190, 15.670],
            [73.200, 15.650],
            [73.165, 15.635],
            [73.110, 15.640],
          ],
        ],
      },
    },
    environment: {
      windSpeedKnots: 8.0,
      windDirectionDeg: 315,
      currentSpeedKnots: 0.5,
      currentDirectionDeg: 160,
      seaState: 'Sea State 2 (Smooth-Slight)',
      waterTempC: 29.1,
    },
    drift: {
      runType: 'HINDCAST',
      estimatedOriginCoords: [15.620, 73.120],
      estimatedOriginTime: '2026-09-14T16:15:00Z',
      trajectory: [
        { step: 0, time: '2026-09-15T02:15:00Z', lat: 15.655, lon: 73.155, uncertaintyRadiusM: 250 },
        { step: 1, time: '2026-09-14T21:15:00Z', lat: 15.640, lon: 73.140, uncertaintyRadiusM: 410 },
        { step: 2, time: '2026-09-14T16:15:00Z', lat: 15.620, lon: 73.120, uncertaintyRadiusM: 600 },
      ],
    },
    vessels: [
      {
        id: 'vsl-b1',
        mmsi: '636019842',
        imo: '9512301',
        name: 'OCEAN VOYAGER',
        vesselType: 'Product Tanker',
        flag: 'Liberia',
        lengthM: 183.0,
        widthM: 32.2,
        draughtM: 11.0,
        speedKnots: 8.5,
        courseDeg: 165.0,
        headingDeg: 164.0,
        minDistanceNm: 1.4,
        suspicionScore: 78.5,
        rank: 1,
        anomalies: [
          {
            type: 'ROUTE_DEVIATION',
            severity: 'warning',
            description: 'Course zigzag of 42 degrees outside standard shipping lane.',
          },
          {
            type: 'SPEED_REDUCTION',
            severity: 'warning',
            description: 'Transit speed reduced from 13.0 kn to 8.5 kn during darkness.',
          },
        ],
        positions: [
          { time: '2026-09-14T14:00:00Z', lat: 15.85, lon: 73.05, sog: 13.2, cog: 162.0 },
          { time: '2026-09-14T16:15:00Z', lat: 15.62, lon: 73.12, sog: 8.5, cog: 165.0 },
          { time: '2026-09-14T19:00:00Z', lat: 15.35, lon: 73.22, sog: 12.8, cog: 160.0 },
        ],
      },
      {
        id: 'vsl-b2',
        mmsi: '538008123',
        imo: '9488921',
        name: 'GOLDEN TRADER',
        vesselType: 'Bulk Carrier',
        flag: 'Marshall Islands',
        lengthM: 225.0,
        widthM: 32.2,
        draughtM: 14.1,
        speedKnots: 6.2,
        courseDeg: 345.0,
        headingDeg: 346.0,
        minDistanceNm: 2.1,
        suspicionScore: 72.1,
        rank: 2,
        anomalies: [
          {
            type: 'SUDDEN_DECELERATION',
            severity: 'warning',
            description: 'SOG dropped from 13.5 kn to 6.2 kn without engine failure declaration.',
          },
        ],
        positions: [
          { time: '2026-09-14T14:30:00Z', lat: 15.40, lon: 73.18, sog: 13.5, cog: 342.0 },
          { time: '2026-09-14T16:15:00Z', lat: 15.60, lon: 73.14, sog: 6.2, cog: 345.0 },
          { time: '2026-09-14T18:30:00Z', lat: 15.82, lon: 73.08, sog: 12.9, cog: 344.0 },
        ],
      },
      {
        id: 'vsl-b3',
        mmsi: '255805120',
        imo: '9708456',
        name: 'MSC ALTAIR',
        vesselType: 'Container Ship',
        flag: 'Portugal',
        lengthM: 300.0,
        widthM: 48.0,
        draughtM: 13.8,
        speedKnots: 18.0,
        courseDeg: 155.0,
        headingDeg: 156.0,
        minDistanceNm: 4.8,
        suspicionScore: 41.0,
        rank: 3,
        anomalies: [],
        positions: [
          { time: '2026-09-14T15:00:00Z', lat: 15.80, lon: 73.02, sog: 18.2, cog: 155.0 },
          { time: '2026-09-14T16:30:00Z', lat: 15.55, lon: 73.18, sog: 18.0, cog: 156.0 },
        ],
      },
    ],
    groundTruth: {
      sourceVessel: 'OCEAN VOYAGER',
      sourceMmsi: '636019842',
      sourceCoords: [15.620, 73.120],
      sourceTimestamp: '2026-09-14T16:15:00Z',
      evidenceConfidence: 'MODERATE (78.5%) — Requires human-in-the-loop analyst verification against GOLDEN TRADER',
    },
    timeline: [
      {
        id: 'ev-b1',
        timestamp: '2026-09-14 15:00 UTC',
        title: 'Two Vessels Enter Intersecting Corridor',
        description: 'OCEAN VOYAGER (southbound) and GOLDEN TRADER (northbound) converge within 3nm.',
        severity: 'info',
        category: 'TRAFFIC PATTERN',
      },
      {
        id: 'ev-b2',
        timestamp: '2026-09-14 16:15 UTC',
        title: 'Estimated Discharge Window',
        description: 'Reverse hindcasting pins release origin at 15.62°N, 73.12°E. Both vessels close to locus.',
        severity: 'warning',
        category: 'HINDCAST LOCUS',
      },
      {
        id: 'ev-b3',
        timestamp: '2026-09-15 02:15 UTC',
        title: 'Sentinel-1B Detection',
        description: 'SAR pass identifies 8.40 km² slick. Attribution indicates multi-candidate ambiguity.',
        severity: 'warning',
        category: 'ANALYSIS',
      },
    ],
  },

  scenario_c: {
    id: 'scenario_c',
    title: 'Scenario C: Gulf of Khambhat Dispersed Sheen',
    tagline: 'Dispersed weathered sheen with no strongly attributed candidate (Cold Case)',
    region: 'Gulf of Khambhat Approaches, Gujarat (Sector GOK-1)',
    spill: {
      id: 'SPL-2026-GUJ-03',
      satellite: 'Sentinel-2B MSI Multi-Spectral',
      acquisitionTime: '2026-09-15T05:30:12Z',
      areaSqKm: 4.20,
      perimeterKm: 14.6,
      estimatedVolumeM3: 65.0,
      confidence: 0.72,
      estimatedAgeHours: 36.0,
      centroid: [20.820, 71.880],
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [71.850, 20.810],
            [71.875, 20.835],
            [71.910, 20.830],
            [71.895, 20.805],
            [71.850, 20.810],
          ],
        ],
      },
    },
    environment: {
      windSpeedKnots: 15.0,
      windDirectionDeg: 45,
      currentSpeedKnots: 2.2,
      currentDirectionDeg: 210,
      seaState: 'Sea State 4 (Rough tidal rip)',
      waterTempC: 27.5,
    },
    drift: {
      runType: 'HINDCAST',
      estimatedOriginCoords: [20.910, 71.950],
      estimatedOriginTime: '2026-09-13T17:30:00Z',
      trajectory: [
        { step: 0, time: '2026-09-15T05:30:00Z', lat: 20.820, lon: 71.880, uncertaintyRadiusM: 400 },
        { step: 1, time: '2026-09-14T11:30:00Z', lat: 20.865, lon: 71.915, uncertaintyRadiusM: 850 },
        { step: 2, time: '2026-09-13T17:30:00Z', lat: 20.910, lon: 71.950, uncertaintyRadiusM: 1450 },
      ],
    },
    vessels: [
      {
        id: 'vsl-c1',
        mmsi: '419001889',
        imo: '9238120',
        name: 'BHARAT RATNA',
        vesselType: 'General Cargo',
        flag: 'India',
        lengthM: 145.0,
        widthM: 22.0,
        draughtM: 7.5,
        speedKnots: 14.5,
        courseDeg: 215.0,
        headingDeg: 215.0,
        minDistanceNm: 18.2,
        suspicionScore: 31.5,
        rank: 1,
        anomalies: [],
        positions: [
          { time: '2026-09-13T16:00:00Z', lat: 21.05, lon: 72.15, sog: 14.5, cog: 215.0 },
          { time: '2026-09-13T18:00:00Z', lat: 20.80, lon: 71.85, sog: 14.6, cog: 214.0 },
        ],
      },
      {
        id: 'vsl-c2',
        mmsi: '311000452',
        imo: '9654120',
        name: 'AL KHALEEJ',
        vesselType: 'LPG Tanker',
        flag: 'Bahamas',
        lengthM: 205.0,
        widthM: 32.0,
        draughtM: 10.4,
        speedKnots: 16.8,
        courseDeg: 35.0,
        headingDeg: 36.0,
        minDistanceNm: 22.5,
        suspicionScore: 24.0,
        rank: 2,
        anomalies: [],
        positions: [
          { time: '2026-09-13T16:30:00Z', lat: 20.60, lon: 71.60, sog: 16.8, cog: 35.0 },
          { time: '2026-09-13T18:30:00Z', lat: 20.90, lon: 71.90, sog: 16.7, cog: 36.0 },
        ],
      },
    ],
    groundTruth: {
      sourceVessel: 'UNIDENTIFIED DARK VESSEL / NATURAL SEEP',
      sourceMmsi: 'N/A',
      sourceCoords: [20.910, 71.950],
      sourceTimestamp: '2026-09-13T17:30:00Z',
      evidenceConfidence: 'UNATTRIBUTED (< 35%) — Unregistered fishing fleet dumping or seabed geological seep. Recommend airborne CG Dornier flyover.',
    },
    timeline: [
      {
        id: 'ev-c1',
        timestamp: '2026-09-13 17:30 UTC',
        title: 'Estimated Release Event',
        description: 'Strong tidal rip currents in Gulf of Khambhat disperse slick rapidly.',
        severity: 'info',
        category: 'ESTIMATED ORIGIN',
      },
      {
        id: 'ev-c2',
        timestamp: '2026-09-15 05:30 UTC',
        title: 'Sentinel-2B Optical Detection',
        description: 'Weathered sheen detected across 4.20 km². High uncertainty envelope.',
        severity: 'info',
        category: 'EARTH OBSERVATION',
      },
      {
        id: 'ev-c3',
        timestamp: '2026-09-15 06:15 UTC',
        title: 'Cold Case Classification',
        description: 'All commercial AIS traffic cleared of wrongdoing. Aerial reconnaissance recommended.',
        severity: 'warning',
        category: 'INVESTIGATION',
      },
    ],
  },
};

export const RECENT_INVESTIGATIONS = [
  {
    caseNumber: 'INV-2026-MUM-041',
    region: 'Mumbai High (Sector MH-4)',
    spillArea: '14.85 km²',
    primarySuspect: 'MT ARABIAN STAR (419000123)',
    status: 'ESCALATED_TO_COAST_GUARD',
    priority: 'HIGH',
    leadAgency: 'Indian Coast Guard - Western Command',
    updatedAt: '2026-09-15 13:42 UTC',
  },
  {
    caseNumber: 'INV-2026-GOA-019',
    region: 'Goa TSS Corridor',
    spillArea: '8.40 km²',
    primarySuspect: 'OCEAN VOYAGER (636019842)',
    status: 'TRIAGED',
    priority: 'MEDIUM',
    leadAgency: 'Directorate General of Shipping',
    updatedAt: '2026-09-15 11:15 UTC',
  },
  {
    caseNumber: 'INV-2026-GUJ-007',
    region: 'Gulf of Khambhat',
    spillArea: '4.20 km²',
    primarySuspect: 'UNATTRIBUTED / COLD CASE',
    status: 'OPEN',
    priority: 'LOW',
    leadAgency: 'Gujarat Maritime Board',
    updatedAt: '2026-09-15 08:30 UTC',
  },
];

export const SYSTEM_DATA_STATUS = {
  activeCases: 3,
  totalSpillAreaKm2: 27.45,
  highestRiskVessel: 'MT ARABIAN STAR',
  highestRiskScore: 98.2,
  lastUpdateUtc: '2026-09-15 13:45:20 UTC',
  feeds: [
    {
      name: 'Sentinel-1A / 1B C-SAR',
      type: 'Earth Observation',
      status: 'nominal',
      detail: 'Next pass over Arabian Sea in 03h 42m',
    },
    {
      name: 'Spire Global AIS Stream',
      type: 'Vessel Tracking',
      status: 'nominal',
      detail: '1,248 targets in Western EEZ • 1.4s latency',
    },
    {
      name: 'NOAA GFS Wind Vectors',
      type: 'Atmospheric Physics',
      status: 'nominal',
      detail: '0.25° grid 10m wind synced (12:00Z cycle)',
    },
    {
      name: 'Copernicus CMEMS Currents',
      type: 'Ocean Circulation',
      status: 'nominal',
      detail: 'Surface velocity fields operational',
    },
  ],
};
