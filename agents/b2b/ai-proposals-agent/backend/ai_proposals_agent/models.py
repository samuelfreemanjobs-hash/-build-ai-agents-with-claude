"""Data models for AI Proposals Agent™."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class PricingTier(str, Enum):
    COMPETITIVE = "competitive"
    BALANCED = "balanced"
    PREMIUM = "premium"


class RunOutcome(str, Enum):
    INTAKE_REVIEW = "INTAKE_REVIEW"
    PRICING_REVIEW = "PRICING_REVIEW"
    DRAFT_REVIEW = "DRAFT_REVIEW"
    COMPLETED = "COMPLETED"
    HALTED = "HALTED"
    FAILED = "FAILED"


@dataclass
class RFPRequirements:
    client_name: str
    industry: str
    pain_points: list[str]
    services_requested: list[str]
    geographic_coverage: list[str]
    volume_estimates: dict[str, str]
    mandatory_requirements: list[str]
    certifications_required: list[str]
    submission_deadline: str
    evaluation_criteria: dict[str, float]
    budget_indicators: str | None
    red_flags: list[str]


@dataclass
class CaseStudy:
    case_id: str
    client_name: str
    industry: str
    challenge: str
    solution: str
    results: list[str]
    relevance_score: float
    challenge_tags: list[str]
    solution_tags: list[str]
    source_ref: str = ""


@dataclass
class ProposalSection:
    section_name: str
    content: str
    compliance_status: str
    confidence_score: float


@dataclass
class PricingLineItem:
    description: str
    quantity: str
    unit: str
    unit_cost: str
    extended: str
    cost_row_ref: str


@dataclass
class PricingScenarioOutput:
    """Engine scenario — all money fields are decimal strings."""

    label: str
    line_items: list[PricingLineItem]
    subtotal: str
    margin_pct: str
    total: str
    value_narrative_refs: list[str]


@dataclass
class PricingOutput:
    engine_version: str
    pricing_hash: str
    currency: str
    scenarios: dict[str, PricingScenarioOutput]
    assumptions: list[str]


@dataclass
class ComplianceCheck:
    id: str
    label: str
    status: str  # COMPLIANT | GAP | UNKNOWN
    mandatory: bool
    validator_reason: str = ""
    source_ref: str = ""
    mitigation: str = ""
    expires_at: str = ""


@dataclass
class ComplianceReport:
    run_id: str
    mandatory_gap_count: int
    checks: list[ComplianceCheck]


@dataclass
class TraceBinding:
    field_path: str
    display_value: str
    source_ref: str
    chain: list[dict[str, str]]


@dataclass
class QAScores:
    dimensions: dict[str, int]
    overall: int
    dragging_dimension: str


@dataclass
class ProposalPackage:
    proposal_id: str
    run_id: str
    client_name: str
    generated_date: str
    executive_summary: str
    technical_sections: list[ProposalSection]
    case_studies: list[CaseStudy]
    written_case_studies: list[str]
    compliance_section: str
    compliance_report: ComplianceReport
    pricing: PricingOutput
    selected_tier: PricingTier
    implementation_plan: str
    qa_report: dict[str, Any]
    run_log: dict[str, Any] = field(default_factory=dict)
