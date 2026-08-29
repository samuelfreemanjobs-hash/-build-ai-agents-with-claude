"""Build system prompt from Architect knowledge files."""

from __future__ import annotations

from the_architect.config import AGENT_ROOT, SYSTEM_PROMPT_FILES


def build_system_prompt(extra: str | None = None) -> str:
    parts: list[str] = [
        "You are The Architect — an autonomous agentic copywriter.",
        "Follow the workflow in AGENT.md. One author voice. No modes.",
        "",
    ]

    for path in SYSTEM_PROMPT_FILES:
        if path.exists():
            parts.append(f"---\n# {path.name}\n\n{path.read_text(encoding='utf-8')}\n")

    parts.append(
        "---\n"
        "## Runtime instructions\n\n"
        "- Use `architect_init_project` at INTAKE when starting a new job.\n"
        "- Use `architect_set_phase` after each workflow phase.\n"
        "- Use `architect_get_context` to see brief, state, and next steps.\n"
        "- Use `architect_save_deliverable` at SHIP for final assets.\n"
        "- Use `architect_ship_gate` before declaring done.\n"
        "- Read methodology files from `agents/the-architect/` as needed.\n"
        "- Save project work under `agents/the-architect/projects/<slug>/`.\n"
        "- Never skip EDITOR-PASSES or QUALITY-RUBRIC.\n"
    )

    if extra:
        parts.append(f"\n---\n## Session context\n\n{extra}\n")

    return "\n".join(parts)
