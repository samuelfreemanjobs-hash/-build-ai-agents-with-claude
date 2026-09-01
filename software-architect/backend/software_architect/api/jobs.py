import json, logging, os, uuid
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from software_architect.agent import SoftwareArchitectAgent
from software_architect.api.schemas import ArchitectureRequest, JobStatusEnum
from software_architect.halts import HaltError

logger = logging.getLogger(__name__)
jobs_store: dict = {}
OUTPUT_DIR = Path(os.environ.get("SA_OUTPUT", "./out"))


def create_job(req: ArchitectureRequest) -> str:
    jid = str(uuid.uuid4())
    jobs_store[jid] = {"job_id": jid, "status": JobStatusEnum.PENDING,
                       "request": req.model_dump(), "created_at": datetime.now(timezone.utc).isoformat()}
    return jid


def process_job(jid: str, req: ArchitectureRequest) -> None:
    jobs_store[jid]["status"] = JobStatusEnum.RUNNING
    try:
        pkg = SoftwareArchitectAgent(mock_llm=req.mock_llm).execute(req.description, req.repo_path)
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        path = OUTPUT_DIR / f"{pkg.run_id}.json"
        path.write_text(json.dumps({
            "run_id": pkg.run_id, "scope": asdict(pkg.scope),
            "as_is": asdict(pkg.as_is_model) if pkg.as_is_model else None,
            "nfr_map": pkg.nfr_map, "patterns": pkg.patterns,
            "governance": asdict(pkg.governance) if pkg.governance else None,
            "run_log": pkg.run_log,
        }, indent=2, default=str), encoding="utf-8")
        jobs_store[jid].update({
            "status": JobStatusEnum.COMPLETED, "completed_at": datetime.now(timezone.utc).isoformat(),
            "summary": {"run_id": pkg.run_id, "system_name": pkg.scope.system_name,
                        "tier": pkg.scope.tier.value,
                        "c4_levels": pkg.run_log.get("c4_levels", []),
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
