#!/usr/bin/env bash
# Deploy public site + ops portal to Hostinger (run on YOUR machine — not Cloud Agent VM)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Generate public API config from .env ==="
python3 scripts/generate-public-api-config.py

echo ""
echo "=== Sync ops portal data ==="
"$ROOT/scripts/sync-ops-portal.sh"

echo ""
echo "=== Deploy public site (public_html/) ==="
python3 scripts/deploy-public-site.py "$@"

echo ""
echo "=== Deploy ops portal (public_html/ops/) ==="
python3 scripts/deploy-ops-portal.py "$@"

echo ""
echo "=== Post-deploy checklist ==="
echo "  1. hPanel → Emails → confirm briefings@freemanintelligence.com exists"
echo "  2. Test: curl -X POST https://freemanintelligence.com/api/revenue-intel-briefing.php \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"email\":\"you@example.com\",\"icp\":\"B2B agency owners at 5k/mo\",\"niche\":\"content agency\"}'"
echo "  3. Check inbox + public_html/data/briefings/ on server"
echo "  4. chmod 755 public_html/data public_html/api (if writes fail)"
