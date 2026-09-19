# HACKX Multi-Modal Data Pipeline

This document outlines the multi-modal data fusion pipeline that ingests Earth Observation imagery, physics model outputs, and maritime radio telemetry.

---

## 1. Satellite Imagery Ingestion (SAR & EO)
- **Primary Source**: Copernicus Open Access Hub (Sentinel-1 C-SAR Instrument).
  - Mode: Interferometric Wide Swath (IW), Level-1 Ground Range Detected (GRD).
  - Polarisation: VV (Vertical transmit, Vertical receive) - optimal for sea surface roughness and oil damping contrast.
- **Secondary Source**: Sentinel-2 Multi-Spectral Instrument (MSI) Level-2A.
  - Bands: B02, B03, B04 (True Color RGB) + B08 (NIR) for sun-glint verification.
- **Processing Steps**:
  1. Orbit state vector application.
  2. Thermal noise removal.
  3. Radiometric calibration to sigma0 backscatter coefficient in decibels (dB).
  4. Speckle filtering (7x7 Lee filter) to suppress sea clutter.
  5. Adaptive thresholding and deep U-Net semantic segmentation.

---

## 2. Drift Modeling & Lagrangian Tracking
- **Physics Framework**: OpenDrift Lagrangian particle trajectory formulation.
- **Environmental Forcing**:
  - Surface Wind (10m U/V components): NOAA Global Forecast System (GFS) 0.25 deg grid.
  - Ocean Surface Current (U/V surface velocity): Copernicus Marine Service (CMEMS) / HyCOM.
- **Governing Equations**:
  $$\vec{V}_{particle}(t) = \vec{V}_{current}(t) + c_{wind} \cdot \vec{V}_{wind}(t) + \vec{V'}_{diffusion}$$
  - $c_{wind} \approx 0.03$ (standard 3% wind drag parameter).
  - Hindcast: Run step $\Delta t < 0$ backward from satellite acquisition time $t_{sat}$ to $t_{sat} - T$ (typically 24h to 48h).
  - Output: Spatiotemporal probability density of the spill release origin $(X_{origin}, Y_{origin}, T_{origin})$.

---

## 3. AIS Telemetry Ingestion & Correlation
- **Telemetry Sources**: Terrestrial & Satellite AIS (Spire / ExactEarth / AISHub NMEA 0183 & AIVDM sentences).
- **Core Parameters**: MMSI, Timestamp, Latitude, Longitude, SOG (Speed Over Ground), COG (Course Over Ground), Navigational Status, IMO, Vessel Type.
- **Correlation Logic**:
  1. Geographic bounding query around hindcast release envelope with uncertainty buffer.
  2. Temporal window matching $(T_{origin} \pm 2\text{ hours})$.
  3. Vessel route reconstruction via spline interpolation.
  4. Anomaly detection:
     - Identification of "dark vessel" periods (transmission gap $> 1.5$ hours inside transit lanes).
     - Sudden speed reductions ($> 40\%$ drop below typical cruising speed) without port or pilot station proximity.

---

## 4. Attribution & Evidence Generation
- Calculates the composite suspicion score for all vessels intersecting the corridor.
- Ranks candidate vessels and compiles evidence points:
  - Geographic plot of satellite slick footprint.
  - Backward drift trail with time markers.
  - AIS track overlay demonstrating the intersection point.
  - Speed profile graph indicating the deceleration window.
  - Anomaly log document ready for Coast Guard port interception.
