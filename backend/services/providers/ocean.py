import json
import logging
import math
import time
import urllib.request
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger(__name__)


class OceanCurrentProvider(ABC):
    """Abstract interface for Ocean Circulation & Surface Velocity (e.g. Copernicus Marine CMEMS / HyCOM)."""

    @abstractmethod
    def get_surface_current(
        self,
        latitude: float,
        longitude: float,
        timestamp: datetime,
    ) -> Tuple[float, float]:
        """Returns (u_current_ms, v_current_ms) surface velocity in m/s (u: Eastward, v: Northward)."""
        pass

    def get_marine_conditions(
        self,
        latitude: float,
        longitude: float,
        timestamp: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Returns detailed marine condition metrics including wave height and current telemetry."""
        u_ms, v_ms = self.get_surface_current(latitude, longitude, timestamp or datetime.now(timezone.utc))
        speed_ms = math.sqrt(u_ms**2 + v_ms**2)
        dir_deg = (math.degrees(math.atan2(u_ms, v_ms)) + 360.0) % 360.0
        return {
            "source": "Mock Ocean Circulation",
            "latitude": latitude,
            "longitude": longitude,
            "timestamp": (timestamp or datetime.now(timezone.utc)).isoformat(),
            "current_speed_ms": round(speed_ms, 3),
            "current_speed_knots": round(speed_ms / 0.514444, 2),
            "current_direction_deg": round(dir_deg, 1),
            "u_current_ms": round(u_ms, 4),
            "v_current_ms": round(v_ms, 4),
            "wave_height_m": 1.2,
            "wave_direction_deg": 220.0,
            "wave_period_s": 8.5,
            "is_live": False,
        }


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


class OpenMeteoMarineCurrentProvider(OceanCurrentProvider):
    """Production provider fetching real live ocean currents and sea state from Open-Meteo Marine API.

    Underlying hydrodynamic models: Copernicus Marine Service (CMEMS) Global Ocean Physics Reanalysis
    and NOAA NCEP Global RTOFS / HyCOM model.
    """

    BASE_URL = "https://marine-api.open-meteo.com/v1/marine"

    def __init__(
        self,
        fallback: Optional[OceanCurrentProvider] = None,
        timeout_seconds: float = 4.0,
        cache_ttl_seconds: int = 900,
    ):
        self.fallback = fallback or MockOceanCurrentProvider()
        self.timeout = timeout_seconds
        self.cache_ttl = cache_ttl_seconds
        # Spatial-temporal cache: (round(lat, 2), round(lon, 2), window_key) -> (cached_at_epoch, raw_json_data)
        self._cache: Dict[Tuple[float, float, str], Tuple[float, Dict[str, Any]]] = {}

    def _fetch_live_data(
        self,
        latitude: float,
        longitude: float,
        target_time: Optional[datetime] = None,
    ) -> Optional[Dict[str, Any]]:
        """Queries Open-Meteo Marine API with spatial grid caching and TTL."""
        now_dt = datetime.now(timezone.utc)
        target = target_time or now_dt
        if target.tzinfo is None:
            target = target.replace(tzinfo=timezone.utc)

        # Check if target is roughly within recent forecast window (within 7 days past and 2 days future)
        time_diff_days = (now_dt - target).total_seconds() / 86400.0

        if -2.0 <= time_diff_days <= 7.0:
            date_param = "past_days=7&forecast_days=3"
            cache_sub_key = "recent"
        else:
            # Historical or extended window: specify start_date and end_date around target
            from datetime import timedelta
            start_date = (target - timedelta(days=2)).strftime("%Y-%m-%d")
            end_date = (target + timedelta(days=2)).strftime("%Y-%m-%d")
            date_param = f"start_date={start_date}&end_date={end_date}"
            cache_sub_key = f"{start_date}_{end_date}"

        grid_key = (round(latitude, 2), round(longitude, 2), cache_sub_key)
        now_epoch = time.time()

        if grid_key in self._cache:
            cached_epoch, cached_data = self._cache[grid_key]
            if now_epoch - cached_epoch < self.cache_ttl:
                return cached_data

        url = (
            f"{self.BASE_URL}?latitude={grid_key[0]}&longitude={grid_key[1]}"
            f"&current=ocean_current_velocity,ocean_current_direction,wave_height,wave_direction,wave_period"
            f"&hourly=ocean_current_velocity,ocean_current_direction,wave_height,wave_direction,wave_period"
            f"&{date_param}"
        )
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "HACKX-Maritime-Intelligence/1.0", "Accept": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                if resp.status == 200:
                    payload = json.loads(resp.read().decode("utf-8"))
                    self._cache[grid_key] = (now_epoch, payload)
                    return payload
        except Exception as exc:
            logger.warning(
                f"[OpenMeteoMarine] Marine API query failed for ({latitude}, {longitude}, {target}): {exc}. "
                f"Falling back to representative hydrodynamic current model."
            )
        return None

    def _extract_point_for_timestamp(
        self,
        data: Dict[str, Any],
        target_time: Optional[datetime],
    ) -> Tuple[Optional[float], Optional[float], Optional[float], Optional[float], Optional[float]]:
        """Extracts (velocity_kmh, direction_deg, wave_height_m, wave_direction_deg, wave_period_s)."""
        if target_time is not None and target_time.tzinfo is None:
            target_time = target_time.replace(tzinfo=timezone.utc)

        # If target_time is provided and hourly data is present, match the closest hour
        hourly = data.get("hourly")
        if hourly and "time" in hourly and target_time is not None:
            times = hourly["time"]
            best_idx = 0
            best_diff = float("inf")
            target_ts = target_time.timestamp()

            for idx, t_str in enumerate(times):
                try:
                    dt = datetime.fromisoformat(t_str)
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=timezone.utc)
                    diff = abs(dt.timestamp() - target_ts)
                    if diff < best_diff:
                        best_diff = diff
                        best_idx = idx
                except Exception:
                    continue

            vel = hourly.get("ocean_current_velocity", [None])[best_idx]
            dir_deg = hourly.get("ocean_current_direction", [None])[best_idx]
            wave_h = hourly.get("wave_height", [None])[best_idx]
            wave_d = hourly.get("wave_direction", [None])[best_idx]
            wave_p = hourly.get("wave_period", [None])[best_idx]

            if vel is not None and dir_deg is not None:
                return float(vel), float(dir_deg), wave_h, wave_d, wave_p

        # Fallback to current observation snapshot
        current = data.get("current", {})
        vel = current.get("ocean_current_velocity")
        dir_deg = current.get("ocean_current_direction")
        wave_h = current.get("wave_height")
        wave_d = current.get("wave_direction")
        wave_p = current.get("wave_period")
        return vel, dir_deg, wave_h, wave_d, wave_p

    def get_surface_current(
        self,
        latitude: float,
        longitude: float,
        timestamp: datetime,
    ) -> Tuple[float, float]:
        """Returns (u_current_ms, v_current_ms) eastward and northward current velocities in m/s."""
        data = self._fetch_live_data(latitude, longitude, target_time=timestamp)
        if data:
            vel_kmh, dir_deg, _, _, _ = self._extract_point_for_timestamp(data, timestamp)
            if vel_kmh is not None and dir_deg is not None:
                # Convert km/h to m/s
                speed_ms = float(vel_kmh) / 3.6
                # Oceanographic convention: direction TOWARDS which current sets
                dir_rad = math.radians(float(dir_deg) % 360.0)
                u_ms = speed_ms * math.sin(dir_rad)
                v_ms = speed_ms * math.cos(dir_rad)
                return (round(u_ms, 4), round(v_ms, 4))

        # Inland coordinate or network failure fallback
        return self.fallback.get_surface_current(latitude, longitude, timestamp)

    def get_marine_conditions(
        self,
        latitude: float,
        longitude: float,
        timestamp: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Provides full real-time oceanographic and wave diagnostics."""
        target_dt = timestamp or datetime.now(timezone.utc)
        data = self._fetch_live_data(latitude, longitude, target_time=target_dt)
        if data:
            vel_kmh, dir_deg, wave_h, wave_d, wave_p = self._extract_point_for_timestamp(data, target_dt)
            if vel_kmh is not None and dir_deg is not None:
                speed_ms = float(vel_kmh) / 3.6
                dir_rad = math.radians(float(dir_deg) % 360.0)
                u_ms = speed_ms * math.sin(dir_rad)
                v_ms = speed_ms * math.cos(dir_rad)
                return {
                    "source": "Open-Meteo Marine (Copernicus CMEMS & NOAA HyCOM)",
                    "latitude": latitude,
                    "longitude": longitude,
                    "timestamp": target_dt.isoformat(),
                    "current_speed_ms": round(speed_ms, 3),
                    "current_speed_knots": round(speed_ms / 0.514444, 2),
                    "current_direction_deg": round(float(dir_deg), 1),
                    "u_current_ms": round(u_ms, 4),
                    "v_current_ms": round(v_ms, 4),
                    "wave_height_m": round(float(wave_h), 2) if wave_h is not None else 1.1,
                    "wave_direction_deg": round(float(wave_d), 1) if wave_d is not None else 215.0,
                    "wave_period_s": round(float(wave_p), 1) if wave_p is not None else 8.2,
                    "is_live": True,
                }

        # Fallback to representative marine model
        fallback_res = self.fallback.get_marine_conditions(latitude, longitude, target_dt)
        fallback_res["source"] = "Representative Marine Current Model (Fallback)"
        fallback_res["is_live"] = False
        return fallback_res


class CopernicusMarineProvider(OceanCurrentProvider):
    """Production provider integrating CMEMS physical reanalysis/forecast via Open-Meteo Marine."""

    def __init__(self, username: str = "", password: str = ""):
        self.username = username
        self.password = password
        self.live_provider = OpenMeteoMarineCurrentProvider()
        self.fallback = MockOceanCurrentProvider()

    def get_surface_current(
        self,
        latitude: float,
        longitude: float,
        timestamp: datetime,
    ) -> Tuple[float, float]:
        return self.live_provider.get_surface_current(latitude, longitude, timestamp)

    def get_marine_conditions(
        self,
        latitude: float,
        longitude: float,
        timestamp: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        return self.live_provider.get_marine_conditions(latitude, longitude, timestamp)


def get_ocean_provider(use_live: bool = True) -> OceanCurrentProvider:
    """Factory returning live OpenMeteoMarineCurrentProvider (with mock fallback), or standalone Mock."""
    if use_live:
        return OpenMeteoMarineCurrentProvider()
    return MockOceanCurrentProvider()


