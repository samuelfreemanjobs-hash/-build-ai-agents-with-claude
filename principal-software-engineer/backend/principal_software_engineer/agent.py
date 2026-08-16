"""Principal Software Engineer Agent orchestrator."""

from __future__ import annotations

import json
import logging
import re
import subprocess
import sys
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from principal_software_engineer.evaluation import EvaluationRunner
from principal_software_engineer.halts import HaltCause, HaltError
from principal_software_engineer.llm import LLMClient
from principal_software_engineer.models import (
    ArchitectureOption,
    DesignPackage,
    DesignReview,
    ProblemBrief,
    SuccessCriterion,
    Tier,
)
from principal_software_engineer.prompts import PrincipalPrompts
from principal_software_engineer.run_log import RunLogBuilder

logger = logging.getLogger(__name__)
SCRIPTS_DIR = Path(__file__).resolve().parent.parent.parent / "scripts"
_RUN_COUNTER = 0


def _next_run_id() -> str:
    global _RUN_COUNTER
    _RUN_COUNTER += 1
    return datetime.now(timezone.utc).strftime("run_%Y-%m-%d_") + f"{_RUN_COUNTER:03d}"


def _parse_json(response: str) -> dict:
    text = response.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    return json.loads(text)


def _run_script(script: str, *args: str) -> dict:
    result = subprocess.run(
        [sys.executable, str(SCRIPTS_DIR / script), *args],
        capture_output=True, text=True, timeout=60,
    )
    return json.loads(result.stdout)


class PrincipalSoftwareEngineerAgent:
    def __init__(self, api_key: str | None = None, mock_llm: bool = False):
        self.llm = LLMClient(api_key=api_key, mock=mock_llm)
        self.evaluator = EvaluationRunner()

    def frame_problem(self, description: str, repo_path: str = ".") -> ProblemBrief:
        logger.info("S0: Problem framing...")
        prompt = PrincipalPrompts.PROBLEM_FRAMING.format(
            problem_description=description, repo_path=repo_path,
        )
        data = _parse_json(self.llm.complete(PrincipalPrompts.MASTER_SYSTEM, prompt))
        criteria = [
            SuccessCriterion(id=c["id"], description=c["description"],
                             measurable=c.get("measurable", True), metric=c.get("metric", ""))
            for c in data.get("success_criteria", [])
        ]
        unmeasurable = [c for c in criteria if not c.measurable]
        if unmeasurable:
            raise HaltError(HaltCause.UNMEASURABLE_CRITERIA,
                            f"Unmeasurable: {[c.id for c in unmeasurable]}",
                            "Provide measurable success criteria", stage="S0")
        return ProblemBrief(
            problem_id=data.get("problem_id", "PROB-001"),
            title=data["title"], problem_statement=data["problem_statement"],
            tier=Tier(data.get("tier", "T1")), success_criteria=criteria,
            stakeholders=data.get("stakeholders", []), repo_path=repo_path,
            proposed_solution=data.get("proposed_solution", ""),
        )

    def analyze_system(self, repo_path: str, tier: Tier) -> dict:
        logger.info("S1: System analysis...")
        analysis = _run_script("system_analyzer.py", repo_path)
        deps = _run_script("dependency_mapper.py", repo_path)
        if analysis.get("service_count", 0) == 0 and tier != Tier.T0:
            raise HaltError(HaltCause.NO_SYSTEM_CONTEXT, "No services identified",
                            "Provide system context or repo with services", stage="S1")
        return {"analysis": analysis, "dependencies": deps}

    def design_architecture(self, brief: ProblemBrief, system: dict) -> list[ArchitectureOption]:
        logger.info("S3: Architecture design...")
        prompt = PrincipalPrompts.ARCHITECTURE_DESIGN.format(
            problem_brief=json.dumps(asdict(brief), default=str),
            system_analysis=json.dumps(system, indent=2),
            constraints="{}",
        )
        data = _parse_json(self.llm.complete(PrincipalPrompts.MASTER_SYSTEM, prompt))
        options = [
            ArchitectureOption(
                option_id=o["option_id"], name=o["name"], summary=o["summary"],
                trade_offs=o.get("trade_offs", {"pros": [], "cons": []}),
                complexity=o.get("complexity", "medium"),
                components=o.get("components", []), data_flow=o.get("data_flow", ""),
            )
            for o in data.get("options", [])
        ]
        if len(options) < 2:
            raise HaltError(HaltCause.INSUFFICIENT_OPTIONS,
                            f"Only {len(options)} option(s) produced",
                            "Provide at least 2 architecture alternatives", stage="S3")
        return options

    def review_design(self, brief: ProblemBrief, options: list[ArchitectureOption],
                      evaluation: dict) -> DesignReview:
        logger.info("S6: Design review...")
        prompt = PrincipalPrompts.DESIGN_REVIEW.format(
            problem_brief=json.dumps(asdict(brief), default=str),
            options=json.dumps([asdict(o) for o in options]),
            evaluation=json.dumps(evaluation, default=str),
        )
        data = _parse_json(self.llm.complete(PrincipalPrompts.MASTER_SYSTEM, prompt))
        scores = data.get("scores", {})
        if scores:
            scores["overall"] = min(scores.get(k, 10) for k in [
                "problem_fit", "option_coverage", "risk_awareness",
                "standards_compliance", "implementability", "operability",
            ])
        return DesignReview(
            recommendation=data.get("recommendation", "REVISE"),
            scores=scores, defects=data.get("defects", []),
        )

    def execute_design(self, problem_description: str, repo_path: str = ".") -> DesignPackage:
        run_id = _next_run_id()
        start = datetime.now(timezone.utc)
        logger.info("STARTING DESIGN RUN — %s", run_id)

        brief = self.frame_problem(problem_description, repo_path)
        run_log = RunLogBuilder(run_id, brief.problem_id, brief.title, brief.tier.value)

        try:
            system = self.analyze_system(repo_path, brief.tier)
            run_log.add_stage("S1", "System analysis", "completed", 0)

            options = self.design_architecture(brief, system)
            run_log.add_stage("S3", "Architecture design", "completed", 0, ["architecture-design"])

            opt_dicts = [asdict(o) for o in options]
            evaluation = self.evaluator.evaluate(opt_dicts)
            run_log.add_stage("S4", "Evaluation", "completed", 0)
            run_log.set_evaluation(len(options), evaluation.recommended_option)

            review = self.review_design(brief, options, asdict(evaluation))
            run_log.add_stage("S6", "Design review", "completed", 0, ["design-review-evaluator"])
            run_log.set_review_score(review.scores.get("overall", 0))
            run_log.set_outcome("completed")

            package = DesignPackage(
                run_id=run_id, problem_id=brief.problem_id, problem_title=brief.title,
                tier=brief.tier, problem_brief=brief, options=options,
                evaluation=evaluation, design_review=review, adrs=[],
                run_log=run_log.build(), generated_at=start.isoformat(),
            )
            logger.info("DESIGN COMPLETE — %s | %d options | %s",
                        brief.title, len(options), review.recommendation)
            return package

        except HaltError as e:
            logger.error("HALT: %s", e.message)
            run_log.set_outcome("halted", {"cause": e.cause.value, "stage": e.stage,
                                             "message": e.message, "fix_path": e.fix_path})
            raise
        except Exception:
            run_log.set_outcome("failed")
            raise
