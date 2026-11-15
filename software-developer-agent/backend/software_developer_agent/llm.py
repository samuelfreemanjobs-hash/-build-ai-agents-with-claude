"""LLM client wrapper — uses agent-runtime + core-config.xml."""

from __future__ import annotations

import json
from pathlib import Path

from agent_runtime.llm import LlmClient as RuntimeLlmClient

_CORE_CONFIG = Path(__file__).resolve().parent.parent.parent / "agent" / "core-config.xml"


class LLMClient:
    def __init__(self, api_key: str | None = None, mock: bool = False):
        self._inner = RuntimeLlmClient(_CORE_CONFIG, api_key=api_key, mock=mock)

    def complete(self, system: str, user: str, max_tokens: int = 4096) -> str:
        return self._inner.complete(system, user, max_tokens=max_tokens, mock_fn=self._mock_response)

    @staticmethod
    def _mock_response(user: str) -> str:
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