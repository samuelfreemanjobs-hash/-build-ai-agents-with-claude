#!/usr/bin/env python3
"""Workload analyzer — distribution, WIP, per-person allocation."""

from __future__ import annotations
import argparse, json, sys

def analyze(context: dict) -> dict:
    members = {m["name"]: {"role": m.get("role", ""), "items": [], "points": 0, "wip": 0}
               for m in context.get("team_members", [])}
    backlog = context.get("backlog", [])
    unassigned = []

    for item in backlog:
        owner = item.get("owner", "")
        pts = item.get("points", 0)
        if owner in members:
            members[owner]["items"].append(item.get("id", item.get("title", "")))
            members[owner]["points"] += pts
            if item.get("status") in ("in_progress", "in-progress", "active"):
                members[owner]["wip"] += 1
        else:
            unassigned.append(item)

    overloaded = [n for n, d in members.items() if d["wip"] > 2]
    return {
        "team_size": len(members),
        "total_backlog_items": len(backlog),
        "unassigned_items": len(unassigned),
        "per_person": members,
        "overloaded_members": overloaded,
        "total_points": sum(d["points"] for d in members.values()),
    }

def selftest() -> int:
    ctx = {"team_members": [{"name": "Alex", "role": "BE"}, {"name": "Sam", "role": "FE"}],
           "backlog": [{"id": "1", "owner": "Alex", "points": 5, "status": "in_progress"},
                       {"id": "2", "owner": "Alex", "points": 3, "status": "in_progress"},
                       {"id": "3", "owner": "Alex", "points": 2, "status": "in_progress"},
                       {"id": "4", "owner": "Sam", "points": 8}]}
    r = analyze(ctx)
    assert "Alex" in r["overloaded_members"]
    print("PASS: workload_analyzer selftest")
    return 0

def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--context", help="JSON context file")
    p.add_argument("--selftest", action="store_true")
    a = p.parse_args()
    if a.selftest: return selftest()
    from pathlib import Path
    ctx = json.loads(Path(a.context).read_text())
    print(json.dumps(analyze(ctx), indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
