from software_architect.halts import HaltCause, HaltError, NON_OVERRIDABLE

def test_halt():
    e = HaltError(HaltCause.C4_VALIDATION_FAILED, "bad", "fix")
    assert not e.overridable
    assert HaltCause.CRITICAL_COUPLING in NON_OVERRIDABLE
