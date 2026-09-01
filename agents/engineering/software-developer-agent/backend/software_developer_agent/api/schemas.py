"""API schemas for Software Developer Agent™."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class JobStatusEnum(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    HALTED = "halted"
    FAILED = "failed"


class TierEnum(str, Enum):
    T0 = "T0"
    T1 = "T1"
    T2 = "T2"
    T3 = "T3"


class HealthCheck(BaseModel):
    status: str
    version: str
    timestamp: str
    api_available: bool
    mock_llm_default: bool


class DevTaskRequest(BaseModel):
    task_description: str = Field(..., min_length=10)
    repo_path: str = Field(default=".")
    mock_llm: bool = False


class DevJobResponse(BaseModel):
    job_id: str
    status: JobStatusEnum
    estimated_completion: str
    message: str


class DevTaskResult(BaseModel):
    job_id: str
    status: JobStatusEnum
    run_id: str | None = None
    task_id: str | None = None
    task_title: str | None = None
    tier: TierEnum | None = None
    review_recommendation: str | None = None
    review_score: int | None = None
    verification_status: str | None = None
    files_changed: int | None = None
    halt_cause: str | None = None
    error_message: str | None = None
    completed_at: str | None = None
