"""AI Proposals Agent™ — FastAPI REST API."""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone

from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from ai_proposals_agent import __version__
from ai_proposals_agent.api.jobs import (
    OUTPUT_DIR,
    create_job,
    get_kb,
    jobs_store,
    process_proposal_job,
)
from ai_proposals_agent.api.schemas import (
    CaseStudyUpload,
    FeedbackRequest,
    HealthCheck,
    PricingScenariosRequest,
    PricingTierEnum,
    ProposalJobResponse,
    ProposalRequest,
    ProposalResult,
    ProposalStatus,
)
from ai_proposals_agent.compliance import ComplianceChecker
from ai_proposals_agent.halts import HaltError
from ai_proposals_agent.models import CaseStudy, RFPRequirements
from ai_proposals_agent.pricing_engine import PricingEngine

app = FastAPI(
    title="AI Proposals Agent™ API",
    description="Logistics proposal generation with engine-bound pricing and traceability",
    version=__version__,
    docs_url="/docs",
    redoc_url="/redoc",
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
        knowledge_base_status="operational",
        mock_llm_default=_default_mock(),
    )


@app.post("/api/v1/proposals/generate", response_model=ProposalJobResponse)
async def generate_proposal(
    request: ProposalRequest,
    background_tasks: BackgroundTasks,
) -> ProposalJobResponse:
    """Submit RFP for async proposal generation."""
    if request.mock_llm is False and not os.environ.get("ANTHROPIC_API_KEY"):
        request = request.model_copy(update={"mock_llm": True})

    job_id = create_job(request)
    background_tasks.add_task(process_proposal_job, job_id, request)

    estimated = "1-2 minutes" if request.priority else "2-5 minutes"
    return ProposalJobResponse(
        job_id=job_id,
        status=ProposalStatus.PENDING,
        estimated_completion=estimated,
        message=f"Proposal generation started. Poll /api/v1/proposals/status/{job_id}",
    )


@app.post("/api/v1/proposals/generate-sync", response_model=ProposalResult)
async def generate_proposal_sync(request: ProposalRequest) -> ProposalResult:
    """Generate proposal synchronously (for testing / small RFPs)."""
    if request.mock_llm is False and not os.environ.get("ANTHROPIC_API_KEY"):
        request = request.model_copy(update={"mock_llm": True})

    job_id = create_job(request)
    process_proposal_job(job_id, request)
    return await get_proposal_status(job_id)


@app.get("/api/v1/proposals/status/{job_id}", response_model=ProposalResult)
async def get_proposal_status(job_id: str) -> ProposalResult:
    if job_id not in jobs_store:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs_store[job_id]
    result = ProposalResult(job_id=job_id, status=job["status"])

    if job["status"] == ProposalStatus.COMPLETED:
        summary = job.get("summary", {})
        proposal = job.get("result", {})
        result.proposal_id = summary.get("proposal_id")
        result.run_id = summary.get("run_id")
        result.client_name = summary.get("client_name")
        result.total_value = summary.get("total_value")
        result.pricing_hash = summary.get("pricing_hash")
        result.qa_overall = summary.get("qa_overall")
        result.compliance_gaps = summary.get("compliance_gaps")
        result.confidence_score = (summary.get("qa_overall") or 0) / 10.0
        result.generated_date = job.get("completed_at")
        result.download_url = f"/api/v1/proposals/download/{job_id}"
        result.sections_preview = {
            "executive_summary": (proposal.get("executive_summary") or "")[:200] + "...",
            "case_studies_count": len(proposal.get("case_studies") or []),
            "pricing_scenario": proposal.get("selected_tier"),
        }
        result.qa_report = proposal.get("qa_report")

    elif job["status"] == ProposalStatus.HALTED:
        result.halt_cause = job.get("halt_cause")
        result.error_message = f"{job.get('error')} — Fix: {job.get('fix_path')}"

    elif job["status"] == ProposalStatus.FAILED:
        result.error_message = job.get("error", "Unknown error")

    return result


@app.get("/api/v1/proposals/download/{job_id}")
async def download_proposal(job_id: str, format: str = "json"):
    if job_id not in jobs_store:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs_store[job_id]
    if job["status"] != ProposalStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Proposal not yet completed")

    if format == "json":
        file_path = job.get("download_path")
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Proposal file not found")
        pid = job.get("summary", {}).get("proposal_id", job_id)
        return FileResponse(file_path, media_type="application/json", filename=f"proposal_{pid}.json")

    if format in ("docx", "pdf"):
        raise HTTPException(status_code=501, detail=f"{format.upper()} export not yet implemented (G2)")

    raise HTTPException(status_code=400, detail="Invalid format. Use: json, docx, or pdf")


@app.post("/api/v1/proposals/upload-rfp", response_model=ProposalJobResponse)
async def upload_rfp_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    pricing_tier: PricingTierEnum = Form(PricingTierEnum.BALANCED),
    company_id: str = Form("default"),
    corridor: str = Form("DEFAULT"),
    priority: bool = Form(False),
    mock_llm: bool = Form(False),
):
    """Upload RFP file (TXT now; PDF/DOCX via G1)."""
    content_type = file.content_type or ""
    raw = await file.read()

    if content_type == "text/plain" or file.filename and file.filename.endswith(".txt"):
        try:
            rfp_text = raw.decode("utf-8")
        except UnicodeDecodeError as e:
            raise HTTPException(status_code=400, detail="Could not decode text file as UTF-8") from e
    elif content_type in (
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ):
        raise HTTPException(
            status_code=501,
            detail="PDF/DOCX ingestion not yet implemented (G1). Upload .txt or use /generate with rfp_text.",
        )
    else:
        try:
            rfp_text = raw.decode("utf-8")
        except UnicodeDecodeError as e:
            raise HTTPException(status_code=400, detail="Unsupported file type") from e

    request = ProposalRequest(
        rfp_text=rfp_text,
        pricing_tier=pricing_tier,
        company_id=company_id,
        corridor=corridor,
        priority=priority,
        mock_llm=mock_llm or _default_mock(),
    )
    return await generate_proposal(request, background_tasks)


@app.get("/api/v1/knowledge-base/case-studies")
async def list_case_studies(
    company_id: str = "default",
    industry: str | None = None,
    limit: int = 50,
):
    kb = get_kb(company_id)
    cases = kb.get_all_case_studies()
    if industry:
        cases = [c for c in cases if c.industry.lower() == industry.lower()]
    return {
        "total": len(cases),
        "cases": [
            {
                "case_id": c.case_id,
                "client_name": c.client_name,
                "industry": c.industry,
                "results": c.results,
                "tags": c.challenge_tags + c.solution_tags,
                "source_ref": c.source_ref,
            }
            for c in cases[:limit]
        ],
    }


@app.post("/api/v1/knowledge-base/case-studies")
async def add_case_study(case_study: CaseStudyUpload, company_id: str = "default"):
    kb = get_kb(company_id)
    case_id = f"CS-{uuid.uuid4().hex[:6].upper()}"
    kb.case_studies.append(
        CaseStudy(
            case_id=case_id,
            client_name=case_study.client_name,
            industry=case_study.industry,
            challenge=case_study.challenge,
            solution=case_study.solution,
            results=case_study.results,
            relevance_score=0.0,
            challenge_tags=case_study.challenge_tags,
            solution_tags=case_study.solution_tags,
            source_ref=f"case_studies.{case_id.lower()}",
        )
    )
    return {"success": True, "case_id": case_id, "message": "Case study added successfully"}


@app.post("/api/v1/pricing/scenarios")
async def get_pricing_scenarios(body: PricingScenariosRequest):
    """Pricing engine only — no LLM."""
    kb = get_kb(body.company_id)
    engine = PricingEngine(kb, corridor=body.corridor)
    try:
        services = kb.map_services_from_rfp(body.services)
        output = engine.compute(services, body.volume_estimates)
    except HaltError as e:
        raise HTTPException(
            status_code=422,
            detail={"halt_cause": e.cause.value, "message": e.message, "fix_path": e.fix_path},
        ) from e

    return {
        "pricing_hash": output.pricing_hash,
        "assumptions": output.assumptions,
        "scenarios": {
            name: {
                "total": s.total,
                "subtotal": s.subtotal,
                "margin_pct": s.margin_pct,
                "line_items": [li.__dict__ for li in s.line_items],
            }
            for name, s in output.scenarios.items()
        },
        "recommended": "balanced",
    }


@app.get("/api/v1/compliance/check")
async def check_compliance(certifications_required: str, company_id: str = "default"):
    kb = get_kb(company_id)
    checker = ComplianceChecker(kb)
    certs = [c.strip() for c in certifications_required.split(",") if c.strip()]
    req = RFPRequirements(
        client_name="Check",
        industry="General",
        pain_points=[],
        services_requested=[],
        geographic_coverage=[],
        volume_estimates={},
        mandatory_requirements=[],
        certifications_required=certs,
        submission_deadline="",
        evaluation_criteria={},
        budget_indicators=None,
        red_flags=[],
    )
    report = checker.run("run_2026-08-10_099", req)
    gap_count = report.mandatory_gap_count
    return {
        "mandatory_gap_count": gap_count,
        "checks": [
            {
                "id": c.id,
                "label": c.label,
                "status": c.status,
                "mandatory": c.mandatory,
                "validator_reason": c.validator_reason,
                "mitigation": c.mitigation,
                "source_ref": c.source_ref,
            }
            for c in report.checks
        ],
    }


@app.get("/api/v1/analytics/dashboard")
async def get_analytics(company_id: str = "default"):
    completed = [j for j in jobs_store.values() if j.get("status") == ProposalStatus.COMPLETED]
    halted = [j for j in jobs_store.values() if j.get("status") == ProposalStatus.HALTED]
    return {
        "company_id": company_id,
        "total_jobs": len(jobs_store),
        "completed": len(completed),
        "halted": len(halted),
        "note": "Full analytics dashboard planned for post-launch",
    }


@app.post("/api/v1/proposals/{job_id}/feedback")
async def submit_feedback(job_id: str, body: FeedbackRequest):
    if job_id not in jobs_store:
        raise HTTPException(status_code=404, detail="Job not found")
    jobs_store[job_id]["feedback"] = {
        "won": body.won,
        "feedback": body.feedback,
        "quality_score": body.quality_score,
        "submitted_at": datetime.now(timezone.utc).isoformat(),
    }
    return {"success": True, "message": "Feedback recorded."}


@app.delete("/api/v1/proposals/{job_id}")
async def delete_proposal(job_id: str):
    if job_id not in jobs_store:
        raise HTTPException(status_code=404, detail="Job not found")
    job = jobs_store[job_id]
    path = job.get("download_path")
    if path and os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            pass
    del jobs_store[job_id]
    return {"success": True, "message": "Proposal deleted successfully"}


@app.get("/api/v1/admin/jobs")
async def list_all_jobs(status: ProposalStatus | None = None, limit: int = 50):
    jobs = list(jobs_store.values())
    if status:
        jobs = [j for j in jobs if j["status"] == status]
    jobs.sort(key=lambda x: x["created_at"], reverse=True)
    return {"total": len(jobs), "jobs": jobs[:limit]}


def run() -> None:
    """CLI entry: uvicorn server."""
    import uvicorn

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    host = os.environ.get("API_HOST", "0.0.0.0")
    port = int(os.environ.get("API_PORT", "8000"))
    reload = os.environ.get("API_RELOAD", "false").lower() == "true"
    print("=" * 60)
    print("AI PROPOSALS AGENT™ API")
    print("=" * 60)
    print(f"Docs:    http://{host}:{port}/docs")
    print(f"Health:  http://{host}:{port}/")
    print("=" * 60)
    uvicorn.run("ai_proposals_agent.api.main:app", host=host, port=port, log_level="info", reload=reload)


if __name__ == "__main__":
    run()
