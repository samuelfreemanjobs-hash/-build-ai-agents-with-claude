"""Prompt builders for production factory runs — God of Prompts XML envelopes."""

from __future__ import annotations

from typing import Any

from the_architect.factory.state import LAUNCH_ASSET_MANIFEST
from the_architect.prompt_engineering import build_factory_prompt

_ARCHITECT_ROLE = (
    "The Architect — Galactic Master System v4. One voice, no modes. "
    "Chief Persuasion Architect forged from Hopkins through Carlton. "
    "You eliminate fluff before it appears and ship only after self-critique."
)


def chapter_prompt(*, book: dict[str, Any], chapter_number: int) -> str:
    slug = book["project_slug"]
    title = book["title"]
    total = book["total_chapters"]
    outline = book.get("outline_file", "outline.md")

    return build_factory_prompt(
        mission=f"Write Chapter {chapter_number} of {total} for Kindle book: {title}",
        role=_ARCHITECT_ROLE,
        tier="T4",
        variables={
            "project_slug": slug,
            "chapter_number": str(chapter_number),
            "total_chapters": str(total),
            "outline_file": outline,
            "book_brief": book.get("brief", ""),
        },
        workflow_steps=[
            f"`architect_init_project` if `{slug}` missing",
            f"Load outline: agents/the-architect/projects/{slug}/{outline}",
            "Read BUSINESS-THRILLER-CRAFT.md + BOOK-THRILLER-OUTLINE-TEMPLATE.md",
            "DRAFT chapter → self-critique chain (PROMPT-SELF-CRITIQUE-CHAIN-TEMPLATE.md)",
            "EDIT via EDITOR-PASSES.md → SCORE ≥ 8.0 → SHIP",
            f"`architect_save_deliverable` as chapter-{chapter_number:02d}.md",
            "`architect_record_insight` — one craft insight",
        ],
        deliverables=[
            "Strategic note — chapter role, cliffhanger plan",
            f"Chapter {chapter_number} full prose (T4, 3,000+ words)",
            "Metadata: title, hook line, cliffhanger last line, word count",
            "Quality rubric table",
            "Back-matter CTA block for ideal reader",
        ],
        extra_constraints=(
            "End on cliffhanger — never summarize at chapter end. "
            "Framework teased, not dumped (unless Gathering chapter)."
        ),
    )


def daily_content_prompt(*, launch: dict[str, Any], posts_per_day: int, platforms: list[str]) -> str:
    slug = launch["project_slug"]
    platform_list = ", ".join(platforms)

    return build_factory_prompt(
        mission=f"Daily content batch for launch: {launch['title']}",
        role=_ARCHITECT_ROLE,
        tier="T2",
        variables={
            "project_slug": slug,
            "posts_per_day": str(posts_per_day),
            "platforms": platform_list,
            "launch_brief": launch.get("brief", ""),
            "price_point": launch.get("price_point", "per brief"),
        },
        workflow_steps=[
            f"`architect_get_context` for `{slug}` (init if missing)",
            "Phase 1 diagnostic summary (concise)",
            "Repurpose one core idea → platform-native variants (CONTENT-ENGINE-METHODOLOGY.md)",
            "Self-critique on hooks before ship",
            "Save to content/{date}-batch.md via architect_save_deliverable",
        ],
        deliverables=[
            f"{posts_per_day}+ pieces across {platform_list}",
            "X/Twitter thread OR punchline post",
            "LinkedIn narrative breakdown",
            "Email teaser OR social caption",
            "Trackable CTA on every promo piece",
        ],
        extra_constraints="Client attraction: every post advances avatar toward opt-in, DM, or conversation.",
    )


def weekly_launch_prompt(*, launch: dict[str, Any]) -> str:
    slug = launch["project_slug"]
    checklist = "\n".join(f"- {key}" for key in LAUNCH_ASSET_MANIFEST)

    return build_factory_prompt(
        mission=f"Complete product launch pipeline: {launch['title']}",
        role=_ARCHITECT_ROLE,
        tier="T4",
        variables={
            "project_slug": slug,
            "launch_type": launch.get("launch_type", "info_product"),
            "price_point": launch.get("price_point", "define in diagnostic"),
            "launch_brief": launch.get("brief", ""),
        },
        workflow_steps=[
            f"`architect_init_project` — name: {launch['title']}",
            "INTAKE → RESEARCH → DIAGNOSE → PLAN",
            "Produce each manifest asset with self-critique per T3+ asset",
            "State compaction every 10 turns (architect_compact_state)",
            "Each asset: rubric ≥ 8.0 + client attraction audit",
            "Final LAUNCH-INDEX.md + architect_ship_gate",
            "architect_record_insight",
        ],
        deliverables=[
            "All manifest assets saved under agents/the-architect/projects/{slug}/",
            checklist,
            "Strategic + Technical Diagnostic Summary",
            "Client Attraction Note per asset in LAUNCH-INDEX.md",
        ],
        extra_constraints="Galactic phases 1–10. Assemble, don't invent — flag [PROOF NEEDED].",
    )


def book_outline_prompt(*, book: dict[str, Any]) -> str:
    slug = book["project_slug"]
    return build_factory_prompt(
        mission=f"Book outline (thriller architecture): {book['title']} ({book['total_chapters']} chapters)",
        role=_ARCHITECT_ROLE,
        tier="T4",
        variables={
            "project_slug": slug,
            "total_chapters": str(book["total_chapters"]),
            "book_brief": book.get("brief", ""),
        },
        workflow_steps=[
            "Read BOOK-THRILLER-OUTLINE-TEMPLATE.md + BUSINESS-THRILLER-CRAFT.md",
            f"`architect_init_project` if `{slug}` missing",
            "Build chapter-by-chapter: title, hook, cliffhanger, framework reveal timing",
            "Save outline.md + diagnostics/book-outline.md",
        ],
        deliverables=[
            "Complete thriller outline with fair-play map",
            "Stakes ladder + MacGuffin timing",
            "Do NOT write chapters — outline only",
        ],
    )
