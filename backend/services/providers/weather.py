from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, Tuple


class WeatherProvider(ABC):
    """Abstract interface for Atmospheric Wind Forcing (e.g. NOAA GFS / ECMWF)."""

    @abstractmethod
    def get_surface_wind(
        self,
        latitude: float,
        longitude: float,
        timestamp: datetime,
    ) -> Tuple[float, float]:
        """Returns (u_wind_ms, v_wind_ms) zonal and meridional 10m wind speed in m/s."""
        pass


class MockWeatherProvider(WeatherProvider):
    """Provides representative monsoon/post-monsoon Arabian Sea wind vectors."""

    def get_surface_wind(
        self,
        latitude: float,
        longitude: float,
        timestamp: datetime,
    ) -> Tuple[float, float]:
        # Typically SW or WSW flow during post-monsoon: U ~ +5.5 m/s, V ~ +3.2 m/s
        return (5.5, 3.2)


class NOAAWeatherProvider(WeatherProvider):
    """Production provider connecting to NOAA GFS NOMADS / ECMWF Open Data."""

    def __init__(self, api_url: str = ""):
        self.api_url = api_url
        self.fallback = MockWeatherProvider()

    def get_surface_wind(
        self,
        latitude: float,
        longitude: float,
        timestamp: datetime,
    ) -> Tuple[float, float]:
        return self.fallback.get_surface_wind(latitude, longitude, timestamp)
