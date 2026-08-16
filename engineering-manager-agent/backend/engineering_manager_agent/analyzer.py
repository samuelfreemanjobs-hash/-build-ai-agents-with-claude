import json, subprocess, sys, tempfile
from pathlib import Path
from engineering_manager_agent.halts import HaltCause, HaltError

SCRIPTS = Path(__file__).resolve().parent.parent.parent / "scripts"

def _run(script: str, **kwargs) -> dict:
    args = [sys.executable, str(SCRIPTS / script)]
    for k, v in kwargs.items():
        args.extend([f"--{k}", v])
    return json.loads(subprocess.run(args, capture_output=True, text=True, timeout=60).stdout)

def _temp(data: dict) -> str:
    f = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
    json.dump(data, f); f.close(); return f.name

class TeamAnalyzer:
    def analyze(self, context: dict) -> dict:
        path = _temp(context)
        workload = _run("workload_analyzer.py", context=path)
        capacity = _run("capacity_calculator.py", context=path)
        velocity = _run("velocity_tracker.py", context=path)
        blockers = _run("blocker_detector.py", context=path)
        if blockers.get("critical_count", 0) > 0:
            raise HaltError(HaltCause.CRITICAL_BLOCKER,
                            f"{blockers['critical_count']} critical blockers",
                            "Triage blockers before planning", stage="S4")
        return {"workload": workload, "capacity": capacity, "velocity": velocity, "blockers": blockers}

    def validate_commitments(self, capacity: dict, commitments: dict) -> dict:
        cp, cm = _temp(capacity), _temp(commitments)
        result = _run("commitment_validator.py", capacity=cp, commitments=cm)
        if result.get("status") == "FAIL":
            raise HaltError(HaltCause.OVERCOMMIT,
                            f"Overcommit by {result.get('overcommit_points', 0)} points",
                            "Reduce scope or extend timeline", stage="S3")
        return result
