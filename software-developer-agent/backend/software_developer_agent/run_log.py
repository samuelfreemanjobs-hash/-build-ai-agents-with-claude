"""Run log builder for Software Developer Agent™."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


class RunLogBuilder:
    def __init__(self, run_id: str, task_id: str, task_title: str, tier: str):
        self._data: dict[str, Any] = {
            "run_id": run_id,
            "product_id": "software-developer-agent",
            "task_id": task_id,
            "task_title": task_title,
            "tier": tier,
            "status": "running",
            "started_at": datetime.now(timezone.utc).isoformat(),
            "stages": [],
            "halts": [],
        }

    def add_stage(self, stage_id: str, name: str, status: str, duration_ms: int, skills: list[str] | None = None):
        self._data["stages"].append({
            "stage_id": stage_id,
            "name": name,
            "status": status,
            "duration_ms": duration_ms,
            "skills_loaded": skills or [],
        })

    def set_verification(self, status: str, files_changed: int):
        self._data["verification_status"] = status
        self._data["files_changed"] = files_changed

    def set_review_score(self, score: int):
        self._data["review_score"] = score

    def set_outcome(self, status: str, halt: dict | None = None):
        self._data["status"] = status
        self._data["completed_at"] = datetime.now(timezone.utc).isoformat()
        if halt:
            self._data["halts"].append(halt)

    def build(self) -> dict[str, Any]:
        return dict(self._data)
