"""FastAPI gateway for AutoBorder Comply MVP."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import HTMLResponse, Response
from fastapi.staticfiles import StaticFiles

from autoborder.config.settings import get_settings
from autoborder.connectors.sap_connector import SAPConnector
from autoborder.engine.usmca_calculator import USMCACalculator
from autoborder.extractors.llm_extractor import LLMCostExtractor
from autoborder.graph.neo4j_mapper import Neo4jGraphMapper
from autoborder.graph.traversal import GraphTraversalService
from autoborder.models import (
    CostExtractionResult,
    ForensicReportRequest,
    GraphVisualizationPayload,
    InsuranceQuoteRequest,
    InsuranceQuoteResponse,
    RVCCalculationResult,
)
from autoborder.reports.forensic_pdf import ForensicPDFGenerator
from autoborder.services.insurance import InsuranceMGUClient

WEB_DIR = Path(__file__).resolve().parent.parent / "web"

app = FastAPI(
    title="AutoBorder Comply",
    description="USMCA Regional Value Content calculation API — the Stripe for Tariffs",
    version="0.1.0",
)

settings = get_settings()
sap = SAPConnector(settings)
calculator = USMCACalculator()
graph_mapper = Neo4jGraphMapper(
    uri=settings.neo4j_uri,
    user=settings.neo4j_user,
    password=settings.neo4j_password,
)
pdf_generator = ForensicPDFGenerator()
extractor = LLMCostExtractor(settings)
insurance_client = InsuranceMGUClient(
    api_url=settings.insurance_mgu_api_url,
    api_key=settings.insurance_mgu_api_key,
)

if (WEB_DIR / "static").is_dir():
    app.mount("/static", StaticFiles(directory=WEB_DIR / "static"), name="static")


def _load_part_context(part_number: str, plant: str):
    bom = sap.extract_bom(part_number, plant)
    snapshot = graph_mapper.build_snapshot(bom)
    rvc = calculator.calculate(bom)
    return bom, snapshot, rvc


@app.get("/", response_class=HTMLResponse)
def demo_ui() -> HTMLResponse:
    """Call 2 sales demo — interactive supply chain graph visualization."""
    index_path = WEB_DIR / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Demo UI not found")
    return HTMLResponse(index_path.read_text(encoding="utf-8"))


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "version": "0.1.0",
        "sap": sap.health_check(),
        "neo4j": "connected" if settings.neo4j_enabled else "in-memory",
    }


@app.get("/bom/{part_number}")
def extract_bom(part_number: str, plant: str = "1000") -> dict:
    try:
        bom = sap.extract_bom(part_number, plant)
        return bom.model_dump()
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/rvc/{part_number}", response_model=RVCCalculationResult)
def calculate_rvc(part_number: str, plant: str = "1000") -> RVCCalculationResult:
    try:
        bom = sap.extract_bom(part_number, plant)
        return calculator.calculate(bom)
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/graph/{part_number}/visualization", response_model=GraphVisualizationPayload)
def graph_visualization(part_number: str, plant: str = "1000") -> GraphVisualizationPayload:
    """Interactive graph payload for Call 2 sales demo UI."""
    try:
        bom, snapshot, rvc = _load_part_context(part_number, plant)
        graph_mapper.load_to_neo4j(bom)
        traversal = GraphTraversalService(snapshot)
        return traversal.build_visualization(
            rvc=rvc,
            storage="neo4j" if settings.neo4j_enabled else "in-memory",
            part_description=bom.description,
        )
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/graph/{part_number}/paths")
def non_originating_paths(part_number: str, plant: str = "1000") -> dict:
    """Root-to-component paths through non-originating supply chain nodes."""
    try:
        bom, snapshot, _ = _load_part_context(part_number, plant)
        traversal = GraphTraversalService(snapshot)
        paths = traversal.find_non_originating_paths()
        return {
            "root_part_number": part_number,
            "path_count": len(paths),
            "paths": [path.model_dump() for path in paths],
        }
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/graph/{part_number}/traverse")
def traverse_graph(part_number: str, plant: str = "1000", depth: int | None = None) -> dict:
    """BFS graph traversal with optional depth filter."""
    try:
        bom, snapshot, _ = _load_part_context(part_number, plant)
        traversal = GraphTraversalService(snapshot)
        depths = traversal.bfs_depths()
        if depth is not None:
            nodes = traversal.nodes_at_depth(depth)
        else:
            nodes = list(depths.keys())
        return {
            "root_part_number": part_number,
            "max_depth": traversal.max_depth(),
            "depths": depths,
            "nodes": nodes,
        }
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/graph/{part_number}")
def build_graph(part_number: str, plant: str = "1000") -> dict:
    try:
        bom = sap.extract_bom(part_number, plant)
        snapshot = graph_mapper.load_to_neo4j(bom)
        cypher = graph_mapper.generate_cypher(bom)
        return {
            "snapshot": snapshot.model_dump(),
            "max_depth": graph_mapper.traverse_bom_depth(part_number),
            "cypher_statements": len(cypher),
            "storage": "neo4j" if settings.neo4j_enabled else "in-memory",
        }
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/forensic-pdf/{part_number}")
def forensic_pdf(part_number: str, plant: str = "1000", client: str = "Design Partner") -> Response:
    try:
        bom = sap.extract_bom(part_number, plant)
        rvc = calculator.calculate(bom)
        graph = graph_mapper.build_snapshot(bom)
        request = ForensicReportRequest(
            bom=bom,
            rvc_result=rvc,
            graph=graph,
            client_name=client,
        )
        pdf_bytes = pdf_generator.generate(request)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=forensic_{part_number}.pdf"},
        )
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/extract-costs", response_model=CostExtractionResult)
async def extract_costs(
    raw_text: str | None = None,
    part_number: str | None = None,
    file: UploadFile | None = File(default=None),
) -> CostExtractionResult:
    text = raw_text or ""
    if file is not None:
        content = await file.read()
        text = content.decode("utf-8", errors="replace")
    if not text.strip():
        raise HTTPException(status_code=400, detail="Provide raw_text or upload a file")
    return extractor.extract(text, part_number)


@app.post("/insurance/quote", response_model=InsuranceQuoteResponse)
def insurance_quote(request: InsuranceQuoteRequest) -> InsuranceQuoteResponse:
    return insurance_client.quote(request)


@app.post("/pipeline/{part_number}")
def full_pipeline(part_number: str, plant: str = "1000", client: str = "Design Partner") -> dict:
    """End-to-end: ERP extract → graph → RVC → forensic PDF metadata."""
    bom = sap.extract_bom(part_number, plant)
    graph = graph_mapper.build_snapshot(bom)
    rvc = calculator.calculate(bom)
    insurance = insurance_client.quote(
        InsuranceQuoteRequest(
            client_name=client,
            part_number=part_number,
            rvc_percentage=rvc.rvc_percentage,
        )
    )
    return {
        "part_number": part_number,
        "rvc_percentage": rvc.rvc_percentage,
        "meets_usmca_threshold": rvc.meets_usmca_threshold,
        "net_cost": rvc.net_cost,
        "graph_nodes": len(graph.nodes),
        "graph_depth": graph_mapper.traverse_bom_depth(part_number),
        "insurance_premium_monthly": insurance.premium_monthly_usd,
        "forensic_pdf_url": f"/forensic-pdf/{part_number}?client={client}",
    }
