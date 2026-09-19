"""Pydantic Schemas for Oil Spill Detection Endpoints."""

from typing import Dict, Any, Optional, Tuple, List
from pydantic import BaseModel, Field, field_validator


class DetectionRequest(BaseModel):
    """Payload for requesting an oil spill detection analysis."""
    image_data: Optional[str] = Field(
        None, description="Base64 encoded SAR image or data URI (max 20MB payload)"
    )
    scenario_id: Optional[str] = Field(
        None, description="Preset scenario ID ('scenario_a', 'scenario_b', 'scenario_c')"
    )
    top_left_lat: Optional[float] = Field(
        None, description="Top-left latitude coordinate (WGS84)"
    )
    top_left_lon: Optional[float] = Field(
        None, description="Top-left longitude coordinate (WGS84)"
    )
    pixel_resolution_m: float = Field(
        10.0, description="Spatial pixel resolution in meters (e.g. 10m for Sentinel-1 IW)"
    )
    mode: Optional[str] = Field(
        None, description="Explicit mode override: 'demo' or 'trained'"
    )

    @field_validator("image_data")
    @classmethod
    def validate_image_payload_size(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            # 20MB Base64 payload limit to prevent memory exhaustion (DoS)
            if len(v) > 20_000_000:
                raise ValueError("Image data exceeds maximum allowable payload size (20MB limit).")
        return v

    @field_validator("top_left_lat")
    @classmethod
    def validate_latitude(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (-90.0 <= v <= 90.0):
            raise ValueError("Latitude must be between -90.0 and 90.0 degrees.")
        return v

    @field_validator("top_left_lon")
    @classmethod
    def validate_longitude(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (-180.0 <= v <= 180.0):
            raise ValueError("Longitude must be between -180.0 and 180.0 degrees.")
        return v


class DetectionResponse(BaseModel):
    """Output response representing segmented oil spill detection and geospatial attributes."""
    detection_id: str
    model_name: str
    model_version: str
    mode: str
    confidence: float
    area_sqkm: float
    perimeter_km: float
    centroid: Tuple[float, float]
    polygon: Optional[Dict[str, Any]]
    estimated_age_hours: float
    original_image: Optional[str] = None
    mask_image: Optional[str] = None
    overlay_image: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
