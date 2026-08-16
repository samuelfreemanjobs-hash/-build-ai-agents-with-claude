#!/usr/bin/env python3
"""Release readiness checker — gates release on coverage, risk, and test quality."""

from __future__ import annotations

import argparse
import json
import sys


def check(coverage: dict, risk: dict, validation: dict, regression: dict) -> dict:
    blockers = []
    warnings = []

    if coverage.get("coverage_pct", 0) < 80:
        blockers.append("coverage_below_threshold")
    if risk.get("risk_level") == "critical":
        blockers.append("critical_release_risk")
    if validation.get("severity") == "error":
        blockers.append("test_suite_validation_failed")
    if regression.get("critical_impacted") and coverage.get("gap_count", 0) > 0:
        blockers.append("critical_component_with_coverage_gaps")

    if risk.get("risk_level") == "high":
        warnings.append("elevated_release_risk")
    if validation.get("severity") == "warning":
        warnings.append("test_suite_warnings_present")

    ready = not blockers
    return {
        "ready_for_release": ready,
        "blockers": blockers,
        "warnings": warnings,
        "recommendation": "GO" if ready and not warnings else ("HOLD" if blockers else "GO_WITH_CAUTION"),
    }


def selftest() -> int:
    coverage = {"coverage_pct": 95, "gap_count": 0}
    risk = {"risk_level": "low"}
    validation = {"severity": "pass"}
    regression = {"critical_impacted": []}
    result = check(coverage, risk, validation, regression)
    assert result["ready_for_release"] is True
    assert result["recommendation"] == "GO"
    print("PASS: release_readiness_checker selftest")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--coverage", help="JSON coverage file")
    parser.add_argument("--risk", help="JSON risk file")
    parser.add_argument("--validation", help="JSON validation file")
    parser.add_argument("--regression", help="JSON regression file")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()
    if args.selftest:
        return selftest()
    from pathlib import Path

    coverage = json.loads(Path(args.coverage).read_text())
    risk = json.loads(Path(args.risk).read_text())
    validation = json.loads(Path(args.validation).read_text())
    regression = json.loads(Path(args.regression).read_text())
    print(json.dumps(check(coverage, risk, validation, regression), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
