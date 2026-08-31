from unittest.mock import patch, MagicMock
from software_architect.agent import SoftwareArchitectAgent
from software_architect.models import C4Container, C4Model

def test_intake():
    a = SoftwareArchitectAgent(mock_llm=True)
    s = a.intake_scope("Document the platform backend architecture")
    assert s.system_name

@patch("software_architect.agent.ArchitectureAnalyzer")
def test_execute(mock_cls):
    mock_cls.return_value.analyze.return_value = {
        "discovery": {"services": []}, "coupling": {"status": "PASS", "critical_count": 0},
        "patterns": {"patterns_detected": []}, "nfr": {"gap_count": 2, "status": "WARN"},
    }
    mock_cls.return_value.validate_c4.return_value = {"status": "PASS", "levels_present": ["context", "container"]}
    pkg = SoftwareArchitectAgent(mock_llm=True).execute("Model platform architecture")
    assert pkg.run_id and pkg.as_is_model
