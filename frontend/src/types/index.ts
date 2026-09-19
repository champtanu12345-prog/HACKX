export interface SpillDetection {
  id: string;
  observation_id?: string;
  detection_time: string;
  geometry_geojson: string; // GeoJSON string
  centroid_lat: number;
  centroid_lon: number;
  area_sqkm: number;
  perimeter_km: number;
  estimated_volume_m3?: number;
  estimated_age_hours: number;
  confidence_score: number;
  region_name: string;
  created_at: string;
}

export interface TrajectoryPoint {
  id: string;
  timestep_utc: string;
  latitude: number;
  longitude: number;
  uncertainty_radius_m: number;
  wind_speed_ms?: number;
  current_speed_ms?: number;
  particle_index: number;
}

export interface DriftRun {
  id: string;
  spill_id: string;
  run_type: 'HINDCAST' | 'FORECAST';
  simulation_start_time: string;
  simulation_end_time: string;
  duration_hours: number;
  particle_count: number;
  estimated_origin_lat?: number;
  estimated_origin_lon?: number;
  estimated_origin_time?: string;
  status: string;
  trajectory_points: TrajectoryPoint[];
}

export interface VesselAnomaly {
  anomaly_type: string;
  start_time: string;
  end_time?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  details: string;
}

export interface AisPosition {
  timestamp: string;
  latitude: number;
  longitude: number;
  sog: number;
  cog: number;
  nav_status?: string;
}

export interface SuspectAttribution {
  vessel_id: string;
  mmsi: string;
  imo?: string;
  name: string;
  vessel_type: string;
  flag_country: string;
  rank: number;
  composite_score: number;
  proximity_score: number;
  trajectory_alignment: number;
  speed_anomaly_score: number;
  ais_gap_penalty: number;
  min_distance_nm?: number;
  anomalies: VesselAnomaly[];
  recent_positions: AisPosition[];
}

export interface Investigation {
  id: string;
  case_number: string;
  spill_id: string;
  primary_suspect_id?: string;
  status: 'OPEN' | 'TRIAGED' | 'ESCALATED_TO_COAST_GUARD' | 'CLOSED';
  lead_agency: string;
  summary_notes?: string;
  created_at: string;
}

export interface SystemHealth {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  database: string;
  providers: {
    satellite_sar: string;
    ais_telemetry: string;
    noaa_weather: string;
    ocean_currents: string;
  };
}

export interface DetectionResult {
  detection_id: string;
  model_name: string;
  model_version: string;
  mode: 'demo' | 'trained';
  confidence: number;
  area_sqkm: number;
  perimeter_km: number;
  centroid: [number, number];
  polygon?: any;
  estimated_age_hours: number;
  original_image?: string;
  mask_image?: string;
  overlay_image?: string;
  metadata?: Record<string, any>;
}

export interface DriftSimulationPoint {
  timestamp: string;
  latitude: number;
  longitude: number;
  particle_id: number;
  velocity: number;
  direction: number;
  uncertainty_radius_m: number;
  timestep_index: number;
}

export interface DriftSimulationResult {
  run_type: 'HINDCAST' | 'FORECAST';
  model_source: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  trajectory_points: DriftSimulationPoint[];
  estimated_origin_coords?: [number, number];
  estimated_origin_time?: string;
  confidence_score: number;
  parameters: Record<string, any>;
}

export type AnalysisStage =
  | 'IDLE'
  | 'SATELLITE_ANALYSIS'
  | 'SPILL_DETECTED'
  | 'DRIFT_RECONSTRUCTION'
  | 'SOURCE_ESTIMATED'
  | 'AIS_CORRELATION'
  | 'VESSEL_RANKING'
  | 'INVESTIGATION_READY';

export interface InvestigationTimelineEvent {
  timestamp: string;
  stage: string;
  title: string;
  description: string;
  badge?: string;
  status: string;
  metadata?: Record<string, any>;
}

export interface InvestigationDetail {
  id: string;
  case_number: string;
  scenario_id?: string;
  status: 'OPEN' | 'TRIAGED' | 'ESCALATED_TO_COAST_GUARD' | 'CLOSED';
  lead_agency: string;
  summary_notes?: string;
  spill: {
    id: string;
    area_sqkm: number;
    perimeter_km: number;
    confidence: number;
    centroid: [number, number];
    geometry: any;
    detection_time: string;
    satellite_name?: string;
    sensor_type?: string;
    scene_id?: string;
    mask_image?: string;
    overlay_image?: string;
  };
  drift: {
    run_type: string;
    model_source?: string;
    duration_hours?: number;
    hindcast_points: Array<{
      step?: number;
      time: string;
      lat: number;
      lon: number;
      velocity?: number;
      direction?: number;
      uncertainty_radius_m?: number;
    }>;
    forecast_points: Array<{
      step?: number;
      time: string;
      lat: number;
      lon: number;
      velocity?: number;
      direction?: number;
      uncertainty_radius_m?: number;
    }>;
    parameters?: Record<string, any>;
  };
  source: {
    coords: [number, number]; // [lat, lon]
    timestamp: string;
    confidence: number;
    uncertainty_radius_m?: number;
    region?: string;
  };
  ais_candidates: Array<{
    vessel_id: string;
    mmsi: string;
    name?: string;
    vessel_name?: string;
    vessel_type: string;
    flag_country: string;
    rank: number;
    correlation_score: number;
    overall_score?: number;
    spatial_score?: number;
    temporal_score?: number;
    trajectory_score?: number;
    behavior_score?: number;
    spatial_distance_nm: number;
    distance_km?: number;
    temporal_difference_hours: number;
    time_delta_minutes?: number;
    trajectory_alignment_score?: number;
    correlation_category?: string;
    category?: string;
    investigation_priority?: string;
    potential_source?: boolean;
    evidence?: Array<{
      component: string;
      score: number;
      reason: string;
      metric?: string;
      [key: string]: any;
    }>;
    explanations?: string[];
    anomalies?: Array<{
      anomaly_type: string;
      severity: string;
      start_time: string;
      end_time?: string;
      details: string;
    }>;
    recent_positions?: Array<{
      timestamp: string;
      latitude: number;
      longitude: number;
      sog: number;
      cog: number;
      nav_status?: string;
    }>;
  }>;
  vessel_scores: Record<string, any>;
  evidence: Record<string, {
    structured_evidence: Array<any>;
    human_explanations: string[];
    summary: string;
  }>;
  timeline: InvestigationTimelineEvent[];
  timestamps: {
    satellite_observation_time?: string;
    estimated_release_time?: string;
    analysis_started_at?: string;
    analysis_completed_at?: string;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

