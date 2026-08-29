"""CLI entry point: python -m the_architect"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

from the_architect.learning.pipeline import format_summary, run_daily_learning
from the_architect.memory.store import MemoryStore
from the_architect.runner import run_chat, run_once


def main() -> None:
    load_dotenv()

    parser = argparse.ArgumentParser(
        description="The Architect — agentic AI copywriter (Claude Agent SDK)",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    run_p = sub.add_parser("run", help="Run one autonomous task")
    run_p.add_argument("prompt", nargs="?", help="Task prompt (or use --file)")
    run_p.add_argument("--file", "-f", type=Path, help="Read prompt from file")
    run_p.add_argument("--max-turns", type=int, default=40, help="Max agentic turns")

    chat_p = sub.add_parser("chat", help="Interactive agentic session")
    chat_p.add_argument("--max-turns", type=int, default=40, help="Max turns per message")

    learn_p = sub.add_parser(
        "learn",
        help="Run daily headline swipe learning (Buzzhead, Cosmo, Enquirer, proven, sales letters)",
    )
    learn_p.add_argument("--limit", type=int, default=15, help="Max headlines per source")
    learn_p.add_argument(
        "--source",
        action="append",
        choices=["buzzfeed", "cosmopolitan", "national_enquirer", "proven_headlines", "salesletters"],
        help="Limit to specific source(s); repeatable",
    )

    mem_p = sub.add_parser("memory", help="Show memory stats and recent learnings")
    mem_p.add_argument("--limit", type=int, default=10, help="Number of recent swipes to show")

    args = parser.parse_args()

    if args.command == "run":
        if args.file:
            prompt = args.file.read_text(encoding="utf-8")
        elif args.prompt:
            prompt = args.prompt
        else:
            print("Provide a prompt or --file", file=sys.stderr)
            sys.exit(1)
        asyncio.run(run_once(prompt, max_turns=args.max_turns))

    elif args.command == "chat":
        asyncio.run(run_chat(max_turns=args.max_turns))

    elif args.command == "learn":
        summary = run_daily_learning(sources=args.source, limit_per_source=args.limit)
        print(format_summary(summary))

    elif args.command == "memory":
        store = MemoryStore()
        store.ensure_dirs()
        stats = store.get_stats()
        print(json.dumps(stats, indent=2))
        print("\n--- Recent swipes ---\n")
        for s in store.get_recent_swipes(limit=args.limit):
            patterns = ", ".join(s.get("patterns", []))
            print(f"[{s.get('source')}] {s['headline']}")
            print(f"  {patterns} → {s.get('structural_move', '')}\n")


if __name__ == "__main__":
    main()
