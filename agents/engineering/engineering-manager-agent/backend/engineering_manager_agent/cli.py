import argparse, json, logging, sys
from engineering_manager_agent.agent import EngineeringManagerAgent
from engineering_manager_agent.halts import HaltError

def main(argv=None):
    p = argparse.ArgumentParser(description="Engineering Manager Agent™")
    sub = p.add_subparsers(dest="cmd", required=True)
    pl = sub.add_parser("plan"); pl.add_argument("description"); pl.add_argument("--mock", action="store_true"); pl.add_argument("--json", action="store_true")
    sub.add_parser("api").set_defaults(func=lambda _: __import__("engineering_manager_agent.api.main", fromlist=["run"]).run() or 0)
    a = p.parse_args(argv)
    if a.cmd == "plan":
        logging.basicConfig(level=logging.INFO)
        try:
            pkg = EngineeringManagerAgent(mock_llm=a.mock).execute(a.description)
            out = {"run_id": pkg.run_id, "team": pkg.context.team_name,
                   "utilization": pkg.run_log.get("capacity_utilization"),
                   "governance": pkg.governance.recommendation if pkg.governance else None}
            print(json.dumps(out, indent=2) if a.json else f"Run: {pkg.run_id} | Team: {pkg.context.team_name} | Util: {out['utilization']}%")
            return 0
        except HaltError as e:
            print(f"HALT [{e.cause.value}]: {e.message}", file=sys.stderr); return 1
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
