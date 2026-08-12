"""Halt causes and non-overridable enforcement (G07)."""

from __future__ import annotations

from enum import Enum


class HaltCause(str, Enum):
    MISSING_COST_ROW = "MISSING_COST_ROW"
    VOLUME_OUT_OF_BAND = "VOLUME_OUT_OF_BAND"
    CREDENTIAL_EXPIRED = "CREDENTIAL_EXPIRED"
    RFP_AMBIGUOUS_SCOPE = "RFP_AMBIGUOUS_SCOPE"
    UNTRACEABLE_NUMERIC = "UNTRACEABLE_NUMERIC"


NON_OVERRIDABLE: frozenset[HaltCause] = frozenset(
    {
        HaltCause.MISSING_COST_ROW,
        HaltCause.VOLUME_OUT_OF_BAND,
        HaltCause.UNTRACEABLE_NUMERIC,
    }
)


class HaltError(Exception):
    """Designed pipeline stop — not a generic failure."""

    def __init__(self, cause: HaltCause, message: str, fix_path: str):
        self.cause = cause
        self.message = message
        self.fix_path = fix_path
        super().__init__(f"{cause.value}: {message}")

    @property
    def overridable(self) -> bool:
        return self.cause not in NON_OVERRIDABLE


def assert_overridable(cause: HaltCause) -> None:
    if cause in NON_OVERRIDABLE:
        raise ValueError(f"{cause.value} is non-overridable (G07)")
