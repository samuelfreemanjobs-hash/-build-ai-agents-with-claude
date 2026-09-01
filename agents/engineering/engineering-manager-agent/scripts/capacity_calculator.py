#!/usr/bin/env python3
"""Capacity calculator — team capacity in story points per sprint."""

from __future__ import annotations
import argparse, json, sys

DEFAULTS = {"hours_per_sprint": 80, "meeting_overhead": 10, "focus_factor": 0.6, "points_per_hour": 0.5}

def calculate(context: dict, config: dict | None = None) -> dict:
    cfg = {**DEFAULTS, **(config or {})}
    members = context.get("team_members", [])
    per_person = []
    total_available = 0

    for m in members:
        pto = m.get("pto_days", 0) * 8
        available_hours = cfg["hours_per_sprint"] - cfg["meeting_overhead"] - pto
        focus_hours = available_hours * cfg["focus_factor"]
        points = round(focus_hours * cfg["points_per_hour"], 1)
        per_person.append({"name": m["name"], "available_hours": available_hours,
                           "focus_hours": round(focus_hours, 1), "capacity_points": points})
        total_available += points

    buffer = round(total_available * 0.2, 1)
    committable = round(total_available - buffer, 1)

    return {
        "team_capacity_points": round(total_available, 1),
        "buffer_points": buffer,
        "committable_points": committable,
        "per_person": per_person,
        "team_size": len(members),
    }

def selftest() -> int:
    ctx = {"team_members": [{"name": "A", "role": "BE"}, {"name": "B", "role": "FE", "pto_days": 2}]}
    r = calculate(ctx)
    assert r["committable_points"] < r["team_capacity_points"]
    print("PASS: capacity_calculator selftest")
    return 0

def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--context")
    p.add_argument("--selftest", action="store_true")
    a = p.parse_args()
    if a.selftest: return selftest()
    from pathlib import Path
    print(json.dumps(calculate(json.loads(Path(a.context).read_text())), indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
