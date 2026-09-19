from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.repositories.spill_repo import spill_repo
from backend.schemas.spill import (
    SpillDetectionResponse,
    SpillDetectionCreate,
    SpillSummaryResponse,
)
from backend.schemas.vessel import SuspectsListResponse
from backend.models.spill import SpillDetection
from backend.services.correlation_service import correlation_service

router = APIRouter()


@router.get("", response_model=List[SpillDetectionResponse])
def list_spills(
    min_confidence: float = Query(0.0, ge=0.0, le=1.0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """List recent satellite oil spill detections with spatial geometries."""
    return spill_repo.get_recent(db, limit=limit, min_confidence=min_confidence)


@router.get("/summary", response_model=SpillSummaryResponse)
def get_spills_summary(db: Session = Depends(get_db)):
    """Aggregate summary statistics across detected spills."""
    spills = spill_repo.list(db, limit=500)
    total_area = sum(s.area_sqkm for s in spills)
    high_conf = sum(1 for s in spills if s.confidence_score >= 0.85)
    regions = list(set(s.region_name for s in spills if s.region_name))

    return SpillSummaryResponse(
        total_spills=len(spills),
        total_area_sqkm=round(total_area, 2),
        high_confidence_count=high_conf,
        regions=regions,
    )


@router.get("/{spill_id}", response_model=SpillDetectionResponse)
def get_spill(spill_id: str, db: Session = Depends(get_db)):
    """Retrieve details and geometry for a specific detected oil slick."""
    spill = spill_repo.get(db, spill_id)
    if not spill:
        raise HTTPException(status_code=404, detail=f"Spill with ID {spill_id} not found")
    return spill


@router.post("", response_model=SpillDetectionResponse, status_code=201)
def create_spill(payload: SpillDetectionCreate, db: Session = Depends(get_db)):
    """Register a new segmented oil slick from the ML inference pipeline."""
    spill = SpillDetection(
        observation_id=payload.observation_id,
        detection_time=payload.detection_time,
        geometry_geojson=payload.geometry_geojson,
        centroid_lat=payload.centroid_lat,
        centroid_lon=payload.centroid_lon,
        area_sqkm=payload.area_sqkm,
        perimeter_km=payload.perimeter_km,
        estimated_volume_m3=payload.estimated_volume_m3,
        estimated_age_hours=payload.estimated_age_hours or 12.0,
        confidence_score=payload.confidence_score,
        region_name=payload.region_name,
    )
    return spill_repo.create(db, spill)


@router.get("/{spill_id}/suspects", response_model=SuspectsListResponse)
def get_spill_suspects(spill_id: str, db: Session = Depends(get_db)):
    """Correlate AIS vessel traffic and rank potential source vessels requiring investigation."""
    spill = spill_repo.get(db, spill_id)
    if not spill:
        raise HTTPException(status_code=404, detail="Spill detection not found")

    suspects = correlation_service.correlate_and_score_suspects(db, spill)

    return SuspectsListResponse(
        spill_id=spill.id,
        total_evaluated=len(suspects),
        suspects=suspects,
    )
