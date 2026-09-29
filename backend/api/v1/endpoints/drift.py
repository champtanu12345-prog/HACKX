"""FastAPI Endpoints for Oil Spill Drift Modeling Subsystem."""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.repositories.spill_repo import spill_repo
from backend.models.drift import DriftRun
from backend.schemas.drift import (
    DriftRunCreate,
    DriftRunResponse,
    DriftSimulationRequest,
    DriftSimulationResponse,
    SimulationTrajectoryPoint,
    LiveEnvironmentResponse,
)
from backend.services.drift.drift_service import drift_service
from backend.services.correlation_service import correlation_service

router = APIRouter()


@router.get("/drift/live-environment", response_model=LiveEnvironmentResponse)
def get_live_environment(
    latitude: float,
    longitude: float,
    timestamp: Optional[datetime] = None,
):
    """Fetches real live ocean currents and 10m surface winds from Open-Meteo Marine & Atmospheric APIs.
    
    Data provenance:
    - Ocean Circulation: Copernicus Marine Service (CMEMS) Global Ocean Physics Reanalysis / NOAA HyCOM
    - Atmospheric Wind: NOAA Global Forecast System (GFS) & ECMWF Integrated Forecasting System (IFS)
    """
    from backend.services.providers.ocean import OpenMeteoMarineCurrentProvider
    from backend.services.providers.weather import OpenMeteoWeatherProvider

    marine_prov = OpenMeteoMarineCurrentProvider()
    weather_prov = OpenMeteoWeatherProvider()

    obs_time = timestamp or datetime.now(timezone.utc)
    marine_res = marine_prov.get_marine_conditions(latitude, longitude, obs_time)
    weather_res = weather_prov.get_wind_conditions(latitude, longitude, obs_time)

    return LiveEnvironmentResponse(
        latitude=latitude,
        longitude=longitude,
        timestamp=obs_time.isoformat(),
        marine=marine_res,
        weather=weather_res,
    )


@router.post("/drift/simulate", response_model=DriftSimulationResponse, status_code=status.HTTP_200_OK)
def simulate_drift(payload: DriftSimulationRequest):
    """Executes a Lagrangian hydrodynamic drift simulation (HINDCAST or FORECAST).
    
    Supports:
    - Preset Scenario simulation (e.g. 'scenario_a', 'scenario_b', 'scenario_c')
    - Real-time live ocean currents and 10m surface winds via Open-Meteo
    - Custom coordinate and environmental vector parameters
    - Modular engine selection ('lagrangian' or 'opendrift')
    """
    try:
        if payload.scenario_id:
            result = drift_service.simulate_for_scenario(
                scenario_id=payload.scenario_id,
                run_type=payload.run_type,
                duration_hours=payload.duration_hours,
                timestep_minutes=payload.timestep_minutes,
                engine_type=payload.engine_type,
                wind_speed_knots=payload.wind_speed_knots,
                wind_direction_deg=payload.wind_direction_deg,
                current_speed_knots=payload.current_speed_knots,
                current_direction_deg=payload.current_direction_deg,
                integration_method=payload.integration_method or "rk4",
                use_live_weather=bool(payload.use_live_weather),
            )
        else:
            if payload.spill_lat is None or payload.spill_lon is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Either 'scenario_id' or ('spill_lat', 'spill_lon') must be provided.",
                )

            obs_time = payload.observation_time or datetime.now(timezone.utc)
            result = drift_service.simulate(
                spill_lat=payload.spill_lat,
                spill_lon=payload.spill_lon,
                observation_time=obs_time,
                run_type=payload.run_type,
                duration_hours=payload.duration_hours,
                timestep_minutes=payload.timestep_minutes,
                wind_speed_knots=payload.wind_speed_knots,
                wind_direction_deg=payload.wind_direction_deg,
                current_speed_knots=payload.current_speed_knots,
                current_direction_deg=payload.current_direction_deg,
                engine_type=payload.engine_type,
                integration_method=payload.integration_method or "rk4",
                use_live_weather=bool(payload.use_live_weather),
            )


        trajectory_response = [
            SimulationTrajectoryPoint(
                timestamp=p.timestamp,
                latitude=p.latitude,
                longitude=p.longitude,
                particle_id=p.particle_id,
                velocity=p.velocity,
                direction=p.direction,
                uncertainty_radius_m=p.uncertainty_radius_m,
                timestep_index=p.timestep_index,
                evaporated_percentage=getattr(p, "evaporated_percentage", None),
                water_content_percentage=getattr(p, "water_content_percentage", None),
                viscosity_cst=getattr(p, "viscosity_cst", None),
                weathering_stage=getattr(p, "weathering_stage", None),
            )
            for p in result.trajectory_points
        ]

        return DriftSimulationResponse(
            run_type=result.run_type,
            model_source=result.model_source,
            start_time=result.start_time,
            end_time=result.end_time,
            duration_hours=result.duration_hours,
            trajectory_points=trajectory_response,
            estimated_origin_coords=result.estimated_origin_coords,
            estimated_origin_time=result.estimated_origin_time,
            confidence_score=result.confidence_score,
            parameters=result.parameters,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Drift simulation execution failed: {str(exc)}",
        )


@router.post("/spills/{spill_id}/drift", response_model=DriftRunResponse)
def execute_drift_simulation(
    spill_id: str,
    payload: DriftRunCreate,
    db: Session = Depends(get_db),
):
    """Execute a Lagrangian numerical drift simulation (HINDCAST or FORECAST) for an oil spill."""
    spill = spill_repo.get(db, spill_id)
    if not spill:
        raise HTTPException(status_code=404, detail=f"Spill with ID {spill_id} not found")

    drift_run = correlation_service.run_drift_for_spill(
        db=db,
        spill=spill,
        run_type=payload.run_type,
        duration_hours=payload.duration_hours,
        particle_count=payload.particle_count,
        wind_factor=payload.wind_factor,
    )
    return drift_run


@router.get("/spills/{spill_id}/drift", response_model=List[DriftRunResponse])
def get_spill_drift_runs(spill_id: str, db: Session = Depends(get_db)):
    """Retrieve all drift simulation runs associated with a specific oil slick."""
    return spill_repo.get_drift_runs(db, spill_id)


@router.get("/drift/{drift_run_id}", response_model=DriftRunResponse)
def get_drift_run_details(drift_run_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed trajectory particles and parameters for a simulation run."""
    run = db.query(DriftRun).filter(DriftRun.id == drift_run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Drift run not found")
    return run
