import json
import logging
import os
import uuid
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from qa_engineer_agent.agent import QAEngineerAgent
from qa_engineer_agent.api.schemas import JobStatusEnum, QARequest
from qa_engineer_agent.halts import HaltError

logger = logging.getLogger(__name__)
jobs_store: dict = {}
OUTPUT_DIR = Path(os.environ.get("QA_OUTPUT", "./out"))


def create_job(req: QARequest) -> str:
    job_id = str(uuid.uuid4())
    jobs_store[job_id] = {
        "job_id": job_id,
        "status": JobStatusEnum.PENDING,
        "request": req.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return job_id


def process_job(job_id: str, req: QARequest) -> None:
    jobs_store[job_id]["status"] = JobStatusEnum.RUNNING
    try:
        package = QAEngineerAgent(mock_llm=req.mock_llm).execute(req.description)
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        path = OUTPUT_DIR / f"{package.run_id}.json"
        path.write_text(json.dumps({
            "run_id": package.run_id,
            "scope": asdict(package.scope),
            "coverage": package.coverage,
            "risk": package.risk,
            "strategy": asdict(package.strategy),
            "readiness": asdict(package.readiness),
            "action_plan": package.action_plan,
            "run_log": package.run_log,
        }, indent=2, default=str), encoding="utf-8")
        jobs_store[job_id].update({
            "status": JobStatusEnum.COMPLETED,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "summary": {
                "run_id": package.run_id,
                "release_name": package.scope.release_name,
                "output_type": package.scope.output_type,
                "coverage_pct": package.coverage.get("coverage_pct"),
                "risk_level": package.risk.get("risk_level"),
                "readiness_score": package.readiness.scores.get("overall"),
                "readiness_recommendation": package.readiness.recommendation,
            },
            "download_path": str(path),
        })
    except HaltError as error:
        jobs_store[job_id].update({
            "status": JobStatusEnum.HALTED,
            "halt_cause": error.cause.value,
            "error": error.message,
            "fix_path": error.remediation,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as error:
        logger.exception("Job failed")
        jobs_store[job_id].update({
            "status": JobStatusEnum.FAILED,
            "error": str(error),
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })
