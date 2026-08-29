"""Domain models for BOM trees and RVC calculations."""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class OriginStatus(str, Enum):
    ORIGINATING = "originating"
    NON_ORIGINATING = "non_originating"
    UNKNOWN = "unknown"


class CostLineItem(BaseModel):
    """Single cost line from ERP with audit trail."""

    line_id: str
    description: str
    amount: float
    currency: str = "USD"
    category: str = "material"
    erp_transaction_id: str | None = None
    excluded_from_net_cost: bool = False
    exclusion_reason: str | None = None


class BOMComponent(BaseModel):
    """Recursive BOM node extracted from ERP."""

    part_number: str
    description: str
    quantity: float = 1.0
    unit: str = "EA"
    unit_cost: float = 0.0
    currency: str = "USD"
    origin_country: str | None = None
    origin_status: OriginStatus = OriginStatus.UNKNOWN
    originating_content_pct: float | None = None
    erp_transaction_id: str | None = None
    cost_lines: list[CostLineItem] = Field(default_factory=list)
    children: list[BOMComponent] = Field(default_factory=list)

    @property
    def extended_cost(self) -> float:
        return self.unit_cost * self.quantity


class BOMTree(BaseModel):
    """Full cost-rollup tree for a finished part."""

    root_part_number: str
    description: str
    plant: str = "1000"
    extraction_source: str = "mock"
    extracted_at: str | None = None
    root: BOMComponent
    metadata: dict[str, Any] = Field(default_factory=dict)


class GraphNode(BaseModel):
    part_number: str
    description: str
    origin_status: OriginStatus
    origin_country: str | None = None
    unit_cost: float
    originating_content_pct: float | None = None
    erp_transaction_id: str | None = None


class GraphEdge(BaseModel):
    parent_part_number: str
    child_part_number: str
    quantity: float
    unit_cost: float
    extended_cost: float
    erp_transaction_id: str | None = None


class GraphSnapshot(BaseModel):
    root_part_number: str
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class VisualizationNode(BaseModel):
    id: str
    label: str
    description: str
    origin_status: OriginStatus
    origin_country: str | None = None
    unit_cost: float
    originating_content_pct: float | None = None
    erp_transaction_id: str | None = None
    is_root: bool = False
    depth: int = 0
    color: str
    non_originating_cost: float = 0.0


class VisualizationEdge(BaseModel):
    id: str
    source: str
    target: str
    quantity: float
    unit_cost: float
    extended_cost: float
    erp_transaction_id: str | None = None


class NonOriginatingPath(BaseModel):
    path_id: str
    node_ids: list[str]
    labels: list[str]
    total_extended_cost: float
    headline: str


class GraphVisualizationPayload(BaseModel):
    root_part_number: str
    part_description: str
    nodes: list[VisualizationNode]
    edges: list[VisualizationEdge]
    max_depth: int
    non_originating_paths: list[NonOriginatingPath]
    rvc_percentage: float
    meets_usmca_threshold: bool
    net_cost: float
    value_non_originating_materials: float
    storage: str = "in-memory"


class CostExtractionResult(BaseModel):
    """Structured output from LLM/heuristic cost sheet extraction."""

    material_cost: float | None = None
    packing_cost: float | None = None
    warranty_cost: float | None = None
    royalty_cost: float | None = None
    tooling_amortization: float | None = None
    other_costs: dict[str, float] = Field(default_factory=dict)
    confidence_score: float = 0.0
    flagged_fields: list[str] = Field(default_factory=list)
    raw_notes: str | None = None


class ComponentRVCDetail(BaseModel):
    part_number: str
    description: str
    origin_status: OriginStatus
    gross_cost: float
    non_originating_value: float
    net_cost_contribution: float
    originating_content_pct: float | None = None
    erp_transaction_id: str | None = None


class RVCCalculationResult(BaseModel):
    """Deterministic USMCA Annex 4-B RVC output."""

    part_number: str
    description: str
    net_cost: float
    value_non_originating_materials: float
    rvc_percentage: float
    meets_usmca_threshold: bool
    usmca_threshold: float = 75.0
    method: str = "build-down"
    component_details: list[ComponentRVCDetail]
    excluded_costs: list[CostLineItem] = Field(default_factory=list)
    calculation_trace: list[str] = Field(default_factory=list)


class ForensicReportRequest(BaseModel):
    bom: BOMTree
    rvc_result: RVCCalculationResult
    graph: GraphSnapshot
    client_name: str = "Design Partner"
    auditor_reference: str | None = None


class InsuranceQuoteRequest(BaseModel):
    client_name: str
    part_number: str
    rvc_percentage: float
    coverage_limit_usd: float = 500_000.0


class InsuranceQuoteResponse(BaseModel):
    premium_monthly_usd: float
    coverage_limit_usd: float
    policy_reference: str
    status: str = "quoted"


class TariffLeakInput(BaseModel):
    company_name: str
    contact_name: str
    contact_email: str
    quarterly_units: int = 1000
    mfn_duty_rate_pct: float = 6.5
    claimed_usmca_preferential: bool = False
    paid_mfn_duty: bool = True


class LeakLineItem(BaseModel):
    category: str
    description: str
    amount_usd: float


class TariffLeakResult(BaseModel):
    report_id: str
    company_name: str
    part_number: str
    part_description: str
    rvc_percentage: float
    meets_usmca_threshold: bool
    net_cost_per_unit: float
    quarterly_import_value: float
    mfn_duty_rate_pct: float
    usmca_duty_rate_pct: float
    duty_paid_last_quarter: float
    duty_should_have_paid: float
    overpaid_last_quarter: float
    annual_savings_potential: float
    penalty_exposure: float
    leak_type: str
    headline: str
    recommendation: str
    top_leaks: list[LeakLineItem]
    non_originating_paths: list[NonOriginatingPath]
    rvc_result: RVCCalculationResult


class SavingsReportDelivery(BaseModel):
    report_id: str
    recipient_email: str
    status: str
    message: str
