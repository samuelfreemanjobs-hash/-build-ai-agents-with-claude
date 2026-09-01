#!/usr/bin/env python3
"""Velocity tracker — sprint velocity from historical data."""

from __future__ import annotations
import argparse, json, sys

def track(context: dict) -> dict:
    history = context.get("velocity_history", [])
    if not history:
        return {"status": "NO_DATA", "average_velocity": None, "trend": "unknown", "sprints": 0}

    completed = [s.get("completed_points", 0) for s in history]
    avg = round(sum(completed) / len(completed), 1)
    trend = "stable"
    if len(completed) >= 2:
        if completed[-1] > completed[-2] * 1.15: trend = "increasing"
        elif completed[-1] < completed[-2] * 0.85: trend = "decreasing"

    return {
        "status": "OK",
        "average_velocity": avg,
        "last_sprint": completed[-1] if completed else 0,
        "trend": trend,
        "sprints_analyzed": len(completed),
        "history": history[-5:],
    }

def selftest() -> int:
    ctx = {"velocity_history": [{"completed_points": 30}, {"completed_points": 28}, {"completed_points": 32}]}
    r = track(ctx)
    assert r["average_velocity"] == 30.0
    print("PASS: velocity_tracker selftest")
    return 0

def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--context")
    p.add_argument("--selftest", action="store_true")
    a = p.parse_args()
    if a.selftest: return selftest()
    from pathlib import Path
    print(json.dumps(track(json.loads(Path(a.context).read_text())), indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
