from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.core.database import Base
from backend.models.base import TimestampMixin, generate_uuid


class DriftRun(Base, TimestampMixin):
    __tablename__ = "drift_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    spill_id = Column(String(36), ForeignKey("spill_detections.id"), nullable=False)
    run_type = Column(String(20), nullable=False)  # "HINDCAST" or "FORECAST"
    simulation_start_time = Column(DateTime, nullable=False)
    simulation_end_time = Column(DateTime, nullable=False)
    duration_hours = Column(Float, default=24.0)
    particle_count = Column(Integer, default=200)
    estimated_origin_lat = Column(Float, nullable=True)
    estimated_origin_lon = Column(Float, nullable=True)
    estimated_origin_time = Column(DateTime, nullable=True)
    parameters_json = Column(Text, nullable=True)
    status = Column(String(20), default="COMPLETED")

    spill = relationship("SpillDetection", back_populates="drift_runs")
    trajectory_points = relationship("TrajectoryPoint", back_populates="drift_run", cascade="all, delete-orphan")


class TrajectoryPoint(Base, TimestampMixin):
    __tablename__ = "trajectory_points"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    drift_run_id = Column(String(36), ForeignKey("drift_runs.id"), nullable=False, index=True)
    timestep_utc = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    uncertainty_radius_m = Column(Float, default=500.0)
    wind_speed_ms = Column(Float, nullable=True)
    current_speed_ms = Column(Float, nullable=True)
    particle_index = Column(Integer, default=0)

    drift_run = relationship("DriftRun", back_populates="trajectory_points")
