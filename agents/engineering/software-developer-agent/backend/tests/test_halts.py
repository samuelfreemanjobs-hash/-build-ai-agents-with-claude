"""Tests for halt enforcement."""

from software_developer_agent.halts import HaltCause, HaltError, NON_OVERRIDABLE


def test_halt_error_attributes():
    err = HaltError(HaltCause.TEST_FAILURE, "Tests failed", "Fix tests", stage="S4")
    assert err.cause == HaltCause.TEST_FAILURE
    assert err.stage == "S4"
    assert not err.overridable


def test_non_overridable_causes():
    assert HaltCause.SECRET_DETECTED in NON_OVERRIDABLE
    assert HaltCause.TEST_FAILURE in NON_OVERRIDABLE


def test_overridable_cause():
    err = HaltError(HaltCause.LINT_ERROR, "Lint failed", "Fix lint")
    assert err.overridable
