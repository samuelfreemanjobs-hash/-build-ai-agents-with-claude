---
name: rfp-requirement-extraction
description: Extracts structured requirements from raw RFP text into rfp-requirements.schema.json. Use at S0 intake before any generation. Do not use to determine compliance status, pricing, or case study selection — those are downstream deterministic stages. Do not use to invent requirements not present in source text.
---

# RFP Requirement Extraction

## Hard rules

1. A requirement is **MANDATORY** only if source text uses binding language:
   "must," "shall," "required," "minimum," "will provide." Everything else
   is **DESIRABLE**. Never promote or demote for appearance.
2. Every extracted requirement carries a `source_ref` — page, section, or
   line reference from the RFP. This is what `*trace` resolves against.
3. You do not infer scope volumes. If the RFP does not state a volume,
   record `volume: null` and flag for operator clarification — do not guess.
4. Evaluation criteria weights are recorded as stated. If they do not sum
   to 1.0, set `weights_unnormalized: true`. Never silently rebalance.
5. Submission date is required. Absence → HALT, not a default.

## Extraction targets

### Client & context
- Company name, industry, stated pain points, strategic priorities
- Submission deadline (ISO date), contract start if stated
- Page/word limits if stated (hard limits downstream)

### Scope
- Service lines with codes mappable to cost table
- Geography, modes, facility requirements
- Volume estimates with units and source refs

### Requirements
- Certifications and compliance standards
- Insurance minimums
- SLA / KPI commitments (OTIF, transit time, accuracy)
- Technical capabilities (WMS, TMS, EDI, visibility)
- Reporting and audit requirements

### Evaluation
- Scored criteria with weights and source refs
- Mandatory vs desirable pass/fail items

### Risk signals (for tiering)
- Incumbent displacement language
- Penalty / liquidated damages clauses
- Government / public sector markers
- Regulated vertical indicators (pharma cold-chain, hazmat, customs)

## Tier assignment

Apply DUTIES.md tier table after extraction. Tier never de-escalates
within a run. Auto-escalate one tier for incumbent displacement, penalty
clauses, or SLA requests exceeding operator historical performance records.

## Three-question intake (before S1)

**Q1:** Submission date present and >24h out? If rush (<24h), mark
`rush: true`, reduce evaluator scope one tier (not human gates).

**Q2:** Every scoped service line has cost table row + capability record?
If no → HALT before generation.

**Q3:** Mandatory requirements without capability records? If yes → emit
gap preview to operator BEFORE drafting continues.

## Output

Conformant `schemas/rfp-requirements.schema.json`. Include `tier`,
`tier_triggers`, `intake_answers`, and `gap_preview` when Q3 surfaces gaps.

## What you do not extract

- Pricing targets or budget hints (unless explicitly stated as ceiling)
- Competitor names or incumbent identity (note presence, do not research)
- Legal terms requiring counsel review (flag for operator, do not draft)
