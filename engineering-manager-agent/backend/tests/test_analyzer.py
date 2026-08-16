from engineering_manager_agent.analyzer import TeamAnalyzer

def test_validate_pass():
    a = TeamAnalyzer()
    r = a.validate_commitments({"committable_points": 40}, {"items": [{"points": 20}]})
    assert r["feasible"]

def test_validate_fail():
    import pytest
    from engineering_manager_agent.halts import HaltError
    a = TeamAnalyzer()
    with pytest.raises(HaltError):
        a.validate_commitments({"committable_points": 40}, {"items": [{"points": 50}]})
