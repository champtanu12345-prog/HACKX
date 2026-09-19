"""Deterministic Lagrangian Particle Drift Simulator.

Implements vector-based numerical hydrodynamic drift modeling for oil slicks.
Supports forward forecasting and reverse-time origin hindcasting.
"""

import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple

from ml.drift.base import (
    DriftEngine,
    DriftTrajectoryPoint,
    DriftSimulationResult,
)


class LagrangianDriftSimulator(DriftEngine):
    """Deterministic Lagrangian particle advection simulator.
    
    Advection is governed by surface ocean current and wind drag (windage):
    V_drift = C_current * V_current + C_wind * R(theta_deflect) * V_wind
    
    Standard parameters:
    - Current factor: 1.0 (100% surface current)
    - Wind factor: 0.03 (typical 3% leeway for surface hydrocarbons)
    - Wind deflection: 0.0 to 12.0 degrees (Coriolis deflection to the right in NH)
    """

    METERS_PER_DEGREE_LAT = 111320.0
    KNOTS_TO_MS = 0.514444

    def __init__(
        self,
        default_wind_factor: float = 0.03,
        default_current_factor: float = 1.0,
        default_wind_deflection_deg: float = 0.0,
    ):
        self.default_wind_factor = default_wind_factor
        self.default_current_factor = default_current_factor
        self.default_wind_deflection_deg = default_wind_deflection_deg

    def _compute_drift_vector(
        self,
        wind_speed_knots: float,
        wind_direction_deg: float,
        current_speed_knots: float,
        current_direction_deg: float,
        wind_factor: float,
        current_factor: float,
        wind_deflection_deg: float,
    ) -> Tuple[float, float, float, float]:
        """Calculates combined eastward (u) and northward (v) drift velocity in meters/second.
        
        Returns:
            (u_total_ms, v_total_ms, speed_knots, heading_deg)
        """
        # 1. Wind vector: Meteorological convention (direction FROM which wind blows)
        # Vector towards which wind is blowing is (dir + 180) % 360
        wind_towards_rad = math.radians((wind_direction_deg + 180.0) % 360.0)
        # Apply Coriolis deflection angle
        wind_effective_rad = wind_towards_rad + math.radians(wind_deflection_deg)

        wind_speed_ms = wind_speed_knots * self.KNOTS_TO_MS
        u_wind = wind_speed_ms * math.sin(wind_effective_rad)
        v_wind = wind_speed_ms * math.cos(wind_effective_rad)

        # 2. Current vector: Oceanographic convention (direction TOWARDS which water sets)
        current_towards_rad = math.radians(current_direction_deg % 360.0)
        current_speed_ms = current_speed_knots * self.KNOTS_TO_MS
        u_curr = current_speed_ms * math.sin(current_towards_rad)
        v_curr = current_speed_ms * math.cos(current_towards_rad)

        # 3. Combined advective velocity
        u_total_ms = (current_factor * u_curr) + (wind_factor * u_wind)
        v_total_ms = (current_factor * v_curr) + (wind_factor * v_wind)

        total_speed_ms = math.sqrt(u_total_ms**2 + v_total_ms**2)
        total_speed_knots = total_speed_ms / self.KNOTS_TO_MS

        heading_rad = math.atan2(u_total_ms, v_total_ms)
        heading_deg = (math.degrees(heading_rad) + 360.0) % 360.0

        return u_total_ms, v_total_ms, total_speed_knots, heading_deg

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
        wind_factor: Optional[float] = None,
        wind_deflection_deg: Optional[float] = None,
        current_factor: Optional[float] = None,
        particle_id: int = 1,
        **kwargs: Any,
    ) -> DriftSimulationResult:
        """Backtracks spill trajectory into the past to reconstruct probable release origin."""
        w_factor = wind_factor if wind_factor is not None else self.default_wind_factor
        c_factor = current_factor if current_factor is not None else self.default_current_factor
        w_deflect = wind_deflection_deg if wind_deflection_deg is not None else self.default_wind_deflection_deg

        u_ms, v_ms, speed_knots, heading_deg = self._compute_drift_vector(
            wind_speed_knots=wind_speed_knots,
            wind_direction_deg=wind_direction_deg,
            current_speed_knots=current_speed_knots,
            current_direction_deg=current_direction_deg,
            wind_factor=w_factor,
            current_factor=c_factor,
            wind_deflection_deg=w_deflect,
        )

        dt_seconds = timestep_minutes * 60.0
        total_steps = int(max(1, round((duration_hours * 60.0) / timestep_minutes)))

        trajectory_points: List[DriftTrajectoryPoint] = []

        # T0: Initial observation point
        current_lat = spill_lat
        current_lon = spill_lon
        current_time = observation_time

        trajectory_points.append(
            DriftTrajectoryPoint(
                timestamp=current_time,
                latitude=round(current_lat, 5),
                longitude=round(current_lon, 5),
                particle_id=particle_id,
                velocity=round(speed_knots, 2),
                direction=round(heading_deg, 1),
                uncertainty_radius_m=300.0,
                timestep_index=0,
            )
        )

        # Step backwards in time: subtract advection vector
        for step in range(1, total_steps + 1):
            current_time = current_time - timedelta(seconds=dt_seconds)

            # Move backwards: dx = -u * dt, dy = -v * dt
            meters_lon_per_deg = self.METERS_PER_DEGREE_LAT * math.cos(math.radians(current_lat))
            d_lat = (-v_ms * dt_seconds) / self.METERS_PER_DEGREE_LAT
            d_lon = (-u_ms * dt_seconds) / max(1.0, meters_lon_per_deg)

            current_lat += d_lat
            current_lon += d_lon

            uncertainty_m = 300.0 + (step * 75.0)

            trajectory_points.append(
                DriftTrajectoryPoint(
                    timestamp=current_time,
                    latitude=round(current_lat, 5),
                    longitude=round(current_lon, 5),
                    particle_id=particle_id,
                    velocity=round(speed_knots, 2),
                    direction=round(heading_deg, 1),
                    uncertainty_radius_m=round(uncertainty_m, 1),
                    timestep_index=step,
                )
            )

        # In hindcast, the terminal point (oldest timestamp) is the estimated origin
        terminal_origin = trajectory_points[-1]

        return DriftSimulationResult(
            run_type="HINDCAST",
            model_source="Deterministic Lagrangian Simulator (Demo Engine)",
            start_time=observation_time,
            end_time=terminal_origin.timestamp,
            duration_hours=duration_hours,
            trajectory_points=trajectory_points,
            estimated_origin_coords=(terminal_origin.latitude, terminal_origin.longitude),
            estimated_origin_time=terminal_origin.timestamp,
            confidence_score=0.92,
            parameters={
                "wind_speed_knots": wind_speed_knots,
                "wind_direction_deg": wind_direction_deg,
                "current_speed_knots": current_speed_knots,
                "current_direction_deg": current_direction_deg,
                "wind_factor": w_factor,
                "current_factor": c_factor,
                "wind_deflection_deg": w_deflect,
                "timestep_minutes": timestep_minutes,
            },
        )

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
        wind_factor: Optional[float] = None,
        wind_deflection_deg: Optional[float] = None,
        current_factor: Optional[float] = None,
        particle_id: int = 1,
        **kwargs: Any,
    ) -> DriftSimulationResult:
        """Projects future spill trajectory forward in time for coastal threat containment."""
        w_factor = wind_factor if wind_factor is not None else self.default_wind_factor
        c_factor = current_factor if current_factor is not None else self.default_current_factor
        w_deflect = wind_deflection_deg if wind_deflection_deg is not None else self.default_wind_deflection_deg

        u_ms, v_ms, speed_knots, heading_deg = self._compute_drift_vector(
            wind_speed_knots=wind_speed_knots,
            wind_direction_deg=wind_direction_deg,
            current_speed_knots=current_speed_knots,
            current_direction_deg=current_direction_deg,
            wind_factor=w_factor,
            current_factor=c_factor,
            wind_deflection_deg=w_deflect,
        )

        dt_seconds = timestep_minutes * 60.0
        total_steps = int(max(1, round((duration_hours * 60.0) / timestep_minutes)))

        trajectory_points: List[DriftTrajectoryPoint] = []

        # T0: Initial observed point
        current_lat = spill_lat
        current_lon = spill_lon
        current_time = observation_time

        trajectory_points.append(
            DriftTrajectoryPoint(
                timestamp=current_time,
                latitude=round(current_lat, 5),
                longitude=round(current_lon, 5),
                particle_id=particle_id,
                velocity=round(speed_knots, 2),
                direction=round(heading_deg, 1),
                uncertainty_radius_m=300.0,
                timestep_index=0,
            )
        )

        # Step forward in time: add advection vector
        for step in range(1, total_steps + 1):
            current_time = current_time + timedelta(seconds=dt_seconds)

            meters_lon_per_deg = self.METERS_PER_DEGREE_LAT * math.cos(math.radians(current_lat))
            d_lat = (v_ms * dt_seconds) / self.METERS_PER_DEGREE_LAT
            d_lon = (u_ms * dt_seconds) / max(1.0, meters_lon_per_deg)

            current_lat += d_lat
            current_lon += d_lon

            uncertainty_m = 300.0 + (step * 85.0)

            trajectory_points.append(
                DriftTrajectoryPoint(
                    timestamp=current_time,
                    latitude=round(current_lat, 5),
                    longitude=round(current_lon, 5),
                    particle_id=particle_id,
                    velocity=round(speed_knots, 2),
                    direction=round(heading_deg, 1),
                    uncertainty_radius_m=round(uncertainty_m, 1),
                    timestep_index=step,
                )
            )

        return DriftSimulationResult(
            run_type="FORECAST",
            model_source="Deterministic Lagrangian Simulator (Demo Engine)",
            start_time=observation_time,
            end_time=current_time,
            duration_hours=duration_hours,
            trajectory_points=trajectory_points,
            estimated_origin_coords=(spill_lat, spill_lon),
            estimated_origin_time=observation_time,
            confidence_score=0.88,
            parameters={
                "wind_speed_knots": wind_speed_knots,
                "wind_direction_deg": wind_direction_deg,
                "current_speed_knots": current_speed_knots,
                "current_direction_deg": current_direction_deg,
                "wind_factor": w_factor,
                "current_factor": c_factor,
                "wind_deflection_deg": w_deflect,
                "timestep_minutes": timestep_minutes,
            },
        )
