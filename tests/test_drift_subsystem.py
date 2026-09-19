"""Automated unit and integration tests for the Drift Modeling Subsystem."""

import pytest
from datetime import datetime, timezone
import math

from ml.drift.base import DriftSimulationResult, DriftTrajectoryPoint
from ml.drift.lagrangian import LagrangianDriftSimulator
from ml.drift.opendrift_adapter import OpenDriftAdapter
from backend.services.drift.drift_service import drift_service
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_lagrangian_hindcast_time_and_coordinates():
    """Verify hindcast moves backward in time and computes coherent geographic advection."""
    simulator = LagrangianDriftSimulator()
    t0 = datetime(2026, 9, 15, 6, 0, 0, tzinfo=timezone.utc)
    spill_lat, spill_lon = 19.3950, 71.2180

    # Strong wind from SW (240 deg), Current towards NE (45 deg)
    res = simulator.run_hindcast(
        spill_lat=spill_lat,
        spill_lon=spill_lon,
        observation_time=t0,
        duration_hours=6.0,
        timestep_minutes=60,
        wind_speed_knots=18.0,
        wind_direction_deg=240.0,
        current_speed_knots=1.0,
        current_direction_deg=45.0,
    )

    assert isinstance(res, DriftSimulationResult)
    assert res.run_type == "HINDCAST"
    assert len(res.trajectory_points) == 7  # T0 + 6 hourly steps

    # 1. Verify reverse time direction
    for i in range(len(res.trajectory_points) - 1):
        pt_curr = res.trajectory_points[i]
        pt_next = res.trajectory_points[i + 1]
        assert pt_next.timestamp < pt_curr.timestamp, "Hindcast timestamps must step strictly backwards in time"

    # 2. Verify fields present
    first_pt = res.trajectory_points[0]
    assert first_pt.latitude == spill_lat
    assert first_pt.longitude == spill_lon
    assert first_pt.velocity > 0.0
    assert 0.0 <= first_pt.direction <= 360.0
    assert first_pt.particle_id == 1

    # 3. Estimated origin verification
    assert res.estimated_origin_coords is not None
    assert res.estimated_origin_time is not None
    assert res.estimated_origin_time == res.trajectory_points[-1].timestamp
    # In SW wind and NE current, oil drifted towards NE, so origin must be to the SW (smaller lat, smaller lon)
    assert res.estimated_origin_coords[0] < spill_lat
    assert res.estimated_origin_coords[1] < spill_lon


def test_lagrangian_forecast_time_and_coordinates():
    """Verify forecast moves forward in time with growing uncertainty."""
    simulator = LagrangianDriftSimulator()
    t0 = datetime(2026, 9, 15, 6, 0, 0, tzinfo=timezone.utc)
    spill_lat, spill_lon = 15.4200, 73.1800

    res = simulator.run_forecast(
        spill_lat=spill_lat,
        spill_lon=spill_lon,
        observation_time=t0,
        duration_hours=8.0,
        timestep_minutes=60,
        wind_speed_knots=12.0,
        wind_direction_deg=280.0,
        current_speed_knots=0.7,
        current_direction_deg=350.0,
    )

    assert res.run_type == "FORECAST"
    assert len(res.trajectory_points) == 9  # T0 + 8 steps

    # Verify forward time direction
    for i in range(len(res.trajectory_points) - 1):
        pt_curr = res.trajectory_points[i]
        pt_next = res.trajectory_points[i + 1]
        assert pt_next.timestamp > pt_curr.timestamp, "Forecast timestamps must step forward in time"
        assert pt_next.uncertainty_radius_m > pt_curr.uncertainty_radius_m, "Uncertainty cone must expand over time"


def test_opendrift_adapter_interface():
    """Verify OpenDrift adapter conforms to DriftEngine contract and provides fallback."""
    adapter = OpenDriftAdapter()
    t0 = datetime(2026, 9, 15, 6, 0, 0, tzinfo=timezone.utc)

    hindcast_res = adapter.run_hindcast(
        spill_lat=20.9100,
        spill_lon=72.0300,
        observation_time=t0,
        duration_hours=4.0,
    )
    assert isinstance(hindcast_res, DriftSimulationResult)
    assert "OpenDrift" in hindcast_res.model_source

    forecast_res = adapter.run_forecast(
        spill_lat=20.9100,
        spill_lon=72.0300,
        observation_time=t0,
        duration_hours=4.0,
    )
    assert isinstance(forecast_res, DriftSimulationResult)
    assert "OpenDrift" in forecast_res.model_source


def test_drift_service_for_all_scenarios():
    """Verify drift simulations across all three demo scenarios (A, B, C)."""
    for s_id in ["scenario_a", "scenario_b", "scenario_c"]:
        # Test Hindcast
        h_res = drift_service.simulate_for_scenario(scenario_id=s_id, run_type="HINDCAST", duration_hours=6.0)
        assert h_res.run_type == "HINDCAST"
        assert len(h_res.trajectory_points) > 0
        assert h_res.estimated_origin_coords is not None

        # Test Forecast
        f_res = drift_service.simulate_for_scenario(scenario_id=s_id, run_type="FORECAST", duration_hours=6.0)
        assert f_res.run_type == "FORECAST"
        assert len(f_res.trajectory_points) > 0


def test_api_simulate_endpoint():
    """Verify POST /api/v1/drift/simulate integration."""
    # 1. Preset scenario simulation
    resp = client.post(
        "/api/v1/drift/simulate",
        json={"scenario_id": "scenario_a", "run_type": "HINDCAST", "duration_hours": 6.0},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["run_type"] == "HINDCAST"
    assert "Deterministic Lagrangian" in data["model_source"]
    assert len(data["trajectory_points"]) == 7
    assert data["estimated_origin_coords"] is not None

    # 2. Custom coordinates forecast
    resp_custom = client.post(
        "/api/v1/drift/simulate",
        json={
            "spill_lat": 18.5,
            "spill_lon": 72.5,
            "run_type": "FORECAST",
            "duration_hours": 4.0,
            "wind_speed_knots": 15.0,
            "wind_direction_deg": 220.0,
            "current_speed_knots": 0.8,
            "current_direction_deg": 40.0,
        },
    )
    assert resp_custom.status_code == 200
    custom_data = resp_custom.json()
    assert custom_data["run_type"] == "FORECAST"
    assert len(custom_data["trajectory_points"]) == 5
