import math
from typing import Tuple, Optional
import numpy as np


class SARPreprocessor:
    """Preprocesses Synthetic Aperture Radar (SAR) Sentinel-1 Level-1 GRD imagery."""

    def __init__(self, filter_window_size: int = 7):
        self.filter_window_size = filter_window_size

    def calibrate_to_decibels(self, digital_numbers: np.ndarray) -> np.ndarray:
        """Converts SAR raw pixel amplitudes to radar backscatter coefficient sigma0 (dB)."""
        # Avoid zero or negative log inputs
        clipped = np.clip(digital_numbers, a_min=1e-5, a_max=None)
        sigma0_db = 10.0 * np.log10(clipped)
        return sigma0_db

    def apply_speckle_filter(self, img_db: np.ndarray) -> np.ndarray:
        """Applies a spatial speckle noise reduction filter to suppress ocean clutter."""
        # Simple uniform kernel representation for environment without requiring heavy cv2 compiled modules
        pad = self.filter_window_size // 2
        padded = np.pad(img_db, pad, mode="reflect")
        filtered = np.zeros_like(img_db)

        # Sliding local window approximation
        for i in range(img_db.shape[0]):
            for j in range(img_db.shape[1]):
                window = padded[i : i + self.filter_window_size, j : j + self.filter_window_size]
                filtered[i, j] = np.median(window)

        return filtered

    def normalize(self, img_db: np.ndarray, min_db: float = -30.0, max_db: float = 0.0) -> np.ndarray:
        """Normalizes backscatter dB range into [0.0, 1.0] for neural network input."""
        clipped = np.clip(img_db, a_min=min_db, a_max=max_db)
        return (clipped - min_db) / (max_db - min_db)
