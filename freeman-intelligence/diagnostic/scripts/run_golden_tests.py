#!/usr/bin/env python3
"""Golden tests for Freeman Intelligence diagnostic scorer."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

SCRIPTS = Path(__file__).parent


def main() -> int:
    print("=" * 60)
    print("FREEMAN INTELLIGENCE DIAGNOSTIC — Golden Tests")
    print("=" * 60)
    result = subprocess.run(
        [sys.executable, str(SCRIPTS / "revenue_diagnostic_scorer.py"), "--selftest"],
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        print(f"  ✓ {result.stdout.strip()}")
        print("=" * 60)
        print("ALL PASS: 1/1")
        return 0
    print(f"  ✗ FAIL\n{result.stderr}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
