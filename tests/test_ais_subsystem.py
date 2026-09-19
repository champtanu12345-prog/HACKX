"""Unit and integration tests for the AIS Processing Subsystem."""

import pytest
from datetime import datetime, timezone

from backend.services.providers.ais.models import (
    NormalizedAisPosition,
    CandidateVesselCorrelation,
)
from backend.services.providers.ais.ingestion import AISIngestionParser
from backend.services.providers.ais import LocalAISProvider, DemoAISProvider
from backend.services.behavior_analyzer import behavior_analyzer
from backend.services.correlation_engine import correlation_engine, haversine_distance_nm
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_normalized_ais_position_fields():
    """Verify normalized AIS position model requires all standardized fields."""
    pos = NormalizedAisPosition(
        mmsi="477892100",
        vessel_name="MT ARABIAN STAR",
        imo="9234567",
        timestamp=datetime(2026, 9, 14, 18, 45, 0, tzinfo=timezone.utc),
        latitude=19.3950,
        longitude=71.2180,
        speed=14.8,
        course=195.0,
        heading=194.0,
        navigation_status="Under way using engine",
    )

    assert pos.mmsi == "477892100"
    assert pos.vessel_name == "MT ARABIAN STAR"
    assert pos.speed == 14.8
    assert pos.course == 195.0
    assert pos.heading == 194.0
    assert pos.navigation_status == "Under way using engine"


def test_ais_csv_ingestion():
    """Verify ingestion of raw CSV telemetry streams."""
    csv_data = """mmsi,shipname,imo,time,lat,lon,sog,cog,heading,status
477892100,MT ARABIAN STAR,9234567,2026-09-14 18:00:00,19.450,71.180,14.5,195.0,195.0,Under way using engine
477892100,MT ARABIAN STAR,9234567,2026-09-14 18:30:00,19.395,71.218,3.2,140.0,138.0,Under way using engine
"""
    parser = AISIngestionParser()
    positions = parser.parse_csv(csv_data)

    assert len(positions) == 2
    assert positions[0].mmsi == "477892100"
    assert positions[0].vessel_name == "MT ARABIAN STAR"
    assert positions[1].speed == 3.2
    assert positions[1].course == 140.0


def test_ais_json_ingestion():
    """Verify ingestion of structured JSON telemetry payloads."""
    json_data = [
        {
            "mmsi": "351234000",
            "vessel_name": "OCEAN VOYAGER",
            "timestamp": "2026-09-14T12:00:00Z",
            "latitude": 15.420,
            "longitude": 73.180,
            "speed": 16.2,
            "course": 340.0,
            "heading": 339.0,
            "navigation_status": "Under way using engine",
        }
    ]
    parser = AISIngestionParser()
    positions = parser.parse_json(json_data)

    assert len(positions) == 1
    assert positions[0].mmsi == "351234000"
    assert positions[0].vessel_name == "OCEAN VOYAGER"
    assert positions[0].speed == 16.2


def test_behavioral_anomaly_detection():
    """Verify detection of AIS gaps, sudden speed reductions, course alterations, and loitering."""
    # Simulate track with:
    # 1. AIS Gap (3.0 hours between t1 and t2)
    # 2. Speed drop (14.5 kn to 3.0 kn)
    # 3. Course change (195 deg to 140 deg = 55 deg change)
    # 4. Loitering (speed < 3.5 for 2.0 hours)
    track = [
        {"timestamp": "2026-09-14T14:00:00Z", "latitude": 19.60, "longitude": 71.10, "sog": 14.5, "cog": 195.0},
        {"timestamp": "2026-09-14T17:00:00Z", "latitude": 19.40, "longitude": 71.21, "sog": 3.0, "cog": 140.0},
        {"timestamp": "2026-09-14T19:00:00Z", "latitude": 19.38, "longitude": 71.22, "sog": 2.5, "cog": 135.0},
    ]

    anomalies = behavior_analyzer.analyze_vessel_trajectory(track)
    types = [a.anomaly_type for a in anomalies]

    assert "AIS_GAP" in types
    assert "SUDDEN_SPEED_DROP" in types
    assert "UNUSUAL_COURSE_CHANGE" in types
    assert "LOITERING" in types


def test_correlation_engine_and_non_accusatory_language():
    """Verify spatiotemporal correlation and compliance with non-accusatory legal standards."""
    provider = DemoAISProvider()
    vessels_a = provider.get_vessels_for_scenario("scenario_a")

    source_lat, source_lon = 19.040, 72.330
    source_time = datetime(2026, 9, 13, 19, 30, 0)

    candidates = correlation_engine.correlate_vessels(
        vessels=vessels_a,
        source_lat=source_lat,
        source_lon=source_lon,
        source_time=source_time,
        search_radius_nm=30.0,
        time_window_hours=12.0,
    )

    assert len(candidates) > 0
    top_candidate = candidates[0]
    assert top_candidate.mmsi == "419000123"  # MT ARABIAN STAR
    assert top_candidate.spatial_distance_nm < 2.0  # Within 2 NM (exact 0.0)
    assert top_candidate.correlation_score >= 80.0

    # Verify strictly non-accusatory language
    forbidden_words = ["guilty", "offender", "responsible", "criminal", "convicted"]
    for word in forbidden_words:
        assert word not in top_candidate.correlation_category.lower(), f"Forbidden accusatory term '{word}' found"

    assert "potential source vessel" in top_candidate.correlation_category.lower() or "requires investigation" in top_candidate.correlation_category.lower()


def test_vessel_api_endpoints():
    """Verify /api/v1/vessels, /{id}, and /nearby endpoints."""
    # 1. List vessels
    res_list = client.get("/api/v1/vessels")
    assert res_list.status_code == 200
    vessels = res_list.json()
    assert len(vessels) > 0

    # 2. Get specific vessel by MMSI
    mmsi = "419000123"
    res_detail = client.get(f"/api/v1/vessels/{mmsi}")
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["mmsi"] == mmsi
    assert "name" in detail

    # 3. Correlate nearby vessels
    res_nearby = client.get("/api/v1/vessels/nearby?scenario_id=scenario_a")
    assert res_nearby.status_code == 200
    candidates = res_nearby.json()
    assert len(candidates) > 0
    assert candidates[0]["mmsi"] == "419000123"
    assert "spatial_distance_nm" in candidates[0]
    assert "temporal_difference_hours" in candidates[0]
    assert "correlation_category" in candidates[0]

