#!/usr/bin/env python3
"""Coupling analysis between services and dependencies."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

IGNORE = {".git", "node_modules", "__pycache__", ".venv", "venv"}


def analyze_coupling(repo_path: str) -> dict:
    repo = Path(repo_path).resolve()
    edges: dict[str, set[str]] = {}
    services = [d.name for d in repo.iterdir() if d.is_dir() and d.name not in IGNORE and not d.name.startswith(".")]

    for svc in services:
        edges[svc] = set()
        for f in (repo / svc).rglob("*.py"):
            try:
                for line in f.read_text(errors="ignore").splitlines():
                    for other in services:
                        if other != svc and other in line:
                            edges[svc].add(other)
            except OSError:
                pass

    findings = []
    for svc, deps in edges.items():
        if len(deps) > 3:
            findings.append({"service": svc, "depends_on": sorted(deps), "severity": "high",
                             "message": f"{svc} depends on {len(deps)} other services"})
        elif len(deps) > 1:
            findings.append({"service": svc, "depends_on": sorted(deps), "severity": "medium",
                             "message": f"{svc} has {len(deps)} cross-service dependencies"})

    circular = _find_circular(edges)
    for cycle in circular:
        findings.append({"severity": "critical", "message": f"Circular dependency: {' → '.join(cycle)}"})

    critical = sum(1 for f in findings if f["severity"] == "critical")
    return {
        "services": services,
        "dependency_graph": {k: sorted(v) for k, v in edges.items()},
        "findings": findings,
        "coupling_score": round(sum(len(v) for v in edges.values()) / max(len(services), 1), 2),
        "status": "FAIL" if critical > 0 else "PASS",
        "critical_count": critical,
    }


def _find_circular(edges: dict[str, set[str]]) -> list[list[str]]:
    cycles = []
    for start in edges:
        visited, path = set(), []
        if _dfs(start, start, edges, visited, path, cycles):
            pass
    return cycles[:5]


def _dfs(node, start, edges, visited, path, cycles):
    if node in path:
        idx = path.index(node)
        cycles.append(path[idx:] + [node])
        return True
    if node in visited:
        return False
    visited.add(node)
    path.append(node)
    for neighbor in edges.get(node, []):
        _dfs(neighbor, start, edges, visited, path, cycles)
    path.pop()
    return False


def selftest() -> int:
    r = analyze_coupling(str(Path(__file__).resolve().parent.parent))
    assert "findings" in r
    print("PASS: coupling_analyzer selftest")
    return 0


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("repo_path", nargs="?", default=".")
    p.add_argument("--selftest", action="store_true")
    a = p.parse_args()
    if a.selftest:
        return selftest()
    print(json.dumps(analyze_coupling(a.repo_path), indent=2))
    return 0 if analyze_coupling(a.repo_path)["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
