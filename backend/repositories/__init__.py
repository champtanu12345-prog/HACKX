from backend.repositories.base import BaseRepository
from backend.repositories.spill_repo import SpillRepository, spill_repo
from backend.repositories.vessel_repo import VesselRepository, vessel_repo
from backend.repositories.investigation_repo import InvestigationRepository, investigation_repo

__all__ = [
    "BaseRepository",
    "SpillRepository",
    "spill_repo",
    "VesselRepository",
    "vessel_repo",
    "InvestigationRepository",
    "investigation_repo",
]
