#!/usr/bin/env python3
"""Commitment validator — checks commitments against capacity."""

from __future__ import annotations
import argparse, json, sys

def validate(capacity: dict, commitments: dict) -> dict:
    available = capacity.get("committable_points", 0)
    committed = commitments.get("total_points", 0)
    if not committed:
        committed = sum(i.get("points", 0) for i in commitments.get("items", []))

    utilization = round(committed / available * 100, 1) if available > 0 else 999
    overcommit = committed > available

    return {
        "available_points": available,
        "committed_points": committed,
        "utilization_pct": utilization,
        "buffer_remaining": round(available - committed, 1),
        "feasible": not overcommit,
        "status": "FAIL" if overcommit else "PASS",
        "overcommit_points": round(committed - available, 1) if overcommit else 0,
    }

def selftest() -> int:
    cap = {"committable_points": 40}
    ok = {"items": [{"points": 30}, {"points": 5}]}
    bad = {"items": [{"points": 30}, {"points": 15}]}
    assert validate(cap, ok)["status"] == "PASS"
    assert validate(cap, bad)["status"] == "FAIL"
    print("PASS: commitment_validator selftest")
    return 0

def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--capacity"); p.add_argument("--commitments")
    p.add_argument("--selftest", action="store_true")
    a = p.parse_args()
    if a.selftest: return selftest()
    from pathlib import Path
    print(json.dumps(validate(json.loads(Path(a.capacity).read_text()),
                              json.loads(Path(a.commitments).read_text())), indent=2))
    return 0 if not validate(json.loads(Path(a.capacity).read_text()),
                             json.loads(Path(a.commitments).read_text()))["status"] == "FAIL" else 1

if __name__ == "__main__":
    raise SystemExit(main())
