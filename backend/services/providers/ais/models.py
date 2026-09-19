"""Normalized AIS Data Models.

Defines standardized Pydantic models for Automatic Identification System (AIS)
telemetry, vessel static properties, and behavioral anomalies.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


class NormalizedAisPosition(BaseModel):
    """Normalized AIS vessel position report (Types 1, 2, 3, 18, 19, 27)."""
    mmsi: str = Field(..., description="Maritime Mobile Service Identity (9-digit string)")
    vessel_name: str = Field("Unknown", description="Vessel broadcast name")
    imo: Optional[str] = Field(None, description="International Maritime Organization number")
    timestamp: datetime = Field(..., description="Observation timestamp in UTC")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="WGS84 Latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="WGS84 Longitude")
    speed: float = Field(..., ge=0.0, description="Speed Over Ground (SOG) in knots")
    course: float = Field(..., ge=0.0, le=360.0, description="Course Over Ground (COG) in degrees")
    heading: Optional[float] = Field(None, ge=0.0, le=360.0, description="True heading in degrees")
    navigation_status: str = Field("Under way using engine", description="Navigational status code/description")

    @field_validator("mmsi", mode="before")
    def clean_mmsi(cls, v: Any) -> str:
        s = str(v).strip()
        if "." in s:
            s = s.split(".")[0]
        return s.zfill(9)


class NormalizedVesselStatic(BaseModel):
    """Static vessel identity and voyage information (Type 5, 24)."""
    mmsi: str
    vessel_name: str
    imo: Optional[str] = None
    callsign: Optional[str] = None
    vessel_type: str = "Cargo"
    flag_country: str = "Unknown"
    length_m: Optional[float] = None
    width_m: Optional[float] = None
    draught_m: Optional[float] = None
    destination: Optional[str] = None


class BehavioralAnomalyReport(BaseModel):
    """Flagged behavioral anomaly detected along a vessel's trajectory."""
    anomaly_type: str = Field(
        ...,
        description="'AIS_GAP', 'SUDDEN_SPEED_DROP', 'UNUSUAL_COURSE_CHANGE', 'ROUTE_DEVIATION', 'LOITERING'",
    )
    severity: str = Field("HIGH", description="'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'")
    start_time: datetime
    end_time: Optional[datetime] = None
    details: str
    metric_value: Optional[float] = None


class CandidateVesselCorrelation(BaseModel):
    """Result of spatiotemporal correlation between a vessel and an oil slick."""
    vessel_id: str
    mmsi: str
    name: str
    vessel_type: str
    flag_country: str
    spatial_distance_nm: float = Field(..., description="Closest Point of Approach (CPA) in Nautical Miles")
    temporal_difference_hours: float = Field(..., description="Absolute time delta from estimated discharge")
    trajectory_alignment_score: float = Field(..., ge=0.0, le=100.0, description="Heading alignment score")
    correlation_score: float = Field(..., ge=0.0, le=100.0, description="Composite correlation score")
    overall_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Overall explainable correlation score")
    spatial_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Spatial proximity component (40%)")
    temporal_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Temporal alignment component (25%)")
    trajectory_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Trajectory match component (20%)")
    behavior_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Behavioral anomaly component (15%)")
    investigation_priority: str = Field(default="Low", description="'Low', 'Moderate', 'High', 'Very High'")
    potential_source: bool = Field(default=False, description="Whether vessel meets threshold for potential source triage")
    distance_km: float = Field(default=0.0, description="Closest Point of Approach in kilometers")
    time_delta_minutes: int = Field(default=0, description="Temporal delta in minutes to discharge window")
    correlation_category: str = Field(
        ...,
        description="Objective legal category: 'Potential source vessel', 'High correlation', 'Requires investigation', 'Moderate correlation', 'Low correlation'",
    )
    evidence: List[Dict[str, Any]] = Field(default_factory=list, description="Structured component evidence cards")
    explanations: List[str] = Field(default_factory=list, description="Human-readable investigation statements")
    anomalies: List[BehavioralAnomalyReport] = Field(default_factory=list)
    recent_positions: List[NormalizedAisPosition] = Field(default_factory=list)
    current_position: Optional[NormalizedAisPosition] = None

