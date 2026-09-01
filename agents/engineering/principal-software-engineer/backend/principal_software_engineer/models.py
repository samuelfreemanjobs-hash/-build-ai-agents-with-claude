"""Data models for Principal Software Engineer Agent™."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


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
class SuccessCriterion:
    id: str
    description: str
    measurable: bool = True
    metric: str = ""


@dataclass
class ProblemBrief:
    problem_id: str
    title: str
    problem_statement: str
    tier: Tier
    success_criteria: list[SuccessCriterion]
    stakeholders: list[str] = field(default_factory=list)
    repo_path: str = "."
    proposed_solution: str = ""


@dataclass
class ArchitectureOption:
    option_id: str
    name: str
    summary: str
    trade_offs: dict[str, list[str]]
    complexity: str
    components: list[dict] = field(default_factory=list)
    data_flow: str = ""


@dataclass
class EvaluationResult:
    option_scores: list[dict[str, Any]]
    recommended_option: str
    risks: list[dict[str, Any]]
    standards: dict[str, Any]
    status: str = "PASS"


@dataclass
class DesignReview:
    recommendation: str
    scores: dict[str, int]
    defects: list[dict[str, Any]]


@dataclass
class DesignPackage:
    run_id: str
    problem_id: str
    problem_title: str
    tier: Tier
    problem_brief: ProblemBrief
    options: list[ArchitectureOption]
    evaluation: EvaluationResult | None
    design_review: DesignReview | None
    adrs: list[dict[str, Any]]
    run_log: dict[str, Any]
    generated_at: str
