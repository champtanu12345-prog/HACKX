# HACKX: Smart India Hackathon Operational Demo & Technical Guide

**Problem Statement 260143**: *Leveraging satellite imagery to determine Oil spills at sea along with AIS data correlations to identify vessel responsible for the spill.*

---

## 1. Executive Summary & Core Value Proposition

Illegal marine oil discharges (such as deliberate oily bilge pumping or tank washing under cover of darkness) devastate coastal ecosystems and marine fisheries. Traditional maritime surveillance suffers from a fundamental operational gap:
1. **The Spatiotemporal Drift Disconnect**: Satellite Synthetic Aperture Radar (SAR) passes capture oil slicks hours or even days after discharge. During that interval, ocean surface currents and monsoon winds advect and disperse the slick tens of nautical miles away from where it was pumped.
2. **False Attribution Risk**: A simple spatial cross-reference of who is *near the detected slick today* will falsely suspect innocent transit vessels while allowing the true culprit to escape undetected.

**HACKX** solves this via **physics-informed inverse Lagrangian hindcasting** coupled with **multi-factor spatiotemporal AIS attribution scoring**. By rewinding the ocean currents and wind vectors step-by-step, HACKX reconstructs the probable origin coordinates and discharge time window, then audits historical AIS tracks to calculate an explainable, non-accusatory correlation index.

```
+-------------------+      +----------------------+      +----------------------+
| Satellite SAR     | ---> | Lagrangian Hindcast  | ---> | AIS Trajectory Match |
| U-Net Dark Slick  |      | Physical Drift Back  |      | Spatial + Temporal   |
| Segmentation      |      | to Discharge Origin  |      | + Anomaly Detection  |
+-------------------+      +----------------------+      +----------------------+
                                                                    |
                                                                    v
                                                         +----------------------+
                                                         | Coast Guard Priority |
                                                         | Dossier & Replay     |
                                                         +----------------------+
```

---

## 2. 2-Minute Live Demo Walkthrough (For SIH Judges)

This scripted sequence is optimized for high-impact presentation in a high-tempo judging session.

| Timestamp | Screen / Action | What the Judge Sees | Presenter Script |
|---|---|---|---|
| **0:00 - 0:20** | **Overview Dashboard** (`/`) | High-contrast tactical GIS workstation with Mumbai High scenario selected. KPI counters display active cases, detected area (14.2 km²), and system health. | *"Respected judges, this is HACKX. We solve PS 260143: tracking maritime oil discharges back to potential source vessels using multi-sensor satellite fusion and AIS tracking."* |
| **0:20 - 0:50** | **Click "RUN ANALYSIS"** | The primary button changes to show active pipeline execution. Progress chips illuminate through 7 distinct backend stages: `Satellite Analysis` → `Spill Detected` → `Drift Reconstruction` → `Source Estimated` → `AIS Correlation` → `Vessel Ranking` → `Investigation Ready`. | *"When we trigger analysis, HACKX executes a complete operational workflow. Notice the actual backend processing: our U-Net segments the dark slick, our Lagrangian engine reverses ocean advection, and AIS records are matched against the reconstructed origin."* |
| **0:50 - 1:15** | **Inspection of Map & Drift Trajectory** | Map zooms into the oil slick polygon (red outline), backward hindcast drift trail (cyan dots), reconstructed origin ellipse (dashed amber), and nearby vessel tracks. | *"Crucially, the vessel responsible is NOT where the slick is found today. Ocean currents moved it 18 nautical miles east. Our hindcast pinpoints where the slick originated 8 hours ago."* |
| **1:15 - 1:40** | **Vessel Attribution & Anomaly Cards** (`/attribution`) | Explanatory score leaderboard opens. Top candidate vessel (*MT Sagar Gaurav*, Score 86.4/100) displays exact transparent score breakdown: Spatial (40%), Temporal (25%), Trajectory (20%), and Behavioral Anomaly (15%). | *"We do NOT use an unexplainable black-box score. Every point is audited: 40% spatial proximity to origin, 25% temporal alignment, 20% course alignment, and 15% behavioral anomalies. Notice the detected anomaly: a 92-minute AIS transmission blackout exactly over the discharge zone."* |
| **1:40 - 2:00** | **Click "REPLAY ANALYSIS"** | Synchronized 9-step timeline scrubber opens. Steps replay from satellite capture to origin hindcast to ranked vessels. Click "Export Dossier". | *"To enable Coast Guard enforcement, our Replay Mode walks investigators through every piece of physical evidence step-by-step, generating a tamper-evident dossier ready for inspection."* |

---

## 3. 5-Minute Technical Deep-Dive

### 3.1 Problem Context (PS 260143)
Vessels transit international shipping lanes through India's Exclusive Economic Zone (EEZ)—notably the Persian Gulf-to-East Asia tanker route across the Arabian Sea and Bay of Bengal. Under MARPOL Annex I, oil discharge $>15$ ppm is illegal. Unscrupulous operators disable AIS transponders ("go dark") or throttle engines at 02:00 UTC to discharge oily waste, confident that currents will move the evidence away before daybreak.

### 3.2 Architectural Flow

```
[ESA Sentinel-1 SAR]       [DGLL / National AIS]      [INCOIS / NOAA GFS]
   (Level-1 GRD)              (NMEA / JSON)              (Currents & Wind)
         |                           |                           |
         v                           v                           v
+------------------+       +-------------------+       +-------------------+
| SAR Preprocessor |       | AIS Ingestion &   |       | Ocean Hydrodynamic|
| - Speckle Filter |       | Trajectory Store  |       | Vector Grid       |
| - dB Conversion  |       | (SQLite / PostGIS)|       | (u_current, v_wind|
+------------------+       +-------------------+       +-------------------+
         |                           |                           |
         v                           |                           |
+------------------+                 |                           |
| PyTorch U-Net    |                 |                           |
| Dark Formation   |                 |                           |
| Segmentation     |                 |                           |
+------------------+                 |                           |
         |                           |                           |
         v                           v                           v
+------------------+       +-----------------------------------------------+
| Spill Geometry   | ----> | Numerical Drift Engine (Lagrangian Particles) |
| Centroid & Area  |       | dt = -300s (Hindcast to Origin t_0, Lat, Lon) |
+------------------+       +-----------------------------------------------+
                                     |
                                     v
                           +-----------------------------------------------+
                           | Spatiotemporal Correlation & Anomaly Detector |
                           | - Search Radius: R <= 65 km                   |
                           | - Time Window:   |t - t_0| <= 6 hrs           |
                           | - Anomaly Flags: AIS gap, speed drop, loiter  |
                           +-----------------------------------------------+
                                     |
                                     v
                           +-----------------------------------------------+
                           | Transparent Suspicion Scoring Engine          |
                           | Score = 0.40S + 0.25T + 0.20R + 0.15B         |
                           +-----------------------------------------------+
                                     |
                                     v
                           +-----------------------------------------------+
                           | Maritime Workstation & Coast Guard Replay     |
                           +-----------------------------------------------+
```

---

## 4. Subsystem Engineering Details

### 4.1 Machine Learning Subsystem (SAR Oil Slick Detection)
* **Sensor**: C-band Synthetic Aperture Radar (SAR) from Sentinel-1 (VV or VH polarization). SAR operates through cloud cover and darkness.
* **Physical Mechanism**: Oil dampens ocean capillary-gravity waves, creating smooth patches that reflect radar pulses specularly away from the receiver, appearing as distinct low-backscatter "dark formations".
* **Preprocessing Pipeline** (`ml/preprocessing/sar.py`):
  1. Radiometric calibration to normalized radar cross section ($\sigma^0$).
  2. Lee speckle noise filter (adaptive $5 \times 5$ window preserving slick edges).
  3. Conversion to logarithmic decibel scale: $\sigma^0_{\text{dB}} = 10 \cdot \log_{10}(\sigma^0)$.
  4. Adaptive thresholding and min-max normalization.
* **Segmentation Architecture** (`ml/models/unet.py`):
  - Standard encoder-decoder U-Net with skip connections.
  - Encoder: 4 stages with double $3 \times 3$ convolutions, Batch Normalization, ReLU, and $2 \times 2$ Max Pooling.
  - Bottleneck: 512 channels.
  - Decoder: 4 stages with Transposed Convolutions and feature map concatenation.
  - Output: Single-channel sigmoid probability mask.
* **Polygonization**:
  - Contours extracted via morphological closing + Otsu thresholding.
  - Converted to WGS84 GeoJSON polygons with computed geodesic perimeter, surface area ($\text{km}^2$), and centroid.

### 4.2 Hydrodynamic Drift Subsystem (Lagrangian Particle Advection)
* **Governing Equation** (`ml/drift/lagrangian.py`):
  $$\vec{v}_{\text{total}} = \vec{u}_{\text{current}} + c_w \cdot \mathbf{R}(\theta_w) \cdot \vec{u}_{\text{wind}} + \vec{v}_{\text{diffusion}}'$$
  - $\vec{u}_{\text{current}}$: Ocean surface current velocity (depth 0-1m).
  - $\vec{u}_{\text{wind}}$: 10-meter atmospheric wind velocity.
  - $c_w$: Wind drift factor (standard empirical value: $0.03$ or $3\%$).
  - $\mathbf{R}(\theta_w)$: Coriolis deflection rotation matrix ($\approx 0^{\circ}$ to $15^{\circ}$ to the right in the Northern Hemisphere).
  - $\vec{v}_{\text{diffusion}}'$: Stochastic Monte Carlo diffusion component modeling sub-grid turbulent dispersion:
    $$dx' = \sqrt{2 K_h \Delta t} \cdot \mathcal{N}(0, 1)$$
* **Hindcasting vs. Forecasting**:
  - **Hindcast**: Run with negative timestep ($\Delta t = -300\text{ s}$) from observation time back to estimated age $T_{\text{spill}}$. Traces particles back to compute the **Probable Origin Centroid** and uncertainty radius.
  - **Forecast**: Run with positive timestep ($\Delta t = +300\text{ s}$) 48 hours forward to predict coastal landfall zones and ecological vulnerability impact.

### 4.3 AIS Ingestion & Anomaly Detection Subsystem
* **Provider Abstraction** (`backend/services/providers/ais/`):
  - `AISProvider` base interface supporting real-time streaming, REST polling, and local CSV/JSON replay.
  - Normalizes transponder fields: `mmsi`, `vessel_name`, `imo`, `timestamp`, `latitude`, `longitude`, `speed_knots`, `course_over_ground`, `heading`, `navigation_status`.
* **Spatiotemporal Filtering**:
  - Spatial filter: Haversine distance from candidate vessel track to hindcast origin $\le 65\text{ km}$.
  - Temporal filter: Time delta $|t_{\text{vessel}} - t_{\text{origin}}| \le 6\text{ hours}$.
* **Behavioral Anomaly Detectors** (`backend/services/behavior_analyzer.py`):
  - **AIS Gap**: Missing transponder transmissions $>45\text{ minutes}$ in open sea.
  - **Sudden Deceleration**: Drop in speed of $\ge 4.0\text{ knots}$ maintained for $>30\text{ minutes}$ (indicative of slow transit required for bilge discharge operations).
  - **Unusual Course Deviation**: Heading change $>45^{\circ}$ inconsistent with charted shipping corridor.
  - **Loitering**: Drifting or circling at low speed ($<2\text{ knots}$) in a concentrated polygon.

### 4.4 Transparent Attribution Scoring Engine
* **Formula** (`backend/services/scoring_engine.py`):
  $$\text{Score} = 0.40 \cdot S_{\text{spatial}} + 0.25 \cdot S_{\text{temporal}} + 0.20 \cdot S_{\text{trajectory}} + 0.15 \cdot S_{\text{behavior}}$$
  - Every component is strictly normalized to $[0, 100]$.
  - **Spatial Proximity ($40\%$)**:
    $$S_{\text{spatial}} = \max\left(0, 100 \cdot \left(1 - \frac{d_{\text{min}}}{R_{\text{search}}}\right)\right)$$
  - **Temporal Alignment ($25\%$)**:
    $$S_{\text{temporal}} = \max\left(0, 100 \cdot \left(1 - \frac{\Delta t}{\Delta t_{\text{max}}}\right)\right)$$
  - **Trajectory Match ($20\%$)**:
    Vector cosine alignment between vessel course-over-ground and reverse drift trajectory axis.
  - **Behavioral Anomaly ($15\%$)**:
    Sum of penalty weights for detected anomalies (gap: 50 pts, speed drop: 30 pts, loiter: 20 pts).
* **Non-Accusatory Classification**:
  - $\ge 80$: **High Correlation (Top Investigation Priority)**
  - $60 - 79$: **Moderate Correlation (Requires Investigation)**
  - $30 - 59$: **Low Correlation (Secondary Interest)**
  - $< 30$: **Inconclusive**
  - *Standard Notice*: System outputs represent technical correlation indices for Coast Guard priority dispatch; legal liability requires boarding inspection and physical oil sampling.

---

## 5. Built-in Benchmark Scenarios

HACKX includes three pre-calibrated benchmark scenarios reflecting major Indian maritime corridors:

1. **Scenario A: Mumbai High Offshore Basin (Arabian Sea)**
   - *Coordinates*: $19.412^{\circ}\text{N}, 71.325^{\circ}\text{E}$
   - *Incident*: 14.2 km² heavy fuel oil slick detected near oil field installations.
   - *Environmental*: NW wind at 14.5 kts, surface current 0.8 kts at 115°.
   - *Top Priority*: Crude oil tanker *MT Sagar Gaurav* (MMSI 419001234), Score 86.4. Exhibits a 92-minute AIS blackout near the origin.

2. **Scenario B: Gulf of Kutch Port Approaches (Gujarat)**
   - *Coordinates*: $22.485^{\circ}\text{N}, 69.112^{\circ}\text{E}$
   - *Incident*: 8.7 km² refined diesel discharge near sensitive coral and mangrove reserves.
   - *Environmental*: SW monsoon winds 18.0 kts, strong tidal current 1.4 kts.
   - *Top Priority*: Bulk carrier *MV Ocean Trader* (MMSI 563004567), Score 81.2. Sharp deceleration from 13 kts to 4 kts during transit.

3. **Scenario C: Chennai Port Approaches (Bay of Bengal)**
   - *Coordinates*: $13.140^{\circ}\text{N}, 80.350^{\circ}\text{E}$
   - *Incident*: 5.1 km² bilge waste trail along north-south coastal shipping corridor.
   - *Environmental*: NE wind 11.0 kts, longshore current 0.6 kts.
   - *Top Priority*: Container ship *Pacific Pioneer* (MMSI 352007890), Score 74.8. Track trajectory matches slick major elongation axis.

---

## 6. SIH Judge FAQ & Defense Guide

### Q1: "How do you account for ocean currents and wind changing over time?"
*Answer*: "Our Lagrangian advection framework integrates time-varying current and wind vector fields at discrete time steps ($\Delta t = 5\text{ minutes}$). In full production, this ingests NetCDF grids from INCOIS or ECMWF ERA5. For the demo, our service interpolates local vector grids, computing trajectory advection backwards for hindcasting and forward for forecasting."

### Q2: "Why not use an End-to-End Deep Learning model to predict the culprit directly?"
*Answer*: "Maritime enforcement requires strict legal admissibility under maritime law. A black-box neural network that outputs 'Vessel X is guilty' would be immediately dismissed in a maritime tribunal. HACKX uses deep learning strictly where it excels—computer vision segmentation of SAR dark formations. For vessel attribution, we employ explainable, deterministic physics and transparent mathematical scoring where every single point is backed by audited time, distance, and heading evidence."

### Q3: "What if a vessel turned off its AIS transponder before the spill?"
*Answer*: "That is precisely one of our key behavioral anomaly detectors! A transponder blackout in open sea is flagged as a 'Dark Vessel Anomaly'. The scoring engine correlates the vessel's last known trajectory vector before the gap and its reappearance vector after the gap, determining if the interpolated trajectory intersected the reconstructed spill origin during the blackout period."

### Q4: "Can your system run offline during judge evaluation without an internet connection?"
*Answer*: "Yes. HACKX was built to zero-failure hackathon reliability standards. The complete SAR processing pipeline, SQLite WAL database, Lagrangian drift engine, and MapLibre workstation run locally on the workstation. If internet tiles fail, MapLibre automatically falls back to an internal tactical grid without throwing unhandled exceptions."
