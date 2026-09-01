from unittest.mock import patch

from principal_software_engineer.agent import PrincipalSoftwareEngineerAgent
from principal_software_engineer.models import EvaluationResult


def test_frame_problem_mock():
    agent = PrincipalSoftwareEngineerAgent(mock_llm=True)
    brief = agent.frame_problem("API latency exceeds 500ms under load")
    assert brief.problem_id
    assert len(brief.success_criteria) >= 1


@patch("principal_software_engineer.agent.EvaluationRunner")
def test_execute_design_mock(mock_runner_cls):
    mock_runner_cls.return_value.evaluate.return_value = EvaluationResult(
        option_scores=[], recommended_option="OPT-A",
        risks=[], standards={"status": "PASS"}, status="PASS",
    )
    agent = PrincipalSoftwareEngineerAgent(mock_llm=True)
    package = agent.execute_design("Reduce API latency to under 200ms p99")
    assert package.run_id
    assert len(package.options) >= 2
    assert package.design_review is not None
