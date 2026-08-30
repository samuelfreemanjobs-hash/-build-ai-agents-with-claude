"""CLI entry point: python -m the_architect"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

from the_architect.gmail.ingest import format_ingest_summary, run_gmail_ingest
from the_architect.learning.pipeline import format_summary, run_daily_learning
from the_architect.memory.store import MemoryStore
from the_architect.factory import (
    factory_status,
    format_factory_summary,
    register_book,
    register_launch,
)
from the_architect.factory.runner import (
    run_book_outline,
    run_daily_chapter,
    run_daily_content,
    run_daily_production,
    run_weekly_launch,
)
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

    gmail_p = sub.add_parser(
        "ingest-gmail",
        help="One-time: ingest Kennedy & Kern inbox emails into email swipe file",
    )
    gmail_p.add_argument("--auth", action="store_true", help="Run OAuth login only")
    gmail_p.add_argument("--dry-run", action="store_true", help="Count matching emails without ingesting")
    gmail_p.add_argument("--max", type=int, default=None, help="Max emails to fetch (default: all)")
    gmail_p.add_argument("--query", type=str, default=None, help="Custom Gmail search query")

    factory_p = sub.add_parser("factory", help="Production factory — chapters, content, weekly launches")
    factory_sub = factory_p.add_subparsers(dest="factory_command", required=True)

    f_status = factory_sub.add_parser("status", help="Show factory state and quotas")
    f_status.add_argument("--json", action="store_true", help="JSON output")

    f_reg_book = factory_sub.add_parser("register-book", help="Register active Kindle book for daily chapters")
    f_reg_book.add_argument("title", help="Book title")
    f_reg_book.add_argument("--brief", "-b", required=True, help="Book brief / transformation promise")
    f_reg_book.add_argument("--chapters", "-c", type=int, default=12, help="Total chapters")
    f_reg_book.add_argument("--outline", default="outline.md", help="Outline filename in project folder")

    f_reg_launch = factory_sub.add_parser("register-launch", help="Register weekly product launch")
    f_reg_launch.add_argument("title", help="Product / offer name")
    f_reg_launch.add_argument("--brief", "-b", required=True, help="Launch brief")
    f_reg_launch.add_argument("--price", "-p", default="", help="Price point")
    f_reg_launch.add_argument(
        "--type",
        default="info_product",
        choices=["info_product", "course", "coaching", "saas", "lead_magnet"],
        help="Launch type",
    )

    f_outline = factory_sub.add_parser("outline", help="Generate book outline (run once before daily chapters)")
    f_outline.add_argument("--dry-run", action="store_true")
    f_outline.add_argument("--max-turns", type=int, default=40)

    f_chapter = factory_sub.add_parser("chapter", help="Write today's chapter (if quota not met)")
    f_chapter.add_argument("--dry-run", action="store_true")
    f_chapter.add_argument("--max-turns", type=int, default=50)

    f_content = factory_sub.add_parser("content", help="Today's content batch for active launch")
    f_content.add_argument("--dry-run", action="store_true")
    f_content.add_argument("--max-turns", type=int, default=35)

    f_daily = factory_sub.add_parser("daily", help="Run daily production: chapter + content")
    f_daily.add_argument("--dry-run", action="store_true")
    f_daily.add_argument("--max-turns-chapter", type=int, default=50)
    f_daily.add_argument("--max-turns-content", type=int, default=35)

    f_launch = factory_sub.add_parser("launch", help="Full weekly product + marketing pipeline")
    f_launch.add_argument("--dry-run", action="store_true")
    f_launch.add_argument("--max-turns", type=int, default=80)

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

    elif args.command == "ingest-gmail":
        if args.auth:
            from the_architect.gmail.auth import authenticate

            authenticate(force=True)
            print("Gmail authenticated. Token saved. Run: the-architect ingest-gmail")
        else:
            from the_architect.gmail.client import DEFAULT_QUERY

            result = run_gmail_ingest(
                query=args.query or DEFAULT_QUERY,
                max_results=args.max,
                dry_run=args.dry_run,
            )
            print(format_ingest_summary(result))

    elif args.command == "factory":
        if args.factory_command == "status":
            payload = factory_status()
            if args.json:
                print(json.dumps(payload, indent=2, default=str))
            else:
                print("=== The Architect Production Factory ===\n")
                book = payload.get("active_book")
                launch = payload.get("active_launch")
                if book:
                    print(
                        f"Book: {book.get('title')} — chapter {book.get('next_chapter')}/{book.get('total_chapters')}"
                    )
                    print(f"  Last chapter: {book.get('last_chapter_date') or 'never'}")
                else:
                    print("Book: (none) — register with: factory register-book")
                if launch:
                    prog = payload.get("launch_progress") or {}
                    print(f"Launch: {launch.get('title')} — {prog.get('percent', 0)}% assets")
                else:
                    print("Launch: (none) — register with: factory register-launch")
                print(f"\nNeeds chapter today: {payload.get('needs_chapter_today')}")
                print(f"Needs content today: {payload.get('needs_content_today')}")
                print(f"History: {payload.get('history_counts')}")

        elif args.factory_command == "register-book":
            book = register_book(
                title=args.title,
                brief=args.brief,
                total_chapters=args.chapters,
                outline_file=args.outline,
            )
            print(f"Registered book: {book['project_slug']} ({args.chapters} chapters)")
            print("Next: the-architect factory outline  # once")
            print("Then: the-architect factory daily    # or cron")

        elif args.factory_command == "register-launch":
            launch = register_launch(
                title=args.title,
                brief=args.brief,
                price_point=args.price,
                launch_type=args.type,
            )
            print(f"Registered launch: {launch['project_slug']}")
            print("Run: the-architect factory launch  # full asset pipeline")

        elif args.factory_command == "outline":
            result = asyncio.run(run_book_outline(dry_run=args.dry_run, max_turns=args.max_turns))
            print(format_factory_summary(result))

        elif args.factory_command == "chapter":
            result = asyncio.run(run_daily_chapter(dry_run=args.dry_run, max_turns=args.max_turns))
            print(format_factory_summary(result))

        elif args.factory_command == "content":
            result = asyncio.run(run_daily_content(dry_run=args.dry_run, max_turns=args.max_turns))
            print(format_factory_summary(result))

        elif args.factory_command == "daily":
            result = asyncio.run(
                run_daily_production(
                    dry_run=args.dry_run,
                    max_turns_chapter=args.max_turns_chapter,
                    max_turns_content=args.max_turns_content,
                )
            )
            print(format_factory_summary(result))

        elif args.factory_command == "launch":
            result = asyncio.run(run_weekly_launch(dry_run=args.dry_run, max_turns=args.max_turns))
            print(format_factory_summary(result))


if __name__ == "__main__":
    main()
