#!/usr/bin/env python3
"""Blocker detector — stale items, blocked work, dependency risks."""

from __future__ import annotations
import argparse, json, sys
from datetime import datetime, timezone

def detect(context: dict) -> dict:
    blockers = []
    bid = 0
    today = datetime.now(timezone.utc)

    for item in context.get("backlog", []):
        status = item.get("status", "").lower()
        if status in ("blocked", "blocker"):
            bid += 1
            age = item.get("blocked_days", item.get("age_days", 0))
            severity = "critical" if age > 3 else ("high" if age > 1 else "medium")
            blockers.append({
                "id": f"BLK-{bid:03d}", "item_id": item.get("id", ""),
                "title": item.get("title", ""), "owner": item.get("owner", ""),
                "age_days": age, "severity": severity,
                "reason": item.get("blocker_reason", "unspecified"),
                "category": item.get("blocker_category", "technical"),
            })

        deps = item.get("dependencies", [])
        for dep in deps:
            dep_item = next((b for b in context.get("backlog", []) if b.get("id") == dep), None)
            if dep_item and dep_item.get("status", "").lower() not in ("done", "completed"):
                bid += 1
                blockers.append({
                    "id": f"BLK-{bid:03d}", "item_id": item.get("id", ""),
                    "title": f"Blocked by {dep}", "owner": item.get("owner", ""),
                    "age_days": item.get("age_days", 0), "severity": "high",
                    "reason": f"Dependency {dep} not complete", "category": "dependency",
                })

    critical = sum(1 for b in blockers if b["severity"] == "critical")
    return {
        "blockers": blockers,
        "total": len(blockers),
        "critical_count": critical,
        "status": "FAIL" if critical > 0 else "PASS",
    }

def selftest() -> int:
    ctx = {"backlog": [
        {"id": "1", "title": "Auth", "status": "blocked", "blocked_days": 5, "owner": "Alex"},
        {"id": "2", "title": "API", "status": "in_progress", "dependencies": ["1"], "owner": "Sam"},
    ]}
    r = detect(ctx)
    assert r["critical_count"] >= 1
    print("PASS: blocker_detector selftest")
    return 0

def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--context")
    p.add_argument("--selftest", action="store_true")
    a = p.parse_args()
    if a.selftest: return selftest()
    from pathlib import Path
    print(json.dumps(detect(json.loads(Path(a.context).read_text())), indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
