#!/usr/bin/env python3
"""Deterministic lint validator."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

from codebase_analyzer import analyze

RUFF_PATTERN = re.compile(
    r"^(?P<file>[^:]+):(?P<line>\d+):(?P<col>\d+): (?P<code>\w+) (?P<message>.+)$"
)


def parse_ruff_output(output: str) -> list[dict]:
    issues = []
    for line in output.splitlines():
        m = RUFF_PATTERN.match(line.strip())
        if m:
            code = m.group("code")
            severity = "error" if code.startswith(("E", "F")) else "warning"
            issues.append({
                "file": m.group("file"),
                "line": int(m.group("line")),
                "severity": severity,
                "message": f"{code}: {m.group('message')}",
            })
    return issues


def run_lint(repo_path: str, command: str | None = None) -> dict:
    repo = Path(repo_path).resolve()
    if command is None:
        analysis = analyze(str(repo))
        command = analysis.get("lint_command")

    if not command:
        return {
            "status": "PASS",
            "tool": None,
            "errors": 0,
            "warnings": 0,
            "issues": [],
            "message": "No lint tool detected — skipped",
        }

    tool = command.split()[0]
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=repo,
            capture_output=True,
            text=True,
            timeout=120,
        )
        output = result.stdout + result.stderr
        issues = parse_ruff_output(output) if "ruff" in command else []

        errors = sum(1 for i in issues if i["severity"] == "error")
        warnings = sum(1 for i in issues if i["severity"] == "warning")

        if result.returncode != 0 and not issues:
            errors = 1
            issues.append({
                "file": "",
                "line": 0,
                "severity": "error",
                "message": f"Lint command failed with exit code {result.returncode}",
            })

        status = "FAIL" if errors > 0 else ("WARN" if warnings > 0 else "PASS")
        return {
            "status": status,
            "tool": tool,
            "errors": errors,
            "warnings": warnings,
            "issues": issues,
        }
    except subprocess.TimeoutExpired:
        return {
            "status": "FAIL",
            "tool": tool,
            "errors": 1,
            "warnings": 0,
            "issues": [{"file": "", "line": 0, "severity": "error", "message": "Lint timed out"}],
        }


def selftest() -> int:
    backend = Path(__file__).resolve().parent.parent / "backend"
    result = run_lint(str(backend))
    assert "status" in result
    print(f"PASS: lint_validator selftest (status={result['status']})")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Run lint checks deterministically")
    parser.add_argument("repo_path", nargs="?", default=".")
    parser.add_argument("--command", default=None)
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()

    if args.selftest:
        return selftest()

    result = run_lint(args.repo_path, args.command)
    print(json.dumps(result, indent=2))
    return 0 if result["status"] != "FAIL" else 1


if __name__ == "__main__":
    raise SystemExit(main())
