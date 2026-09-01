"""ProposalAgent orchestrator — v2.1 pipeline."""

from __future__ import annotations

import json
import logging
import re
from dataclasses import asdict
from datetime import datetime, timezone

from ai_proposals_agent.compliance import ComplianceChecker
from ai_proposals_agent.halts import HaltCause, HaltError
from ai_proposals_agent.knowledge_base import KnowledgeBase
from ai_proposals_agent.llm import LLMClient
from ai_proposals_agent.models import (
    CaseStudy,
    PricingTier,
    ProposalPackage,
    ProposalSection,
    RFPRequirements,
    RunOutcome,
)
from ai_proposals_agent.pricing_engine import PricingEngine
from ai_proposals_agent.prompts import ProposalPrompts
from ai_proposals_agent.run_log import RunLogBuilder, compute_qa_scores

logger = logging.getLogger(__name__)

_RUN_COUNTER = 0


def _next_run_id() -> str:
    global _RUN_COUNTER
    _RUN_COUNTER += 1
    return datetime.now(timezone.utc).strftime("run_%Y-%m-%d_") + f"{_RUN_COUNTER:03d}"


class ProposalAgent:
    """Main AI Proposals Agent orchestrator."""

    def __init__(
        self,
        knowledge_base: KnowledgeBase,
        api_key: str | None = None,
        mock_llm: bool = False,
        corridor: str = "DEFAULT",
    ):
        self.kb = knowledge_base
        self.llm = LLMClient(api_key=api_key, mock=mock_llm)
        self.pricing_engine = PricingEngine(kb=knowledge_base, corridor=corridor)
        self.compliance_checker = ComplianceChecker(kb=knowledge_base)

    def _parse_rfp_json(self, data: dict) -> RFPRequirements:
        return RFPRequirements(
            client_name=data["client_info"]["company_name"],
            industry=data["client_info"]["industry"],
            pain_points=data["client_info"].get("pain_points", []),
            services_requested=data["scope"].get("services_requested", []),
            geographic_coverage=data["scope"].get("geographic_coverage", []),
            volume_estimates=data["scope"].get("volume_estimates", {}),
            mandatory_requirements=data["mandatory_requirements"].get("technical_capabilities", []),
            certifications_required=data["mandatory_requirements"].get("certifications", []),
            submission_deadline=data["submission"].get("due_date", ""),
            evaluation_criteria={
                k: float(v) for k, v in data.get("evaluation_criteria", {}).items() if isinstance(v, (int, float))
            },
            budget_indicators=data.get("decision_factors", {}).get("budget_indicators"),
            red_flags=data.get("risk_assessment", []),
        )

    def analyze_rfp(self, rfp_text: str) -> RFPRequirements:
        logger.info("Phase 1: Analyzing RFP...")
        prompt = ProposalPrompts.RFP_ANALYSIS.format(rfp_text=rfp_text)
        response = self.llm.complete(ProposalPrompts.MASTER_SYSTEM, prompt)
        # Strip markdown fences if present
        text = response.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\n?", "", text)
            text = re.sub(r"\n?```$", "", text)
        data = json.loads(text)
        req = self._parse_rfp_json(data)
        logger.info("RFP analyzed: %s — %s", req.client_name, req.industry)
        return req

    def select_case_studies(self, requirements: RFPRequirements) -> list[CaseStudy]:
        logger.info("Phase 2: Selecting case studies...")
        all_cases = self.kb.get_all_case_studies()
        prompt = ProposalPrompts.CASE_STUDY_SELECTOR.format(
            industry=requirements.industry,
            challenges=", ".join(requirements.pain_points),
            services=", ".join(requirements.services_requested),
            case_studies_json=json.dumps([asdict(c) for c in all_cases], indent=2),
        )
        response = self.llm.complete(ProposalPrompts.MASTER_SYSTEM, prompt)
        text = response.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\n?", "", text)
            text = re.sub(r"\n?```$", "", text)
        selections = json.loads(text)
        selected: list[CaseStudy] = []
        for sel in selections:
            case = next((c for c in all_cases if c.case_id == sel["case_id"]), None)
            if case:
                case.relevance_score = sel["relevance_score"]
                selected.append(case)
        logger.info("Selected %d case studies", len(selected))
        return selected

    def generate_executive_summary(
        self, requirements: RFPRequirements, pricing_total: str, pricing_hash: str
    ) -> str:
        logger.info("Phase 3: Executive summary...")
        prompt = ProposalPrompts.EXECUTIVE_SUMMARY.format(
            client_name=requirements.client_name,
            industry=requirements.industry,
            pain_points=", ".join(requirements.pain_points),
            differentiators=", ".join(self.kb.get_company_differentiators()),
            win_themes=", ".join(self.kb.get_win_themes(requirements.industry)),
            pricing_total=pricing_total,
            pricing_trace=f"[[trace:{pricing_hash}:total]]",
        )
        return self.llm.complete(ProposalPrompts.MASTER_SYSTEM, prompt, max_tokens=1500)

    def write_case_studies(self, cases: list[CaseStudy], requirements: RFPRequirements) -> list[str]:
        logger.info("Phase 4: Writing %d case studies...", len(cases))
        written: list[str] = []
        for case in cases:
            prompt = ProposalPrompts.CASE_STUDY_WRITER.format(
                case_study_json=json.dumps(asdict(case), indent=2),
                client_context=f"{requirements.client_name} in {requirements.industry}",
            )
            written.append(self.llm.complete(ProposalPrompts.MASTER_SYSTEM, prompt, max_tokens=800))
        return written

    def generate_pricing(self, requirements: RFPRequirements):
        """Deterministic pricing — NOT LLM."""
        logger.info("Phase 5: Pricing engine...")
        services = self.kb.map_services_from_rfp(requirements.services_requested)
        return self.pricing_engine.compute(services, requirements.volume_estimates)

    def generate_compliance(self, run_id: str, requirements: RFPRequirements):
        logger.info("Phase 6: Compliance check...")
        report = self.compliance_checker.run(run_id, requirements)
        text = self.compliance_checker.render_section(report)
        return report, text

    def quality_assurance(
        self,
        proposal_content: str,
        mandatory_gaps: int,
    ) -> dict:
        logger.info("Phase 7: QA...")
        prompt = ProposalPrompts.QA_FINAL.format(
            proposal_content=proposal_content,
            mandatory_gaps=mandatory_gaps,
        )
        response = self.llm.complete(ProposalPrompts.MASTER_SYSTEM, prompt, max_tokens=2000)
        text = response.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\n?", "", text)
            text = re.sub(r"\n?```$", "", text)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"recommendation": "REVISE", "issues": ["QA JSON parse failed"]}

    def generate_full_proposal(
        self,
        rfp_text: str,
        pricing_tier: PricingTier = PricingTier.BALANCED,
        corridor: str | None = None,
    ) -> ProposalPackage:
        run_id = _next_run_id()
        run_log = RunLogBuilder(run_id)
        start = datetime.now(timezone.utc)

        logger.info("=" * 60)
        logger.info("STARTING PROPOSAL GENERATION — %s", run_id)
        logger.info("=" * 60)

        if corridor:
            self.pricing_engine.corridor = corridor

        try:
            requirements = self.analyze_rfp(rfp_text)
            run_log.set_outcome(RunOutcome.PRICING_REVIEW)

            case_studies = self.select_case_studies(requirements)

            pricing_output = self.generate_pricing(requirements)
            scenario = self.pricing_engine.select_scenario(pricing_output, pricing_tier)
            run_log.set_pricing_hash(pricing_output.pricing_hash)
            cost_refs = [li.cost_row_ref for li in scenario.line_items]
            run_log.bind_pricing_total(
                "proposal.pricing.total",
                scenario.total,
                pricing_output.pricing_hash,
                cost_refs,
            )

            exec_summary = self.generate_executive_summary(
                requirements, scenario.total, pricing_output.pricing_hash
            )
            written_cases = self.write_case_studies(case_studies, requirements)

            compliance_report, compliance_text = self.generate_compliance(run_id, requirements)

            technical_sections = [
                ProposalSection(
                    section_name="Service Capabilities",
                    content="Capabilities mapped to RFP requirements with KB-sourced evidence.",
                    compliance_status="REVIEW",
                    confidence_score=0.9,
                )
            ]
            implementation = (
                "Phase 1: Onboarding (Weeks 1-2)\n"
                "Phase 2: Integration (Weeks 3-4)\n"
                "Phase 3: Go-Live (Week 5)"
            )

            full_content = f"{exec_summary}\n{compliance_text}\nTotal: {scenario.total}"
            qa_raw = self.quality_assurance(full_content, compliance_report.mandatory_gap_count)

            qa = compute_qa_scores(
                compliance_mandatory_gaps=compliance_report.mandatory_gap_count,
                requirement_coverage=qa_raw.get("requirement_coverage", 9),
                traceability=qa_raw.get("traceability", 10),
                pricing_integrity=qa_raw.get("pricing_integrity", 10),
                tone_evidence=qa_raw.get("tone_evidence", 9),
                format_compliance=qa_raw.get("format_compliance", 10),
            )
            run_log.set_qa(qa)

            recommendation = qa_raw.get("recommendation", "REVISE")
            if recommendation == "PASS" and compliance_report.mandatory_gap_count == 0:
                run_log.set_outcome(RunOutcome.DRAFT_REVIEW)
            else:
                run_log.set_outcome(RunOutcome.DRAFT_REVIEW)

            proposal = ProposalPackage(
                proposal_id=f"PROP-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}",
                run_id=run_id,
                client_name=requirements.client_name,
                generated_date=start.isoformat().replace("+00:00", "Z"),
                executive_summary=exec_summary,
                technical_sections=technical_sections,
                case_studies=case_studies,
                written_case_studies=written_cases,
                compliance_section=compliance_text,
                compliance_report=compliance_report,
                pricing=pricing_output,
                selected_tier=pricing_tier,
                implementation_plan=implementation,
                qa_report={**qa_raw, "overall_score": qa.overall, "dragging_dimension": qa.dragging_dimension},
                run_log=run_log.build(),
            )

            elapsed = (datetime.now(timezone.utc) - start).total_seconds() / 60
            logger.info("=" * 60)
            logger.info("PROPOSAL COMPLETE in %.1f minutes", elapsed)
            logger.info("Client: %s", proposal.client_name)
            logger.info("Pricing (%s): $%s", pricing_tier.value, scenario.total)
            logger.info("QA overall (min): %s — dragging: %s", qa.overall, qa.dragging_dimension)
            logger.info("Mandatory compliance gaps: %s", compliance_report.mandatory_gap_count)
            logger.info("=" * 60)
            return proposal

        except HaltError as e:
            logger.error("HALT: %s — %s", e.cause.value, e.message)
            run_log.set_outcome(RunOutcome.HALTED, halt_cause=e.cause.value)
            raise

        except Exception as e:
            logger.error("FAILED: %s", e)
            run_log.set_outcome(RunOutcome.FAILED)
            raise
