#!/usr/bin/env python3
"""Regression detector — flags areas needing regression based on change mapping."""

from __future__ import annotations

import argparse
import json
import sys


def detect(scope: dict) -> dict:
    changes = scope.get("changes", [])
    components = scope.get("components", {})
    impacted = set()

    for change in changes:
        path = change.get("file", "")
        for component, files in components.items():
            if any(path.startswith(prefix) for prefix in files):
                impacted.add(component)

    critical_components = set(scope.get("critical_components", []))
    critical_impacted = sorted(impacted & critical_components)

    return {
        "changed_files": len(changes),
        "impacted_components": sorted(impacted),
        "critical_impacted": critical_impacted,
        "requires_smoke_suite": bool(critical_impacted),
        "requires_full_regression": len(impacted) >= 3 or bool(critical_impacted),
    }


def selftest() -> int:
    scope = {
        "changes": [{"file": "src/auth/login.py"}, {"file": "src/api/users.py"}],
        "components": {
            "auth": ["src/auth/"],
            "api": ["src/api/"],
            "billing": ["src/billing/"],
        },
        "critical_components": ["auth", "billing"],
    }
    result = detect(scope)
    assert "auth" in result["impacted_components"]
    assert result["requires_smoke_suite"] is True
    print("PASS: regression_detector selftest")
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
    print(json.dumps(detect(scope), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
