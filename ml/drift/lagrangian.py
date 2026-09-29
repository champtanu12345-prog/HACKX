"""Deterministic Lagrangian Particle Drift Simulator.

Implements Runge-Kutta 4th Order (RK4) hydrodynamic drift modeling and
NOAA ADIOS / Mackay empirical oil weathering kinetics for marine oil slicks.
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
from backend.services.oil_weathering import ADIOSOilWeatheringEngine


class LagrangianDriftSimulator(DriftEngine):
    """Deterministic Lagrangian particle advection simulator with RK4 integration.
    
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
        default_integration_method: str = "rk4",
    ):
        self.default_wind_factor = default_wind_factor
        self.default_current_factor = default_current_factor
        self.default_wind_deflection_deg = default_wind_deflection_deg
        self.default_integration_method = default_integration_method
        self.weathering_engine = ADIOSOilWeatheringEngine()

    def _meters_per_deg_lon(self, lat_deg: float) -> float:
        """Computes longitude scale metric at given latitude."""
        return max(1.0, self.METERS_PER_DEGREE_LAT * math.cos(math.radians(lat_deg)))

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
        wind_towards_rad = math.radians((wind_direction_deg + 180.0) % 360.0)
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

    def _step_rk4(
        self,
        lat: float,
        lon: float,
        u_ms: float,
        v_ms: float,
        dt_seconds: float,
        reverse: bool = False,
    ) -> Tuple[float, float]:
        """Performs 4th-Order Runge-Kutta numerical advection step across spherical grid."""
        sign = -1.0 if reverse else 1.0
        u = u_ms * sign
        v = v_ms * sign

        # Stage 1
        k1_lat = (v * dt_seconds) / self.METERS_PER_DEGREE_LAT
        k1_lon = (u * dt_seconds) / self._meters_per_deg_lon(lat)

        # Stage 2 (midpoint)
        lat_k2 = lat + 0.5 * k1_lat
        k2_lat = (v * dt_seconds) / self.METERS_PER_DEGREE_LAT
        k2_lon = (u * dt_seconds) / self._meters_per_deg_lon(lat_k2)

        # Stage 3 (midpoint)
        lat_k3 = lat + 0.5 * k2_lat
        k3_lat = (v * dt_seconds) / self.METERS_PER_DEGREE_LAT
        k3_lon = (u * dt_seconds) / self._meters_per_deg_lon(lat_k3)

        # Stage 4 (endpoint)
        lat_k4 = lat + k3_lat
        k4_lat = (v * dt_seconds) / self.METERS_PER_DEGREE_LAT
        k4_lon = (u * dt_seconds) / self._meters_per_deg_lon(lat_k4)

        # Simpson's weighted average
        d_lat = (k1_lat + 2.0 * k2_lat + 2.0 * k3_lat + k4_lat) / 6.0
        d_lon = (k1_lon + 2.0 * k2_lon + 2.0 * k3_lon + k4_lon) / 6.0

        return lat + d_lat, lon + d_lon

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
        integration_method: Optional[str] = None,
        **kwargs: Any,
    ) -> DriftSimulationResult:
        """Backtracks spill trajectory into the past to reconstruct probable release origin."""
        w_factor = wind_factor if wind_factor is not None else self.default_wind_factor
        c_factor = current_factor if current_factor is not None else self.default_current_factor
        w_deflect = wind_deflection_deg if wind_deflection_deg is not None else self.default_wind_deflection_deg
        method = (integration_method or self.default_integration_method).lower()

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
        dt_hours = timestep_minutes / 60.0
        total_steps = int(max(1, round((duration_hours * 60.0) / timestep_minutes)))

        trajectory_points: List[DriftTrajectoryPoint] = []

        # T0: Initial observation point (slick at its oldest observed age)
        current_lat = spill_lat
        current_lon = spill_lon
        current_time = observation_time

        wind_speed_ms = wind_speed_knots * self.KNOTS_TO_MS
        w0 = self.weathering_engine.compute_state(duration_hours, wind_speed_ms=wind_speed_ms)

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
                evaporated_percentage=w0.evaporated_percentage,
                water_content_percentage=w0.water_content_percentage,
                viscosity_cst=w0.dynamic_viscosity_cst,
                weathering_stage=w0.weathering_stage,
            )
        )

        # Step backwards in time: subtract advection vector
        for step in range(1, total_steps + 1):
            current_time = current_time - timedelta(seconds=dt_seconds)

            if method == "euler":
                meters_lon = self._meters_per_deg_lon(current_lat)
                d_lat = (-v_ms * dt_seconds) / self.METERS_PER_DEGREE_LAT
                d_lon = (-u_ms * dt_seconds) / max(1.0, meters_lon)
                current_lat += d_lat
                current_lon += d_lon
            else:
                # RK4 advection
                current_lat, current_lon = self._step_rk4(
                    current_lat, current_lon, u_ms, v_ms, dt_seconds, reverse=True
                )

            uncertainty_m = 300.0 + (step * 75.0)

            # Weathering age steps backwards towards release origin (age = 0 at terminal)
            step_age = max(0.0, duration_hours - (step * dt_hours))
            w_step = self.weathering_engine.compute_state(step_age, wind_speed_ms=wind_speed_ms)

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
                    evaporated_percentage=w_step.evaporated_percentage,
                    water_content_percentage=w_step.water_content_percentage,
                    viscosity_cst=w_step.dynamic_viscosity_cst,
                    weathering_stage=w_step.weathering_stage,
                )
            )

        # In hindcast, the terminal point (oldest timestamp) is the estimated origin
        terminal_origin = trajectory_points[-1]

        return DriftSimulationResult(
            run_type="HINDCAST",
            model_source=f"Deterministic Lagrangian Simulator ({method.upper()} + ADIOS Kinetics)",
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
                "integration_method": method.upper(),
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
        integration_method: Optional[str] = None,
        **kwargs: Any,
    ) -> DriftSimulationResult:
        """Projects future spill trajectory forward in time for coastal threat containment."""
        w_factor = wind_factor if wind_factor is not None else self.default_wind_factor
        c_factor = current_factor if current_factor is not None else self.default_current_factor
        w_deflect = wind_deflection_deg if wind_deflection_deg is not None else self.default_wind_deflection_deg
        method = (integration_method or self.default_integration_method).lower()

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
        dt_hours = timestep_minutes / 60.0
        total_steps = int(max(1, round((duration_hours * 60.0) / timestep_minutes)))

        trajectory_points: List[DriftTrajectoryPoint] = []

        # T0: Initial observed point
        current_lat = spill_lat
        current_lon = spill_lon
        current_time = observation_time

        wind_speed_ms = wind_speed_knots * self.KNOTS_TO_MS
        w0 = self.weathering_engine.compute_state(0.0, wind_speed_ms=wind_speed_ms)

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
                evaporated_percentage=w0.evaporated_percentage,
                water_content_percentage=w0.water_content_percentage,
                viscosity_cst=w0.dynamic_viscosity_cst,
                weathering_stage=w0.weathering_stage,
            )
        )

        # Step forward in time: add advection vector
        for step in range(1, total_steps + 1):
            current_time = current_time + timedelta(seconds=dt_seconds)

            if method == "euler":
                meters_lon = self._meters_per_deg_lon(current_lat)
                d_lat = (v_ms * dt_seconds) / self.METERS_PER_DEGREE_LAT
                d_lon = (u_ms * dt_seconds) / max(1.0, meters_lon)
                current_lat += d_lat
                current_lon += d_lon
            else:
                # RK4 advection
                current_lat, current_lon = self._step_rk4(
                    current_lat, current_lon, u_ms, v_ms, dt_seconds, reverse=False
                )

            uncertainty_m = 300.0 + (step * 85.0)

            # Weathering age progresses forward
            step_age = step * dt_hours
            w_step = self.weathering_engine.compute_state(step_age, wind_speed_ms=wind_speed_ms)

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
                    evaporated_percentage=w_step.evaporated_percentage,
                    water_content_percentage=w_step.water_content_percentage,
                    viscosity_cst=w_step.dynamic_viscosity_cst,
                    weathering_stage=w_step.weathering_stage,
                )
            )

        return DriftSimulationResult(
            run_type="FORECAST",
            model_source=f"Deterministic Lagrangian Simulator ({method.upper()} + ADIOS Kinetics)",
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
                "integration_method": method.upper(),
            },
        )
