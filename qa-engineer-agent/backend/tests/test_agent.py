import pytest

from qa_engineer_agent.agent import QAEngineerAgent
from qa_engineer_agent.halts import HaltCause, HaltError


def test_intake_mock():
    agent = QAEngineerAgent(mock_llm=True)
    scope = agent.intake("Validate Auth v2 release with login and session requirements.")
    assert scope.release_name
    assert len(scope.requirements) >= 1


def test_execute_mock():
    agent = QAEngineerAgent(mock_llm=True)
    package = agent.execute("Validate Auth v2 release with login and session requirements.")
    assert package.run_log["status"] == "completed"
    assert package.coverage["coverage_pct"] >= 0
