"""LLM client wrapper."""

from __future__ import annotations

import json
import os


class LLMClient:
    def __init__(self, api_key: str | None = None, mock: bool = False):
        self.mock = mock or not (api_key or os.environ.get("ANTHROPIC_API_KEY"))
        self._client = None
        if not self.mock:
            import anthropic
            self._client = anthropic.Anthropic(api_key=api_key or os.environ.get("ANTHROPIC_API_KEY"))

    def complete(self, system: str, user: str, max_tokens: int = 4096) -> str:
        if self.mock:
            return self._mock_response(user)
        response = self._client.messages.create(
            model="claude-sonnet-4-5", max_tokens=max_tokens,
            system=system, messages=[{"role": "user", "content": user}],
        )
        return response.content[0].text

    def _mock_response(self, user: str) -> str:
        u = user.lower()
        if "architecture" in u or "produce at least 2 options" in u:
            return json.dumps({
                "problem_id": "PROB-001",
                "options": [
                    {"option_id": "OPT-A", "name": "Add caching layer", "summary": "Redis cache for hot reads",
                     "trade_offs": {"pros": ["Fast reads", "Low complexity"], "cons": ["Cache invalidation"]},
                     "complexity": "low"},
                    {"option_id": "OPT-B", "name": "Read replicas", "summary": "Database read replicas",
                     "trade_offs": {"pros": ["Scales reads", "No app changes"], "cons": ["Replication lag", "Cost"]},
                     "complexity": "medium"},
                ],
            })
        if "review" in u:
            return json.dumps({
                "recommendation": "APPROVE",
                "scores": {"problem_fit": 8, "option_coverage": 9, "risk_awareness": 8,
                           "standards_compliance": 7, "implementability": 8, "operability": 7, "overall": 7},
                "defects": [],
            })
        if "problem" in u or "brief" in u:
            return json.dumps({
                "problem_id": "PROB-001",
                "title": "Improve API response times",
                "problem_statement": "API p99 latency exceeds 500ms under load",
                "tier": "T1",
                "success_criteria": [
                    {"id": "SC-1", "description": "p99 latency under 200ms at 5K RPS", "measurable": True}
                ],
                "stakeholders": ["platform-team", "product-team"],
            })
        return json.dumps({"status": "mock"})
