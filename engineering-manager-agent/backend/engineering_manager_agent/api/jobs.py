import json, logging, os, uuid
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from engineering_manager_agent.agent import EngineeringManagerAgent
from engineering_manager_agent.api.schemas import JobStatusEnum, ManagementRequest
from engineering_manager_agent.halts import HaltError

logger = logging.getLogger(__name__)
jobs_store: dict = {}
OUTPUT_DIR = Path(os.environ.get("EM_OUTPUT", "./out"))

def create_job(req: ManagementRequest) -> str:
    jid = str(uuid.uuid4())
    jobs_store[jid] = {"job_id": jid, "status": JobStatusEnum.PENDING,
                       "request": req.model_dump(), "created_at": datetime.now(timezone.utc).isoformat()}
    return jid

def process_job(jid: str, req: ManagementRequest) -> None:
    jobs_store[jid]["status"] = JobStatusEnum.RUNNING
    try:
        pkg = EngineeringManagerAgent(mock_llm=req.mock_llm).execute(req.description)
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        path = OUTPUT_DIR / f"{pkg.run_id}.json"
        path.write_text(json.dumps({
            "run_id": pkg.run_id, "context": asdict(pkg.context),
            "capacity": pkg.capacity, "commitments": asdict(pkg.commitments) if pkg.commitments else None,
            "action_plan": pkg.action_plan, "governance": asdict(pkg.governance) if pkg.governance else None,
            "run_log": pkg.run_log,
        }, indent=2, default=str), encoding="utf-8")
        jobs_store[jid].update({
            "status": JobStatusEnum.COMPLETED, "completed_at": datetime.now(timezone.utc).isoformat(),
            "summary": {"run_id": pkg.run_id, "team_name": pkg.context.team_name,
                        "output_type": pkg.context.output_type,
                        "capacity_utilization": pkg.run_log.get("capacity_utilization"),
                        "governance_score": pkg.governance.scores.get("overall") if pkg.governance else None,
                        "governance_recommendation": pkg.governance.recommendation if pkg.governance else None},
            "download_path": str(path),
        })
    except HaltError as e:
        jobs_store[jid].update({"status": JobStatusEnum.HALTED, "halt_cause": e.cause.value,
                                "error": e.message, "fix_path": e.fix_path,
                                "completed_at": datetime.now(timezone.utc).isoformat()})
    except Exception as e:
        logger.exception("Job failed")
        jobs_store[jid].update({"status": JobStatusEnum.FAILED, "error": str(e),
                                "completed_at": datetime.now(timezone.utc).isoformat()})
