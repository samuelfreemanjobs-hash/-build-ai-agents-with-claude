"""Halt causes and non-overridable enforcement."""

from __future__ import annotations

from enum import Enum


class HaltCause(str, Enum):
    TEST_FAILURE = "TEST_FAILURE"
    LINT_ERROR = "LINT_ERROR"
    SECURITY_FINDING = "SECURITY_FINDING"
    DEPENDENCY_VULNERABILITY = "DEPENDENCY_VULNERABILITY"
    UNTESTABLE_CRITERIA = "UNTESTABLE_CRITERIA"
    SECRET_DETECTED = "SECRET_DETECTED"
    ORPHAN_FILE_CHANGE = "ORPHAN_FILE_CHANGE"
    SCHEMA_VIOLATION = "SCHEMA_VIOLATION"
    NO_TEST_COMMAND = "NO_TEST_COMMAND"
    SCOPE_VIOLATION = "SCOPE_VIOLATION"


NON_OVERRIDABLE: frozenset[HaltCause] = frozenset(
    {
        HaltCause.TEST_FAILURE,
        HaltCause.SECURITY_FINDING,
        HaltCause.SECRET_DETECTED,
        HaltCause.DEPENDENCY_VULNERABILITY,
    }
)


class HaltError(Exception):
    """Designed pipeline stop — not a generic failure."""

    def __init__(self, cause: HaltCause, message: str, fix_path: str, stage: str = ""):
        self.cause = cause
        self.message = message
        self.fix_path = fix_path
        self.stage = stage
        super().__init__(f"{cause.value}: {message}")

    @property
    def overridable(self) -> bool:
        return self.cause not in NON_OVERRIDABLE
