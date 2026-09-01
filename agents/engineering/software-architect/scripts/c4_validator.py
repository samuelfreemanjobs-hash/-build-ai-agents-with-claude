#!/usr/bin/env python3
"""C4 model validator — checks required levels and element completeness."""

from __future__ import annotations

import argparse
import json
import sys

REQUIRED_CONTEXT = ["system_name", "description"]
REQUIRED_CONTAINER_FIELDS = ["id", "name", "technology", "responsibility"]


def validate_c4(model: dict, tier: str = "T1") -> dict:
    errors, warnings = [], []

    ctx = model.get("context", {})
    for field in REQUIRED_CONTEXT:
        if not ctx.get(field):
            errors.append({"field": f"context.{field}", "message": "Missing required context field"})

    containers = model.get("containers", [])
    if not containers:
        errors.append({"field": "containers", "message": "At least one container required"})
    for i, c in enumerate(containers):
        for field in REQUIRED_CONTAINER_FIELDS:
            if not c.get(field):
                errors.append({"field": f"containers[{i}].{field}", "message": "Missing field"})
        if not c.get("source_ref") and c.get("type") != "external":
            warnings.append({"field": f"containers[{i}]", "message": "No source_ref — unverified container"})

    if tier in ("T2", "T3") and not model.get("components"):
        warnings.append({"field": "components", "message": "Component level recommended for T2+"})

    unnamed = [c for c in containers if c.get("name", "").lower() in ("", "unknown", "tbd")]
    if unnamed:
        errors.append({"field": "containers", "message": f"{len(unnamed)} unnamed container(s)"})

    status = "FAIL" if errors else ("WARN" if warnings else "PASS")
    return {"status": status, "errors": errors, "warnings": warnings, "levels_present": _levels(model)}


def _levels(model: dict) -> list[str]:
    levels = ["context"]
    if model.get("containers"):
        levels.append("container")
    if model.get("components"):
        levels.append("component")
    return levels


def selftest() -> int:
    good = {"context": {"system_name": "App", "description": "Test"}, "containers": [
        {"id": "c1", "name": "API", "technology": "Python", "responsibility": "HTTP", "source_ref": "backend"}
    ]}
    assert validate_c4(good)["status"] == "PASS"
    bad = {"context": {}, "containers": []}
    assert validate_c4(bad)["status"] == "FAIL"
    print("PASS: c4_validator selftest")
    return 0


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--model", required=False)
    p.add_argument("--tier", default="T1")
    p.add_argument("--selftest", action="store_true")
    a = p.parse_args()
    if a.selftest:
        return selftest()
    from pathlib import Path
    model = json.loads(Path(a.model).read_text())
    result = validate_c4(model, a.tier)
    print(json.dumps(result, indent=2))
    return 0 if result["status"] != "FAIL" else 1


if __name__ == "__main__":
    raise SystemExit(main())
