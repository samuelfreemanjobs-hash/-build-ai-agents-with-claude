# AI Proposals Agent™ — Complete System Design

**Version:** 2.1  
**Status:** Planning + operator console MVP  
**Companion:** [`system-design.md`](system-design.md) (v2 architecture guarantees)

This document is the **full product specification** — architecture, prompts, KB, UI, GTM, and roadmap. v2.1 merges the original generative workflow with **traceability enforcement** (pricing engine, run-log schema, compliance validators).

---

## System architecture overview

### Core components

| # | Component | Role |
|---|-----------|------|
| 1 | **Document Ingestion Engine** | RFP PDF/DOCX → structured text (G1) |
| 2 | **Knowledge Base Manager** | Proposals, case studies, capabilities, compliance, pricing |
| 3 | **Proposal Generation Engine** | LLM narrative assembly (no money authority) |
| 4 | **Compliance Checker** | Validator against KB credentials |
| 5 | **Pricing Optimizer** | **Deterministic engine** — 3 scenarios, Decimal math |
| 6 | **Quality Assurance Layer** | 6-dimension check; overall = minimum |

```
                    ┌─────────────────────┐
                    │ Document Ingestion  │ (G1)
                    └──────────┬──────────┘
                               ▼
┌──────────────┐    ┌─────────────────────┐    ┌──────────────────┐
│ Knowledge    │◄──►│ Orchestrator        │───►│ Proposal Draft   │
│ Base Manager │    │ (75-min pipeline)   │    │ (markdown/DOCX)  │
└──────────────┘    └──────────┬──────────┘    └──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       Compliance         Pricing          QA Layer
       Checker             Engine           (SP-06)
              │                │                │
              └────────────────┴────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Run Log (schema)    │
                    │ Operator Console    │
                    └─────────────────────┘
```

---

## 1. Master system prompt

See [`../prompts/master-system.md`](../prompts/master-system.md).

**v2.1 addition:** Original mission/expertise preserved; pricing and metrics constrained to engine + KB trace refs.

---

## 2. Document ingestion prompts

| Prompt | File |
|--------|------|
| RFP Analysis | [`../prompts/sub/rfp-analysis.md`](../prompts/sub/rfp-analysis.md) |
| Past Proposal Mining | [`../prompts/sub/past-proposal-mining.md`](../prompts/sub/past-proposal-mining.md) |

**Ingestion stack (G1 — planned):**

- AWS Textract or equivalent for scanned PDFs
- Claude / document API for structure extraction
- Output: `rfp-intake.schema.json`

---

## 3. Proposal generation prompts

| Prompt | File |
|--------|------|
| Executive Summary | [`../prompts/sub/executive-summary.md`](../prompts/sub/executive-summary.md) |
| Technical Capability | [`../prompts/sub/technical-capability.md`](../prompts/sub/technical-capability.md) |
| Case Study Selector | [`../prompts/sub/case-study-selector.md`](../prompts/sub/case-study-selector.md) |
| Compliance Injector | [`../prompts/sub/compliance-injector.md`](../prompts/sub/compliance-injector.md) |
| Pricing Narrative | [`../prompts/sub/pricing-narrative.md`](../prompts/sub/pricing-narrative.md) |

---

## 4. Pricing optimizer

**Not an LLM prompt for arithmetic.** The Pricing Engine:

- Reads `pricing_models` cost rows + volume from intake
- Computes Competitive / Balanced / Premium in `Decimal`
- Emits `pricing-output.schema.json` (money as strings)
- Halts on `MISSING_COST_ROW`, `VOLUME_OUT_OF_BAND`

SP-03 (Pricing Narrative) wraps engine output in value justification prose.

---

## 5. Quality assurance

See [`../prompts/sub/quality-assurance.md`](../prompts/sub/quality-assurance.md).

**v2 rule:** `outcome: COMPLETED` requires `traceability.untraceable_count == 0`.

---

## 6. Orchestration workflow

See [`../prompts/orchestrator.md`](../prompts/orchestrator.md).

| Phase | Time | Human gate |
|-------|------|------------|
| Intake | 5 min | Confirm RFP |
| KB retrieval | 10 min | — |
| Generation | 30 min | Approve pricing scenario |
| Optimization | 15 min | — |
| QA | 10 min | Final review |
| Output | 5 min | — |

---

## 7. Knowledge base structure

See [`knowledge-base.md`](knowledge-base.md) for full SQL schema.

**Minimum data for launch:**

- 20–50 past proposals
- 30–50 case studies with quantified results
- Capability library + compliance templates
- Pricing models with cost rows per service line
- Current certifications with expiry dates

---

## 8. API integration points

| System | Purpose | Phase |
|--------|---------|-------|
| Document parsing (Textract / Claude) | RFP ingest | G1 |
| Salesforce / HubSpot | CRM client data | Phase 2 |
| DAT / internal ERP | Rate benchmarks | Phase 2 |
| SAFER / cert registries | Compliance verify | Phase 3 |
| Pandoc / DOCX lib | Export | G2 |
| DocuSign | E-sign | Phase 3 |
| Slack / SendGrid | Notifications | Phase 1 |

---

## 9. User interface flows

See [`ui-ux-flows.md`](ui-ux-flows.md).

**Two UI surfaces:**

1. **SaaS dashboard** — 7-step proposal workflow (upload → download)
2. **Operator console** — single-run trace/compliance/halt view ([`../ui/operator-console/`](../ui/operator-console/))

---

## 10. Done-for-you service workflow

| Tier | Price | Turnaround |
|------|-------|------------|
| AI-Assisted | $2,000/proposal | 3 days |
| White-Glove | $3,500/proposal | 5 days |
| Full-Service | $5,000/proposal | 7 days |

**Retainers:**

- 3/month: $5,500
- 5/month: $8,500
- 10/month: $15,000

---

## 11. Training data requirements

See [`knowledge-base.md`](knowledge-base.md#initial-population).

**Ongoing maintenance:**

- Upload every new proposal (win/loss)
- Refresh case studies quarterly
- Refresh pricing monthly
- Update certifications annually

---

## 12. Success metrics & KPIs

| Category | Metrics |
|----------|---------|
| Efficiency | Time to first draft (<2 hr), proposals/week, human edit time |
| Quality | Win rate vs manual, compliance score, internal quality rating |
| Business | Revenue, cost per proposal, volume capacity, sales cycle |
| System | KB utilization, case study match accuracy, pricing halt rate |

---

## 13. Implementation roadmap

See [`implementation-roadmap.md`](implementation-roadmap.md).

**90-day launch:** Foundation → Enhancement → Scale  
**Blockers before real bids:** G1 (ingest), G2 (DOCX export)

---

## 14. Monetization models

See [`gtm-and-monetization.md`](gtm-and-monetization.md).

| Model | Entry |
|-------|-------|
| SaaS | $497 / $997 / $2,497 per month |
| Service | $2K–$5K per proposal |
| Hybrid | $497 base + à la carte expert review |

**Break-even:** ~20 SaaS customers OR 5 retainer clients/month

---

## 15. Competitive positioning

**Primary value prop:** Win more contracts in half the time with compliant, traced proposals.

| Pillar | Message |
|--------|---------|
| Speed | RFP to submission-ready in ~2 hours, not 2 weeks |
| Win rate | +30% via compliance + customization |
| Consistency | Every proposal showcases your best work |
| Scalability | 10× more RFPs without new hires |
| Intelligence | Trained on **your** wins |

**Target audiences (Metro Detroit fit):**

1. **3PL / freight brokers** — buried in RFPs
2. **Dedicated carriers** — automotive / industrial lanes
3. **Warehousing / distribution** — long technical RFPs
4. **Freight forwarders** — compliance complexity

**Moat:** Logistics-specific + KB learns from your wins + compliance library + pricing traceability (`EVERY NUMBER TRACES`).

---

## v1 → v2.1 migration notes

| v1 (original) | v2.1 (current) |
|---------------|----------------|
| LLM generates pricing scenarios | Engine generates; LLM narrates |
| "Competitive pricing" in prompt | Margin tiers in engine config |
| QA pass/fail prose | QA scores in run-log schema |
| Generic dashboard | Operator console with trace drawer |
| Compliance in prompt only | Compliance validator + GAP blocks |

---

## Ready to deploy checklist

- [x] All prompts documented
- [x] Orchestration workflow
- [x] Knowledge base architecture
- [x] UI/UX flows (spec)
- [x] Operator console (demo)
- [x] Pricing models (GTM)
- [x] Implementation roadmap
- [ ] G1 document ingestion
- [ ] G2 DOCX export
- [ ] G07 NON_OVERRIDABLE in halt handler code
- [ ] KB populated with real data
- [ ] Pilot with 3 clients

**Estimated build:** 90 days, 2 developers + 1 prompt engineer  
**Estimated build cost:** $50K–$75K
