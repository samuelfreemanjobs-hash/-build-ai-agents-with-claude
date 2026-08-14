"""CLI entry point."""

from __future__ import annotations

import argparse
import json
import logging
import sys

from principal_software_engineer.agent import PrincipalSoftwareEngineerAgent
from principal_software_engineer.halts import HaltError


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Principal Software Engineer Agent™ CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    run = sub.add_parser("design", help="Execute a design run")
    run.add_argument("problem", help="Problem description")
    run.add_argument("--repo", default=".")
    run.add_argument("--mock", action="store_true")
    run.add_argument("--json", action="store_true")

    sub.add_parser("api", help="Start API server").set_defaults(func=lambda _: _run_api())

    args = parser.parse_args(argv)
    if args.command == "design":
        logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
        try:
            agent = PrincipalSoftwareEngineerAgent(mock_llm=args.mock)
            package = agent.execute_design(args.problem, args.repo)
            if args.json:
                print(json.dumps({
                    "run_id": package.run_id, "problem_title": package.problem_title,
                    "options": len(package.options),
                    "recommended": package.evaluation.recommended_option if package.evaluation else None,
                    "review": package.design_review.recommendation if package.design_review else None,
                    "run_log": package.run_log,
                }, indent=2, default=str))
            else:
                print(f"\nRun ID: {package.run_id}")
                print(f"Problem: {package.problem_title}")
                print(f"Options evaluated: {len(package.options)}")
                if package.evaluation:
                    print(f"Recommended: {package.evaluation.recommended_option}")
                if package.design_review:
                    print(f"Review: {package.design_review.recommendation}")
            return 0
        except HaltError as e:
            print(f"HALT [{e.cause.value}]: {e.message}", file=sys.stderr)
            return 1
    return 0


def _run_api() -> int:
    from principal_software_engineer.api.main import run
    run()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
