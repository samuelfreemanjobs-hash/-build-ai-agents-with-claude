"""Halt causes for Principal Software Engineer Agent."""

from __future__ import annotations

from enum import Enum


class HaltCause(str, Enum):
    UNMEASURABLE_CRITERIA = "UNMEASURABLE_CRITERIA"
    NO_SYSTEM_CONTEXT = "NO_SYSTEM_CONTEXT"
    INSUFFICIENT_OPTIONS = "INSUFFICIENT_OPTIONS"
    CRITICAL_RISK_UNACKNOWLEDGED = "CRITICAL_RISK_UNACKNOWLEDGED"
    STANDARDS_VIOLATION = "STANDARDS_VIOLATION"
    CONFLICTING_CONSTRAINTS = "CONFLICTING_CONSTRAINTS"
    UNSOURCED_CLAIM = "UNSOURCED_CLAIM"
    SCHEMA_VIOLATION = "SCHEMA_VIOLATION"


NON_OVERRIDABLE: frozenset[HaltCause] = frozenset({
    HaltCause.CRITICAL_RISK_UNACKNOWLEDGED,
    HaltCause.STANDARDS_VIOLATION,
    HaltCause.CONFLICTING_CONSTRAINTS,
})


class HaltError(Exception):
    def __init__(self, cause: HaltCause, message: str, fix_path: str, stage: str = ""):
        self.cause = cause
        self.message = message
        self.fix_path = fix_path
        self.stage = stage
        super().__init__(f"{cause.value}: {message}")

    @property
    def overridable(self) -> bool:
        return self.cause not in NON_OVERRIDABLE
