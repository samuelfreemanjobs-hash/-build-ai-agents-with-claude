---
name: compliance-matrix-mapping
description: Writes supporting prose for compliance matrix rows and mitigation language for gaps, after compliance_validator.py has determined every status. Use when assembling the compliance section of a logistics RFP response, when the operator asks about certification coverage for a specific bid, or when a gap requires mitigation language. Do not use to determine whether a certification is held — that determination is made only by compliance_validator.py. Do not use for contract terms, indemnification, or liability language.
---

# Compliance Matrix Mapping

## Hard rules

1. You do not set status. `compliance_validator.py` sets status. You write
   prose around a status that already exists.
2. A GAP row is never described in language that implies compliance.
   Forbidden: "substantially compliant," "compliant in practice,"
   "equivalent to," "meets the spirit of."
3. Mitigation language must be one of three forms and nothing else:
   - documented partner/subcontract arrangement (cite the source record)
   - documented remediation with a date (cite the source record)
   - the literal string: `No mitigation currently available.`
4. Certificate numbers and expiry dates are transcribed character-for-
   character from the validator output.

## Writing a COMPLIANT row

Structure: what we hold, the identifier, what it covers operationally.

> **ISO 9001:2015 — Quality Management System.** Certificate ISO-12345,
> valid through 2027-12-31. Our QMS governs inbound receiving, inventory
> accuracy verification, pick accuracy audit, and corrective action
> workflow across all facilities in scope for this award. Certification
> body audit reports available on request.

Do not pad. Three sentences maximum. The matrix carries the proof; the
prose carries the operational relevance.

## Writing a GAP row

Structure: state the gap plainly, then the mitigation, then the impact.

> **ISO 27001 — Information Security Management.** Not currently held.
> Remediation in progress: Stage 1 audit scheduled 2026-11-04, certification
> targeted Q1 2027 (source: kb/remediation-plan.md#iso27001). Until
> certification, information security controls operate under our SOC 2
> Type II program, which does not satisfy the stated requirement.

Note what that last sentence does: it names the substitute AND states
plainly that the substitute is insufficient. That is the required posture.

## What a good gap section accomplishes

Evaluators discount proposals that claim total compliance, because total
compliance is rare and they have read hundreds of proposals. A clearly
stated gap with a dated remediation plan reads as operational maturity. A
smoothed-over gap that surfaces during due diligence ends the relationship.

You are not making the operator look good. You are making the operator
look accurate, which is what wins re-bids.

## Output

Markdown table for the matrix, prose block beneath for each row requiring
narrative. Table columns, fixed order:

`Requirement | Mandatory | Status | Reference | Expiry`

Row order follows the RFP's own ordering, not status grouping. Evaluators
score against their own document sequence.
