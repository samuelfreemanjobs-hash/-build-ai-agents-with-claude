"""Tests for Tariff Leak Calculator GTM micro-site."""

import json
from pathlib import Path

from autoborder.gtm.bom_parser import BOMParser
from autoborder.gtm.tariff_leak import TariffLeakCalculator
from autoborder.models import TariffLeakInput
from autoborder.reports.savings_report import SavingsReportGenerator


MOCK_BOM = Path(__file__).resolve().parent.parent / "autoborder" / "data" / "mock" / "brake_rotor_bom.json"


def _sample_bom():
    return BOMParser().parse_json(MOCK_BOM.read_text(encoding="utf-8"))


def test_bom_parser_json():
    bom = _sample_bom()
    assert bom.root_part_number == "12345"
    assert len(bom.root.children) >= 4


def test_bom_parser_flat_format():
    flat = {
        "root_part_number": "999",
        "description": "Test Assembly",
        "components": [
            {"part_number": "999", "description": "Root", "unit_cost": 100, "origin_status": "originating", "origin_country": "MX"},
            {"part_number": "999-01", "description": "Child", "unit_cost": 40, "origin_status": "non_originating", "origin_country": "CN", "parent_part_number": "999", "quantity": 2},
        ],
    }
    bom = BOMParser().parse_json(json.dumps(flat))
    assert bom.root_part_number == "999"
    assert len(bom.root.children) == 1


def test_tariff_leak_missed_preferential():
    bom = _sample_bom()
    inputs = TariffLeakInput(
        company_name="Acme Auto",
        contact_name="Maria",
        contact_email="cfo@acme.mx",
        quarterly_units=1000,
        paid_mfn_duty=True,
    )
    result = TariffLeakCalculator().analyze(bom, inputs)
    assert result.meets_usmca_threshold is True
    assert result.overpaid_last_quarter > 0
    assert result.leak_type == "missed_preferential"
    assert result.annual_savings_potential == round(result.overpaid_last_quarter * 4, 2)


def test_tariff_leak_penalty_exposure():
    flat = {
        "root_part_number": "BAD-1",
        "description": "Non-compliant assembly",
        "components": [
            {"part_number": "BAD-1", "description": "Root", "unit_cost": 100, "origin_status": "unknown", "origin_country": "MX"},
            {"part_number": "BAD-1-A", "description": "CN Part", "unit_cost": 80, "origin_status": "non_originating", "origin_country": "CN", "parent_part_number": "BAD-1"},
        ],
    }
    bom = BOMParser().parse_json(json.dumps(flat))
    inputs = TariffLeakInput(
        company_name="Risk Corp",
        contact_name="Bob",
        contact_email="bob@risk.com",
        quarterly_units=500,
        claimed_usmca_preferential=True,
        paid_mfn_duty=False,
    )
    result = TariffLeakCalculator().analyze(bom, inputs)
    assert result.meets_usmca_threshold is False
    assert result.penalty_exposure > 0
    assert result.leak_type == "penalty_exposure"


def test_savings_report_html():
    bom = _sample_bom()
    inputs = TariffLeakInput(
        company_name="Acme Auto",
        contact_name="Maria",
        contact_email="cfo@acme.mx",
    )
    result = TariffLeakCalculator().analyze(bom, inputs)
    html = SavingsReportGenerator().render_html(result)
    assert "Acme Auto" in html
    assert result.report_id in html
    assert "USMCA" in html


def test_calculator_landing_page():
    from fastapi.testclient import TestClient

    from autoborder.api.main import app

    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert "Tariff Leak Calculator" in response.text


def test_calculator_analyze_endpoint():
    from fastapi.testclient import TestClient

    from autoborder.api.main import app

    client = TestClient(app)
    with MOCK_BOM.open("rb") as handle:
        response = client.post(
            "/calculator/analyze",
            data={
                "company_name": "Acme Auto",
                "contact_name": "Maria Gonzalez",
                "contact_email": "cfo@acme.mx",
                "quarterly_units": "1000",
                "mfn_duty_rate_pct": "6.5",
            },
            files={"bom_file": ("bom.json", handle, "application/json")},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["overpaid_last_quarter"] > 0
    assert data["report_id"]


def test_calculator_report_view():
    from fastapi.testclient import TestClient

    from autoborder.api.main import app

    client = TestClient(app)
    with MOCK_BOM.open("rb") as handle:
        analyze = client.post(
            "/calculator/analyze",
            data={
                "company_name": "Acme Auto",
                "contact_name": "Maria",
                "contact_email": "cfo@acme.mx",
            },
            files={"bom_file": ("bom.json", handle, "application/json")},
        )
    report_id = analyze.json()["report_id"]
    response = client.get(f"/calculator/report/{report_id}")
    assert response.status_code == 200
    assert "Savings Report" in response.text


def test_calculator_email_send():
    from fastapi.testclient import TestClient

    from autoborder.api.main import app

    client = TestClient(app)
    with MOCK_BOM.open("rb") as handle:
        analyze = client.post(
            "/calculator/analyze",
            data={
                "company_name": "Acme Auto",
                "contact_name": "Maria",
                "contact_email": "cfo@acme.mx",
            },
            files={"bom_file": ("bom.json", handle, "application/json")},
        )
    report_id = analyze.json()["report_id"]
    response = client.post(
        f"/calculator/report/{report_id}/send",
        json={"recipient_email": "cfo@acme.mx"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "queued"
