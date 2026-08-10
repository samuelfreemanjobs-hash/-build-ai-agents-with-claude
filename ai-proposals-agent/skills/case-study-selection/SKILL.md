---
name: case-study-selection
description: Writes proposal narrative for case studies already ranked and selected by case_study_scorer.py. Use when assembling the past performance or references section of a logistics proposal. Do not use to choose which case studies to include — selection is deterministic and produced by the scorer. Do not use to compute, convert, round, or restate any metric from a case record.
---

# Case Study Selection Narrative

## Hard rules

1. You do not select. The scorer selects. You write for what it returns.
2. Metrics are transcribed exactly. No unit conversion, no rounding, no
   derived figures.
3. `release_flag: false` → use `display_name` from the scorer output. Never
   the real client name, never a hint that identifies them (specific city,
   distinctive volume, named product line).
4. Relevance framing must connect to a requirement that actually appears in
   the extracted RFP requirements, cited by `source_ref`.

## The transcription rule, concretely

Record says: `"35% reduction in transit time"`

| Allowed | Forbidden | Why |
|---|---|---|
| cut transit time by 35% | over a third | transformation of a binding claim |
| a 35% transit time reduction | roughly 40% | fabricated precision |
| transit time fell 35% | 35% faster | not equivalent; different denominator |

That last row is the one people get wrong. A 35% reduction in transit time
is not a 35% speed increase. If you find yourself reasoning about which is
correct, you are computing, which you may not do. Transcribe.

## Structure

```
**{display_name} — {industry}**

Challenge: 2–3 sentences. Written so the prospect recognizes their own
situation. Lead with the operational symptom, not the diagnosis.

Solution: 3–4 sentences. Emphasize the parts of the approach that map
to this prospect's scope. Omit parts that do not, even if impressive.

Results:
- metric, transcribed exactly
- metric, transcribed exactly
- metric, transcribed exactly

Relevance: one sentence tying this to a specific RFP requirement,
cited.
```

150–200 words. Three cases maximum.

## What makes a case study land

Evaluators are comparing four to eight proposals that all claim excellence.
The differentiator is whether your challenge paragraph describes their
problem accurately enough that they stop skimming.

Write the challenge from the prospect's side of the table. "Peak season
volume exceeded fixed warehouse capacity, forcing overflow into third-party
space at spot rates" is recognizable. "The client faced significant
logistics challenges" is not, and it is the sentence that gets your
proposal ranked fourth.

## When the scorer returns fewer than three

Write what you have. Do not pad with weaker cases, do not reuse a case with
a different framing, and do not write a generic capability paragraph
dressed as a case study. A two-case section is fine. A fabricated third is
not.

If the scorer halts with zero eligible cases, the section is omitted and the
operator is told why, so they can decide whether to add a case record or
proceed without.
