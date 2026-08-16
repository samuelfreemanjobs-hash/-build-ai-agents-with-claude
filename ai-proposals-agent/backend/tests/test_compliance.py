"""Compliance checker tests."""

from ai_proposals_agent.compliance import ComplianceChecker
from ai_proposals_agent.knowledge_base import KnowledgeBase
from ai_proposals_agent.models import RFPRequirements


def _req(**kwargs) -> RFPRequirements:
    defaults = dict(
        client_name="Test",
        industry="Automotive",
        pain_points=[],
        services_requested=[],
        geographic_coverage=[],
        volume_estimates={},
        mandatory_requirements=["Insurance coverage"],
        certifications_required=["ISO 9001", "CTPAT", "SmartWay"],
        submission_deadline="2026-12-01",
        evaluation_criteria={},
        budget_indicators=None,
        red_flags=[],
    )
    defaults.update(kwargs)
    return RFPRequirements(**defaults)


def test_mandatory_gaps_detected():
    kb = KnowledgeBase()
    checker = ComplianceChecker(kb)
    report = checker.run("run_2026-08-10_001", _req())
    assert report.mandatory_gap_count >= 1
    gap_checks = [c for c in report.checks if c.status == "GAP"]
    assert any(c.mandatory for c in gap_checks)


def test_iso_compliant():
    kb = KnowledgeBase()
    checker = ComplianceChecker(kb)
    report = checker.run("run_2026-08-10_001", _req(certifications_required=["ISO 9001"]))
    iso = next(c for c in report.checks if c.id == "ISO_9001")
    assert iso.status == "COMPLIANT"
