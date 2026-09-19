from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, ConfigDict
from backend.schemas.spill import SpillDetectionResponse
from backend.schemas.vessel import VesselResponse


class InvestigationBase(BaseModel):
    case_number: str
    spill_id: str
    primary_suspect_id: Optional[str] = None
    status: str = "OPEN"
    lead_agency: Optional[str] = "Indian Coast Guard"
    summary_notes: Optional[str] = None
    evidence_package_json: Optional[str] = None


class InvestigationCreate(BaseModel):
    spill_id: str
    primary_suspect_id: Optional[str] = None
    case_number: Optional[str] = None
    status: Optional[str] = "OPEN"
    lead_agency: Optional[str] = "Indian Coast Guard"
    summary_notes: Optional[str] = None


class InvestigationUpdate(BaseModel):
    status: Optional[str] = None
    summary_notes: Optional[str] = None
    primary_suspect_id: Optional[str] = None


class InvestigationResponse(InvestigationBase):
    id: str
    created_at: datetime
    updated_at: datetime
    spill: Optional[SpillDetectionResponse] = None
    primary_suspect: Optional[VesselResponse] = None

    model_config = ConfigDict(from_attributes=True)


class InvestigationAnalyzeRequest(BaseModel):
    scenario_id: str = "scenario_a"
    model_mode: Optional[str] = "demo"
    save_to_db: Optional[bool] = True


class InvestigationDetailResponse(BaseModel):
    id: str
    case_number: str
    scenario_id: Optional[str] = None
    status: str = "OPEN"
    lead_agency: str = "Indian Coast Guard"
    summary_notes: Optional[str] = None
    spill: Dict[str, Any] = {}
    drift: Dict[str, Any] = {}
    source: Dict[str, Any] = {}
    ais_candidates: list[Dict[str, Any]] = []
    vessel_scores: Dict[str, Any] = {}
    evidence: Dict[str, Any] = {}
    timeline: list[Dict[str, Any]] = []
    timestamps: Dict[str, Any] = {}
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

