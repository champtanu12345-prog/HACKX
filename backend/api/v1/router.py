from fastapi import APIRouter
from backend.api.v1.endpoints import (
    health,
    spills,
    drift,
    vessels,
    investigations,
    demo,
    detections,
    alerts,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["System"])
api_router.include_router(spills.router, prefix="/spills", tags=["Oil Spill Detections"])
api_router.include_router(detections.router, prefix="/detections", tags=["ML Spill Segmentation"])
api_router.include_router(drift.router, tags=["Drift Modeling"])
api_router.include_router(vessels.router, prefix="/vessels", tags=["Vessels & AIS"])
api_router.include_router(investigations.router, prefix="/investigations", tags=["Investigations & Vessel Attribution"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Tactical Emergency Alerts"])
api_router.include_router(demo.router, prefix="/demo", tags=["Deterministic Demo Mode"])

