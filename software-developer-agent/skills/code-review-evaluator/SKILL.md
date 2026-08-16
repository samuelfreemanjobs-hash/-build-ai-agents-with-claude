---
name: code-review-evaluator
description: Evaluates generated code against task requirements, verification results, and engineering best practices. Use at S5 after verification passes. Do not use to override failing verification or approve untested code.
---

# Code Review Evaluator

## Hard rules

1. Verification must have passed before review begins. Failing verification →
   HALT, not review.
2. Every acceptance criterion is checked for test coverage.
3. CRITICAL defects cannot be waived — they HALT regardless of tier.
4. Score six dimensions 1–10; overall is the minimum of all dimensions.
5. Maximum `{config.max_review_cycles}` regeneration cycles for narrative fixes only.

## Review dimensions

| Dimension | What to check |
|---|---|
| Requirement coverage | Every AC addressed in code and tested |
| Code quality | Readability, naming, single responsibility, no duplication |
| Test adequacy | Happy path + failure paths, no tautological tests |
| Security posture | No secrets, input validation, auth checks where needed |
| Maintainability | Follows project patterns, no unnecessary complexity |
| Documentation | Public APIs documented if project convention requires it |

## Defect classification

**CRITICAL** (HALT):
- Untested acceptance criterion
- Secret or credential in generated code
- Orphan file change not in implementation plan
- Security finding from S4 unaddressed
- Existing test deleted or disabled without approval

**MAJOR** (regenerate if tier allows):
- Missing error handling for expected failure modes
- Inconsistent with project style conventions
- Insufficient test coverage for modified logic
- Public API change without documentation

**MINOR** (note, do not block):
- Naming could be clearer
- Comment density mismatch
- Minor formatting inconsistency

## Output

Conform to `schemas/code-review.schema.json`. Include per-dimension scores,
defect list with severity, and recommendation: `APPROVE`, `REVISE`, or `HALT`.

Recommendation rules:
- Any CRITICAL → `HALT`
- Any MAJOR after regeneration cap → `HALT`
- MINOR only → `APPROVE` with notes
- All dimensions ≥ 7 and no MAJOR → `APPROVE`
