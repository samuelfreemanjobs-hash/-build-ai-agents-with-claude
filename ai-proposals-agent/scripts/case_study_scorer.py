#!/usr/bin/env python3
"""
Deterministic case study relevance ranking.

The model does not choose case studies. This module ranks; the model writes
narrative for the returned top-N. Weights are explicit and versioned so that
a selection can be re-derived and audited.

Run self-tests:  python3 case_study_scorer.py --selftest
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass, asdict
from datetime import date, datetime
from typing import Dict, List, Optional

SCORER_VERSION = "2.0.0"

WEIGHTS: Dict[str, float] = {
    "challenge_overlap": 0.40,
    "industry_match": 0.25,
    "service_overlap": 0.20,
    "recency": 0.10,
    "metric_strength": 0.05,
}

ADJACENT_INDUSTRIES = {
    "retail": {"ecommerce", "consumer goods", "grocery"},
    "ecommerce": {"retail", "consumer goods"},
    "automotive": {"industrial manufacturing", "aerospace"},
    "healthcare": {"pharmaceutical", "life sciences", "medical devices"},
    "pharmaceutical": {"healthcare", "life sciences"},
}


class ScorerHalt(Exception):
    pass


def _norm(s: str) -> str:
    return str(s).strip().lower()


def _jaccard(a: List[str], b: List[str]) -> float:
    sa, sb = {_norm(x) for x in a}, {_norm(x) for x in b}
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def _industry_score(case_industry: str, target_industry: str) -> float:
    ci, ti = _norm(case_industry), _norm(target_industry)
    if ci == ti:
        return 1.0
    if ti in ADJACENT_INDUSTRIES.get(ci, set()) or ci in ADJACENT_INDUSTRIES.get(ti, set()):
        return 0.6
    return 0.0


def _recency_score(case_date: Optional[str], today: date) -> float:
    if not case_date:
        return 0.0
    try:
        d = datetime.strptime(str(case_date), "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return 0.0
    years = (today - d).days / 365.25
    if years < 0:
        return 0.0
    if years <= 1:
        return 1.0
    if years <= 3:
        return 0.7
    if years <= 5:
        return 0.3
    return 0.0


def _metric_strength(results: List[str]) -> float:
    if not results:
        return 0.0
    quantified = sum(
        1 for r in results if any(ch.isdigit() for ch in str(r))
    )
    return min(quantified / 3.0, 1.0)


@dataclass
class ScoredCase:
    case_id: str
    total_score: float
    challenge_overlap: float
    industry_match: float
    service_overlap: float
    recency: float
    metric_strength: float
    release_flag: bool
    display_name: str


def rank(
    cases: List[dict],
    target_industry: str,
    target_challenge_tags: List[str],
    target_service_tags: List[str],
    today: Optional[date] = None,
    min_score: float = 0.55,
    top_n: int = 3,
) -> dict:

    today = today or date.today()

    if abs(sum(WEIGHTS.values()) - 1.0) > 1e-9:
        raise ScorerHalt("WEIGHTS do not sum to 1.0")

    scored: List[ScoredCase] = []

    for c in cases:
        if "case_id" not in c:
            raise ScorerHalt(f"case record missing case_id: {c!r}")

        ch = _jaccard(c.get("challenge_tags", []), target_challenge_tags)
        ind = _industry_score(c.get("industry", ""), target_industry)
        svc = _jaccard(c.get("service_tags", []), target_service_tags)
        rec = _recency_score(c.get("engagement_date"), today)
        met = _metric_strength(c.get("results", []))

        total = round(
            ch * WEIGHTS["challenge_overlap"]
            + ind * WEIGHTS["industry_match"]
            + svc * WEIGHTS["service_overlap"]
            + rec * WEIGHTS["recency"]
            + met * WEIGHTS["metric_strength"],
            4,
        )

        release = bool(c.get("release_flag", False))
        display = c.get("client_name") if release else (
            f"Leading {c.get('industry', 'Logistics')} Company"
        )

        scored.append(
            ScoredCase(
                case_id=c["case_id"],
                total_score=total,
                challenge_overlap=round(ch, 4),
                industry_match=round(ind, 4),
                service_overlap=round(svc, 4),
                recency=round(rec, 4),
                metric_strength=round(met, 4),
                release_flag=release,
                display_name=display,
            )
        )

    scored.sort(key=lambda s: (-s.total_score, s.case_id))
    eligible = [s for s in scored if s.total_score >= min_score]

    return {
        "scorer_version": SCORER_VERSION,
        "weights": WEIGHTS,
        "min_score": min_score,
        "n_eligible": len(eligible),
        "selected": [asdict(s) for s in eligible[:top_n]],
        "all_scored": [asdict(s) for s in scored],
        "halt": len(eligible) == 0,
        "halt_reason": (
            "no case study met minimum relevance threshold — "
            "proposal must proceed without case studies or KB must be expanded"
            if not eligible else None
        ),
    }


def _selftest() -> int:
    failures = []
    today = date(2026, 8, 10)

    cases = [
        {"case_id": "CS001", "client_name": "Acme Retail", "industry": "Retail",
         "challenge_tags": ["peak-capacity", "stockouts", "fulfillment-speed"],
         "service_tags": ["warehousing", "fulfillment"],
         "results": ["40% fewer stockouts", "100% peak fulfillment", "98% CSAT"],
         "engagement_date": "2026-01-15", "release_flag": True},
        {"case_id": "CS002", "client_name": "Global Pharma", "industry": "Pharmaceutical",
         "challenge_tags": ["cold-chain", "compliance"],
         "service_tags": ["warehousing", "transport"],
         "results": ["100% temperature compliance"],
         "engagement_date": "2019-03-01", "release_flag": False},
        {"case_id": "CS003", "client_name": "Ecom Co", "industry": "Ecommerce",
         "challenge_tags": ["peak-capacity", "fulfillment-speed"],
         "service_tags": ["fulfillment"],
         "results": ["improved service"],
         "engagement_date": "2025-06-01", "release_flag": False},
    ]

    out = rank(
        cases,
        target_industry="Retail",
        target_challenge_tags=["peak-capacity", "stockouts", "fulfillment-speed"],
        target_service_tags=["warehousing", "fulfillment"],
        today=today,
    )

    top = out["selected"][0]
    if top["case_id"] != "CS001":
        failures.append(f"ranking: top is {top['case_id']} want CS001")
    if top["total_score"] != 1.0:
        failures.append(f"CS001 score {top['total_score']} want 1.0")

    cs003 = next(s for s in out["all_scored"] if s["case_id"] == "CS003")
    if cs003["metric_strength"] != 0.0:
        failures.append("unquantified results scored above zero")
    if cs003["industry_match"] != 0.6:
        failures.append(f"adjacency score {cs003['industry_match']} want 0.6")

    if top["display_name"] != "Acme Retail":
        failures.append("released case did not use client name")
    cs002 = next(s for s in out["all_scored"] if s["case_id"] == "CS002")
    if "Acme" in cs002["display_name"] or cs002["display_name"] == "Global Pharma":
        failures.append("unreleased case leaked client name")

    if abs(sum(WEIGHTS.values()) - 1.0) > 1e-9:
        failures.append("weights do not sum to 1.0")

    empty = rank(cases, "Aerospace", ["hazmat"], ["airfreight"], today=today, min_score=0.9)
    if not empty["halt"]:
        failures.append("no-eligible-case did not set halt")

    again = rank(cases, "Retail",
                 ["peak-capacity", "stockouts", "fulfillment-speed"],
                 ["warehousing", "fulfillment"], today=today)
    if json.dumps(again["selected"]) != json.dumps(out["selected"]):
        failures.append("non-deterministic output across identical runs")

    fut = rank([{"case_id": "CSX", "industry": "Retail", "challenge_tags": [],
                 "service_tags": [], "results": [], "engagement_date": "2030-01-01"}],
               "Retail", [], [], today=today, min_score=0.0)
    if fut["all_scored"][0]["recency"] != 0.0:
        failures.append("future-dated record earned recency credit")

    if failures:
        print("SELFTEST FAILED")
        for f in failures:
            print("  -", f)
        return 1

    print(f"SELFTEST PASSED — case_study_scorer {SCORER_VERSION} — 9/9")
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()
    if args.selftest:
        sys.exit(_selftest())
    ap.error("--selftest required (library use otherwise)")
