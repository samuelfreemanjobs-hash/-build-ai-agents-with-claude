#!/usr/bin/env python3
"""Deterministic codebase analysis — no LLM."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

MANIFEST_FILES = {
    "python": ["pyproject.toml", "setup.py", "requirements.txt", "Pipfile"],
    "javascript": ["package.json"],
    "typescript": ["package.json", "tsconfig.json"],
    "go": ["go.mod"],
    "rust": ["Cargo.toml"],
    "ruby": ["Gemfile"],
}

TEST_PATTERNS = {
    "python": [("pytest", "pytest"), ("unittest", "python -m unittest discover")],
    "javascript": [("jest", "npm test"), ("vitest", "npx vitest run")],
    "typescript": [("jest", "npm test"), ("vitest", "npx vitest run")],
    "go": [("go test", "go test ./...")],
    "rust": [("cargo test", "cargo test")],
    "ruby": [("rspec", "bundle exec rspec"), ("minitest", "rake test")],
}

LINT_CONFIG = {
    "python": ["ruff.toml", ".ruff.toml", "pyproject.toml", ".flake8", "setup.cfg"],
    "javascript": [".eslintrc", ".eslintrc.json", ".eslintrc.js", "eslint.config.js"],
    "typescript": [".eslintrc", "tsconfig.json", "eslint.config.js"],
    "go": [".golangci.yml", ".golangci.yaml"],
    "rust": ["clippy.toml"],
    "ruby": [".rubocop.yml"],
}

IGNORE_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build",
    ".next", "target", ".tox", ".mypy_cache", ".pytest_cache",
}


def detect_languages(repo: Path) -> list[str]:
    found: list[str] = []
    for lang, manifests in MANIFEST_FILES.items():
        if any((repo / m).exists() for m in manifests):
            found.append(lang)
    return found


def count_files(repo: Path, extensions: set[str]) -> int:
    count = 0
    for root, dirs, files in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            if Path(f).suffix in extensions:
                count += 1
    return count


def detect_test_command(repo: Path, languages: list[str]) -> str | None:
    for lang in languages:
        for pattern, cmd in TEST_PATTERNS.get(lang, []):
            if lang == "python" and (repo / "pyproject.toml").exists():
                content = (repo / "pyproject.toml").read_text(errors="ignore")
                if pattern in content or (repo / "tests").is_dir():
                    return cmd
            if lang in ("javascript", "typescript") and (repo / "package.json").exists():
                pkg = json.loads((repo / "package.json").read_text())
                scripts = pkg.get("scripts", {})
                if "test" in scripts:
                    return "npm test"
            if lang == "go" and (repo / "go.mod").exists():
                return "go test ./..."
            if lang == "rust" and (repo / "Cargo.toml").exists():
                return "cargo test"
    if (repo / "tests").is_dir() or list(repo.glob("**/test_*.py")):
        return "pytest"
    return None


def detect_lint_tool(repo: Path, languages: list[str]) -> str | None:
    for lang in languages:
        for config in LINT_CONFIG.get(lang, []):
            if (repo / config).exists():
                if "ruff" in config or lang == "python":
                    return "ruff check ."
                if "eslint" in config:
                    return "npx eslint ."
                if "golangci" in config:
                    return "golangci-lint run"
    return None


def list_top_level(repo: Path) -> list[str]:
    return sorted(
        p.name for p in repo.iterdir()
        if p.name not in IGNORE_DIRS and not p.name.startswith(".")
    )


def analyze(repo_path: str) -> dict:
    repo = Path(repo_path).resolve()
    if not repo.is_dir():
        raise ValueError(f"Not a directory: {repo_path}")

    languages = detect_languages(repo)
    ext_map = {
        "python": {".py"},
        "javascript": {".js", ".jsx", ".mjs"},
        "typescript": {".ts", ".tsx"},
        "go": {".go"},
        "rust": {".rs"},
        "ruby": {".rb"},
    }
    file_counts = {}
    for lang in languages:
        file_counts[lang] = count_files(repo, ext_map.get(lang, set()))

    return {
        "repo_path": str(repo),
        "languages": languages,
        "file_counts": file_counts,
        "top_level": list_top_level(repo),
        "test_command": detect_test_command(repo, languages),
        "lint_command": detect_lint_tool(repo, languages),
        "has_git": (repo / ".git").is_dir(),
        "has_ci": (repo / ".github" / "workflows").is_dir(),
        "test_directories": [
            str(p.relative_to(repo))
            for p in repo.rglob("tests")
            if p.is_dir() and not any(part in IGNORE_DIRS for part in p.parts)
        ][:10],
    }


def selftest() -> int:
    report = analyze(str(Path(__file__).resolve().parent.parent / "backend"))
    assert "languages" in report
    assert report["languages"]  # backend is Python
    print("PASS: codebase_analyzer selftest")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Analyze a codebase deterministically")
    parser.add_argument("repo_path", nargs="?", default=".")
    parser.add_argument("--selftest", action="store_true")
    parser.add_argument("--json", action="store_true", default=True)
    args = parser.parse_args()

    if args.selftest:
        return selftest()

    try:
        report = analyze(args.repo_path)
        print(json.dumps(report, indent=2))
        return 0
    except ValueError as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
