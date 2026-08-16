# Freeman Intelligence

**Revenue Systems Engineering** for Metro Detroit automotive, logistics, and industrial companies.

> Find the Money. Fix the System. Build the Engine.

Freeman Intelligence is the umbrella brand for Revenue Systems Engineering — connecting market intelligence, revenue intelligence, automation, AI agents, dashboards, and digital experience into measurable economic outcomes.

**Sister products in this monorepo:**

| Product | Focus |
|---------|-------|
| [Freeman Intel](../freeman-intel/) | Plant inbound readiness (logistics operations) |
| [AI Proposals Agent™](../ai-proposals-agent/) | RFP proposal generation (commercial logistics) |

---

## WRIS — Website Revenue Intelligence System

WRIS is the Freeman Intelligence methodology for turning market research, positioning, and website intelligence into revenue outcomes.

| Phase | Status | Deliverable |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Strategic intelligence, positioning, product architecture |
| Phase 2 | ✅ This repo | Revenue Opportunity Diagnostic + website blueprint |

See [`docs/wris-phase-1-intelligence.md`](docs/wris-phase-1-intelligence.md) for the full Phase 1 run.

---

## Phase 2 deliverables

### 1. Revenue Opportunity Diagnostic

Interactive lead-generation tool: 10-question assessment → Revenue Intelligence Score (0–100) → personalized brief.

```bash
# Deterministic scorer (binding facts from script, not model)
cd diagnostic && python3 scripts/run_golden_tests.py

# Interactive web experience
cd web && npm install && npm run dev
```

### 2. Website blueprint

Full homepage and site architecture in [`docs/website-blueprint.md`](docs/website-blueprint.md).

### 3. Product ladder

Four-tier offer stack in [`docs/product-ladder.md`](docs/product-ladder.md).

---

## Positioning

**Category:** Revenue Systems Engineering

**Primary value proposition:** Turn Your Operations Into a Revenue Engine.

**ICP (Tier 1):** Automotive suppliers with complex quoting, RFQs, program management, and fragmented data systems.

**Differentiator:** Most competitors sell one layer (AI agency, web agency, BI, RevOps). Freeman Intelligence connects the full stack from market intelligence through AI agents to revenue outcomes.

---

## Directory layout

```
freeman-intelligence/
├── docs/           # WRIS intelligence, messaging, website blueprint
├── diagnostic/     # Scoring engine + question config
└── web/            # Interactive diagnostic (Vite + React)
```
