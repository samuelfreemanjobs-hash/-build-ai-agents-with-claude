"""Tests for verification runner."""

from unittest.mock import patch

from software_developer_agent.models import Tier
from software_developer_agent.verification import VerificationRunner


@patch("software_developer_agent.verification._ROUTER.invoke")
def test_verification_runner_all_pass(mock_invoke):
    from agent_runtime.harness import HarnessResult

    mock_invoke.side_effect = [
        HarnessResult("PASS", {"status": "PASS", "passed": 5, "failed": 0}, "", "", 0, "test_runner.py"),
        HarnessResult("PASS", {"status": "PASS", "errors": 0, "warnings": 0}, "", "", 0, "lint_validator.py"),
        HarnessResult("PASS", {"status": "PASS", "findings": []}, "", "", 0, "security_scanner.py"),
    ]
    runner = VerificationRunner()
    result = runner.run(".", Tier.T0)
    assert result.overall_status == "PASS"
