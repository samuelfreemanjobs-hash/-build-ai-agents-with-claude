#!/usr/bin/env python3
"""Risk scorer — release risk from change surface, coverage, and defect history."""

from __future__ import annotations

import argparse
import json
import sys


def score(scope: dict, coverage: dict) -> dict:
    changes = scope.get("changes", [])
    defects = scope.get("recent_defects", [])
    high_risk_areas = scope.get("high_risk_areas", [])

    change_score = min(len(changes) * 5, 40)
    coverage_gap_score = min(coverage.get("gap_count", 0) * 8, 30)
    defect_score = min(len(defects) * 6, 20)
    area_score = min(len(high_risk_areas) * 5, 10)
    total = change_score + coverage_gap_score + defect_score + area_score

    level = "low"
    if total >= 60:
        level = "critical"
    elif total >= 40:
        level = "high"
    elif total >= 20:
        level = "medium"

    return {
        "risk_score": total,
        "risk_level": level,
        "factors": {
            "change_surface": change_score,
            "coverage_gaps": coverage_gap_score,
            "recent_defects": defect_score,
            "high_risk_areas": area_score,
        },
        "requires_full_regression": level in ("high", "critical"),
    }


def selftest() -> int:
    scope = {
        "changes": [{"file": "auth.py"}, {"file": "api.py"}],
        "recent_defects": [{"id": "BUG-1"}],
        "high_risk_areas": ["payments"],
    }
    coverage = {"gap_count": 3}
    result = score(scope, coverage)
    assert result["risk_level"] in ("medium", "high", "critical")
    print("PASS: risk_scorer selftest")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scope", help="JSON scope file")
    parser.add_argument("--coverage", help="JSON coverage analysis file")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()
    if args.selftest:
        return selftest()
    from pathlib import Path

    scope = json.loads(Path(args.scope).read_text())
    coverage = json.loads(Path(args.coverage).read_text()) if args.coverage else {}
    print(json.dumps(score(scope, coverage), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
