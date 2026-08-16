import json
import os
import re

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
        response = self._client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return response.content[0].text

    def _mock(self, user: str) -> str:
        text = user.lower()
        if "parse this release validation request" in text or "structured test scope" in text:
            return json.dumps({
                "scope_id": "SCOPE-001",
                "release_name": "Auth v2",
                "output_type": "release-validation",
                "tier": "T1",
                "requirements": [{"id": "R1", "title": "Users can log in"}, {"id": "R2", "title": "Sessions expire safely"}],
                "changes": [{"file": "src/auth/login.py"}, {"file": "src/api/session.py"}],
                "existing_tests": [
                    {"requirement_id": "R1", "name": "test_login_success", "body": "assert response.status_code == 200"},
                    {"requirement_id": "R2", "name": "test_session_expiry", "body": "assert session.expired is True"},
                ],
                "components": {"auth": ["src/auth/"], "api": ["src/api/"]},
                "critical_components": ["auth"],
                "recent_defects": [],
            })
        if "test strategy" in text or "test_cases" in text:
            return json.dumps({
                "test_cases": [
                    {"id": "TC-1", "requirement_id": "R1", "title": "Login happy path", "type": "integration", "steps": ["Open login", "Submit valid creds"]},
                    {"id": "TC-2", "requirement_id": "R2", "title": "Session timeout", "type": "e2e", "steps": ["Login", "Wait for expiry"]},
                ],
                "regression_suite": ["auth_smoke", "api_smoke"],
                "total_cases": 2,
            })
        if "defect" in text or "release notes" in text:
            return json.dumps({
                "defects": [{"id": "BUG-12", "severity": "medium", "summary": "Flaky logout test"}],
                "release_notes_draft": "Auth v2 release with improved session handling.",
                "escalation_items": [],
            })
        if "readiness" in text or "recommendation" in text:
            return json.dumps({
                "recommendation": "GO_WITH_CAUTION",
                "scores": {"coverage_confidence": 8, "risk_mitigation": 7, "test_quality": 8, "overall": 7},
                "defects": [],
            })
        return json.dumps({
            "scope_id": "SCOPE-001",
            "release_name": "Auth v2",
            "output_type": "release-validation",
            "tier": "T1",
            "requirements": [{"id": "R1", "title": "Users can log in"}],
            "changes": [],
            "existing_tests": [],
            "components": {},
            "critical_components": [],
            "recent_defects": [],
        })
