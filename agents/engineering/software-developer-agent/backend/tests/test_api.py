"""API integration tests."""

from unittest.mock import patch

from fastapi.testclient import TestClient

from software_developer_agent.api.main import app
from software_developer_agent.models import (
    AcceptanceCriterion,
    CodeReviewResult,
    DevPackage,
    ImplementationPlan,
    TaskSpec,
    TaskType,
    Tier,
    VerificationResult,
)

client = TestClient(app)


def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


@patch("software_developer_agent.api.jobs.SoftwareDeveloperAgent")
def test_execute_sync_mock(mock_agent_cls):
    task = TaskSpec(
        task_id="TASK-001",
        title="Test task",
        description="Test",
        task_type=TaskType.FEATURE,
        tier=Tier.T1,
        repo_path=".",
        acceptance_criteria=[AcceptanceCriterion(id="AC-1", description="Works")],
    )
    mock_package = DevPackage(
        run_id="run_test_001",
        task_id="TASK-001",
        task_title="Test task",
        tier=Tier.T1,
        task_spec=task,
        implementation_plan=ImplementationPlan(
            plan_id="PLAN-001", task_id="TASK-001", approach_summary="Test",
            file_changes=[], test_strategy=[],
        ),
        file_changes=[],
        verification=VerificationResult(
            overall_status="PASS", tests={"status": "PASS"},
            lint={"status": "PASS"}, security={"status": "PASS"},
        ),
        code_review=CodeReviewResult(
            recommendation="APPROVE",
            scores={"overall": 8, "requirement_coverage": 8, "code_quality": 8,
                    "test_adequacy": 8, "security_posture": 9,
                    "maintainability": 8, "documentation": 7},
            defects=[],
        ),
        run_log={"status": "completed"},
        generated_at="2026-08-14T00:00:00Z",
    )
    mock_agent_cls.return_value.execute_task.return_value = mock_package

    response = client.post(
        "/api/v1/dev/execute-sync",
        json={
            "task_description": "Add input validation to the user registration form",
            "repo_path": ".",
            "mock_llm": True,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["run_id"] == "run_test_001"
