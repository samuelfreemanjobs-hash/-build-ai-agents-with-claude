"""LLM client — Anthropic with mock fallback for tests/demo."""

from __future__ import annotations

import json
import logging
import os
from typing import Any

from ai_proposals_agent.prompts import ProposalPrompts

logger = logging.getLogger(__name__)


class LLMClient:
    def __init__(self, api_key: str | None = None, model: str = "claude-sonnet-4-5-20250929", mock: bool = False):
        self.mock = mock or not api_key
        self.model = model
        self._client = None
        if not self.mock:
            import anthropic

            self._client = anthropic.Anthropic(api_key=api_key or os.environ.get("ANTHROPIC_API_KEY"))

    def complete(self, system: str, user_prompt: str, max_tokens: int = 4000) -> str:
        if self.mock:
            return self._mock_response(system, user_prompt)
        assert self._client is not None
        message = self._client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user_prompt}],
        )
        return message.content[0].text

    def _mock_response(self, system: str, user_prompt: str) -> str:
        if "EXTRACT THE FOLLOWING" in user_prompt or "Analyze this RFP" in user_prompt:
            if "GM Warren" in user_prompt or "Dedicated inbound shuttle" in user_prompt:
                return json.dumps(_MOCK_AUTOMOTIVE_RFP)
            return json.dumps(_MOCK_RFP_PARSED)
        if "Select the 3 most relevant" in user_prompt:
            return json.dumps(
                [
                    {"case_id": "CS001", "relevance_score": 0.92, "reason": "Automotive OTIF match"},
                    {"case_id": "CS003", "relevance_score": 0.85, "reason": "Industrial inbound"},
                ]
            )
        if "Write a compelling executive summary" in user_prompt:
            return (
                "Your fulfillment challenges — peak capacity and visibility gaps — demand a partner "
                "who delivers measurable OTIF and scalable operations. We propose a dedicated solution "
                "aligned to your West Coast footprint, backed by [[trace:pricing:total]] in annual "
                "investment and [[trace:case_studies.ford_inbound_2024:otif]] OTIF on comparable lanes. "
                "Let's build a partnership that turns logistics into competitive advantage."
            )
        if "Write a compelling case study" in user_prompt:
            return (
                "**Leading Automotive Company - Automotive**\n\n"
                "**Challenge:** JIT inbound pressure with legacy visibility gaps.\n\n"
                "**Solution:** Dedicated shuttle network with ASN compliance desk.\n\n"
                "**Results:**\n- 98.2% OTIF[[trace:case_studies.ford_inbound_2024:otif]]\n\n"
                "**Relevance:** Mirrors your operational scale and service requirements."
            )
        if "pricing narrative" in user_prompt.lower():
            return "Balanced scenario delivers best value — engine totals are fixed per approved scenario."
        if "Review proposal draft quality" in user_prompt:
            return json.dumps(
                {
                    "requirement_coverage": 9,
                    "traceability": 10,
                    "compliance_coverage": 4,
                    "pricing_integrity": 10,
                    "tone_evidence": 9,
                    "format_compliance": 10,
                    "issues": [],
                    "recommendation": "REVISE",
                }
            )
        return "Mock LLM response."


_MOCK_RFP_PARSED: dict[str, Any] = {
    "client_info": {
        "company_name": "TechRetail Inc.",
        "industry": "E-commerce Retail",
        "pain_points": [
            "Peak season capacity constraints",
            "Slow order processing times",
            "Limited visibility into inventory",
        ],
        "strategic_priorities": ["Scale fulfillment", "Improve visibility"],
    },
    "scope": {
        "services_requested": ["Warehousing", "Order fulfillment"],
        "geographic_coverage": ["CA", "OR", "WA"],
        "volume_estimates": {"volume": "10000", "unit": "orders/day"},
        "timeline": "Q1 2026",
    },
    "mandatory_requirements": {
        "technical_capabilities": ["Shopify integration", "ShipStation", "API access"],
        "certifications": ["ISO 9001"],
        "insurance_minimums": ["$2M general liability"],
        "compliance_standards": ["99% same-day pick & pack"],
        "sla_expectations": ["95% 2-day delivery"],
    },
    "evaluation_criteria": {"price_weight": 0.3, "experience_weight": 0.25, "capability_weight": 0.25},
    "submission": {
        "due_date": "2025-11-15",
        "format": "PDF",
        "required_sections": ["Executive Summary", "Technical", "Pricing"],
        "page_limit": 40,
    },
    "decision_factors": {
        "key_stakeholders": [],
        "incumbent_provider": "",
        "budget_indicators": "$500K - $750K annually",
        "deal_breakers": [],
    },
    "risk_assessment": ["Tight SLA requirements", "Peak capacity risk"],
}

_MOCK_AUTOMOTIVE_RFP: dict[str, Any] = {
    "client_info": {
        "company_name": "GM Warren",
        "industry": "Automotive",
        "pain_points": ["Inbound OTIF pressure"],
        "strategic_priorities": ["JIT reliability"],
    },
    "scope": {
        "services_requested": [
            "Dedicated inbound shuttle",
            "Yard management",
            "ASN compliance desk",
        ],
        "geographic_coverage": ["Detroit-Warren"],
        "volume_estimates": {"annual_moves": "1200"},
        "timeline": "Q1 2026",
    },
    "mandatory_requirements": {
        "technical_capabilities": [],
        "certifications": ["ISO 9001", "CTPAT"],
        "insurance_minimums": ["$2M general liability"],
        "compliance_standards": [],
        "sla_expectations": [],
    },
    "evaluation_criteria": {"price_weight": 0.3, "experience_weight": 0.4, "capability_weight": 0.3},
    "submission": {"due_date": "2026-12-01", "format": "PDF", "required_sections": [], "page_limit": 30},
    "decision_factors": {
        "key_stakeholders": [],
        "incumbent_provider": "",
        "budget_indicators": "",
        "deal_breakers": [],
    },
    "risk_assessment": [],
}
