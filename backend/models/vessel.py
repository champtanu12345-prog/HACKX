from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.core.database import Base
from backend.models.base import TimestampMixin, generate_uuid


class Vessel(Base, TimestampMixin):
    __tablename__ = "vessels"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    mmsi = Column(String(9), unique=True, nullable=False, index=True)
    imo = Column(String(10), nullable=True)
    name = Column(String(100), nullable=False)
    callsign = Column(String(20), nullable=True)
    vessel_type = Column(String(50), nullable=False, default="Cargo")
    flag_country = Column(String(50), nullable=False, default="Unknown")
    length_m = Column(Float, nullable=True)
    width_m = Column(Float, nullable=True)
    draught_m = Column(Float, nullable=True)

    positions = relationship("AisPosition", back_populates="vessel", cascade="all, delete-orphan")
    anomalies = relationship("VesselAnomaly", back_populates="vessel", cascade="all, delete-orphan")
    scores = relationship("VesselScore", back_populates="vessel", cascade="all, delete-orphan")


class AisPosition(Base, TimestampMixin):
    __tablename__ = "ais_positions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    vessel_id = Column(String(36), ForeignKey("vessels.id"), nullable=False, index=True)
    timestamp_utc = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    sog_knots = Column(Float, nullable=False)  # Speed Over Ground
    cog_degrees = Column(Float, nullable=False)  # Course Over Ground
    heading_degrees = Column(Float, nullable=True)
    nav_status = Column(String(50), default="Under way using engine")

    vessel = relationship("Vessel", back_populates="positions")


class VesselAnomaly(Base, TimestampMixin):
    __tablename__ = "vessel_anomalies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    vessel_id = Column(String(36), ForeignKey("vessels.id"), nullable=False, index=True)
    spill_id = Column(String(36), ForeignKey("spill_detections.id"), nullable=True, index=True)
    anomaly_type = Column(String(50), nullable=False)  # "AIS_GAP_DARK_SHIP", "SUDDEN_DECELERATION"
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    severity = Column(String(20), default="HIGH")  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    details = Column(Text, nullable=False)

    vessel = relationship("Vessel", back_populates="anomalies")


class VesselScore(Base, TimestampMixin):
    __tablename__ = "vessel_scores"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    spill_id = Column(String(36), ForeignKey("spill_detections.id"), nullable=False, index=True)
    vessel_id = Column(String(36), ForeignKey("vessels.id"), nullable=False, index=True)
    rank = Column(Integer, default=1)
    composite_score = Column(Float, nullable=False)  # 0 to 100
    proximity_score = Column(Float, default=0.0)
    trajectory_alignment = Column(Float, default=0.0)
    speed_anomaly_score = Column(Float, default=0.0)
    ais_gap_penalty = Column(Float, default=0.0)
    details_json = Column(Text, nullable=True)

    spill = relationship("SpillDetection", back_populates="vessel_scores")
    vessel = relationship("Vessel", back_populates="scores")
