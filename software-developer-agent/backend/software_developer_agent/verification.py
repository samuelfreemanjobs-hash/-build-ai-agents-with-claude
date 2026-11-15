"""Deterministic verification runner — wraps scripts/*.py via agent-runtime harness."""

from __future__ import annotations

from pathlib import Path

from agent_runtime.harness import HarnessRunner
from agent_runtime.mcp import McpToolRouter

from software_developer_agent.halts import HaltCause, HaltError
from software_developer_agent.models import Tier, VerificationResult

SCRIPTS_DIR = Path(__file__).resolve().parent.parent.parent / "scripts"
MCP_REGISTRY = Path(__file__).resolve().parent.parent.parent / "mcp" / "registry.yaml"

_HARNESS = HarnessRunner(SCRIPTS_DIR)
_ROUTER = McpToolRouter(MCP_REGISTRY, _HARNESS)


class VerificationRunner:
    def run(self, repo_path: str, tier: Tier, changed_files: list[str] | None = None) -> VerificationResult:
        tests = _ROUTER.invoke("run_tests", (repo_path,))
        if isinstance(tests, dict) or tests.status == "FAIL":
            payload = tests if isinstance(tests, dict) else tests.data
            raise HaltError(
                HaltCause.TEST_FAILURE,
                f"Tests failed: {payload.get('failed', payload.get('error', 'unknown'))}",
                "Fix failing tests and rerun verification",
                stage="S4",
            )
        tests_data = tests.data if not isinstance(tests, dict) else tests

        lint = _ROUTER.invoke("run_lint", (repo_path,))
        if not isinstance(lint, dict) and lint.status == "FAIL":
            raise HaltError(
                HaltCause.LINT_ERROR,
                f"Lint errors: {lint.data.get('errors', 0)}",
                "Fix lint errors and rerun verification",
                stage="S4",
            )
        lint_data = lint.data if not isinstance(lint, dict) else lint

        scan_args: tuple[str, ...] = (repo_path,)
        if changed_files:
            scan_args = (repo_path, "--files", *changed_files)
        security = _ROUTER.invoke("security_scan", scan_args)
        if not isinstance(security, dict) and security.status == "FAIL":
            findings = security.data.get("findings", [])
            critical = [f for f in findings if f.get("severity") in ("critical", "high")]
            raise HaltError(
                HaltCause.SECURITY_FINDING,
                f"Security findings: {len(critical)} critical/high",
                "Remove secrets and fix security issues",
                stage="S4",
            )
        security_data = security.data if not isinstance(security, dict) else security

        dependencies: dict = {"status": "SKIP"}
        if tier in (Tier.T2, Tier.T3):
            dep = _ROUTER.invoke("dependency_audit", (repo_path,))
            if not isinstance(dep, dict) and dep.status == "FAIL":
                raise HaltError(
                    HaltCause.DEPENDENCY_VULNERABILITY,
                    "High-severity dependency vulnerabilities found",
                    "Update vulnerable dependencies",
                    stage="S4",
                )
            dependencies = dep.data if not isinstance(dep, dict) else dep

        return VerificationResult(
            overall_status="PASS",
            tests=tests_data,
            lint=lint_data,
            security=security_data,
            dependencies=dependencies,
        )