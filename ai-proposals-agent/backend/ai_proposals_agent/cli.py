"""CLI entry point."""

from __future__ import annotations

import argparse
import json
import logging
import sys
from dataclasses import asdict
from pathlib import Path

from ai_proposals_agent.agent import ProposalAgent
from ai_proposals_agent.knowledge_base import KnowledgeBase
from ai_proposals_agent.models import PricingTier

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

SAMPLE_RFP = """
REQUEST FOR PROPOSAL

Company: TechRetail Inc.
Industry: E-commerce Retail

We are seeking a 3PL partner to manage our growing fulfillment operations.

Requirements:
- Warehousing capacity: 200,000 sq ft
- Order fulfillment: 10,000 orders/day capacity
- Geographic coverage: West Coast (CA, OR, WA)
- Integration: Must integrate with Shopify and ShipStation
- Certifications: ISO 9001 required
- SLA: 99% same-day pick & pack, 95% 2-day delivery

We currently struggle with:
- Peak season capacity constraints
- Slow order processing times
- Limited visibility into inventory

Budget: $500K - $750K annually
Submission deadline: 2025-11-15
"""

AUTOMOTIVE_RFP = """
REQUEST FOR PROPOSAL — GM Supplier Logistics

Company: GM Warren Stamping
Industry: Automotive

Services:
- Dedicated inbound shuttle
- Yard management
- ASN compliance desk

Volume: 1200 annual inbound moves
Coverage: Detroit-Warren corridor
Certifications: ISO 9001, CTPAT, SmartWay
Insurance: $2M general liability required
"""


def main() -> None:
    parser = argparse.ArgumentParser(description="AI Proposals Agent™ CLI")
    parser.add_argument("--demo", action="store_true", help="Run demo with mock LLM (no API key)")
    parser.add_argument("--rfp", type=Path, help="Path to RFP text file")
    parser.add_argument("--tier", choices=["competitive", "balanced", "premium"], default="balanced")
    parser.add_argument("--corridor", default="DEFAULT", help="Pricing corridor (e.g. DET-WARREN)")
    parser.add_argument("--automotive", action="store_true", help="Use automotive sample RFP")
    parser.add_argument("--output", type=Path, help="Write proposal JSON to path")
    args = parser.parse_args()

    rfp_text = SAMPLE_RFP
    if args.rfp:
        rfp_text = args.rfp.read_text()
    elif args.automotive:
        rfp_text = AUTOMOTIVE_RFP
        args.corridor = "DET-WARREN"

    mock = args.demo or not __import__("os").environ.get("ANTHROPIC_API_KEY")
    if mock:
        print("Running in MOCK mode (no Anthropic API calls)\n")

    kb = KnowledgeBase()
    agent = ProposalAgent(knowledge_base=kb, mock_llm=mock, corridor=args.corridor)

    try:
        proposal = agent.generate_full_proposal(
            rfp_text=rfp_text,
            pricing_tier=PricingTier(args.tier),
            corridor=args.corridor,
        )
    except Exception as e:
        print(f"\nPipeline stopped: {e}", file=sys.stderr)
        sys.exit(1)

    scenario = proposal.pricing.scenarios[proposal.selected_tier.value]
    print("\n" + "=" * 60)
    print("PROPOSAL GENERATED")
    print("=" * 60)
    print(f"Proposal ID:  {proposal.proposal_id}")
    print(f"Run ID:       {proposal.run_id}")
    print(f"Client:       {proposal.client_name}")
    print(f"Total ({proposal.selected_tier.value}): ${scenario.total}")
    print(f"Pricing hash: {proposal.pricing.pricing_hash[:20]}...")
    print(f"QA overall:   {proposal.qa_report.get('overall_score')} (min score)")
    print(f"Compliance gaps (mandatory): {proposal.compliance_report.mandatory_gap_count}")
    print(f"\nExecutive summary preview:\n{proposal.executive_summary[:280]}...")

    out = args.output or Path(f"proposal_{proposal.proposal_id}.json")

    def _serialize(obj):
        if hasattr(obj, "value"):
            return obj.value
        return str(obj)

    with open(out, "w") as f:
        json.dump(asdict(proposal), f, indent=2, default=_serialize)
    print(f"\nSaved: {out}")


if __name__ == "__main__":
    main()
