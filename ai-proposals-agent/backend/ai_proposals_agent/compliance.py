"""Compliance validation against knowledge base — read-only checks."""

from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from ai_proposals_agent.models import ComplianceCheck, ComplianceReport, RFPRequirements

if TYPE_CHECKING:
    from ai_proposals_agent.knowledge_base import KnowledgeBase

NO_MITIGATION = "No mitigation currently available."


class ComplianceChecker:
    def __init__(self, kb: KnowledgeBase):
        self.kb = kb

    def run(self, run_id: str, requirements: RFPRequirements) -> ComplianceReport:
        checks: list[ComplianceCheck] = []
        today = date.today()

        # Map RFP cert requirements to KB
        cert_requirements = {
            "ISO 9001": "ISO_9001",
            "ISO9001": "ISO_9001",
            "CTPAT": "CTPAT",
            "C-TPAT": "CTPAT",
            "SmartWay": "SmartWay",
        }

        checked_ids: set[str] = set()

        for req_cert in requirements.certifications_required:
            key = None
            for pattern, kb_key in cert_requirements.items():
                if pattern.lower() in req_cert.lower():
                    key = kb_key
                    break
            if key and key in checked_ids:
                continue
            if key:
                checked_ids.add(key)
                checks.append(self._check_credential(key, req_cert, mandatory=True, today=today))
            else:
                checks.append(
                    ComplianceCheck(
                        id=f"cert_{req_cert[:20]}",
                        label=req_cert,
                        status="UNKNOWN",
                        mandatory=True,
                        validator_reason="No validator mapped for this certification type",
                        mitigation=NO_MITIGATION,
                    )
                )

        # Standard mandatory checks for logistics RFPs
        if not any(c.id == "ISO_9001" for c in checks):
            checks.append(self._check_credential("ISO_9001", "ISO 9001:2015", mandatory=False, today=today))
        checks.append(self._check_credential("CTPAT", "CTPAT membership", mandatory=True, today=today))
        checks.append(self._check_smartway(mandatory=True))
        checks.append(self._check_insurance(requirements, mandatory=True))

        mandatory_gaps = sum(1 for c in checks if c.mandatory and c.status == "GAP")

        return ComplianceReport(
            run_id=run_id,
            mandatory_gap_count=mandatory_gaps,
            checks=checks,
        )

    def _check_credential(
        self, kb_key: str, label: str, *, mandatory: bool, today: date
    ) -> ComplianceCheck:
        cred = self.kb.get_certifications().get(kb_key)
        if not cred:
            return ComplianceCheck(
                id=kb_key,
                label=label,
                status="GAP",
                mandatory=mandatory,
                validator_reason=f"No valid {kb_key} credential row in KB",
                mitigation=NO_MITIGATION,
            )
        expiry_str = cred.get("expiry", "")
        if expiry_str:
            expiry = date.fromisoformat(expiry_str)
            if expiry < today:
                return ComplianceCheck(
                    id=kb_key,
                    label=label,
                    status="GAP",
                    mandatory=mandatory,
                    validator_reason=f"Certificate expired {expiry_str}",
                    source_ref=f"credentials.{kb_key.lower()}",
                    expires_at=expiry_str,
                    mitigation="Renew certificate or exclude claim from proposal.",
                )
        return ComplianceCheck(
            id=kb_key,
            label=label,
            status="COMPLIANT",
            mandatory=mandatory,
            validator_reason=f"Certificate valid until {expiry_str}",
            source_ref=f"credentials.{kb_key.lower()}",
            expires_at=expiry_str,
        )

    def _check_smartway(self, *, mandatory: bool) -> ComplianceCheck:
        cred = self.kb.get_certifications().get("SmartWay")
        if not cred:
            return ComplianceCheck(
                id="SmartWay",
                label="EPA SmartWay partnership",
                status="GAP",
                mandatory=mandatory,
                validator_reason="Boilerplate references expired or missing SmartWay partnership",
                mitigation=NO_MITIGATION,
            )
        return ComplianceCheck(
            id="SmartWay",
            label="EPA SmartWay partnership",
            status="COMPLIANT",
            mandatory=mandatory,
            validator_reason="SmartWay partner on file",
            source_ref="credentials.smartway",
        )

    def _check_insurance(self, requirements: RFPRequirements, *, mandatory: bool) -> ComplianceCheck:
        # Demo: KB has $1M, many RFPs require $2M
        kb_limit = self.kb.get_insurance_limit()
        required = 2_000_000
        if kb_limit < required and any("insurance" in r.lower() for r in requirements.mandatory_requirements + requirements.certifications_required):
            return ComplianceCheck(
                id="insurance_gl",
                label="General liability $2M",
                status="GAP",
                mandatory=mandatory,
                validator_reason=f"KB shows ${kb_limit:,}; RFP may require ${required:,}",
                mitigation="Obtain certificate endorsement or adjust proposal exclusion.",
            )
        return ComplianceCheck(
            id="insurance_gl",
            label="General liability",
            status="COMPLIANT" if kb_limit >= required else "UNKNOWN",
            mandatory=mandatory,
            validator_reason=f"KB general liability: ${kb_limit:,}",
            source_ref="credentials.insurance_gl",
        )

    def render_section(self, report: ComplianceReport) -> str:
        lines = ["## Compliance & Standards\n"]
        for check in report.checks:
            icon = {"COMPLIANT": "✓", "GAP": "✗", "UNKNOWN": "?"}[check.status]
            lines.append(f"### {icon} {check.label} — {check.status}\n")
            lines.append(f"{check.validator_reason}\n")
            if check.status == "GAP":
                lines.append(f"**Mitigation:** {check.mitigation or NO_MITIGATION}\n")
            if check.source_ref:
                lines.append(f"*Source: {check.source_ref}*\n")
        return "\n".join(lines)
