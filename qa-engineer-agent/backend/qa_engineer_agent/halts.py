"""Halt causes for QA Engineer Agent™."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class HaltCause(str, Enum):
    MISSING_SCOPE = "missing_scope"
    CRITICAL_RISK = "critical_release_risk"
    TEST_VALIDATION_FAILED = "test_validation_failed"
    COVERAGE_THRESHOLD = "coverage_below_threshold"
    SCHEMA_VIOLATION = "schema_violation"


NON_OVERRIDABLE = frozenset({
    HaltCause.CRITICAL_RISK,
    HaltCause.TEST_VALIDATION_FAILED,
    HaltCause.COVERAGE_THRESHOLD,
})


@dataclass
class HaltError(Exception):
    cause: HaltCause
    message: str
    remediation: str
    stage: str = "S0"

    def __str__(self) -> str:
        return f"[{self.cause.value}] {self.message}"
