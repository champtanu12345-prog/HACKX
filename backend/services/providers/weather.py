import json
import logging
import math
import time
import urllib.request
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger(__name__)


class WeatherProvider(ABC):
    """Abstract interface for Atmospheric Wind Forcing (e.g. NOAA GFS / ECMWF)."""

    @abstractmethod
    def get_surface_wind(
        self,
        latitude: float,
        longitude: float,
        timestamp: datetime,
    ) -> Tuple[float, float]:
        """Returns (u_wind_ms, v_wind_ms) zonal and meridional 10m wind speed in m/s (u: Eastward, v: Northward)."""
        pass

    def get_wind_conditions(
        self,
        latitude: float,
        longitude: float,
        timestamp: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Returns detailed surface wind diagnostic metrics."""
        u_ms, v_ms = self.get_surface_wind(latitude, longitude, timestamp or datetime.now(timezone.utc))
        speed_ms = math.sqrt(u_ms**2 + v_ms**2)
        # Wind direction is direction FROM which wind blows
        towards_deg = (math.degrees(math.atan2(u_ms, v_ms)) + 360.0) % 360.0
        from_deg = (towards_deg + 180.0) % 360.0
        return {
            "source": "Mock Atmospheric Model",
            "latitude": latitude,
            "longitude": longitude,
            "timestamp": (timestamp or datetime.now(timezone.utc)).isoformat(),
            "wind_speed_ms": round(speed_ms, 2),
            "wind_speed_knots": round(speed_ms / 0.514444, 2),
            "wind_direction_deg": round(from_deg, 1),
            "wind_gusts_ms": round(speed_ms * 1.35, 2),
            "u_wind_ms": round(u_ms, 4),
            "v_wind_ms": round(v_ms, 4),
            "is_live": False,
        }


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


class OpenMeteoWeatherProvider(WeatherProvider):
    """Production provider fetching real live 10m surface winds and gusts from Open-Meteo Forecast API.

    Underlying atmospheric models: NOAA Global Forecast System (GFS) & ECMWF Integrated Forecasting System (IFS).
    """

    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    def __init__(
        self,
        fallback: Optional[WeatherProvider] = None,
        timeout_seconds: float = 4.0,
        cache_ttl_seconds: int = 900,
    ):
        self.fallback = fallback or MockWeatherProvider()
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
        """Queries Open-Meteo Forecast API with spatial grid caching and TTL."""
        now_dt = datetime.now(timezone.utc)
        target = target_time or now_dt
        if target.tzinfo is None:
            target = target.replace(tzinfo=timezone.utc)

        time_diff_days = (now_dt - target).total_seconds() / 86400.0

        if -2.0 <= time_diff_days <= 7.0:
            date_param = "past_days=7&forecast_days=3"
            cache_sub_key = "recent"
        else:
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
            f"&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m"
            f"&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m"
            f"&wind_speed_unit=ms&{date_param}"
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
                f"[OpenMeteoWeather] Forecast API query failed for ({latitude}, {longitude}, {target}): {exc}. "
                f"Falling back to representative wind forcing model."
            )
        return None

    def _extract_point_for_timestamp(
        self,
        data: Dict[str, Any],
        target_time: Optional[datetime],
    ) -> Tuple[Optional[float], Optional[float], Optional[float]]:
        """Extracts (wind_speed_ms, wind_direction_deg, wind_gusts_ms)."""
        if target_time is not None and target_time.tzinfo is None:
            target_time = target_time.replace(tzinfo=timezone.utc)

        hourly = data.get("hourly")
        if hourly and "time" in hourly and target_time is not None:
            times = hourly["time"]
            target_ts = target_time.timestamp()
            best_idx = 0
            best_diff = float("inf")

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

            speed = hourly.get("wind_speed_10m", [None])[best_idx]
            direction = hourly.get("wind_direction_10m", [None])[best_idx]
            gusts = hourly.get("wind_gusts_10m", [None])[best_idx]

            if speed is not None and direction is not None:
                return float(speed), float(direction), float(gusts) if gusts is not None else None

        current = data.get("current", {})
        speed = current.get("wind_speed_10m")
        direction = current.get("wind_direction_10m")
        gusts = current.get("wind_gusts_10m")
        return (
            float(speed) if speed is not None else None,
            float(direction) if direction is not None else None,
            float(gusts) if gusts is not None else None,
        )

    def get_surface_wind(
        self,
        latitude: float,
        longitude: float,
        timestamp: datetime,
    ) -> Tuple[float, float]:
        """Returns (u_wind_ms, v_wind_ms) eastward and northward 10m wind speed in m/s."""
        data = self._fetch_live_data(latitude, longitude, target_time=timestamp)
        if data:
            speed_ms, dir_deg, _ = self._extract_point_for_timestamp(data, timestamp)
            if speed_ms is not None and dir_deg is not None:
                # Meteorological convention: direction FROM which wind blows
                # Towards direction: (dir_deg + 180) % 360
                towards_rad = math.radians((float(dir_deg) + 180.0) % 360.0)
                u_ms = float(speed_ms) * math.sin(towards_rad)
                v_ms = float(speed_ms) * math.cos(towards_rad)
                return (round(u_ms, 4), round(v_ms, 4))

        return self.fallback.get_surface_wind(latitude, longitude, timestamp)

    def get_wind_conditions(
        self,
        latitude: float,
        longitude: float,
        timestamp: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Provides full real-time atmospheric wind conditions."""
        target_dt = timestamp or datetime.now(timezone.utc)
        data = self._fetch_live_data(latitude, longitude, target_time=target_dt)
        if data:
            speed_ms, dir_deg, gusts_ms = self._extract_point_for_timestamp(data, target_dt)
            if speed_ms is not None and dir_deg is not None:
                towards_rad = math.radians((float(dir_deg) + 180.0) % 360.0)
                u_ms = float(speed_ms) * math.sin(towards_rad)
                v_ms = float(speed_ms) * math.cos(towards_rad)
                return {
                    "source": "Open-Meteo Atmospheric Forecast (NOAA GFS / ECMWF)",
                    "latitude": latitude,
                    "longitude": longitude,
                    "timestamp": target_dt.isoformat(),
                    "wind_speed_ms": round(float(speed_ms), 2),
                    "wind_speed_knots": round(float(speed_ms) / 0.514444, 2),
                    "wind_direction_deg": round(float(dir_deg), 1),
                    "wind_gusts_ms": round(float(gusts_ms), 2) if gusts_ms is not None else round(float(speed_ms) * 1.3, 2),
                    "u_wind_ms": round(u_ms, 4),
                    "v_wind_ms": round(v_ms, 4),
                    "is_live": True,
                }

        fallback_res = self.fallback.get_wind_conditions(latitude, longitude, target_dt)
        fallback_res["source"] = "Representative Wind Forcing Model (Fallback)"
        fallback_res["is_live"] = False
        return fallback_res


class NOAAWeatherProvider(WeatherProvider):
    """Production provider connecting to NOAA GFS / ECMWF via Open-Meteo."""

    def __init__(self, api_url: str = ""):
        self.api_url = api_url
        self.live_provider = OpenMeteoWeatherProvider()
        self.fallback = MockWeatherProvider()

    def get_surface_wind(
        self,
        latitude: float,
        longitude: float,
        timestamp: datetime,
    ) -> Tuple[float, float]:
        return self.live_provider.get_surface_wind(latitude, longitude, timestamp)

    def get_wind_conditions(
        self,
        latitude: float,
        longitude: float,
        timestamp: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        return self.live_provider.get_wind_conditions(latitude, longitude, timestamp)


def get_weather_provider(use_live: bool = True) -> WeatherProvider:
    """Factory returning live OpenMeteoWeatherProvider (with mock fallback), or standalone Mock."""
    if use_live:
        return OpenMeteoWeatherProvider()
    return MockWeatherProvider()


