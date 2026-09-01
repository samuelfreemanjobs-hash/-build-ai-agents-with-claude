"""API schemas."""

from __future__ import annotations

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


class DesignRequest(BaseModel):
    problem_description: str = Field(..., min_length=10)
    repo_path: str = Field(default=".")
    mock_llm: bool = False


class DesignJobResponse(BaseModel):
    job_id: str
    status: JobStatusEnum
    estimated_completion: str
    message: str


class DesignResult(BaseModel):
    job_id: str
    status: JobStatusEnum
    run_id: str | None = None
    problem_id: str | None = None
    problem_title: str | None = None
    tier: str | None = None
    options_evaluated: int | None = None
    recommended_option: str | None = None
    review_recommendation: str | None = None
    review_score: int | None = None
    halt_cause: str | None = None
    error_message: str | None = None
    completed_at: str | None = None
