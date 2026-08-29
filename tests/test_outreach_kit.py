"""Tests for Design Partner outreach kit."""

from autoborder.gtm.outreach.kit import OutreachKit, ProspectProfile


def _sample_prospect():
    return ProspectProfile(
        company_name="Grupo Industrial Saltillo",
        contact_name="Francisco Vega",
        contact_title="Director of Customs Compliance",
        city="Saltillo",
        part_focus="brake and rotor assemblies",
        quarterly_import_value="$4.2M",
    )


def test_list_templates():
    kit = OutreachKit()
    templates = kit.list_templates()
    assert "email_1_discovery" in templates
    assert "letter_of_intent" in templates
    assert len(templates) == 10


def test_render_email_with_merge_fields():
    kit = OutreachKit()
    prospect = _sample_prospect()
    script = kit.render("email_1_discovery", prospect)
    assert "Francisco Vega" in script.body
    assert "Saltillo" in script.body
    assert "Grupo Industrial Saltillo" in script.body
    assert "Saltillo" in script.subject
    assert "{contact_name}" not in script.body


def test_render_guarantee_clause():
    kit = OutreachKit()
    prospect = _sample_prospect()
    script = kit.render("email_3_guarantee", prospect)
    assert "$10,000" in script.body
    assert "Grupo Industrial Saltillo" in script.body
    assert "{guarantee_clause}" not in script.body


def test_render_full_kit():
    kit = OutreachKit()
    response = kit.render_full_kit(_sample_prospect())
    assert len(response.scripts) == 10
    assert "$10,000" in response.guarantee_clause
    assert "top 100" in response.program_summary


def test_letter_of_intent_contains_terms():
    kit = OutreachKit()
    script = kit.render("letter_of_intent", _sample_prospect())
    assert "$8,500" in script.body
    assert "non-binding" in script.body.lower()
    assert "Francisco Vega" in script.body


def test_call_scripts_contain_cadence_notes():
    kit = OutreachKit()
    call1 = kit.render("call_1_discovery", _sample_prospect())
    call2 = kit.render("call_2_demo", _sample_prospect())
    assert call1.notes is not None
    assert "roll-up" in call1.body.lower() or "build-down" in call1.body.lower()
    assert "demo" in call2.body.lower() or "graph" in call2.body.lower()


def test_outreach_api_personalize():
    from fastapi.testclient import TestClient

    from autoborder.api.main import app

    client = TestClient(app)
    response = client.post(
        "/outreach/personalize",
        json={
            "company_name": "Nemak",
            "contact_name": "Ana Villareal",
            "city": "Monterrey",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["scripts"]) == 10
    assert "Nemak" in data["guarantee_clause"]


def test_outreach_targets_endpoint():
    from fastapi.testclient import TestClient

    from autoborder.api.main import app

    client = TestClient(app)
    response = client.get("/outreach/targets")
    assert response.status_code == 200
    targets = response.json()
    assert len(targets) >= 5
    assert any(t["city"] == "Monterrey" for t in targets)


def test_design_partner_page():
    from fastapi.testclient import TestClient

    from autoborder.api.main import app

    client = TestClient(app)
    response = client.get("/design-partner")
    assert response.status_code == 200
    assert "Design Partner" in response.text
    assert "Monterrey" in response.text
