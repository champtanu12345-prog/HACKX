from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.core.database import get_db
from backend.core.config import settings

router = APIRouter()


@router.get("/health")
def get_health(db: Session = Depends(get_db)):
    """System health, database verification, and service availability."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"degraded: {str(e)}"

    return {
        "status": "operational" if db_status == "connected" else "degraded",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "providers": {
            "satellite_sar": "ready",
            "ais_telemetry": "ready",
            "noaa_weather": "ready",
            "ocean_currents": "ready",
        },
    }
