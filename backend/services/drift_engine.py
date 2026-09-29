"""Runge-Kutta 4th Order (RK4) & Lagrangian Particle Drift Simulation Engine.

Features:
1. 4th-Order Runge-Kutta (RK4) numerical integration for advective trajectory calculation
2. Turbulent diffusion via Gaussian random-walk dispersion
3. NOAA ADIOS / Mackay empirical oil weathering kinetics (evaporation, emulsification, viscosity surge)
4. Backward hindcasting (source attribution) and forward forecasting (threat containment)
"""

from abc import ABC, abstractmethod
from datetime import datetime, timedelta
import math
import random
from typing import List, Dict, Any, Tuple, Optional

from backend.services.providers.weather import (
    WeatherProvider,
    MockWeatherProvider,
    OpenMeteoWeatherProvider,
)
from backend.services.providers.ocean import (
    OceanCurrentProvider,
    MockOceanCurrentProvider,
    OpenMeteoMarineCurrentProvider,
)
from backend.services.oil_weathering import ADIOSOilWeatheringEngine, OilWeatheringState


class DriftEngine(ABC):
    """Abstract interface for Lagrangian Oil Particle Drift Simulation."""

    @abstractmethod
    def run_simulation(
        self,
        start_lat: float,
        start_lon: float,
        start_time: datetime,
        duration_hours: float,
        run_type: str = "HINDCAST",
        particle_count: int = 100,
        wind_factor: float = 0.03,
        integration_method: str = "rk4",
    ) -> Dict[str, Any]:
        """Runs particle tracking either backwards (HINDCAST) or forwards (FORECAST)."""
        pass


class LagrangianDriftEngine(DriftEngine):
    """4th-Order Runge-Kutta & Lagrangian particle tracking engine with ADIOS weathering kinetics."""

    METERS_PER_DEG_LAT = 111320.0
    DIFFUSION_COEFF = 1.0  # Turbulent diffusion coefficient in m^2/s

    def __init__(
        self,
        weather_provider: Optional[WeatherProvider] = None,
        ocean_provider: Optional[OceanCurrentProvider] = None,
    ):
        self.weather_provider = weather_provider or OpenMeteoWeatherProvider(fallback=MockWeatherProvider())
        self.ocean_provider = ocean_provider or OpenMeteoMarineCurrentProvider(fallback=MockOceanCurrentProvider())
        self.weathering_engine = ADIOSOilWeatheringEngine()

    def _meters_per_deg_lon(self, lat_deg: float) -> float:
        """Computes zonal distance scaling (meters per degree longitude)."""
        return max(1.0, self.METERS_PER_DEG_LAT * math.cos(math.radians(lat_deg)))

    def _evaluate_velocity(
        self,
        lat: float,
        lon: float,
        t: datetime,
        wind_factor: float,
    ) -> Tuple[float, float, float, float]:
        """Evaluates total advective velocity (u, v) and environmental components at (lat, lon, t)."""
        u_wind, v_wind = self.weather_provider.get_surface_wind(lat, lon, t)
        u_curr, v_curr = self.ocean_provider.get_surface_current(lat, lon, t)

        u_total = u_curr + (wind_factor * u_wind)
        v_total = v_curr + (wind_factor * v_wind)

        wind_mag = math.sqrt(u_wind**2 + v_wind**2)
        curr_mag = math.sqrt(u_curr**2 + v_curr**2)

        return u_total, v_total, wind_mag, curr_mag

    def _rk4_displacement(
        self,
        lat: float,
        lon: float,
        t: datetime,
        dt_seconds: float,
        wind_factor: float,
    ) -> Tuple[float, float, float, float]:
        """Calculates Runge-Kutta 4th Order displacement (d_lat, d_lon) across dt_seconds.

        Returns:
            (d_lat_deg, d_lon_deg, mean_wind_ms, mean_current_ms)
        """
        # Stage 1: Initial evaluation
        u1, v1, w_mag1, c_mag1 = self._evaluate_velocity(lat, lon, t, wind_factor)
        k1_lat = (v1 * dt_seconds) / self.METERS_PER_DEG_LAT
        k1_lon = (u1 * dt_seconds) / self._meters_per_deg_lon(lat)

        # Stage 2: Half-step evaluation at midpoint 1
        t_mid = t + timedelta(seconds=dt_seconds * 0.5)
        lat_k2 = lat + 0.5 * k1_lat
        lon_k2 = lon + 0.5 * k1_lon
        u2, v2, w_mag2, c_mag2 = self._evaluate_velocity(lat_k2, lon_k2, t_mid, wind_factor)
        k2_lat = (v2 * dt_seconds) / self.METERS_PER_DEG_LAT
        k2_lon = (u2 * dt_seconds) / self._meters_per_deg_lon(lat_k2)

        # Stage 3: Half-step evaluation at midpoint 2
        lat_k3 = lat + 0.5 * k2_lat
        lon_k3 = lon + 0.5 * k2_lon
        u3, v3, w_mag3, c_mag3 = self._evaluate_velocity(lat_k3, lon_k3, t_mid, wind_factor)
        k3_lat = (v3 * dt_seconds) / self.METERS_PER_DEG_LAT
        k3_lon = (u3 * dt_seconds) / self._meters_per_deg_lon(lat_k3)

        # Stage 4: Full-step evaluation at endpoint
        t_end = t + timedelta(seconds=dt_seconds)
        lat_k4 = lat + k3_lat
        lon_k4 = lon + k3_lon
        u4, v4, w_mag4, c_mag4 = self._evaluate_velocity(lat_k4, lon_k4, t_end, wind_factor)
        k4_lat = (v4 * dt_seconds) / self.METERS_PER_DEG_LAT
        k4_lon = (u4 * dt_seconds) / self._meters_per_deg_lon(lat_k4)

        # RK4 weighted average displacement
        d_lat = (k1_lat + 2.0 * k2_lat + 2.0 * k3_lat + k4_lat) / 6.0
        d_lon = (k1_lon + 2.0 * k2_lon + 2.0 * k3_lon + k4_lon) / 6.0

        mean_wind = (w_mag1 + 2.0 * w_mag2 + 2.0 * w_mag3 + w_mag4) / 6.0
        mean_curr = (c_mag1 + 2.0 * c_mag2 + 2.0 * c_mag3 + c_mag4) / 6.0

        return d_lat, d_lon, mean_wind, mean_curr

    def run_simulation(
        self,
        start_lat: float,
        start_lon: float,
        start_time: datetime,
        duration_hours: float,
        run_type: str = "HINDCAST",
        particle_count: int = 100,
        wind_factor: float = 0.03,
        integration_method: str = "rk4",
    ) -> Dict[str, Any]:
        """Executes Lagrangian particle tracking with RK4 integration and ADIOS weathering kinetics."""
        is_hindcast = run_type.upper() == "HINDCAST"
        time_direction = -1.0 if is_hindcast else 1.0
        step_hours = 1.0
        total_steps = int(max(1, round(duration_hours / step_hours)))
        dt_seconds = step_hours * 3600.0 * time_direction

        # Deterministic seed for reproducible evaluation verification
        rng = random.Random(42)

        # Initialize particles with Gaussian spatial jitter (~200m around centroid)
        particles: List[Dict[str, float]] = []
        for _ in range(particle_count):
            jitter_lat = (rng.random() - 0.5) * (400.0 / self.METERS_PER_DEG_LAT)
            meters_per_lon = self._meters_per_deg_lon(start_lat)
            jitter_lon = (rng.random() - 0.5) * (400.0 / meters_per_lon)
            particles.append({"lat": start_lat + jitter_lat, "lon": start_lon + jitter_lon})

        current_time = start_time
        trajectory_history: List[Dict[str, Any]] = []

        # Initial velocity evaluation at (start_lat, start_lon, current_time)
        _, _, w_init, c_init = self._evaluate_velocity(start_lat, start_lon, current_time, wind_factor)

        # Weathering at initial step
        initial_age = duration_hours if is_hindcast else 0.0
        w0 = self.weathering_engine.compute_state(initial_age, wind_speed_ms=w_init)

        # Record initial centroid waypoint
        trajectory_history.append({
            "timestep_utc": current_time,
            "latitude": start_lat,
            "longitude": start_lon,
            "uncertainty_radius_m": 300.0,
            "wind_speed_ms": round(w_init, 2),
            "current_speed_ms": round(c_init, 2),
            "particle_index": 0,
            "evaporated_percentage": w0.evaporated_percentage,
            "water_content_percentage": w0.water_content_percentage,
            "viscosity_cst": w0.dynamic_viscosity_cst,
            "weathering_stage": w0.weathering_stage,
            "volume_remaining_mt": w0.volume_remaining_mt,
            "integration_method": integration_method.upper(),
        })

        for step in range(1, total_steps + 1):
            step_time = current_time
            current_time = current_time + timedelta(hours=step_hours * time_direction)

            # Centroid at current step
            mean_lat = sum(p["lat"] for p in particles) / len(particles)
            mean_lon = sum(p["lon"] for p in particles) / len(particles)

            # Compute advection displacement
            if integration_method.lower() == "euler":
                u_total, v_total, wind_mag, curr_mag = self._evaluate_velocity(
                    mean_lat, mean_lon, step_time, wind_factor
                )
                d_lat_advect = (v_total * dt_seconds) / self.METERS_PER_DEG_LAT
                d_lon_advect = (u_total * dt_seconds) / self._meters_per_deg_lon(mean_lat)
            else:
                # Default RK4 4th-Order Runge-Kutta numerical integration
                d_lat_advect, d_lon_advect, wind_mag, curr_mag = self._rk4_displacement(
                    mean_lat, mean_lon, step_time, dt_seconds, wind_factor
                )

            # Advect each particle with turbulent diffusion
            for p in particles:
                rand_dx = rng.gauss(0, math.sqrt(2 * self.DIFFUSION_COEFF * abs(dt_seconds)))
                rand_dy = rng.gauss(0, math.sqrt(2 * self.DIFFUSION_COEFF * abs(dt_seconds)))

                p_lon_scale = self._meters_per_deg_lon(p["lat"])
                p["lat"] += d_lat_advect + (rand_dy / self.METERS_PER_DEG_LAT)
                p["lon"] += d_lon_advect + (rand_dx / p_lon_scale)

            # Calculate step centroid and expanding uncertainty radius
            step_lat = sum(p["lat"] for p in particles) / len(particles)
            step_lon = sum(p["lon"] for p in particles) / len(particles)
            uncertainty_m = 300.0 + (step * 75.0)

            # Age at this step
            if is_hindcast:
                step_age = max(0.0, duration_hours - (step * step_hours))
            else:
                step_age = step * step_hours

            w_state = self.weathering_engine.compute_state(step_age, wind_speed_ms=wind_mag)

            trajectory_history.append({
                "timestep_utc": current_time,
                "latitude": round(step_lat, 5),
                "longitude": round(step_lon, 5),
                "uncertainty_radius_m": round(uncertainty_m, 1),
                "wind_speed_ms": round(wind_mag, 2),
                "current_speed_ms": round(curr_mag, 2),
                "particle_index": step,
                "evaporated_percentage": w_state.evaporated_percentage,
                "water_content_percentage": w_state.water_content_percentage,
                "viscosity_cst": w_state.dynamic_viscosity_cst,
                "weathering_stage": w_state.weathering_stage,
                "volume_remaining_mt": w_state.volume_remaining_mt,
                "integration_method": integration_method.upper(),
            })

        # Terminal point: reconstructed origin for hindcast, future impact for forecast
        terminal_pt = trajectory_history[-1]

        return {
            "run_type": run_type.upper(),
            "model_source": f"Lagrangian Particle Engine ({integration_method.upper()} + ADIOS Kinetics)",
            "integration_method": integration_method.upper(),
            "simulation_start_time": start_time,
            "simulation_end_time": current_time,
            "duration_hours": duration_hours,
            "particle_count": particle_count,
            "estimated_origin_lat": terminal_pt["latitude"] if is_hindcast else start_lat,
            "estimated_origin_lon": terminal_pt["longitude"] if is_hindcast else start_lon,
            "estimated_origin_time": terminal_pt["timestep_utc"] if is_hindcast else start_time,
            "trajectory_points": trajectory_history,
            "weathering_summary": {
                "initial_volume_mt": self.weathering_engine.m0_mt,
                "final_volume_remaining_mt": terminal_pt.get("volume_remaining_mt"),
                "evaporated_percentage": terminal_pt.get("evaporated_percentage"),
                "water_content_percentage": terminal_pt.get("water_content_percentage"),
                "terminal_viscosity_cst": terminal_pt.get("viscosity_cst"),
                "weathering_stage": terminal_pt.get("weathering_stage"),
            },
        }
