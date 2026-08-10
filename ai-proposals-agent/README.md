# AI Proposals Agent™

**Every number traces.**

Production-oriented AI agent system for **logistics proposal generation** — RFP analysis, compliance-first drafting, engine-bound pricing, and human-in-the-loop review gates.

Built for the same Metro Detroit logistics corridor as [Freeman Intel](../freeman-intel/) (sister product: plant inbound vs. commercial proposals).

## Principles

1. **No generative authority on money** — pricing comes from the engine; LLM assembles narrative around traced figures.
2. **Compliance gaps are loud** — missing ISO/CTPAT/OTIF evidence renders as gaps, not silent omissions.
3. **Halts are designed outputs** — named cause, fix path, never buried in a toast.
4. **Human review required** — enforced in the run-log schema, not just prompt prose.

## Repository layout

| Path | Description |
|------|-------------|
| [`docs/complete-system-design.md`](docs/complete-system-design.md) | **Full spec** — all 15 sections, v2.1 merged |
| [`docs/system-design.md`](docs/system-design.md) | v2 architecture guarantees |
| [`docs/prompt-architecture.md`](docs/prompt-architecture.md) | Master + sub-prompt index |
| [`docs/knowledge-base.md`](docs/knowledge-base.md) | SQL schema + population guide |
| [`docs/ui-ux-flows.md`](docs/ui-ux-flows.md) | SaaS 7-step + operator console |
| [`docs/gtm-and-monetization.md`](docs/gtm-and-monetization.md) | Pricing tiers, positioning, retainers |
| [`docs/implementation-roadmap.md`](docs/implementation-roadmap.md) | 90-day launch plan |
| [`docs/brand-system.md`](docs/brand-system.md) | Mark, color semantics |
| [`docs/runbook.md`](docs/runbook.md) | Operator procedures |
| [`schemas/`](schemas/) | run-log, pricing, compliance, rfp-intake |
| [`prompts/`](prompts/) | Master, orchestrator, 8 sub-prompts |
| [`ui/operator-console/`](ui/operator-console/) | Operator console (single-run view) |

## Backend (Python)

Production-ready v2.1 backend in [`backend/`](backend/):

```bash
cd backend
pip install -e ".[dev]"
python3 -m pytest tests/ -v          # 14 tests
python3 -m ai_proposals_agent.cli --demo --automotive
export ANTHROPIC_API_KEY=...         # live LLM
python3 -m ai_proposals_agent.cli --rfp path/to/rfp.txt
```

**Key modules:** `PricingEngine` (Decimal, no LLM), `ComplianceChecker`, `RunLogBuilder`, `ProposalAgent`, `NON_OVERRIDABLE` halts (G07).

## Operator console

Open locally:

```bash
cd ui/operator-console && python3 -m http.server 8080
# → http://localhost:8080
```

The console is an **operator tool**, not a SaaS dashboard. Its job is to make traceability and refusals legible.

## Packaging

```bash
./package.sh
# → dist/ai-proposals-agent-<timestamp>.tar.gz + .sha256
```

Blocks on missing files, skill frontmatter validation, self-tests, and JSON well-formedness.

## Pricing tiers (GTM placeholder)

| Tier | Price | Includes |
|------|-------|----------|
| Starter | $497/mo | Core generation, 5 proposals/mo, QA checklist |
| Pro | $997/mo | + pricing scenarios, compliance module, case study matching |
| Enterprise | $2,497/mo | + KB sync, run-log retention, custom validators |

Service option: $2K–$5K per proposal with retainer discounts.

## Status

- [x] System design & prompt architecture
- [x] Core JSON schemas (run-log, pricing, compliance)
- [x] Operator console + brand system (demo data)
- [ ] G1: Document ingestion (RFP PDF/DOCX)
- [ ] G2: DOCX export
- [ ] Run-log browser (multi-run)
- [ ] KB coverage view

## License

Proprietary — Freeman Intel / AI Proposals Agent™. All rights reserved.
