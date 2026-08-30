#!/usr/bin/env bash
# Kick off The Autonomous Copywriter (FI-001): outline + chapter 1
# Run locally — Cloud Agent VMs block api.anthropic.com egress.
# For book + launch content, use: ./scripts/start-factory.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env — copy .env.example and set ANTHROPIC_API_KEY"
  exit 1
fi

# shellcheck disable=SC1091
source .env
if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "ANTHROPIC_API_KEY not set in .env"
  exit 1
fi

pip install -e . -q

echo "=== Factory status ==="
python3 -m the_architect factory status

PROJECT="agents/the-architect/projects/the-autonomous-copywriter"
mkdir -p "$PROJECT/diagnostics" "$PROJECT/chapters"

if [[ -f "$PROJECT/outline.md" ]]; then
  echo "Outline already exists: $PROJECT/outline.md"
else
  echo ""
  echo "=== Generating book outline (may take 5–15 min) ==="
  python3 -m the_architect factory outline
fi

if [[ -f "$PROJECT/chapter-01.md" ]] || [[ -f "$PROJECT/chapters/chapter-01.md" ]]; then
  echo "Chapter 1 already exists — skipping"
else
  echo ""
  echo "=== Writing chapter 1 (may take 10–20 min) ==="
  python3 -m the_architect factory chapter
fi

echo ""
echo "=== Done ==="
python3 -m the_architect factory status
echo ""
echo "Outputs:"
ls -la "$PROJECT" 2>/dev/null || true
find "$PROJECT" -maxdepth 2 -name '*.md' 2>/dev/null | sort
