"""AutoBorder Comply CLI — Week 1-12 deliverable runner."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from autoborder.config.settings import get_settings
from autoborder.connectors.sap_connector import SAPConnector
from autoborder.engine.usmca_calculator import USMCACalculator
from autoborder.extractors.llm_extractor import LLMCostExtractor
from autoborder.graph.neo4j_mapper import Neo4jGraphMapper
from autoborder.models import ForensicReportRequest, InsuranceQuoteRequest
from autoborder.reports.forensic_pdf import ForensicPDFGenerator
from autoborder.services.insurance import InsuranceMGUClient


def cmd_extract(args: argparse.Namespace) -> int:
    settings = get_settings()
    connector = SAPConnector(settings)
    bom = connector.extract_bom(args.part_number, args.plant)

    output = Path(args.output) if args.output else Path(f"bom_{args.part_number}.json")
    connector.export_json(bom, output)
    print(f"BOM extracted → {output}")
    print(f"  Part: {bom.root_part_number} — {bom.description}")
    print(f"  Source: {bom.extraction_source}")
    return 0


def cmd_graph(args: argparse.Namespace) -> int:
    settings = get_settings()
    connector = SAPConnector(settings)
    bom = connector.extract_bom(args.part_number, args.plant)

    mapper = Neo4jGraphMapper(
        uri=settings.neo4j_uri,
        user=settings.neo4j_user,
        password=settings.neo4j_password,
    )
    snapshot = mapper.load_to_neo4j(bom)
    depth = mapper.traverse_bom_depth(args.part_number)

    if args.cypher:
        cypher_path = Path(args.cypher)
        cypher_path.write_text("\n".join(mapper.generate_cypher(bom)), encoding="utf-8")
        print(f"Cypher script → {cypher_path}")

    print(f"Graph built: {len(snapshot.nodes)} nodes, {len(snapshot.edges)} edges, depth={depth}")
    storage = "Neo4j AuraDB" if settings.neo4j_enabled else "in-memory"
    print(f"  Storage: {storage}")
    return 0


def cmd_rvc(args: argparse.Namespace) -> int:
    settings = get_settings()
    connector = SAPConnector(settings)
    bom = connector.extract_bom(args.part_number, args.plant)
    result = USMCACalculator(usmca_threshold=args.threshold).calculate(bom)

    print(f"\n{'=' * 50}")
    print(f"  USMCA RVC — Part {result.part_number}")
    print(f"{'=' * 50}")
    print(f"  Description:     {result.description}")
    print(f"  Net Cost:        ${result.net_cost:,.2f}")
    print(f"  Non-Orig. Value: ${result.value_non_originating_materials:,.2f}")
    print(f"  RVC:             {result.rvc_percentage}%")
    print(f"  Threshold:       {result.usmca_threshold}%")
    print(f"  Status:          {'COMPLIANT ✓' if result.meets_usmca_threshold else 'NON-COMPLIANT ✗'}")
    print(f"{'=' * 50}\n")

    if args.verbose:
        for line in result.calculation_trace:
            print(f"  {line}")

    if args.json:
        Path(args.json).write_text(result.model_dump_json(indent=2), encoding="utf-8")
        print(f"JSON → {args.json}")

    return 0


def cmd_forensic(args: argparse.Namespace) -> int:
    settings = get_settings()
    connector = SAPConnector(settings)
    bom = connector.extract_bom(args.part_number, args.plant)
    calculator = USMCACalculator()
    rvc = calculator.calculate(bom)

    mapper = Neo4jGraphMapper()
    graph = mapper.build_snapshot(bom)

    request = ForensicReportRequest(
        bom=bom,
        rvc_result=rvc,
        graph=graph,
        client_name=args.client,
    )
    output = Path(args.output) if args.output else Path(f"forensic_{args.part_number}.pdf")
    ForensicPDFGenerator().generate_to_file(request, output)

    print(f"Forensic PDF → {output}")
    print(f"  RVC: {rvc.rvc_percentage}% | Pages: executive summary + graph + trace table")
    return 0


def cmd_extract_costs(args: argparse.Namespace) -> int:
    text = Path(args.file).read_text(encoding="utf-8")
    result = LLMCostExtractor(get_settings()).extract(text, args.part_number)
    print(json.dumps(result.model_dump(), indent=2))
    if result.flagged_fields:
        print(f"\n⚠ Human review required: {', '.join(result.flagged_fields)}", file=sys.stderr)
    return 0


def cmd_pipeline(args: argparse.Namespace) -> int:
    settings = get_settings()
    connector = SAPConnector(settings)
    bom = connector.extract_bom(args.part_number, args.plant)

    mapper = Neo4jGraphMapper(
        uri=settings.neo4j_uri,
        user=settings.neo4j_user,
        password=settings.neo4j_password,
    )
    graph = mapper.build_snapshot(bom)
    rvc = USMCACalculator().calculate(bom)
    insurance = InsuranceMGUClient().quote(
        InsuranceQuoteRequest(
            client_name=args.client,
            part_number=args.part_number,
            rvc_percentage=rvc.rvc_percentage,
        )
    )

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    connector.export_json(bom, output_dir / f"bom_{args.part_number}.json")
    (output_dir / f"graph_{args.part_number}.cypher").write_text(
        "\n".join(mapper.generate_cypher(bom)), encoding="utf-8"
    )
    (output_dir / f"rvc_{args.part_number}.json").write_text(
        rvc.model_dump_json(indent=2), encoding="utf-8"
    )
    ForensicPDFGenerator().generate_to_file(
        ForensicReportRequest(bom=bom, rvc_result=rvc, graph=graph, client_name=args.client),
        output_dir / f"forensic_{args.part_number}.pdf",
    )

    print(f"\nPipeline complete → {output_dir}/")
    print(f"  RVC: {rvc.rvc_percentage}% ({'COMPLIANT' if rvc.meets_usmca_threshold else 'NON-COMPLIANT'})")
    print(f"  Graph: {len(graph.nodes)} nodes, depth {mapper.traverse_bom_depth(args.part_number)}")
    print(f"  Insurance premium: ${insurance.premium_monthly_usd}/mo")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="autoborder",
        description="AutoBorder Comply — USMCA RVC calculation platform",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_extract = sub.add_parser("extract", help="Extract BOM from SAP (mock or live)")
    p_extract.add_argument("part_number", default="12345", nargs="?")
    p_extract.add_argument("--plant", default="1000")
    p_extract.add_argument("-o", "--output")
    p_extract.set_defaults(func=cmd_extract)

    p_graph = sub.add_parser("graph", help="Build Neo4j supply chain graph")
    p_graph.add_argument("part_number", default="12345", nargs="?")
    p_graph.add_argument("--plant", default="1000")
    p_graph.add_argument("--cypher", help="Write Cypher script to file")
    p_graph.set_defaults(func=cmd_graph)

    p_rvc = sub.add_parser("rvc", help="Calculate USMCA RVC percentage")
    p_rvc.add_argument("part_number", default="12345", nargs="?")
    p_rvc.add_argument("--plant", default="1000")
    p_rvc.add_argument("--threshold", type=float, default=75.0)
    p_rvc.add_argument("-v", "--verbose", action="store_true")
    p_rvc.add_argument("--json")
    p_rvc.set_defaults(func=cmd_rvc)

    p_forensic = sub.add_parser("forensic", help="Generate CBP audit PDF")
    p_forensic.add_argument("part_number", default="12345", nargs="?")
    p_forensic.add_argument("--plant", default="1000")
    p_forensic.add_argument("--client", default="Design Partner")
    p_forensic.add_argument("-o", "--output")
    p_forensic.set_defaults(func=cmd_forensic)

    p_costs = sub.add_parser("extract-costs", help="Extract costs from messy spreadsheet text")
    p_costs.add_argument("file")
    p_costs.add_argument("--part-number")
    p_costs.set_defaults(func=cmd_extract_costs)

    p_pipeline = sub.add_parser("pipeline", help="Run full Week 1-12 pipeline")
    p_pipeline.add_argument("part_number", default="12345", nargs="?")
    p_pipeline.add_argument("--plant", default="1000")
    p_pipeline.add_argument("--client", default="Design Partner")
    p_pipeline.add_argument("-d", "--output-dir", default="./output")
    p_pipeline.set_defaults(func=cmd_pipeline)

    args = parser.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
