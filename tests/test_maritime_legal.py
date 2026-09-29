"""Tests for Maritime Statutory Penalty Calculation, Section 63 BSA 2023 / Section 65B

Evidence Certification, and Court Dossier PDF Generation.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.maritime_penalty import calculate_maritime_penalty, MaritimePenaltyAssessment
from backend.services.pdf_generator import generate_investigation_dossier_pdf

client = TestClient(app)


def test_maritime_penalty_calculation():
    """Verify Bonn Agreement oil volume, Merchant Shipping Act fines, and detention bond."""
    assessment: MaritimePenaltyAssessment = calculate_maritime_penalty(
        case_number="ICG/MRCC-MUM/2026/SP-0041",
        spill_area_sqkm=14.85,
        vessel_name="MT ARABIAN STAR",
        vessel_mmsi="419000123",
        vessel_flag="Panama",
        vessel_type="Crude Oil Tanker",
        is_foc=True,
        sensitivity_multiplier=1.8,
    )

    # 1. Volume and Thickness
    assert assessment.spill_area_sqkm == 14.85
    assert assessment.mean_thickness_microns == 4.2
    assert assessment.estimated_volume_m3 > 50.0  # ~62.37 m^3
    assert assessment.estimated_volume_mt > 45.0  # ~55.20 MT

    # 2. Base fine for tanker/FOC
    assert assessment.base_statutory_fine_inr == 10000000.0  # ₹1 Crore

    # 3. Cleanup costs
    assert assessment.cleanup_mobilization_inr == 3500000.0
    assert assessment.total_cleanup_cost_inr > assessment.cleanup_mobilization_inr

    # 4. Ecological damage
    assert assessment.ecological_damage_inr > 0

    # 5. Detention security bond under Section 356J (125% of total liability)
    assert assessment.detention_security_bond_inr == round(assessment.total_statutory_liability_inr * 1.25, 2)
    assert assessment.detention_security_bond_usd > 0

    # 6. Violations cited
    statutes = [v.statute for v in assessment.statutory_violations]
    sections = [v.section for v in assessment.statutory_violations]
    assert "Merchant Shipping Act, 1958" in statutes
    assert "MARPOL 73/78 Annex I" in statutes
    assert "Section 356C" in sections
    assert "Section 356J" in sections


def test_dossier_pdf_generation_and_statutory_certificate():
    """Verify that generate_investigation_dossier_pdf produces a court-admissible 3-page document."""
    dossier = {
        "case_number": "ICG/MRCC-MUM/2026/SP-0041",
        "region": "Offshore Mumbai High, Arabian Sea (Sector MH-4)",
        "spill": {
            "area_sqkm": 14.85,
            "confidence": 0.964,
            "centroid": [19.1120, 72.3950],
        },
        "ais_candidates": [
            {
                "vessel_name": "MT ARABIAN STAR",
                "mmsi": "419000123",
                "imo": "9384712",
                "flag": "Panama",
                "vessel_type": "Crude Oil Tanker",
                "suspicion_score": 98.2,
                "closest_distance_nm": 0.79,
                "sog_knots": 3.8,
            }
        ],
    }

    buf = generate_investigation_dossier_pdf(dossier)
    pdf_bytes = buf.getvalue()

    # Valid PDF magic bytes header
    assert pdf_bytes.startswith(b"%PDF-")
    # Substantial multi-page document (> 10 KB)
    assert len(pdf_bytes) > 10000


def test_investigation_pdf_export_api():
    """Verify the GET /api/v1/investigations/{id}/pdf endpoint returns a court dossier PDF."""
    res = client.get("/api/v1/investigations/INV-2026-MUM-041/pdf")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert "Content-Disposition" in res.headers
    assert "ICG_DOSSIER" in res.headers["Content-Disposition"]
    assert res.content.startswith(b"%PDF-")
    assert len(res.content) > 10000
