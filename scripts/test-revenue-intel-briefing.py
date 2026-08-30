#!/usr/bin/env python3
"""Test Revenue Intel Agent briefing via Gemini API."""

from __future__ import annotations

import json
import os
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROMPT = ROOT / "website/public/api/lib/REVENUE-INTEL-AGENT-GEM.md"
OUT = ROOT / "website/public/data/briefings/test-agent-preview.html"


def main() -> int:
    from dotenv import load_dotenv

    load_dotenv(ROOT / ".env")
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        print("GEMINI_API_KEY not set — run PHP template test or add key to .env")
        return 1

    name = sys.argv[1] if len(sys.argv) > 1 else "Samuel"
    icp = sys.argv[2] if len(sys.argv) > 2 else "VP Marketing at $2-10M B2B SaaS, owns pipeline budget"
    niche = sys.argv[3] if len(sys.argv) > 3 else "B2B content agency"
    region = sys.argv[4] if len(sys.argv) > 4 else "US"

    instructions = PROMPT.read_text(encoding="utf-8")
    today = __import__("datetime").date.today().isoformat()

    user = f"""<context>
  Revenue Intel briefing. Use google search for dated evidence.
</context>

<variables>
  date: {today}
  niche: {niche}
  icp: {icp}
  region: {region}
  recency_days: 180
  mode: Scan
  operator_first_name: {name}
</variables>

<instructions>
  Execute SYSTEM METHODOLOGY. Follow STRICT OUTPUT FORMAT + EMAIL OUTPUT ADDENDUM.
  Return HTML fragment only.
</instructions>

<constraints>
  Max 3 opportunities. Evidence or Inference labels. No padding.
</constraints>"""

    payload = {
        "system_instruction": {"parts": [{"text": instructions}]},
        "contents": [{"role": "user", "parts": [{"text": user}]}],
        "tools": [{"google_search": {}}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 8192},
    }

    model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read().decode())

    text = data["candidates"][0]["content"]["parts"][0]["text"]
    text = text.removeprefix("```html").removesuffix("```").strip()

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(text, encoding="utf-8")
    print(f"Preview: {OUT}")
    print(f"Engine: gemini ({model})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
