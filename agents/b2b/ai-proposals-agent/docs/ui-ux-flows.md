# UI / UX Flows

## Surface 1: SaaS dashboard (customer workflow)

7-step flow for BD / sales users.

### Step 1: New proposal

```
[Upload RFP] → AI analyzes → Requirements extracted
```

- Drag-drop PDF/DOCX (G1)
- Show extraction confidence
- Link to operator console for trace detail

### Step 2: Confirm scope

User reviews:

- Requirements checklist ✓
- Services requested ✓
- Due date ✓

`[Edit if needed]` → `[Approve]` → triggers Phase 2

### Step 3: Select assets

AI suggests:

- 5 relevant case studies → user selects 3
- Capability matches → user confirms
- Compliance templates → auto-selected from validator

### Step 4: Pricing

AI presents 3 engine scenarios (read-only numbers):

```
○ Competitive   ● Balanced   ○ Premium
```

`[Adjust inputs]` (volume, service lines) → re-run engine  
`[Approve scenario]`

> No editable price fields. Changing price = change input + re-run.

### Step 5: Generate

Progress: phase indicator matching orchestrator

```
Intake ✓ → KB ✓ → Generating… → Compliance → QA
```

~2 min remaining (narrative generation)

### Step 6: Review & edit

Split screen:

- **Left:** Generated proposal (narrative editable)
- **Right:** RFP requirements checklist + compliance gaps

`[Edit mode]` or `[Approve for export]`

### Step 7: Download

Formats: ☐ Word ☐ PDF ☐ PowerPoint deck (G2)

`[Download]` → submission checklist PDF

---

## Surface 2: Operator console (internal)

Single-run view for proposal managers / prompt engineers.

**Location:** [`../ui/operator-console/index.html`](../ui/operator-console/index.html)

| Tab | Purpose |
|-----|---------|
| Run | Draft + read-only pricing |
| Compliance | GAP/COMPLIANT panel |
| QA | Min-score dimensions |
| Halt | Designed stop states |
| Brand | Mark + color semantics |

**Planned additions:**

- Run-log browser (multi-run)
- KB coverage view (pre-bid halt prediction)

---

## Wireframe: pricing step (Step 4)

```
┌─────────────────────────────────────────────────────────┐
│ ⚠ HUMAN REVIEW REQUIRED — Approve scenario before draft │
├─────────────────────────────────────────────────────────┤
│  Scenario      Total (traced)     Margin    Position    │
│  ○ Competitive $372,000.00        8%        Win on price│
│  ● Balanced    $396,000.00        12%       Best value  │
│  ○ Premium     $428,000.00        18%       Enhanced SLA│
│                                                         │
│  [Change volume/services]  [Re-run engine]  [Approve ●] │
└─────────────────────────────────────────────────────────┘
```

---

## Wireframe: review step (Step 6)

```
┌──────────────────────────┬──────────────────────────────┐
│ Proposal draft           │ RFP checklist                │
│                          │                              │
│ Executive summary…       │ ✓ OTIF commitment            │
│ …$396,000.00 (trace)…    │ ✓ Insurance $2M              │
│                          │ ✗ CTPAT — GAP                │
│ [Edit narrative]         │ ✓ Dedicated capacity         │
│                          │                              │
│                          │ Compliance: 4/10 (drags QA)  │
└──────────────────────────┴──────────────────────────────┘
```

---

## Design principles

1. **Trace as UI primitive** — dotted cyan underline on binding numerics
2. **Color = state** — see [`brand-system.md`](brand-system.md)
3. **Halts are tabs, not toasts**
4. **Non-dismissable review banner**
5. **Separate customer dashboard from operator console** — customers never see trace chains unless Pro tier audit export

---

## Mobile (phase 2)

Approval queue only:

- Approve pricing scenario
- Approve final draft
- View compliance gap count

Full editing stays desktop.
