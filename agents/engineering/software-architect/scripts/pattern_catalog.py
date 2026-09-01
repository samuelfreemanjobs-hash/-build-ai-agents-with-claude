#!/usr/bin/env python3
"""Architecture pattern catalog matcher."""

from __future__ import annotations

import argparse
import json
import sys

PATTERNS = {
    "layered": {"signals": ["controller", "service", "repository", "model"], "min_signals": 2},
    "microservices": {"signals": ["docker-compose", "service", "gateway", "independent"], "min_signals": 2},
    "event-driven": {"signals": ["kafka", "rabbitmq", "sqs", "event", "publish", "subscribe"], "min_signals": 2},
    "api-gateway": {"signals": ["gateway", "nginx", "kong", "proxy", "route"], "min_signals": 1},
    "cqrs": {"signals": ["command", "query", "read_model", "write_model"], "min_signals": 2},
}


def match_patterns(discovery: dict) -> dict:
    text = json.dumps(discovery).lower()
    matches = []
    for name, spec in PATTERNS.items():
        found = [s for s in spec["signals"] if s in text]
        if len(found) >= spec["min_signals"]:
            matches.append({"pattern": name, "confidence": round(len(found) / len(spec["signals"]), 2),
                            "signals_found": found})
    matches.sort(key=lambda x: x["confidence"], reverse=True)
    return {"patterns_detected": matches, "primary_pattern": matches[0]["pattern"] if matches else None}


def selftest() -> int:
    r = match_patterns({"services": [{"name": "api"}], "apis": [{"framework": "fastapi"}]})
    assert "patterns_detected" in r
    print("PASS: pattern_catalog selftest")
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
    print(json.dumps(match_patterns(d), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
