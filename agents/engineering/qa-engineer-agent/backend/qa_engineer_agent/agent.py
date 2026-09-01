import json
import logging
import re
from dataclasses import asdict
from datetime import datetime, timezone

from qa_engineer_agent.analyzer import QAAnalyzer
from qa_engineer_agent.halts import HaltCause, HaltError
from qa_engineer_agent.llm import LLMClient
from qa_engineer_agent.models import QAPackage, ReleaseReadiness, TestScope, TestStrategy, Tier
from qa_engineer_agent.prompts import QAPrompts
from qa_engineer_agent.run_log import RunLogBuilder

logger = logging.getLogger(__name__)
_RUN = 0


def _run_id() -> str:
    global _RUN
    _RUN += 1
    return datetime.now(timezone.utc).strftime("run_%Y-%m-%d_") + f"{_RUN:03d}"


def _parse(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned)
        cleaned = re.sub(r"\n?```$", "", cleaned)
    return json.loads(cleaned)


class QAEngineerAgent:
    def __init__(self, mock_llm: bool = False):
        self.llm = LLMClient(mock=mock_llm)
        self.analyzer = QAAnalyzer()

    def intake(self, description: str) -> TestScope:
        data = _parse(self.llm.complete(QAPrompts.MASTER, QAPrompts.SCOPE.format(description=description)))
        if not data.get("requirements"):
            raise HaltError(HaltCause.MISSING_SCOPE, "No requirements in scope", "Provide release requirements", stage="S0")
        return TestScope(
            scope_id=data.get("scope_id", "SCOPE-001"),
            release_name=data.get("release_name", "Unnamed release"),
            output_type=data.get("output_type", "release-validation"),
            tier=Tier(data.get("tier", "T1")),
            requirements=data.get("requirements", []),
            changes=data.get("changes", []),
            existing_tests=data.get("existing_tests", []),
            components=data.get("components", {}),
            critical_components=data.get("critical_components", []),
            recent_defects=data.get("recent_defects", []),
        )

    def build_strategy(self, scope: TestScope, analysis: dict) -> TestStrategy:
        data = _parse(self.llm.complete(
            QAPrompts.MASTER,
            QAPrompts.STRATEGY.format(scope=json.dumps(asdict(scope), default=str), analysis=json.dumps(analysis, default=str)),
        ))
        cases = data.get("test_cases", [])
        return TestStrategy(scope_id=scope.scope_id, test_cases=cases, regression_suite=data.get("regression_suite", []), total_cases=len(cases))

    def draft_report(self, scope: TestScope, strategy: TestStrategy, analysis: dict) -> dict:
        return _parse(self.llm.complete(
            QAPrompts.MASTER,
            QAPrompts.DEFECT_REPORT.format(
                scope=json.dumps(asdict(scope), default=str),
                strategy=json.dumps(asdict(strategy), default=str),
                analysis=json.dumps(analysis, default=str),
            ),
        ))

    def readiness_review(self, scope: TestScope, readiness: dict) -> ReleaseReadiness:
        data = _parse(self.llm.complete(
            QAPrompts.MASTER,
            QAPrompts.READINESS.format(scope=json.dumps(asdict(scope), default=str), readiness=json.dumps(readiness, default=str)),
        ))
        scores = data.get("scores", {})
        if scores:
            scores["overall"] = min(scores.get(key, 10) for key in ("coverage_confidence", "risk_mitigation", "test_quality"))
        return ReleaseReadiness(recommendation=data.get("recommendation", readiness.get("recommendation", "HOLD")), scores=scores, defects=data.get("defects", []))

    def execute(self, description: str) -> QAPackage:
        run_id = _run_id()
        start = datetime.now(timezone.utc)
        scope = self.intake(description)
        log = RunLogBuilder(run_id, scope.scope_id, scope.release_name, scope.tier.value)

        scope_dict = asdict(scope)
        analysis = self.analyzer.analyze(scope_dict)
        log.add_stage("S1", "Coverage and risk analysis", "completed")

        if analysis["validation"]["severity"] == "error":
            raise HaltError(HaltCause.TEST_VALIDATION_FAILED, "Test suite validation failed", "Fix invalid tests", stage="S1")

        strategy = self.build_strategy(scope, analysis)
        log.add_stage("S2", "Test strategy", "completed", ["test-strategy"])

        report = self.draft_report(scope, strategy, analysis)
        log.add_stage("S4", "Defect triage", "completed", ["defect-triage"])

        validation = self.analyzer.validate_readiness(analysis)
        if validation.get("halt"):
            raise HaltError(HaltCause.CRITICAL_RISK, "Release blockers detected", str(validation["blockers"]), stage="S5")

        readiness = self.readiness_review(scope, analysis["readiness"])
        log.add_stage("S6", "Release readiness", "completed", ["release-governance"])
        log.set_readiness_score(readiness.scores.get("overall", 0))
        log.set_outcome("completed")

        duration = int((datetime.now(timezone.utc) - start).total_seconds() * 1000)
        return QAPackage(
            run_id=run_id,
            scope=scope,
            coverage=analysis["coverage"],
            risk=analysis["risk"],
            validation=analysis["validation"],
            regression=analysis["regression"],
            strategy=strategy,
            readiness=readiness,
            action_plan=report,
            run_log=log.build(),
            duration_ms=duration,
        )
