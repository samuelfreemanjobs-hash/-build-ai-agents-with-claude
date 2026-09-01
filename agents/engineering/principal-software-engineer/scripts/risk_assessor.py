#!/usr/bin/env python3
"""Deterministic risk assessment for architecture options."""

from __future__ import annotations

import argparse
import json
import sys

RISK_PATTERNS = [
    {"pattern": "single point of failure", "severity": "critical", "category": "reliability"},
    {"pattern": "no backup", "severity": "high", "category": "reliability"},
    {"pattern": "manual failover", "severity": "high", "category": "reliability"},
    {"pattern": "no monitoring", "severity": "high", "category": "operability"},
    {"pattern": "shared database", "severity": "medium", "category": "coupling"},
    {"pattern": "synchronous chain", "severity": "medium", "category": "reliability"},
    {"pattern": "no authentication", "severity": "critical", "category": "security"},
    {"pattern": "plaintext", "severity": "critical", "category": "security"},
    {"pattern": "no encryption", "severity": "high", "category": "security"},
    {"pattern": "vendor lock", "severity": "medium", "category": "cost"},
    {"pattern": "no rollback", "severity": "high", "category": "operability"},
    {"pattern": "big bang", "severity": "high", "category": "delivery"},
    {"pattern": "data migration", "severity": "high", "category": "data"},
    {"pattern": "breaking change", "severity": "medium", "category": "compatibility"},
]

COMPLEXITY_RISKS = {
    "high": {"id": "R-COMPLEX", "severity": "medium", "description": "High implementation complexity increases delivery risk"},
}


def assess_risks(options: list[dict], acknowledged: list[str] | None = None) -> dict:
    acknowledged = acknowledged or []
    risks = []
    risk_id = 0

    for option in options:
        oid = option.get("option_id", "unknown")
        text = json.dumps(option).lower()

        for pattern in RISK_PATTERNS:
            if pattern["pattern"] in text:
                risk_id += 1
                risks.append({
                    "id": f"R-{risk_id:03d}",
                    "severity": pattern["severity"],
                    "description": f"{pattern['category']}: {pattern['pattern']} detected in {oid}",
                    "option_id": oid,
                    "acknowledged": f"R-{risk_id:03d}" in acknowledged,
                })

        complexity = option.get("complexity", "medium")
        if complexity == "high":
            risk_id += 1
            cr = COMPLEXITY_RISKS["high"]
            risks.append({
                "id": f"R-{risk_id:03d}",
                "severity": cr["severity"],
                "description": cr["description"],
                "option_id": oid,
                "acknowledged": f"R-{risk_id:03d}" in acknowledged,
            })

    critical_unacked = [r for r in risks if r["severity"] == "critical" and not r["acknowledged"]]
    return {
        "risks": risks,
        "summary": {
            "critical": sum(1 for r in risks if r["severity"] == "critical"),
            "high": sum(1 for r in risks if r["severity"] == "high"),
            "medium": sum(1 for r in risks if r["severity"] == "medium"),
            "low": sum(1 for r in risks if r["severity"] == "low"),
        },
        "status": "FAIL" if critical_unacked else "PASS",
        "unacknowledged_critical": len(critical_unacked),
    }


def selftest() -> int:
    options = [
        {"option_id": "OPT-A", "complexity": "low", "trade_offs": {"pros": [], "cons": []}},
        {"option_id": "OPT-B", "complexity": "high", "description": "single point of failure in gateway"},
    ]
    result = assess_risks(options)
    assert result["status"] == "FAIL"
    assert result["unacknowledged_critical"] >= 1
    print("PASS: risk_assessor selftest")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Assess architecture risks")
    parser.add_argument("--options", help="JSON file with options")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()
    if args.selftest:
        return selftest()
    from pathlib import Path
    options = json.loads(Path(args.options).read_text())
    print(json.dumps(assess_risks(options), indent=2))
    return 0 if assess_risks(options)["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
