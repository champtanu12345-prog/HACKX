# HACKX System Architecture Document

## 1. System Overview
HACKX is a multi-modal data fusion platform addressing SIH Problem Statement 260143: *"Leveraging satellite imagery to determine Oil spills at sea along with AIS data correlations to identify vessel responsible for the spill."*

The core engineering challenge is transforming noisy, low-frequency satellite observations into high-confidence legal evidence. Satellite passes occur hours or days after an illegal bilge-dumping incident; ocean currents and surface winds continuously disperse and drift the oil slick. Simple spatial cross-referencing between the observed slick location and present-day vessel positions results in false accusations. HACKX implements **Lagrangian reverse-trajectory hindcasting** to locate the exact origin time and coordinates, followed by a **multi-factor behavioral scoring engine** over historical AIS tracks.

---

## 2. Layered Architecture

```
+-----------------------------------------------------------------------------------+
|                           PRESENTATION LAYER (Frontend)                           |
|  - Maritime GIS Workstation (MapLibre GL JS, dark oceanic tactical styling)       |
|  - Spatial Layers: SAR Footprint, Slick Polygon, Drift Envelope, AIS Tracks       |
|  - Suspect Vessel Scoring Leaderboard & Anomaly Breakdown                         |
|  - Investigation Dossier & Coast Guard Export Tool                                |
+----------------------------------------+------------------------------------------+
                                         | REST / JSON
+----------------------------------------v------------------------------------------+
|                             API GATEWAY & ROUTING LAYER                           |
|  - FastAPI (Python 3.11) with async routing & Pydantic v2 schemas                 |
|  - Endpoints: /spills, /drift, /vessels, /investigations, /health                 |
+----------------------------------------+------------------------------------------+
                                         |
+----------------------------------------v------------------------------------------+
|                                CORE SERVICE LAYER                                 |
|  +------------------------------------------------------------------------------+ |
|  | Provider Abstraction Layer (Pluggable Ingestion Interfaces):                | |
|  | - SatelliteProvider (Copernicus / Sentinel-1 / Sentinel-2 / Synthetic SAR)  | |
|  | - AISProvider (Spire / ExactEarth / AISHub / Mock Stream)                    | |
|  | - WeatherProvider (NOAA GFS / ECMWF 10m Wind Vectors)                        | |
|  | - OceanCurrentProvider (Copernicus Marine / HyCOM Surface Velocity)          | |
|  +------------------------------------------------------------------------------+ |
|  | Attribution & Simulation Engines:                                            | |
|  | - DriftEngine: Lagrangian Particle Simulation (Hindcast & Forecast)          | |
|  | - VesselScoringEngine: Weighted Multi-criteria Suspicion Index               | |
|  | - AISCorrelationService: Spatiotemporal intersection & Anomaly Detection     | |
|  +------------------------------------------------------------------------------+ |
+----------------------------------------+------------------------------------------+
                                         |
+----------------------------------------v------------------------------------------+
|                               DATA ACCESS LAYER                                   |
|  - Repository Pattern: SpillRepository, VesselRepository, InvestigationRepository |
|  - SQLAlchemy 2.0 ORM with PostgreSQL + PostGIS & SQLite dual-mode support        |
+----------------------------------------+------------------------------------------+
                                         |
+----------------------------------------v------------------------------------------+
|                            MACHINE LEARNING LAYER (ml/)                           |
|  - Preprocessing: SAR radiometric calibration, Lee speckle filter, dB conversion  |
|  - Segmentation: PyTorch U-Net for dark-formation detection in SAR imagery        |
|  - Postprocessing: GeoJSON contour extraction, perimeter, area, centroid, age     |
+-----------------------------------------------------------------------------------+
```

---

## 3. Core Database Entities

| Entity | Description | Key Fields |
|---|---|---|
| `satellite_observations` | Satellite passes covering maritime regions | `scene_id`, `satellite_name`, `sensor_type`, `acquisition_time`, `footprint_geojson` |
| `spill_detections` | Segmented oil slick detections | `observation_id`, `detection_time`, `geometry_geojson`, `area_sqkm`, `confidence_score`, `estimated_age_hours` |
| `drift_runs` | Numerical simulation jobs | `spill_id`, `run_type` (HINDCAST/FORECAST), `start_time`, `end_time`, `particle_count` |
| `trajectory_points` | Dispersed particle positions over time | `drift_run_id`, `timestep_utc`, `latitude`, `longitude`, `uncertainty_radius_m` |
| `vessels` | Maritime vessels registered or tracked | `mmsi`, `imo`, `name`, `callsign`, `vessel_type`, `flag_country` |
| `ais_positions` | Temporal breadcrumbs from vessel transponders | `vessel_id`, `timestamp_utc`, `latitude`, `longitude`, `sog_knots`, `cog_degrees` |
| `vessel_anomalies` | Detected illicit or suspicious maneuvers | `vessel_id`, `spill_id`, `anomaly_type`, `severity`, `details` |
| `vessel_scores` | Attribution suspicion rank and breakdown | `spill_id`, `vessel_id`, `composite_score`, `proximity_score`, `anomaly_score` |
| `investigations` | Formal legal dossier for Coast Guard action | `case_number`, `spill_id`, `primary_suspect_id`, `status`, `summary_notes` |

---

## 4. Multi-Factor Suspicion Scoring Formula

The suspicion score $S_{vessel} \in [0, 100]$ is computed as:

$$S_{vessel} = w_1 \cdot P_{origin} + w_2 \cdot A_{trajectory} + w_3 \cdot D_{speed} + w_4 \cdot G_{ais}$$

Where:
- $P_{origin} \in [0, 100]$: Inverse distance to the hindcasted origin point at the estimated release timestamp.
- $A_{trajectory} \in [0, 100]$: Alignment between the vessel's historical heading and the slick's major elongation axis.
- $D_{speed} \in [0, 100]$: Score penalizing abnormal deceleration during transit (typical behavior during illegal bilge discharge).
- $G_{ais} \in [0, 100]$: AIS transponder blackout penalty ("dark vessel" anomaly) in the vicinity of the spill zone.
- Weights: $w_1 = 0.35$, $w_2 = 0.20$, $w_3 = 0.20$, $w_4 = 0.25$.
