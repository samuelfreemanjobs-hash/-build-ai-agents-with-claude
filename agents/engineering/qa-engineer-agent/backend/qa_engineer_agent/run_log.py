"""Run log builder for QA Engineer Agent™."""

from __future__ import annotations

from datetime import datetime, timezone


class RunLogBuilder:
    def __init__(self, run_id: str, scope_id: str, release_name: str, tier: str):
        self._data = {
            "run_id": run_id,
            "scope_id": scope_id,
            "release_name": release_name,
            "tier": tier,
            "status": "running",
            "started_at": datetime.now(timezone.utc).isoformat(),
            "stages": [],
            "readiness_score": 0,
        }

    def add_stage(self, stage_id: str, name: str, status: str, skills: list[str] | None = None) -> None:
        self._data["stages"].append({
            "id": stage_id,
            "name": name,
            "status": status,
            "skills": skills or [],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    def set_readiness_score(self, score: float) -> None:
        self._data["readiness_score"] = score

    def set_outcome(self, status: str) -> None:
        self._data["status"] = status
        self._data["completed_at"] = datetime.now(timezone.utc).isoformat()

    def build(self) -> dict:
        return self._data
