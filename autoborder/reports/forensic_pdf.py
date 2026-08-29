"""Forensic PDF generator — CBP audit-ready documentation."""

from __future__ import annotations

from datetime import UTC, datetime
from io import BytesIO
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from autoborder.models import ForensicReportRequest, GraphSnapshot, OriginStatus, RVCCalculationResult


class ForensicPDFGenerator:
    """
    Generate the 'Unrejectable' CBP audit document.

    Page 1: Executive summary
    Page 2: Graph visualization (color-coded nodes)
    Pages 3+: Trace table with ERP transaction IDs
    """

    COLOR_ROOT = colors.HexColor("#2563EB")
    COLOR_ORIGINATING = colors.HexColor("#16A34A")
    COLOR_NON_ORIGINATING = colors.HexColor("#DC2626")
    COLOR_UNKNOWN = colors.HexColor("#6B7280")

    def generate(self, request: ForensicReportRequest) -> bytes:
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75 * inch,
            leftMargin=0.75 * inch,
            topMargin=0.75 * inch,
            bottomMargin=0.75 * inch,
        )
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "Title",
            parent=styles["Heading1"],
            fontSize=18,
            spaceAfter=12,
        )
        body = styles["Normal"]

        story: list = []
        story.extend(self._executive_summary(request, title_style, body))
        story.append(Spacer(1, 0.3 * inch))
        story.extend(self._graph_section(request.graph, title_style, body))
        story.append(Spacer(1, 0.3 * inch))
        story.extend(self._trace_table(request.rvc_result, title_style))

        doc.build(story)
        return buffer.getvalue()

    def generate_to_file(self, request: ForensicReportRequest, output_path: Path) -> Path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(self.generate(request))
        return output_path

    def _executive_summary(self, request: ForensicReportRequest, title_style, body) -> list:
        rvc = request.rvc_result
        status = "COMPLIANT" if rvc.meets_usmca_threshold else "NON-COMPLIANT"
        duty_note = (
            "Qualifies for USMCA preferential treatment"
            if rvc.meets_usmca_threshold
            else "Does NOT meet USMCA RVC threshold — standard duty rates apply"
        )

        lines = [
            Paragraph("AutoBorder Comply — Forensic Audit Report", title_style),
            Paragraph(f"Client: {request.client_name}", body),
            Paragraph(f"Generated: {datetime.now(UTC).strftime('%Y-%m-%d %H:%M UTC')}", body),
            Spacer(1, 0.15 * inch),
            Paragraph("<b>Executive Summary</b>", body),
            Paragraph(f"Part Number: {rvc.part_number}", body),
            Paragraph(f"Description: {rvc.description}", body),
            Paragraph(f"<b>RVC Percentage: {rvc.rvc_percentage}%</b>", body),
            Paragraph(f"USMCA Threshold: {rvc.usmca_threshold}%", body),
            Paragraph(f"Compliance Status: <b>{status}</b>", body),
            Paragraph(f"Net Cost: ${rvc.net_cost:,.2f}", body),
            Paragraph(f"Non-Originating Materials: ${rvc.value_non_originating_materials:,.2f}", body),
            Paragraph(f"Determination: {duty_note}", body),
        ]
        if request.auditor_reference:
            lines.append(Paragraph(f"Auditor Reference: {request.auditor_reference}", body))
        return lines

    def _graph_section(self, graph: GraphSnapshot, title_style, body) -> list:
        rows = [["Part Number", "Description", "Origin", "Country", "Unit Cost", "ERP Txn ID"]]
        for node in sorted(graph.nodes, key=lambda n: n.part_number):
            color = self._origin_color(node.origin_status)
            origin_label = node.origin_status.value.replace("_", " ").title()
            rows.append(
                [
                    node.part_number,
                    node.description[:40],
                    origin_label,
                    node.origin_country or "—",
                    f"${node.unit_cost:,.2f}",
                    node.erp_transaction_id or "—",
                ]
            )

        table = Table(rows, colWidths=[0.9 * inch, 2.0 * inch, 1.1 * inch, 0.6 * inch, 0.8 * inch, 1.3 * inch])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
                ]
            )
        )

        legend_rows = [
            ["Color Key", "Meaning"],
            ["Blue", "Root finished part"],
            ["Green", "Originating component"],
            ["Red", "Non-originating component"],
        ]
        legend = Table(legend_rows, colWidths=[1.5 * inch, 3.0 * inch])
        legend.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 1), (0, 1), self.COLOR_ROOT),
                    ("BACKGROUND", (0, 2), (0, 2), self.COLOR_ORIGINATING),
                    ("BACKGROUND", (0, 3), (0, 3), self.COLOR_NON_ORIGINATING),
                    ("TEXTCOLOR", (0, 1), (0, 3), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ]
            )
        )

        return [
            Paragraph("<b>Supply Chain Graph — Origin Classification</b>", title_style),
            Paragraph(
                f"Root Part: {graph.root_part_number} | "
                f"Nodes: {len(graph.nodes)} | Edges: {len(graph.edges)}",
                body,
            ),
            Spacer(1, 0.1 * inch),
            legend,
            Spacer(1, 0.15 * inch),
            table,
        ]

    def _trace_table(self, rvc: RVCCalculationResult, title_style) -> list:
        rows = [
            [
                "Part #",
                "Description",
                "Origin",
                "Gross Cost",
                "Non-Orig. Value",
                "Net Contribution",
                "ERP Txn ID",
            ]
        ]
        for detail in rvc.component_details:
            rows.append(
                [
                    detail.part_number,
                    detail.description[:35],
                    detail.origin_status.value,
                    f"${detail.gross_cost:,.2f}",
                    f"${detail.non_originating_value:,.2f}",
                    f"${detail.net_cost_contribution:,.2f}",
                    detail.erp_transaction_id or "—",
                ]
            )

        table = Table(
            rows,
            colWidths=[0.75 * inch, 1.6 * inch, 0.9 * inch, 0.75 * inch, 0.85 * inch, 0.85 * inch, 1.2 * inch],
            repeatRows=1,
        )
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 7),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ]
            )
        )

        calc_lines = "<br/>".join(rvc.calculation_trace[:15])
        excluded = ", ".join(f"{c.description} (${c.amount:.2f})" for c in rvc.excluded_costs)

        return [
            Paragraph("<b>Cost Trace Table — Linked to ERP Transactions</b>", title_style),
            table,
            Spacer(1, 0.2 * inch),
            Paragraph(f"<b>Excluded from Net Cost:</b> {excluded or 'None'}", getSampleStyleSheet()["Normal"]),
            Spacer(1, 0.1 * inch),
            Paragraph(f"<b>Calculation Trace:</b><br/>{calc_lines}", getSampleStyleSheet()["Normal"]),
        ]

    def _origin_color(self, status: OriginStatus):
        if status == OriginStatus.ORIGINATING:
            return self.COLOR_ORIGINATING
        if status == OriginStatus.NON_ORIGINATING:
            return self.COLOR_NON_ORIGINATING
        return self.COLOR_UNKNOWN
