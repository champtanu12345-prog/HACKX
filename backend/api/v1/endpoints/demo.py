from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from backend.data.scenarios import DEMO_SCENARIOS_DATA

router = APIRouter()


@router.get("/scenarios")
def list_demo_scenarios() -> List[Dict[str, Any]]:
    """List all available deterministic synthetic investigation scenarios."""
    summaries = []
    for sc_id, sc in DEMO_SCENARIOS_DATA.items():
        summaries.append({
            "id": sc["id"],
            "title": sc["title"],
            "tagline": sc["tagline"],
            "region": sc["region"],
            "spill_area_sqkm": sc["spill_detection"]["area_sqkm"],
            "confidence_score": sc["spill_detection"]["confidence_score"],
            "vessels_count": len(sc["vessels"]),
            "top_suspect": sc["vessels"][0]["name"] if sc["vessels"] else "None",
            "top_score": sc["vessels"][0]["suspicion_score"] if sc["vessels"] else 0.0,
            "label": sc["label"],
        })
    return summaries


@router.get("/scenarios/{scenario_id}")
def get_demo_scenario(scenario_id: str) -> Dict[str, Any]:
    """Retrieve full deterministic scenario payload by ID."""
    if scenario_id not in DEMO_SCENARIOS_DATA:
        raise HTTPException(
            status_code=404,
            detail=f"Scenario '{scenario_id}' not found. Available scenarios: {list(DEMO_SCENARIOS_DATA.keys())}",
        )
    return DEMO_SCENARIOS_DATA[scenario_id]
