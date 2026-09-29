"""Pydantic schemas for Drift Modeling and Trajectory Simulation."""

from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from pydantic import BaseModel, ConfigDict, Field


class TrajectoryPointBase(BaseModel):
    timestep_utc: datetime
    latitude: float
    longitude: float
    uncertainty_radius_m: Optional[float] = 500.0
    wind_speed_ms: Optional[float] = None
    current_speed_ms: Optional[float] = None
    particle_index: Optional[int] = 0


class TrajectoryPointResponse(TrajectoryPointBase):
    id: str
    drift_run_id: str

    model_config = ConfigDict(from_attributes=True)


class DriftRunCreate(BaseModel):
    run_type: str = "HINDCAST"  # "HINDCAST" or "FORECAST"
    duration_hours: float = 24.0
    particle_count: int = 150
    wind_factor: float = 0.03


class DriftRunResponse(BaseModel):
    id: str
    spill_id: str
    run_type: str
    simulation_start_time: datetime
    simulation_end_time: datetime
    duration_hours: float
    particle_count: int
    estimated_origin_lat: Optional[float] = None
    estimated_origin_lon: Optional[float] = None
    estimated_origin_time: Optional[datetime] = None
    status: str
    trajectory_points: List[TrajectoryPointResponse] = []

    model_config = ConfigDict(from_attributes=True)


class DriftSimulationRequest(BaseModel):
    """Flexible request schema for running standalone or scenario-based drift simulation."""
    scenario_id: Optional[str] = Field(None, description="Preset scenario ID ('scenario_a', 'scenario_b', 'scenario_c')")
    spill_lat: Optional[float] = Field(None, description="Spill centroid latitude")
    spill_lon: Optional[float] = Field(None, description="Spill centroid longitude")
    observation_time: Optional[datetime] = Field(None, description="Observation timestamp in UTC")
    run_type: str = Field("HINDCAST", description="'HINDCAST' (backward) or 'FORECAST' (forward)")
    duration_hours: float = Field(12.0, ge=1.0, le=120.0, description="Duration in hours")
    timestep_minutes: int = Field(60, ge=5, le=180, description="Timestep interval in minutes")
    wind_speed_knots: Optional[float] = Field(None, description="Surface wind speed in knots")
    wind_direction_deg: Optional[float] = Field(None, description="Wind direction in degrees (FROM which it blows)")
    current_speed_knots: Optional[float] = Field(None, description="Ocean current speed in knots")
    current_direction_deg: Optional[float] = Field(None, description="Current direction in degrees (TOWARDS which it flows)")
    engine_type: str = Field("lagrangian", description="'lagrangian' or 'opendrift'")
    integration_method: Optional[str] = Field("rk4", description="'rk4' (Runge-Kutta 4th Order) or 'euler'")
    use_live_weather: Optional[bool] = Field(False, description="Whether to query live Open-Meteo marine and weather data")


class SimulationTrajectoryPoint(BaseModel):
    timestamp: datetime
    latitude: float
    longitude: float
    particle_id: int = 0
    velocity: float
    direction: float
    uncertainty_radius_m: float
    timestep_index: int = 0
    evaporated_percentage: Optional[float] = None
    water_content_percentage: Optional[float] = None
    viscosity_cst: Optional[float] = None
    weathering_stage: Optional[str] = None



class DriftSimulationResponse(BaseModel):
    """Detailed response for drift simulation."""
    run_type: str
    model_source: str
    start_time: datetime
    end_time: datetime
    duration_hours: float
    trajectory_points: List[SimulationTrajectoryPoint]
    estimated_origin_coords: Optional[Tuple[float, float]] = None
    estimated_origin_time: Optional[datetime] = None
    confidence_score: float = 0.90
    parameters: Dict[str, Any] = Field(default_factory=dict)


class LiveMarineConditions(BaseModel):
    source: str
    latitude: float
    longitude: float
    timestamp: str
    current_speed_ms: float
    current_speed_knots: float
    current_direction_deg: float
    u_current_ms: float
    v_current_ms: float
    wave_height_m: float
    wave_direction_deg: float
    wave_period_s: float
    is_live: bool


class LiveWeatherConditions(BaseModel):
    source: str
    latitude: float
    longitude: float
    timestamp: str
    wind_speed_ms: float
    wind_speed_knots: float
    wind_direction_deg: float
    wind_gusts_ms: float
    u_wind_ms: float
    v_wind_ms: float
    is_live: bool


class LiveEnvironmentResponse(BaseModel):
    latitude: float
    longitude: float
    timestamp: str
    marine: LiveMarineConditions
    weather: LiveWeatherConditions

