from unittest.mock import patch
from dataclasses import asdict

from fastapi.testclient import TestClient

from principal_software_engineer.api.main import app
from principal_software_engineer.models import (
    ArchitectureOption, DesignPackage, DesignReview, EvaluationResult,
    ProblemBrief, SuccessCriterion, Tier,
)

client = TestClient(app)


def test_health():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"


@patch("principal_software_engineer.api.jobs.PrincipalSoftwareEngineerAgent")
def test_execute_sync(mock_cls):
    brief = ProblemBrief(
        problem_id="P-1", title="Test", problem_statement="Slow API",
        tier=Tier.T1, success_criteria=[SuccessCriterion(id="SC-1", description="Fast")],
    )
    opts = [ArchitectureOption("A", "Cache", "Add cache", {"pros": [], "cons": []}, "low"),
            ArchitectureOption("B", "Replicas", "Read replicas", {"pros": [], "cons": []}, "medium")]
    pkg = DesignPackage(
        run_id="r1", problem_id="P-1", problem_title="Test", tier=Tier.T1,
        problem_brief=brief, options=opts,
        evaluation=EvaluationResult([], "A", [], {"status": "PASS"}),
        design_review=DesignReview("APPROVE", {"overall": 8}, []),
        adrs=[], run_log={"status": "completed"}, generated_at="2026-01-01",
    )
    mock_cls.return_value.execute_design.return_value = pkg

    r = client.post("/api/v1/design/execute-sync", json={
        "problem_description": "API is too slow under load", "mock_llm": True,
    })
    assert r.status_code == 200
    assert r.json()["status"] == "completed"
