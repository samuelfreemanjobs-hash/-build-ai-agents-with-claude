---
name: rfp-requirement-extraction
description: Extracts structured requirements, scope, evaluation criteria, and submission constraints from a logistics RFP, RFQ, or rate solicitation into schema-conformant output with per-requirement source references. Use at intake when a new solicitation document enters the pipeline, or when the operator asks what a specific RFP requires. Do not use to assess whether the operator can meet a requirement — that is compliance mapping. Do not use for contract term interpretation or legal review.
---

# RFP Requirement Extraction

## Hard rules

1. Every extracted requirement carries a `source_ref` locating it in the
   original document (page + line, or section identifier). A requirement
   without a source_ref does not get extracted.
2. MANDATORY only on explicit modal language: *must, shall, required,
   minimum, no less than, at a minimum*. Everything else is DESIRABLE.
3. Do not promote DESIRABLE to MANDATORY to look thorough. Do not demote
   MANDATORY to reduce apparent gaps. Both corrupt the compliance matrix
   downstream.
4. Evaluation weights that do not sum to 1.0 are recorded as stated and
   flagged `weights_unnormalized: true`. Never silently rebalanced.
5. Page, word, and font constraints are extracted as hard limits and passed
   to S5 where violation is a CRITICAL defect.
6. Missing submission date → HALT. Do not infer from context.

## The modal-language trap

Logistics RFPs mix registers freely:

> "The provider should maintain ISO 9001 certification and must demonstrate
> a minimum of 98% OTIF over the trailing twelve months. Cold chain
> capability is preferred."

Three requirements, three different statuses:
- ISO 9001 → DESIRABLE (*should*)
- 98% OTIF trailing 12mo → MANDATORY (*must*, *minimum*)
- Cold chain → DESIRABLE (*preferred*)

Getting ISO 9001 wrong here inflates the gap count and may trigger a
no-bid on a winnable RFP. Getting the OTIF threshold wrong understates a
binding performance commitment. Read the modal, not the vibe.

## Ambiguous modals

Some phrasings genuinely do not resolve: "the provider is expected to,"
"the successful bidder will." Extract as MANDATORY and set
`modal_ambiguous: true`. Surface these to the operator in the S0 preview.
Erring toward MANDATORY is the fail-closed direction — it overstates the
bar rather than understating a commitment.

## What to extract beyond requirements

- **Incumbent signals.** "Transition from current provider," references to
  existing SOPs, stated dissatisfaction. Drives tier escalation.
- **Penalty and liquidated damages clauses.** Presence triggers escalation
  regardless of contract value.
- **Volume estimates with their stated basis.** "Approximately 10,000
  orders/day at peak" is different from "10,000 orders/day." Carry the
  qualifier; pricing depends on it.
- **SLA figures that exceed the operator's historical record.** Flag these
  at intake. Committing to an SLA the firm has never hit is a decision
  someone should make deliberately.

## Output

Conform to `schemas/rfp-requirements.schema.json`. Return the JSON object
only. If the document cannot be parsed into that shape, HALT with the
specific section that broke, rather than returning a partial object that
downstream stages will treat as complete.
