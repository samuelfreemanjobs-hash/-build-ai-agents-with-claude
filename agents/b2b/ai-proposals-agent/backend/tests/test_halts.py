"""Halt handler tests — G07."""

import pytest

from ai_proposals_agent.halts import (
    NON_OVERRIDABLE,
    HaltCause,
    HaltError,
    assert_overridable,
)


def test_non_overridable_frozenset():
    assert HaltCause.MISSING_COST_ROW in NON_OVERRIDABLE
    assert HaltCause.VOLUME_OUT_OF_BAND in NON_OVERRIDABLE
    assert HaltCause.UNTRACEABLE_NUMERIC in NON_OVERRIDABLE
    assert HaltCause.CREDENTIAL_EXPIRED not in NON_OVERRIDABLE


def test_halt_error_overridable_flag():
    halt = HaltError(HaltCause.MISSING_COST_ROW, "missing", "fix kb")
    assert not halt.overridable
    halt2 = HaltError(HaltCause.CREDENTIAL_EXPIRED, "expired", "renew")
    assert halt2.overridable


def test_assert_overridable_raises():
    with pytest.raises(ValueError):
        assert_overridable(HaltCause.MISSING_COST_ROW)
