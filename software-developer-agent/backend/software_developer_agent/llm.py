"""LLM client wrapper."""

from __future__ import annotations

import json
import logging
import os

logger = logging.getLogger(__name__)


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
        assert self._client is not None
        response = self._client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return response.content[0].text

    def _mock_response(self, user: str) -> str:
        if "task spec" in user.lower() or "acceptance criteria" in user.lower():
            return json.dumps({
                "task_id": "TASK-001",
                "title": "Mock task",
                "task_type": "feature",
                "tier": "T1",
                "repo_path": ".",
                "acceptance_criteria": [
                    {"id": "AC-1", "description": "Feature works as specified", "testable": True}
                ],
            })
        if "implementation plan" in user.lower():
            return json.dumps({
                "plan_id": "PLAN-001",
                "task_id": "TASK-001",
                "approach_summary": "Implement the requested feature following existing patterns.",
                "file_changes": [],
                "test_strategy": [],
                "risks": [],
                "estimated_complexity": "low",
            })
        if "code review" in user.lower() or "review" in user.lower():
            return json.dumps({
                "recommendation": "APPROVE",
                "scores": {
                    "requirement_coverage": 8,
                    "code_quality": 8,
                    "test_adequacy": 8,
                    "security_posture": 9,
                    "maintainability": 8,
                    "documentation": 7,
                    "overall": 7,
                },
                "defects": [],
                "coverage_map": [{"criterion_id": "AC-1", "covered": True, "test": "test_feature"}],
            })
        return json.dumps({"status": "mock", "message": "Mock LLM response"})
