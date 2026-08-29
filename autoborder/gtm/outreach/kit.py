"""Design Partner outreach kit — cold email, call scripts, and LoI templates."""

from __future__ import annotations

import re
from pathlib import Path

from pydantic import BaseModel, Field

TEMPLATE_DIR = Path(__file__).resolve().parent / "templates"


class ProspectProfile(BaseModel):
    company_name: str
    contact_name: str
    contact_title: str = "VP of Supply Chain"
    city: str = "Monterrey"
    country: str = "Mexico"
    part_focus: str = "brake and chassis assemblies"
    quarterly_import_value: str = "$4.2M"
    sender_name: str = "Alex Rivera"
    sender_title: str = "Founder, AutoBorder Comply"
    sender_email: str = "alex@autobordercomply.ai"
    audit_context: str = "CBP Rapid Response audit in the last 18 months"


class PersonalizedScript(BaseModel):
    template_id: str
    title: str
    channel: str
    subject: str | None = None
    body: str
    notes: str | None = None


class OutreachKitResponse(BaseModel):
    prospect: ProspectProfile
    scripts: list[PersonalizedScript]
    program_summary: str
    guarantee_clause: str


class OutreachKit:
    """Load and personalize sales outreach templates for Design Partner recruitment."""

    GUARANTEE_CLAUSE = (
        "If AutoBorder Comply produces a single RVC calculation error during the Design Partner "
        "trial mapping of your top 100 parts, AutoBorder Comply will pay {company_name} USD $10,000 "
        "within fifteen (15) business days of verified error."
    )

    PROGRAM_SUMMARY = (
        "We map your top 100 most complex parts for free. You only sign a Letter of Intent to "
        "purchase the enterprise license ($8,500/mo) if our CBP-compliant RVC math beats your "
        "internal team's accuracy. Implementation: 72 hours, not 6 months."
    )

    TEMPLATE_META: dict[str, dict[str, str]] = {
        "email_1_discovery": {
            "title": "Email 1 — Pattern Interrupt (Day 0)",
            "channel": "email",
            "subject": "Quick question about your {city} USMCA RVC math",
        },
        "email_2_roi": {
            "title": "Email 2 — Tariff Leak Proof (Day 3)",
            "channel": "email",
            "subject": "Re: {quarterly_import_value}/quarter — possible duty overpayment",
        },
        "email_3_guarantee": {
            "title": "Email 3 — $10K Guarantee Close (Day 7)",
            "channel": "email",
            "subject": "We'll pay $10,000 if our RVC math is wrong",
        },
        "linkedin_connect": {
            "title": "LinkedIn Connection Request",
            "channel": "linkedin",
            "subject": None,
        },
        "linkedin_followup": {
            "title": "LinkedIn Follow-Up (After Accept)",
            "channel": "linkedin",
            "subject": None,
        },
        "call_1_discovery": {
            "title": "Call 1 — SDR Discovery (30 min)",
            "channel": "call",
            "subject": None,
            "notes": "Find customs broker count. Identify roll-up vs build-down RVC method.",
        },
        "call_2_demo": {
            "title": "Call 2 — Solution Architect Demo (60 min)",
            "channel": "call",
            "subject": None,
            "notes": "Screen-share /demo graph. Highlight red non-originating nodes.",
        },
        "call_3_close": {
            "title": "Call 3 — Legal/Procurement Close (90 min)",
            "channel": "call",
            "subject": None,
            "notes": "Walk Forensic PDF. Lead with $500K indemnity. Close on Design Partner LoI.",
        },
        "letter_of_intent": {
            "title": "Design Partner Letter of Intent",
            "channel": "document",
            "subject": "Letter of Intent — AutoBorder Comply Design Partner Program",
        },
        "design_partner_program": {
            "title": "Design Partner Program Overview",
            "channel": "document",
            "subject": None,
        },
    }

    def __init__(self, template_dir: Path | None = None) -> None:
        self.template_dir = template_dir or TEMPLATE_DIR

    def list_templates(self) -> list[str]:
        return sorted(self.TEMPLATE_META.keys())

    def render(self, template_id: str, prospect: ProspectProfile) -> PersonalizedScript:
        if template_id not in self.TEMPLATE_META:
            raise ValueError(f"Unknown template: {template_id}")

        path = self.template_dir / f"{template_id}.md"
        if not path.exists():
            raise FileNotFoundError(f"Template file not found: {path}")

        meta = self.TEMPLATE_META[template_id]
        raw = path.read_text(encoding="utf-8")
        body = self._merge(raw, prospect)
        subject = self._merge(meta["subject"], prospect) if meta.get("subject") else None

        return PersonalizedScript(
            template_id=template_id,
            title=meta["title"],
            channel=meta["channel"],
            subject=subject,
            body=body.strip(),
            notes=meta.get("notes"),
        )

    def render_full_kit(self, prospect: ProspectProfile) -> OutreachKitResponse:
        scripts = [self.render(tid, prospect) for tid in self.list_templates()]
        return OutreachKitResponse(
            prospect=prospect,
            scripts=scripts,
            program_summary=self.PROGRAM_SUMMARY,
            guarantee_clause=self._merge(self.GUARANTEE_CLAUSE, prospect),
        )

    @staticmethod
    def _merge(template: str | None, prospect: ProspectProfile) -> str:
        if not template:
            return ""
        values = prospect.model_dump()
        values["guarantee_clause"] = OutreachKit.GUARANTEE_CLAUSE.format(**values)
        values["program_summary"] = OutreachKit.PROGRAM_SUMMARY

        def replacer(match: re.Match[str]) -> str:
            key = match.group(1)
            return str(values.get(key, match.group(0)))

        return re.sub(r"\{(\w+)\}", replacer, template)
