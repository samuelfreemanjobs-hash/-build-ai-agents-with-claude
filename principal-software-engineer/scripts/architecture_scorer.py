#!/usr/bin/env python3
"""Deterministic architecture option scorer."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

WEIGHTS = {
    "simplicity": 0.15,
    "scalability": 0.20,
    "reliability": 0.20,
    "security": 0.15,
    "operability": 0.15,
    "cost": 0.10,
    "time_to_market": 0.05,
}

COMPLEXITY_PENALTY = {"low": 0, "medium": -0.5, "high": -1.5}


def score_option(option: dict) -> dict:
    complexity = option.get("complexity", "medium")
    base = 7.0 + COMPLEXITY_PENALTY.get(complexity, 0)
    trade_offs = option.get("trade_offs", {})
    pros = len(trade_offs.get("pros", []))
    cons = len(trade_offs.get("cons", []))

    scores = {}
    for criterion in WEIGHTS:
        adjustment = (pros - cons) * 0.3
        if criterion == "simplicity":
            adjustment += 1.0 if complexity == "low" else (-1.0 if complexity == "high" else 0)
        if criterion == "time_to_market":
            adjustment += 1.0 if complexity == "low" else (-1.5 if complexity == "high" else 0)
        scores[criterion] = round(max(1.0, min(10.0, base + adjustment)), 1)

    weighted = round(sum(scores[k] * WEIGHTS[k] for k in WEIGHTS), 2)
    return {"option_id": option["option_id"], "scores": scores, "weighted_total": weighted}


def score_options(options: list[dict]) -> dict:
    results = [score_option(opt) for opt in options]
    results.sort(key=lambda x: x["weighted_total"], reverse=True)
    for i, r in enumerate(results):
        r["rank"] = i + 1
    return {
        "option_scores": results,
        "recommended_option": results[0]["option_id"] if results else None,
    }


def selftest() -> int:
    options = [
        {"option_id": "OPT-A", "complexity": "low", "trade_offs": {"pros": ["Simple"], "cons": ["Limited scale"]}},
        {"option_id": "OPT-B", "complexity": "high", "trade_offs": {"pros": ["Scales"], "cons": ["Complex", "Costly"]}},
    ]
    result = score_options(options)
    assert result["recommended_option"] == "OPT-A"
    print("PASS: architecture_scorer selftest")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Score architecture options")
    parser.add_argument("--options", help="JSON file with options array")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()
    if args.selftest:
        return selftest()
    if not args.options:
        print("Error: --options required", file=sys.stderr)
        return 1
    options = json.loads(Path(args.options).read_text())
    print(json.dumps(score_options(options), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
