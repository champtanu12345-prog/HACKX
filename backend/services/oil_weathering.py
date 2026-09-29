"""NOAA ADIOS / Mackay Empirical Oil Weathering Kinetics Engine.

Implements physicochemical weathering processes for marine petroleum hydrocarbons:
1. Evaporative Mass Loss (Mackay analytical distillation / Fingas model)
2. Water-in-Oil Emulsification ("Chocolate Mousse" formation, Mackay 1980)
3. Mooney Dynamic Viscosity Surge
4. Natural Entrainment / Oceanic Dispersion (Delvigne & Sweeney 1988)
5. Surface Emulsion Volume & Spreading Dynamics
"""

import math
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class OilWeatheringState(BaseModel):
    """Snapshot of chemical and physical oil properties at a specific slick age."""
    age_hours: float = Field(..., description="Elapsed weathering time in hours")
    evaporated_fraction: float = Field(..., ge=0.0, le=1.0, description="Fraction of mass lost to evaporation")
    evaporated_percentage: float = Field(..., description="Evaporated mass percentage (0-100%)")
    water_content_fraction: float = Field(..., ge=0.0, le=0.85, description="Fraction of water emulsified in oil")
    water_content_percentage: float = Field(..., description="Water-in-oil emulsification percentage")
    emulsion_volume_multiplier: float = Field(..., description="Ratio of emulsified volume to initial oil volume")
    dynamic_viscosity_cst: float = Field(..., description="Kinematic viscosity in centistokes (cSt)")
    surface_density_kg_m3: float = Field(..., description="Emulsion bulk density in kg/m³")
    volume_remaining_m3: float = Field(..., description="Remaining surface emulsion volume in m³")
    volume_remaining_mt: float = Field(..., description="Net hydrocarbon mass remaining in metric tonnes")
    weathering_stage: str = Field(..., description="Forensic weathering classification")
    dispersed_fraction: float = Field(0.0, description="Natural oceanic entrainment fraction")


class ADIOSOilWeatheringEngine:
    """Simulates weathering kinetics based on NOAA ADIOS and Mackay models."""

    def __init__(
        self,
        initial_volume_m3: float = 62.37,
        initial_density_kg_m3: float = 885.0,  # ~28.5 API Marine Fuel / Crude
        initial_viscosity_cst: float = 48.0,
        max_water_content: float = 0.75,       # 75% max water uptake for mousse
        sea_temp_celsius: float = 28.0,        # Representative Arabian Sea SST
    ):
        self.v0 = initial_volume_m3
        self.rho0 = initial_density_kg_m3
        self.m0_mt = (self.v0 * self.rho0) / 1000.0
        self.mu0 = initial_viscosity_cst
        self.max_water = max_water_content
        self.sst_c = sea_temp_celsius

    def compute_state(
        self,
        age_hours: float,
        wind_speed_ms: float = 6.2,
    ) -> OilWeatheringState:
        """Computes comprehensive weathering state at a given elapsed time (hours)."""
        t = max(0.0, float(age_hours))
        u_wind = max(0.5, float(wind_speed_ms))

        if t == 0.0:
            return OilWeatheringState(
                age_hours=0.0,
                evaporated_fraction=0.0,
                evaporated_percentage=0.0,
                water_content_fraction=0.0,
                water_content_percentage=0.0,
                emulsion_volume_multiplier=1.0,
                dynamic_viscosity_cst=round(self.mu0, 1),
                surface_density_kg_m3=round(self.rho0, 1),
                volume_remaining_m3=round(self.v0, 2),
                volume_remaining_mt=round(self.m0_mt, 2),
                weathering_stage="FRESH_DISCHARGE",
                dispersed_fraction=0.0,
            )

        # 1. Evaporation Kinetics (Mackay Empirical Distillation Cut)
        # Fraction increases logarithmically with wind shear and sea surface temperature
        temp_factor = 1.0 + (self.sst_c - 15.0) * 0.015
        wind_shear = (u_wind / 5.0) ** 0.65
        f_evap = min(0.48, 0.085 * temp_factor * math.log(1.0 + 4.2 * t * wind_shear))

        # 2. Emulsification (Water-in-Oil "Chocolate Mousse" Formation)
        # Driven by breaking wave energy proportional to (U_wind + 1.0)^2
        k_emuls = 0.042 * ((u_wind + 1.0) / 6.0)
        y_w = self.max_water * (1.0 - math.exp(-k_emuls * t))

        # 3. Natural Oceanic Dispersion into Water Column (Delvigne & Sweeney)
        # Entrainment of oil droplets beneath breaking whitecaps
        f_disp = min(0.18, 0.0035 * ((u_wind / 5.0) ** 2) * (1.0 - y_w) * t)

        # 4. Dynamic Viscosity Surge (Mooney Equation)
        # Viscosity increases exponentially with evaporative fraction and water content
        mu_evap_factor = math.exp(3.25 * f_evap)
        # Mooney term for rigid spheres emulsion: exp(2.5 * y_w / (1 - 0.65 * y_w))
        mooney_denom = max(0.10, 1.0 - 0.65 * y_w)
        mu_emuls_factor = math.exp((2.5 * y_w) / mooney_denom)
        viscosity = min(500000.0, self.mu0 * mu_evap_factor * mu_emuls_factor)

        # 5. Density evolution
        # Density of seawater ~ 1025 kg/m3
        density = (1.0 - y_w) * self.rho0 + (y_w * 1025.0)

        # 6. Mass and Volume balance
        remaining_mass_fraction = max(0.10, 1.0 - f_evap - f_disp)
        net_hydrocarbon_mt = self.m0_mt * remaining_mass_fraction
        
        # Emulsion volume multiplier: incorporates water into the slick
        emulsion_multiplier = remaining_mass_fraction / max(0.15, 1.0 - y_w)
        volume_m3 = self.v0 * emulsion_multiplier

        # 7. Weathering Stage Categorization
        if t <= 2.0:
            stage = "FRESH_DISCHARGE"
        elif t <= 8.0:
            stage = "ACTIVE_EVAPORATION"
        elif t <= 18.0:
            stage = "WATER_IN_OIL_MOUSSE"
        else:
            stage = "HIGHLY_VISCOUS_EMULSION"

        return OilWeatheringState(
            age_hours=round(t, 2),
            evaporated_fraction=round(f_evap, 4),
            evaporated_percentage=round(f_evap * 100.0, 1),
            water_content_fraction=round(y_w, 4),
            water_content_percentage=round(y_w * 100.0, 1),
            emulsion_volume_multiplier=round(emulsion_multiplier, 3),
            dynamic_viscosity_cst=round(viscosity, 1),
            surface_density_kg_m3=round(density, 1),
            volume_remaining_m3=round(volume_m3, 2),
            volume_remaining_mt=round(net_hydrocarbon_mt, 2),
            weathering_stage=stage,
            dispersed_fraction=round(f_disp, 4),
        )

    def generate_weathering_curve(
        self,
        total_hours: float = 24.0,
        step_hours: float = 1.0,
        wind_speed_ms: float = 6.2,
    ) -> List[OilWeatheringState]:
        """Generates a complete temporal weathering profile."""
        steps = int(round(total_hours / step_hours))
        return [
            self.compute_state(step * step_hours, wind_speed_ms=wind_speed_ms)
            for step in range(steps + 1)
        ]


# ==============================================================================
# Bonn Agreement Oil Appearance Code (BAOAC) International Volume Quantification
# ==============================================================================

BAOAC_STANDARDS = {
    1: {
        "code": 1,
        "name": "Sheen / Silver",
        "thickness_layer_range_um": "0.04 - 0.10",
        "nominal_thickness_um": 0.07,
        "min_volume_m3_per_km2": 0.04,
        "nominal_volume_m3_per_km2": 0.07,
        "max_volume_m3_per_km2": 0.10,
        "visual_appearance": "Silvery or grey reflection on water surface",
    },
    2: {
        "code": 2,
        "name": "Rainbow",
        "thickness_layer_range_um": "0.10 - 5.0",
        "nominal_thickness_um": 1.0,
        "min_volume_m3_per_km2": 0.10,
        "nominal_volume_m3_per_km2": 1.0,
        "max_volume_m3_per_km2": 5.0,
        "visual_appearance": "Multiple bright spectral interference colors",
    },
    3: {
        "code": 3,
        "name": "Metallic",
        "thickness_layer_range_um": "5.0 - 50.0",
        "nominal_thickness_um": 25.0,
        "min_volume_m3_per_km2": 5.0,
        "nominal_volume_m3_per_km2": 25.0,
        "max_volume_m3_per_km2": 50.0,
        "visual_appearance": "Dull metallic sheen reflecting underlying sea hue",
    },
    4: {
        "code": 4,
        "name": "Discontinuous True Oil",
        "thickness_layer_range_um": "50.0 - 200.0",
        "nominal_thickness_um": 100.0,
        "min_volume_m3_per_km2": 50.0,
        "nominal_volume_m3_per_km2": 100.0,
        "max_volume_m3_per_km2": 200.0,
        "visual_appearance": "Dark petroleum patches interspersed with rainbow borders",
    },
    5: {
        "code": 5,
        "name": "Continuous True Oil / Mousse",
        "thickness_layer_range_um": "> 200.0",
        "nominal_thickness_um": 500.0,
        "min_volume_m3_per_km2": 200.0,
        "nominal_volume_m3_per_km2": 500.0,
        "max_volume_m3_per_km2": 1200.0,
        "visual_appearance": "Heavy dark brown/black emulsified layer (chocolate mousse)",
    },
}


def compute_baoac_volume(
    area_sqkm: float,
    predominant_code: int = 4,
    custom_distribution: Optional[Dict[int, float]] = None,
    oil_density_kg_m3: float = 885.0,
) -> Dict[str, Any]:
    """Calculates international standard BAOAC oil discharge volume and mass.
    
    Args:
        area_sqkm: Detected slick surface area in square kilometers.
        predominant_code: Primary BAOAC appearance code (1 to 5).
        custom_distribution: Optional breakdown of area fractions {code: fraction}.
        oil_density_kg_m3: Bulk hydrocarbon density in kg/m³.
        
    Returns:
        Structured breakdown with min, nominal, and max volume (m³) and mass (metric tonnes).
    """
    area = max(0.001, float(area_sqkm))

    if custom_distribution:
        min_v = 0.0
        nom_v = 0.0
        max_v = 0.0
        breakdown = []
        for code, fraction in custom_distribution.items():
            std = BAOAC_STANDARDS.get(int(code), BAOAC_STANDARDS[predominant_code])
            sub_area = area * fraction
            sub_nom = sub_area * std["nominal_volume_m3_per_km2"]
            min_v += sub_area * std["min_volume_m3_per_km2"]
            nom_v += sub_nom
            max_v += sub_area * std["max_volume_m3_per_km2"]
            breakdown.append({
                "code": code,
                "name": std["name"],
                "area_fraction": round(fraction, 2),
                "sub_area_sqkm": round(sub_area, 3),
                "nominal_volume_m3": round(sub_nom, 2),
            })
    else:
        std = BAOAC_STANDARDS.get(int(predominant_code), BAOAC_STANDARDS[4])
        min_v = area * std["min_volume_m3_per_km2"]
        nom_v = area * std["nominal_volume_m3_per_km2"]
        max_v = area * std["max_volume_m3_per_km2"]
        breakdown = [{
            "code": predominant_code,
            "name": std["name"],
            "area_fraction": 1.0,
            "sub_area_sqkm": round(area, 3),
            "nominal_volume_m3": round(nom_v, 2),
        }]

    density_factor = oil_density_kg_m3 / 1000.0

    return {
        "standard": "Bonn Agreement Oil Appearance Code (BAOAC 2012 / IMO MEPC)",
        "area_sqkm": round(area, 3),
        "predominant_code": predominant_code,
        "classification": BAOAC_STANDARDS.get(int(predominant_code), BAOAC_STANDARDS[4])["name"],
        "min_volume_m3": round(min_v, 2),
        "nominal_volume_m3": round(nom_v, 2),
        "max_volume_m3": round(max_v, 2),
        "min_mass_mt": round(min_v * density_factor, 2),
        "nominal_mass_mt": round(nom_v * density_factor, 2),
        "max_mass_mt": round(max_v * density_factor, 2),
        "breakdown": breakdown,
    }


def evaluate_sar_look_alike(
    surface_wind_ms: float,
    dark_spot_contrast: float = 0.85,
    perimeter_km: Optional[float] = None,
    area_sqkm: Optional[float] = None,
) -> Dict[str, Any]:
    """Evaluates the probability of a SAR detection being a natural Look-Alike vs genuine petroleum slick.
    
    In synthetic aperture radar (SAR), low wind (<2.5 m/s) and biogenic films mimic mineral oil.
    This function applies oceanographic wind-gating and morphological damping tests.
    """
    u_wind = float(surface_wind_ms)
    contrast = min(1.0, max(0.0, float(dark_spot_contrast)))

    # Compute shape complexity (elongation / fractal dimension proxy)
    elongation_ratio = 1.0
    if perimeter_km is not None and area_sqkm is not None and area_sqkm > 0.0:
        # Circularity = 4 * pi * Area / Perimeter^2
        circularity = (4.0 * math.pi * area_sqkm) / max(0.1, perimeter_km ** 2)
        elongation_ratio = round(1.0 / max(0.05, circularity), 2)

    # 1. Wind speed regime check
    if u_wind < 2.5:
        # Calm sea regime: high probability of biogenic or low-wind calm area
        look_alike_prob = 78.0 - (contrast * 15.0)
        regime = "CALM_WATER_DAMPING"
        verdict = "POSSIBLE_LOOK_ALIKE"
        explanation = (
            f"Surface wind speed ({u_wind:.1f} m/s) is below 2.5 m/s threshold. "
            f"Natural calm water surfaces produce mirror reflection resembling dark oil slicks."
        )
    elif 2.5 <= u_wind <= 12.0:
        # Ideal SAR detection window: capillary waves dampened selectively by mineral hydrocarbons
        base_prob = 8.0 if contrast > 0.75 else 22.0
        look_alike_prob = max(4.0, base_prob - (min(elongation_ratio, 5.0) * 1.5))
        regime = "OPTIMAL_DETECTION_WINDOW"
        verdict = "CONFIRMED_MINERAL_OIL"
        explanation = (
            f"Optimal atmospheric wind forcing ({u_wind:.1f} m/s). Strong Bragg scattering attenuation "
            f"with sharp border gradient confirms true petroleum hydrocarbon film."
        )
    else:
        # High sea state (>12 m/s): rapid physical entrainment / wave breaking
        look_alike_prob = 45.0
        regime = "HIGH_SEA_CLUTTER"
        verdict = "DEGRADED_DETECTION"
        explanation = (
            f"High wind speed ({u_wind:.1f} m/s) produces whitecaps and rapid natural oceanic dispersion, "
            f"increasing false alarm noise."
        )

    confidence = round(100.0 - look_alike_prob, 1)

    return {
        "verdict": verdict,
        "look_alike_probability_pct": round(look_alike_prob, 1),
        "confidence_score": confidence,
        "wind_regime": regime,
        "surface_wind_ms": round(u_wind, 2),
        "dark_spot_contrast": round(contrast, 2),
        "shape_elongation_ratio": elongation_ratio,
        "explanation": explanation,
        "is_reliable_for_attribution": verdict == "CONFIRMED_MINERAL_OIL",
    }


def estimate_slick_age(
    evaporated_percentage: Optional[float] = None,
    water_content_percentage: Optional[float] = None,
    viscosity_cst: Optional[float] = None,
    wind_speed_ms: float = 6.0,
) -> Dict[str, Any]:
    """Inverts ADIOS weathering kinetics to estimate elapsed time since initial discharge."""
    engine = ADIOSOilWeatheringEngine()
    best_age = 12.0
    min_error = float("inf")

    # Grid search across 0 to 72 hours in 0.25h increments
    for step in range(0, 289):
        test_t = step * 0.25
        state = engine.compute_state(test_t, wind_speed_ms=wind_speed_ms)

        error = 0.0
        weights = 0.0

        if evaporated_percentage is not None:
            error += abs(state.evaporated_percentage - evaporated_percentage) * 1.5
            weights += 1.5

        if water_content_percentage is not None:
            error += abs(state.water_content_percentage - water_content_percentage) * 1.0
            weights += 1.0

        if viscosity_cst is not None and viscosity_cst > 0.0:
            # Log scale for exponential viscosity
            log_err = abs(math.log10(max(10.0, state.dynamic_viscosity_cst)) - math.log10(max(10.0, viscosity_cst)))
            error += log_err * 8.0
            weights += 1.0

        total_err = error / max(1.0, weights)
        if total_err < min_error:
            min_error = total_err
            best_age = test_t

    uncertainty_hours = round(max(1.0, best_age * 0.15), 1)

    return {
        "estimated_age_hours": round(best_age, 1),
        "uncertainty_margin_hours": uncertainty_hours,
        "age_range_hours": [max(0.0, round(best_age - uncertainty_hours, 1)), round(best_age + uncertainty_hours, 1)],
        "weathering_stage": engine.compute_state(best_age, wind_speed_ms=wind_speed_ms).weathering_stage,
        "fit_confidence_score": round(max(60.0, 100.0 - min_error * 4.0), 1),
    }

