"""End-to-End Oil Spill Detection Inference Pipeline.

Supports dual operating modes:
- MODEL_MODE=demo: Deterministic synthetic segmentation based on scenario ground truth.
- MODEL_MODE=trained: Loads U-Net weights from disk and performs neural inference.
"""

import os
import io
import uuid
import base64
import math
from typing import Dict, Any, Optional, Union, Tuple, List
from pydantic import BaseModel, Field
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

from ml.models.unet import UNet
from ml.preprocessing.preprocessor import SARImagePreprocessor
from ml.postprocessing.postprocessor import SpillPostprocessor


class SpillDetectionResult(BaseModel):
    """Structured output from the oil spill detection inference service."""
    detection_id: str
    model_name: str
    model_version: str
    mode: str = Field(..., description="'demo' or 'trained'")
    confidence: float = Field(..., ge=0.0, le=1.0)
    area_sqkm: float
    perimeter_km: float
    centroid: Tuple[float, float] = Field(..., description="(latitude, longitude)")
    polygon: Optional[Dict[str, Any]] = Field(None, description="GeoJSON Polygon geometry")
    estimated_age_hours: float
    original_image: Optional[str] = Field(None, description="Base64 encoded PNG or image URL")
    mask_image: Optional[str] = Field(None, description="Base64 encoded binary mask PNG")
    overlay_image: Optional[str] = Field(None, description="Base64 encoded false-color overlay PNG")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class OilSpillDetectionService:
    """Manages U-Net model loading, execution modes, and visual artifact generation."""

    def __init__(
        self,
        default_mode: Optional[str] = None,
        checkpoint_path: Optional[str] = None,
    ):
        self.mode = default_mode or os.environ.get("MODEL_MODE", "demo").lower()
        self.checkpoint_path = checkpoint_path or os.environ.get(
            "MODEL_CHECKPOINT_PATH", "ml/checkpoints/unet_oil_spill_s1.pth"
        )
        self.preprocessor = SARImagePreprocessor(target_size=(256, 256))
        self.postprocessor = SpillPostprocessor(threshold=0.50, min_component_area_pixels=30)
        self.model: Optional[UNet] = None

        if self.mode == "trained":
            self._load_trained_model()

    def _load_trained_model(self) -> None:
        """Attempts to load PyTorch U-Net weights from disk."""
        if not os.path.exists(self.checkpoint_path):
            raise FileNotFoundError(
                f"Trained model checkpoint not found at '{self.checkpoint_path}'. "
                f"Place genuine weights at this location or switch to MODEL_MODE=demo."
            )

        if not TORCH_AVAILABLE:
            raise RuntimeError("PyTorch is required for MODEL_MODE=trained but is not installed.")

        self.model = UNet(n_channels=1, n_classes=1)
        self.model.load_weights(self.checkpoint_path)
        self.model.eval()

    def _array_to_base64_png(self, array: np.ndarray, colormap: Optional[str] = None) -> str:
        """Encodes a numpy array (uint8 or float) into a base64 PNG data URL."""
        if array.dtype != np.uint8:
            if array.max() <= 1.0:
                array = (array * 255.0).clip(0, 255).astype(np.uint8)
            else:
                array = array.clip(0, 255).astype(np.uint8)

        if colormap == "mask":
            # High-contrast binary mask: 0=Black, 255=White
            pil_img = Image.fromarray(array, mode="L")
        elif colormap == "overlay":
            # Handled separately with RGBA
            pil_img = Image.fromarray(array, mode="RGBA")
        else:
            # Grayscale SAR
            if array.ndim == 2:
                pil_img = Image.fromarray(array, mode="L")
            else:
                pil_img = Image.fromarray(array)

        buffer = io.BytesIO()
        pil_img.save(buffer, format="PNG")
        encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{encoded}"

    def _generate_synthetic_sar_scene(
        self,
        scenario_id: str,
        size: Tuple[int, int] = (512, 512),
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Deterministically synthesizes a calibrated SAR scene, ground truth mask, and false-color overlay.
        
        Simulates:
        1. Rayleigh distributed SAR radar speckle and ocean clutter (ambient ~ -15 dB)
        2. Capillary wave dampening inside hydrocarbon slicks (backscatter drop down to ~ -25 dB)
        3. Elongated plume morphology characteristic of maritime bunker/crude discharges
        """
        w, h = size
        np.random.seed(42 if scenario_id == "scenario_a" else (84 if scenario_id == "scenario_b" else 126))

        # 1. Base ocean texture with radar speckle (multi-look speckle simulation)
        ambient_noise = np.random.gamma(shape=4.0, scale=0.25, size=(h, w)).astype(np.float32)
        ambient_noise = np.clip(ambient_noise * 160.0, 40.0, 250.0).astype(np.uint8)

        # 2. Draw slick mask using PIL Vector primitives
        mask_img = Image.new("L", (w, h), 0)
        draw = ImageDraw.Draw(mask_img)

        if scenario_id == "scenario_a":
            # Single large elongated crude plume in Mumbai High
            points = [
                (140, 230), (180, 200), (260, 180), (360, 195),
                (420, 240), (390, 290), (320, 310), (220, 295), (150, 270)
            ]
            draw.polygon(points, fill=255)
            # Add irregular feeder fingers
            draw.ellipse([240, 170, 380, 250], fill=255)
            draw.ellipse([160, 210, 280, 290], fill=255)
            draw.line([(120, 260), (180, 230)], fill=255, width=18)
        elif scenario_id == "scenario_b":
            # Corridor trail with secondary sheens in Goa TSS
            draw.polygon([(180, 140), (240, 120), (340, 220), (380, 340), (330, 360), (270, 260)], fill=255)
            draw.ellipse([210, 150, 310, 260], fill=255)
            draw.ellipse([320, 280, 390, 370], fill=255)
            # Secondary patch
            draw.ellipse([130, 320, 190, 370], fill=255)
        else:
            # Weathered, fragmented sheen in Gulf of Khambhat
            draw.ellipse([220, 190, 310, 270], fill=255)
            draw.ellipse([290, 240, 360, 320], fill=255)
            draw.ellipse([180, 260, 240, 310], fill=255)
            draw.ellipse([340, 180, 380, 230], fill=255)

        # Smooth slick boundary to simulate viscous fluid dispersion
        mask_smoothed = mask_img.filter(ImageFilter.GaussianBlur(radius=3.5))
        mask_arr = np.array(mask_smoothed)
        binary_mask = (mask_arr > 110).astype(np.uint8) * 255

        # 3. Create SAR backscatter image: dark spot formation
        sar_img_arr = ambient_noise.copy()
        slick_indices = binary_mask > 0
        # Darkening factor: oil backscatter is ~10-15 dB lower than water
        sar_img_arr[slick_indices] = (sar_img_arr[slick_indices] * 0.22).astype(np.uint8)
        # Add subtle interior speckle
        interior_noise = np.random.gamma(shape=3.0, scale=0.3, size=(h, w))
        sar_img_arr[slick_indices] = np.clip(
            sar_img_arr[slick_indices] + interior_noise[slick_indices] * 12.0, 10, 85
        ).astype(np.uint8)

        # 4. Create scientific false-color overlay (SAR grayscale base + translucent red/cyan thermal mask + boundary outline)
        overlay_rgba = np.zeros((h, w, 4), dtype=np.uint8)
        overlay_rgba[:, :, 0] = sar_img_arr  # R
        overlay_rgba[:, :, 1] = sar_img_arr  # G
        overlay_rgba[:, :, 2] = sar_img_arr  # B
        overlay_rgba[:, :, 3] = 255

        # Boundary contour
        from ml.postprocessing.postprocessor import CV2_AVAILABLE
        if CV2_AVAILABLE:
            import cv2
            contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cv2.drawContours(overlay_rgba, contours, -1, (239, 68, 68, 255), 2)  # Red vector boundary
        
        # Color slick interior with semi-transparent cyan-magenta radar diagnostic tint
        tint_indices = binary_mask > 0
        overlay_rgba[tint_indices, 0] = np.clip(overlay_rgba[tint_indices, 0] * 0.4 + 220 * 0.6, 0, 255).astype(np.uint8)
        overlay_rgba[tint_indices, 1] = np.clip(overlay_rgba[tint_indices, 1] * 0.4 + 38 * 0.6, 0, 255).astype(np.uint8)
        overlay_rgba[tint_indices, 2] = np.clip(overlay_rgba[tint_indices, 2] * 0.4 + 38 * 0.6, 0, 255).astype(np.uint8)

        return sar_img_arr, binary_mask, overlay_rgba

    def detect_oil_spill(
        self,
        image_input: Optional[Union[str, bytes, np.ndarray]] = None,
        top_left_lat: Optional[float] = None,
        top_left_lon: Optional[float] = None,
        pixel_resolution_m: float = 10.0,
        scenario_id: Optional[str] = None,
        mode: Optional[str] = None,
    ) -> SpillDetectionResult:
        """Main inference interface for detecting oil slicks.
        
        Args:
            image_input: Filepath, base64 data URI, raw bytes, or numpy array.
            top_left_lat: Latitude of scene top-left corner (WGS84).
            top_left_lon: Longitude of scene top-left corner (WGS84).
            pixel_resolution_m: Ground sampling distance in meters (default 10m for Sentinel-1 IW).
            scenario_id: If provided ("scenario_a", "scenario_b", "scenario_c"), generates deterministic benchmark data.
            mode: Explicit override for "demo" or "trained".
            
        Returns:
            SpillDetectionResult with polygon, centroid, area, confidence, and visual artifacts.
        """
        active_mode = mode or self.mode
        detection_id = f"DET-{uuid.uuid4().hex[:8].upper()}"

        # -------------------------------------------------------------
        # 1. DEMO MODE: Deterministic Synthetic Segmentation
        # -------------------------------------------------------------
        if active_mode == "demo":
            scenario_key = scenario_id or "scenario_a"
            
            # Scenario specific ground truth defaults
            scenario_defaults = {
                "scenario_a": {
                    "lat": 19.4500, "lon": 71.1600,
                    "target_area": 14.85, "target_conf": 0.942, "age": 6.5,
                    "model_name": "Synthetic Scenario Projection (DEMO MODE)",
                    "version": "v1.2.0-sentinel1-demo",
                },
                "scenario_b": {
                    "lat": 15.4800, "lon": 73.1200,
                    "target_area": 8.40, "target_conf": 0.860, "age": 4.0,
                    "model_name": "Synthetic Scenario Projection (DEMO MODE)",
                    "version": "v1.2.0-sentinel1-demo",
                },
                "scenario_c": {
                    "lat": 20.9600, "lon": 71.9700,
                    "target_area": 4.20, "target_conf": 0.580, "age": 18.0,
                    "model_name": "Synthetic Scenario Projection (DEMO MODE)",
                    "version": "v1.2.0-sentinel1-demo",
                },
            }

            cfg = scenario_defaults.get(scenario_key, scenario_defaults["scenario_a"])
            ref_lat = top_left_lat if top_left_lat is not None else cfg["lat"]
            ref_lon = top_left_lon if top_left_lon is not None else cfg["lon"]

            sar_arr, mask_arr, overlay_arr = self._generate_synthetic_sar_scene(
                scenario_key, size=(512, 512)
            )

            # Compute postprocessing metrics
            prob_map = (mask_arr > 0).astype(np.float32)
            metrics = self.postprocessor.compute_metrics(
                binary_mask=(mask_arr > 0).astype(np.uint8),
                probability_map=prob_map,
                top_left_lat=ref_lat,
                top_left_lon=ref_lon,
                transform_meta={"scale_x": 1.0, "scale_y": 1.0},
            )

            # Re-normalize area to match deterministic scenario exactly
            final_area = cfg["target_area"]
            final_conf = cfg["target_conf"]

            return SpillDetectionResult(
                detection_id=detection_id,
                model_name=cfg["model_name"],
                model_version=cfg["version"],
                mode="demo",
                confidence=final_conf,
                area_sqkm=final_area,
                perimeter_km=metrics["perimeter_km"],
                centroid=tuple(metrics["centroid"]),
                polygon=metrics["polygon"],
                estimated_age_hours=cfg["age"],
                original_image=self._array_to_base64_png(sar_arr),
                mask_image=self._array_to_base64_png(mask_arr, colormap="mask"),
                overlay_image=self._array_to_base64_png(overlay_arr, colormap="overlay"),
                metadata={
                    "sensor": "Sentinel-1A C-SAR (Synthetic Ground Truth)",
                    "polarization": "VV",
                    "mode_disclaimer": "SIMULATED DEMO DATA — Deterministic projection, not trained neural network weights.",
                    "scenario_id": scenario_key,
                },
            )

        # -------------------------------------------------------------
        # 2. TRAINED MODE: Neural Network Inference with U-Net
        # -------------------------------------------------------------
        elif active_mode == "trained":
            if self.model is None:
                self._load_trained_model()

            if image_input is None:
                raise ValueError("In trained mode, a valid image_input must be provided.")

            ref_lat = top_left_lat if top_left_lat is not None else 19.4500
            ref_lon = top_left_lon if top_left_lon is not None else 71.1600

            # 1. Preprocess image
            tensor_input, raw_db, transform_meta = self.preprocessor.preprocess(image_input)

            # 2. Forward pass through PyTorch U-Net
            torch_tensor = torch.from_numpy(tensor_input).float()
            with torch.no_grad():
                output_prob = self.model(torch_tensor)
                prob_map = output_prob.cpu().numpy()[0, 0]

            # 3. Postprocess probability map
            binary_mask = self.postprocessor.threshold_mask(prob_map)
            cleaned_mask = self.postprocessor.filter_connected_components(binary_mask)
            metrics = self.postprocessor.compute_metrics(
                binary_mask=cleaned_mask,
                probability_map=prob_map,
                top_left_lat=ref_lat,
                top_left_lon=ref_lon,
                transform_meta=transform_meta,
            )

            # 4. Generate visual artifacts
            h, w = prob_map.shape
            sar_display = ((tensor_input[0, 0] * 255.0).clip(0, 255)).astype(np.uint8)
            mask_display = (cleaned_mask * 255).astype(np.uint8)

            overlay_rgba = np.zeros((h, w, 4), dtype=np.uint8)
            overlay_rgba[:, :, 0] = sar_display
            overlay_rgba[:, :, 1] = sar_display
            overlay_rgba[:, :, 2] = sar_display
            overlay_rgba[:, :, 3] = 255

            slick_idx = cleaned_mask > 0
            overlay_rgba[slick_idx, 0] = 239  # Red tint
            overlay_rgba[slick_idx, 1] = 68
            overlay_rgba[slick_idx, 2] = 68

            return SpillDetectionResult(
                detection_id=detection_id,
                model_name="PyTorch-UNet-SAR-Spill",
                model_version="v2.1.0-checkpoint",
                mode="trained",
                confidence=metrics["confidence"],
                area_sqkm=metrics["area_sqkm"],
                perimeter_km=metrics["perimeter_km"],
                centroid=tuple(metrics["centroid"]),
                polygon=metrics["polygon"],
                estimated_age_hours=metrics["estimated_age_hours"],
                original_image=self._array_to_base64_png(sar_display),
                mask_image=self._array_to_base64_png(mask_display, colormap="mask"),
                overlay_image=self._array_to_base64_png(overlay_rgba, colormap="overlay"),
                metadata={
                    "sensor": "Sentinel-1 C-SAR IW GRD",
                    "polarization": "VV",
                    "checkpoint": self.checkpoint_path,
                },
            )

        else:
            raise ValueError(f"Unknown MODEL_MODE: {active_mode}. Must be 'demo' or 'trained'.")


# Singleton instance for direct import
detection_service = OilSpillDetectionService()


def detect_oil_spill(
    image: Optional[Union[str, bytes, np.ndarray]] = None,
    top_left_lat: Optional[float] = None,
    top_left_lon: Optional[float] = None,
    pixel_resolution_m: float = 10.0,
    scenario_id: Optional[str] = None,
    mode: Optional[str] = None,
) -> SpillDetectionResult:
    """Convenience functional wrapper for oil spill detection pipeline."""
    return detection_service.detect_oil_spill(
        image_input=image,
        top_left_lat=top_left_lat,
        top_left_lon=top_left_lon,
        pixel_resolution_m=pixel_resolution_m,
        scenario_id=scenario_id,
        mode=mode,
    )
