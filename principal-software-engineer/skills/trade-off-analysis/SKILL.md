---
name: trade-off-analysis
description: Structures trade-off comparison across architecture options using scoring criteria. Use at S3 alongside architecture-design and at S4 with deterministic scores.
---

# Trade-off Analysis

## Hard rules

1. Compare all options against the same criteria dimensions.
2. Use weights from `core-config.xml` scoring_weights.
3. Do not override deterministic scores from `architecture_scorer.py`.
4. Flag when options score within 10% — recommend further analysis.

## Scoring dimensions

| Dimension | What to evaluate |
|-----------|-----------------|
| Simplicity | Lines of new infrastructure, team cognitive load |
| Scalability | Headroom at 10x current load |
| Reliability | SPOFs, failure modes, recovery time |
| Security | Attack surface, data exposure, auth model |
| Operability | Monitoring, debugging, on-call burden |
| Cost | Infra cost, engineering cost, maintenance cost |
| Time to market | Weeks to first deployable increment |

## Output

Structured comparison matrix. Deterministic scores from S4 take precedence.
