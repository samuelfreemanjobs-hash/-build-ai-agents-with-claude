#!/usr/bin/env python3
"""Deterministic dependency vulnerability checker."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

KNOWN_VULNERABLE = {
    # Illustrative entries — production would use OSV/advisory DB
    "requests": {"<2.31.0": {"severity": "medium", "advisory": "CVE-2023-32681"}},
    "pillow": {"<10.0.1": {"severity": "high", "advisory": "CVE-2023-4863"}},
    "django": {"<4.2.11": {"severity": "high", "advisory": "CVE-2024-24680"}},
    "lodash": {"<4.17.21": {"severity": "high", "advisory": "CVE-2021-23337"}},
}


def parse_version(version: str) -> tuple[int, ...]:
    parts = re.findall(r"\d+", version)
    return tuple(int(p) for p in parts) if parts else (0,)


def version_lt(version: str, constraint: str) -> bool:
    return parse_version(version) < parse_version(constraint.lstrip("<"))


def parse_requirements_txt(path: Path) -> list[tuple[str, str]]:
    deps = []
    for line in path.read_text(errors="ignore").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"^([a-zA-Z0-9_-]+)(?:[=<>!~]+(.+))?$", line.split("[")[0])
        if m:
            deps.append((m.group(1).lower(), m.group(2) or "unknown"))
    return deps


def parse_package_json(path: Path) -> list[tuple[str, str]]:
    data = json.loads(path.read_text())
    deps = []
    for section in ("dependencies", "devDependencies"):
        for name, version in data.get(section, {}).items():
            deps.append((name.lower(), version.lstrip("^~>=")))
    return deps


def check_dependencies(repo_path: str) -> dict:
    repo = Path(repo_path).resolve()
    all_deps: list[tuple[str, str]] = []

    req = repo / "requirements.txt"
    if req.exists():
        all_deps.extend(parse_requirements_txt(req))

    pkg = repo / "package.json"
    if pkg.exists():
        all_deps.extend(parse_package_json(pkg))

    pyproject = repo / "pyproject.toml"
    if pyproject.exists() and not req.exists():
        content = pyproject.read_text(errors="ignore")
        for m in re.finditer(r'"([a-zA-Z0-9_-]+)\s*([>=<~!]+[\d.]+)"', content):
            all_deps.append((m.group(1).lower(), m.group(2)))

    vulnerabilities = []
    for name, version in all_deps:
        if name in KNOWN_VULNERABLE:
            for constraint, info in KNOWN_VULNERABLE[name].items():
                if version != "unknown" and version_lt(version, constraint):
                    vulnerabilities.append({
                        "package": name,
                        "version": version,
                        "severity": info["severity"],
                        "advisory": info["advisory"],
                    })

    has_high = any(v["severity"] in ("critical", "high") for v in vulnerabilities)
    return {
        "status": "FAIL" if has_high else "PASS",
        "dependencies_checked": len(all_deps),
        "vulnerabilities": vulnerabilities,
    }


def selftest() -> int:
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        req = Path(tmp) / "requirements.txt"
        req.write_text("pillow==9.0.0\n")
        result = check_dependencies(tmp)
        assert result["status"] == "FAIL"
        assert len(result["vulnerabilities"]) >= 1
    print("PASS: dependency_checker selftest")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Check dependencies for known vulnerabilities")
    parser.add_argument("repo_path", nargs="?", default=".")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()

    if args.selftest:
        return selftest()

    result = check_dependencies(args.repo_path)
    print(json.dumps(result, indent=2))
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
