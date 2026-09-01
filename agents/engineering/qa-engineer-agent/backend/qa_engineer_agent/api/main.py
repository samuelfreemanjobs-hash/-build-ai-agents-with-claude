import os
from datetime import datetime, timezone

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from qa_engineer_agent import __version__
from qa_engineer_agent.api.jobs import OUTPUT_DIR, create_job, jobs_store, process_job
from qa_engineer_agent.api.schemas import HealthCheck, JobStatusEnum, QAJobResponse, QARequest, QAResult

app = FastAPI(title="QA Engineer Agent™ API", version=__version__, docs_url="/docs")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/", response_model=HealthCheck)
async def root():
    return HealthCheck(
        status="healthy",
        version=__version__,
        timestamp=datetime.now(timezone.utc).isoformat(),
        api_available=True,
        mock_llm_default=not os.environ.get("ANTHROPIC_API_KEY"),
    )


@app.post("/api/v1/qa/validate", response_model=QAJobResponse)
async def validate(req: QARequest, background: BackgroundTasks):
    if not req.mock_llm and not os.environ.get("ANTHROPIC_API_KEY"):
        req = req.model_copy(update={"mock_llm": True})
    job_id = create_job(req)
    background.add_task(process_job, job_id, req)
    return QAJobResponse(
        job_id=job_id,
        status=JobStatusEnum.PENDING,
        estimated_completion="1-3 minutes",
        message=f"Poll /api/v1/qa/status/{job_id}",
    )


@app.post("/api/v1/qa/validate-sync", response_model=QAResult)
async def validate_sync(req: QARequest):
    if not req.mock_llm and not os.environ.get("ANTHROPIC_API_KEY"):
        req = req.model_copy(update={"mock_llm": True})
    job_id = create_job(req)
    process_job(job_id, req)
    return await get_status(job_id)


@app.get("/api/v1/qa/status/{job_id}", response_model=QAResult)
async def get_status(job_id: str):
    if job_id not in jobs_store:
        raise HTTPException(status_code=404, detail="Not found")
    job = jobs_store[job_id]
    result = QAResult(job_id=job_id, status=job["status"])
    if job["status"] == JobStatusEnum.COMPLETED:
        summary = job["summary"]
        result.run_id = summary.get("run_id")
        result.release_name = summary.get("release_name")
        result.output_type = summary.get("output_type")
        result.coverage_pct = summary.get("coverage_pct")
        result.risk_level = summary.get("risk_level")
        result.readiness_score = summary.get("readiness_score")
        result.readiness_recommendation = summary.get("readiness_recommendation")
        result.completed_at = job.get("completed_at")
    elif job["status"] == JobStatusEnum.HALTED:
        result.halt_cause = job.get("halt_cause")
        result.error_message = f"{job.get('error')} — Fix: {job.get('fix_path')}"
    elif job["status"] == JobStatusEnum.FAILED:
        result.error_message = job.get("error")
    return result


@app.get("/api/v1/qa/download/{job_id}")
async def download(job_id: str):
    if job_id not in jobs_store or jobs_store[job_id]["status"] != JobStatusEnum.COMPLETED:
        raise HTTPException(status_code=400, detail="Not ready")
    path = jobs_store[job_id].get("download_path")
    if not path or not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(path, media_type="application/json", filename=f"qa_{job_id}.json")


def run():
    import uvicorn

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    port = int(os.environ.get("API_PORT", "8005"))
    print(f"QA Engineer Agent™ API → http://0.0.0.0:{port}/docs")
    uvicorn.run("qa_engineer_agent.api.main:app", host="0.0.0.0", port=port)


if __name__ == "__main__":
    run()
