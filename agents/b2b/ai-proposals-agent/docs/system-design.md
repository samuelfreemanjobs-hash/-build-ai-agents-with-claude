# AI Proposals Agent™ — System Design

**Version:** 2.0  
**Domain:** Logistics RFP / proposal generation  
**Operator model:** Human-in-the-loop at intake, pricing approval, final review

---

## 1. Architecture overview

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ RFP Intake  │────►│ Orchestrator     │────►│ Proposal Draft  │
│ (G1 pending)│     │ (75-min pipeline)│     │ (structured MD) │
└─────────────┘     └────────┬─────────┘     └────────┬────────┘
                             │                        │
                    ┌────────▼────────┐      ┌────────▼────────┐
                    │ Pricing Engine  │      │ Compliance      │
                    │ (Decimal only)  │      │ Validators      │
                    └────────┬────────┘      └────────┬────────┘
                             │                        │
                    ┌────────▼────────────────────────▼────────┐
                    │ Run Log (schema-enforced traceability)    │
                    └────────────────────┬────────────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │ Operator Console    │
                              │ (review / approve)  │
                              └─────────────────────┘
```

### Core guarantee

**Every binding numeric in a completed run traces to a KB row or engine output.**  
The run-log schema rejects `outcome: COMPLETED` when `traceability.untraceable_count > 0`.

---

## 2. Pipeline (orchestration workflow)

| Phase | Duration | Agent / module | Human gate |
|-------|----------|----------------|------------|
| 1. Intake normalize | ~5 min | RFP Analysis sub-prompt | Confirm scope & exclusions |
| 2. Requirement matrix | ~10 min | RFP Analysis | — |
| 3. Case study match | ~8 min | Case Study Matcher | Optional pick override |
| 4. Compliance pre-scan | ~12 min | Compliance sub-prompt | — |
| 5. Pricing scenarios | ~15 min | Pricing Engine + Pricing sub-prompt | **Approve scenario** |
| 6. Draft generation | ~20 min | Proposal Generation sub-prompt | — |
| 7. QA pass | ~5 min | QA sub-prompt + validators | **Final review** |

**Total:** ~75 minutes automated vs. 3–5 days manual.

---

## 3. Component map

### 3.1 Master system prompt

The “brain”: logistics domain, compliance vocabulary, tone, refusal rules, trace citation format. See [`prompts/master-system.md`](../prompts/master-system.md).

### 3.2 Six sub-prompts

| ID | Role |
|----|------|
| SP-01 | RFP analysis & requirement extraction |
| SP-02 | Proposal generation (narrative assembly) |
| SP-03 | Pricing narrative (no arithmetic) |
| SP-04 | Compliance language insertion |
| SP-05 | Case study selection & customization |
| SP-06 | QA checklist & gap report |

### 3.3 Pricing engine (non-LLM)

- All money in `Decimal` internally
- Outputs JSON matching `pricing-output.schema.json` (decimal **strings**, not floats)
- Three scenarios: **Competitive / Balanced / Premium**
- Halts on `MISSING_COST_ROW`, `VOLUME_OUT_OF_BAND` (non-overridable)

### 3.4 Compliance validators

Read-only checks against KB credentials:

- OTIF / on-time performance claims
- ISO 9001 / 14001 expiry
- CTPAT / security program
- Sustainability / ESG statements
- Insurance limits vs. RFP minimums

Output: `compliance-report.schema.json` — gaps render **COMPLIANT | GAP | UNKNOWN**.

### 3.5 Knowledge base

| Table | Purpose |
|-------|---------|
| `proposals` | Past winning/losing proposals (embeddings) |
| `case_studies` | Customer, lane, service line, metrics |
| `pricing_models` | Cost rows, margins, volume bands |
| `credentials` | Certs, insurance, memberships with expiry |
| `boilerplate` | Approved compliance paragraphs with source refs |

---

## 4. Quality assurance (6 layers)

1. **Schema validation** — all outputs parse against JSON Schema  
2. **Traceability audit** — every `$` figure has `source_ref`  
3. **Compliance coverage** — mandatory clauses present or flagged GAP  
4. **Pricing integrity** — engine hash matches pricing block  
5. **Tone & exclusion** — no uncertified seals, no superlative without evidence  
6. **Human review flag** — `human_review_required: true` on every run  

**QA score = minimum of dimension scores**, not mean. A compliance coverage of 4 pulls a doc with 9s elsewhere down to 4.

---

## 5. Halt causes

| Cause | Overridable | Fix path |
|-------|-------------|----------|
| `MISSING_COST_ROW` | **No** | Add cost row to KB for service line |
| `VOLUME_OUT_OF_BAND` | **No** | Adjust volume or get exec pricing approval |
| `CREDENTIAL_EXPIRED` | Yes (with waiver doc) | Renew cert or exclude claim |
| `RFP_AMBIGUOUS_SCOPE` | Yes | Operator clarifies scope in intake |
| `UNTRACEABLE_NUMERIC` | **No** | Re-run with valid source refs |

> **G07:** `MISSING_COST_ROW` and `VOLUME_OUT_OF_BAND` must live in `NON_OVERRIDABLE` in the halt handler (schema + code, not docs-only).

---

## 6. Integrations (roadmap)

| ID | Integration | Priority |
|----|-------------|----------|
| G1 | RFP document ingestion (PDF/DOCX) | **Blocker for real bids** |
| G2 | DOCX export with styles | **Blocker for delivery** |
| G3 | CRM opportunity link | Nice-to-have |
| G4 | E-signature handoff | Phase 2 |

---

## 7. GTM alignment (Freeman Intel corridor)

**ICP overlap:** 3PLs, dedicated carriers, and logistics providers bidding on **automotive/industrial** lanes in Metro Detroit.

| Product | Buyer | Wedge |
|---------|-------|-------|
| Freeman Intel (sister) | Plant inbound manager | ASN / gate readiness |
| AI Proposals Agent™ | BD / sales / solutions | RFP response in 75 min |

Bundle pitch for logistics shops: **operate inbound (Freeman Intel) + win inbound contracts (Proposals Agent)**.

---

## 8. Expected ROI (placeholder)

| Metric | Target |
|--------|--------|
| Time per proposal | ~2 hours vs. 2 weeks |
| RFP capacity | 10× without new hires |
| Win rate lift | +30% (compliance + customization) |
| SaaS break-even | ~20 customers @ Pro tier |

---

## Related documents

- [`prompt-architecture.md`](prompt-architecture.md)
- [`brand-system.md`](brand-system.md)
- [`runbook.md`](runbook.md)
