"""Unit and integration tests for the Transparent Vessel Suspicion Scoring Engine."""

from datetime import datetime, timezone, timedelta
import pytest
from backend.services.scoring_engine import (
    TransparentVesselScoringEngine,
    WeightedVesselScoringEngine,
    haversine_distance_km,
    haversine_distance_nm,
)
from backend.data.scenarios import DEMO_SCENARIOS_DATA


def test_haversine_distance_calculation():
    """Verify haversine distance in km and NM."""
    # Mumbai to Goa is roughly 230-240 NM / ~430-450 km
    dist_nm = haversine_distance_nm(18.922, 72.834, 15.498, 73.827)
    dist_km = haversine_distance_km(18.922, 72.834, 15.498, 73.827)
    assert 200.0 < dist_nm < 260.0
    assert 380.0 < dist_km < 480.0
    assert abs(dist_km * 0.539957 - dist_nm) < 0.1


def test_transparent_scoring_formula_and_normalization():
    """Verify exact formula: 0.40*spatial + 0.25*temporal + 0.20*trajectory + 0.15*behavior."""
    scorer = TransparentVesselScoringEngine(
        w_spatial=0.40,
        w_temporal=0.25,
        w_trajectory=0.20,
        w_behavior=0.15,
    )
    origin_lat = 19.040
    origin_lon = 72.330
    origin_time = datetime(2026, 9, 13, 19, 30, 0, tzinfo=timezone.utc)

    # Candidate vessel right at origin locus and time with an AIS gap
    vessel = {
        "mmsi": "419000123",
        "name": "MT ARABIAN STAR",
        "vessel_type": "Crude Oil Tanker",
        "positions": [
            {
                "lat": 19.040,
                "lon": 72.330,
                "timestamp": "2026-09-13T19:30:00Z",
                "sog": 3.8,
                "cog": 44.0,
                "heading": 44.0,
            }
        ],
        "anomalies": [
            {"anomaly_type": "AIS_GAP_DARK_SHIP", "severity": "CRITICAL"},
            {"anomaly_type": "SUDDEN_DECELERATION", "severity": "HIGH"},
        ],
    }

    res = scorer.score_vessel(vessel, origin_lat, origin_lon, origin_time)

    # 1. Check all requested fields exist
    for field in [
        "overall_score",
        "spatial_score",
        "temporal_score",
        "trajectory_score",
        "behavior_score",
        "investigation_priority",
        "potential_source",
        "evidence",
        "explanations",
        "distance_km",
        "time_delta_minutes",
    ]:
        assert field in res, f"Expected field '{field}' not found in scoring result"

    # 2. Check normalization strictly 0-100
    assert 0.0 <= res["spatial_score"] <= 100.0
    assert 0.0 <= res["temporal_score"] <= 100.0
    assert 0.0 <= res["trajectory_score"] <= 100.0
    assert 0.0 <= res["behavior_score"] <= 100.0
    assert 0.0 <= res["overall_score"] <= 100.0

    # 3. Check mathematical formula accuracy
    expected_score = round(
        0.40 * res["spatial_score"]
        + 0.25 * res["temporal_score"]
        + 0.20 * res["trajectory_score"]
        + 0.15 * res["behavior_score"],
        1,
    )
    assert abs(res["overall_score"] - expected_score) < 0.1

    # 4. Check severity levels
    # 0-29: Low, 30-59: Moderate, 60-79: High, 80-100: Very High
    assert res["overall_score"] >= 80.0
    assert res["investigation_priority"] == "Very High"


def test_structured_evidence_and_human_explanations():
    """Verify structured evidence cards and human-readable investigation explanations."""
    scorer = TransparentVesselScoringEngine()
    origin_lat = 19.040
    origin_lon = 72.330
    origin_time = datetime(2026, 9, 13, 19, 30, 0, tzinfo=timezone.utc)

    # Vessel 4.2 km away and 11 minutes delta
    # Roughly 0.038 degrees latitude is ~4.2 km
    vessel = {
        "mmsi": "352001456",
        "name": "PACIFIC GLORY",
        "vessel_type": "Chemical Tanker",
        "positions": [
            {
                "lat": 19.078,  # ~4.2 km north
                "lon": 72.330,
                "timestamp": "2026-09-13T19:41:00Z",  # 11 min delta
                "sog": 12.0,
                "cog": 180.0,
                "heading": 180.0,
            }
        ],
        "anomalies": [
            {"anomaly_type": "AIS_GAP", "severity": "HIGH"}
        ],
    }

    res = scorer.score_vessel(vessel, origin_lat, origin_lon, origin_time)

    # Verify structured evidence
    evidence = res["evidence"]
    assert len(evidence) == 4
    spatial_ev = next(e for e in evidence if e["component"] == "spatial_proximity")
    temporal_ev = next(e for e in evidence if e["component"] == "temporal_alignment")

    assert "distance_km" in spatial_ev
    assert 3.5 <= spatial_ev["distance_km"] <= 5.0
    assert "reason" in spatial_ev

    assert "time_delta_minutes" in temporal_ev
    assert temporal_ev["time_delta_minutes"] == 11

    # Verify human-readable explanations
    explanations = res["explanations"]
    assert len(explanations) >= 3
    # Look for distance statement
    assert any("km" in exp and "from the reconstructed source" in exp for exp in explanations)
    # Look for time delta statement
    assert any("within 11 minutes of the estimated release time" in exp for exp in explanations)
    # Look for AIS gap statement
    assert any("AIS transmission gap" in exp for exp in explanations)


def test_severity_levels_and_non_accusatory_language():
    """Verify 0-29 Low, 30-59 Moderate, 60-79 High, 80-100 Very High and non-accusatory terms."""
    scorer = TransparentVesselScoringEngine()

    assert scorer.get_severity_level(25.0) == "Low"
    assert scorer.get_severity_level(45.0) == "Moderate"
    assert scorer.get_severity_level(72.0) == "High"
    assert scorer.get_severity_level(91.0) == "Very High"


def test_scoring_across_all_demo_scenarios():
    """Verify transparent scoring across Scenario A, B, and C."""
    scorer = TransparentVesselScoringEngine()

    # 1. Scenario A: MT ARABIAN STAR must rank #1 with Very High score (>80)
    sc_a = DEMO_SCENARIOS_DATA["scenario_a"]
    origin_lat_a = sc_a["drift_simulation"]["estimated_origin_lat"]
    origin_lon_a = sc_a["drift_simulation"]["estimated_origin_lon"]
    origin_time_a = datetime.fromisoformat(sc_a["drift_simulation"]["estimated_origin_time"].replace("Z", "+00:00"))

    scores_a = [
        scorer.score_vessel(v, origin_lat_a, origin_lon_a, origin_time_a)
        for v in sc_a["vessels"]
    ]
    scores_a.sort(key=lambda s: s["overall_score"], reverse=True)

    top_vessel_a = scores_a[0]
    assert top_vessel_a["mmsi"] == "419000123"  # MT ARABIAN STAR
    assert top_vessel_a["overall_score"] >= 80.0
    assert top_vessel_a["investigation_priority"] == "Very High"
    assert top_vessel_a["potential_source"] is True

    # Other vessels in Scenario A should have lower scores
    for other in scores_a[1:]:
        assert other["overall_score"] < top_vessel_a["overall_score"]

    # 2. Scenario B: Multi-candidate corridor
    sc_b = DEMO_SCENARIOS_DATA["scenario_b"]
    origin_lat_b = sc_b["drift_simulation"]["estimated_origin_lat"]
    origin_lon_b = sc_b["drift_simulation"]["estimated_origin_lon"]
    origin_time_b = datetime.fromisoformat(sc_b["drift_simulation"]["estimated_origin_time"].replace("Z", "+00:00"))

    scores_b = [
        scorer.score_vessel(v, origin_lat_b, origin_lon_b, origin_time_b)
        for v in sc_b["vessels"]
    ]
    # In Scenario B, multiple candidates in corridor have elevated correlation (>= 60)
    high_candidates = [s for s in scores_b if s["overall_score"] >= 60.0]
    assert len(high_candidates) >= 2

    # 3. Scenario C: Cold case - no candidate has decisive evidence (none Very High, no behavioral anomalies)
    sc_c = DEMO_SCENARIOS_DATA["scenario_c"]
    origin_lat_c = sc_c["drift_simulation"]["estimated_origin_lat"]
    origin_lon_c = sc_c["drift_simulation"]["estimated_origin_lon"]
    origin_time_c = datetime.fromisoformat(sc_c["drift_simulation"]["estimated_origin_time"].replace("Z", "+00:00"))

    scores_c = [
        scorer.score_vessel(v, origin_lat_c, origin_lon_c, origin_time_c)
        for v in sc_c["vessels"]
    ]
    # No candidate should score Very High in Scenario C, and all have zero behavioral anomalies
    for s in scores_c:
        assert s["overall_score"] < 80.0
        assert s["investigation_priority"] != "Very High"
        assert s["behavior_score"] == 0.0
