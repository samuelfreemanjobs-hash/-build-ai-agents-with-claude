# AI Proposals Agent™

Single-agent + skills system for drafting logistics RFP responses from an
operator's verified source material.

**Status:** Architecture and deterministic core complete. Not production
ready. See Known Gaps.

**Tagline:** Every number traces.

Built for the Metro Detroit logistics corridor — sister product to
[Freeman Intel](../freeman-intel/) (plant inbound vs. commercial proposals).

---

## Quick verify

```bash
python3 scripts/run_golden_tests.py
```

All four deterministic component suites must return PASS before any
deliverable ships.

```bash
python3 scripts/token_economics.py
```

Reproduces the ADR-001 §2 cost gate. Rate card last verified 2026-08-10.

---

## Architecture in one line

Single agent, sequential six-stage pipeline (S0–S6), reactive skills, one evaluator
gate on high-value bids. Multi-agent was evaluated and rejected — see
[`docs/ADR-001-architecture-selection.md`](docs/ADR-001-architecture-selection.md).

## The core safety property

The model has no generative authority over binding facts.

| Binding fact | Source |
|---|---|
| Prices, margins, totals | `scripts/pricing_engine.py` |
| Compliance status | `scripts/compliance_validator.py` |
| Case study selection | `scripts/case_study_scorer.py` |
| Metrics, cert numbers, dates | KB source records (transcribed) |
| Narrative, structure, argument | Model (Claude) |

Every value resolves through `*trace` to a source record or script output.

---

## Repository layout

```
ai-proposals-agent/
├── agent/           # SOUL, DUTIES, system-prompt, core-config.xml
├── skills/          # Reactive skills (5 stages)
├── scripts/         # Deterministic core + golden test runner
├── schemas/         # JSON Schema contracts
├── tests/golden/    # 23-case manifest (fixtures pending)
├── kb/              # Operator knowledge base (unpopulated)
├── backend/         # FastAPI + Python package (deploy layer)
├── frontend/        # React dashboard
├── deploy/          # Docker Compose, SQL init
└── docs/            # ADR, observability, runbook, deployment
```

| Path | Description |
|---|---|
| [`agent/system-prompt.md`](agent/system-prompt.md) | Orchestration source of truth |
| [`agent/DUTIES.md`](agent/DUTIES.md) | Operating contract, tiering, pipeline |
| [`docs/observability-contract.md`](docs/observability-contract.md) | Run log, `*trace`, header spec |
| [`docs/deployment-guide.md`](docs/deployment-guide.md) | Local, Docker, AWS deploy |
| [`backend/`](backend/) | FastAPI API + integration tests (21 pytest) |

---

## Run locally

### Deterministic core

```bash
python3 scripts/pricing_engine.py --selftest
python3 scripts/compliance_validator.py --selftest
python3 scripts/case_study_scorer.py --selftest
python3 scripts/run_golden_tests.py
```

### API + dashboard

```bash
cd backend && pip install -e ".[dev]"
python3 -m ai_proposals_agent.api.main   # → :8000/docs

cd frontend && npm install && npm run dev   # → :5173

cd deploy && cp .env.example .env && docker compose up -d --build
```

---

## KNOWN GAPS

Documented deliberately. Address reactively when they block a real customer.

| ID | Gap |
|---|---|
| **G1** | Document ingestion — PDF/scanned RFPs (Textract / unstructured.io) |
| **G2** | DOCX/PDF export — python-docx branded template |
| **G3** | Knowledge base unpopulated — requires a customer |
| **G4** | No authentication or tenant isolation |
| **G5** | No job queue or persistence (in-memory jobs in API) |
| **G6** | Model output structuring is prompt-based (should use tool-use) |
| **G7** | Golden fixtures manifested, not populated |
| **G8** | NDA/data handling specified in config, not enforced |

**Fixed in v2.1:** LLM pricing arithmetic → `PricingEngine` / `scripts/pricing_engine.py`

See [`docs/known-gaps.md`](docs/known-gaps.md) for build order.

---

## What changed from prior build

| Prior build | This build |
|---|---|
| LLM computed prices | `scripts/pricing_engine.py`, Decimal, halts |
| Compliance inferred by model | `compliance_validator.py`, fail-closed, GAP default |
| Case studies selected by model | `case_study_scorer.py`, versioned weights |
| No architecture rationale | ADR-001 + token economics gate |
| Config held behavior | `core-config.xml` = environmental gates only |
| No observability | JSONL run log, output header, `*trace` |
| No tests | 33 component assertions + 23 golden cases manifested |
| "Submission-ready" output | Human review line on every tier |

---

## What this repo is not

Not a deployed product. Not validated against a real RFP. No customer has used it.

The fastest path to validation: one paying DFY customer ($2K/RFP), manual Claude +
Word, instrument where time actually goes. That requires none of this infrastructure.

---

## License

Proprietary — Freeman Intel / AI Proposals Agent™. All rights reserved.
