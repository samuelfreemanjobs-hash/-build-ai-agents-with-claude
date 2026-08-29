"""CLI entry point: python -m the_architect"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

from dotenv import load_dotenv

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


if __name__ == "__main__":
    main()
