from dataclasses import dataclass, field
from enum import Enum
from typing import Any

class Tier(str, Enum):
    T0, T1, T2, T3 = "T0", "T1", "T2", "T3"

class JobStatus(str, Enum):
    PENDING, RUNNING, COMPLETED, HALTED, FAILED = "pending", "running", "completed", "halted", "failed"

@dataclass
class TeamMember:
    name: str
    role: str
    level: str = ""
    pto_days: float = 0

@dataclass
class ManagementContext:
    context_id: str
    team_name: str
    output_type: str
    tier: Tier
    team_members: list[TeamMember]
    sprint_goal: str = ""
    backlog: list[dict] = field(default_factory=list)
    velocity_history: list[dict] = field(default_factory=list)

@dataclass
class CommitmentMap:
    context_id: str
    items: list[dict]
    total_points: float
    sprint_goal: str = ""

@dataclass
class GovernanceReview:
    recommendation: str
    scores: dict[str, int]
    defects: list[dict[str, Any]]

@dataclass
class ManagementPackage:
    run_id: str
    context: ManagementContext
    workload: dict[str, Any]
    capacity: dict[str, Any]
    velocity: dict[str, Any]
    commitments: CommitmentMap | None
    blockers: dict[str, Any]
    action_plan: dict[str, Any] | None
    governance: GovernanceReview | None
    run_log: dict[str, Any]
    generated_at: str
