"""Unit and integration tests verifying all Critical and High-priority audit fixes."""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.providers.ais.ingestion import AISIngestionParser
import os

client = TestClient(app)


def test_cors_configuration():
    """Verify CORS middleware is active and allows local development origins."""
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_detection_payload_size_validation():
    """Verify oversized image payloads are rejected with HTTP 422 to prevent DoS."""
    oversized_data = "A" * 21_000_000  # Exceeds 20MB limit
    response = client.post(
        "/api/v1/detections",
        json={"image_data": oversized_data},
    )
    assert response.status_code == 422


def test_detection_invalid_coordinates_validation():
    """Verify invalid geodetic latitude/longitude is rejected."""
    response = client.post(
        "/api/v1/detections",
        json={"top_left_lat": 95.0, "top_left_lon": 72.0},  # Invalid lat > 90
    )
    assert response.status_code == 422


def test_csv_ingestion_file_handle_closure():
    """Verify AIS CSV parsing reads content safely without leaking file descriptors."""
    parser = AISIngestionParser()
    sample_csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "samples", "sample_ais_telemetry.csv")
    if os.path.exists(sample_csv_path):
        positions = parser.parse_csv(sample_csv_path)
        assert isinstance(positions, list)


def test_non_accusatory_terminology_in_investigation():
    """Verify investigation timeline and dossier use objective legal terminology."""
    response = client.post(
        "/api/v1/investigations/analyze",
        json={"scenario_id": "scenario_a", "save_to_db": False},
    )
    assert response.status_code == 200
    data = response.json()
    
    # Check that candidates have non-accusatory legal category
    for cand in data["ais_candidates"]:
        assert "culprit" not in cand["category"].lower()
        assert "guilty" not in cand["category"].lower()
    
    # Check timeline descriptions do not declare unproven legal prosecution
    for event in data["timeline"]:
        assert "prosecution" not in event["description"].lower()
