"""Data models for Software Developer Agent™."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class TaskType(str, Enum):
    BUG_FIX = "bug-fix"
    FEATURE = "feature"
    REFACTOR = "refactor"
    TEST_COVERAGE = "test-coverage"
    SECURITY_FIX = "security-fix"


class Tier(str, Enum):
    T0 = "T0"
    T1 = "T1"
    T2 = "T2"
    T3 = "T3"


class RunOutcome(str, Enum):
    PLAN_REVIEW = "PLAN_REVIEW"
    CODE_REVIEW = "CODE_REVIEW"
    COMPLETED = "COMPLETED"
    HALTED = "HALTED"
    FAILED = "FAILED"


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    HALTED = "halted"
    FAILED = "failed"


@dataclass
class AcceptanceCriterion:
    id: str
    description: str
    testable: bool = True
    tests_required: bool = True


@dataclass
class TaskSpec:
    task_id: str
    title: str
    description: str
    task_type: TaskType
    tier: Tier
    repo_path: str
    acceptance_criteria: list[AcceptanceCriterion]
    constraints: dict[str, str] = field(default_factory=dict)
    reference_files: list[dict[str, str]] = field(default_factory=list)
    out_of_scope: list[str] = field(default_factory=list)


@dataclass
class FileChange:
    path: str
    action: str
    requirement_ids: list[str]
    description: str
    content: str = ""


@dataclass
class ImplementationPlan:
    plan_id: str
    task_id: str
    approach_summary: str
    file_changes: list[FileChange]
    test_strategy: list[dict[str, Any]]
    risks: list[str] = field(default_factory=list)
    estimated_complexity: str = "medium"


@dataclass
class VerificationResult:
    overall_status: str
    tests: dict[str, Any]
    lint: dict[str, Any]
    security: dict[str, Any]
    dependencies: dict[str, Any] = field(default_factory=dict)


@dataclass
class CodeReviewResult:
    recommendation: str
    scores: dict[str, int]
    defects: list[dict[str, Any]]
    coverage_map: list[dict[str, Any]] = field(default_factory=list)


@dataclass
class DevPackage:
    run_id: str
    task_id: str
    task_title: str
    tier: Tier
    task_spec: TaskSpec
    implementation_plan: ImplementationPlan | None
    file_changes: list[FileChange]
    verification: VerificationResult | None
    code_review: CodeReviewResult | None
    run_log: dict[str, Any]
    generated_at: str
