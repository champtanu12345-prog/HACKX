from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class AisPositionBase(BaseModel):
    timestamp_utc: datetime
    latitude: float
    longitude: float
    sog_knots: float
    cog_degrees: float
    heading_degrees: Optional[float] = None
    nav_status: Optional[str] = "Under way using engine"


class AisPositionResponse(AisPositionBase):
    id: str
    vessel_id: str

    model_config = ConfigDict(from_attributes=True)


class VesselAnomalyResponse(BaseModel):
    id: str
    vessel_id: str
    spill_id: Optional[str] = None
    anomaly_type: str
    start_time: datetime
    end_time: Optional[datetime] = None
    severity: str
    details: str

    model_config = ConfigDict(from_attributes=True)


class VesselBase(BaseModel):
    mmsi: str
    imo: Optional[str] = None
    name: str
    callsign: Optional[str] = None
    vessel_type: str
    flag_country: str
    length_m: Optional[float] = None
    width_m: Optional[float] = None
    draught_m: Optional[float] = None


class VesselResponse(VesselBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VesselScoreResponse(BaseModel):
    id: str
    spill_id: str
    vessel_id: str
    rank: int
    composite_score: float
    proximity_score: float
    trajectory_alignment: float
    speed_anomaly_score: float
    ais_gap_penalty: float
    details_json: Optional[str] = None
    vessel: Optional[VesselResponse] = None

    model_config = ConfigDict(from_attributes=True)


class SuspectAttributionResponse(BaseModel):
    vessel_id: str
    mmsi: str
    imo: Optional[str] = None
    name: str
    vessel_type: str
    flag_country: str
    rank: int
    composite_score: float
    overall_score: Optional[float] = None
    proximity_score: float
    spatial_score: Optional[float] = None
    temporal_score: Optional[float] = None
    trajectory_alignment: float
    trajectory_score: Optional[float] = None
    speed_anomaly_score: float
    behavior_score: Optional[float] = None
    ais_gap_penalty: float
    investigation_priority: Optional[str] = "Low"
    potential_source: Optional[bool] = False
    min_distance_nm: Optional[float] = None
    distance_km: Optional[float] = None
    time_delta_minutes: Optional[int] = None
    evidence: List[Dict[str, Any]] = []
    explanations: List[str] = []
    anomalies: List[Dict[str, Any]] = []
    recent_positions: List[Dict[str, Any]] = []


class SuspectsListResponse(BaseModel):
    spill_id: str
    total_evaluated: int
    suspects: List[SuspectAttributionResponse]
