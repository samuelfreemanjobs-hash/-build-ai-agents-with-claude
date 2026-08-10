#!/usr/bin/env bash
# AI Proposals Agent™ — packaging script
# Validates manifest, JSON schemas, skills; runs golden + pytest; produces tarball.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DIST="$ROOT/dist"
PKG="ai-proposals-agent-${STAMP}"

REQUIRED=(
  README.md
  agent/SOUL.md
  agent/DUTIES.md
  agent/system-prompt.md
  agent/core-config.xml
  docs/ADR-001-architecture-selection.md
  docs/observability-contract.md
  docs/runbook.md
  docs/fallback-playbook.md
  docs/complete-system-design.md
  docs/system-design.md
  docs/deployment-guide.md
  docs/known-gaps.md
  scripts/pricing_engine.py
  scripts/compliance_validator.py
  scripts/case_study_scorer.py
  scripts/token_economics.py
  scripts/run_golden_tests.py
  skills/rfp-requirement-extraction/SKILL.md
  skills/compliance-matrix-mapping/SKILL.md
  skills/case-study-selection/SKILL.md
  skills/pricing-narrative/SKILL.md
  skills/proposal-qa-evaluator/SKILL.md
  schemas/run-log.schema.json
  schemas/pricing-output.schema.json
  schemas/compliance-matrix.schema.json
  schemas/rfp-requirements.schema.json
  schemas/compliance-report.schema.json
  schemas/rfp-intake.schema.json
  tests/golden/README.md
  ui/operator-console/index.html
  backend/pyproject.toml
  backend/ai_proposals_agent/agent.py
  backend/ai_proposals_agent/pricing_engine.py
  backend/ai_proposals_agent/halts.py
  backend/ai_proposals_agent/api/main.py
  deploy/docker-compose.yml
  deploy/Dockerfile
  deploy/.env.example
  deploy/sql/init.sql
  frontend/package.json
  frontend/src/App.jsx
  package.sh
)

echo "==> Manifest check"
MISSING=0
for f in "${REQUIRED[@]}"; do
  if [[ ! -f "$ROOT/$f" ]]; then
    echo "  MISSING: $f"
    MISSING=1
  fi
done
if [[ "$MISSING" -ne 0 ]]; then
  echo "FAIL: missing required files"
  exit 1
fi
echo "  OK (${#REQUIRED[@]} files)"

echo "==> JSON well-formedness"
for j in "$ROOT"/schemas/*.json; do
  python3 -c "import json; json.load(open('$j'))" || { echo "FAIL: $j"; exit 1; }
done
echo "  OK"

echo "==> Skill frontmatter validation"
ROOT="$ROOT" python3 -c "
import re, sys, pathlib, os
root = pathlib.Path(os.environ['ROOT'])
for p in (root / 'skills').rglob('SKILL.md'):
    text = p.read_text()
    if not text.startswith('---'):
        print(f'FAIL: {p} missing frontmatter'); sys.exit(1)
    m = re.match(r'---\n(.*?)\n---', text, re.DOTALL)
    if not m or 'name:' not in m.group(1) or 'description:' not in m.group(1):
        print(f'FAIL: {p} frontmatter requires name + description'); sys.exit(1)
print('  OK')
"

echo "==> Golden component self-tests"
python3 "$ROOT/scripts/run_golden_tests.py" || exit 1

echo "==> Backend pytest"
ROOT="$ROOT" python3 << 'PY'
import os, subprocess, sys
root = os.environ["ROOT"]
backend = os.path.join(root, "backend")
rc = subprocess.call([sys.executable, "-m", "pytest", "tests/", "-q"], cwd=backend, env={**os.environ, "PYTHONPATH": backend})
if rc != 0:
    sys.exit(rc)
print("  pytest OK")
PY

echo "==> Packaging"
mkdir -p "$DIST"
TMP="$DIST/$PKG"
rm -rf "$TMP"
mkdir -p "$TMP"
tar cf - -C "$ROOT" \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='proposal_PROP-*.json' \
  --exclude='backend/.pytest_cache' \
  --exclude='backend/*.egg-info' \
  --exclude='frontend/node_modules' \
  --exclude='frontend/dist' \
  README.md agent skills scripts schemas tests docs prompts ui backend deploy kb package.sh .ai 2>/dev/null | tar xf - -C "$TMP"
ARCHIVE="$DIST/${PKG}.tar.gz"
tar -czf "$ARCHIVE" -C "$DIST" "$PKG"
sha256sum "$ARCHIVE" > "${ARCHIVE}.sha256"
rm -rf "$TMP"

echo "==> DONE"
echo "  $ARCHIVE"
echo "  ${ARCHIVE}.sha256"
cat "${ARCHIVE}.sha256"
