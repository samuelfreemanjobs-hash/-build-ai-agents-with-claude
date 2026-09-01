"""Pydantic models for FastAPI."""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class PricingTierEnum(str, Enum):
    COMPETITIVE = "competitive"
    BALANCED = "balanced"
    PREMIUM = "premium"


class ProposalStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    HALTED = "halted"
    FAILED = "failed"


class ProposalRequest(BaseModel):
    rfp_text: str = Field(..., description="Full text of the RFP document")
    pricing_tier: PricingTierEnum = Field(default=PricingTierEnum.BALANCED)
    company_id: str = Field(default="default", description="Company ID for knowledge base")
    corridor: str = Field(default="DEFAULT", description="Pricing corridor (e.g. DET-WARREN)")
    priority: bool = Field(default=False, description="Priority processing flag")
    mock_llm: bool = Field(
        default=False,
        description="Use mock LLM (no Anthropic API key required)",
    )


class ProposalJobResponse(BaseModel):
    job_id: str
    status: ProposalStatus
    estimated_completion: str
    message: str


class ProposalResult(BaseModel):
    job_id: str
    status: ProposalStatus
    proposal_id: str | None = None
    run_id: str | None = None
    client_name: str | None = None
    total_value: str | None = Field(None, description="Decimal string from pricing engine")
    pricing_hash: str | None = None
    qa_overall: int | None = None
    confidence_score: float | None = None
    generated_date: str | None = None
    download_url: str | None = None
    sections_preview: dict[str, Any] | None = None
    qa_report: dict[str, Any] | None = None
    compliance_gaps: int | None = None
    halt_cause: str | None = None
    error_message: str | None = None


class CaseStudyUpload(BaseModel):
    client_name: str
    industry: str
    challenge: str
    solution: str
    results: list[str]
    challenge_tags: list[str] = Field(default_factory=list)
    solution_tags: list[str] = Field(default_factory=list)


class HealthCheck(BaseModel):
    status: str
    version: str
    timestamp: str
    api_available: bool
    knowledge_base_status: str
    mock_llm_default: bool


class PricingScenariosRequest(BaseModel):
    services: list[str]
    volume_estimates: dict[str, str] = Field(default_factory=lambda: {"volume": "1000"})
    corridor: str = "DEFAULT"
    company_id: str = "default"


class FeedbackRequest(BaseModel):
    won: bool
    feedback: str | None = None
    quality_score: int | None = Field(None, ge=1, le=10)
