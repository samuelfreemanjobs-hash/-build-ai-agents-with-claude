#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${HOME}/.local/bin:${PATH}"

echo "=== SaaS Factory ==="
(cd saas-factory && pip install -e ".[dev]" -q && python3 -m pytest -q && python3 -m saas_factory.cli validate)

# Scaffolded agents with golden tests and backends (skip design-only products)
AGENT_PATHS=(
  agents/b2b/ai-proposals-agent
  agents/engineering/software-developer-agent
  agents/engineering/principal-software-engineer
  agents/engineering/software-architect
  agents/engineering/engineering-manager-agent
  agents/engineering/qa-engineer-agent
)

for agent_path in "${AGENT_PATHS[@]}"; do
  echo ""
  echo "=== $agent_path ==="
  (cd "$agent_path" && python3 scripts/run_golden_tests.py)
  (cd "$agent_path/backend" && pip install -e ".[dev]" -q && python3 -m pytest -q)
done

echo ""
echo "ALL VERIFICATION PASSED"
