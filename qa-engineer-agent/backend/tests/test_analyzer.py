from qa_engineer_agent.analyzer import QAAnalyzer


def test_analyze_scope():
    analyzer = QAAnalyzer()
    scope = {
        "requirements": [{"id": "R1"}, {"id": "R2"}],
        "changes": [{"file": "src/auth/login.py"}],
        "existing_tests": [{"requirement_id": "R1", "name": "test_login_success", "body": "assert response.status_code == 200"}],
        "components": {"auth": ["src/auth/"]},
        "critical_components": ["auth"],
        "recent_defects": [],
    }
    result = analyzer.analyze(scope)
    assert "coverage" in result
    assert "readiness" in result


def test_validate_readiness_no_blockers():
    analyzer = QAAnalyzer()
    result = analyzer.validate_readiness({"readiness": {"blockers": []}})
    assert result["halt"] is False
