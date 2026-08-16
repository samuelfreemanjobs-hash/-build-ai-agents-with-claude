"""Deterministic verification runner — wraps scripts/*.py."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from software_developer_agent.halts import HaltCause, HaltError
from software_developer_agent.models import Tier, VerificationResult

SCRIPTS_DIR = Path(__file__).resolve().parent.parent.parent / "scripts"


def _run_script(script: str, *args: str) -> dict:
    path = SCRIPTS_DIR / script
    result = subprocess.run(
        [sys.executable, str(path), *args],
        capture_output=True,
        text=True,
        timeout=300,
    )
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"status": "FAIL", "error": result.stderr or result.stdout}


class VerificationRunner:
    def run(self, repo_path: str, tier: Tier, changed_files: list[str] | None = None) -> VerificationResult:
        tests = _run_script("test_runner.py", repo_path)
        if tests.get("status") == "FAIL":
            raise HaltError(
                HaltCause.TEST_FAILURE,
                f"Tests failed: {tests.get('failed', 0)} failures",
                "Fix failing tests and rerun verification",
                stage="S4",
            )

        lint = _run_script("lint_validator.py", repo_path)
        if lint.get("status") == "FAIL":
            raise HaltError(
                HaltCause.LINT_ERROR,
                f"Lint errors: {lint.get('errors', 0)}",
                "Fix lint errors and rerun verification",
                stage="S4",
            )

        scan_args = [repo_path]
        if changed_files:
            scan_args.extend(["--files", *changed_files])
        security = _run_script("security_scanner.py", *scan_args)
        if security.get("status") == "FAIL":
            findings = security.get("findings", [])
            critical = [f for f in findings if f.get("severity") in ("critical", "high")]
            raise HaltError(
                HaltCause.SECURITY_FINDING,
                f"Security findings: {len(critical)} critical/high",
                "Remove secrets and fix security issues",
                stage="S4",
            )

        dependencies: dict = {"status": "SKIP"}
        if tier in (Tier.T2, Tier.T3):
            dependencies = _run_script("dependency_checker.py", repo_path)
            if dependencies.get("status") == "FAIL":
                raise HaltError(
                    HaltCause.DEPENDENCY_VULNERABILITY,
                    "High-severity dependency vulnerabilities found",
                    "Update vulnerable dependencies",
                    stage="S4",
                )

        overall = "PASS"
        return VerificationResult(
            overall_status=overall,
            tests=tests,
            lint=lint,
            security=security,
            dependencies=dependencies,
        )
