#!/usr/bin/env python3
"""Deterministic security scanner — pattern-based secret and vulnerability detection."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

SECRET_PATTERNS = [
    (re.compile(r'(?i)(api[_-]?key|apikey)\s*[:=]\s*["\'][a-zA-Z0-9_\-]{16,}["\']'), "hardcoded_api_key", "critical"),
    (re.compile(r'(?i)(password|passwd|pwd)\s*[:=]\s*["\'][^"\']{4,}["\']'), "hardcoded_password", "critical"),
    (re.compile(r'(?i)(secret|token)\s*[:=]\s*["\'][a-zA-Z0-9_\-]{16,}["\']'), "hardcoded_secret", "critical"),
    (re.compile(r'-----BEGIN (RSA |EC )?PRIVATE KEY-----'), "private_key", "critical"),
    (re.compile(r'(?i)aws[_-]?secret[_-]?access[_-]?key\s*[:=]\s*["\'][A-Za-z0-9/+=]{20,}["\']'), "aws_secret", "critical"),
    (re.compile("sk_" + "live_" + r"[a-zA-Z0-9]{20,}"), "stripe_live_key", "critical"),
    (re.compile(r'ghp_[a-zA-Z0-9]{36}'), "github_pat", "critical"),
    (re.compile(r'eval\s*\('), "eval_usage", "high"),
    (re.compile(r'exec\s*\('), "exec_usage", "high"),
    (re.compile(r'subprocess\.(call|run|Popen)\s*\([^)]*shell\s*=\s*True'), "shell_injection_risk", "high"),
    (re.compile(r'pickle\.loads?\s*\('), "unsafe_deserialization", "medium"),
    (re.compile(r'innerHTML\s*='), "xss_risk", "medium"),
    (re.compile(r'dangerouslySetInnerHTML'), "xss_risk_react", "medium"),
]

SCAN_EXTENSIONS = {".py", ".js", ".ts", ".jsx", ".tsx", ".go", ".rs", ".rb", ".env", ".yaml", ".yml", ".json", ".toml"}
IGNORE_DIRS = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build", "target"}
IGNORE_FILES = {"package-lock.json", "poetry.lock", "Cargo.lock"}


def scan_file(path: Path) -> list[dict]:
    findings = []
    try:
        content = path.read_text(errors="ignore")
    except OSError:
        return findings

    for i, line in enumerate(content.splitlines(), 1):
        for pattern, rule, severity in SECRET_PATTERNS:
            if pattern.search(line):
                findings.append({
                    "severity": severity,
                    "file": str(path),
                    "line": i,
                    "description": f"Security pattern matched: {rule}",
                    "rule": rule,
                })
    return findings


def scan_repo(repo_path: str, changed_files: list[str] | None = None) -> dict:
    repo = Path(repo_path).resolve()
    all_findings: list[dict] = []

    if changed_files:
        targets = [repo / f for f in changed_files if (repo / f).is_file()]
    else:
        targets = []
        for path in repo.rglob("*"):
            if not path.is_file():
                continue
            if any(part in IGNORE_DIRS for part in path.parts):
                continue
            if path.name in IGNORE_FILES:
                continue
            if path.suffix in SCAN_EXTENSIONS or path.name.startswith(".env"):
                targets.append(path)

    for path in targets:
        all_findings.extend(scan_file(path))

    halt_severities = {"critical", "high"}
    has_halt = any(f["severity"] in halt_severities for f in all_findings)

    return {
        "status": "FAIL" if has_halt else "PASS",
        "findings": all_findings,
        "scanned_files": len(targets),
    }


def selftest() -> int:
    import tempfile
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write('PASSWORD = "hunter2"\n')
        f.flush()
        findings = scan_file(Path(f.name))
        assert len(findings) >= 1
        assert findings[0]["severity"] == "critical"
    print("PASS: security_scanner selftest")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Scan for security issues")
    parser.add_argument("repo_path", nargs="?", default=".")
    parser.add_argument("--files", nargs="*", default=None, help="Specific files to scan")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()

    if args.selftest:
        return selftest()

    result = scan_repo(args.repo_path, args.files)
    print(json.dumps(result, indent=2))
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
