"""SAR Image Preprocessing Pipeline for Oil Spill Segmentation."""

import io
import base64
from typing import Union, Tuple, Optional, Dict, Any
import numpy as np
from PIL import Image


class SARImagePreprocessor:
    """Preprocesses SAR (Synthetic Aperture Radar) Sentinel-1 Level-1 GRD imagery for U-Net inference.
    
    Implements:
    1. Image loading from multiple formats (filepath, raw bytes, base64 string, PIL Image, numpy ndarray)
    2. Radiometric calibration / Decibel conversion: DN -> sigma0 (dB)
    3. Normalization: Mapping dB backscatter to [0.0, 1.0] for neural network input
    4. Resizing: Resizing to target tensor dimensions with transform metadata for geo-reprojection
    """

    def __init__(
        self,
        target_size: Tuple[int, int] = (256, 256),
        min_db: float = -30.0,
        max_db: float = 0.0,
    ):
        self.target_size = target_size
        self.min_db = min_db
        self.max_db = max_db

    def load_image(self, image_input: Union[str, bytes, Image.Image, np.ndarray]) -> np.ndarray:
        """Loads input image into a 2D float32 numpy array representing single-polarization radar intensity."""
        if isinstance(image_input, np.ndarray):
            if image_input.ndim == 3:
                # If RGB or multi-channel, convert to single channel
                if image_input.shape[2] == 3:
                    # Grayscale conversion
                    gray = 0.2989 * image_input[:, :, 0] + 0.5870 * image_input[:, :, 1] + 0.1140 * image_input[:, :, 2]
                    return gray.astype(np.float32)
                elif image_input.shape[0] == 3 or image_input.shape[0] == 1:
                    return np.mean(image_input, axis=0).astype(np.float32)
            return image_input.astype(np.float32)

        if isinstance(image_input, Image.Image):
            gray_img = image_input.convert("L")
            return np.array(gray_img, dtype=np.float32)

        if isinstance(image_input, str):
            # Check if base64 data uri
            if image_input.startswith("data:image"):
                base64_data = image_input.split(",", 1)[1]
                raw_bytes = base64.b64decode(base64_data)
                pil_img = Image.open(io.BytesIO(raw_bytes)).convert("L")
                return np.array(pil_img, dtype=np.float32)
            elif len(image_input) > 256 and not image_input.endswith((".png", ".jpg", ".jpeg", ".tif", ".tiff")):
                # Likely raw base64 string
                try:
                    raw_bytes = base64.b64decode(image_input)
                    pil_img = Image.open(io.BytesIO(raw_bytes)).convert("L")
                    return np.array(pil_img, dtype=np.float32)
                except Exception:
                    pass

            # Otherwise treat as filesystem path
            pil_img = Image.open(image_input).convert("L")
            return np.array(pil_img, dtype=np.float32)

        if isinstance(image_input, bytes):
            pil_img = Image.open(io.BytesIO(image_input)).convert("L")
            return np.array(pil_img, dtype=np.float32)

        raise ValueError(f"Unsupported image input type: {type(image_input)}")

    def calibrate_to_decibels(self, digital_numbers: np.ndarray) -> np.ndarray:
        """Converts raw digital numbers (amplitude / intensity) to backscatter sigma0 (dB).
        
        Oil slicks suppress capillary and small gravity waves, dramatically reducing surface roughness.
        This produces distinctive dark signatures with backscatter drops typically ranging from
        -22 dB to -28 dB against surrounding rough sea of -14 dB to -18 dB.
        """
        # Avoid zero or negative values in logarithm
        clipped = np.clip(digital_numbers, a_min=1e-4, a_max=None)
        sigma0_db = 10.0 * np.log10(clipped)
        return sigma0_db.astype(np.float32)

    def normalize(self, img_db: np.ndarray) -> np.ndarray:
        """Normalizes backscatter dB values into [0.0, 1.0] range."""
        clipped = np.clip(img_db, a_min=self.min_db, a_max=self.max_db)
        norm = (clipped - self.min_db) / (self.max_db - self.min_db)
        return norm.astype(np.float32)

    def resize_for_model(
        self, img_array: np.ndarray
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Resizes the image array to target dimensions (height, width) and returns transform metadata.
        
        Returns:
            resized_array: np.ndarray with shape (target_h, target_w)
            transform_meta: metadata storing original shape and scale factors for geo-reprojection
        """
        orig_h, orig_w = img_array.shape[:2]
        target_w, target_h = self.target_size

        pil_img = Image.fromarray(img_array)
        resized_pil = pil_img.resize((target_w, target_h), resample=Image.Resampling.BILINEAR)
        resized_arr = np.array(resized_pil, dtype=np.float32)

        transform_meta = {
            "orig_h": orig_h,
            "orig_w": orig_w,
            "target_h": target_h,
            "target_w": target_w,
            "scale_x": orig_w / float(target_w),
            "scale_y": orig_h / float(target_h),
        }

        return resized_arr, transform_meta

    def preprocess(
        self, image_input: Union[str, bytes, Image.Image, np.ndarray]
    ) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
        """Executes full preprocessing pipeline:
        
        1. Loads raw image
        2. Computes calibrated dB backscatter
        3. Normalizes to [0.0, 1.0]
        4. Resizes for U-Net model input
        
        Returns:
            model_input: normalized float32 array shaped (1, 1, target_h, target_w)
            raw_db: original calibrated backscatter dB array
            metadata: transformation and dimensions metadata
        """
        raw_img = self.load_image(image_input)
        
        # If input is already 0-255 grayscale image from display/standard PNG, calibrate it
        if raw_img.max() > 1.0 and raw_img.max() <= 255.0:
            # Map [0, 255] roughly to typical SAR amplitude range [10, 500]
            simulated_dn = 10.0 + (raw_img / 255.0) * 490.0
            raw_db = self.calibrate_to_decibels(simulated_dn)
        else:
            raw_db = raw_img

        norm_img = self.normalize(raw_db)
        resized_norm, transform_meta = self.resize_for_model(norm_img)

        # Reshape to (1, 1, H, W) for PyTorch tensor compatibility
        tensor_input = np.expand_dims(np.expand_dims(resized_norm, axis=0), axis=0)

        metadata = {
            **transform_meta,
            "min_db": float(np.min(raw_db)),
            "max_db": float(np.max(raw_db)),
            "mean_db": float(np.mean(raw_db)),
        }

        return tensor_input, raw_db, metadata
