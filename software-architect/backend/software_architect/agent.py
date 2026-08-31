import json, logging, re, subprocess, sys
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from software_architect.analyzer import ArchitectureAnalyzer
from software_architect.halts import HaltError
from software_architect.llm import LLMClient
from software_architect.models import ArchitecturePackage, ArchitectureScope, C4Container, C4Model, GovernanceReview, Tier
from software_architect.prompts import ArchitectPrompts
from software_architect.run_log import RunLogBuilder

logger = logging.getLogger(__name__)
_RUN = 0


def _run_id() -> str:
    global _RUN
    _RUN += 1
    return datetime.now(timezone.utc).strftime("run_%Y-%m-%d_") + f"{_RUN:03d}"


def _parse_json(text: str) -> dict:
    t = text.strip()
    if t.startswith("```"):
        t = re.sub(r"^```(?:json)?\n?", "", t)
        t = re.sub(r"\n?```$", "", t)
    return json.loads(t)


class SoftwareArchitectAgent:
    def __init__(self, mock_llm: bool = False):
        self.llm = LLMClient(mock=mock_llm)
        self.analyzer = ArchitectureAnalyzer()

    def intake_scope(self, description: str, repo: str = ".") -> ArchitectureScope:
        data = _parse_json(self.llm.complete(ArchitectPrompts.MASTER,
            ArchitectPrompts.SCOPE.format(description=description, repo=repo)))
        return ArchitectureScope(
            scope_id=data.get("scope_id", "SCOPE-001"), system_name=data["system_name"],
            boundary=data["boundary"], horizon=data.get("horizon", "as-is"),
            tier=Tier(data.get("tier", "T1")), repo_path=repo,
            stakeholders=data.get("stakeholders", []),
        )

    def model_as_is(self, scope: ArchitectureScope, analysis: dict) -> C4Model:
        data = _parse_json(self.llm.complete(ArchitectPrompts.MASTER,
            ArchitectPrompts.AS_IS.format(scope=json.dumps(asdict(scope), default=str),
                                          discovery=json.dumps(analysis["discovery"], indent=2))))
        containers = [C4Container(id=c["id"], name=c["name"], technology=c["technology"],
                                  responsibility=c["responsibility"], type=c.get("type", "service"),
                                  source_ref=c.get("source_ref", ""))
                      for c in data.get("containers", [])]
        ctx = data.get("context", {})
        return C4Model(model_id=data.get("model_id", "M-001"), view="as-is",
                       system_name=ctx.get("system_name", scope.system_name),
                       description=ctx.get("description", ""), containers=containers,
                       diagram=ctx.get("diagram", ""))

    def map_nfrs(self, model: C4Model, analysis: dict) -> dict:
        return _parse_json(self.llm.complete(ArchitectPrompts.MASTER,
            ArchitectPrompts.NFR.format(model=json.dumps(asdict(model), default=str),
                                        discovery=json.dumps(analysis["discovery"], indent=2))))

    def governance_review(self, scope: ArchitectureScope, model: C4Model, analysis: dict) -> GovernanceReview:
        data = _parse_json(self.llm.complete(ArchitectPrompts.MASTER,
            ArchitectPrompts.GOVERNANCE.format(scope=json.dumps(asdict(scope), default=str),
                                               model=json.dumps(asdict(model), default=str),
                                               analysis=json.dumps({k: analysis[k] for k in ("coupling", "nfr", "patterns")}, default=str))))
        scores = data.get("scores", {})
        if scores:
            scores["overall"] = min(scores.get(k, 10) for k in
                ["c4_completeness", "discovery_accuracy", "nfr_coverage", "coupling_health", "transition_feasibility"])
        return GovernanceReview(recommendation=data.get("recommendation", "REVISE"),
                                scores=scores, defects=data.get("defects", []))

    def execute(self, description: str, repo: str = ".") -> ArchitecturePackage:
        run_id = _run_id()
        start = datetime.now(timezone.utc)
        scope = self.intake_scope(description, repo)
        log = RunLogBuilder(run_id, scope.scope_id, scope.system_name, scope.tier.value)
        try:
            analysis = self.analyzer.analyze(repo)
            log.add_stage("S1", "System discovery", "completed")

            as_is = self.model_as_is(scope, analysis)
            log.add_stage("S2", "As-is modeling", "completed", ["as-is-modeling"])

            c4_val = self.analyzer.validate_c4({
                "context": {"system_name": as_is.system_name, "description": as_is.description},
                "containers": [asdict(c) for c in as_is.containers],
            }, scope.tier.value)
            log.set_c4_levels(c4_val.get("levels_present", []))

            nfr_map = self.map_nfrs(as_is, analysis)
            log.add_stage("S3", "NFR mapping", "completed", ["nfr-analysis"])
            log.add_stage("S4", "Pattern/coupling analysis", "completed")

            gov = self.governance_review(scope, as_is, analysis)
            log.add_stage("S6", "Governance review", "completed", ["architecture-governance"])
            log.set_governance_score(gov.scores.get("overall", 0))
            log.set_outcome("completed")

            return ArchitecturePackage(
                run_id=run_id, scope=scope, as_is_model=as_is, to_be_model=None,
                nfr_map=nfr_map, patterns=analysis["patterns"].get("patterns_detected", []),
                governance=gov, run_log=log.build(), generated_at=start.isoformat(),
            )
        except HaltError as e:
            log.set_outcome("halted", {"cause": e.cause.value, "stage": e.stage, "message": e.message})
            raise
