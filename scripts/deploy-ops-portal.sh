#!/usr/bin/env bash
# Sync factory data + deploy ops portal to Hostinger
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Step 1: Sync data ==="
"$ROOT/scripts/sync-ops-portal.sh"

echo ""
echo "=== Step 2: Deploy to Hostinger ==="
python3 "$ROOT/scripts/deploy-ops-portal.py" "$@"
