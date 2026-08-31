# Freeman Intel — Agent Menu

Customer-facing **menu items** (capabilities) and internal **agent roles** (orchestration). Customers buy **bundles**; agents are not sold individually.

---

## Customer menu (website / sales)

### Core — Plant inbound

| Menu item | Outcome | Default mode |
|-----------|---------|--------------|
| **Inbound Readiness** | ASN + carrier email → validated inbound record before gate | Approve all |
| **Dock Schedule Assistant** | Draft dock/appointment plan from expected + inbound | Approve assignments |
| **Gate & Receiving Heads-Up** | Draft “what’s coming” brief for dock lead / receiving | Approve send |
| **ASN Match & Exception** | PO/release vs ASN vs qty/part mismatch flags | Approve escalations |
| **Carrier ETA Watch** | Parse carrier delay/arrival emails → at-risk inbound | Auto-alert internal; approve external |

### Auto / Detroit compliance

| Menu item | Outcome | Default mode |
|-----------|---------|--------------|
| **Routing Guide Checker** | SCAC, dock code, ship-to, trailer type vs plant rules | Approve failures |
| **OTIF Risk Radar** | Late/missing ASN/appointment vs production need | Auto internal alert |
| **Approved Carrier Guard** | Warn non-approved SCAC at gate prep | Auto warn |
| **Hazmat / Regulated Inbound** | Flag placards, SDS chase, restricted dock rules | Approve all comms |
| **Tooling & Oversize Inbound** | Permits, escort, crane door, weight hints | Approve |

### Industrial manufacturing inbound

| Menu item | Outcome | Default mode |
|-----------|---------|--------------|
| **Raw Material Lot & Cert Chase** | Mill cert, heat lot, COA missing before unload | Approve supplier chase |
| **Heat-Treat / CoC Validator** | Cert matches part/lot for machined/stamped parts | Approve release to dock |
| **Steel / Coil Inbound** | Coil ID, weight, staging yard slot draft | Approve |

### Comms & coordination

| Menu item | Outcome | Default mode |
|-----------|---------|--------------|
| **Supplier ASN Chase** | Draft “send corrected ASN by cutoff” emails | Approve send |
| **Carrier Appointment Chase** | Draft booking / reschedule with carrier | Approve send |
| **Hot Part Escalation** | Line-down risk → draft internal + supplier blast | Approve send |
| **Shutdown / Surge Planner** | Holiday shutdown inbound pile-up warnings | Auto internal |

### After receipt (upsell)

| Menu item | Outcome | Default mode |
|-----------|---------|--------------|
| **Receipt Discrepancy Desk** | Short/over/wrong part → dispute doc pack | Approve send |
| **Detention & Dwell Tracker** | Yard time from emails → draft carrier notice | Approve send |
| **Chargeback Defense Pack** | Timeline + ASN + POD + comms for OEM dispute | Approve export |

### Corridor logistics (optional)

| Menu item | Outcome | Default mode |
|-----------|---------|--------------|
| **Milk Run / Shuttle Inbound** | Multi-stop ETA rollup for plant window | Auto internal |
| **Cross-Dock Inbound** | Transfer inbound vs direct-to-line rules | Approve |
| **Toledo–Detroit Lane Watch** | Corridor delay patterns | Auto alert |

---

## Internal agent roster

### Intake agents

| Agent | Role |
|-------|------|
| Email Triage Agent | Classify: ASN, ETA, appointment, POD, noise |
| PDF ASN Extractor | Part, qty, UOM, PO, lot, ship-to, SCAC |
| Spreadsheet Ingest Agent | Expected inbound / dock capacity upload |
| Portal Snippet Agent (phase 2) | User pastes portal text → structured fields |

### Validation agents

| Agent | Role |
|-------|------|
| PO / Release Matcher | Match ASN lines to expected inbound |
| Routing Guide Rules Agent | Per-plant configurable rules |
| Appointment Window Agent | Appointment vs dock window |
| Carrier Approval Agent | SCAC allowlist |
| Production Need Agent | Need date vs ETA |
| Hazmat / Regulated Agent | Regulated inbound flags |
| Lot / Cert Completeness Agent | Certs before unload |

### Planning agents

| Agent | Role |
|-------|------|
| Dock Capacity Agent | Doors, live unload vs drop |
| Door Assignment Drafter | Suggested door per inbound |
| Yard Slot Drafter | Trailer staging suggestions |
| Priority Scorer | Hot part, line risk, OTIF |

### Comms agents

| Agent | Role |
|-------|------|
| Receiving Brief Writer | Dock lead one-pager |
| Supplier Chase Writer | ASN correction requests |
| Carrier Chase Writer | Appointment / ETA follow-up |
| Internal Escalation Writer | Materials / production alerts |
| OEM-Style Status Writer | Upstream status if required |

### Monitor agents

| Agent | Role |
|-------|------|
| ETA Drift Monitor | Thread updates over time |
| No-Show / Late Arrival Monitor | Appointment violations |
| ASN Still Missing Monitor | Cutoff timers |
| Yard Dwell Monitor | Detention risk |

### Audit agents

| Agent | Role |
|-------|------|
| Inbound Timeline Assembler | Event timeline per shipment |
| Dispute Evidence Bundler | OEM dispute pack |
| Scorecard Impact Noter | OTIF / chargeback risk annotation |

### Orchestrator

| Agent | Role |
|-------|------|
| Inbound Desk Orchestrator | Pipeline routing → human approval queue |

---

## Launch tiers

### Tier 1 — Ship first (Detroit wedge)

Bundle: **Inbound Readiness Team**

1. Inbound Readiness  
2. ASN Match & Exception  
3. Routing Guide Checker  
4. Supplier ASN Chase  
5. Gate & Receiving Heads-Up  

### Tier 2 — After ~10 plants

Bundle: **Dock & ETA Team**

6. Dock Schedule Assistant  
7. Carrier ETA Watch  
8. Carrier Appointment Chase  
9. OTIF Risk Radar  
10. Hot Part Escalation  

### Tier 3 — Industrial / upsell

Bundle: **Receipt & Dispute Team**

11. Raw Material Lot & Cert Chase  
12. Receipt Discrepancy Desk  
13. Chargeback Defense Pack  
14. Detention & Dwell Tracker  

---

## Per-plant configuration (not more agents)

Configure once per site:

- Plant / dock codes  
- Approved SCAC list  
- Appointment required? Cutoff times?  
- Dock capabilities (live, drop, hazmat, crane)  
- Daily hot part list (upload)  
- Routing guide excerpts → rules  

---

## Customer-facing copy (one-liners)

| Menu item | Copy |
|-----------|------|
| Inbound Readiness | Know if the truck is allowed at the gate before it arrives. |
| ASN Match | Stop dock stops from wrong part or qty on the ASN. |
| Routing Guide Checker | OEM-style rules without re-reading the PDF every time. |
| Dock Schedule Assistant | Draft the door plan from today’s expected inbound. |
| Hot Part Escalation | Line-down risk in plain English, draft comms included. |
| Chargeback Defense Pack | ASN, emails, and timeline in one export when disputes hit. |
