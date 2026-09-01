"""Knowledge base — sample data + cost rows for pricing engine."""

from __future__ import annotations

from ai_proposals_agent.models import CaseStudy


class KnowledgeBase:
    """In-memory KB. Replace with Postgres per docs/knowledge-base.md."""

    def __init__(self):
        self.case_studies = self._load_sample_cases()
        self.certifications = self._load_certifications()
        self.differentiators = [
            "98.2% OTIF on comparable automotive inbound lanes",
            "Real-time visibility across dedicated shuttle network",
            "24/7 dedicated customer support",
            "ISO 9001:2015 certified operations",
        ]
        self._cost_rows = self._load_cost_rows()
        self._insurance_limit = 1_000_000

    def _load_sample_cases(self) -> list[CaseStudy]:
        return [
            CaseStudy(
                case_id="CS001",
                client_name="Major Automotive Manufacturer",
                industry="Automotive",
                challenge="Needed to reduce transit times for JIT manufacturing inbound",
                solution="Implemented dedicated milk-run fleet with real-time routing",
                results=["98.2% OTIF achievement", "$2.3M annual savings", "35% transit time reduction"],
                relevance_score=0.0,
                challenge_tags=["JIT", "inbound", "automotive"],
                solution_tags=["dedicated-fleet", "milk-run"],
                source_ref="case_studies.ford_inbound_2024",
            ),
            CaseStudy(
                case_id="CS002",
                client_name="National Retail Chain",
                industry="Retail",
                challenge="Peak season capacity constraints and stockouts",
                solution="Deployed flex capacity network with predictive analytics",
                results=["100% peak demand fulfillment", "40% reduction in stockouts"],
                relevance_score=0.0,
                challenge_tags=["capacity", "seasonality"],
                solution_tags=["flex-capacity"],
                source_ref="case_studies.retail_peak_2023",
            ),
            CaseStudy(
                case_id="CS003",
                client_name="Industrial Steel Supplier",
                industry="Industrial",
                challenge="Coil inbound staging and OTIF for stamping plant",
                solution="Yard management + ASN compliance desk",
                results=["99.1% OTIF", "Zero line-down from inbound in 12 months"],
                relevance_score=0.0,
                challenge_tags=["steel", "inbound", "OTIF"],
                solution_tags=["yard", "ASN"],
                source_ref="case_studies.steel_coil_2023",
            ),
        ]

    def _load_certifications(self) -> dict:
        return {
            "ISO_9001": {
                "name": "ISO 9001:2015 Quality Management",
                "number": "ISO-12345",
                "expiry": "2026-11-30",
            },
            "CTPAT": {
                "name": "C-TPAT Certified",
                "number": "CTPAT-67890",
                "expiry": "2025-06-30",  # expired for demo GAP
            },
        }

    def _load_cost_rows(self) -> dict[tuple[str, str], dict]:
        """service_type + corridor -> cost row."""
        return {
            ("dedicated_shuttle", "DET-WARREN"): {
                "cost_row_ref": "pricing_models.row_shuttle_det_warren_annual",
                "description": "Dedicated inbound shuttle",
                "unit": "annual",
                "unit_cost": "240000.00",
            },
            ("yard_management", "DET-WARREN"): {
                "cost_row_ref": "pricing_models.row_yard_det_warren_annual",
                "description": "Yard management",
                "unit": "annual",
                "unit_cost": "84000.00",
            },
            ("asn_compliance_desk", "DET-WARREN"): {
                "cost_row_ref": "pricing_models.row_asn_det_warren_annual",
                "description": "ASN compliance desk",
                "unit": "annual",
                "unit_cost": "72000.00",
            },
            ("warehousing", "DEFAULT"): {
                "cost_row_ref": "pricing_models.row_wh_default",
                "description": "Warehousing & fulfillment",
                "unit": "annual",
                "unit_cost": "450000.00",
            },
            ("order_fulfillment", "DEFAULT"): {
                "cost_row_ref": "pricing_models.row_fulfill_default",
                "description": "Order fulfillment operations",
                "unit": "annual",
                "unit_cost": "180000.00",
            },
        }

    def get_all_case_studies(self) -> list[CaseStudy]:
        return list(self.case_studies)

    def get_company_differentiators(self) -> list[str]:
        return self.differentiators

    def get_win_themes(self, industry: str) -> list[str]:
        themes = {
            "Automotive": ["JIT reliability", "OTIF", "Scalability"],
            "E-commerce Retail": ["Peak capacity", "Speed", "Visibility"],
            "Retail": ["Peak capacity", "Omnichannel", "Speed to market"],
            "Industrial": ["OTIF", "Yard efficiency", "ASN quality"],
        }
        return themes.get(industry, ["Reliability", "Innovation", "Service"])

    def get_cost_row(self, service: str, corridor: str) -> dict | None:
        key = (service.lower().replace(" ", "_"), corridor)
        if key in self._cost_rows:
            return self._cost_rows[key]
        key_default = (service.lower().replace(" ", "_"), "DEFAULT")
        return self._cost_rows.get(key_default)

    def get_market_rates(self, industry: str) -> dict:
        return {"industry_premium": 1.10 if industry == "Healthcare" else 1.0}

    def get_certifications(self) -> dict:
        return self.certifications

    def get_insurance_limit(self) -> int:
        return self._insurance_limit

    def map_services_from_rfp(self, services_requested: list[str]) -> list[str]:
        """Map free-text RFP services to KB service keys."""
        mapping = {
            "warehousing": "warehousing",
            "fulfillment": "order_fulfillment",
            "order fulfillment": "order_fulfillment",
            "dedicated": "dedicated_shuttle",
            "shuttle": "dedicated_shuttle",
            "yard": "yard_management",
            "asn": "asn_compliance_desk",
        }
        result: list[str] = []
        for svc in services_requested:
            lower = svc.lower()
            matched = False
            for pattern, key in mapping.items():
                if pattern in lower:
                    result.append(key)
                    matched = True
                    break
            if not matched:
                result.append(lower.replace(" ", "_"))
        return result or ["warehousing"]
