from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from backend.schemas.satellite import SatelliteObservationResponse


class SpillDetectionBase(BaseModel):
    detection_time: datetime
    geometry_geojson: str
    centroid_lat: float
    centroid_lon: float
    area_sqkm: float
    perimeter_km: float
    estimated_volume_m3: Optional[float] = None
    estimated_age_hours: Optional[float] = 12.0
    confidence_score: float
    region_name: Optional[str] = "Arabian Sea"


class SpillDetectionCreate(SpillDetectionBase):
    observation_id: Optional[str] = None


class SpillDetectionResponse(SpillDetectionBase):
    id: str
    observation_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    observation: Optional[SatelliteObservationResponse] = None

    model_config = ConfigDict(from_attributes=True)


class SpillSummaryResponse(BaseModel):
    total_spills: int
    total_area_sqkm: float
    high_confidence_count: int
    regions: List[str]
