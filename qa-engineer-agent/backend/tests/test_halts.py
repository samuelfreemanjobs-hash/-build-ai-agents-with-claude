from qa_engineer_agent.halts import HaltCause, HaltError, NON_OVERRIDABLE


def test_halt():
    error = HaltError(HaltCause.CRITICAL_RISK, "blocked", "fix tests", stage="S5")
    assert str(error) == "[critical_release_risk] blocked"
    assert HaltCause.CRITICAL_RISK in NON_OVERRIDABLE
