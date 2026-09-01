from datetime import datetime, timezone
from typing import Any

class RunLogBuilder:
    def __init__(self, run_id: str, context_id: str, team_name: str, tier: str):
        self._data: dict[str, Any] = {
            "run_id": run_id, "product_id": "engineering-manager-agent",
            "context_id": context_id, "team_name": team_name, "tier": tier,
            "status": "running", "started_at": datetime.now(timezone.utc).isoformat(),
            "stages": [], "halts": [],
        }

    def add_stage(self, sid: str, name: str, status: str, skills: list[str] | None = None):
        self._data["stages"].append({"stage_id": sid, "name": name, "status": status,
                                       "skills_loaded": skills or []})

    def set_capacity_utilization(self, pct: float):
        self._data["capacity_utilization"] = pct

    def set_governance_score(self, score: int):
        self._data["governance_score"] = score

    def set_outcome(self, status: str, halt: dict | None = None):
        self._data["status"] = status
        self._data["completed_at"] = datetime.now(timezone.utc).isoformat()
        if halt: self._data["halts"].append(halt)

    def build(self) -> dict[str, Any]:
        return dict(self._data)
