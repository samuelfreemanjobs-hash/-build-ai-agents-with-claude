"""Principal Software Engineer Agent™ — FastAPI REST API."""

from __future__ import annotations

import os
from datetime import datetime, timezone

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from principal_software_engineer import __version__
from principal_software_engineer.api.jobs import OUTPUT_DIR, create_job, jobs_store, process_design_job
from principal_software_engineer.api.schemas import (
    DesignJobResponse, DesignRequest, DesignResult, HealthCheck, JobStatusEnum,
)

app = FastAPI(
    title="Principal Software Engineer Agent™ API",
    description="Problem-to-architecture with deterministic risk scoring",
    version=__version__, docs_url="/docs",
)
app.add_middleware(CORSMiddleware, allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/", response_model=HealthCheck)
async def root() -> HealthCheck:
    return HealthCheck(status="healthy", version=__version__,
                       timestamp=datetime.now(timezone.utc).isoformat(),
                       api_available=True, mock_llm_default=not os.environ.get("ANTHROPIC_API_KEY"))


@app.post("/api/v1/design/execute", response_model=DesignJobResponse)
async def execute_design(request: DesignRequest, background_tasks: BackgroundTasks) -> DesignJobResponse:
    if not request.mock_llm and not os.environ.get("ANTHROPIC_API_KEY"):
        request = request.model_copy(update={"mock_llm": True})
    job_id = create_job(request)
    background_tasks.add_task(process_design_job, job_id, request)
    return DesignJobResponse(job_id=job_id, status=JobStatusEnum.PENDING,
                             estimated_completion="2-5 minutes",
                             message=f"Design run started. Poll /api/v1/design/status/{job_id}")


@app.post("/api/v1/design/execute-sync", response_model=DesignResult)
async def execute_design_sync(request: DesignRequest) -> DesignResult:
    if not request.mock_llm and not os.environ.get("ANTHROPIC_API_KEY"):
        request = request.model_copy(update={"mock_llm": True})
    job_id = create_job(request)
    process_design_job(job_id, request)
    return await get_design_status(job_id)


@app.get("/api/v1/design/status/{job_id}", response_model=DesignResult)
async def get_design_status(job_id: str) -> DesignResult:
    if job_id not in jobs_store:
        raise HTTPException(status_code=404, detail="Job not found")
    job = jobs_store[job_id]
    result = DesignResult(job_id=job_id, status=job["status"])
    if job["status"] == JobStatusEnum.COMPLETED:
        s = job.get("summary", {})
        result.run_id = s.get("run_id")
        result.problem_id = s.get("problem_id")
        result.problem_title = s.get("problem_title")
        result.tier = s.get("tier")
        result.options_evaluated = s.get("options_evaluated")
        result.recommended_option = s.get("recommended_option")
        result.review_recommendation = s.get("review_recommendation")
        result.review_score = s.get("review_score")
        result.completed_at = job.get("completed_at")
    elif job["status"] == JobStatusEnum.HALTED:
        result.halt_cause = job.get("halt_cause")
        result.error_message = f"{job.get('error')} — Fix: {job.get('fix_path')}"
    elif job["status"] == JobStatusEnum.FAILED:
        result.error_message = job.get("error", "Unknown error")
    return result


@app.get("/api/v1/design/download/{job_id}")
async def download_result(job_id: str):
    if job_id not in jobs_store:
        raise HTTPException(status_code=404, detail="Job not found")
    job = jobs_store[job_id]
    if job["status"] != JobStatusEnum.COMPLETED:
        raise HTTPException(status_code=400, detail="Job not yet completed")
    path = job.get("download_path")
    if not path or not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Output file not found")
    return FileResponse(path, media_type="application/json", filename=f"design_{job_id}.json")


def run() -> None:
    import uvicorn
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    host = os.environ.get("API_HOST", "0.0.0.0")
    port = int(os.environ.get("API_PORT", "8002"))
    print("=" * 60)
    print("PRINCIPAL SOFTWARE ENGINEER AGENT™ API")
    print(f"Docs: http://{host}:{port}/docs")
    print("=" * 60)
    uvicorn.run("principal_software_engineer.api.main:app", host=host, port=port, log_level="info")


if __name__ == "__main__":
    run()
