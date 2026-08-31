"""Tests for verification runner."""

from unittest.mock import patch

from software_developer_agent.models import Tier
from software_developer_agent.verification import VerificationRunner


@patch("software_developer_agent.verification._run_script")
def test_verification_runner_all_pass(mock_run):
    mock_run.side_effect = [
        {"status": "PASS", "passed": 5, "failed": 0},
        {"status": "PASS", "errors": 0, "warnings": 0},
        {"status": "PASS", "findings": []},
    ]
    runner = VerificationRunner()
    result = runner.run(".", Tier.T0)
    assert result.overall_status == "PASS"
