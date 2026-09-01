from unittest.mock import patch
from dataclasses import asdict
from fastapi.testclient import TestClient
from software_architect.api.main import app
from software_architect.models import ArchitecturePackage, ArchitectureScope, C4Container, C4Model, GovernanceReview, Tier

client = TestClient(app)

def test_health():
    assert client.get("/").json()["status"] == "healthy"

@patch("software_architect.api.jobs.SoftwareArchitectAgent")
def test_sync(mock_cls):
    scope = ArchitectureScope("S1", "Platform", "Backend", "as-is", Tier.T1)
    model = C4Model("M1", "as-is", "Platform", "Desc", [C4Container("c1", "API", "Py", "HTTP")])
    pkg = ArchitecturePackage("r1", scope, model, None, {}, [], GovernanceReview("APPROVE", {"overall": 8}, []),
                              {"status": "completed", "c4_levels": ["context", "container"]}, "2026-01-01")
    mock_cls.return_value.execute.return_value = pkg
    r = client.post("/api/v1/architecture/model-sync", json={"description": "Model the platform system", "mock_llm": True})
    assert r.status_code == 200 and r.json()["status"] == "completed"
