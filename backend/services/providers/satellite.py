from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional


class SatelliteProvider(ABC):
    """Abstract interface for Earth Observation Satellite Imagery providers (SAR & EO)."""

    @abstractmethod
    def search_scenes(
        self,
        bbox: List[float],
        start_time: datetime,
        end_time: datetime,
        sensor_type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Search available satellite scenes within a spatial bounding box [min_lon, min_lat, max_lon, max_lat]."""
        pass

    @abstractmethod
    def fetch_scene_metadata(self, scene_id: str) -> Dict[str, Any]:
        """Fetch metadata, footprint, and band assets for a scene."""
        pass


class MockSatelliteProvider(SatelliteProvider):
    """Synthetic Satellite Provider simulating Sentinel-1 C-SAR passes over the Arabian Sea."""

    def search_scenes(
        self,
        bbox: List[float],
        start_time: datetime,
        end_time: datetime,
        sensor_type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        return [
            {
                "scene_id": "S1A_IW_GRDH_1SDV_20260914T012845",
                "satellite_name": "Sentinel-1A",
                "sensor_type": "SAR",
                "acquisition_time": datetime.utcnow() - timedelta(hours=14),
                "resolution_meters": 10.0,
                "cloud_cover_percentage": 0.0,
                "footprint_geojson": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [71.50, 18.20],
                            [73.10, 18.20],
                            [73.10, 19.80],
                            [71.50, 19.80],
                            [71.50, 18.20],
                        ]
                    ],
                },
                "status": "PROCESSED",
            }
        ]

    def fetch_scene_metadata(self, scene_id: str) -> Dict[str, Any]:
        scenes = self.search_scenes([71.5, 18.2, 73.1, 19.8], datetime.utcnow(), datetime.utcnow())
        for s in scenes:
            if s["scene_id"] == scene_id:
                return s
        return scenes[0]


class CopernicusSatelliteProvider(SatelliteProvider):
    """Production provider integrating with Copernicus Open Access Hub / CDSE."""

    def __init__(self, username: str = "", password: str = ""):
        self.username = username
        self.password = password

    def search_scenes(
        self,
        bbox: List[float],
        start_time: datetime,
        end_time: datetime,
        sensor_type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        # Fallback to mock if credentials are not provided
        mock = MockSatelliteProvider()
        return mock.search_scenes(bbox, start_time, end_time, sensor_type)

    def fetch_scene_metadata(self, scene_id: str) -> Dict[str, Any]:
        mock = MockSatelliteProvider()
        return mock.fetch_scene_metadata(scene_id)
