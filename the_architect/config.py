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
FACTORY_DIR = AGENT_ROOT / "factory"

SYSTEM_PROMPT_FILES = [
    AGENT_ROOT / "GALACTIC-MASTER-PROMPT.md",
    AGENT_ROOT / "GOD-OF-PROMPTS-METHODOLOGY.md",
    AGENT_ROOT / "DR-SPECIALIST-PROMPT.md",
    AGENT_ROOT / "SYSTEM.md",
    AGENT_ROOT / "AGENT.md",
]

CONTEXT_IDENTITY_FILE = AGENT_ROOT / "context" / "freeman-intelligence-identity.md"

KNOWLEDGE_GLOBS = [
    "agents/the-architect/*.md",
    "agents/the-architect/research/*.md",
]


def get_api_key() -> str | None:
    return os.environ.get("ANTHROPIC_API_KEY")


def get_gemini_api_key() -> str | None:
    return os.environ.get("GEMINI_API_KEY")


def get_hostinger_config() -> dict[str, str | None]:
    """Hostinger website credentials — local .env only, never commit."""
    return {
        "domain": os.environ.get("HOSTINGER_DOMAIN"),
        "sftp_host": os.environ.get("HOSTINGER_SFTP_HOST"),
        "sftp_user": os.environ.get("HOSTINGER_SFTP_USER"),
        "sftp_password": os.environ.get("HOSTINGER_SFTP_PASSWORD"),
        "sftp_port": os.environ.get("HOSTINGER_SFTP_PORT", "21"),
        "wp_url": os.environ.get("HOSTINGER_WP_URL"),
        "wp_user": os.environ.get("HOSTINGER_WP_USER"),
        "wp_app_password": os.environ.get("HOSTINGER_WP_APP_PASSWORD"),
        "api_token": os.environ.get("HOSTINGER_API_TOKEN"),
    }


def get_integration_config() -> dict[str, str | None]:
    """External metrics integrations — ESP, KDP CSV, Stripe."""
    return {
        "esp_provider": os.environ.get("ESP_PROVIDER"),
        "convertkit_api_secret": os.environ.get("CONVERTKIT_API_SECRET"),
        "beehiiv_api_key": os.environ.get("BEEHIIV_API_KEY"),
        "beehiiv_publication_id": os.environ.get("BEEHIIV_PUBLICATION_ID"),
        "kdp_csv_path": os.environ.get("KDP_CSV_PATH"),
        "stripe_secret_key": os.environ.get("STRIPE_SECRET_KEY"),
        "stripe_webhook_secret": os.environ.get("STRIPE_WEBHOOK_SECRET"),
        "metrics_month": os.environ.get("METRICS_MONTH"),
    }


def ensure_projects_dir() -> Path:
    PROJECTS_DIR.mkdir(parents=True, exist_ok=True)
    return PROJECTS_DIR


def slugify(name: str) -> str:
    import re

    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-") or "project"
