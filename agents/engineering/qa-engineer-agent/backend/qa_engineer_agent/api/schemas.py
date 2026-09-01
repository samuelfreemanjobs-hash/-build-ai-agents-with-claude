from enum import Enum

from pydantic import BaseModel, Field


class JobStatusEnum(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    HALTED = "halted"
    FAILED = "failed"


class HealthCheck(BaseModel):
    status: str
    version: str
    timestamp: str
    api_available: bool
    mock_llm_default: bool


class QARequest(BaseModel):
    description: str = Field(..., min_length=10)
    mock_llm: bool = False


class QAJobResponse(BaseModel):
    job_id: str
    status: JobStatusEnum
    estimated_completion: str
    message: str


class QAResult(BaseModel):
    job_id: str
    status: JobStatusEnum
    run_id: str | None = None
    release_name: str | None = None
    output_type: str | None = None
    coverage_pct: float | None = None
    risk_level: str | None = None
    readiness_score: int | None = None
    readiness_recommendation: str | None = None
    halt_cause: str | None = None
    error_message: str | None = None
    completed_at: str | None = None
