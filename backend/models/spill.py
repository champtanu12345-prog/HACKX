from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.core.database import Base
from backend.models.base import TimestampMixin, generate_uuid


class SpillDetection(Base, TimestampMixin):
    __tablename__ = "spill_detections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    observation_id = Column(String(36), ForeignKey("satellite_observations.id"), nullable=True)
    detection_time = Column(DateTime, nullable=False, index=True)
    geometry_geojson = Column(Text, nullable=False)     # GeoJSON polygon of detected slick
    centroid_lat = Column(Float, nullable=False, index=True)
    centroid_lon = Column(Float, nullable=False, index=True)
    area_sqkm = Column(Float, nullable=False)
    perimeter_km = Column(Float, nullable=False)
    estimated_volume_m3 = Column(Float, nullable=True)
    estimated_age_hours = Column(Float, default=12.0)
    confidence_score = Column(Float, nullable=False, default=0.85)
    region_name = Column(String(100), default="Arabian Sea")

    observation = relationship("SatelliteObservation", back_populates="spill_detections")
    drift_runs = relationship("DriftRun", back_populates="spill", cascade="all, delete-orphan")
    vessel_scores = relationship("VesselScore", back_populates="spill", cascade="all, delete-orphan")
    investigations = relationship("Investigation", back_populates="spill")
