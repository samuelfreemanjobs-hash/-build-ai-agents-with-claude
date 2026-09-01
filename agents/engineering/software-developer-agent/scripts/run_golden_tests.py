#!/usr/bin/env python3
"""Run golden tests for all deterministic modules."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

SCRIPTS = [
    "codebase_analyzer.py",
    "test_runner.py",
    "lint_validator.py",
    "security_scanner.py",
    "dependency_checker.py",
]


def main() -> int:
    scripts_dir = Path(__file__).resolve().parent
    failures = 0

    print("=" * 60)
    print("SOFTWARE DEVELOPER AGENT — Golden Tests")
    print("=" * 60)

    for script in SCRIPTS:
        path = scripts_dir / script
        print(f"\n▶ {script} --selftest")
        result = subprocess.run(
            [sys.executable, str(path), "--selftest"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            print(f"  ✓ PASS")
        else:
            print(f"  ✗ FAIL")
            print(result.stdout)
            print(result.stderr)
            failures += 1

    print("\n" + "=" * 60)
    if failures:
        print(f"FAILED: {failures}/{len(SCRIPTS)} modules")
        return 1
    print(f"ALL PASS: {len(SCRIPTS)}/{len(SCRIPTS)} modules")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
