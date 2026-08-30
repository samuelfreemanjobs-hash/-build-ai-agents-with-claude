#!/usr/bin/env python3
"""Pull ESP, KDP, and Stripe metrics into website/ops/data/."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv

load_dotenv(ROOT / ".env")

from the_architect.integrations.sync import sync_all  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync external metrics into ops portal")
    parser.add_argument("--dry-run", action="store_true", help="Fetch only; do not write files")
    parser.add_argument(
        "--triggered-by",
        default="local",
        help="Label for sync log (local, github_actions, cron)",
    )
    args = parser.parse_args()

    summary = sync_all(triggered_by=args.triggered_by, dry_run=args.dry_run)
    print(json.dumps(summary, indent=2))

    errors = [k for k in ("esp", "kdp", "stripe") if summary.get(k) == "error"]
    if errors:
        print(f"Warning: errors from {', '.join(errors)}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
