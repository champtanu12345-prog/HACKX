"""Abstract Base Class and data models for Oil Spill Drift Modeling."""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field


class DriftTrajectoryPoint(BaseModel):
    """Discrete trajectory waypoint for a drifting oil particle/centroid."""
    timestamp: datetime = Field(..., description="Timestamp in UTC")
    latitude: float = Field(..., description="WGS84 latitude coordinate")
    longitude: float = Field(..., description="WGS84 longitude coordinate")
    particle_id: int = Field(0, description="Particle identifier")
    velocity: float = Field(..., description="Drift velocity magnitude in knots")
    direction: float = Field(..., description="Drift velocity direction in compass degrees (0-360)")
    uncertainty_radius_m: float = Field(300.0, description="Uncertainty radius in meters")
    timestep_index: int = Field(0, description="Chronological or sequential step index")


class DriftSimulationResult(BaseModel):
    """Structured output from a drift modeling simulation (Hindcast or Forecast)."""
    run_type: str = Field(..., description="'HINDCAST' (backward) or 'FORECAST' (forward)")
    model_source: str = Field(..., description="Engine name and version")
    start_time: datetime = Field(..., description="Simulation reference start time")
    end_time: datetime = Field(..., description="Simulation terminal time")
    duration_hours: float = Field(..., description="Total duration modeled in hours")
    trajectory_points: List[DriftTrajectoryPoint] = Field(..., description="Computed trajectory waypoints")
    estimated_origin_coords: Optional[Tuple[float, float]] = Field(
        None, description="Estimated discharge source (lat, lon) for hindcast"
    )
    estimated_origin_time: Optional[datetime] = Field(
        None, description="Estimated discharge timestamp for hindcast"
    )
    confidence_score: float = Field(0.90, ge=0.0, le=1.0, description="Attribution / drift confidence")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Simulation input coefficients")


class DriftEngine(ABC):
    """Abstract interface for Lagrangian Oil Particle Drift Simulation."""

    @abstractmethod
    def run_hindcast(
        self,
        spill_lat: float,
        spill_lon: float,
        observation_time: datetime,
        duration_hours: float,
        timestep_minutes: int = 60,
        wind_speed_knots: float = 15.0,
        wind_direction_deg: float = 240.0,
        current_speed_knots: float = 0.8,
        current_direction_deg: float = 40.0,
        wind_factor: float = 0.03,
        wind_deflection_deg: float = 0.0,
        current_factor: float = 1.0,
        **kwargs: Any,
    ) -> DriftSimulationResult:
        """Runs reverse-time trajectory hindcasting to estimate spill origin."""
        pass

    @abstractmethod
    def run_forecast(
        self,
        spill_lat: float,
        spill_lon: float,
        observation_time: datetime,
        duration_hours: float,
        timestep_minutes: int = 60,
        wind_speed_knots: float = 15.0,
        wind_direction_deg: float = 240.0,
        current_speed_knots: float = 0.8,
        current_direction_deg: float = 40.0,
        wind_factor: float = 0.03,
        wind_deflection_deg: float = 0.0,
        current_factor: float = 1.0,
        **kwargs: Any,
    ) -> DriftSimulationResult:
        """Runs forward-time trajectory forecasting to predict future slick movement."""
        pass
