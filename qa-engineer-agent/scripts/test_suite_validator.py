#!/usr/bin/env python3
"""Test suite validator — structure, naming, and assertion quality checks."""

from __future__ import annotations

import argparse
import json
import re
import sys

VALID_NAME = re.compile(r"^test_[a-z0-9_]+$")
FORBIDDEN_PATTERNS = ["time.sleep", "assert True", "pass  # TODO"]


def validate(scope: dict) -> dict:
    tests = scope.get("existing_tests", []) + scope.get("proposed_tests", [])
    issues = []
    valid_count = 0

    for test in tests:
        name = test.get("name", "")
        body = test.get("body", "")
        test_issues = []

        if not VALID_NAME.match(name):
            test_issues.append("invalid_test_name")
        if not body.strip():
            test_issues.append("empty_test_body")
        if not any(p in body for p in ("assert ", "expect(", "should ")):
            test_issues.append("no_assertion_detected")
        for pattern in FORBIDDEN_PATTERNS:
            if pattern in body:
                test_issues.append(f"forbidden_pattern:{pattern}")

        if test_issues:
            issues.append({"test": name, "issues": test_issues})
        else:
            valid_count += 1

    severity = "pass"
    if any("forbidden_pattern" in i for item in issues for i in item["issues"]):
        severity = "error"
    elif issues:
        severity = "warning"

    return {
        "tests_evaluated": len(tests),
        "valid_tests": valid_count,
        "issue_count": len(issues),
        "severity": severity,
        "issues": issues,
    }


def selftest() -> int:
    scope = {
        "existing_tests": [
            {"name": "test_login_success", "body": "assert response.status_code == 200"},
            {"name": "BadName", "body": "assert True"},
        ]
    }
    result = validate(scope)
    assert result["issue_count"] >= 1
    print("PASS: test_suite_validator selftest")
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
    print(json.dumps(validate(scope), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
