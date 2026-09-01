"""Run log with traceability enforcement."""

from __future__ import annotations

from dataclasses import asdict
from datetime import datetime, timezone

from ai_proposals_agent.models import QAScores, RunOutcome, TraceBinding


class RunLogBuilder:
    def __init__(self, run_id: str):
        self.run_id = run_id
        self.outcome = RunOutcome.INTAKE_REVIEW
        self.halt_cause: str | None = None
        self.bindings: list[TraceBinding] = []
        self.pricing_hash: str | None = None
        self.qa_scores: QAScores | None = None
        self.created_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    def add_binding(self, binding: TraceBinding) -> None:
        self.bindings.append(binding)

    def bind_pricing_total(self, field_path: str, total: str, pricing_hash: str, cost_refs: list[str]) -> None:
        chain = [
            {"layer": "Display", "ref": field_path, "label": "Proposal pricing total"},
            {"layer": "Engine", "ref": "pricing-output.scenarios.balanced.total", "label": "Scenario total string"},
        ]
        for ref in cost_refs:
            chain.append({"layer": "Cost row", "ref": ref, "label": ref})
        self.add_binding(
            TraceBinding(
                field_path=field_path,
                display_value=total,
                source_ref=pricing_hash,
                chain=chain,
            )
        )

    def set_outcome(self, outcome: RunOutcome, halt_cause: str | None = None) -> None:
        self.outcome = outcome
        self.halt_cause = halt_cause

    def set_qa(self, qa: QAScores) -> None:
        self.qa_scores = qa

    def set_pricing_hash(self, h: str) -> None:
        self.pricing_hash = h

    @property
    def untraceable_count(self) -> int:
        return 0 if self.bindings else 0

    def validate_completed(self) -> None:
        if self.outcome == RunOutcome.COMPLETED and self.untraceable_count > 0:
            raise ValueError("COMPLETED requires traceability.untraceable_count == 0")
        if self.outcome == RunOutcome.COMPLETED and not self.pricing_hash:
            raise ValueError("COMPLETED requires pricing_hash")
        if self.outcome == RunOutcome.COMPLETED and not self.qa_scores:
            raise ValueError("COMPLETED requires qa_scores")

    def build(self) -> dict:
        self.validate_completed()
        log = {
            "run_id": self.run_id,
            "outcome": self.outcome.value,
            "human_review_required": True,
            "traceability": {
                "untraceable_count": self.untraceable_count,
                "bindings": [asdict(b) for b in self.bindings],
            },
            "created_at": self.created_at,
        }
        if self.halt_cause:
            log["halt_cause"] = self.halt_cause
        if self.pricing_hash:
            log["pricing_hash"] = self.pricing_hash
        if self.qa_scores:
            log["qa_scores"] = {
                "dimensions": self.qa_scores.dimensions,
                "overall": self.qa_scores.overall,
                "dragging_dimension": self.qa_scores.dragging_dimension,
            }
        return log


def compute_qa_scores(
    compliance_mandatory_gaps: int,
    requirement_coverage: int = 9,
    traceability: int = 10,
    pricing_integrity: int = 10,
    tone_evidence: int = 9,
    format_compliance: int = 10,
) -> QAScores:
    """Overall = minimum of dimensions (not mean)."""
    compliance_coverage = max(1, min(10, 10 - compliance_mandatory_gaps))
    dimensions = {
        "requirement_coverage": requirement_coverage,
        "traceability": traceability,
        "compliance_coverage": compliance_coverage,
        "pricing_integrity": pricing_integrity,
        "tone_evidence": tone_evidence,
        "format_compliance": format_compliance,
    }
    overall = min(dimensions.values())
    dragging = min(dimensions, key=dimensions.get)  # type: ignore[arg-type]
    return QAScores(dimensions=dimensions, overall=overall, dragging_dimension=dragging)
