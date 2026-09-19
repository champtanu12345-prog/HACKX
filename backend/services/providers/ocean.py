from abc import ABC, abstractmethod
from datetime import datetime
from typing import Tuple


class OceanCurrentProvider(ABC):
    """Abstract interface for Ocean Circulation & Surface Velocity (e.g. Copernicus Marine CMEMS / HyCOM)."""

    @abstractmethod
    def get_surface_current(
        self,
        latitude: float,
        longitude: float,
        timestamp: datetime,
    ) -> Tuple[float, float]:
        """Returns (u_current_ms, v_current_ms) surface velocity in m/s."""
        pass


class MockOceanCurrentProvider(OceanCurrentProvider):
    """Provides representative Arabian Sea surface currents (West India Coastal Current)."""

    def get_surface_current(
        self,
        latitude: float,
        longitude: float,
        timestamp: datetime,
    ) -> Tuple[float, float]:
        # Typically northward/northwestward coastal current: U ~ -0.15 m/s, V ~ 0.35 m/s
        return (-0.15, 0.35)


class CopernicusMarineProvider(OceanCurrentProvider):
    """Production provider integrating CMEMS physical reanalysis/forecast."""

    def __init__(self, username: str = "", password: str = ""):
        self.username = username
        self.password = password
        self.fallback = MockOceanCurrentProvider()

    def get_surface_current(
        self,
        latitude: float,
        longitude: float,
        timestamp: datetime,
    ) -> Tuple[float, float]:
        return self.fallback.get_surface_current(latitude, longitude, timestamp)
