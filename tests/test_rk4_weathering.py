"""Automated unit tests for Runge-Kutta 4th Order (RK4) drift numerical integration

and NOAA ADIOS / Mackay empirical oil weathering kinetics.
"""

from datetime import datetime, timezone, timedelta
import pytest

from backend.services.oil_weathering import ADIOSOilWeatheringEngine, OilWeatheringState
from backend.services.drift_engine import LagrangianDriftEngine
from ml.drift.lagrangian import LagrangianDriftSimulator


def test_adios_oil_weathering_kinetics():
    """Verify physicochemical weathering: evaporation, emulsification, and Mooney viscosity surge."""
    engine = ADIOSOilWeatheringEngine(
        initial_volume_m3=62.37,
        initial_density_kg_m3=885.0,
        initial_viscosity_cst=48.0,
        max_water_content=0.75,
        sea_temp_celsius=28.0,
    )

    # 1. Fresh discharge (T = 0)
    w0: OilWeatheringState = engine.compute_state(0.0, wind_speed_ms=6.2)
    assert w0.age_hours == 0.0
    assert w0.evaporated_percentage == 0.0
    assert w0.water_content_percentage == 0.0
    assert w0.dynamic_viscosity_cst == 48.0
    assert w0.weathering_stage == "FRESH_DISCHARGE"
    assert w0.volume_remaining_mt > 50.0

    # 2. Weathered slick (T = 18 hours - typical Sentinel-1 detection window)
    w18: OilWeatheringState = engine.compute_state(18.0, wind_speed_ms=6.2)
    assert w18.age_hours == 18.0
    assert 25.0 <= w18.evaporated_percentage <= 50.0
    assert 35.0 <= w18.water_content_percentage <= 75.0
    # Viscosity increases by orders of magnitude (mousse)
    assert w18.dynamic_viscosity_cst > 800.0
    assert w18.weathering_stage in ["WATER_IN_OIL_MOUSSE", "HIGHLY_VISCOUS_EMULSION"]

    # 3. Weathering curve generation
    curve = engine.generate_weathering_curve(total_hours=24.0, step_hours=2.0)
    assert len(curve) == 13  # 0 to 24h inclusive
    # Viscosity and water content must be monotonically non-decreasing
    for i in range(len(curve) - 1):
        assert curve[i + 1].water_content_percentage >= curve[i].water_content_percentage
        assert curve[i + 1].dynamic_viscosity_cst >= curve[i].dynamic_viscosity_cst


def test_rk4_vs_euler_drift_engine():
    """Verify LagrangianDriftEngine with RK4 numerical integration and weathering tracking."""
    engine = LagrangianDriftEngine()
    t0 = datetime(2026, 9, 15, 6, 0, 0, tzinfo=timezone.utc)

    # Run with RK4
    sim_rk4 = engine.run_simulation(
        start_lat=19.10,
        start_lon=72.35,
        start_time=t0,
        duration_hours=12.0,
        run_type="HINDCAST",
        particle_count=40,
        integration_method="rk4",
    )

    # Run with Euler
    sim_euler = engine.run_simulation(
        start_lat=19.10,
        start_lon=72.35,
        start_time=t0,
        duration_hours=12.0,
        run_type="HINDCAST",
        particle_count=40,
        integration_method="euler",
    )

    assert sim_rk4["integration_method"] == "RK4"
    assert sim_euler["integration_method"] == "EULER"

    # Both produce 13 points (T0 + 12 hourly steps)
    assert len(sim_rk4["trajectory_points"]) == 13
    assert len(sim_euler["trajectory_points"]) == 13

    # Check weathering presence in RK4 points
    p0 = sim_rk4["trajectory_points"][0]
    p_last = sim_rk4["trajectory_points"][-1]

    # At observation T0 (oldest age), slick has experienced evaporation
    assert p0["evaporated_percentage"] > 20.0
    assert p0["water_content_percentage"] > 25.0
    assert p0["viscosity_cst"] > 300.0

    # At reconstructed origin (oldest step in hindcast), slick is fresh release
    assert p_last["evaporated_percentage"] == 0.0
    assert p_last["water_content_percentage"] == 0.0
    assert p_last["weathering_stage"] == "FRESH_DISCHARGE"

    # Weathering summary must be present
    assert "weathering_summary" in sim_rk4
    summary = sim_rk4["weathering_summary"]
    assert summary["weathering_stage"] == "FRESH_DISCHARGE"


def test_lagrangian_simulator_rk4_and_weathering():
    """Verify ML LagrangianDriftSimulator calculates RK4 advection and populates DriftTrajectoryPoint weathering."""
    simulator = LagrangianDriftSimulator(default_integration_method="rk4")
    t0 = datetime(2026, 9, 15, 6, 0, 0, tzinfo=timezone.utc)

    res = simulator.run_hindcast(
        spill_lat=18.95,
        spill_lon=72.40,
        observation_time=t0,
        duration_hours=8.0,
        timestep_minutes=60,
        wind_speed_knots=14.0,
        wind_direction_deg=250.0,
        current_speed_knots=0.9,
        current_direction_deg=35.0,
        integration_method="rk4",
    )

    assert res.run_type == "HINDCAST"
    assert "RK4" in res.parameters["integration_method"]
    assert len(res.trajectory_points) == 9  # T0 + 8 steps

    # Check waypoint weathering attributes
    obs_pt = res.trajectory_points[0]
    origin_pt = res.trajectory_points[-1]

    assert obs_pt.evaporated_percentage is not None
    assert obs_pt.evaporated_percentage > 20.0
    assert obs_pt.water_content_percentage is not None
    assert obs_pt.viscosity_cst is not None

    # Origin waypoint is freshly discharged
    assert origin_pt.evaporated_percentage == 0.0
    assert origin_pt.weathering_stage == "FRESH_DISCHARGE"


def test_baoac_volume_and_sar_look_alike():
    """Verify international BAOAC volume calculation, SAR look-alike assessment, and age inversion."""
    from backend.services.oil_weathering import (
        compute_baoac_volume,
        evaluate_sar_look_alike,
        estimate_slick_age,
    )

    # 1. BAOAC Volume Calculation
    baoac = compute_baoac_volume(area_sqkm=12.5, predominant_code=4)
    assert baoac["area_sqkm"] == 12.5
    assert baoac["predominant_code"] == 4
    assert baoac["nominal_volume_m3"] > 0
    assert baoac["nominal_mass_mt"] > 0
    assert baoac["min_volume_m3"] < baoac["nominal_volume_m3"] < baoac["max_volume_m3"]

    # 2. SAR Look-Alike Wind Gating Test
    # Calm wind (<2.5 m/s) should trigger Look-Alike flag
    calm_eval = evaluate_sar_look_alike(surface_wind_ms=1.2, dark_spot_contrast=0.85)
    assert calm_eval["verdict"] == "POSSIBLE_LOOK_ALIKE"
    assert calm_eval["look_alike_probability_pct"] > 50.0
    assert calm_eval["is_reliable_for_attribution"] is False

    # Optimal wind (6.5 m/s) confirms petroleum damping
    optimal_eval = evaluate_sar_look_alike(surface_wind_ms=6.5, dark_spot_contrast=0.88, perimeter_km=14.0, area_sqkm=8.0)
    assert optimal_eval["verdict"] == "CONFIRMED_MINERAL_OIL"
    assert optimal_eval["confidence_score"] > 80.0
    assert optimal_eval["is_reliable_for_attribution"] is True

    # 3. Slick Age Inversion
    age_inv = estimate_slick_age(evaporated_percentage=32.0, water_content_percentage=45.0, viscosity_cst=1250.0, wind_speed_ms=6.0)
    assert "estimated_age_hours" in age_inv
    assert age_inv["estimated_age_hours"] > 0.0
    assert "uncertainty_margin_hours" in age_inv


def test_coastal_vulnerability_engine():
    """Verify CoastalVulnerabilityEngine detects shoreline beachfall and sensitive marine zones."""
    from backend.services.coastal_vulnerability import CoastalVulnerabilityEngine

    engine = CoastalVulnerabilityEngine()
    # Waypoints heading toward Mumbai / JNPT coast
    t0 = datetime(2026, 9, 15, 6, 0, 0, tzinfo=timezone.utc)
    trajectory = [
        {"latitude": 18.90, "longitude": 72.30, "timestep_utc": t0, "timestep_index": 0},
        {"latitude": 18.92, "longitude": 72.50, "timestep_utc": t0 + timedelta(hours=3), "timestep_index": 1},
        {"latitude": 18.95, "longitude": 72.82, "timestep_utc": t0 + timedelta(hours=6), "timestep_index": 2}, # Hits Mumbai Harbour / JNPT zone (<18km radius)
    ]

    threat = engine.analyze_forecast_threat(trajectory, slick_area_sqkm=10.0)
    assert threat["threat_level"] in ["CRITICAL", "HIGH", "MODERATE"]
    assert threat["closest_shoreline_approach_km"] < 10.0
    assert threat["containment_guidance"]["recommended_boom_length_m"] > 1000
    assert len(threat["threatened_marine_protected_areas"]) > 0

