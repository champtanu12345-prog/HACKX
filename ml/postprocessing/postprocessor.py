"""Postprocessing Pipeline for Oil Spill Segmentation Masks."""

import math
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
from PIL import Image

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    from shapely.geometry import Polygon, MultiPolygon
    from shapely.ops import unary_union
    SHAPELY_AVAILABLE = True
except ImportError:
    SHAPELY_AVAILABLE = False


class SpillPostprocessor:
    """Postprocesses U-Net probability maps to extract vector polygons, geospatial metrics, and confidence scores.
    
    Implements:
    1. Mask thresholding: Converts continuous probability map [0.0, 1.0] to binary mask
    2. Connected component filtering: Suppresses speckle noise / ocean clutter artifacts
    3. Polygon extraction: Vectorizes boundary contours into simplified GeoJSON Polygons
    4. Centroid calculation: Computes pixel-space and geographic WGS84 coordinates
    5. Geospatial area calculation: Evaluates surface area in km² and perimeter in km
    6. Confidence calculation: Evaluates foreground probability margin and boundary coherence
    """

    def __init__(
        self,
        threshold: float = 0.50,
        min_component_area_pixels: int = 40,
        pixel_resolution_m: float = 10.0,
    ):
        self.threshold = threshold
        self.min_component_area_pixels = min_component_area_pixels
        self.pixel_resolution_m = pixel_resolution_m

    def threshold_mask(self, probability_map: np.ndarray) -> np.ndarray:
        """Applies binary decision threshold to U-Net probability output."""
        if probability_map.ndim == 4:
            probability_map = probability_map[0, 0]
        elif probability_map.ndim == 3:
            probability_map = probability_map[0]

        binary_mask = (probability_map >= self.threshold).astype(np.uint8)
        return binary_mask

    def filter_connected_components(self, binary_mask: np.ndarray) -> np.ndarray:
        """Eliminates isolated small noise specks below minimum component area."""
        if CV2_AVAILABLE:
            num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
                binary_mask, connectivity=8
            )
            filtered = np.zeros_like(binary_mask)
            for i in range(1, num_labels):
                area = stats[i, cv2.CC_STAT_AREA]
                if area >= self.min_component_area_pixels:
                    filtered[labels == i] = 1
            return filtered
        else:
            # Fallback using scipy if cv2 is absent
            try:
                from scipy.ndimage import label
                structure = np.ones((3, 3), dtype=int)
                labeled, n_components = label(binary_mask, structure)
                filtered = np.zeros_like(binary_mask)
                for comp_idx in range(1, n_components + 1):
                    component_mask = (labeled == comp_idx)
                    if np.sum(component_mask) >= self.min_component_area_pixels:
                        filtered[component_mask] = 1
                return filtered
            except ImportError:
                return binary_mask

    def extract_contours(self, binary_mask: np.ndarray) -> List[np.ndarray]:
        """Extracts boundary contours from the cleaned binary mask."""
        if CV2_AVAILABLE:
            contours, _ = cv2.findContours(
                binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            # Filter by minimum length
            valid_contours = [c for c in contours if len(c) >= 3]
            return valid_contours
        else:
            # Simple boundary tracing fallback
            y_indices, x_indices = np.where(binary_mask > 0)
            if len(y_indices) < 3:
                return []
            min_x, max_x = float(np.min(x_indices)), float(np.max(x_indices))
            min_y, max_y = float(np.min(y_indices)), float(np.max(y_indices))
            box = np.array([
                [[min_x, min_y]],
                [[max_x, min_y]],
                [[max_x, max_y]],
                [[min_x, max_y]],
            ], dtype=np.int32)
            return [box]

    def compute_metrics(
        self,
        binary_mask: np.ndarray,
        probability_map: np.ndarray,
        top_left_lat: float,
        top_left_lon: float,
        transform_meta: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Computes comprehensive scientific metrics, GeoJSON polygon, and confidence."""
        if probability_map.ndim == 4:
            prob_2d = probability_map[0, 0]
        elif probability_map.ndim == 3:
            prob_2d = probability_map[0]
        else:
            prob_2d = probability_map

        # Map back to original image coordinate scale if transformed
        scale_x = transform_meta.get("scale_x", 1.0) if transform_meta else 1.0
        scale_y = transform_meta.get("scale_y", 1.0) if transform_meta else 1.0

        y_indices, x_indices = np.where(binary_mask > 0)

        if len(y_indices) == 0:
            return {
                "detected": False,
                "area_sqkm": 0.0,
                "perimeter_km": 0.0,
                "centroid": [top_left_lat, top_left_lon],
                "confidence": 0.0,
                "estimated_age_hours": 0.0,
                "polygon": None,
                "pixel_count": 0,
            }

        # 1. Pixel area and geographic conversion
        # Account for scale factor between model tensor and original scene
        effective_pixel_area_m2 = (self.pixel_resolution_m * scale_x) * (self.pixel_resolution_m * scale_y)
        total_area_sqkm = (len(y_indices) * effective_pixel_area_m2) / 1_000_000.0

        # 2. Centroid calculation
        mean_y = float(np.mean(y_indices)) * scale_y
        mean_x = float(np.mean(x_indices)) * scale_x

        # WGS84 degree meters approximation
        # 1 deg lat ~ 111,320m
        deg_lat_per_pixel = (self.pixel_resolution_m * scale_y) / 111320.0
        deg_lon_per_pixel = (self.pixel_resolution_m * scale_x) / (111320.0 * math.cos(math.radians(top_left_lat)))

        centroid_lat = round(top_left_lat - (mean_y * deg_lat_per_pixel), 5)
        centroid_lon = round(top_left_lon + (mean_x * deg_lon_per_pixel), 5)

        # 3. Contours and Polygon Extraction
        contours = self.extract_contours(binary_mask)
        polygon_geojson = None
        total_perimeter_m = 0.0

        if contours:
            # Take largest contour as primary slick
            contours_sorted = sorted(contours, key=lambda c: cv2.contourArea(c) if CV2_AVAILABLE else len(c), reverse=True)
            primary_contour = contours_sorted[0]

            if CV2_AVAILABLE:
                total_perimeter_m = cv2.arcLength(primary_contour, closed=True) * self.pixel_resolution_m * max(scale_x, scale_y)
                # Simplify contour with epsilon approximation to avoid over-segmentation
                epsilon = 0.015 * cv2.arcLength(primary_contour, True)
                approx_contour = cv2.approxPolyDP(primary_contour, epsilon, True)
                coords_pts = approx_contour.reshape(-1, 2)
            else:
                coords_pts = primary_contour.reshape(-1, 2)
                total_perimeter_m = 4.0 * math.sqrt(len(y_indices)) * self.pixel_resolution_m

            # Convert pixel coords to WGS84 GeoJSON [lon, lat]
            geo_coords = []
            for pt in coords_pts:
                px = float(pt[0]) * scale_x
                py = float(pt[1]) * scale_y
                p_lat = top_left_lat - (py * deg_lat_per_pixel)
                p_lon = top_left_lon + (px * deg_lon_per_pixel)
                geo_coords.append([round(p_lon, 5), round(p_lat, 5)])

            # Close polygon if not closed
            if len(geo_coords) >= 3:
                if geo_coords[0] != geo_coords[-1]:
                    geo_coords.append(geo_coords[0])

                if SHAPELY_AVAILABLE:
                    try:
                        poly = Polygon(geo_coords)
                        if not poly.is_valid:
                            poly = poly.buffer(0)
                        if isinstance(poly, Polygon) and not poly.is_empty:
                            geo_coords = [list(c) for c in poly.exterior.coords]
                    except Exception:
                        pass

                polygon_geojson = {
                    "type": "Polygon",
                    "coordinates": [geo_coords],
                }

        perimeter_km = round(total_perimeter_m / 1000.0, 2)

        # 4. Confidence Calculation
        # Evaluated as weighted harmonic mean of foreground probability, edge contrast, and spatial extent
        foreground_probs = prob_2d[binary_mask > 0]
        mean_prob = float(np.mean(foreground_probs)) if len(foreground_probs) > 0 else 0.5

        # Background contrast
        background_probs = prob_2d[binary_mask == 0]
        mean_bg = float(np.mean(background_probs)) if len(background_probs) > 0 else 0.1
        contrast_margin = min(1.0, max(0.0, mean_prob - mean_bg))

        # Size factor: very small slicks have lower confidence due to radar look-alikes
        size_factor = min(1.0, total_area_sqkm / 2.0)

        confidence = round(0.55 * mean_prob + 0.30 * contrast_margin + 0.15 * size_factor, 3)
        confidence = min(0.99, max(0.40, confidence))

        # 5. Estimated Age (hours)
        # Based on dispersion area and natural weathering expansion (~0.8 to 1.5 sq km expansion per 6 hours)
        estimated_age_hours = round(max(2.5, total_area_sqkm * 0.85), 1)

        return {
            "detected": True,
            "area_sqkm": round(total_area_sqkm, 2),
            "perimeter_km": perimeter_km,
            "centroid": [centroid_lat, centroid_lon],
            "confidence": confidence,
            "estimated_age_hours": estimated_age_hours,
            "polygon": polygon_geojson,
            "pixel_count": int(len(y_indices)),
        }
