"""FastAPI Endpoints for Oil Spill ML Detection Service."""

import os
import threading
from typing import List, Dict, Optional, Any
from fastapi import APIRouter, HTTPException, Query, status

from backend.schemas.detection import DetectionRequest, DetectionResponse
from ml.inference.pipeline import detect_oil_spill, SpillDetectionResult

router = APIRouter()

# In-memory store for recent detections (persisted across user workflow)
_DETECTIONS_STORE: Dict[str, DetectionResponse] = {}
_STORE_LOCK = threading.Lock()


def _init_default_scenario_detections():
    """Pre-generates detections for standard scenarios for instant lookup."""
    for s_id in ["scenario_a", "scenario_b", "scenario_c"]:
        try:
            res = detect_oil_spill(scenario_id=s_id, mode="demo")
            resp = DetectionResponse(
                detection_id=f"DET-{s_id.upper()}",
                model_name=res.model_name,
                model_version=res.model_version,
                mode=res.mode,
                confidence=res.confidence,
                area_sqkm=res.area_sqkm,
                perimeter_km=res.perimeter_km,
                centroid=res.centroid,
                polygon=res.polygon,
                estimated_age_hours=res.estimated_age_hours,
                original_image=res.original_image,
                mask_image=res.mask_image,
                overlay_image=res.overlay_image,
                metadata=res.metadata,
            )
            _DETECTIONS_STORE[resp.detection_id] = resp
            # Also key by scenario ID for convenience
            _DETECTIONS_STORE[s_id] = resp
        except Exception:
            pass


_init_default_scenario_detections()


@router.post("", response_model=DetectionResponse, status_code=status.HTTP_201_CREATED)
def run_detection(payload: DetectionRequest):
    """Executes oil spill segmentation pipeline.
    
    Supports:
    - DEMO MODE (MODEL_MODE=demo): Synthetic ground truth projection from benchmark scenarios.
    - TRAINED MODE (MODEL_MODE=trained): Neural network inference using PyTorch U-Net.
    """
    try:
        result: SpillDetectionResult = detect_oil_spill(
            image=payload.image_data,
            top_left_lat=payload.top_left_lat,
            top_left_lon=payload.top_left_lon,
            pixel_resolution_m=payload.pixel_resolution_m,
            scenario_id=payload.scenario_id,
            mode=payload.mode,
        )

        response = DetectionResponse(
            detection_id=result.detection_id,
            model_name=result.model_name,
            model_version=result.model_version,
            mode=result.mode,
            confidence=result.confidence,
            area_sqkm=result.area_sqkm,
            perimeter_km=result.perimeter_km,
            centroid=result.centroid,
            polygon=result.polygon,
            estimated_age_hours=result.estimated_age_hours,
            original_image=result.original_image,
            mask_image=result.mask_image,
            overlay_image=result.overlay_image,
            metadata=result.metadata,
        )

        with _STORE_LOCK:
            _DETECTIONS_STORE[response.detection_id] = response
        return response

    except FileNotFoundError as fnf_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(fnf_err),
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Detection pipeline failed: {str(exc)}",
        )


@router.get("", response_model=List[DetectionResponse])
def list_detections():
    """Lists all recent oil spill detections."""
    with _STORE_LOCK:
        unique_items = {item.detection_id: item for item in _DETECTIONS_STORE.values()}
        return list(unique_items.values())


@router.get("/{detection_id}", response_model=DetectionResponse)
def get_detection(detection_id: str):
    """Retrieves an existing detection result by ID."""
    with _STORE_LOCK:
        if detection_id in _DETECTIONS_STORE:
            return _DETECTIONS_STORE[detection_id]
        
        # Check if case-insensitive or prefix match
        det_upper = detection_id.upper()
        if det_upper in _DETECTIONS_STORE:
            return _DETECTIONS_STORE[det_upper]
    
    # Try generating on the fly if it matches a known scenario key
    if detection_id.lower() in ["scenario_a", "scenario_b", "scenario_c"]:
        res = detect_oil_spill(scenario_id=detection_id.lower(), mode="demo")
        resp = DetectionResponse(
            detection_id=f"DET-{detection_id.upper()}",
            model_name=res.model_name,
            model_version=res.model_version,
            mode=res.mode,
            confidence=res.confidence,
            area_sqkm=res.area_sqkm,
            perimeter_km=res.perimeter_km,
            centroid=res.centroid,
            polygon=res.polygon,
            estimated_age_hours=res.estimated_age_hours,
            original_image=res.original_image,
            mask_image=res.mask_image,
            overlay_image=res.overlay_image,
            metadata=res.metadata,
        )
        with _STORE_LOCK:
            _DETECTIONS_STORE[resp.detection_id] = resp
        return resp

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Detection ID '{detection_id}' not found.",
    )


@router.get("/{detection_id}/characterisation", response_model=Dict[str, Any])
def get_detection_characterisation(detection_id: str):
    """Computes international BAOAC discharge volume, SAR Look-Alike assessment, and ADIOS age inversion."""
    with _STORE_LOCK:
        det = _DETECTIONS_STORE.get(detection_id) or _DETECTIONS_STORE.get(detection_id.upper())

    if not det:
        # Fallback to standard scenario generation
        if detection_id.lower() in ["scenario_a", "scenario_b", "scenario_c", "det-scenario_a", "det-scenario_b", "det-scenario_c"]:
            s_key = detection_id.lower().replace("det-", "")
            res = detect_oil_spill(scenario_id=s_key, mode="demo")
            det = DetectionResponse(
                detection_id=f"DET-{s_key.upper()}",
                model_name=res.model_name,
                model_version=res.model_version,
                mode=res.mode,
                confidence=res.confidence,
                area_sqkm=res.area_sqkm,
                perimeter_km=res.perimeter_km,
                centroid=res.centroid,
                polygon=res.polygon,
                estimated_age_hours=res.estimated_age_hours,
                original_image=res.original_image,
                mask_image=res.mask_image,
                overlay_image=res.overlay_image,
                metadata=res.metadata,
            )
        else:
            raise HTTPException(status_code=404, detail=f"Detection ID '{detection_id}' not found.")

    from backend.services.oil_weathering import (
        compute_baoac_volume,
        evaluate_sar_look_alike,
        estimate_slick_age,
    )
    from backend.services.providers.weather import OpenMeteoWeatherProvider

    lat, lon = det.centroid[0], det.centroid[1]
    weather_prov = OpenMeteoWeatherProvider()
    wind_cond = weather_prov.get_wind_conditions(lat, lon)
    u_wind = wind_cond.get("wind_speed_ms", 5.5)

    baoac_res = compute_baoac_volume(det.area_sqkm, predominant_code=4)
    look_alike_res = evaluate_sar_look_alike(
        surface_wind_ms=u_wind,
        dark_spot_contrast=0.88,
        perimeter_km=det.perimeter_km,
        area_sqkm=det.area_sqkm,
    )
    age_res = estimate_slick_age(
        evaporated_percentage=32.0,
        water_content_percentage=45.0,
        viscosity_cst=1250.0,
        wind_speed_ms=u_wind,
    )

    return {
        "detection_id": det.detection_id,
        "centroid": det.centroid,
        "area_sqkm": det.area_sqkm,
        "perimeter_km": det.perimeter_km,
        "baoac_volume": baoac_res,
        "sar_look_alike": look_alike_res,
        "slick_age_estimation": age_res,
        "live_surface_wind": wind_cond,
    }

