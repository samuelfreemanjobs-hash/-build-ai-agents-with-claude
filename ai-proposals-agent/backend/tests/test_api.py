"""FastAPI endpoint tests."""

import os

import pytest
from fastapi.testclient import TestClient

from ai_proposals_agent.api.jobs import jobs_store
from ai_proposals_agent.api.main import app

SAMPLE_RFP = """
Company: TechRetail Inc.
Industry: E-commerce Retail
Requirements: Warehousing, Order fulfillment
Certifications: ISO 9001
Budget: $500K annually
"""


@pytest.fixture
def client():
    jobs_store.clear()
    return TestClient(app)


def test_health(client):
    r = client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_generate_sync_mock(client):
    r = client.post(
        "/api/v1/proposals/generate-sync",
        json={
            "rfp_text": SAMPLE_RFP,
            "pricing_tier": "balanced",
            "mock_llm": True,
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "completed"
    assert data["client_name"] == "TechRetail Inc."
    assert data["total_value"]  # decimal string
    assert "." in data["total_value"]


def test_pricing_scenarios_engine(client):
    r = client.post(
        "/api/v1/pricing/scenarios",
        json={
            "services": ["dedicated_shuttle", "yard_management", "asn_compliance_desk"],
            "volume_estimates": {"annual_moves": "1200"},
            "corridor": "DET-WARREN",
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert data["scenarios"]["balanced"]["total"] == "396000.00"
    assert data["pricing_hash"].startswith("sha256:")


def test_pricing_halt_missing_row(client):
    r = client.post(
        "/api/v1/pricing/scenarios",
        json={
            "services": ["nonexistent_service"],
            "volume_estimates": {"volume": "100"},
            "corridor": "DET-WARREN",
        },
    )
    assert r.status_code == 422
    assert r.json()["detail"]["halt_cause"] == "MISSING_COST_ROW"


def test_case_studies_list(client):
    r = client.get("/api/v1/knowledge-base/case-studies")
    assert r.status_code == 200
    assert r.json()["total"] >= 3


def test_compliance_check(client):
    r = client.get("/api/v1/compliance/check", params={"certifications_required": "ISO 9001, CTPAT"})
    assert r.status_code == 200
    assert "checks" in r.json()


def test_async_generate_poll(client):
    r = client.post(
        "/api/v1/proposals/generate",
        json={"rfp_text": SAMPLE_RFP, "mock_llm": True},
    )
    assert r.status_code == 200
    job_id = r.json()["job_id"]

    # Background tasks run inline in TestClient
    status = client.get(f"/api/v1/proposals/status/{job_id}")
    assert status.status_code == 200
    assert status.json()["status"] in ("completed", "processing", "pending")

    # Poll until done (TestClient runs background immediately)
    final = client.get(f"/api/v1/proposals/status/{job_id}").json()
    if final["status"] == "completed":
        dl = client.get(f"/api/v1/proposals/download/{job_id}")
        assert dl.status_code == 200
