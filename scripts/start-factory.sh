#!/usr/bin/env bash
# Start The Architect factory — FI-001 book + Dual-Intel Systems Lab launch
# Run locally (Cloud Agent VMs cannot reach api.anthropic.com).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env — copy .env.example and set ANTHROPIC_API_KEY"
  exit 1
fi

# shellcheck disable=SC1091
set -a && source .env && set +a
if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "ANTHROPIC_API_KEY not set in .env"
  exit 1
fi

pip install -e . -q
export PATH="$HOME/.local/bin:$PATH"

echo "=== 1. Factory status ==="
python3 -m the_architect factory status

BOOK_PROJECT="agents/the-architect/projects/the-autonomous-copywriter"
LAUNCH_PROJECT="agents/the-architect/projects/dual-intel-systems-lab"
mkdir -p "$BOOK_PROJECT/diagnostics" "$LAUNCH_PROJECT/assets" "$LAUNCH_PROJECT/diagnostics"

echo ""
echo "=== 2. Book outline (once — FI-001) ==="
if [[ -f "$BOOK_PROJECT/outline.md" ]]; then
  echo "Skip: outline.md exists"
else
  python3 -m the_architect factory outline
fi

echo ""
echo "=== 3. Chapter 1 ==="
if [[ -f "$BOOK_PROJECT/chapter-01.md" ]]; then
  echo "Skip: chapter-01.md exists"
else
  python3 -m the_architect factory chapter
fi

echo ""
echo "=== 4. Daily promo content (Dual-Intel Systems Lab) ==="
python3 -m the_architect factory content

echo ""
echo "=== Done ==="
python3 -m the_architect factory status
echo ""
echo "Book outputs: $BOOK_PROJECT"
find "$BOOK_PROJECT" -maxdepth 2 -name '*.md' 2>/dev/null | sort || true
echo ""
echo "Launch content: $LAUNCH_PROJECT"
find "$LAUNCH_PROJECT" -maxdepth 2 -name '*.md' 2>/dev/null | sort || true
echo ""
echo "Next: python3 -m the_architect factory daily   # chapter + content each day"
echo "      python3 -m the_architect factory launch  # full 13-asset launch kit (weekly)"
