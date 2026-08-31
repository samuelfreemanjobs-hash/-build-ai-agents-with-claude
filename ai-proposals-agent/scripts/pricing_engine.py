#!/usr/bin/env python3
"""
Deterministic pricing engine. No LLM involvement, no floats for money.

The model NEVER computes a price. This module is the sole producer of every
numeric that appears in the pricing section of a proposal.

Run self-tests:  python3 pricing_engine.py --selftest
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass, asdict, field
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from typing import Dict, List

ENGINE_VERSION = "2.0.0"

CENT = Decimal("0.01")


class PricingHalt(Exception):
    """Raised on any condition that must stop the run. Never swallowed."""


def money(value) -> Decimal:
    try:
        return Decimal(str(value)).quantize(CENT, rounding=ROUND_HALF_UP)
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise PricingHalt(f"non-numeric money value: {value!r}") from exc


# ----------------------------------------------------------------------
# Margin policy — the only place margins are defined.
# ----------------------------------------------------------------------

MARGIN_POLICY: Dict[str, Decimal] = {
    "competitive": Decimal("0.18"),
    "balanced": Decimal("0.25"),
    "premium": Decimal("0.32"),
}

MARGIN_FLOOR = Decimal("0.12")   # below this, bid is unprofitable after SG&A
MARGIN_CEILING = Decimal("0.45")  # above this, flag as non-credible


@dataclass(frozen=True)
class CostRow:
    """A validated cost table row. Sourced, never inferred."""
    service_code: str
    unit: str                  # e.g. "mile", "cwt", "pallet_month", "order"
    unit_cost: Decimal
    min_volume: Decimal
    max_volume: Decimal
    fixed_cost: Decimal = Decimal("0")
    source_ref: str = ""

    def validate(self) -> None:
        if self.unit_cost <= 0:
            raise PricingHalt(f"{self.service_code}: unit_cost must be > 0")
        if self.min_volume < 0 or self.max_volume <= self.min_volume:
            raise PricingHalt(f"{self.service_code}: invalid volume range")
        if not self.source_ref:
            raise PricingHalt(f"{self.service_code}: missing source_ref")


@dataclass(frozen=True)
class ScopeLine:
    """A service line drawn from the extracted RFP scope."""
    service_code: str
    volume: Decimal
    description: str = ""


@dataclass
class LineItem:
    service_code: str
    description: str
    unit: str
    volume: Decimal
    unit_cost: Decimal
    fixed_cost: Decimal
    extended_cost: Decimal
    unit_price: Decimal
    extended_price: Decimal
    source_ref: str


@dataclass
class Scenario:
    name: str
    margin_rate: Decimal
    line_items: List[LineItem] = field(default_factory=list)
    total_cost: Decimal = Decimal("0.00")
    total_price: Decimal = Decimal("0.00")
    gross_margin_amount: Decimal = Decimal("0.00")
    gross_margin_pct: Decimal = Decimal("0.00")
    warnings: List[str] = field(default_factory=list)


def _load_cost_rows(raw: List[dict]) -> Dict[str, CostRow]:
    rows: Dict[str, CostRow] = {}
    for r in raw:
        row = CostRow(
            service_code=r["service_code"],
            unit=r["unit"],
            unit_cost=money(r["unit_cost"]),
            min_volume=Decimal(str(r["min_volume"])),
            max_volume=Decimal(str(r["max_volume"])),
            fixed_cost=money(r.get("fixed_cost", 0)),
            source_ref=r.get("source_ref", ""),
        )
        row.validate()
        if row.service_code in rows:
            raise PricingHalt(f"duplicate cost row: {row.service_code}")
        rows[row.service_code] = row
    return rows


def _price_scenario(
    name: str,
    margin_rate: Decimal,
    scope: List[ScopeLine],
    cost_rows: Dict[str, CostRow],
) -> Scenario:
    sc = Scenario(name=name, margin_rate=margin_rate)

    if not (MARGIN_FLOOR <= margin_rate <= MARGIN_CEILING):
        raise PricingHalt(
            f"{name}: margin {margin_rate} outside policy bounds "
            f"[{MARGIN_FLOOR}, {MARGIN_CEILING}]"
        )

    for line in scope:
        row = cost_rows.get(line.service_code)
        if row is None:
            raise PricingHalt(
                f"no cost table row for service_code '{line.service_code}' — "
                f"populate kb/cost-tables/ before pricing this bid"
            )
        if not (row.min_volume <= line.volume <= row.max_volume):
            raise PricingHalt(
                f"{line.service_code}: volume {line.volume} outside validated "
                f"range [{row.min_volume}, {row.max_volume}] — extrapolation "
                f"is not permitted; add a validated cost row for this band"
            )

        extended_cost = money(row.unit_cost * line.volume + row.fixed_cost)
        extended_price = money(extended_cost / (Decimal("1") - margin_rate))
        unit_price = money(
            (extended_price - row.fixed_cost) / line.volume
        ) if line.volume else money(0)

        sc.line_items.append(
            LineItem(
                service_code=line.service_code,
                description=line.description or line.service_code,
                unit=row.unit,
                volume=line.volume,
                unit_cost=row.unit_cost,
                fixed_cost=row.fixed_cost,
                extended_cost=extended_cost,
                unit_price=unit_price,
                extended_price=extended_price,
                source_ref=row.source_ref,
            )
        )

    sc.total_cost = money(sum((li.extended_cost for li in sc.line_items), Decimal("0")))
    sc.total_price = money(sum((li.extended_price for li in sc.line_items), Decimal("0")))
    sc.gross_margin_amount = money(sc.total_price - sc.total_cost)

    if sc.total_price > 0:
        sc.gross_margin_pct = (
            (sc.gross_margin_amount / sc.total_price) * Decimal("100")
        ).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

    return sc


def price(scope_raw: List[dict], cost_rows_raw: List[dict]) -> dict:
    """Entry point. Returns pricing-output.schema.json conformant dict."""
    if not scope_raw:
        raise PricingHalt("empty scope — nothing to price")

    cost_rows = _load_cost_rows(cost_rows_raw)
    scope = [
        ScopeLine(
            service_code=s["service_code"],
            volume=Decimal(str(s["volume"])),
            description=s.get("description", ""),
        )
        for s in scope_raw
    ]

    scenarios = [
        _price_scenario(name, rate, scope, cost_rows)
        for name, rate in MARGIN_POLICY.items()
    ]

    def ser(d):
        return json.loads(json.dumps(asdict(d), default=str))

    return {
        "engine_version": ENGINE_VERSION,
        "recommended": "balanced",
        "scenarios": [ser(s) for s in scenarios],
        "notes": [
            "Margin is computed on price, not as markup on cost.",
            "All figures produced deterministically. Model must not restate.",
        ],
    }


def _selftest() -> int:
    failures = []

    cost_rows = [
        {
            "service_code": "WHSE_PALLET",
            "unit": "pallet_month",
            "unit_cost": "8.50",
            "min_volume": "100",
            "max_volume": "50000",
            "fixed_cost": "0",
            "source_ref": "kb/cost-tables/warehousing.csv#L14",
        },
        {
            "service_code": "FULFILL_ORDER",
            "unit": "order",
            "unit_cost": "2.00",
            "min_volume": "1000",
            "max_volume": "5000000",
            "fixed_cost": "12000.00",
            "source_ref": "kb/cost-tables/fulfillment.csv#L7",
        },
    ]

    scope = [
        {"service_code": "WHSE_PALLET", "volume": "10000"},
        {"service_code": "FULFILL_ORDER", "volume": "100000"},
    ]
    out = price(scope, cost_rows)
    bal = next(s for s in out["scenarios"] if s["name"] == "balanced")

    expected_cost = Decimal("297000.00")
    expected_price = money(expected_cost / Decimal("0.75"))

    if money(bal["total_cost"]) != expected_cost:
        failures.append(f"T1 cost: got {bal['total_cost']} want {expected_cost}")
    if money(bal["total_price"]) != expected_price:
        failures.append(f"T1 price: got {bal['total_price']} want {expected_price}")
    if Decimal(bal["gross_margin_pct"]) != Decimal("25.0"):
        failures.append(f"T1 margin: got {bal['gross_margin_pct']} want 25.0")

    try:
        price([{"service_code": "GHOST_SERVICE", "volume": "10"}], cost_rows)
        failures.append("T2: missing cost row did not halt")
    except PricingHalt:
        pass

    try:
        price([{"service_code": "WHSE_PALLET", "volume": "99999999"}], cost_rows)
        failures.append("T3: out-of-band volume did not halt")
    except PricingHalt:
        pass

    try:
        bad = [dict(cost_rows[0])]
        bad[0]["source_ref"] = ""
        price([{"service_code": "WHSE_PALLET", "volume": "1000"}], bad)
        failures.append("T4: missing source_ref did not halt")
    except PricingHalt:
        pass

    try:
        price([], cost_rows)
        failures.append("T5: empty scope did not halt")
    except PricingHalt:
        pass

    if {s["name"] for s in out["scenarios"]} != {"competitive", "balanced", "premium"}:
        failures.append("T6: scenario set incorrect")

    comp = next(s for s in out["scenarios"] if s["name"] == "competitive")
    prem = next(s for s in out["scenarios"] if s["name"] == "premium")
    if not (money(prem["total_price"]) > money(bal["total_price"]) > money(comp["total_price"])):
        failures.append("T7: scenario price ordering violated")

    if any(isinstance(li["extended_price"], float) for s in out["scenarios"] for li in s["line_items"]):
        failures.append("T8: float found in money field")

    if failures:
        print("SELFTEST FAILED")
        for f in failures:
            print("  -", f)
        return 1

    print(f"SELFTEST PASSED — pricing_engine {ENGINE_VERSION} — 8/8")
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--scope", help="path to scope JSON")
    ap.add_argument("--costs", help="path to cost rows JSON")
    args = ap.parse_args()

    if args.selftest:
        sys.exit(_selftest())

    if not (args.scope and args.costs):
        ap.error("--scope and --costs required unless --selftest")

    with open(args.scope) as f:
        scope = json.load(f)
    with open(args.costs) as f:
        costs = json.load(f)

    try:
        print(json.dumps(price(scope, costs), indent=2))
    except PricingHalt as e:
        print(json.dumps({"status": "HALT", "reason": str(e)}, indent=2))
        sys.exit(2)
