"""Software Developer Agent orchestrator — v0.1 pipeline."""

from __future__ import annotations

import json
import logging
import re
import subprocess
import sys
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from software_developer_agent.halts import HaltCause, HaltError
from software_developer_agent.llm import LLMClient
from software_developer_agent.models import (
    AcceptanceCriterion,
    CodeReviewResult,
    DevPackage,
    FileChange,
    ImplementationPlan,
    TaskSpec,
    TaskType,
    Tier,
)
from software_developer_agent.prompts import DevPrompts
from software_developer_agent.run_log import RunLogBuilder
from software_developer_agent.verification import VerificationRunner

logger = logging.getLogger(__name__)

SCRIPTS_DIR = Path(__file__).resolve().parent.parent.parent / "scripts"
_RUN_COUNTER = 0


def _next_run_id() -> str:
    global _RUN_COUNTER
    _RUN_COUNTER += 1
    return datetime.now(timezone.utc).strftime("run_%Y-%m-%d_") + f"{_RUN_COUNTER:03d}"


def _parse_json_response(response: str) -> dict:
    text = response.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    return json.loads(text)


def _analyze_codebase(repo_path: str) -> dict:
    script = SCRIPTS_DIR / "codebase_analyzer.py"
    result = subprocess.run(
        [sys.executable, str(script), repo_path],
        capture_output=True,
        text=True,
        timeout=60,
    )
    return json.loads(result.stdout)


class SoftwareDeveloperAgent:
    """Main Software Developer Agent orchestrator."""

    def __init__(self, api_key: str | None = None, mock_llm: bool = False):
        self.llm = LLMClient(api_key=api_key, mock=mock_llm)
        self.verifier = VerificationRunner()

    def intake_task(self, task_description: str, repo_path: str = ".") -> TaskSpec:
        logger.info("S0: Task intake...")
        prompt = DevPrompts.TASK_INTAKE.format(
            task_description=task_description,
            repo_path=repo_path,
        )
        response = self.llm.complete(DevPrompts.MASTER_SYSTEM, prompt)
        data = _parse_json_response(response)

        criteria = [
            AcceptanceCriterion(
                id=c["id"],
                description=c["description"],
                testable=c.get("testable", True),
                tests_required=c.get("tests_required", True),
            )
            for c in data.get("acceptance_criteria", [])
        ]

        untestable = [c for c in criteria if not c.testable]
        if untestable:
            raise HaltError(
                HaltCause.UNTESTABLE_CRITERIA,
                f"Untestable criteria: {[c.id for c in untestable]}",
                "Provide measurable acceptance criteria",
                stage="S0",
            )

        return TaskSpec(
            task_id=data.get("task_id", f"TASK-{datetime.now().strftime('%H%M%S')}"),
            title=data["title"],
            description=task_description,
            task_type=TaskType(data.get("task_type", "feature")),
            tier=Tier(data.get("tier", "T1")),
            repo_path=repo_path,
            acceptance_criteria=criteria,
            constraints=data.get("constraints", {}),
            reference_files=data.get("reference_files", []),
            out_of_scope=data.get("out_of_scope", []),
        )

    def analyze_codebase(self, repo_path: str, tier: Tier) -> dict:
        logger.info("S1: Codebase analysis...")
        report = _analyze_codebase(repo_path)
        if not report.get("test_command") and tier != Tier.T0:
            raise HaltError(
                HaltCause.NO_TEST_COMMAND,
                "No test command detected in repository",
                "Add a test framework or specify test command in task spec",
                stage="S1",
            )
        return report

    def plan_implementation(self, task: TaskSpec, codebase: dict) -> ImplementationPlan:
        logger.info("S2: Implementation planning...")
        prompt = DevPrompts.IMPLEMENTATION_PLAN.format(
            task_spec=json.dumps(asdict(task), indent=2, default=str),
            codebase_context=json.dumps(codebase, indent=2),
        )
        response = self.llm.complete(DevPrompts.MASTER_SYSTEM, prompt)
        data = _parse_json_response(response)

        file_changes = [
            FileChange(
                path=fc["path"],
                action=fc["action"],
                requirement_ids=fc["requirement_ids"],
                description=fc["description"],
            )
            for fc in data.get("file_changes", [])
        ]

        return ImplementationPlan(
            plan_id=data.get("plan_id", f"PLAN-{task.task_id}"),
            task_id=task.task_id,
            approach_summary=data.get("approach_summary", ""),
            file_changes=file_changes,
            test_strategy=data.get("test_strategy", []),
            risks=data.get("risks", []),
            estimated_complexity=data.get("estimated_complexity", "medium"),
        )

    def review_code(
        self,
        task: TaskSpec,
        verification: dict,
        file_changes: list[FileChange],
    ) -> CodeReviewResult:
        logger.info("S5: Code review...")
        prompt = DevPrompts.CODE_REVIEW.format(
            task_spec=json.dumps(asdict(task), indent=2, default=str),
            verification=json.dumps(verification, indent=2, default=str),
            file_changes=json.dumps([asdict(fc) for fc in file_changes], indent=2),
        )
        response = self.llm.complete(DevPrompts.MASTER_SYSTEM, prompt)
        data = _parse_json_response(response)

        scores = data.get("scores", {})
        if scores:
            scores["overall"] = min(scores.get(k, 10) for k in [
                "requirement_coverage", "code_quality", "test_adequacy",
                "security_posture", "maintainability", "documentation",
            ])

        return CodeReviewResult(
            recommendation=data.get("recommendation", "REVISE"),
            scores=scores,
            defects=data.get("defects", []),
            coverage_map=data.get("coverage_map", []),
        )

    def execute_task(
        self,
        task_description: str,
        repo_path: str = ".",
    ) -> DevPackage:
        run_id = _next_run_id()
        start = datetime.now(timezone.utc)

        logger.info("=" * 60)
        logger.info("STARTING DEVELOPMENT RUN — %s", run_id)
        logger.info("=" * 60)

        task = self.intake_task(task_description, repo_path)
        run_log = RunLogBuilder(run_id, task.task_id, task.title, task.tier.value)

        try:
            codebase = self.analyze_codebase(repo_path, task.tier)
            run_log.add_stage("S1", "Codebase analysis", "completed", 0)

            plan = self.plan_implementation(task, codebase)
            run_log.add_stage("S2", "Implementation planning", "completed", 0, ["implementation-planning"])

            verification = self.verifier.run(repo_path, task.tier)
            run_log.add_stage("S4", "Verification", "completed", 0)
            run_log.set_verification(verification.overall_status, len(plan.file_changes))

            review = self.review_code(task, asdict(verification), plan.file_changes)
            run_log.add_stage("S5", "Code review", "completed", 0, ["code-review-evaluator"])
            run_log.set_review_score(review.scores.get("overall", 0))

            critical = [d for d in review.defects if d.get("severity") == "critical"]
            if critical or review.recommendation == "HALT":
                run_log.set_outcome("halted", {
                    "cause": "REVIEW_DEFECT",
                    "stage": "S5",
                    "message": f"{len(critical)} critical defects",
                })
            else:
                run_log.set_outcome("completed")

            package = DevPackage(
                run_id=run_id,
                task_id=task.task_id,
                task_title=task.title,
                tier=task.tier,
                task_spec=task,
                implementation_plan=plan,
                file_changes=plan.file_changes,
                verification=verification,
                code_review=review,
                run_log=run_log.build(),
                generated_at=start.isoformat(),
            )

            elapsed = (datetime.now(timezone.utc) - start).total_seconds()
            logger.info("=" * 60)
            logger.info("RUN COMPLETE in %.1fs", elapsed)
            logger.info("Task: %s | Tier: %s | Review: %s", task.title, task.tier.value, review.recommendation)
            logger.info("=" * 60)
            return package

        except HaltError as e:
            logger.error("HALT: %s — %s", e.cause.value, e.message)
            run_log.set_outcome("halted", {
                "cause": e.cause.value,
                "stage": e.stage,
                "message": e.message,
                "fix_path": e.fix_path,
            })
            raise

        except Exception as e:
            logger.error("FAILED: %s", e)
            run_log.set_outcome("failed")
            raise
