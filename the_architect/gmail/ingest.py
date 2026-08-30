"""One-time Gmail ingestion for Kennedy/Kern email swipe building."""

from __future__ import annotations

from typing import Any

from the_architect.gmail.client import DEFAULT_QUERY, count_messages, fetch_messages
from the_architect.learning.email_swipe import build_swipe_files


def run_gmail_ingest(
    *,
    query: str = DEFAULT_QUERY,
    max_results: int | None = None,
    force_auth: bool = False,
    dry_run: bool = False,
) -> dict[str, Any]:
    """
    Fetch Kennedy + Kern inbox emails and build annotated swipe files.

    Requires one-time Google OAuth — see agents/the-architect/GMAIL-INGEST.md.
    """
    if dry_run:
        total = count_messages(query=query)
        return {
            "dry_run": True,
            "estimated_messages": total,
            "query": query,
        }

    emails = fetch_messages(query=query, max_results=max_results, force_auth=force_auth)
    if not emails:
        return {
            "total": 0,
            "message": "No matching emails found. Check query or sender filters.",
            "query": query,
        }

    result = build_swipe_files(emails)
    result["query"] = query
    return result


def format_ingest_summary(result: dict[str, Any]) -> str:
    if result.get("dry_run"):
        return (
            f"Gmail dry run\n"
            f"Estimated messages: {result.get('estimated_messages', '?')}\n"
            f"Query: {result.get('query', '')}\n"
            f"\nRun without --dry-run to ingest and build swipe files."
        )

    if result.get("total", 0) == 0:
        return result.get("message", "No emails ingested.")

    lines = [
        "Kennedy & Kern email ingestion complete",
        f"Total: {result['total']} | Kennedy: {result['kennedy']} | Kern: {result['kern']}",
    ]
    if result.get("unknown"):
        lines.append(f"Unknown sender: {result['unknown']}")
    lines.extend(
        [
            "",
            f"Output: {result.get('output_dir', '')}/",
            "  • KENNEDY-KERN-EMAIL-SWIPE.md — annotated swipe file",
            "  • EMAIL-PATTERNS-LEARNED.md — psychology pattern summary",
            "  • raw.json — full archive",
            "",
            "Subject lines synced to agents/the-architect/memory/",
        ]
    )
    return "\n".join(lines)
