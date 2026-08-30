"""Run full agentic build for a marketing agent."""

from __future__ import annotations

from typing import Any

from the_architect.agent_builder.prompts import build_agent_prompt
from the_architect.agent_builder.scaffold import scaffold_agent
from the_architect.config import get_api_key


async def run_build_agent(
    *,
    name: str,
    archetype: str,
    brief: str,
    metric: str = "conversion rate",
    include_python: bool = False,
    dry_run: bool = False,
    max_turns: int = 60,
) -> dict[str, Any]:
    result: dict[str, Any] = {"name": name, "archetype": archetype}

    try:
        scaffold = scaffold_agent(
            name=name,
            archetype=archetype,
            metric=metric,
            one_line_job=brief[:200] if brief else "",
            include_python=include_python,
        )
    except FileExistsError as e:
        scaffold = {"agent_dir": str(e).split(": ")[-1], "agent_slug": name}
        result["scaffold_skipped"] = str(e)

    result["scaffold"] = scaffold
    agent_dir = scaffold.get("agent_dir", f"agents/{name}")

    prompt = build_agent_prompt(
        name=name,
        archetype=archetype,
        brief=brief,
        metric=metric,
        scaffold_path=agent_dir,
    )
    result["prompt_preview"] = prompt[:600] + "..."

    if dry_run or not get_api_key():
        result["dry_run"] = True
        return result

    from the_architect.runner import run_once

    await run_once(prompt, max_turns=max_turns)
    result["ran"] = True
    return result
