from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.models.investigation import Investigation
from backend.repositories.base import BaseRepository


class InvestigationRepository(BaseRepository[Investigation]):
    def __init__(self):
        super().__init__(Investigation)

    def get_by_case_number(self, db: Session, case_number: str) -> Optional[Investigation]:
        return db.query(Investigation).filter(Investigation.case_number == case_number).first()

    def get_by_spill(self, db: Session, spill_id: str) -> List[Investigation]:
        return db.query(Investigation).filter(Investigation.spill_id == spill_id).all()

    def list_all(self, db: Session, limit: int = 50) -> List[Investigation]:
        return db.query(Investigation).order_by(desc(Investigation.created_at)).limit(limit).all()


investigation_repo = InvestigationRepository()
