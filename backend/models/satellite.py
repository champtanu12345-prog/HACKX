from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from backend.core.database import Base
from backend.models.base import TimestampMixin, generate_uuid


class SatelliteObservation(Base, TimestampMixin):
    __tablename__ = "satellite_observations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scene_id = Column(String(100), unique=True, nullable=False, index=True)
    satellite_name = Column(String(50), nullable=False)  # e.g., "Sentinel-1A", "Sentinel-2B"
    sensor_type = Column(String(20), nullable=False)     # "SAR", "OPTICAL"
    acquisition_time = Column(DateTime, nullable=False, index=True)
    footprint_geojson = Column(Text, nullable=False)     # GeoJSON Polygon string
    cloud_cover_percentage = Column(Float, default=0.0)
    resolution_meters = Column(Float, default=10.0)
    raw_data_url = Column(String(255), nullable=True)

    spill_detections = relationship("SpillDetection", back_populates="observation", cascade="all, delete-orphan")
