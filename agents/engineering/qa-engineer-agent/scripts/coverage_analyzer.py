#!/usr/bin/env python3
"""Coverage analyzer — gaps between requirements and existing tests."""

from __future__ import annotations

import argparse
import json
import sys


def analyze(scope: dict) -> dict:
    requirements = scope.get("requirements", [])
    existing_tests = scope.get("existing_tests", [])
    covered = {t.get("requirement_id") for t in existing_tests if t.get("requirement_id")}
    gaps = [r for r in requirements if r.get("id") not in covered]
    total = len(requirements) or 1
    return {
        "total_requirements": len(requirements),
        "covered_requirements": len(requirements) - len(gaps),
        "coverage_pct": round((len(requirements) - len(gaps)) / total * 100, 1),
        "uncovered_requirements": [g.get("id", g.get("title", "")) for g in gaps],
        "gap_count": len(gaps),
    }


def selftest() -> int:
    scope = {
        "requirements": [{"id": "R1"}, {"id": "R2"}, {"id": "R3"}],
        "existing_tests": [{"requirement_id": "R1", "name": "test_auth"}],
    }
    result = analyze(scope)
    assert result["gap_count"] == 2
    assert result["coverage_pct"] == 33.3
    print("PASS: coverage_analyzer selftest")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scope", help="JSON scope file")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()
    if args.selftest:
        return selftest()
    from pathlib import Path

    scope = json.loads(Path(args.scope).read_text())
    print(json.dumps(analyze(scope), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
