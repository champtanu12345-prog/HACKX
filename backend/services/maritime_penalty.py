"""Maritime Statutory Penalty, Clean-Up Cost & Liability Calculator.

Compliant with:
- Merchant Shipping Act, 1958 (Part XIA - Prevention & Containment of Pollution of Sea by Oil)
- MARPOL 73/78 (Annex I - Prevention of Pollution by Oil, Regulations 15 & 34)
- Territorial Waters, Continental Shelf, EEZ and other Maritime Zones Act, 1976 (Section 7)
- Admiralty (Jurisdiction and Settlement of Maritime Claims) Act, 2017
- Civil Liability Convention (CLC 1992) & National Green Tribunal "Polluter Pays Principle"
"""

import math
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class StatutoryViolation(BaseModel):
    statute: str
    section: str
    title: str
    description: str
    penalty_provision: str


class MaritimePenaltyAssessment(BaseModel):
    case_number: str
    target_vessel_name: str
    target_vessel_mmsi: str
    vessel_flag: str
    vessel_type: str
    is_foc: bool = Field(False, description="Flag of Convenience registry")
    
    # Discharge Volume Dynamics (Bonn Agreement Oil Appearance Code)
    spill_area_sqkm: float
    slick_appearance_code: str = "BAOAC-3 (Metallic / True Color Discontinuous)"
    mean_thickness_microns: float
    estimated_volume_m3: float
    estimated_volume_mt: float
    hydrocarbon_type: str = "Heavy Fuel Oil (HFO / Marine Diesel Fuel Oil)"
    density_mt_per_m3: float = 0.885

    # Financial Liability Breakdown (INR and USD)
    base_statutory_fine_inr: float
    cleanup_mobilization_inr: float
    cleanup_per_tonne_inr: float
    total_cleanup_cost_inr: float
    
    sensitivity_zone: str = "Western Offshore Continental Shelf (Mumbai High Sector)"
    sensitivity_multiplier: float = 1.8
    ecological_damage_inr: float
    
    total_statutory_liability_inr: float
    total_statutory_liability_usd: float
    
    # Security Deposit / Bank Guarantee required under Section 356J for vessel release
    detention_security_bond_inr: float
    detention_security_bond_usd: float
    
    statutory_violations: List[StatutoryViolation]
    recommended_enforcement_action: str


def calculate_maritime_penalty(
    case_number: str = "ICG/MRCC-MUM/2026/SP-0041",
    spill_area_sqkm: float = 14.85,
    vessel_name: str = "MT ARABIAN STAR",
    vessel_mmsi: str = "419000123",
    vessel_flag: str = "Panama",
    vessel_type: str = "Crude Oil Tanker",
    is_foc: bool = True,
    sensitivity_zone: str = "Continental Shelf & Commercial Fisheries Corridor",
    sensitivity_multiplier: float = 1.8,
    hydrocarbon_type: str = "Crude Bunker Heavy Oil (API Gravity ~ 28.5°)",
    exchange_rate_usd_inr: float = 86.50,
) -> MaritimePenaltyAssessment:
    """Calculates court-admissible statutory maritime penalties, clean-up liability,

    and Section 356J port detention security bond requirements.
    """
    # 1. Volume Calculation via Bonn Agreement Oil Appearance Code (BAOAC)
    # Metallic to continuous true color sheen average thickness: ~4.2 microns (4.2 * 10^-6 m)
    thickness_microns = 4.2
    thickness_meters = thickness_microns * 1e-6
    area_sqm = spill_area_sqkm * 1e6
    volume_m3 = round(area_sqm * thickness_meters, 2)
    density = 0.885  # metric tonnes per m^3 for marine crude/fuel oil
    volume_mt = round(volume_m3 * density, 2)

    # 2. Base Statutory Fine under Merchant Shipping Act 1958 §356K
    # Minimum baseline fine: ₹25,00,000; aggravated for Tanker / FOC registry: ₹1,00,00,000 (1 Crore)
    base_fine_inr = 10000000.0 if (is_foc or "tanker" in vessel_type.lower()) else 5000000.0

    # 3. Coast Guard Containment & Mobilization Recovery
    # Mobilization baseline (Fast Patrol Vessel + Pollution Control Vessel sea deployment + ODC aircraft sortie)
    cleanup_mob_inr = 3500000.0  # ₹35 Lakhs
    # Containment, skimming, and recovery per MT of spilled hydrocarbon
    per_tonne_rate = 185000.0   # ₹1,85,000 per MT
    cleanup_variable = volume_mt * per_tonne_rate
    total_cleanup_inr = round(cleanup_mob_inr + cleanup_variable, 2)

    # 4. Ecological Damage Restitution (National Green Tribunal / Polluter Pays Principle)
    # Statutory ecological rate: ₹3,20,000 per MT * habitat sensitivity multiplier
    ecological_inr = round(volume_mt * 320000.0 * sensitivity_multiplier, 2)

    # 5. Total Statutory Liability
    total_liability_inr = round(base_fine_inr + total_cleanup_inr + ecological_inr, 2)
    total_liability_usd = round(total_liability_inr / exchange_rate_usd_inr, 2)

    # 6. Section 356J Security Bond Requirement (125% contingency bond before vessel clearance)
    detention_bond_inr = round(total_liability_inr * 1.25, 2)
    detention_bond_usd = round(detention_bond_inr / exchange_rate_usd_inr, 2)

    # 7. Formulate Statutory Violations
    violations = [
        StatutoryViolation(
            statute="Merchant Shipping Act, 1958",
            section="Section 356C",
            title="Prohibition of Discharge of Oil or Oily Mixture",
            description=(
                f"Discharge of crude/fuel oil exceeding statutory limit (15 ppm) within Indian "
                f"Exclusive Economic Zone (reconstructed release area {spill_area_sqkm:.2f} km²)."
            ),
            penalty_provision="Statutory fine under §356K and immediate liability for containment expenses.",
        ),
        StatutoryViolation(
            statute="Merchant Shipping Act, 1958",
            section="Section 356E",
            title="Failure to Report Marine Discharge Incident",
            description="Master and Managing Owner failed to report accidental or operational discharge to Indian Maritime Administration / MRCC.",
            penalty_provision="Criminal misdemeanor liability and fine on vessel Master under §356L.",
        ),
        StatutoryViolation(
            statute="Merchant Shipping Act, 1958",
            section="Section 356J",
            title="Power to Detain Foreign Ship in Default of Security",
            description="Director-General of Shipping / Coast Guard empowerment to arrest and detain vessel at first Indian port of call until security bond is deposited.",
            penalty_provision=f"Mandatory Bank Guarantee deposit of ₹{detention_bond_inr:,.0f} ($ {detention_bond_usd:,.0f} USD).",
        ),
        StatutoryViolation(
            statute="MARPOL 73/78 Annex I",
            section="Regulation 15 & 34",
            title="Control of Operational Discharge of Oil (Machinery & Cargo Spaces)",
            description="Illegal discharge of machinery bilge/sludge mixtures during sea transit without operating approved Oil Discharge Monitoring and Control System (ODMCS).",
            penalty_provision="International Port State Control (PSC) detention and reporting to IMO Flag Administration.",
        ),
        StatutoryViolation(
            statute="Environment (Protection) Act, 1986",
            section="Section 15 & Section 7",
            title="Discharge of Environmental Pollutants in Excess of Prescribed Standards",
            description="Unregulated release of hazardous petroleum hydrocarbons into Indian territorial waters and contiguous marine eco-corridors.",
            penalty_provision="Imprisonment up to 5 years or fine up to ₹1,00,000 per day of continuing contravention.",
        ),
    ]

    action_text = (
        f"Issue immediate Maritime Arrest Warrant & Notice of Detention under Merchant Shipping Act 1958 §356J. "
        f"Direct Mumbai Port Authority / JNPT / DG Shipping to deny outbound port clearance to {vessel_name} (MMSI: {vessel_mmsi}) "
        f"until an irrevocable bank guarantee of ₹{detention_bond_inr:,.0f} ($ {detention_bond_usd:,.0f} USD) is deposited "
        f"with the Registrar of the High Court of Judicature (Admiralty Jurisdiction)."
    )

    return MaritimePenaltyAssessment(
        case_number=case_number,
        target_vessel_name=vessel_name,
        target_vessel_mmsi=vessel_mmsi,
        vessel_flag=vessel_flag,
        vessel_type=vessel_type,
        is_foc=is_foc,
        spill_area_sqkm=spill_area_sqkm,
        mean_thickness_microns=thickness_microns,
        estimated_volume_m3=volume_m3,
        estimated_volume_mt=volume_mt,
        hydrocarbon_type=hydrocarbon_type,
        base_statutory_fine_inr=base_fine_inr,
        cleanup_mobilization_inr=cleanup_mob_inr,
        cleanup_per_tonne_inr=per_tonne_rate,
        total_cleanup_cost_inr=total_cleanup_inr,
        sensitivity_zone=sensitivity_zone,
        sensitivity_multiplier=sensitivity_multiplier,
        ecological_damage_inr=ecological_inr,
        total_statutory_liability_inr=total_liability_inr,
        total_statutory_liability_usd=total_liability_usd,
        detention_security_bond_inr=detention_bond_inr,
        detention_security_bond_usd=detention_bond_usd,
        statutory_violations=violations,
        recommended_enforcement_action=action_text,
    )
