"""Tariff Leak Calculator — estimate duty overpayment from BOM uploads."""

from __future__ import annotations

import uuid

from autoborder.engine.usmca_calculator import USMCACalculator
from autoborder.graph.traversal import GraphTraversalService
from autoborder.graph.neo4j_mapper import Neo4jGraphMapper
from autoborder.models import (
    BOMTree,
    LeakLineItem,
    TariffLeakInput,
    TariffLeakResult,
)


class TariffLeakCalculator:
    """
    GTM hook: quantify duty overpaid last quarter from a single BOM upload.

    Scenarios:
    - compliant + paid MFN → missed preferential treatment (overpayment)
    - non-compliant + claimed USMCA → penalty exposure + duty at risk
    - non-compliant + paid MFN → sourcing gap recommendation
    """

    PENALTY_RATE = 0.20

    def analyze(self, bom: BOMTree, inputs: TariffLeakInput) -> TariffLeakResult:
        rvc = USMCACalculator().calculate(bom)
        snapshot = Neo4jGraphMapper().build_snapshot(bom)
        paths = GraphTraversalService(snapshot).find_non_originating_paths()

        quarterly_value = round(rvc.net_cost * inputs.quarterly_units, 2)
        mfn_rate = inputs.mfn_duty_rate_pct / 100.0
        usmca_rate = 0.0 if rvc.meets_usmca_threshold else mfn_rate

        duty_paid = self._duty_paid(quarterly_value, mfn_rate, inputs)
        duty_should = round(quarterly_value * usmca_rate, 2)
        overpaid = max(round(duty_paid - duty_should, 2), 0.0)
        penalty = self._penalty_exposure(quarterly_value, mfn_rate, inputs, rvc.meets_usmca_threshold)

        leak_type, headline, recommendation = self._messaging(
            rvc.meets_usmca_threshold,
            rvc.rvc_percentage,
            overpaid,
            penalty,
            inputs.claimed_usmca_preferential,
        )
        top_leaks = self._top_leaks(paths, rvc, inputs)

        return TariffLeakResult(
            report_id=str(uuid.uuid4())[:8].upper(),
            company_name=inputs.company_name,
            part_number=rvc.part_number,
            part_description=rvc.description,
            rvc_percentage=rvc.rvc_percentage,
            meets_usmca_threshold=rvc.meets_usmca_threshold,
            net_cost_per_unit=rvc.net_cost,
            quarterly_import_value=quarterly_value,
            mfn_duty_rate_pct=inputs.mfn_duty_rate_pct,
            usmca_duty_rate_pct=usmca_rate * 100.0,
            duty_paid_last_quarter=duty_paid,
            duty_should_have_paid=duty_should,
            overpaid_last_quarter=overpaid,
            annual_savings_potential=round(overpaid * 4, 2),
            penalty_exposure=penalty,
            leak_type=leak_type,
            headline=headline,
            recommendation=recommendation,
            top_leaks=top_leaks,
            non_originating_paths=paths[:5],
            rvc_result=rvc,
        )

    @staticmethod
    def _duty_paid(quarterly_value: float, mfn_rate: float, inputs: TariffLeakInput) -> float:
        if inputs.paid_mfn_duty:
            return round(quarterly_value * mfn_rate, 2)
        if inputs.claimed_usmca_preferential:
            return 0.0
        return round(quarterly_value * mfn_rate, 2)

    def _penalty_exposure(
        self,
        quarterly_value: float,
        mfn_rate: float,
        inputs: TariffLeakInput,
        meets_threshold: bool,
    ) -> float:
        if inputs.claimed_usmca_preferential and not meets_threshold:
            underpaid = quarterly_value * mfn_rate
            return round(underpaid * self.PENALTY_RATE, 2)
        return 0.0

    @staticmethod
    def _messaging(
        meets_threshold: bool,
        rvc_pct: float,
        overpaid: float,
        penalty: float,
        claimed_usmca: bool,
    ) -> tuple[str, str, str]:
        if meets_threshold and overpaid > 0:
            return (
                "missed_preferential",
                f"You overpaid ${overpaid:,.0f} in duty last quarter",
                "You qualify for USMCA preferential treatment (0% duty) but paid MFN rates. "
                "AutoBorder Comply delivers CBP-ready proof in 72 hours — guaranteed.",
            )
        if not meets_threshold and claimed_usmca and penalty > 0:
            return (
                "penalty_exposure",
                f"${penalty:,.0f} CBP penalty exposure detected",
                "Your BOM does not meet the 75% RVC threshold but USMCA preferential treatment was claimed. "
                "We can identify sourcing changes to close the gap before CBP does.",
            )
        if not meets_threshold:
            gap = round(75.0 - rvc_pct, 1)
            return (
                "rvc_gap",
                f"{gap}% RVC gap — USMCA compliance at risk",
                f"RVC is {rvc_pct}% (need 75%). Replacing flagged non-originating components "
                "could unlock 0% USMCA duty treatment.",
            )
        return (
            "compliant",
            "USMCA compliant — $0 preferential duty available",
            "Your RVC passes. Ensure your customs broker claims USMCA on every entry to avoid MFN overpayment.",
        )

    @staticmethod
    def _top_leaks(paths, rvc, inputs: TariffLeakInput) -> list[LeakLineItem]:
        leaks: list[LeakLineItem] = []
        for path in paths[:3]:
            leaks.append(
                LeakLineItem(
                    category="non_originating_path",
                    description=path.headline,
                    amount_usd=path.total_extended_cost * inputs.quarterly_units,
                )
            )
        if rvc.value_non_originating_materials > 0:
            leaks.append(
                LeakLineItem(
                    category="non_originating_materials",
                    description="Total non-originating material value per unit",
                    amount_usd=round(rvc.value_non_originating_materials * inputs.quarterly_units, 2),
                )
            )
        return leaks
