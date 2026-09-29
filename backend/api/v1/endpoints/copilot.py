"""
HACKX — AI Copilot API Endpoint ("Sagar Mitra / सागर मित्र")
Provides conversational REST endpoint for tactical maritime operations, natural human dialogue,
real-time time/date calculations, and explainable AI intelligence.
"""

from fastapi import APIRouter, HTTPException, status
from backend.services.copilot_service import (
    SagarMitraAIEngine,
    CopilotChatRequest,
    CopilotChatResponse,
    get_current_ist_time_info,
)

router = APIRouter()

@router.post(
    "/chat",
    response_model=CopilotChatResponse,
    summary="Chat with Sagar Mitra AI Maritime Assistant",
    description="Conversational endpoint for maritime intelligence, general natural dialogue, temporal queries, and suspect investigations."
)
async def chat_with_copilot(request: CopilotChatRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat query cannot be empty."
        )
    try:
        response = await SagarMitraAIEngine.chat(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Copilot dialogue processing error: {str(e)}"
        )

@router.get(
    "/status",
    summary="Get Sagar Mitra AI Operational Status",
    description="Returns current engine availability, real-time clock synchronization, and supported LLM capabilities."
)
async def get_copilot_status():
    time_info = get_current_ist_time_info()
    return {
        "status": "OPERATIONAL",
        "assistant_name": "Sagar Mitra (सागर मित्र)",
        "agency": "Indian Coast Guard / MRCC",
        "realtime_clock": time_info,
        "capabilities": [
            "Natural Human Conversational Dialogue",
            "Multi-Criteria Vessel Attribution (4D Correlation)",
            "Lagrangian RK4 Hydrodynamic Drift Explanation",
            "Real-Time IST & UTC Tactical Clock & Calendar",
            "Section 63 BSA 2023 & Section 356J MSA Legal Admissibility",
            "Bilingual English / Hindi Natural Language Understanding"
        ]
    }
