from unittest.mock import patch

from principal_software_engineer.evaluation import EvaluationRunner


@patch("principal_software_engineer.evaluation._run_script")
def test_evaluation_pass(mock_run):
    mock_run.side_effect = [
        {"option_scores": [{"option_id": "A", "weighted_total": 8}], "recommended_option": "A"},
        {"risks": [], "status": "PASS", "unacknowledged_critical": 0},
        {"status": "PASS", "violations": [], "errors": 0},
    ]
    runner = EvaluationRunner()
    result = runner.evaluate([
        {"option_id": "A", "complexity": "low", "trade_offs": {"pros": ["a"], "cons": []}},
        {"option_id": "B", "complexity": "medium", "trade_offs": {"pros": [], "cons": ["b"]}},
    ])
    assert result.status == "PASS"
