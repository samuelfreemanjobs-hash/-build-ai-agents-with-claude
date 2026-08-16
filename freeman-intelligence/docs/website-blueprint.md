# Freeman Intelligence — Website Blueprint

Complete site architecture centered on the **Revenue Opportunity Diagnostic** as the lead-generation engine.

---

## Site map

```
/                           Homepage (hero + diagnostic CTA)
/diagnostic                 Revenue Opportunity Diagnostic (interactive)
/how-it-works               Methodology: Find → Fix → Build
/products                   Product ladder overview
  /revenue-intelligence-audit
  /website-revenue-audit
  /revenue-systems-engineering
  /intelligence-infrastructure
/industries                 ICP: Automotive · Logistics · Manufacturing
/about                      Company + local Metro Detroit angle
/briefing                   Post-diagnostic briefing request form
/contact                    General contact
```

---

## Homepage architecture

### Section 1 — Hero

**Headline:** Turn Your Operations Into a Revenue Engine.

**Subheadline:** Freeman Intelligence engineers AI-powered revenue systems for Metro Detroit automotive, logistics, and industrial companies—connecting intelligence, automation, data, and digital systems to find opportunities and eliminate revenue leakage.

| CTA | Action |
|-----|--------|
| Primary | **Find My Revenue Opportunities** → `/diagnostic` |
| Secondary | **See How Freeman Intelligence Works** → `/how-it-works` |

**Hero visual:** Diagram of the Revenue Systems stack (Intelligence → Systems → Experience → Outcomes). See `docs/messaging-framework.md`.

**Trust line:** Built for Metro Detroit automotive suppliers, logistics operators, and industrial manufacturers.

---

### Section 2 — Problem

**Headline:** Your Business Already Has More Revenue Intelligence Than You're Using.

**Body:** Your CRM, ERP, website, sales pipeline, customer data, operational systems, reports, emails, and spreadsheets contain signals. The problem is those signals are fragmented.

**Close:** Freeman Intelligence connects them.

---

### Section 3 — Interactive diagnostic (signature element)

**Headline:** Where Is Your Revenue Getting Lost?

Embedded **Revenue Opportunity Diagnostic** (or strong CTA card linking to `/diagnostic`).

Visitor selects pain areas:

- Leads · Sales · Follow-up · Quoting · Operations · Reporting · Customer retention · Data · Automation

**Output preview (teaser):** Revenue Intelligence Score · Top opportunities · Recommended first project

**CTA:** Get My Revenue Intelligence Briefing

---

### Section 4 — The machine

**Headline:** Revenue Systems Engineering

Visual: three columns under umbrella

| Intelligence | Systems | Experience |
|--------------|---------|------------|
| Market research | Automation | Websites |
| Competitive intel | AI agents | Web apps |
| BI / revenue intel | Integrations | Interactive UX |
| Executive briefings | Dashboards | Copy / CRO |
| | Workflows | |

**Arrow down to:** Revenue Outcomes

---

### Section 5 — Products

Four cards linking to product pages (see `product-ladder.md`):

1. Revenue Intelligence Audit
2. Website Revenue Intelligence Audit (WRIS)
3. Revenue Systems Engineering
4. Intelligence Infrastructure

---

### Section 6 — Industries (ICP)

Three columns:

| Automotive suppliers | Industrial manufacturing | Logistics / transportation |
|---------------------|-------------------------|---------------------------|
| Quoting, RFQs, program management | Component makers, fabrication, machinery | 3PLs, carriers, brokers, fleet |

---

### Section 7 — Local advantage

**Headline:** Built for the Metro Detroit Industrial Corridor

Stats and context (from WRIS Phase 1):

- ~250,000 manufacturing workers in Metro Detroit
- 7,300+ manufacturing business locations in Michigan
- 2,200+ automotive supplier/technology locations
- Southeast Michigan freight network connecting manufacturing, trucking, rail, ports

**Angle:** Local trust + domain expertise in automotive OTIF culture, routing guides, and industrial operations.

---

### Section 8 — Social proof (placeholder)

- Client logos (post-pilot)
- Quote slots
- Case study teasers

---

### Section 9 — Final CTA

**Headline:** Find Where Your Revenue Is Hiding.

**CTA:** Start the Revenue Opportunity Diagnostic

---

## Diagnostic page (`/diagnostic`)

### Flow

1. **Intro** — What you'll get (score, opportunities, bottlenecks, AI map, recommended project)
2. **Company context** (2 questions) — Industry, company size
3. **Pain assessment** (8 questions) — One per revenue leakage area
4. **Results** — Score + breakdown + CTAs
5. **Briefing capture** — Name, email, company, optional phone → "Get My Revenue Intelligence Briefing"

### Results panel

| Output | Source |
|--------|--------|
| Revenue Intelligence Score (0–100) | Deterministic scorer |
| Top 3 Revenue Opportunities | Rule engine from lowest-scoring areas |
| Top 3 Operational Bottlenecks | Rule engine |
| AI Automation Opportunities | Mapped from automation + data gaps |
| Data/Reporting Gaps | Reporting + data question scores |
| Recommended First Project | Product ladder mapping |

---

## Secondary interactive tools (Phase 3)

| Tool | Purpose | Priority |
|------|---------|----------|
| Revenue Intelligence Diagnostic | Lead gen + qualification | **Phase 2 (now)** |
| Revenue Leakage Calculator | Estimate $ lost to inefficiency | Phase 3 |
| AI Opportunity Mapper | Process-level AI impact map | Phase 3 |

---

## Design direction

- **Palette:** Deep navy (#0f172a), steel blue accent (#3b82f6), warm amber CTA (#f59e0b), clean white/gray backgrounds
- **Typography:** Modern sans (Inter or similar) — executive, not startup-playful
- **Tone:** Industrial precision meets executive clarity
- **Mobile:** Diagnostic must work on tablet (buyers review on iPad)

---

## Technical implementation

| Layer | Stack |
|-------|-------|
| Diagnostic web app | Vite + React + TypeScript (this repo: `freeman-intelligence/web/`) |
| Scoring engine | Python (`diagnostic/scripts/`) — binding facts, not LLM |
| Future site | Next.js or static export from blueprint |
| Forms | Briefing capture → CRM webhook / email (Phase 3) |
| Analytics | Diagnostic completion events, score distribution |

---

## SEO targets

- Revenue systems engineering Detroit
- Automotive supplier automation Michigan
- Metro Detroit business intelligence
- Industrial revenue operations consulting
- AI automation manufacturing Detroit

---

## Launch sequence

1. ✅ Diagnostic tool + scorer (Phase 2)
2. Static homepage from this blueprint (Phase 3)
3. Briefing form + CRM integration (Phase 3)
4. Product detail pages (Phase 3)
5. Case studies after first audits (Phase 4)
