from typing import Dict, Any, Optional
import numpy as np

from ml.preprocessing.sar_preprocessor import SARPreprocessor
from ml.postprocessing.geometry_extractor import SpillGeometryExtractor


class OilSpillDetector:
    """End-to-end inference pipeline for detecting oil slicks in SAR scenes."""

    def __init__(self, model_weights_path: Optional[str] = None):
        self.preprocessor = SARPreprocessor()
        self.geometry_extractor = SpillGeometryExtractor(pixel_resolution_m=10.0)
        self.model_weights_path = model_weights_path

    def process_sar_patch(
        self,
        raw_pixels: np.ndarray,
        top_left_lat: float,
        top_left_lon: float,
        detection_threshold_db: float = -22.0,
    ) -> Dict[str, Any]:
        """Preprocesses raw SAR pixels, runs dark-formation segmentation, and extracts geometry."""
        # 1. Calibrate to dB
        sigma0_db = self.preprocessor.calibrate_to_decibels(raw_pixels)

        # 2. Speckle filter
        filtered_db = self.preprocessor.apply_speckle_filter(sigma0_db)

        # 3. Dark spot segmentation (oil dampens capillary waves, causing pronounced backscatter drop)
        # Slicks typically appear between -26 dB and -22 dB against ambient sea of -14 to -18 dB
        binary_mask = (filtered_db < detection_threshold_db).astype(np.uint8)

        # 4. Extract geometry and metrics
        metrics = self.geometry_extractor.compute_metrics(
            binary_mask, top_left_lat=top_left_lat, top_left_lon=top_left_lon
        )

        confidence = 0.88 if metrics["area_sqkm"] > 0.5 else 0.45

        return {
            "detection_flag": bool(metrics["area_sqkm"] > 0.1),
            "confidence_score": confidence,
            "metrics": metrics,
        }
