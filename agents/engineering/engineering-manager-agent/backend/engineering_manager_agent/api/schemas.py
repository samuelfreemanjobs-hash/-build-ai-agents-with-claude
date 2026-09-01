from enum import Enum
from pydantic import BaseModel, Field

class JobStatusEnum(str, Enum):
    PENDING, RUNNING, COMPLETED, HALTED, FAILED = "pending", "running", "completed", "halted", "failed"

class HealthCheck(BaseModel):
    status: str; version: str; timestamp: str; api_available: bool; mock_llm_default: bool

class ManagementRequest(BaseModel):
    description: str = Field(..., min_length=10)
    mock_llm: bool = False

class ManagementJobResponse(BaseModel):
    job_id: str; status: JobStatusEnum; estimated_completion: str; message: str

class ManagementResult(BaseModel):
    job_id: str; status: JobStatusEnum
    run_id: str | None = None; team_name: str | None = None; output_type: str | None = None
    capacity_utilization: float | None = None; governance_score: int | None = None
    governance_recommendation: str | None = None
    halt_cause: str | None = None; error_message: str | None = None; completed_at: str | None = None
