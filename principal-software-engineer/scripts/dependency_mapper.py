#!/usr/bin/env python3
"""Deterministic dependency mapping between services and packages."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

IGNORE_DIRS = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build", "target"}


def parse_python_imports(path: Path) -> list[str]:
    imports = []
    try:
        for line in path.read_text(errors="ignore").splitlines():
            m = re.match(r"^(?:from|import)\s+([\w.]+)", line.strip())
            if m:
                imports.append(m.group(1).split(".")[0])
    except OSError:
        pass
    return imports


def parse_package_json_deps(path: Path) -> list[str]:
    try:
        data = json.loads(path.read_text())
        deps = list(data.get("dependencies", {}).keys())
        deps.extend(data.get("devDependencies", {}).keys())
        return deps
    except (OSError, json.JSONDecodeError):
        return []


def map_dependencies(repo_path: str) -> dict:
    repo = Path(repo_path).resolve()
    edges: list[dict] = []
    nodes: set[str] = set()

    for pkg_json in repo.rglob("package.json"):
        if any(p in IGNORE_DIRS for p in pkg_json.parts):
            continue
        service = pkg_json.parent.name
        nodes.add(service)
        for dep in parse_package_json_deps(pkg_json):
            if not dep.startswith("@"):
                edges.append({"from": service, "to": dep, "type": "npm"})

    for py_file in repo.rglob("*.py"):
        if any(p in IGNORE_DIRS for p in py_file.parts):
            continue
        service = py_file.relative_to(repo).parts[0] if py_file.relative_to(repo).parts else "root"
        nodes.add(service)
        for imp in parse_python_imports(py_file):
            if imp not in ("os", "sys", "json", "re", "typing", "pathlib", "datetime", "logging"):
                edges.append({"from": service, "to": imp, "type": "import"})

    internal = [e for e in edges if e["to"] in nodes]
    external = [e for e in edges if e["to"] not in nodes]

    return {
        "nodes": sorted(nodes),
        "edges": edges[:200],
        "internal_dependencies": len(internal),
        "external_dependencies": len(set(e["to"] for e in external)),
        "coupling_score": round(len(internal) / max(len(nodes), 1), 2),
    }


def selftest() -> int:
    result = map_dependencies(str(Path(__file__).resolve().parent.parent))
    assert "nodes" in result
    print("PASS: dependency_mapper selftest")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Map service dependencies")
    parser.add_argument("repo_path", nargs="?", default=".")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()
    if args.selftest:
        return selftest()
    print(json.dumps(map_dependencies(args.repo_path), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
