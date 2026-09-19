import math
from typing import Dict, Any, List, Tuple
import numpy as np


class SpillGeometryExtractor:
    """Extracts geographic polygons, area, perimeter, centroid, and estimated age from segmentation masks."""

    def __init__(self, pixel_resolution_m: float = 10.0):
        self.pixel_resolution_m = pixel_resolution_m

    def compute_metrics(
        self,
        binary_mask: np.ndarray,
        top_left_lat: float,
        top_left_lon: float,
    ) -> Dict[str, Any]:
        """Calculates area, perimeter, and geo-referenced coordinates."""
        # Find active pixel indices
        y_indices, x_indices = np.where(binary_mask > 0)

        if len(y_indices) == 0:
            return {
                "area_sqkm": 0.0,
                "perimeter_km": 0.0,
                "centroid_lat": top_left_lat,
                "centroid_lon": top_left_lon,
                "geometry": None,
                "estimated_age_hours": 0.0,
            }

        # 1 pixel area in sq km
        pixel_area_sqkm = (self.pixel_resolution_m * self.pixel_resolution_m) / 1_000_000.0
        total_area_sqkm = len(y_indices) * pixel_area_sqkm

        # Centroid in pixel space
        mean_y = float(np.mean(y_indices))
        mean_x = float(np.mean(x_indices))

        # Convert pixel offsets to geographic coords
        # 1 deg lat ~ 111,320m
        deg_lat_per_pixel = self.pixel_resolution_m / 111320.0
        deg_lon_per_pixel = self.pixel_resolution_m / (111320.0 * math.cos(math.radians(top_left_lat)))

        centroid_lat = top_left_lat - (mean_y * deg_lat_per_pixel)
        centroid_lon = top_left_lon + (mean_x * deg_lon_per_pixel)

        # Rough perimeter approximation from boundary bounding contour
        min_x, max_x = float(np.min(x_indices)), float(np.max(x_indices))
        min_y, max_y = float(np.min(y_indices)), float(np.max(y_indices))

        width_m = (max_x - min_x) * self.pixel_resolution_m
        height_m = (max_y - min_y) * self.pixel_resolution_m
        perimeter_km = 2.0 * (width_m + height_m) / 1000.0

        # Rough polygon representation around the bounds with buffer
        coords = [
            [round(top_left_lon + (min_x * deg_lon_per_pixel), 5), round(top_left_lat - (min_y * deg_lat_per_pixel), 5)],
            [round(top_left_lon + (max_x * deg_lon_per_pixel), 5), round(top_left_lat - (min_y * deg_lat_per_pixel), 5)],
            [round(top_left_lon + (max_x * deg_lon_per_pixel), 5), round(top_left_lat - (max_y * deg_lat_per_pixel), 5)],
            [round(top_left_lon + (min_x * deg_lon_per_pixel), 5), round(top_left_lat - (max_y * deg_lat_per_pixel), 5)],
            [round(top_left_lon + (min_x * deg_lon_per_pixel), 5), round(top_left_lat - (min_y * deg_lat_per_pixel), 5)],
        ]

        # Estimated age: based on elongation and dispersion area
        # Natural weathering spreads oil ~0.8-1.5 sq km per 6 hours
        estimated_age_hours = round(max(3.0, total_area_sqkm * 1.2), 1)

        return {
            "area_sqkm": round(total_area_sqkm, 2),
            "perimeter_km": round(perimeter_km, 2),
            "centroid_lat": round(centroid_lat, 5),
            "centroid_lon": round(centroid_lon, 5),
            "estimated_age_hours": estimated_age_hours,
            "geojson": {
                "type": "Polygon",
                "coordinates": [coords],
            },
        }
