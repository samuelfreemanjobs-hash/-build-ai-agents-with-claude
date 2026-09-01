"""Tests for agent orchestrator."""

from unittest.mock import patch, MagicMock

from software_developer_agent.agent import SoftwareDeveloperAgent
from software_developer_agent.models import VerificationResult, CodeReviewResult


def test_intake_task_mock():
    agent = SoftwareDeveloperAgent(mock_llm=True)
    task = agent.intake_task("Add a login form with email validation", ".")
    assert task.task_id
    assert task.title
    assert len(task.acceptance_criteria) >= 1


@patch("software_developer_agent.agent.VerificationRunner")
def test_execute_task_mock(mock_runner_cls):
    mock_runner_cls.return_value.run.return_value = VerificationResult(
        overall_status="PASS",
        tests={"status": "PASS"},
        lint={"status": "PASS"},
        security={"status": "PASS"},
    )
    agent = SoftwareDeveloperAgent(mock_llm=True)
    package = agent.execute_task(
        "Add email validation to the login form",
        repo_path=".",
    )
    assert package.run_id
    assert package.task_spec
    assert package.code_review is not None
    assert package.run_log["status"] in ("completed", "halted")
