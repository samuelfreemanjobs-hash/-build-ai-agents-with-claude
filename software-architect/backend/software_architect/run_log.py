from datetime import datetime, timezone
from typing import Any


class RunLogBuilder:
    def __init__(self, run_id: str, scope_id: str, system_name: str, tier: str):
        self._data: dict[str, Any] = {
            "run_id": run_id, "product_id": "software-architect",
            "scope_id": scope_id, "system_name": system_name, "tier": tier,
            "status": "running", "started_at": datetime.now(timezone.utc).isoformat(),
            "stages": [], "halts": [],
        }

    def add_stage(self, sid: str, name: str, status: str, skills: list[str] | None = None):
        self._data["stages"].append({"stage_id": sid, "name": name, "status": status, "skills_loaded": skills or []})

    def set_c4_levels(self, levels: list[str]):
        self._data["c4_levels"] = levels

    def set_governance_score(self, score: int):
        self._data["governance_score"] = score

    def set_outcome(self, status: str, halt: dict | None = None):
        self._data["status"] = status
        self._data["completed_at"] = datetime.now(timezone.utc).isoformat()
        if halt:
            self._data["halts"].append(halt)

    def build(self) -> dict[str, Any]:
        return dict(self._data)
