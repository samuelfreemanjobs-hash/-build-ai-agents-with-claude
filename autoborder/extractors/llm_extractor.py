"""LLM-powered cost sheet extraction with confidence scoring and guardrails."""

from __future__ import annotations

import json
import re
from typing import Any

from autoborder.config.settings import Settings, get_settings
from autoborder.models import CostExtractionResult

EXTRACTION_PROMPT = """You are an extraction agent for USMCA customs compliance.
Given messy spreadsheet or PDF text, extract cost fields ONLY. Do NOT calculate RVC or totals.

Output valid JSON with these keys:
- material_cost (number or null)
- packing_cost (number or null)
- warranty_cost (number or null)
- royalty_cost (number or null)
- tooling_amortization (number or null)
- other_costs (object mapping description to amount)
- confidence_score (0.0 to 1.0 — your confidence in the extraction)
- flagged_fields (array of field names needing human review)
- raw_notes (brief explanation of ambiguous items)

Rules:
- Packing, warranty, and royalty costs must be flagged for USMCA exclusion.
- "Lump-sum tooling amortization" is typically material/manufacturing cost unless marked as royalty.
- If unsure, set the field to null and add it to flagged_fields.
- Do not hallucinate numbers not present in the source text.

Source text:
{text}
"""

CONFIDENCE_THRESHOLD = 0.90
RANGE_CHECK_MULTIPLIER = 3.0


class LLMCostExtractor:
    """
    Extract messy human-entered cost fields into structured JSON.

    Guardrails:
    - Confidence score < 90% flags human review
    - Range check rejects values > 300% of historical average
    - LLM extracts only; USMCACalculator performs all math
    """

    def __init__(
        self,
        settings: Settings | None = None,
        historical_averages: dict[str, float] | None = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.historical_averages = historical_averages or {}

    def extract(self, raw_text: str, part_number: str | None = None) -> CostExtractionResult:
        if self.settings.openai_api_key:
            payload = self._extract_with_openai(raw_text)
        else:
            payload = self._extract_with_heuristics(raw_text)

        result = CostExtractionResult.model_validate(payload)
        result = self._apply_range_checks(result, part_number)
        if result.confidence_score < CONFIDENCE_THRESHOLD:
            for field in ("material_cost", "packing_cost", "warranty_cost", "royalty_cost"):
                if getattr(result, field) is not None and field not in result.flagged_fields:
                    result.flagged_fields.append(field)
        return result

    def _extract_with_openai(self, raw_text: str) -> dict[str, Any]:
        from openai import OpenAI

        client = OpenAI(api_key=self.settings.openai_api_key)
        response = client.chat.completions.create(
            model=self.settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": "You extract structured cost data. Respond with JSON only.",
                },
                {"role": "user", "content": EXTRACTION_PROMPT.format(text=raw_text)},
            ],
            response_format={"type": "json_object"},
            temperature=0.0,
        )
        content = response.choices[0].message.content or "{}"
        return json.loads(content)

    def _extract_with_heuristics(self, raw_text: str) -> dict[str, Any]:
        """Fallback extractor when OpenAI is not configured."""

        def find_amount(patterns: list[str]) -> float | None:
            for pattern in patterns:
                match = re.search(pattern, raw_text, re.IGNORECASE)
                if match:
                    return float(match.group(1).replace(",", ""))
            return None

        material = find_amount(
            [
                r"material\s+cost[:\s]+\$?([\d,]+\.?\d*)",
                r"raw\s+material[:\s]+\$?([\d,]+\.?\d*)",
            ]
        )
        packing = find_amount([r"packing\s+(?:cost|materials?)[:\s]+\$?([\d,]+\.?\d*)"])
        warranty = find_amount([r"warranty\s+(?:cost|reserve)[:\s]+\$?([\d,]+\.?\d*)"])
        royalty = find_amount([r"royalty[:\s]+\$?([\d,]+\.?\d*)"])
        tooling = find_amount(
            [
                r"tooling\s+amortization[:\s]+\$?([\d,]+\.?\d*)",
                r"lump[- ]sum\s+tooling[:\s]+\$?([\d,]+\.?\d*)",
            ]
        )

        flagged: list[str] = []
        found_count = sum(1 for v in [material, packing, warranty, royalty, tooling] if v is not None)
        confidence = min(0.85, 0.5 + found_count * 0.1)

        if tooling is not None:
            flagged.append("tooling_amortization")

        return {
            "material_cost": material,
            "packing_cost": packing,
            "warranty_cost": warranty,
            "royalty_cost": royalty,
            "tooling_amortization": tooling,
            "other_costs": {},
            "confidence_score": confidence,
            "flagged_fields": flagged,
            "raw_notes": "Heuristic extraction (OpenAI not configured)",
        }

    def _apply_range_checks(
        self, result: CostExtractionResult, part_number: str | None
    ) -> CostExtractionResult:
        if not part_number or part_number not in self.historical_averages:
            return result

        average = self.historical_averages[part_number]
        if result.material_cost is not None and result.material_cost > average * RANGE_CHECK_MULTIPLIER:
            result.flagged_fields.append("material_cost_range_check")
            result.raw_notes = (
                (result.raw_notes or "")
                + f" Material cost ${result.material_cost:.2f} exceeds "
                f"{RANGE_CHECK_MULTIPLIER}x historical average ${average:.2f}."
            ).strip()
            result.material_cost = None
            result.confidence_score = min(result.confidence_score, 0.5)

        return result
