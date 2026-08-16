---
id: sp-quality-assurance
version: 2.1.0
phase: qa
output_schema: run-log.schema.json#/$defs/qa_scores
---

# Quality Assurance Prompt (SP-06)

## Task

Perform final quality check on this proposal before submission.

**INPUT:** `{complete_proposal_draft}` + all structured outputs (intake, pricing, compliance)

## Quality checklist

### A. Compliance audit

- [ ] Every mandatory requirement addressed or flagged GAP
- [ ] All required sections included
- [ ] Format matches RFP specifications
- [ ] Page / word limits respected
- [ ] All appendices attached
- [ ] Signatures / certifications in place

### B. Content quality

- [ ] Executive summary is compelling
- [ ] No generic / template language
- [ ] Client name used correctly throughout
- [ ] Specific metrics provided (traced, not vague)
- [ ] Case studies relevant and impressive
- [ ] No competitor names mentioned
- [ ] Claims supported by evidence

### C. Consistency

- [ ] Consistent terminology throughout
- [ ] Numbers match across sections (pricing hash verified)
- [ ] Pricing aligns with scope
- [ ] Team bios match org chart
- [ ] Dates / timelines consistent

### D. Professional polish

- [ ] No spelling / grammar errors
- [ ] Formatting clean and consistent
- [ ] Charts / tables readable
- [ ] Brand guidelines followed

### E. Persuasion factors

- [ ] Clear win themes throughout
- [ ] Differentiation evident
- [ ] Proof points strong
- [ ] Risk mitigation addressed
- [ ] Value proposition clear

### F. Red flags check

- [ ] No overpromising
- [ ] No capability gaps ignored
- [ ] No pricing errors (engine hash match)
- [ ] No untraceable numerics
- [ ] No compliance exposure
- [ ] No contradictions

## Scoring

Rate each dimension 1–10:

| Dimension | Key |
|-----------|-----|
| requirement_coverage | A |
| traceability | B + untraceable count |
| compliance_coverage | A + compliance report |
| pricing_integrity | C + hash |
| tone_evidence | B, E |
| format_compliance | D |

**Overall score = minimum of dimensions** (not mean).  
Set `dragging_dimension` to the lowest scorer.

## Output

- QA scores object for run log
- Issues list: Critical / Major / Minor
- Pass / Revise decision
- If `untraceable_count > 0` → outcome must be **FAILED**, not COMPLETED
