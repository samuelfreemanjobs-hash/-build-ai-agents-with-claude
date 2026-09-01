"""Job store and proposal serialization."""

from __future__ import annotations

import json
import logging
import os
import uuid
from dataclasses import asdict, is_dataclass
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any

from ai_proposals_agent.agent import ProposalAgent
from ai_proposals_agent.api.schemas import ProposalRequest, ProposalStatus
from ai_proposals_agent.halts import HaltError
from ai_proposals_agent.knowledge_base import KnowledgeBase
from ai_proposals_agent.models import PricingTier, ProposalPackage

logger = logging.getLogger(__name__)

OUTPUT_DIR = Path(os.environ.get("PROPOSALS_OUTPUT_DIR", "generated_proposals"))

jobs_store: dict[str, dict[str, Any]] = {}
knowledge_bases: dict[str, KnowledgeBase] = {}


def get_kb(company_id: str) -> KnowledgeBase:
    if company_id not in knowledge_bases:
        knowledge_bases[company_id] = KnowledgeBase()
    return knowledge_bases[company_id]


def _serialize(obj: Any) -> Any:
    if is_dataclass(obj) and not isinstance(obj, type):
        return {k: _serialize(v) for k, v in asdict(obj).items()}
    if isinstance(obj, Enum):
        return obj.value
    if isinstance(obj, list):
        return [_serialize(i) for i in obj]
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    return obj


def package_to_dict(proposal: ProposalPackage) -> dict[str, Any]:
    return _serialize(proposal)


def process_proposal_job(job_id: str, request: ProposalRequest) -> None:
    """Run proposal pipeline (sync — called from background task)."""
    job = jobs_store[job_id]
    job["status"] = ProposalStatus.PROCESSING
    job["started_at"] = datetime.now(timezone.utc).isoformat()

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    use_mock = request.mock_llm or not api_key

    try:
        kb = get_kb(request.company_id)
        agent = ProposalAgent(
            knowledge_base=kb,
            api_key=api_key,
            mock_llm=use_mock,
            corridor=request.corridor,
        )
        proposal = agent.generate_full_proposal(
            rfp_text=request.rfp_text,
            pricing_tier=PricingTier(request.pricing_tier.value),
            corridor=request.corridor,
        )

        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        output_file = OUTPUT_DIR / f"{proposal.proposal_id}.json"
        payload = package_to_dict(proposal)
        output_file.write_text(json.dumps(payload, indent=2))

        scenario = proposal.pricing.scenarios[proposal.selected_tier.value]
        job["status"] = ProposalStatus.COMPLETED
        job["result"] = payload
        job["download_path"] = str(output_file)
        job["completed_at"] = datetime.now(timezone.utc).isoformat()
        job["summary"] = {
            "proposal_id": proposal.proposal_id,
            "run_id": proposal.run_id,
            "client_name": proposal.client_name,
            "total_value": scenario.total,
            "pricing_hash": proposal.pricing.pricing_hash,
            "qa_overall": proposal.qa_report.get("overall_score"),
            "compliance_gaps": proposal.compliance_report.mandatory_gap_count,
        }
        logger.info("Job %s completed: %s", job_id, proposal.proposal_id)

    except HaltError as e:
        job["status"] = ProposalStatus.HALTED
        job["halt_cause"] = e.cause.value
        job["error"] = e.message
        job["fix_path"] = e.fix_path
        job["completed_at"] = datetime.now(timezone.utc).isoformat()
        logger.warning("Job %s halted: %s", job_id, e.cause.value)

    except Exception as e:
        job["status"] = ProposalStatus.FAILED
        job["error"] = str(e)
        job["completed_at"] = datetime.now(timezone.utc).isoformat()
        logger.exception("Job %s failed", job_id)


def create_job(request: ProposalRequest) -> str:
    job_id = str(uuid.uuid4())
    jobs_store[job_id] = {
        "job_id": job_id,
        "status": ProposalStatus.PENDING,
        "request": request.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "priority": request.priority,
    }
    return job_id
