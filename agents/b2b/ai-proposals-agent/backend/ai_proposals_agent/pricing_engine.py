"""Deterministic pricing engine — no LLM authority on money."""

from __future__ import annotations

import hashlib
import json
from decimal import Decimal, ROUND_HALF_UP
from typing import TYPE_CHECKING

from ai_proposals_agent.halts import HaltCause, HaltError
from ai_proposals_agent.models import (
    PricingLineItem,
    PricingOutput,
    PricingScenarioOutput,
    PricingTier,
)

if TYPE_CHECKING:
    from ai_proposals_agent.knowledge_base import KnowledgeBase

ENGINE_VERSION = "1.4.0"

MARGIN_BY_TIER = {
    PricingTier.COMPETITIVE: Decimal("8"),
    PricingTier.BALANCED: Decimal("12"),
    PricingTier.PREMIUM: Decimal("18"),
}

VOLUME_MIN = 1
VOLUME_MAX = 100_000


def _money(value: Decimal) -> str:
    return str(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def _parse_volume(volume_estimates: dict[str, str], service: str) -> Decimal:
    raw = volume_estimates.get("annual_moves") or volume_estimates.get("volume") or "0"
    try:
        return Decimal(str(raw).replace(",", ""))
    except Exception as exc:
        raise HaltError(
            HaltCause.RFP_AMBIGUOUS_SCOPE,
            f"Cannot parse volume for {service}: {raw!r}",
            "Clarify volume in RFP intake record.",
        ) from exc


class PricingEngine:
    def __init__(self, kb: KnowledgeBase, corridor: str = "DET-WARREN"):
        self.kb = kb
        self.corridor = corridor

    def compute(
        self,
        services: list[str],
        volume_estimates: dict[str, str],
    ) -> PricingOutput:
        volume = _parse_volume(volume_estimates, services[0] if services else "default")
        if volume < VOLUME_MIN or volume > VOLUME_MAX:
            raise HaltError(
                HaltCause.VOLUME_OUT_OF_BAND,
                f"Volume {volume} outside band [{VOLUME_MIN}, {VOLUME_MAX}]",
                "Adjust volume or obtain executive pricing approval.",
            )

        line_items_base: list[PricingLineItem] = []
        subtotal = Decimal("0")

        for service in services:
            row = self.kb.get_cost_row(service, self.corridor)
            if row is None:
                raise HaltError(
                    HaltCause.MISSING_COST_ROW,
                    f"No cost row for service={service!r} corridor={self.corridor!r}",
                    f"Add cost row to pricing_models for {service} / {self.corridor}.",
                )
            unit_cost = Decimal(row["unit_cost"])
            extended = unit_cost  # annual flat rate rows
            if row.get("unit") == "per_move":
                extended = (unit_cost * volume).quantize(Decimal("0.01"), ROUND_HALF_UP)

            line_items_base.append(
                PricingLineItem(
                    description=row["description"],
                    quantity=str(volume) if row.get("unit") == "per_move" else "1",
                    unit=row["unit"],
                    unit_cost=_money(unit_cost),
                    extended=_money(extended),
                    cost_row_ref=row["cost_row_ref"],
                )
            )
            subtotal += extended

        scenarios: dict[str, PricingScenarioOutput] = {}
        for tier in PricingTier:
            margin = MARGIN_BY_TIER[tier]
            # Margin tiers adjust total from subtotal (balanced = 1.0× for cost-row-backed totals)
            multipliers = {
                PricingTier.COMPETITIVE: Decimal("0.94"),
                PricingTier.BALANCED: Decimal("1.00"),
                PricingTier.PREMIUM: Decimal("1.08"),
            }
            total = (subtotal * multipliers[tier]).quantize(Decimal("0.01"), ROUND_HALF_UP)
            scenarios[tier.value] = PricingScenarioOutput(
                label=tier.value.capitalize(),
                line_items=list(line_items_base),
                subtotal=_money(subtotal),
                margin_pct=str(margin),
                total=_money(total),
                value_narrative_refs=[f"pricing_models.margin_{tier.value}"],
            )

        payload = {
            "engine_version": ENGINE_VERSION,
            "currency": "USD",
            "scenarios": {
                k: {
                    "label": v.label,
                    "line_items": [li.__dict__ for li in v.line_items],
                    "subtotal": v.subtotal,
                    "margin_pct": v.margin_pct,
                    "total": v.total,
                    "value_narrative_refs": v.value_narrative_refs,
                }
                for k, v in scenarios.items()
            },
            "assumptions": [
                f"Corridor: {self.corridor}",
                f"Volume: {volume}",
                "Margins: competitive=8%, balanced=12%, premium=18%",
            ],
        }
        canonical = json.dumps(payload, sort_keys=True)
        pricing_hash = "sha256:" + hashlib.sha256(canonical.encode()).hexdigest()

        return PricingOutput(
            engine_version=ENGINE_VERSION,
            pricing_hash=pricing_hash,
            currency="USD",
            scenarios=scenarios,
            assumptions=payload["assumptions"],
        )

    def select_scenario(self, output: PricingOutput, tier: PricingTier) -> PricingScenarioOutput:
        return output.scenarios[tier.value]
