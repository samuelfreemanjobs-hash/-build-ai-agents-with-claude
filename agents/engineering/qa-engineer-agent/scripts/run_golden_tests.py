#!/usr/bin/env python3
"""Run golden tests for QA Engineer Agent deterministic modules."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

MODULES = [
    "coverage_analyzer.py",
    "risk_scorer.py",
    "test_suite_validator.py",
    "regression_detector.py",
    "release_readiness_checker.py",
]


def main() -> int:
    scripts = Path(__file__).parent
    print("=" * 60)
    print("QA ENGINEER AGENT — Golden Tests")
    print("=" * 60)
    passed = 0
    for module in MODULES:
        print(f"\n▶ {module} --selftest")
        result = subprocess.run([sys.executable, str(scripts / module), "--selftest"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  ✓ PASS")
            passed += 1
        else:
            print(f"  ✗ FAIL\n{result.stdout}\n{result.stderr}")
    print("\n" + "=" * 60)
    print(f"ALL PASS: {passed}/{len(MODULES)}" if passed == len(MODULES) else f"FAILED: {passed}/{len(MODULES)}")
    return 0 if passed == len(MODULES) else 1


if __name__ == "__main__":
    raise SystemExit(main())
