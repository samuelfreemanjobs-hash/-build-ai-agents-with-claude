"""End-to-end demo pipeline tests (mock LLM)."""

from ai_proposals_agent.agent import ProposalAgent
from ai_proposals_agent.knowledge_base import KnowledgeBase
from ai_proposals_agent.models import PricingTier

SAMPLE = """
Company: TechRetail Inc.
Industry: E-commerce Retail
Requirements: Warehousing, Order fulfillment
Certifications: ISO 9001
"""


def test_demo_proposal_retail():
    agent = ProposalAgent(KnowledgeBase(), mock_llm=True, corridor="DEFAULT")
    proposal = agent.generate_full_proposal(SAMPLE, pricing_tier=PricingTier.BALANCED)
    assert proposal.client_name == "TechRetail Inc."
    assert proposal.pricing.pricing_hash.startswith("sha256:")
    assert proposal.run_log["human_review_required"] is True
    scenario = proposal.pricing.scenarios["balanced"]
    assert float(scenario.total) > 0


def test_automotive_pricing_396k():
    rfp = """
    Company: GM Warren
    Industry: Automotive
    Services: Dedicated inbound shuttle, Yard management, ASN compliance desk
    Volume: 1200 annual moves
    Certifications: ISO 9001, CTPAT
    """
    agent = ProposalAgent(KnowledgeBase(), mock_llm=True, corridor="DET-WARREN")
    proposal = agent.generate_full_proposal(rfp, pricing_tier=PricingTier.BALANCED, corridor="DET-WARREN")
    assert proposal.pricing.scenarios["balanced"].total == "396000.00"
