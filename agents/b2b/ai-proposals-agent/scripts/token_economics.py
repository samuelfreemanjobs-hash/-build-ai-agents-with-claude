#!/usr/bin/env python3
"""
Architecture cost gate. Referenced by ADR-001 §2.

No number in ADR-001 is hand-computed. This script is the source. Run it and
paste the output block into the ADR when constants change.

    python3 token_economics.py
    python3 token_economics.py --selftest
"""

from __future__ import annotations

import argparse
import sys
from decimal import Decimal, ROUND_HALF_UP

LAST_VERIFIED = "2026-08-10"

RATE_CARD = {
    "input_per_mtok": Decimal("15.00"),
    "output_per_mtok": Decimal("75.00"),
}

SINGLE_AGENT_TOKENS = {
    "input": Decimal("44000"),
    "output": Decimal("13000"),
}

MULTI_AGENT_RATIO_LOW = Decimal("10")
MULTI_AGENT_RATIO_HIGH = Decimal("15")

LOWEST_TIER_MONTHLY = Decimal("497.00")
LOWEST_TIER_INCLUDED_PROPOSALS = Decimal("5")
MIN_GROSS_MARGIN = Decimal("0.95")

CENT = Decimal("0.01")


def _m(v: Decimal) -> Decimal:
    return v.quantize(CENT, rounding=ROUND_HALF_UP)


def cost_per_proposal(input_tokens: Decimal, output_tokens: Decimal) -> Decimal:
    mtok = Decimal("1000000")
    return _m(
        (input_tokens / mtok) * RATE_CARD["input_per_mtok"]
        + (output_tokens / mtok) * RATE_CARD["output_per_mtok"]
    )


def report() -> dict:
    single = cost_per_proposal(
        SINGLE_AGENT_TOKENS["input"], SINGLE_AGENT_TOKENS["output"]
    )
    multi_low = _m(single * MULTI_AGENT_RATIO_LOW)
    multi_high = _m(single * MULTI_AGENT_RATIO_HIGH)

    revenue_per_proposal = _m(LOWEST_TIER_MONTHLY / LOWEST_TIER_INCLUDED_PROPOSALS)
    cogs_ceiling = _m(revenue_per_proposal * (Decimal("1") - MIN_GROSS_MARGIN))

    single_margin = _m(
        ((revenue_per_proposal - single) / revenue_per_proposal) * Decimal("100")
    )
    multi_margin_high = _m(
        ((revenue_per_proposal - multi_high) / revenue_per_proposal) * Decimal("100")
    )

    return {
        "last_verified": LAST_VERIFIED,
        "single_agent_cost": single,
        "multi_agent_cost_low": multi_low,
        "multi_agent_cost_high": multi_high,
        "revenue_per_proposal": revenue_per_proposal,
        "cogs_ceiling": cogs_ceiling,
        "single_agent_margin_pct": single_margin,
        "multi_agent_margin_pct_worst": multi_margin_high,
        "single_agent_gate": "PASS" if single <= cogs_ceiling else "FAIL",
        "multi_agent_gate": "PASS" if multi_high <= cogs_ceiling else "FAIL",
    }


def main() -> int:
    r = report()
    print("=" * 58)
    print(" ARCHITECTURE COST GATE — ADR-001 §2")
    print(f" rate card last verified: {r['last_verified']}")
    print("=" * 58)
    print(f" Single-agent cost / proposal      ${r['single_agent_cost']}")
    print(f" Multi-agent cost / proposal (10x) ${r['multi_agent_cost_low']}")
    print(f" Multi-agent cost / proposal (15x) ${r['multi_agent_cost_high']}")
    print("-" * 58)
    print(f" Revenue / proposal (Starter tier) ${r['revenue_per_proposal']}")
    print(f" COGS ceiling @ {MIN_GROSS_MARGIN:.0%} GM          ${r['cogs_ceiling']}")
    print("-" * 58)
    print(f" Single-agent gross margin         {r['single_agent_margin_pct']}%")
    print(f" Multi-agent gross margin (worst)  {r['multi_agent_margin_pct_worst']}%")
    print("-" * 58)
    print(f" SINGLE-AGENT GATE: {r['single_agent_gate']}")
    print(f" MULTI-AGENT GATE:  {r['multi_agent_gate']}")
    print("=" * 58)

    if r["single_agent_gate"] != "PASS":
        print("\nWARNING: selected architecture fails its own cost gate.")
        return 1
    return 0


def _selftest() -> int:
    failures = []
    r = report()

    if r["single_agent_cost"] <= 0:
        failures.append("non-positive single agent cost")
    if not (r["multi_agent_cost_low"] < r["multi_agent_cost_high"]):
        failures.append("multi-agent band inverted")
    if r["multi_agent_cost_low"] <= r["single_agent_cost"]:
        failures.append("multi-agent cost not above single-agent")

    if r["single_agent_cost"] != Decimal("1.64"):
        failures.append(f"arithmetic drift: {r['single_agent_cost']} want 1.64")

    if r["cogs_ceiling"] != Decimal("4.97"):
        failures.append(f"cogs ceiling {r['cogs_ceiling']} want 4.97")

    if failures:
        print("SELFTEST FAILED")
        for f in failures:
            print("  -", f)
        return 1
    print("SELFTEST PASSED — token_economics — 5/5")
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()
    sys.exit(_selftest() if args.selftest else main())
