"""FastAPI Endpoints for Oil Spill ML Detection Service."""

import os
import threading
from typing import List, Dict, Optional
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
