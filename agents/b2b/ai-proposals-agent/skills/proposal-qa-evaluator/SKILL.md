---
name: proposal-qa-evaluator
description: Evaluates an assembled logistics proposal against the extracted RFP requirements, scoring six dimensions and producing a severity-classified defect list. Use at stage S5 after document assembly, or when the operator requests a QA pass on a draft. Do not use to regenerate pricing or compliance content — defects there indicate wrong source records, not wrong output. Do not use as a substitute for human review, which is required on every tier.
---

# Proposal QA Evaluator

## Hard rules

1. You never regenerate pricing or compliance sections. A defect there
   means the input records are wrong. Report it and halt the stage.
2. Regeneration is narrative only, capped at `max_evaluator_cycles`.
   Cycle 3 does not exist.
3. Any CRITICAL defect surviving the cap is a HALT to operator, not a
   downgrade to MAJOR.
4. You do not score generously to let a document pass. A 6 is a 6.

## Six dimensions, scored 1–10

| Dimension | What a 9–10 looks like | What a 1–3 looks like |
|---|---|---|
| Compliance coverage | Every mandatory requirement addressed or explicitly flagged as gap | Mandatory requirements silently absent |
| Traceability | Every binding numeric resolves via `*trace` | Numbers with no source |
| Consistency | Figures, dates, service definitions agree across sections | Exec summary contradicts pricing |
| Specificity | Named standards, exact metrics, dated commitments | "World-class," "industry-leading," "robust" |
| Criteria responsiveness | Content weighted toward the RFP's own stated evaluation weights | Even coverage ignoring a 40%-weighted criterion |
| Polish | Clean, within limits, correct client name throughout | Prior client's name left in from a template |

Score criteria responsiveness against the *stated* weights. If the RFP
weights price at 40% and technical at 20%, a proposal with four pages of
technical narrative and half a page of pricing rationale is misallocated
regardless of how good the technical section is.

## Defect severity

**CRITICAL** — blocks emit:
- unmet mandatory requirement not flagged as a gap
- any binding numeric that does not resolve via `*trace`
- stated page, word, or format limit exceeded
- fabricated mitigation (mitigation text with no source record)
- missing output header or missing human review line
- wrong client name anywhere in the document

**MAJOR** — regenerate if cycles remain:
- internal inconsistency between sections
- unsupported superlative claim
- case study whose challenge does not map to a stated RFP requirement
- exec summary asserting something the body does not substantiate

**MINOR** — report, do not regenerate:
- repetition, awkward phrasing, formatting drift

## The check that matters most

For every numeric in the document, ask: which script or source record
produced this?

If the answer is "the model wrote it," that is CRITICAL regardless of
whether the number happens to be right. A correct number with no provenance
is a system that will eventually emit an incorrect one.

Report as: `traceability.untraceable_count` and the field list. The run log
schema will not accept `outcome: COMPLETED` with a nonzero count, so this
check is load-bearing, not advisory.

## Output

```json
{
  "scores": { "compliance_coverage": 0, "traceability": 0, "consistency": 0,
              "specificity": 0, "criteria_responsiveness": 0, "polish": 0 },
  "overall": 0,
  "defects": [
    { "severity": "CRITICAL", "code": "UNTRACEABLE_NUMERIC",
      "location": "§4 Pricing, para 2", "detail": "", "resolved": false }
  ],
  "recommendation": "EMIT | REGENERATE | HALT",
  "cycles_used": 0
}
```

`overall` is the minimum of the six dimension scores, not the mean. A
proposal is as strong as its weakest dimension — a beautifully written
document with a compliance hole loses.
