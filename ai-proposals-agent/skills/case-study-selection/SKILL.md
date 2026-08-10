---
name: case-study-selection
description: Writes narrative for case studies ranked by case_study_scorer.py. Use at S2 after deterministic ranking. Do not use to select which case studies to include — the scorer selects; you write. Do not use to invent metrics, client names, or results not in source records.
---

# Case Study Selection (Narrative)

## Hard rules

1. You do not choose case studies. `case_study_scorer.py` ranks and returns
   top-N. You write narrative for the returned IDs only.
2. Metrics are transcribed exactly from source records. You may reorder
   which metric leads. You may not round, convert units, or compute derived
   figures.
3. Client names appear only when `release_flag: true` on the source record.
   Otherwise use the scorer's `display_name` (anonymized variant).
4. If scorer returns `halt: true` (zero eligible cases), do not invent case
   studies. Omit the section or note "No qualifying case studies in KB" per
   operator instruction.

## Narrative structure (per case)

1. **Challenge** — prospect's problem in their language, tied to RFP source
2. **Approach** — services deployed, geography, timeline (from record)
3. **Results** — quantified outcomes transcribed verbatim from `results[]`

Three paragraphs maximum per case. No marketing adjectives.

## Metric transcription examples

| Source record | Allowed | Forbidden |
|---|---|---|
| "35% reduction in transit time" | "cut transit time by 35%" | "over a third," "roughly 40%" |
| "99.4% OTIF" | "99.4% OTIF" | "nearly perfect OTIF," "~99%" |
| "41,200 shipments" | "41,200 shipments" | "over 40,000 shipments" |

## Alignment check

Each case narrative must map to at least one mandatory requirement or
evaluation criterion from S0 extraction. Misalignment is a MAJOR defect
in S5 evaluation.

## Output

One subsection per selected case ID, in scorer rank order. Include case_id
in metadata for traceability. Do not reorder by narrative preference.
