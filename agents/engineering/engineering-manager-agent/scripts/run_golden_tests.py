#!/usr/bin/env python3
import subprocess, sys
from pathlib import Path

SCRIPTS = ["workload_analyzer.py", "capacity_calculator.py", "velocity_tracker.py",
           "blocker_detector.py", "commitment_validator.py"]

def main() -> int:
    d = Path(__file__).resolve().parent
    failures = 0
    print("=" * 60)
    print("ENGINEERING MANAGER AGENT — Golden Tests")
    print("=" * 60)
    for s in SCRIPTS:
        print(f"\n▶ {s} --selftest")
        r = subprocess.run([sys.executable, str(d / s), "--selftest"], capture_output=True, text=True)
        print("  ✓ PASS" if r.returncode == 0 else f"  ✗ FAIL\n{r.stdout}{r.stderr}")
        failures += r.returncode != 0
    print("\n" + "=" * 60)
    print(f"ALL PASS: {len(SCRIPTS)}/{len(SCRIPTS)}" if not failures else f"FAILED: {failures}")
    return 1 if failures else 0

if __name__ == "__main__":
    raise SystemExit(main())
