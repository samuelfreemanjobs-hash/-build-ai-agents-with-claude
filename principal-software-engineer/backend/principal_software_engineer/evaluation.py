"""Deterministic evaluation runner."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from principal_software_engineer.halts import HaltCause, HaltError
from principal_software_engineer.models import EvaluationResult

SCRIPTS_DIR = Path(__file__).resolve().parent.parent.parent / "scripts"


def _run_script(script: str, *args: str) -> dict:
    result = subprocess.run(
        [sys.executable, str(SCRIPTS_DIR / script), *args],
        capture_output=True, text=True, timeout=120,
    )
    return json.loads(result.stdout)


class EvaluationRunner:
    def evaluate(self, options: list[dict]) -> EvaluationResult:
        import tempfile
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            json.dump(options, f)
            opts_path = f.name

        scores = _run_script("architecture_scorer.py", "--options", opts_path)
        risks = _run_script("risk_assessor.py", "--options", opts_path)
        standards = _run_script("standards_checker.py", "--design", opts_path)

        if risks.get("status") == "FAIL":
            raise HaltError(
                HaltCause.CRITICAL_RISK_UNACKNOWLEDGED,
                f"{risks.get('unacknowledged_critical', 0)} critical risks unacknowledged",
                "Acknowledge critical risks in the problem brief",
                stage="S4",
            )

        if standards.get("status") == "FAIL":
            raise HaltError(
                HaltCause.STANDARDS_VIOLATION,
                f"{standards.get('errors', 0)} standards errors",
                "Address standards violations in the design",
                stage="S4",
            )

        return EvaluationResult(
            option_scores=scores.get("option_scores", []),
            recommended_option=scores.get("recommended_option", ""),
            risks=risks.get("risks", []),
            standards=standards,
            status="PASS",
        )
