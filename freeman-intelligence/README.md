# Freeman Intelligence

**Revenue Systems Engineering** for Metro Detroit automotive, logistics, and industrial companies.

> Find the Money. Fix the System. Build the Engine.

---

## WRIS Phases

| Phase | Status | Deliverable |
|-------|--------|-------------|
| Phase 1 | ✅ | Strategic intelligence, positioning, product architecture |
| Phase 2 | ✅ | Revenue Opportunity Diagnostic + website blueprint |
| Phase 3 | ✅ | Full website, 3 interactive tools, GitHub Pages deploy |

---

## Quick start

```bash
# Deterministic scorers
cd diagnostic && python3 scripts/run_golden_tests.py

# Full website + tools
cd web && npm install && npm run dev
# → http://localhost:5173
```

---

## Interactive tools

| Tool | Route | Purpose |
|------|-------|---------|
| Revenue Opportunity Diagnostic | `/diagnostic` | 9-question maturity assessment → score + brief |
| Revenue Leakage Calculator | `/leakage-calculator` | Estimate $ lost to inefficiency |
| AI Opportunity Mapper | `/ai-mapper` | Rank processes by AI automation ROI |

---

## Site pages

| Page | Route |
|------|-------|
| Homepage | `/` |
| How It Works | `/how-it-works` |
| Products | `/products` |
| Tools | `/tools` |

---

## Deployment

GitHub Pages workflow deploys from `freeman-intelligence/web/` on push.

Set `VITE_BRIEFING_WEBHOOK` env var to forward briefing form submissions to a CRM webhook.

---

## Documentation

- [`docs/wris-phase-1-intelligence.md`](docs/wris-phase-1-intelligence.md)
- [`docs/website-blueprint.md`](docs/website-blueprint.md)
- [`docs/product-ladder.md`](docs/product-ladder.md)
- [`docs/messaging-framework.md`](docs/messaging-framework.md)
