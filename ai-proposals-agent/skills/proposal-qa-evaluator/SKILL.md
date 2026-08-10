---
name: proposal-qa-evaluator
description: Evaluates assembled proposal drafts against six quality dimensions and emits defect list with severities. Use at S5 evaluator gate only. Do not use to regenerate pricing or compliance content — defects there require record fixes and stage rerun. Do not use to estimate win probability.
---

# Proposal QA Evaluator

## Hard rules

1. Score six dimensions 1–10. **Overall score = minimum** of the six —
   one weak dimension caps the whole score.
2. Defect severities are fixed: CRITICAL, MAJOR, MINOR. Do not invent
   intermediate severities.
3. Regeneration (Tier 3 only) applies to **narrative sections only**, hard
   capped at `{config.max_evaluator_cycles}` (default 2). Never regenerate
   pricing or compliance output.
4. Any CRITICAL defect surviving the regeneration cap → HALT to operator.
5. Low compliance score with high writing score → report as KB gap, not
   writing quality issue.

## Six dimensions

| Dimension | What it measures |
|---|---|
| Compliance coverage | Every mandatory req addressed or flagged GAP |
| Traceability | Every numeric resolves via `*trace` |
| Consistency | Same figures/terms across sections |
| Specificity | Concrete claims vs generic template language |
| Responsiveness | Alignment to evaluation criteria weights |
| Professional polish | Format, grammar, structure |

## Defect severities

**CRITICAL** (blocks emit after cap):
- Unmet mandatory requirement not flagged as GAP
- Untraceable numeric in deliverable
- Page/word limit exceeded
- Fabricated mitigation language
- Missing human review line in header

**MAJOR** (requires operator attention, may regenerate):
- Internal inconsistency between sections
- Generic unsupported claim ("industry-leading")
- Case study misaligned with stated RFP challenge

**MINOR** (note only):
- Style, formatting, repetition

## Tier behavior

| Tier | Evaluator behavior |
|---|---|
| T0 | Skip evaluator |
| T1–T2 | One advisory pass, attach report, no regeneration |
| T3 | Up to 2 narrative regeneration cycles on CRITICAL/MAJOR narrative defects |

## Regeneration rules

When regenerating:
- Name the specific section and defect driving regeneration
- Preserve all deterministic outputs (pricing hash, compliance matrix)
- Re-score only affected dimensions after regeneration
- Log each cycle in run log with `evaluator_cycle` counter

## Output

QA report JSON conformant to run-log `qa_scores` schema. Include:
- Per-dimension scores
- Defect list with severity, section, description, resolution status
- Recommendation: proceed to emit, regenerate (with section list), or HALT

## What you do not evaluate

- Bid/no-bid strategy
- Win probability
- Competitor positioning
- Legal adequacy of contract terms
