"""CLI entry point for Software Developer Agent™."""

from __future__ import annotations

import argparse
import json
import logging
import sys
from dataclasses import asdict

from software_developer_agent.agent import SoftwareDeveloperAgent
from software_developer_agent.halts import HaltError


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Software Developer Agent™ CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    run = sub.add_parser("run", help="Execute a development task")
    run.add_argument("task", help="Task description")
    run.add_argument("--repo", default=".", help="Repository path")
    run.add_argument("--mock", action="store_true", help="Use mock LLM")
    run.add_argument("--json", action="store_true", help="Output JSON")

    sub.add_parser("api", help="Start the API server").set_defaults(func=lambda _: _run_api())

    args = parser.parse_args(argv)

    if args.command == "run":
        logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
        try:
            agent = SoftwareDeveloperAgent(mock_llm=args.mock)
            package = agent.execute_task(args.task, args.repo)
            if args.json:
                print(json.dumps({
                    "run_id": package.run_id,
                    "task_title": package.task_title,
                    "tier": package.tier.value,
                    "review": package.code_review.recommendation if package.code_review else None,
                    "run_log": package.run_log,
                }, indent=2, default=str))
            else:
                print(f"\nRun ID: {package.run_id}")
                print(f"Task: {package.task_title}")
                print(f"Tier: {package.tier.value}")
                if package.code_review:
                    print(f"Review: {package.code_review.recommendation} (score: {package.code_review.scores.get('overall', 'N/A')})")
            return 0
        except HaltError as e:
            print(f"HALT [{e.cause.value}]: {e.message}", file=sys.stderr)
            print(f"Fix: {e.fix_path}", file=sys.stderr)
            return 1

    return 0


def _run_api() -> int:
    from software_developer_agent.api.main import run
    run()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
