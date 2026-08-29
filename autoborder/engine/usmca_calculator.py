"""Deterministic USMCA Annex 4-B Regional Value Content calculator.

The LLM never calculates — only this module performs RVC math.
"""

from __future__ import annotations

from autoborder.models import (
    BOMComponent,
    BOMTree,
    ComponentRVCDetail,
    CostLineItem,
    OriginStatus,
    RVCCalculationResult,
)

USMCA_RVC_THRESHOLD = 75.0
USMCA_ORIGIN_COUNTRIES = frozenset({"US", "MX", "CA"})
EXCLUDED_CATEGORIES = frozenset({"packing", "warranty", "royalty"})


class USMCACalculator:
    """
    Build-down RVC calculation per USMCA Annex 4-B:

        RVC = ((Net Cost - Value of Non-Originating Materials) / Net Cost) * 100

    Exclusions: packing, warranty, royalties removed from Net Cost.
    Tracing: partially originating sub-components contribute proportionally.
    """

    def __init__(self, usmca_threshold: float = USMCA_RVC_THRESHOLD) -> None:
        self.usmca_threshold = usmca_threshold

    def calculate(self, bom: BOMTree) -> RVCCalculationResult:
        trace: list[str] = []
        excluded_costs: list[CostLineItem] = []
        component_details: list[ComponentRVCDetail] = []

        net_cost, non_originating_value = self._rollup(
            bom.root,
            component_details,
            excluded_costs,
            trace,
            depth=0,
        )

        if net_cost <= 0:
            raise ValueError(f"Net cost must be positive for part {bom.root_part_number}")

        rvc = ((net_cost - non_originating_value) / net_cost) * 100.0
        trace.append(
            f"RVC = (({net_cost:.4f} - {non_originating_value:.4f}) / {net_cost:.4f}) * 100 "
            f"= {rvc:.1f}%"
        )

        return RVCCalculationResult(
            part_number=bom.root_part_number,
            description=bom.description,
            net_cost=round(net_cost, 4),
            value_non_originating_materials=round(non_originating_value, 4),
            rvc_percentage=round(rvc, 1),
            meets_usmca_threshold=rvc >= self.usmca_threshold,
            usmca_threshold=self.usmca_threshold,
            method="build-down",
            component_details=component_details,
            excluded_costs=excluded_costs,
            calculation_trace=trace,
        )

    def _rollup(
        self,
        component: BOMComponent,
        details: list[ComponentRVCDetail],
        excluded: list[CostLineItem],
        trace: list[str],
        depth: int,
    ) -> tuple[float, float]:
        indent = "  " * depth
        gross_cost = component.extended_cost

        for line in component.cost_lines:
            if line.excluded_from_net_cost or line.category in EXCLUDED_CATEGORIES:
                excluded.append(line)
                trace.append(f"{indent}Exclude {line.description}: ${line.amount:.2f} ({line.category})")
                gross_cost -= line.amount

        if not component.children:
            non_orig = self._non_originating_value(component, gross_cost, trace, indent)
            details.append(
                ComponentRVCDetail(
                    part_number=component.part_number,
                    description=component.description,
                    origin_status=component.origin_status,
                    gross_cost=round(gross_cost, 4),
                    non_originating_value=round(non_orig, 4),
                    net_cost_contribution=round(gross_cost, 4),
                    originating_content_pct=component.originating_content_pct,
                    erp_transaction_id=component.erp_transaction_id,
                )
            )
            return gross_cost, non_orig

        child_net = 0.0
        child_non_orig = 0.0
        for child in component.children:
            c_net, c_non = self._rollup(child, details, excluded, trace, depth + 1)
            child_net += c_net
            child_non_orig += c_non

        assembly_delta = max(gross_cost - sum(c.extended_cost for c in component.children), 0.0)
        total_net = child_net + assembly_delta
        total_non_orig = child_non_orig + self._non_originating_value(
            component, assembly_delta, trace, indent, label="assembly overhead"
        )

        trace.append(
            f"{indent}{component.part_number}: net=${total_net:.2f}, "
            f"non-orig=${total_non_orig:.2f}"
        )

        details.append(
            ComponentRVCDetail(
                part_number=component.part_number,
                description=component.description,
                origin_status=component.origin_status,
                gross_cost=round(total_net, 4),
                non_originating_value=round(total_non_orig, 4),
                net_cost_contribution=round(total_net, 4),
                originating_content_pct=component.originating_content_pct,
                erp_transaction_id=component.erp_transaction_id,
            )
        )
        return total_net, total_non_orig

    def _non_originating_value(
        self,
        component: BOMComponent,
        cost: float,
        trace: list[str],
        indent: str,
        label: str | None = None,
    ) -> float:
        if cost <= 0:
            return 0.0

        part_label = label or component.part_number
        status = component.origin_status
        pct = component.originating_content_pct

        if status == OriginStatus.NON_ORIGINATING:
            trace.append(f"{indent}{part_label}: 100% non-originating → ${cost:.2f}")
            return cost

        if status == OriginStatus.ORIGINATING and (pct is None or pct >= 100.0):
            trace.append(f"{indent}{part_label}: 100% originating → $0.00 non-orig")
            return 0.0

        if pct is not None and 0.0 < pct < 100.0:
            non_orig = cost * (1.0 - pct / 100.0)
            trace.append(
                f"{indent}{part_label}: {pct:.0f}% originating → "
                f"non-orig ${non_orig:.2f} of ${cost:.2f}"
            )
            return non_orig

        if component.origin_country and component.origin_country.upper() not in USMCA_ORIGIN_COUNTRIES:
            trace.append(f"{indent}{part_label}: foreign origin ({component.origin_country}) → ${cost:.2f}")
            return cost

        trace.append(f"{indent}{part_label}: assumed originating → $0.00 non-orig")
        return 0.0

    def trace_subcomponent(self, component: BOMComponent, originating_pct: float) -> float:
        """
        Tracing function: if a sub-component is X% originating, only (100-X)% of its
        cost counts toward non-originating materials.
        """
        if originating_pct < 0 or originating_pct > 100:
            raise ValueError("originating_pct must be between 0 and 100")
        return component.extended_cost * (1.0 - originating_pct / 100.0)
