"""Software Developer Agent™ — FastAPI REST API."""

from __future__ import annotations

import os
from datetime import datetime, timezone

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from software_developer_agent import __version__
from software_developer_agent.api.jobs import OUTPUT_DIR, create_job, jobs_store, process_dev_job
from software_developer_agent.api.schemas import (
    DevJobResponse,
    DevTaskRequest,
    DevTaskResult,
    HealthCheck,
    JobStatusEnum,
    TierEnum,
)

app = FastAPI(
    title="Software Developer Agent™ API",
    description="Spec-to-shipped code with deterministic verification",
    version=__version__,
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _default_mock() -> bool:
    return not os.environ.get("ANTHROPIC_API_KEY")


@app.get("/", response_model=HealthCheck)
async def root() -> HealthCheck:
    return HealthCheck(
        status="healthy",
        version=__version__,
        timestamp=datetime.now(timezone.utc).isoformat(),
        api_available=True,
        mock_llm_default=_default_mock(),
    )


@app.post("/api/v1/dev/execute", response_model=DevJobResponse)
async def execute_task(request: DevTaskRequest, background_tasks: BackgroundTasks) -> DevJobResponse:
    if request.mock_llm is False and not os.environ.get("ANTHROPIC_API_KEY"):
        request = request.model_copy(update={"mock_llm": True})

    job_id = create_job(request)
    background_tasks.add_task(process_dev_job, job_id, request)

    return DevJobResponse(
        job_id=job_id,
        status=JobStatusEnum.PENDING,
        estimated_completion="1-3 minutes",
        message=f"Development run started. Poll /api/v1/dev/status/{job_id}",
    )


@app.post("/api/v1/dev/execute-sync", response_model=DevTaskResult)
async def execute_task_sync(request: DevTaskRequest) -> DevTaskResult:
    if request.mock_llm is False and not os.environ.get("ANTHROPIC_API_KEY"):
        request = request.model_copy(update={"mock_llm": True})

    job_id = create_job(request)
    process_dev_job(job_id, request)
    return await get_task_status(job_id)


@app.get("/api/v1/dev/status/{job_id}", response_model=DevTaskResult)
async def get_task_status(job_id: str) -> DevTaskResult:
    if job_id not in jobs_store:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs_store[job_id]
    result = DevTaskResult(job_id=job_id, status=job["status"])

    if job["status"] == JobStatusEnum.COMPLETED:
        summary = job.get("summary", {})
        result.run_id = summary.get("run_id")
        result.task_id = summary.get("task_id")
        result.task_title = summary.get("task_title")
        result.tier = TierEnum(summary["tier"]) if summary.get("tier") else None
        result.review_recommendation = summary.get("review_recommendation")
        result.review_score = summary.get("review_score")
        result.verification_status = summary.get("verification_status")
        result.files_changed = summary.get("files_changed")
        result.completed_at = job.get("completed_at")

    elif job["status"] == JobStatusEnum.HALTED:
        result.halt_cause = job.get("halt_cause")
        result.error_message = f"{job.get('error')} — Fix: {job.get('fix_path')}"

    elif job["status"] == JobStatusEnum.FAILED:
        result.error_message = job.get("error", "Unknown error")

    return result


@app.get("/api/v1/dev/download/{job_id}")
async def download_result(job_id: str):
    if job_id not in jobs_store:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs_store[job_id]
    if job["status"] != JobStatusEnum.COMPLETED:
        raise HTTPException(status_code=400, detail="Job not yet completed")

    path = job.get("download_path")
    if not path or not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Output file not found")

    return FileResponse(path, media_type="application/json", filename=f"dev_run_{job_id}.json")


def run() -> None:
    import uvicorn

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    host = os.environ.get("API_HOST", "0.0.0.0")
    port = int(os.environ.get("API_PORT", "8001"))
    print("=" * 60)
    print("SOFTWARE DEVELOPER AGENT™ API")
    print("=" * 60)
    print(f"Docs:   http://{host}:{port}/docs")
    print("=" * 60)
    uvicorn.run("software_developer_agent.api.main:app", host=host, port=port, log_level="info")


if __name__ == "__main__":
    run()
