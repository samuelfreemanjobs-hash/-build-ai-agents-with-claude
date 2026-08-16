import argparse
import json
import logging
import sys

from qa_engineer_agent.agent import QAEngineerAgent
from qa_engineer_agent.halts import HaltError


def main(argv=None):
    parser = argparse.ArgumentParser(description="QA Engineer Agent™")
    sub = parser.add_subparsers(dest="cmd", required=True)

    validate = sub.add_parser("validate")
    validate.add_argument("description")
    validate.add_argument("--mock", action="store_true")
    validate.add_argument("--json", action="store_true")

    sub.add_parser("api").set_defaults(func=lambda _: __import__("qa_engineer_agent.api.main", fromlist=["run"]).run() or 0)

    args = parser.parse_args(argv)
    if args.cmd == "validate":
        logging.basicConfig(level=logging.INFO)
        try:
            package = QAEngineerAgent(mock_llm=args.mock).execute(args.description)
            output = {
                "run_id": package.run_id,
                "release": package.scope.release_name,
                "coverage_pct": package.coverage.get("coverage_pct"),
                "risk_level": package.risk.get("risk_level"),
                "recommendation": package.readiness.recommendation,
            }
            if args.json:
                print(json.dumps(output, indent=2))
            else:
                print(
                    f"Run: {package.run_id} | Release: {package.scope.release_name} | "
                    f"Coverage: {output['coverage_pct']}% | Risk: {output['risk_level']} | "
                    f"Decision: {output['recommendation']}"
                )
            return 0
        except HaltError as error:
            print(f"HALT [{error.cause.value}]: {error.message}", file=sys.stderr)
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
