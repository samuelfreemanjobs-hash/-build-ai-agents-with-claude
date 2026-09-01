"""Prompt templates — v2.1 (LLM narrative only; no pricing arithmetic)."""

from __future__ import annotations


class ProposalPrompts:
    MASTER_SYSTEM = """You are the AI Proposals Agent™, an expert logistics proposal writer.

MISSION: Generate winning, compliant, client-specific proposals for transportation and supply chain RFPs.

v2.1 CRITICAL RULES:
- Never invent pricing, margins, insurance limits, or performance statistics.
- Never perform arithmetic on money — use provided engine outputs verbatim.
- Cite metrics with [[trace:source_id:field]] when provided in context.
- Flag gaps between RFP requirements and client capabilities.
- Use specific metrics over vague claims.
- human_review_required is always true — output is always a draft."""

    RFP_ANALYSIS = """TASK: Analyze this RFP document and extract key information.

INPUT DOCUMENT:
{rfp_text}

EXTRACT THE FOLLOWING in valid JSON format:

{{
  "client_info": {{
    "company_name": "",
    "industry": "",
    "pain_points": [],
    "strategic_priorities": []
  }},
  "scope": {{
    "services_requested": [],
    "geographic_coverage": [],
    "volume_estimates": {{}},
    "timeline": ""
  }},
  "mandatory_requirements": {{
    "technical_capabilities": [],
    "certifications": [],
    "insurance_minimums": [],
    "compliance_standards": [],
    "sla_expectations": []
  }},
  "evaluation_criteria": {{
    "price_weight": 0.0,
    "experience_weight": 0.0,
    "capability_weight": 0.0
  }},
  "submission": {{
    "due_date": "",
    "format": "",
    "required_sections": [],
    "page_limit": null
  }},
  "decision_factors": {{
    "key_stakeholders": [],
    "incumbent_provider": "",
    "budget_indicators": "",
    "deal_breakers": []
  }},
  "risk_assessment": []
}}

Provide ONLY the JSON output, no additional text."""

    EXECUTIVE_SUMMARY = """TASK: Write a compelling executive summary for this proposal.

CLIENT: {client_name}
INDUSTRY: {industry}
PAIN POINTS: {pain_points}
OUR DIFFERENTIATORS: {differentiators}
KEY WIN THEMES: {win_themes}
PRICING TOTAL (engine — do not recalculate): {pricing_total}
PRICING TRACE: {pricing_trace}

REQUIREMENTS:
- Length: 300-400 words
- Include pricing total exactly as provided with trace notation
- Structure: Problem → Solution → Value → Call to Action

Write the executive summary now:"""

    CASE_STUDY_SELECTOR = """TASK: Select the 3 most relevant case studies.

CLIENT INDUSTRY: {industry}
CLIENT CHALLENGES: {challenges}
SERVICES IN SCOPE: {services}

AVAILABLE CASE STUDIES:
{case_studies_json}

Return ONLY a JSON array:
[
  {{"case_id": "...", "relevance_score": 0.95, "reason": "..."}}
]"""

    CASE_STUDY_WRITER = """TASK: Write a compelling case study.

CASE STUDY DATA:
{case_study_json}

CLIENT CONTEXT: {client_context}

Use metrics from CASE STUDY DATA only. Format with Challenge, Solution, Results, Relevance.
150-200 words."""

    PRICING_NARRATIVE = """TASK: Write pricing narrative for the APPROVED engine scenario. DO NOT calculate or change any numbers.

SCENARIO: {scenario_name}
ENGINE OUTPUT (immutable):
{pricing_json}

Write value justification and positioning prose only."""

    QA_FINAL = """TASK: Review proposal draft quality. Output JSON with scores 1-10.

PROPOSAL CONTENT:
{proposal_content}

Note: compliance_coverage should reflect KB gaps count: {mandatory_gaps}

Output JSON:
{{
  "requirement_coverage": 0,
  "traceability": 0,
  "compliance_coverage": 0,
  "pricing_integrity": 0,
  "tone_evidence": 0,
  "format_compliance": 0,
  "issues": [],
  "recommendation": "PASS" or "REVISE"
}}"""
