# HACKX: Known Limitations, System Provenance & Engineering Boundaries

**Project**: HACKX Maritime Intelligence Platform  
**Smart India Hackathon Problem Statement**: 260143  
**Audit Standard**: Academic, Engineering & Operational Integrity Review  

---

## 1. Provenance Matrix: Real vs. Local vs. Simulated vs. Integration-Ready

To maintain complete transparency with hackathon evaluators, industry reviewers, and Coast Guard officers, this document delineates the operational status of every subsystem within the HACKX platform.

| Subsystem Component | Classification | Description & Provenance |
|---|---|---|
| **U-Net Segmentation Architecture** | **REAL** | Full PyTorch neural network (`ml/models/unet.py`) with 4-stage encoder-decoder, skip connections, batch normalization, and sigmoid thresholding. |
| **SAR Radiometric & Speckle Pipeline** | **REAL** | Mathematical implementation of $5 \times 5$ Lee adaptive speckle filtering, radiometric calibration to $\sigma^0$, and logarithmic decibel scaling (`ml/preprocessing/sar.py`). |
| **Demo SAR Radar Scenes** | **SIMULATED** | Pre-generated synthetic SAR radar scenes generated with calibrated Rayleigh speckle noise distribution and low-backscatter oil damping polygons. Built to guarantee 100% offline judging reliability without requiring active ESA Copernicus credentials or multi-gigabyte `.SAFE` downloads during evaluations. |
| **Lagrangian Particle Drift Physics** | **REAL** | Numerical Runge-Kutta / Euler advection equations combining ocean surface currents, $3\%$ atmospheric windage, Coriolis deflection matrix, and stochastic Monte Carlo diffusion (`ml/drift/lagrangian.py`). |
| **Drift Environmental Vector Grids** | **SIMULATED / LOCAL** | Scenarios feature pre-configured, calibrated wind/current vectors representative of Arabian Sea and Bay of Bengal seasonal monsoons. Interactive UI sliders allow live modification of wind speed, wind direction, current speed, and current direction. |
| **Spatiotemporal AIS Correlation** | **REAL** | Great-circle Haversine distance calculations, temporal window bounding, trajectory alignment dot products, and trajectory interpolation (`backend/services/correlation_engine.py`). |
| **Behavioral Anomaly Detectors** | **REAL** | Algorithmic detection of AIS transponder blackouts ($>45$ min), abrupt transit decelerations ($\ge 4.0$ kts), loitering patterns, and route deviations (`backend/services/behavior_analyzer.py`). |
| **AIS Data Feeds** | **SIMULATED** | Scenario AIS transponder tracks are realistic synthetic maritime traffic streams generated from genuine vessel dimensions, MMSIs, and tanker routes. Built to guarantee repeatable, offline, deterministic demo evaluation. |
| **Transparent Suspicion Scoring Engine** | **REAL** | Deterministic, audited mathematical formula ($0.40S + 0.25T + 0.20R + 0.15B$) with $0-100$ component normalization, structured JSON evidence generation, and natural-language reasoning generation (`backend/services/scoring_engine.py`). |
| **MapLibre Maritime GIS Workstation** | **REAL** | WebGL-accelerated client (`frontend/src/components/map/MapWorkspace.tsx`) rendering GeoJSON polygons, particle point clouds, vector paths, interactive layer toggles, and offline naval grid fallbacks. |
| **Investigation Replay Engine** | **REAL** | Synchronized 9-step timeline scrubber replaying historical analysis sequence with contextual technical guidance. |
| **FastAPI REST API & Database** | **REAL / LOCAL** | Production-structured Python 3.11 asynchronous API with Pydantic v2 schemas, geodetic input bounds validation, payload limits, and SQLite database running in concurrent WAL mode. |
| **Copernicus CDSE Sentinel-1 Client** | **INTEGRATION-READY** | Pre-architected REST/OData client interfaces (`backend/services/providers/satellite/`) ready to ingest live Sentinel-1 Level-1 GRD imagery upon provision of an ESA API key. |
| **DGLL / National AIS Stream Client** | **INTEGRATION-READY** | Ingestion pipeline (`backend/services/providers/ais/ingestion.py`) engineered with modular provider abstractions capable of switching from local replay to live NMEA-0183 TCP streams or Spire Global REST APIs. |
| **INCOIS / NOAA Ocean Current Client** | **INTEGRATION-READY** | Hydrodynamic grid interface ready to parse OpenDAP / NetCDF-4 ocean surface velocity grids from INCOIS or NOAA GFS. |

---

## 2. Technical & Scientific Limitations

### 2.1 Satellite SAR Imagery Limitations
1. **Look-Alikes & False Positives**:
   - Natural biogenic slicks (produced by algal blooms or phytoplankton decay), low wind speed zones ($<2\text{ m/s}$ where specular reflection occurs on water regardless of oil), and rain cells can mimic oil slick dark formations on C-band SAR.
   - *Mitigation in HACKX*: Future integration of multi-spectral optical imagery (Sentinel-2 MSI, Sentinel-3 OLCI) and wind speed thresholds ($>3\text{ m/s}$) to filter out low-wind calm sea false positives.
2. **Satellite Revisit Frequency**:
   - Sentinel-1 operates on a 6-day to 12-day revisit schedule over specific maritime corridors. A discharge occurring immediately after a pass may disperse significantly before the next observation.
   - *Operational Context*: System is designed for retrospective incident investigation and forensic attribution, not continuous instantaneous real-time alarms.

### 2.2 Hydrodynamic Drift Modeling Assumptions
1. **Current Field Resolution**:
   - The demo drift engine assumes locally homogeneous current and wind vectors across the immediate simulation bounds ($50 \times 50\text{ km}$).
   - *Production Pathway*: Full spatial interpolation using 2D bilinear or bicubic interpolation over high-resolution ($1/12^{\circ}$ or $\sim 9\text{ km}$) Copernicus Marine Environment Monitoring Service (CMEMS) or INCOIS hydrodynamic models.
2. **Oil Weathering Processes**:
   - The current model calculates physical advection and turbulent diffusion. Chemical weathering processes (evaporation of volatile fractions, emulsification/mousse formation, photo-oxidation, and natural biodegradation) are not currently modeled in the particle decay equations.
   - *Impact*: Slick volume estimates decrease over time in reality, whereas HACKX focuses on geometric centroid tracking for source identification.

### 2.3 AIS Coverage & Transponder Manipulation
1. **Terrestrial vs. Satellite AIS**:
   - Terrestrial AIS receivers (DGLL coastal network) have a line-of-sight horizon of approximately $25-40\text{ nautical miles}$. Beyond this zone (e.g., deep Arabian Sea or international waters), Satellite AIS (S-AIS) is required, which exhibits higher packet collision rates and message latency.
2. **Malicious Spoofing**:
   - Sophisticated rogue actors may spoof AIS GNSS coordinates or broadcast incorrect MMSI identifiers. HACKX currently flags AIS gaps and velocity discrepancies but does not perform radio-frequency RF fingerprinting or satellite optical cross-referencing to verify physical vessel identity.

---

## 3. Ethical, Legal & Non-Accusatory Boundaries

1. **Non-Accusatory Classification**:
   - In compliance with maritime law and administrative justice principles, HACKX outputs **correlation indices** and **investigation priorities**.
   - HACKX **never** labels a vessel a "culprit" or declares legal guilt.
   - Outputs are strictly framed as: *"Potential source vessel requiring investigation"*, *"High correlation"*, or *"Priority for maritime inspection"*.
2. **Human-in-the-Loop Requirement**:
   - HACKX is an **Investigative Decision-Support Tool** for the Indian Coast Guard (ICG) and Directorate General of Shipping (DGS).
   - Legal prosecution under the Merchant Shipping Act, 1958 or MARPOL 73/78 requires:
     - On-board physical inspection of oily water separator (OWS) records and oil record books (ORB).
     - Physical oil sampling and gas chromatography-mass spectrometry (GC-MS) hydrocarbon fingerprint matching between the slick and the vessel's bilge tanks.

---

## 4. Hardware & Operational Boundaries

1. **Local Workstation Footprint**:
   - The current demo build is optimized for standard developer and workstation laptops (16GB RAM, modern multi-core CPU, optional CUDA GPU).
   - U-Net inference runs seamlessly on CPU via optimized PyTorch tensor routines ($<300\text{ ms}$ for $512 \times 512$ SAR tiles).
2. **Storage Limits**:
   - SQLite WAL database is tuned for responsive local demonstrator performance ($<100\text{ MB}$ footprint). For nationwide continuous historical tracking over years, PostgreSQL with PostGIS extension and TimescaleDB hypertables is recommended.
