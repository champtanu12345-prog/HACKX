"""Vessel Navigational Behavior Analysis Engine.

Detects AIS transmission gaps, sharp speed reductions, unusual course changes,
route deviations, and loitering maneuvers along vessel trajectories.
Adheres strictly to non-accusatory maritime legal language.
"""

import math
from datetime import datetime
from typing import List, Dict, Any, Optional

from backend.services.providers.ais.models import BehavioralAnomalyReport


class VesselBehaviorAnalyzer:
    """Detects behavioral anomalies from chronological AIS position reports."""

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

    def analyze_vessel_trajectory(
        self,
        positions: List[Dict[str, Any]],
        corridor_heading_deg: Optional[float] = None,
    ) -> List[BehavioralAnomalyReport]:
        """Analyzes a chronological series of AIS pings to flag behavioral anomalies.
        
        Evaluates:
        1. AIS Gaps (Dark ship periods > 90 min)
        2. Sudden Speed Drops (Deceleration > 4.5 knots)
        3. Unusual Course Changes (Course alterations > 35 degrees)
        4. Route Deviations (Deviations from standard channel)
        5. Loitering Behavior (SOG < 3.5 knots for sustained periods)
        """
        if len(positions) < 2:
            return []

        # Ensure chronological order
        sorted_pos = sorted(positions, key=lambda p: self._parse_time(p.get("timestamp") or p.get("timestamp_utc") or p.get("time")))
        anomalies: List[BehavioralAnomalyReport] = []

        # 1. AIS Gap Detection
        for i in range(len(sorted_pos) - 1):
            t1 = self._parse_time(sorted_pos[i].get("timestamp") or sorted_pos[i].get("timestamp_utc") or sorted_pos[i].get("time"))
            t2 = self._parse_time(sorted_pos[i + 1].get("timestamp") or sorted_pos[i + 1].get("timestamp_utc") or sorted_pos[i + 1].get("time"))
            gap_seconds = (t2 - t1).total_seconds()
            gap_hours = gap_seconds / 3600.0

            if gap_hours >= 1.5:
                severity = "CRITICAL" if gap_hours >= 2.5 else "HIGH"
                anomalies.append(
                    BehavioralAnomalyReport(
                        anomaly_type="AIS_GAP",
                        severity=severity,
                        start_time=t1,
                        end_time=t2,
                        details=f"AIS transponder signal absent for {gap_hours:.1f} hours without reported occlusion",
                        metric_value=round(gap_hours, 2),
                    )
                )

        # 2. Sudden Speed Drop Detection
        for i in range(len(sorted_pos) - 1):
            s1 = float(sorted_pos[i].get("sog") or sorted_pos[i].get("speed") or sorted_pos[i].get("sog_knots") or 0.0)
            s2 = float(sorted_pos[i + 1].get("sog") or sorted_pos[i + 1].get("speed") or sorted_pos[i + 1].get("sog_knots") or 0.0)
            t1 = self._parse_time(sorted_pos[i].get("timestamp") or sorted_pos[i].get("timestamp_utc") or sorted_pos[i].get("time"))
            t2 = self._parse_time(sorted_pos[i + 1].get("timestamp") or sorted_pos[i + 1].get("timestamp_utc") or sorted_pos[i + 1].get("time"))

            delta_time_hours = max(0.1, (t2 - t1).total_seconds() / 3600.0)
            speed_drop = s1 - s2

            if speed_drop >= 4.5 and delta_time_hours <= 4.0:
                anomalies.append(
                    BehavioralAnomalyReport(
                        anomaly_type="SUDDEN_SPEED_DROP",
                        severity="HIGH",
                        start_time=t1,
                        end_time=t2,
                        details=f"Sudden speed reduction of {speed_drop:.1f} kn ({s1:.1f} kn to {s2:.1f} kn), consistent with slow maneuvering",
                        metric_value=round(speed_drop, 1),
                    )
                )

        # 3. Unusual Course Alterations
        for i in range(len(sorted_pos) - 1):
            c1 = float(sorted_pos[i].get("cog") or sorted_pos[i].get("course") or sorted_pos[i].get("cog_degrees") or 0.0)
            c2 = float(sorted_pos[i + 1].get("cog") or sorted_pos[i + 1].get("course") or sorted_pos[i + 1].get("cog_degrees") or 0.0)
            t1 = self._parse_time(sorted_pos[i].get("timestamp") or sorted_pos[i].get("timestamp_utc") or sorted_pos[i].get("time"))
            t2 = self._parse_time(sorted_pos[i + 1].get("timestamp") or sorted_pos[i + 1].get("timestamp_utc") or sorted_pos[i + 1].get("time"))

            # Calculate angular difference on a circle
            course_diff = abs((c2 - c1 + 180.0) % 360.0 - 180.0)
            if course_diff >= 35.0:
                anomalies.append(
                    BehavioralAnomalyReport(
                        anomaly_type="UNUSUAL_COURSE_CHANGE",
                        severity="MEDIUM",
                        start_time=t1,
                        end_time=t2,
                        details=f"Course alteration of {course_diff:.1f}° (from {c1:.0f}° to {c2:.0f}°)",
                        metric_value=round(course_diff, 1),
                    )
                )

        # 4. Loitering Behavior
        low_speed_pings = [
            p for p in sorted_pos
            if float(p.get("sog") or p.get("speed") or p.get("sog_knots") or 0.0) < 3.5
        ]
        if len(low_speed_pings) >= 2:
            t_start = self._parse_time(low_speed_pings[0].get("timestamp") or low_speed_pings[0].get("timestamp_utc") or low_speed_pings[0].get("time"))
            t_end = self._parse_time(low_speed_pings[-1].get("timestamp") or low_speed_pings[-1].get("timestamp_utc") or low_speed_pings[-1].get("time"))
            loiter_hours = (t_end - t_start).total_seconds() / 3600.0

            if loiter_hours >= 1.0:
                mean_spd = sum(
                    float(p.get("sog") or p.get("speed") or p.get("sog_knots") or 0.0) for p in low_speed_pings
                ) / len(low_speed_pings)
                anomalies.append(
                    BehavioralAnomalyReport(
                        anomaly_type="LOITERING",
                        severity="HIGH",
                        start_time=t_start,
                        end_time=t_end,
                        details=f"Sustained slow-speed loitering (avg {mean_spd:.1f} kn) maintained for {loiter_hours:.1f} hours",
                        metric_value=round(loiter_hours, 1),
                    )
                )

        # 5. Route Deviations (if corridor heading provided)
        if corridor_heading_deg is not None:
            for p in sorted_pos:
                cog = float(p.get("cog") or p.get("course") or p.get("cog_degrees") or 0.0)
                diff = abs((cog - corridor_heading_deg + 180.0) % 360.0 - 180.0)
                if diff >= 40.0:
                    t = self._parse_time(p.get("timestamp") or p.get("timestamp_utc") or p.get("time"))
                    anomalies.append(
                        BehavioralAnomalyReport(
                            anomaly_type="ROUTE_DEVIATION",
                            severity="MEDIUM",
                            start_time=t,
                            details=f"Departure of {diff:.1f}° from standard shipping fairway ({corridor_heading_deg:.0f}°)",
                            metric_value=round(diff, 1),
                        )
                    )
                    break

        return anomalies


behavior_analyzer = VesselBehaviorAnalyzer()
