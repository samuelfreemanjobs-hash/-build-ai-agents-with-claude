#!/usr/bin/env python3
"""Revenue leakage calculator — deterministic binding facts."""

from __future__ import annotations

import argparse
import json
import sys


def calculate(inputs: dict) -> dict:
    rev = inputs["annual_revenue"]
    mult = {"automotive": 1.15, "logistics": 1.1, "manufacturing": 1.05}.get(inputs.get("industry", "other"), 1.0)

    followup = rev * (inputs.get("slow_followup_pct", 0) / 100) * 0.35 * mult
    reporting = inputs.get("manual_reporting_hours", 0) * 52 * 75 * mult
    quote = rev * (inputs.get("quote_delay_days", 0) / 30) * 0.02 * mult
    data = inputs.get("data_reconciliation_hours", 0) * 52 * 65 * mult
    upsell = rev * (inputs.get("missed_upsell_pct", 0) / 100) * 0.08 * mult

    breakdown = sorted([
        ("Slow follow-up", round(followup)),
        ("Manual reporting", round(reporting)),
        ("Quote delays", round(quote)),
        ("Data reconciliation", round(data)),
        ("Missed upsells", round(upsell)),
    ], key=lambda x: x[1], reverse=True)

    total = sum(b[1] for b in breakdown)
    return {
        "total_annual_leakage": total,
        "leakage_pct": round(total / rev * 100, 1) if rev else 0,
        "breakdown": [{"category": c, "amount": a} for c, a in breakdown],
        "recovery_potential": round(total * 0.45),
    }


def selftest() -> int:
    result = calculate({
        "annual_revenue": 10_000_000,
        "industry": "automotive",
        "slow_followup_pct": 15,
        "manual_reporting_hours": 8,
        "quote_delay_days": 5,
        "data_reconciliation_hours": 6,
        "missed_upsell_pct": 10,
    })
    assert result["total_annual_leakage"] > 0
    assert result["leakage_pct"] > 0
    print("PASS: leakage_calculator selftest")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", help="JSON input file")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()
    if args.selftest:
        raise SystemExit(selftest())
    from pathlib import Path
    data = json.loads(Path(args.input).read_text())
    print(json.dumps(calculate(data), indent=2))
