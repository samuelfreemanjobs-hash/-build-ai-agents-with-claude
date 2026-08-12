"""AI Proposals Agent™ — logistics proposal generation backend."""

__version__ = "2.1.0"

from ai_proposals_agent.agent import ProposalAgent
from ai_proposals_agent.halts import HaltError, HaltCause
from ai_proposals_agent.knowledge_base import KnowledgeBase
from ai_proposals_agent.models import PricingTier, ProposalPackage

__all__ = [
    "ProposalAgent",
    "KnowledgeBase",
    "PricingTier",
    "ProposalPackage",
    "HaltError",
    "HaltCause",
]
