#!/usr/bin/env python3
"""Revenue Opportunity Diagnostic scorer — deterministic binding facts."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

CONFIG_DIR = Path(__file__).resolve().parents[1] / "config"


def load_config() -> tuple[dict, dict]:
    questions = json.loads((CONFIG_DIR / "questions.json").read_text())
    rules = json.loads((CONFIG_DIR / "scoring-rules.json").read_text())
    return questions, rules


def score_responses(responses: dict, industry: str = "other", company_size: str = "mid") -> dict:
    """Score diagnostic responses. responses: {area_id: 1-5 score}."""
    _, rules = load_config()
    area_scores = {area: int(responses.get(area, 3)) for area in responses}
    if not area_scores:
        raise ValueError("No area responses provided")

    # Revenue Intelligence Score: average * 20 (1-5 scale → 20-100)
    avg = sum(area_scores.values()) / len(area_scores)
    intelligence_score = round(avg * 20)

    # Rank areas by score (lowest = biggest opportunity)
    ranked = sorted(area_scores.items(), key=lambda x: x[1])
    weakest = [area for area, _ in ranked[:3]]

    opportunities = []
    templates = rules["opportunity_templates"]
    for area in weakest:
        if area in templates:
            opportunities.append({
                "area": area,
                **templates[area],
            })

    bottlenecks = [
        {"area": area, "description": rules["bottleneck_templates"].get(area, "")}
        for area in weakest
    ]

    ai_opportunities = []
    ai_map = rules["ai_opportunity_map"]
    for area, score in area_scores.items():
        if score <= 3 and area in ai_map:
            ai_opportunities.append({"area": area, "opportunity": ai_map[area]})

    data_gaps = []
    gap_map = rules["data_gap_map"]
    for area, score in area_scores.items():
        if score <= 3 and area in gap_map:
            data_gaps.append({"area": area, "gap": gap_map[area]})

    # Recommended first project
    recommended = rules["recommended_project_map"][-1]  # default
    for rule in rules["recommended_project_map"]:
        if rule.get("condition") == "default":
            continue
        area = rule["condition"]
        if area_scores.get(area, 5) <= rule["threshold"]:
            recommended = rule
            break

    # Industry modifier
    industry_mod = rules["industry_modifiers"].get(industry, {})
    if industry_mod.get("bonus_opportunity"):
        opportunities.append({
            "area": "industry_specific",
            "title": industry_mod["bonus_opportunity"],
            "impact": "high",
            "description": f"Metro Detroit {industry} sector opportunity based on ICP fit.",
        })

    maturity_band = "developing"
    if intelligence_score >= 80:
        maturity_band = "advanced"
    elif intelligence_score >= 60:
        maturity_band = "established"
    elif intelligence_score >= 40:
        maturity_band = "developing"
    else:
        maturity_band = "critical"

    return {
        "revenue_intelligence_score": intelligence_score,
        "maturity_band": maturity_band,
        "area_scores": area_scores,
        "top_opportunities": opportunities[:3],
        "top_bottlenecks": bottlenecks[:3],
        "ai_automation_opportunities": ai_opportunities[:4],
        "data_reporting_gaps": data_gaps[:3],
        "recommended_first_project": {
            "name": recommended["project"],
            "product": recommended["product"],
        },
        "context": {
            "industry": industry,
            "company_size": company_size,
            "icp_tier": industry_mod.get("icp_tier"),
        },
    }


def selftest() -> int:
    # Critical gaps scenario
    critical = {
        "leads": 2, "sales": 2, "followup": 1, "quoting": 1,
        "operations": 2, "reporting": 2, "retention": 3,
        "data": 1, "automation": 2,
    }
    result = score_responses(critical, industry="automotive", company_size="mid")
    assert result["revenue_intelligence_score"] < 50
    assert result["maturity_band"] == "critical"
    assert len(result["top_opportunities"]) == 3
    assert result["recommended_first_project"]["product"] in (
        "revenue-intelligence-audit", "revenue-systems-engineering"
    )

    # Strong scenario
    strong = {area: 4 for area in critical}
    result2 = score_responses(strong, industry="logistics")
    assert result2["revenue_intelligence_score"] >= 75
    assert result2["maturity_band"] in ("established", "advanced")

    print("PASS: revenue_diagnostic_scorer selftest")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Revenue Opportunity Diagnostic scorer")
    parser.add_argument("--responses", help="JSON file with area responses")
    parser.add_argument("--industry", default="other")
    parser.add_argument("--company-size", default="mid")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()

    if args.selftest:
        return selftest()

    data = json.loads(Path(args.responses).read_text())
    result = score_responses(
        data.get("responses", data),
        industry=data.get("industry", args.industry),
        company_size=data.get("company_size", args.company_size),
    )
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
