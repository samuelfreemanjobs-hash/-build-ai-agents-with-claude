from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class Tier(str, Enum):
    T0, T1, T2, T3 = "T0", "T1", "T2", "T3"


class JobStatus(str, Enum):
    PENDING, RUNNING, COMPLETED, HALTED, FAILED = "pending", "running", "completed", "halted", "failed"


@dataclass
class ArchitectureScope:
    scope_id: str
    system_name: str
    boundary: str
    horizon: str
    tier: Tier
    repo_path: str = "."
    stakeholders: list[str] = field(default_factory=list)


@dataclass
class C4Container:
    id: str
    name: str
    technology: str
    responsibility: str
    type: str = "service"
    source_ref: str = ""


@dataclass
class C4Model:
    model_id: str
    view: str
    system_name: str
    description: str
    containers: list[C4Container]
    diagram: str = ""
    components: list[dict] = field(default_factory=list)


@dataclass
class GovernanceReview:
    recommendation: str
    scores: dict[str, int]
    defects: list[dict[str, Any]]


@dataclass
class ArchitecturePackage:
    run_id: str
    scope: ArchitectureScope
    as_is_model: C4Model | None
    to_be_model: C4Model | None
    nfr_map: dict[str, Any] | None
    patterns: list[dict[str, Any]]
    governance: GovernanceReview | None
    run_log: dict[str, Any]
    generated_at: str
