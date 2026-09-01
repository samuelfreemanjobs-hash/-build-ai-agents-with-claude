#!/usr/bin/env python3
"""Deterministic engineering standards compliance checker."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

STANDARDS = [
    {"id": "STD-001", "rule": "api_versioning", "severity": "error",
     "description": "Public APIs must be versioned", "check": "version"},
    {"id": "STD-002", "rule": "no_hardcoded_secrets", "severity": "error",
     "description": "No hardcoded credentials in design", "check": "secret"},
    {"id": "STD-003", "rule": "observability", "severity": "warning",
     "description": "Design must include monitoring/alerting plan", "check": "monitor"},
    {"id": "STD-004", "rule": "backward_compatibility", "severity": "warning",
     "description": "Breaking changes require versioning strategy", "check": "breaking"},
    {"id": "STD-005", "rule": "disaster_recovery", "severity": "warning",
     "description": "Production designs need DR/backup plan", "check": "backup"},
]


def check_standards(design: dict) -> dict:
    text = json.dumps(design).lower()
    violations = []

    checks = {
        "version": ["version", "v1", "v2", "/api/v"],
        "secret": ["password", "api_key", "hardcoded"],
        "monitor": ["monitor", "alert", "observability", "metrics", "logging", "tracing"],
        "breaking": ["breaking", "migration", "backward", "compat"],
        "backup": ["backup", "disaster", "recovery", "replica", "failover"],
    }

    for std in STANDARDS:
        keywords = checks.get(std["check"], [])
        if std["check"] in ("secret",):
            if any(kw in text for kw in keywords):
                violations.append({
                    "rule": std["id"],
                    "severity": std["severity"],
                    "description": std["description"],
                })
        elif std["check"] in ("monitor", "backup"):
            if not any(kw in text for kw in keywords):
                violations.append({
                    "rule": std["id"],
                    "severity": std["severity"],
                    "description": f"Missing: {std['description']}",
                })

    errors = sum(1 for v in violations if v["severity"] == "error")
    warnings = sum(1 for v in violations if v["severity"] == "warning")
    status = "FAIL" if errors > 0 else ("WARN" if warnings > 0 else "PASS")

    return {"status": status, "violations": violations, "errors": errors, "warnings": warnings}


def selftest() -> int:
    result = check_standards({"options": [{"name": "test", "summary": "basic api"}]})
    assert result["status"] in ("WARN", "FAIL")
    print("PASS: standards_checker selftest")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Check engineering standards")
    parser.add_argument("--design", help="JSON design file")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()
    if args.selftest:
        return selftest()
    from pathlib import Path
    design = json.loads(Path(args.design).read_text())
    result = check_standards(design)
    print(json.dumps(result, indent=2))
    return 0 if result["status"] != "FAIL" else 1


if __name__ == "__main__":
    raise SystemExit(main())
