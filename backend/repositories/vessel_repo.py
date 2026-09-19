from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.models.vessel import Vessel, AisPosition, VesselAnomaly, VesselScore
from backend.repositories.base import BaseRepository


class VesselRepository(BaseRepository[Vessel]):
    def __init__(self):
        super().__init__(Vessel)

    def get_by_mmsi(self, db: Session, mmsi: str) -> Optional[Vessel]:
        return db.query(Vessel).filter(Vessel.mmsi == mmsi).first()

    def get_vessel_positions(self, db: Session, vessel_id: str, limit: int = 100) -> List[AisPosition]:
        return (
            db.query(AisPosition)
            .filter(AisPosition.vessel_id == vessel_id)
            .order_by(AisPosition.timestamp_utc.asc())
            .limit(limit)
            .all()
        )

    def get_vessel_anomalies(self, db: Session, vessel_id: str) -> List[VesselAnomaly]:
        return (
            db.query(VesselAnomaly)
            .filter(VesselAnomaly.vessel_id == vessel_id)
            .order_by(desc(VesselAnomaly.start_time))
            .all()
        )

    def get_scores_for_spill(self, db: Session, spill_id: str) -> List[VesselScore]:
        return (
            db.query(VesselScore)
            .filter(VesselScore.spill_id == spill_id)
            .order_by(VesselScore.rank.asc())
            .all()
        )


vessel_repo = VesselRepository()
