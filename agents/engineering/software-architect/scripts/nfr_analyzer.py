#!/usr/bin/env python3
"""NFR coverage analyzer."""

from __future__ import annotations

import argparse
import json
import sys

NFR_CATEGORIES = ["availability", "scalability", "security", "maintainability", "performance", "observability"]
NFR_SIGNALS = {
    "availability": ["replica", "failover", "health", "redundan", "backup"],
    "scalability": ["scale", "load_balanc", "horizontal", "auto_scal", "cache"],
    "security": ["auth", "encrypt", "tls", "oauth", "rbac", "secret"],
    "maintainability": ["test", "ci", "lint", "document", "modular"],
    "performance": ["cache", "index", "optim", "cdn", "latency"],
    "observability": ["metric", "log", "trace", "monitor", "alert", "prometheus", "grafana"],
}


def analyze_nfr(discovery: dict, nfr_map: dict | None = None) -> dict:
    text = json.dumps(discovery).lower()
    coverage = []
    gaps = []

    for cat in NFR_CATEGORIES:
        signals = NFR_SIGNALS[cat]
        found = [s for s in signals if s in text]
        if nfr_map:
            mapped = [m for m in nfr_map.get("mappings", []) if m.get("category") == cat]
            status = "met" if mapped and all(m.get("status") == "met" for m in mapped) else (
                "partial" if mapped else "gap")
        else:
            status = "met" if len(found) >= 2 else ("partial" if found else "gap")
        entry = {"category": cat, "status": status, "signals_found": found}
        coverage.append(entry)
        if status == "gap":
            gaps.append({"category": cat, "message": f"No evidence for {cat}"})

    gap_count = len(gaps)
    return {"coverage": coverage, "gaps": gaps, "gap_count": gap_count,
            "status": "FAIL" if gap_count > 3 else ("WARN" if gap_count > 0 else "PASS")}


def selftest() -> int:
    r = analyze_nfr({"services": [{"name": "api"}]})
    assert r["gap_count"] > 0
    print("PASS: nfr_analyzer selftest")
    return 0


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--discovery", required=False)
    p.add_argument("--selftest", action="store_true")
    a = p.parse_args()
    if a.selftest:
        return selftest()
    from pathlib import Path
    d = json.loads(Path(a.discovery).read_text())
    print(json.dumps(analyze_nfr(d), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
