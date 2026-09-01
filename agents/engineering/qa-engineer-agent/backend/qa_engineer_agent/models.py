"""Data models for QA Engineer Agent™."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class Tier(str, Enum):
    T0 = "T0"
    T1 = "T1"
    T2 = "T2"
    T3 = "T3"


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    HALTED = "halted"
    FAILED = "failed"


@dataclass
class Requirement:
    id: str
    title: str
    priority: str = "medium"


@dataclass
class TestScope:
    scope_id: str
    release_name: str
    output_type: str
    tier: Tier
    requirements: list[dict] = field(default_factory=list)
    changes: list[dict] = field(default_factory=list)
    existing_tests: list[dict] = field(default_factory=list)
    components: dict[str, list[str]] = field(default_factory=dict)
    critical_components: list[str] = field(default_factory=list)
    recent_defects: list[dict] = field(default_factory=list)


@dataclass
class TestStrategy:
    scope_id: str
    test_cases: list[dict] = field(default_factory=list)
    regression_suite: list[str] = field(default_factory=list)
    total_cases: int = 0


@dataclass
class ReleaseReadiness:
    recommendation: str
    scores: dict = field(default_factory=dict)
    defects: list[dict] = field(default_factory=list)


@dataclass
class QAPackage:
    run_id: str
    scope: TestScope
    coverage: dict
    risk: dict
    validation: dict
    regression: dict
    strategy: TestStrategy
    readiness: ReleaseReadiness
    action_plan: dict
    run_log: dict
    duration_ms: int = 0
