"""Paths and environment for The Architect agent."""

from __future__ import annotations

import os
from pathlib import Path

# Repo root (parent of the_architect package)
REPO_ROOT = Path(__file__).resolve().parent.parent
AGENT_ROOT = REPO_ROOT / "agents" / "the-architect"
PROJECTS_DIR = AGENT_ROOT / "projects"
RESEARCH_DIR = AGENT_ROOT / "research"
MEMORY_DIR = AGENT_ROOT / "memory"

SYSTEM_PROMPT_FILES = [
    AGENT_ROOT / "DR-SPECIALIST-PROMPT.md",
    AGENT_ROOT / "SYSTEM.md",
    AGENT_ROOT / "AGENT.md",
]

KNOWLEDGE_GLOBS = [
    "agents/the-architect/*.md",
    "agents/the-architect/research/*.md",
]


def get_api_key() -> str | None:
    return os.environ.get("ANTHROPIC_API_KEY")


def ensure_projects_dir() -> Path:
    PROJECTS_DIR.mkdir(parents=True, exist_ok=True)
    return PROJECTS_DIR


def slugify(name: str) -> str:
    import re

    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-") or "project"
