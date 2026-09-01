from unittest.mock import patch
from dataclasses import asdict

from fastapi.testclient import TestClient

from qa_engineer_agent.api.main import app
from qa_engineer_agent.models import QAPackage, ReleaseReadiness, TestScope, TestStrategy, Tier

client = TestClient(app)


def test_health():
    assert client.get("/").json()["status"] == "healthy"


@patch("qa_engineer_agent.api.jobs.QAEngineerAgent")
def test_validate_sync(mock_cls):
    scope = TestScope("SCOPE-1", "Auth v2", "release-validation", Tier.T1)
    package = QAPackage(
        run_id="r1",
        scope=scope,
        coverage={"coverage_pct": 90},
        risk={"risk_level": "low"},
        validation={"severity": "pass"},
        regression={"critical_impacted": []},
        strategy=TestStrategy("SCOPE-1", [], [], 2),
        readiness=ReleaseReadiness("GO", {"overall": 8}, []),
        action_plan={"release_notes_draft": "Ready"},
        run_log={"status": "completed", "readiness_score": 8},
    )
    mock_cls.return_value.execute.return_value = package
    response = client.post(
        "/api/v1/qa/validate-sync",
        json={"description": "Validate release Auth v2 with login and session requirements.", "mock_llm": True},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "completed"
