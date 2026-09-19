# HACKX REST API Specification

Version: **v1**  
Base Path: `/api/v1`

---

## 1. System Endpoints

### `GET /api/v1/health`
Returns system health, database connectivity status, and registered provider health.
- **Response 200**:
  ```json
  {
    "status": "operational",
    "version": "1.0.0",
    "database": "connected",
    "providers": {
      "satellite": "ready",
      "ais": "ready",
      "weather": "ready",
      "ocean_current": "ready"
    }
  }
  ```

---

## 2. Oil Spill Detections

### `GET /api/v1/spills`
Retrieve detected oil slicks with optional query filters.
- **Query Parameters**:
  - `min_confidence` (float, default 0.5)
  - `start_date` (ISO8601 string)
  - `end_date` (ISO8601 string)
  - `limit` (int, default 50)
- **Response 200**: List of `SpillDetectionResponse` objects with GeoJSON geometries, area, perimeter, and confidence score.

### `GET /api/v1/spills/{id}`
Retrieve complete detail of a specific detected spill including its parent satellite observation and geometry metadata.

---

## 3. Drift Hindcasting & Forecasting

### `POST /api/v1/spills/{id}/drift`
Execute or trigger a Lagrangian particle drift simulation.
- **Request Body**:
  ```json
  {
    "run_type": "HINDCAST",
    "duration_hours": 24,
    "particle_count": 250,
    "wind_factor": 0.03
  }
  ```
- **Response 200**:
  ```json
  {
    "drift_run_id": "dr_9f8e21a",
    "run_type": "HINDCAST",
    "estimated_origin_coords": [72.451, 18.912],
    "estimated_origin_time": "2026-09-13T22:00:00Z",
    "trajectory_points": [ ... ]
  }
  ```

---

## 4. Vessel Tracking & Suspicion Scoring

### `GET /api/v1/spills/{id}/suspects`
Execute the AIS correlation and attribution engine to retrieve scored suspect vessels.
- **Response 200**:
  ```json
  {
    "spill_id": "spill_001",
    "suspects": [
      {
        "vessel_id": "vsl_728",
        "mmsi": "419000123",
        "name": "MT ARABIAN STAR",
        "vessel_type": "Crude Oil Tanker",
        "flag_country": "Liberia",
        "suspicion_score": 94.2,
        "rank": 1,
        "factors": {
          "proximity_score": 96.0,
          "trajectory_alignment": 90.5,
          "speed_anomaly_score": 95.0,
          "ais_gap_penalty": 95.0
        },
        "anomalies": [
          "AIS transponder disabled for 2.8 hrs within 5nm of origin point",
          "Speed dropped from 14.1 kn to 3.8 kn at 2026-09-13T22:15:00Z"
        ]
      }
    ]
  }
  ```

### `GET /api/v1/vessels/{mmsi}/track`
Retrieve historical AIS trajectory and anomaly flags for a specific vessel.

---

## 5. Case Investigations & Enforcement

### `GET /api/v1/investigations`
List all formal investigation dossiers.

### `POST /api/v1/investigations`
Create or update a legal enforcement dossier ready for Coast Guard escalation.
- **Request Body**:
  ```json
  {
    "spill_id": "spill_001",
    "primary_suspect_mmsi": "419000123",
    "status": "ESCALATED_TO_COAST_GUARD",
    "summary_notes": "Evidence shows deliberate bilge purge with dark-ship maneuver 18nm off Mumbai High."
  }
  ```
