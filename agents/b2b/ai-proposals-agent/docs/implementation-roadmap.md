# Implementation Roadmap

## 90-day launch plan

### Phase 1: Foundation (Days 1–30)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Claude / LLM API integration | Backend | Prompt runner |
| KB schema + migrations | Backend | Postgres tables live |
| Migrate 20 past proposals | Ops + SP-KB | Populated KB |
| Capability library | Ops | 15+ entries |
| Core prompts deployed | Prompt eng | All SP-* in repo |
| Basic SaaS UI (Steps 1–4) | Frontend | Upload + scope + pricing approve |
| Operator console v1 | Frontend | ✅ Done (demo) |

**Deliverable:** MVP generates 1 proposal end-to-end (markdown export)

---

### Phase 2: Enhancement (Days 31–60)

| Task | Deliverable |
|------|-------------|
| Compliance checker (validators) | GAP/COMPLIANT report |
| Pricing engine v1 | 3 scenarios, Decimal, halt on missing row |
| Case study selector (embedding search) | Ranked matches |
| QA layer in run log | Min-score enforcement |
| Pilot with 3 internal users | Feedback doc |
| Prompt refinement | v2.1.1 patches |

**Deliverable:** Beta for friendly clients

---

### Phase 3: Scale (Days 61–90)

| Task | Deliverable |
|------|-------------|
| Expand KB to 50+ proposals | Coverage view useful |
| SaaS UI polish (Steps 5–7) | Full 7-step flow |
| CRM integration (HubSpot or SF) | Client intel sync |
| Training materials | Onboarding deck |
| First 10 paying clients | Revenue |
| Support system | Ticket + run-log debug |

**Deliverable:** Production-ready SaaS

---

## Post-launch (Months 4–6)

| Month | Feature |
|-------|---------|
| 4 | Proposal analytics dashboard |
| 4 | Run-log browser (operator console) |
| 5 | KB coverage pre-bid view |
| 5 | Mobile approval app |
| 6 | Competitive intelligence module |

---

## Blockers (must resolve for real bids)

| ID | Blocker | Recommendation |
|----|---------|----------------|
| **G1** | Document ingestion | Run 1 real RFP through 2 libraries; pick winner |
| **G2** | DOCX export | Template from last winning proposal |
| **G07** | NON_OVERRIDABLE halts in code | Add frozenset + golden test |

---

## Team & budget

| Role | Count | Duration |
|------|-------|----------|
| Backend developer | 2 | 90 days |
| Prompt engineer | 1 | 90 days |
| Frontend (part-time) | 1 | Days 15–90 |
| Ops / KB population | 1 | Ongoing |

**Estimated build cost:** $50K–$75K  
**Estimated build time:** 90 days

---

## Success criteria at day 90

- [ ] 10 paying clients
- [ ] <2 hr median time to first draft
- [ ] 0 COMPLETED runs with untraceable numerics
- [ ] Win/loss tracking on AI-assisted vs manual (baseline)
- [ ] G1 + G2 shipped

---

## Freeman Intel sequencing

| Order | Product | Why |
|-------|---------|-----|
| 1 | Plant Inbound (Freeman Intel) | Faster wedge, email-only |
| 2 | AI Proposals Agent | Same corridor logos, upsell |
| Parallel | Shared KB for case studies | Automotive/industrial proof points |
