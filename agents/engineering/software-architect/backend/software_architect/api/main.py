import os
from datetime import datetime, timezone
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from software_architect import __version__
from software_architect.api.jobs import OUTPUT_DIR, create_job, jobs_store, process_job
from software_architect.api.schemas import ArchitectureJobResponse, ArchitectureRequest, ArchitectureResult, HealthCheck, JobStatusEnum

app = FastAPI(title="Software Architect Agent™ API", version=__version__, docs_url="/docs")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/", response_model=HealthCheck)
async def root():
    return HealthCheck(status="healthy", version=__version__,
                       timestamp=datetime.now(timezone.utc).isoformat(),
                       api_available=True, mock_llm_default=not os.environ.get("ANTHROPIC_API_KEY"))


@app.post("/api/v1/architecture/model", response_model=ArchitectureJobResponse)
async def model_architecture(req: ArchitectureRequest, bg: BackgroundTasks):
    if not req.mock_llm and not os.environ.get("ANTHROPIC_API_KEY"):
        req = req.model_copy(update={"mock_llm": True})
    jid = create_job(req)
    bg.add_task(process_job, jid, req)
    return ArchitectureJobResponse(job_id=jid, status=JobStatusEnum.PENDING,
                                   estimated_completion="2-5 minutes",
                                   message=f"Poll /api/v1/architecture/status/{jid}")


@app.post("/api/v1/architecture/model-sync", response_model=ArchitectureResult)
async def model_sync(req: ArchitectureRequest):
    if not req.mock_llm and not os.environ.get("ANTHROPIC_API_KEY"):
        req = req.model_copy(update={"mock_llm": True})
    jid = create_job(req)
    process_job(jid, req)
    return await get_status(jid)


@app.get("/api/v1/architecture/status/{job_id}", response_model=ArchitectureResult)
async def get_status(job_id: str):
    if job_id not in jobs_store:
        raise HTTPException(404, "Job not found")
    job = jobs_store[job_id]
    r = ArchitectureResult(job_id=job_id, status=job["status"])
    if job["status"] == JobStatusEnum.COMPLETED:
        s = job["summary"]
        r.run_id, r.system_name, r.tier = s.get("run_id"), s.get("system_name"), s.get("tier")
        r.c4_levels, r.governance_score = s.get("c4_levels"), s.get("governance_score")
        r.governance_recommendation = s.get("governance_recommendation")
        r.completed_at = job.get("completed_at")
    elif job["status"] == JobStatusEnum.HALTED:
        r.halt_cause = job.get("halt_cause")
        r.error_message = f"{job.get('error')} — Fix: {job.get('fix_path')}"
    elif job["status"] == JobStatusEnum.FAILED:
        r.error_message = job.get("error")
    return r


@app.get("/api/v1/architecture/download/{job_id}")
async def download(job_id: str):
    if job_id not in jobs_store or jobs_store[job_id]["status"] != JobStatusEnum.COMPLETED:
        raise HTTPException(400, "Not ready")
    path = jobs_store[job_id].get("download_path")
    if not path or not os.path.exists(path):
        raise HTTPException(404, "File not found")
    return FileResponse(path, media_type="application/json", filename=f"architecture_{job_id}.json")


def run():
    import uvicorn
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    port = int(os.environ.get("API_PORT", "8003"))
    print(f"Software Architect Agent™ API → http://0.0.0.0:{port}/docs")
    uvicorn.run("software_architect.api.main:app", host="0.0.0.0", port=port)

if __name__ == "__main__":
    run()
