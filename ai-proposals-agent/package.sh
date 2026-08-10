#!/usr/bin/env bash
# AI Proposals Agent™ — packaging script
# Validates manifest, JSON schemas, prompt frontmatter; produces tarball + sha256.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DIST="$ROOT/dist"
PKG="ai-proposals-agent-${STAMP}"

# Required files manifest
REQUIRED=(
  README.md
  docs/complete-system-design.md
  docs/system-design.md
  docs/prompt-architecture.md
  docs/knowledge-base.md
  docs/ui-ux-flows.md
  docs/gtm-and-monetization.md
  docs/implementation-roadmap.md
  docs/brand-system.md
  docs/runbook.md
  schemas/run-log.schema.json
  schemas/pricing-output.schema.json
  schemas/compliance-report.schema.json
  schemas/rfp-intake.schema.json
  prompts/master-system.md
  prompts/orchestrator.md
  prompts/sub/rfp-analysis.md
  prompts/sub/past-proposal-mining.md
  prompts/sub/executive-summary.md
  prompts/sub/technical-capability.md
  prompts/sub/case-study-selector.md
  prompts/sub/compliance-injector.md
  prompts/sub/pricing-narrative.md
  prompts/sub/quality-assurance.md
  ui/operator-console/index.html
  backend/pyproject.toml
  backend/ai_proposals_agent/agent.py
  backend/ai_proposals_agent/pricing_engine.py
  backend/ai_proposals_agent/halts.py
  backend/tests/test_pricing_engine.py
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

echo "==> Prompt frontmatter validation"
ROOT="$ROOT" python3 -c "
import re, sys, pathlib, os
root = pathlib.Path(os.environ['ROOT'])
for p in list((root / 'prompts').glob('*.md')) + list((root / 'prompts' / 'sub').glob('*.md')):
    text = p.read_text()
    if not text.startswith('---'):
        print(f'FAIL: {p} missing frontmatter'); sys.exit(1)
    m = re.match(r'---\n(.*?)\n---', text, re.DOTALL)
    if not m or 'id:' not in m.group(1) or 'version:' not in m.group(1):
        print(f'FAIL: {p} frontmatter requires id + version'); sys.exit(1)
print('  OK')
"

echo "==> Self-tests"
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
  README.md docs schemas prompts ui backend package.sh 2>/dev/null | tar xf - -C "$TMP"
ARCHIVE="$DIST/${PKG}.tar.gz"
tar -czf "$ARCHIVE" -C "$DIST" "$PKG"
sha256sum "$ARCHIVE" > "${ARCHIVE}.sha256"
rm -rf "$TMP"

echo "==> DONE"
echo "  $ARCHIVE"
echo "  ${ARCHIVE}.sha256"
cat "${ARCHIVE}.sha256"
