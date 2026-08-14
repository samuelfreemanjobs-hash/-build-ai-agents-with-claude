"""Pricing engine tests."""

from decimal import Decimal

import pytest

from ai_proposals_agent.halts import HaltCause, HaltError
from ai_proposals_agent.knowledge_base import KnowledgeBase
from ai_proposals_agent.pricing_engine import PricingEngine


def test_three_scenarios_det_warren():
    kb = KnowledgeBase()
    engine = PricingEngine(kb, corridor="DET-WARREN")
    out = engine.compute(
        ["dedicated_shuttle", "yard_management", "asn_compliance_desk"],
        {"annual_moves": "1200"},
    )
    assert out.pricing_hash.startswith("sha256:")
    balanced = out.scenarios["balanced"]
    assert balanced.total == "396000.00"
    assert balanced.margin_pct == "12"
    competitive = out.scenarios["competitive"]
    assert Decimal(competitive.total) < Decimal(balanced.total)


def test_missing_cost_row_halts():
    kb = KnowledgeBase()
    engine = PricingEngine(kb, corridor="DET-WARREN")
    with pytest.raises(HaltError) as exc:
        engine.compute(["nonexistent_service_xyz"], {"volume": "100"})
    assert exc.value.cause == HaltCause.MISSING_COST_ROW
    assert not exc.value.overridable


def test_volume_out_of_band_halts():
    kb = KnowledgeBase()
    engine = PricingEngine(kb, corridor="DET-WARREN")
    with pytest.raises(HaltError) as exc:
        engine.compute(["dedicated_shuttle"], {"volume": "999999"})
    assert exc.value.cause == HaltCause.VOLUME_OUT_OF_BAND


def test_money_fields_are_strings():
    kb = KnowledgeBase()
    engine = PricingEngine(kb, corridor="DET-WARREN")
    out = engine.compute(["dedicated_shuttle"], {"volume": "100"})
    item = out.scenarios["balanced"].line_items[0]
    assert isinstance(item.unit_cost, str)
    assert isinstance(item.extended, str)
