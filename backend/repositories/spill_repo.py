from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.models.spill import SpillDetection
from backend.models.drift import DriftRun
from backend.repositories.base import BaseRepository


class SpillRepository(BaseRepository[SpillDetection]):
    def __init__(self):
        super().__init__(SpillDetection)

    def get_recent(self, db: Session, limit: int = 50, min_confidence: float = 0.5) -> List[SpillDetection]:
        return (
            db.query(SpillDetection)
            .filter(SpillDetection.confidence_score >= min_confidence)
            .order_by(desc(SpillDetection.detection_time))
            .limit(limit)
            .all()
        )

    def get_drift_runs(self, db: Session, spill_id: str) -> List[DriftRun]:
        return (
            db.query(DriftRun)
            .filter(DriftRun.spill_id == spill_id)
            .order_by(desc(DriftRun.created_at))
            .all()
        )


spill_repo = SpillRepository()
