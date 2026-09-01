---
name: problem-framing
description: Extracts structured problem briefs with measurable success criteria, stakeholders, and blast radius from ambiguous engineering requests. Use at S0 intake. Do not use for architecture design or solution proposals.
---

# Problem Framing

## Hard rules

1. Separate problem from solution. If the brief says "use Kafka," extract the
   underlying need (async processing, event sourcing) separately.
2. Every success criterion gets an ID (`SC-1`, `SC-2`, ...).
3. Each criterion must be measurable or observable.
4. Identify stakeholders and blast radius (teams, services, users affected).
5. Missing problem statement → HALT.

## The solution trap

Briefs often arrive pre-solved:

> "We need to migrate to microservices using Kubernetes."

Extract:
- **Problem:** Monolith deployment takes 45 minutes; one team's deploy blocks others
- **Success criteria:** SC-1: Independent deploy per team (< 10 min). SC-2: No cross-team deploy blocking
- **Proposed solution (not constraint):** Kubernetes microservices — evaluate in S3, do not treat as requirement

## Output

Conform to `schemas/problem-brief.schema.json`.
