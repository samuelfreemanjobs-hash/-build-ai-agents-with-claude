"""Savings Report — CFO-ready HTML and PDF output for Tariff Leak Calculator."""

from __future__ import annotations

from datetime import UTC, datetime
from io import BytesIO
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from autoborder.models import TariffLeakResult

REPORT_STORE: dict[str, TariffLeakResult] = {}


class SavingsReportGenerator:
    """Generate beautifully designed Savings Reports for CFO handoff."""

    def store(self, result: TariffLeakResult) -> TariffLeakResult:
        REPORT_STORE[result.report_id] = result
        return result

    def get(self, report_id: str) -> TariffLeakResult | None:
        return REPORT_STORE.get(report_id.upper())

    def render_html(self, result: TariffLeakResult) -> str:
        generated = datetime.now(UTC).strftime("%B %d, %Y")
        leak_rows = "".join(
            f"<tr><td>{item.category.replace('_', ' ').title()}</td>"
            f"<td>{item.description}</td>"
            f"<td class='amount'>${item.amount_usd:,.0f}</td></tr>"
            for item in result.top_leaks
        )
        path_rows = "".join(
            f"<li><strong>{path.headline}</strong><br>"
            f"<span class='muted'>{' → '.join(path.labels)}</span></li>"
            for path in result.non_originating_paths[:3]
        )
        status_class = "good" if result.meets_usmca_threshold else "bad"
        status_color = "#16a34a" if result.meets_usmca_threshold else "#dc2626"
        hero_metric = (
            f"${result.overpaid_last_quarter:,.0f}"
            if result.overpaid_last_quarter > 0
            else f"${result.penalty_exposure:,.0f}"
        )
        hero_label = (
            "Overpaid Last Quarter"
            if result.overpaid_last_quarter > 0
            else "Penalty Exposure"
            if result.penalty_exposure > 0
            else "Annual Savings Potential"
        )
        secondary = result.annual_savings_potential if result.overpaid_last_quarter > 0 else 0

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Savings Report — {result.company_name}</title>
  <style>
    body {{ font-family: Georgia, 'Times New Roman', serif; background: #f8fafc; color: #0f172a; margin: 0; }}
    .wrap {{ max-width: 680px; margin: 0 auto; background: #fff; }}
    .header {{ background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #fff; padding: 2.5rem 2rem; }}
    .header h1 {{ margin: 0 0 0.25rem; font-size: 1.5rem; font-weight: 400; }}
    .header .brand {{ font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.85; }}
    .hero {{ text-align: center; padding: 2.5rem 2rem; border-bottom: 3px solid #2563eb; }}
    .hero .metric {{ font-size: 3rem; font-weight: 700; color: #dc2626; line-height: 1; }}
    .hero .label {{ font-size: 0.9rem; color: #64748b; margin-top: 0.5rem; text-transform: uppercase; letter-spacing: 0.08em; }}
    .hero .headline {{ font-size: 1.15rem; margin-top: 1rem; color: #334155; }}
    .body {{ padding: 2rem; }}
    h2 {{ font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }}
    .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0; }}
    .card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }}
    .card dt {{ font-size: 0.75rem; color: #64748b; text-transform: uppercase; }}
    .card dd {{ font-size: 1.25rem; font-weight: 700; margin: 0.25rem 0 0; }}
    .card dd.{status_class} {{ color: {status_color}; }}
    table {{ width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }}
    th {{ background: #1e293b; color: #fff; text-align: left; padding: 0.6rem; font-size: 0.75rem; text-transform: uppercase; }}
    td {{ padding: 0.6rem; border-bottom: 1px solid #e2e8f0; }}
    td.amount {{ text-align: right; font-weight: 600; color: #dc2626; }}
    ul {{ padding-left: 1.2rem; }}
    li {{ margin-bottom: 0.75rem; }}
    .muted {{ color: #64748b; font-size: 0.85rem; }}
    .cta {{ background: #2563eb; color: #fff; text-align: center; padding: 2rem; }}
    .cta a {{ color: #fff; font-weight: 700; font-size: 1.1rem; text-decoration: none; }}
    .footer {{ padding: 1.5rem 2rem; font-size: 0.75rem; color: #94a3b8; text-align: center; }}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="brand">AutoBorder Comply — Savings Report</div>
      <h1>{result.company_name}</h1>
      <p>Part {result.part_number} · {result.part_description}</p>
    </div>
    <div class="hero">
      <div class="metric">{hero_metric}</div>
      <div class="label">{hero_label}</div>
      <p class="headline">{result.headline}</p>
      {"<p class='muted'>Annual savings potential: $" + f"{secondary:,.0f}" + "</p>" if secondary else ""}
    </div>
    <div class="body">
      <h2>Compliance Snapshot</h2>
      <div class="grid">
        <div class="card"><dt>RVC Calculated</dt><dd class="{status_class}">{result.rvc_percentage}%</dd></div>
        <div class="card"><dt>USMCA Threshold</dt><dd>75.0%</dd></div>
        <div class="card"><dt>Net Cost / Unit</dt><dd>${result.net_cost_per_unit:,.2f}</dd></div>
        <div class="card"><dt>Quarterly Import Value</dt><dd>${result.quarterly_import_value:,.0f}</dd></div>
        <div class="card"><dt>Duty Paid (MFN {result.mfn_duty_rate_pct}%)</dt><dd>${result.duty_paid_last_quarter:,.0f}</dd></div>
        <div class="card"><dt>Should Have Paid (USMCA)</dt><dd>${result.duty_should_have_paid:,.0f}</dd></div>
      </div>
      <h2>Top Tariff Leaks</h2>
      <table>
        <tr><th>Category</th><th>Description</th><th>Quarterly Impact</th></tr>
        {leak_rows or "<tr><td colspan='3'>No leaks detected</td></tr>"}
      </table>
      <h2>Non-Originating Supply Chain Paths</h2>
      <ul>{path_rows or "<li>No risk paths</li>"}</ul>
      <p><strong>Recommendation:</strong> {result.recommendation}</p>
    </div>
    <div class="cta">
      <p>Guaranteed CBP-compliant RVC math in 72 hours — or we pay the penalty.</p>
      <a href="mailto:hello@autobordercomply.ai?subject=Design%20Partner%20Program">Book a Design Partner Call →</a>
    </div>
    <div class="footer">
      Report ID {result.report_id} · Generated {generated} · AutoBorder Comply<br>
      Calculation method: USMCA Annex 4-B build-down · Deterministic Python engine
    </div>
  </div>
</body>
</html>"""

    def render_pdf(self, result: TariffLeakResult) -> bytes:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=0.75 * inch, leftMargin=0.75 * inch)
        styles = getSampleStyleSheet()
        story = [
            Paragraph("AutoBorder Comply — Savings Report", styles["Heading1"]),
            Paragraph(f"{result.company_name} · Part {result.part_number}", styles["Normal"]),
            Spacer(1, 0.2 * inch),
            Paragraph(f"<b>{result.headline}</b>", styles["Heading2"]),
            Paragraph(f"Overpaid last quarter: ${result.overpaid_last_quarter:,.2f}", styles["Normal"]),
            Paragraph(f"Annual savings potential: ${result.annual_savings_potential:,.2f}", styles["Normal"]),
            Paragraph(f"RVC: {result.rvc_percentage}% · Net cost/unit: ${result.net_cost_per_unit:,.2f}", styles["Normal"]),
            Spacer(1, 0.15 * inch),
            Paragraph(f"<b>Recommendation:</b> {result.recommendation}", styles["Normal"]),
        ]
        doc.build(story)
        return buffer.getvalue()

    def save_html(self, result: TariffLeakResult, output_dir: Path) -> Path:
        output_dir.mkdir(parents=True, exist_ok=True)
        path = output_dir / f"savings_report_{result.report_id}.html"
        path.write_text(self.render_html(result), encoding="utf-8")
        return path
