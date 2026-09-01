---
name: task-intake
description: Extracts structured task specifications with testable acceptance criteria, constraints, and scope boundaries from natural language or partial specs. Use at intake when a new development task enters the pipeline. Do not use for implementation planning or code generation.
---

# Task Intake

## Hard rules

1. Every acceptance criterion gets a unique ID (`AC-1`, `AC-2`, ...).
2. Each criterion must be testable. Vague criteria → HALT with request for
   measurable alternatives.
3. Constraints (language, framework, style) are extracted verbatim, not inferred.
4. Out-of-scope files default to CI config, deployment manifests, and secrets
   unless the operator specifies otherwise.
5. Missing repo path or task description → HALT.

## The testability trap

Engineers often write tasks like:

> "Improve the login page UX and make it faster."

This is not actionable. Decompose into testable criteria:
- AC-1: Login form displays inline validation error within 200ms of field blur
- AC-2: Page load time (LCP) under 2.5s on 3G throttled connection
- AC-3: Error messages use `aria-live="polite"` for screen readers

If the operator cannot provide testable criteria, HALT. Do not invent metrics.

## What to extract

- **Task type:** bug-fix, feature, refactor, test-coverage, security-fix
- **Priority and tier triggers:** auth changes, payment, PII → escalate tier
- **Acceptance criteria** with IDs
- **Constraints:** language, framework, style guide, compatibility requirements
- **Reference files:** existing code to follow as pattern
- **Out-of-scope:** files, directories, behaviors explicitly excluded

## Output

Conform to `schemas/task-spec.schema.json`. Return the JSON object only.
If the input cannot be parsed into that shape, HALT with the specific
ambiguity rather than returning a partial object.
