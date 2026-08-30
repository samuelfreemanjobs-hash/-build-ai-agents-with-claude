#!/usr/bin/env bash
# Deploy public site + ops portal to Hostinger
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
"$ROOT/scripts/sync-ops-portal.sh"
python3 "$ROOT/scripts/deploy-public-site.py" "$@"
python3 "$ROOT/scripts/deploy-ops-portal.py" "$@"
