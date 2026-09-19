"""Tests for End-to-End Investigation Orchestration and Reopening API."""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_analyze_investigation_scenario_a():
    """Verify that POST /api/v1/investigations/analyze executes full 14-stage pipeline."""
    payload = {
        "scenario_id": "scenario_a",
        "model_mode": "demo",
        "save_to_db": True,
    }
    response = client.post("/api/v1/investigations/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify root fields
    assert "id" in data
    assert "case_number" in data
    assert data["case_number"] == "INV-2026-MUM-041"
    assert data["scenario_id"] == "scenario_a"
    assert "status" in data
    assert "lead_agency" in data

    # 1. Spill
    assert "spill" in data
    assert data["spill"]["area_sqkm"] > 0
    assert "centroid" in data["spill"]
    assert len(data["spill"]["centroid"]) == 2

    # 2. Drift
    assert "drift" in data
    assert len(data["drift"]["hindcast_points"]) > 0
    assert len(data["drift"]["forecast_points"]) > 0

    # 3. Source
    assert "source" in data
    assert "coords" in data["source"]
    assert "timestamp" in data["source"]
    assert len(data["source"]["coords"]) == 2

    # 4. AIS Candidates
    assert "ais_candidates" in data
    assert len(data["ais_candidates"]) >= 1
    top_cand = data["ais_candidates"][0]
    assert top_cand["rank"] == 1
    assert top_cand["mmsi"] == "419000123"
    assert top_cand["vessel_name"] == "MT ARABIAN STAR"
    assert top_cand["correlation_score"] >= 90.0

    # 5. Vessel Scores
    assert "vessel_scores" in data
    assert "419000123" in data["vessel_scores"]
    star_scores = data["vessel_scores"]["419000123"]
    assert "overall_score" in star_scores
    assert "spatial_score" in star_scores
    assert "temporal_score" in star_scores
    assert "trajectory_score" in star_scores
    assert "behavior_score" in star_scores

    # 6. Evidence
    assert "evidence" in data
    assert "419000123" in data["evidence"]
    star_ev = data["evidence"]["419000123"]
    assert len(star_ev["structured_evidence"]) > 0
    assert len(star_ev["human_explanations"]) > 0

    # 7. Timeline
    assert "timeline" in data
    stages = [event["stage"] for event in data["timeline"]]
    assert "SATELLITE_OBSERVATION" in stages
    assert "SPILL_DETECTION" in stages
    assert "DRIFT_HINDCAST" in stages
    assert "AIS_CORRELATION" in stages
    assert "INVESTIGATION_READY" in stages

    # 8. Timestamps
    assert "timestamps" in data
    assert "satellite_observation_time" in data["timestamps"]
    assert "estimated_release_time" in data["timestamps"]
    assert "analysis_completed_at" in data["timestamps"]


def test_get_investigation_by_id_and_case_number():
    """Verify that GET /api/v1/investigations/{id} reopens the full investigation dossier."""
    # Test with case number
    res_case = client.get("/api/v1/investigations/INV-2026-MUM-041")
    assert res_case.status_code == 200
    data_case = res_case.json()
    assert data_case["case_number"] == "INV-2026-MUM-041"
    assert "spill" in data_case
    assert "drift" in data_case
    assert "source" in data_case
    assert "ais_candidates" in data_case
    assert len(data_case["ais_candidates"]) > 0

    # Test with ID
    res_id = client.get(f"/api/v1/investigations/{data_case['id']}")
    assert res_id.status_code == 200
    assert res_id.json()["id"] == data_case["id"]


def test_analyze_investigation_scenario_b_and_c():
    """Verify that scenarios B and C complete properly with ranked candidates."""
    for s_id in ["scenario_b", "scenario_c"]:
        res = client.post("/api/v1/investigations/analyze", json={"scenario_id": s_id})
        assert res.status_code == 200
        data = res.json()
        assert data["scenario_id"] == s_id
        assert len(data["ais_candidates"]) > 0
        assert len(data["timeline"]) > 0
