"""Paris & Tokyo MoU Flag State Inspection Risk Registry.

Provides Port State Control (PSC) inspection risk classification based on the official
Paris MoU and Tokyo MoU annual performance lists of flag administrations.
Flags of Convenience (FOC) with substandard safety and environmental track records
receive elevated risk multipliers in the HACKX attribution scoring pipeline.
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class FlagStateRiskReport(BaseModel):
    """Structured Port State Control risk evaluation for a flag administration."""
    flag_country: str
    mou_status: str = Field(..., description="'BLACK_LIST', 'GREY_LIST', 'WHITE_LIST', 'UNKNOWN'")
    risk_level: str = Field(..., description="'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'")
    risk_multiplier: float = Field(..., ge=1.0, le=1.5, description="Attribution risk weight multiplier")
    foc_flag: bool = Field(False, description="Flag of Convenience designation by ITF")
    excess_factor: float = Field(0.0, description="Paris/Tokyo MoU statistical excess detention factor")
    detention_ratio_pct: float = Field(0.0, description="Average detention percentage over 3-year audit window")
    summary: str
    regulatory_context: str


class FlagStateRiskService:
    """Evaluates Flag Administration compliance and Port State Control historical risk."""

    # Paris & Tokyo MoU 3-Year Statistical Performance Lists
    BLACK_LIST: Dict[str, Dict[str, Any]] = {
        "comoros": {
            "name": "Comoros",
            "code": "KM",
            "mids": ["616", "620"],
            "excess_factor": 2.84,
            "detention_ratio_pct": 14.8,
            "risk_multiplier": 1.25,
            "foc": True,
            "summary": "Paris/Tokyo MoU Black List (Very High Risk) — Excessive detentions for MARPOL Annex I oily-water separator bypass and safety infractions.",
        },
        "palau": {
            "name": "Palau",
            "code": "PW",
            "mids": ["511"],
            "excess_factor": 2.45,
            "detention_ratio_pct": 12.6,
            "risk_multiplier": 1.22,
            "foc": True,
            "summary": "Paris/Tokyo MoU Black List (High Risk) — Elevated detention rate with repeat deficiencies in machinery space bilges and Oil Record Books.",
        },
        "cameroon": {
            "name": "Cameroon",
            "code": "CM",
            "mids": ["613"],
            "excess_factor": 3.12,
            "detention_ratio_pct": 16.2,
            "risk_multiplier": 1.28,
            "foc": True,
            "summary": "Paris/Tokyo MoU Black List (Critical Risk) — Extreme detention frequency and widespread use by dark fleet shadow tankers.",
        },
        "togo": {
            "name": "Togo",
            "code": "TG",
            "mids": ["671"],
            "excess_factor": 2.10,
            "detention_ratio_pct": 11.4,
            "risk_multiplier": 1.20,
            "foc": True,
            "summary": "Paris/Tokyo MoU Black List (High Risk) — High Port State Control detention frequency for marine pollution control non-compliance.",
        },
        "sierra leone": {
            "name": "Sierra Leone",
            "code": "SL",
            "mids": ["667"],
            "excess_factor": 2.30,
            "detention_ratio_pct": 12.1,
            "risk_multiplier": 1.22,
            "foc": True,
            "summary": "Paris/Tokyo MoU Black List (High Risk) — Substandard survey oversight with recurring MARPOL discharge equipment deficiencies.",
        },
        "tanzania": {
            "name": "Tanzania",
            "code": "TZ",
            "mids": ["674", "677"],
            "excess_factor": 2.05,
            "detention_ratio_pct": 10.9,
            "risk_multiplier": 1.18,
            "foc": True,
            "summary": "Paris/Tokyo MoU Black List (High Risk) — Significant historical detention record in Indian Ocean and Mediterranean PSC regimes.",
        },
        "guyana": {
            "name": "Guyana",
            "code": "GY",
            "mids": ["750"],
            "excess_factor": 1.95,
            "detention_ratio_pct": 9.8,
            "risk_multiplier": 1.18,
            "foc": True,
            "summary": "Paris/Tokyo MoU Black List (Medium-to-High Risk) — Frequent deficiencies reported in engine-room oily water management.",
        },
        "mongolia": {
            "name": "Mongolia",
            "code": "MN",
            "mids": ["457"],
            "excess_factor": 1.88,
            "detention_ratio_pct": 9.4,
            "risk_multiplier": 1.16,
            "foc": True,
            "summary": "Tokyo MoU Black List — Landlocked flag registry with documented audit oversight gaps.",
        },
    }

    GREY_LIST: Dict[str, Dict[str, Any]] = {
        "panama": {
            "name": "Panama",
            "code": "PA",
            "mids": ["351", "352", "353", "354", "355", "356", "357"],
            "excess_factor": 0.85,
            "detention_ratio_pct": 5.4,
            "risk_multiplier": 1.12,
            "foc": True,
            "summary": "Paris/Tokyo MoU Grey List (Moderate Risk) — World's largest open registry (Flag of Convenience); moderate inspection detention rate.",
        },
        "liberia": {
            "name": "Liberia",
            "code": "LR",
            "mids": ["636", "637"],
            "excess_factor": 0.52,
            "detention_ratio_pct": 4.2,
            "risk_multiplier": 1.08,
            "foc": True,
            "summary": "Paris/Tokyo MoU Grey/White Threshold — Major open registry with average environmental compliance record.",
        },
        "marshall islands": {
            "name": "Marshall Islands",
            "code": "MH",
            "mids": ["538"],
            "excess_factor": 0.40,
            "detention_ratio_pct": 3.8,
            "risk_multiplier": 1.05,
            "foc": True,
            "summary": "Paris/Tokyo MoU High-Quality Open Registry — Low-to-moderate risk profile.",
        },
        "malta": {
            "name": "Malta",
            "code": "MT",
            "mids": ["215", "229", "248", "249", "256"],
            "excess_factor": 0.72,
            "detention_ratio_pct": 4.9,
            "risk_multiplier": 1.08,
            "foc": True,
            "summary": "Paris MoU Grey List — European open registry with occasional environmental PSC detentions.",
        },
        "cyprus": {
            "name": "Cyprus",
            "code": "CY",
            "mids": ["209", "210", "212"],
            "excess_factor": 0.65,
            "detention_ratio_pct": 4.5,
            "risk_multiplier": 1.07,
            "foc": True,
            "summary": "Paris MoU Grey List — Mediterranean maritime registry with moderate inspection oversight.",
        },
        "bahamas": {
            "name": "Bahamas",
            "code": "BS",
            "mids": ["308", "309", "311"],
            "excess_factor": 0.48,
            "detention_ratio_pct": 3.9,
            "risk_multiplier": 1.06,
            "foc": True,
            "summary": "Paris/Tokyo MoU Grey List — Established open registry with consistent PSC performance.",
        },
    }

    WHITE_LIST: Dict[str, Dict[str, Any]] = {
        "india": {
            "name": "India",
            "code": "IN",
            "mids": ["419"],
            "excess_factor": -0.85,
            "detention_ratio_pct": 1.2,
            "risk_multiplier": 1.00,
            "foc": False,
            "summary": "Tokyo/Paris MoU White List (Low Risk) — Directorate General of Shipping stringent compliance regime; high environmental standard.",
        },
        "singapore": {
            "name": "Singapore",
            "code": "SG",
            "mids": ["563", "564", "565", "566"],
            "excess_factor": -1.20,
            "detention_ratio_pct": 0.9,
            "risk_multiplier": 1.00,
            "foc": False,
            "summary": "Paris/Tokyo MoU White List (Quality Flag) — Exemplary PSC record with top-tier Maritime & Port Authority oversight.",
        },
        "denmark": {
            "name": "Denmark",
            "code": "DK",
            "mids": ["219", "220"],
            "excess_factor": -1.35,
            "detention_ratio_pct": 0.7,
            "risk_multiplier": 1.00,
            "foc": False,
            "summary": "Paris/Tokyo MoU White List (Low Risk) — Danish Maritime Authority quality flag with strict environmental auditing.",
        },
        "united kingdom": {
            "name": "United Kingdom",
            "code": "GB",
            "mids": ["232", "233", "234", "235"],
            "excess_factor": -1.40,
            "detention_ratio_pct": 0.6,
            "risk_multiplier": 1.00,
            "foc": False,
            "summary": "Paris/Tokyo MoU White List (Low Risk) — MCA certified quality flag with near-zero MARPOL detentions.",
        },
        "norway": {
            "name": "Norway",
            "code": "NO",
            "mids": ["257", "258", "259"],
            "excess_factor": -1.30,
            "detention_ratio_pct": 0.7,
            "risk_multiplier": 1.00,
            "foc": False,
            "summary": "Paris/Tokyo MoU White List (Low Risk) — NIS/NOR high-standard fleet registry.",
        },
        "japan": {
            "name": "Japan",
            "code": "JP",
            "mids": ["431", "432"],
            "excess_factor": -1.45,
            "detention_ratio_pct": 0.5,
            "risk_multiplier": 1.00,
            "foc": False,
            "summary": "Tokyo MoU White List (Low Risk) — Japan MLIT premier quality administration.",
        },
        "germany": {
            "name": "Germany",
            "code": "DE",
            "mids": ["211", "218"],
            "excess_factor": -1.25,
            "detention_ratio_pct": 0.8,
            "risk_multiplier": 1.00,
            "foc": False,
            "summary": "Paris/Tokyo MoU White List (Low Risk) — BG Verkehr strict compliance administration.",
        },
    }

    @classmethod
    def evaluate_flag(cls, country_or_identifier: Optional[str], mmsi: Optional[str] = None) -> FlagStateRiskReport:
        """Evaluates flag country name, ISO code, or MMSI against Paris/Tokyo MoU registry."""
        query = (country_or_identifier or "").strip().lower()
        mmsi_str = str(mmsi or "").strip()
        mid_prefix = mmsi_str[:3] if len(mmsi_str) >= 3 else ""

        # 1. Check Black List by name or MID
        for key, data in cls.BLACK_LIST.items():
            if query == key or query == data["code"].lower() or query in data["name"].lower() or (mid_prefix and mid_prefix in data["mids"]):
                return FlagStateRiskReport(
                    flag_country=data["name"],
                    mou_status="BLACK_LIST",
                    risk_level="CRITICAL" if data["excess_factor"] >= 2.5 else "HIGH",
                    risk_multiplier=data["risk_multiplier"],
                    foc_flag=data["foc"],
                    excess_factor=data["excess_factor"],
                    detention_ratio_pct=data["detention_ratio_pct"],
                    summary=data["summary"],
                    regulatory_context="Paris & Tokyo MoU Black List (High Detention Flag of Convenience)",
                )

        # 2. Check Grey List
        for key, data in cls.GREY_LIST.items():
            if query == key or query == data["code"].lower() or query in data["name"].lower() or (mid_prefix and mid_prefix in data["mids"]):
                return FlagStateRiskReport(
                    flag_country=data["name"],
                    mou_status="GREY_LIST",
                    risk_level="MEDIUM",
                    risk_multiplier=data["risk_multiplier"],
                    foc_flag=data["foc"],
                    excess_factor=data["excess_factor"],
                    detention_ratio_pct=data["detention_ratio_pct"],
                    summary=data["summary"],
                    regulatory_context="Paris & Tokyo MoU Grey List (Flag of Convenience / Moderate Detention Risk)",
                )

        # 3. Check White List
        for key, data in cls.WHITE_LIST.items():
            if query == key or query == data["code"].lower() or query in data["name"].lower() or (mid_prefix and mid_prefix in data["mids"]):
                return FlagStateRiskReport(
                    flag_country=data["name"],
                    mou_status="WHITE_LIST",
                    risk_level="LOW",
                    risk_multiplier=data["risk_multiplier"],
                    foc_flag=data["foc"],
                    excess_factor=data["excess_factor"],
                    detention_ratio_pct=data["detention_ratio_pct"],
                    summary=data["summary"],
                    regulatory_context="Paris & Tokyo MoU White List (Quality Flag Administration)",
                )

        # 4. Unknown / Default Fallback
        c_name = country_or_identifier or "Unknown"
        return FlagStateRiskReport(
            flag_country=c_name,
            mou_status="UNKNOWN",
            risk_level="LOW",
            risk_multiplier=1.00,
            foc_flag=False,
            excess_factor=0.0,
            detention_ratio_pct=2.5,
            summary=f"Flag state '{c_name}' not listed on Paris/Tokyo MoU high-detention lists. Standard risk baseline applied.",
            regulatory_context="Standard Coastal / Unlisted Flag Administration",
        )


flag_state_service = FlagStateRiskService()
