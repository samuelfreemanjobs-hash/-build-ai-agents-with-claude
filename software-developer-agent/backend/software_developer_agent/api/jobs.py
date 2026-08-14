"""In-memory job store and background processing."""

from __future__ import annotations

import json
import logging
import os
import uuid
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from software_developer_agent.agent import SoftwareDeveloperAgent
from software_developer_agent.api.schemas import DevTaskRequest, JobStatusEnum
from software_developer_agent.halts import HaltError

logger = logging.getLogger(__name__)

jobs_store: dict[str, dict] = {}
OUTPUT_DIR = Path(os.environ.get("DEV_AGENT_OUTPUT", "./out"))


def create_job(request: DevTaskRequest) -> str:
    job_id = str(uuid.uuid4())
    jobs_store[job_id] = {
        "job_id": job_id,
        "status": JobStatusEnum.PENDING,
        "request": request.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return job_id


def process_dev_job(job_id: str, request: DevTaskRequest) -> None:
    jobs_store[job_id]["status"] = JobStatusEnum.RUNNING
    try:
        agent = SoftwareDeveloperAgent(mock_llm=request.mock_llm)
        package = agent.execute_task(request.task_description, request.repo_path)

        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        output_path = OUTPUT_DIR / f"{package.run_id}.json"
        output_path.write_text(
            json.dumps({
                "run_id": package.run_id,
                "task": asdict(package.task_spec),
                "plan": asdict(package.implementation_plan) if package.implementation_plan else None,
                "verification": asdict(package.verification) if package.verification else None,
                "review": asdict(package.code_review) if package.code_review else None,
                "run_log": package.run_log,
            }, indent=2, default=str),
            encoding="utf-8",
        )

        jobs_store[job_id].update({
            "status": JobStatusEnum.COMPLETED,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "summary": {
                "run_id": package.run_id,
                "task_id": package.task_id,
                "task_title": package.task_title,
                "tier": package.tier.value,
                "review_recommendation": package.code_review.recommendation if package.code_review else None,
                "review_score": package.code_review.scores.get("overall") if package.code_review else None,
                "verification_status": package.verification.overall_status if package.verification else None,
                "files_changed": len(package.file_changes),
            },
            "download_path": str(output_path),
        })

    except HaltError as e:
        jobs_store[job_id].update({
            "status": JobStatusEnum.HALTED,
            "halt_cause": e.cause.value,
            "error": e.message,
            "fix_path": e.fix_path,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })

    except Exception as e:
        logger.exception("Job %s failed", job_id)
        jobs_store[job_id].update({
            "status": JobStatusEnum.FAILED,
            "error": str(e),
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })
