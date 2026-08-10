# ADR-001: Architecture Selection

Status: ACCEPTED  
Date: 2026-08-10  
Supersedes: none

## Decision

**Single agent + skills, executed as a sequential workflow, with a single
evaluator pass gated to Tier 3 bids only.**

Not multi-agent. Not collaborative. The escalation triggers that would
change this decision are enumerated in §5 and must be checked before any
architecture change is proposed.

## 1. Four-factor gate

Applied per the Anthropic "Building Effective AI Agents" decision framework.
Each factor is a hard gate, not a heuristic. All four must clear for the
selected pattern.

| Factor | Value for this system | Framework mapping | Gate result |
|---|---|---|---|
| Control level required | HIGH — output becomes a contractual bid; pricing and compliance claims are legally binding; must be auditable line-by-line to a reviewer | High control → single agent or sequential workflow | PASS for single/sequential. **BLOCKS** collaborative multi-agent. |
| Problem complexity | Multi-domain but predictable — intake → compliance mapping → content → pricing → QA is a fixed pipeline with known stages | Multi-domain + predictable → sequential or parallel workflow | PASS for sequential. Parallel rejected: stages have strict data dependencies (pricing depends on scoped services; QA depends on all prior output). |
| Resource constraints | Pre-revenue. Zero paying customers. Token budget is discretionary spend, not a funded line item. | Limited budget → single agents | PASS. **BLOCKS** multi-agent on cost ratio (§2). |
| Domain expertise | Single domain — logistics proposal authoring. Sub-areas (compliance, pricing, case studies) compose rather than conflict. | Single domain with established workflows → single agent with specialized Skills | PASS. |

**Genuine parallelism test:** FAILED. No two stages can execute without the
prior stage's output. Compliance mapping requires extracted requirements.
Pricing requires the scoped service list. QA requires the assembled document.
Parallel workflow is therefore not available regardless of cost.

## 2. Token economics gate

The governing constraint. Per framework guidance, multi-agent systems consume
roughly 10–15× the tokens of a single-agent system for the same task.

Arithmetic is NOT hand-computed in this document. Run:

```bash
python3 scripts/token_economics.py
```

Constants live in that script under `RATE_CARD`, flagged `VERIFY_BEFORE_USE`.
Model pricing changes; the script is the single source of truth and the
README records the last verification date.

Gate rule (enforced in `token_economics.py`, exit code 1 on failure):

```
IF multi_agent_cost_per_proposal > (0.02 * lowest_tier_monthly_price)
THEN multi-agent architecture is BLOCKED.
```

At the $497/mo Starter tier with 5 proposals included, the per-proposal COGS
ceiling is set so that gross margin cannot fall below 95% on the lowest tier.
Single-agent clears this with wide headroom. Multi-agent does not clear it at
any plausible rate card.

## 3. What the evaluator pass is, and is not

A single evaluator invocation (`proposal-qa-evaluator` skill) runs after
assembly. This is an evaluator-optimizer *gate*, not a loop, and not a
second agent.

- Tier 1–2 bids: evaluator runs once, advisory only. Output attached, no
  regeneration.
- Tier 3 bids (see DUTIES.md §Tiering): evaluator may trigger at most **two**
  regeneration cycles on narrative sections only. Hard cap enforced in
  `core-config.xml` as `max_evaluator_cycles`.
- The evaluator NEVER regenerates pricing or compliance content. Those are
  deterministic outputs; a failed check there is a HALT, not a retry.

Rationale: the framework notes evaluator-optimizer is inappropriate where
deterministic solutions exist. Pricing and compliance have deterministic
solutions. Narrative does not.

## 4. Rejected alternatives

**Hierarchical multi-agent (supervisor + specialists).** Rejected. Control
requirement is HIGH, and the framework maps HIGH control away from
multi-agent. Auditors asking "why is this price $625,000" must be able to
trace to a cost table row, not to a negotiation between three models. Also
fails the token gate in §2.

**Collaborative/peer-to-peer.** Rejected outright. Emergent behavior is
explicitly a feature only where control requirements are LOW. Binding
contractual output is the opposite case.

**Parallel workflow.** Rejected on the genuine parallelism test (§1).

**Dynamic agent generation.** Rejected. Framework classifies as experimental
with no production implementations. Not appropriate for contractual output.

## 5. Escalation triggers — the only conditions that reopen this decision

Architecture change requires at least one of these to be observably true,
documented with the run IDs that evidence it:

1. **Distractor-domain failure.** Golden test pass rate drops below 0.90
   after adding a third distinct vertical (e.g. cold-chain pharma + hazmat +
   international customs simultaneously in one RFP). Framework notes single
   agents degrade sharply at two or more distractor domains.
2. **Context ceiling.** Assembled context for a single proposal exceeds
   `max_context_tokens` in core-config.xml on more than 10% of runs after
   context editing and tool-output capping are already applied.
3. **Latency SLO breach.** p95 wall-clock exceeds the runbook SLO and
   profiling attributes the breach to sequential stage dependency rather
   than to model latency.
4. **Volume economics inversion.** Sustained volume where the token cost
   ratio in §2 clears the gate because tier pricing has moved.

Absent one of these, "the multi-agent version would be more impressive" is
not a reason. It is the failure mode this ADR exists to prevent.
