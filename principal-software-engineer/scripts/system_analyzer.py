#!/usr/bin/env python3
"""Deterministic system analysis — services, languages, infrastructure signals."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

SERVICE_INDICATORS = {
    "api": ["main.py", "app.py", "server.py", "index.ts", "main.go", "main.rs"],
    "docker": ["Dockerfile", "docker-compose.yml", "docker-compose.yaml"],
    "k8s": ["deployment.yaml", "service.yaml", "kustomization.yaml"],
    "terraform": ["main.tf", "terraform.tfvars"],
    "database": ["migrations/", "alembic/", "schema.sql", "prisma/"],
}

IGNORE_DIRS = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build", "target", ".next"}


def detect_services(repo: Path) -> list[dict]:
    services = []
    for item in repo.iterdir():
        if not item.is_dir() or item.name in IGNORE_DIRS or item.name.startswith("."):
            continue
        indicators = []
        for category, files in SERVICE_INDICATORS.items():
            for f in files:
                if (item / f).exists() or (item / f.rstrip("/")).is_dir():
                    indicators.append(category)
                    break
        if indicators or any(item.rglob("*.py")) or any(item.rglob("*.ts")):
            services.append({
                "name": item.name,
                "path": str(item.relative_to(repo)),
                "indicators": indicators or ["source"],
            })
    return services


def detect_infrastructure(repo: Path) -> dict:
    infra = {"docker": False, "k8s": False, "terraform": False, "ci": False}
    if (repo / "Dockerfile").exists() or (repo / "docker-compose.yml").exists():
        infra["docker"] = True
    if (repo / "k8s").is_dir() or (repo / "deploy").is_dir():
        infra["k8s"] = True
    if (repo / "terraform").is_dir() or list(repo.glob("*.tf")):
        infra["terraform"] = True
    if (repo / ".github" / "workflows").is_dir():
        infra["ci"] = True
    return infra


def detect_data_stores(repo: Path) -> list[str]:
    stores = []
    patterns = {
        "postgres": ["postgres", "postgresql", "psycopg", "pg_"],
        "mysql": ["mysql", "mariadb"],
        "redis": ["redis"],
        "mongodb": ["mongo"],
        "elasticsearch": ["elasticsearch", "elastic"],
        "s3": ["boto3", "s3", "minio"],
    }
    for root, dirs, files in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            if f.endswith((".py", ".ts", ".js", ".go", ".yaml", ".yml", ".toml", ".env")):
                try:
                    content = (Path(root) / f).read_text(errors="ignore").lower()
                    for store, keywords in patterns.items():
                        if any(kw in content for kw in keywords) and store not in stores:
                            stores.append(store)
                except OSError:
                    pass
    return stores


def analyze(repo_path: str) -> dict:
    repo = Path(repo_path).resolve()
    if not repo.is_dir():
        raise ValueError(f"Not a directory: {repo_path}")

    services = detect_services(repo)
    return {
        "repo_path": str(repo),
        "services": services,
        "service_count": len(services),
        "infrastructure": detect_infrastructure(repo),
        "data_stores": detect_data_stores(repo),
        "has_monorepo": len(services) > 1,
        "top_level": sorted(
            p.name for p in repo.iterdir()
            if p.name not in IGNORE_DIRS and not p.name.startswith(".")
        ),
    }


def selftest() -> int:
    report = analyze(str(Path(__file__).resolve().parent.parent))
    assert "services" in report
    print("PASS: system_analyzer selftest")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Analyze system architecture")
    parser.add_argument("repo_path", nargs="?", default=".")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()
    if args.selftest:
        return selftest()
    try:
        print(json.dumps(analyze(args.repo_path), indent=2))
        return 0
    except ValueError as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
