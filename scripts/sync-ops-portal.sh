#!/usr/bin/env bash
# Sync factory/strategy JSON into website/ops/data for Hostinger deploy
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/agents/the-architect"
DST="$ROOT/website/ops/data"
WITH_METRICS=false

for arg in "$@"; do
  case "$arg" in
    --with-metrics) WITH_METRICS=true ;;
  esac
done

mkdir -p "$DST"

copy() {
  cp "$SRC/$1" "$DST/$2"
  echo "  ✓ $2"
}

echo "Syncing ops portal data…"
copy "factory/state.json" "state.json"
copy "factory/business-plan.json" "business-plan.json"
copy "factory/marketing-operations-plan.json" "marketing-operations-plan.json"
copy "strategy/PRODUCT-CATALOG.json" "product-catalog.json"
copy "strategy/PUBLISHED-CATALOG.json" "published-catalog.json"
copy "strategy/ASCENSION-LADDER.json" "ascension-ladder.json"

# Preserve editable ops files if they exist
for f in ops-tasks.json ops-metrics.json integrations.json systems-index.json; do
  if [ ! -f "$DST/$f" ]; then
    echo "  · $f (seed only — edit in portal)"
  fi
done

if [ "$WITH_METRICS" = true ]; then
  echo ""
  echo "Syncing external metrics (ESP · KDP · Stripe)…"
  if python3 "$ROOT/scripts/sync-external-metrics.py" --triggered-by=sync-ops-portal; then
    echo "  ✓ integrations.json + ops-metrics.json updated"
  else
    echo "  ⚠ External metrics sync had errors (check .env keys)" >&2
  fi
fi

echo "Done. Deploy: upload website/ops/ to Hostinger public_html/ops/"
echo "Tip: ./scripts/sync-ops-portal.sh --with-metrics  (after setting ESP/KDP/Stripe in .env)"
