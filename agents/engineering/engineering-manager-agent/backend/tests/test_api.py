from unittest.mock import patch
from dataclasses import asdict
from fastapi.testclient import TestClient
from engineering_manager_agent.api.main import app
from engineering_manager_agent.models import (
    CommitmentMap, GovernanceReview, ManagementContext, ManagementPackage, TeamMember, Tier,
)

client = TestClient(app)

def test_health():
    assert client.get("/").json()["status"] == "healthy"

@patch("engineering_manager_agent.api.jobs.EngineeringManagerAgent")
def test_sync(mock_cls):
    ctx = ManagementContext("C1", "Platform", "sprint-plan", Tier.T1, [TeamMember("Alex", "BE")])
    pkg = ManagementPackage("r1", ctx, {}, {"committable_points": 40}, {}, CommitmentMap("C1", [], 18),
                            {}, {"drafts": []}, GovernanceReview("APPROVE", {"overall": 8}, []),
                            {"status": "completed", "capacity_utilization": 45}, "2026-01-01")
    mock_cls.return_value.execute.return_value = pkg
    r = client.post("/api/v1/manage/plan-sync", json={
        "description": "Plan sprint 24 for Platform team. Goal: ship auth v2.", "mock_llm": True})
    assert r.status_code == 200 and r.json()["status"] == "completed"
