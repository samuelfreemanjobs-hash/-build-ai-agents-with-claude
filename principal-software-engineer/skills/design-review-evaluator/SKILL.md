---
name: design-review-evaluator
description: Evaluates the complete design package against problem fit, risk awareness, and implementability. Use at S6 before delivery.
---

# Design Review Evaluator

## Hard rules

1. Evaluation from S4 must be complete before review begins.
2. Score six dimensions 1–10; overall is the minimum.
3. CRITICAL defects HALT regardless of tier.
4. Maximum `{config.max_review_cycles}` regeneration cycles.

## Review dimensions

| Dimension | What to check |
|-----------|--------------|
| Problem fit | Design solves the stated problem with evidence |
| Option coverage | ≥ 2 options evaluated with genuine trade-offs |
| Risk awareness | All risks identified, critical risks acknowledged |
| Standards compliance | No unaddressed standards violations |
| Implementability | Clear enough for a developer agent to execute |
| Operability | Monitoring, alerting, runbooks considered |

## Defect classification

**CRITICAL:** Single option without alternatives; unacknowledged critical risk;
unsourced performance claim; orphan decision

**MAJOR:** Missing failure mode analysis; insufficient operability planning;
weak ADR for significant decision

**MINOR:** Formatting, diagram clarity, naming

## Output

Conform to `schemas/design-review.schema.json`. Recommendation: APPROVE, REVISE, or HALT.
