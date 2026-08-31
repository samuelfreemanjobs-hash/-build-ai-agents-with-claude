#!/usr/bin/env python3
"""Deterministic test runner — executes detected test command."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import time
from pathlib import Path

from codebase_analyzer import analyze


def parse_pytest_output(output: str) -> dict:
    passed = failed = skipped = 0
    failures = []

    for line in output.splitlines():
        m = re.search(r"(\d+) passed", line)
        if m:
            passed = int(m.group(1))
        m = re.search(r"(\d+) failed", line)
        if m:
            failed = int(m.group(1))
        m = re.search(r"(\d+) skipped", line)
        if m:
            skipped = int(m.group(1))
        if line.startswith("FAILED "):
            failures.append({"test": line.strip(), "message": line.strip()})

    status = "PASS" if failed == 0 and passed > 0 else ("FAIL" if failed > 0 else "SKIP")
    return {
        "status": status,
        "passed": passed,
        "failed": failed,
        "skipped": skipped,
        "failures": failures,
    }


def run_tests(repo_path: str, command: str | None = None, timeout: int = 300) -> dict:
    repo = Path(repo_path).resolve()
    if command is None:
        analysis = analyze(str(repo))
        command = analysis.get("test_command")

    if not command:
        return {
            "status": "SKIP",
            "command": None,
            "passed": 0,
            "failed": 0,
            "skipped": 0,
            "failures": [],
            "message": "No test command detected",
        }

    start = time.time()
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=repo,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        duration = time.time() - start
        output = result.stdout + result.stderr
        parsed = parse_pytest_output(output)

        if result.returncode != 0 and parsed["status"] == "SKIP":
            parsed["status"] = "FAIL"
            parsed["failures"].append({
                "test": "exit_code",
                "message": f"Test command exited with code {result.returncode}",
                "file": "",
            })

        parsed["command"] = command
        parsed["duration_seconds"] = round(duration, 2)
        parsed["exit_code"] = result.returncode
        return parsed

    except subprocess.TimeoutExpired:
        return {
            "status": "FAIL",
            "command": command,
            "passed": 0,
            "failed": 1,
            "skipped": 0,
            "duration_seconds": timeout,
            "failures": [{"test": "timeout", "message": f"Tests exceeded {timeout}s", "file": ""}],
        }


def selftest() -> int:
    backend = Path(__file__).resolve().parent.parent / "backend"
    result = run_tests(str(backend))
    assert "status" in result
    print(f"PASS: test_runner selftest (status={result['status']})")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Run tests deterministically")
    parser.add_argument("repo_path", nargs="?", default=".")
    parser.add_argument("--command", default=None)
    parser.add_argument("--timeout", type=int, default=300)
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()

    if args.selftest:
        return selftest()

    result = run_tests(args.repo_path, args.command, args.timeout)
    print(json.dumps(result, indent=2))
    return 0 if result["status"] in ("PASS", "SKIP") else 1


if __name__ == "__main__":
    raise SystemExit(main())
