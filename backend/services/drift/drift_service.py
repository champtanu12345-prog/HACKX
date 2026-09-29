"""Backend Drift Service.

Orchestrates Lagrangian numerical drift modeling, hindcasting, and forecasting
with environmental providers (NOAA GFS wind and CMEMS current) and scenario data.
"""

from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from ml.drift.base import DriftSimulationResult
from ml.drift.lagrangian import LagrangianDriftSimulator
from ml.drift.opendrift_adapter import OpenDriftAdapter
from backend.models.drift import DriftRun, TrajectoryPoint
from backend.models.spill import SpillDetection
from backend.data.scenarios import DEMO_SCENARIOS_DATA


class DriftService:
    """Coordinates oil spill drift runs across models and database persistence."""

    def __init__(self):
        self.lagrangian_engine = LagrangianDriftSimulator()
        self.opendrift_engine = OpenDriftAdapter(fallback_simulator=self.lagrangian_engine)

    def get_engine(self, engine_type: str = "lagrangian"):
        """Returns requested simulation engine ('lagrangian' or 'opendrift')."""
        if engine_type.lower() == "opendrift":
            return self.opendrift_engine
        return self.lagrangian_engine

    def simulate(
        self,
        spill_lat: float,
        spill_lon: float,
        observation_time: datetime,
        run_type: str = "HINDCAST",
        duration_hours: float = 12.0,
        timestep_minutes: int = 60,
        wind_speed_knots: Optional[float] = None,
        wind_direction_deg: Optional[float] = None,
        current_speed_knots: Optional[float] = None,
        current_direction_deg: Optional[float] = None,
        wind_factor: float = 0.03,
        current_factor: float = 1.0,
        engine_type: str = "lagrangian",
        use_live_weather: bool = False,
        **kwargs: Any,
    ) -> DriftSimulationResult:
        """Executes a simulation using the chosen engine, resolving live Open-Meteo data when needed."""
        ocean_meta: Dict[str, Any] = {}
        weather_meta: Dict[str, Any] = {}

        # If live weather requested or parameters omitted, query live Open-Meteo providers
        if (
            use_live_weather
            or wind_speed_knots is None
            or wind_direction_deg is None
            or current_speed_knots is None
            or current_direction_deg is None
        ):
            from backend.services.providers.ocean import OpenMeteoMarineCurrentProvider
            from backend.services.providers.weather import OpenMeteoWeatherProvider

            marine_prov = OpenMeteoMarineCurrentProvider()
            weather_prov = OpenMeteoWeatherProvider()

            if use_live_weather or current_speed_knots is None or current_direction_deg is None:
                marine_cond = marine_prov.get_marine_conditions(spill_lat, spill_lon, observation_time)
                ocean_meta = marine_cond
                if use_live_weather or current_speed_knots is None:
                    current_speed_knots = marine_cond.get("current_speed_knots", 0.8)
                if use_live_weather or current_direction_deg is None:
                    current_direction_deg = marine_cond.get("current_direction_deg", 40.0)

            if use_live_weather or wind_speed_knots is None or wind_direction_deg is None:
                wind_cond = weather_prov.get_wind_conditions(spill_lat, spill_lon, observation_time)
                weather_meta = wind_cond
                if use_live_weather or wind_speed_knots is None:
                    wind_speed_knots = wind_cond.get("wind_speed_knots", 15.0)
                if use_live_weather or wind_direction_deg is None:
                    wind_direction_deg = wind_cond.get("wind_direction_deg", 240.0)

        # Fallback safety defaults
        final_wind_speed = wind_speed_knots if wind_speed_knots is not None else 15.0
        final_wind_dir = wind_direction_deg if wind_direction_deg is not None else 240.0
        final_curr_speed = current_speed_knots if current_speed_knots is not None else 0.8
        final_curr_dir = current_direction_deg if current_direction_deg is not None else 40.0

        engine = self.get_engine(engine_type)

        if run_type.upper() == "HINDCAST":
            result = engine.run_hindcast(
                spill_lat=spill_lat,
                spill_lon=spill_lon,
                observation_time=observation_time,
                duration_hours=duration_hours,
                timestep_minutes=timestep_minutes,
                wind_speed_knots=final_wind_speed,
                wind_direction_deg=final_wind_dir,
                current_speed_knots=final_curr_speed,
                current_direction_deg=final_curr_dir,
                wind_factor=wind_factor,
                current_factor=current_factor,
                **kwargs,
            )
        else:
            result = engine.run_forecast(
                spill_lat=spill_lat,
                spill_lon=spill_lon,
                observation_time=observation_time,
                duration_hours=duration_hours,
                timestep_minutes=timestep_minutes,
                wind_speed_knots=final_wind_speed,
                wind_direction_deg=final_wind_dir,
                current_speed_knots=final_curr_speed,
                current_direction_deg=final_curr_dir,
                wind_factor=wind_factor,
                current_factor=current_factor,
                **kwargs,
            )

        if ocean_meta:
            result.parameters["ocean_metadata"] = ocean_meta
        if weather_meta:
            result.parameters["weather_metadata"] = weather_meta
        result.parameters["is_live_environmental_data"] = bool(
            ocean_meta.get("is_live", False) and weather_meta.get("is_live", False)
        )

        # Attach coastal vulnerability & shoreline impact analysis for forward projections
        if run_type.upper() == "FORECAST":
            try:
                from backend.services.coastal_vulnerability import coastal_vulnerability_engine
                pts_dict = [
                    {
                        "latitude": pt.latitude,
                        "longitude": pt.longitude,
                        "timestamp": pt.timestamp,
                        "timestep_index": pt.timestep_index,
                    }
                    for pt in result.trajectory_points
                ]
                result.parameters["coastal_vulnerability"] = coastal_vulnerability_engine.analyze_forecast_threat(pts_dict)
            except Exception as cv_err:
                result.parameters["coastal_vulnerability_error"] = str(cv_err)

        return result

    def simulate_for_scenario(
        self,
        scenario_id: str,
        run_type: str = "HINDCAST",
        duration_hours: float = 12.0,
        timestep_minutes: int = 60,
        engine_type: str = "lagrangian",
        wind_speed_knots: Optional[float] = None,
        wind_direction_deg: Optional[float] = None,
        current_speed_knots: Optional[float] = None,
        current_direction_deg: Optional[float] = None,
        use_live_weather: bool = False,
        **kwargs: Any,
    ) -> DriftSimulationResult:
        """Simulates drift using scenario baseline, allowing interactive environmental overrides or live Open-Meteo data."""
        scenario = DEMO_SCENARIOS_DATA.get(scenario_id.lower())
        if not scenario:
            scenario = DEMO_SCENARIOS_DATA["scenario_a"]

        spill = scenario.get("spill_detection") or scenario.get("spill")
        env = scenario["environment"]

        obs_time = datetime.fromisoformat(spill["detection_time"].replace("Z", "+00:00"))

        if not use_live_weather:
            w_speed = wind_speed_knots if wind_speed_knots is not None else env["wind_speed_knots"]
            w_dir = wind_direction_deg if wind_direction_deg is not None else env["wind_direction_deg"]
            c_speed = current_speed_knots if current_speed_knots is not None else env["current_speed_knots"]
            c_dir = current_direction_deg if current_direction_deg is not None else env["current_direction_deg"]
        else:
            w_speed = wind_speed_knots
            w_dir = wind_direction_deg
            c_speed = current_speed_knots
            c_dir = current_direction_deg

        return self.simulate(
            spill_lat=spill["centroid_lat"],
            spill_lon=spill["centroid_lon"],
            observation_time=obs_time,
            run_type=run_type,
            duration_hours=duration_hours,
            timestep_minutes=timestep_minutes,
            wind_speed_knots=w_speed,
            wind_direction_deg=w_dir,
            current_speed_knots=c_speed,
            current_direction_deg=c_dir,
            engine_type=engine_type,
            use_live_weather=use_live_weather,
            **kwargs,
        )

    def persist_drift_run(
        self,
        db: Session,
        spill: SpillDetection,
        result: DriftSimulationResult,
    ) -> DriftRun:
        """Stores simulation result in SQLite/PostgreSQL database."""
        origin_lat = result.estimated_origin_coords[0] if result.estimated_origin_coords else spill.centroid_lat
        origin_lon = result.estimated_origin_coords[1] if result.estimated_origin_coords else spill.centroid_lon
        origin_time = result.estimated_origin_time or result.start_time

        drift_run = DriftRun(
            spill_id=spill.id,
            run_type=result.run_type,
            simulation_start_time=result.start_time,
            simulation_end_time=result.end_time,
            duration_hours=result.duration_hours,
            particle_count=1,
            estimated_origin_lat=origin_lat,
            estimated_origin_lon=origin_lon,
            estimated_origin_time=origin_time,
            status="COMPLETED",
        )
        db.add(drift_run)
        db.flush()

        for pt in result.trajectory_points:
            t_pt = TrajectoryPoint(
                drift_run_id=drift_run.id,
                timestep_utc=pt.timestamp,
                latitude=pt.latitude,
                longitude=pt.longitude,
                uncertainty_radius_m=pt.uncertainty_radius_m,
                particle_index=pt.timestep_index,
            )
            db.add(t_pt)

        db.commit()
        db.refresh(drift_run)
        return drift_run


drift_service = DriftService()
