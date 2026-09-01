#!/usr/bin/env python3
"""System discovery — services, APIs, data stores, external signals."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

IGNORE = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build", "target"}


def discover(repo_path: str) -> dict:
    repo = Path(repo_path).resolve()
    services, apis, stores, externals = [], [], [], []

    for item in repo.iterdir():
        if not item.is_dir() or item.name in IGNORE or item.name.startswith("."):
            continue
        services.append({"name": item.name, "path": str(item.relative_to(repo))})

    for f in repo.rglob("*"):
        if not f.is_file() or any(p in IGNORE for p in f.parts):
            continue
        name = f.name.lower()
        if name in ("docker-compose.yml", "docker-compose.yaml"):
            externals.append({"type": "docker-compose", "path": str(f.relative_to(repo))})
        if f.suffix in (".py", ".ts", ".js", ".go"):
            try:
                text = f.read_text(errors="ignore").lower()
                if "fastapi" in text or "flask" in text or "express" in text:
                    apis.append({"file": str(f.relative_to(repo)), "framework": "detected"})
                for store in ("postgres", "redis", "mongodb", "mysql", "elasticsearch"):
                    if store in text and store not in [s["name"] for s in stores]:
                        stores.append({"name": store, "evidence": str(f.relative_to(repo))})
            except OSError:
                pass

    return {
        "repo_path": str(repo),
        "services": services,
        "apis": apis[:50],
        "data_stores": stores,
        "external_signals": externals,
        "service_count": len(services),
    }


def selftest() -> int:
    r = discover(str(Path(__file__).resolve().parent.parent))
    assert "services" in r
    print("PASS: system_discovery selftest")
    return 0


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("repo_path", nargs="?", default=".")
    p.add_argument("--selftest", action="store_true")
    a = p.parse_args()
    if a.selftest:
        return selftest()
    print(json.dumps(discover(a.repo_path), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
