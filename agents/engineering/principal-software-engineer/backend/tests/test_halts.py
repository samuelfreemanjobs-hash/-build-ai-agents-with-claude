from principal_software_engineer.halts import HaltCause, HaltError, NON_OVERRIDABLE


def test_halt_attributes():
    err = HaltError(HaltCause.CRITICAL_RISK_UNACKNOWLEDGED, "Risk", "Acknowledge", stage="S4")
    assert not err.overridable


def test_non_overridable():
    assert HaltCause.STANDARDS_VIOLATION in NON_OVERRIDABLE
