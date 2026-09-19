from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.core.database import Base
from backend.models.base import TimestampMixin, generate_uuid


class Investigation(Base, TimestampMixin):
    __tablename__ = "investigations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_number = Column(String(50), unique=True, nullable=False, index=True)
    spill_id = Column(String(36), ForeignKey("spill_detections.id"), nullable=False, index=True)
    primary_suspect_id = Column(String(36), ForeignKey("vessels.id"), nullable=True, index=True)
    status = Column(String(30), default="OPEN", index=True)  # OPEN, TRIAGED, ESCALATED_TO_COAST_GUARD, CLOSED
    lead_agency = Column(String(100), default="Indian Coast Guard")
    summary_notes = Column(Text, nullable=True)
    evidence_package_json = Column(Text, nullable=True)

    spill = relationship("SpillDetection", back_populates="investigations")
    primary_suspect = relationship("Vessel")
