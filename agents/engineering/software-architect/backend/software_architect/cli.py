import argparse, json, logging, sys
from software_architect.agent import SoftwareArchitectAgent
from software_architect.halts import HaltError


def main(argv=None):
    p = argparse.ArgumentParser(description="Software Architect Agent™")
    sub = p.add_subparsers(dest="cmd", required=True)
    m = sub.add_parser("model", help="Model system architecture")
    m.add_argument("description"); m.add_argument("--repo", default="."); m.add_argument("--mock", action="store_true"); m.add_argument("--json", action="store_true")
    sub.add_parser("api").set_defaults(func=lambda _: __import__("software_architect.api.main", fromlist=["run"]).run() or 0)
    a = p.parse_args(argv)
    if a.cmd == "model":
        logging.basicConfig(level=logging.INFO)
        try:
            pkg = SoftwareArchitectAgent(mock_llm=a.mock).execute(a.description, a.repo)
            if a.json:
                print(json.dumps({"run_id": pkg.run_id, "system": pkg.scope.system_name,
                                  "c4_levels": pkg.run_log.get("c4_levels"),
                                  "governance": pkg.governance.recommendation if pkg.governance else None}, indent=2))
            else:
                print(f"Run: {pkg.run_id} | System: {pkg.scope.system_name} | C4: {pkg.run_log.get('c4_levels')}")
            return 0
        except HaltError as e:
            print(f"HALT [{e.cause.value}]: {e.message}", file=sys.stderr); return 1
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
