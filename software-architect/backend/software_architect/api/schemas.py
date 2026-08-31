from enum import Enum
from pydantic import BaseModel, Field


class JobStatusEnum(str, Enum):
    PENDING, RUNNING, COMPLETED, HALTED, FAILED = "pending", "running", "completed", "halted", "failed"


class HealthCheck(BaseModel):
    status: str; version: str; timestamp: str; api_available: bool; mock_llm_default: bool


class ArchitectureRequest(BaseModel):
    description: str = Field(..., min_length=10)
    repo_path: str = "."
    mock_llm: bool = False


class ArchitectureJobResponse(BaseModel):
    job_id: str; status: JobStatusEnum; estimated_completion: str; message: str


class ArchitectureResult(BaseModel):
    job_id: str; status: JobStatusEnum
    run_id: str | None = None; system_name: str | None = None; tier: str | None = None
    c4_levels: list[str] | None = None; governance_score: int | None = None
    governance_recommendation: str | None = None
    halt_cause: str | None = None; error_message: str | None = None; completed_at: str | None = None
