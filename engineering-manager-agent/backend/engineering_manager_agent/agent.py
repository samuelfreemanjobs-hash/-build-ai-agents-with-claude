import json, logging, re
from dataclasses import asdict
from datetime import datetime, timezone

from engineering_manager_agent.analyzer import TeamAnalyzer
from engineering_manager_agent.halts import HaltCause, HaltError
from engineering_manager_agent.llm import HR_PATTERNS, LLMClient
from engineering_manager_agent.models import CommitmentMap, GovernanceReview, ManagementContext, ManagementPackage, TeamMember, Tier
from engineering_manager_agent.prompts import EMPrompts
from engineering_manager_agent.run_log import RunLogBuilder

logger = logging.getLogger(__name__)
_RUN = 0

def _run_id() -> str:
    global _RUN; _RUN += 1
    return datetime.now(timezone.utc).strftime("run_%Y-%m-%d_") + f"{_RUN:03d}"

def _parse(text: str) -> dict:
    t = text.strip()
    if t.startswith("```"):
        t = re.sub(r"^```(?:json)?\n?", "", t); t = re.sub(r"\n?```$", "", t)
    return json.loads(t)

class EngineeringManagerAgent:
    def __init__(self, mock_llm: bool = False):
        self.llm = LLMClient(mock=mock_llm)
        self.analyzer = TeamAnalyzer()

    def intake(self, description: str) -> ManagementContext:
        if HR_PATTERNS.search(description):
            raise HaltError(HaltCause.HR_DECISION_ATTEMPT, "HR content in request",
                            "EM agent does not handle HR decisions", stage="S0")
        data = _parse(self.llm.complete(EMPrompts.MASTER, EMPrompts.CONTEXT.format(description=description)))
        members = [TeamMember(name=m["name"], role=m["role"], level=m.get("level", ""),
                              pto_days=m.get("pto_days", 0)) for m in data.get("team_members", [])]
        if not members:
            raise HaltError(HaltCause.MISSING_TEAM_DATA, "No team members", "Provide team roster", stage="S0")
        return ManagementContext(
            context_id=data.get("context_id", "CTX-001"), team_name=data["team_name"],
            output_type=data.get("output_type", "sprint-plan"), tier=Tier(data.get("tier", "T1")),
            team_members=members, sprint_goal=data.get("sprint", {}).get("goal", ""),
            backlog=data.get("backlog", []), velocity_history=data.get("velocity_history", []),
        )

    def map_commitments(self, ctx: ManagementContext, analysis: dict) -> CommitmentMap:
        data = _parse(self.llm.complete(EMPrompts.MASTER,
            EMPrompts.COMMITMENTS.format(context=json.dumps(asdict(ctx), default=str),
                                         analysis=json.dumps(analysis, default=str))))
        items = data.get("items", [])
        total = data.get("total_points", sum(i.get("points", 0) for i in items))
        return CommitmentMap(context_id=ctx.context_id, items=items, total_points=total,
                             sprint_goal=data.get("sprint_goal", ctx.sprint_goal))

    def draft_action_plan(self, ctx: ManagementContext, commitments: CommitmentMap, analysis: dict) -> dict:
        return _parse(self.llm.complete(EMPrompts.MASTER,
            EMPrompts.ACTION_PLAN.format(context=json.dumps(asdict(ctx), default=str),
                                         commitments=json.dumps(asdict(commitments), default=str),
                                         analysis=json.dumps(analysis, default=str))))

    def governance_review(self, ctx: ManagementContext, plan: dict) -> GovernanceReview:
        data = _parse(self.llm.complete(EMPrompts.MASTER,
            EMPrompts.GOVERNANCE.format(context=json.dumps(asdict(ctx), default=str),
                                        plan=json.dumps(plan, default=str))))
        scores = data.get("scores", {})
        if scores:
            scores["overall"] = min(scores.get(k, 10) for k in
                ["commitment_realism", "blocker_coverage", "communication_clarity",
                 "team_health_signals", "stakeholder_alignment"])
        return GovernanceReview(recommendation=data.get("recommendation", "REVISE"),
                                scores=scores, defects=data.get("defects", []))

    def execute(self, description: str) -> ManagementPackage:
        run_id = _run_id()
        start = datetime.now(timezone.utc)
        ctx = self.intake(description)
        log = RunLogBuilder(run_id, ctx.context_id, ctx.team_name, ctx.tier.value)
        try:
            ctx_dict = asdict(ctx)
            analysis = self.analyzer.analyze(ctx_dict)
            log.add_stage("S1", "Team analysis", "completed")

            commitments = self.map_commitments(ctx, analysis)
            log.add_stage("S2", "Priority mapping", "completed", ["priority-mapping"])

            validation = self.analyzer.validate_commitments(analysis["capacity"], asdict(commitments))
            log.add_stage("S3", "Capacity planning", "completed")
            log.set_capacity_utilization(validation.get("utilization_pct", 0))

            plan = self.draft_action_plan(ctx, commitments, analysis)
            log.add_stage("S5", "Action plan", "completed", ["communication-drafting"])

            gov = self.governance_review(ctx, plan)
            log.add_stage("S6", "Governance review", "completed", ["delivery-governance"])
            log.set_governance_score(gov.scores.get("overall", 0))
            log.set_outcome("completed")

            return ManagementPackage(
                run_id=run_id, context=ctx, workload=analysis["workload"],
                capacity=analysis["capacity"], velocity=analysis["velocity"],
                commitments=commitments, blockers=analysis["blockers"],
                action_plan=plan, governance=gov, run_log=log.build(), generated_at=start.isoformat(),
            )
        except HaltError as e:
            log.set_outcome("halted", {"cause": e.cause.value, "stage": e.stage, "message": e.message})
            raise
