import pytest
from engineering_manager_agent.agent import EngineeringManagerAgent
from engineering_manager_agent.halts import HaltError, HaltCause

def test_intake_mock():
    a = EngineeringManagerAgent(mock_llm=True)
    ctx = a.intake("Plan sprint 24 for Platform team with Alex, Sam, Jordan. Goal: ship auth v2.")
    assert ctx.team_name and len(ctx.team_members) >= 1

def test_hr_halt():
    a = EngineeringManagerAgent(mock_llm=True)
    with pytest.raises(HaltError) as exc:
        a.intake("We need to terminate Alex for poor performance")
    assert exc.value.cause == HaltCause.HR_DECISION_ATTEMPT
