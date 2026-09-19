from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class SatelliteObservationBase(BaseModel):
    scene_id: str
    satellite_name: str
    sensor_type: str
    acquisition_time: datetime
    footprint_geojson: str
    cloud_cover_percentage: Optional[float] = 0.0
    resolution_meters: Optional[float] = 10.0
    raw_data_url: Optional[str] = None


class SatelliteObservationCreate(SatelliteObservationBase):
    pass


class SatelliteObservationResponse(SatelliteObservationBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
