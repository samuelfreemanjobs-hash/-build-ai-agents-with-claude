from engineering_manager_agent.halts import HaltCause, HaltError, NON_OVERRIDABLE

def test_halt():
    e = HaltError(HaltCause.OVERCOMMIT, "over", "fix")
    assert not e.overridable
    assert HaltCause.HR_DECISION_ATTEMPT in NON_OVERRIDABLE
