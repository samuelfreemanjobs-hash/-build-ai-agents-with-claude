#!/usr/bin/env bash
# Verify repo completeness, run all self-tests, then package.
#   ./package.sh
set -euo pipefail

REPO="ai-proposals-agent"
STAMP="$(date +%Y%m%d-%H%M%S)"
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

MANIFEST=(
  "README.md"
  "package.sh"
  "docs/ADR-001-architecture-selection.md"
  "docs/observability-contract.md"
  "docs/runbook.md"
  "docs/fallback-playbook.md"
  "agent/SOUL.md"
  "agent/DUTIES.md"
  "agent/system-prompt.md"
  "agent/core-config.xml"
  "skills/rfp-requirement-extraction/SKILL.md"
  "skills/compliance-matrix-mapping/SKILL.md"
  "skills/case-study-selection/SKILL.md"
  "skills/pricing-narrative/SKILL.md"
  "skills/proposal-qa-evaluator/SKILL.md"
  "scripts/pricing_engine.py"
  "scripts/compliance_validator.py"
  "scripts/case_study_scorer.py"
  "scripts/token_economics.py"
  "scripts/run_golden_tests.py"
  "schemas/run-log.schema.json"
  "schemas/rfp-requirements.schema.json"
  "schemas/compliance-matrix.schema.json"
  "schemas/pricing-output.schema.json"
)

echo "── manifest check (${#MANIFEST[@]} files) ─────────────────"
missing=0
for f in "${MANIFEST[@]}"; do
  if [[ -f "$f" ]]; then
    printf "  ok   %s\n" "$f"
  else
    printf "  MISS %s\n" "$f"
    missing=$((missing+1))
  fi
done

if (( missing > 0 )); then
  echo ""
  echo "BLOCKED: $missing file(s) missing. Not packaging an incomplete repo."
  exit 1
fi

echo ""
echo "── skill frontmatter check ────────────────────────────────"
for s in skills/*/SKILL.md; do
  head -1 "$s" | grep -qx -- "---" || { echo "  FAIL $s: no frontmatter"; exit 1; }
  grep -q "^name: " "$s"        || { echo "  FAIL $s: no name"; exit 1; }
  grep -q "^description: " "$s" || { echo "  FAIL $s: no description"; exit 1; }
  grep -qi "claude\|anthropic" <(grep "^name: " "$s") && {
    echo "  FAIL $s: reserved word in name"; exit 1; }
  printf "  ok   %s\n" "$s"
done

echo ""
echo "── self-tests ─────────────────────────────────────────────"
python3 scripts/run_golden_tests.py || {
  echo ""; echo "BLOCKED: self-tests red. Nothing ships."; exit 1; }

echo ""
echo "── json schema well-formedness ────────────────────────────"
for j in schemas/run-log.schema.json schemas/rfp-requirements.schema.json \
         schemas/compliance-matrix.schema.json schemas/pricing-output.schema.json; do
  python3 -c "import json,sys; json.load(open('$j'))" \
    && printf "  ok   %s\n" "$j" \
    || { echo "  FAIL $j"; exit 1; }
done

echo ""
echo "── backend pytest (integration layer) ─────────────────────"
if [[ -d backend/tests ]]; then
  (cd backend && python3 -m pytest tests/ -q) || {
    echo ""; echo "WARN: backend pytest failed (integration layer)"; exit 1; }
  echo "  ok   backend/tests"
fi

echo ""
echo "── packaging ──────────────────────────────────────────────"
mkdir -p dist
tar --exclude='.git' --exclude='dist' --exclude='__pycache__' \
    --exclude='.ai/data/*.jsonl' --exclude='in' --exclude='out' \
    --exclude='frontend/node_modules' --exclude='frontend/dist' \
    --exclude='backend/.pytest_cache' --exclude='backend/*.egg-info' \
    -czf "dist/${REPO}-${STAMP}.tar.gz" .

if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "dist/${REPO}-${STAMP}.tar.gz" | awk '{print "  sha256 " $1}'
elif command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "dist/${REPO}-${STAMP}.tar.gz" | awk '{print "  sha256 " $1}'
fi

echo "  dist/${REPO}-${STAMP}.tar.gz"
echo ""
echo "done."
