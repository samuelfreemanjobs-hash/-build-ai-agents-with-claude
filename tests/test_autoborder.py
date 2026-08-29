"""AutoBorder Comply test suite."""

from autoborder.connectors.sap_connector import SAPConnector
from autoborder.engine.usmca_calculator import USMCACalculator
from autoborder.extractors.llm_extractor import LLMCostExtractor
from autoborder.graph.neo4j_mapper import Neo4jGraphMapper
from autoborder.models import ForensicReportRequest, InsuranceQuoteRequest, OriginStatus
from autoborder.reports.forensic_pdf import ForensicPDFGenerator
from autoborder.services.insurance import InsuranceMGUClient


def test_sap_mock_extraction():
    connector = SAPConnector()
    bom = connector.extract_bom("12345")
    assert bom.root_part_number == "12345"
    assert bom.root.description.startswith("Brake Rotor")
    assert len(bom.root.children) >= 4


def test_neo4j_graph_depth():
    connector = SAPConnector()
    bom = connector.extract_bom("12345")
    mapper = Neo4jGraphMapper()
    snapshot = mapper.build_snapshot(bom)
    depth = mapper.traverse_bom_depth("12345")
    assert len(snapshot.nodes) >= 10
    assert len(snapshot.edges) >= 9
    assert depth >= 3


def test_cypher_generation():
    connector = SAPConnector()
    bom = connector.extract_bom("12345")
    mapper = Neo4jGraphMapper()
    statements = mapper.generate_cypher(bom)
    assert any("CREATE (n:Part" in s for s in statements)
    assert any("CONTAINS" in s for s in statements)


def test_usmca_rvc_calculation():
    connector = SAPConnector()
    bom = connector.extract_bom("12345")
    result = USMCACalculator().calculate(bom)
    assert result.net_cost > 0
    assert result.value_non_originating_materials > 0
    assert 0 < result.rvc_percentage <= 100
    assert isinstance(result.meets_usmca_threshold, bool)
    assert result.method == "build-down"


def test_tracing_partial_originating():
    connector = SAPConnector()
    bom = connector.extract_bom("12345")
    coating = next(c for c in bom.root.children if c.part_number == "12345-04")
    calc = USMCACalculator()
    non_orig = calc.trace_subcomponent(coating, originating_pct=60.0)
    assert abs(non_orig - coating.extended_cost * 0.4) < 0.01


def test_excluded_costs():
    connector = SAPConnector()
    bom = connector.extract_bom("12345")
    result = USMCACalculator().calculate(bom)
    excluded_categories = {c.category for c in result.excluded_costs}
    assert "packing" in excluded_categories
    assert "warranty" in excluded_categories


def test_llm_heuristic_extraction():
    sample = (
        "Material Cost: $52,000.00\n"
        "Packing materials: $2,100.00\n"
        "Warranty reserve: $1,250.00\n"
        "Lump-sum tooling amortization: $8,400.00\n"
    )
    result = LLMCostExtractor().extract(sample)
    assert result.material_cost == 52000.0
    assert result.packing_cost == 2100.0
    assert result.warranty_cost == 1250.0
    assert result.tooling_amortization == 8400.0


def test_forensic_pdf_generation():
    connector = SAPConnector()
    bom = connector.extract_bom("12345")
    mapper = Neo4jGraphMapper()
    graph = mapper.build_snapshot(bom)
    rvc = USMCACalculator().calculate(bom)
    request = ForensicReportRequest(bom=bom, rvc_result=rvc, graph=graph)
    pdf_bytes = ForensicPDFGenerator().generate(request)
    assert pdf_bytes[:4] == b"%PDF"
    assert len(pdf_bytes) > 5000


def test_insurance_quote():
    quote = InsuranceMGUClient().quote(
        InsuranceQuoteRequest(
            client_name="Test Supplier",
            part_number="12345",
            rvc_percentage=74.3,
        )
    )
    assert quote.premium_monthly_usd == 1275.0
    assert quote.coverage_limit_usd == 500_000.0


def test_origin_classification_in_mock_data():
    connector = SAPConnector()
    bom = connector.extract_bom("12345")
    bearing = next(c for c in bom.root.children if c.part_number == "12345-03")
    assert bearing.origin_status == OriginStatus.NON_ORIGINATING
    assert bearing.origin_country == "CN"
