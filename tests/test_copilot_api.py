"""
Tests for AI Copilot ("Sagar Mitra / सागर मित्र") Endpoint & Conversational Intelligence
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_copilot_status():
    response = client.get("/api/v1/copilot/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert "Sagar Mitra" in data["assistant_name"]
    assert "realtime_clock" in data
    assert "time_ist" in data["realtime_clock"]

def test_copilot_chat_greeting():
    response = client.post(
        "/api/v1/copilot/chat",
        json={"query": "Hello there! How are you doing today?", "lang": "en"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 20
    assert "suggestions" in data

def test_copilot_chat_time_query():
    response = client.post(
        "/api/v1/copilot/chat",
        json={"query": "What is the current time and date in IST?", "lang": "en"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "IST" in data["reply"]
    assert "UTC" in data["reply"]

def test_copilot_chat_hindi_query():
    response = client.post(
        "/api/v1/copilot/chat",
        json={"query": "आज क्या तारीख है?", "lang": "hi"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["reply"]) > 10

def test_copilot_chat_suspect_query():
    response = client.post(
        "/api/v1/copilot/chat",
        json={"query": "Who is the primary suspect in this oil spill?", "lang": "en"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "ARABIAN STAR" in data["reply"].upper()
    assert data["action"] is not None
    assert data["action"]["type"] == "NAVIGATE"

def test_copilot_chat_empty_query():
    response = client.post(
        "/api/v1/copilot/chat",
        json={"query": "   "}
    )
    assert response.status_code == 400
