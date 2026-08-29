"""Run daily headline swipe learning across all sources."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from the_architect.learning.annotator import annotate_headline
from the_architect.learning.sources import all_sources
from the_architect.memory.store import MemoryStore


def run_daily_learning(
    *,
    sources: list[str] | None = None,
    limit_per_source: int = 15,
    store: MemoryStore | None = None,
) -> dict[str, Any]:
    """
    Collect headlines from configured sources, annotate patterns, persist to memory.

    Returns summary dict suitable for CLI output and run logging.
    """
    memory = store or MemoryStore()
    memory.ensure_dirs()

    run_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    source_results: list[dict[str, Any]] = []
    total_added = 0

    available = {s.name: s for s in all_sources()}
    to_run = [available[n] for n in sources if n in available] if sources else list(all_sources())

    for src in to_run:
        result = src.collect(limit=limit_per_source)
        annotated = [annotate_headline(h, result.source) for h in result.headlines]
        record = memory.record_swipes(source=result.source, swipes=annotated, run_date=run_date)
        total_added += record["added"]

        source_results.append(
            {
                "source": result.source,
                "display_name": src.display_name,
                "collected": len(result.headlines),
                "added": record["added"],
                "fetched_live": result.fetched_live,
                "error": result.error,
            }
        )

    summary = {
        "date": run_date,
        "total_added": total_added,
        "sources": source_results,
        "stats": memory.get_stats(),
    }
    memory.record_run(summary)
    summary["stats"] = memory.get_stats()
    return summary


def format_summary(summary: dict[str, Any]) -> str:
    lines = [
        f"Daily headline learning — {summary['date']}",
        f"New swipes added: {summary['total_added']}",
        "",
    ]
    for s in summary.get("sources", []):
        live = "live" if s.get("fetched_live") else "seed"
        err = f" ({s['error']})" if s.get("error") else ""
        lines.append(
            f"  • {s['display_name']}: {s['added']} new / {s['collected']} collected [{live}]{err}"
        )
    stats = summary.get("stats", {})
    lines.extend(
        [
            "",
            f"Memory total: {stats.get('total_swipes', 0)} swipes across {stats.get('total_runs', 0)} runs",
            f"Digest: agents/the-architect/memory/digest.md",
        ]
    )
    return "\n".join(lines)
