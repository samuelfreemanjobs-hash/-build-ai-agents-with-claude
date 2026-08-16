#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== SaaS Factory ==="
(cd saas-factory && pip install -e ".[dev]" -q && pytest -q && saas-factory validate)

AGENTS=(
  ai-proposals-agent
  software-developer-agent
  principal-software-engineer
  software-architect
  engineering-manager-agent
  qa-engineer-agent
)

for agent in "${AGENTS[@]}"; do
  echo ""
  echo "=== $agent ==="
  (cd "$agent" && python3 scripts/run_golden_tests.py)
  (cd "$agent/backend" && pip install -e ".[dev]" -q && pytest -q)
done

echo ""
echo "ALL VERIFICATION PASSED"
