import json, os


class LLMClient:
    def __init__(self, api_key: str | None = None, mock: bool = False):
        self.mock = mock or not (api_key or os.environ.get("ANTHROPIC_API_KEY"))
        self._client = None
        if not self.mock:
            import anthropic
            self._client = anthropic.Anthropic(api_key=api_key or os.environ.get("ANTHROPIC_API_KEY"))

    def complete(self, system: str, user: str, max_tokens: int = 4096) -> str:
        if self.mock:
            return self._mock(user)
        r = self._client.messages.create(model="claude-sonnet-4-5", max_tokens=max_tokens,
                                         system=system, messages=[{"role": "user", "content": user}])
        return r.content[0].text

    def _mock(self, user: str) -> str:
        u = user.lower()
        if "c4" in u or "container" in u or "as-is" in u:
            return json.dumps({
                "model_id": "M-001", "view": "as-is",
                "context": {"system_name": "Platform", "description": "Core platform services",
                            "users": [{"name": "Engineers"}], "external_systems": [{"name": "GitHub"}],
                            "diagram": "graph TD; User-->Platform; Platform-->GitHub"},
                "containers": [
                    {"id": "api", "name": "API Service", "technology": "Python/FastAPI",
                     "responsibility": "HTTP API", "type": "service", "source_ref": "backend"},
                    {"id": "db", "name": "Database", "technology": "PostgreSQL",
                     "responsibility": "Persistent storage", "type": "database", "source_ref": "deploy"},
                ],
            })
        if "nfr" in u:
            return json.dumps({"model_id": "M-001", "mappings": [
                {"nfr_id": "NFR-1", "category": "availability", "requirement": "99.9% uptime",
                 "status": "partial", "element_id": "api", "evidence": "single instance"},
            ]})
        if "governance" in u or "review" in u:
            return json.dumps({"recommendation": "APPROVE",
                               "scores": {"c4_completeness": 8, "discovery_accuracy": 7, "nfr_coverage": 6,
                                          "coupling_health": 8, "transition_feasibility": 7, "overall": 6},
                               "defects": []})
        return json.dumps({
            "scope_id": "SCOPE-001", "system_name": "Platform", "boundary": "All backend services",
            "horizon": "as-is", "tier": "T1", "stakeholders": ["platform-team"],
        })
