import os
from datetime import datetime, timezone
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from engineering_manager_agent import __version__
from engineering_manager_agent.api.jobs import OUTPUT_DIR, create_job, jobs_store, process_job
from engineering_manager_agent.api.schemas import HealthCheck, JobStatusEnum, ManagementJobResponse, ManagementRequest, ManagementResult

app = FastAPI(title="Engineering Manager Agent™ API", version=__version__, docs_url="/docs")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/", response_model=HealthCheck)
async def root():
    return HealthCheck(status="healthy", version=__version__,
                       timestamp=datetime.now(timezone.utc).isoformat(),
                       api_available=True, mock_llm_default=not os.environ.get("ANTHROPIC_API_KEY"))

@app.post("/api/v1/manage/plan", response_model=ManagementJobResponse)
async def plan(req: ManagementRequest, bg: BackgroundTasks):
    if not req.mock_llm and not os.environ.get("ANTHROPIC_API_KEY"):
        req = req.model_copy(update={"mock_llm": True})
    jid = create_job(req); bg.add_task(process_job, jid, req)
    return ManagementJobResponse(job_id=jid, status=JobStatusEnum.PENDING,
                                 estimated_completion="1-3 minutes",
                                 message=f"Poll /api/v1/manage/status/{jid}")

@app.post("/api/v1/manage/plan-sync", response_model=ManagementResult)
async def plan_sync(req: ManagementRequest):
    if not req.mock_llm and not os.environ.get("ANTHROPIC_API_KEY"):
        req = req.model_copy(update={"mock_llm": True})
    jid = create_job(req); process_job(jid, req)
    return await get_status(jid)

@app.get("/api/v1/manage/status/{job_id}", response_model=ManagementResult)
async def get_status(job_id: str):
    if job_id not in jobs_store: raise HTTPException(404, "Not found")
    job = jobs_store[job_id]
    r = ManagementResult(job_id=job_id, status=job["status"])
    if job["status"] == JobStatusEnum.COMPLETED:
        s = job["summary"]
        r.run_id, r.team_name, r.output_type = s.get("run_id"), s.get("team_name"), s.get("output_type")
        r.capacity_utilization, r.governance_score = s.get("capacity_utilization"), s.get("governance_score")
        r.governance_recommendation = s.get("governance_recommendation")
        r.completed_at = job.get("completed_at")
    elif job["status"] == JobStatusEnum.HALTED:
        r.halt_cause = job.get("halt_cause")
        r.error_message = f"{job.get('error')} — Fix: {job.get('fix_path')}"
    elif job["status"] == JobStatusEnum.FAILED:
        r.error_message = job.get("error")
    return r

@app.get("/api/v1/manage/download/{job_id}")
async def download(job_id: str):
    if job_id not in jobs_store or jobs_store[job_id]["status"] != JobStatusEnum.COMPLETED:
        raise HTTPException(400, "Not ready")
    path = jobs_store[job_id].get("download_path")
    if not path or not os.path.exists(path): raise HTTPException(404, "Not found")
    return FileResponse(path, media_type="application/json", filename=f"management_{job_id}.json")

def run():
    import uvicorn
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    port = int(os.environ.get("API_PORT", "8004"))
    print(f"Engineering Manager Agent™ API → http://0.0.0.0:{port}/docs")
    uvicorn.run("engineering_manager_agent.api.main:app", host="0.0.0.0", port=port)

if __name__ == "__main__":
    run()
