# AI Proposals Agent™ — Prompt Architecture

## Layering model

```
┌─────────────────────────────────────────┐
│ Master System Prompt (always on)        │
├─────────────────────────────────────────┤
│ Sub-prompt (phase-specific, one active) │
├─────────────────────────────────────────┤
│ Structured context injection            │
│  - RFP requirement matrix               │
│  - KB retrieval (case studies, boiler)  │
│  - Pricing engine output (read-only)    │
│  - Compliance validator results         │
├─────────────────────────────────────────┤
│ Output schema constraint                │
└─────────────────────────────────────────┘
```

---

## Master system prompt — responsibilities

1. **Domain:** North American logistics — FTL, LTL, dedicated, 3PL, automotive inbound/outbound, industrial.
2. **Compliance vocabulary:** OTIF, ISO 9001/14001, CTPAT, SmartWay, safety ratings — never imply certification without KB ref.
3. **Refusal rules:**
   - Never invent pricing, insurance limits, or performance statistics.
   - Never emit a number without `[[trace:source_id:field]]` citation format.
   - On missing evidence → output GAP block, not filler language.
4. **Tone:** Professional, specific, evidence-led. No “world-class / best-in-class” without cited proof.
5. **Structure:** Follow customer RFP section order when provided; otherwise use default logistics proposal outline.

See [`../prompts/master-system.md`](../prompts/master-system.md).

---

## Sub-prompts

### SP-01 — RFP Analysis

**Input:** Raw RFP text (post-ingestion), customer metadata  
**Output:** Requirement matrix JSON

Extract:
- Mandatory vs. optional requirements
- Evaluation criteria weights (if stated)
- Insurance / cert minimums
- Pricing format requested (line-item, all-in, per-mile)
- Submission deadline & format
- Red flags (unlimited liability, uncapped fuel)

### SP-02 — Proposal Generation

**Input:** Requirement matrix, matched case studies, compliance boilerplate, **approved** pricing scenario  
**Output:** Sectioned proposal markdown

Rules:
- One H2 per RFP section
- Inline trace citations on every numeric
- Case studies: max 5, ranked by relevance score
- Executive summary last-written, first-read (summarize traced claims only)

### SP-03 — Pricing Narrative

**Input:** `pricing-output.schema.json` (engine output, immutable)  
**Output:** Pricing narrative prose

Rules:
- **No arithmetic** — describe scenarios, do not recalculate
- Explain value justification per scenario tier
- Flag assumptions explicitly from engine metadata

### SP-04 — Compliance Insertion

**Input:** Requirement matrix, `compliance-report.schema.json`  
**Output:** Compliance section + gap appendix

Rules:
- Insert only boilerplate with valid `source_ref`
- GAP → rose-flag block with `mitigation` or literal `No mitigation currently available.`
- Never merge GAP text into customer-facing section without `[REQUIRES REVIEW]` banner

### SP-05 — Case Study Matcher

**Input:** RFP scope (lanes, modes, industry), case study KB  
**Output:** Ranked list (id, relevance_score, customization_notes)

Matching dimensions:
- Industry (automotive, industrial, retail)
- Mode (FTL, dedicated, milk run)
- Geography (corridor overlap)
- Service attributes (JIT, OTIF, hazmat)

### SP-06 — QA Checklist

**Input:** Full draft + all structured outputs  
**Output:** QA report with per-dimension scores (1–10)

Dimensions:
1. Requirement coverage
2. Traceability completeness
3. Compliance coverage
4. Pricing integrity (hash match)
5. Tone & evidence
6. Format compliance

**Overall = min(dimensions)** — document which dimension drags score.

---

## Context injection format

```yaml
run_id: run_2026-08-10_001
phase: proposal_generation
pricing_scenario: balanced  # locked after human approval
engine_outputs:
  pricing_hash: sha256:abc123...
  compliance_report: {...}
kb_retrieval:
  case_studies: [cs_ford_inbound_2024, cs_steel_coil_2023]
  boilerplate: [bp_otif_v3, bp_ctpat_v2]
constraints:
  human_review_required: true
  max_case_studies: 5
```

---

## Anti-patterns (prompt drift guards)

| Drift | Guard |
|-------|-------|
| Model invents margin % | Pricing sub-prompt has no margin fields in output schema |
| Expired ISO cited as active | Compliance validator runs **before** generation |
| Untraceable win rate | QA layer 2 fails → run cannot COMPLETE |
| “We are CTPAT certified” without ref | Master prompt refusal + compliance GAP |

---

## Versioning

Prompts live in `prompts/` with semver in frontmatter:

```yaml
---
id: master-system
version: 2.0.0
compatible_engine: ">=1.4.0"
---
```

`package.sh` validates frontmatter on pack.
