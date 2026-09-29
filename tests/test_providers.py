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


def test_open_meteo_marine_provider():
    from backend.services.providers.ocean import (
        OpenMeteoMarineCurrentProvider,
        CopernicusMarineProvider,
        get_ocean_provider,
    )

    provider = OpenMeteoMarineCurrentProvider()
    now_dt = datetime.utcnow()
    # Test marine conditions
    cond = provider.get_marine_conditions(18.9, 72.6, now_dt)
    assert "source" in cond
    assert "current_speed_knots" in cond
    assert "current_direction_deg" in cond
    assert "wave_height_m" in cond
    assert isinstance(cond["is_live"], bool)

    # Test surface current velocity vector
    u, v = provider.get_surface_current(18.9, 72.6, now_dt)
    assert isinstance(u, float)
    assert isinstance(v, float)

    # Test fallback mechanism for invalid endpoint or inland coordinates
    provider_fallback = OpenMeteoMarineCurrentProvider(timeout_seconds=0.001)
    provider_fallback.BASE_URL = "https://invalid-host-marine-test.local/v1/marine"
    fb_cond = provider_fallback.get_marine_conditions(18.9, 72.6, now_dt)
    assert fb_cond["is_live"] is False
    assert "Fallback" in fb_cond["source"]

    # Test factory
    live_p = get_ocean_provider(use_live=True)
    assert isinstance(live_p, OpenMeteoMarineCurrentProvider)
    mock_p = get_ocean_provider(use_live=False)
    assert isinstance(mock_p, MockOceanCurrentProvider)

    # Test CopernicusMarineProvider wrapper
    copernicus = CopernicusMarineProvider()
    c_cond = copernicus.get_marine_conditions(18.9, 72.6, now_dt)
    assert "current_speed_knots" in c_cond


def test_open_meteo_weather_provider():
    from backend.services.providers.weather import (
        OpenMeteoWeatherProvider,
        NOAAWeatherProvider,
        get_weather_provider,
    )

    provider = OpenMeteoWeatherProvider()
    now_dt = datetime.utcnow()
    # Test wind conditions
    cond = provider.get_wind_conditions(18.9, 72.6, now_dt)
    assert "source" in cond
    assert "wind_speed_knots" in cond
    assert "wind_direction_deg" in cond
    assert "wind_gusts_ms" in cond
    assert isinstance(cond["is_live"], bool)

    # Test surface wind velocity vector
    u_w, v_w = provider.get_surface_wind(18.9, 72.6, now_dt)
    assert isinstance(u_w, float)
    assert isinstance(v_w, float)

    # Test fallback mechanism
    provider_fallback = OpenMeteoWeatherProvider(timeout_seconds=0.001)
    provider_fallback.BASE_URL = "https://invalid-host-weather-test.local/v1/forecast"
    fb_cond = provider_fallback.get_wind_conditions(18.9, 72.6, now_dt)
    assert fb_cond["is_live"] is False
    assert "Fallback" in fb_cond["source"]

    # Test factory
    live_w = get_weather_provider(use_live=True)
    assert isinstance(live_w, OpenMeteoWeatherProvider)
    mock_w = get_weather_provider(use_live=False)
    assert isinstance(mock_w, MockWeatherProvider)

    # Test NOAAWeatherProvider wrapper
    noaa = NOAAWeatherProvider()
    n_cond = noaa.get_wind_conditions(18.9, 72.6, now_dt)
    assert "wind_speed_knots" in n_cond


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

