from abc import ABC, abstractmethod
from datetime import datetime, timedelta
import math
import random
from typing import List, Dict, Any, Tuple, Optional
from backend.services.providers.weather import WeatherProvider, MockWeatherProvider
from backend.services.providers.ocean import OceanCurrentProvider, MockOceanCurrentProvider


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
    ) -> Dict[str, Any]:
        """Runs particle tracking either backwards (HINDCAST) or forwards (FORECAST)."""
        pass


class LagrangianDriftEngine(DriftEngine):
    """Numerical Lagrangian particle tracking engine with turbulent diffusion and windage."""

    def __init__(
        self,
        weather_provider: Optional[WeatherProvider] = None,
        ocean_provider: Optional[OceanCurrentProvider] = None,
    ):
        self.weather_provider = weather_provider or MockWeatherProvider()
        self.ocean_provider = ocean_provider or MockOceanCurrentProvider()

    def run_simulation(
        self,
        start_lat: float,
        start_lon: float,
        start_time: datetime,
        duration_hours: float,
        run_type: str = "HINDCAST",
        particle_count: int = 100,
        wind_factor: float = 0.03,
    ) -> Dict[str, Any]:
        # 1 degree latitude in meters
        METERS_PER_DEG_LAT = 111320.0
        # Turbulent diffusion coefficient (m^2/s)
        DIFFUSION_COEFF = 1.0

        # Sign of time step: negative for hindcast, positive for forecast
        time_direction = -1.0 if run_type.upper() == "HINDCAST" else 1.0
        step_hours = 1.0
        total_steps = int(max(1, duration_hours / step_hours))
        dt_seconds = step_hours * 3600.0 * time_direction

        # Enforce deterministic pseudo-random seed for repeatable demo verification
        rng = random.Random(42)

        # Initialize particles
        particles: List[Dict[str, float]] = []
        for _ in range(particle_count):
            # Slight spatial jitter around slick centroid (~200m)
            jitter_lat = (rng.random() - 0.5) * (400.0 / METERS_PER_DEG_LAT)
            meters_per_deg_lon = METERS_PER_DEG_LAT * math.cos(math.radians(start_lat))
            jitter_lon = (rng.random() - 0.5) * (400.0 / max(1.0, meters_per_deg_lon))
            particles.append({"lat": start_lat + jitter_lat, "lon": start_lon + jitter_lon})

        current_time = start_time
        trajectory_history: List[Dict[str, Any]] = []

        # Record initial centroid point
        trajectory_history.append({
            "timestep_utc": current_time,
            "latitude": start_lat,
            "longitude": start_lon,
            "uncertainty_radius_m": 300.0,
            "wind_speed_ms": 6.2,
            "current_speed_ms": 0.38,
            "particle_index": 0,
        })

        for step in range(1, total_steps + 1):
            current_time = current_time + timedelta(hours=step_hours * time_direction)

            # Query environmental vector forcing at current mean position
            mean_lat = sum(p["lat"] for p in particles) / len(particles)
            mean_lon = sum(p["lon"] for p in particles) / len(particles)

            u_wind, v_wind = self.weather_provider.get_surface_wind(mean_lat, mean_lon, current_time)
            u_curr, v_curr = self.ocean_provider.get_surface_current(mean_lat, mean_lon, current_time)

            # Combined velocity vector: current + windage
            u_total = u_curr + (wind_factor * u_wind)
            v_total = v_curr + (wind_factor * v_wind)

            meters_per_deg_lon = METERS_PER_DEG_LAT * math.cos(math.radians(mean_lat))

            # Advect each particle with random-walk diffusion
            for p in particles:
                # Random walk standard deviation = sqrt(2 * D * dt)
                rand_dx = rng.gauss(0, math.sqrt(2 * DIFFUSION_COEFF * abs(dt_seconds)))
                rand_dy = rng.gauss(0, math.sqrt(2 * DIFFUSION_COEFF * abs(dt_seconds)))

                dx_meters = (u_total * dt_seconds) + rand_dx
                dy_meters = (v_total * dt_seconds) + rand_dy

                p["lat"] += dy_meters / METERS_PER_DEG_LAT
                p["lon"] += dx_meters / max(1.0, meters_per_deg_lon)

            # Calculate step centroid and growing uncertainty radius
            step_lat = sum(p["lat"] for p in particles) / len(particles)
            step_lon = sum(p["lon"] for p in particles) / len(particles)
            uncertainty_m = 300.0 + (step * 75.0)

            wind_mag = math.sqrt(u_wind**2 + v_wind**2)
            curr_mag = math.sqrt(u_curr**2 + v_curr**2)

            trajectory_history.append({
                "timestep_utc": current_time,
                "latitude": round(step_lat, 5),
                "longitude": round(step_lon, 5),
                "uncertainty_radius_m": round(uncertainty_m, 1),
                "wind_speed_ms": round(wind_mag, 2),
                "current_speed_ms": round(curr_mag, 2),
                "particle_index": step,
            })

        # Terminal point is origin for hindcast, future trajectory for forecast
        terminal_pt = trajectory_history[-1]

        return {
            "run_type": run_type.upper(),
            "simulation_start_time": start_time,
            "simulation_end_time": current_time,
            "duration_hours": duration_hours,
            "particle_count": particle_count,
            "estimated_origin_lat": terminal_pt["latitude"] if run_type.upper() == "HINDCAST" else start_lat,
            "estimated_origin_lon": terminal_pt["longitude"] if run_type.upper() == "HINDCAST" else start_lon,
            "estimated_origin_time": terminal_pt["timestep_utc"] if run_type.upper() == "HINDCAST" else start_time,
            "trajectory_points": trajectory_history,
        }
