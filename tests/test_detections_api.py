"""API integration tests for /api/v1/detections endpoints."""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_list_detections():
    """Verify listing available detections."""
    response = client.get("/api/v1/detections")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3


def test_post_detection_scenario_a():
    """Verify running detection on Scenario A via POST."""
    response = client.post(
        "/api/v1/detections",
        json={"scenario_id": "scenario_a", "mode": "demo"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["mode"] == "demo"
    assert data["area_sqkm"] == 14.85
    assert data["confidence"] == 0.942
    assert data["original_image"] is not None
    assert data["mask_image"] is not None
    assert data["overlay_image"] is not None
    assert data["polygon"] is not None

    # Test retrieval by ID
    det_id = data["detection_id"]
    get_res = client.get(f"/api/v1/detections/{det_id}")
    assert get_res.status_code == 200
    assert get_res.json()["detection_id"] == det_id


def test_get_detection_scenario_alias():
    """Verify retrieving detection by scenario alias."""
    response = client.get("/api/v1/detections/scenario_b")
    assert response.status_code == 200
    data = response.json()
    assert data["area_sqkm"] == 8.40
    assert data["confidence"] == 0.860


def test_post_detection_trained_missing_weights():
    """Verify trained mode properly returns 404 when checkpoint weights are absent."""
    response = client.post(
        "/api/v1/detections",
        json={"image_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "mode": "trained"},
    )
    assert response.status_code == 404
    assert "Trained model checkpoint not found" in response.json()["detail"]
