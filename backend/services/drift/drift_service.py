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
        wind_speed_knots: float = 15.0,
        wind_direction_deg: float = 240.0,
        current_speed_knots: float = 0.8,
        current_direction_deg: float = 40.0,
        wind_factor: float = 0.03,
        current_factor: float = 1.0,
        engine_type: str = "lagrangian",
        **kwargs: Any,
    ) -> DriftSimulationResult:
        """Executes a simulation using the chosen engine."""
        engine = self.get_engine(engine_type)

        if run_type.upper() == "HINDCAST":
            return engine.run_hindcast(
                spill_lat=spill_lat,
                spill_lon=spill_lon,
                observation_time=observation_time,
                duration_hours=duration_hours,
                timestep_minutes=timestep_minutes,
                wind_speed_knots=wind_speed_knots,
                wind_direction_deg=wind_direction_deg,
                current_speed_knots=current_speed_knots,
                current_direction_deg=current_direction_deg,
                wind_factor=wind_factor,
                current_factor=current_factor,
                **kwargs,
            )
        else:
            return engine.run_forecast(
                spill_lat=spill_lat,
                spill_lon=spill_lon,
                observation_time=observation_time,
                duration_hours=duration_hours,
                timestep_minutes=timestep_minutes,
                wind_speed_knots=wind_speed_knots,
                wind_direction_deg=wind_direction_deg,
                current_speed_knots=current_speed_knots,
                current_direction_deg=current_direction_deg,
                wind_factor=wind_factor,
                current_factor=current_factor,
                **kwargs,
            )

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
    ) -> DriftSimulationResult:
        """Simulates drift using scenario baseline, allowing interactive environmental overrides."""
        scenario = DEMO_SCENARIOS_DATA.get(scenario_id.lower())
        if not scenario:
            scenario = DEMO_SCENARIOS_DATA["scenario_a"]

        spill = scenario.get("spill_detection") or scenario.get("spill")
        env = scenario["environment"]

        obs_time = datetime.fromisoformat(spill["detection_time"].replace("Z", "+00:00"))

        w_speed = wind_speed_knots if wind_speed_knots is not None else env["wind_speed_knots"]
        w_dir = wind_direction_deg if wind_direction_deg is not None else env["wind_direction_deg"]
        c_speed = current_speed_knots if current_speed_knots is not None else env["current_speed_knots"]
        c_dir = current_direction_deg if current_direction_deg is not None else env["current_direction_deg"]

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
