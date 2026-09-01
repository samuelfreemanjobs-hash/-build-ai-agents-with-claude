"""Job processing."""

from __future__ import annotations

import json
import logging
import os
import uuid
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from principal_software_engineer.agent import PrincipalSoftwareEngineerAgent
from principal_software_engineer.api.schemas import DesignRequest, JobStatusEnum
from principal_software_engineer.halts import HaltError

logger = logging.getLogger(__name__)
jobs_store: dict[str, dict] = {}
OUTPUT_DIR = Path(os.environ.get("PSE_OUTPUT", "./out"))


def create_job(request: DesignRequest) -> str:
    job_id = str(uuid.uuid4())
    jobs_store[job_id] = {
        "job_id": job_id, "status": JobStatusEnum.PENDING,
        "request": request.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return job_id


def process_design_job(job_id: str, request: DesignRequest) -> None:
    jobs_store[job_id]["status"] = JobStatusEnum.RUNNING
    try:
        agent = PrincipalSoftwareEngineerAgent(mock_llm=request.mock_llm)
        package = agent.execute_design(request.problem_description, request.repo_path)

        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        output_path = OUTPUT_DIR / f"{package.run_id}.json"
        output_path.write_text(json.dumps({
            "run_id": package.run_id,
            "problem": asdict(package.problem_brief),
            "options": [asdict(o) for o in package.options],
            "evaluation": asdict(package.evaluation) if package.evaluation else None,
            "review": asdict(package.design_review) if package.design_review else None,
            "run_log": package.run_log,
        }, indent=2, default=str), encoding="utf-8")

        jobs_store[job_id].update({
            "status": JobStatusEnum.COMPLETED,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "summary": {
                "run_id": package.run_id, "problem_id": package.problem_id,
                "problem_title": package.problem_title, "tier": package.tier.value,
                "options_evaluated": len(package.options),
                "recommended_option": package.evaluation.recommended_option if package.evaluation else None,
                "review_recommendation": package.design_review.recommendation if package.design_review else None,
                "review_score": package.design_review.scores.get("overall") if package.design_review else None,
            },
            "download_path": str(output_path),
        })
    except HaltError as e:
        jobs_store[job_id].update({
            "status": JobStatusEnum.HALTED, "halt_cause": e.cause.value,
            "error": e.message, "fix_path": e.fix_path,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as e:
        logger.exception("Job %s failed", job_id)
        jobs_store[job_id].update({
            "status": JobStatusEnum.FAILED, "error": str(e),
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })
