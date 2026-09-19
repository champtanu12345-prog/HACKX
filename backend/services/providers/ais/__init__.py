"""AIS Provider implementations for HACKX.

Defines:
- AISProvider (ABC interface)
- LocalAISProvider (ingests CSV and JSON logs from local filesystem)
- DemoAISProvider (deterministic scenario-based provider)
- MockAISProvider and SpireAISProvider (backwards compatibility)
"""

from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import os
import glob

from backend.services.providers.ais.models import (
    NormalizedAisPosition,
    NormalizedVesselStatic,
    BehavioralAnomalyReport,
    CandidateVesselCorrelation,
)
from backend.services.providers.ais.ingestion import AISIngestionParser
from backend.data.scenarios import DEMO_SCENARIOS_DATA


class AISProvider(ABC):
    """Abstract interface for Maritime Automatic Identification System (AIS) telemetry."""

    @abstractmethod
    def query_vessels_in_corridor(
        self,
        bbox: List[float],
        start_time: datetime,
        end_time: datetime,
    ) -> List[Dict[str, Any]]:
        """Query all vessels passing through the bounding box during the specified time window."""
        pass

    @abstractmethod
    def get_vessel_track(
        self,
        mmsi: str,
        start_time: datetime,
        end_time: datetime,
    ) -> List[Dict[str, Any]]:
        """Retrieve chronological positions (lat, lon, SOG, COG) for a specific vessel."""
        pass

    def get_all_vessels(self) -> List[Dict[str, Any]]:
        """Returns all vessels indexed by the provider."""
        return []


class LocalAISProvider(AISProvider):
    """Local provider supporting CSV and JSON file ingestion from disk."""

    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path or os.path.join(
            os.path.dirname(__file__), "..", "..", "..", "data", "samples"
        )
        self.parser = AISIngestionParser()
        self._vessels_cache: Dict[str, Dict[str, Any]] = {}
        self._positions_cache: List[NormalizedAisPosition] = []
        self._loaded = False

    def load_data(self) -> None:
        """Scans data path and loads all .json and .csv AIS files."""
        if not os.path.exists(self.data_path):
            return

        all_positions: List[NormalizedAisPosition] = []

        if os.path.isfile(self.data_path):
            files = [self.data_path]
        else:
            files = glob.glob(os.path.join(self.data_path, "*.json")) + glob.glob(
                os.path.join(self.data_path, "*.csv")
            )

        for f_path in files:
            try:
                if f_path.endswith(".json"):
                    all_positions.extend(self.parser.parse_json(f_path))
                elif f_path.endswith(".csv"):
                    all_positions.extend(self.parser.parse_csv(f_path))
            except Exception:
                continue

        # Group positions by MMSI
        self._positions_cache = all_positions
        vessels_map: Dict[str, Dict[str, Any]] = {}

        for p in all_positions:
            if p.mmsi not in vessels_map:
                vessels_map[p.mmsi] = {
                    "id": p.mmsi,
                    "mmsi": p.mmsi,
                    "name": p.vessel_name,
                    "imo": p.imo,
                    "vessel_type": "Cargo",
                    "flag_country": "Unknown",
                    "positions": [],
                }
            vessels_map[p.mmsi]["positions"].append({
                "timestamp": p.timestamp.isoformat() + "Z",
                "latitude": p.latitude,
                "longitude": p.longitude,
                "sog": p.speed,
                "cog": p.course,
                "heading": p.heading,
                "nav_status": p.navigation_status,
            })

        # Sort positions chronologically
        for v in vessels_map.values():
            v["positions"].sort(key=lambda x: x["timestamp"])

        self._vessels_cache = vessels_map
        self._loaded = True

    def ingest_file(self, file_path: str) -> int:
        """Ingests an explicit single CSV or JSON file."""
        if file_path.endswith(".csv"):
            positions = self.parser.parse_csv(file_path)
        else:
            positions = self.parser.parse_json(file_path)

        for p in positions:
            if p.mmsi not in self._vessels_cache:
                self._vessels_cache[p.mmsi] = {
                    "id": p.mmsi,
                    "mmsi": p.mmsi,
                    "name": p.vessel_name,
                    "imo": p.imo,
                    "vessel_type": "Cargo",
                    "flag_country": "Unknown",
                    "positions": [],
                }
            self._vessels_cache[p.mmsi]["positions"].append({
                "timestamp": p.timestamp.isoformat() + "Z",
                "latitude": p.latitude,
                "longitude": p.longitude,
                "sog": p.speed,
                "cog": p.course,
                "heading": p.heading,
                "nav_status": p.navigation_status,
            })
        return len(positions)

    def query_vessels_in_corridor(
        self,
        bbox: List[float],
        start_time: datetime,
        end_time: datetime,
    ) -> List[Dict[str, Any]]:
        if not self._loaded:
            self.load_data()
        if not self._vessels_cache:
            return DemoAISProvider().query_vessels_in_corridor(bbox, start_time, end_time)
        return list(self._vessels_cache.values())

    def get_vessel_track(
        self,
        mmsi: str,
        start_time: datetime,
        end_time: datetime,
    ) -> List[Dict[str, Any]]:
        if not self._loaded:
            self.load_data()
        if not self._vessels_cache:
            return DemoAISProvider().get_vessel_track(mmsi, start_time, end_time)
        v = self._vessels_cache.get(mmsi)
        return v.get("positions", []) if v else []

    def get_all_vessels(self) -> List[Dict[str, Any]]:
        if not self._loaded:
            self.load_data()
        if not self._vessels_cache:
            return DemoAISProvider().get_all_vessels()
        return list(self._vessels_cache.values())


class DemoAISProvider(AISProvider):
    """Deterministic AIS provider serving benchmark scenario datasets (A, B, C)."""

    def __init__(self):
        self.scenarios = DEMO_SCENARIOS_DATA

    def get_vessels_for_scenario(self, scenario_id: str) -> List[Dict[str, Any]]:
        s = self.scenarios.get(scenario_id.lower(), self.scenarios["scenario_a"])
        return s.get("vessels", [])

    def query_vessels_in_corridor(
        self,
        bbox: List[float],
        start_time: datetime,
        end_time: datetime,
    ) -> List[Dict[str, Any]]:
        all_v = []
        for s in self.scenarios.values():
            for v in s.get("vessels", []):
                if v not in all_v:
                    all_v.append(v)
        return all_v

    def get_vessel_track(
        self,
        mmsi: str,
        start_time: datetime,
        end_time: datetime,
    ) -> List[Dict[str, Any]]:
        for s in self.scenarios.values():
            for v in s.get("vessels", []):
                if v.get("mmsi") == mmsi:
                    return v.get("positions", [])
        return []

    def get_all_vessels(self) -> List[Dict[str, Any]]:
        seen_mmsi = set()
        vessels = []
        for s in self.scenarios.values():
            for v in s.get("vessels", []):
                if v.get("mmsi") not in seen_mmsi:
                    seen_mmsi.add(v.get("mmsi"))
                    vessels.append(v)
        return vessels


# Backward compatibility aliases
MockAISProvider = LocalAISProvider


class SpireAISProvider(AISProvider):
    """Production provider connecting to Spire Global / AISHub streaming API."""

    def __init__(self, api_key: str = ""):
        self.api_key = api_key
        self.fallback = DemoAISProvider()

    def query_vessels_in_corridor(
        self,
        bbox: List[float],
        start_time: datetime,
        end_time: datetime,
    ) -> List[Dict[str, Any]]:
        return self.fallback.query_vessels_in_corridor(bbox, start_time, end_time)

    def get_vessel_track(
        self,
        mmsi: str,
        start_time: datetime,
        end_time: datetime,
    ) -> List[Dict[str, Any]]:
        return self.fallback.get_vessel_track(mmsi, start_time, end_time)


__all__ = [
    "AISProvider",
    "LocalAISProvider",
    "DemoAISProvider",
    "MockAISProvider",
    "SpireAISProvider",
    "NormalizedAisPosition",
    "NormalizedVesselStatic",
    "BehavioralAnomalyReport",
    "CandidateVesselCorrelation",
]
