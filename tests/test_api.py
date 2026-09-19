from datetime import datetime
import json


def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["operational", "degraded"]
    assert "providers" in data
    assert data["providers"]["satellite_sar"] == "ready"


def test_spill_lifecycle(client):
    # 1. Create a spill
    spill_payload = {
        "detection_time": datetime.utcnow().isoformat(),
        "geometry_geojson": json.dumps({
            "type": "Polygon",
            "coordinates": [[[72.2, 19.1], [72.3, 19.1], [72.3, 19.2], [72.2, 19.2], [72.2, 19.1]]]
        }),
        "centroid_lat": 19.15,
        "centroid_lon": 72.25,
        "area_sqkm": 8.5,
        "perimeter_km": 14.2,
        "estimated_volume_m3": 210.0,
        "estimated_age_hours": 10.0,
        "confidence_score": 0.92,
        "region_name": "Arabian Sea - Mumbai High"
    }
    create_res = client.post("/api/v1/spills", json=spill_payload)
    assert create_res.status_code == 201
    spill = create_res.json()
    spill_id = spill["id"]
    assert spill["area_sqkm"] == 8.5

    # 2. Retrieve spill by ID
    get_res = client.get(f"/api/v1/spills/{spill_id}")
    assert get_res.status_code == 200
    assert get_res.json()["region_name"] == "Arabian Sea - Mumbai High"

    # 3. List spills
    list_res = client.get("/api/v1/spills")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 4. Check summary
    summary_res = client.get("/api/v1/spills/summary")
    assert summary_res.status_code == 200
    assert summary_res.json()["total_spills"] >= 1


def test_drift_and_suspects_endpoint(client):
    # Create spill
    spill_payload = {
        "detection_time": datetime.utcnow().isoformat(),
        "geometry_geojson": json.dumps({
            "type": "Polygon",
            "coordinates": [[[72.3, 19.1], [72.4, 19.1], [72.4, 19.2], [72.3, 19.2], [72.3, 19.1]]]
        }),
        "centroid_lat": 19.15,
        "centroid_lon": 72.35,
        "area_sqkm": 12.0,
        "perimeter_km": 20.0,
        "confidence_score": 0.95,
        "region_name": "Offshore Mumbai"
    }
    spill = client.post("/api/v1/spills", json=spill_payload).json()
    spill_id = spill["id"]

    # Execute drift simulation
    drift_payload = {
        "run_type": "HINDCAST",
        "duration_hours": 12.0,
        "particle_count": 50,
        "wind_factor": 0.03
    }
    drift_res = client.post(f"/api/v1/spills/{spill_id}/drift", json=drift_payload)
    assert drift_res.status_code == 200
    drift_data = drift_res.json()
    assert drift_data["run_type"] == "HINDCAST"
    assert len(drift_data["trajectory_points"]) >= 12

    # Query suspect attribution
    suspects_res = client.get(f"/api/v1/spills/{spill_id}/suspects")
    assert suspects_res.status_code == 200
    suspects_data = suspects_res.json()
    assert "suspects" in suspects_data
    assert len(suspects_data["suspects"]) > 0
    top_suspect = suspects_data["suspects"][0]
    assert top_suspect["rank"] == 1
    assert "composite_score" in top_suspect


def test_investigations_lifecycle(client):
    # Create a spill
    spill_payload = {
        "detection_time": datetime.utcnow().isoformat(),
        "geometry_geojson": json.dumps({"type": "Polygon", "coordinates": [[[72, 19], [73, 19], [73, 20], [72, 20], [72, 19]]]}),
        "centroid_lat": 19.5,
        "centroid_lon": 72.5,
        "area_sqkm": 5.0,
        "perimeter_km": 10.0,
        "confidence_score": 0.88,
        "region_name": "Western Coastal Zone"
    }
    spill = client.post("/api/v1/spills", json=spill_payload).json()

    # Create investigation
    inv_payload = {
        "spill_id": spill["id"],
        "case_number": "INV-TEST-001",
        "status": "OPEN",
        "lead_agency": "Indian Coast Guard",
        "summary_notes": "Initial alert logged for Western Coastal Zone."
    }
    create_res = client.post("/api/v1/investigations", json=inv_payload)
    assert create_res.status_code == 201
    inv = create_res.json()
    assert inv["case_number"] == "INV-TEST-001"

    # Update investigation
    update_res = client.patch(
        f"/api/v1/investigations/{inv['id']}",
        json={"status": "ESCALATED_TO_COAST_GUARD", "summary_notes": "Updated with suspect attribution evidence."}
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "ESCALATED_TO_COAST_GUARD"
