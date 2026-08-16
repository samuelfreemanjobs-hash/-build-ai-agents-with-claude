---
name: constraints-extraction
description: Extracts hard and soft constraints, assumptions, and conflicts from the problem brief and system context. Use at S2 before architecture design.
---

# Constraints Extraction

## Hard rules

1. Hard constraints are non-negotiable — violating them invalidates an option.
2. Soft constraints are preferences — violating them reduces option score.
3. Assumptions carry `requires_validation: true` until confirmed.
4. Conflicting hard constraints → HALT with the specific conflict named.

## Constraint categories

| Category | Examples |
|----------|----------|
| Compliance | SOC2, HIPAA, GDPR, PCI |
| Performance | p99 < 200ms, 10K RPS |
| Availability | 99.9% uptime, RTO < 1hr |
| Budget | <$5K/month infra, no new managed services |
| Timeline | Ship in 6 weeks |
| Team | 2 engineers, no Go experience |
| Technology | Must use existing Postgres, no new languages |

## Output

Conform to `schemas/constraints.schema.json`.
