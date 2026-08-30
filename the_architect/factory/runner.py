"""Production factory orchestration — daily chapter, content, weekly launch."""

from __future__ import annotations

import json
from typing import Any

from the_architect.config import get_api_key
from the_architect.factory.prompts import (
    book_outline_prompt,
    chapter_prompt,
    daily_content_prompt,
    weekly_launch_prompt,
)
from the_architect.factory.state import (
    factory_status,
    load_config,
    mark_chapter_complete,
    needs_chapter_today,
    needs_content_today,
    record_content_batch,
)


async def _run_agent(prompt: str, *, max_turns: int) -> None:
    from the_architect.runner import run_once

    await run_once(prompt, max_turns=max_turns)


def _ensure_api_key(*, dry_run: bool) -> bool:
    if get_api_key():
        return True
    if dry_run:
        return False
    raise SystemExit(
        "ANTHROPIC_API_KEY is not set. Required for factory agent runs. "
        "Use --dry-run to preview prompts without API calls."
    )


async def run_daily_chapter(*, dry_run: bool = False, max_turns: int = 50) -> dict[str, Any]:
    """Write today's chapter if quota not met."""
    need, book = needs_chapter_today()
    result: dict[str, Any] = {"ran": False, "skipped": not need, "book": book}

    if not need or not book:
        result["reason"] = "no_active_book_or_quota_met"
        return result

    chapter_num = book["next_chapter"]
    prompt = chapter_prompt(book=book, chapter_number=chapter_num)
    result["chapter_number"] = chapter_num
    result["prompt_preview"] = prompt[:500] + "..."

    if dry_run or not _ensure_api_key(dry_run=dry_run):
        result["dry_run"] = True
        return result

    await _run_agent(prompt, max_turns=max_turns)
    filename = f"chapter-{chapter_num:02d}.md"
    mark_chapter_complete(chapter_num, filename=filename)
    result["ran"] = True
    result["filename"] = filename
    return result


async def run_daily_content(*, dry_run: bool = False, max_turns: int = 35) -> dict[str, Any]:
    """Generate today's content batch for active launch."""
    need, launch = needs_content_today()
    config = load_config()
    result: dict[str, Any] = {"ran": False, "skipped": not need, "launch": launch}

    if not need or not launch:
        result["reason"] = "no_active_launch_or_batch_done"
        return result

    posts = int(config.get("schedule", {}).get("content_posts_per_day", 3))
    platforms = list(config.get("platforms", ["x", "linkedin", "email"]))
    prompt = daily_content_prompt(launch=launch, posts_per_day=posts, platforms=platforms)
    result["prompt_preview"] = prompt[:500] + "..."

    if dry_run or not _ensure_api_key(dry_run=dry_run):
        result["dry_run"] = True
        return result

    await _run_agent(prompt, max_turns=max_turns)
    record_content_batch(launch["project_slug"], count=posts)
    result["ran"] = True
    return result


async def run_weekly_launch(*, dry_run: bool = False, max_turns: int = 80) -> dict[str, Any]:
    """Full weekly product + marketing asset pipeline."""
    from the_architect.factory.state import load_state

    state = load_state()
    launch = state.get("active_launch")
    result: dict[str, Any] = {"ran": False, "launch": launch}

    if not launch:
        result["skipped"] = True
        result["reason"] = "no_active_launch_register_with_factory_register_launch"
        return result

    prompt = weekly_launch_prompt(launch=launch)
    result["prompt_preview"] = prompt[:500] + "..."

    if dry_run or not _ensure_api_key(dry_run=dry_run):
        result["dry_run"] = True
        return result

    await _run_agent(prompt, max_turns=max_turns)
    result["ran"] = True
    result["note"] = "Launch run complete. Review assets; run factory complete-launch when ship gate passes."
    return result


async def run_book_outline(*, dry_run: bool = False, max_turns: int = 40) -> dict[str, Any]:
    from the_architect.factory.state import load_state

    state = load_state()
    book = state.get("active_book")
    result: dict[str, Any] = {"ran": False, "book": book}
    if not book:
        result["skipped"] = True
        result["reason"] = "no_active_book"
        return result

    prompt = book_outline_prompt(book=book)
    result["prompt_preview"] = prompt[:500] + "..."

    if dry_run or not _ensure_api_key(dry_run=dry_run):
        result["dry_run"] = True
        return result

    await _run_agent(prompt, max_turns=max_turns)
    result["ran"] = True
    return result


async def run_daily_production(*, dry_run: bool = False, max_turns_chapter: int = 50, max_turns_content: int = 35) -> dict[str, Any]:
    """Daily factory: chapter (if needed) + content batch (if active launch)."""
    chapter_result = await run_daily_chapter(dry_run=dry_run, max_turns=max_turns_chapter)
    content_result = await run_daily_content(dry_run=dry_run, max_turns=max_turns_content)
    return {
        "status": factory_status(),
        "chapter": chapter_result,
        "content": content_result,
    }


def format_factory_summary(payload: dict[str, Any]) -> str:
    return json.dumps(payload, indent=2, default=str)
