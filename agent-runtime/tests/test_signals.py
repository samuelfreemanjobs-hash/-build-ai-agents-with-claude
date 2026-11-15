from pathlib import Path

from agent_runtime.signals import evaluate_stack_signals

CORE = Path(__file__).resolve().parents[2] / "software-developer-agent" / "agent" / "core-config.xml"
RADAR = Path(__file__).resolve().parents[1] / "signals" / "radar.yaml"


def test_evaluate_stack_signals_has_entries():
    report = evaluate_stack_signals(CORE, RADAR)
    assert report.agent_id == "software-developer-agent"
    assert len(report.signals) >= 1
    codes = {s.code for s in report.signals}
    assert "RADAR_harness-vs-mcp" in codes or "RADAR_coding-harness-2026" in codes