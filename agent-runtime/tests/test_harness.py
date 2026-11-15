from pathlib import Path

from agent_runtime.harness import HarnessRunner

SCRIPTS = Path(__file__).resolve().parents[2] / "software-developer-agent" / "scripts"


def test_harness_run_selftest():
    runner = HarnessRunner(SCRIPTS, default_timeout_seconds=120)
    result = runner.run("codebase_analyzer.py", ".", "--selftest")
    assert result.exit_code == 0
    assert result.data.get("status") == "OK"