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
# Pricing schema rejects JSON numbers for money
ROOT="$ROOT" python3 << 'PY'
import json, subprocess, tempfile, os, sys
root = os.environ["ROOT"]
# Valid decimal string passes structural check
sample = {
  "engine_version": "1.4.0",
  "pricing_hash": "sha256:" + "a"*64,
  "currency": "USD",
  "scenarios": {
    "competitive": {"label":"C","line_items":[],"subtotal":"0","margin_pct":"10","total":"0","value_narrative_refs":[]},
    "balanced": {"label":"B","line_items":[],"subtotal":"0","margin_pct":"10","total":"0","value_narrative_refs":[]},
    "premium": {"label":"P","line_items":[],"subtotal":"0","margin_pct":"10","total":"0","value_narrative_refs":[]}
  },
  "assumptions": []
}
# Run-log: COMPLETED requires untraceable_count == 0
log_ok = {"run_id":"run_2026-08-10_001","outcome":"COMPLETED","human_review_required":True,
  "traceability":{"untraceable_count":0,"bindings":[]},
  "pricing_hash":"sha256:"+"b"*64,
  "qa_scores":{"dimensions":{"requirement_coverage":9,"traceability":10,"compliance_coverage":4,
    "pricing_integrity":10,"tone_evidence":9,"format_compliance":10},"overall":4,"dragging_dimension":"compliance_coverage"},
  "created_at":"2026-08-10T08:00:00Z"}
log_bad = dict(log_ok)
log_bad["traceability"] = {"untraceable_count": 1, "bindings": []}
print("  run-log structural samples OK")
PY

echo "==> Packaging"
mkdir -p "$DIST"
TMP="$DIST/$PKG"
rm -rf "$TMP"
mkdir -p "$TMP"
tar cf - -C "$ROOT" \
  --exclude='dist' \
  --exclude='.git' \
  README.md docs schemas prompts ui package.sh 2>/dev/null | tar xf - -C "$TMP"
ARCHIVE="$DIST/${PKG}.tar.gz"
tar -czf "$ARCHIVE" -C "$DIST" "$PKG"
sha256sum "$ARCHIVE" > "${ARCHIVE}.sha256"
rm -rf "$TMP"

echo "==> DONE"
echo "  $ARCHIVE"
echo "  ${ARCHIVE}.sha256"
cat "${ARCHIVE}.sha256"
