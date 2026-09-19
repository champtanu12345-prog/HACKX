"""AIS Spatiotemporal Correlation Engine.

Correlates vessel historical AIS positions with estimated spill discharge origins.
Calculates spatial proximity, temporal delta, trajectory alignment, and assigns
objective legal correlation categories without declarative accusations of guilt.
"""

import math
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional

from backend.services.providers.ais.models import (
    NormalizedAisPosition,
    CandidateVesselCorrelation,
    BehavioralAnomalyReport,
)
from backend.services.behavior_analyzer import behavior_analyzer
from backend.services.scoring_engine import (
    TransparentVesselScoringEngine,
    haversine_distance_km,
    haversine_distance_nm,
)


class AISCorrelationEngine:
    """Correlates vessel positions against reconstructed spill source origins."""

    def __init__(self, scoring_engine: Optional[TransparentVesselScoringEngine] = None):
        self.scoring_engine = scoring_engine or TransparentVesselScoringEngine()

    @staticmethod
    def _parse_time(t: Any) -> datetime:
        from datetime import timezone
        if isinstance(t, datetime):
            if t.tzinfo is None:
                return t.replace(tzinfo=timezone.utc)
            return t
        s = str(t).replace("Z", "+00:00")
        try:
            dt = datetime.fromisoformat(s)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except Exception:
            return datetime.now(timezone.utc)

    def correlate_vessels(
        self,
        vessels: List[Dict[str, Any]],
        source_lat: float,
        source_lon: float,
        source_time: datetime,
        search_radius_nm: float = 30.0,
        time_window_hours: float = 24.0,
    ) -> List[CandidateVesselCorrelation]:
        """Filters and ranks vessels near the estimated spill source locus.
        
        Args:
            vessels: List of vessel dictionaries with static metadata and positions.
            source_lat: Reconstructed source latitude (WGS84).
            source_lon: Reconstructed source longitude (WGS84).
            source_time: Estimated discharge time in UTC.
            search_radius_nm: Maximum Closest Point of Approach (CPA) radius in NM.
            time_window_hours: Maximum allowable time delta from discharge in hours.
            
        Returns:
            Ranked list of CandidateVesselCorrelation objects.
        """
        source_time = self._parse_time(source_time)
        candidates: List[CandidateVesselCorrelation] = []

        for v in vessels:
            positions = v.get("positions", [])
            if not positions:
                continue

            # Evaluate distance and time at each ping
            min_dist_nm = float("inf")
            best_time_diff_hours = float("inf")
            cpa_position: Optional[Dict[str, Any]] = None

            normalized_pings: List[NormalizedAisPosition] = []

            for p in positions:
                p_lat = float(p.get("latitude") or p.get("lat") or 0.0)
                p_lon = float(p.get("longitude") or p.get("lon") or 0.0)
                p_time = self._parse_time(p.get("timestamp") or p.get("timestamp_utc") or p.get("time"))

                dist_nm = haversine_distance_nm(source_lat, source_lon, p_lat, p_lon)
                time_diff_h = abs((p_time - source_time).total_seconds()) / 3600.0

                if dist_nm < min_dist_nm:
                    min_dist_nm = dist_nm
                    best_time_diff_hours = time_diff_h
                    cpa_position = p

                normalized_pings.append(
                    NormalizedAisPosition(
                        mmsi=str(v.get("mmsi")),
                        vessel_name=str(v.get("name", "Unknown")),
                        imo=v.get("imo"),
                        timestamp=p_time,
                        latitude=p_lat,
                        longitude=p_lon,
                        speed=float(p.get("sog") or p.get("speed") or p.get("sog_knots") or 0.0),
                        course=float(p.get("cog") or p.get("course") or p.get("cog_degrees") or 0.0),
                        heading=float(p.get("heading") or p.get("heading_degrees")) if p.get("heading") is not None else None,
                        navigation_status=str(p.get("nav_status") or "Under way using engine"),
                    )
                )

            # Filter irrelevant vessels outside search radius or temporal window
            if min_dist_nm > search_radius_nm or best_time_diff_hours > time_window_hours:
                continue

            # Detect behavioral anomalies
            anomalies = behavior_analyzer.analyze_vessel_trajectory(positions)
            existing_anomalies = v.get("anomalies", [])
            existing_types = {a.anomaly_type for a in anomalies}
            for ea in existing_anomalies:
                ea_type = ea.get("type") or ea.get("anomaly_type")
                if ea_type and ea_type.upper() not in existing_types:
                    anomalies.append(
                        BehavioralAnomalyReport(
                            anomaly_type=ea_type.upper(),
                            severity=ea.get("severity", "HIGH").upper(),
                            start_time=self._parse_time(ea.get("start_time") or source_time),
                            details=ea.get("details", ea.get("description", "Corridor anomaly flagged")),
                        )
                    )

            # Compute Explainable Multi-Criteria Score using TransparentVesselScoringEngine
            score_data = self.scoring_engine.score_vessel(
                vessel={
                    "id": v.get("id"),
                    "mmsi": v.get("mmsi"),
                    "name": v.get("name"),
                    "vessel_type": v.get("vessel_type"),
                    "flag_country": v.get("flag_country") or v.get("flag"),
                    "positions": positions,
                    "anomalies": [
                        {"anomaly_type": a.anomaly_type, "severity": a.severity, "details": a.details}
                        for a in anomalies
                    ],
                },
                origin_lat=source_lat,
                origin_lon=source_lon,
                origin_time=source_time,
            )

            overall_score = score_data["overall_score"]
            investigation_priority = score_data["investigation_priority"]

            # Assign strict, non-accusatory legal language category
            if overall_score >= 80.0:
                category = "Potential source vessel (Requires investigation)"
            elif overall_score >= 60.0:
                category = "High correlation (Requires investigation)"
            elif overall_score >= 30.0:
                category = "Moderate correlation"
            else:
                category = "Low correlation"

            # Identify latest/current position
            latest_pos = normalized_pings[-1] if normalized_pings else None

            candidates.append(
                CandidateVesselCorrelation(
                    vessel_id=str(v.get("id") or v.get("mmsi")),
                    mmsi=str(v.get("mmsi")),
                    name=str(v.get("name", "Unknown")),
                    vessel_type=str(v.get("vessel_type", "Cargo")),
                    flag_country=str(v.get("flag_country") or v.get("flag") or "Unknown"),
                    spatial_distance_nm=round(min_dist_nm, 2),
                    temporal_difference_hours=round(best_time_diff_hours, 1),
                    trajectory_alignment_score=score_data["trajectory_score"],
                    correlation_score=overall_score,
                    overall_score=overall_score,
                    spatial_score=score_data["spatial_score"],
                    temporal_score=score_data["temporal_score"],
                    trajectory_score=score_data["trajectory_score"],
                    behavior_score=score_data["behavior_score"],
                    investigation_priority=investigation_priority,
                    potential_source=score_data["potential_source"],
                    distance_km=score_data["distance_km"],
                    time_delta_minutes=score_data["time_delta_minutes"],
                    correlation_category=category,
                    evidence=score_data["evidence"],
                    explanations=score_data["explanations"],
                    anomalies=anomalies,
                    recent_positions=normalized_pings,
                    current_position=latest_pos,
                )
            )

        # Sort candidates descending by correlation score
        candidates.sort(key=lambda c: c.overall_score, reverse=True)
        return candidates


correlation_engine = AISCorrelationEngine()
