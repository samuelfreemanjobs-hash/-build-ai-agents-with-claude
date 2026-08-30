"""Scaffold new agentic marketing agents."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from the_architect.config import REPO_ROOT, slugify

TEMPLATE_DIR = REPO_ROOT / "agents" / "_template"
AGENTS_DIR = REPO_ROOT / "agents"

ARCHETYPES = {
    "copy_chief": "Sales pages, emails, ads — full DR copy pipeline",
    "headline_smith": "T1 hooks, subject lines, blurbs",
    "funnel_architect": "Funnel maps, wireframes, email lifecycle",
    "email_sequencer": "Welcome, launch, nurture sequences",
    "voc_researcher": "VoC lexicon, objections, hook seeds",
    "offer_engineer": "Grand Slam offers, pricing, stacks",
    "content_factory": "Daily social, repurposing, content calendar",
    "launch_orchestrator": "Weekly product + full marketing manifest",
    "brand_strategist": "Positioning, tribe, brand architecture",
    "cro_auditor": "Funnel analytics, test plans, CRO audits",
    "kindle_author": "Daily chapters, business thriller books",
    "ads_scriptwriter": "VSL, Meta/TikTok/podcast scripts",
    "router": "Classify tasks and delegate to specialized agents",
}


def python_slug(name: str) -> str:
    s = slugify(name).replace("-", "_")
    return s or "marketing_agent"


def _substitute(text: str, vars: dict[str, str]) -> str:
    for key, val in vars.items():
        text = text.replace(f"{{{{{key}}}}}", val)
    return text


def scaffold_agent(
    *,
    name: str,
    archetype: str = "copy_chief",
    metric: str = "conversion rate",
    one_line_job: str = "",
    include_python: bool = False,
) -> dict[str, Any]:
    """Write agent file tree from _template."""
    if archetype not in ARCHETYPES:
        raise ValueError(f"Unknown archetype: {archetype}. Choose from: {', '.join(ARCHETYPES)}")

    agent_slug = slugify(name)
    agent_dir = AGENTS_DIR / agent_slug
    if agent_dir.exists():
        raise FileExistsError(f"Agent already exists: {agent_dir}")

    job = one_line_job or ARCHETYPES[archetype]
    py_slug = python_slug(name)
    vars_map = {
        "AGENT_NAME": name,
        "AGENT_SLUG": agent_slug,
        "ARCHETYPE": archetype,
        "METRIC": metric,
        "ONE_LINE_JOB": job,
        "PYTHON_SLUG": py_slug,
    }

    agent_dir.mkdir(parents=True)
    (agent_dir / "methodology").mkdir()
    (agent_dir / "projects").mkdir()
    (agent_dir / "projects" / ".gitkeep").write_text("", encoding="utf-8")

    created: list[str] = []
    for rel in ["README.md", "SYSTEM.md", "AGENT.md", "INVOCATION.md", "methodology/README.md"]:
        src = TEMPLATE_DIR / rel
        if not src.exists():
            continue
        dest = agent_dir / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(_substitute(src.read_text(encoding="utf-8"), vars_map), encoding="utf-8")
        created.append(str(dest.relative_to(REPO_ROOT)))

    # Link rubric reference in build record
    build_record = {
        "name": name,
        "slug": agent_slug,
        "archetype": archetype,
        "metric": metric,
        "one_line_job": job,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "files": created,
        "python_package": None,
    }

    rubric_src = REPO_ROOT / "agents" / "the-architect" / "QUALITY-RUBRIC.md"
    if rubric_src.exists():
        (agent_dir / "QUALITY-RUBRIC.md").write_text(
            f"# Quality Rubric\n\nInherited from The Architect.\n\nSee: `agents/the-architect/QUALITY-RUBRIC.md`\n",
            encoding="utf-8",
        )
        created.append(f"agents/{agent_slug}/QUALITY-RUBRIC.md")

    (agent_dir / "AGENT-BUILD.json").write_text(json.dumps(build_record, indent=2), encoding="utf-8")
    created.append(f"agents/{agent_slug}/AGENT-BUILD.json")

    if include_python:
        pkg_dir = REPO_ROOT / py_slug
        pkg_dir.mkdir(parents=True)
        _write_python_stub(pkg_dir, py_slug, agent_slug, name)
        build_record["python_package"] = py_slug
        (agent_dir / "AGENT-BUILD.json").write_text(json.dumps(build_record, indent=2), encoding="utf-8")

    return {
        "agent_slug": agent_slug,
        "agent_dir": str(agent_dir.relative_to(REPO_ROOT)),
        "archetype": archetype,
        "files_created": created,
        "python_package": build_record.get("python_package"),
    }


def _write_python_stub(pkg_dir: Path, py_slug: str, agent_slug: str, name: str) -> None:
    (pkg_dir / "__init__.py").write_text(f'"""{name} agent runtime."""\n', encoding="utf-8")
    (pkg_dir / "config.py").write_text(
        f'''"""Paths for {name}."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
AGENT_ROOT = REPO_ROOT / "agents" / "{agent_slug}"

SYSTEM_PROMPT_FILES = [
    AGENT_ROOT / "SYSTEM.md",
    AGENT_ROOT / "AGENT.md",
]
''',
        encoding="utf-8",
    )
    (pkg_dir / "prompts.py").write_text(
        f'''"""Build system prompt."""

from {py_slug}.config import SYSTEM_PROMPT_FILES


def build_system_prompt() -> str:
    parts = ["You are {name}. One voice. Follow AGENT.md workflow.\\n"]
    for path in SYSTEM_PROMPT_FILES:
        if path.exists():
            parts.append(f"---\\n# {{path.name}}\\n\\n{{path.read_text(encoding=\\'utf-8\\')}}\\n")
    return "\\n".join(parts)
''',
        encoding="utf-8",
    )
    (pkg_dir / "runner.py").write_text(
        '''"""Run via Claude Agent SDK — extend with tools.py."""

import os


def get_api_key() -> str | None:
    return os.environ.get("ANTHROPIC_API_KEY")
''',
        encoding="utf-8",
    )
    (pkg_dir / "__main__.py").write_text(
        f'''"""CLI: python -m {py_slug}"""

import argparse


def main() -> None:
    parser = argparse.ArgumentParser(description="{name}")
    parser.add_argument("prompt", nargs="?", help="Task prompt")
    args = parser.parse_args()
    print("Extend runner.py with Claude Agent SDK — see the_architect/runner.py")


if __name__ == "__main__":
    main()
''',
        encoding="utf-8",
    )


def list_archetypes() -> dict[str, str]:
    return dict(ARCHETYPES)
