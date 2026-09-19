"""Transparent Vessel Suspicion Scoring Engine.

Implements an explainable, deterministic multi-criteria scoring algorithm for maritime
oil spill investigation attribution.

Formula:
    Score = (0.40 * spatial_score) + (0.25 * temporal_score) + (0.20 * trajectory_score) + (0.15 * behavior_score)

Components normalized strictly to 0-100:
    - Spatial Proximity (40%): Distance to reconstructed discharge origin
    - Temporal Alignment (25%): Time variance to estimated discharge window
    - Trajectory Match (20%): Heading and course continuity relative to drift vector
    - Behavioral Anomaly (15%): AIS transmission gaps, deceleration, loitering

Severity Levels:
    - 0-29: Low
    - 30-59: Moderate
    - 60-79: High
    - 80-100: Very High

Non-Accusatory Standard:
    Terminology restricted to "Correlation score", "Investigation priority", "Potential source".
    Does NOT declare legal guilt.
"""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
import math
from typing import Dict, Any, List, Optional, Tuple


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates Great Circle distance in kilometers between two WGS84 coordinates."""
    R_KM = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R_KM * c


def haversine_distance_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates Great Circle distance in Nautical Miles between two WGS84 coordinates."""
    return haversine_distance_km(lat1, lon1, lat2, lon2) * 0.539957


def normalize_datetime(dt_val: Any) -> datetime:
    """Normalizes naive or aware datetime/iso-string to UTC timezone-aware datetime."""
    if isinstance(dt_val, datetime):
        if dt_val.tzinfo is None:
            return dt_val.replace(tzinfo=timezone.utc)
        return dt_val
    if not dt_val:
        return datetime.now(timezone.utc)
    s = str(dt_val).replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(s)
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed
    except Exception:
        return datetime.now(timezone.utc)


class VesselScoringEngine(ABC):
    """Abstract interface for scoring candidate vessels for oil spill attribution."""

    @abstractmethod
    def score_vessel(
        self,
        vessel: Dict[str, Any],
        origin_lat: float,
        origin_lon: float,
        origin_time: datetime,
        drift_direction_deg: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Calculates explainable multi-criteria correlation score."""
        pass


class TransparentVesselScoringEngine(VesselScoringEngine):
    """Transparent, explainable vessel suspicion scoring engine.
    
    Weights:
        - Spatial: 40%
        - Temporal: 25%
        - Trajectory: 20%
        - Behavioral: 15%
    """

    def __init__(
        self,
        w_spatial: float = 0.40,
        w_temporal: float = 0.25,
        w_trajectory: float = 0.20,
        w_behavior: float = 0.15,
        max_search_distance_km: float = 65.0,
        max_time_window_hours: float = 24.0,
    ):
        self.w_spatial = w_spatial
        self.w_temporal = w_temporal
        self.w_trajectory = w_trajectory
        self.w_behavior = w_behavior
        self.max_search_distance_km = max_search_distance_km
        self.max_time_window_hours = max_time_window_hours

    @staticmethod
    def get_severity_level(score: float) -> str:
        """Determines investigation priority severity level from 0-100 score."""
        if score >= 80.0:
            return "Very High"
        if score >= 60.0:
            return "High"
        if score >= 30.0:
            return "Moderate"
        return "Low"

    def score_vessel(
        self,
        vessel: Dict[str, Any],
        origin_lat: float,
        origin_lon: float,
        origin_time: datetime,
        drift_direction_deg: Optional[float] = None,
    ) -> Dict[str, Any]:
        origin_time_utc = normalize_datetime(origin_time)
        positions = vessel.get("positions", [])
        anomalies = vessel.get("anomalies", [])

        # ---------------------------------------------------------
        # 1. Spatial Proximity Evaluation (Weight: 40%)
        # ---------------------------------------------------------
        min_dist_km = 999.0
        min_dist_nm = 999.0
        cpa_pos: Optional[Dict[str, Any]] = None
        cpa_time_delta_min = 9999.0

        for p in positions:
            p_lat = float(p.get("latitude") if p.get("latitude") is not None else p.get("lat") or 0.0)
            p_lon = float(p.get("longitude") if p.get("longitude") is not None else p.get("lon") or 0.0)
            p_time = normalize_datetime(p.get("timestamp") or p.get("timestamp_utc") or p.get("time"))

            d_km = haversine_distance_km(origin_lat, origin_lon, p_lat, p_lon)
            time_delta_min = abs((p_time - origin_time_utc).total_seconds()) / 60.0

            if d_km < min_dist_km:
                min_dist_km = d_km
                min_dist_nm = d_km * 0.539957
                cpa_pos = p
                cpa_time_delta_min = time_delta_min

        # If vessel was within 1.0 km, spatial proximity is maximum 100.
        # Otherwise scales smoothly down to 0 at 45.0 km (~24.3 NM).
        if min_dist_km <= 1.0:
            spatial_score = 100.0
        elif min_dist_km >= self.max_search_distance_km:
            spatial_score = 0.0
        else:
            spatial_score = max(0.0, min(100.0, 100.0 * (1.0 - (min_dist_km / self.max_search_distance_km))))

        spatial_score = round(spatial_score, 1)

        # ---------------------------------------------------------
        # 2. Temporal Alignment Evaluation (Weight: 25%)
        # ---------------------------------------------------------
        # Time variance in minutes between vessel CPA and estimated discharge time
        if cpa_time_delta_min <= 15.0:
            temporal_score = max(95.0, 100.0 - (cpa_time_delta_min / 3.0))
        elif cpa_time_delta_min <= 60.0:
            temporal_score = max(80.0, 95.0 - ((cpa_time_delta_min - 15.0) / 3.0))
        else:
            max_window_min = self.max_time_window_hours * 60.0
            temporal_score = max(0.0, min(80.0, 80.0 * (1.0 - ((cpa_time_delta_min - 60.0) / (max_window_min - 60.0)))))

        temporal_score = round(temporal_score, 1)

        # ---------------------------------------------------------
        # 3. Trajectory Alignment Evaluation (Weight: 20%)
        # ---------------------------------------------------------
        # Checks heading/course alignment against bearing to source and drift axis
        cpa_heading = 0.0
        cpa_cog = 0.0
        if cpa_pos:
            cpa_heading = float(cpa_pos.get("heading") or cpa_pos.get("heading_deg") or cpa_pos.get("cog") or 0.0)
            cpa_cog = float(cpa_pos.get("cog") or cpa_pos.get("course") or cpa_pos.get("course_deg") or cpa_heading)

        # Bearing from vessel CPA to reconstructed source
        cpa_lat = float(cpa_pos.get("latitude") if cpa_pos and cpa_pos.get("latitude") is not None else (cpa_pos.get("lat") if cpa_pos else origin_lat))
        cpa_lon = float(cpa_pos.get("longitude") if cpa_pos and cpa_pos.get("longitude") is not None else (cpa_pos.get("lon") if cpa_pos else origin_lon))

        bearing_to_source = math.degrees(math.atan2(
            origin_lon - cpa_lon,
            origin_lat - cpa_lat,
        )) % 360.0

        target_dir = drift_direction_deg if drift_direction_deg is not None else bearing_to_source
        course_diff = abs((cpa_cog - target_dir + 180.0) % 360.0 - 180.0)

        # Trajectory alignment score (100 if aligned within 15 deg, scales down to 20 at 180 deg)
        if min_dist_km <= 2.0:
            # When vessel passed directly through origin locus, alignment is naturally high
            trajectory_score = max(80.0, 100.0 - (course_diff * 0.2))
        else:
            trajectory_score = max(10.0, min(100.0, 100.0 - (course_diff / 180.0) * 85.0))

        trajectory_score = round(trajectory_score, 1)

        # ---------------------------------------------------------
        # 4. Behavioral Anomaly Evaluation (Weight: 15%)
        # ---------------------------------------------------------
        behavior_points = 0.0
        has_ais_gap = False
        has_speed_drop = False
        has_loitering = False
        has_course_change = False

        for a in anomalies:
            a_type = (a.get("anomaly_type") or a.get("type") or "").upper()
            if "AIS_GAP" in a_type:
                behavior_points += 45.0
                has_ais_gap = True
            elif "DECELERATION" in a_type or "SPEED_DROP" in a_type:
                behavior_points += 30.0
                has_speed_drop = True
            elif "LOITERING" in a_type:
                behavior_points += 20.0
                has_loitering = True
            elif "COURSE" in a_type or "DEVIATION" in a_type:
                behavior_points += 15.0
                has_course_change = True

        # Check trajectory speeds for abrupt deceleration if not explicitly flagged
        speeds = [float(p.get("sog") or p.get("speed") or 0.0) for p in positions if (p.get("sog") is not None or p.get("speed") is not None)]
        if len(speeds) >= 2 and not has_speed_drop:
            max_s = max(speeds)
            min_s = min(speeds)
            if max_s > 10.0 and min_s < 5.0:
                behavior_points += 25.0
                has_speed_drop = True

        behavior_score = round(min(100.0, behavior_points), 1)

        # ---------------------------------------------------------
        # Final Transparent Multi-Criteria Calculation
        # ---------------------------------------------------------
        # Formula: 0.40 * spatial + 0.25 * temporal + 0.20 * trajectory + 0.15 * behavior
        overall_score = round(
            (self.w_spatial * spatial_score)
            + (self.w_temporal * temporal_score)
            + (self.w_trajectory * trajectory_score)
            + (self.w_behavior * behavior_score),
            1,
        )
        overall_score = max(0.0, min(100.0, overall_score))

        investigation_priority = self.get_severity_level(overall_score)
        potential_source = overall_score >= 60.0

        # ---------------------------------------------------------
        # Structured Evidence Generation
        # ---------------------------------------------------------
        evidence: List[Dict[str, Any]] = [
            {
                "component": "spatial_proximity",
                "reason": "Vessel passed close to reconstructed source" if min_dist_km <= 15.0 else "Vessel passed in outer search corridor of reconstructed source",
                "distance_km": round(min_dist_km, 1),
                "distance_nm": round(min_dist_nm, 2),
                "score": spatial_score,
                "weight": self.w_spatial,
                "contribution": round(self.w_spatial * spatial_score, 1),
            },
            {
                "component": "temporal_alignment",
                "reason": (
                    f"Vessel was within {int(round(cpa_time_delta_min))} minutes of the estimated release time."
                    if cpa_time_delta_min < 120.0
                    else f"Vessel was within {round(cpa_time_delta_min / 60.0, 1)} hours of the estimated release time."
                ),
                "time_delta_minutes": int(round(cpa_time_delta_min)),
                "time_delta_hours": round(cpa_time_delta_min / 60.0, 1),
                "score": temporal_score,
                "weight": self.w_temporal,
                "contribution": round(self.w_temporal * temporal_score, 1),
            },
            {
                "component": "trajectory_alignment",
                "reason": "Observed heading was strongly aligned with reconstructed drift." if trajectory_score >= 75.0 else "Observed transit heading had moderate angular divergence from drift axis.",
                "heading_deg": round(cpa_heading, 1),
                "course_diff_deg": round(course_diff, 1),
                "score": trajectory_score,
                "weight": self.w_trajectory,
                "contribution": round(self.w_trajectory * trajectory_score, 1),
            },
            {
                "component": "behavioral_anomaly",
                "reason": (
                    "AIS transmission gap occurred near the source window."
                    if has_ais_gap
                    else ("Transit speed deceleration recorded without anchoring." if has_speed_drop else "Nominal transit kinematics observed.")
                ),
                "anomaly_flags": [a.get("anomaly_type") or a.get("type") for a in anomalies],
                "score": behavior_score,
                "weight": self.w_behavior,
                "contribution": round(self.w_behavior * behavior_score, 1),
            },
        ]

        # ---------------------------------------------------------
        # Human-Readable Investigation Explanations
        # ---------------------------------------------------------
        explanations: List[str] = [
            f"Vessel was {round(min_dist_km, 1)} km ({round(min_dist_nm, 2)} NM) from the reconstructed source.",
            (
                f"Vessel was within {int(round(cpa_time_delta_min))} minutes of the estimated release time."
                if cpa_time_delta_min < 120.0
                else f"Vessel was within {round(cpa_time_delta_min / 60.0, 1)} hours of the estimated release time."
            ),
            (
                "Observed heading was strongly aligned with reconstructed drift."
                if trajectory_score >= 75.0
                else f"Observed heading had {round(course_diff, 0)}° offset from reconstructed drift trajectory."
            ),
        ]

        if has_ais_gap:
            explanations.append("AIS transmission gap occurred near the source window.")
        elif has_speed_drop:
            explanations.append("Sudden speed reduction observed during passage across the discharge zone.")
        elif has_loitering:
            explanations.append("Loitering behavior detected along transit corridor.")

        # Non-accusatory investigation disclaimer
        disclaimer = "Correlation score indicates investigation priority only; this metric does not constitute legal proof of discharge."

        return {
            "vessel_id": vessel.get("id", vessel.get("mmsi")),
            "mmsi": vessel.get("mmsi"),
            "name": vessel.get("name", "Unknown"),
            "vessel_type": vessel.get("vessel_type", "Cargo"),
            "flag_country": vessel.get("flag_country") or vessel.get("flag") or "Unknown",
            "overall_score": overall_score,
            "composite_score": overall_score,  # Backwards compatibility alias
            "spatial_score": spatial_score,
            "proximity_score": spatial_score,  # Backwards compatibility alias
            "temporal_score": temporal_score,
            "trajectory_score": trajectory_score,
            "trajectory_alignment": trajectory_score,  # Backwards compatibility alias
            "behavior_score": behavior_score,
            "speed_anomaly_score": round(behavior_points, 1),  # Backwards compatibility alias
            "ais_gap_penalty": 95.0 if has_ais_gap else 0.0,  # Backwards compatibility alias
            "investigation_priority": investigation_priority,
            "potential_source": potential_source,
            "min_distance_km": round(min_dist_km, 1),
            "distance_km": round(min_dist_km, 1),
            "min_distance_nm": round(min_dist_nm, 2),
            "time_delta_minutes": int(round(cpa_time_delta_min)),
            "time_delta_hours": round(cpa_time_delta_min / 60.0, 1),
            "evidence": evidence,
            "explanations": explanations,
            "disclaimer": disclaimer,
            "anomalies": anomalies,
            "recent_positions": positions,
        }


# Backward compatibility alias
WeightedVesselScoringEngine = TransparentVesselScoringEngine

__all__ = [
    "VesselScoringEngine",
    "TransparentVesselScoringEngine",
    "WeightedVesselScoringEngine",
    "haversine_distance_km",
    "haversine_distance_nm",
    "normalize_datetime",
]
