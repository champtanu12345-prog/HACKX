from datetime import datetime, timedelta
from backend.services.providers.satellite import MockSatelliteProvider
from backend.services.providers.ais import MockAISProvider
from backend.services.providers.weather import MockWeatherProvider
from backend.services.providers.ocean import MockOceanCurrentProvider
from backend.services.drift_engine import LagrangianDriftEngine


def test_satellite_provider():
    provider = MockSatelliteProvider()
    scenes = provider.search_scenes(
        bbox=[71.0, 18.0, 73.5, 20.0],
        start_time=datetime.utcnow() - timedelta(days=2),
        end_time=datetime.utcnow(),
    )
    assert len(scenes) > 0
    scene = scenes[0]
    assert "scene_id" in scene
    assert scene["sensor_type"] == "SAR"


def test_ais_provider():
    provider = MockAISProvider()
    vessels = provider.query_vessels_in_corridor(
        bbox=[71.0, 18.0, 73.0, 20.0],
        start_time=datetime.utcnow() - timedelta(days=1),
        end_time=datetime.utcnow(),
    )
    assert len(vessels) > 0
    first_vessel = vessels[0]
    assert "mmsi" in first_vessel
    assert len(first_vessel["positions"]) > 0

    track = provider.get_vessel_track(
        mmsi=first_vessel["mmsi"],
        start_time=datetime.utcnow() - timedelta(days=1),
        end_time=datetime.utcnow(),
    )
    assert len(track) > 0


def test_environmental_providers():
    weather = MockWeatherProvider()
    u_w, v_w = weather.get_surface_wind(19.0, 72.0, datetime.utcnow())
    assert isinstance(u_w, float) and isinstance(v_w, float)

    ocean = MockOceanCurrentProvider()
    u_c, v_c = ocean.get_surface_current(19.0, 72.0, datetime.utcnow())
    assert isinstance(u_c, float) and isinstance(v_c, float)


def test_lagrangian_drift_simulation():
    engine = LagrangianDriftEngine()
    sim = engine.run_simulation(
        start_lat=19.10,
        start_lon=72.35,
        start_time=datetime.utcnow(),
        duration_hours=10.0,
        run_type="HINDCAST",
        particle_count=50,
    )
    assert sim["run_type"] == "HINDCAST"
    assert "estimated_origin_lat" in sim
    assert "estimated_origin_lon" in sim
    assert len(sim["trajectory_points"]) == 11
    # Check that uncertainty radius expands over time
    first_pt = sim["trajectory_points"][0]
    last_pt = sim["trajectory_points"][-1]
    assert last_pt["uncertainty_radius_m"] > first_pt["uncertainty_radius_m"]
