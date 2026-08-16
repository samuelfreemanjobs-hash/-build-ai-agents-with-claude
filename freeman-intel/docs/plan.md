# Freeman Intel — Master Plan

**Version:** 0.1  
**Date:** August 2026  
**Geography:** Metro Detroit automotive, logistics, and industrial manufacturing  
**Wedge:** Plant inbound logistics (receiving desk)

---

## 1. Executive summary

Freeman Intel is a B2B SaaS product that gives **plant inbound logistics teams** an AI-powered **readiness desk**: ingest ASN and carrier communications, validate against plant rules and expected inbound, and export dock-ready records—with **human approval** on every action that affects the gate, OTIF, or chargebacks.

We do **not** sell a marketplace of agents. Customers buy **outcome-based teams** (three bundles). Agents are internal roles orchestrated behind a single approval UI.

**Why now:** SMB supplier plants still run inbound on **email + PDF + spreadsheets**. Mistakes surface as unscheduled trucks, ASN mismatches, and OEM chargebacks—not as “we need a better TMS.”

**Why Detroit:** Concentration of auto suppliers, shared routing-guide culture, OTIF/scorecard pressure, and corridor logistics (Detroit–Ann Arbor–Toledo–Flint) create a repeatable ICP and local trust.

---

## 2. Problem

Plant inbound coordinators and receiving supervisors are accountable when:

- Trucks arrive **without appointment** or **without a valid ASN**
- ASN **part number, quantity, or ship-to** does not match expected inbound
- **Wrong carrier (SCAC)** or **wrong dock code** triggers security or routing violations
- **ETA drift** is discovered only when the truck is at the gate
- **Hot parts** for production are buried in email threads
- OEM disputes require assembling a **timeline and document pack** manually

Current tools (WMS, TMS, portals) are fragmented. Many SMB plants lack integration teams. The **coordination layer** between email, spreadsheets, and the dock is still manual.

---

## 3. Solution

### Product principle

**Email-first, export-not-API, approve-before-impact.**

1. **Connect** Gmail / Outlook (and optional PDF upload)
2. **Extract** structured inbound records from ASN emails and carrier updates
3. **Match** against expected inbound (CSV / Google Sheet upload)
4. **Validate** against per-plant compliance rules (routing guide, SCAC, appointments, hazmat, etc.)
5. **Present** side-by-side source vs extracted fields with pass/warn/fail
6. **Approve** → export row, clipboard block, draft emails (supplier chase, carrier chase, receiving brief)

### What we are not (v1)

- Not a TMS or WMS replacement
- Not fully autonomous booking or dock assignment without approval
- Not an OEM-facing product (Tier 1 / Ford / GM corporate IT sales cycle)

### Architecture (conceptual)

```
Email / PDF ──► Intake agents ──► Validation agents ──► Planning drafts
                                        │
                        Expected inbound (CSV/Sheet upload)
                                        │
                                        ▼
                              Approval queue (human)
                                        │
                    Export / draft comms / internal alerts
```

---

## 4. Ideal customer profile (ICP)

### Primary

**Manufacturing plant** (auto supplier or industrial), **20–500 employees**, with:

- 2–20 dock doors
- Mix of **scheduled appointments** and daily exceptions
- Inbound logistics coordinator or receiving supervisor as buyer
- Dock schedule in **spreadsheet** or lightweight system
- Ships or receives under **OEM / Tier 1 routing pressure** (OTIF, chargebacks)

### Secondary

**Regional 3PL inbound desk** managing receiving coordination for 1–3 plants in the corridor.

### Geography

Metro Detroit core + corridor: Detroit, Auburn Hills, Sterling Heights, Warren, Canton, Flint, Ann Arbor, Toledo.

### Disqualifiers (v1)

- Mega-OEM assembly plant inbound (enterprise IT, long cycle)
- Brokers with no plant receiving desk
- Operations with **API-only** inbound (no email wedge)
- Heavy hazmat specialty without compliance owner willing to pilot rules

See [`icp-and-gtm.md`](icp-and-gtm.md) for personas and outreach.

---

## 5. Product bundles (customer menu)

Customers see **three teams**, not 25 agents.

### Bundle 1: Inbound Readiness Team (launch wedge)

**Outcome:** Every expected truck is validated before it hits the gate.

| Capability | Description |
|------------|-------------|
| Inbound Readiness | ASN + carrier email → structured inbound record |
| ASN Match & Exception | PO/release vs ASN vs qty/part mismatch |
| Routing Guide Checker | SCAC, dock code, ship-to, trailer type |
| Supplier ASN Chase | Draft corrected ASN requests |
| Gate & Receiving Heads-Up | Draft brief for dock lead / receiving |

**Default autonomy:** Approve all outbound comms and exports.

### Bundle 2: Dock & ETA Team (phase 2)

**Outcome:** Dock plan and at-risk inbound surfaced before line impact.

| Capability | Description |
|------------|-------------|
| Dock Schedule Assistant | Draft door plan from expected + inbound |
| Carrier ETA Watch | Parse delay/arrival emails → at-risk flags |
| Carrier Appointment Chase | Draft booking / reschedule |
| OTIF Risk Radar | Late/missing vs production need |
| Hot Part Escalation | Line-down risk → internal + supplier drafts |

**Default autonomy:** Auto internal alerts; approve customer/supplier comms.

### Bundle 3: Receipt & Dispute Team (phase 3 / upsell)

**Outcome:** Receipt issues and OEM disputes resolved with evidence packs.

| Capability | Description |
|------------|-------------|
| Raw Material Lot & Cert Chase | Mill cert, heat lot, COA before unload |
| Receipt Discrepancy Desk | Short/over/wrong part dispute drafts |
| Detention & Dwell Tracker | Yard time from emails → carrier notice drafts |
| Chargeback Defense Pack | Timeline + ASN + POD + comms export |

---

## 6. Pricing model (placeholders)

Price on **outcomes and usage**, not per agent.

| Tier | Price (placeholder) | Includes |
|------|---------------------|----------|
| **Starter** | $499 / mo | Inbound Readiness Team, 1 plant profile, 500 inbound events/mo, email + PDF, CSV export, 2 seats |
| **Pro** | $999 / mo | + Dock & ETA Team, 1,500 events/mo, Google Sheet sync, auto internal alerts, 5 seats |
| **Plant Plus** | $1,999 / mo | + Receipt & Dispute Team, 3 plant profiles, 5,000 events/mo, custom rules import, 10 seats |
| **Enterprise** | Custom | SSO, audit log retention, dedicated rules onboarding, portal assist (phase 2) |

**Add-ons (placeholder):**

- Extra plant profile: $299 / mo
- Extra 1,000 inbound events: $149 / mo
- Onboarding / routing guide rules setup: $2,500 one-time

**Pilot offer (first 10 plants):** 60-day pilot at 50% off, white-glove rules setup, case study rights.

---

## 7. Go-to-market

### Positioning

**Headline:** Know if the truck is allowed at the gate before it arrives.

**Subhead:** Freeman Intel validates ASN, appointments, and routing rules from your inbox—built for Metro Detroit automotive and industrial receiving desks.

### Channels

1. **Founder-led outbound** — LinkedIn to inbound logistics managers at supplier plants
2. **Local associations** — automotive supplier councils, MMTC-adjacent networks, industrial park operators
3. **3PL partnerships** — inbound desks serving multiple plants (one logo, multi-site expansion)
4. **Case studies** — “unscheduled arrivals down X%” / “ASN mismatches caught pre-gate”

### Sales motion

1. 15-min discovery (5 questions in `icp-and-gtm.md`)
2. Pilot: connect email, upload expected inbound sample, configure rules
3. Weekly metric review: validated %, exceptions caught, time saved
4. Convert to Pro when Dock & ETA is needed

### Metrics

| Stage | North star | Supporting |
|-------|------------|------------|
| Pilot | % inbound validated before arrival | Unscheduled arrival count |
| Paid | Retention + expansion to Bundle 2 | Seats, events/mo |
| Scale | Chargeback/dispute time saved | NPS from receiving supervisor |

---

## 8. Technical roadmap

### Phase 0 — Planning (current)

- [x] ICP and wedge defined
- [x] Agent menu and bundles documented
- [x] Landing page outline
- [ ] 10 discovery calls with inbound managers
- [ ] Collect 3 sample routing guides + ASN formats

### Phase 1 — MVP (8–12 weeks engineering, estimate)

**Ship:** Inbound Readiness Team only.

| Component | Scope |
|-----------|--------|
| Auth | Email OAuth (Gmail + Microsoft) |
| Intake | Email triage, PDF ASN extraction |
| Expected inbound | CSV upload + column mapping |
| Rules engine | Configurable per plant (SCAC, dock, appointment, field presence) |
| Matching | PO/part/qty fuzzy match with confidence |
| UI | Inbox queue, side-by-side review, approve/reject/edit |
| Export | Clipboard block, CSV download, optional Google Sheet |
| Comms | Draft supplier ASN chase (approve to copy/send) |
| Audit | Immutable log of source, extraction, approval, export |

**Explicitly out of scope for MVP:** TMS/WMS APIs, portal automation, auto-send email.

### Phase 2 — Dock & ETA (after 10 paying or pilot plants)

- Dock capacity model + door assignment **drafts**
- Carrier ETA thread monitoring
- Hot part list upload + priority scoring
- Auto internal alerts (Slack/email to plant)

### Phase 3 — Receipt & Dispute + integrations

- Lot/cert completeness rules
- Dispute evidence bundler
- First **portal assist** (user-driven, pre-filled copy fields)
- First WMS/TMS connector driven by **customer concentration** (not generic)

### Phase 4 — Platform

- Zapier / webhook for power users
- Multi-plant dashboard for 3PL desks
- Rules marketplace templates (Ford supplier, GM supplier, generic industrial)

---

## 9. Risk register

| Risk | Mitigation |
|------|------------|
| Extraction errors on ASN | Human approval always; confidence scores; side-by-side UI |
| Auto chargeback if wrong validation | Conservative defaults; warn vs fail; no auto-send v1 |
| Long enterprise sales at OEM | Stay SMB supplier plant + 3PL desk |
| “We need TMS integration” | Email-first wedge; export formats; one connector when data shows |
| Portal-heavy customers | Phase 2 portal assist; don’t block MVP |
| Competitor with TMS bundle | Win on **inbound readiness** niche and Detroit trust |

---

## 10. Success criteria

### 90 days

- 10 discovery calls completed
- 3 pilot plants onboarded
- MVP in pilot with Inbound Readiness Team
- 1 written case study (metric: pre-gate validation rate)

### 12 months

- 25+ paying plants
- 70%+ pilot → paid conversion
- Bundle 2 attached to 40%+ of accounts
- Documented playbook for corridor expansion (Toledo, Ohio suppliers)

---

## 11. Related documents

- [`agent-menu.md`](agent-menu.md) — Full capability and internal agent roster
- [`icp-and-gtm.md`](icp-and-gtm.md) — Personas, discovery questions, outreach
- [`../marketing/landing-page.md`](../marketing/landing-page.md) — Website copy outline

---

## 12. Name and brand

**Freeman Intel** — intelligence for the inbound desk, local founder credibility in Detroit industrial logistics.

Tagline options:

- *Gate-ready inbound.*
- *Validate before the truck arrives.*
- *Built for Detroit plant receiving.*
