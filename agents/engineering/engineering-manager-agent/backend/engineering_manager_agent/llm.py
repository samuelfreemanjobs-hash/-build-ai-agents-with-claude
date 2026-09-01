import json, os, re

HR_PATTERNS = re.compile(
    r"\b(terminat(e|ion)|fire|layoff|pip\b|performance improvement plan|"
    r"compensation|salary|bonus|promote to|demote)\b", re.I)

class LLMClient:
    def __init__(self, mock: bool = False):
        self.mock = mock or not os.environ.get("ANTHROPIC_API_KEY")
        self._client = None
        if not self.mock:
            import anthropic
            self._client = anthropic.Anthropic()

    def complete(self, system: str, user: str, max_tokens: int = 4096) -> str:
        if self.mock:
            return self._mock(user)
        if HR_PATTERNS.search(user):
            raise ValueError("HR decision content detected in prompt")
        r = self._client.messages.create(model="claude-sonnet-4-5", max_tokens=max_tokens,
                                          system=system, messages=[{"role": "user", "content": user}])
        text = r.content[0].text
        if HR_PATTERNS.search(text):
            raise ValueError("HR decision content in response")
        return text

    def _mock(self, user: str) -> str:
        u = user.lower()
        if "commitment" in u or "priority" in u or "backlog" in u:
            return json.dumps({"context_id": "CTX-001", "sprint_goal": "Ship auth v2",
                "items": [
                    {"id": "T-1", "title": "OAuth integration", "owner": "Alex", "points": 8, "priority": "P0"},
                    {"id": "T-2", "title": "Login UI refresh", "owner": "Sam", "points": 5, "priority": "P1"},
                    {"id": "T-3", "title": "Session management", "owner": "Alex", "points": 5, "priority": "P1"},
                ], "total_points": 18})
        if "action" in u or "communication" in u or "draft" in u or "status" in u:
            return json.dumps({"context_id": "CTX-001", "output_type": "sprint-plan",
                "capacity_summary": {"available_points": 35, "committed_points": 18, "buffer_pct": 48, "feasible": True},
                "blockers": [], "drafts": [{"type": "sprint-plan", "content": "## Sprint 24\n**Goal:** Ship auth v2\n...", "status": "DRAFT", "audience": "team"}],
                "action_items": [{"action": "Resolve auth blocker #4521", "owner": "Alex", "due": "Wednesday"}]})
        if "governance" in u or "review" in u:
            return json.dumps({"recommendation": "APPROVE",
                "scores": {"commitment_realism": 8, "blocker_coverage": 7, "communication_clarity": 9,
                           "team_health_signals": 7, "stakeholder_alignment": 8, "overall": 7}, "defects": []})
        return json.dumps({"context_id": "CTX-001", "team_name": "Platform", "output_type": "sprint-plan",
            "tier": "T1", "team_members": [
                {"name": "Alex", "role": "Backend"}, {"name": "Sam", "role": "Frontend"}, {"name": "Jordan", "role": "Fullstack"}],
            "sprint": {"name": "Sprint 24", "goal": "Ship auth v2"}, "backlog": []})
