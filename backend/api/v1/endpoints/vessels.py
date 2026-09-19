"""FastAPI Endpoints for Vessel Traffic, AIS Tracks, and Correlation Analysis."""

from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.repositories.vessel_repo import vessel_repo
from backend.schemas.vessel import (
    VesselResponse,
    AisPositionResponse,
    VesselAnomalyResponse,
)
from backend.services.providers.ais import DemoAISProvider, LocalAISProvider
from backend.services.correlation_engine import correlation_engine, CandidateVesselCorrelation
from backend.data.scenarios import DEMO_SCENARIOS_DATA

router = APIRouter()

demo_provider = DemoAISProvider()
local_provider = LocalAISProvider()


@router.get("", response_model=List[Dict[str, Any]])
def list_vessels(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    scenario_id: Optional[str] = Query(None, description="Filter by demo scenario locus"),
    db: Session = Depends(get_db),
):
    """List tracked vessels across database and demo/AIS providers."""
    # 1. Try scenario provider if scenario requested
    if scenario_id and scenario_id.lower() in DEMO_SCENARIOS_DATA:
        vessels = demo_provider.get_vessels_for_scenario(scenario_id)
        return vessels[skip : skip + limit]

    # 2. Try DB
    db_vessels = vessel_repo.list(db, skip=skip, limit=limit)
    if db_vessels:
        return [
            {
                "id": v.id,
                "mmsi": v.mmsi,
                "name": v.name,
                "imo": v.imo,
                "vessel_type": v.vessel_type,
                "flag_country": v.flag_country,
                "length_m": v.length_m,
                "width_m": v.width_m,
                "draught_m": v.draught_m,
            }
            for v in db_vessels
        ]

    # 3. Fallback to all demo vessels
    all_demo = demo_provider.get_all_vessels()
    return all_demo[skip : skip + limit]


@router.get("/nearby", response_model=List[CandidateVesselCorrelation])
def get_nearby_vessels(
    lat: Optional[float] = Query(None, description="Spill release latitude (WGS84)"),
    lon: Optional[float] = Query(None, description="Spill release longitude (WGS84)"),
    timestamp: Optional[datetime] = Query(None, description="Estimated discharge timestamp UTC"),
    radius_nm: float = Query(30.0, ge=1.0, le=150.0, description="Correlation search radius in NM"),
    time_window_hours: float = Query(24.0, ge=1.0, le=72.0, description="Time window in hours"),
    scenario_id: Optional[str] = Query(None, description="Scenario ID context ('scenario_a', 'scenario_b', 'scenario_c')"),
    db: Session = Depends(get_db),
):
    """Finds and ranks candidate vessels near an estimated spill release point.
    
    Adheres strictly to objective non-accusatory maritime legal categories:
    'Potential source vessel', 'High correlation', 'Requires investigation', 'Moderate correlation'.
    """
    # 1. Extract source coordinates and time from scenario if coordinates omitted
    if scenario_id and scenario_id.lower() in DEMO_SCENARIOS_DATA:
        sc = DEMO_SCENARIOS_DATA[scenario_id.lower()]
        spill = sc.get("spill_detection") or sc.get("spill", {})
        drift = sc.get("drift_simulation") or sc.get("drift", {})
        ref_lat = lat if lat is not None else (drift.get("estimated_origin_lat") or (drift.get("estimated_origin_coords", [spill.get("centroid_lat", 19.04)])[0]))
        ref_lon = lon if lon is not None else (drift.get("estimated_origin_lon") or (drift.get("estimated_origin_coords", [spill.get("centroid_lon", 72.33), spill.get("centroid_lon", 72.33)])[1]))
        if timestamp:
            ref_time = timestamp
        elif drift.get("estimated_origin_time"):
            ref_time = datetime.fromisoformat(drift["estimated_origin_time"].replace("Z", "+00:00"))
        elif "detection_time" in spill:
            ref_time = datetime.fromisoformat(spill["detection_time"].replace("Z", "+00:00"))
        else:
            ref_time = datetime.utcnow()
        vessels_data = demo_provider.get_vessels_for_scenario(scenario_id)
    else:
        if lat is None or lon is None:
            # Default to Scenario A Mumbai High if nothing specified
            sc = DEMO_SCENARIOS_DATA["scenario_a"]
            ref_lat = 19.040
            ref_lon = 72.330
            ref_time = datetime(2026, 9, 13, 19, 30, 0)
            vessels_data = demo_provider.get_vessels_for_scenario("scenario_a")
        else:
            ref_lat = lat
            ref_lon = lon
            ref_time = timestamp or datetime.utcnow()
            vessels_data = demo_provider.get_all_vessels()

    candidates = correlation_engine.correlate_vessels(
        vessels=vessels_data,
        source_lat=ref_lat,
        source_lon=ref_lon,
        source_time=ref_time,
        search_radius_nm=radius_nm,
        time_window_hours=time_window_hours,
    )

    return candidates


@router.get("/{vessel_id}", response_model=Dict[str, Any])
def get_vessel(vessel_id: str, db: Session = Depends(get_db)):
    """Get vessel details by ID or Maritime Mobile Service Identity (MMSI)."""
    # 1. Check DB by MMSI or ID
    vessel = vessel_repo.get_by_mmsi(db, vessel_id) or vessel_repo.get(db, vessel_id)
    if vessel:
        return {
            "id": vessel.id,
            "mmsi": vessel.mmsi,
            "name": vessel.name,
            "imo": vessel.imo,
            "vessel_type": vessel.vessel_type,
            "flag_country": vessel.flag_country,
            "length_m": vessel.length_m,
            "width_m": vessel.width_m,
            "positions": [
                {
                    "timestamp": p.timestamp_utc.isoformat() + "Z",
                    "latitude": p.latitude,
                    "longitude": p.longitude,
                    "sog": p.sog_knots,
                    "cog": p.cog_degrees,
                    "heading": p.heading_degrees,
                    "nav_status": p.nav_status,
                }
                for p in vessel.positions
            ],
        }

    # 2. Check Demo vessels
    for v in demo_provider.get_all_vessels():
        if v.get("mmsi") == vessel_id or v.get("id") == vessel_id:
            return v

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Vessel with identifier/MMSI '{vessel_id}' not found.",
    )


@router.get("/{mmsi}/track", response_model=List[Dict[str, Any]])
def get_vessel_track(mmsi: str, limit: int = Query(200, ge=1, le=1000), db: Session = Depends(get_db)):
    """Retrieve historical AIS trajectory coordinates for a vessel."""
    vessel = vessel_repo.get_by_mmsi(db, mmsi)
    if vessel:
        positions = vessel_repo.get_vessel_positions(db, vessel.id, limit=limit)
        return [
            {
                "timestamp": p.timestamp_utc.isoformat() + "Z",
                "latitude": p.latitude,
                "longitude": p.longitude,
                "sog": p.sog_knots,
                "cog": p.cog_degrees,
                "heading": p.heading_degrees,
                "nav_status": p.nav_status,
            }
            for p in positions
        ]

    # Check Demo provider
    for v in demo_provider.get_all_vessels():
        if v.get("mmsi") == mmsi:
            return v.get("positions", [])[:limit]

    raise HTTPException(status_code=404, detail=f"Vessel with MMSI '{mmsi}' not found")


@router.get("/{mmsi}/anomalies", response_model=List[Dict[str, Any]])
def get_vessel_anomalies(mmsi: str, db: Session = Depends(get_db)):
    """Retrieve detected navigational anomalies for a vessel."""
    vessel = vessel_repo.get_by_mmsi(db, mmsi)
    if vessel:
        anomalies = vessel_repo.get_vessel_anomalies(db, vessel.id)
        return [
            {
                "anomaly_type": a.anomaly_type,
                "severity": a.severity,
                "start_time": a.start_time.isoformat() + "Z",
                "end_time": a.end_time.isoformat() + "Z" if a.end_time else None,
                "details": a.details,
            }
            for a in anomalies
        ]

    for v in demo_provider.get_all_vessels():
        if v.get("mmsi") == mmsi:
            return v.get("anomalies", [])

    return []
